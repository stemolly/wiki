---
title: Sản phẩm
description: Stemolly là gì, USP (điểm khác biệt cốt lõi) của nó là gì, và MVP-1 cung cấp những gì, bao gồm cả Engine-Validation PoC (PoC kiểm chứng engine).
---

Phần này giới thiệu Stemolly là gì, vì sao sản phẩm được xây dựng theo hướng này, và MVP-1 mang đến những gì.

## Chủ đề

**[Tổng quan về Stemolly](./overview.md)** — Bản sắc của sản phẩm, USP cốt lõi, belief-graph knowledge model (mô hình tri thức dạng đồ thị niềm tin) so với topic completion (cách học theo hoàn tất từng chủ đề), cấu trúc hai ứng dụng (Student app (ứng dụng dành cho học sinh) + Console (bảng điều khiển)), và pluggable-pedagogy architecture (kiến trúc sư phạm có thể hoán đổi) định hình nền tảng này.

**[Phạm vi MVP & PoC](./mvp-poc.md)** — Những gì được phát hành trong MVP-1 (Lesson mode (chế độ bài học), Math K11 deep (độ phủ sâu cho Toán lớp 11), Language IELTS thin (độ phủ mỏng cho mảng Ngôn ngữ IELTS)), cùng Engine-Validation PoC đi trước phần UI của ứng dụng: Claude đóng vai Guide và Analyst (hướng dẫn và phân tích) trên một append-only MCP (MCP chỉ cho phép bổ sung nối tiếp) được xây trên engine schema (lược đồ engine) thực tế. Remote của PoC (`stemolly/engine-poc`) được tạo ở buổi review Sprint 10; triển khai lên VPS là cột mốc của Sprint 11.
