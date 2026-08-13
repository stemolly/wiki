---
title: Cấu trúc mô-đun
description: Cách mỗi mô-đun backend được tổ chức bên trong — cách tách lõi/adapters theo hexagonal, quy tắc leaf-adapter, `index.ts` chỉ dùng làm barrel, cơ chế cưỡng chế bằng dependency-cruiser, wiring tại composition root và các bẫy của ESLint flat config.
---

Mọi backend module (mô-đun backend) trong codebase này đều theo cùng một bố cục nội bộ: một **core ring (vòng lõi)** chứa toàn bộ business logic, một **adapter ring (vòng adapter)** bao quanh để chứa các hiện thực cụ thể, và một điểm vào công khai duy nhất. Hình dạng này xuất phát từ **hexagonal architecture (kiến trúc lục giác)**, còn gọi là **ports-and-adapters (cổng-và-bộ-chuyển-adapter)**, nhưng tên gọi cụ thể, đường dẫn thư mục và cơ chế cưỡng chế đều là quyết định riêng của dự án — không phải quy ước chung của hexagonal. Trang này giải thích từng lớp, vì sao nó được tổ chức như vậy, và các quy tắc giúp giữ nguyên cấu trúc đó.

## Bố cục hai vòng

Mỗi module (`engine`, `tutor`, `llm`, `identity`, v.v.) có cấu trúc trên đĩa như sau:

```
<module>/
  core/
    driving.ts    ← driving contract (điều bên gọi có thể yêu cầu module này làm)
    driven.ts     ← driven contracts (điều module này cần hạ tầng cung cấp)
    module.ts     ← orchestration — nối domain + driven contracts lại với nhau
    domain/       ← quy tắc thuần, projection, value type; không có I/O
  adapters/
    pg-*.ts       ← driven adapters: repo Postgres, dịch vụ bên ngoài, v.v.
  index.ts        ← public entry point; chỉ re-export
```

**Core ring** — tức toàn bộ phần nằm dưới `<module>/core/` — là phía bên trong của hình lục giác. Nó chứa các quy tắc domain, các interface mà module phơi ra (`driving.ts`), và các interface mà module *cần từ* hạ tầng (`driven.ts`). Điểm quan trọng là không gì bên trong core ring được import bất kỳ thứ gì từ `adapters/`. Chỉ riêng quy tắc đó đã tạo nên ranh giới hexagonal.

**Adapter ring** chứa các hiện thực cụ thể của driven contracts: repo Postgres, binding file system, client cho dịch vụ bên thứ ba. Adapters phụ thuộc *hướng vào trong* core (chúng hiện thực một interface được định nghĩa trong `driven.ts`); còn core thì không bao giờ vươn *ra ngoài* tới chúng.

```mermaid
graph TD
    subgraph CORE["core/"]
        DM["domain/"]
        DRN["driven.ts"]
        DRG["driving.ts"]
        MOD["module.ts"]
    end
    subgraph OUTER["adapters/"]
        A1["PgUserRepo"]
        A2["EmailAdapter"]
    end
    EXT["Driving Caller<br/>(api module, mcp package)"]

    EXT -->|"calls via driving.ts"| MOD
    MOD --> DM
    MOD --> DRN
    A1 -->|"implements driven.ts"| DRN
    A2 -->|"implements driven.ts"| DRN
    CORE -. "must NOT import" .-> OUTER
```

### Vì sao dùng một thư mục thay vì liệt kê từng file

Các phiên bản trước của quy tắc này định nghĩa core dưới dạng một danh sách file cụ thể (`domain/`, `ports.ts`, `module.ts`). Cách đó khiến việc cưỡng chế trở nên mong manh — mỗi khi có thêm file mới trong core, lại phải sửa tay một quy tắc trong dependency-cruiser. Gom toàn bộ core vào một thư mục (`<module>/core/`) giúp phần kiểm tra chỉ còn là một mẫu đường dẫn duy nhất: bất kỳ thứ gì nằm dưới `core/` đều không được import bất kỳ thứ gì dưới `adapters/`. Nhờ vậy, cả những file chưa được viết ra cũng tự động được bao phủ.

