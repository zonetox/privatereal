# Phase 02 — Data Architecture
## Real Estate Decision Intelligence Platform

### 1. Purpose
Data Architecture định nghĩa cấu trúc dữ liệu cốt lõi của hệ thống nhằm đảm bảo:
- Dữ liệu được chuẩn hóa.
- Tránh trùng lặp dữ liệu.
- Dễ mở rộng khi số lượng dự án và khách hàng tăng.
- Hỗ trợ Matching Engine.
- Hỗ trợ phân tích và audit.

Kiến trúc dữ liệu phải đảm bảo hệ thống có thể hoạt động với:
- Nhiều advisor.
- Nhiều khách hàng.
- Nhiều dự án.
- Nhiều vòng đời mua khác nhau.

### 2. Core Data Principles
Toàn bộ hệ thống phải tuân theo các nguyên tắc dữ liệu sau:

**Normalized Data Structure**
Dữ liệu phải được chuẩn hóa để tránh duplication. 
Ví dụ:
- Thông tin dự án không được lưu trong client table.
- Thông tin client không được lưu trong project table.

**Domain Separation**
Database được chia theo domain logic. Mỗi domain quản lý một nhóm dữ liệu riêng.

**Project Schema Consistency**
Tất cả dự án phải tuân theo một schema thống nhất. 
 Không cho phép:
- Dự án A có cấu trúc khác dự án B.
- Thêm field tùy ý theo từng dự án.

**Matching-ready Data**
Dữ liệu phải được thiết kế để hỗ trợ Project Fit Scoring.
Điều này có nghĩa:
- Dữ liệu phải có dạng số hoặc enum.
- Tránh text không chuẩn hóa.

### 3. Database Domains
Hệ thống được chia thành 5 domain dữ liệu chính:
1. User Domain
2. Client Intelligence Domain
3. Project Intelligence Domain
4. Decision Domain
5. Lifecycle Domain

### 4. User Domain
Domain này quản lý tài khoản hệ thống và phân quyền người dùng.

**Tables:** `users`, `roles`, `user_roles`, `advisor_profiles`

- **users**: Lưu thông tin đăng nhập.
  - Fields: `id`, `email`, `password_hash`, `status`, `created_at`, `last_login`
- **roles**: Các loại vai trò người dùng (ví dụ: client, advisor, admin).
  - Fields: `id`, `name`
- **user_roles**: Liên kết user với role.
  - Fields: `user_id`, `role_id`
- **advisor_profiles**: Thông tin chi tiết của advisor.
  - Fields: `id`, `user_id`, `full_name`, `phone`, `company`, `bio`, `created_at`

### 5. Client Intelligence Domain
Domain này lưu trữ hồ sơ nhu cầu và hồ sơ đầu tư của khách hàng. Đây là nền tảng để Matching Engine hoạt động.

**Tables:** `client_profiles`, `client_financials`, `client_goals`, `client_risk_profiles`, `client_priorities`, `client_lifestyle`

- **client_profiles**: Table trung tâm của hồ sơ khách hàng.
  - Fields: `id`, `user_id`, `advisor_id`, `profile_status`, `created_at`, `updated_at`
  - *profile_status*: incomplete, complete, archived
- **client_financials**: Thông tin tài chính cơ bản.
  - Fields: `id`, `client_profile_id`, `monthly_income`, `total_assets`, `loan_capacity`, `budget_min`, `budget_max`
- **client_goals**: Mục tiêu mua bất động sản.
  - Fields: `id`, `client_profile_id`, `primary_goal`
  - *primary_goal values*: living, investment, rental, asset_preservation
- **client_risk_profiles**: Khẩu vị rủi ro của khách hàng.
  - Fields: `id`, `client_profile_id`, `risk_level`
  - *risk_level values*: low, medium, high
- **client_priorities**: Trọng số ưu tiên của khách hàng (thường nằm trong khoảng 1-10).
  - Fields: `id`, `client_profile_id`, `factor`, `weight`
  - *factor examples*: transport, schools, environment, infrastructure_growth, rental_demand
- **client_lifestyle**: Loại lifestyle của khách hàng.
  - Fields: `id`, `client_profile_id`, `lifestyle_type`
  - *lifestyle_type values*: family, single, expat, retirement

### 6. Project Intelligence Domain
Domain này chuẩn hóa toàn bộ dữ liệu dự án. Đây là domain quan trọng nhất trong hệ thống.

