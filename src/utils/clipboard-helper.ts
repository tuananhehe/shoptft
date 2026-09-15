/**
 * Utility sao chép văn bản vào Clipboard với fallback đa nền tảng
 * Đảm bảo hoạt động 100% trên Safari iOS, Android, Chrome, Webview Zalo / Facebook
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Thử qua Modern Navigator Clipboard API
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("navigator.clipboard failed, fallback to execCommand:", err);
  }

  // 2. Fallback qua textarea + document.execCommand('copy')
  try {
    if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error("execCommand fallback failed:", err);
  }

  return false;
}

/**
 * Sinh link Zalo kèm query params tin nhắn
 */
export function buildZaloOrderUrl(baseUrl: string, message: string): string {
  const cleanBase = baseUrl.trim();
  const sep = cleanBase.includes("?") ? "&" : "?";
  return `${cleanBase}${sep}text=${encodeURIComponent(message)}&msg=${encodeURIComponent(message)}`;
}
