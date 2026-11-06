# 静态数据湖仓教程网站 Spec

## Why
用户需要一个系统介绍「数据湖仓一体架构师」完整技术栈的教程网站，覆盖从存储表格式到可观测性、数据治理与高阶场景的全链路知识，作为学习路线与岗位能力对照的参考资料。要求为纯静态网站，无构建依赖、可直接浏览器打开。

## What Changes
- 新建纯静态多页面教程网站，全部置于 `site/` 目录（HTML + CSS + 原生 JS，零构建、零外部依赖）
- 共 12 个页面，按 JD 的六层技术栈 + 治理 + 调优 + 场景 + 岗位成长组织内容
- 统一顶部导航（当前页高亮）、统一视觉风格（现代技术文档风、响应式、代码块高亮样式）
- 每个技术组件内容包含：**架构定位 → 核心概念 → 关键配置/代码示例 → 调优要点 → 适用边界**

## Impact
- Affected specs: 无（全新项目）
- Affected code: 全部为新增文件，位于 `d:\2026Tide\datahucan2027\site\`
  - `site/index.html` 首页与学习路线
  - `site/architecture.html` 湖仓一体总体架构
  - `site/storage.html` 存储与表格式层
  - `site/compute.html` 计算引擎层
  - `site/query.html` 查询引擎层
  - `site/integration.html` 数据集成层
  - `site/scheduling.html` 调度与资源层
  - `site/observability.html` 可观测性层
  - `site/governance.html` 数据治理与规范
  - `site/optimization.html` 性能调优实战
  - `site/scenarios.html` 高阶场景实战
  - `site/career.html` 岗位能力与进阶
  - `site/css/style.css`、`site/js/main.js` 共享资源

## ADDED Requirements

### Requirement: 教程网站页面结构
系统 SHALL 提供 12 个静态 HTML 页面，完整覆盖 JD 全部技术栈：

| 页面 | 覆盖内容（对应 JD） |
|---|---|
| index | 湖仓一体简介、学习路线图、技术栈全景 |
| architecture | 分层架构设计、批流一体、Palantir 体系支撑、技术选型方法论 |
| storage | Apache Iceberg、HDFS、S3/MinIO、Hive Metastore、表格式原理、多引擎能力边界 |
| compute | Apache Spark、Apache Flink、批流一体架构与调优 |
| query | Trino、Apache Doris、ClickHouse、查询加速 |
| integration | Apache Kafka、Flink CDC、实时链路架构与容量规划 |
| scheduling | DolphinScheduler、YARN、DAG 编排、资源隔离 |
| observability | Prometheus、Grafana、Filebeat/ES/Kibana（EFK）、指标体系、告警规则 |
| governance | 入湖规范、质量校验、权限体系、冷热策略、生命周期、灾备恢复 |
| optimization | 小文件治理、Compaction 调度、查询加速、资源隔离、瓶颈排查、容量规划 |
| scenarios | 情报研判、AI 向量检索、时序分析、GIS 时空、图计算、本体建模 |
| career | 架构师能力模型、信创 PG 适配、AI+湖仓融合、面试要点 |

#### Scenario: 用户浏览教程
- **WHEN** 用户直接双击打开 `site/index.html`
- **THEN** 网站正常渲染，无需服务器或网络，导航可跳转到全部 12 个页面

#### Scenario: 技术组件学习
- **WHEN** 用户进入任一技术层页面（如 storage.html）
- **THEN** 页面按「架构定位 → 核心概念 → 配置/代码示例 → 调优要点 → 适用边界」组织，含可读的代码示例块

### Requirement: 静态与零依赖
网站 SHALL 为纯静态实现：
- 仅使用 HTML/CSS/原生 JavaScript，不引入任何外部 CDN 资源、框架或构建工具
- 所有页面间链接为相对路径，本地文件协议（file://）下可正常工作
- 无搜索功能等需要服务端/索引的复杂特性（保持简单）

### Requirement: 统一视觉与导航
- 顶部导航栏展示全部页面入口，当前访问页面高亮
- 响应式布局（桌面双栏内容+侧锚点、窄屏单栏折叠导航）
- 统一代码块样式、表格样式、架构图（内联 SVG/CSS 绘制）风格

## MODIFIED Requirements
无（全新项目）。

## REMOVED Requirements
无。
