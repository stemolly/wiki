---
title: Sản phẩm
description: Stemolly là gì, USP (điểm khác biệt cốt lõi) của sản phẩm là gì, và MVP-1 cung cấp những gì, bao gồm cả Engine-Validation PoC (mô hình thử nghiệm kiểm chứng engine).
---

Phần này trình bày Stemolly là gì, vì sao sản phẩm được thiết kế theo hướng hiện tại, và MVP-1 mang lại những gì.

## Chủ đề

**[Tổng quan về Stemolly](./overview.md)** — Bản sắc của sản phẩm, USP cốt lõi, belief-graph knowledge model (mô hình tri thức dạng đồ thị niềm tin) so với topic completion (cách hoàn thành theo chủ đề), cấu trúc hai ứng dụng (Student app + Console), và pluggable-pedagogy architecture (kiến trúc sư phạm có thể hoán đổi) định hình nên nền tảng này.

**[Phạm vi MVP & PoC](./mvp-poc/)** — Những gì được phát hành trong MVP-1 (Lesson mode, Math K11 deep, Language IELTS thin), cùng Engine-Validation PoC: Claude đóng vai Guide và Analyst trên một append-only MCP (MCP chỉ cho phép ghi nối tiếp) được xây trên engine schema (lược đồ engine) thực tế, triển khai phía sau một TLS edge (lớp biên TLS) trên VPS (máy chủ riêng ảo). Các Claude skills được lặp lại và tinh chỉnh liên tục qua các phiên làm việc thực tế; engine đang dần tích lũy những application-layer concerns (vấn đề ở tầng ứng dụng) cần theo dõi. Nội dung được tách thành phạm vi sản phẩm, thiết kế/ranh giới của PoC, và cách chạy/triển khai PoC.
