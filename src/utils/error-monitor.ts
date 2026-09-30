/**
 * Lightweight Error Monitoring & Sanitization Utility (Phase 12)
 * Ghi nhận lỗi an toàn, không rò rỉ thông tin nhạy cảm của khách hàng hay admin
 */

export interface ErrorReportContext {
  route?: string;
  component?: string;
  action?: string;
  extra?: Record<string, any>;
}

const SENSITIVE_KEYS = [
  "password",
  "pass",
  "token",
  "secret",
  "key",
  "admin",
  "authorization",
  "cookie",
  "credential",
  "phone",
  "zalo",
  "otp",
];

/**
 * Lọc bỏ thông tin nhạy cảm khỏi object trước khi ghi nhận lỗi
 */
function sanitizeContext(ctx?: ErrorReportContext): ErrorReportContext | undefined {
  if (!ctx) return undefined;
  const safe: ErrorReportContext = {
    route: ctx.route,
    component: ctx.component,
    action: ctx.action,
  };

  if (ctx.extra && typeof ctx.extra === "object") {
    const cleanExtra: Record<string, any> = {};
    for (const [k, v] of Object.entries(ctx.extra)) {
      const lowerKey = k.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((s) => lowerKey.includes(s));
      if (!isSensitive) {
        cleanExtra[k] = typeof v === "object" ? "[Object]" : v;
      } else {
        cleanExtra[k] = "[REDACTED]";
      }
    }
    safe.extra = cleanExtra;
  }

  return safe;
}

/**
 * Ghi nhận lỗi an toàn vào monitoring / console
 */
export function reportError(error: unknown, context?: ErrorReportContext): void {
  const safeContext = sanitizeContext(context);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorDigest = error && typeof error === "object" && "digest" in error ? (error as any).digest : undefined;

  // Trong production chỉ log thông điệp lỗi và context đã được sanitize, không log dữ liệu nhạy cảm
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error(`[ErrorMonitor] ⚠️ ${safeContext?.component || "App"}: ${errorMessage}`, {
      context: safeContext,
      digest: errorDigest,
    });
  } else {
    // Production telemetry / monitoring logging
    // eslint-disable-next-line no-console
    console.error(`[Error] ${safeContext?.component || "Route"}: ${errorMessage}`, safeContext);
  }
}
