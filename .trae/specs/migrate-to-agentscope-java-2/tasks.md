# Tasks · 技术架构迁移：Eino ADK → AgentScope Java 2.0

> 关联 spec：`migrate-to-agentscope-java-2/spec.md`
> 原则：先架构核心章节，再辐射外延章节，最后索引/原型/前置 spec 收口。

---

## 阶段一：核心架构章节重写

- [x] **Task 1：重写 `docs/architecture/agent-runtime.html` 为 AgentScope Java 2.0 专题**（已完成，738 行，5 个 Mermaid 图，术语基准已确立）
  - [ ] SubTask 1.1：替换页面 `<title>`、breadcrumb、H1 为 "智能体运行时（AgentScope Java 2.0）"
  - [ ] SubTask 1.2：重写"一、简介"段（来源、GA 2026-07、JDK 17+/Apache-2.0/Project Reactor、设计哲学"模型主导框架退后"）
  - [ ] SubTask 1.3：重写"二、核心组件"全景 Mermaid 图：ReActAgent / HarnessAgent / Workspace / Session / Memory / Sandbox / Skill / Subagent / Event / Permission / Middleware / MCP / A2A
  - [ ] SubTask 1.4：重写代码示例（Chain/Graph → ReActAgent + SequentialAgent / Supervisor 多 Agent），保留 token 高亮样式
  - [ ] SubTask 1.5：重写"Automy Agent 执行时序"Mermaid 时序图（参与者改为 ReActAgent / HarnessAgent / MCP Hub / Model Gateway / Memory / RAG）
  - [ ] SubTask 1.6：重写"技能/专家层映射"段（技能→`skills/*.md`；专家→Subagent 声明；沙箱→内置 Sandbox）
  - [ ] SubTask 1.7：重写"模型网关对接"Mermaid 图（Model 抽象 → DashScope/OpenAI 兼容 → LiteLLM/网关）
  - [ ] SubTask 1.8：重写"选型对比"章节为三方对比表（AgentScope Java 2.0 / Eino ADK / LangGraph），并更新"选择 AgentScope 的关键原因"列表（Java 技术栈、Spring 融合、Harness 内置、MCP 原生、分布式开箱即用）
  - [ ] SubTask 1.9：重写"局限与对策"段（生态较新/Reactive 门槛/Tool 适配缺口）
  - [ ] SubTask 1.10：更新"OpenTelemetry 可观测"段（对接 LangFuse / ARMS）
  - [ ] SubTask 1.11：检查全章 Mermaid 图渲染（节点名、子图 ID、特殊字符转义），符合 project_memory 的硬约束

- [x] **Task 2：更新 `docs/architecture/system-design.html`**（已完成，Eino 残留 0，含 6 个 SubTask + 1 处 ADK2 节点同步）
  - [ ] SubTask 2.1：总体架构图 Mermaid 中 `ADK["Eino ADK Runtime\n编排引擎"]` → `ADK["AgentScope Runtime\nReActAgent + HarnessAgent"]`
  - [ ] SubTask 2.2：L3 核心层描述段 `基于 Eino ADK` → `基于 AgentScope Java 2.0`，组件清单更新（HarnessAgent / Workspace / Memory / RAG / MCP Hub）
  - [ ] SubTask 2.3：服务调用时序图 Mermaid 参与者 `A as Eino ADK` → `A as AgentScope Runtime`
  - [ ] SubTask 2.4：尽调任务 Mermaid 流程图 `ADK["Eino ADK\nGraph 编排"]` → `ADK["AgentScope\nSupervisor 编排"]`
  - [ ] SubTask 2.5：服务清单表 `Agent Runtime` 行说明 `Eino ADK 编排、工具调用` → `AgentScope ReActAgent + HarnessAgent 编排、@Tool 工具调用`
  - [ ] SubTask 2.6：底部"下一章"链接文案 `智能体运行时(Eino ADK)` → `智能体运行时(AgentScope Java 2.0)`

- [x] **Task 3：更新 `docs/architecture/overview.html`**（已完成，Eino 残留 0，含 12 处 AgentScope 关键词覆盖）
  - [ ] SubTask 3.1：章节导语 `Eino ADK 运行时、记忆系统、知识库、MCP 协议` → `AgentScope 运行时、记忆系统、知识库、MCP 协议`
  - [ ] SubTask 3.2：总体架构图 Mermaid 子图标题 `L3 智能体核心 Agent Core (Eino ADK)` → `L3 智能体核心 Agent Core (AgentScope)`
  - [ ] SubTask 3.3：节点 `C1["Eino ADK 运行时<br/>Chain / Graph"]` → `C1["AgentScope 运行时<br/>ReActAgent + HarnessAgent"]`
  - [ ] SubTask 3.4：技术栈选型表 L3 行说明同步更新
  - [ ] SubTask 3.5：检查其他章节段落是否提及 Eino（如"关键设计要点"），逐一替换

