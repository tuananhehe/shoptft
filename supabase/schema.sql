-- ============================================================
-- SCRIPT TẠO BẢNG KHO ACC (ACCOUNTS) TRÊN SUPABASE (ĐỒNG BỘ HOÀN TOÀN)
-- Dành cho hệ thống Shop TFT Tuấn Thái Bình
-- ============================================================

-- 1. TẠO BẢNG ACCOUNTS (NẾU CHƯA CÓ)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('VIP', 'CLONE')),
    title TEXT NOT NULL,
    rank TEXT NOT NULL,
    price BIGINT DEFAULT 0,
    hourly_price BIGINT DEFAULT 15000,
    weekly_price BIGINT DEFAULT 0,
    period_price BIGINT DEFAULT 150000,
    champions TEXT[] DEFAULT '{}',
    arenas TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    image_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED')),
    rented_until TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẬT ROW LEVEL SECURITY (RLS) & CẤP QUYỀN TRUY CẬP CÔNG KHAI
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on accounts" 
ON accounts FOR SELECT 
USING (true);

CREATE POLICY "Allow all access on accounts" 
ON accounts FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. ĐỔ DỮ LIỆU MẪU BAN ĐẦU (SEED DATA - 6 ACC VIP & 8 ACC CLONE THUÊ LÂU DÀI)
INSERT INTO accounts (code, type, title, rank, price, hourly_price, weekly_price, period_price, champions, arenas, features, image_url, status, description)
VALUES
-- === KHO ACC VIP (TƯỚNG TÍ NỊ & SÂN ĐẤU - THUÊ THEO GIỜ/NGÀY) ===
(
    'MS: 8899', 'VIP', 'Thách Đấu 850 ĐNG - Tí Nị Aatrox Cuồng Kiếm Sát Thần', 'THÁCH ĐẤU', 850000, 15000, 0, 850000,
    ARRAY['Tí Nị Aatrox Cuồng Kiếm Sát Thần', 'Tí Nị Ahri Chiêu Hồn', 'Tí Nị Yasuo Chân Long'],
    ARRAY['Sân Đấu Thần Thoại Tiệm Trà Tâm Linh', 'Sân Đấu Đấu Trường La Mã'],
    ARRAY['Full tướng', 'Full sàn đấu', 'Đổi nhạc nền cực chill'],
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Thách Đấu rank cực cao, sở hữu Aatrox Cuồng Kiếm Sát Thần.'
),
(
    'MS: 9921', 'VIP', 'Đại Cao Thủ 550 ĐNG - Tí Nị Ahri Chiêu Hồn Tinh Quái', 'ĐẠI CAO THỦ', 750000, 12000, 0, 750000,
    ARRAY['Tí Nị Ahri Chiêu Hồn Tinh Quái', 'Tí Nị Gwen Búp Bê Điểm Tuyết'],
    ARRAY['Sân Đấu Điện Thờ Phù Thủy'],
    ARRAY['Hiệu ứng kết liễu cực ảo'],
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Acc Đại Cao Thủ điểm ĐNG cao, có Ahri Chiêu Hồn và Gwen Búp Bê.'
),
(
    'MS: 7712', 'VIP', 'Cao Thủ 320 ĐNG - Tí Nị Yasuo Chân Long Kiếm', 'CAO THỦ', 650000, 10000, 0, 650000,
    ARRAY['Tí Nị Yasuo Chân Long Kiếm', 'Tí Nị Yone Song Kiếm'],
    ARRAY['Sân Đấu Đền Rồng Sấm Sét'],
    ARRAY['Hiệu ứng kiếm chém cực bén'],
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Acc Cao Thủ chuyên Yasuo Kiếm Thần Thoại chém lốc đổi nhạc sống động.'
),
(
    'MS: 6634', 'VIP', 'Kim Cương I - Tí Nị Gwen Búp Bê Điểm Tuyết', 'KIM CƯƠNG', 550000, 9000, 0, 550000,
    ARRAY['Tí Nị Gwen Búp Bê Điểm Tuyết'],
    ARRAY['Sân Đấu Vương Quốc Băng Giá'],
    ARRAY['Hiệu ứng cắt kéo siêu mượt'],
    'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Acc Kim Cương I gần lên Cao Thủ, sở hữu Gwen Búp Bê Tuyết.'
),
(
    'MS: 5543', 'VIP', 'Lục Bảo II - Tí Nị KaiSa Nữ Thần Long Tộc', 'LỤC BẢO', 450000, 8000, 0, 450000,
    ARRAY['Tí Nị KaiSa Nữ Thần Long Tộc'],
    ARRAY['Sân Đấu Hang Rồng Cổ Đại'],
    ARRAY['Hiệu ứng bão phi đao'],
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Acc Lục Bảo II thích hợp leo rank nhẹ nhàng.'
),
(
    'MS: 4421', 'VIP', 'Vàng I - Tí Nị Teemo Tiểu Quỷ Địa Ngục', 'VÀNG/BẠCH KIM', 350000, 6000, 0, 350000,
    ARRAY['Tí Nị Teemo Tiểu Quỷ Địa Ngục'],
    ARRAY['Sân Đấu Lò Luyện Địa Ngục'],
    ARRAY['Emote cười troll đối thủ'],
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Acc Vàng I cày chuỗi thắng dễ dàng, có Teemo ném nấm.'
),

