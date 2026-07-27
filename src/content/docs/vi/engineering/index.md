---
title: Thực hành kỹ thuật
description: Backend (phần phụ trợ) và persistence (lưu trữ dữ liệu), testing (kiểm thử) và fitness functions (hàm bảo chứng), observability (khả năng quan sát), và resilience (khả năng chống chịu).
---

Phần này trình bày cách codebase (mã nguồn tổng thể) của Stemolly được xây dựng, kiểm thử và duy trì tính đúng đắn.

## Chủ đề

**[Backend & Persistence](./backend.md)** — PostgreSQL là datastore (kho lưu trữ dữ liệu) duy nhất, job runner (bộ chạy tác vụ) chạy trong tiến trình và dùng Postgres, các quy ước của node-pg-migrate, mẫu cấu hình bằng biến môi trường STEMOLLY_, cùng các rủi ro ở runtime (thời gian chạy) như tsx loader và việc teardown pool.

**[Testing & Fitness Functions](./testing.md)** — Fitness functions được phát hành cùng phần mã mà chúng chi phối, CI (tích hợp liên tục) chỉ dùng mock LLM, các mẫu testcontainers như SAVEPOINT, single PoolClient và clock-scoped metering, cùng ba kiểu lỗi “green but wrong” mà chỉ code review mới phát hiện được.

**[Observability & Resilience](./observability.md)** — Structured logging (ghi log có cấu trúc) bằng Pino với tập trường được kiểm tra bằng schema, RequestContext tường minh để lan truyền traceId, một error envelope thống nhất với các tầng leo thang khi LLM thất bại, và chiến lược chịu lỗi của worker chạy trong tiến trình.
