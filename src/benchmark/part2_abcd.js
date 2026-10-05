import {mountPart2AD} from './part2_ad_page.mjs';
import {VARIANTS,PERMUTATIONS,quadOrder,packBVec4,ratios} from './part2_abcd_math.mjs';
import {CASES} from './part2_math.mjs';
mountPart2AD({experimentId:'PART2ABCD',variants:VARIANTS,fixedBits:4,allowFallback:false,roundOrder:quadOrder,warmupOrder:i=>PERMUTATIONS[i%6],packB:packBVec4,ratios,orderDefinition:'24 permutations once plus six balanced additions;positions7/8,pair precedence15/15;fixed seed;10 warmups per variant',cases:[...CASES.filter(s=>!s.performance),{id:'quantization-extremes',M:3,K:5,N:9,extremeCodes:true,source:'CORRECTNESS_SYNTHETIC'},{id:'vector-workgroup-tail',M:9,K:17,N:35,source:'CORRECTNESS_SYNTHETIC'},...CASES.filter(s=>s.performance)]});
