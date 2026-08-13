---
title: Bộ máy mô hình tinh thần
description: Đồ thị niềm tin ba tầng, cách nó được hiện thực bằng event sourcing (ghi nhận theo sự kiện) chỉ ghi thêm, và cách độ chính xác của nó được kiểm chứng.
---

belief graph (đồ thị niềm tin) là USP (điểm khác biệt cốt lõi) trung tâm của Stemolly. Phần này giới thiệu nó là gì, được xây dựng như thế nào, và độ chính xác của nó được kiểm chứng ra sao.

## Chủ đề

**[Thiết kế mô hình tinh thần](./mental-model.md)** — Mô hình ba tầng (misconceptions, fragility, reasoning patterns), cách các belief được tổ chức thành evidence streams (luồng bằng chứng) theo kiểu event-sourced (ghi nhận theo luồng sự kiện), cùng thiết kế lưu trữ (một unified graph cho mỗi học sinh, với hybrid identity cho misconceptions và patterns).

**[Triển khai engine](./engine-impl.md)** — Cách đồ thị được hiện thực về mặt kỹ thuật: append-only event logs (nhật ký sự kiện chỉ ghi thêm), cách tách CQRS giữa phía ghi và phía suy diễn, ba projectors (bộ chiếu dữ liệu), mô hình nút với ba định danh (uuid/slug/display) cùng kỷ luật phân giải alias-merge, độ tin cậy và vòng đời của catalog, và các vấn đề mở đã biết (ordering, catalog ref validation, alias coverage).

**[Kiểm chứng engine](./engine-validation.md)** — Cách Stemolly chứng minh mô hình thực sự đúng: groundedness precision (độ chính xác về mức độ bám sát căn cứ) và predictive validity (độ giá trị dự báo) là hai thước đo, chiến lược tự động hóa LLM-as-judge (dùng LLM làm bộ đánh giá), cùng kỷ luật cần thiết để giữ các thước đo đó đáng tin cậy.
