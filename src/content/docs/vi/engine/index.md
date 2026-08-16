---
title: Bộ máy Mental Model
description: Belief graph (đồ thị niềm tin) ba lớp, cách nó được triển khai bằng append-only event sourcing (ghi nhận sự kiện chỉ ghi thêm), và cách độ chính xác của nó được kiểm định.
---

belief graph (đồ thị niềm tin) là USP (điểm khác biệt cốt lõi) chính của Stemolly. Phần này trình bày nó là gì, được xây như thế nào, và độ chính xác của nó được kiểm định ra sao.

## Chủ đề

**[Thiết kế Mental Model](./mental-model.md)** — Mô hình ba lớp (misconceptions, fragility, reasoning patterns), cách các belief được tổ chức thành các evidence stream (luồng bằng chứng) theo mô hình event-sourced, và thiết kế lưu trữ (một unified graph cho mỗi học sinh, cùng hybrid identity cho misconceptions và patterns).

**[Triển khai Engine](./engine-impl/)** — Cách graph được hiện thực hóa về mặt kỹ thuật: append-only event log (nhật ký sự kiện chỉ ghi thêm), tách CQRS giữa phía ghi và phía suy diễn, ba projector (bộ chiếu) gồm fragility FSM, misconception FSM và pattern accumulator, mô hình node với ba định danh (uuid/slug/display) cùng kỷ luật phân giải alias-merge, độ tin cậy và vòng đời của catalog, và các bài học về cấu trúc hexagonal dành riêng cho module này. Nội dung được chia thành năm trang con tập trung.

**[Kiểm định Engine](./engine-validation.md)** — Cách Stemolly chứng minh mô hình thực sự đúng: groundedness precision và predictive validity là hai thước đo, chiến lược tự động hóa LLM-as-judge, cùng kỷ luật cần thiết để giữ cho các thước đo đó đáng tin cậy.
