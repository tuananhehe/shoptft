import fs from "fs";
import path from "path";
import os from "os";
import { supabase } from "@/utils/supabase/client";

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 15 * 1000;

function getTempFilePath(storageKey: string): string {
  const safeName = storageKey.replace(/[^a-zA-Z0-9._-]/g, "_");
  const tmpDir = path.join(os.tmpdir(), "shoptft-storage");
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  } catch {}
  return path.join(tmpDir, safeName);
}

/**
 * Đọc cấu hình JSON từ Supabase Storage, với fallback qua local file & /tmp
 */
export async function getCloudJson<T>(
  storageKey: string,
  localFilePath?: string,
  defaultData?: T,
  forceRefresh: boolean = false
): Promise<T | null> {
  const now = Date.now();
  const cached = memoryStore.get(storageKey);

  if (!forceRefresh && cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data as T;
  }

  // 1. Thử tải từ Supabase Storage (Bucket: images)
  try {
    const downloadPromise = supabase.storage.from("images").download(storageKey);
    const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Download timeout") }), 4000)
    );

    const { data: fileData, error: downloadErr } = await Promise.race([
      downloadPromise,
      timeoutPromise,
    ]);

    if (!downloadErr && fileData) {
      const text = await fileData.text();
      const parsed = JSON.parse(text) as T;
      memoryStore.set(storageKey, { data: parsed, cachedAt: now });

      // Lưu đệm vào /tmp
      try {
        const tmpPath = getTempFilePath(storageKey);
        fs.writeFileSync(tmpPath, text, "utf-8");
      } catch {}

      return parsed;
    }
  } catch (cloudErr) {
    console.warn(`[CloudJsonStore] Lỗi tải từ Supabase Storage (${storageKey}):`, cloudErr);
  }

  // 2. Thử đọc từ /tmp
  try {
    const tmpPath = getTempFilePath(storageKey);
    if (fs.existsSync(tmpPath)) {
      const text = fs.readFileSync(tmpPath, "utf-8");
      const parsed = JSON.parse(text) as T;
      memoryStore.set(storageKey, { data: parsed, cachedAt: now });
      return parsed;
    }
  } catch {}

  // 3. Fallback: Đọc từ local file (src/data/...)
  if (localFilePath) {
    try {
      if (fs.existsSync(localFilePath)) {
        const text = fs.readFileSync(localFilePath, "utf-8");
        const parsed = JSON.parse(text) as T;
        memoryStore.set(storageKey, { data: parsed, cachedAt: now });
        return parsed;
      }
    } catch (fsErr) {
      console.warn(`[CloudJsonStore] Lỗi đọc local file (${localFilePath}):`, fsErr);
    }
  }

  // 4. Nếu có cache cũ thì dùng tạm
  if (cached) {
    return cached.data as T;
  }

  return defaultData !== undefined ? defaultData : null;
}

/**
 * Lưu cấu hình JSON lên Supabase Storage và đồng bộ xuống local / tmp
 */
export async function saveCloudJson<T>(
  storageKey: string,
  data: T,
  localFilePath?: string
): Promise<boolean> {
  const jsonString = JSON.stringify(data, null, 2);

  // 1. Cập nhật ngay trong memory cache
  memoryStore.set(storageKey, { data, cachedAt: Date.now() });

  // 2. Lưu vào /tmp
  let tmpSaved = false;
  try {
    const tmpPath = getTempFilePath(storageKey);
    fs.writeFileSync(tmpPath, jsonString, "utf-8");
    tmpSaved = true;
  } catch (tmpErr) {
    console.warn(`[CloudJsonStore] Không thể ghi vào tmp:`, tmpErr);
  }

  // 3. Cố gắng lưu vào localFilePath nếu khả dụng (môi trường local dev)
  let localSaved = false;
  if (localFilePath) {
    try {
      const dir = path.dirname(localFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(localFilePath, jsonString, "utf-8");
      localSaved = true;
    } catch (fsErr: any) {
      // Trên Vercel, filesystem là read-only (EROFS) nên bỏ qua cảnh báo này
      if (fsErr?.code !== "EROFS") {
        console.warn(`[CloudJsonStore] Ghi local file không thành công (${localFilePath}):`, fsErr?.message);
      }
    }
  }

  // 4. Đồng bộ lên Supabase Storage (Bucket: images) bằng Blob (tránh Node duplex stream bug)
  let cloudSaved = false;
  try {
    const blob = new Blob([jsonString], { type: "application/json" });
    const uploadPromise = supabase.storage
      .from("images")
      .upload(storageKey, blob, {
        contentType: "application/json",
        upsert: true,
      });

    const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Upload timeout") }), 5000)
    );

    const { data: uploadData, error: uploadErr } = await Promise.race([
      uploadPromise,
      timeoutPromise,
    ]);

    if (!uploadErr && uploadData) {
      cloudSaved = true;
    } else if (uploadErr) {
      console.warn(`[CloudJsonStore] Cảnh báo upload Supabase Storage (${storageKey}):`, uploadErr.message);
    }
  } catch (uploadException) {
    console.warn(`[CloudJsonStore] Ngoại lệ khi upload Supabase Storage:`, uploadException);
  }

  // Thành công nếu đã lưu vào Cloud HOẶC Local HOẶC Tmp
  return cloudSaved || localSaved || tmpSaved;
}

