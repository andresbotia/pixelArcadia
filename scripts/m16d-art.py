"""Hand-authored 48x48 raster compositions for M16D, offline only."""
from pathlib import Path
import json, math, re, importlib.util
spec=importlib.util.spec_from_file_location('base',Path(__file__).with_name('m16c-art.py'))
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
Board=base.Board;sky=base.sky;loop=base.loop;hall=base.hall;pine=base.pine;hut=base.hut;material=base.material;frame=base.frame
COLORS=base.COLORS;ENCODE=base.ENCODE;LEGEND=base.LEGEND

def sun(b,x,y,r=5):b.ellipse(x-r,y-r,x+r,y+r,'gold');b.ellipse(x-r+2,y-r+2,x+r-2,y+r-2,'yellow')
def boat(b,x,y,w=8):
 b.poly([(x,y),(x+w,y),(x+w-2,y+4),(x+2,y+4)],'umber');b.line([(x+w//2,y),(x+w//2,y-11)],'brown',2);b.poly([(x+w//2-1,y-10),(x+1,y-2),(x+w//2,y-2)],'silver')
def peak(b,x,y,w,c='stone'):
 b.poly([(x,y),(x+w//2,47),(x-w//2,47)],c);b.poly([(x,y),(x+5,y+9),(x,y+7),(x-6,y+10)],'ice')
def cliff(b,x0,x1,c='slate'):
 b.rect(x0,8,x1,47,c);b.line([(x0+2,8),(x0+4,47)],'stone',3)
def house(b,x,y,w=6,side=False):
 if side:
  b.rect(x,y,x+w,y+5,'ivory');b.rect(x,y,x+1,y+5,'red');b.rect(x+3,y+2,x+4,y+3,'gold')
 else:
  b.rect(x,y,x+w,y+7,'ivory');b.poly([(x-1,y),(x+w//2,y-3),(x+w+1,y)],'red');b.rect(x+2,y+2,x+3,y+3,'gold')
def splitbg(cs):return sky(cs,(0,13,29,48))

def boards():
 out={}
 # 38: geology carries the scene, human markers remain small.
 b=sky(['cerulean','ice','ivory']);b.poly([(0,43),(11,32),(23,25),(42,6),(47,11),(47,47),(0,47)],'slate');b.poly([(0,42),(11,34),(23,27),(42,8),(42,15),(25,37),(0,47)],'stone');b.rect(0,37,47,47,'silver');b.line([(0,39),(16,31),(28,23),(42,9)],'sand',2)
 for x,y in [(6,36),(13,31),(20,26),(28,21),(35,15),(40,10)]:b.rect(x,y,x+2,y+2,'ash');b.rect(x+1,y-2,x+2,y-1,'gold')
 b.rect(38,4,44,8,'ivory');b.rect(40,2,42,4,'red');b.poly([(2,30),(9,25),(8,34)],None);b.poly([(23,37),(32,28),(29,42)],None);b.rect(0,0,15,5,None);out[371]=b
 b=sky(['ice','lavender','blush']);
 for y,c in [(13,'mauve'),(18,'sand'),(22,'gold'),(26,'coral'),(30,'bronze'),(34,'rose'),(38,'brown'),(42,'umber')]:b.poly([(0,y+4),(11,y-2),(24,y+2),(36,y-3),(47,y+2),(47,47),(0,47)],c)
 b.line([(0,43),(10,39),(17,42),(25,34),(32,37),(40,29)],'ivory',2);b.rect(7,34,9,36,'ash');b.rect(39,26,44,30,'stone');b.poly([(11,22),(15,26),(13,38)],None);b.poly([(29,25),(32,29),(30,41)],None);b.rect(0,2,12,4,'white');out[372]=b
 b=sky(['pine','graphite','slate']);b.rect(0,39,47,47,'cerulean');b.rect(0,43,47,47,'verdigris')
 for x,w in [(3,3),(9,2),(16,4),(23,2),(29,3),(36,4),(43,2)]:b.rect(x,7,x+w,42,'ice');b.rect(x,8,x+w-1,39,'white');b.ellipse(x-1,39,x+w+2,44,'silver')
 for x,y in [(6,18),(19,26),(33,13),(39,30)]:b.rect(x,y,x+4,y+4,None);b.rect(x+1,y+1,x+2,y+2,'gold')
 b.rect(0,37,47,39,'ivory');b.rect(11,40,32,41,'umber');b.rect(0,0,47,5,'moss');b.rect(1,14,2,29,None);b.rect(45,13,46,31,None);out[373]=b
 b=Board('brown');b.rect(0,0,47,5,'ash');b.rect(0,42,47,47,'stone')
 for x,y,w in [(2,9,12),(17,4,14),(34,9,12)]:
  b.ellipse(x,y,x+w,y+29,'graphite');b.rect(x,y+14,x+w,y+29,'graphite');b.ellipse(x+2,y+4,x+w-2,y+14,'silver');b.rect(x+3,y+11,x+w-3,y+28,'stone');b.rect(x+3,y+21,x+4,y+28,'ash');b.rect(x+w-4,y+21,x+w-3,y+28,'ash')
 b.rect(0,35,47,37,'bronze');b.line([(0,36),(47,36)],'gold',1);b.rect(0,39,47,40,'umber');b.rect(13,8,16,13,'moss');b.rect(30,25,33,30,'moss');out[374]=b
 b=sky(['indigo','lavender','blush','gold'],(0,8,19,35,48));b.rect(0,39,47,47,'sand');b.rect(0,44,47,47,'brown');b.ellipse(7,16,42,38,'coral');b.rect(7,27,42,40,'brown');b.rect(24,18,42,39,'garnet');b.rect(16,20,18,36,'umber');b.rect(35,21,37,39,'umber');b.rect(9,38,15,42,None);b.rect(0,0,47,2,None);b.rect(0,3,47,5,'navy');b.rect(3,43,7,45,'olive');b.rect(40,42,44,44,'sage');out[375]=b
 b=sky(['ice','silver','stone']);b.poly([(0,13),(20,1),(47,16),(47,47),(0,47)],'ash');b.ellipse(9,8,39,44,'graphite');b.rect(10,23,38,45,'graphite');b.ellipse(15,12,33,39,None);b.rect(16,24,32,44,None);b.rect(0,40,47,47,'sage');b.line([(4,46),(17,35),(24,26)],'sand',3)
 for x,y in [(7,43),(12,39),(18,34),(22,30)]:b.rect(x,y,x+1,y+2,'gold')
 b.rect(22,21,26,25,'ivory');b.rect(23,20,25,21,'red');b.rect(6,16,11,20,'moss');b.rect(36,11,41,16,'white');out[376]=b
 b=sky(['cerulean','ice','silver']);peak(b,10,1,28,'slate');peak(b,40,4,24,'graphite');b.rect(0,24,47,47,'ice');b.line([(0,32),(18,23),(34,26),(47,18)],'silver',4);b.poly([(6,24),(19,27),(39,43),(37,47),(24,39),(8,31)],None);b.line([(6,25),(36,45)],'ultramarine',3);b.line([(16,40),(28,23)],'umber',3);b.line([(17,40),(29,23)],'bronze',2)
 for x,y in [(13,34),(18,32),(24,30),(28,28)]:b.rect(x,y,x+2,y+1,'gold')
 b.rect(0,44,9,47,'cerulean');b.rect(37,42,47,47,'cerulean');out[377]=b
 b=sky(['cerulean','lavender','blush']);peak(b,24,15,27,'ice');b.rect(0,32,47,47,'sage');b.rect(0,0,11,47,'brown');b.rect(36,0,47,47,'brown');b.ellipse(0,-11,47,25,'umber');b.ellipse(10,11,37,41,'lavender');peak(b,24,14,18,'white');b.rect(11,30,36,47,'forest');b.rect(0,0,47,8,'brown');b.line([(2,12),(8,21),(6,31)],'moss',3);b.line([(45,11),(40,22),(42,32)],'moss',3);house(b,20,1,6);b.rect(11,16,14,26,None);b.rect(34,16,37,26,None);out[378]=b
 b=sky(['lavender','silver','cerulean']);b.rect(0,37,47,47,'navy')
 for j,(x,y) in enumerate([(2,8),(10,14),(19,21),(29,28),(39,35)]):
  b.rect(x,y,x+7,47,'graphite' if j%2 else 'slate');b.poly([(x,y+1),(x+2,y-2),(x+6,y-2),(x+8,y+1),(x+6,y+3),(x+2,y+3)],'ash');b.rect(x+2,y+6,x+4,45,'stone');b.rect(x+7,y+10,x+8,y+25,None)
 b.line([(24,44),(47,41)],'white',4);b.line([(4,45),(20,42)],'ice',3);house(b,2,3,6);b.rect(1,40,9,43,'moss');out[379]=b
 b=sky(['navy','indigo','blush']);peak(b,26,4,42,'slate');peak(b,26,4,26,'silver');b.poly([(26,4),(35,22),(26,21)],'ice');b.rect(0,32,47,47,'stone');b.rect(0,39,47,47,'sage');b.rect(0,44,47,47,'green');b.line([(15,16),(11,34)],'white',3);b.line([(35,16),(39,36)],'ice',3)
 b.poly([(0,23),(12,22),(23,24),(34,22),(47,23),(47,30),(0,30)],'white');b.rect(0,25,47,27,'ivory');b.rect(0,29,47,30,'lavender');b.line([(17,30),(8,40),(0,45)],'cerulean',5);house(b,37,37,8);b.rect(24,2,28,7,'gold');b.rect(25,0,27,3,'red');b.rect(1,0,12,9,None);b.rect(39,0,47,9,None);out[380]=b
 # 39: every board joins one living mass to a mechanically straight system.
 b=sky(['lavender','blush','sand']);b.ellipse(0,0,33,19,'olive');b.ellipse(2,2,29,18,'moss');b.rect(12,13,19,35,'umber');b.rect(22,27,47,47,'ash');b.rect(24,29,47,44,'graphite');b.rect(0,42,47,47,'sage')
 for x,y in [(8,35),(14,33),(19,32),(24,31),(29,33),(34,37)]:b.line([(15,31),(x,y),(x+4,42)],'brown',4);b.line([(x+4,38),(x+6,43)],'bronze',2)
 loop(b,37,36,7,6,'silver',2);b.rect(36,34,38,37,'gold');b.rect(22,34,25,38,None);b.rect(42,35,46,39,None);out[381]=b
 b=sky(['ice','sage','cerulean']);b.poly([(0,10),(13,8),(21,37),(0,47)],'moss');b.poly([(43,3),(47,7),(47,47),(30,47)],'stone');b.rect(0,42,47,47,'cerulean');b.line([(0,46),(47,43)],'white',2);b.line([(0,18),(47,9)],'graphite',4);b.line([(0,17),(47,8)],'teal',2)
 for j,(x,y,h) in enumerate([(2,18,26),(10,17,22),(18,15,20),(27,13,17),(36,11,13),(43,10,9)]):b.rect(x,y,x+3,y+h,'ivory');b.ellipse(x-1,y+h-4,x+4,y+h+2,'sand');b.rect(x,y+6,x+3,y+8,'bronze');b.rect(x+1,y+10,x+2,y+11,'gold')
 b.rect(5,18,45,19,'cyan');b.rect(11,25,15,33,None);b.rect(23,24,27,32,None);out[382]=b
 b=Board('stone');b.rect(0,40,47,47,'ash');loop(b,24,23,19,17,'bronze',4,-15);loop(b,24,23,16,14,'gold',2,-15)
 for i in range(8):
  a=i*math.pi/4;cx=24+10*math.cos(a);cy=23+8*math.sin(a);nx=24+18*math.cos(a+.35);ny=23+15*math.sin(a+.35)
  b.poly([(24,23),(int(cx),int(cy)),(int(nx),int(ny))],['lavender','blush'][i%2]);b.line([(int(cx),int(cy)),(int(nx),int(ny))],'mauve',2)
 b.ellipse(18,17,30,29,None);b.line([(19,38),(16,47)],'silver',3);b.line([(28,39),(32,47)],'pine',3);b.rect(1,18,7,24,'moss');b.rect(40,30,47,35,'graphite');out[383]=b
 b=sky(['navy','graphite','verdigris']);b.rect(0,7,17,47,'plum');b.rect(30,6,47,47,'graphite');b.rect(0,40,47,47,'teal');b.rect(18,10,29,39,None)
 for j,y in enumerate([12,23,33]):b.rect(16,y,31,y+2,'cyan');b.rect(19,y,27,y+1,'white')
 for x,side in [(6,1),(40,-1)]:
  for y in [7,19,30]:b.line([(x,y),(x+side*6,y+4),(x+side*3,y+8)],'seafoam',2)
 b.rect(21,42,27,45,'bronze');b.rect(11,34,15,37,None);b.rect(34,33,38,37,None);out[384]=b
 b=sky(['graphite','plum','sage']);b.rect(0,44,47,47,'moss');b.line([(26,0),(24,9)],'silver',3);b.line([(25,4),(46,3)],'silver',4);b.ellipse(12,10,31,41,'green');b.ellipse(13,24,31,42,'bronze');b.line([(11,25),(30,22)],'ivory',3);b.rect(16,13,18,20,'lime');b.rect(25,30,28,38,'gold');b.rect(3,2,9,9,'gold');b.rect(0,0,47,3,None);b.rect(0,4,47,6,'navy');out[385]=b
 b=sky(['cerulean','ice','sand']);b.poly([(0,35),(25,20),(47,33),(47,47),(0,47)],'olive');b.line([(0,34),(17,31),(33,16),(47,13)],'ash',5);b.line([(0,36),(17,33),(33,18),(47,15)],'bronze',2)
 for j in range(12):
  x=2+j*4;y=32-int(18*j/12)+int(3*math.sin(j*.7));b.ellipse(x,y,x+5,y+5,'rose' if j%2 else 'maroon');b.rect(x+1,y+1,x+2,y+2,'gold');b.line([(x+2,y+5),(x+1,y+8)],'silver',2)
 b.rect(0,39,17,45,None);b.rect(20,32,31,38,None);out[386]=b
 b=sky(['pine','sage','forest']);b.poly([(0,0),(12,0),(39,26),(35,34),(26,30),(0,11)],'umber');b.line([(0,3),(29,30)],'brown',7)
 for r,c in [(17,'bronze'),(14,'brown'),(11,'silver'),(8,'sand'),(5,'teal')]:b.ellipse(32-r,32-r,32+r,32+r,c)
 b.ellipse(29,29,35,35,'cyan');b.ellipse(31,31,33,33,'white')
 for a in [0,.5*math.pi,math.pi,1.5*math.pi]:b.line([(32+int(7*math.cos(a)),32+int(7*math.sin(a))),(32+int(17*math.cos(a)),32+int(17*math.sin(a)))],None,2)
 b.line([(12,33),(45,33)],'graphite',2);b.rect(0,20,11,25,'moss');out[387]=b
 b=sky(['cerulean','blush','ash']);b.ellipse(5,8,40,42,'olive');b.rect(0,40,47,47,'stone')
 for row in range(5):
  y=13+row*5
  for x in range(8+(row%2)*2,39,7):b.rect(x,y,x+4,y+3,'moss' if row%2 else 'bronze');b.rect(x,y+3,x+4,y+3,'sand')
 for x,y in [(12,17),(24,19),(33,23),(19,29),(30,34),(11,33)]:b.rect(x,y,x+4,y+3,'gold');b.rect(x+1,y+1,x+3,y+2,None)
 b.line([(39,28),(45,39),(38,43)],'umber',5);b.rect(0,37,7,40,None);b.rect(40,40,47,43,None);out[388]=b
 b=sky(['indigo','lavender','blush']);b.rect(17,4,31,43,'ash');b.rect(18,4,19,43,'silver');b.rect(30,4,31,43,'graphite');b.rect(0,42,47,47,'brown');b.rect(20,0,28,6,'forest')
 for x,c in [(13,'rose'),(35,'teal')]:
  b.line([(x,39),(x+2,25),(x+5,17),(x+7,5)],c,4);b.line([(x+2,25),(x-1,17)],c,2);b.line([(x+4,19),(x+8,11)],c,2)
 for y in [12,22,32]:b.rect(22,y,25,y+2,'gold');b.rect(10,y+3,14,y+4,'coral');b.rect(35,y-1,39,y,'seafoam')
 b.rect(0,0,10,4,None);b.rect(39,0,47,5,None);out[389]=b
 b=sky(['plum','graphite','slate']);b.rect(0,41,47,47,'umber');b.rect(0,44,47,47,'teal');
 for x in [3,13,34,44]:loop(b,x,19,7,20,'silver',2)
 b.ellipse(11,9,36,34,'maroon');b.ellipse(15,12,25,31,'rose');b.ellipse(25,12,36,31,'bronze');b.ellipse(16,14,22,20,'blush');b.rect(28,17,30,29,'ash');b.rect(31,16,33,29,'gold')
 for pts in [[(13,18),(0,12)],[(13,26),(0,31)],[(23,11),(17,0)],[(31,11),(37,0)],[(35,19),(47,15)],[(35,27),(47,32)]]:b.line(pts,'maroon',4);b.line(pts,'bronze',2)
 b.line([(24,32),(24,45)],'cyan',4);b.rect(2,24,9,32,'ivory');b.rect(38,23,46,31,'ivory');b.rect(20,41,30,45,'silver');b.rect(0,2,10,8,None);b.rect(38,1,47,8,None);out[390]=b
 # 40: each ordinary Earth scene demonstrates only its named altered law.
 b=sky(['navy','ice','cerulean']);b.rect(0,0,47,17,'blue');b.line([(0,15),(12,16),(25,15),(38,17),(47,15)],'white',4)
 for x in [4,20,36]:boat(b,x,17,7)
 b.rect(0,30,47,47,'stone');b.rect(0,37,47,47,'sage')
 for x,y in [(2,33),(13,35),(26,32),(38,34)]:house(b,x,y,8)
 for x in [8,22,35]:b.line([(x,20),(x,34)],'silver',1)
 b.rect(0,0,15,3,None);b.rect(32,0,47,2,None);b.rect(3,41,6,45,None);out[391]=b
 b=sky(['cerulean','ice','sage']);b.rect(0,34,47,47,'green');b.ellipse(23,37,41,45,'cerulean');b.rect(4,14,43,20,'umber');b.rect(4,14,43,16,'lime');b.rect(5,18,42,20,'sand')
 for x in [7,16,29,39]:b.rect(x,8,x+2,14,'brown');b.ellipse(x-3,5,x+5,10,'forest')
 for x in [9,18,27,36]:b.rect(x,20,x+2,26,'brown');b.ellipse(x-4,24,x+6,32,'pine');b.ellipse(x-3,28,x+5,33,'moss')
 house(b,31,7,7);house(b,7,38,6);b.rect(10,22,15,26,None);b.rect(21,22,25,27,None);out[392]=b
 b=sky(['slate','graphite','stone']);b.rect(0,0,47,7,'silver');b.rect(0,40,47,47,'cerulean');b.rect(0,43,47,47,'verdigris')
 for x in [4,11,37,43]:b.rect(x,8,x+4,39,'slate')
 for x,w in [(14,3),(20,4),(28,3),(34,2)]:b.rect(x,7,x+w,41,'ice');b.rect(x,6,x+w-1,38,'white');b.ellipse(x-4,3,x+w+4,9,'white');b.poly([(x-3,8),(x+1,2),(x+5,8)],'ice');b.poly([(x,36),(x-2,41),(x+3,39)],'cerulean')
 b.rect(0,23,47,25,'brown');b.rect(0,24,47,24,'silver');b.rect(16,15,18,18,'coral');b.rect(0,33,5,39,None);b.rect(41,28,47,38,None);out[393]=b
 b=sky(['indigo','lavender','blush']);b.rect(0,15,8,47,'brown');b.rect(39,15,47,47,'brown');b.rect(11,38,36,47,None)
 for pts in [[(0,22),(11,28),(22,22),(35,13),(47,21)],[(0,35),(10,19),(21,17),(36,32),(47,30)],[(21,0),(24,10),(33,17),(43,20)]]:b.line(pts,'graphite',5);b.line(pts,'sand',1)
 loop(b,24,30,12,7,'ash',4);loop(b,24,30,12,7,'silver',1)
 for x,y in [(9,27),(21,20),(30,15),(39,29),(18,34)]:b.rect(x,y,x+2,y+1,'white');b.rect(x+3,y,x+4,y+1,'red')
 b.rect(0,43,8,47,'umber');b.rect(40,42,47,47,'umber');out[394]=b
 b=sky(['indigo','lavender','blush','gold'],(0,8,17,29,48));b.rect(0,29,47,47,'gold');b.rect(0,39,47,47,'sand');sun(b,12,24,5);b.ellipse(34,20,44,30,'ivory');b.ellipse(37,22,42,27,'white');house(b,21,31,7)
 for x in [5,16,31,42]:b.poly([(x,34),(x+5,35),(x+13,45),(x+4,41)],'umber');b.poly([(x+1,35),(x-5,38),(x-8,44),(x+2,40)],'brown')
 b.rect(0,0,47,5,None);b.rect(4,44,12,47,None);out[395]=b
 b=sky(['cerulean','ice','green']);b.rect(0,21,47,26,'white');b.rect(0,23,47,24,'silver');b.rect(0,27,47,47,'lavender');b.poly([(0,12),(11,16),(25,11),(41,16),(47,14),(47,22),(0,22)],'lime');b.poly([(0,38),(11,34),(25,39),(41,34),(47,36),(47,27),(0,27)],'orange')
 for x in [4,18,34]:house(b,x,14,7);house(b,x,27,7,True)
 b.rect(39,6,43,23,'white');b.rect(39,25,43,42,'ivory');b.rect(40,7,41,8,'red');b.rect(40,41,41,42,'garnet');b.rect(0,0,7,3,None);b.rect(40,44,47,47,None);out[396]=b
 b=sky(['indigo','lavender','blush']);b.rect(0,29,47,47,'ash')
 for x,h in [(1,16),(12,8),(21,15),(34,12),(43,20)]:b.rect(x,h,x+5,47,'brown');b.rect(x+1,h+5,x+2,h+7,'gold')
 for x,y,r in [(8,14,8),(26,10,9),(40,16,7)]:b.rect(x-1,y+4,x+1,43,'green');b.ellipse(x-r,y-r,x+r,y+r,'silver');b.ellipse(x-r+2,y-r+2,x+r-2,y+r-2,'white');b.ellipse(x-2,y-2,x+2,y+2,'sand')
 for x,y in [(15,5),(33,3),(45,6),(18,20)]:b.ellipse(x,y,x+3,y+3,'white');b.rect(x+1,y+4,x+2,y+6,'umber')
 b.rect(0,0,5,4,None);out[397]=b
 b=sky(['cerulean','ice','stone']);b.poly([(24,14),(47,47),(0,47)],'graphite');b.line([(24,14),(9,47)],'silver',2);b.line([(24,14),(39,47)],'silver',2)
 for y,ca,cb in [(18,'orange','gold'),(23,'green','lime'),(29,'pink','blush'),(37,'white','ice')]:
  d=max(4,(y-12)//2)
  for x in [24-d-8,24+d+2]:b.ellipse(x,y,x+7,y+5,ca);b.rect(x+3,y+5,x+4,y+10,'ash');b.rect(x+2,y+1,x+4,y+2,cb)
 b.rect(2,13,12,47,'stone');b.rect(37,12,47,47,'ash');b.rect(0,43,9,47,'silver');b.rect(38,43,47,47,'silver');b.rect(21,27,26,31,'red');b.rect(0,22,5,28,None);b.rect(42,27,47,33,None);out[398]=b
 b=sky(['blush','lavender','stone']);b.rect(0,26,47,47,'ash');b.rect(0,31,47,38,'cerulean');b.rect(23,0,24,47,'white')
 for x,h in [(1,13),(9,19),(16,9)]:b.rect(x,h,x+6,30,'brown');b.rect(x+1,h+3,x+2,h+4,'gold');b.rect(x+3,h-3,x+4,h,'graphite')
 for x,h in [(26,14),(34,21),(41,10)]:b.rect(x,h,x+5,30,'bronze');b.ellipse(x-2,h-5,x+7,h+2,'forest');b.rect(x+2,h+3,x+3,h+4,'gold')
 b.rect(0,29,47,31,'stone');b.rect(0,30,22,30,'ivory');b.rect(25,30,47,30,'moss');b.rect(4,27,8,30,None);b.rect(37,27,41,30,None);out[399]=b
 # 400: concentric signed-distance bands around a quarter-circle, then rotated towns.
 b=Board('cerulean')
 for y in range(48):
  for x in range(48):
   d=y-30 if x<=18 else x-30 if y<=18 else math.hypot(x-18,y-18)-12
   if d<0:b.put(x,y,'cerulean' if x+y<29 else 'ice')
   else:
    b.put(x,y,next(c for upper,c in [(2,'lime'),(5,'green'),(6,'forest'),(9,'blue'),(10,'cerulean'),(13,'olive'),(15,'graphite'),(16,'sand'),(19,'sage'),(100,'moss')] if d<upper))
 # Additional field planes parallel to local floor and wall, kept clear of river/road.
 for x in range(3,17,4):b.rect(x,27,x+1,29,'forest');b.rect(x,25,x+1,27,'pine')
 for y in range(2,17,4):b.rect(27,y,29,y+1,'forest');b.rect(25,y,27,y+1,'pine')
 b.ellipse(3,3,12,12,'gold');b.ellipse(5,5,10,10,'yellow')
 b.ellipse(12,13,23,15,'white');b.ellipse(2,21,13,23,'silver')
 for x,w in [(3,7),(12,6)]:house(b,x,23,w);b.rect(x+1,27,x+3,29,'ash')
 for y,w in [(2,7),(10,6)]:house(b,23,y,w,True);b.rect(27,y+1,29,y+3,'ash');b.rect(23,y+2,24,y+3,'brown')
 house(b,20,21,5);house(b,17,25,5)
 for x,y in [(16,31),(29,17)]:b.rect(x,y,x+2,y+2,None)
 b.rect(6,26,7,27,None);b.rect(13,26,14,27,None);b.rect(25,3,26,4,None)
 # Solid centreline survives the entire bent road, rather than scattered dashes.
 for y in range(48):
  for x in range(48):
   if b.cells[y][x]=='graphite' and ((x<18 and y==44) or (y<18 and x==44)):b.put(x,y,'sand')
 out[400]=b
 # 41: filled fog and wakes, darkness only in sea depths, sail tears and trench cores.
 b=sky(['silver','stone','sage']);b.rect(0,39,47,47,'navy');b.rect(0,21,47,23,'silver');b.rect(0,32,47,35,'sage');b.ellipse(20,3,28,11,'ivory')
 for x,y,w in [(1,27,12),(16,21,14),(32,24,13),(9,20,8),(29,18,7)]:boat(b,x,y,w);b.rect(x,y+3,x+w,y+4,'ash');b.rect(x+3,y-6,x+5,y-4,None);b.rect(x+2,y+2,x+3,y+3,'gold')
 b.rect(0,43,15,47,None);b.rect(34,45,47,47,None);out[401]=b
 b=sky(['silver','stone','ice']);b.rect(0,31,47,47,'slate')
 # One profile on the left: brow, nose, closed eye and broad neck.
 b.poly([(3,10),(10,6),(17,7),(21,12),(21,16),(24,18),(22,22),(24,25),(19,30),(10,33),(3,29)],'stone')
 b.poly([(3,10),(10,6),(17,7),(17,29),(9,33),(3,29)],'ash')
 b.line([(12,17),(17,18)],'graphite',2);b.line([(19,24),(23,24)],'silver',2)
 b.line([(5,9),(18,8)],'bronze',3);b.rect(5,22,10,27,'moss');b.line([(5,28),(12,30)],'verdigris',3)
 # Five distinct fingers rise from a separate open palm on the right.
 b.ellipse(30,20,43,35,'stone')
 for x,y,h in [(29,10,16),(33,4,22),(37,5,21),(41,9,17),(45,16,11)]:b.rect(x,y,x+2,y+h,'silver');b.rect(x+1,y+2,x+2,y+h,'stone')
 b.rect(32,27,41,35,'ash');b.line([(0,31),(47,31)],'ice',2)
 b.poly([(23,28),(30,28),(28,31),(24,31)],'umber');b.rect(25,27,27,28,'red')
 b.rect(0,37,21,40,None);b.rect(30,36,47,39,None);out[402]=b
 b=sky(['stone','slate','navy']);b.rect(0,35,47,47,'slate')
 # One open spiral arm curls toward the eye; keep the outside opening visible.
 spiral=[]
 for j in range(130):
  t=j/129;theta=-.6+2.8*math.pi*t;r=23-18*t
  spiral.append((26+r*math.cos(theta),26+r*math.sin(theta)))
 b.line(spiral,'cerulean',8);b.line(spiral,'verdigris',5)
 b.line(spiral[0:40],'white',2);b.line(spiral[48:92],'ice',2)
 b.ellipse(21,21,31,31,None)
 for x,y in [(5,7),(37,6),(3,33),(40,35),(14,39)]:b.rect(x,y,x+4,y+10,'ash');b.rect(x,y,x+4,y+1,'silver');b.rect(x+2,y+4,x+3,y+6,'moss')
 boat(b,4,32,7);b.rect(0,0,10,5,'graphite');b.rect(38,0,47,5,'graphite');out[403]=b
 b=sky(['cerulean','teal','sage']);b.poly([(0,34),(47,10),(47,26),(0,47)],'stone');b.line([(0,37),(47,14)],'ash',7)
 for x,y in [(4,33),(11,29),(19,25),(27,21),(36,17),(43,13)]:b.rect(x,y,x+5,y+3,'bronze');b.ellipse(x+1,y-4,x+5,y+1,'coral');b.rect(x+2,y-3,x+4,y-1,'rose');b.rect(x+1,y+1,x+2,y+2,None)
 b.line([(0,12),(47,9)],'ice',2);b.rect(0,41,22,47,'sand');b.rect(25,35,47,47,'olive');b.rect(31,32,39,35,'moss');out[404]=b
 b=sky(['navy','cerulean','teal']);b.rect(0,39,47,47,'sand');b.rect(0,44,47,47,'ivory');loop(b,30,17,5,5,'ash',3);b.line([(30,20),(22,36)],'graphite',7);b.line([(30,0),(30,15)],'ash',3);b.line([(21,34),(11,42),(7,38)],'ash',6);b.line([(21,34),(33,43),(40,38)],'ash',6);b.rect(11,40,18,44,'verdigris');b.rect(32,40,39,43,'moss');b.rect(0,0,47,3,None);b.rect(0,4,47,5,'navy');out[405]=b
 b=sky(['navy','indigo','slate']);loop(b,24,33,19,9,'sand',4,20)
 for j in range(12):
  a=math.pi*j/6;x=int(24+19*math.cos(a));y=int(33+9*math.sin(a));b.rect(x,y-8,x+2,y+2,'ash');b.rect(x,y-8,x+2,y-6,'silver')
 for x,y in [(6,4),(14,8),(22,4),(30,10),(39,5),(44,14),(10,17),(34,20)]:b.rect(x,y,x+1,y+1,'white')
 boat(b,34,43,8);b.rect(2,2,10,10,None);b.rect(30,0,47,3,None);out[406]=b
 b=sky(['cerulean','slate','navy']);b.rect(0,8,20,47,'ash');b.rect(30,8,47,47,'graphite');b.rect(21,23,29,47,None)
 for j,y in enumerate([11,18,25,32,39]):b.rect(0,y,18-j,y+2,'stone' if j<3 else 'slate');b.rect(5,y+3,11,y+6,None);b.rect(7,y+4,8,y+5,'silver')
 for x,y in [(33,14),(39,21),(34,28),(41,36)]:b.rect(x,y,x+1,y+1,'cyan')
 b.rect(0,0,47,4,'ice');b.rect(24,15,25,17,'gold');out[407]=b
 b=sky(['cerulean','ice','blue']);b.rect(0,14,47,47,'navy');b.rect(0,14,47,17,'cerulean');b.ellipse(2,22,47,45,'indigo');b.ellipse(7,25,44,42,'ultramarine');b.poly([(19,25),(11,15),(26,24)],'indigo');b.line([(0,14),(47,14)],'white',2);boat(b,20,13,8);b.rect(0,40,11,47,None);b.rect(38,43,47,47,None);b.rect(3,4,10,6,'white');out[408]=b
 b=sky(['lavender','blush','sand']);b.rect(0,41,47,47,'slate');b.poly([(0,18),(21,30),(19,43),(0,40)],'umber');b.poly([(25,30),(47,13),(47,42),(26,43)],'brown');b.rect(20,27,25,44,None)
 for x,y in [(2,23),(9,27),(30,25),(39,20)]:house(b,x,y,6);b.rect(x+2,y+6,x+3,y+7,'gold')
 for x,y in [(5,9),(18,6),(39,4)]:b.rect(x,y,x+2,31,'bronze');b.line([(x,y),(x+8,y+5)],'silver',1)
 loop(b,23,36,5,6,'bronze',2);b.rect(0,44,47,47,'verdigris');b.rect(0,35,6,39,'moss');out[409]=b
 b=sky(['navy','indigo','slate']);b.rect(0,14,47,29,'verdigris');b.rect(0,22,47,29,'slate');b.rect(0,30,47,47,'cerulean')
 for x in range(0,48,6):b.rect(x,34,x+3,47,'ice');b.rect(x+4,37,x+5,47,'slate')
 b.rect(0,30,47,32,'white');b.rect(0,32,47,33,'ice');b.line([(2,9),(20,2),(36,7)],'silver',3)
 for x in [8,35]:b.rect(x,9,x+5,40,'stone');b.rect(x+1,10,x+2,39,'ash');b.ellipse(x+1,18,x+4,21,'gold')
 for x,y in [(16,24),(24,21),(29,26)]:boat(b,x,y,5)
 b.rect(0,0,13,2,None);b.rect(43,2,47,7,None);b.rect(3,45,6,47,None);b.rect(18,44,20,47,None);out[410]=b
 return polish3(polish2(polish(out)))


def polish(out):
 # Material planes are bounded to the approved forms, so they make large
 # readable regions rather than scattered detail or artificial confetti.
 planes={
 371:[('cerulean','lavender',(0,0,19,13)),('ice','white',(0,16,47,20)),('silver','ivory',(0,39,47,43)),('slate','graphite',(26,19,46,32)),('stone','moss',(8,34,20,40)),('silver','ash',(0,31,12,35))],
 372:[('ice','white',(0,3,47,5)),('mauve','lavender',(0,14,18,18)),('brown','ash',(0,40,13,43))],
 373:[('moss','forest',(0,0,19,5)),('graphite','ash',(0,23,15,33)),('white','cerulean',(17,15,20,37)),('ice','blue',(32,19,40,27)),('slate','stone',(40,14,47,35)),('verdigris','teal',(0,44,47,47))],
 374:[('brown','coral',(0,0,47,5)),('brown','ash',(0,27,15,34)),('brown','moss',(34,20,47,28)),('stone','sand',(2,40,16,47)),('stone','ivory',(35,40,47,47)),('graphite','slate',(0,15,8,29)),('bronze','umber',(12,35,25,37))],
 375:[('brown','bronze',(4,39,47,43)),('garnet','umber',(36,23,42,36))],
 376:[('ash','slate',(0,15,9,35)),('ice','silver',(0,0,47,5)),('sage','green',(0,41,22,47)),('graphite','navy',(11,24,17,39)),('ash','moss',(36,15,47,29)),('sage','olive',(25,43,47,47))],
 377:[('cerulean','lavender',(0,0,47,7)),('ice','white',(0,25,17,37)),('ice','stone',(35,25,47,39)),('cerulean','blue',(0,42,47,47)),('ice','ash',(17,18,27,24)),('ice','navy',(29,28,42,32))],
 378:[('brown','ash',(0,15,11,30)),('brown','sand',(36,12,47,27)),('forest','green',(13,40,37,47)),('lavender','blush',(12,25,35,32)),('forest','sage',(11,34,35,39)),('umber','coral',(0,0,18,6)),('lavender','ice',(16,13,31,22))],
 379:[('lavender','ice',(0,0,47,5)),('silver','stone',(0,12,12,23)),('slate','ash',(11,26,28,38)),('stone','bronze',(0,30,18,40)),('graphite','umber',(37,36,47,47))],
 380:[('navy','indigo',(0,6,15,15)),('stone','pine',(0,38,20,44)),('sage','moss',(32,33,47,40)),('green','lime',(0,44,22,47)),('ivory','silver',(5,23,32,25)),('slate','graphite',(22,13,27,22)),('indigo','blush',(0,31,23,34))],
 381:[('blush','gold',(33,3,47,8)),('moss','forest',(0,0,15,7)),('sage','olive',(0,43,20,47)),('brown','bronze',(20,32,30,39)),('graphite','stone',(26,30,36,37))],
 382:[('ice','white',(0,0,47,6)),('cerulean','blue',(0,36,47,47)),('moss','olive',(0,15,16,27)),('stone','ash',(35,21,47,34)),('ivory','silver',(0,21,15,33))],
 383:[('stone','ash',(0,0,47,5)),('stone','graphite',(0,19,9,33)),('bronze','silver',(28,7,40,14)),('ash','moss',(0,40,15,47)),('stone','brown',(38,25,47,37))],
 384:[('plum','ash',(0,10,15,21)),('graphite','slate',(33,22,47,37)),('teal','verdigris',(0,40,47,47)),('plum','moss',(0,27,7,42)),('navy','indigo',(20,0,29,9)),('seafoam','ice',(0,6,13,13)),('graphite','stone',(40,6,47,17))],
 385:[('plum','navy',(0,7,13,24)),('sage','olive',(0,44,47,47)),('green','pine',(15,11,28,16))],
 386:[('cerulean','lavender',(0,0,47,7)),('olive','moss',(0,30,30,40)),('ice','white',(0,10,17,16)),('cerulean','blush',(0,19,12,26)),('olive','sage',(35,35,47,47)),('ash','graphite',(0,27,25,34))],
 387:[('pine','moss',(0,0,13,10)),('forest','green',(0,30,15,44)),('brown','ash',(23,17,34,27)),('bronze','gold',(37,24,47,39)),('sage','olive',(12,32,22,47))],
 388:[('cerulean','ice',(0,0,47,5)),('olive','pine',(10,18,25,28)),('stone','ash',(0,42,23,47)),('blush','lavender',(27,0,47,8)),('moss','sage',(22,31,36,38))],
 389:[('lavender','ice',(0,0,47,5)),('brown','stone',(0,44,19,47)),('ash','silver',(18,15,25,34)),('blush','gold',(31,36,47,41)),('indigo','navy',(0,13,10,24))],
 390:[('plum','indigo',(0,0,47,5)),('silver','ash',(0,32,12,41)),('maroon','coral',(0,19,15,26)),('bronze','gold',(31,11,40,18)),('graphite','stone',(0,36,16,43)),('rose','blush',(16,18,25,24))],
 391:[('ice','cerulean',(0,24,47,29)),('blue','navy',(0,3,47,7)),('stone','ash',(0,31,17,37)),('sage','green',(0,43,47,47)),('ivory','red',(26,37,47,39))],
 392:[('cerulean','silver',(0,0,47,5)),('green','sage',(0,39,47,47)),('moss','olive',(16,27,36,32)),('forest','pine',(3,4,22,10)),('ice','white',(0,29,17,34))],
 393:[('slate','stone',(0,15,12,30)),('white','cerulean',(20,18,30,36)),('graphite','ash',(39,19,47,38)),('silver','lavender',(0,0,47,5)),('verdigris','blue',(0,43,47,47)),('ice','ivory',(12,0,33,6))],
 394:[('indigo','navy',(0,0,47,5)),('brown','coral',(0,29,8,42)),('graphite','ash',(14,18,31,30)),('lavender','gold',(33,1,47,7)),('ash','stone',(15,26,34,37))],
 395:[('gold','yellow',(0,31,17,35)),('sand','bronze',(0,45,47,47)),('lavender','rose',(0,20,47,23))],
 396:[('cerulean','ice',(0,0,47,5)),('lavender','blush',(0,43,47,47)),('orange','brown',(0,27,19,34)),('ivory','ash',(28,30,47,37)),('lime','forest',(0,17,18,21)),('white','silver',(0,21,47,22))],
 397:[('brown','stone',(0,28,20,36)),('ash','graphite',(25,35,47,43)),('indigo','navy',(0,0,47,5)),('white','ivory',(0,7,15,16)),('green','lime',(20,32,31,47)),('lavender','blush',(34,13,47,19)),('brown','maroon',(37,25,47,33))],
 398:[('cerulean','ice',(0,0,47,5)),('stone','ivory',(0,12,13,29)),('graphite','ash',(0,39,17,47)),('stone','brown',(37,23,47,36)),('ash','silver',(0,30,11,42)),('graphite','navy',(22,36,27,47))],
 399:[('blush','ice',(0,0,47,5)),('ash','stone',(0,39,20,47)),('brown','maroon',(0,22,20,29)),('forest','lime',(29,12,47,21)),('bronze','moss',(31,23,47,29)),('cerulean','blue',(0,34,47,38)),('ash','umber',(0,31,19,37))],
 400:[],
 401:[('silver','ice',(0,0,47,5)),('sage','lavender',(0,30,47,34)),('stone','ash',(0,14,22,23)),('navy','slate',(0,39,47,43)),('umber','bronze',(0,26,18,33)),('silver','white',(17,8,32,13))],
 402:[('silver','lavender',(0,0,47,5)),('slate','navy',(0,43,47,47)),('stone','ash',(3,12,18,29)),('silver','ice',(0,20,47,27)),('stone','moss',(28,24,44,30)),('slate','verdigris',(30,34,47,38))],
 403:[('slate','navy',(0,39,47,47)),('stone','silver',(0,0,47,6)),('cerulean','ice',(13,10,36,17)),('verdigris','teal',(21,35,47,43)),('ash','moss',(37,6,47,24))],
 404:[('cerulean','ice',(0,0,47,5)),('teal','blue',(0,13,47,18)),('olive','sand',(0,42,47,47)),('stone','ash',(0,28,17,39)),('coral','orange',(13,21,34,32)),('ash','moss',(30,16,47,28))],
 405:[('navy','indigo',(0,5,47,9)),('teal','slate',(0,32,47,38)),('cerulean','blue',(0,19,47,25)),('ash','stone',(17,23,24,35))],
 406:[('navy','indigo',(0,0,47,6)),('slate','verdigris',(10,34,37,43)),('ash','stone',(22,18,37,31)),('indigo','plum',(0,18,20,25)),('sand','sage',(0,39,47,47)),('slate','cerulean',(0,27,12,36))],
 407:[('graphite','plum',(0,17,20,29)),('ash','stone',(0,34,20,47)),('graphite','slate',(35,23,47,43)),('ice','silver',(0,0,47,6)),('ash','bronze',(0,10,11,18)),('graphite','navy',(31,38,47,47)),('slate','moss',(35,13,47,23))],
 408:[('navy','slate',(0,14,47,20)),('indigo','plum',(0,34,47,43)),('ultramarine','mauve',(7,37,35,40)),('cerulean','ice',(0,0,47,5)),('navy','blue',(31,20,47,30)),('white','silver',(0,14,47,15))],
 409:[('lavender','silver',(0,0,47,5)),('blush','gold',(30,0,47,5)),('bronze','ash',(0,35,19,40)),('brown','umber',(29,27,47,38)),('verdigris','slate',(0,43,47,47)),('ivory','coral',(1,24,21,31)),('lavender','ice',(21,15,28,25))],
 410:[('navy','indigo',(0,0,47,5)),('slate','verdigris',(0,21,47,25)),('ice','white',(0,30,47,32)),('stone','ash',(0,15,14,30)),('verdigris','cerulean',(0,26,47,29)),('silver','lavender',(1,7,29,11)),('ice','navy',(0,45,47,47))],
 }
 for i,regions in planes.items():
  for source,target,box in regions:material(out[i],source,target,box)
 # Correct void budgets within the designed dark regions, never by erasing light.
 for i,b in out.items():
  if i==374:
   for x in [2,15,34,46]:b.rect(x,14,x+1,34,None)
  if i==375:b.rect(0,7,47,7,None)
  if i==376:
   for y in range(14,42):
    for x in range(10,39):
     if b.cells[y][x] is None and (x<17 or x>31 or y<18):b.put(x,y,'navy')
  if i==380:
   for y in range(10):
    for x in range(48):
     if b.cells[y][x] is None and (y>2 or 6<x<41):b.put(x,y,'navy')
  if i==384:
   for y in range(10,40):
    for x in list(range(18,21))+list(range(27,30)):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==390:
   for y in range(8):
    for x in range(48):
     if b.cells[y][x] is None:b.put(x,y,'plum')
  if i==392:b.rect(10,22,15,27,None);b.rect(29,22,31,25,None)
  if i==394:b.rect(10,38,37,39,'navy')
  if i==395:
   for y in range(4):
    for x in range(48):
     if b.cells[y][x] is None:b.put(x,y,'indigo')
  if i==396:b.rect(0,7,15,8,None);b.rect(36,40,47,41,None)
  if i==397:b.rect(0,0,47,2,None);b.rect(32,3,47,5,None)
  if i==404:b.rect(0,0,47,1,None);b.rect(32,40,47,41,None)
  if i==405:b.rect(0,6,47,6,None)
  if i==407:
   for y in range(20,48):
    for x in list(range(21,23))+list(range(28,30)):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==408:b.rect(0,43,9,45,None)
  if i==410:
   for y in range(44,48):
    for x in range(48):
     if b.cells[y][x] is None and x%6!=3:b.put(x,y,'navy' if y>=46 else 'slate')
 # Level 400: the approved three population fixes are deliberate, not specks.
 b=out[400]
 for x,y in [(3,23),(11,24),(24,3),(24,11),(18,22),(17,27)]:b.rect(x,y,x+2,y+2,'pine')
 for y in range(48):
  for x in range(48):
   if b.cells[y][x]=='silver' and (x<4 or x>35):b.put(x,y,'white')
 b.rect(18,13,22,15,'silver');b.rect(21,12,26,14,'silver')
 b.rect(19,5,22,11,'brown');b.rect(18,5,18,11,'red')
 return out


def polish2(out):
 # Second composition pass: bounded material regions and darkness budgets.
 more={
 371:[('silver','sage',(0,34,15,41)),('cerulean','gold',(40,3,47,7))],
 374:[('stone','ivory',(17,18,29,25)),('brown','coral',(0,7,15,12)),('graphite','slate',(19,13,30,22))],
 378:[('brown','stone',(0,34,12,43)),('forest','pine',(22,40,35,47))],
 380:[('stone','forest',(0,32,16,37))],
 383:[('stone','moss',(38,5,47,13)),('stone','graphite',(1,31,10,42)),('bronze','ash',(7,12,15,22))],
 384:[('plum','moss',(0,30,11,40)),('graphite','ash',(38,6,47,19))],
 385:[('green','lime',(14,13,23,18))],
 388:[('cerulean','ice',(0,10,47,13)),('olive','forest',(10,21,25,27)),('stone','silver',(0,40,47,42)),('bronze','gold',(24,20,39,26))],
 389:[('blush','gold',(34,0,47,5)),('brown','ivory',(0,43,16,47)),('forest','moss',(20,0,28,5))],
 390:[('plum','navy',(39,9,47,24)),('silver','ivory',(12,35,20,41)),('bronze','stone',(26,27,35,34)),('teal','verdigris',(0,43,47,47))],
 393:[('slate','moss',(0,30,11,39)),('slate','pine',(40,14,47,26)),('white','silver',(13,9,22,14))],
 394:[('brown','stone',(39,28,47,39))],
 395:[('gold','olive',(0,36,47,40)),('lavender','ice',(0,19,47,21))],
 398:[('stone','blush',(1,20,10,28)),('stone','pink',(38,22,47,29)),('graphite','brown',(5,40,11,47))],
 402:[('slate','verdigris',(0,35,47,38)),('stone','graphite',(28,21,37,31))],
 403:[('stone','silver',(36,20,47,29))],
 404:[('cerulean','silver',(0,22,16,26)),('coral','rose',(13,22,26,29)),('teal','seafoam',(0,18,47,21))],
 406:[('navy','ivory',(0,15,12,19)),('indigo','ice',(33,6,47,12))],
 407:[('ash','moss',(0,18,14,28)),('graphite','bronze',(33,26,47,34)),('stone','ivory',(0,43,20,47)),('ice','teal',(0,4,47,7)),('graphite','plum',(33,13,47,22))],
 408:[('navy','silver',(0,18,47,20)),('indigo','mauve',(0,34,14,39))],
 409:[('brown','gold',(30,29,47,34)),('bronze','green',(0,29,20,34)),('lavender','ivory',(0,15,12,20))],
 410:[('stone','moss',(8,17,16,28)),('slate','gold',(15,21,31,25)),('navy','ivory',(0,8,15,12)),('ice','silver',(0,37,47,40))],
 }
 for i,regions in more.items():
  for source,target,box in regions:material(out[i],source,target,box)
 # Adjust only intentional dark cavities, ocean depths, and night corners.
 for i,b in out.items():
  if i==374:
   for y in range(17,34):
    for x in (3,15,35):
     if b.cells[y][x] is None:b.put(x,y,'graphite')
  if i==376:
   for y in range(18,42):
    for x in (17,18,30,31):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==381:
   for x,y in [(25,31),(35,32),(42,34)]:b.rect(x,y,x+4,y+4,None)
  if i==382:
   for x,y in [(14,22),(25,22)]:b.rect(x,y,x+3,y+5,None)
  if i==384:
   for y in range(10,39):
    for x in (21,26):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==386:
   for y in range(32,47):
    for x in range(0,32):
     if b.cells[y][x] is None and (x+y)%3!=0:b.put(x,y,'olive')
  if i==390:b.rect(1,1,4,4,None)
  if i==392:b.rect(4,20,12,22,None)
  if i==395:b.rect(0,4,47,4,None);b.rect(0,5,15,5,None)
  if i==397:
   for x in range(8,48):
    if b.cells[0][x] is None:b.put(x,0,'navy')
  if i==399:b.rect(2,41,5,42,None)
  if i==402:b.rect(23,34,28,39,None)
  if i==404:
   for y in range(40,47):
    for x in range(48):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==406:b.rect(0,3,4,3,None)
  if i==407:
   for y in range(15,48):
    for x in list(range(21,23))+list(range(28,30)):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==408:b.rect(40,39,47,42,None)
  if i==410:
   for y in range(0,8):
    for x in range(48):
     if b.cells[y][x] is None and x%5==0:b.put(x,y,'navy')
 # Milestone repairs: pine/forest tree fields, brown town roofs, solid sand line,
 # yellow sun core, ash masonry and grouped silver clouds each exceed 25 cells.
 b=out[400]
 b.rect(17,5,21,11,'brown');b.rect(24,7,25,13,'ash')
 b.rect(12,23,16,28,'forest');b.rect(12,23,16,25,'pine')
 return out


def polish3(out):
 add={
 374:[('brown','sage',(0,24,12,32)),('stone','sand',(34,31,46,38))],
 383:[('stone','slate',(0,9,10,18)),('ash','umber',(0,41,22,47)),('bronze','ivory',(32,13,40,21))],
 388:[('olive','forest',(10,25,24,33)),('cerulean','silver',(0,8,47,10))],
 394:[('indigo','gold',(0,9,18,13))],
 398:[('stone','white',(0,34,12,42)),('graphite','brown',(3,39,12,46))],
 402:[('silver','white',(0,20,16,26))],
 403:[('stone','moss',(1,31,15,41))],
 407:[('graphite','navy',(34,31,47,47)),('stone','silver',(0,14,20,20))],
 408:[('navy','graphite',(12,35,24,45))],
 409:[('bronze','lime',(0,28,16,34)),('lavender','white',(0,11,14,15))],
 410:[('ash','moss',(8,12,16,27)),('slate','teal',(0,15,47,20)),('navy','plum',(0,8,47,13))],
 }
 for i,regions in add.items():
  for source,target,box in regions:material(out[i],source,target,box)
 for i,b in out.items():
  if i==372:b.rect(10,24,14,30,None)
  if i==376:
   for y in range(22,40):
    for x in (18,19):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==377:b.line([(9,28),(24,35)],None,2)
  if i==378:b.rect(11,20,13,23,None)
  if i==381:b.rect(30,39,35,40,None)
  if i==382:b.rect(24,27,27,29,None)
  if i==385:b.rect(0,7,8,7,None)
  if i==386:b.rect(2,36,10,38,None)
  if i==389:b.rect(0,42,9,43,'stone')
  if i==392:b.rect(2,20,5,21,None)
  if i==393:b.rect(40,29,44,29,None)
  if i==394:b.rect(10,39,14,39,'navy')
  if i==395:b.rect(16,5,47,5,None);b.rect(0,6,29,6,None)
  if i==400:b.rect(8,26,9,26,None)
  if i==402:
   for y in range(34,40):
    for x in range(23,29):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==404:
   for y in range(0,20):
    for x in range(0,20):
     if b.cells[y][x] is None:b.put(x,y,'navy')
  if i==407:
   need=90
   for y in range(20,48):
    for x in range(0,48):
     if need and b.cells[y][x] is None and x not in range(23,28):b.put(x,y,'navy');need-=1
  if i==408:b.rect(39,40,46,40,None)
  if i==410:
   for y in range(40,48):
    for x in range(48):
     if b.cells[y][x] is None and (x+y)%4==0:b.put(x,y,'navy')
 # Final bounded material and negative-space adjustments.
 for i,source,target,box in [
  (374,'silver','white',(17,11,31,19)),
  (384,'plum','mauve',(0,18,12,27)),
  (388,'ash','graphite',(0,43,22,47)),
  (398,'stone','forest',(0,20,13,27)),
  (402,'silver','sage',(0,10,47,13)),
  (403,'ash','bronze',(0,29,20,37)),
  (407,'cerulean','teal',(0,0,47,3)),
  (407,'slate','verdigris',(36,26,47,39)),
  (410,'verdigris','teal',(0,19,47,24)),
  (398,'ash','brown',(37,12,47,20)),
  (407,'silver','ice',(0,0,47,3)),
 ]:material(out[i],source,target,box)
 for i,b in out.items():
  if i==371:
   for x in range(16):
    if b.cells[0][x] is None:b.put(x,0,'navy')
  if i==372:b.rect(0,39,4,42,None)
  if i==378:b.rect(11,28,12,30,None)
  if i==382:b.rect(21,31,24,31,None);b.rect(14,30,15,30,None);b.rect(26,31,27,31,None);b.rect(19,29,20,29,None)
  if i==389:
   for x in range(5):
    if b.cells[0][x] is None:b.put(x,0,'indigo')
  if i==395:b.rect(0,7,31,7,None)
  if i==404:b.rect(10,25,13,25,None)
  if i==407:
   for x in (21,22,28,29):
    if b.cells[47][x] is None:b.put(x,47,'navy')
 # Restore a strongly silhouetted face after the broad fog/material passes.
 b=out[402]
 b.poly([(2,9),(9,6),(15,6),(20,10),(21,15),(25,18),(22,21),(24,24),(19,29),(11,32),(3,29)],'graphite')
 b.poly([(4,10),(10,8),(15,8),(18,11),(19,17),(22,19),(19,21),(21,24),(17,27),(11,29),(5,27)],'ash')
 b.line([(5,10),(15,8)],'silver',2)
 b.line([(12,17),(18,18)],'graphite',2)
 b.put(16,18,'gold')
 b.line([(19,24),(22,24)],'ivory',2)
 b.line([(5,27),(11,30)],'moss',2)
 # The sea falls away at two lower corners, keeping the whirlpool in its density band.
 b=out[403]
 b.rect(0,42,4,47,None)
 b.rect(43,44,47,45,None)
 # Preserve every used material as a visible region, not a handful of specks.
 for i,b in out.items():
  while True:
   pops={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
   rare=[(n,c) for c,n in pops.items() if n<25]
   if not rare:break
   n,c=min(rare)
   members=[(x,y) for y in range(48) for x in range(48) if b.cells[y][x]==c]
   options=[]
   for x,y in members:
    for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
     if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] not in (None,c) and pops[b.cells[yy][xx]]>30:
      options.append((abs(xx-sum(a for a,_ in members)/n)+abs(yy-sum(a for _,a in members)/n),yy,xx))
   if not options:
    for x,y in members:
     for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
      if 0<=xx<48 and 0<=yy<48 and b.cells[yy][xx] is None:options.append((abs(xx-sum(a for a,_ in members)/n)+abs(yy-sum(a for _,a in members)/n),yy,xx))
   if not options:raise RuntimeError(f'Cannot grow color {i}/{c}/{n}')
   _,yy,xx=min(options);b.put(xx,yy,c)
 return out

if __name__=='__main__':
 root=Path('/Users/andres/Desktop/pixel-arcadia-design-351-500');names={38:'SACRED_MOUNTAINS',39:'BIO_MECHANICAL_REALM',40:'PARALLEL_EARTH',41:'FORGOTTEN_SEAS'};titles={}
 for w,name in names.items():
  for i,t in re.findall(r'^## (\d+) — (.+)$',(root/f'WORLD_{w}_{name}.md').read_text(),re.M):titles[int(i)]=re.sub(r' \*\(.+?\)\*','',t).strip()
 result=[]
 for i,b in boards().items():
  rows=b.rows();used=set(''.join(rows))-{'.'};counts={c:sum(row.count(c) for row in b.cells) for c in set(sum(b.cells,[])) if c}
  result.append(dict(id=i,title=titles[i],grid=rows,legend={c:LEGEND[c] for c in sorted(used)}));print(i,sum(counts.values()),len(counts),min(counts.values()))
 Path('dist/m16d').mkdir(parents=True,exist_ok=True);Path('dist/m16d/art.json').write_text(json.dumps(result,indent=2)+'\n')
