"""World 50 hand-composed boards and approved capstone block-in."""
from pathlib import Path
import importlib.util, json, copy

spec=importlib.util.spec_from_file_location('previous',Path(__file__).with_name('m16f-art.py'))
previous=importlib.util.module_from_spec(spec);spec.loader.exec_module(previous)
Board=previous.Board; sky=previous.sky; ring=previous.ring; LEGEND=previous.LEGEND

TITLES=['Seams of Gold','The Bridge of Every World','The Tree of Districts',
 'The Great Realigner','Homeward Harbour','The Confluence of Worlds',
 'The Terraced Nexus','The Docking of Continents','Threshold of the Nexus','The Arcadia Nexus']
TARGET={491:2215,492:2205,493:2225,494:2195,495:2125,496:2205,497:2250,498:2215,499:2260}
MINCOL={i:(15 if i==495 else 19 if i>=496 else 18) for i in TARGET}
previous.TARGET=TARGET;previous.MINCOL=MINCOL
previous.PALETTES[50]=['navy','mauve','blush','gold','ivory','white','stone','ash','silver','graphite',
 'ice','lavender','forest','moss','umber','sand','cerulean','cyan','rose','orange','sage','green','slate']

def boards():
 out={}
 # Repaired valley: continuous gold seams, whole sun, and the same three peaks as 481.
 b=sky(['mauve','blush','ice'],(0,10,25,48));b.ellipse(25,12,35,22,'orange');b.ellipse(28,15,33,20,'yellow')
 for x,y,w,c in [(10,18,22,'stone'),(24,15,26,'slate'),(39,20,20,'ash')]:
  b.poly([(x-w//2,36),(x,y),(x+w//2,37)],c);b.poly([(x-3,y+5),(x,y),(x+3,y+5)],'white')
 b.rect(0,35,47,47,'sage');b.poly([(0,39),(12,34),(24,38),(36,33),(47,37),(47,47),(0,47)],'forest')
 b.line([(24,31),(18,38),(22,47)],'cerulean',5);b.line([(24,31),(18,38),(22,47)],'cyan',2)
 for x in (3,9):b.rect(x,36,x+5,43,'ivory');b.poly([(x-1,36),(x+2,32),(x+6,36)],'rose')
 b.line([(4,0),(14,13),(21,23),(30,33),(44,47)],'ivory',4);b.line([(4,0),(14,13),(21,23),(30,33),(44,47)],'gold',2)
 for path in [[(20,18),(11,24),(0,30)],[(34,30),(40,26),(47,22)]]:
  b.line(path,'ivory',4);b.line(path,'gold',2)
 for y in (32,36):b.line([(25,y),(32,y+2)],'umber',2)
 out[491]=b
 # A single bridge deck joins five visibly different arch materials.
 b=sky(['mauve','blush','gold'],(0,12,25,48));b.rect(0,29,47,47,'cerulean');b.rect(0,39,47,47,'navy')
 b.rect(0,18,47,22,'ivory');b.rect(0,17,47,18,'gold');b.line([(0,23),(47,23)],'stone',2)
 for x,c,trim in [(2,'stone','ash'),(11,'graphite','gold'),(20,'ice','lavender'),(29,'umber','forest'),(38,'silver','white')]:
  b.ellipse(x,19,x+10,37,c);b.ellipse(x+2,22,x+8,36,'navy');b.line([(x,34),(x+10,34)],trim,2)
  b.rect(x,20,x+1,36,'ash');b.rect(x+9,20,x+10,36,'ash')
 for x in range(2,47,5):b.rect(x,15,x+1,17,'gold');b.rect(x,42,x+2,44,'ice')
 b.ellipse(39,3,46,10,'silver');b.ellipse(41,2,47,8,'mauve')
 out[492]=b
 # Four architectural districts grow from the one hollow trunk.
 b=sky(['mauve','blush','gold'],(0,11,27,48));b.rect(0,40,47,47,'cerulean')
 b.ellipse(3,7,43,32,'forest');b.ellipse(8,5,40,29,'moss');b.rect(18,19,30,44,'umber')
 for path in [[(23,23),(9,16),(5,13)],[(25,21),(38,13),(43,11)],[(21,31),(7,27)],[(28,29),(42,26)]]:b.line(path,'brown',5)
 for x,y,roof,body in [(4,13,'rose','ivory'),(33,9,'ice','white'),(2,25,'graphite','ash'),(36,23,'silver','ivory')]:
  b.rect(x,y,x+9,y+8,body);b.poly([(x-1,y),(x+4,y-5),(x+10,y)],roof)
  b.rect(x+3,y+3,x+5,y+5,'gold')
 for y in (24,31,38):b.rect(22,y,26,y+4,'graphite');b.line([(23,y+3),(26,y)],'gold',2)
 b.line([(22,43),(10,47)],'brown',4);b.line([(27,43),(40,47)],'brown',4)
 out[493]=b
 # Offset radial mechanism sets landscape and sky back into alignment.
 b=sky(['navy','mauve','blush'],(0,11,31,48));b.ellipse(5,4,43,42,'ash');b.ellipse(8,7,40,39,'stone')
 for c,r in [('silver',17),('ivory',12),('gold',7)]:ring(b,24,23,r,r,c,3)
 b.ellipse(20,19,28,27,'white');b.ellipse(22,21,26,25,'cyan')
 for path,c in [([(0,17),(17,22),(24,23)],'ice'), ([(47,11),(33,19),(24,23)],'forest'),
  ([(2,42),(16,29),(24,23)],'sand'), ([(47,40),(32,29),(24,23)],'cerulean')]:b.line(path,c,7)
 for path in [[(0,17),(17,22),(24,23)],[(47,11),(33,19),(24,23)],[(2,42),(16,29),(24,23)],[(47,40),(32,29),(24,23)]]:b.line(path,'gold',2)
 out[494]=b
 # Breather: one ship, one connected harbor, calm water and a broad horizon.
 b=sky(['mauve','blush','gold'],(0,13,28,48));b.ellipse(34,9,44,19,'orange')
 b.rect(0,29,47,47,'cerulean');b.rect(0,39,47,47,'navy');b.line([(0,32),(47,32)],'ice',2)
 b.poly([(0,33),(13,29),(21,31),(21,38),(0,40)],'stone');b.rect(0,32,20,33,'ivory')
 for x,h in [(2,23),(8,20),(15,26)]:b.rect(x,h,x+4,31,'ivory');b.poly([(x-1,h),(x+2,h-3),(x+5,h)],'rose')
 b.poly([(24,34),(43,34),(39,40),(28,40)],'umber');b.line([(24,34),(43,34)],'gold',2)
 b.rect(32,14,33,34,'stone');b.poly([(31,15),(31,32),(21,32)],'white');b.poly([(34,18),(34,32),(41,32)],'ivory')
 b.line([(25,42),(43,43)],'silver',2);out[495]=b
 # Three distinct waters merge as a Y into one foreground river.
 b=sky(['mauve','blush','ice'],(0,10,26,48));b.poly([(0,34),(11,25),(23,34),(35,22),(47,33),(47,47),(0,47)],'forest')
 for path,c in [([(0,5),(9,17),(23,29),(24,47)],'ice'), ([(47,6),(35,17),(23,29),(24,47)],'cerulean'),
  ([(0,26),(14,26),(23,29),(24,47)],'cyan')]:b.line(path,c,7)
 b.line([(0,18),(15,23),(23,29),(32,39)],'gold',2);b.line([(47,18),(34,24),(23,29),(15,42)],'gold',2)
 for x,y in [(4,30),(36,29)]:b.rect(x,y,x+8,y+10,'ivory');b.poly([(x-1,y),(x+4,y-5),(x+9,y)],'rose');b.rect(x+2,y+3,x+4,y+5,'gold')
 b.rect(20,28,28,32,'stone');b.rect(21,27,27,28,'ivory');out[496]=b
 # Nexus terraces: one coherent ascending city with structural continuity.
 b=sky(['navy','mauve','blush'],(0,11,27,48));b.poly([(0,42),(13,34),(21,27),(30,19),(41,11),(47,13),(47,47),(0,47)],'stone')
 for x,y,w in [(2,36,45),(8,29,39),(15,22,32),(22,15,25),(30,8,17)]:
  b.rect(x,y,47,y+3,'ivory');b.rect(x,y,47,y,'gold')
  for xx in range(x+3,46,7):b.rect(xx,y+5,xx+2,y+8,'ash');b.rect(xx+1,y+5,xx+2,y+6,'gold')
 b.rect(37,1,43,17,'white');b.poly([(35,4),(40,-2),(45,4)],'gold')
 b.line([(2,43),(14,34),(24,26),(34,17),(41,8)],'cerulean',3);out[497]=b
 # Six broad continental masses dock onto one hub; bridges are clear at phone scale.
 b=sky(['navy','mauve','blush'],(0,12,31,48));b.ellipse(16,17,32,34,'stone');b.ellipse(19,19,29,31,'ivory');b.ellipse(22,20,26,25,'white')
 islands=[(0,3,14,15,'ice','white'),(17,0,31,12,'forest','moss'),(34,4,47,17,'sand','umber'),
  (0,33,15,47,'cerulean','cyan'),(18,36,31,47,'rose','ivory'),(34,34,47,47,'graphite','silver')]
 for x0,y0,x1,y1,c,top in islands:
  b.ellipse(x0,y0,x1,y1,'stone');b.ellipse(x0+1,y0,x1-1,y1-2,c);b.rect(x0+3,y0+2,x1-3,y0+4,top)
 for path in [[(11,14),(19,22)],[(24,11),(24,20)],[(37,16),(29,22)],[(12,35),(20,30)]]:b.line(path,'gold',3)
 for path in [[(24,35),(24,30)],[(35,35),(29,29)]]:b.line(path,'gold',2)
 out[498]=b
 # Gate pylons and lintel frame the approach; the spire remains cropped.
 b=sky(['navy','mauve','blush'],(0,9,28,48));b.poly([(0,47),(13,32),(24,26),(35,32),(47,47)],'stone')
 for x in (4,37):
  b.rect(x,8,x+7,41,'ash');b.rect(x+1,7,x+6,39,'ivory');b.rect(x+2,10,x+5,37,'stone')
  for y in (14,21,28,35):b.rect(x+2,y,x+4,y+2,'gold')
 b.rect(4,5,44,9,'stone');b.rect(7,5,41,6,'gold');b.rect(17,16,31,47,'mauve')
 b.poly([(17,47),(24,30),(31,47)],'white');b.rect(22,22,26,32,'ivory');b.rect(23,19,25,21,'gold')
 b.line([(0,44),(23,30),(47,44)],'gold',3);b.line([(17,47),(24,30),(31,47)],'cerulean',2)
 out[499]=b
 # Freeze the approved block-in. Its only production correction is the crystal underside.
 rows=[row.split() for row in Path(__file__).with_name('m16g-capstone-grid.txt').read_text().splitlines()]
 assert len(rows)==48 and all(len(row)==48 for row in rows)
 b=Board('navy');b.cells=[[None if c=='.' else c for c in row] for row in rows]
 for y in range(13,27):
  for x in range(0,15):
   if b.cells[y][x]=='graphite':b.put(x,y,'stone')
 out[500]=b
 return out

if __name__=='__main__':
 out=boards();original=copy.deepcopy(out);finished=previous.finish({i:b for i,b in out.items() if i<500});finished[500]=out[500]
 # The generic density pass cuts corner sky. World 50's empty cells belong only
 # in the dark lower structural/water shadows, so relocate each such cut there.
 for i in range(491,500):
  b=finished[i];initial=original[i]
  cuts=[]
  for y in range(48):
   for x in range(48):
    if b.cells[y][x] is None and initial.cells[y][x] is not None:
     b.put(x,y,initial.cells[y][x]);cuts.append((x,y))
  dark={'navy','graphite','umber','stone','ash','forest','moss','cerulean','slate'}
  candidates=[(x,y) for y in range(30,48) for x in range(48) if b.cells[y][x] in dark]
  candidates.sort(key=lambda p:(47-p[1], min(p[0],47-p[0]), p[0]))
  if len(candidates)<len(cuts):raise RuntimeError(f'not enough dark shadow at {i}')
  for x,y in candidates[:len(cuts)]:b.put(x,y,None)
  if i==491:
   for path in [[(4,0),(14,13),(21,23),(30,33),(44,47)],[(20,18),(11,24),(0,30)],[(34,30),(40,26),(47,22)]]:
    b.line(path,'gold',2)
  while True:
   counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[]))-{None}}
   rare=[(n,c) for c,n in counts.items() if n<25]
   if not rare:break
   n,c=min(rare);members=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x]==c]
   near=[]
   for x,y in members:
    for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
     if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] not in (None,c) and counts[b.cells[yy][xx]]>25:near.append((yy,xx))
   if not near:raise RuntimeError(f'rare color {i}: {c}')
   yy,xx=min(near);b.put(xx,yy,c)
  # Separate the close-value material pairs identified by the palette review.
  changes=[]
  for y in range(48):
   for x in range(48):
    neighbors=[b.cells[yy][xx] for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)) if 0<=xx<48 and 0<=yy<48]
    if b.cells[y][x]=='mauve' and 'rose' in neighbors:changes.append((x,y,'blush'))
    if b.cells[y][x]=='sand' and 'ivory' in neighbors:changes.append((x,y,'umber'))
  for x,y,c in changes:b.put(x,y,c)
 result=[]
 for i,b in sorted(finished.items()):
  rows=b.rows();used=set(''.join(rows))-{'.'};counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[]))-{None}}
  result.append(dict(id=i,title=TITLES[i-491],grid=rows,legend={c:LEGEND[c] for c in sorted(used)}))
  print(i,sum(counts.values()),len(counts),min(counts.values()))
 Path('dist/m16g/art.json').write_text(json.dumps(result,indent=2)+'\n')