### Cách đặt tên: driving.ts và driven.ts

Trước đây các file contract được gọi là `api.ts` và `ports.ts`. Cả hai tên này đều không thể hiện hướng phụ thuộc. `api` còn bị trùng với tên module `api` ở cấp cao nhất. `ports.ts` thì gợi cảm giác là "toàn bộ các port", nhưng thực tế chỉ chứa nửa outbound.

Tên mới tận dụng đúng bộ từ vựng mà các quy tắc và ADR đang dùng — "driving surface" và "driven ports" — nên toàn bộ codebase chỉ còn một cặp thuật ngữ nhất quán. Cái giá thực tế là `driving.ts` và `driven.ts` chỉ khác nhau ba ký tự nên rất dễ nhìn nhầm. Nhưng cái giá đó có giới hạn: một quy tắc trong dependency-cruiser cấm hai file này import lẫn nhau, nên nếu chọn nhầm thì CI sẽ fail ngay.

### domain/ có thể import driven.ts một cách tự do

Một cách hiểu sai thường gặp về hexagonal architecture là `domain/` không được import bất kỳ thứ gì bên ngoài chính nó, kể cả các port interface trong `driven.ts`. Dự án này không đi theo hướng đó. Driven contracts nằm *bên trong* hình lục giác — chúng là một phần của core ring — nên `domain/` được phép import `core/driven.ts`. Thứ mà `domain/` tuyệt đối không được import là `adapters/`.

Cấm `domain/ → driven.ts` là phong cách **functional core / imperative shell (lõi hàm / vỏ mệnh lệnh)** nghiêm ngặt hơn. Đó là một lựa chọn hợp lệ, nhưng không phải lựa chọn của dự án này.

## Quy tắc leaf-adapter

Việc tách core/adapters quyết định code nằm ở đâu. Một quy tắc thứ hai quyết định adapter *là gì*:

> Một driven adapter hiện thực **chính xác một** driven contract, không giữ bất kỳ port nào khác làm dependency, và không chứa quyết định nào đáng ra có thể viết mà không cần I/O.

Hãy xem adapter như một lớp chuyển dịch mỏng — nó nói ngôn ngữ của hệ thống bên ngoài (SQL, HTTP, đường dẫn file) và không hơn gì nữa. **Orchestration (điều phối)** — quyết định *gọi adapter nào* và theo thứ tự nào — thuộc về `module.ts`. Các quy tắc domain thuộc về `domain/`. Khi một adapter bắt đầu tích lũy logic, tức là nó đã nhận thêm một vai trò vốn phải nằm ở nơi khác.

Quy tắc này được ghi cùng với quy tắc cấm core import adapters là có lý do: chỉ ghi quy tắc đầu tiên chính là nguyên nhân khiến quy tắc thứ hai bị lệch dần theo thời gian. Module `identity` tuân thủ cả hai và là implementation tham chiếu. `metering` từng vi phạm mệnh đề đầu tiên (import adapter của chính nó vào core) cho đến khi được sửa.

### Vì sao adapter ring chỉ chứa driven adapters

Thư mục `adapters/` chỉ chứa driven adapters (adapter outbound). Không có driving adapter (adapter inbound) nào nằm bên trong module. Phía driving nằm hoàn toàn bên ngoài module: các route Fastify của module `api` cho ứng dụng, hoặc package workspace `mcp/` cho engine PoC.

Điều này đúng với cả bốn module đã có nội dung thật và đã đúng từ module đầu tiên, nhưng mãi gần đây mới được viết ra thành tài liệu. Cái giá của việc không nói rõ: một người đọc quen với hexagonal architecture mở `adapters/`, chỉ thấy repo, rồi kết luận rằng bố cục này còn thiếu. Thực ra không thiếu — sự bất đối xứng đó là có chủ đích và nhất quán. Nó xuất phát từ topology của monolith: phía driving luôn là một module khác hoặc một package khác, chứ không bao giờ là một thư mục lồng bên trong module đang được điều khiển.

