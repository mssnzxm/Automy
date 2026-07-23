# 技术架构迁移：Eino ADK → AgentScope Java 2.0 Spec

> Change-ID: `migrate-to-agentscope-java-2`
> 版本：v1.0
> 日期：2026-07-23
> 类型：技术架构选型变更（文档/原型站层面）
> 关联前置：`automy-docs-prototype-site`（站点已交付，本次在其基础上做框架选型替换）

---

## 一、Why（变更背景与目标）

前置 spec `automy-docs-prototype-site` 将 Automy 平台的智能体编排框架选型从 LangGraph 调整为 **Eino ADK**（字节跳动 Go 框架），理由是"对齐 Go 技术栈、避免 Python 桥接"。

但实际团队主技术栈为 **Java**（JVM 生态、Spring Boot 微服务、K8s 部署），Eino ADK 的 Go 选型与团队既有工程体系存在以下错位：

1. **语言栈不匹配**：团队无 Go 研发储备，引入 Eino 需重新构建 Go 工具链、CI 流水线、可观测埋点规范；
2. **微服务集成成本高**：团队既有 Spring Cloud / Nacos / Higress 体系，Eino 无法原生融入，需自建 gRPC/Spring 桥接层；
3. **运维复杂度上升**：Go + Python（部分 LLM 工具链）+ Java（业务系统）三语言并存，违背"减法"原则。

阿里达摩院已于 2026-07 GA 发布 **AgentScope Java 2.0**（JDK 17+、Apache-2.0、基于 Project Reactor 的响应式企业级 Agent 框架），原生支持：

- **Spring Boot 嵌入**：可无缝接入团队既有 Spring 微服务体系；
- **Harness 工程化层**：Workspace / Session / Memory / Sandbox / Skill / Subagent 内置，企业级分布式开箱即用；
- **多租户隔离**：`userId` / `sessionId` 贯穿 workspace 命名空间、KV、沙箱；
- **MCP / A2A 协议原生支持**：直接对接 Automy 既有的 MCP 服务集成层；
- **OpenTelemetry 内置**：对齐团队既有可观测体系（LangFuse / ARMS）；
- **多 Agent 编排**：Supervisor (Leader-Worker) 模式替代 Eino 的 Graph DAG。

因此本次变更将技术架构文档与产品原型站中所有"Eino ADK"相关技术方案**整体替换**为 AgentScope Java 2.0，使技术架构选型与团队 Java 技术栈对齐。

---

## 二、What Changes（变更概览）

### 改造范围
- **BREAKING**：智能体编排框架从 `Eino ADK` 替换为 `AgentScope Java 2.0`（含 ReActAgent / HarnessAgent / 多 Agent 编排）。
- 技术架构文档区"智能体运行时"章节重写（标题、组件图、时序图、选型对比、代码示例）。
- 系统设计、概览、记忆系统、技能系统、MCP 协议、部署等架构章节中所有 Eino 引用同步替换。
- 后端主语言从 `Go` 调整为 `Java（JDK 17+）`；移除 Go 相关部署/构建描述。
- 模型网关、向量库、关系库、对象存储等基础设施选型保持不变（与框架无关）。
- 技能执行沙箱从 Firecracker MicroVM 调整为 AgentScope 内置 Sandbox（Docker 沙箱 + 对象存储快照）。
- 路线图、术语表、搜索索引、首页等同步更新涉及 Eino 的条目。
- 原型页面中涉及"Eino"字样、组件名（如"Eino Graph"）的文案/标签同步替换。

### 不在本次范围（明确排除）
- 不修改 `enterprise-agent-platform` spec（其本身使用 LangGraph 而非 Eino，已偏离当前路线）；
- 不重写需求文档的功能性需求条目（业务能力不变，仅技术实现路径调整）；
- 不变更静态站点本身的工程结构（HTML/CSS/JS 技术栈不变）；
- 不引入真实后端代码实现（仍是文档+原型站）。

---

## 三、Impact（影响范围）

### 受影响 specs
- `automy-docs-prototype-site`：其"关键调整"段将 Eino ADK 改为 AgentScope Java 2.0，需在该 spec 追加"被 `migrate-to-agentscope-java-2` 替代框架选型"说明（本次只追加 note，不重写）。

