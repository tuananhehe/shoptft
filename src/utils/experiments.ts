"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type ExperimentVariant = "A" | "B";

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  variants: {
    A: {
      label: string;
      ctaText: string;
      description: string;
    };
    B: {
      label: string;
      ctaText: string;
      description: string;
    };
  };
}

/**
 * PHASE 11 PRIMARY EXPERIMENT:
 * Single variable tested: Primary CTA Wording
 * - Variant A (Baseline / Control): "Thuê ngay"
 * - Variant B (Challenger): "Thuê qua Zalo"
 *
 * Kept strictly identical:
 * - Button position
 * - Visual style & color
 * - Flow & interaction (opens modal / redirects to Zalo)
 */
export const ACTIVE_EXPERIMENT: ExperimentConfig = {
  id: "exp_primary_cta_wording",
  name: "Primary CTA Wording Test",
  description: "Test conversion impact of 'Thuê ngay' vs 'Thuê qua Zalo' on product card and detail",
  variants: {
    A: {
      label: "Baseline (Control)",
      ctaText: "Thuê ngay",
      description: "Direct action phrasing: Thuê ngay",
    },
    B: {
      label: "Challenger (Variant B)",
      ctaText: "Thuê qua Zalo",
      description: "Channel-explicit phrasing: Thuê qua Zalo",
    },
  },
};

const STORAGE_KEY_UID = "tft_exp_uid";

/**
 * FNV-1a 32-bit hash algorithm for fast, uniform, deterministic hashing
 */
function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

/**
 * Lấy hoặc khởi tạo ID ẩn danh duy nhất cho thiết bị (Persistent Anonymous ID)
 * Không bao giờ chứa PII, chỉ là chuỗi hex ngẫu nhiên lưu tại localStorage.
 */
export function getOrCreateAnonymousVisitorId(): string {
  if (typeof window === "undefined") return "server_ssr";
  try {
    let uid = localStorage.getItem(STORAGE_KEY_UID);
    if (!uid || uid.length < 8) {
      uid = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY_UID, uid);
    }
    return uid;
  } catch {
    return "ephemeral_client";
  }
}

/**
 * Xác định Variant cho user một cách tất định (Deterministic 50/50 split)
 * - Cùng 1 visitor ID luôn nhận cùng 1 variant trên cùng 1 experiment ID.
 * - Hỗ trợ QA/testing override qua URL query param `?exp_cta=A` hoặc `?exp_cta=B`.
 */
export function getExperimentVariant(experimentId: string = ACTIVE_EXPERIMENT.id): ExperimentVariant {
  if (typeof window === "undefined") {
    return "A"; // Server-render baseline default
  }

  try {
    // 1. Kiểm tra QA override trên URL
    const searchParams = new URLSearchParams(window.location.search);
    const override = searchParams.get("exp_cta")?.toUpperCase();
    if (override === "A" || override === "B") {
      return override;
    }

    // 2. Deterministic hash 50/50
    const visitorId = getOrCreateAnonymousVisitorId();
    const seed = `${visitorId}:${experimentId}`;
    const hashVal = fnv1aHash(seed);
    const bucket = hashVal % 100;

    return bucket < 50 ? "A" : "B";
  } catch {
    return "A";
  }
}

/**
 * Trả về thông tin ngữ cảnh Experiment hiện tại để đính kèm tự động vào Analytics
 */
export function getActiveExperimentContext(): {
  experiment_name: string;
  variant: ExperimentVariant;
  cta_text: string;
} {
  const variant = getExperimentVariant(ACTIVE_EXPERIMENT.id);
  return {
    experiment_name: ACTIVE_EXPERIMENT.id,
    variant,
    cta_text: ACTIVE_EXPERIMENT.variants[variant].ctaText,
  };
}

/**
 * React Hook sử dụng trong Client Components
 * Tránh hydration mismatch bằng cách khởi tạo đồng bộ hoặc cập nhật sau mount.
 */
export function usePrimaryCtaExperiment() {
  const [variant, setVariant] = useState<ExperimentVariant>("A");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setVariant(getExperimentVariant(ACTIVE_EXPERIMENT.id));
  }, []);

  const config = ACTIVE_EXPERIMENT.variants[variant];

  return {
    isReady: isClient,
    experimentId: ACTIVE_EXPERIMENT.id,
    experimentName: ACTIVE_EXPERIMENT.name,
    variant,
    ctaText: config.ctaText,
    isVariantB: variant === "B",
  };
}
