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
      "Tướng Tí Nị Lux Nữ Thần Vũ Trụ",
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
    code: "MS: 9911",
    title: "Acc Cao Thủ - Tí Nị Yasuo Chân Long + Sân Đấu K/DA Neon",
    mainChibi: "Tí Nị Yasuo Chân Long Kiếm",
    allChibi: [
      "Tướng Tí Nị Yasuo Chân Long Kiếm (Chém Gió Kết Liễu)",
      "Tướng Tí Nị Akali K/DA Neon",
      "Tướng Tí Nị Lee Sin Quyền Thái",
    ],
    mainArena: "Sân Đấu Đấu Trường K/DA Neon",
    allArenas: ["Sân Đấu Đấu Trường K/DA Neon", "Sân Đấu Điện Thờ Long Tộc"],
    rank: "CAO THỦ",
    rankColor: "text-purple-400 border-purple-500/50 bg-purple-500/10",
    rankBadgeBg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    hourlyPrice: 14000,
    dailyPrice: 55000,
    nightPrice: 40000,
    status: "AVAILABLE",
    totalLittleLegends: 26,
    totalArenas: 8,
    totalBooms: 18,
    thumbnail: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=800&auto=format&fit=crop",
    description: "Combo Yasuo múa kiếm cực gắt cùng sàn nhảy Neon K/DA phát nhạc sôi động. Rank Cao Thủ ổn định.",
    tag: "HOT",
  },
  {
    id: "rent-08",
    code: "MS: 2208",
    title: "Acc Vàng/Bạch Kim - Tí Nị Teemo Tiểu Quỷ + Đấu Trường La Mã",
    mainChibi: "Tí Nị Teemo Tiểu Quỷ",
    allChibi: [
      "Tướng Tí Nị Teemo Tiểu Quỷ (Bẫy Nấm Hiệu Ứng)",
      "Linh Thú Cánh Cụt Chiến Binh 3 Sao",
    ],
    mainArena: "Sân Đấu Đấu Trường La Mã",
    allArenas: ["Sân Đấu Đấu Trường La Mã", "Sân Đấu Bãi Cỏ Ban Mai"],
    rank: "VÀNG/BẠCH KIM",
    rankColor: "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
    rankBadgeBg: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
    hourlyPrice: 6000,
    dailyPrice: 25000,
    nightPrice: 18000,
    status: "AVAILABLE",
    totalLittleLegends: 8,
    totalArenas: 3,
    totalBooms: 6,
    thumbnail: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800&auto=format&fit=crop",
    description: "Acc rank Vàng/Bạch Kim cực thích hợp cho anh em kéo rank bạn bè hoặc chơi giải trí nhẹ nhàng sau giờ làm việc.",
    tag: "GIÁ RẺ",
  },
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "srv-01",
    title: "Cày Thuê Rank ĐTCL Bảo Mật",
    badge: "AN TOÀN 100%",
    price: "Từ 50k / Đoàn",
    features: [
      "Bảo mật tài khoản tuyệt đối với Riot Client, không chat trong game",
      "Tùy chọn Live Stream Discord riêng hoặc báo cáo tiến độ từng trận",
      "Tiến độ siêu tốc 1-2 ngày hoàn thành mục tiêu Cao Thủ / Thách Đấu",
      "Bảo hành hoàn tiền 100% nếu không đạt mốc rank đã thỏa thuận",
    ],
  },
  {
    id: "srv-02",
    title: "Coaching 1-1 Cùng Cựu Thách Đấu (1.134 ĐNG)",
    badge: "RECOMMENDED",
    price: "200k / Buổi 90 Phút",
    popular: true,
    features: [
      "Phân tích Replay trận đấu, chỉ ra lỗi sai def máu & xếp cờ",
      "Dạy cách quản lý Kinh Tế (Fast 8 / Slow Roll mốc 50 vàng) và xoay bài Flex",
      "Cập nhật giáo án Meta độc quyền & phân tích Nâng Cấp Lõi Hextech tối ưu",
      "Tặng kèm File Excel bảng ghép Trang Bị Ánh Sáng / Tạo Tác Ornn & Ấn Tộc Hệ",
    ],
  },
  {
    id: "srv-03",
    title: "Thu Mua & Nhận Ký Gửi Cho Thuê Acc",
    badge: "THANH TOÁN 5P",
    price: "Chia sẻ lợi nhuận cao nhất",
    features: [
      "Nhận ký gửi cho thuê acc có Tướng Tí Nị, Sân Đấu Thần Thoại kiếm thu nhập",
      "Thu mua trọn gói acc giá cao, giải ngân qua Bank/MoMo trong 5 phút",
      "Hệ thống quản lý thời gian thuê an toàn 100%, bảo hiểm đền bù nếu lỗi",
      "Bảo mật tuyệt đối danh tính người gửi",
    ],
  },
];

