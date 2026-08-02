---
title: Wiki Stemolly
description: Wiki kiến thức về AI tutoring platform (nền tảng gia sư AI) — bắt đầu từ đây.
---

Stemolly là một AI tutoring platform (nền tảng gia sư AI) với tuyên ngôn cốt lõi rằng hệ thống có thể nhìn ra *cách học sinh tư duy* — chứ không chỉ những đáp án các em đưa ra. Tuyên ngôn đó được hiện thực hóa qua một **belief graph** (đồ thị niềm tin) bền vững — ghi lại misconceptions (ngộ nhận), fragility (độ mong manh của hiểu biết) và reasoning patterns (mẫu hình lập luận) — cùng một **pluggable-pedagogy engine** (bộ máy sư phạm có thể hoán đổi), và một sản phẩm gồm hai ứng dụng (Student app + Console) được thiết kế để có thể tái cấu hình khi đội ngũ học thêm được điều mới.

*Được tạo từ các ghi chú tri thức bền vững vào ngày 30 tháng 7 năm 2026 lúc 16:18 UTC.*

## Cách đọc wiki này

Wiki này được tổ chức thành năm phần. Hãy bắt đầu với **Sản phẩm** để hiểu Stemolly là gì và MVP-1 bao gồm những gì khi phát hành. Tiếp theo, chuyển sang **Bộ máy mô hình tư duy** để nắm luận điểm kỹ thuật cốt lõi. **Sư phạm & Phiên học** trình bày cách việc dạy học diễn ra. **Kiến trúc hệ thống** nói về các quyết định cấu trúc chính. **Thực hành kỹ thuật** giải thích codebase (toàn bộ mã nguồn) được xây dựng và được giữ cho đúng đắn như thế nào.

Để xem đầy đủ các chủ đề, hãy xem [Tất cả chủ đề](./all-topics.md).

## Các phần

**[Sản phẩm](./product/index.md)** — Stemolly là gì, USP (điểm khác biệt cốt lõi) của sản phẩm, và phạm vi của MVP-1, bao gồm cả Engine-Validation PoC.

**[Bộ máy mô hình tư duy](./engine/index.md)** — belief graph ba lớp, cách nó được triển khai bằng append-only event sourcing (cơ chế ghi sự kiện chỉ bổ sung), và cách độ chính xác của nó được kiểm chứng.

**[Sư phạm & Phiên học](./pedagogy/index.md)** — tutor (gia sư) dạy như thế nào, lesson brief (bản tóm lược buổi học) là gì, probing (thăm dò) và scaffolding (chống đỡ học tập) vận hành ra sao, và hội thoại được thể hiện cũng như internationalised (quốc tế hóa) như thế nào.

**[Kiến trúc hệ thống](./architecture/index.md)** — topology (cấu trúc tổng thể), module structure (cấu trúc mô-đun), lớp LLM (mô hình ngôn ngữ lớn) và agent (tác tử), auth (xác thực) và security (bảo mật), cùng API contract (hợp đồng API).

**[Thực hành kỹ thuật](./engineering/index.md)** — backend (phần máy chủ) và persistence (lưu trữ bền vững), testing (kiểm thử) và fitness functions (các hàm kiểm chuẩn), observability (khả năng quan sát), cùng resilience (khả năng phục hồi).
