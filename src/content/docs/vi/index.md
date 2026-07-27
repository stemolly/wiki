---
title: Wiki Stemolly
description: Wiki kiến thức về nền tảng gia sư AI Stemolly — bắt đầu từ đây.
---

Stemolly là một nền tảng gia sư AI với tuyên bố cốt lõi rằng hệ thống có thể nhìn thấy *cách một học sinh tư duy* — không chỉ những đáp án các em đưa ra. Tuyên bố đó được hiện thực hóa bằng một **belief graph** (đồ thị niềm tin) bền vững — nơi lưu misconceptions (ngộ nhận), fragility (độ vững của hiểu biết), và reasoning patterns (mẫu hình lập luận) — cùng một **pluggable-pedagogy engine** (bộ máy sư phạm có thể hoán đổi), và một sản phẩm gồm hai ứng dụng (Student app + Console) được thiết kế để có thể tái cấu hình khi cả đội học được thêm điều mới.

*Được tạo từ các ghi chú tri thức bền vững vào ngày 26 tháng 7 năm 2026 lúc 05:17 UTC.*

## Cách đọc wiki này

Wiki được tổ chức thành năm phần. Hãy bắt đầu với **Sản phẩm** để hiểu Stemolly là gì và MVP-1 phát hành những gì. Sau đó chuyển sang **Bộ máy mô hình tư duy** để nắm luận điểm kỹ thuật cốt lõi. **Phương pháp sư phạm & Phiên học** giải thích cách việc dạy học diễn ra. **Kiến trúc hệ thống** trình bày các quyết định cấu trúc quan trọng. **Thực hành kỹ thuật** nói về cách codebase (toàn bộ mã nguồn) được xây dựng và duy trì tính đúng đắn.

Để xem đầy đủ các chủ đề, hãy xem [Tất cả chủ đề](./all-topics.md).

## Các phần

**[Sản phẩm](./product/index.md)** — Stemolly là gì, USP (điểm khác biệt cốt lõi) của sản phẩm, và phạm vi của MVP-1, bao gồm cả Engine-Validation PoC.

**[Bộ máy mô hình tư duy](./engine/index.md)** — belief graph ba lớp, cách nó được triển khai bằng event sourcing (ghi nhận theo chuỗi sự kiện) chỉ thêm vào, và cách độ chính xác của nó được kiểm chứng.

**[Phương pháp sư phạm & Phiên học](./pedagogy/index.md)** — gia sư dạy như thế nào, lesson brief (bản tóm lược bài học) là gì, probing (thăm dò) và scaffolding (chống đỡ học tập) vận hành ra sao, và cách hội thoại được hiển thị cũng như quốc tế hóa.

**[Kiến trúc hệ thống](./architecture/index.md)** — topology (cấu trúc liên kết tổng thể), cấu trúc module, lớp LLM (mô hình ngôn ngữ lớn) và agent, auth (xác thực) và security (bảo mật), cùng API contract (hợp đồng API).

**[Thực hành kỹ thuật](./engineering/index.md)** — backend (phần mềm phía máy chủ) và persistence (lưu trữ bền vững), kiểm thử và fitness functions (các phép kiểm chuẩn), observability (khả năng quan sát), cùng resilience (khả năng phục hồi).
