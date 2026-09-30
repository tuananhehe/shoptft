/**
 * API Fetch Helper with Timeout & Network Safety (Phase 12)
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Fetch wrapper tích hợp tự động hủy request khi vượt quá timeout
 * Mặc định timeout 8 giây cho external / internal API
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  options?: FetchWithTimeoutOptions
): Promise<Response> {
  const { timeoutMs = 8000, ...fetchOptions } = options || {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(input, {
      ...fetchOptions,
      signal: fetchOptions.signal || controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      throw new Error("Không tải được dữ liệu do quá thời gian chờ (timeout). Vui lòng thử lại.");
    }
    throw err;
  }
}