## Cưỡng chế: dependency-cruiser và ESLint

Hai công cụ riêng biệt được dùng để cưỡng chế hai bất biến riêng biệt, vì không công cụ nào kiểm tra được phần việc của công cụ còn lại.

### dependency-cruiser (quy tắc ở mức file)

`app/.dependency-cruiser.cjs` là bản mô tả kiến trúc ở dạng máy đọc được của dự án này. Một PR thay đổi một cạnh phụ thuộc được phép, theo đúng định nghĩa, là một thay đổi kiến trúc và phải viện dẫn ADR tương ứng.

Config này mã hóa bốn nhóm quy tắc:

| Quy tắc | Nội dung kiểm tra |
|---|---|
| `engine-no-upward-deps` | Lõi domain không import gì từ orchestration hoặc các module biên |
| `declared-edges-only` | Mọi import liên mô-đun chưa khai báo đều là lỗi |
| `no-deep-cross-module-imports` | Chỉ được chạm tới một module thông qua `index.ts` của nó |
| `core-no-adapters-import` | Không gì dưới `<module>/core/` được import `<module>/adapters/` |

Trong CI, nó chạy dưới tên `depcruise:check`. Config này chỉ có ý nghĩa nếu nó thật sự fail khi có vi phạm — cổng kiểm tra CI đã được xác minh bằng cách cố ý cấy một import bị cấm và xác nhận build chuyển sang màu đỏ.

#### Những gì dependency-cruiser không kiểm tra được

`dependency-cruiser` suy luận ở mức file: nó chỉ thấy file A import file B, không hơn. Quy tắc leaf-adapter — "adapter này chỉ giữ đúng một port" — lại là quy tắc ở mức **symbol granularity (độ hạt theo symbol)**. Mọi adapter đều có thể import cùng một file `driven.ts`, bất kể chúng đang giữ bao nhiêu port làm dependency. Một lần chạy `depcruise` sạch không thể phân biệt một leaf adapter với một adapter đang âm thầm giữ ba port. Trong ba issue liên tiếp, một lần chạy `depcruise` sạch đã bị hiểu nhầm là bằng chứng ranh giới vẫn khỏe mạnh, dù trên thực tế nó không bao giờ có khả năng phát hiện lỗi đó.

Có một kỹ thuật để đẩy một mối quan tâm ở mức symbol xuống mức file: đặt hai phía vào hai file riêng. Khi `driving.ts` và `driven.ts` là hai file tách biệt, phát biểu "hai contract này không được phản chiếu lẫn nhau" sẽ trở thành "hai file này không được import lẫn nhau" — một quy tắc mà công cụ dựa trên đường dẫn có thể diễn đạt. Quy tắc import qua lại đó được triển khai bằng hai mục `from`/`to` (mỗi chiều một mục), vì một mục đơn chỉ kiểm tra được một chiều.

### Quy tắc ESLint AST G-21 (cưỡng chế leaf-adapter)

Vì dependency-cruiser không diễn đạt được quy tắc leaf-adapter, quy tắc này được cưỡng chế bằng một quy tắc ESLint `no-restricted-syntax` (G-21) áp dụng cho `server/src/*/adapters/**/*.ts`. Quy tắc này đánh dấu mọi class property, constructor parameter property, hoặc trường trong deps-interface có tên kiểu kết thúc bằng `Port`, `Repository`, hoặc `Store`. Việc hiện thực một port là một node `TSClassImplements` nên không bị chạm tới — adapter vẫn có thể khai báo interface mà nó đáp ứng; nó chỉ không được *giữ* một port làm dependency.

G-21 có một điểm mù đã được nêu rõ: nó dựa vào quy ước hậu tố trong cách đặt tên. Một kiểu port được đặt tên ngoài ba hậu tố đó sẽ vô hình với nó. Vì vậy, quy ước đặt tên ở đây là thứ gánh tải cho hệ thống, không chỉ là chuyện hình thức.

