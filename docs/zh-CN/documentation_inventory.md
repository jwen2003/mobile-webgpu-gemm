# 文档覆盖清单与维护方式

本轮基于已跟踪 Markdown 建立中英文对应，旧路径只保留导航。清单含类别、原路径、语言版本和原文快照哈希。

当前正文位于 docs/zh-CN 与 docs/en，报告位于 report/zh-CN 与 report/en；图表、JSON 和源码共享。docs/history/original 保存整理前原文，不是第二份当前正文。原始 assignment、第三方原文、既有核验和原始 JSON 不翻译或改写；邮件、模型和私有原文不纳入清单。

自动报告及附录由 render_bilingual_docs.py 从同一 stage_delivery_data.json 展示，双语正文由 documentation_content.py 维护。build_stage_report.py 仍使用原统计与核验，仅展示委托新生成器；plot_stage_report.py 不改数据或共享图。修改人工说明应编辑正文模板，重新生成会覆盖展示文件。

本轮事实修正是状态与范围的澄清：早期 20/100 是计划、实际受控采样 10/30；早期 texture 未覆盖后来由 MEMORY001 补齐；NOT_RUN 不冒充当前状态；Adreno/有效逻辑 shape 等缺口不关闭。没有修改原有统计数值、阈值或计算契约。

## 接下来读什么

- [项目阅读指南](reading_guide.md)
- [证据与公开范围索引](evidence_index.md)
- [复现与离线核验](reproduction.md)

## 来源与维护

[人工维护的双语正文](../../scripts/documentation_content.py) · [展示生成器](../../scripts/render_bilingual_docs.py)

