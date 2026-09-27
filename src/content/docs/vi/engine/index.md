---
title: Bộ máy Mental Model
description: belief graph (đồ thị niềm tin) ba lớp, cách nó được triển khai bằng append-only event sourcing (mô hình ghi nhận sự kiện chỉ ghi thêm), và cách độ chính xác của nó được kiểm chứng.
---

belief graph là USP (điểm khác biệt cốt lõi) trung tâm của Stemolly. Phần này giải thích nó là gì, được xây dựng ra sao và độ chính xác của nó được kiểm chứng như thế nào.

## Chủ đề

**[Thiết kế Mental Model](./mental-model.md)** — Mô hình ba lớp gồm misconceptions (ngộ nhận), fragility (độ mong manh) và reasoning patterns (mẫu hình lập luận), cách các belief (niềm tin) được tổ chức thành event-sourced evidence streams (luồng bằng chứng hình thành từ sự kiện), cùng thiết kế lưu trữ (một unified graph cho mỗi học sinh, với hybrid identity cho misconceptions và patterns).

**[Triển khai Engine](./engine-impl/)** — Cách graph được hiện thực hóa về mặt kỹ thuật: append-only event logs (nhật ký sự kiện chỉ ghi thêm), sự tách biệt CQRS giữa phía ghi và phía suy diễn, ba projector (bộ chiếu) gồm fragility FSM, misconception FSM và pattern accumulator, mô hình node với ba định danh (uuid/slug/display) cùng cơ chế phân giải alias-merge, độ tin cậy của catalog và vòng đời của nó với các cổng phê duyệt dành cho operator (người vận hành), study anchors (mốc học tập) do engine sở hữu và answer contracts (cam kết đầu ra câu trả lời) cho assignment brief (đề bài giao việc), bao gồm cả việc quản lý answer key (đáp án chuẩn), sự tách rời bằng checkpoint-stamp giữa thời điểm bằng chứng được ghi lại và thời điểm sự việc thực sự diễn ra, cùng các bài học về cấu trúc hexagonal dành riêng cho module này. Nội dung được chia thành sáu trang con, mỗi trang tập trung vào một chủ đề cụ thể.

**[Kiểm định Engine](./engine-validation.md)** — Cách Stemolly chứng minh mô hình này thực sự đúng: groundedness precision (độ chính xác bám sát dữ liệu) và predictive validity (độ giá trị dự báo) là hai thước đo, chiến lược tự động hóa LLM-as-judge, cùng kỷ luật cần có để giữ cho các thước đo đó đáng tin cậy.
