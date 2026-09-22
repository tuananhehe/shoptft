// =========================================================================
// TFT PETS & TACTICIANS REAL DATA (OFFICIAL RIOT GAMES COMMUNITY DRAGON CDN)
// Dữ liệu hình ảnh và tên thật từ Client Game Đấu Trường Chân Lý (Riot Games)
// Đã làm sạch cao cấp: CHỈ GIỮ TÍ NỊ, ĐỘT PHÁ, HÀNG HIỆU, SÂN ĐẤU & ĐẶC ĐIỂM ACC.
// =========================================================================

export interface TFTPetPreset {
  id: string;
  name: string;
  category: "UNBOUND" | "CHIBI" | "LITTLE_LEGEND" | "ARENA" | "FEATURE";
  categoryLabel: string;
  thumbnail?: string;
  badge?: string;
  defaultPriceBonus?: number;
}

export const TFT_PETS_DATABASE: TFTPetPreset[] = [
  {
    "id": "feat-white-info",
    "name": "Tài Khoản Trắng Thông Tin 100%",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone",
    "badge": "CHUẨN"
  },
  {
    "id": "feat-change-mail",
    "name": "Hỗ Trợ Bàn Giao Đổi Mail Chính Chủ",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone"
  },
  {
    "id": "feat-clean-mmr",
    "name": "Rank Unranked Sạch Đẹp MMR",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone",
    "badge": "SẠCH"
  },
  {
    "id": "feat-low-rank",
    "name": "Rank Đồng / Bạc Thích Hợp Leo Rank",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone"
  },
  {
    "id": "feat-full-level",
    "name": "Acc Level 30+ Đầy Đủ Tính Năng",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone",
    "badge": "LV30+"
  },
  {
    "id": "feat-safe-lifetime",
    "name": "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone",
    "badge": "BẢO HÀNH"
  },
  {
    "id": "feat-blue-essence",
    "name": "Sẵn 20.000+ Tinh Hoa Lam Đổi Tên",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone",
    "badge": "20K THL"
  },
  {
    "id": "feat-no-phone",
    "name": "Chưa Đăng Ký Số Điện Thoại & CCCD",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone"
  },
  {
    "id": "feat-full-champs",
    "name": "Sẵn 30+ Tướng Sẵn Sàng Leo Rank",
    "category": "FEATURE",
    "categoryLabel": "Đặc Điểm Clone"
  },
  {
    "id": "cd-70003",
    "name": "Aatrox Huyết Nguyệt Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiaatrox_bloodmoon_bloodmoon1_tier1.png"
  },
  {
    "id": "cd-70001",
    "name": "Aatrox Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiaatrox_base_classic_tier1.png"
  },
  {
    "id": "cd-70002",
    "name": "DRX Aatrox Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiaatrox_drx_drx1_tier1.png"
  },
  {
    "id": "cd-70004",
    "name": "Aatrox Công Sở Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiaatrox_salaryman_salaryman_tier1.chibi_aatrox_salaryman.png"
  },
  {
    "id": "cd-49003",
    "name": "Ahri Chiêu Hồn Thiên Hồ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiahri_blossom_blossom1_tier1.png"
  },
  {
    "id": "cd-49001",
    "name": "Ahri Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiahri_base_classic_tier1.png"
  },
  {
    "id": "cd-49004",
    "name": "Ahri Chiêu Hồn Thiên Hồ Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiahri_spiritblossom_spiritblossom_tier1.png"
  },
  {
    "id": "cd-49002",
    "name": "Ahri Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiahri_starguardian_starguardian1_tier1.png"
  },
  {
    "id": "cd-58001",
    "name": "Akali Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiakali_base_classic_tier1.png"
  },
  {
    "id": "cd-58002",
    "name": "K/DA ALL OUT Akali Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiakali_kda_kda1_tier1.png"
  },
  {
    "id": "cd-58003",
    "name": "Akali Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiakali_starguardian_starguardian1_tier1.png"
  },
  {
    "id": "cd-112001",
    "name": "Amumu Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiamumu_base_classic_tier1.png"
  },
  {
    "id": "cd-112002",
    "name": "Amumu Tiệc Bất Ngờ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiamumu_surpriseparty_surpriseparty1_tier1.png"
  },
  {
    "id": "cd-54003",
    "name": "Arcane Annie Fan Cứng Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiannie_bluehaired_bluehaired_tier1.png"
  },
  {
    "id": "cd-54004",
    "name": "Annie Tiệm Trà Ngọt Ngào Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiannie_cafecuties_cafecuties_tier1.chibi_annie_cafecuties.png"
  },
  {
    "id": "cd-54001",
    "name": "Annie Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiannie_base_classic_tier1.png"
  },
  {
    "id": "cd-54002",
    "name": "Annie Gấu Trúc Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiannie_lunarnewyear2023_panda_tier1.png"
  },
  {
    "id": "cd-48001",
    "name": "Ashe Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiashe_base_classic_tier1.png"
  },
  {
    "id": "cd-48004",
    "name": "Ashe Nữ Hoàng Vũ Trụ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiashe_cosmicqueen_cosmicqueen1_tier1.png"
  },
  {
    "id": "cd-48002",
    "name": "Ashe Long Tiễn Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiashe_dragonmancer_dragonmancer1_tier1.png"
  },
  {
    "id": "cd-48003",
    "name": "Ashe Cao Bồi Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiashe_highnoon_highnoon1_tier1.png"
  },
  {
    "id": "cd-87001",
    "name": "Blitzcrank Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiblitzcrank_base_classic_tier1.png"
  },
  {
    "id": "cd-87003",
    "name": "iBlitzcrank Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiblitzcrank_iblitzcrank_iblitzcrank1_tier1.png"
  },
  {
    "id": "cd-87002",
    "name": "Blitz Mãi Bên Crank Bạn Nhé Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiblitzcrank_spacegroove_spacegroove1_tier1.png"
  },
  {
    "id": "cd-118003",
    "name": "Briar Huyết Nguyệt Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibibriar_bloodmoon_bloodmoon_tier1.png"
  },
  {
    "id": "cd-118001",
    "name": "Briar Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibibriar_base_classic_tier1.png"
  },
  {
    "id": "cd-118002",
    "name": "Briar Cosplay Shork Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibibriar_shorkcosplay_shorkcosplay_tier1.png"
  },
  {
    "id": "cd-100003",
    "name": "Caitlyn Giả Lập Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibicaitlyn_arcade_arcade_tier1.png"
  },
  {
    "id": "cd-100002",
    "name": "Arcane Caitlyn Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibicaitlyn_carbs2_carbs2_tier1.png"
  },
  {
    "id": "cd-100001",
    "name": "Caitlyn Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibicaitlyn_base_classic_tier1.png"
  },
  {
    "id": "cd-34001",
    "name": "Ekko Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiekko_base_classic_tier1.png"
  },
  {
    "id": "cd-34002",
    "name": "Ekko Thủ Lĩnh Ánh Lửa Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiekko_firelight_firelight1_tier1.png"
  },
  {
    "id": "cd-80002",
    "name": "Ezreal Học Viện Chiến Binh Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiezreal_battleacademia_battleacademia_tier1.png"
  },
  {
    "id": "cd-80001",
    "name": "Ezreal Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiezreal_base_classic_tier1.png"
  },
  {
    "id": "cd-80003",
    "name": "Ezreal Sứ Thanh Hoa Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiezreal_porcelain_porcelain_tier1.png"
  },
  {
    "id": "cd-68003",
    "name": "Gwen Tiệm Trà Ngọt Ngào Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibigwen_cafecuties_cafecuties1_tier1.png"
  },
  {
    "id": "cd-68001",
    "name": "Gwen Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibigwen_base_classic_tier1.png"
  },
  {
    "id": "cd-68004",
    "name": "Gwen Hồng Pha Lê Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibigwen_crystalrose_crystalrose_tier1.png"
  },
  {
    "id": "cd-68002",
    "name": "Gwen Tử Chỉ Dương Khí Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibigwen_soulfighter_soulfighter_tier1.png"
  },
  {
    "id": "cd-74001",
    "name": "Irelia Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiirelia_base_classic_tier1.png"
  },
  {
    "id": "cd-74002",
    "name": "Irelia Thánh Kiếm Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiirelia_divinesword_divinesword1_tier1.png"
  },
  {
    "id": "cd-74003",
    "name": "Irelia Sứ Thanh Hoa Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiirelia_porcelain_porcelain1_tier1.png"
  },
  {
    "id": "cd-108001",
    "name": "Janna Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibijanna_base_classic_tier1.png"
  },
  {
    "id": "cd-108002",
    "name": "Janna Dự Báo Thời Tiết Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibijanna_forecast_forecast_tier1.png"
  },
  {
    "id": "cd-35001",
    "name": "Jinx Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibijinx_base_classic_tier1.png"
  },
  {
    "id": "cd-35002",
    "name": "Jinx Pháo Hoa Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibijinx_firecracker_firecracker1_tier1.png"
  },
  {
    "id": "cd-35004",
    "name": "Jinx Lam Hỏa Bộc Phá Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibijinx_soulfighter_soulfighter_tier1.chibi_jinx_soulfighter.png"
  },
  {
    "id": "cd-35003",
    "name": "Jinx Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibijinx_starguardian_starguardian_tier1.png"
  },
  {
    "id": "cd-45001",
    "name": "Kai'Sa Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikaisa_base_classic_tier1.png"
  },
  {
    "id": "cd-45002",
    "name": "Kai'Sa Long Nữ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikaisa_dragonmancer_dragonmancer1_tier1.png"
  },
  {
    "id": "cd-45003",
    "name": "K/DA POP/STARS Kai'Sa Siêu Sao Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikaisa_popstars_popstars1_tier1.png"
  },
  {
    "id": "cd-45005",
    "name": "Kai'Sa Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikaisa_starguardian_starguardian_tier1.png"
  },
  {
    "id": "cd-89002",
    "name": "Katarina Học Viện Chiến Binh Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikatarina_battleacademia_battleacademia1_tier1.png"
  },
  {
    "id": "cd-89001",
    "name": "Katarina Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikatarina_base_classic_tier1.png"
  },
  {
    "id": "cd-115002",
    "name": "Kayle Thiên Sứ Công Nghệ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikayle_aetherwing_aetherwing1_tier1.png"
  },
  {
    "id": "cd-115001",
    "name": "Kayle Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibikayle_base_classic_tier1.png"
  },
  {
    "id": "cd-44001",
    "name": "Lee Sin Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibileesin_base_classic_tier1.png"
  },
  {
    "id": "cd-44003",
    "name": "Lee Tiểu Long Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibileesin_dragonfist_dragonfist1_tier1.png"
  },
  {
    "id": "cd-44002",
    "name": "Lee Sin Long Cước Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibileesin_dragonmancer_dragonmancer1_tier1.png"
  },
  {
    "id": "cd-120001",
    "name": "Lillia Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilillia_base_classic_tier1.png"
  },
  {
    "id": "cd-120002",
    "name": "Lillia Mộng Tưởng Tiên Nữ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilillia_spiritblossom_spiritblossom_tier1.png"
  },
  {
    "id": "cd-85001",
    "name": "Lulu Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilulu_base_classic_tier1.png"
  },
  {
    "id": "cd-85002",
    "name": "Lulu Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilulu_starguardian_starguardian1_tier1.png"
  },
  {
    "id": "cd-50001",
    "name": "Lux Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilux_base_classic_tier1.png"
  },
  {
    "id": "cd-50004",
    "name": "Lux Vũ Trụ Hủy Diệt Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilux_darkcosmic_darkcosmic_tier1.png"
  },
  {
    "id": "cd-50003",
    "name": "Lux Sứ Thanh Hoa Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilux_porcelain_porcelain1_tier1.png"
  },
  {
    "id": "cd-50002",
    "name": "Lux Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibilux_starguardian_starguardian1_tier1.png"
  },
  {
    "id": "cd-60001",
    "name": "Malphite Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimalphite_base_classic_tier1.png"
  },
  {
    "id": "cd-60002",
    "name": "Malphite Máy Móc Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimalphite_mecha_mecha1_tier1.png"
  },
  {
    "id": "cd-84002",
    "name": "Miss Fortune Thỏ Chỉ Huy Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimissfortune_battlebunny_battlebunny1_tier1.png"
  },
  {
    "id": "cd-84004",
    "name": "Miss Fortune Huyết Nguyệt Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimissfortune_bloodmoon_bloodmoon_tier1.png"
  },
  {
    "id": "cd-84001",
    "name": "Miss Fortune Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimissfortune_base_classic_tier1.png"
  },
  {
    "id": "cd-77001",
    "name": "Morgana Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimorgana_base_classic_tier1.png"
  },
  {
    "id": "cd-77003",
    "name": "Morgana Tiên Hắc Ám Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimorgana_coven_coven_tier1.png"
  },
  {
    "id": "cd-77002",
    "name": "Morgana Khổng Tước Hoàng Hậu Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimorgana_immortal_immortal_tier1.png"
  },
  {
    "id": "cd-77004",
    "name": "Morgana Ác Nữ Khắc Tinh Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibimorgana_prestigestarnemesis_prestigestarnemesis_tier1.png"
  },
  {
    "id": "cd-125001",
    "name": "Neeko Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibineeko_base_classic_tier1.png"
  },
  {
    "id": "cd-125002",
    "name": "Neeko Fan Cứng K/DA Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibineeko_kdasuperfan_kdasuperfan1_tier1.png"
  },
  {
    "id": "cd-91001",
    "name": "Orianna Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiorianna_base_classic_tier1.png"
  },
  {
    "id": "cd-91003",
    "name": "Orianna Trán Hoa Linh Ngọc Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiorianna_spiritblossom_spiritblossom_tier1.png"
  },
  {
    "id": "cd-91002",
    "name": "T1 Orianna Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiorianna_t1_t1_tier1.png"
  },
  {
    "id": "cd-113001",
    "name": "Riven Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiriven_base_classic_tier1.png"
  },
  {
    "id": "cd-113002",
    "name": "Riven Thần Kiếm Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiriven_dawnbringer_dawnbringer_tier1.png"
  },
  {
    "id": "cd-113003",
    "name": "Ngạo Kiếm Riven Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiriven_prestigevaliantsword_prestigevaliantsword_tier1.png"
  },
  {
    "id": "cd-94001",
    "name": "Seraphine Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiseraphine_base_classic_tier1.png"
  },
  {
    "id": "cd-94003",
    "name": "Seraphine Hồng Pha Lê Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiseraphine_crystalrose_crystalrose_tier1.png"
  },
  {
    "id": "cd-94002",
    "name": "K/DA ALL OUT Seraphine Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiseraphine_kda_kda_tier1.png"
  },
  {
    "id": "cd-75001",
    "name": "Sett Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisett_base_classic_tier1.png"
  },
  {
    "id": "cd-75002",
    "name": "HEARTSTEEL Sett Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisett_musicbeat_musicbeat1_tier1.png"
  },
  {
    "id": "cd-75003",
    "name": "Sett Song Hồn Hoang Thú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisett_spiritblossom_spiritblossom1_tier1.png"
  },
  {
    "id": "cd-176001",
    "name": "Shyvana Thần Long Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibishyvana_base_classic_tier1.chibi_shyvana_base.png"
  },
  {
    "id": "cd-76001",
    "name": "Sona Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisona_base_classic_tier1.png"
  },
  {
    "id": "cd-76002",
    "name": "Sona Cổ Cầm Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisona_guqin_guqin1_tier1.png"
  },
  {
    "id": "cd-145002",
    "name": "Soraka Chuối Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisoraka_banana_banana_tier1.png"
  },
  {
    "id": "cd-145001",
    "name": "Soraka Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisoraka_base_classic_tier1.png"
  },
  {
    "id": "cd-140001",
    "name": "Syndra Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisyndra_base_classic_tier1.png"
  },
  {
    "id": "cd-140002",
    "name": "Syndra Vệ Binh Tinh Tú Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibisyndra_starguardian_starguardian_tier1.png"
  },
  {
    "id": "cd-64003",
    "name": "Beemo Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiteemo_beemo_beemo1_tier1.png"
  },
  {
    "id": "cd-64001",
    "name": "Teemo Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiteemo_base_classic_tier1.png"
  },
  {
    "id": "cd-64002",
    "name": "Teemo Tiểu Quỷ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiteemo_devil_devil1_tier1.png"
  },
  {
    "id": "cd-83001",
    "name": "Tristana Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibitristana_base_classic_tier1.png"
  },
  {
    "id": "cd-83003",
    "name": "Tristana Luyện Rồng Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibitristana_dragontrainer_dragontrainer_tier1.png"
  },
  {
    "id": "cd-83002",
    "name": "Tristana Pháo Thủ Pengu Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibitristana_pengucosplay_pengucosplay_tier1.png"
  },
  {
    "id": "cd-151002",
    "name": "Vex Tiệm Trà Ngọt Ngào Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibivex_cafecuties_cafecuties1_tier1.chibi_vex_cafecuties.png"
  },
  {
    "id": "cd-151001",
    "name": "Vex Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibivex_base_classic_tier1.chibi_vex_base.png"
  },
  {
    "id": "cd-37002",
    "name": "Arcane Vi Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibivi_carbs2_carbs2_tier1.png"
  },
  {
    "id": "cd-37001",
    "name": "Vi Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibivi_base_classic_tier1.png"
  },
  {
    "id": "cd-134002",
    "name": "Xayah Dơi Chiến Binh Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibixayah_battlebat_battlebat1_tier1.png"
  },
  {
    "id": "cd-134001",
    "name": "Xayah Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibixayah_base_classic_tier1.png"
  },
  {
    "id": "cd-38001",
    "name": "Yasuo Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyasuo_base_classic_tier1.png"
  },
  {
    "id": "cd-38002",
    "name": "Yasuo Long Kiếm Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyasuo_dragonmancer_dragonmancer1_tier1.png"
  },
  {
    "id": "cd-38003",
    "name": "Yasuo Long Kiếm Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyasuo_prestige_prestige1_tier1.png"
  },
  {
    "id": "cd-79002",
    "name": "Yone Tà Ảnh Song Kiếm Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyone_blossom_blossom_tier1.png"
  },
  {
    "id": "cd-79001",
    "name": "Yone Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyone_base_classic_tier1.png"
  },
  {
    "id": "cd-79003",
    "name": "Yone Thần Kiếm Tí Nị - Hàng Hiệu",
    "category": "CHIBI",
    "categoryLabel": "Tướng Hàng Hiệu",
    "badge": "HÀNG HIỆU",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyone_dawnbringer_dawnbringer_tier1.png"
  },
  {
    "id": "cd-79004",
    "name": "T1 Yone Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyone_faker_faker1_tier1.png"
  },
  {
    "id": "cd-128001",
    "name": "Yunara Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyunara_base_classic_tier1.png"
  },
  {
    "id": "cd-128002",
    "name": "Yunara Trấn Linh Vu Nữ Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyunara_spiritblossom_spiritblossom1_tier1.png"
  },
  {
    "id": "cd-96003",
    "name": "Yuubee Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyuumi_bee_bee_tier1.png"
  },
  {
    "id": "cd-96002",
    "name": "Yuumi Phù Thủy Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyuumi_bewitching_bewitching1_tier1.png"
  },
  {
    "id": "cd-96001",
    "name": "Yuumi Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyuumi_base_classic_tier1.png"
  },
  {
    "id": "cd-56001",
    "name": "Zed Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibized_base_classic_tier1.png"
  },
  {
    "id": "cd-56003",
    "name": "Zed Tử Thần Không Gian Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibized_galaxyslayer_galaxyslayer1_tier1.png"
  },
  {
    "id": "cd-56002",
    "name": "SIÊU PHẨM: Zed Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibized_project_project1_tier1.png"
  },
  {
    "id": "cd-105001",
    "name": "Zoe Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tướng Tí Nị",
    "badge": "TÍ NỊ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibizoe_base_classic_tier1.png"
  },
  {
    "id": "cd-105002",
    "name": "Zoe Thần Thoại Tí Nị",
    "category": "CHIBI",
    "categoryLabel": "Tí Nị Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibizoe_mythmaker_mythmaker_tier1.png"
  },
  {
    "id": "cd-133001",
    "name": "Ahri Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoahri_base_classic_tier1.tft_style2_ahri_base.png"
  },
  {
    "id": "cd-133002",
    "name": "K/DA Ahri Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoahri_kdapopstars_kdapopstars_tier1.png"
  },
  {
    "id": "cd-153002",
    "name": "Aphelios Suối Nước Nóng Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoaphelios_spiritblossomsprings_spiritblossomsprings_tier1.tft_style2_aphelios_sbs.png"
  },
  {
    "id": "cd-129001",
    "name": "Darius Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwodarius_base_classic_tier1.tft_style2_darius_base.png"
  },
  {
    "id": "cd-129002",
    "name": "Darius Lang Vương Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwodarius_godking_godking_tier1.png"
  },
  {
    "id": "cd-114001",
    "name": "Garen Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwogaren_base_classic_tier1.png"
  },
  {
    "id": "cd-114002",
    "name": "Garen Sư Vương Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwogaren_godking_godking_tier1.png"
  },
  {
    "id": "cd-114003",
    "name": "Garen Pengu Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwogaren_pengaren_pengaren_tier1.png"
  },
  {
    "id": "cd-149002",
    "name": "Irelia Thần Thoại Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoirelia_mythmaker_mythmaker1_tier1.png"
  },
  {
    "id": "cd-107001",
    "name": "Jhin Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwojhin_base_classic_tier1.png"
  },
  {
    "id": "cd-107002",
    "name": "Jhin Vũ Trụ Hắc Ám Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwojhin_darkcosmic_darkcosmic_tier1.png"
  },
  {
    "id": "cd-101003",
    "name": "Arcane Jinx Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwojinx_carbs2_carbs2_tier1.png"
  },
  {
    "id": "cd-136002",
    "name": "Katarina Anh Linh Chiến Lang Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwokatarina_chosenofthewolf_chosenofthewolf_tier1.png"
  },
  {
    "id": "cd-150002",
    "name": "Leblanc Tiên Hắc Ám Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoleblanc_coven_coven_tier1.tft_style2_leblanc_coven.png"
  },
  {
    "id": "cd-138002",
    "name": "Lee Sin Tuyệt Vô Thần Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoleesin_godfist_godfist_tier1.png"
  },
  {
    "id": "cd-143002",
    "name": "Lucian Cao Bồi Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwolucian_highnoon_highnoon_tier1.png"
  },
  {
    "id": "cd-141002",
    "name": "Mordekaiser Hắc Tinh Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwomordekaiser_darkstar_darkstar1_tier1.png"
  },
  {
    "id": "cd-130001",
    "name": "Pyke Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwopyke_base_classic_tier1.png"
  },
  {
    "id": "cd-130002",
    "name": "T1 Pyke Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwopyke_esport_esport_tier1.png"
  },
  {
    "id": "cd-148002",
    "name": "Rengar Đặc Vụ Siêu Linh Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletworengar_psyops_psyops_tier1.tft_style2_rengar_pysops.png"
  },
  {
    "id": "cd-124001",
    "name": "Senna Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwosenna_base_classic_tier1.png"
  },
  {
    "id": "cd-124002",
    "name": "Senna Cao Bồi Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwosenna_highnoon_highnoon_tier1.png"
  },
  {
    "id": "cd-119001",
    "name": "Thresh Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwothresh_base_classic_tier1.png"
  },
  {
    "id": "cd-119003",
    "name": "Thresh Cao Bồi Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwothresh_highnoon_highnoon_tier1.png"
  },
  {
    "id": "cd-109001",
    "name": "Vayne Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwovayne_base_classic_tier1.png"
  },
  {
    "id": "cd-109002",
    "name": "SIÊU PHẨM: Vayne Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwovayne_project_project_tier1.png"
  },
  {
    "id": "cd-109003",
    "name": "Vayne Vệ Binh Ánh Sáng Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwovayne_sentinel_sentinel_tier1.png"
  },
  {
    "id": "cd-103002",
    "name": "Arcane Warwick Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwowarwick_carbs2_carbs2_tier1.png"
  },
  {
    "id": "cd-103001",
    "name": "Warwick Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwowarwick_base_classic_tier1.png"
  },
  {
    "id": "cd-103003",
    "name": "SIÊU PHẨM: Warwick Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwowarwick_project_project_tier1.png"
  },
  {
    "id": "cd-123001",
    "name": "Yasuo Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoyasuo_base_classic_tier1.png"
  },
  {
    "id": "cd-123002",
    "name": "Yasuo Ma Kiếm Đột Phá",
    "category": "UNBOUND",
    "categoryLabel": "Tướng Đột Phá",
    "badge": "ĐỘT PHÁ",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwoyasuo_nightbringer_nightbringer1_tier1.png"
  },
  {
    "id": "arena-1029",
    "name": "Tiệc Sinh Nhật 7 Tuổi Của Pengu",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_7yanniversary.png"
  },
  {
    "id": "arena-1011",
    "name": "Sân Đấu Sinh Nhật Pengu 6 Tuổi",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_anniversary.png"
  },
  {
    "id": "arena-1028",
    "name": "Đỉnh Cao URF",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_aprilfool.png"
  },
  {
    "id": "arena-1027",
    "name": "Trung Tâm Sinh Quyển",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_astronaut.png"
  },
  {
    "id": "arena-124",
    "name": "Học Viện Chiến Binh: Buổi Diễn Tối Thượng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_battleacademia.png"
  },
  {
    "id": "arena-90",
    "name": "Quái Vật Tấn Công!",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_battlecity.png"
  },
  {
    "id": "arena-1019",
    "name": "K.O. Đại Chiến Anh Hùng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_battlestadium.png"
  },
  {
    "id": "arena-111",
    "name": "Vịnh Bilgewater",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_bilgewaterbay.png"
  },
  {
    "id": "arena-1001",
    "name": "Huyết Nguyệt Dạ Hành",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_bloodmoon.png"
  },
  {
    "id": "arena-125",
    "name": "Quán Le Bunny Bonbon",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_cafecuties.png"
  },
  {
    "id": "arena-1016",
    "name": "Khu Nhạc Chill Của Choncc",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_choncc.png"
  },
  {
    "id": "arena-1021",
    "name": "Bình Nguyên Volrachnun",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_chosenofthewolf.png"
  },
  {
    "id": "arena-1008",
    "name": "Đường Phố Thành Phố Công Nghệ",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_cyberpunk.png"
  },
  {
    "id": "arena-17",
    "name": "Sân Đấu Hố Đen",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_darkstar_blackhole.png"
  },
  {
    "id": "arena-19",
    "name": "Sân Đấu Thiên Thượng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_darkstar_celestial.png"
  },
  {
    "id": "arena-20",
    "name": "Sân Đấu Siêu Tân Tinh",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_darkstar_supernova.png"
  },
  {
    "id": "arena-1013",
    "name": "Ma Sứ vs Thần Sứ",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_dawnbringernightbringer.png"
  },
  {
    "id": "arena-76",
    "name": "Tiệm Spa Trong Hang Sâu",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_dragonbathhouse.png"
  },
  {
    "id": "arena-1010",
    "name": "Cao Ốc Thành Phố Công Nghệ",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_eliteviproom.png"
  },
  {
    "id": "arena-1034",
    "name": "Rừng Hoàng Hôn",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_enchantedforest.png"
  },
  {
    "id": "arena-1017",
    "name": "Tiệm Cà Phê Paris",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_esportsparisopen.png"
  },
  {
    "id": "arena-1005",
    "name": "Khu Hầm Trú Ánh Lửa",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_firelightshideout.png"
  },
  {
    "id": "arena-10",
    "name": "Sân Đấu Hậu Nhân Avarosa",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_avarosa.png"
  },
  {
    "id": "arena-11",
    "name": "Sân Đấu Thủ Vệ Băng Giá",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_frostguard.png"
  },
  {
    "id": "arena-9",
    "name": "Sân Đấu Móng Vuốt Mùa Đông",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_wintersclaw.png"
  },
  {
    "id": "arena-1020",
    "name": "Tháp Cảnh Mộng Của Gwen",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_gwen.png"
  },
  {
    "id": "arena-119",
    "name": "Bồng Lai Tiên Cảnh",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_immortaljourney.png"
  },
  {
    "id": "arena-1006",
    "name": "Linh Xà Thần Vực",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lunarrevel2025.png"
  },
  {
    "id": "arena-1024",
    "name": "Mã Đáo Thành Công",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lunarrevel_modern.png"
  },
  {
    "id": "arena-36",
    "name": "Sân Đấu Hộp Đêm Tân Sửu",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lunarrevel_club2.png"
  },
  {
    "id": "arena-117",
    "name": "Cao Ốc Kim Long",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lunarrevel_dragondancerooftop.png"
  },
  {
    "id": "arena-37",
    "name": "Sân Đấu Phố Tết",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lunarrevel_lunarcity2057.png"
  },
  {
    "id": "arena-54",
    "name": "Hội Chợ Nhâm Dần",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_exporter_lg_lunarrevel_nightmarket.png"
  },
  {
    "id": "arena-84",
    "name": "Ngôi Nhà Thỏ Vàng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lunarrevel_penthouseparty.png"
  },
  {
    "id": "arena-1007",
    "name": "Giấc Mơ Demacia Của Lux",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_lux.png"
  },
  {
    "id": "arena-1002",
    "name": "Sân Đấu Huyễn Thuật Song Đấu",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_magicduel.png"
  },
  {
    "id": "arena-1000",
    "name": "Tàng Thư Ma Pháp",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_magiclibrary.png"
  },
  {
    "id": "arena-113",
    "name": "Sân Khấu Neon",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_neondj.png"
  },
  {
    "id": "arena-98",
    "name": "Sân Đấu Chiến Binh",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_noxusring.png"
  },
  {
    "id": "arena-1031",
    "name": "Thiên Văn Tinh Tú",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_observatory.png"
  },
  {
    "id": "arena-21",
    "name": "Sân Đấu Jinx Siêu Quậy Không Gian",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_odyssey_jinx.png"
  },
  {
    "id": "arena-23",
    "name": "Sân Đấu Malphite Hộ Pháp Không Gian",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_odyssey_malphite.png"
  },
  {
    "id": "arena-22",
    "name": "Sâu Đấu Yasuo Kiếm Khách Không Gian",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_odyssey_yasuo.png"
  },
  {
    "id": "arena-63",
    "name": "SIÊU PHẨM: Rìa Tòa Nhà Công Nghệ",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_project.png"
  },
  {
    "id": "arena-1023",
    "name": "Chân Trời Mộng Ước",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_retrodreamscape.png"
  },
  {
    "id": "arena-97",
    "name": "Điện Thờ Của Vùng Đất Khởi Nguyên",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_samuraiduel.png"
  },
  {
    "id": "arena-112",
    "name": "K/DA Tại Đồng Quy Giới",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set10_kda.png"
  },
  {
    "id": "arena-46",
    "name": "Tiệm Bánh Hoàng Kim",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_dawnofheroes_goldenbakery.png"
  },
  {
    "id": "arena-47",
    "name": "Quán Rượu Viễn Tây",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_dawnofheroes_highnoonsaloon.png"
  },
  {
    "id": "arena-41",
    "name": "Sân Đấu Phiên Tòa Âm Ti",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_reckoning_countspatula.png"
  },
  {
    "id": "arena-42",
    "name": "Sân Đấu Tiệc Bãi Biển",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_reckoning_splashparty.png"
  },
  {
    "id": "arena-58",
    "name": "Sân Đấu Đấu Trường Hextech",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set6_5_hexbattle.png"
  },
  {
    "id": "arena-59",
    "name": "Vườn Độc Dược",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set6_5_zaunbotanicalgarden.png"
  },
  {
    "id": "arena-51",
    "name": "Kho Hàng Dui Dẻ của Jinx",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_gizmosandgadgets_jinxexplodyfunland.png"
  },
  {
    "id": "arena-52",
    "name": "Phòng Tập của Vi",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_gizmosandgadgets_vipummelpit.png"
  },
  {
    "id": "arena-67",
    "name": "Thánh Địa Thần Long",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set7_ancientdragon.png"
  },
  {
    "id": "arena-68",
    "name": "Trường Luyện Rồng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set7_dragonnursery.png"
  },
  {
    "id": "arena-72",
    "name": "Khu Nghỉ Dưỡng Của Choncc",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set7_dragonresort.png"
  },
  {
    "id": "arena-83",
    "name": "Đại Bản Doanh Trinh Sát Poro",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_set8_commandbridge.png"
  },
  {
    "id": "arena-1022",
    "name": "Vọng Đài Shurima",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_shurima.png"
  },
  {
    "id": "arena-99",
    "name": "Sân Đấu Giải Đấu Tinh Võ",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_soulfighter.png"
  },
  {
    "id": "arena-1032",
    "name": "Giải Đấu Hỗn Loạn của Jinx",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_soulfighter2026.png"
  },
  {
    "id": "arena-91",
    "name": "Đấu Trường Thần Giáp",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_spacebattle.png"
  },
  {
    "id": "arena-1009",
    "name": "U Mộng Hoa Cảnh",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_spiritblossom.png"
  },
  {
    "id": "arena-29",
    "name": "Sân Đấu Tịnh Hồn",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_spiritblossom_kami.png"
  },
  {
    "id": "arena-28",
    "name": "Sân Đấu Lễ Hội",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_spiritblossom_reality.png"
  },
  {
    "id": "arena-30",
    "name": "Sân Đấu U Hồn",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_spiritblossom_yokai.png"
  },
  {
    "id": "arena-78",
    "name": "Everything Goes On",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_starguardian_classroom.png"
  },
  {
    "id": "arena-1026",
    "name": "Tinh Tú Hắc Ám",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_starnemesis.png"
  },
  {
    "id": "arena-1030",
    "name": "Đường Phố Phong Cách Graffiti",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_streetfashion.png"
  },
  {
    "id": "arena-1033",
    "name": "Tàu Sushi Siêu Tốc của Mèo Bánh Mì",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_sushiconveyorbelt.png"
  },
  {
    "id": "arena-1025",
    "name": "Đỉnh Cực Quang",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_targon.png"
  },
  {
    "id": "arena-123",
    "name": "Giấc Mơ Đất Thiêng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_teaterraces.png"
  },
  {
    "id": "arena-1004",
    "name": "Cầu Tiến Bộ",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_thebridge.png"
  },
  {
    "id": "arena-1003",
    "name": "Quán Giọt Cuối Cùng",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_thelastdrop.png"
  },
  {
    "id": "arena-1015",
    "name": "Sàn Huấn Luyện Nguy Hiểm Cao",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_trainingground.png"
  },
  {
    "id": "arena-86",
    "name": "Phòng Thí Nghiệm Đột Biến Của Whisker",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Huyền Thoại",
    "badge": "HUYỀN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_villainlab.png"
  },
  {
    "id": "arena-1018",
    "name": "Phòng Trà Yên Bình",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_pandateahouse.png"
  },
  {
    "id": "arena-1014",
    "name": "Sân Chơi Của Yuumi",
    "category": "ARENA",
    "categoryLabel": "Sân Đấu Thần Thoại",
    "badge": "THẦN THOẠI",
    "thumbnail": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/tftmapskins/square_battlefield_lg_yuumicat.png"
  }
];

export const TFT_CATEGORIES = [
  { key: "UNBOUND", label: "✨ Tướng Đột Phá" },
  { key: "CHIBI", label: "🌟 Tướng Tí Nị" },
  { key: "ARENA", label: "🏟️ Sân Đấu" },
  { key: "FEATURE", label: "🛡️ Đặc Điểm Acc" },
] as const;