### 受影响代码/资源（automy-site 静态站）
- **架构文档 HTML**（核心改造区）：
  - `docs/architecture/overview.html`（总体架构图、章节导航）
  - `docs/architecture/system-design.html`（分层图、时序图、服务清单表）
  - `docs/architecture/agent-runtime.html`（**Eino ADK 专题 → AgentScope Java 2.0 专题**，整章重写）
  - `docs/architecture/memory-system.html`（记忆抽象组件名）
  - `docs/architecture/skill-system.html`（`runtime: eino-graph` → `agentscope-harness`，沙箱方案）
  - `docs/architecture/mcp-protocol.html`（工具/Tool 抽象对接 MCP）
  - `docs/architecture/deployment.html`（部署形态：Go→Java，Spring Boot K8s）
  - `docs/architecture/architecture-goals.html`（如提及 Eino）
- **需求文档 HTML**：仅替换涉及 Eino 的技术性表述（如 `REQ-3.x` 章节内引用）。
- **首页 / 路线图 / 术语表**：
  - `index.html`（首页核心能力卡片/技术栈卡片如涉及）
  - `docs/roadmap.html` + `assets/data/roadmap.json`（M3 里程碑描述）
  - `docs/glossary.html` + `assets/data/glossary.json`（Eino / ADK 术语条目替换为 AgentScope / Harness）
- **搜索索引**：`assets/data/search-index.json`（重建涉及 Eino 的标题/摘要/锚点）
- **原型页面**：如 `prototype/workspace/index.html` 等含"Eino Graph"/"Eino ADK"标签处
- **全局脚本**：`assets/js/app.js`（如硬编码 Eino 关键词的路由/搜索逻辑）
- **共享组件**：`shared/components.html`（如导航/卡片含 Eino 链接）

---

## 四、技术映射表（Eino ADK → AgentScope Java 2.0）

| 概念 | Eino ADK（旧） | AgentScope Java 2.0（新） |
|------|----------------|--------------------------|
| 后端主语言 | Go | Java（JDK 17+） |
| Agent 推理内核 | Eino Agent（ReAct） | ReActAgent（基于 Project Reactor） |
| 工程化底座 | 自研（无统一抽象） | HarnessAgent（Workspace/Session/Memory/Sandbox/Skill/Subagent） |
| 线性编排 | Chain | ReActAgent + SequentialAgent pipeline |
| DAG 图编排 | Graph（DAG） | Multi-Agent Supervisor (Leader-Worker) + A2A 协议 |
| 模型抽象 | ChatModel 接口 | Model 抽象（QwenConfig / DashScope / OpenAI 兼容） |
| 工具抽象 | Tool 接口 | `@Tool` 注解 + Toolkit（自动生成 JSON Schema） |
| 记忆抽象 | Memory 接口 | Workspace + `MEMORY.md` + Redis Session（自动合并/压缩） |
| 检索抽象 | Retriever 接口 | `knowledge/` + RAG 索引 |
| 文档加载 | Loader 接口 | AbstractFilesystem 统一抽象 |
| 沙箱执行 | Firecracker MicroVM | 内置 Sandbox（本地磁盘 → Docker → 对象存储，一行切换） |
| 多租户隔离 | 自研 | userId/sessionId 贯穿 workspace/KV/沙箱 |
| 可观测 | OpenTelemetry（需自接） | OpenTelemetry 内置（对接 LangFuse / ARMS） |
| 生态扩展 | eino-ext | MCP 生态 + Nacos（服务/Skill 市场）+ Higress（网关） |
| 微服务集成 | gRPC 桥接 Spring | 原生 Spring Boot 嵌入 + Spring Cloud/Nacos |
| 分布式会话 | 自研（外部状态存储） | Redis Session + Workspace 快照，零停机滚动发布 |
| 协议支持 | MCP（需自适配） | MCP + A2A 原生 |
| 流式优先 | Stream API | Project Reactor 响应式流（非阻塞高并发） |
| 许可证 | Apache-2.0 | Apache-2.0 |
| 维护方 | 字节跳动 CloudWeGo | 阿里达摩院 |

---

## 五、MODIFIED Requirements（修改后的需求）

### Requirement: 智能体运行时（Agent Runtime）

系统 SHALL 采用 **AgentScope Java 2.0** 作为 Automy 的智能体编排引擎，理由：
- 团队 Java 技术栈对齐（JDK 17+ / Spring Boot 嵌入）；
- Harness 工程化层降低企业级分布式落地成本；
- MCP/A2A 原生支持对齐 Automy MCP 集成层。

