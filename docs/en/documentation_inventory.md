# Documentation inventory and maintenance

This reorganization maps tracked Markdown to Chinese/English counterparts. Old paths retain navigation only. The inventory includes categories, original paths, language versions, and snapshot hashes.

Current prose lives in docs/zh-CN and docs/en; reports live in report/zh-CN and report/en. Figures, JSON, and source are shared. docs/history/original preserves pre-reorganization text, not a second current body. Assignment originals, third-party text, existing verification, and raw JSON are not translated or rewritten; emails, models, and private originals are excluded.

Reports and appendices are rendered by render_bilingual_docs.py from the same stage_delivery_data.json. Bilingual prose is maintained in documentation_content.py. build_stage_report.py retains its original statistics and validation, delegating only presentation to the new renderer. plot_stage_report.py does not alter data or shared figures. Edit prose templates rather than generated files, since regeneration overwrites presentation.

Clarifications concern status and scope: early 20/100 was proposed, while controlled sampling uses 10/30; the earlier texture gap was later covered by MEMORY001; historical NOT_RUN is not current status; Adreno/effective logical-shape gaps remain open. No established numbers, tolerances, or computation contracts were changed.

## Read next

- [Reading guide](reading_guide.md)
- [Evidence and publication-scope index](evidence_index.md)
- [Reproduction and offline verification](reproduction.md)

## Sources and maintenance

[Manually maintained bilingual prose](../../scripts/documentation_content.py) · [Presentation renderer](../../scripts/render_bilingual_docs.py)

