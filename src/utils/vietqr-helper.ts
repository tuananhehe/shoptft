/**
 * VietQR Helper & Bank Configuration
 * Hỗ trợ tạo mã QR thanh toán ngân hàng tự động (VietQR Quick Link API)
 * Mặc định: Ngân hàng ACB (Á Châu)
 */

export interface BankConfig {
  bankId: string; // e.g. "ACB", "MB", "VCB", "TCB", "ICB"
  bankName: string; // Tên hiển thị đầy đủ
  accountNumber: string; // Số tài khoản ngân hàng
  accountHolder: string; // Tên chủ tài khoản (in hoa không dấu)
  qrTemplate?: "compact2" | "compact" | "qr_only" | "print";
  transferSyntax?: string; // Mẫu nội dung chuyển khoản, e.g. "THUE ACC {CODE}"
}

export interface BankItem {
  id: string;
  name: string;
  shortName: string;
  bin?: string;
}

export const POPULAR_VIETNAM_BANKS: BankItem[] = [
  { id: "ACB", name: "Ngân hàng TMCP Á Châu (ACB)", shortName: "ACB" },
  { id: "MB", name: "Ngân hàng TMCP Quân Đội (MBBank)", shortName: "MBBank" },
  { id: "VCB", name: "Ngân hàng TMCP Ngoại Thương (Vietcombank)", shortName: "Vietcombank" },
  { id: "ICB", name: "Ngân hàng TMCP Công Thương (VietinBank)", shortName: "VietinBank" },
  { id: "TCB", name: "Ngân hàng TMCP Kỹ Thương (Techcombank)", shortName: "Techcombank" },
  { id: "BIDV", name: "Ngân hàng TMCP Đầu tư và Phát triển (BIDV)", shortName: "BIDV" },
  { id: "VPB", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)", shortName: "VPBank" },
  { id: "TPB", name: "Ngân hàng TMCP Tiên Phong (TPBank)", shortName: "TPBank" },
  { id: "STB", name: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)", shortName: "Sacombank" },
  { id: "HDB", name: "Ngân hàng TMCP Phát triển TP.HCM (HDBank)", shortName: "HDBank" },
  { id: "VIB", name: "Ngân hàng TMCP Quốc tế Việt Nam (VIB)", shortName: "VIB" },
  { id: "SHB", name: "Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)", shortName: "SHB" },
  { id: "MSB", name: "Ngân hàng TMCP Hàng Hải (MSB)", shortName: "MSB" },
  { id: "OCB", name: "Ngân hàng TMCP Phương Đông (OCB)", shortName: "OCB" },
  { id: "LPB", name: "Ngân hàng TMCP Lộc Phát (LPBank)", shortName: "LPBank" },
  { id: "SEAB", name: "Ngân hàng TMCP Đông Nam Á (SeABank)", shortName: "SeABank" },
  { id: "NAB", name: "Ngân hàng TMCP Nam Á (Nam A Bank)", shortName: "Nam A Bank" },
  { id: "ABB", name: "Ngân hàng TMCP An Bình (ABBANK)", shortName: "ABBANK" },
];

export const DEFAULT_BANK_CONFIG: BankConfig = {
  bankId: "ACB",
  bankName: "Ngân hàng TMCP Á Châu (ACB)",
  accountNumber: "23456789",
  accountHolder: "TUAN THAI BINH",
  qrTemplate: "compact2",
  transferSyntax: "THUE ACC {CODE}",
};

/**
 * Tạo link ảnh QR thanh toán VietQR
 */
export function buildVietQRUrl(params: {
  bankId: string;
  accountNumber: string;
  accountHolder?: string;
  amount: number;
  description: string;
  template?: string;
}): string {
  const bankId = (params.bankId || "ACB").trim().toUpperCase();
  const accNo = (params.accountNumber || "").replace(/[^0-9a-zA-Z]/g, "").trim();
  const template = params.template || "compact2";
  const amount = Math.max(0, Math.round(params.amount || 0));

  // Loại bỏ dấu tiếng Việt để nội dung chuyển khoản hiển thị đẹp trên mọi app ngân hàng
  const cleanDescription = (params.description || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .trim();

  const cleanHolder = (params.accountHolder || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toUpperCase();

  let url = `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(accNo)}-${encodeURIComponent(template)}.png`;

  const queryParts: string[] = [];
  if (amount > 0) {
    queryParts.push(`amount=${amount}`);
  }
  if (cleanDescription) {
    queryParts.push(`addInfo=${encodeURIComponent(cleanDescription)}`);
  }
  if (cleanHolder) {
    queryParts.push(`accountName=${encodeURIComponent(cleanHolder)}`);
  }

  if (queryParts.length > 0) {
    url += `?${queryParts.join("&")}`;
  }

  return url;
}