-- === KHO ACC CLONE / SMURF (THUÊ LÂU DÀI VÔ CỰC ∞ - BÀN GIAO FULL THÔNG TIN) ===
(
    'CLONE-01', 'CLONE', 'Acc Unranked Trắng Thông Tin', 'UNRANKED', 150000, 0, 0, 150000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['Đủ tướng cơ bản, vào trận ngay', 'Hỗ trợ đổi Pass & Mail riêng', 'Chưa từng đánh Xếp Hạng Set mới', 'Bảo hành vĩnh viễn trọn đời'],
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Unranked trắng thông tin 100%, MMR sạch đẹp bàn giao full quyền sở hữu.'
),
(
    'SMURF-02', 'CLONE', 'Acc Smurf Rank Đồng / Bạc', 'RANK ĐỒNG / BẠC', 160000, 0, 0, 160000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['MMR sạch, cộng nhiều ĐNG', 'Đủ linh thú cơ bản để test đội hình', 'Bàn giao full thông tin ID & Pass', 'Bảo hành vĩnh viễn không lo khóa'],
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Smurf rank thấp, thích hợp kéo rank cùng bạn bè hoặc luyện tập giáo án mới.'
),
(
    'CLONE-03', 'CLONE', 'Acc Test Meta Level 35+', 'RANK VÀNG / BẠCH KIM', 180000, 0, 0, 180000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['Kèm sẵn 1-2 Tướng Tí Nị thường', 'Sẵn sàng Duo leo rank cùng bạn bè', 'Bàn giao toàn quyền sở hữu 30s', 'Đổi thông tin cá nhân tùy ý'],
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Level 35+ đầy đủ tính năng, sẵn sàng vào trận leo rank ngay lập tức.'
),
(
    'SMURF-04', 'CLONE', 'Acc Clone Kèm Sân Đấu Đẹp', 'ACC TRẮNG TT 100%', 190000, 0, 0, 190000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['Trắng thông tin, đổi pass riêng tư', 'Full tướng ĐTCL mùa hiện tại', 'Bàn giao toàn quyền trọn đời', 'Hỗ trợ kỹ thuật 24/7'],
    'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản trắng thông tin kèm sẵn sân đấu xịn xò, hỗ trợ đổi mật khẩu riêng tư trọn đời.'
),
(
    'CLONE-05', 'CLONE', 'Acc Smurf Level 40+ Trắng Mail', 'UNRANKED / LV 40+', 170000, 0, 0, 170000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['Level 40+ tích sẵn nhiều mảnh tướng', 'Trắng mail gốc, bảo mật tuyệt đối', 'Bảo hành vĩnh viễn không lo bị khóa', 'Toàn quyền sở hữu lâu dài'],
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Level cao đã mở khóa toàn bộ chế độ, thích hợp cho anh em muốn sở hữu lâu dài.'
),
(
    'SMURF-06', 'CLONE', 'Acc Test Đội Hình Lục Bảo', 'RANK LỤC BẢO', 210000, 0, 0, 210000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['Khung rank Lục Bảo đẹp mắt', 'Kèm 2 sàn đấu linh thú độc quyền', 'Bàn giao full thông tin siêu tốc 30s', 'Bảo hành vĩnh viễn trọn gói'],
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Lục Bảo MMR chuẩn chỉ, đánh rank cọ xát với các cao thủ cực kỳ chất lượng.'
),
(
    'CLONE-07', 'CLONE', 'Acc Smurf Kéo Rank Bạn Bè', 'RANK ĐỒNG / BẠC', 155000, 0, 0, 155000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['MMR thấp, đối thủ vừa sức', 'Thoải mái thử các bài dị meta', 'Bàn giao full thông tin', 'Bảo hành trọn gói uy tín'],
    'https://images.unsplash.com/photo-1552824722-ddab1374e622?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản Smurf chuyên dụng để kéo bạn bè leo lên Vàng, Bạch Kim dễ dàng.'
),
(
    'SMURF-08', 'CLONE', 'Acc Clone Full Tinh Hoa Lam', 'ACC TRẮNG TT 100%', 165000, 0, 0, 165000,
    ARRAY[]::TEXT[], ARRAY[]::TEXT[],
    ARRAY['Sẵn 35.000+ Tinh Hoa Lam', 'Tự do đổi tên nhân vật theo ý thích', 'Tặng kèm 2 biểu cảm độc quyền', 'Bàn giao toàn quyền sở hữu'],
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    'AVAILABLE',
    'Tài khoản dồi dào tài nguyên Tinh Hoa Lam, có thể mua tướng và đổi tên nhân vật tùy ý.'
)
ON CONFLICT (code) DO NOTHING;