## 阶段二：外延架构章节同步

- [x] **Task 4：更新 `docs/architecture/memory-system.html`**（已完成，新增 AgentScope Harness 记忆映射章节）
  - [ ] SubTask 4.1：Mermaid 图节点 `Agent["Eino ADK Agent"]` → `Agent["AgentScope ReActAgent"]`
  - [ ] SubTask 4.2：补一段说明 AgentScope Harness 的 `MEMORY.md` + Redis Session 与 Automy 三层记忆（事实/偏好/事件）的映射关系
  - [ ] SubTask 4.3：检查全文 Eino 关键词替换

- [x] **Task 5：更新 `docs/architecture/skill-system.html`**（已完成，Firecracker→AgentScope Sandbox，workflow.yaml→skills/*.md，新增 Permission 审批章节）
  - [ ] SubTask 5.1：技能 spec JSON 示例中 `"runtime": "eino-graph"` → `"runtime": "agentscope-harness"`
  - [ ] SubTask 5.2：技能执行架构段 `基于 Eino ADK Graph` → `基于 AgentScope HarnessAgent + Skill 文件`
  - [ ] SubTask 5.3：Mermaid 流程图节点 `LOAD["加载 workflow.yaml<br/>构建 Eino Graph"]` → `LOAD["加载 skills/*.md<br/>构建 HarnessAgent"]`
  - [ ] SubTask 5.4：时序图参与者 `E as Eino Graph 引擎` → `E as AgentScope Harness 引擎`
  - [ ] SubTask 5.5：沙箱架构 Mermaid 图中 `A1["Eino Graph"]` / `B1["Eino Graph"]` → `A1["HarnessAgent"]` / `B1["HarnessAgent"]`，并将 Firecracker MicroVM 标注改为 AgentScope 内置 Sandbox（Docker + 对象存储快照）
  - [ ] SubTask 5.6：示例场景步骤 `沙箱内执行 Eino Graph` → `沙箱内执行 HarnessAgent Skill`
  - [ ] SubTask 5.7：补一段 AgentScope Permission 系统对技能工具调用审批的说明

- [x] **Task 6：更新 `docs/architecture/mcp-protocol.html`**（已完成，Eino/Python 残留 0，新增 A2A 协议双层协作章节）
  - [ ] SubTask 6.1：将 Eino Tool 接口对接 MCP 的描述改为 AgentScope `@Tool` 注解 + Toolkit + 原生 MCP 客户端
  - [ ] SubTask 6.2：Mermaid 图中涉及 Eino Tool 的节点同步替换
  - [ ] SubTask 6.3：补 A2A 协议在 MCP 集成层中的位置说明（如适用）

- [x] **Task 7：更新 `docs/architecture/deployment.html`**（已完成，Go→Java/Spring Boot，新增 HarnessAgent K8s Deployment、Nacos+Higress、LangFuse/ARMS 三节）
  - [ ] SubTask 7.1：部署拓扑图/容器清单中 Go 镜像替换为 Java（JDK 17+）+ Spring Boot
  - [ ] SubTask 7.2：补 AgentScope HarnessAgent 服务的 K8s Deployment 描述（Redis Session、Workspace 快照、滚动发布）
  - [ ] SubTask 7.3：补 Nacos + Higress 在部署形态中的位置
  - [ ] SubTask 7.4：可观测段补 LangFuse / ARMS 接入说明

- [x] **Task 8：检查 `docs/architecture/architecture-goals.html`**（已完成，21 处 Eino + Go 性能描述替换，对比表第三列改为 AgentScope）
  - [ ] SubTask 8.1：搜索 Eino 关键词，如有则替换为对应 AgentScope 概念
  - [ ] SubTask 8.2：技术目标/原则段如提及"Go 性能优势"，调整为"Reactive 响应式非阻塞高并发"

## 阶段三：需求文档与站点外延

- [x] **Task 9：检查并更新需求文档区 `docs/requirements/*.html`**（已完成，仅 im-notification.html 1 处技术表述替换，功能需求条目未触碰）
  - [ ] SubTask 9.1：用 Grep 全量检索 `docs/requirements/` 下 Eino/eino 出现位置
  - [ ] SubTask 9.2：仅替换技术性表述（如 `REQ-3.x 智能体编排引擎` 章节内的 Eino 引用），保留功能性需求条目本身
  - [ ] SubTask 9.3：每条替换后验证上下文连贯

- [x] **Task 10：更新首页 `index.html`**（已完成，3 处 Eino/字节跳动替换为 AgentScope/阿里达摩院）
  - [ ] SubTask 10.1：检索 Eino 关键词
  - [ ] SubTask 10.2：核心能力卡片/技术栈卡片如涉及 Eino/Go，替换为 AgentScope/Java
  - [ ] SubTask 10.3：保持视觉布局与品牌一致

- [x] **Task 11：更新路线图 `docs/roadmap.html` + `assets/data/roadmap.json`**（已完成，Q1 feature 名替换，新增 M2.5 团队赋能里程碑，HTML/JSON 双向同步）
  - [ ] SubTask 11.1：M3 里程碑描述从 `技术架构文档区（含 Eino ADK 专题）` → `技术架构文档区（含 AgentScope Java 2.0 专题）`
  - [ ] SubTask 11.2：新增 M2.5 里程碑 `AgentScope Java 2.0 + Project Reactor 团队赋能`（如路线图有空间）
  - [ ] SubTask 11.3：HTML 与 JSON 双向同步

- [x] **Task 12：更新术语表 `docs/glossary.html` + `assets/data/glossary.json`**（已完成，ADK→AgentScope Java 2.0，新增 6 条术语，Eino 标注已废弃，HTML/JSON 同步 24 条）
  - [ ] SubTask 12.1：移除/重写 "Eino ADK" 术语条目为 "AgentScope Java 2.0"
  - [ ] SubTask 12.2：新增 "Harness"、"ReActAgent"、"Supervisor 多 Agent"、"A2A 协议" 等术语
  - [ ] SubTask 12.3：HTML 与 JSON 双向同步

- [ ] **Task 13：重建搜索索引 `assets/data/search-index.json`**
  - [ ] SubTask 13.1：重新扫描全站生成索引（标题 + 正文摘要 + 锚点）
  - [ ] SubTask 13.2：验证 AgentScope 相关条目可被检索，Eino 残留条目已清除（除选型对比章节）

- [x] **Task 14：检查全局脚本与共享组件**（已完成，app.js 1 处侧边栏标题替换，components.html 无需修改）
  - [ ] SubTask 14.1：`assets/js/app.js` 中如有硬编码 "Eino" 关键词（路由、搜索、过滤逻辑），同步替换
  - [ ] SubTask 14.2：`shared/components.html` 中如导航/卡片含 Eino 链接，同步替换

- [x] **Task 15：检查原型页面 `prototype/**/*.html`**（已完成，全目录无 Eino 引用，无需修改）
  - [ ] SubTask 15.1：Grep 全量检索 `prototype/` 下 Eino/eino 出现位置
  - [ ] SubTask 15.2：替换标签/文案（如 "Eino Graph" → "HarnessAgent Skill"、"Eino ADK" → "AgentScope"）
  - [ ] SubTask 15.3：保持原型交互与视觉一致

## 阶段四：前置 spec 收口与最终校验

- [x] **Task 16：在 `automy-docs-prototype-site/spec.md` 追加替代说明**（已完成，第 24 行追加 blockquote note，原 spec 内容未改）
  - [ ] SubTask 16.1：在"关键调整"段后追加 note：`注：智能体编排框架选型已于 2026-07-23 被 change-id `migrate-to-agentscope-java-2` 替代为 AgentScope Java 2.0（对齐团队 Java 技术栈）`
  - [ ] SubTask 16.2：最小改动，不重写原 spec 内容

- [x] **Task 17：全站最终扫描与回归**（已完成，Grep 验证零残留，修复遗漏的 im-channels.html，checklist 27/30 通过，3 项需手动可视化验证）
  - [ ] SubTask 17.1：Grep 全站 `Eino|eino` 关键词（排除 `.trae/specs/migrate-to-agentscope-java-2/` 与 `agent-runtime.html` 选型对比章节），确认零残留
  - [ ] SubTask 17.2：本地启动站点（`npx serve automy-site` 或 `vite dev`）逐章点击架构文档，验证 Mermaid 渲染、链接跳转、搜索检索
  - [ ] SubTask 17.3：截图存档关键页面（agent-runtime / system-design / overview / skill-system）
  - [ ] SubTask 17.4：填写 `checklist.md` 验收清单

---

# Task Dependencies

- Task 1（agent-runtime 重写）是核心，**先行**，其术语/组件名定义将作为其他任务的参照基准
- Task 2/3/4/5/6/7/8（外延架构章节）依赖 Task 1 的术语对齐，可**部分并行**（不同文件无冲突）
- Task 9（需求文档）依赖 Task 1，独立分支
- Task 10/11/12/13/14/15（站点外延）依赖 Task 1-8 完成，可**并行**
- Task 16（前置 spec note）独立，可任何时候执行
- Task 17（最终校验）依赖全部前置任务完成

## 建议并行分组
- **并行组 A**：Task 1（核心重写，串行子任务）
- **并行组 B**（Task 1 完成后）：Task 2 + Task 3 + Task 4 + Task 5 + Task 6 + Task 7 + Task 8 + Task 9
- **并行组 C**（B 完成后）：Task 10 + Task 11 + Task 12 + Task 14 + Task 15
- **串行收尾**：Task 13（索引重建，需待内容稳定）→ Task 16 → Task 17
