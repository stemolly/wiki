---
title: Bộ máy mô hình tư duy
description: Đồ thị niềm tin ba lớp, cách nó được triển khai bằng append-only event sourcing (ghi nhận theo chuỗi sự kiện chỉ thêm vào), và cách độ chính xác của nó được kiểm chứng.
---

Đồ thị niềm tin là USP (điểm khác biệt cốt lõi) của Stemolly. Phần này trình bày nó là gì, được xây dựng ra sao, và độ chính xác của nó được kiểm chứng như thế nào.

## Chủ đề

**[Thiết kế mô hình tư duy](./mental-model.md)** — Mô hình ba lớp (misconceptions (ngộ nhận), fragility (độ vững của hiểu biết), reasoning patterns (mẫu hình lập luận)), cách beliefs (niềm tin) được cấu trúc thành các event-sourced evidence streams (luồng bằng chứng ghi nhận theo sự kiện), và thiết kế lưu trữ (một đồ thị thống nhất cho mỗi học sinh, với định danh lai cho misconceptions và patterns).

**[Triển khai engine](./engine-impl.md)** — Cách đồ thị được hiện thực hóa về mặt kỹ thuật: append-only event logs (nhật ký sự kiện chỉ thêm vào), tách CQRS (phân tách lệnh và truy vấn) giữa phía ghi và phía suy diễn, ba projectors (bộ chiếu suy diễn: fragility FSM, misconception FSM, pattern accumulator), cùng các vấn đề mở đã biết (ordering, alias merge, edge validation, pattern valence).

**[Kiểm chứng engine](./engine-validation.md)** — Cách Stemolly chứng minh mô hình này thực sự đúng: groundedness precision (độ chính xác theo bằng chứng nền tảng) và predictive validity (độ hiệu lực dự báo) là hai thước đo chính, chiến lược tự động hóa LLM-as-judge (dùng LLM làm bộ chấm), và kỷ luật cần có để giữ cho các thước đo đó đáng tin cậy.
