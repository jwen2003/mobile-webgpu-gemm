"""Metadata-only bounded FlatBuffer reads; never traverses tensor buffer data."""
import struct,json
from pathlib import Path
p=Path('assets/models/gemma-3n-E2B-it-int4-Web.litertlm');f=p.open('rb');readBytes=0

def read(pos,n):
 global readBytes
 if pos<0 or pos+n>p.stat().st_size or n>65536 or readBytes+n>4*1024*1024:raise ValueError('Metadata bounds exceeded')
 f.seek(pos);b=f.read(n);readBytes+=len(b)
 if len(b)!=n:raise ValueError('Truncated metadata')
 return b

def u32(pos):return struct.unpack('<I',read(pos,4))[0]
def field(table,index):
 vt=table-struct.unpack('<i',read(table,4))[0];length=struct.unpack('<H',read(vt,2))[0]
 if 4+2*index>=length:return None
 off=struct.unpack('<H',read(vt+4+2*index,2))[0];return table+off if off else None

def indirect(pos):return pos+u32(pos)
def vector(table,index):
 a=field(table,index)
 if a is None:return []
 v=indirect(a);n=u32(v)
 if n>20000:raise ValueError('Metadata vector cap')
 return [v+4+i*4 for i in range(n)]

def string(table,index):
 a=field(table,index)
 if a is None:return ''
 v=indirect(a);n=u32(v)
 if n>4096:raise ValueError('Name cap')
 return read(v+4,n).decode('utf-8',errors='replace')

assert read(4,4)==b'TFL3';root=u32(0);tensors=[];subgraphs=[]
for gi,a in enumerate(vector(root,2)):
 g=indirect(a);subgraphs.append({'id':gi,'name':string(g,4)})
 for ti,q in enumerate(vector(g,0)):
  t=indirect(q);sh=[struct.unpack('<i',read(x,4))[0] for x in vector(t,0)];typ=field(t,1)
  tensors.append({'subgraph':gi,'id':ti,'name':string(t,3),'shape':sh,'type':read(typ,1)[0] if typ else 0})
f.close();out={'schemaReference':'https://github.com/tensorflow/tensorflow/blob/v2.20.0/tensorflow/compiler/mlir/lite/schema/schema.fbs','scope':'Metadata field traversal only,no Model.Buffers/weight data read;not exact runtime native schema revision proof','bytesRead':readBytes,'subgraphs':subgraphs,'tensorCount':len(tensors),'matchingExtents':[x for x in tensors if 1536 in x['shape'] and 2048 in x['shape']],'shaderAssociation':'UNKNOWN: no graph-op/tensor IDs linked to captured native shader'}
Path('results/analysis/model_metadata_review.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in out.items() if k!='matchingExtents'},ensure_ascii=False));print('matching tensors',len(out['matchingExtents']))