|Category|Original|Chinese|English|Historical SHA256|
|---|---|---|---|---|
|current-explanation|[README.md](../../README.md)|[README.md](../zh-CN/README.md)|[README.md](README.md)|8860e47a8d603e342613e99c84f9b58b5256736f483011770c836288e9c5f6b8|
|method-or-results|[README.md](../../assets/models/README.md)|[model_preparation.md](../zh-CN/model_preparation.md)|[model_preparation.md](model_preparation.md)|4803345fc25182cf54b8b71515327631f8687576ad3d2d8330c08d5f33b1b22e|
|method-or-results|[adb_memory_sampling_plan.md](../adb_memory_sampling_plan.md)|[adb_memory_sampling_plan.md](../zh-CN/adb_memory_sampling_plan.md)|[adb_memory_sampling_plan.md](adb_memory_sampling_plan.md)|3106adfcc1791e06d9d4ee715d98f8c406a6ac756d54aec249a47dd57af16d7e|
|historical-record|[archive_validation.md](../archive_validation.md)|[archive_validation.md](../zh-CN/archive_validation.md)|[archive_validation.md](archive_validation.md)|1319f70eda244c00d49d73bda80511406052bf63406b96aa41eba99645480c34|
|current-explanation|[assignment_requirements_matrix.md](../assignment_requirements_matrix.md)|[assignment_requirements_matrix.md](../zh-CN/assignment_requirements_matrix.md)|[assignment_requirements_matrix.md](assignment_requirements_matrix.md)|f07d337fc87f3f0b9ce1cab7d16cbfd06225e7d80c59838c9e738a78c4847946|
|historical-record|[baseline002_work_summary.md](../baseline002_work_summary.md)|[baseline002_work_summary.md](../zh-CN/baseline002_work_summary.md)|[baseline002_work_summary.md](baseline002_work_summary.md)|2c0e3f45dcda23a1da129e38a86a0e4650f73be4f7969696f8257d33f9ce75de|
|method-or-results|[baseline_sessions_plan.md](../baseline_sessions_plan.md)|[baseline_sessions_plan.md](../zh-CN/baseline_sessions_plan.md)|[baseline_sessions_plan.md](baseline_sessions_plan.md)|e6c209b19ed715c7e297a942c201fc9c683ee3e550cd7af0748218dcba84a1b8|
|current-report|[baseline_sessions_results.md](../baseline_sessions_results.md)|[baseline_sessions_results.md](../zh-CN/baseline_sessions_results.md)|[baseline_sessions_results.md](baseline_sessions_results.md)|1f57c80ed42834dd423a208f4b9d44f9c1c8524c73071eef5b28b2b2a3022523|
|current-explanation|[environment.md](../environment.md)|[environment.md](../zh-CN/environment.md)|[environment.md](environment.md)|0784d8baff01d2561069eee8f924e85337a88f727e88c60ef27ba8ea8b8f5017|
|historical-record|[experiment_log.md](../experiment_log.md)|[experiment_log.md](../zh-CN/experiment_log.md)|[experiment_log.md](experiment_log.md)|bbee4ca446ca5152bee752d02f203ac8006853a521e5938af6830711b6f054f8|
|method-or-results|[experiment_template.md](../experiment_template.md)|[experiment_template.md](../zh-CN/experiment_template.md)|[experiment_template.md](experiment_template.md)|10dfeb31dff4d294d0b20666f76e122d88b9676a2f218af1b0284b65a9c42c14|
|method-or-results|[gemm004_shape_proof.md](../gemm004_shape_proof.md)|[gemm004_shape_proof.md](../zh-CN/gemm004_shape_proof.md)|[gemm004_shape_proof.md](gemm004_shape_proof.md)|18defaf4c7bfcb6f02765450c4e5bab1e6b8817537e94bfb63ec737e5d48137b|
|contract|[measurement_contract.md](../measurement_contract.md)|[measurement_contract.md](../zh-CN/measurement_contract.md)|[measurement_contract.md](measurement_contract.md)|4c7c510ffafce3644830cae3ce41b7adb1ac2ba613ca5b0334e64e3475d81b80|
|method-or-results|[memory001_texture_accounting.md](../memory001_texture_accounting.md)|[memory001_texture_accounting.md](../zh-CN/memory001_texture_accounting.md)|[memory001_texture_accounting.md](memory001_texture_accounting.md)|ab1ca778e9c1b9626a8951b851ef2b86f61ccd6960fd69445f7f19d06b975bc3|
|method-or-results|[memory002_capture_protocol.md](../memory002_capture_protocol.md)|[memory002_capture_protocol.md](../zh-CN/memory002_capture_protocol.md)|[memory002_capture_protocol.md](memory002_capture_protocol.md)|f14354e0cb803e95d9efb211be07ec18d15ea40b46ea2d04c237c66d41d5aad9|
|historical-record|[memory002_pilot_results.md](../memory002_pilot_results.md)|[memory002_pilot_results.md](../zh-CN/memory002_pilot_results.md)|[memory002_pilot_results.md](memory002_pilot_results.md)|d234495e8299485b5996a173e996169bdd4842ff3f4c4bf69d1201260dec0940|
|current-report|[memory002_v2_pilot_results.md](../memory002_v2_pilot_results.md)|[memory002_v2_pilot_results.md](../zh-CN/memory002_v2_pilot_results.md)|[memory002_v2_pilot_results.md](memory002_v2_pilot_results.md)|3276e28041580498366bdc217702c9f4746f891011b58af61eedc6fde718bff2|
|method-or-results|[model_shape_recovery.md](../model_shape_recovery.md)|[model_shape_recovery.md](../zh-CN/model_shape_recovery.md)|[model_shape_recovery.md](model_shape_recovery.md)|003b94da32660976733c44c1d96bb34f23985f8e169129c49cf20318cc79e4fc|
|contract|[part2_compute_contract.md](../part2_compute_contract.md)|[part2_compute_contract.md](../zh-CN/part2_compute_contract.md)|[part2_compute_contract.md](part2_compute_contract.md)|48b6dcbeb750d9bd9fc5d70f03afa3bac803c4abec025205cc7f99ddc636a6ac|
|method-or-results|[part2_fused_d.md](../part2_fused_d.md)|[part2_fused_d.md](../zh-CN/part2_fused_d.md)|[part2_fused_d.md](part2_fused_d.md)|18331d5334cf9752834ed4297a16303fb2fed83bb9fa8227a84f2e4379ae20bf|
|method-or-results|[part2_q8.md](../part2_q8.md)|[part2_q8.md](../zh-CN/part2_q8.md)|[part2_q8.md](part2_q8.md)|3e81f1fe41a8e1156e6ff3b352b6799dda2a9feadb275453de8f94578a685463|
|method-or-results|[part2_repeat_plan.md](../part2_repeat_plan.md)|[part2_repeat_plan.md](../zh-CN/part2_repeat_plan.md)|[part2_repeat_plan.md](part2_repeat_plan.md)|1b15b6cf12149b3091ee23596ba6ab6e18017074bfac2d0c78e9376a13c59681|
|current-report|[part2_repeat_results.md](../part2_repeat_results.md)|[part2_repeat_results.md](../zh-CN/part2_repeat_results.md)|[part2_repeat_results.md](part2_repeat_results.md)|c87efe6b7167a7a035bfeacd3fa582e8c1bcf70a1f7188b42801b2313e0e6b1c|
|method-or-results|[part2_sweep_plan.md](../part2_sweep_plan.md)|[part2_sweep_plan.md](../zh-CN/part2_sweep_plan.md)|[part2_sweep_plan.md](part2_sweep_plan.md)|db137e8aacd1794e4bcefecb1ef1925e9e9159a2edfb9a2b9216f9ebf556a292|
|current-report|[part2_sweep_results.md](../part2_sweep_results.md)|[part2_sweep_results.md](../zh-CN/part2_sweep_results.md)|[part2_sweep_results.md](part2_sweep_results.md)|fb635a5330caf7f5c215080553dadd3c5f593609cc7c3f65dd28f5bbfa2cf4a7|
|method-or-results|[part2_vectorized_c.md](../part2_vectorized_c.md)|[part2_vectorized_c.md](../zh-CN/part2_vectorized_c.md)|[part2_vectorized_c.md](part2_vectorized_c.md)|d0508a374a08d094087f72125a55d7f37dfed1bca9b9992b44f07d38aa0285da|
|method-or-results|[profile002_shader_analysis.md](../profile002_shader_analysis.md)|[profile002_shader_analysis.md](../zh-CN/profile002_shader_analysis.md)|[profile002_shader_analysis.md](profile002_shader_analysis.md)|08b10fc7a64e68c24c27589def490a6aeac16278f04b7a18d8e43384d5d6efa4|
|method-or-results|[profile003_overlap_review.md](../profile003_overlap_review.md)|[profile003_overlap_review.md](../zh-CN/profile003_overlap_review.md)|[profile003_overlap_review.md](profile003_overlap_review.md)|e6c311a5c5298d20c6afc44648716085327f1252922fd55a02a25525e38c1d12|
|method-or-results|[profiling_capabilities.md](../profiling_capabilities.md)|[profiling_capabilities.md](../zh-CN/profiling_capabilities.md)|[profiling_capabilities.md](profiling_capabilities.md)|3104722c09356c4a1ce90221a919da57b629ee984e274522036408361aa7d88b|
|method-or-results|[remaining_metrics_feasibility.md](../remaining_metrics_feasibility.md)|[remaining_metrics_feasibility.md](../zh-CN/remaining_metrics_feasibility.md)|[remaining_metrics_feasibility.md](remaining_metrics_feasibility.md)|10606ac27014c1c45fdd5617a38b15c2b19402e4f3e0210c3f33711b04dc4629|
|current-explanation|[requirements.md](../requirements.md)|[requirements.md](../zh-CN/requirements.md)|[requirements.md](requirements.md)|9e1e06c5106b3039cebe01cef21bc755bdcae89ee0b98e50342509024b1431a8|
|method-or-results|[timestamp_validity.md](../timestamp_validity.md)|[timestamp_validity.md](../zh-CN/timestamp_validity.md)|[timestamp_validity.md](timestamp_validity.md)|d05c3cca915ac1c00753d83ccd2a60426449d320ee148e24d3c79ceb2884ccef|
|method-or-results|[trace001_availability.md](../trace001_availability.md)|[trace001_availability.md](../zh-CN/trace001_availability.md)|[trace001_availability.md](trace001_availability.md)|ec9acc370e480480a3481ec8a95c4a9c10a47623a6978828aa5841c5432d74fa|
|current-report|[performance_report.md](../../report/performance_report.md)|[performance_report.md](../../report/zh-CN/performance_report.md)|[performance_report.md](../../report/en/performance_report.md)|f036758aa4668da83a3b7eb2f3bf5ca4d8fac3f67515237931f535157bc98fda|
