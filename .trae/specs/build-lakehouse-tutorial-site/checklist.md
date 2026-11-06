# Checklist

- [x] 网站包含 12 个静态 HTML 页面，页面覆盖与 spec 表格一致
- [x] 每个技术组件内容包含：架构定位、核心概念、关键配置/代码示例、调优要点、适用边界
- [x] 内容覆盖 JD 全部技术栈：Iceberg/HDFS/S3-MinIO/Hive Metastore、Spark/Flink、Trino/Doris/ClickHouse、Kafka/Flink CDC、DolphinScheduler/YARN、Prometheus/Grafana/Filebeat-ES-Kibana
- [x] 治理章节覆盖：入湖规范、质量校验、权限体系、冷热策略、数据生命周期、灾备恢复
- [x] 调优章节覆盖：小文件治理、Compaction 调度、查询加速、资源隔离、瓶颈排查、容量规划
- [x] 高阶场景覆盖：AI 向量检索、时序分析、GIS 时空、图计算、本体建模、多模数据治理
- [x] 纯静态零依赖：无 CDN/框架/构建工具，file:// 直接打开 index.html 可正常浏览
- [x] 统一导航栏且当前页高亮，全部页面间链接有效（无 404、无空链接）
- [x] 响应式布局正常（桌面与窄屏），代码块样式清晰可读
- [x] 加分项内容覆盖：信创 PG 适配、AI+湖仓融合底座

# 验证记录（2026-11-05）
- 静态校验（PowerShell 全量扫描 12 页）：无外部资源引用、无死链、toc 锚点与标题 id 一一对应、CSS/JS 引用齐全、导航结构完整 —— 全部通过
- 浏览器渲染验证（本地 HTTP 服务 + 截图）：首页 12 导航项可见且高亮、卡片网格/学习路线分层条/深色代码块渲染正常；storage.html 导航高亮、左侧本页导航存在、表格与代码块渲染正常 —— 全部 PASS
