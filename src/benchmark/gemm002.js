import * as configuration from './gemm_pair_math.mjs';
import { mountGemmComparison } from './gemm_compare_page.mjs';
mountGemmComparison({...configuration,experimentId:'GEMM002',warmupOrder:i=>i%2?['tiled','naive']:['naive','tiled']});
