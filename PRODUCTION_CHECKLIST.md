# Quy Trình Phát Hành & Vận Hành Production — ShopTFTMobile (v1.1)

Tài liệu chuẩn hóa quy trình triển khai (release), kiểm tra hậu kiểm (post-deploy smoke test), bảo mật và kế hoạch khôi phục khẩn cấp (rollback plan) cho hệ thống **ShopTFTMobile** (`https://www.shoptftmobile.net`).

---

## 1. PRE-DEPLOY CHECKLIST (Chuẩn bị trước khi phát hành)

- [ ] **Git Working Tree**:
  - Chạy `git status` đảm bảo working tree hoàn toàn sạch sẽ (clean), không còn uncommitted changes.
  - Kiểm tra branch phát hành là `main` (`git branch --show-current`).
- [ ] **Commit Alignment**:
  - So sánh `local HEAD` và GitHub repository `origin/main`.
  - Không rebase ép buộc hoặc dùng `git reset --hard` trên production branch.
- [ ] **Database Backup (Sao lưu cơ sở dữ liệu)**:
  - Truy cập **Supabase Dashboard** > Project `wbeealitshckxjtfozsp` > **Database** > **Backups**.
  - Xác nhận đã có point-in-time snapshot hoặc tải backup schema/data trước khi thực thi migration mới.
  - Không tải raw credentials hay PII data về máy local không an toàn.
- [ ] **Environment Variables Audit (Biến môi trường)**:
  - Xác nhận các biến bắt buộc trên Vercel Project Settings:
    - `NEXT_PUBLIC_SUPABASE_URL` (SET)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (SET)
    - `ADMIN_SESSION_SECRET` (SET - recommended chuỗi ngẫu nhiên 32+ ký tự)
    - `MEMBER_SESSION_SECRET` (SET - recommended chuỗi ngẫu nhiên 32+ ký tự)
    - `ADMIN_PASSWORD` (SET - mật khẩu quản trị production)
    - `GEMINI_API_KEY` / `GROQ_API_KEY` (SET - phục vụ AI Vision Scan & AI Content Refresh)
    - `NEXT_PUBLIC_GA_ID` (SET / OPTIONAL - mã đo lường Google Analytics 4)
  - Đảm bảo **tuyệt đối không** đưa private keys vào prefix `NEXT_PUBLIC_*`.
- [ ] **Pending Migrations Review**:
  - File migration: `supabase/migrations/20261001_performance_indexes.sql`.
  - Kiểm tra tính an toàn: Sử dụng cú pháp `CREATE INDEX IF NOT EXISTS`, không drop hay truncate bất kỳ table/column nào.
- [ ] **Production Build Check**:
  - Chạy local build test: `npm run build`.
  - Phải vượt qua Type check, Linting và Static Generation (68/68 pages) không có lỗi.

---

## 2. DEPLOY PROCEDURE (Quy trình triển khai)

1. **Step 1: Áp dụng Migration vào Supabase**
   - Đăng nhập Supabase SQL Editor.
   - Chạy script `supabase/migrations/20261001_performance_indexes.sql` để tạo chỉ mục tối ưu hóa tốc độ truy vấn.
   - Xác nhận execution status `SUCCESS`.

2. **Step 2: Đẩy mã nguồn lên Production Branch**
   - Push commit đã được kiểm duyệt lên GitHub: `git push origin main`.
   - Vercel Git Integration sẽ tự động nhận webhook và kích hoạt Production Deployment.

3. **Step 3: Theo dõi Vercel Build & Deploy**
   - Mở Vercel Dashboard > Deployments.
   - Đảm bảo build hoàn tất với trạng thái **Ready**.
   - Kiểm tra SHA commit trên Vercel trùng khớp 100% với commit trên GitHub `main`.

