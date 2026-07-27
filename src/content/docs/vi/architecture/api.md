---
title: API & Cơ chế truyền tải
description: Cách thiết kế API của Stemolly — route POST turn dạng phẳng, cơ chế request/response thuần, ajv validation nghiêm ngặt và hợp đồng error envelope.
---

# API & Cơ chế truyền tải

Backend của Stemolly cung cấp một HTTP API nhỏ, được xây trên **Fastify**. Mọi lượt tương tác của học sinh đều đi qua một route (đường dẫn xử lý) duy nhất. Phản hồi luôn là các JSON bundle (gói JSON) hoàn chỉnh — không dùng streaming. Một validation contract (hợp đồng kiểm tra hợp lệ) chặt chẽ bảo đảm rằng mọi request sai, dù bị framework hay ứng dụng từ chối, đều trả về cùng một dạng lỗi.

---

## Route của Turn

Một turn (lượt tương tác) của học sinh được gửi như sau:

```
POST /api/student/turn
```

```json
{
  "schemaVersion": "1",
  "sessionId": "srv-issued-id",
  "message": "Can you explain this again?"
}
```

Toàn bộ request — định danh session và nội dung tin nhắn — nằm trong **body**, không nằm trên URL.

### Vì sao không dùng route lồng nhau?

Một phương án trước đây dùng `POST /api/student/session/:id/turn`, đặt session ID trên URL path. Cách này bị loại bỏ vì một lý do rất cụ thể: khi đó session ID sẽ nằm trong một schema `params`, còn phần còn lại của request lại nằm trong một schema `body`, khiến `TurnRequest` không thể được biểu diễn thành một kiểu duy nhất trong shared contracts package.

Quy tắc của dự án là mọi artefact đi qua ranh giới dịch vụ đều phải được kiểm tra bằng một contract duy nhất đã qua schema validation. Tách một request logic thành hai schema sẽ phá vỡ quy tắc đó — và khi type coercion bị tắt trên toàn bộ ứng dụng (xem bên dưới), bề mặt `params` lại càng bất tiện hơn.

Một turn cũng là một **command**, không phải sub-resource (tài nguyên con). Không hề có tập hợp turn nào tồn tại như một resource riêng, và cũng không có turn riêng lẻ nào từng được truy cập bằng ID, nên kiểu lồng path theo REST không đem lại giá trị cấu trúc nào. Route phẳng mới phản ánh đúng bản chất.

`sessionId` trong body phải ánh xạ tới một bản ghi session thật do server cấp. Phương án để client tự bịa ra một giá trị rồi server âm thầm bỏ qua cũng đã bị bác bỏ: khi một schema đang kiểm tra hình dạng dữ liệu, một định danh trỏ tới hư vô còn tệ hơn là không có định danh nào cả.

---

## Transport: Request/Response với chỉ báo đang gõ

Một turn của tutor dùng mô hình **plain HTTP request/response** (yêu cầu/phản hồi HTTP thuần). Học sinh gửi POST; server trả về trọn bộ phản hồi (một danh sách plugin messages) khi quá trình sinh nội dung kết thúc; frontend hiển thị chỉ báo "typing…" trong lúc chờ.

Phương án streaming theo từng token đã được cân nhắc rồi loại bỏ. Turn hướng tới học sinh chạy trên model **Interface** rất nhanh, thường hoàn tất trong vài giây — chỉ báo đang gõ là đủ để tạo cảm giác phản hồi tốt. Model **Expert** chậm hơn chạy ngoài vòng lặp turn nên không bao giờ chặn học sinh.

Trong MVP không có message nào từ server gửi sang học sinh mà không được yêu cầu trước:

- Cập nhật checkpoint sẽ đi kèm phản hồi của turn *tiếp theo*.
- Lời nhắc khi im lặng quá lâu là một **client-side timer** (bộ đếm thời gian phía client), không phải server push.

Vì server không bao giờ cần chủ động đẩy một message mà học sinh chưa yêu cầu, SSE, WebSockets và mọi push channel đều không cần thiết. Bỏ chúng đi cũng đồng nghĩa loại bỏ kết nối sống lâu, logic reconnect, cấu hình proxy buffering, và cả câu hỏi có nên dùng connection registry hay Redis.

**Khi nào nên xem xét lại:** nếu một tính năng trong tương lai cần message server→student không cần yêu cầu trước (một lời nhắc trực tiếp, một plugin thời gian thực), chỉ lớp transport cần thay đổi — phần phản hồi vốn đã là một danh sách message, nên hình dạng dữ liệu vẫn giữ nguyên.

---

## Validation: Một Envelope cho mọi lỗi

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Fastify
    participant H as setErrorHandler
    participant R as Route Handler

    C->>F: POST /api/student/turn
    alt body fails JSON-Schema
        F->>H: FST_ERR_VALIDATION
        H->>C: 400 ValidationError envelope
    else body passes
        F->>R: validated body
        alt domain error
            R->>H: typed AppError
            H->>C: error envelope
        else success
            R->>C: 200 response bundle
        end
    end