|Category|Original|Chinese|English|Historical SHA256|
|---|---|---|---|---|
|current-explanation|[README.md](../../README.md)|[README.md](README.md)|[README.md](../en/README.md)|8860e47a8d603e342613e99c84f9b58b5256736f483011770c836288e9c5f6b8|
|method-or-results|[README.md](../../assets/models/README.md)|[model_preparation.md](model_preparation.md)|[model_preparation.md](../en/model_preparation.md)|4803345fc25182cf54b8b71515327631f8687576ad3d2d8330c08d5f33b1b22e|
|method-or-results|[adb_memory_sampling_plan.md](../adb_memory_sampling_plan.md)|[adb_memory_sampling_plan.md](adb_memory_sampling_plan.md)|[adb_memory_sampling_plan.md](../en/adb_memory_sampling_plan.md)|3106adfcc1791e06d9d4ee715d98f8c406a6ac756d54aec249a47dd57af16d7e|
|historical-record|[archive_validation.md](../archive_validation.md)|[archive_validation.md](archive_validation.md)|[archive_validation.md](../en/archive_validation.md)|1319f70eda244c00d49d73bda80511406052bf63406b96aa41eba99645480c34|
|current-explanation|[assignment_requirements_matrix.md](../assignment_requirements_matrix.md)|[assignment_requirements_matrix.md](assignment_requirements_matrix.md)|[assignment_requirements_matrix.md](../en/assignment_requirements_matrix.md)|f07d337fc87f3f0b9ce1cab7d16cbfd06225e7d80c59838c9e738a78c4847946|
|historical-record|[baseline002_work_summary.md](../baseline002_work_summary.md)|[baseline002_work_summary.md](baseline002_work_summary.md)|[baseline002_work_summary.md](../en/baseline002_work_summary.md)|2c0e3f45dcda23a1da129e38a86a0e4650f73be4f7969696f8257d33f9ce75de|
|method-or-results|[baseline_sessions_plan.md](../baseline_sessions_plan.md)|[baseline_sessions_plan.md](baseline_sessions_plan.md)|[baseline_sessions_plan.md](../en/baseline_sessions_plan.md)|e6c209b19ed715c7e297a942c201fc9c683ee3e550cd7af0748218dcba84a1b8|
|current-report|[baseline_sessions_results.md](../baseline_sessions_results.md)|[baseline_sessions_results.md](baseline_sessions_results.md)|[baseline_sessions_results.md](../en/baseline_sessions_results.md)|1f57c80ed42834dd423a208f4b9d44f9c1c8524c73071eef5b28b2b2a3022523|
|current-explanation|[environment.md](../environment.md)|[environment.md](environment.md)|[environment.md](../en/environment.md)|0784d8baff01d2561069eee8f924e85337a88f727e88c60ef27ba8ea8b8f5017|
|historical-record|[experiment_log.md](../experiment_log.md)|[experiment_log.md](experiment_log.md)|[experiment_log.md](../en/experiment_log.md)|bbee4ca446ca5152bee752d02f203ac8006853a521e5938af6830711b6f054f8|
|method-or-results|[experiment_template.md](../experiment_template.md)|[experiment_template.md](experiment_template.md)|[experiment_template.md](../en/experiment_template.md)|10dfeb31dff4d294d0b20666f76e122d88b9676a2f218af1b0284b65a9c42c14|
|method-or-results|[gemm004_shape_proof.md](../gemm004_shape_proof.md)|[gemm004_shape_proof.md](gemm004_shape_proof.md)|[gemm004_shape_proof.md](../en/gemm004_shape_proof.md)|18defaf4c7bfcb6f02765450c4e5bab1e6b8817537e94bfb63ec737e5d48137b|
|contract|[measurement_contract.md](../measurement_contract.md)|[measurement_contract.md](measurement_contract.md)|[measurement_contract.md](../en/measurement_contract.md)|4c7c510ffafce3644830cae3ce41b7adb1ac2ba613ca5b0334e64e3475d81b80|
|method-or-results|[memory001_texture_accounting.md](../memory001_texture_accounting.md)|[memory001_texture_accounting.md](memory001_texture_accounting.md)|[memory001_texture_accounting.md](../en/memory001_texture_accounting.md)|ab1ca778e9c1b9626a8951b851ef2b86f61ccd6960fd69445f7f19d06b975bc3|
|method-or-results|[memory002_capture_protocol.md](../memory002_capture_protocol.md)|[memory002_capture_protocol.md](memory002_capture_protocol.md)|[memory002_capture_protocol.md](../en/memory002_capture_protocol.md)|f14354e0cb803e95d9efb211be07ec18d15ea40b46ea2d04c237c66d41d5aad9|
|historical-record|[memory002_pilot_results.md](../memory002_pilot_results.md)|[memory002_pilot_results.md](memory002_pilot_results.md)|[memory002_pilot_results.md](../en/memory002_pilot_results.md)|d234495e8299485b5996a173e996169bdd4842ff3f4c4bf69d1201260dec0940|
|current-report|[memory002_v2_pilot_results.md](../memory002_v2_pilot_results.md)|[memory002_v2_pilot_results.md](memory002_v2_pilot_results.md)|[memory002_v2_pilot_results.md](../en/memory002_v2_pilot_results.md)|3276e28041580498366bdc217702c9f4746f891011b58af61eedc6fde718bff2|
|method-or-results|[model_shape_recovery.md](../model_shape_recovery.md)|[model_shape_recovery.md](model_shape_recovery.md)|[model_shape_recovery.md](../en/model_shape_recovery.md)|003b94da32660976733c44c1d96bb34f23985f8e169129c49cf20318cc79e4fc|
|contract|[part2_compute_contract.md](../part2_compute_contract.md)|[part2_compute_contract.md](part2_compute_contract.md)|[part2_compute_contract.md](../en/part2_compute_contract.md)|48b6dcbeb750d9bd9fc5d70f03afa3bac803c4abec025205cc7f99ddc636a6ac|
|method-or-results|[part2_fused_d.md](../part2_fused_d.md)|[part2_fused_d.md](part2_fused_d.md)|[part2_fused_d.md](../en/part2_fused_d.md)|18331d5334cf9752834ed4297a16303fb2fed83bb9fa8227a84f2e4379ae20bf|
|method-or-results|[part2_q8.md](../part2_q8.md)|[part2_q8.md](part2_q8.md)|[part2_q8.md](../en/part2_q8.md)|3e81f1fe41a8e1156e6ff3b352b6799dda2a9feadb275453de8f94578a685463|
|method-or-results|[part2_repeat_plan.md](../part2_repeat_plan.md)|[part2_repeat_plan.md](part2_repeat_plan.md)|[part2_repeat_plan.md](../en/part2_repeat_plan.md)|1b15b6cf12149b3091ee23596ba6ab6e18017074bfac2d0c78e9376a13c59681|
|current-report|[part2_repeat_results.md](../part2_repeat_results.md)|[part2_repeat_results.md](part2_repeat_results.md)|[part2_repeat_results.md](../en/part2_repeat_results.md)|c87efe6b7167a7a035bfeacd3fa582e8c1bcf70a1f7188b42801b2313e0e6b1c|
|method-or-results|[part2_sweep_plan.md](../part2_sweep_plan.md)|[part2_sweep_plan.md](part2_sweep_plan.md)|[part2_sweep_plan.md](../en/part2_sweep_plan.md)|db137e8aacd1794e4bcefecb1ef1925e9e9159a2edfb9a2b9216f9ebf556a292|
|current-report|[part2_sweep_results.md](../part2_sweep_results.md)|[part2_sweep_results.md](part2_sweep_results.md)|[part2_sweep_results.md](../en/part2_sweep_results.md)|fb635a5330caf7f5c215080553dadd3c5f593609cc7c3f65dd28f5bbfa2cf4a7|
|method-or-results|[part2_vectorized_c.md](../part2_vectorized_c.md)|[part2_vectorized_c.md](part2_vectorized_c.md)|[part2_vectorized_c.md](../en/part2_vectorized_c.md)|d0508a374a08d094087f72125a55d7f37dfed1bca9b9992b44f07d38aa0285da|
|method-or-results|[profile002_shader_analysis.md](../profile002_shader_analysis.md)|[profile002_shader_analysis.md](profile002_shader_analysis.md)|[profile002_shader_analysis.md](../en/profile002_shader_analysis.md)|08b10fc7a64e68c24c27589def490a6aeac16278f04b7a18d8e43384d5d6efa4|
|method-or-results|[profile003_overlap_review.md](../profile003_overlap_review.md)|[profile003_overlap_review.md](profile003_overlap_review.md)|[profile003_overlap_review.md](../en/profile003_overlap_review.md)|e6c311a5c5298d20c6afc44648716085327f1252922fd55a02a25525e38c1d12|
|method-or-results|[profiling_capabilities.md](../profiling_capabilities.md)|[profiling_capabilities.md](profiling_capabilities.md)|[profiling_capabilities.md](../en/profiling_capabilities.md)|3104722c09356c4a1ce90221a919da57b629ee984e274522036408361aa7d88b|
|method-or-results|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|[remaining_metrics_feasibility.md](remaining_metrics_feasibility.md)|[remaining_metrics_feasibility.md](../en/remaining_metrics_feasibility.md)|10606ac27014c1c45fdd5617a38b15c2b19402e4f3e0210c3f33711b04dc4629|
|current-explanation|[requirements.md](../requirements.md)|[requirements.md](requirements.md)|[requirements.md](../en/requirements.md)|9e1e06c5106b3039cebe01cef21bc755bdcae89ee0b98e50342509024b1431a8|
|method-or-results|[timestamp_validity.md](../timestamp_validity.md)|[timestamp_validity.md](timestamp_validity.md)|[timestamp_validity.md](../en/timestamp_validity.md)|d05c3cca915ac1c00753d83ccd2a60426449d320ee148e24d3c79ceb2884ccef|
|method-or-results|[trace001_availability.md](../trace001_availability.md)|[trace001_availability.md](trace001_availability.md)|[trace001_availability.md](../en/trace001_availability.md)|ec9acc370e480480a3481ec8a95c4a9c10a47623a6978828aa5841c5432d74fa|
|current-report|[performance_report.md](../../report/performance_report.md)|[performance_report.md](../../report/zh-CN/performance_report.md)|[performance_report.md](../../report/en/performance_report.md)|f036758aa4668da83a3b7eb2f3bf5ca4d8fac3f67515237931f535157bc98fda|
