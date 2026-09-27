---
title: Wiki Stemolly
description: Wiki kiến thức về nền tảng gia sư AI — bắt đầu từ đây.
---

Stemolly là một nền tảng gia sư AI với tuyên bố cốt lõi rằng hệ thống có thể nhìn thấy *cách một học sinh tư duy* — chứ không chỉ các đáp án mà em đó đưa ra. Tuyên bố ấy được hiện thực hóa bằng một **belief graph** (đồ thị niềm tin) bền vững, ghi nhận các hiểu lầm, mức độ mong manh trong nhận thức và các kiểu mẫu lập luận; một **pluggable-pedagogy engine** (công cụ sư phạm có thể cắm ghép); cùng một sản phẩm gồm hai ứng dụng (Student app + Console) được thiết kế để có thể tái cấu trúc khi đội ngũ rút ra thêm bài học.

*Được tạo từ các ghi chú tri thức lâu bền vào ngày 25 tháng 8 năm 2026, lúc 13:27 UTC.*

## Cách đọc wiki này

Wiki được tổ chức thành năm phần. Hãy bắt đầu với **Product** (Sản phẩm) để hiểu Stemolly là gì và MVP-1 sẽ phát hành những gì. Sau đó chuyển sang **Mental Model Engine** (Công cụ mô hình tư duy) để nắm luận điểm kỹ thuật cốt lõi. **Pedagogy & Sessions** (Sư phạm & các phiên học) giải thích cách việc dạy học diễn ra. **System Architecture** (Kiến trúc hệ thống) trình bày các quyết định cấu trúc chính. **Engineering Practices** (Thực hành kỹ thuật) mô tả cách codebase (toàn bộ mã nguồn) được xây dựng và duy trì tính đúng đắn.

Để xem đầy đủ các chủ đề, hãy xem [Tất cả chủ đề](./all-topics.md).

## Các phần

**[Product](./product/index.md)** — Stemolly là gì, USP (điểm khác biệt cốt lõi) của nó, và phạm vi của MVP-1, bao gồm cả Engine-Validation PoC.

**[Mental Model Engine](./engine/index.md)** — belief graph ba lớp, cách nó được triển khai bằng append-only event sourcing (mô hình sự kiện chỉ cho phép thêm), và cách độ chính xác của nó được kiểm chứng.

**[Pedagogy & Sessions](./pedagogy/index.md)** — Gia sư dạy như thế nào, lesson brief (bản tóm lược buổi học) là gì, probing (thăm dò) và scaffolding (chống đỡ học tập) vận hành ra sao, và cách hội thoại được trình bày cũng như quốc tế hóa.

**[System Architecture](./architecture/index.md)** — Topology (cấu trúc tổng thể), cấu trúc module (mô-đun), lớp LLM (mô hình ngôn ngữ lớn) và agent (tác tử), auth (xác thực) và security (bảo mật), cùng API contract (hợp đồng API).

**[Engineering Practices](./engineering/index.md)** — Backend (phần máy chủ) và persistence (lưu trữ bền vững), testing (kiểm thử) và fitness functions (hàm kiểm chuẩn), observability (khả năng quan sát), cùng resilience (khả năng phục hồi).
