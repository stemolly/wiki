---
title: Thực hành kỹ thuật
description: Backend (hệ thống phụ trợ) và persistence (lưu trữ bền vững), testing (kiểm thử) và fitness functions (hàm kiểm chuẩn), observability (khả năng quan sát), và resilience (khả năng phục hồi).
---

Phần này trình bày cách codebase (toàn bộ mã nguồn) của Stemolly được xây dựng, kiểm thử và duy trì tính đúng đắn.

## Chủ đề

**[Backend & Persistence (hệ thống phụ trợ và lưu trữ bền vững)](./backend.md)** — PostgreSQL là datastore duy nhất, job runner chạy trong tiến trình dựa trên Postgres, các quy ước của node-pg-migrate, mẫu cấu hình biến môi trường `STEMOLLY_`, và các rủi ro khi chạy runtime như tsx loader và pool teardown.

**[Testing & Fitness Functions (kiểm thử và hàm kiểm chuẩn)](./testing.md)** — Các fitness functions đi kèm chính phần code mà chúng kiểm soát, CI chỉ dùng mock LLM, các mẫu testcontainers như SAVEPOINT, single PoolClient, và clock-scoped metering, các yêu cầu build CI liên gói, cùng bốn kiểu lỗi “green but wrong” — unreachable artifact, unreachable branch, missing ordering guarantee, và tautological fake — cũng như vấn đề suy giảm cấu trúc trong phạm vi bao phủ MCP transport.

**[Observability & Resilience (khả năng quan sát và khả năng phục hồi)](./observability.md)** — Logging có cấu trúc bằng Pino với tập field được kiểm tra theo schema, RequestContext tường minh để truyền traceId, một error envelope duy nhất với các tầng nâng mức xử lý lỗi LLM, và chiến lược chịu lỗi của worker chạy trong tiến trình.
