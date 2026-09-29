"""Static capstone raster review: original, thumbnails, grayscale, adjacency."""
from pathlib import Path
from collections import Counter
import json,re,struct,zlib

root=Path(__file__).resolve().parents[1]
level=json.loads((root/'content/levels/world-50.json').read_text())['levels'][-1]
palette=dict(re.findall(r"^  (\w+): '(#[0-9A-Fa-f]{6})',",(root/'src/theme/colors.ts').read_text().split('export const orbColors:')[1].split('export const orbGlow:')[0],re.M))
grid=[[level['legend'].get(g) if g!='.' else None for g in row] for row in level['pixelArt']]
count=Counter(c for row in grid for c in row if c)
void=[(x,y) for y,row in enumerate(grid) for x,c in enumerate(row) if c is None]
adj={}
for a,b in [('gold','yellow'),('sand','ivory'),('mauve','rose')]:
 adj[f'{a}/{b}']=sum(1 for y in range(48) for x in range(48) if grid[y][x]==a and
  ((x<47 and grid[y][x+1]==b) or (y<47 and grid[y+1][x]==b) or (x>0 and grid[y][x-1]==b) or (y>0 and grid[y-1][x]==b)))
def png(path,colors,scale):
 h=len(colors);w=len(colors[0]);raw=bytearray()
 for row in colors:
  pixels=b''.join(bytes.fromhex((palette.get(c,'#0B0E16') if c else '#0B0E16')[1:]) for c in row for _ in range(scale))
  for _ in range(scale):raw.extend(b'\0'+pixels)
 def chunk(tag,data):return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
 path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w*scale,h*scale,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(raw),9))+chunk(b'IEND',b''))
def small(factor):
 return [[Counter(grid[y+dy][x+dx] for dy in range(factor) for dx in range(factor)).most_common(1)[0][0]
          for x in range(0,48,factor)] for y in range(0,48,factor)]
out=root/'dist/m16g'
png(out/'capstone-48.png',grid,8)
png(out/'capstone-16.png',small(3),18)
png(out/'capstone-8.png',small(6),36)
print(json.dumps({'pixels':sum(count.values()),'colors':len(count),'minColorPopulation':min(count.values()),
 'void':len(void),'voidPositions':void,'adjacency':adj,'bronze':count['bronze'],'magenta':count['magenta']},indent=2))
