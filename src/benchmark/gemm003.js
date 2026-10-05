import * as configuration from './gemm_triple_math.mjs';
import { mountGemmComparison } from './gemm_compare_page.mjs';
mountGemmComparison({...configuration,experimentId:'GEMM003',fullSmallArrays:true});
