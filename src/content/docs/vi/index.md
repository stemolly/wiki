---
title: Wiki Stemolly
description: Wiki kiến thức về nền tảng gia sư AI — bắt đầu từ đây.
---

Stemolly là một AI tutoring platform (nền tảng gia sư AI) với lời hứa cốt lõi rằng hệ thống có thể nhìn ra *cách học sinh suy nghĩ* — chứ không chỉ nhìn vào đáp án các em đưa ra. Lời hứa đó được hiện thực hóa bằng một **belief graph** (đồ thị niềm tin) bền vững, theo dõi misconceptions (ngộ nhận), fragility (độ mong manh của hiểu biết) và reasoning patterns (mẫu hình lập luận); một pluggable-pedagogy engine (bộ máy sư phạm có thể hoán đổi); cùng một sản phẩm gồm hai ứng dụng (Student app + Console), được thiết kế để có thể thay đổi linh hoạt khi đội ngũ học hỏi thêm.

*Được tạo từ các ghi chú tri thức bền vững vào ngày 14 tháng 8 năm 2026 lúc 14:52 UTC.*

## Cách đọc wiki này

Wiki được chia thành năm phần. Hãy bắt đầu với **Sản phẩm** để hiểu Stemolly là gì và MVP-1 bao gồm những gì. Tiếp theo, chuyển sang **Bộ máy mô hình tư duy** để nắm luận điểm kỹ thuật cốt lõi. **Sư phạm & Phiên học** nói về cách việc dạy học diễn ra. **Kiến trúc hệ thống** giải thích các quyết định cấu trúc quan trọng. **Thực hành kỹ thuật** trình bày cách codebase (toàn bộ mã nguồn) được xây dựng và giữ cho luôn đúng đắn.

Để xem đầy đủ các chủ đề, hãy đọc [Tất cả chủ đề](./all-topics.md).

## Các phần

**[Sản phẩm](./product/index.md)** — Stemolly là gì, USP (điểm khác biệt cốt lõi) của sản phẩm, và phạm vi của MVP-1, bao gồm cả Engine-Validation PoC.

**[Bộ máy mô hình tư duy](./engine/index.md)** — belief graph ba lớp, cách nó được hiện thực bằng append-only event sourcing (mô hình sự kiện chỉ cho phép thêm), và cách kiểm chứng độ chính xác của nó.

**[Sư phạm & Phiên học](./pedagogy/index.md)** — tutor (gia sư AI) dạy như thế nào, lesson brief (bản tóm lược buổi học) là gì, probing (thăm dò) và scaffolding (chống đỡ học tập) vận hành ra sao, và cách hội thoại được hiển thị cũng như internationalised (quốc tế hóa).

**[Kiến trúc hệ thống](./architecture/index.md)** — topology (cấu trúc tổng thể), module structure (cấu trúc mô-đun), tầng LLM (mô hình ngôn ngữ lớn) và agent (tác tử), auth (xác thực) và security (bảo mật), cùng API contract (hợp đồng API).

**[Thực hành kỹ thuật](./engineering/index.md)** — backend (phần máy chủ) và persistence (lưu trữ bền vững), testing (kiểm thử) và fitness functions (hàm kiểm chuẩn), observability (khả năng quan sát), cùng resilience (khả năng phục hồi).
