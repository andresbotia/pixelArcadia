"""Individually composed 48×48 M16F raster boards. Offline authoring only."""
from pathlib import Path
import importlib.util, json, math, re

spec=importlib.util.spec_from_file_location('base',Path(__file__).with_name('m16c-art.py'))
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
Board=base.Board; sky=base.sky; loop=base.loop; LEGEND=base.LEGEND

def disc(b,x=24,y=26,r=21,outer='cerulean',inner='blue'):
 b.ellipse(x-r-2,y-r-2,x+r+2,y+r+2,outer);b.ellipse(x-r,y-r,x+r,y+r,inner)
def star(b,x,y):b.rect(x,y,x+1,y+1,'white')
def strata(b,items):
 for y,c in items:b.rect(0,y,47,47,c)
def hills(b,c='sage'):
 b.poly([(0,36),(9,31),(18,35),(30,27),(47,34),(47,47),(0,47)],c)
def mountain(b,x,y,w,c='stone'):
 b.poly([(x-w//2,47),(x,y),(x+w//2,47)],c)
def town(b,x,y,scale=1,c='ivory'):
 for dx,dy,w in [(0,2,5),(7,0,6),(15,3,5)]:
  xx=x+dx*scale;yy=y+dy*scale;b.rect(xx,yy,xx+w*scale,47,c)
  b.poly([(xx-1,yy),(xx+w*scale//2,yy-3*scale),(xx+w*scale+1,yy)],'brown')
  b.rect(xx+2,yy+2,xx+3,yy+3,'gold')
def windows(b,x0,y0,x1,y1,c='gold',dx=5,dy=6):
 for y in range(y0,y1,dy):
  for x in range(x0,x1,dx):b.rect(x,y,x+1,y+2,c)
def ring(b,x,y,rx,ry,c='silver',w=3,angle=0):loop(b,x,y,rx,ry,c,w,angle)
def rift(b,pts,w=6):
 b.line(pts,'magenta',w+4);b.line(pts,'white',w+1);b.line(pts,'navy',w)
def boards():
 out={}
 # 46: planet-scale geology; alternate limbs, close crops, surfaces and discs.
 b=Board('navy');b.ellipse(-10,14,57,85,'blush');b.ellipse(-10,16,57,84,'sand');b.ellipse(-8,20,56,80,'coral');b.ellipse(-8,22,56,79,'brown');b.line([(0,39),(10,32),(24,27),(37,28),(47,35)],'garnet',9);b.line([(0,41),(11,35),(25,30),(39,31),(47,38)],'graphite',4);b.line([(0,18),(23,13),(47,18)],'lavender',2);star(b,4,5);star(b,40,6);out[451]=b
 b=Board('navy');disc(b,24,26,22,'ice','cerulean');b.poly([(24,4),(44,14),(46,29),(35,44),(24,47)],'silver');b.poly([(24,6),(39,14),(34,26),(24,30)],'white');b.poly([(24,30),(34,26),(42,36),(24,45)],'cyan');b.poly([(1,23),(12,15),(23,18),(23,29),(10,30)],'green');b.poly([(13,35),(23,31),(23,44),(14,40)],'sage');b.line([(24,5),(24,46)],'gold',2);b.line([(24,26),(43,16)],'ice',3);star(b,3,4);out[452]=b
 b=sky(['garnet','red','orange','coral'],(0,10,23,39,48));b.line([(0,10),(15,15),(34,13),(47,20)],'gold',7);b.line([(0,24),(12,27),(30,24),(47,30)],'maroon',9);b.line([(0,40),(19,36),(37,39),(47,37)],'umber',5);b.ellipse(30,12,46,28,'graphite');b.ellipse(33,14,45,26,'navy');b.line([(0,22),(12,18),(29,21),(47,17)],'blush',3);out[453]=b
 b=sky(['navy','cerulean','ice'],(0,11,28,48));b.rect(0,36,47,47,'white');b.poly([(0,38),(10,34),(20,39),(32,35),(47,39),(47,47),(0,47)],'silver');
 for x,h in [(7,21),(20,9),(35,16)]:
  b.rect(x-3,37,x+3,42,'slate');b.line([(x,38),(x-2,h),(x+2,h-7)],'cyan',5);b.line([(x+2,h),(x+5,h-6)],'white',2);b.ellipse(x-4,h-8,x+5,h-3,'ice')
 b.line([(0,43),(47,45)],'lavender',2);out[454]=b
 b=sky(['lavender','ice','white'],(0,9,30,48));b.rect(0,29,47,47,'silver');b.line([(0,42),(11,31),(17,34),(29,14),(36,20),(47,7)],'cerulean',8);b.line([(0,43),(11,33),(17,36),(29,16),(36,22),(47,9)],'navy',3);b.line([(4,24),(20,26),(39,23)],'cyan',2);out[455]=b
 b=Board('navy');b.ellipse(-12,26,55,94,'lavender');b.ellipse(-12,29,55,94,'cerulean');b.ellipse(-9,32,53,91,'green');b.ellipse(2,36,48,82,'forest');b.rect(22,9,27,43,'brown');b.line([(24,21),(12,15),(5,9)],'umber',5);b.line([(25,19),(36,14),(44,7)],'umber',5);b.ellipse(0,0,25,20,'moss');b.ellipse(24,0,47,19,'sage');b.ellipse(10,2,38,15,'lime');b.line([(3,41),(43,43)],'white',2);out[456]=b
 b=sky(['blush','ice','lavender'],(0,14,32,48));b.rect(0,27,47,47,'blue');b.rect(0,35,47,47,'navy');b.poly([(0,28),(13,26),(23,30),(33,24),(47,26),(47,37),(0,38)],'graphite');b.line([(0,31),(16,30),(24,34),(35,27),(47,29)],'red',7);b.line([(0,33),(16,32),(24,36),(35,29),(47,31)],'orange',3);b.line([(0,41),(47,42)],'cerulean',4);out[457]=b
 b=Board('garnet');b.rect(0,0,47,47,'red');
 plates=[([(0,0),(17,0),(13,14),(0,20)],'stone'), ([(20,0),(42,0),(35,15),(16,17)],'brown'), ([(45,0),(47,2),(47,24),(38,16)],'ash'), ([(0,24),(14,17),(21,31),(4,36),(0,34)],'slate'), ([(18,19),(36,17),(43,30),(25,34)],'sand'), ([(0,39),(21,35),(22,47),(0,47)],'graphite'), ([(28,37),(47,30),(47,47),(26,47)],'umber')]
 for p,c in plates:b.poly(p,c)
 for p,c in plates:b.line(p+[p[0]],'gold',2)
 b.line([(15,0),(14,16),(22,33),(24,47)],'orange',3);out[458]=b
 b=sky(['navy','indigo','cerulean','ice'],(0,11,21,34,48));b.ellipse(-10,29,57,95,'blush');b.ellipse(-10,33,57,95,'cerulean');b.poly([(4,47),(23,2),(43,47)],'stone');b.poly([(15,47),(23,5),(31,47)],'ash');b.poly([(18,21),(23,2),(29,21)],'white');b.line([(0,33),(47,33)],'lavender',3);b.line([(0,39),(47,39)],'silver',2);out[459]=b
 b=Board('navy');disc(b,24,27,20,'ice','blue');b.ellipse(8,12,40,42,'cerulean');b.ellipse(11,15,37,39,'verdigris');b.line([(4,18),(43,11)],'white',8);b.line([(4,19),(43,12)],'silver',3);b.line([(10,16),(38,38)],'ice',3);b.line([(36,12),(30,25),(24,32)],'cyan',5);b.line([(15,36),(24,42),(34,36)],'white',3);b.ellipse(20,29,29,37,'blue');b.line([(0,33),(47,23)],'gold',2);star(b,3,5);out[460]=b
 # 47: single relics whose silhouette materially reshapes a landscape.
 b=sky(['cerulean','ice','blush']);mountain(b,24,14,43,'slate');b.poly([(9,47),(24,18),(39,47)],'stone');b.line([(23,4),(24,40)],'silver',6);b.poly([(20,5),(24,-1),(28,5)],'white');b.rect(14,23,34,27,'gold');b.rect(21,27,27,32,'umber');b.line([(0,42),(47,42)],'sage',4);out[461]=b
 b=sky(['blush','ice','sage']);hills(b,'stone');b.rect(3,26,44,47,'ash');b.rect(5,29,42,44,'ivory');
 for x in range(7,44,7):b.rect(x,30,x+3,35,'graphite')
 b.poly([(6,16),(15,23),(24,9),(33,23),(42,16),(39,28),(9,28)],'gold');b.ellipse(20,12,28,20,'red');b.rect(17,31,30,46,'brown');out[462]=b
 b=sky(['cerulean','ice','lavender']);b.poly([(0,16),(19,25),(18,47),(0,47)],'stone');b.poly([(47,13),(30,22),(31,47),(47,47)],'ash');b.rect(0,41,47,47,'blue');b.line([(15,23),(36,28)],'gold',9);b.line([(16,22),(36,27)],'ivory',3);b.ellipse(6,12,18,25,'gold');b.ellipse(9,15,15,21,'navy');b.rect(34,21,44,29,'umber');out[463]=b
 b=Board('graphite');b.rect(3,5,44,47,'stone');
 for r,c in [(19,'gold'),(15,'silver'),(11,'bronze'),(7,'ivory')]:ring(b,24,26,r,r,c,3)
 b.line([(24,7),(24,26),(35,34)],'red',3);b.poly([(23,11),(26,25),(31,27),(25,28)],'white');b.rect(0,39,47,47,'brown');out[464]=b
 b=sky(['lavender','blush','sand']);b.poly([(0,23),(15,31),(15,47),(0,47)],'stone');b.poly([(47,23),(33,31),(33,47),(47,47)],'ash');b.rect(19,7,29,42,'gold');b.rect(15,5,33,8,'umber');b.rect(15,41,33,44,'umber');b.poly([(19,10),(29,10),(24,24)],'white');b.poly([(24,25),(19,39),(29,39)],'sand');b.line([(20,25),(28,25)],'brown',2);out[465]=b
 b=sky(['cerulean','ice','blush']);hills(b,'sage');b.poly([(4,40),(22,5),(42,40)],'stone');b.poly([(13,37),(23,12),(33,37)],'ash');
 for x in range(11,39,3):b.line([(x,11),(x-3,42)],'white' if x%2 else 'silver',1)
 b.line([(8,14),(40,14)],'gold',4);b.line([(7,42),(40,42)],'brown',3);b.line([(23,3),(23,44)],'cyan',4);out[466]=b
 b=sky(['navy','indigo','lavender']);mountain(b,24,17,43,'stone');mountain(b,23,25,26,'ash');b.rect(14,18,34,24,'gold');b.rect(16,9,21,23,'ivory');b.rect(27,9,32,23,'ivory');b.rect(15,9,33,11,'gold');b.rect(21,18,27,23,'graphite');b.rect(18,23,30,29,'umber');b.line([(0,45),(47,45)],'silver',2);out[467]=b
 b=sky(['cerulean','ice','blush']);b.poly([(0,24),(30,17),(47,29),(47,47),(0,47)],'stone');b.rect(4,32,28,47,'ash');ring(b,24,19,19,11,'bronze',4,-25);ring(b,24,19,13,8,'gold',3,-25);b.line([(5,10),(40,29)],'silver',4);b.line([(25,8),(25,39)],'umber',3);b.ellipse(20,15,28,23,'graphite');out[468]=b
 b=sky(['lavender','blush','ice']);hills(b,'sage');b.poly([(3,47),(22,14),(43,47)],'stone');b.ellipse(13,10,33,33,'gold');b.ellipse(16,11,30,29,'ivory');b.rect(18,12,28,20,'cerulean');b.poly([(18,28),(28,28),(35,40),(12,40)],'bronze');b.line([(23,30),(23,47)],'white',5);b.line([(24,31),(24,47)],'cyan',2);out[469]=b
 b=Board('navy');b.rect(24,0,47,47,'blush');b.rect(29,0,47,47,'gold');b.poly([(24,0),(47,0),(47,17),(28,26)],'ice');b.poly([(0,0),(24,0),(20,30),(0,36)],'indigo');b.line([(3,6),(18,23)],'white',3);b.line([(7,3),(19,15)],'cyan',2);b.ellipse(6,19,42,44,'silver');b.ellipse(10,22,38,42,'graphite');b.line([(24,1),(24,44)],'gold',5);b.line([(0,45),(47,45)],'brown',3);out[470]=b
 # 48: each city uses one large topology readable at phone scale.
 b=sky(['navy','lavender','blush'],(0,15,32,48));b.rect(0,41,47,47,'stone');
 for x,y,w,c in [(3,8,42,'slate'),(10,17,28,'ash'),(17,25,14,'ivory')]:
  b.rect(x,y,x+w,47,c);b.ellipse(x,y-5,x+w,y+17,c);b.rect(x+4,y+7,x+w-4,47,'navy');b.rect(x+5,y+8,x+w-5,47,'gold' if x==17 else 'cerulean')
 b.rect(21,30,27,47,'graphite');out[471]=b
 b=sky(['cerulean','ice','blush']);b.rect(0,42,47,47,'stone');b.rect(20,6,29,47,'ash');
 for y,x0,x1 in [(12,2,20),(21,29,46),(31,1,20),(38,29,47)]:b.rect(x0,y,x1,y+6,'slate');b.rect(x0,y,x1,y+1,'gold');windows(b,x0+2,y+3,x1,y+6,'ivory',4,3)
 windows(b,22,12,28,43);out[472]=b
 b=Board('graphite');b.ellipse(-12,-20,59,72,'stone');b.ellipse(-3,-12,50,58,'ash');b.ellipse(6,0,41,48,'cerulean');b.rect(17,12,31,47,'gold');b.rect(20,15,28,47,'ivory');
 for x in (2,7,36,42):b.line([(x,5),(x,44)],'slate',4);windows(b,x,12,x+3,41,'gold',3,6)
 b.rect(0,43,47,47,'stone');out[473]=b
 b=sky(['cerulean','ice','blush']);b.poly([(0,0),(20,15),(18,47),(0,47)],'stone');b.poly([(47,0),(29,15),(30,47),(47,47)],'ash');b.poly([(19,47),(24,18),(29,47)],'graphite');
 for y in (14,22,30,37,43):b.line([(max(0,17-y//5),y),(min(47,31+y//5),y)],'gold',3)
 windows(b,2,9,13,39);windows(b,36,10,46,39);out[474]=b
 b=sky(['lavender','blush','ice']);b.rect(0,34,47,47,'slate');
 for x,y,w,c in [(0,20,17,'stone'),(18,13,14,'ash'),(33,23,14,'ivory')]:b.rect(x,y,x+w,47,c);windows(b,x+2,y+6,x+w,44,'gold',5,6)
 b.line([(17,0),(17,47)],'graphite',3);b.line([(32,0),(32,47)],'graphite',3);out[475]=b
 b=sky(['cerulean','ice','blush']);town(b,2,22,1,'stone');town(b,29,19,1,'ash');b.rect(0,42,47,47,'graphite');
 for y in (12,19,26,33,40):b.line([(0,y+4),(24,y),(47,y+4)],'ivory',4);b.line([(0,y+6),(24,y+2),(47,y+6)],'gold',2)
 b.rect(22,5,26,42,'slate');out[476]=b
 b=Board('stone');
 for x,y,c in [(2,3,'cerulean'),(25,3,'gold'),(2,25,'blush'),(25,25,'navy')]:
  b.rect(x,y,x+20,y+20,'graphite');b.rect(x+3,y+3,x+17,y+17,c)
  for xx,h in [(x+5,7),(x+10,12),(x+15,9)]:b.rect(xx,y+19-h,xx+3,y+17,'ash');b.rect(xx+1,y+17-h,xx+2,y+17-h,'ivory')
 out[477]=b
 b=sky(['cerulean','ice','lavender']);b.rect(0,36,47,47,'stone');town(b,1,30,1,'ash');town(b,30,30,1,'slate');b.line([(7,22),(13,12),(23,22),(33,12),(41,22),(33,32),(23,22),(13,32),(7,22)],'graphite',6);b.line([(7,22),(13,12),(23,22),(33,12),(41,22),(33,32),(23,22),(13,32),(7,22)],'gold',2);out[478]=b
 b=sky(['cerulean','ice','blush']);
 for y,x0,x1,c in [(36,0,47,'ash'),(28,3,44,'stone'),(20,9,39,'umber'),(12,15,33,'brown')]:b.rect(x0,y,x1,47,c);b.rect(x0,y,x1,y+2,'ivory')
 b.line([(3,45),(15,33),(30,30),(19,21),(29,15),(24,8)],'gold',4);b.line([(3,46),(15,34),(30,31),(19,22),(29,16),(24,9)],'graphite',1);windows(b,8,37,41,43);out[479]=b
 b=Board('navy');
 for y,c,light in [(2,'stone','gold'),(17,'ash','cyan'),(32,'ivory','rose')]:
  b.rect(2,y,45,y+12,c);b.rect(0,y+12,47,y+15,'graphite')
  for x,h in [(4,6),(11,10),(19,8),(28,11),(37,7)]:b.rect(x,y+12-h,x+5,y+11,'slate');b.rect(x+2,y+12-h+2,x+3,y+12-h+3,light)
 b.rect(22,0,25,47,'silver');b.line([(25,0),(25,47)],'white',2);out[480]=b
 # 49: a single increasingly severe rupture, with material on both sides.
 b=sky(['gold','blush','cerulean'],(0,12,28,48));hills(b,'sage');mountain(b,10,18,19,'stone');mountain(b,24,15,22,'ash');mountain(b,40,20,17,'slate');b.ellipse(17,8,31,22,'yellow');town(b,4,37,1,'ivory');b.line([(24,25),(21,47)],'blue',5);rift(b,[(27,0),(23,13),(29,23),(19,36),(17,47)],4);b.line([(27,0),(23,13),(29,23),(19,36),(17,47)],None,1);out[481]=b
 b=Board('sand');b.poly([(0,0),(28,0),(14,47),(0,47)],'gold');b.poly([(29,0),(47,0),(47,47),(15,47)],'blue');b.line([(27,0),(20,18),(14,47)],'magenta',6);b.line([(31,0),(24,20),(19,47)],'white',3);b.line([(6,19),(19,16)],'brown',4);b.line([(32,16),(47,21)],'ice',4);b.line([(28,20),(22,42)],'sand',3);out[482]=b
 b=Board('navy');b.rect(0,0,23,47,'ice');b.rect(24,0,47,47,'garnet');b.poly([(0,47),(7,13),(21,47)],'white');b.poly([(26,47),(39,7),(47,47)],'red');b.line([(24,0),(24,47)],'magenta',5);b.line([(20,3),(25,21),(21,40)],'silver',4);b.line([(27,3),(23,21),(28,40)],'orange',4);b.rect(21,0,27,12,'blush');b.line([(24,13),(24,43)],None,1);out[483]=b
 b=Board('navy');town(b,0,12,1,'graphite');town(b,29,9,1,'slate');windows(b,2,19,20,42,'cyan');windows(b,30,16,47,42,'magenta');b.poly([(19,22),(29,22),(44,47),(4,47)],'graphite');rift(b,[(24,18),(20,29),(29,38),(24,47)],5);b.line([(24,18),(20,29),(29,38),(24,47)],None,1);out[484]=b
 b=sky(['indigo','lavender','blush']);hills(b,'sage');b.rect(0,42,47,47,'stone');b.rect(9,11,18,39,'ash');b.rect(30,8,39,38,'ash');b.rect(10,8,38,15,'stone');b.rect(18,16,30,38,'gold');b.rect(20,18,28,37,'yellow');rift(b,[(20,4),(17,17),(27,25),(26,42)],3);b.line([(20,4),(17,17),(27,25),(26,42)],None,1);b.rect(23,0,47,8,'navy');out[485]=b
 b=Board('navy');
 for y0,y1,sky_c,land in [(0,14,'ice','silver'),(17,30,'sand','brown'),(33,47,'sage','forest')]:b.rect(0,y0,47,y1,sky_c);b.poly([(0,y1-3),(16,y1-8),(30,y1-5),(47,y1-10),(47,y1),(0,y1)],land)
 for x,y,c in [(18,5,'white'),(25,22,'gold'),(13,37,'lime')]:b.rect(x,y,x+3,y+10,c);b.ellipse(x-6,y-5,x+9,y+2,c)
 b.rect(0,15,47,16,'magenta');b.rect(0,31,47,32,'magenta');out[486]=b
 b=Board('navy');hills(b,'sage');
 for y0,y1,shift,c in [(35,47,0,'stone'),(27,32,-3,'ash'),(19,24,3,'slate'),(11,16,-2,'ivory'),(2,8,2,'gold')]:
  b.rect(19+shift,y0,30+shift,y1,c);b.rect(17+shift,y0,32+shift,y0+1,'gold')
 b.ellipse(21,19,30,27,'white');b.line([(25,20),(25,24),(28,25)],'graphite',2);b.line([(18,0),(32,0)],'magenta',2);out[487]=b
 b=sky(['indigo','lavender','ice']);b.poly([(0,32),(9,10),(20,31),(31,7),(47,29),(47,47),(0,47)],'stone');b.poly([(0,38),(13,25),(25,37),(38,20),(47,32),(47,47),(0,47)],'ash');b.rect(0,21,47,25,'navy');b.line([(0,21),(47,21)],'magenta',3);b.line([(3,23),(44,23)],None,1);b.poly([(1,26),(11,45),(19,27)],'slate');b.poly([(28,28),(35,47),(47,29)],'graphite');out[488]=b
 b=Board('navy');b.ellipse(17,17,31,31,'white');b.ellipse(20,20,28,28,'gold');
 for x,y,c,top in [(3,4,'forest','lime'),(22,0,'silver','white'),(37,5,'sand','gold'),(2,31,'graphite','magenta'),(22,36,'blue','cyan'),(38,31,'garnet','orange')]:
  b.poly([(x+6,y),(x+13,y+8),(x+8,y+14),(x,y+10)],c);b.rect(x+2,y+4,x+8,y+7,top);b.line([(x+3,y+10),(x+9,y+11)],'magenta',2)
 out[489]=b
 b=Board('blush');b.rect(24,0,47,47,'indigo');b.rect(0,39,47,47,'navy');b.poly([(0,38),(19,34),(22,47),(0,47)],'sage');b.poly([(30,34),(47,38),(47,47),(27,47)],'graphite');
 for x,c,roof in [(3,'ivory','gold'),(29,'ash','silver')]:
  b.rect(x,15,x+16,37,c);b.poly([(x-2,15),(x+8,8),(x+18,15)],roof);b.rect(x+5,19,x+10,27,'cyan' if x<20 else 'slate');b.rect(x+6,29,x+11,37,'rose' if x<20 else 'purple')
 b.ellipse(12,2,31,17,'gold');b.rect(22,0,24,10,'white');rift(b,[(37,0),(29,12),(23,22),(17,34),(10,47)],8)
 b.line([(34,5),(28,13),(23,22),(17,34),(12,43)],None,1)
 for yy in (15,28,40):b.line([(8,yy+9),(37,yy-4)],'gold',2)
 b.rect(23,16,27,21,'ivory');b.rect(18,28,22,32,'purple');out[490]=b
 return out

TARGET={451:2175,452:2155,453:2235,454:2145,455:2075,456:2205,457:2215,458:2185,459:2175,460:2250,
461:2165,462:2175,463:2195,464:2175,465:2085,466:2195,467:2185,468:2205,469:2195,470:2260,
471:2205,472:2195,473:2205,474:2215,475:2105,476:2215,477:2205,478:2215,479:2205,480:2260,
481:2175,482:2185,483:2195,484:2195,485:2095,486:2195,487:2185,488:2195,489:2195,490:2260}
MINCOL={i:(13 if i%10==5 else 20 if i%10==0 and i>=480 else 18 if i%10==0 else 16 if i>=481 else 15) for i in TARGET}
PALETTES={46:['navy','indigo','blue','cerulean','ice','white','silver','cyan','teal','verdigris','lavender','blush','sand','coral','brown','umber','stone','ash','graphite','gold','yellow','orange','red','garnet','sage','moss','green','forest'],
47:['cerulean','ice','blush','lavender','sage','stone','slate','ash','ivory','white','silver','graphite','brown','umber','gold','yellow','red','blue','bronze','navy','indigo','sand','green'],
48:['cerulean','ice','blush','lavender','navy','indigo','stone','slate','ash','ivory','graphite','gold','yellow','cyan','silver','brown','umber','rose','sand','blue'],
49:['navy','indigo','cerulean','ice','white','silver','magenta','pink','purple','rose','gold','yellow','orange','red','garnet','blush','lavender','sand','brown','umber','stone','slate','ash','graphite','green','forest','sage','blue','cyan','ivory']}

def finish(out):
 for i,b in out.items():
  world=(i-1)//10+1;target=TARGET[i]
  # Keep purposeful rifts, then fill any excess empty background with the board's dark/light sky.
  empty=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x] is None]
  if 2304-len(empty)<target:
   fill=target-(2304-len(empty))
   for x,y in sorted(empty,key=lambda p:(min(p[0],47-p[0],p[1]),p[1]))[:fill]:b.put(x,y,'navy' if world in (46,49) else 'slate')
  else:
   cut=2304-len(empty)-target
   if cut:
    # Prefer the outer sky corners, yielding coherent darkness at phone size.
    colors=['navy','indigo','graphite','slate','cerulean','blush','lavender','ice','stone']
    cells=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x] in colors]
    cells.sort(key=lambda p:(min(p[0]+p[1],47-p[0]+p[1],p[0]+47-p[1],94-p[0]-p[1]),p[1],p[0]))
    for x,y in cells[:cut]:b.put(x,y,None)
    if len(cells)<cut:
     extra=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x] is not None]
     extra.sort(key=lambda p:(p[1],min(p[0],47-p[0])))
     for x,y in extra[:cut-len(cells)]:b.put(x,y,None)
  # Palette extension follows existing large shapes instead of stamping squares.
  original={c for row in b.cells for c in row if c}
  for attempt in range(24):
   counts={c:sum(row.count(c) for row in b.cells) for c in sorted(set(sum(b.cells,[]))-{None})}
   if len(counts)>=MINCOL[i]:break
   new=next((v for v in PALETTES[world] if v not in counts),None)
   if new is None:raise RuntimeError(f'palette exhausted {i}')
   choices=[]
   for c,n in counts.items():
    if c not in original or n<85:continue
    for direction in range(4):
     for threshold in range(7,79,3):
      selected=[]
      for y in range(48):
       for x in range(48):
        if b.cells[y][x]!=c:continue
        projection=(x+y,47-x+y,2*y,2*x)[direction]
        if projection<threshold:selected.append((x,y))
      if 28<=len(selected)<=min(210,n-35):
       score=abs(len(selected)-90)+direction*4+abs(threshold-38)*.05
       choices.append((score,c,selected))
   if not choices:raise RuntimeError(f'palette planes {i}: {counts}')
   _,c,selected=min(choices,key=lambda v:v[0])
   for x,y in selected:b.put(x,y,new)
  else:raise RuntimeError(f'palette extension exceeded {i}')
  # Grow a marginal color through its own patch; every used color has at least 25 cells.
  while True:
   counts={c:sum(row.count(c) for row in b.cells) for c in sorted(set(sum(b.cells,[]))-{None})}
   rare=[(n,c) for c,n in counts.items() if n<25]
   if not rare:break
   n,c=min(rare);members=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x]==c]
   cx=sum(x for x,_ in members)/n;cy=sum(y for _,y in members)/n
   opts=[]
   for x,y in members:
    for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
     if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] not in (None,c) and counts[b.cells[yy][xx]]>25:opts.append((abs(xx-cx)+abs(yy-cy),yy,xx))
   if not opts:raise RuntimeError(f'rare color {i} {c} {n}')
   _,yy,xx=min(opts);b.put(xx,yy,c)
  # Fracture rims never use adjacent pink/magenta; replace the optional pink
  # material with a distinct rock/ice plane while preserving color population.
  if world==49:
   present={c for row in b.cells for c in row if c}
   if 'pink' in present:
    replacement=next(c for c in ('stone','silver','slate','ash','ivory','umber','sand') if c not in present)
    for y in range(48):
     for x in range(48):
      if b.cells[y][x]=='pink':b.put(x,y,replacement)
  if i==490:
   # The dusk palace loses its bright upper-right roof color beyond the rift.
   for y in range(48):
    for x in range(48):
     if b.cells[y][x]=='yellow':b.put(x,y,'ash' if x>=35 and y<19 else 'gold')
   b.ellipse(12,4,22,11,'sand')
 return out

if __name__=='__main__':
 root=Path('/Users/andres/Desktop/pixel-arcadia-design-351-500')
 names={46:'PLANETARY_WONDERS',47:'LEGENDARY_RELICS',48:'INFINITE_CITIES',49:'ARCADIA_FRACTURED'};titles={}
 for w,name in names.items():
  for i,t in re.findall(r'^## (\d+) — (.+)$',(root/f'WORLD_{w}_{name}.md').read_text(),re.M):titles[int(i)]=re.sub(r' \*\(.+?\)\*','',t).strip()
 result=[]
 for i,b in finish(boards()).items():
  rows=b.rows();used=set(''.join(rows))-{'.'};counts={c:sum(row.count(c) for row in b.cells) for c in sorted(set(sum(b.cells,[]))-{None})}
  result.append(dict(id=i,title=titles[i],grid=rows,legend={c:LEGEND[c] for c in sorted(used)}))
  print(i,sum(counts.values()),len(counts),min(counts.values()))
 Path('dist/m16f').mkdir(parents=True,exist_ok=True);Path('dist/m16f/art.json').write_text(json.dumps(result,indent=2)+'\n')
