export interface TFTRentalAccount {
  id: string;
  code: string; // "MS: 8899"
  title: string;
  mainChibi: string;
  allChibi: string[];
  mainArena: string;
  allArenas: string[];
  rank: "THÁCH ĐẤU" | "ĐẠI CAO THỦ" | "CAO THỦ" | "KIM CƯƠNG" | "LỤC BẢO" | "VÀNG/BẠCH KIM";
  rankColor: string;
  rankBadgeBg: string;
  hourlyPrice: number;
  dailyPrice: number;
  nightPrice: number;
  accountValue?: number; // Giá trị gốc của tài khoản
  status: "AVAILABLE" | "RENTED";
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

export const TFT_RENTAL_ACCOUNTS: TFTRentalAccount[] = [
  {
    id: "rent-01",
    code: "MS: 8899",
    title: "Acc Thách Đấu VIP - Tí Nị Ahri Tinh Quái + Yasuo Chân Long",
    mainChibi: "Tí Nị Ahri Chiêu Hồn Tinh Quái",
    allChibi: [
      "Tướng Tí Nị Ahri Chiêu Hồn Tinh Quái (Hiệu Ứng Kết Liễu VIP)",
      "Tướng Tí Nị Yasuo Chân Long Kiếm",
      "Tướng Tí Nị Lee Sin Nộ Long Thần",
      "Tướng Tí Nị K/DA ALL OUT Akali",
    ],
    mainArena: "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh",
    allArenas: [
      "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh",
      "Sân Đấu Thần Thoại Điện Thờ Long Tộc",
      "Sân Đấu Thần Thoại Đấu Trường Neon K/DA",
    ],
    rank: "THÁCH ĐẤU",
    rankColor: "text-amber-400 border-amber-500/50 bg-amber-500/10",
    rankBadgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    hourlyPrice: 15000,
    dailyPrice: 60000,
    nightPrice: 45000,
    accountValue: 950000,
    status: "AVAILABLE",
    totalLittleLegends: 48,
    totalArenas: 18,
    totalBooms: 32,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    description: "Tài khoản Thách Đấu cực phẩm sở hữu trọn bộ Tướng Tí Nị HOT nhất và Sân Đấu Thần Thoại đổi nhạc EDM. Thích hợp cho anh em stream hoặc test bài thi đấu.",
    tag: "VIP PRO",
  },
  {
    id: "rent-02",
    code: "MS: 7721",
    title: "Acc Cao Thủ - Tí Nị Gwen Búp Bê Trà Sữa + Sân Đấu Tuyết",
    mainChibi: "Tí Nị Gwen Búp Bê Trà Sữa",
    allChibi: [
      "Tướng Tí Nị Gwen Búp Bê Trà Sữa (Chưởng Lực Kéo Kéo Kéo)",
      "Tướng Tí Nị Yone Ma Kiếm Đoạt Hồn",
      "Tướng Tí N vị Lux Nữ Thần Vũ Trụ",
    ],
    mainArena: "Sân Đấu Thần Thoại Đền Tuyết Thần Thoại",
    allArenas: [
      "Sân Đấu Thần Thoại Đền Tuyết Thần Thoại",
      "Sân Đấu Tiệc Bãi Biển Của Choncc",
    ],
    rank: "CAO THỦ",
    rankColor: "text-purple-400 border-purple-500/50 bg-purple-500/10",
    rankBadgeBg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    hourlyPrice: 12000,
    dailyPrice: 50000,
    nightPrice: 38000,
    accountValue: 750000,
    status: "AVAILABLE",
    totalLittleLegends: 32,
    totalArenas: 12,
    totalBooms: 24,
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    description: "Acc nữ tính siêu dễ thương với Gwen Trà Sữa và Yone Ma Kiếm. Rank Cao Thủ ổn định, vào game chơi ngay không cần chờ.",
    tag: "HOT",
  },
  {
    id: "rent-03",
    code: "MS: 6632",
    title: "Acc Thách Đấu 850 ĐNG - Tí Nị Aatrox Cuồng Kiếm Sát Thần",
    mainChibi: "Tí Nị Aatrox Cuồng Kiếm Sát Thần",
    allChibi: [
      "Tướng Tí Nị Aatrox Cuồng Kiếm Sát Thần",
      "Tướng Tí Nị Zed Siêu Phẩm",
      "Tướng Tí Nị Sona Cổ Cầm Thần Thoại",
    ],
    mainArena: "Sân Đấu Thần Thoại Đấu Trường Tinh Võ",
    allArenas: [
      "Sân Đấu Thần Thoại Đấu Trường Tinh Võ",
      "Sân Đấu Đấu Trường Đấu Sĩ Vô Địch",
    ],
    rank: "THÁCH ĐẤU",
    rankColor: "text-amber-400 border-amber-500/50 bg-amber-500/10",
    rankBadgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    hourlyPrice: 18000,
    dailyPrice: 70000,
    nightPrice: 50000,
    accountValue: 1200000,
    status: "RENTED",
    totalLittleLegends: 28,
    totalArenas: 10,
    totalBooms: 20,
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    description: "Acc Thách Đấu bảng xếp hạng máy chủ VN, lịch sử đấu xanh mướt toàn top 1-2-3. Acc đang có khách thuê qua đêm.",
    tag: "ĐANG THUÊ",
  },
  {
    id: "rent-04",
    code: "MS: 5512",
    title: "Acc Kim Cương - Tí Nị Kai'Sa Nữ Thần Rồng + Annie Gấu Trúc",
    mainChibi: "Tí Nị Kai'Sa Nữ Thần Rồng",
    allChibi: [
      "Tướng Tí Nị Kai'Sa Nữ Thần Rồng",
      "Tướng Tí Nị Annie Gấu Trúc Xứ Sở Thần Tiên",
      "Linh Thú Dowsie Cung Thủ 3 Sao",
    ],
    mainArena: "Sân Đấu Rực Rỡ Sắc Hè",
    allArenas: ["Sân Đấu Rực Rỡ Sắc Hè", "Sân Đấu Thung Lũng Long Tộc"],
    rank: "KIM CƯƠNG",
    rankColor: "text-cyan-400 border-cyan-500/50 bg-cyan-500/10",
    rankBadgeBg: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
    hourlyPrice: 8000,
    dailyPrice: 35000,
    nightPrice: 25000,
    accountValue: 550000,
    status: "AVAILABLE",
    totalLittleLegends: 16,
    totalArenas: 6,
    totalBooms: 14,
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    description: "Acc giá sinh viên cực rẻ, có sẵn Kai'Sa Rồng Thần chưởng lực đẹp mắt, rank Kim Cương MMR cao thích hợp duo cùng bạn bè.",
    tag: "GIÁ RẺ",
  },
  {
    id: "rent-05",
    code: "MS: 4490",
    title: "Acc Đại Cao Thủ - Trùm 5 Sân Đấu Đổi Nhạc + Tí Nị Irelia",
    mainChibi: "Tí Nị Irelia Thánh Kiếm",
    allChibi: [
      "Tướng Tí Nị Irelia Thánh Kiếm Thần Thoại",
      "Tướng Tí Nị Morgana Bóng Tối Hoàng Hôn",
      "Tướng Tí Nị Teemo Tiểu Quỷ",
    ],
    mainArena: "Sân Đấu Thần Thoại Đỉnh Núi Thái Âm",
    allArenas: [
      "Sân Đấu Thần Thoại Đỉnh Núi Thái Âm (Đổi Nhạc EDM)",
      "Sân Đấu Thần Thoại Chợ Đêm Runeterra",
      "Sân Đấu Thần Thoại Tàu Không Gian Hextech",
      "Sân Đấu Bể Bơi Thần Thoại Của Choncc",
    ],
    rank: "ĐẠI CAO THỦ",
    rankColor: "text-rose-400 border-rose-500/50 bg-rose-500/10",
    rankBadgeBg: "bg-rose-500/15 border-rose-500/40 text-rose-300",
    hourlyPrice: 15000,
    dailyPrice: 60000,
    nightPrice: 45000,
    accountValue: 980000,
    status: "AVAILABLE",
    totalLittleLegends: 38,
    totalArenas: 24,
    totalBooms: 28,
    thumbnail: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop",
    description: "Sở hữu 5 sân đấu bậc Thần Thoại đổi nhạc EDM sống động theo chuỗi thắng/thua. Trải nghiệm âm thanh và hình ảnh đẳng cấp nhất.",
    tag: "SIÊU HIẾM",
  },
  {
    id: "rent-06",
    code: "MS: 3319",
    title: "Acc Lục Bảo - Tí Nị Sivir Tinh Binh + Cánh Cụt Pengu",
    mainChibi: "Tí Nị Sivir Tinh Binh",
    allChibi: [
      "Tướng Tí Nị Sivir Tinh Binh Sa Mạc",
      "Linh Thú Pengu Cánh Cụt Bụ Bẫm 3 Sao",
      "Linh Thú Thỏ Dango Tinh Nghịch",
    ],
    mainArena: "Sân Đấu Sa Mạc Shurima",
    allArenas: ["Sân Đấu Sa Mạc Shurima Cổ Đại", "Sân Đấu Đấu Trường Khởi Đầu"],
    rank: "LỤC BẢO",
    rankColor: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
    rankBadgeBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    hourlyPrice: 7000,
    dailyPrice: 30000,
    nightPrice: 20000,
    accountValue: 480000,
    status: "AVAILABLE",
    totalLittleLegends: 10,
    totalArenas: 4,
    totalBooms: 8,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    description: "Acc giá hạt dẻ dành cho anh em tập dợt giáo án meta mới hoặc chơi giải trí cùng bạn bè ngày cuối tuần.",
    tag: "TIẾT KIỆM",
  },
  {
    id: "rent-07",
    code: "MS: 8844",
    title: "Acc Cao Thủ - Tí Nị Teemo Tiểu Quỷ + Đấu Trường Hextech",
    mainChibi: "Tí Nị Teemo Tiểu Quỷ",
    allChibi: [
      "Tướng Tí Nị Teemo Tiểu Quỷ",
      "Tướng Tí Nị Lux Thần Thoại",
      "Linh Thú Rồng Shisa 3 Sao",
    ],
    mainArena: "Sân Đấu Thần Thoại Đấu Trường Hextech",
    allArenas: ["Sân Đấu Thần Thoại Đấu Trường Hextech", "Sân Đấu Băng Giá"],
    rank: "CAO THỦ",
    rankColor: "text-purple-400 border-purple-500/50 bg-purple-500/10",
    rankBadgeBg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    hourlyPrice: 12000,
    dailyPrice: 50000,
    nightPrice: 35000,
    accountValue: 850000,
    status: "AVAILABLE",
    totalLittleLegends: 24,
    totalArenas: 8,
    totalBooms: 16,
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    description: "Acc Teemo cười trêu tức cực vui, sở hữu sân đấu Hextech hiện đại. Rank Cao Thủ thích hợp cho anh em tryhard.",
    tag: "POPULAR",
  },
  {
    id: "rent-08",
    code: "MS: 9988",
    title: "Acc Thách Đấu 1.100 ĐNG - Tí Nị Ahri + Gwen + Yasuo Full Set",
    mainChibi: "Tí Nị Ahri + Gwen + Yasuo",
    allChibi: [
      "Tướng Tí Nị Ahri Chiêu Hồn Tinh Quái",
      "Tướng Tí Nị Gwen Búp Bê Trà Sữa",
      "Tướng Tí Nị Yasuo Chân Long Kiếm",
      "Tướng Tí Nị Aatrox Cuồng Kiếm",
    ],
    mainArena: "Sân Đấu Thần Thoại Cung Điện Hoàng Gia",
    allArenas: [
      "Sân Đấu Thần Thoại Cung Điện Hoàng Gia",
      "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh",
      "Sân Đấu Thần Thoại Điện Thờ Long Tộc",
    ],
    rank: "THÁCH ĐẤU",
    rankColor: "text-amber-400 border-amber-500/50 bg-amber-500/10",
    rankBadgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    hourlyPrice: 20000,
    dailyPrice: 80000,
    nightPrice: 60000,
    accountValue: 1350000,
    status: "AVAILABLE",
    totalLittleLegends: 60,
    totalArenas: 30,
    totalBooms: 40,
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    description: "Trùm acc ĐTCL máy chủ Việt Nam, quy tụ đầy đủ 4 Tí Nị HOT nhất và 3 sân đấu Thần Thoại đỉnh cao.",
    tag: "CỰC PHẨM",
  },
];

export const TFT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-01",
    customerName: "Nguyễn Hoàng Long",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop",
    accountBought: "MS: 8899 - Acc Thách Đấu VIP Ahri Tinh Quái",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "Hôm qua lúc 21:45",
    comment: "Acc cực mượt, đúng đủ Tí Nị Ahri và Sân Đấu Đổi Nhạc như mô tả. Quét QR xong 30s sau Zalo gửi pass luôn. Rất uy tín!",
    verifiedTag: "Giao Dịch Xác Thực #MB9821",
    proofImage: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop",
    transactionCode: "GD-8899-2024",
  },
  {
    id: "rev-02",
    customerName: "Trần Minh Đức (Streamer Đức TFT)",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=120&auto=format&fit=crop",
    accountBought: "Gói Kéo Rank Thách Đấu (Từ Kim Cương 1)",
    category: "CAY_THUE",
    categoryLabel: "Cày Rank ĐTCL",
    rating: 5,
    date: "3 ngày trước",
    comment: "Tuấn đánh tay 100%, tỷ lệ top 1 cực cao. Giao acc 2 ngày là lên Thách Đấu đúng tiến độ. Có bảo hiểm 30M nên cực kỳ yên tâm giao acc chính.",
    verifiedTag: "Giao Dịch Xác Thực #MB4432",
    proofImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    transactionCode: "GD-4432-2024",
  },
  {
    id: "rev-03",
    customerName: "Lê Quốc Bảo",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=120&auto=format&fit=crop",
    accountBought: "Gói Coaching 1-1 Bắt Meta Mùa 13 (2 Buổi)",
    category: "COACHING",
    categoryLabel: "Coaching 1-1",
    rating: 5,
    date: "1 tuần trước",
    comment: "Học xong 2 buổi vỡ ra bao nhiêu kiến thức xoay bài và giữ máu. Từ Lục Bảo 4 chuỗi thua leo thẳng lên Cao Thủ 250 ĐNG. Đáng từng đồng tiền bát gạo!",
    verifiedTag: "Giao Dịch Xác Thực #MB7719",
    proofImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    transactionCode: "GD-7719-2024",
  },
  {
    id: "rev-04",
    customerName: "Phạm Hải Đăng",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop",
    accountBought: "MS: 4490 - Acc Đại Cao Thủ 5 Sân Đấu Đổi Nhạc",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "2 tuần trước",
    comment: "Thuê gói đêm 22h - 8h sáng giá rẻ mà acc xịn đét. Sân đấu đổi nhạc nghe cuốn cực kỳ. Sẽ ủng hộ Tuấn Thái Bình dài dài!",
    verifiedTag: "Giao Dịch Xác Thực #MB3301",
    proofImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop",
    transactionCode: "GD-3301-2024",
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

export const FAQS = [
  {
    q: "Sau khi thanh toán thì bao lâu tôi nhận được tài khoản?",
    a: "Hệ thống hoạt động tự động 24/7. Ngay sau khi bạn bấm nút 'Nhận Acc Qua Zalo' và chuyển khoản thành công, thông tin tài khoản (ID & Mật khẩu) sẽ được gửi tới bạn trong vòng 30 giây.",
  },
  {
    q: "Tôi có cần đặt cọc khi thuê tài khoản không?",
    a: "100% KHÔNG CẦN ĐẶT CỌC. Bạn chỉ cần thanh toán đúng số tiền của gói giờ thuê bạn chọn, không phát sinh bất kỳ khoản phí nào khác.",
  },
  {
    q: "Nếu đang chơi mà tài khoản bị lỗi hoặc bị đổi pass thì sao?",
    a: "ShopTFT Mobile cam kết bảo hành 100% thời gian thuê. Nếu có bất kỳ sự cố nào xảy ra, Tuấn sẽ đổi ngay acc tương đương hoặc hoàn tiền / bù thêm giờ chơi ngay lập tức qua Zalo 0352.867.283.",
  },
  {
    q: "Shop có bảo hiểm checkscam không?",
    a: "Có! Tuấn Thái Bình đã đóng Quỹ Bảo Hiểm 30.000.000đ trên diễn đàn Checkscam.vn uy tín hàng đầu Việt Nam. Bạn hoàn toàn có thể kiểm tra công khai số điện thoại 0352.867.283 trên hệ thống Checkscam.",
  },
  {
    q: "Tôi có thể đổi sang acc khác giữa chừng không?",
    a: "Nếu bạn muốn đổi sang Tướng Tí Nị hoặc Sân Đấu khác trong thời gian thuê, bạn chỉ cần nhắn tin qua Zalo, shop sẽ hỗ trợ chuyển đổi linh hoạt cho bạn.",
  },
];

// Aliases for compatibility
export const SERVICE_PACKAGES = TFT_SERVICE_PACKAGES;
export const REVIEWS = TFT_REVIEWS;
export const CUSTOMER_REVIEWS = TFT_REVIEWS;
export const RENTAL_ACCOUNTS = TFT_RENTAL_ACCOUNTS;
