import {mountPart2} from './part2_page.mjs';
import {VARIANTS,PERMUTATIONS,tripleOrder,packBVec4,ratios} from './part2_abc_math.mjs';
import {CASES} from './part2_math.mjs';
mountPart2({experimentId:'PART2ABC',variants:VARIANTS,fixedBits:4,allowFallback:false,roundOrder:tripleOrder,warmupOrder:i=>PERMUTATIONS[i%6],packB:packBVec4,ratios,orderDefinition:'Six permutations each5 measured rounds;fixed seed;10 warmups per variant',cases:[...CASES.filter(s=>!s.performance),{id:'vector-workgroup-tail',M:9,K:17,N:35,source:'CORRECTNESS_SYNTHETIC'},...CASES.filter(s=>s.performance)]});
