---
title: Wiki Stemolly
description: Wiki kiến thức về AI tutoring platform (nền tảng gia sư AI) — bắt đầu từ đây.
---

Stemolly là một AI tutoring platform với tuyên bố cốt lõi rằng nền tảng này có thể nhìn thấy *cách học sinh suy nghĩ* — chứ không chỉ những đáp án các em đưa ra. Tuyên bố đó được hiện thực hóa bằng một **belief graph** (đồ thị niềm tin) bền vững, ghi lại misconceptions (ngộ nhận), fragility (độ mong manh trong hiểu biết) và reasoning patterns (mẫu hình lập luận); một pluggable-pedagogy engine (bộ máy sư phạm có thể hoán đổi); cùng một sản phẩm gồm hai ứng dụng (Student app + Console) được thiết kế để có thể tái cấu hình khi đội ngũ tiếp tục học hỏi.

*Được tạo từ các ghi chú tri thức bền vững vào ngày 6 tháng 8 năm 2026 lúc 13:52 UTC.*

## Cách đọc wiki này

Wiki này được tổ chức thành năm phần. Hãy bắt đầu với **Sản phẩm** để hiểu Stemolly là gì và MVP-1 phát hành những gì. Sau đó, chuyển sang **Bộ máy mô hình tư duy** để nắm luận điểm kỹ thuật cốt lõi. **Sư phạm & Phiên học** giải thích việc dạy học diễn ra như thế nào. **Kiến trúc hệ thống** trình bày các quyết định cấu trúc quan trọng. **Thực hành kỹ thuật** nói về cách codebase (toàn bộ mã nguồn) được xây dựng và duy trì độ đúng đắn.

Để xem đầy đủ các chủ đề, hãy xem [Tất cả chủ đề](./all-topics.md).

## Các phần

**[Sản phẩm](./product/index.md)** — Stemolly là gì, USP (điểm khác biệt cốt lõi) của sản phẩm, và phạm vi của MVP-1, bao gồm cả Engine-Validation PoC.

**[Bộ máy mô hình tư duy](./engine/index.md)** — belief graph ba lớp, cách nó được hiện thực bằng append-only event sourcing (mô hình ghi nhận sự kiện chỉ thêm vào), và cách kiểm chứng độ chính xác của nó.

**[Sư phạm & Phiên học](./pedagogy/index.md)** — cách tutor (gia sư AI) giảng dạy, lesson brief (bản tóm lược buổi học) là gì, probing (thăm dò) và scaffolding (chống đỡ học tập) hoạt động ra sao, và cách hội thoại được trình bày cũng như internationalised (quốc tế hóa).

**[Kiến trúc hệ thống](./architecture/index.md)** — topology (cấu trúc tổng thể), module structure (cấu trúc mô-đun), lớp LLM (mô hình ngôn ngữ lớn) và agent (tác tử), auth (xác thực) và security (bảo mật), cùng API contract (hợp đồng API).

**[Thực hành kỹ thuật](./engineering/index.md)** — backend (phần máy chủ) và persistence (lưu trữ bền vững), testing (kiểm thử) và fitness functions (hàm kiểm chuẩn), observability (khả năng quan sát), cùng resilience (khả năng phục hồi).
