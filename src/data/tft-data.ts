export interface TFTRentalAccount {
  id: string;
  code: string; // "MS: 8899"
  title: string;
  mainChibi: string;
  allChibi: string[];
  mainArena: string;
  allArenas: string[];
  rank: "THÁCH ĐẤU" | "ĐẠI CAO THỦ" | "CAO THỦ" | "KIM CƯƠNG" | "LỤC BẢO" | "VÀNG/BẠCH KIM" | "BẠC" | "ĐỒNG" | "SẮT" | "KHÔNG RANK" | string;
  rankColor: string;
  rankBadgeBg: string;
  hourlyPrice: number;
  dailyPrice: number;
  nightPrice: number;
  periodPrice?: number;
  periodUnit?: string;
  monthlyPrice?: number;
  weeklyPrice?: number;
  accountValue?: number; // Giá trị gốc của tài khoản
  priceDisplayType?: "HOURLY" | "DAILY" | "LONG_TERM" | "CUSTOM" | "AUTO"; // Kiểu hiển thị giá cho khách
  customPrice?: number;
  customPriceUnit?: string;
  status: "AVAILABLE" | "RENTED";
  rentedUntil?: string | null;
  totalLittleLegends: number;
  totalArenas: number;
  totalBooms: number;
  thumbnail: string;
  description: string;
  tag?: string;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  avatar: string;
  accountBought: string;
  category: "THUE_ACC" | "CAY_THUE" | "COACHING";
  categoryLabel: string;
  rating: number;
  date: string;
  comment: string;
  verifiedTag: string;
  proofImage: string;
  transactionCode: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  badge: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export interface FAQItem {
  q: string;
  a: string;
  category: "THUE_ACC" | "BAO_MAT" | "CAY_RANK" | "THANH_TOAN";
  badge?: string;
}

export const PROFILE_INFO = {
  gamerTag: "Tuấn Thái Bình TFT",
  realName: "Tuấn Thái Bình",
  brandName: "ShopTFT Mobile",
  role: "Cựu Thách Đấu TFT & Hệ Thống Thuê Acc ĐTCL Uy Tín",
  bio: "Mình là Tuấn Thái Bình, một người con sinh ra từ quê lúa Thái Bình. Xuất phát điểm từ đam mê cờ thủ leo Top Thách Đấu, nay mình xây dựng hệ thống ShopTFT Mobile đồng hành uy tín cùng hàng nghìn anh em Đấu Trường Chân Lý trên toàn quốc.",
  experienceYears: 5,
  accountsSold: "1,850+",
  accountsRented: "4,500+ Lượt",
  satisfactionRate: "99.9%",
  highestRank: "Cựu Thách Đấu Việt Nam // 1.134 ĐNG",
  insuranceFund: "30.000.000đ",
  checkscamUrl: "https://checkscam.vn/?qh_ss=0352867283",
  avatarUrl: "/avatar.jpg",
  coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
  phoneZalo: "0352.867.283",
  facebookUrl: "https://facebook.com",
  zaloUrl: "https://zalo.me/0352867283",
  tiktokUrl: "https://tiktok.com/@shoptftmobile",
  zaloGroupUrl: "https://zalo.me/g/shoptftmobile",
  discordUrl: "https://discord.gg/shoptftmobile",
  facebookGroupUrl: "https://facebook.com/groups/shoptftmobile",
  discordTag: "TuanThaiBinhTFT#8888",
  bankInfo: {
    bankName: "MB Bank (Quân Đội)",
    accountNumber: "9999.8888.6666",
    accountHolder: "TUAN THAI BINH",
  },
};

export const TFT_RENTAL_ACCOUNTS: TFTRentalAccount[] = [];

export const TFT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-01",
    customerName: "Nguyễn Hoàng Long",
    avatar: "",
    accountBought: "MS: 8899 - Acc Thách Đấu VIP Ahri Tinh Quái",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "Hôm qua lúc 21:45",
    comment: "Acc cực mượt, đúng đủ Tí Nị Ahri và Sân Đấu Đổi Nhạc như mô tả. Nhắn tin Zalo 30s là shop gửi pass luôn. Rất uy tín!",
    verifiedTag: "Giao Dịch Xác Thực #MB9821",
    proofImage: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-8899-2024",
  },
  {
    id: "rev-02",
    customerName: "Trần Minh Đức (Đức Streamer)",
    avatar: "",
    accountBought: "Gói Kéo Rank Thách Đấu (Từ Kim Cương 1)",
    category: "CAY_THUE",
    categoryLabel: "Cày Rank ĐTCL",
    rating: 5,
    date: "3 ngày trước",
    comment: "Tuấn đánh tay 100%, tỷ lệ vào top cực cao. Giao acc 2 ngày là lên Thách Đấu đúng tiến độ. Có bảo hiểm 30M nên cực kỳ yên tâm giao acc chính.",
    verifiedTag: "Giao Dịch Xác Thực #MB4432",
    proofImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-4432-2024",
  },
  {
    id: "rev-03",
    customerName: "Lê Quốc Bảo",
    avatar: "",
    accountBought: "Gói Coaching 1-1 Bắt Meta Mùa 13 (2 Buổi)",
    category: "COACHING",
    categoryLabel: "Coaching 1-1",
    rating: 5,
    date: "1 tuần trước",
    comment: "Học xong 2 buổi vỡ ra bao nhiêu kiến thức xoay bài và giữ máu. Từ Lục Bảo 4 chuỗi thua leo thẳng lên Cao Thủ 250 ĐNG. Đáng từng đồng tiền bát gạo!",
    verifiedTag: "Giao Dịch Xác Thực #MB7719",
    proofImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-7719-2024",
  },
  {
    id: "rev-04",
    customerName: "Hoàng Yến Vy (Vy Cờ Bạc)",
    avatar: "",
    accountBought: "MS: 7721 - Acc Gwen Búp Bê Trà Sữa",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "Hôm nay lúc 14:20",
    comment: "Thuê acc đi hẹn hò cafe với crush cùng phòng net, chưởng lực kéo kéo Gwen cuti xỉu làm crush khen suốt buổi 🥺 Shop bàn giao siêu nhanh, 10 điểm không có nhưng!",
    verifiedTag: "Giao Dịch Xác Thực #MB1102",
    proofImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-1102-2024",
  },
  {
    id: "rev-05",
    customerName: "Đỗ Hoàng Nam (Nam Cờ Thủ)",
    avatar: "",
    accountBought: "MS: 4490 - Acc Đại Cao Thủ 5 Sân Đổi Nhạc",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "Hôm qua lúc 02:15",
    comment: "Nửa đêm 2h sáng tự nhiên thèm nghe nhạc EDM của Sân Thái Âm, thuê gói đêm 22h-8h đánh thông tới sáng nổ hũ 10 Thần Thoại phê lòi mắt kkk. Pass đổi cực nhanh!",
    verifiedTag: "Giao Dịch Xác Thực #MB3301",
    proofImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-3301-2024",
  },
  {
    id: "rev-06",
    customerName: "Vũ Minh Quang",
    avatar: "",
    accountBought: "Gói Kéo Rank Cao Thủ (Cứu ELO Âm)",
    category: "CAY_THUE",
    categoryLabel: "Cày Rank ĐTCL",
    rating: 5,
    date: "4 ngày trước",
    comment: "Acc mình dính dớp chuỗi thua 9 trận elo âm nặng, nhờ Tuấn kéo hộ mà 1 ngày rưỡi kéo thẳng lên Cao Thủ lịch sử đấu xanh lét toàn top 1-2. Bái phục trình cựu thách đấu!",
    verifiedTag: "Giao Dịch Xác Thực #MB8820",
    proofImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-8820-2024",
  },
  {
    id: "rev-07",
    customerName: "Bùi Tiến Đạt",
    avatar: "",
    accountBought: "MS: 6632 - Acc Aatrox Cuồng Kiếm Sát Thần",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "5 ngày trước",
    comment: "Mượn acc Aatrox đi giải đấu giao lưu cùng anh em, hiệu ứng chém kết liễu cực mượt. Thao tác lấy acc qua Zalo nhanh gọn lẹ chỉ 30s, chắc chắn sẽ ủng hộ tiếp!",
    verifiedTag: "Giao Dịch Xác Thực #MB9934",
    proofImage: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-9934-2024",
  },
  {
    id: "rev-08",
    customerName: "Đặng Gia Huy",
    avatar: "",
    accountBought: "Gói Coaching 1-1 Bắt Meta (1 Buổi)",
    category: "COACHING",
    categoryLabel: "Coaching 1-1",
    rating: 5,
    date: "6 ngày trước",
    comment: "Trước toàn roll mù quáng ở 3-2 xong cút top 8 sớm. Được thầy Tuấn chỉ cách giữ 50 vàng eco với đọc bài lobby giờ đánh tự tin hẳn, vào top đều đặn. Cực kỳ tận tâm!",
    verifiedTag: "Giao Dịch Xác Thực #MB6618",
    proofImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-6618-2024",
  },
  {
    id: "rev-09",
    customerName: "Nguyễn Trọng Tấn",
    avatar: "",
    accountBought: "MS: 9988 - Trùm Acc Full 4 Tí Nị Thần Thoại",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "1 tuần trước",
    comment: "Thuê gói 7 ngày đi công tác rảnh rỗi leo rank trên iPad. Acc full đồ chơi đổi tướng liên tục không biết chán. Giá tính ra quá hời so với tự nạp mở gacha!",
    verifiedTag: "Giao Dịch Xác Thực #MB5541",
    proofImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-5541-2024",
  },
  {
    id: "rev-10",
    customerName: "Ngô Văn Thắng",
    avatar: "",
    accountBought: "Gói Duo Kèm Trực Tiếp Cùng Tuấn (3 Giờ)",
    category: "COACHING",
    categoryLabel: "Coaching 1-1",
    rating: 5,
    date: "1 tuần trước",
    comment: "Vừa duo vừa được Tuấn call bài nhường tướng, cảm giác leo rank nhàn nhã chưa từng thấy. Lên 2 bậc rank trong 1 buổi tối, cảm ơn idol Tuấn Thái Bình nhiều nhé!",
    verifiedTag: "Giao Dịch Xác Thực #MB2289",
    proofImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-2289-2024",
  },
  {
    id: "rev-11",
    customerName: "Phạm Hải Đăng",
    avatar: "",
    accountBought: "MS: 5512 - Acc Kim Cương Kai'Sa Rồng Thần",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "2 tuần trước",
    comment: "Giá thuê sinh viên rẻ bèo mà acc chất lượng, không bị giật lag hay ai tranh pass. Gặp sự cố nhỏ nhắn tin Zalo nửa đêm Tuấn vẫn rep hỗ trợ đổi acc ngay lập tức.",
    verifiedTag: "Giao Dịch Xác Thực #MB3301",
    proofImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-3301-2024",
  },
  {
    id: "rev-12",
    customerName: "Lê Thị Thu Thảo",
    avatar: "",
    accountBought: "MS: 8844 - Acc Teemo Tiểu Quỷ Cười Khẩy",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "2 tuần trước",
    comment: "Cầm Teemo đi solo leo rank cùng anh em trong công ty giải trí cực vui. Acc sạch thông tin, chơi mượt mà. Đánh giá 5 sao cho độ uy tín của shop!",
    verifiedTag: "Giao Dịch Xác Thực #MB7766",
    proofImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    transactionCode: "GD-7766-2024",
  },
];