4. **Step 4: Domain & SSL Verification**
   - Truy cập `https://www.shoptftmobile.net` — kiểm tra chứng chỉ SSL/TLS hợp lệ (Let's Encrypt / Vercel Edge).
   - Kiểm tra chuyển hướng tên miền apex: `http://shoptftmobile.net` và `https://shoptftmobile.net` tự động chuyển hướng 301 về `https://www.shoptftmobile.net`.
   - Kiểm tra tên miền cũ: `shoptftmobile.com` tự động 301 chuyển tiếp nguyên path sang `www.shoptftmobile.net`.

---

## 3. POST-DEPLOY SMOKE TEST (Kiểm tra vận hành trực tiếp)

Sau khi deploy thành công, thực hiện kiểm thử nhanh theo thứ tự:

### 3.1. Customer Critical Path
- [ ] **Trang chủ (`/`)**:
  - Hero hiển thị sắc nét, thanh tìm kiếm hoạt động tức thì.
  - Section Acc Mới Về tải đúng ảnh đại diện tỉ lệ 1:1.
  - Section Khám phá theo nhu cầu lọc nhanh đúng nhóm.
- [ ] **Kho Acc (`/shop`)**:
  - Bộ lọc: Loại Acc (VIP/Clone), Pet/Chibi, Sân Đấu, Khoảng giá, Sắp xếp.
  - Nhấp vào 1 Acc VIP -> mở trang chi tiết `/acc/[id]`.
- [ ] **Chi tiết Acc (`/acc/[id]`)**:
  - Ảnh gallery hiển thị sắc nét, các gói thuê (1h, 3h, 6h, 12h, 24h) tính giá chính xác.
  - Nút "Thuê ngay qua Zalo" mở đúng link `https://zalo.me/0352867283` kèm lời nhắn tự động chứa mã Acc.
- [ ] **Các trang vệ tinh & hướng dẫn**:
  - Trang hướng dẫn: `/huong-dan` và `/huong-dan/doi-thong-tin-acc-riot`.
  - Trang thương hiệu: `/ve-shop`.
  - Trang SEO Landing: `/thue-acc-tft-dtcl`.
  - Hub Blog Mùa 18: `/blog/tft-mua-18`.

### 3.2. Member & Admin Flow
- [ ] **Member Flow**:
  - Truy cập `/login`, đăng nhập thử nghiệm.
  - Kiểm tra luồng cập nhật thông tin `/profile/complete` và trang tài khoản cá nhân `/profile`.
  - Đăng xuất thành công, xóa cookie phiên `member_session`.
- [ ] **Admin Flow**:
  - Đăng nhập `/admin/login` bằng tài khoản quản trị.
  - Kiểm tra Dashboard, Quản lý tài khoản (Accounts), Quản lý đơn thuê (Rentals).
  - Kiểm tra tab SEO Manager & AI Content Refresh Engine.
  - Thành viên thường và khách vãng lai bị chặn truy cập `/admin/*` và chuyển hướng về `/admin/login`.

### 3.3. SEO & Technical Audit Live
- [ ] Truy cập `https://www.shoptftmobile.net/robots.txt` — xác nhận allow các public route, disallow `/admin`, `/profile`, `/api`.
- [ ] Truy cập `https://www.shoptftmobile.net/sitemap.xml` — xác nhận dynamic sitemap hợp lệ với đầy đủ URL sản phẩm và bài viết blog.
- [ ] Kiểm tra thẻ canonical, title, description, Open Graph tags trên mã nguồn HTML của Trang chủ, Shop và Product Detail.
- [ ] Xác nhận không có thẻ `noindex` trên các trang công khai.

### 3.4. Analytics & Error Monitoring
- [ ] Google Analytics nhận diện sự kiện `page_view`, `search`, `filter_change`, `click_zalo`.
- [ ] Bảng điều khiển Console trên trình duyệt không xuất hiện lỗi JavaScript unhandled rejection hoặc cảnh báo hydration.
- [ ] Không có thông tin nhạy cảm (mật khẩu Riot, cookie, token) xuất hiện trong Network payload hay Console log.

---

## 4. FEATURE DEGRADATION & SAFETY NETS (Cơ chế chịu lỗi)

| Dịch vụ gặp sự cố | Trạng thái hệ thống | Biện pháp tự động |
|---|---|---|
| **AI Provider (Gemini/Groq)** | Hoạt động bình thường | Admin soạn thảo Blog và quét Acc chuyển sang chế độ thủ công, không ảnh hưởng storefront. |
| **Google Analytics (GA4)** | Hoạt động bình thường | Helper an toàn bỏ qua tracking, nút Zalo và luồng thuê tiếp tục phục vụ khách hàng. |
| **Supabase DB lag/timeout** | Cảnh báo nhẹ | Dữ liệu fallback từ file JSON cục bộ (`homepage-config.json`, `accounts-seed`) đảm bảo UI không sập. |
| **Supabase Storage chậm** | Ảnh hiển thị fallback | Next.js Image Optimizer phục vụ ảnh từ cache cục bộ hoặc CDN. |

---

## 5. ROLLBACK PLAN (Kế hoạch khôi phục khẩn cấp)

Trong trường hợp phát hiện sự cố nghiêm trọng trên production:

### Tình huống A: Lỗi mã nguồn (Frontend/API bug)
1. Truy cập **Vercel Dashboard** > Project **shoptft** > **Deployments**.
2. Tìm deployment ổn định trước đó (Instant Rollback).
3. Nhấp vào menu ba chấm `...` > chọn **Instant Rollback**.
4. Vercel điều hướng 100% traffic về deployment cũ trong vòng 2 giây mà không cần rebuild.

### Tình huống B: Lỗi Schema / Migration cơ sở dữ liệu
1. Các index mới trong `20261001_performance_indexes.sql` hoàn toàn độc lập và không thay đổi cấu trúc bảng.
2. Nếu cần xóa index để giải phóng tài nguyên:
   ```sql
   DROP INDEX IF EXISTS idx_accounts_type_status_created_at;
   DROP INDEX IF EXISTS idx_accounts_status_price_asc;
   DROP INDEX IF EXISTS idx_accounts_status_price_desc;
   DROP INDEX IF EXISTS idx_accounts_code;
   DROP INDEX IF EXISTS idx_blog_posts_slug;
   DROP INDEX IF EXISTS idx_blog_posts_published_at;
   ```
3. Nếu xảy ra sự cố hỏng dữ liệu, phục hồi từ Snapshot gần nhất trong Supabase Backups.

### Tình huống C: Lỗi Metadata / Cấu hình SEO
1. Sử dụng tính năng Revert trên Git hoặc chỉnh sửa trực tiếp trong Admin > SEO Manager.
2. Cập nhật và lưu lại, hệ thống sẽ tự động cập nhật cấu hình mà không cần deploy lại toàn bộ ứng dụng.

---

## 6. DEPLOYMENT RECORD (Nhật ký phát hành)

| Thông tin | Giá trị |
|---|---|
| **Ngày phát hành** | 01/10/2026 |
| **Phiên bản (Version)** | **v1.1 (Production Ready)** |
| **Release Commit** | *(Cập nhật theo commit HEAD hiện tại)* |
| **Production Branch** | `main` |
| **Target URL** | `https://www.shoptftmobile.net` |
| **Migrations kèm theo** | `20261001_performance_indexes.sql` (Non-blocking B-Tree indexes) |
| **Nội dung chính** | - Tối ưu toàn diện SEO On-Page, Topic Cluster Blog Mùa 18 & Riot Guide.<br>- Cải thiện Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms).<br>- Tối ưu hóa UI/UX toàn diện trên cả Mobile & Desktop.<br>- Tích hợp AI Content Refresh Engine trong trang Admin.<br>- Chuẩn hóa Domain Canonicalization & 301 Redirects cho tên miền cũ. |
| **Rủi ro đã xác định** | Rủi ro thấp: Toàn bộ thay đổi mã nguồn đã được build static 68/68 pages sạch sẽ; index database an toàn không can thiệp schema dữ liệu có sẵn. |
| **Rollback Target** | Vercel Deployment liền kề trước đó (Commit `9c946cd`). |
| **Người phê duyệt** | Tuấn Thái Bình (ShopTFTMobile) |
