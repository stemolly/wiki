---
title: Kiến trúc hệ thống
description: Cấu trúc triển khai, cấu trúc module, tầng LLM và agent, xác thực và bảo mật, cùng hợp đồng API.
---

Phần này trình bày những quyết định cấu trúc định hình toàn bộ codebase (toàn bộ mã nguồn).

## Chủ đề

**[Kiến trúc cốt lõi](./core-arch.md)** — Evolvability (khả năng tiến hóa) là NFR chính, topology (cấu trúc triển khai) monorepo+single-deployable, lý do chọn modular monolith, ngăn xếp TypeScript và governance model (mô hình quản trị) bốn trụ cột.

**[Tầng LLM & Agent](./llm-agents.md)** — Chiến lược LLM vendor-agnostic (không phụ thuộc nhà cung cấp) và tiered-by-task (phân tầng theo nhiệm vụ), lớp nền `@noetaris/harness`, cách tutor được tách thành hai agent là Guide và Analyst, và việc chúng chỉ giao tiếp qua một Report được lưu trữ, có phiên bản.

**[Cấu trúc Module](./module-structure.md)** — Phân lớp hexagonal (lục giác) bên trong từng module, quy tắc leaf-adapter, barrel file (tệp tái xuất), `dependency-cruiser` như bản mô tả kiến trúc machine-readable (máy có thể đọc), và factory wiring (ghép nối bằng hàm khởi tạo) tường minh tại composition root.

**[Xác thực & Bảo mật](./auth-security.md)** — Xác thực email+mật khẩu theo mô hình invite-only (chỉ theo lời mời) với server-side sessions (phiên phía máy chủ), invariant (bất biến) về cookie theo từng bề mặt, cô lập bằng subdomain, namespace `/api/auth/*` được quản lý, và bảo mật invite token.

**[API & Cơ chế truyền tải](./api.md)** — Route POST dạng phẳng cho các lượt tutor, không dùng token streaming trong MVP, `ajv` tắt coercion trên toàn ứng dụng, và hợp đồng error-envelope đồng nhất.