export const TFT_SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "srv-01",
    title: "Cày Rank ĐTCL Siêu Tốc (Cày Tay 100%)",
    badge: "CAM KẾT TOP 1-2-3",
    price: "Từ 50.000đ / Bậc",
    features: [
      "Cày tay 100% bởi Tuấn Thái Bình (Cựu Thách Đấu 1.134 ĐNG)",
      "Bảo mật tài khoản tuyệt đối, đổi IP sạch tránh khóa acc",
      "Cập nhật tiến độ liên tục qua Zalo sau mỗi trận đấu",
      "Đền bù 200% nếu có bất kỳ rủi ro nào về tài khoản",
    ],
  },
  {
    id: "srv-02",
    title: "Coaching 1-1 Bắt Meta & Tư Duy Xoay Bài",
    badge: "HOT NHẤT HIỆN TẠI",
    price: "150.000đ / Buổi (90 Phút)",
    popular: true,
    features: [
      "Voice 1-1 qua Discord/Zalo, xem màn hình và chỉ lỗi sai trực tiếp",
      "Hướng dẫn cách giữ máu, quản lý kinh tế và roll ở các round then chốt",
      "Giáo án độc quyền các đội hình Meta leo rank ổn định nhất",
      "Hỗ trợ giải đáp thắc mắc xoay bài 24/7 sau buổi học",
    ],
  },
  {
    id: "srv-03",
    title: "Gói Duo Cùng Cựu Thách Đấu (Kèm Trực Tiếp)",
    badge: "NÂNG TẦM MMR",
    price: "100.000đ / Giờ (2-3 Trận)",
    features: [
      "Duo trực tiếp cùng Tuấn Thái Bình trên acc phụ trình độ tương đương",
      "Call bài, chia sẻ tướng và giữ chuỗi thắng cùng bạn trong trận",
      "Cải thiện MMR nhanh chóng, không lo gặp đồng đội troll game",
      "Vừa leo rank vừa học hỏi tư duy đỉnh cao trong từng round",
    ],
  },
];