架构文档 SHALL 包含 AgentScope Java 2.0 专题章节，覆盖：
1. **框架简介**：来源（阿里达摩院）、GA 时间（2026-07）、JDK 17+/Apache-2.0/Project Reactor 响应式、设计哲学（"模型主导，框架退后"）。
2. **核心组件全景**：ReActAgent 推理内核、Harness 工程化层（Workspace/Session/Memory/Sandbox/Skill/Subagent）、Event/Permission/Middleware 五大系统、Multi-Agent Supervisor 编排、MCP/A2A 协议。
3. **在 Automy 中的落地**：
   - ReActAgent 承担单轮/多步任务规划；
   - HarnessAgent 承担企业级长任务（跨会话记忆、沙箱、可恢复）；
   - Multi-Agent Supervisor 编排"投资分析/法务/HR/会议纪要"专家协同；
   - `@Tool` 注解 + Toolkit 对接 MCP Tool Hub；
   - AbstractFilesystem 对接 MinIO 对象存储 + 本地文档系统；
   - `knowledge/` + RAG 索引对接知识库检索。
4. **与技能/专家层的关系**：
   - 技能 → AgentScope `skills/` 声明式 Skill 文件；
   - 专家 Agent → Multi-Agent 中的 Subagent 声明（Markdown spec）；
   - 技能沙箱 → AgentScope 内置 Sandbox（Docker + 对象存储快照）。
5. **模型网关对接**：通过 Model 抽象对接 LiteLLM / 自研网关，Qwen/DeepSeek/GLM 经 DashScope/OpenAI 兼容接口。
6. **选型对比（vs Eino ADK / vs LangGraph）**：三方对比表，突出 Java 技术栈对齐、Spring 生态融合、Harness 内置、MCP 原生。
7. **局限与对策**：
   - 生态较新（社区文档以英文/阿里云为主）→ 内部沉淀最佳实践；
   - 部分企业系统无现成 Tool 适配 → 通过 MCP Adapter 桥接；
   - Reactive 编程范式门槛 → 团队培训 + 关键路径文档。
8. **可观测**：OpenTelemetry 内置，对接 LangFuse / ARMS，端到端 Trace。

#### Scenario: 多步尽调任务（基于 AgentScope）
- **WHEN** 员工说"帮我分析一下 A 公司，重点看财务和团队"
- **THEN** ReActAgent 规划任务 → 通过 `@Tool` 调用 CRM MCP 服务（财务） + 工商 MCP 服务 → Multi-Agent Supervisor 委派"财务分析 Subagent" 与 "团队评估 Subagent" 并行 → 汇总生成结构化报告，全程经 Event 系统流式回传、Trace 上报 LangFuse。

#### Scenario: 跨端会话续接（基于 Harness）
- **WHEN** 员工在飞书发起会话后切换到 Web 工作台
- **THEN** HarnessAgent 通过 Redis Session + Workspace 快照恢复完整上下文（含对话历史、计划、待办、权限规则），Web 端零感知续接。

---

### Requirement: 技术栈选型表（修订）

架构文档的"技术栈选型表" SHALL 更新为：

| 层级 | 推荐技术 | 说明 |
|------|----------|------|
| 前端 Web | React + TypeScript + Vite + Tailwind + shadcn/ui | 生态成熟、类型安全 |
| 桌面端 | Electron + 复用 Web 资源 | 对齐用户既有技术栈 |
| 后端主语言 | **Java（JDK 17+）** | 对齐团队 Java 技术栈，Spring Boot 微服务 |
| Agent 框架 | **AgentScope Java 2.0** | ReActAgent + HarnessAgent + Multi-Agent，MCP/A2A 原生 |
| 微服务框架 | **Spring Boot + Spring Cloud + Nacos** | 团队既有体系，AgentScope 原生嵌入 |
| API 网关 | **Higress**（AI 网关） | 阿里生态，模型代理 + MCP 代理 + Skill/MCP 市场管理 |
| 模型网关 | LiteLLM / 自研 | 多模型路由、成本管控、限流 |
| LLM | 企业自部署 Qwen / DeepSeek / GLM；可选商用 API | 投资场景优先中文能力强者 |
| 向量库 | Milvus / Qdrant | Milvus 规模化能力强；Qdrant 部署轻 |
| 关系数据库 | PostgreSQL | 支持 pgvector 兜底 |
| 文档存储 | MinIO（S3 兼容） | 私有化对象存储 |
| Session 存储 | **Redis**（AgentScope Harness 分布式 Session） | 跨副本会话恢复 |
| 记忆库 | PostgreSQL + 向量库 + Redis | 三层记忆组合（对齐 AgentScope Workspace + MEMORY.md） |
| 消息队列 | NATS / Redis Streams | 异步任务、事件（对齐 AgentScope Event 系统） |
| MCP | AgentScope 原生 MCP 客户端 + 自研 Adapter | 标准化企业服务暴露 |
| 部署 | Docker + Kubernetes / Docker Compose（小规模） | 支持 K8s 弹性扩缩，AgentScope 分布式原生 |
| 监控 | Prometheus + Grafana + Loki | 指标 + 日志 |
| 链路追踪 | OpenTelemetry（AgentScope 内置）+ LangFuse / ARMS | Agent trace 可观测 |
| 认证 | Keycloak（SSO/OIDC/SAML/LDAP） | 企业级 IAM |