## Các bẫy của ESLint Flat Config

Dự án dùng **ESLint flat config (cấu hình phẳng của ESLint)** qua `eslint.config.js`. Trong quá trình phát triển đã có hai lỗi liên quan tác động tới các block `no-restricted-syntax`, và bạn nên biết về chúng.

### Tùy chọn cũ âm thầm nhập trở lại khi override chỉ đổi severity

Khi một block config phía sau đặt một rule thành giá trị không chứa option nào — ví dụ `['error']` hoặc `['error', ...[]]` khi phần spread rỗng — cơ chế merge của config-array trong ESLint *không xóa* các option từ block trước. Nó giữ nguyên các option cũ và chỉ thay severity. Nhìn bề ngoài, block sau có vẻ đã override rule, nhưng thực tế lại âm thầm thừa kế lại các selector từ block trước.

Vấn đề này từng xảy ra ở `engine-poc/mcp/eslint.config.js` khi một override tính giá trị `no-restricted-syntax` của nó bằng cách lấy danh sách gốc rồi bỏ đi một selector; đúng thời điểm đó danh sách còn lại rỗng, nên biểu thức co về dạng chỉ còn severity và vô tình kế thừa lại đúng selector mà nó định loại bỏ.

**Cách sửa:** loại file đó khỏi block trước bằng `ignores: ['path/to/file.ts']` thay vì trông đợi một block phía sau override nó. Làm vậy thì sẽ không có lần merge chéo block nào diễn ra cả.

### ignores loại trừ khỏi cả block, không chỉ một selector

Cách sửa ở trên cũng có cái giá riêng. Trong ESLint flat config, `ignores` hoạt động ở cấp block: nó loại các file khớp khỏi *mọi* rule mà block đó đặt ra, chứ không chỉ khỏi một selector trong một rule tổng hợp. Nếu một block dùng chung gộp nhiều selector `no-restricted-syntax` lại với nhau, việc thêm một file vào `ignores` của block đó để miễn trừ nó khỏi một selector sẽ âm thầm miễn luôn khỏi tất cả selector còn lại.

Điều này từng xảy ra trong `app/eslint.config.js`: một mục `ignores` được thêm vào vì một selector, rồi về sau lại âm thầm làm rơi mất selector thứ hai được thêm vào cùng block đó — và lỗi này đã lọt qua hai vòng review.

**Cách sửa:** đừng bao giờ nới rộng `ignores` của một block dùng chung chỉ để giải quyết miễn trừ cho một selector. Thay vào đó, giữ nguyên `ignores` của block chung và thêm một block riêng ở cuối cho các file cần cách xử lý khác, rồi khai báo lại các selector nào vẫn phải tiếp tục áp dụng tại đó.

## `index.ts` chỉ dùng làm barrel

`index.ts` của mọi module chỉ được chứa các lệnh re-export — không được định nghĩa schema, class, interface hay factory function trực tiếp bên trong. Toàn bộ implementation phải nằm trong các file đồng cấp riêng, rồi để `index.ts` re-export lại. Khoảng trống này được phát hiện ở buổi review Sprint 1, khi nhiều module (`contracts`, `errors`, `logger`, `persistence`, `metering`, `llm`, và các module khác) bị phát hiện đang định nghĩa logic thật trực tiếp trong `index.ts` của chính mình.

```ts
// ✅ correct — index.ts is a barrel
export { createLlmGateway } from './gateway';
export type { LlmPort } from './core/driven';

// ❌ wrong — logic defined inline in index.ts
export function createLlmGateway(deps: Deps) { … }
```

Quy tắc này được áp dụng nghiêm ngặt: kể cả module factory function cũng nằm trong phạm vi. Ngoại lệ gồm: entry point của tiến trình là `server/src/index.ts` và các stub barrel rỗng dùng làm placeholder. Quy tắc được cưỡng chế bởi một CI fitness function.