export const FAQS: FAQItem[] = [
  {
    q: "Sau khi gửi đơn qua Zalo thì bao lâu tôi nhận được tài khoản?",
    a: "Hệ thống hoạt động tự động 24/7. Ngay sau khi bạn gửi thông tin đơn hàng và chuyển khoản theo STK shop gửi trong Zalo, ID và Mật khẩu tài khoản sẽ được bàn giao cho bạn trong vòng 30 giây.",
    category: "THUE_ACC",
    badge: "Bàn giao 30s",
  },
  {
    q: "Tôi có cần phải đặt cọc khi thuê tài khoản không?",
    a: "100% KHÔNG CẦN ĐẶT CỌC. Bạn chỉ cần thanh toán đúng số tiền của gói thời gian bạn chọn (2h, 7 ngày, 30 ngày...). Không phát sinh bất kỳ chi phí thế chấp hay phụ phí ẩn nào.",
    category: "THUE_ACC",
    badge: "Không Cọc",
  },
  {
    q: "Nếu đang chơi mà tài khoản bị lỗi hoặc bị trùng pass thì shop xử lý ra sao?",
    a: "ShopTFT Mobile cam kết bảo hành 100% thời gian thuê. Nếu có bất kỳ sự cố gián đoạn nào, shop sẽ đổi ngay acc tương đương hoặc bù thêm giờ chơi / hoàn tiền 100% ngay lập tức qua Zalo 0352.867.283.",
    category: "BAO_MAT",
    badge: "Bảo hành 100%",
  },
  {
    q: "Shop có bảo hiểm checkscam bảo chứng uy tín không?",
    a: "Có! Tuấn Thái Bình đã đóng Quỹ Bảo Hiểm 30.000.000đ trên diễn đàn Checkscam.vn uy tín hàng đầu Việt Nam bảo chứng số điện thoại 0352.867.283. Bạn hoàn toàn có thể kiểm tra công khai danh tính bất cứ lúc nào.",
    category: "THANH_TOAN",
    badge: "Quỹ 30M",
  },
  {
    q: "Tôi có thể đổi sang Tướng Tí Nị hoặc Sân Đấu khác trong thời gian thuê không?",
    a: "Hoàn toàn được! Bạn chỉ cần nhắn tin Zalo cho shop, nếu acc khác đang trống shop sẽ hỗ trợ chuyển đổi linh hoạt số giờ còn lại sang acc mới để bạn trải nghiệm.",
    category: "THUE_ACC",
    badge: "Đổi acc linh hoạt",
  },
  {
    q: "Chơi trên điện thoại (ĐTCL Mobile iOS / Android) hay PC có được không?",
    a: "Tất cả tài khoản của shop đều hỗ trợ đăng nhập đa nền tảng: Cả trên máy tính PC (Client Riot VNG) và điện thoại di động (ĐTCL Mobile iOS / Android) đều mượt mà 100%.",
    category: "THUE_ACC",
    badge: "Hỗ trợ Mobile & PC",
  },
  {
    q: "Tôi có được tự ý đổi mật khẩu hay liên kết mail khi đang thuê không?",
    a: "Đối với các gói thuê (2h, 7 ngày, 30 ngày), khách hàng vui lòng không tự ý đổi pass hoặc liên kết thông tin. Hết giờ shop sẽ tự reset pass. Nếu bạn muốn sở hữu toàn quyền đổi full mail/thông tin chính chủ, hãy chọn gói 'Thuê Lâu Dài 999 Ngày'.",
    category: "BAO_MAT",
    badge: "Quy định bảo mật",
  },
  {
    q: "Dịch vụ Cày Rank có an toàn cho tài khoản chính không?",
    a: "Tuấn trực tiếp cày tay 100% (Cựu Thách Đấu 1.134 ĐNG), sử dụng mạng IP sạch, không can thiệp phần mềm thứ 3 và cam kết bảo mật 100% danh tính khách hàng, không chat trong game.",
    category: "CAY_RANK",
    badge: "Cày tay 100%",
  },
  {
    q: "Gói Coaching 1-1 diễn ra như thế nào?",
    a: "Buổi học diễn ra 90 phút qua Discord/Zalo Voice, Tuấn sẽ xem màn hình bạn thi đấu trực tiếp, phân tích sai lầm, hướng dẫn cách giữ máu, quản lý kinh tế 50 vàng và cách xoay bài meta chuẩn xác nhất.",
    category: "CAY_RANK",
    badge: "Voice 1-1",
  },
  {
    q: "Tôi có thể nâng cấp từ gói thuê ngắn ngày sang gói Thuê Lâu Dài được không?",
    a: "Hoàn toàn được! Shop có chính sách 'Trải nghiệm trước, nâng cấp sau'. Trong thời gian bạn đang thuê (hoặc chậm nhất 24h sau khi gói thuê kết thúc), bạn chỉ cần thanh toán số tiền chênh lệch giữa gói đang thuê và gói Thuê Lâu Dài (999 Ngày). Hệ thống sẽ ngay lập tức bàn giao toàn bộ thông tin gốc của tài khoản cho bạn.",
    category: "THUE_ACC",
    badge: "Đặc Quyền Bù %",
  },
];

export interface TFTCloneAccount {
  id: string;
  code: string;
  title: string;
  rankBadge: string;
  status: "AVAILABLE" | "RENTED";
  rentedUntil?: string | null;
  thumbnail: string;
  features: string[];
  price?: number;
  periodPrice: number;
  periodUnit: string;
  durationLabel: string;
  weeklyPrice?: number;
  monthlyPrice?: number;
  hourlyPrice?: number;
  dailyPrice?: number;
  nightPrice?: number;
  priceDisplayType?: "HOURLY" | "DAILY" | "LONG_TERM" | "CUSTOM" | "AUTO";
  customPrice?: number;
  customPriceUnit?: string;
  description: string;
}

export const TFT_CLONE_ACCOUNTS: TFTCloneAccount[] = [];


// Aliases for compatibility
export const SERVICE_PACKAGES = TFT_SERVICE_PACKAGES;
export const REVIEWS = TFT_REVIEWS;
export const CUSTOMER_REVIEWS = TFT_REVIEWS;
export const RENTAL_ACCOUNTS = TFT_RENTAL_ACCOUNTS;
export const CLONE_ACCOUNTS = TFT_CLONE_ACCOUNTS;
