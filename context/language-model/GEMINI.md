# Hermes Agent 接口与数据映射规范 (V0.1)

## 1. 接口协议 (Interface Spec)
所有与 Hermes 后端的通信必须遵循以下 REST 标准：

- **主入口**: `POST {baseURL}/api/maid/hermes/message`
- **鉴权**: `Authorization: Bearer {apiKey}`
- **超时设定**: 
  - 文本对话: 30s
  - 动态 Schema 拉取: 10s
  - 配置文件应用: 60s (含后端重启)

### 1.1 请求结构 (Request)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `user_id` | string | 来自 Supabase 的用户唯一标识 |
| `session_id` | string | 当前对话树的 Root ID |
| `message` | string | 用户输入或指令 |
| `mode` | string | `chat` (对话) / `settings_schema` (拉取配置) / `apply_config` (提交变更) |
| `trace_id` | string | 由前端生成的 UUID，用于全链路追踪 |

### 1.2 业务状态码 (Business Codes)
- `2000`: 成功
- `4001`: 后端依赖安装失败
- `4002`: 网关重启中 (提示用户等待)
- `4003`: 配对授权已失效

---

## 2. 数据映射规范 (Data Mapping)

### 2.1 动态 UI 映射 (SDUI)
当 `mode: "settings_schema"` 时，后端返回的 `data.ui_components` 数组必须映射为以下前端零件：

- `type: "switch"` -> 渲染精美开关 (控制 `#` 注释)。
- `type: "select"` -> 渲染下拉菜单 (控制变量赋值)。
- `type: "text"`   -> 渲染文本输入框 (控制复杂参数)。

### 2.2 流式 Chunk 拦截
前端 `onUpdate` 必须具备 **“前缀感知能力”**：
- 如果 Chunk 包含 `💻` -> 路由到“终端执行日志”视图。
- 如果 Chunk 包含 `🔍` -> 路由到“搜索进度”视图。
- 普通文本 -> 路由到标准 Markdown 聊天气泡。

---

## 3. 开发约束
- 禁止在 Provider 中硬编码任何功能名称。
- 所有功能开关必须通过后端 Schema 动态生成。
- 重启期间必须捕获网络异常，并自动触发轮询检查。
