---
title: Sản phẩm
description: Stemolly là gì, USP (điểm khác biệt cốt lõi) của nó là gì, và MVP-1 cung cấp những gì, bao gồm cả Engine-Validation PoC (mô hình thử nghiệm kiểm chứng engine).
---

Phần này giới thiệu Stemolly là gì, vì sao sản phẩm được xây dựng theo cách hiện tại, và MVP-1 mang đến những gì.

## Chủ đề

**[Tổng quan về Stemolly](./overview.md)** — Bản sắc của sản phẩm, USP cốt lõi, belief-graph knowledge model (mô hình tri thức dạng đồ thị niềm tin) so với topic completion (hoàn tất theo chủ đề), cấu trúc hai ứng dụng (Student app + Console), và pluggable-pedagogy architecture (kiến trúc sư phạm có thể hoán đổi) định hình nên nền tảng này.

**[Phạm vi MVP & PoC](./mvp-poc/)** — Những gì được phát hành trong MVP-1 (Lesson mode, Math K11 deep, Language IELTS thin), và Engine-Validation PoC: Claude đóng vai Guide (người hướng dẫn) và Analyst (nhà phân tích) trên một append-only MCP (MCP chỉ cho phép thêm dữ liệu) được xây trên engine schema (lược đồ engine) thực tế, triển khai trên VPS (máy chủ riêng ảo). Ở Sprint 13, engine-poc được lưu trữ và engine cùng MCP adapter (bộ điều hợp MCP) được chuyển nguyên trạng vào `app/`, không thay đổi. Nội dung được tách thành phạm vi sản phẩm, thiết kế/ranh giới của PoC, và vận hành PoC.
