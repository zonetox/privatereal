# Phase 04 — Matching Engine Design
## Real Estate Decision Intelligence Platform

### 1. Purpose
Matching Engine là thành phần chịu trách nhiệm tính toán độ phù hợp giữa hồ sơ khách hàng và dự án bất động sản. Kết quả là **Project Fit Score**, hỗ trợ:
- Gợi ý dự án phù hợp.
- Advisor tư vấn và khách hàng so sánh dự án.
- Hoạt động của Decision Workspace.

**Note:** Engine không quyết định thay khách hàng mà cung cấp phân tích định lượng hỗ trợ quyết định.

### 2. Design Principles
- **Deterministic Scoring**: Rõ ràng, giải thích được, không sử dụng "black box".
- **Multi-Dimensional Matching**: Tính toán từ nhiều khía cạnh khác nhau.
- **Normalized Scoring**: Chuẩn hóa về cùng thang điểm (0-100) để đảm bảo tính so sánh.
- **Extensible Design**: Cho phép thêm dimension mới trong tương lai.

### 3. Matching Dimensions (0 → 100)
1. **financial_match**: Ngân sách khách hàng vs. Giá dự án.
2. **lifestyle_match**: Lifestyle khách hàng vs. Đặc điểm dự án.
3. **investment_match**: Mục tiêu đầu tư (ROI, Rental yield, Liquidity).
4. **risk_match**: Khẩu vị rủi ro vs. Rủi ro dự án (Legal, Construction, Market).
5. **location_match**: Vị trí dự án vs. Trọng số ưu tiên (Infrastructure, transport, CBD distance).

### 4. Final Fit Score Calculation
Tính bằng trung bình có trọng số (Weighted Average):
`final_score = 0.25*financial + 0.20*lifestyle + 0.25*investment + 0.15*risk + 0.15*location`
*(Trọng số có thể cấu hình lại trong hệ thống)*

### 5. Logic chi tiết theo Dimension
- **Financial Match**: 100 điểm nếu nằm trong budget; giảm dần theo tỷ lệ nếu vượt budget.
- **Lifestyle Match**: Dựa trên **Lifestyle Compatibility Matrix** (ví dụ: Family nhu cầu trường học/công viên).
- **Investment Match**: Nếu mục tiêu là đầu tư, ưu tiên tăng trưởng giá và thanh khoản. Nếu là để ở, ưu tiên tiện ích và hạ tầng.
- **Risk Match**: Khẩu vị rủi ro thấp + dự án rủi ro cao = trừ điểm mạnh. Khẩu vị cao = trừ điểm ít hơn.
- **Location Match**: Tính dựa trên trọng số ưu tiên địa lý (transport_weight * transport_score + ...).

### 6. Pipeline Hoạt động
Load Client Profile → Load Project Data → Calculate Dimension Scores → Normalize → Calculate Final Fit Score → Store in `matching_results`.

### 7. Result Storage & Presentation
- Lưu trữ tại table `matching_results` với đầy đủ breakdown từng dimension.
- Hiển thị kết quả trong **Recommended Projects** (sắp xếp theo score giảm dần).
- Cung cấp **Score Explanation** minh bạch cho Client nắm bắt.

### 8. Quy tắc tính toán lại (Recalculation)
Score được tính lại khi:
- Hồ sơ Client thay đổi.
- Dữ liệu dự án được cập nhật.
- Dữ liệu thị trường biến động.

### 9. Hiệu suất & Mở rộng
- Hỗ trợ xử lý hàng loạt (batch calculation) và caching kết quả.
- Khả năng mở rộng thêm dimension: Uy tín chủ đầu tư, tiến độ hạ tầng, xu hướng dân khẩu học.
