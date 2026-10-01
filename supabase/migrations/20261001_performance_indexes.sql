-- ============================================================
-- PERFORMANCE & CORE WEB VITALS DATABASE INDEXES
-- Hệ thống ShopTFTMobile (Shop TFT Tuấn Thái Bình)
-- ============================================================

-- 1. Index tăng tốc bộ lọc Shop / Homepage theo type, status và sắp xếp mới nhất
CREATE INDEX IF NOT EXISTS idx_accounts_type_status_created_at
  ON accounts (type, status, created_at DESC);

-- 2. Index tăng tốc bộ lọc giá và sắp xếp theo giá
CREATE INDEX IF NOT EXISTS idx_accounts_status_price_asc
  ON accounts (status, price ASC);

CREATE INDEX IF NOT EXISTS idx_accounts_status_price_desc
  ON accounts (status, price DESC);

-- 3. Index tăng tốc tìm kiếm chính xác mã tài khoản (trang chi tiết /acc/[id])
CREATE INDEX IF NOT EXISTS idx_accounts_code
  ON accounts (code);

-- 4. Index tăng tốc truy vấn bài viết blog theo slug và trạng thái publish
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts (slug);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
  ON blog_posts (published, created_at DESC);