export const CUSTOMER_REVIEWS: ReviewItem[] = [
  {
    id: "rev-01",
    customerName: "Nguyễn Minh Hoàng",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    accountBought: "Thuê Acc MS: 8899 (Ahri Tinh Quái 1 Ngày)",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "Vừa xong (Hôm nay)",
    comment:
      "Tự động nhận thông tin đăng nhập trong 30s sau khi quét QR. Acc chuẩn 100% như mô tả, Ahri Tinh Quái chưởng lực kết liễu mượt mà. Đã gia hạn thêm 1 ngày!",
    verifiedTag: "✓ GIAO DỊCH HOÀN TẤT",
    proofImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop",
    transactionCode: "MB-8899-RENT-DONE",
  },
  {
    id: "rev-02",
    customerName: "Trần Đức Anh",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    accountBought: "Gói Coaching 1-1 Bắt Meta & Flex Bài",
    category: "COACHING",
    categoryLabel: "Coaching 1-1",
    rating: 5,
    date: "1 ngày trước",
    comment:
      "Được Tuấn coach 2 buổi từ Kim Cương lên thẳng Cao Thủ. Chỉ cho cách def máu đầu game, tính toán Lõi Công Nghệ và xoay bài flex cực đỉnh. Rất đáng tiền!",
    verifiedTag: "✓ HỌC VIÊN 1-1",
    proofImage: "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=600&auto=format&fit=crop",
    transactionCode: "COACH-180LP-PASS",
  },
  {
    id: "rev-03",
    customerName: "Lê Quốc Bảo",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop",
    accountBought: "Thuê Acc MS: 7721 (Gwen Trà Sữa 3 Giờ)",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "3 ngày trước",
    comment:
      "Thuê acc test thử Gwen Trà Sữa xem hiệu ứng, giá chỉ 12k/h quá rẻ. Chủ shop nhiệt tình hỗ trợ login nhanh gọn. 10/10 uy tín!",
    verifiedTag: "✓ ĐÃ THUÊ ACC",
    proofImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop",
    transactionCode: "ZALO-7721-RENT",
  },
  {
    id: "rev-04",
    customerName: "Phạm Hải Đăng",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    accountBought: "Cày Rank Lục Bảo → Thách Đấu",
    category: "CAY_THUE",
    categoryLabel: "Cày Thuê Rank",
    rating: 5,
    date: "5 ngày trước",
    comment:
      "Nhận acc cày đúng 36 tiếng là xong mục tiêu Thách Đấu, tỷ lệ vào top 4 lên đến 80%. Bảo mật tuyệt đối, không chat câu nào trong game. Quá uy tín!",
    verifiedTag: "✓ GIAO DỊCH HOÀN TẤT",
    proofImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
    transactionCode: "BOOST-CHALLENGER-DONE",
  },
  {
    id: "rev-05",
    customerName: "Đỗ Gia Huy",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    accountBought: "Thuê Acc MS: 4490 (5 Sân Đấu Thần Thoại)",
    category: "THUE_ACC",
    categoryLabel: "Thuê Acc TFT",
    rating: 5,
    date: "1 tuần trước",
    comment:
      "Thuê acc để quay video highlight Tik Tok, 5 sân đấu đổi nhạc EDM nghe bao cuốn. Bàn giao acc nhanh trong 1 phút.",
    verifiedTag: "✓ ĐÃ THUÊ ACC",
    proofImage: "https://images.unsplash.com/photo-1556742049-0a67e557224f?q=80&w=600&auto=format&fit=crop",
    transactionCode: "RIOT-4490-RENT",
  },
  {
    id: "rev-06",
    customerName: "Ngô Trọng Nhân",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop",
    accountBought: "Coaching Xoay Bài & Def Máu",
    category: "COACHING",
    categoryLabel: "Coaching 1-1",
    rating: 5,
    date: "1 tuần trước",
    comment:
      "Bỏ ra 200k học được bao nhiêu trick hay. Nhất là cách tính lobby và tối ưu trang bị sớm. Giờ leo Cao Thủ dễ hơn hẳn. 5 sao!",
    verifiedTag: "✓ HỌC VIÊN 1-1",
    proofImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
    transactionCode: "DISCORD-COACH-VERIFIED",
  },
];

export const FAQS = [
  {
    q: "Quy trình thuê tài khoản TFT diễn ra như thế nào?",
    a: "Rất đơn giản: Bạn chọn tài khoản ưng ý -> Chọn thời gian thuê (Theo Giờ / Theo Ngày / Qua Đêm) -> Quét mã QR thanh toán. Hệ thống hoặc Tuấn sẽ tự động gửi Tên Đăng Nhập & Mật Khẩu qua Zalo trong vòng 1-2 phút.",
  },
  {
    q: "Tôi có cần phải đặt cọc khi thuê tài khoản không?",
    a: "Tất cả tài khoản tại ShopTFT Mobile đều KHÔNG CẦN ĐẶT CỌC. Bạn chỉ cần thanh toán đúng số tiền thuê theo gói thời gian đã chọn.",
  },
  {
    q: "Quy định khi thuê tài khoản là gì?",
    a: "Khách thuê vui lòng: 1) Không sử dụng phần mềm thứ 3 / hack / cheat can thiệp game; 2) Không phá rank hoặc cố ý AFK gây khóa tài khoản; 3) Không tự ý đổi mật khẩu / thông tin tài khoản. Vi phạm sẽ bị thu hồi acc ngay lập tức không hoàn tiền.",
  },
  {
    q: "Nếu đang chơi mà tài khoản bị lỗi hoặc mất kết nối thì sao?",
    a: "Tuấn hỗ trợ 24/7. Nếu tài khoản gặp sự cố kỹ thuật từ hệ thống, bạn sẽ được ĐỔI SANG TÀI KHOẢN TƯƠNG ĐƯƠNG NGAY LẬP TỨC hoặc được BÙ THÊM THỜI GIAN THUÊ hoàn toàn miễn phí.",
  },
];