**Tables:** `projects`, `project_locations`, `project_legal`, `project_products`, `project_market`, `project_risks`, `project_thesis`, `project_scores`

- **projects**: Thông tin tổng quan của dự án.
  - Fields: `id`, `name`, `developer`, `city`, `district`, `status`
  - *status values*: planning, launching, under_construction, completed
- **project_locations**: Dữ liệu vị trí và hạ tầng.
  - Fields: `id`, `project_id`, `latitude`, `longitude`, `distance_cbd_km`, `metro_distance_km`, `highway_distance_km`, `infrastructure_score`
- **project_legal**: Thông tin pháp lý.
  - Fields: `id`, `project_id`, `planning_1_500`, `construction_permit`, `bank_guarantee`, `ownership_type`, `legal_score`
- **project_products**: Thông tin sản phẩm trong dự án.
  - Fields: `id`, `project_id`, `product_type`, `min_size`, `max_size`, `min_price`, `max_price`, `handover_standard`
  - *product_type examples*: apartment, villa, townhouse
- **project_market**: Dữ liệu thị trường.
  - Fields: `id`, `project_id`, `avg_price_area`, `price_growth_3y`, `rental_yield`, `liquidity_score`
- **project_risks**: Các loại rủi ro.
  - Fields: `id`, `project_id`, `legal_risk`, `construction_risk`, `supply_risk`, `market_risk`
- **project_thesis**: Phân tích chuyên gia cho dự án.
  - Fields: `id`, `project_id`, `summary`, `growth_drivers`, `key_risks`, `advisor_notes`
- **project_scores**: Các điểm số định tính của dự án phục vụ matching.
  - Fields: `id`, `project_id`, `lifestyle_score`, `investment_score`, `risk_score`, `location_score`

### 7. Decision Domain
Domain này theo dõi mối quan tâm và phân tích của khách hàng đối với dự án.

**Tables:** `client_project_interests`, `decision_notes`, `project_comparisons`, `matching_results`

- **client_project_interests**: Theo dõi mức độ quan tâm của khách hàng với dự án.
  - Fields: `id`, `client_profile_id`, `project_id`, `interest_level` (low, medium, high)
- **decision_notes**: Ghi chú của advisor.
  - Fields: `id`, `client_profile_id`, `project_id`, `advisor_id`, `note`, `created_at`
- **project_comparisons**: So sánh dự án.
  - Fields: `id`, `client_profile_id`, `project_a`, `project_b`, `project_c`, `created_at`
- **matching_results**: Kết quả tính toán Fit Score.
  - Fields: `id`, `client_profile_id`, `project_id`, `financial_fit`, `lifestyle_fit`, `investment_fit`, `risk_fit`, `location_fit`, `final_score`, `calculated_at`

### 8. Lifecycle Domain
Domain này theo dõi tiến trình mua của khách hàng.

**Tables:** `lifecycle_stages`, `client_project_lifecycle`, `payment_schedule`, `payment_tracking`

- **lifecycle_stages**: Danh sách các giai đoạn.
  - Fields: `id`, `name` (examples: exploring, site_visit, reservation, deposit, spa_signing, payment)
- **client_project_lifecycle**: Theo dõi trạng thái của khách hàng.
  - Fields: `id`, `client_profile_id`, `project_id`, `stage_id`, `updated_at`
- **payment_schedule**: Kế hoạch thanh toán chuẩn của dự án.
  - Fields: `id`, `project_id`, `stage_name`, `percentage`, `due_time`
- **payment_tracking**: Theo dõi thanh toán của khách hàng.
  - Fields: `id`, `client_profile_id`, `project_id`, `stage_name`, `amount`, `due_date`, `status`

### 9. Data Flow Overview
Luồng dữ liệu trong hệ thống:
1. Client creates profile
2. Client data stored in Client Intelligence tables
3. System loads Project Intelligence data
4. Matching Engine calculates fit scores
5. Results stored in matching_results
6. Client explores projects in Decision Workspace
7. Lifecycle tables track purchase progress

### 10. Responsibilities of Data Layer
Data Layer chịu trách nhiệm:
- Lưu trữ dữ liệu.
- Đảm bảo tính nhất quán.
- Cung cấp dữ liệu cho service layer.
- Hỗ trợ audit và analytics.

Data Layer không chứa logic business phức tạp. Logic sẽ nằm trong Service Layer.