## Composition Root: Wiring factory tường minh

Khi khởi động, public factory (factory công khai) của từng module — ví dụ `createLlmGateway(deps)`, `createMeteringModule(deps)` — được nối với nhau thủ công trong một **composition root (gốc ghép nối)** duy nhất là `server/src/composition.ts`. Dự án không dùng **DI container (bộ chứa tiêm phụ thuộc)** với cơ chế auto-wiring dựa trên decorator hay reflection.

Lý do cũng chính là nguyên tắc "tường minh hơn là ma thuật" đã dẫn dắt nhiều quyết định khác trong codebase này: container che giấu đồ thị phụ thuộc đúng ở nơi kỷ luật ranh giới của modular monolith cần nó phải hiện ra rõ nhất. Khi đọc `composition.ts`, bạn thấy toàn bộ wiring ở cùng một chỗ. Còn khi auto-wiring lắp ráp mọi thứ một cách vô hình, một vi phạm ranh giới sẽ không để lại hậu quả nhìn thấy được cho tới lúc có thứ hỏng ở runtime.

## Vị trí đặt test

Ranh giới core/adapters cũng áp dụng cho cả file test. Một kiểm tra dựa trên đường dẫn không thể phân biệt file test với file source, và cũng không nên phân biệt — vì ngoại lệ đó sẽ trở thành chính cái lỗ thủng trong ranh giới.

Một **integration test (kiểm thử tích hợp)** tạo ra các đối tượng adapter thật (ví dụ một `PgUserRepository` chạy với cơ sở dữ liệu thật) không thể nằm trong `core/` — vì nó sẽ import từ `adapters/`, và như vậy sẽ kích hoạt quy tắc `core-no-adapters-import`. Vì thế, unit test và integration test của cùng một đối tượng sẽ tách khỏi nhau:

- `core/module.test.ts` — sống cùng file mà nó kiểm thử, bên trong core ring
- `module.integration.test.ts` — nằm ngoài core ring, cùng cấp với `adapters/`

Vitest vốn đã tách hai hậu tố này thành các lượt chạy khác nhau, nên cách chia này đi theo một đường ranh đã tồn tại sẵn, chứ không tạo thêm một đường ranh mới.

## Ngoại lệ của module persistence

Module `persistence` là một module adapter thuần, không có phân lớp hexagonal ở bên trong. Phần scaffold `domain/`, `ports.ts` và `adapters/` của nó đã bị xóa, chỉ để lại `pool.ts` và một `index.ts` để re-export.

Lập luận quyết định là: công việc duy nhất của module này là tạo một `pg.Pool` và chuyển nó cho các module khác. Không ai có thể nêu ra phần việc tương lai nào sẽ làm đầy `persistence/domain/`. Một comment stub kiểu *"cố ý để trống cho đến khi một issue sau này thêm business rule thật"* chỉ là một lời hứa sai — nó bảo mọi người đọc về sau hãy chờ một thứ vốn sẽ không bao giờ đến.

Điều này rõ ràng **không** phải tiền lệ để xóa stub ở các nơi khác. Vẫn còn khoảng ba mươi file placeholder rải trên các module khác (`engine`, `tutor`, `pedagogy`, v.v.), nơi business logic tương ứng thực sự sẽ xuất hiện ở sprint sau — những stub đó vẫn được giữ lại. Việc xóa ở `persistence` là một cánh cửa hai chiều: nếu sau này thật sự xuất hiện một port đúng nghĩa, thư mục đó có thể quay lại chỉ trong một commit.

:::note
`persistence` cùng với `api` và `jobs` nằm trong ngoại lệ đã được tài liệu hóa về việc không cần có thư mục `domain/`. Mệnh đề "barrel rỗng được miễn R-24" trong quy tắc `index.ts` chỉ dùng làm barrel vẫn còn hiệu lực và vẫn cần thiết cho 27 placeholder stub còn lại ở các module khác.
:::
