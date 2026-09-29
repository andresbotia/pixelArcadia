"""Individually drawn M16C integer raster artwork. Offline only; no randomness."""
import json, math, re, importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('raster',Path(__file__).with_name('m16a-art.py'))
raster=importlib.util.module_from_spec(spec);spec.loader.exec_module(raster)
COLORS=raster.COLORS
LOCKED={'silver':'k','moss':'q','ash':'d'}
free=iter(c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' if c not in LOCKED.values())
ENCODE={c:LOCKED[c] if c in LOCKED else next(free) for c in COLORS}
assert len(set(ENCODE.values()))==44
raster.ENCODE=ENCODE;LEGEND={ch:c for c,ch in ENCODE.items()};Board=raster.Board

def sky(cs,ys=(0,15,31,48)):
 b=Board(cs[0]);b.bands(cs,ys);return b

def frame(b,n):
 for y in range(n):
  for x in range(n-y):
   for xx,yy in [(x,y),(47-x,y),(x,47-y),(47-x,47-y)]:b.put(xx,yy,None)

def loop(b,cx,cy,rx,ry,c,w=2,angle=0):
 a=math.radians(angle);pts=[]
 for i in range(65):
  x=rx*math.cos(i*math.pi/32);y=ry*math.sin(i*math.pi/32);pts.append((cx+x*math.cos(a)-y*math.sin(a),cy+x*math.sin(a)+y*math.cos(a)))
 b.line(pts,c,w)

def hall(b,x,y,w=9,h=7):
 b.rect(x+1,y,x+w-1,y+h,'ivory');b.rect(x+2,y+1,x+3,y+h,'red');b.rect(x+w-3,y+1,x+w-2,y+h,'red')
 b.poly([(x-2,y),(x+w//2,y-4),(x+w+2,y),(x+w,y+2),(x,y+2)],'gold');b.line([(x,y+1),(x+w,y+1)],'graphite',1);b.rect(x+w//2,y+3,x+w//2+1,y+h,None)

def pine(b,x,y,h=9):
 b.rect(x,y,x+1,y+h,'umber');b.poly([(x,y-2),(x+5,y+h-2),(x-4,y+h-2)],'pine');b.line([(x,y),(x+2,y+h-3)],'forest',2)

def hut(b,x,y):
 b.rect(x,y,x+5,y+5,'ivory');b.poly([(x-1,y),(x+3,y-3),(x+7,y)],'brown');b.rect(x+2,y+2,x+3,y+5,'umber')

def material(b,source,target,box):
 x0,y0,x1,y1=box
 for y in range(y0,y1+1):
  for x in range(x0,x1+1):
   if b.cells[y][x]==source:b.put(x,y,target)

def boards():
 out={}
 # Lost Futures: broad faded daylight, empty chrome infrastructure.
 b=sky(['lavender','blush','sand']);b.poly([(0,41),(16,37),(32,40),(48,34),(48,48),(0,48)],'sage')
 path=[(0,33),(8,23),(17,17),(27,14),(37,15),(44,18)]
 for x,y in [(5,27),(12,21),(20,16),(28,14),(36,15),(43,18)]:b.rect(x,y,x+1,42,'slate');b.rect(x+2,40,x+3,44,'umber')
 b.line(path,'stone',5);b.line(path,'silver',3);b.line([(16,16),(24,12),(30,14)],'white',6);b.line([(17,15),(24,13),(29,14)],'ice',2);b.line([(17,18),(29,17)],'teal',2);b.rect(18,15,21,16,'coral');b.rect(27,15,29,16,'orange')
 b.rect(44,19,47,23,None);b.rect(7,32,10,39,None);b.rect(30,25,33,32,None);b.line([(0,45),(20,43),(47,46)],'gold',2);out[331]=b
 b=sky(['navy','indigo','stone'],(0,12,30,48));b.ellipse(33,3,45,15,'cerulean');b.ellipse(35,4,42,11,'blue');b.poly([(35,6),(40,4),(43,8),(39,10)],'sage');b.line([(35,12),(41,13)],'white',2)
 for x,y in [(2,25),(10,22),(19,24),(27,26)]:b.ellipse(x,y-5,x+8,y+2,'silver');b.rect(x,y,x+8,33,'white');b.rect(x,y+3,x+8,y+4,'coral');b.rect(x+2,y+1,x+5,y+2,'ice');b.rect(x+3,y+6,x+4,33,None)
 for x,y in [(35,24),(43,26)]:loop(b,x,y,4,3,'silver');b.rect(x,y+3,x+1,36,'slate');b.line([(x-3,y),(x+3,y)],'stone',2)
 b.rect(31,16,32,30,'graphite');b.line([(2,41),(18,37),(32,42)],'slate',2);b.rect(34,40,41,43,'teal');b.rect(36,39,39,40,'orange');b.rect(3,4,15,10,None);b.rect(17,2,25,7,None);out[332]=b
 b=sky(['cerulean','blush','sand']);b.poly([(35,28),(40,28),(48,48),(24,48)],'stone');b.line([(38,30),(38,47)],'white',2)
 b.rect(2,29,27,42,'seafoam');b.poly([(0,20),(11,24),(31,26),(26,30),(3,28)],'coral');b.line([(1,23),(25,28)],'silver',2)
 for x in [4,12,20]:b.rect(x,31,x+5,37,None);b.rect(x,38,x+5,40,'teal')
 b.rect(34,6,40,39,'silver');b.poly([(34,7),(37,0),(40,7)],'red');b.poly([(34,27),(30,35),(34,34)],'silver');b.poly([(40,27),(44,35),(40,34)],'silver');b.rect(35,11,39,13,'orange');b.rect(35,18,38,20,'teal');b.rect(35,23,39,25,'gold');b.ellipse(8,41,15,47,'umber');b.line([(9,43),(14,46)],'sage',2);out[333]=b
 b=sky(['lavender','blush','sage']);b.rect(0,43,47,47,'stone')
 for x,y in [(4,37),(11,31),(17,27),(31,19),(39,13),(45,9)]:b.rect(x,y,x+1,44,'slate')
 b.line([(0,41),(11,32),(20,26)],'stone',5);b.line([(29,20),(47,8)],'stone',5);b.line([(0,39),(19,25)],'silver',3);b.line([(29,18),(47,6)],'silver',3);b.line([(0,40),(19,26)],'teal',1);b.line([(29,19),(47,7)],'teal',1)
 for x,y,c in [(4,34,'coral'),(12,28,'seafoam'),(31,14,'blush'),(40,7,'cerulean')]:b.ellipse(x,y,x+6,y+4,c);b.rect(x+1,y,x+4,y+1,'ice')
 b.line([(20,26),(23,32)],'umber',1);b.ellipse(21,32,26,36,'rose');b.rect(22,32,24,33,'ice');b.poly([(21,26),(28,22),(28,31),(24,37),(20,32)],None);b.line([(18,29),(18,40)],'sage',2);out[334]=b
 b=sky(['lavender','blush','coral'],(0,17,38,48));b.rect(0,41,47,47,'sage');b.line([(0,43),(16,40),(35,44),(47,41)],'olive',3)
 b.line([(4,15),(12,9),(33,9),(43,14)],'seafoam',6);b.rect(8,14,9,34,'silver');b.rect(37,14,38,35,'silver');b.rect(11,31,35,33,'stone');b.rect(13,33,14,39,'umber');b.rect(32,33,33,39,'umber')
 b.ellipse(17,18,27,27,'silver');b.rect(18,23,27,31,'white');b.rect(19,21,26,23,'lavender');b.rect(19,28,27,30,'coral');b.line([(19,31),(17,36),(25,36)],'silver',3);b.line([(27,31),(29,36),(33,36)],'silver',3);b.rect(40,23,43,29,'cerulean');b.rect(41,25,43,26,'gold');out[335]=b
 b=sky(['blush','lavender','sand']);b.poly([(24,2),(43,40),(4,40)],'silver');b.poly([(24,6),(39,38),(24,38)],'stone')
 for y in [12,20,28,36]:b.line([(11+(36-y)//2,y),(36-(36-y)//2,y)],'cerulean',2)
 for x,y,w,h in [(17,13,6,5),(21,24,8,6),(32,31,6,5)]:b.rect(x,y,x+w,y+h,None);b.line([(x,y+h),(x+w,y+h)],'coral',2);b.rect(x-1,y+h-1,x+1,y+h+3,'sage');b.rect(x+w-1,y+h-1,x+w+2,y+h+2,'olive')
 b.rect(2,41,45,44,'ivory');b.line([(4,44),(44,44)],'teal',2);b.rect(5,35,10,38,'green');out[336]=b
 b=sky(['blush','lavender','navy']);b.rect(0,42,34,47,'stone');b.rect(35,39,47,47,'cerulean');b.line([(37,44),(47,44)],'ice',2)
 b.rect(6,0,8,43,'umber');b.rect(18,0,20,43,'brown')
 for y in range(4,42,8):b.line([(8,y),(18,y+7),(8,y+7),(18,y)],'silver',2);b.rect(10,y+2,15,y+4,None)
 b.rect(26,11,32,43,'white');b.poly([(26,11),(29,3),(32,11)],'red');b.rect(27,19,31,22,'silver');b.poly([(26,35),(22,42),(26,42)],'teal');b.poly([(32,35),(36,42),(32,42)],'teal')
 for y in [15,26,36]:b.rect(20,y,26,y+1,'silver')
 b.rect(11,44,27,46,'graphite');b.rect(15,5,16,6,'white');b.rect(13,29,14,30,'white');out[337]=b
 b=sky(['lavender','blush','ivory']);b.rect(0,41,47,47,'stone')
 for x,y,w,c in [(2,20,14,'seafoam'),(15,13,15,'coral'),(27,26,10,'seafoam')]:b.rect(x+w//2,y,x+w//2+1,43,'silver');b.ellipse(x,y-3,x+w,y+2,'silver');b.ellipse(x+2,y-2,x+w-2,y,c)
 b.rect(39,2,42,40,'white');loop(b,40,8,5,4,'silver');b.line([(38,14),(44,19),(37,24),(44,30),(37,35)],'ice',2)
 loop(b,10,36,7,8,'silver');loop(b,10,36,3,8,'silver');b.line([(3,36),(17,36)],'silver',2);b.line([(5,39),(11,33)],'sage',2);b.ellipse(23,42,33,46,'slate');b.ellipse(25,43,31,44,'cerulean');out[338]=b
 b=sky(['navy','indigo','cerulean'],(0,17,38,48));b.ellipse(-4,37,53,69,'blue');b.line([(0,44),(18,39),(36,41),(47,46)],'sage',4);b.line([(2,40),(18,38),(38,40)],'white',2)
 loop(b,24,20,22,12,'silver',4,-18);b.ellipse(20,16,28,24,'gold');b.ellipse(22,18,26,22,'white')
 for x,y in [(4,19),(13,10),(28,8),(44,18),(34,29),(14,30)]:b.line([(24,20),(x,y)],'stone',2)
 for x,y in [(5,18),(12,10),(22,8),(15,29),(28,31)]:b.rect(x,y,x+3,y+1,'cerulean')
 for x,y in [(38,12),(42,17),(40,24)]:b.rect(x,y,x+2,y+2,None);b.line([(x-1,y-1),(x+3,y+3)],'slate',1)
 b.rect(12,15,17,20,None);b.rect(29,23,32,26,None);out[339]=b
 b=sky(['gold','blush','lavender']);b.rect(0,38,47,47,'graphite');b.rect(0,43,47,47,'umber')
 for x,h,w in [(7,3,3),(17,12,5),(23,1,3),(29,8,8),(40,4,3)]:b.rect(x,h,x+w,38,'silver');b.rect(x+1,h+3,x+2,35,'white');b.poly([(x,h),(x+w//2,h-3),(x+w,h)],'ice')
 for x,y in [(13,18),(40,23)]:b.rect(x,y,x+1,37,'stone');b.ellipse(x-5,y-3,x+5,y+2,'seafoam');b.line([(x-4,y),(x+4,y)],'coral',2)
 loop(b,22,26,21,7,'silver',2);b.line([(0,23),(17,18),(33,24),(47,16)],'teal',2)
 b.rect(30,15,36,27,'coral');b.rect(30,19,32,26,'seafoam');b.rect(34,18,36,24,'rose');b.rect(32,15,33,18,'blush');b.rect(0,37,47,39,'slate')
 for x in [3,10,18,28,37,44]:b.rect(x,39,x+1,43,'stone')
 for x in [6,22,40]:b.rect(x,40,x+2,42,None)
 b.line([(3,32),(9,28)],'bronze',4);b.rect(5,33,6,38,'bronze');b.line([(0,46),(13,44),(19,47)],'sage',2);out[340]=b
 # Mythic Asia: painted mist, asymmetric landscape and lacquer structures.
 b=sky(['lavender','ivory','silver']);b.poly([(32,5),(40,48),(19,48)],'slate');b.poly([(32,5),(32,47),(22,47)],'graphite');pine(b,30,28,12);hall(b,29,9,5,4)
 b.line([(0,20),(15,15),(30,17),(47,13)],'ice',5);b.line([(0,34),(18,31),(31,35),(47,30)],'ivory',5)
 b.line([(2,11),(9,7),(19,10),(23,16)],'gold',7);b.poly([(2,11),(0,3),(7,7)],'yellow');b.line([(5,10),(14,8),(19,11)],'yellow',2);b.ellipse(20,13,26,18,'gold');b.rect(23,14,24,15,'graphite')
 b.line([(44,36),(38,42),(28,39),(22,32)],'white',7);b.poly([(44,36),(48,43),(40,41)],'blush');b.ellipse(19,29,25,34,'white');b.rect(20,30,21,31,'graphite');b.rect(29,37,33,40,'red');b.rect(38,40,40,42,'coral');out[341]=b
 b=sky(['cerulean','lavender','ice']);b.rect(0,40,47,47,'slate');b.line([(0,46),(20,42),(47,44)],'cerulean',4)
 for x,y,w in [(8,14,13),(24,2,14),(41,19,12)]:b.poly([(x,y),(x+w,y+29),(x-w,y+29)],'stone');b.poly([(x,y),(x+6,y+12),(x,y+8),(x-6,y+12)],'white');b.line([(x,y+10),(x+7,y+27)],'silver',3)
 hall(b,20,9,8,7);b.rect(22,12,25,15,'maroon')
 for a,z,y in [(5,23,19),(25,43,23),(3,21,29),(26,46,33)]:
  b.line([(a,y),(a+8,y+3),(z,y)],'silver',1)
  for k,x in enumerate(range(a+2,z,4)):b.rect(x,y+1,x+1,y+2,['blue','white','red','green','yellow'][k%5])
 out[342]=b
 b=sky(['cerulean','blush','sage']);b.rect(0,41,47,47,'olive');b.line([(0,44),(24,42),(47,45)],'gold',2);hut(b,5,40);hut(b,16,43)
 for x,y,w,c in [(2,28,9,'bronze'),(15,20,11,'coral'),(29,10,15,'ivory')]:
  b.ellipse(x,y,x+w,y+5,c);b.line([(x+w-2,y+2),(x+w,y-4),(x+w+3,y-4)],c,3);b.poly([(x+w+2,y-5),(x+w+5,y-3),(x+w+2,y)],c)
  for lx in [x+2,x+w-2]:b.line([(lx,y+3),(lx-1,y+9),(lx+2,y+10)],c,2)
  b.line([(x+1,y),(x-4,y-3),(x-8,y-2)],'lavender',3);b.line([(x+w,y-3),(x+w-4,y-6),(x+w-9,y-5)],'white',2)
 out[343]=b
 b=Board('stone');b.rect(19,8,30,47,'red');b.rect(24,15,25,46,None);b.rect(0,0,47,5,'graphite');b.line([(0,5),(47,5)],'gold',2)
 for x,y in [(21,13),(28,13),(21,23),(28,23),(21,33),(28,33),(21,43),(28,43)]:b.rect(x,y,x+1,y+1,'gold')
 for x,c in [(2,'verdigris'),(33,'coral')]:
  b.ellipse(x+2,9,x+10,17,c);b.poly([(x+4,17),(x+12,20),(x+13,32),(x+8,37),(x+1,31)],c);b.line([(x+3,30),(x+2,45)],c,5);b.line([(x+10,31),(x+13,45)],c,5);b.rect(x+3,22,x+10,24,'gold');b.rect(x+4,10,x+6,11,'white')
 b.line([(5,20),(1,15),(4,8)],'verdigris',4);b.rect(2,7,6,10,'verdigris');b.rect(6,14,8,15,None);b.line([(43,21),(46,11),(46,41)],'bronze',2);b.line([(0,26),(11,19),(18,27)],'ultramarine',3);b.line([(33,28),(41,19),(47,24)],'ivory',3);out[344]=b
 b=sky(['lavender','silver','ivory'],(0,7,14,48));b.poly([(0,12),(10,3),(18,11),(32,6),(47,14)],'sage')
 for y,c in [(15,'olive'),(19,'blush'),(23,'green'),(27,'cerulean'),(31,'lime'),(35,'rose'),(39,'olive'),(43,'blush')]:b.poly([(0,y+4),(15,y),(32,y+2),(48,y-2),(48,48),(0,48)],c)
 hut(b,33,25);out[345]=b
 b=sky(['lavender','ivory','silver']);b.rect(0,42,47,47,'sage');pine(b,43,10,20);pine(b,37,25,17);b.ellipse(6,27,37,44,'slate');b.ellipse(9,27,34,40,'stone')
 for x,y in [(12,30),(22,29),(29,34)]:b.ellipse(x,y,x+6,y+5,'verdigris')
 b.ellipse(1,33,11,39,'stone');b.rect(3,34,4,35,'graphite');b.rect(9,40,13,46,'stone');b.rect(29,40,33,46,'stone');b.rect(17,2,30,29,'graphite');b.rect(16,1,31,3,'gold');b.rect(18,4,19,27,'stone')
 for y in [7,13,19,25]:b.rect(22,y,27,y+1,'gold')
 out[346]=b
 b=sky(['cerulean','lavender','blush']);b.line([(10,33),(21,18),(27,12),(41,26)],'coral',3);b.line([(10,34),(29,29),(41,26)],'verdigris',3);b.line([(13,31),(24,20)],'gold',2)
 for x,y,w in [(1,33,21),(18,13,17),(33,27,15)]:b.ellipse(x,y,x+w,y+9,'silver');b.ellipse(x+1,y,x+w-1,y+6,'ivory');hall(b,x+3,y-6,w-6,6);pine(b,x+w-3,y-4,7)
 b.rect(26,20,29,24,None);b.rect(6,43,12,46,None);out[347]=b
 b=sky(['navy','indigo','ultramarine']);b.ellipse(2,2,12,12,'ivory');b.line([(0,43),(24,40),(47,44)],'forest',6)
 for j,(x,y) in enumerate([(23,6),(29,5),(36,7),(42,12),(45,19),(43,26),(38,30),(33,35),(28,38)]):b.line([(20,33),(25,y+7),(x,y)],['ice','silver','cerulean','lavender'][j%4],3)
 for x in [2,8,15,23,31,39,46]:b.rect(x,0,x+1,44,'pine');b.rect(x,12,x+1,13,'sage');b.rect(x,28,x+1,29,'sage')
 b.ellipse(12,29,25,38,'white');b.poly([(11,30),(12,23),(16,26),(20,24),(21,29)],'ivory');b.rect(13,29,14,30,'red');b.rect(13,37,15,44,'white');b.rect(22,37,24,44,'white');out[348]=b
 b=sky(['lavender','ivory','slate']);b.poly([(30,2),(48,17),(48,48),(0,48),(0,25)],'graphite');b.poly([(31,5),(47,24),(47,47),(32,47)],'sage')
 path=[(6,46),(25,40),(11,33),(33,27),(19,20),(35,14),(30,6)];b.line(path,'stone',4);b.line(path,'ivory',2)
 for x,y in [(20,39),(25,26),(29,13)]:hall(b,x-4,y-4,8,5)
 b.line([(6,11),(8,20),(5,30)],'ice',4);b.line([(6,12),(7,29)],'white',2);pine(b,40,23,14);pine(b,14,34,10);b.line([(0,18),(16,19),(30,17),(47,20)],'silver',3);b.line([(0,31),(20,29),(47,32)],'lavender',3);hall(b,27,5,7,4);out[349]=b
 b=sky(['navy','indigo','lavender','rose','blush'],(0,8,15,24,34,48));b.poly([(24,12),(47,22),(47,40),(30,46),(5,41),(0,27)],'slate');b.poly([(15,19),(29,16),(33,34),(12,40),(0,35)],'stone')
 for x,y,h in [(9,25,11),(15,27,12),(25,24,9),(31,30,10)]:pine(b,x,y,h)
 for y,c in [(36,'olive'),(39,'blush'),(42,'lime'),(45,'cerulean')]:b.poly([(17,y),(31,y-3),(48,y),(48,48),(17,48)],c)
 path=[(0,1),(12,4),(24,7),(32,12),(35,20),(29,25),(19,29),(12,34),(9,41),(0,47)];b.line(path,'cerulean',8);b.line(path,'ice',5);material(b,'ivory','white',(0,12,6,16));b.ellipse(-5,39,18,52,'cerulean');b.line([(0,45),(9,43),(16,46)],'seafoam',3)
 b.ellipse(27,10,36,17,'ice');b.poly([(35,12),(40,13),(36,16),(32,17)],'ice');b.rect(34,12,35,13,'gold');b.line([(37,14),(41,10),(45,11)],'silver',1);b.line([(36,16),(40,20),(44,19)],'silver',1);b.poly([(28,12),(27,6),(30,8),(32,5),(33,10)],'white')
 b.line([(0,13),(14,11),(26,14)],'ivory',5);hall(b,4,9,11,6);b.line([(13,14),(23,13)],'gold',2);b.rect(17,15,19,16,None);hall(b,39,21,7,5);b.line([(0,23),(14,22),(29,23)],'silver',2);b.line([(20,34),(32,33),(47,35)],'ivory',2);hut(b,31,40);hut(b,40,43)
 b.ellipse(2,43,7,45,'gold');b.ellipse(9,47,14,49,'white');b.rect(10,47,11,48,'red');b.rect(25,10,27,12,None);b.rect(39,16,41,18,None);out[350]=b
 # Giant Insects: architecture, filled wing panes and thick joints.
 b=sky(['lavender','blush','cerulean']);b.rect(0,40,47,47,'navy');b.line([(0,43),(20,42),(47,45)],'slate',3);b.ellipse(3,14,47,41,'moss');b.ellipse(9,14,45,30,'olive');b.poly([(29,16),(46,26),(43,39),(28,38)],'moss');b.line([(29,17),(29,36)],None,2);b.ellipse(0,26,13,37,'bronze');b.line([(4,30),(4,22),(9,20),(15,25),(16,40)],'bronze',4);b.line([(12,19),(24,16),(36,20),(44,26)],'sand',2)
 for x,y in [(14,18),(22,16),(31,18),(40,23)]:b.rect(x,y-3,x+2,y-2,'umber');b.rect(x,y-1,x+1,y,'gold')
 for x,y in [(15,27),(34,31),(39,24)]:b.ellipse(x,y,x+5,y+3,'sage')
 for x,y in [(12,35),(22,38),(36,38)]:b.line([(x,y),(x-2,42),(x+2,44)],'bronze',2)
 b.rect(5,35,9,39,None);b.line([(40,43),(42,37),(44,42)],'forest',2);out[351]=b
 b=sky(['cerulean','ice','olive']);b.rect(0,0,47,7,'graphite');b.rect(42,0,47,47,'slate');b.rect(22,7,23,15,'umber');b.ellipse(10,12,36,40,'sand')
 for y,c in [(17,'silver'),(23,'stone'),(29,'silver')]:b.line([(12,y),(23,y+3),(34,y)],c,3)
 b.rect(13,34,33,40,'umber')
 for j,x in enumerate([14,20,26]):b.rect(x,35,x+3,38,'gold' if j%2==0 else None)
 for x,y in [(3,17),(34,8),(35,29)]:b.ellipse(x,y,x+4,y+3,'gold');b.rect(x+2,y,x+2,y+3,'umber');b.ellipse(x-2,y-2,x+1,y,'silver');b.ellipse(x+3,y-2,x+6,y,'silver')
 hut(b,4,42);b.rect(42,12,46,19,'moss');b.rect(37,38,40,45,None);out[352]=b
 b=sky(['blush','lavender','slate']);b.rect(0,36,47,47,'navy');b.line([(1,44),(18,38),(35,37)],'navy',5);b.line([(0,46),(22,43),(47,45)],'sage',2)
 for pts,c in [([(28,16),(3,3),(0,8),(23,23)],'ice'),([(25,21),(1,17),(0,25),(21,27)],'seafoam'),([(30,17),(46,24),(47,36),(28,24)],'silver'),([(24,23),(36,43),(44,46),(29,24)],'ice')]:
  b.poly(pts,c);b.line([pts[0],pts[1],pts[2],pts[3]],'stone',1);b.line([pts[0],pts[2]],'stone',1);b.rect(pts[1][0],pts[1][1],pts[1][0]+2,pts[1][1]+1,'gold')
 b.line([(6,34),(40,6)],'verdigris',4);b.line([(8,32),(39,7)],'cerulean',2);b.ellipse(36,3,43,10,'verdigris');b.rect(38,5,39,6,'navy');b.rect(38,32,46,37,'sand');b.poly([(37,32),(42,28),(47,32)],'umber');b.rect(39,38,40,44,'umber');b.rect(45,38,46,44,'umber');b.rect(41,38,44,42,None);b.rect(4,38,9,41,'moss');out[353]=b
 b=sky(['cerulean','sage','graphite']);b.poly([(0,14),(13,8),(18,20),(13,36),(0,40)],'green');b.line([(0,32),(14,17)],'lime',3);b.rect(33,4,47,47,'olive');b.rect(40,8,47,47,'moss');b.ellipse(37,16,46,29,'garnet');b.ellipse(39,18,44,26,None);b.rect(18,32,32,45,None)
 for j,(x,y) in enumerate([(3,24),(8,22),(13,23),(18,25),(23,28),(28,25),(33,21),(37,20)]):b.rect(x,y,x+3,y+2,'umber' if j%2==0 else 'garnet');b.line([(x+1,y+2),(x+2,y+5),(x+5,y+3)],'maroon',2)
 b.rect(6,13,7,14,'ice');b.rect(10,16,11,17,'white');out[354]=b
 b=sky(['navy','indigo','pine']);b.rect(0,42,47,47,'sage');b.line([(47,3),(34,6),(23,5),(18,8)],'umber',5);b.line([(47,3),(33,5)],'moss',2);b.rect(20,7,21,12,'silver');b.ellipse(10,11,29,40,'silver');b.ellipse(12,13,27,38,'sand');b.ellipse(15,16,25,35,'gold');b.ellipse(17,20,23,31,'yellow');b.ellipse(19,23,22,28,'ivory')
 for y in [15,24,33]:b.line([(11,y+3),(28,y-2)],'ivory',2)
 b.ellipse(3,3,8,8,'ivory');b.rect(36,14,37,15,'white');b.rect(5,31,6,32,'white');out[355]=b
 b=sky(['ice','cerulean','sage']);b.rect(18,0,40,47,'umber');b.rect(29,0,36,47,'brown');b.rect(38,0,40,47,'moss');b.ellipse(8,8,33,38,'bronze');b.ellipse(10,10,30,36,'sand')
 for y,c in [(14,'gold'),(21,'orange'),(28,'gold')]:b.line([(11,y),(30,y+2)],c,3)
 b.line([(19,12),(24,17),(21,28)],'ivory',5);b.line([(19,12),(24,17),(21,28)],None,2)
 for x,y in [(10,16),(12,24),(15,31)]:b.line([(x,y),(x-4,y+3),(x-2,y+7)],'bronze',2)
 b.rect(3,35,4,46,'stone');b.rect(9,35,10,46,'stone')
 for y in [36,40,44]:b.rect(4,y,9,y+1,'ivory')
 b.rect(2,46,16,47,'umber');b.rect(11,41,15,43,'red');b.rect(12,40,14,40,'ivory');b.rect(31,3,33,8,None);out[356]=b
 b=sky(['navy','slate','lavender']);b.rect(0,0,6,47,'umber');b.rect(41,0,47,47,'pine');b.rect(3,0,5,47,'moss');b.rect(0,40,47,47,'verdigris');b.line([(5,41),(21,44),(42,41)],'sand',2);b.rect(9,33,35,36,None)
 for r in [4,8,12,16,20]:loop(b,22,18,r,r*.8,'silver',1)
 for j in range(10):
  a=j*math.pi/5;b.line([(22,18),(22+20*math.cos(a),18+16*math.sin(a))],'silver',1)
 for x,y in [(8,6),(18,3),(31,7),(38,18),(28,30),(14,27),(10,17),(26,11)]:b.rect(x,y,x+1,y+1,'ice')
 for p in [(5,2),(43,2),(5,37),(43,37)]:b.line([p,(22,18)],'silver',2)
 b.rect(21,17,23,19,'umber');b.rect(16,10,19,12,None);b.rect(27,21,30,24,None);out[357]=b
 b=sky(['ice','seafoam','sage']);b.rect(0,40,47,47,'cerulean');b.line([(0,44),(22,42),(47,45)],'ice',2);path=[(0,40),(12,32),(25,29),(40,35),(47,39)];b.line(path,'brown',6);b.line(path,'bronze',2);b.ellipse(37,28,53,51,'sand');b.ellipse(41,38,45,44,None)
 for j,(x,y,c) in enumerate([(1,33,'lime'),(7,29,'forest'),(13,26,'green'),(19,23,'moss'),(25,23,'lime'),(31,25,'forest'),(37,27,'olive'),(42,30,'gold')]):
  b.rect(x,y+6,x+2,y+8,'garnet');b.poly([(x,y),(x+5,y-2),(x+6,y+5),(x+2,y+7),(x-1,y+4)],c);b.line([(x+2,y),(x+3,y+5)],'umber',1)
 b.rect(7,40,13,43,None);out[358]=b
 b=sky(['rose','blush','lavender']);b.rect(0,41,47,47,'brown');b.line([(0,43),(25,42),(47,46)],'umber',3);b.ellipse(20,8,29,18,'orange');b.ellipse(22,10,27,15,'yellow')
 b.ellipse(-3,21,20,41,'bronze');b.ellipse(0,23,17,38,'moss');b.ellipse(29,21,51,41,'slate');b.ellipse(32,23,47,38,'verdigris');b.line([(14,24),(18,15),(25,6),(29,10),(26,19)],'bronze',4);b.line([(34,25),(31,15),(25,8),(20,12),(23,18)],'verdigris',4);b.rect(22,23,27,31,None)
 for x,y,c in [(7,35,'olive'),(14,36,'bronze'),(34,35,'graphite'),(42,35,'slate')]:b.line([(x,y),(x-3,41),(x+1,44)],c,2)
 b.line([(4,25),(12,23)],'olive',2);b.line([(38,25),(46,26)],'silver',2);out[359]=b
 b=sky(['navy','indigo','olive']);b.rect(0,44,47,47,'gold');b.poly([(7,45),(7,20),(16,10),(24,8),(30,4),(37,11),(43,17),(45,45)],'sand');b.poly([(24,10),(29,14),(25,20),(29,25),(25,32),(28,39),(25,44),(7,44),(7,20),(16,11)],'umber')
 for x in [30,36,41]:b.rect(x,7,x+2,43,'brown');b.rect(x,4,x+1,9,'bronze')
 for y in [15,23,31,39]:
  for x in [9,17]:b.rect(x,y,x+6,y+5,'bronze');b.rect(x+1,y+1,x+5,y+4,'gold' if y%3 else 'lime');b.rect(x+2,y+2,x+3,y+3,None)
 b.ellipse(9,29,23,38,'gold');b.ellipse(11,31,21,36,'ivory');b.ellipse(12,33,21,35,'sand');b.rect(12,31,14,32,'gold');b.ellipse(10,20,14,23,'sage');b.ellipse(18,39,23,42,'sage')
 for x,y in [(2,11),(9,4),(20,3),(37,1),(43,9)]:b.rect(x,y,x+2,y+3,'moss');b.ellipse(x-2,y-1,x,y+2,'silver');b.ellipse(x+2,y-1,x+4,y+2,'ice')
 for x,y in [(32,20),(39,30)]:b.rect(x,y,x+1,y+1,None)
 out[360]=b
 # Moon Kingdom: carved value planes against true black space.
 b=sky(['navy','indigo','ash'],(0,12,20,48));b.poly([(0,47),(21,20),(25,20),(30,47)],'silver');b.poly([(3,47),(22,21),(24,21),(27,47)],'ivory')
 for x,y in [(6,42),(12,34),(18,27),(27,30),(29,40)]:b.rect(x,y-5,x,y,'silver');b.rect(x-1,y-6,x+1,y-5,'gold')
 for x,y,w in [(8,16,8),(20,11,8),(32,15,8)]:b.rect(x,y,x+w,21,'stone');b.rect(x+2,y-3,x+4,21,'white');b.rect(x+2,y,x+3,y+1,'gold')
 b.ellipse(35,3,43,11,'cerulean');b.ellipse(36,4,41,8,'green');b.line([(36,9),(41,9)],'white',2)
 for x,y in [(35,34),(7,27),(39,43)]:loop(b,x,y,4,2,'silver',2)
 b.rect(1,1,14,8,None);b.rect(17,1,25,5,None);out[361]=b
 b=sky(['navy','stone','ash'],(0,9,27,48));b.line([(0,13),(10,22),(23,25),(34,36),(47,39)],None,5)
 for x,y,rx,ry in [(10,23,6,16),(26,27,7,15),(40,36,4,18)]:loop(b,x,y,rx,ry,'silver',2);b.rect(x-1,y-ry,x+1,y-ry+1,'gold');b.line([(x-rx,y),(x+rx,y)],'ivory',2)
 hall(b,37,41,7,4);b.rect(4,30,10,34,'graphite');out[362]=b
 b=sky(['navy','indigo','ash']);b.poly([(0,10),(9,10),(9,18),(19,18),(19,26),(29,26),(29,34),(39,34),(39,42),(48,42),(48,48),(0,48)],'stone')
 for x,y in [(0,10),(9,18),(19,26),(29,34),(39,42)]:b.rect(x,y,x+8,y+2,'silver')
 b.line([(3,9),(8,4)],'bronze',4);loop(b,14,16,4,5,'gold',2);loop(b,24,24,4,4,'silver',2);b.rect(30,35,36,38,None);b.line([(29,34),(37,34)],'silver',2);hall(b,40,40,6,4);b.poly([(28,2),(46,3),(36,8)],'ice');b.ellipse(32,6,37,10,'white');b.rect(2,1,14,6,None);out[363]=b
 b=sky(['navy','graphite','ash'],(0,6,23,48));path=[(24,5),(34,11),(31,19),(14,24),(9,30),(19,37),(26,41),(10,47)];b.line(path,'sand',9);b.line(path,'silver',6);b.line(path,'white',2)
 for x,y in [(5,13),(35,26),(31,41)]:
  for j in range(3):b.rect(x+j*4,y,x+j*4+2,y+4,'ivory');b.put(x+j*4+1,y+2,'gold')
 for x,y in [(29,10),(26,20),(12,30),(20,40)]:b.rect(x,y,x+4,y+2,'bronze');b.rect(x+2,y-2,x+3,y-1,'gold')
 b.rect(3,30,6,34,None);b.rect(40,12,43,16,None);out[364]=b
 b=sky(['navy','indigo','ash']);b.poly([(0,38),(22,31),(48,37),(48,48),(0,48)],'graphite');b.ellipse(8,21,36,38,'stone');b.ellipse(28,16,40,29,'stone');b.line([(29,19),(16,12),(12,13),(26,24)],'stone',5);b.line([(29,21),(20,16),(18,17),(28,24)],'silver',2);b.line([(10,29),(16,24),(26,25)],'silver',3);b.line([(12,35),(22,31),(29,32)],'silver',2);b.rect(35,21,36,22,'graphite');b.rect(31,34,40,36,'stone');b.rect(35,32,37,34,'ivory');b.rect(36,31,37,32,'gold');b.ellipse(38,3,46,11,'cerulean');b.ellipse(41,2,48,9,'navy');out[365]=b
 b=sky(['navy','indigo','graphite']);b.poly([(22,7),(37,3),(46,10),(46,37),(22,37)],'white');b.poly([(37,3),(46,10),(46,37),(37,32)],'ash');b.rect(23,13,35,15,'silver');b.rect(23,25,35,27,'silver');b.rect(27,17,29,31,'red');b.rect(32,17,34,31,'gold')
 for x,y in [(24,10),(32,9),(39,13),(42,20),(39,27)]:b.rect(x,y,x+2,y+1,'gold')
 for j in range(6):x=j*4;y=45-j*3;b.rect(x,y,x+6,47,'stone');b.rect(x,y,x+6,y+1,'silver');b.rect(x+1,y-2,x+2,y-1,'gold')
 b.rect(23,37,47,42,'ivory');b.rect(39,30,41,32,None);out[366]=b
 b=sky(['navy','indigo','ash']);b.rect(6,8,13,42,'stone');b.rect(35,8,42,42,'stone');b.rect(6,6,42,12,'ash');b.line([(7,12),(12,12),(12,39)],'silver',2);b.line([(36,39),(36,12),(41,12)],'silver',2);b.ellipse(13,13,35,35,'gold');b.ellipse(15,15,33,33,'coral');b.ellipse(17,17,31,31,'red');b.ellipse(18,18,30,30,None)
 for pts in [[(24,13),(24,9)],[(35,24),(39,24)],[(24,35),(24,39)],[(13,24),(9,24)]]:b.line(pts,'gold',3)
 b.rect(0,42,47,47,'graphite')
 for x in [5,18,30,42]:b.rect(x,40,x+1,43,'ivory');b.rect(x+2,42,x+3,43,'gold')
 out[367]=b
 b=sky(['navy','indigo','ash']);b.rect(0,42,47,47,'stone')
 for j,x in enumerate([6,14,24,32,40]):h=[26,17,23,15,27][j];b.poly([(x,h),(x+3,42),(x-3,42)],'white');b.rect(x,h+7,x+1,h+8,'gold')
 for x,y,w,h in [(2,3,7,5),(11,8,7,5),(21,2,8,6),(30,7,7,5),(39,3,8,6),(36,16,7,5)]:b.line([(x+w//2,y+h),(x+w//2,35)],'graphite',1);b.rect(x,y,x+w,y+h,'ash');b.rect(x,y,x+w,y+1,'silver')
 b.line([(8,8),(12,13),(21,8)],'sand',2);b.line([(29,8),(34,13),(40,9)],'sand',2);b.rect(17,28,21,32,None);out[368]=b
 b=sky(['silver','sand','silver']);b.poly([(0,0),(9,0),(7,28),(21,40),(48,43),(48,48),(0,48)],'ash');b.line([(0,43),(18,38),(47,43)],'stone',3)
 for y in [9,18,27,36]:b.rect(3,y,20,y+2,'stone');b.rect(6,y+3,13,y+5,None)
 loop(b,9,40,5,5,'stone',3);b.ellipse(7,38,11,42,None)
 for j,(x,y) in enumerate([(24,5),(36,6),(43,14),(25,17),(33,22),(42,28),(21,30),(31,35),(42,39)]):
  b.ellipse(x-2,y-3,x+3,y+3,'gold' if j==0 else 'white' if j%2 else 'lavender');b.ellipse(x,y-3,x+5,y+1,'silver');b.rect(x-1,y+3,x+3,y+4,'bronze');b.line([(x,y+5),(x-3,y+7)],'ice',2)
 b.rect(2,2,4,4,'umber');b.rect(4,29,6,31,'bronze');out[369]=b
 b=sky(['navy','indigo','ash']);b.ellipse(10,0,52,41,'cerulean')
 for y in range(42):
  for x in range(48):
   if b.cells[y][x]=='cerulean' and x>27+y*.3:b.put(x,y,'indigo' if x>34+y*.2 else 'navy')
 b.poly([(15,12),(22,7),(28,12),(24,20),(17,22)],'green');b.poly([(25,27),(30,25),(35,30),(31,35)],'sand');b.line([(13,7),(20,4),(27,6)],'white',3);b.line([(12,24),(19,27),(28,24)],'white',3)
 for x,y in [(34,9),(40,15),(44,23),(37,30),(45,33)]:b.rect(x,y,x+2,y+1,'gold')
 b.poly([(0,38),(18,35),(33,32),(48,30),(48,48),(0,48)],'ash')
 for x,y,w in [(2,22,4),(9,13,4),(16,19,4),(24,10,4),(31,18,4),(38,12,4),(44,22,3)]:b.rect(x,y,x+w,38,'stone');b.rect(x,y,x+1,37,'silver');b.poly([(x-1,y),(x+w//2,y-3),(x+w+1,y)],'white');b.rect(x+2,y+3,x+3,y+4,'gold')
 b.rect(0,36,47,38,'white')
 for x in range(3,45,5):b.rect(x,39,x+1,42,'silver');b.rect(x+2,39,x+3,41,None)
 b.line([(1,47),(13,41),(23,37)],'ivory',5);b.rect(25,14,26,27,'white');b.rect(25,14,27,15,'red');b.rect(0,0,6,4,None);out[370]=b
 # Broad material/light planes, clipped to existing masses rather than scattered.
 planes={
 331:[('sand','coral',(0,31,14,38))],
 332:[('stone','ivory',(1,35,22,39)),('indigo','lavender',(0,14,15,18))],
 333:[('sand','ice',(0,43,7,47)),('sand','sage',(15,42,24,47))],
 334:[('sage','gold',(0,43,17,45)),('lavender','white',(8,3,23,6))],
 335:[('coral','rose',(0,38,15,40))],
 336:[('stone','slate',(32,29,41,38)),('sand','gold',(4,45,24,47)),('silver','ice',(15,30,21,36)),('lavender','graphite',(42,28,47,33))],
 337:[('navy','sage',(0,38,5,41)),('blush','gold',(36,3,47,6)),('white','ice',(26,28,30,32))],
 338:[('stone','graphite',(18,46,47,47)),('blush','rose',(0,29,20,31)),('ivory','olive',(35,35,47,40)),('stone','teal',(36,43,47,45))],
 339:[('navy','lavender',(0,0,23,4)),('indigo','graphite',(0,31,18,36)),('blue','ice',(26,43,47,45)),('blue','teal',(0,46,23,47)),('navy','coral',(35,1,47,4)),('sage','slate',(21,40,35,44))],
 340:[('gold','yellow',(0,0,22,2)),('umber','olive',(27,44,47,46)),('lavender','cerulean',(0,32,10,36))],
 341:[('silver','cerulean',(0,39,8,45)),('ivory','sage',(0,24,17,27))],
 342:[('stone','graphite',(10,34,20,39))],
 343:[('sage','green',(25,35,47,40)),('cerulean','silver',(0,0,18,3)),('blush','ice',(0,17,9,20)),('coral','red',(16,20,24,23))],
 344:[('stone','slate',(0,30,5,43)),('stone','lavender',(14,8,18,18)),('stone','sage',(29,8,33,18)),('verdigris','teal',(5,24,13,30)),('coral','maroon',(35,29,43,36)),('stone','silver',(14,37,18,46)),('coral','blush',(38,19,44,23))],
 345:[('ivory','ice',(0,12,47,14))],
 346:[('slate','bronze',(12,39,25,43)),('ivory','ice',(0,16,14,20)),('silver','teal',(0,36,5,40)),('sage','sand',(16,44,28,47)),('lavender','blush',(32,0,47,4))],
 347:[('blush','rose',(0,44,24,47)),('cerulean','ice',(0,0,15,4)),('lavender','seafoam',(0,17,8,22)),('ivory','white',(2,36,16,40)),('silver','stone',(37,32,47,35)),('gold','bronze',(20,4,30,7))],
 348:[('navy','plum',(33,1,43,6)),('ultramarine','slate',(0,35,9,40)),('forest','green',(30,42,44,47)),('indigo','stone',(0,18,10,22))],
 349:[('graphite','cerulean',(0,40,8,45)),('sage','teal',(38,40,47,44)),('graphite','verdigris',(9,22,16,26)),('sage','blush',(42,19,47,25)),('stone','sand',(10,32,16,35))],
 350:[],
 351:[('blush','rose',(0,15,7,25)),('navy','ivory',(0,46,17,47))],
 352:[('olive','sage',(17,42,39,45)),('sand','yellow',(13,30,29,32))],
 353:[('navy','olive',(0,42,12,45))],
 354:[('green','forest',(0,22,6,35)),('olive','pine',(33,32,38,44)),('graphite','slate',(0,41,17,47))],
 355:[('gold','orange',(15,33,24,37))],
 356:[('brown','olive',(30,34,36,46)),('sage','forest',(0,32,7,40))],
 357:[('navy','indigo',(8,0,35,3)),('slate','stone',(7,32,40,38)),('verdigris','cerulean',(0,45,47,47)),('umber','brown',(0,25,2,38)),('lavender','blush',(7,38,40,39))],
 358:[('sage','olive',(0,31,12,37))],
 359:[('rose','coral',(0,0,23,3)),('lavender','gold',(33,33,47,38)),('brown','moss',(30,45,44,47))],
 360:[('sand','stone',(32,12,39,18)),('sand','white',(40,34,44,40)),('indigo','lavender',(0,17,5,28)),('gold','orange',(27,45,46,47)),('sand','silver',(33,39,39,43))],
 361:[('ash','graphite',(32,24,46,27)),('ash','stone',(31,46,45,47)),('navy','blue',(27,2,33,5)),('ash','sand',(13,37,18,41)),('indigo','ice',(1,16,7,19))],
 362:[('navy','indigo',(0,3,23,5)),('ash','slate',(0,43,15,47)),('stone','white',(0,10,8,12)),('ash','sand',(30,39,36,44)),('stone','ice',(35,13,47,16)),('ash','lavender',(20,41,28,47))],
 363:[('stone','graphite',(0,30,8,43)),('stone','slate',(10,37,18,44)),('ash','lavender',(41,32,47,37)),('stone','ivory',(21,43,28,47))],
 364:[('graphite','stone',(0,16,8,21)),('ash','slate',(34,45,47,47)),('navy','indigo',(0,0,47,1)),('graphite','lavender',(40,6,47,10)),('ash','ice',(0,40,8,44))],
 365:[('stone','white',(10,23,17,27)),('ash','slate',(0,31,7,35)),('indigo','lavender',(2,17,7,21))],
 366:[('graphite','ash',(0,34,5,40)),('navy','lavender',(3,10,13,13)),('indigo','ice',(0,18,10,21)),('graphite','slate',(35,44,47,47)),('ivory','sand',(26,40,36,42))],
 367:[('navy','lavender',(0,0,18,2)),('stone','white',(6,15,9,27)),('ash','slate',(0,34,4,39)),('graphite','sand',(22,45,36,47)),('gold','yellow',(19,13,29,15))],
 368:[('navy','lavender',(15,0,19,7)),('stone','ivory',(9,45,24,47)),('ash','slate',(0,36,9,40)),('navy','ice',(31,0,38,3)),('stone','cerulean',(35,45,47,47)),('ash','umber',(34,34,40,38))],
 369:[('ash','graphite',(0,16,3,26)),('sand','ivory',(25,15,47,17)),('silver','stone',(34,45,47,47)),('ash','slate',(15,43,22,46)),('silver','cerulean',(36,3,47,5)),('sand','blush',(34,23,47,25))],
 370:[('cerulean','blue',(13,14,23,20)),('cerulean','ice',(13,29,29,32)),('ash','graphite',(25,45,47,47)),('ash','sand',(0,44,8,47)),('ash','slate',(34,41,45,43)),('ash','yellow',(32,44,39,46))],
 }
 for i,regions in planes.items():
  for source,target,box in regions:material(out[i],source,target,box)
 # Deliberate broad accent populations; every 351+ color has a material role.
 accents={
 334:[('blush','white',(39,27,47,31))],
 337:[('blush','sage',(0,4,5,9))],
 339:[('navy','coral',(35,1,47,4)),('indigo','lavender',(36,30,47,34))],
 342:[('stone','sage',(33,37,43,39))],
 350:[('slate','graphite',(39,25,46,28)),('forest','pine',(8,30,16,34)),('olive','umber',(27,34,31,37)),('blush','brown',(35,45,44,47))],
 351:[('sand','gold',(14,16,25,19)),('navy','umber',(19,46,31,47)),('blush','indigo',(39,12,47,16))],
 352:[('sand','yellow',(13,31,33,33)),('olive','brown',(1,46,16,47)),('ice','ivory',(1,30,9,33))],
 353:[('blush','gold',(23,0,33,3)),('navy','moss',(3,36,9,40))],
 354:[('cerulean','ice',(0,0,15,2)),('cerulean','white',(18,0,32,2))],
 355:[('umber','moss',(32,2,46,5)),('navy','white',(9,42,25,43)),('sand','orange',(13,30,27,36))],
 356:[('ice','red',(0,42,7,47)),('ice','white',(0,2,8,5))],
 358:[('brown','bronze',(0,37,19,40))],
 359:[('orange','yellow',(21,8,28,15)),('lavender','silver',(32,37,46,39)),('rose','coral',(0,0,23,3)),('blush','gold',(0,16,12,18)),('brown','forest',(0,45,10,47))],
 360:[('gold','ivory',(9,30,22,37)),('sand','white',(40,33,44,43))],
 361:[('ash','slate',(33,28,46,30)),('cerulean','green',(36,3,41,9))],
 362:[('stone','white',(1,10,16,12)),('stone','red',(40,39,47,43))],
 363:[('navy','bronze',(0,7,8,10)),('stone','red',(40,43,47,46)),('stone','sand',(20,37,26,41))],
 364:[('ash','slate',(32,45,47,47))],
 365:[('ash','white',(1,33,8,36)),('ash','gold',(32,33,40,35)),('stone','ivory',(31,30,40,36))],
 366:[('white','stone',(23,30,35,32))],
 367:[('gold','yellow',(18,12,30,15))],
 368:[('ash','gold',(19,38,25,42)),('ash','umber',(34,34,40,41)),('stone','cerulean',(31,44,47,47))],
 369:[('ash','umber',(0,1,6,7)),('sand','gold',(21,0,27,4)),('ash','navy',(0,34,4,40))],
 370:[('cerulean','blue',(11,11,28,20)),('ash','red',(13,43,20,46)),('ash','sand',(0,40,8,47)),('cerulean','ice',(11,28,35,34)),('ash','slate',(31,40,47,44)),('ash','yellow',(30,45,43,47)),('navy','lavender',(0,8,7,14))],
 }
 for i,regions in accents.items():
  for source,target,box in regions:material(out[i],source,target,box)
 # Larger named material planes keep final-block colors at >=25 cells.
 population_planes={
 350:[('slate','forest',(26,25,31,29)),('stone','pine',(7,25,11,29)),('lime','brown',(34,40,44,44))],
 351:[('blush','indigo',(38,15,47,20))],
 352:[('olive','brown',(9,42,17,45))],
 355:[('sage','white',(10,42,26,43))],
 356:[('sage','red',(0,43,8,47))],
 359:[('orange','yellow',(20,8,30,18)),('lavender','silver',(33,32,46,39)),('brown','forest',(0,43,12,47))],
 360:[('sand','white',(42,22,45,42))],
 361:[('navy','cerulean',(32,3,35,10))],
 362:[('ash','red',(41,40,47,44))],
 363:[('ash','red',(40,36,46,40))],
 364:[('ash','slate',(35,39,47,46))],
 365:[('ash','gold',(33,31,40,34))],
 366:[('navy','cerulean',(0,4,12,6))],
 369:[('silver','gold',(21,0,28,4))],
 370:[('cerulean','blue',(12,9,28,24)),('ash','yellow',(30,44,44,47))],
 }
 for i,regions in population_planes.items():
  for source,target,box in regions:material(out[i],source,target,box)
 # Filled material highlights and scale markers remain coherent at phone size.
 material(out[351],'lavender','rose',(0,0,47,4));material(out[351],'lavender','blush',(0,8,47,11))
 out[350].put(29,28,'forest');material(out[350],'ivory','white',(0,11,6,16))
 out[359].rect(23,11,27,15,'yellow');out[359].line([(37,23),(46,26)],'silver',2)
 out[360].rect(43,36,45,42,'white')
 out[362].rect(39,41,44,44,'red')
 out[363].rect(41,37,45,42,'red')
 out[365].rect(33,31,38,35,'gold');out[365].rect(34,32,36,34,'ivory')
 out[370].rect(32,44,43,46,'yellow')
 # Refine named hollows and rounded framing to the approved density bands.
 frames={331:5,332:7,333:3,334:7,335:9,336:1,337:3,338:7,339:5,340:3,341:7,342:6,343:8,344:2,345:9,346:6,347:3,348:6,349:4,350:2,351:4,352:8,353:7,354:7,355:10,356:4,357:6,358:5,359:4,360:2,361:4,362:5,363:5,364:7,365:10,366:7,367:2,368:8,369:5,370:2}
 out[332].rect(3,4,15,10,'navy');out[332].rect(17,2,25,7,'navy')
 for i,n in frames.items():frame(out[i],n)
 # Light air remains painted; dark valley stays a coherent central gorge.
 out[354].rect(18,39,32,45,'slate');out[354].rect(18,32,32,34,'graphite')
 # 350 cloud gap and 370 space budget are explicit, never void light.
 out[350].put(25,10,'lavender');out[336].put(17,13,'silver')
 # Connected pine crowns and a coherent river-mouth field reduce redundant fronts.
 for y in range(48):
  for x in range(48):
   c=out[350].cells[y][x]
   if c=='forest':out[350].put(x,y,'pine')
   elif c=='seafoam':out[350].put(x,y,'cerulean')
 # Warm ash planes get a cool stone edge where slate or brass would share value.
 for i in range(361,371):
  b=out[i];rim=[]
  for y in range(48):
   for x in range(48):
    if b.cells[y][x]=='ash' and any(0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] in ('slate','bronze') for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]):rim.append((x,y))
  for x,y in rim:b.put(x,y,'stone')
 return out

if __name__=='__main__':
 roots=[Path('/Users/andres/Desktop/pixel-arcadia-design-251-350'),Path('/Users/andres/Desktop/pixel-arcadia-design-351-500')];names={34:'LOST_FUTURES',35:'MYTHIC_ASIA',36:'GIANT_INSECTS',37:'MOON_KINGDOM'};titles={}
 for w,name in names.items():
  for i,t in re.findall(r'^## (\d+) — (.+)$',(roots[int(w>=36)]/f'WORLD_{w}_{name}.md').read_text(),re.M):titles[int(i)]=re.sub(r' \*\(.+?\)\*','',t).strip()
 result=[]
 for i,b in boards().items():
  rows=b.rows();used=set(''.join(rows))-{'.'};counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
  result.append(dict(id=i,title=titles[i],grid=rows,legend={c:LEGEND[c] for c in sorted(used)}));print(i,sum(counts.values()),len(counts),min(counts.values()),counts.get('moss',0),counts.get('ash',0))
 Path('dist/m16c').mkdir(parents=True,exist_ok=True);Path('dist/m16c/art.json').write_text(json.dumps(result,indent=2)+'\n')
