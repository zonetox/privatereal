# Phase 05 — Lifecycle Management
## Real Estate Decision Intelligence Platform

### 1. Purpose
Lifecycle Management chịu trách nhiệm theo dõi toàn bộ hành trình mua bất động sản của khách hàng sau khi họ bắt đầu quan tâm nghiêm túc đến một dự án. Module này giúp:
- Khách hàng hiểu rõ tiến trình mua.
- Advisor theo dõi tiến trình khách hàng.
- Đảm bảo các bước quan trọng không bị bỏ sót.
- Quản lý timeline thanh toán.

**Note:** Hệ thống chỉ đóng vai trò theo dõi và quản lý tiến trình, không thực hiện giao dịch hoặc thanh toán.

### 2. Lifecycle Concept
Mỗi khách hàng khi quyết định theo đuổi một dự án sẽ có một **Project Lifecycle**. Một khách hàng có thể có nhiều lifecycle song song nếu họ đang cân nhắc hoặc mua nhiều dự án cùng lúc.

### 3. Lifecycle Stages
Hệ thống định nghĩa các giai đoạn chuẩn (có thể tùy chỉnh theo dự án):
1. **exploring**: Nghiên cứu dự án, so sánh, trao đổi với advisor.
2. **site_visit**: Tham quan dự án, lưu trữ ghi chú ấn tượng của khách hàng.
3. **reservation**: Giữ chỗ sản phẩm cụ thể.
4. **deposit**: Đã đặt cọc, theo dõi điều kiện hoàn cọc.
5. **spa_signing**: Ký hợp đồng mua bán (Sale and Purchase Agreement).
6. **payment**: Đang thực hiện các đợt thanh toán theo tiến độ.

### 4. Lifecycle Tracking Model
Dữ liệu được lưu trữ chính trong table `client_project_lifecycle`.
- **Fields**: `client_profile_id`, `project_id`, `stage_id`, `updated_at`.

### 5. Decision Checklist
MỗI lifecycle có một checklist hỗ trợ quyết định để tránh bỏ sót các bước quan trọng:
- Site visit completed.
- Legal review completed.
- Loan pre-approval.
- Contract review.

### 6. Payment Schedule & Tracking
- **Payment Schedule**: Mô tả kế hoạch thanh toán chuẩn của dự án (Reservation, Deposit, SPA, Construction Milestones, Handover). Lưu trong `payment_schedule`.
- **Payment Tracking**: Theo dõi trạng thái thanh toán riêng biệt của từng khách hàng (Pending, Completed, Overdue). Lưu trong `payment_tracking`.

### 7. Advisor & UX Integration
- **Advisor Interaction**: Cập nhật giai đoạn (stage), thêm ghi chú, theo dõi các khách hàng sắp ký hợp đồng hoặc cần follow-up.
- **Client UX**: Hiển thị **Purchase Timeline** trực quan, giúp khách hàng biết mình đang ở đâu và bước tiếp theo là gì.
- **Notifications**: Cảnh báo đợt thanh toán sắp tới cho Client và thông báo thay đổi trạng thái cho Advisor.

### 8. Responsibilities
- Quản lý tiến trình mua.
- Theo dõi payment milestones.
- Hỗ trợ advisor quản lý danh mục khách hàng.
- **KHÔNG** xử lý giao dịch tài chính hay ký hợp đồng điện tử.
