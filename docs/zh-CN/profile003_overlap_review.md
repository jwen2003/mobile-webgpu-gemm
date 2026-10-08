# PROFILE003 离线重叠审查

离线核对相邻时间戳、提交关联和查询生命周期，不改变原始区间来制造可加和结果。

检查 query index 唯一性、resolve/copy 晚于写入、重复 submit、stale read 和 BigInt 单位转换，未找到可证明解释全部重叠的实现 bug。相邻区间按同 command buffer、同 submit、跨 submit 分类，完整诊断与异常 ID 保存在共享数据。

重叠不能仅因小于一个网格就归因为量化；较大重叠也实际存在。后续 TIMING002 在独立 vector-add 对照复现。当前 PROFILE003 不用于独占 kernel 排名、加和 breakdown 或瓶颈定位。

## 接下来读什么

- [时间戳有效性与收敛结论](timestamp_validity.md)
- [TRACE001 数据源可用性结论](trace001_availability.md)

## 来源与维护

[整理前历史原文（当时状态）](../history/original/docs/profile003_overlap_review.md)。

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)
