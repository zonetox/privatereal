# Phase 03 — UX Architecture
## Real Estate Decision Intelligence Platform

### 1. Purpose
UX Architecture định nghĩa trải nghiệm người dùng của hệ thống nhằm đảm bảo:
- Người dùng hiểu mục tiêu của hệ thống.
- Khách hàng dễ dàng xây dựng hồ sơ nhu cầu.
- Hệ thống trình bày dự án theo hướng phân tích.
- Hỗ trợ advisor tư vấn và khách hàng ra quyết định.

**Note:** UX không được thiết kế như website listing bất động sản truyền thống. Thay vào đó, UX phải phục vụ **Decision Support Journey**.

### 2. Core UX Principles
- **Profile-first**: Khách hàng phải xây dựng Client Profile trước khi khám phá dự án. Hệ thống không hiển thị toàn bộ dự án ngay từ đầu.
- **Insight-driven**: Hiển thị phân tích, insight và fit score thay vì dữ liệu thô.
- **Decision-oriented**: Mỗi trang phải trả lời được câu hỏi: *"Should this client consider this project?"*
- **Advisor-assisted**: Advisor luôn có mặt trong trải nghiệm; hệ thống không thay thế advisor.

### 3. User Types
- **Client**: Xây dựng hồ sơ, khám phá dự án phù hợp, phân tích dự án, theo dõi quá trình mua.
- **Advisor**: Xem hồ sơ khách hàng, đề xuất dự án, theo dõi tiến trình, ghi chú tư vấn.
- **Admin**: Quản lý dữ liệu dự án, thị trường, pháp lý và chuyên gia (thesis).

### 4. Client Journey
Landing → Account Creation → Profile Builder → Recommended Projects → Project Analysis → Advisor Discussion → Decision Workspace → Purchase Timeline

### 5. Client Dashboard
Sau khi đăng nhập, client sẽ thấy:
- **Your Profile**: Tóm tắt hồ sơ hiện tại.
- **Recommended Projects**: Các dự án phù hợp nhất.
- **Explore Projects**: Khám phá thêm dựa trên bộ lọc advisor.
- **Decision Workspace**: Khu vực so sánh và phân tích sâu.
- **Purchase Timeline**: Theo dõi tiến độ các giao dịch đang thực hiện.

### 6. Profile Builder UX
Profile Builder sử dụng **Guided Onboarding** (không phải form dài).
1. **Financial Capacity**: Budget range, monthly income, loan capacity.
2. **Purpose of Purchase**: Living, investment, rental, asset preservation.
3. **Risk Tolerance**: Low, medium, high.
4. **Lifestyle**: Family, single, expat, retirement.
5. **Priority Weighting**: Sử dụng **Slider Interface** cho transport, schools, environment, growth, rental demand.

### 7. Profile Summary Screen
Hiển thị **Client Investment Profile**: budget range, risk level, investment horizon, priority map.

### 8. Project Discovery UX
Hiển thị **Recommended Projects** thay vì danh sách đầy đủ.
- **Project Card Structure**: Project Name, Fit Score, Price Range, Key Advantage (e.g., "Strong infrastructure growth"), Risk Indicator (e.g., "High supply nearby").

### 9. Project Page UX
Thiết kế theo hướng **Analysis-first**:
1. Project Fit Score & Breakdown (Financial, Lifestyle, Investment, Risk, Location).
2. **Why This Matches You**: Giải thích lý do dựa trên priority.
3. **Key Strengths**: Điểm mạnh dự án (Developer, Connectivity, Price).
4. **Potential Risks**: Hiển thị minh bạch rủi ro (Supply, Timeline) để tăng độ tin cậy.
5. **Investment Analysis**: So sánh khu vực, rental yield, historical growth.
6. **Payment Structure**: Lộ trình thanh toán.
7. **Project Comparison**: So sánh tối đa 3 dự án.

### 10. Decision Workspace
Nơi phân tích cuối cùng:
- Selected projects.
- Advisor notes & Financial analysis.
- **Decision Checklist**: Site visit, Legal review, Loan approval, Contract review.

### 11. Purchase Timeline
Theo dõi tiến trình sau quyết định:
- **Stages**: Reservation, Deposit, SPA Signing, Payment Milestones.
- **Payment Tracking**: Stage, Amount, Due Date, Status.

### 12. Advisor & Admin Interfaces
- **Advisor Dashboard**: Client profiles, matching results, decision stages, follow-up tasks.
- **Advisor Client Page**: Profile detail, interests, decision notes.
- **Admin Interface**: Quản lý dự án, pháp lý, thị trường và advisor thesis.

### 13. Navigation Structure
- **Client**: Dashboard, Projects, Workspace, Timeline, Advisor, Profile.

### 14. Mobile UX
Tối ưu cho project cards, fit scores, decision workspace, timeline và liên hệ advisor.

### 15. UX Patterns to Avoid
- **KHÔNG** thiết kế như marketplace, listing website hay brochure online.
- Hệ thống phải giữ đúng mục tiêu: **Decision Intelligence Platform**.
