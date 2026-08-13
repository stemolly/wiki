---
title: Kiến trúc hệ thống
description: Topology (cấu trúc triển khai), module structure (cấu trúc mô-đun), tầng LLM và agent, auth (xác thực) và security (bảo mật), cùng API contract (hợp đồng API).
---

Phần này trình bày các quyết định về cấu trúc định hình toàn bộ codebase (toàn bộ mã nguồn).

## Chủ đề

**[Kiến trúc cốt lõi](./core-arch.md)** — Evolvability là NFR (yêu cầu phi chức năng) chính, topology monorepo+single-deployable (một kho mã + một đơn vị triển khai), rationale (cơ sở lựa chọn) của modular monolith (khối nguyên khối mô-đun), TypeScript stack (ngăn xếp TypeScript), và mô hình governance (quản trị) bốn trụ cột (principles → ADRs → design rules → fitness functions) với các quy tắc rõ ràng để ADRs chỉ giới hạn ở những ranh giới bền vững và không chứa tên tệp cụ thể.

**[Tầng LLM & Agent](./llm-agents.md)** — Chiến lược LLM vendor-agnostic (không phụ thuộc nhà cung cấp), tiered-by-task (phân tầng theo tác vụ); lớp nền @noetaris/harness; cách tách vai trò gia sư thành hai agent là Guide và Analyst; và cách chúng chỉ giao tiếp với nhau thông qua một Report được lưu bền vững và có phiên bản.

**[Cấu trúc mô-đun](./module-structure.md)** — Phân lớp hexagonal (lục giác) bên trong từng mô-đun (bố cục hai vòng `core/`+`adapters/`), quy tắc leaf-adapter, các tệp barrel chỉ dùng để re-export, dependency-cruiser như kiến trúc machine-readable (máy có thể đọc), quy ước đặt tên contract (hợp đồng) `driving.ts`/`driven.ts` của ADR-029, các bẫy thường gặp của ESLint flat-config, quy tắc đặt integration test, và cách đấu nối factory ở composition root một cách tường minh.

**[Xác thực & Bảo mật](./auth-security.md)** — Cơ chế email+mật khẩu theo kiểu invite-only (chỉ theo lời mời) cùng server-side sessions (phiên phía máy chủ), bất biến cookie theo từng bề mặt, cô lập theo subdomain, namespace (không gian tên) /api/auth/* được quản trị, và bảo mật invite token (token lời mời).

**[API & Vận chuyển](./api.md)** — Flat POST route (route POST phẳng) cho các lượt tương tác của gia sư, không dùng token streaming trong MVP, tắt coercion của ajv trên toàn ứng dụng, và API contract thống nhất theo dạng error-envelope.
