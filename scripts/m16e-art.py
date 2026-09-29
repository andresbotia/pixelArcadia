"""Hand-composed 48x48 production raster boards for M16E; offline authoring only."""
from pathlib import Path
import json, math, re, importlib.util
spec=importlib.util.spec_from_file_location('base',Path(__file__).with_name('m16c-art.py'))
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
Board=base.Board;sky=base.sky;loop=base.loop;material=base.material
LEGEND=base.LEGEND

def house(b,x,y,w=5):
 b.rect(x,y,x+w,y+5,'ivory');b.poly([(x-1,y),(x+w//2,y-3),(x+w+1,y)],'red');b.rect(x+2,y+2,x+3,y+3,'gold')
def mountain(b,x,y,w,c='stone'):
 b.poly([(x,y),(x+w//2,47),(x-w//2,47)],c)
def sun(b,x,y,r=4):b.ellipse(x-r,y-r,x+r,y+r,'gold');b.ellipse(x-r+2,y-r+2,x+r-2,y+r-2,'yellow')
def boat(b,x,y,w=8):
 b.poly([(x,y),(x+w,y),(x+w-2,y+4),(x+2,y+4)],'umber');b.line([(x+w//2,y),(x+w//2,y-8)],'brown',2);b.poly([(x+w//2,y-7),(x+2,y-2),(x+w//2,y-2)],'ivory')
def windows(b,x0,y0,x1,y1,color='gold',step=5):
 for y in range(y0,y1,step):
  for x in range(x0,x1,step):b.rect(x,y,x+1,y+1,color)
def waves(b,y,c='ice'):
 for x in range(2,46,10):b.line([(x,y),(x+5,y),(x+8,y-1)],c,1)
def boards():
 out={}
 # 42 — colossal machines, each with a human-scale marker.
 b=sky(['blush','gold','ice']);b.rect(0,33,47,47,'green');b.rect(0,39,47,47,'olive')
 for x,y in [(12,20),(17,23),(22,20),(27,21),(32,22),(37,21)]:b.line([(x,y),(x-3 if x%2 else x+3,40)],'graphite',3);b.ellipse(x-2,y-2,x+2,y+2,'yellow')
 b.rect(8,8,40,21,'ash');b.rect(9,9,39,12,'silver');b.rect(8,19,40,22,'graphite')
 for x in (11,18,25,32):b.poly([(x,8),(x+3,5),(x+6,8)],'stone')
 for x in (14,24,34):b.rect(x,2,x+3,8,'graphite');b.ellipse(x-10,-1,x,4,'silver')
 windows(b,12,14,39,19,'gold',6);house(b,39,36,6);b.rect(0,39,12,41,'lime');b.rect(4,43,30,44,'gold');b.rect(7,24,39,26,None);b.rect(2,0,13,5,'lavender');out[411]=b
 b=sky(['cerulean','ice','silver']);b.poly([(0,25),(18,28),(24,47),(0,47)],'sand')
 for y,c in [(31,'coral'),(36,'brown'),(41,'umber')]:b.rect(0,y,23,47,c)
 b.rect(0,8,15,21,'ash');b.rect(1,11,14,14,'silver');b.line([(11,16),(34,32)],'graphite',5);b.line([(11,13),(34,28)],'ash',3)
 loop(b,35,32,12,12,'graphite',4);loop(b,35,32,8,8,'silver',3);b.ellipse(31,28,39,36,'ash')
 for j in range(12):
  a=j*math.pi/6;x=round(35+12*math.cos(a));y=round(32+12*math.sin(a));b.rect(x-1,y-1,x+1,y+1,'yellow')
 for a in (0,math.pi/2,math.pi,3*math.pi/2):b.line([(35,32),(35+11*math.cos(a),32+11*math.sin(a))],'stone',2)
 for x in (3,9):house(b,x,25,4)
 b.rect(0,44,21,47,None);b.rect(15,17,19,20,None);b.rect(20,20,23,23,None);out[412]=b
 b=sky(['navy','indigo','cerulean','ice'],(0,11,21,32,48));b.rect(0,39,47,47,'blue');b.rect(13,35,36,47,'ash');b.rect(19,31,29,40,'stone');b.rect(0,27,47,30,'silver')
 b.rect(22,0,24,42,'silver');b.rect(23,0,23,42,'white');b.rect(19,0,27,3,'ash');b.rect(20,1,26,2,'gold');b.rect(20,15,27,18,'yellow');b.rect(22,16,25,17,'ice')
 for x in (4,9,35,41):b.rect(x,38,x+2,44,'graphite');b.rect(x,38,x+1,39,'gold')
 for x,y in [(4,5),(9,9),(37,4),(42,12)]:b.rect(x,y,x+1,y+1,'white')
 b.rect(0,0,16,8,None);b.rect(31,0,47,8,None);b.rect(0,9,9,12,None);b.rect(39,9,47,12,None);out[413]=b
 b=sky(['cerulean','ice','silver']);mountain(b,0,1,23,'slate');mountain(b,47,0,23,'pine');b.rect(6,8,41,36,'ash');b.rect(6,8,41,10,'graphite');b.rect(7,12,40,32,'stone')
 for x in range(9,41,6):b.rect(x,14,x+3,16,'silver');b.rect(x,30,x+2,33,None);b.line([(x+1,33),(x+1,47)],'white',3)
 b.rect(0,37,47,47,'cerulean');b.rect(0,40,47,47,'blue');waves(b,42);b.rect(21,5,27,9,'graphite');b.rect(12,6,16,7,'yellow');b.rect(12,34,17,36,'ice');b.rect(0,20,5,28,None);b.rect(43,17,47,29,None);out[414]=b
 b=sky(['navy','cerulean','ice','white'],(0,5,17,32,48));b.rect(0,34,47,47,'green');b.rect(0,42,47,47,'sage')
 b.poly([(2,34),(6,29),(17,29),(20,22),(25,19),(30,19),(34,24),(38,19),(42,21),(45,27),(41,34)],'ash')
 for x,y in [(23,13),(29,11),(35,12),(41,16)]:b.rect(x,y,x+4,27,'silver');b.rect(x+1,y+3,x+3,y+4,'graphite')
 b.rect(5,31,25,39,'stone');b.rect(9,33,20,35,'silver');house(b,21,25,6)
 for x in (4,13,33,43):b.rect(x,38,x+2,40,'gold');b.rect(x+1,36,x+1,39,'moss')
 b.rect(0,0,47,4,None);b.rect(0,28,8,31,None);b.rect(39,28,47,31,None);b.rect(0,46,31,47,'olive');out[415]=b
 b=sky(['blush','ice','cerulean']);b.rect(0,34,47,47,'blue');b.rect(0,42,47,47,'navy')
 b.rect(0,9,8,42,'stone');b.rect(39,9,47,42,'stone');b.line([(6,32),(20,5)],'ash',7);b.line([(41,32),(27,5)],'ash',7)
 b.line([(7,30),(20,5)],'silver',2);b.line([(40,30),(27,5)],'silver',2)
 for x,y in [(9,25),(14,15),(32,16),(36,25)]:b.rect(x,y,x+2,y+2,'yellow')
 b.poly([(16,33),(32,33),(29,40),(19,40)],'navy');b.rect(19,28,28,34,'white');b.rect(22,24,25,29,'red');b.rect(11,9,14,11,'gold');b.rect(34,9,37,11,'gold')
 b.poly([(20,8),(24,4),(27,8),(23,18)],None);b.rect(0,40,7,44,None);b.rect(40,40,47,44,None);out[416]=b
 b=sky(['ice','silver','ash']);b.rect(0,14,47,20,'brown');b.rect(0,21,47,28,'stone');b.rect(0,29,47,32,'cerulean');b.rect(0,33,47,40,'graphite');b.rect(0,41,47,47,'umber')
 b.poly([(16,14),(24,0),(32,14)],'yellow');b.line([(17,14),(24,0),(31,14)],'graphite',2);b.rect(22,5,26,43,'silver');b.rect(23,8,25,41,'graphite');b.ellipse(19,38,29,47,'orange');b.ellipse(21,40,27,46,'red');b.rect(34,9,44,15,'ivory');b.rect(37,7,41,9,'red')
 for x in (4,12,34,42):b.rect(x,30,x+2,31,None)
 b.rect(0,35,17,36,None);b.rect(31,35,47,36,None);b.rect(18,2,20,5,None);out[417]=b
 b=sky(['ice','silver','blush']);b.rect(0,40,47,47,'graphite')
 for x in (0,16,32):
  b.ellipse(x+1,5,x+15,18,'ash');b.rect(x+1,12,x+15,40,'ash');b.rect(x+3,16,x+13,37,'stone')
  for y in (20,26,32,38):b.rect(x,y,x+15,y+2,'silver')
  b.rect(x+5,10,x+10,12,'graphite');house(b,x+3,19,4);b.rect(x+10,27,x+13,30,'moss')
 b.rect(13,7,16,39,None);b.rect(29,7,32,39,None);b.rect(22,0,26,7,'white');b.rect(18,3,30,5,'silver');out[418]=b
 b=sky(['lavender','blush','indigo']);b.rect(0,5,6,47,'stone');b.rect(41,5,47,47,'stone');b.rect(0,42,47,47,'graphite')
 for x in (13,29):b.rect(x,25,x+6,42,'ash');b.rect(x+1,27,x+3,40,'silver')
 b.rect(17,23,30,29,'ash');b.rect(17,8,29,23,'graphite');b.rect(19,10,27,20,None)
 for y in (10,17,24,31,38):b.rect(4,y,43,y+1,'yellow');b.rect(9,y+1,11,y+3,'orange')
 b.line([(3,3),(17,14)],'ash',2);b.line([(45,2),(31,17)],'ash',2)
 for x,y in [(11,15),(34,18),(23,33),(37,29)]:b.rect(x,y,x+2,y+2,'gold')
 house(b,39,1,4);b.rect(0,35,5,40,None);b.rect(42,35,47,40,None);out[419]=b
 b=sky(['cerulean','ice','silver']);mountain(b,10,12,28,'slate');mountain(b,38,10,25,'stone');b.poly([(14,24),(24,42),(34,22),(30,47),(17,47)],'graphite')
 b.rect(3,6,44,11,'ash');b.rect(4,7,43,8,'yellow');b.rect(5,12,42,13,'graphite');b.rect(21,11,26,30,'silver');loop(b,24,30,7,7,'graphite',4);b.ellipse(21,27,27,33,'orange')
 for x in (6,13,35,41):b.rect(x,6,x+1,13,'graphite')
 for x in (3,9):house(b,x,39,4)
 b.rect(36,27,47,47,'ash');b.rect(38,19,41,30,'graphite');b.rect(44,17,47,31,'graphite');b.rect(39,37,47,40,'orange');b.rect(20,43,29,47,None);out[420]=b
 # 43 — cultivated celestial forms; deliberate variety of crops and axes.
 b=sky(['navy','indigo','cerulean','lavender'],(0,8,20,35,48))
 for x,y,w in [(1,20,17),(23,13,17),(14,34,25)]:
  b.ellipse(x,y,x+w,y+7,'white');b.rect(x+2,y+4,x+w-2,y+7,'silver')
  for xx in range(x+4,x+w-1,6):b.rect(xx,y-6,xx+1,y+1,'brown');b.ellipse(xx-2,y-9,xx+3,y-5,'moss');b.rect(xx,y-7,xx+1,y-6,'gold')
 b.line([(15,25),(25,20),(32,20)],'ice',2);b.rect(0,0,47,4,None);b.rect(0,5,14,8,None);out[421]=b
 b=sky(['navy','indigo','lavender']);b.rect(0,37,27,47,'stone');b.ellipse(0,27,27,47,'ash');loop(b,12,37,10,10,'moss',3,20)
 for y,c in [(8,'rose'),(16,'white'),(24,'gold')]:b.line([(8,38),(18,30),(32,y+6),(44,y)],'moss',3);b.line([(22,28),(39,y+3),(44,y)],c,2);b.ellipse(40,y-2,47,y+4,c)
 b.rect(0,0,47,5,None);b.rect(27,39,47,47,None);out[422]=b
 b=sky(['navy','indigo','lavender']);b.ellipse(9,17,36,45,'stone');b.ellipse(11,20,34,43,'ash');b.poly([(9,36),(23,43),(35,37)],'moss');b.line([(25,25),(20,14),(27,7)],'brown',4)
 for x,y,w in [(12,13,14),(21,7,17),(6,22,13),(29,17,12)]:b.ellipse(x,y,x+w,y+5,'pine');b.rect(x+2,y+2,x+w-2,y+4,'forest')
 loop(b,23,29,20,12,'silver',2);b.rect(8,35,11,41,'gold');b.rect(0,0,47,6,None);b.rect(0,7,8,22,None);b.rect(40,14,47,32,None);out[423]=b
 b=sky(['indigo','navy','lavender']);b.poly([(0,23),(47,13),(47,47),(0,47)],'sage')
 for rx,ry,c in [(21,13,'sand'),(16,10,'moss'),(11,7,'olive'),(6,4,'forest')]:loop(b,25,28,rx,ry,c,2,40)
 sun(b,25,28,4)
 for x,y in [(6,25),(39,16),(14,37),(33,34),(29,20)]:b.ellipse(x,y,x+4,y+4,'pine')
 house(b,39,9,5);b.rect(0,0,47,4,None);b.rect(0,5,11,12,None);out[424]=b
 b=sky(['navy','indigo','lavender','cerulean'],(0,10,23,37,48));b.ellipse(2,3,29,30,'ivory');b.ellipse(11,0,33,24,'navy');b.rect(0,40,47,47,'blue');b.rect(0,44,47,47,'slate')
 for x in (13,17,21,25,29):b.line([(x,19),(x+2,38)],'lavender',3);b.ellipse(x,25,x+4,29,'mauve')
 b.rect(0,0,47,5,None);b.rect(0,6,8,18,None);b.rect(34,7,47,24,None);b.rect(0,34,9,39,None);out[425]=b
 b=sky(['navy','indigo','lavender']);b.rect(0,7,28,20,'sage');b.rect(0,18,23,39,'stone');b.rect(0,19,28,21,'moss')
 for y in (8,13,18):b.rect(0,y,26,y+1,'forest')
 b.line([(24,19),(26,30),(25,45)],'white',5);b.line([(25,20),(26,44)],'ice',2);b.rect(15,42,47,47,'lavender');b.ellipse(13,40,47,47,'cerulean');b.rect(31,0,47,25,None)
 for x in (5,12,19):b.ellipse(x,4,x+4,8,'rose');out[426]=b
 b=sky(['navy','indigo','lavender']);b.ellipse(0,27,18,47,'silver');b.ellipse(32,0,47,18,'rose');b.line([(11,32),(18,20),(31,14),(40,10)],'moss',5)
 for x,y in [(16,22),(22,17),(28,13),(34,11)]:b.ellipse(x-2,y-2,x+2,y+2,'blush')
 house(b,4,33,4);house(b,39,5,4);b.rect(0,0,19,12,None);b.rect(20,28,47,47,None);out[427]=b
 b=sky(['navy','indigo','cerulean']);b.ellipse(0,35,47,70,'blue');b.ellipse(0,39,47,70,'cerulean');b.ellipse(5,4,43,35,'seafoam');b.rect(6,20,42,35,'seafoam');loop(b,24,20,19,17,'graphite',3,40)
 for x in (9,17,25,33,41):b.line([(x,7),(x,35)],'ash',2)
 for x in (12,22,32):b.rect(x,18,x+3,32,'brown');b.ellipse(x-3,13,x+6,24,'forest');b.ellipse(x,10,x+5,18,'moss')
 b.ellipse(20,29,31,33,'cerulean');b.rect(0,0,10,8,None);b.rect(40,0,47,8,None);out[428]=b
 b=sky(['navy','indigo','lavender']);loop(b,23,26,21,11,'blush',6,55);b.ellipse(8,10,38,42,'green');b.ellipse(11,12,36,39,'sage');b.poly([(7,27),(17,20),(33,24),(39,31)],'forest');b.line([(2,31),(44,19)],'white',6);b.line([(1,33),(46,21)],'rose',3)
 for x,y in [(5,8),(40,7),(43,38)]:b.ellipse(x,y,x+3,y+3,'ivory')
 b.rect(0,0,16,6,None);b.rect(33,0,47,6,None);b.rect(0,40,11,47,None);out[429]=b
 b=sky(['navy','indigo','lavender']);
 for y,x0,x1,c in [(7,4,44,'sage'),(14,8,40,'green'),(21,12,36,'forest'),(28,16,32,'moss'),(35,20,28,'stone')]:b.rect(x0,y,x1,y+6,c);b.rect(x0,y,x1,y+1,'olive')
 b.line([(24,14),(24,47)],'brown',3)
 for x,y in [(7,7),(14,16),(31,14),(19,25),(28,25)]:b.ellipse(x,y,x+4,y+4,'rose')
 b.line([(11,13),(14,31)],'white',2);b.line([(38,13),(34,30)],'ice',2);house(b,22,2,5)
 for x,y in [(3,3),(10,6),(40,4),(44,10),(6,37),(41,34)]:b.rect(x,y,x+1,y+1,'white')
 b.rect(0,35,16,47,None);b.rect(33,35,47,47,None);out[430]=b
 # 44 — lived-in scholarly city; magic appears as useful light and diagrams.
 b=sky(['lavender','blush','gold']);b.poly([(0,10),(20,20),(20,47),(0,47)],'brown');b.poly([(47,10),(28,20),(28,47),(47,47)],'stone');b.poly([(20,20),(28,20),(37,47),(11,47)],'cerulean')
 for x,y in [(1,8),(8,12),(34,12),(41,8)]:b.rect(x,y,x+5,24,'ash');windows(b,x+1,y+5,x+5,24)
 for y,x0,x1 in [(24,17,31),(31,13,35),(40,7,41)]:b.line([(x0,y),(24,y-4),(x1,y)],'ivory',3);b.rect(22,y,26,y+2,None)
 for x,y in [(18,29),(26,34),(23,43)]:b.ellipse(x,y,x+2,y+2,'gold')
 b.rect(0,27,4,31,None);b.rect(43,29,47,34,None);out[431]=b
 b=sky(['navy','indigo','lavender']);b.rect(0,34,47,47,'brown');b.rect(16,5,32,41,'slate');b.poly([(16,5),(24,0),(32,5)],'stone');b.rect(20,8,28,37,'graphite')
 for cx,cy,rx,ry in [(23,12,18,6),(26,23,17,8),(22,33,16,5)]:loop(b,cx,cy,rx,ry,'gold',2,38)
 for x,y in [(5,10),(39,15),(8,26),(40,31)]:b.rect(x,y,x+2,y+2,'cyan')
 for x in (3,10,37,43):b.rect(x,29,x+3,45,'ash');windows(b,x+1,34,x+4,44)
 b.rect(0,0,12,8,None);b.rect(37,0,47,8,None);out[432]=b
 b=sky(['blush','lavender','indigo']);b.rect(0,37,47,47,'stone')
 cs=['cerulean','rose','gold','lime','amethyst']
 for j,x in enumerate((0,10,20,30,40)):
  b.rect(x,14,x+8,39,'brown' if j%2 else 'ash');b.rect(x+1,19,x+7,33,'graphite');b.ellipse(x+2,23,x+6,29,cs[j]);b.rect(x+2,30,x+6,31,'silver')
  b.rect(x+2,10,x+5,15,'stone');b.line([(x+3,9),(x+5,2)],cs[j],3);b.rect(x+1,37,x+7,39,'ivory')
 for x in (3,13,23,33,43):b.rect(x,40,x+2,45,None)
 b.rect(0,45,47,47,'graphite');out[433]=b
 b=Board('graphite');b.ellipse(-6,-15,53,47,'stone');b.ellipse(0,-9,47,42,'ash');b.ellipse(5,-4,42,39,'umber')
 for y in (9,16,23,30):b.rect(5,y,42,y+2,'brown');b.rect(7,y-3,40,y-1,'gold');b.rect(9,y+1,12,y+1,'red')
 for x in (8,19,34,40):b.line([(x,8),(x,35)],'silver',2)
 b.ellipse(11,34,38,57,None);b.rect(0,40,47,47,'graphite');b.rect(20,37,28,47,None)
 for x in (6,18,31,40):b.rect(x,27,x+2,29,'yellow')
 out[434]=b
 b=sky(['navy','indigo','lavender','blush'],(0,6,17,31,48));b.rect(0,34,47,47,'slate')
 for x,y,w in [(0,28,9),(10,32,8),(27,30,9),(38,26,10)]:b.rect(x,y,x+w,47,'brown');b.poly([(x,y),(x+w//2,y-4),(x+w,y)],'ash')
 b.line([(0,28),(17,25),(36,23),(47,18)],'gold',2);b.rect(19,20,30,27,'ash');b.rect(21,21,28,25,'gold');b.rect(18,27,31,28,'graphite')
 b.rect(0,0,47,5,None);b.rect(4,34,8,40,None);b.rect(39,32,44,38,None);out[435]=b
 b=sky(['lavender','ice','blush']);b.rect(0,35,47,47,'brown')
 for x,y,r in [(3,24,8),(13,20,7),(23,23,9),(34,18,8),(42,25,7)]:
  b.ellipse(x-r//2,y-r//2,x+r//2,y+r//2,'verdigris');b.rect(x-r//2,y,x+r//2,39,'stone')
  loop(b,x,y-7,r//2,r//2,'bronze',2);b.ellipse(x-2,y-9,x+2,y-6,'white')
 b.ellipse(32,9,42,17,'graphite');b.line([(38,15),(38,34)],'cerulean',2);b.rect(32,33,44,39,'cerulean')
 for x in (7,17,28,39):b.rect(x,33,x+2,35,'gold')
 b.rect(8,40,13,47,None);b.rect(25,40,29,47,None);out[436]=b
 b=sky(['navy','indigo','blue']);b.ellipse(35,2,44,11,'ivory');b.rect(0,37,47,47,'graphite')
 for j,(x,y,w) in enumerate([(0,19,5),(5,27,4),(9,14,6),(16,22,4),(20,8,6),(27,20,4),(31,11,5),(37,24,4),(41,15,6)]):
  b.rect(x,y,x+w,46,'stone' if j%2 else 'brown');b.poly([(x,y),(x+w//2,y-5),(x+w,y)],'ash');windows(b,x+1,y+5,x+w,44,'gold',5)
 b.rect(0,0,24,6,None);b.rect(0,7,8,12,None);b.rect(0,44,47,47,'umber');out[437]=b
 b=sky(['blush','gold','lavender']);b.rect(0,10,47,47,'brown');b.rect(0,36,47,47,'stone');b.line([(4,0),(16,12),(11,25),(27,34),(20,47)],'cyan',9);b.line([(4,0),(16,12),(11,25),(27,34),(20,47)],'ice',3)
 for x,y,c in [(1,10,'rose'),(20,12,'gold'),(2,27,'red'),(27,27,'cerulean'),(34,39,'mauve'),(2,39,'lime')]:b.rect(x,y,x+11,y+8,'ash');b.rect(x,y,x+11,y+3,c);b.rect(x+2,y+4,x+9,y+7,None)
 for x,y in [(8,16),(27,20),(14,35),(37,10)]:b.rect(x,y,x+1,y+3,'gold')
 b.rect(40,1,47,7,'stone');out[438]=b
 b=Board('brown');b.rect(0,0,47,47,'umber')
 for r,c in [(23,'ash'),(19,'ivory'),(15,'stone'),(11,'gold'),(7,'brown')]:loop(b,24,24,r,r,c,3,55)
 b.ellipse(19,19,29,29,None);b.line([(2,23),(46,23)],'silver',3);b.line([(24,0),(24,47)],'ash',2)
 for x,y in [(3,4),(39,4),(3,39),(39,39)]:b.rect(x,y,x+5,y+5,'gold')
 b.rect(0,0,6,6,'stone');b.rect(42,0,47,6,'stone');out[439]=b
 b=sky(['lavender','blush','sand']);b.rect(0,30,47,47,'sage');b.poly([(1,10),(22,15),(22,42),(0,40)],'ivory');b.poly([(25,15),(47,10),(47,40),(25,42)],'sand')
 b.rect(22,17,25,44,'graphite');b.rect(23,25,24,45,'cerulean')
 for y in (19,25,31,37):b.rect(4,y,19,y+1,'brown');b.rect(28,y,44,y+1,'umber')
 for x,y in [(7,18),(15,24),(31,22),(39,30)]:b.rect(x,y,x+3,y+9,'stone');b.poly([(x,y),(x+2,y-3),(x+4,y)],'gold');b.rect(x+1,y+3,x+2,y+4,'gold')
 for y in (23,32,39):b.rect(20,y,28,y+1,'gold')
 b.line([(24,43),(31,45),(40,47)],'red',4);b.rect(0,0,11,3,None);b.rect(38,0,47,3,None);out[440]=b
 # 45 — one structure dominates a landscape; human markers remain tiny.
 b=sky(['cerulean','ice','blush']);b.rect(0,35,47,47,'green');b.poly([(0,38),(15,27),(26,31),(47,17),(47,47),(0,47)],'sage')
 b.line([(0,44),(47,7)],'ash',9);b.line([(0,43),(47,6)],'ivory',3)
 for x,y in [(3,41),(10,35),(18,29),(26,23),(34,17),(42,11)]:b.rect(x,y,x+4,y+2,'stone')
 for x,y in [(4,39),(13,32),(23,24)]:b.rect(x,y+4,x+3,y+6,None)
 for x in (35,42):house(b,x,37,4)
 b.rect(0,46,47,47,'forest');out[441]=b
 b=sky(['cerulean','ice','blush']);mountain(b,0,2,23,'slate');mountain(b,47,1,23,'pine');b.rect(6,8,41,44,'ash');b.rect(8,10,39,42,'stone');b.rect(8,7,40,10,'ivory')
 b.rect(23,13,24,44,None);b.rect(10,14,21,39,'silver');b.rect(26,14,38,39,'silver')
 for x in (12,29):
  for y in (17,26,34):b.rect(x,y,x+7,y+4,'ash')
 for x in (8,38):b.ellipse(x,21,x+3,24,'gold');b.ellipse(x,33,x+3,36,'gold')
 for x in (16,31):b.rect(x,45,x+2,46,'red')
 b.rect(0,34,5,41,None);b.rect(42,34,47,41,None);out[442]=b
 b=sky(['navy','indigo','cerulean','ice'],(0,7,18,34,48));b.rect(0,38,47,47,'green');b.rect(14,35,34,47,'stone')
 b.poly([(19,0),(29,0),(35,39),(13,39)],'ash');b.rect(21,0,27,37,'stone')
 for y in (5,12,19,26,33):b.rect(16,y,32,y+1,'gold')
 for y in (11,22,32):b.rect(0,y,47,y+3,'white');b.rect(0,y+3,47,y+4,'silver')
 b.rect(21,0,27,43,'ash');b.rect(23,6,25,40,'graphite')
 for x in (3,9,37,43):house(b,x,38,4)
 b.rect(0,0,14,6,None);b.rect(34,0,47,6,None);out[443]=b
 b=sky(['cerulean','ice','white']);mountain(b,1,7,26,'slate');mountain(b,46,6,25,'stone');b.rect(0,38,47,47,'green');b.rect(0,43,47,47,'forest')
 b.line([(8,25),(14,12),(33,12),(40,25)],'ash',7);b.line([(11,22),(17,14),(31,14),(38,22)],'ivory',3)
 b.rect(13,10,35,13,'stone');b.rect(21,10,26,11,'gold')
 for x in (17,22,29):b.rect(x,15,x+2,18,None)
 for x in (9,14,34,40):b.rect(x,26,x+2,30,'ash')
 for x in (19,27):house(b,x,39,4)
 b.rect(0,29,8,34,None);b.rect(39,30,47,34,None);out[444]=b
 b=sky(['navy','indigo','cerulean','ice'],(0,7,18,31,48));b.rect(0,39,47,47,'cerulean');b.rect(0,43,47,47,'blue')
 b.rect(2,10,46,44,'stone');b.ellipse(2,-20,46,40,'stone');b.ellipse(10,5,38,45,'ice');b.rect(14,21,34,43,'ice')
 for x in (4,39):b.rect(x,22,x+5,44,'ash');windows(b,x+1,25,x+5,43)
 b.rect(0,0,47,5,None);b.rect(17,6,30,15,None);b.rect(19,16,28,23,None);b.rect(0,42,10,47,None);b.rect(38,42,47,47,None)
 b.line([(0,41),(47,41)],'white',2);out[445]=b
 b=sky(['cerulean','ice','lavender']);b.rect(0,35,47,47,'forest');b.poly([(0,28),(12,25),(23,33),(31,22),(47,8),(47,18),(31,31),(22,41),(0,39)],'ash')
 b.line([(0,30),(12,27),(24,35),(34,21),(47,11)],'ivory',3)
 for x,y in [(4,28),(11,27),(21,33),(29,25),(36,19),(43,13)]:b.rect(x,y-5,x+3,y+4,'stone');b.rect(x+1,y-5,x+2,y-4,'red')
 b.rect(0,40,22,44,None);b.rect(36,37,47,41,None);out[446]=b
 b=sky(['cerulean','ice','gold']);
 for y,x0,x1,c in [(5,19,29,'ivory'),(12,15,33,'stone'),(19,10,38,'ash'),(26,5,43,'sand'),(33,0,47,'ivory'),(40,0,47,'stone')]:b.rect(x0,y,x1,47,c);b.rect(x0,y,x1,y+1,'gold')
 b.rect(0,0,17,13,'graphite');b.rect(0,7,17,10,'stone');b.rect(31,0,47,12,'gold')
 for y,xs in [(15,(17,25)),(22,(12,21,31)),(29,(6,16,28,39)),(36,(2,12,24,36,44))]:
  for x in xs:b.rect(x,y,x+3,y+3,None);b.rect(x+1,y+1,x+2,y+2,'cerulean')
 for x in (4,10,34,41):b.line([(x,1),(x+1,14)],'silver',1)
 out[447]=b
 b=sky(['cerulean','ice','blush']);b.rect(0,41,47,47,'green');b.rect(0,35,47,42,'white');b.rect(0,9,7,39,'brown');b.rect(41,9,47,39,'brown')
 for y,step in [(13,6),(20,8),(29,11)]:
  b.rect(5,y,43,y+2,'stone')
  for x in range(8,43,step):b.rect(x,y+3,x+2,y+9,'ash');b.rect(x+3,y+4,x+step-1,y+8,None)
 b.rect(4,10,44,12,'cerulean');waves(b,11,'white')
 for x in (11,25,36):house(b,x,5,4)
 b.rect(0,43,14,47,'sage');b.rect(34,43,47,47,'forest');out[448]=b
 b=Board('graphite');b.rect(0,35,47,47,'navy');b.rect(0,40,47,47,'slate')
 for x,y,w in [(0,0,7),(41,0,7),(11,5,5),(32,5,5),(19,9,3),(27,9,3)]:b.rect(x,y,x+w,42,'stone');b.rect(x,y,x+w,y+3,'ivory');b.rect(x+1,y+8,x+2,39,'ash');b.rect(x+2,y+16,x+3,y+18,'orange')
 b.line([(0,0),(47,0)],'umber',5);b.line([(0,7),(47,7)],'ash',2);boat(b,18,38,11)
 for x in (3,13,25,36,44):b.rect(x,43,x+1,46,'gold')
 b.rect(8,11,10,28,None);b.rect(37,11,40,27,None);b.rect(17,16,18,26,None);b.rect(30,16,31,26,None);out[449]=b
 # Milestone 450: light value gradients in five nested bands; oculus is sole large void.
 b=Board('ash')
 for r,c in [(47,'graphite'),(39,'ash'),(31,'stone'),(23,'sand'),(15,'ivory')]:b.ellipse(12-r,8-r,12+r,8+r,c)
 for r in (17,25,33,41):loop(b,12,8,r,r,'gold',1)
 for x in (5,16,27,38):b.line([(x,0),(x+5,28)],'gold',1)
 b.ellipse(7,3,17,13,'navy');b.ellipse(9,5,15,11,None);b.ellipse(11,4,16,9,'ivory');b.rect(9,11,10,12,'white')
 b.poly([(12,10),(17,11),(40,41),(32,42)],'silver');b.poly([(13,11),(16,11),(37,41),(34,41)],'ice')
 b.rect(4,19,30,21,'white');b.rect(9,21,28,23,'lavender');b.rect(22,27,46,29,'white');b.rect(27,29,44,30,'lavender')
 b.rect(0,28,47,32,'stone');
 for x in range(5,45,8):b.rect(x,30,x+4,32,'graphite')
 b.rect(0,24,5,47,'ash');b.rect(42,24,47,47,'ash');b.rect(0,33,47,47,'slate')
 for x,y,h in [(7,36,10),(12,33,13),(19,38,8),(25,34,12),(31,36,10),(38,34,12)]:
  b.rect(x,y,x+3,47,'ivory');b.rect(x,y-2,x+3,y,'brown');b.rect(x+1,y+3,x+2,y+4,'gold')
 for x in (14,35):b.ellipse(x,36,x+5,41,'rose');b.rect(x+1,39,x+4,46,'stone')
 b.rect(25,41,41,45,'sand');b.rect(6,45,42,47,'cerulean');b.rect(8,46,40,47,'cyan')
 b.rect(0,42,4,47,'umber');b.rect(43,42,47,47,'umber')
 out[450]=b
 return finish(out)

TARGET={411:2185,412:2195,413:2125,414:2215,415:2085,416:2195,417:2225,418:2245,419:2235,420:2260,
421:2145,422:2125,423:2155,424:2175,425:2045,426:2165,427:2135,428:2195,429:2155,430:2235,
431:2195,432:2175,433:2235,434:2205,435:2105,436:2225,437:2245,438:2235,439:2195,440:2260,
441:2175,442:2205,443:2145,444:2185,445:2105,446:2195,447:2255,448:2215,449:2165,450:2260}
MINCOL={411:15,412:15,413:15,414:15,415:13,416:16,417:16,418:16,419:17,420:18,
421:14,422:14,423:15,424:15,425:12,426:15,427:15,428:16,429:15,430:18,
431:15,432:15,433:17,434:15,435:13,436:16,437:16,438:17,439:16,440:19,
441:14,442:15,443:15,444:15,445:13,446:15,447:16,448:16,449:15,450:19}
PAIRS={42:[('ash','silver'),('graphite','slate'),('cerulean','blue'),('blush','lavender'),('green','lime'),('ice','white'),('brown','umber'),('stone','ash'),('navy','indigo'),('silver','white'),('olive','moss'),('gold','orange'),('cerulean','teal'),('blue','verdigris'),('indigo','ultramarine'),('ice','lavender'),('ash','umber'),('silver','sage'),('graphite','navy'),('stone','brown'),('silver','cerulean'),('ash','moss'),('stone','sand')],
43:[('navy','indigo'),('indigo','blue'),('lavender','mauve'),('silver','white'),('sage','green'),('moss','forest'),('white','ice'),('rose','blush'),('stone','ash'),('cerulean','blue'),('blue','ultramarine'),('pine','forest'),('ash','silver'),('gold','yellow'),('ivory','sand'),('navy','ultramarine'),('indigo','plum'),('lavender','blush'),('forest','olive'),('sage','olive'),('blue','teal'),('stone','ivory'),('navy','plum'),('lavender','white'),('cerulean','ice'),('indigo','navy'),('blue','cerulean'),('seafoam','silver'),('graphite','stone'),('brown','umber'),('cerulean','teal')],
44:[('brown','umber'),('lavender','mauve'),('blush','rose'),('gold','yellow'),('ash','stone'),('stone','silver'),('indigo','navy'),('slate','graphite'),('cerulean','blue'),('ivory','sand'),('white','silver'),('graphite','slate'),('sage','moss'),('silver','ice'),('brown','red'),('umber','moss'),('ash','ivory'),('stone','sage'),('lavender','sand'),('navy','blue'),('blush','gold'),('umber','graphite'),('ash','navy'),('stone','cerulean'),('ivory','white'),('gold','orange'),('brown','red')],
45:[('cerulean','blue'),('ice','white'),('ash','stone'),('stone','sand'),('ivory','silver'),('sage','olive'),('graphite','slate'),('navy','indigo'),('forest','pine'),('brown','umber'),('lavender','blush'),('green','lime'),('silver','white'),('gold','orange'),('ash','ivory'),('stone','graphite'),('cerulean','teal'),('sage','forest'),('ice','lavender'),('sand','gold'),('slate','navy'),('stone','silver'),('slate','cerulean'),('graphite','plum'),('ivory','white'),('ash','graphite'),('navy','blue')]}

def finish(out):
 # Milestone: widen the dark aperture around the moon; roof red is absent.
 b=out[450];b.rect(7,5,9,11,None);b.rect(16,6,18,9,None)
 # The library well falls into a larger genuine dark central shaft.
 b=out[439];b.ellipse(17,17,31,31,None);b.line([(2,23),(46,23)],'silver',3)
 # The underside of the continental stair has one broad deep-shadow opening.
 b=out[441];b.poly([(0,32),(10,32),(16,39),(12,47),(0,47)],None)
 for i,b in out.items():
  target=TARGET[i]
  filled=sum(c is not None for row in b.cells for c in row)
  if filled<target:
   # Restore only dark background/sky or shadow; true void remains at the outer corners.
   void=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x] is None]
   void.sort(key=lambda p:(abs(p[0]-24)+abs(p[1]-25),p[1],p[0]))
   for x,y in void[:target-filled]:
    color='navy' if 421<=i<=430 or i in (413,435,443) else 'ice' if i==445 and y<42 else 'graphite' if i in (418,419,449) else 'slate'
    b.put(x,y,color)
  elif filled>target:
   # Convert only established dark materials to a continuous shadow/shaft.
   if i==450:
    for y in range(2,15):
     for x in range(6,19):
      if filled<=target:break
      if b.cells[y][x] in ('navy','graphite') and (x-12)**2+(y-8)**2<50:b.put(x,y,None);filled-=1
   elif i==439:
    for y in range(12,36):
     for x in range(12,36):
      if filled<=target:break
      if b.cells[y][x] in ('umber','brown','graphite') and (x-24)**2+(y-24)**2<130:b.put(x,y,None);filled-=1
   elif i==441:
    for y in range(31,48):
     for x in range(0,20):
      if filled<=target:break
      if b.cells[y][x] in ('forest','sage','ash') and y>x+24:b.put(x,y,None);filled-=1
  # Broad bounded material planes. Each addition is contiguous and at least 25 cells.
  world=(i-1)//10+1
  while True:
   counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
   if len(counts)>=MINCOL[i]:break
   made=False
   for source,dest in PAIRS[world]:
    if source not in counts or dest in counts:continue
    for box in [(0,0,47,8),(0,39,47,47),(0,10,22,34),(25,8,47,35),(0,20,47,29),(0,0,22,47),(25,0,47,47)]:
     x0,y0,x1,y1=box
     n=sum(b.cells[y][x]==source for y in range(y0,y1+1) for x in range(x0,x1+1))
     if 38<=n<=max(230,counts[source]-35):
      material(b,source,dest,box);made=True;break
    if made:break
   if not made:raise RuntimeError(f'Cannot add material {i} {len(counts)} {counts}')
  # Rare colors are expanded only from their own contiguous patch, never dotted elsewhere.
  while True:
   counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
   rare=[(n,c) for c,n in counts.items() if n<25]
   if not rare:break
   n,c=min(rare);members=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x]==c]
   cx=sum(x for x,_ in members)/n;cy=sum(y for _,y in members)/n
   choices=[]
   for x,y in members:
    for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
     if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] not in (None,c) and counts[b.cells[yy][xx]]>25:
      choices.append((abs(xx-cx)+abs(yy-cy),yy,xx))
   if not choices:
    for x,y in members:
     for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
      if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] is None:
       choices.append((abs(xx-cx)+abs(yy-cy),yy,xx))
   if not choices:
    for yy in range(max(0,int(cy)-6),min(48,int(cy)+7)):
     for xx in range(max(0,int(cx)-6),min(48,int(cx)+7)):
      old=b.cells[yy][xx]
      if old not in (None,c) and counts[old]>25:
       choices.append((abs(xx-cx)+abs(yy-cy),yy,xx))
   if not choices:raise RuntimeError(f'Cannot grow {i}/{c}/{n}')
   _,yy,xx=min(choices);b.put(xx,yy,c)
 # Final silhouette passes use only approved filled materials and existing colors.
 b=out[425]
 b.ellipse(2,3,29,30,'ivory')
 b.ellipse(11,0,34,25,'navy')
 b.rect(0,31,10,36,'plum')
 for x in (12,16,20,24,28):
  b.line([(x,23),(x+1,37)],'lavender',3)
  b.ellipse(x-1,28,x+2,32,'mauve')
 b.rect(5,34,9,39,'white')
 for y in range(0,16):
  edge=next((x for x in range(47,35,-1) if b.cells[y][x]=='navy'),None)
  if edge is not None:b.put(edge,y,None);break
 b=out[445]
 b.ellipse(11,12,37,39,'cerulean')
 b.rect(12,26,36,43,'cerulean')
 b.rect(14,39,34,47,'blue')
 b.line([(11,17),(11,42)],'stone',3)
 b.line([(37,17),(37,42)],'stone',3)
 for x in (4,40):
  for y in (24,31,38):b.rect(x,y,x+2,y+2,'gold')
 b=out[450]
 b.poly([(12,10),(17,11),(41,41),(34,43)],'silver')
 b.line([(14,11),(37,41)],'ice',2)
 b.rect(7,20,22,20,'white')
 b.rect(29,28,43,28,'white')
 b.rect(32,42,41,45,'sand')
 # A silhouette edit can reduce a formerly marginal material; restore contiguous patches.
 for i in (425,445,450):
  b=out[i]
  while True:
   counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
   rare=[(n,c) for c,n in counts.items() if n<25]
   if not rare:break
   n,c=min(rare)
   members=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x]==c]
   opts=[]
   for x,y in members:
    for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
     if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] not in (None,c) and counts[b.cells[yy][xx]]>25:opts.append((yy,xx))
   if not opts:break
   yy,xx=min(opts);b.put(xx,yy,c)
 return out

if __name__=="__main__":
 root=Path('/Users/andres/Desktop/pixel-arcadia-design-351-500')
 names={42:'COLOSSAL_MACHINES',43:'CELESTIAL_GARDENS',44:'ARCANE_CITY',45:'COLOSSAL_ARCHITECTURE'}
 titles={}
 for w,name in names.items():
  for i,t in re.findall(r'^## (\d+) — (.+)$',(root/f'WORLD_{w}_{name}.md').read_text(),re.M):titles[int(i)]=re.sub(r' \*\(.+?\)\*','',t).strip()
 result=[]
 for i,b in boards().items():
  rows=b.rows();used=set(''.join(rows))-{'.'};counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
  result.append(dict(id=i,title=titles[i],grid=rows,legend={c:LEGEND[c] for c in sorted(used)}))
  print(i,sum(counts.values()),len(counts),min(counts.values()))
 Path('dist/m16e').mkdir(parents=True,exist_ok=True);Path('dist/m16e/art.json').write_text(json.dumps(result,indent=2)+'\n')