```

### Một error handler cho mọi lỗi

Fastify kiểm tra request body của từng route theo một JSON Schema trước khi route handler chạy. Nếu validation thất bại, Fastify sẽ phát sinh `FST_ERR_VALIDATION` — kiểu lỗi riêng của framework này, nằm ngoài hệ thống typed error của ứng dụng.

Dự án ánh xạ lỗi cấp framework này về cùng dạng envelope được dùng ở mọi nơi khác. Một `setErrorHandler` duy nhất trong `server/src/api/error-handler.ts` xử lý cả hai trường hợp:

- `FST_ERR_VALIDATION` từ Fastify → được tuần tự hóa thành envelope `ValidationError`.
- Bất kỳ `AppError` có kiểu nào được ném ra từ module domain → được tuần tự hóa thành biến thể envelope tương ứng của chính nó.

Client luôn nhận cùng một cấu trúc, bất kể lỗi phát sinh từ đâu.

### Vì sao phải tắt coercion

Ánh xạ này có một điều kiện tiên quyết ít ai để ý. Với cấu hình ajv **mặc định** của Fastify, các kiểu scalar sẽ bị coerced (ép kiểu tự động) **trước khi** schema validation chạy. Nếu client gửi `{ "message": 123 }` trong khi schema khai báo `{ type: "string" }`, Fastify sẽ âm thầm đổi `123` thành `"123"` rồi validation vẫn thành công. Route nhìn thấy một body hợp lệ và trả về `200`. `FST_ERR_VALIDATION` sẽ không bao giờ được phát sinh, nên error handler cũng không bao giờ được gọi — hợp đồng envelope bị phá vỡ mà không có cảnh báo rõ ràng nào.

Cách sửa là tắt coercion **một lần duy nhất** tại nơi khởi tạo `fastify()` trong `server/src/app.ts`:

```ts
const app = fastify({
  loggerInstance: ctx.logger as never,
  ajv: { customOptions: { coerceTypes: false } },
});
```

Khi coercion bị tắt, schema của mọi route sẽ kiểm tra kiểu *thực tế* của request. Một trường có sai kiểu giờ sẽ phát sinh `FST_ERR_VALIDATION`, và error handler sẽ bắt lỗi đó rồi bọc nó lại trong envelope.

Phương án còn lại — để coercion bật rồi bắt từng route tự phòng thủ — đã bị bác bỏ. Sự tiện lợi của coercion không có giá trị gì trong ngữ cảnh này (không route nào muốn nhận chuỗi `"123"` thay cho số `123`), trong khi kiểu hỏng này lại âm thầm và ảnh hưởng tới mọi route sẽ được thêm vào sau này. Tắt nó một lần tại điểm hợp thành là cách duy nhất để ràng buộc này có hiệu lực trên toàn cục.

> **Test instance không kế thừa gì cả.** Một bài test tự dựng `fastify()` trần sẽ **không** tự động kế thừa cấu hình này. Những test instance được tạo thủ công phải áp dụng lại `coerceTypes: false` một cách tường minh, nếu không một kiểm tra với body sai định dạng có thể vẫn "đúng" nhưng vì sai lý do.

### Chốt chặn coercion không phụ thuộc route

Ban đầu, bài test duy nhất cho quy tắc này bị gắn chặt với route tạm thời `echo-turn`. Nếu route đó bị xóa, bài test cũng sẽ biến mất theo — và chốt chặn cho coercion sẽ không còn bằng chứng nào bảo vệ nó.

Giờ đây chốt chặn đó đã được cố định độc lập: `server/test/error-handler.test.ts` có một trường hợp riêng cho lỗi lệch kiểu (một giá trị số cho trường `{ type: "string" }`) không phụ thuộc vào bất kỳ route ứng dụng nào. Bản sửa đã được kiểm chứng theo cách trực diện nhất — tạm thời gỡ `coerceTypes: false` khỏi `app.ts`, chạy lại bài test mới và thấy nó thất bại với `expected 200 to be 400`, rồi khôi phục `app.ts` và xác nhận bài test lại vượt qua. Route `echo-turn` có thể bị xóa ở sprint sau mà không làm mất phạm vi bảo vệ của chốt chặn này.

---

## Đăng ký Plugin của Fastify: Thời điểm rất quan trọng

Hệ thống plugin của Fastify là **lazy** (trì hoãn). Gọi `app.register(...)` không gắn route ngay lập tức — nó chỉ đưa plugin vào hàng chờ. Các route chỉ thực sự được đăng ký khi `app.ready()` được `await` trong lúc khởi động.

Điều này rất quan trọng với mọi bài test hoặc fitness function cần introspect (soi chiếu nội bộ) bảng route. Chỉ có một khoảng thời gian rất hẹp để gắn collector:

```
app.register(routes)   ← queues the plugin
app.addHook('onRoute', collect)   ← ✓ attach here
await app.ready()   ← routes register, hook fires
```

Nếu `onRoute` hook được gắn sau `app.ready()`, nó sẽ không bắt được gì và tập thu thập sẽ rỗng. Nếu `app.ready()` không bao giờ được gọi, các route vẫn chưa tồn tại — kết quả cũng rỗng.

Một tập rỗng có thể khiến phép kiểm tra sai mà không ai nhận ra: nếu phép kiểm tra chỉ tìm xem "không có route cấm nào được tìm thấy", thì tập rỗng sẽ tự động vượt qua, trông có vẻ xanh nhưng thực ra chẳng quan sát được gì.

`onRoute` hook là công cụ phù hợp để introspect bảng route vì nó cung cấp một đối tượng có cấu trúc `{ method, url }` cho từng route ngay khi route đó được đăng ký. Nhờ vậy có thể so sánh chính xác một `Set` với allowlist (danh sách cho phép) đã được chốt sẵn. `printRoutes()` chỉ trả về một chuỗi cây đã định dạng, mà hình dạng của nó không phải một contract ổn định — muốn dùng thì phải tự phân tích lại. Phép khẳng định đẳng thức tập hợp sẽ phát hiện cả route thừa lẫn route bị thiếu nhưng vẫn còn mục tương ứng trong allowlist.