---

### Requirement: 部署形态（修订）

架构文档的"部署架构"章节 SHALL 调整为：
- **私有化单机版**（试用）：Spring Boot fat-jar + Docker Compose（PostgreSQL + Milvus + MinIO + Redis + NATS）；
- **私有化集群版**（生产）：K8s + Spring Cloud + Nacos 服务注册 + Higress 网关 + 高可用 PG/Milvus/MinIO/Redis；
- **全离线**：模型与公共 Skill/MCP 镜像离线导入，MCP 服务内网部署；
- **可观测**：OpenTelemetry Collector + LangFuse（或 ARMS）统一 Trace。

---

### Requirement: 技能执行沙箱（修订）

技能执行架构 SHALL 从 Firecracker MicroVM 调整为 AgentScope 内置 Sandbox：
- 单机：本地磁盘沙箱（`workspace/skills/<skill_id>/`）；
- 生产：Docker 沙箱 + 对象存储快照（MinIO），跨副本可恢复；
- 沙箱内置权限管控（Permission 系统），工具调用按需审批（`ApprovalMode.ALWAYS` / `ONCE` / `NEVER`）；
- 技能 spec 文件从 `workflow.yaml`（Eino Graph）调整为 AgentScope `skills/*.md`（声明式 Skill 定义）。

---

## 六、迁移验收标准

- [ ] 全站不再出现 "Eino"、"Eino ADK"、"eino-graph"、"cloudwego/eino" 等字样（除"选型对比"章节的对照表外）；
- [ ] `agent-runtime.html` 完整重写为 "AgentScope Java 2.0 专题"；
- [ ] 所有 Mermaid 图中节点名同步替换（如 `Eino ADK` → `AgentScope Runtime`、`Eino Graph` → `Skill / Subagent`）；
- [ ] 技术栈选型表、部署形态、沙箱方案、模型网关对接说明均已更新；
- [ ] 路线图 M3 描述、术语表 Eino/ADK 条目、搜索索引同步刷新；
- [ ] 原型页面中"Eino"标签/文案替换为对应 AgentScope 概念；
- [ ] `automy-docs-prototype-site/spec.md` 追加"框架选型已被 `migrate-to-agentscope-java-2` 替代为 AgentScope Java 2.0"说明（最小改动，仅 note）。

---

## 七、风险与对策

| 风险 | 对策 |
|------|------|
| AgentScope Java 2.0 较新（2026-07 GA），公开资料相对有限 | 架构文档标注"基于官方文档与公开技术分享整理"，引用 java.agentscope.io 官方文档链接，留待实施期校准 |
| 团队 Reactive 编程经验不足 | 路线图新增 M2.5 "AgentScope Java 2.0 + Project Reactor 团队赋能" 里程碑 |
| 与既有 Spring 体系的边界划分（业务微服务 vs Agent 运行时） | 架构文档新增章节明确：业务微服务保持 Spring Boot，Agent 编排独立部署 HarnessAgent 服务，通过 A2A/MCP 解耦 |
| 部分企业系统无 AgentScope Tool 适配 | 通过 MCP Adapter 桥接（与既有 MCP 集成层设计一致） |
| 文档与原型信息不一致 | 需求条目编号双向链接 + 原型标注模式校验（沿用既有机制） |

---

## 八、参考资料

- AgentScope Java 官方文档：https://java.agentscope.io
- GitHub：https://github.com/agentscope-ai/agentscope-java
- Release v2.0.0：https://github.com/agentscope-ai/agentscope-java/releases/tag/v2.0.0
- 阿里云社区《AgentScope 2.0 生产可用，企业级 Harness 底座全解析》
- 既有 spec：`automy-docs-prototype-site`、`enterprise-agent-platform`
