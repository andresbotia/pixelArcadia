"""Individually drawn, deterministic 48×48 M16B production artwork.
Raster primitives are offline authoring tools; no runtime image generation.
"""
import importlib.util
import json
import math
import re
from pathlib import Path

spec = importlib.util.spec_from_file_location('m16a_art', Path(__file__).with_name('m16a-art.py'))
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)
art.ENCODE['cerulean'] = 'p'
art.ENCODE['silver'] = 'k'
Board = art.Board
LEGEND = {**art.LEGEND, 'p': 'cerulean', 'k': 'silver'}
DESIGN = art.DESIGN

def corners(b, n):
    # True dark sky / rounded framing corners, never a substitute for light.
    b.poly([(0,0),(n,0),(0,n)],None)
    b.poly([(48,0),(48,n),(48-n,0)],None)

def sky(colors=('ultramarine','indigo','amethyst'), rows=(0,15,33,48)):
    b=Board(colors[0]); b.bands(colors,rows); return b

def loop(b,cx,cy,rx,ry,c,w=2,angle=0):
    t=math.radians(angle)
    points=[]
    for i in range(97):
        a=i*math.tau/96; x=rx*math.cos(a); y=ry*math.sin(a)
        points.append((cx+x*math.cos(t)-y*math.sin(t),cy+x*math.sin(t)+y*math.cos(t)))
    b.line(points,c,w)

def rim(b,points,body='navy',edge='silver',w=2):
    b.poly(points,body);b.line(points+[points[0]],edge,w)

def stars(b,points):
    for i,(x,y) in enumerate(points):b.rect(x,y,x+1,y+1,'white' if i%2 else 'ice')

def gear(b,cx,cy,r):
    b.ellipse(cx-r,cy-r,cx+r,cy+r,'umber')
    b.ellipse(cx-r+2,cy-r+2,cx+r-2,cy+r-2,'bronze')
    for a in range(0,360,45):
        t=math.radians(a);x=cx+r*math.cos(t);y=cy+r*math.sin(t)
        b.rect(round(x)-1,round(y)-1,round(x)+1,round(y)+1,'verdigris')
        b.line([(cx,cy),(cx+(r-2)*math.cos(t),cy+(r-2)*math.sin(t))],'gold',1)
    b.ellipse(cx-2,cy-2,cx+2,cy+2,'silver');b.put(cx,cy,'graphite')

def ruin():
    b=sky(('lavender','sage','slate'),(0,9,32,48));b.rect(0,0,47,1,None)
    b.poly([(0,41),(14,36),(32,42),(48,37),(48,48),(0,48)],'sand')
    b.line([(0,43),(14,39),(32,45),(47,40)],'umber',2);return b

def flower(b,cx,cy,r,petal,center,leaf=True):
    if leaf:
        b.ellipse(cx-r-3,cy,cx-r+3,cy+4,'green');b.ellipse(cx+r-3,cy,cx+r+3,cy+4,'forest')
    for a in range(0,360,60):
        t=math.radians(a);x=cx+math.cos(t)*r*.63;y=cy+math.sin(t)*r*.63
        b.ellipse(round(x)-3,round(y)-3,round(x)+3,round(y)+3,petal)
    b.ellipse(cx-2,cy-2,cx+2,cy+2,center)

def boards():
    out={}
    # Cosmic beings: rim-defined silhouettes against quiet painted night fields.
    b=sky();corners(b,11)
    rim(b,[(3,47),(2,21),(5,13),(7,8),(13,6),(17,10),(16,17),(14,21),(18,34),(16,47)])
    b.line([(8,17),(8,29),(12,44)],'indigo',3)
    b.ellipse(8,1,23,14,'silver');b.ellipse(12,0,24,10,'ultramarine')
    b.line([(16,20),(23,15),(42,18),(46,44),(21,44),(23,15)],'gold',2)
    for x in [24,29,34,39,43]:b.line([(x,18),(x-2,42)],'silver',2)
    for y in [25,31,37]:b.line([(23,y),(43,y+2)],'lavender',2)
    b.rect(21,40,45,47,'teal');b.poly([(21,47),(29,41),(35,46),(41,42),(46,48)],'sage')
    b.rect(24,19,25,22,None);b.rect(31,20,32,24,None);b.rect(37,27,38,30,None)
    stars(b,[(5,28),(12,35),(25,26),(34,33)]);out[291]=b
    b=sky();corners(b,9)
    rim(b,[(0,42),(5,31),(11,31),(18,23),(24,18),(27,10),(30,16),(35,11),(39,14),(36,18),(40,21),(34,24),(27,27),(25,33),(30,42),(27,45),(21,35),(14,35),(9,44),(5,46),(7,35),(2,45)])
    b.poly([(23,21),(23,10),(30,20),(28,27),(20,30)],'purple');b.line([(23,11),(27,20),(21,29)],'magenta',3)
    b.line([(0,36),(8,28),(17,29)],'lavender',3)
    b.ellipse(35,0,47,12,'orange');b.ellipse(37,1,47,10,'gold');b.ellipse(39,2,47,8,'yellow');b.rect(42,3,45,5,'white')
    b.rect(37,13,40,15,None);b.poly([(11,36),(20,36),(16,42),(9,45)],None)
    stars(b,[(11,31),(21,25),(29,20),(7,40)]);b.line([(2,43),(9,36)],'cerulean',2);out[292]=b
    b=sky();corners(b,10)
    b.ellipse(0,35,47,65,'teal');b.line([(0,42),(15,36),(31,36),(47,42)],'sage',3);b.rect(0,45,47,47,'verdigris')
    loop(b,28,22,15,6,'gold',3,-12);loop(b,28,16,17,9,'silver',2,-30);loop(b,28,17,7,16,'ice',2,32)
    loop(b,28,17,16,6,'white',2,45)
    for x,y,c in [(13,15,'coral'),(30,3,'amethyst'),(41,18,'cerulean'),(24,28,'yellow'),(34,12,'teal')]:
        b.ellipse(x-2,y-2,x+2,y+2,c)
    for x,y in [(5,37),(12,34),(19,35)]:b.rect(x,y,x+3,y+5,'graphite');b.rect(x+1,y+1,x+2,y+2,'gold')
    b.rect(22,10,25,14,None);b.rect(33,22,36,26,None);b.rect(15,21,18,25,None);out[293]=b
    b=sky();corners(b,7)
    rim(b,[(0,47),(0,24),(5,16),(7,17),(6,27),(10,29),(10,15),(13,13),(15,16),(14,30),(18,34),(23,40),(25,47)],edge='gold')
    rim(b,[(24,47),(26,38),(33,33),(33,20),(35,16),(38,17),(38,30),(41,28),(42,21),(46,20),(48,26),(48,48)],edge='gold')
    b.ellipse(14,16,35,36,'amethyst');loop(b,25,26,9,8,'lavender',3,-20)
    b.line([(17,29),(19,21),(28,20),(32,26),(28,31),(23,29),(23,25),(27,25)],'magenta',3)
    b.ellipse(23,24,27,28,'white');b.rect(26,25,28,27,'ice')
    b.rect(7,22,8,26,None);b.rect(38,21,39,25,None)
    b.line([(2,45),(12,39),(18,43)],'cerulean',2);b.line([(35,42),(43,39),(47,42)],'mauve',2)
    b.line([(2,33),(7,37),(17,44)],'silver',2);b.line([(44,34),(36,38),(29,44)],'silver',2)
    stars(b,[(5,42),(38,43)]);out[294]=b
    b=sky(('navy','indigo','amethyst'));corners(b,8)
    b.ellipse(3,4,32,43,'silver');b.ellipse(6,5,30,41,'ivory');b.ellipse(13,4,38,37,'navy')
    b.poly([(19,11),(18,18),(22,21),(19,23),(21,25),(18,28),(20,32),(16,36),(14,32),(15,22)],'ice')
    b.line([(16,19),(19,20)],'stone',2)
    b.line([(22,38),(29,35),(37,39),(47,36)],'lavender',8);b.line([(26,38),(36,40),(47,38)],'white',3)
    b.ellipse(32,0,45,13,None);out[295]=b
    b=sky();corners(b,3)
    rim(b,[(10,35),(10,11),(14,3),(24,0),(35,5),(38,15),(38,35)],'purple')
    for x,y in [(17,11),(31,12),(13,25),(34,26)]:loop(b,x,y,5,6,'silver',2);b.ellipse(x-2,y-3,x+2,y+3,'rose')
    b.rect(15,22,33,32,'magenta');b.rect(11,27,16,34,'mauve');b.rect(32,27,38,34,'mauve')
    b.ellipse(23,14,26,17,None);b.poly([(23,19),(26,19),(28,25),(26,29),(27,31),(22,31),(22,28),(21,24)],None)
    for y,x,c in [(34,7,'stone'),(39,3,'silver'),(44,0,'gold')]:b.rect(x,y,47-x,y+4,c);b.line([(x,y),(47-x,y)],'white',1)
    b.rect(12,26,14,28,'gold');b.rect(34,26,36,28,'gold');out[296]=b
    b=sky(('rose','coral','indigo'));corners(b,7)
    loop(b,24,11,11,10,'coral',2);loop(b,24,11,9,8,None,1)
    b.ellipse(17,4,31,18,'gold');b.ellipse(19,5,29,15,'yellow');b.ellipse(22,7,27,12,'white')
    rim(b,[(17,47),(13,34),(17,23),(24,20),(31,25),(34,38),(30,48)],'ultramarine','gold')
    b.poly([(15,28),(0,25),(3,38),(17,42)],'cerulean');b.poly([(31,28),(43,26),(47,36),(33,42)],'ice')
    b.line([(17,30),(3,28),(8,37)],'silver',2);b.line([(32,31),(43,29),(40,38)],'silver',2)
    b.line([(17,26),(12,17),(15,10)],'bronze',3);b.line([(31,26),(35,18),(33,10)],'bronze',3)
    b.line([(24,23),(24,47)],'gold',2);b.line([(18,36),(31,36)],'verdigris',3)
    b.rect(8,17,10,20,None);b.rect(37,18,39,22,None);out[297]=b
    b=sky();corners(b,6)
    rim(b,[(0,47),(4,30),(10,28),(8,24),(3,22),(8,19),(7,13),(12,7),(21,6),(24,13),(23,26),(25,47)])
    rim(b,[(24,47),(24,13),(28,6),(36,7),(40,13),(40,18),(46,22),(40,24),(38,29),(44,35),(48,48)],'orange','gold')
    b.line([(16,12),(18,24),(12,34),(19,46)],'lavender',4)
    b.line([(31,12),(29,26),(37,35),(30,47)],'yellow',4)
    b.line([(18,28),(30,33),(23,39),(31,44)],'silver',2);b.line([(33,27),(20,32),(26,41)],'gold',2)
    b.ellipse(10,3,17,11,'silver');b.ellipse(13,2,19,8,'ultramarine')
    b.poly([(28,8),(27,2),(31,5),(34,1),(37,6),(40,3),(38,11)],'yellow')
    b.rect(1,11,4,18,None);b.rect(43,11,46,17,None);stars(b,[(10,37),(32,32),(20,21)]);out[298]=b
    b=sky();corners(b,5)
    b.line([(0,15),(7,7),(23,2),(38,5),(47,13)],'cerulean',9)
    b.line([(0,12),(9,5),(25,1),(39,4),(47,10)],'gold',2)
    for x,y in [(2,20),(14,16),(29,18),(41,21)]:
        b.ellipse(x,y,x+5,y+5,'silver');b.ellipse(x+1,y+1,x+4,y+4,'navy')
        rim(b,[(x,27),(x+5,25),(x+7,38),(x+6,43),(x-1,43),(x-2,35)],'navy')
        b.line([(x+1,y+8),(x-1,y-4),(x+2,y-8)],'silver',2)
        b.line([(x+4,y+8),(x+7,y-5)],'gold',2)
    b.rect(0,44,47,47,'teal');b.line([(0,44),(16,42),(32,44),(47,42)],'sage',2)
    for x,y in [(10,25),(23,31),(36,27)]:b.rect(x,y,x+2,y+5,None)
    stars(b,[(11,10),(23,5),(37,10),(22,23)]);out[299]=b
    b=sky(('ultramarine','indigo','blue'),(0,17,34,48))
    b.ellipse(34,0,47,15,'purple');b.ellipse(37,3,47,12,'magenta');b.rect(43,4,47,8,'mauve')
    b.line([(0,11),(7,5),(17,2),(27,4),(34,9)],'amethyst',6)
    b.line([(0,9),(8,3),(17,1),(27,3),(34,7)],'lavender',3)
    b.line([(5,5),(15,2),(24,3)],'ice',2)
    rim(b,[(7,39),(5,28),(9,20),(15,17),(23,18),(28,23),(34,18),(34,11),(38,10),(39,20),(31,28),(30,33),(36,36),(36,41),(28,42),(24,36),(18,35),(14,41)],w=2)
    b.line([(9,24),(14,29),(11,36)],'indigo',3);b.line([(21,22),(23,30),(30,35)],'indigo',4)
    b.line([(7,38),(10,40),(15,38),(18,34)],'gold',2)
    b.ellipse(13,8,24,18,'gold');b.ellipse(15,9,22,16,'yellow');b.ellipse(16,10,21,15,None)
    b.rect(17,8,19,9,'white')
    b.poly([(29,21),(32,19),(32,23),(30,26)],None)
    b.ellipse(21,29,30,37,'gold');b.ellipse(23,30,28,35,'teal');b.rect(26,31,28,33,'verdigris')
    stars(b,[(11,23),(18,29),(26,24),(16,33)])
    b.rect(0,42,47,47,'stone');b.line([(0,42),(34,42)],'silver',2);b.line([(0,46),(34,46)],'gold',2)
    b.line([(38,14),(44,22),(40,30),(44,38),(40,47)],'cerulean',7)
    b.line([(38,15),(42,23),(39,30),(42,37),(39,46)],'ice',3)
    b.line([(39,19),(41,25),(40,31),(42,36)],'white',2)
    b.rect(33,39,37,45,'ivory');b.poly([(32,39),(35,36),(39,39)],'gold');b.rect(35,42,36,44,'red')
    b.rect(0,0,1,1,None);b.rect(32,0,34,1,None);b.rect(3,10,4,12,None)
    out[300]=b
    # Excavated stone housings with bronze/verdigris mechanisms.
    b=ruin();b.rect(0,0,47,1,'lavender');corners(b,4);b.poly([(2,5),(36,5),(45,15),(44,44),(2,44)],'stone')
    b.poly([(40,5),(47,5),(47,13),(44,11)],None)
    b.rect(5,10,39,39,'graphite');b.rect(8,13,36,37,'slate')
    gear(b,15,24,10);gear(b,31,19,7);gear(b,34,35,5)
    loop(b,13,9,7,5,'ivory',2);b.line([(13,9),(16,6)],'gold',2)
    b.rect(4,32,7,38,'verdigris');b.rect(29,8,34,11,'sage');b.rect(12,20,14,22,'teal')
    b.line([(3,42),(11,42),(11,39)],'umber',1);out[301]=b
    b=ruin();corners(b,7);b.rect(33,2,42,47,'stone');b.rect(36,4,38,43,'verdigris')
    for i in range(5):
        x=2+i*5;y=5+i*8
        b.rect(x,y,x+12,y+5,'ivory');b.rect(x+1,y+2,x+10,y+3,'slate');b.rect(x+8,y+4,x+14,y+5,'bronze')
        b.line([(x+13,y+5),(x+13,y+8),(x+6,y+8)],'ice',2)
        b.rect(39,y+1,41,y+3,'gold')
    b.rect(15,12,17,16,None);b.rect(20,21,22,25,None);b.rect(25,30,27,34,None)
    b.rect(34,44,41,46,'teal');out[302]=b
    b=ruin();b.rect(0,0,47,1,'lavender');corners(b,7);b.rect(2,3,16,44,'stone');b.rect(4,5,6,40,'ivory')
    b.rect(8,18,16,22,None);b.line([(10,28),(39,17)],'bronze',3);b.line([(10,28),(41,30)],'gold',3);b.line([(10,28),(39,40)],'bronze',3)
    b.ellipse(33,25,46,37,'orange');b.ellipse(35,26,44,34,'yellow');b.rect(0,33,47,35,'olive')
    loop(b,11,10,3,3,'slate',1);b.line([(18,4),(24,5)],'silver',2);b.line([(29,9),(33,10)],'lavender',2)
    b.ellipse(8,26,13,31,'umber');b.rect(9,27,11,29,'silver');b.line([(20,43),(31,41),(47,44)],'rose',2);out[303]=b
    b=ruin();b.rect(0,0,47,1,'lavender');corners(b,5)
    b.ellipse(3,21,35,40,'stone');b.ellipse(30,21,41,35,'slate');b.line([(39,26),(43,31),(43,40),(39,42)],'stone',4)
    for x in [5,13,25,33]:b.rect(x,35,x+4,47,'stone');b.line([(x,45),(x+4,45)],'bronze',2)
    b.ellipse(25,23,33,33,'ivory');b.rect(10,27,27,37,'graphite');gear(b,17,32,5);b.rect(23,29,26,35,'teal')
    b.rect(12,7,29,22,'ivory');b.rect(15,10,26,17,'garnet');b.rect(13,18,28,21,'gold')
    b.ellipse(12,2,29,10,'verdigris');b.rect(12,7,29,9,'bronze')
    b.rect(19,0,22,3,'gold');b.rect(40,27,41,28,'umber')
    b.rect(17,40,23,42,None);b.rect(4,7,7,11,'lavender')
    b.line([(5,24),(20,22),(28,24)],'silver',2);out[304]=b
    b=sky(('lavender','cerulean','navy'),(0,22,36,48));corners(b,12)
    b.rect(5,21,16,47,'stone');b.rect(7,25,10,45,'slate');b.rect(3,21,18,23,'silver')
    b.ellipse(0,3,26,25,'bronze');b.ellipse(5,2,29,21,'lavender')
    b.line([(3,8),(8,18),(17,23),(24,21)],'gold',3)
    b.line([(6,5),(12,15),(21,20)],'umber',2);b.ellipse(15,15,19,19,'white')
    b.line([(18,17),(47,18)],'yellow',3);b.line([(21,18),(47,19)],'ice',1)
    b.line([(18,41),(28,39),(37,43),(47,40)],'ice',2)
    b.ellipse(35,-3,45,6,None);out[305]=b
    b=ruin();b.rect(0,0,47,1,'lavender');corners(b,4)
    b.poly([(0,47),(0,37),(6,37),(6,28),(12,28),(12,19),(19,19),(19,10),(24,4),(30,11),(30,18),(37,18),(37,27),(43,27),(43,37),(48,37),(48,48)],'stone')
    for y,x in [(19,12),(28,6),(37,0)]:b.line([(x,y),(24,y)],'ivory',2)
    b.rect(25,17,42,42,'graphite');b.rect(28,20,29,27,None);b.rect(39,20,40,28,None)
    b.line([(29,19),(29,31)],'bronze',1);b.rect(28,27,30,30,'gold');gear(b,32,35,8)
    b.rect(25,44,44,46,'slate');b.rect(31,34,34,37,'teal');out[306]=b
    b=ruin();b.rect(0,0,5,47,'stone');b.rect(43,0,47,47,'stone');b.rect(0,0,47,3,'graphite')
    b.rect(19,0,26,3,None);b.poly([(20,4),(25,4),(29,29),(14,29)],'lavender')
    loop(b,24,24,18,17,'bronze',3,17);loop(b,24,24,7,18,'gold',3,-28);loop(b,24,24,17,7,'verdigris',3,23)
    b.ellipse(19,19,29,29,'teal');b.ellipse(22,21,27,26,'cyan');b.rect(23,21,24,23,'white')
    for x,y in [(10,10),(32,8),(9,33),(34,33)]:b.rect(x,y,x+3,y+5,None)
    b.line([(0,45),(47,45)],'silver',2);out[307]=b
    b=ruin();b.rect(0,0,47,1,'lavender');corners(b,4)
    b.poly([(5,47),(8,36),(10,22),(16,17),(15,7),(21,1),(28,3),(32,9),(31,18),(38,23),(42,46)],'stone')
    b.poly([(5,47),(8,36),(10,22),(16,17),(15,7),(21,1),(23,10),(21,17),(26,22),(21,31),(25,38),(22,47)],'graphite')
    gear(b,17,27,7);gear(b,17,10,5);gear(b,15,40,6)
    b.line([(23,18),(21,27),(24,36),(23,46)],'silver',2)
    b.ellipse(23,25,29,31,'gold');b.ellipse(24,26,28,30,'teal')
    b.line([(28,9),(31,10)],'slate',1);b.line([(27,15),(30,15)],'slate',1)
    b.line([(5,18),(9,21)],'sage',2);b.line([(39,11),(42,17)],'silver',2);b.line([(30,32),(33,41),(40,42)],'ivory',2);out[308]=b
    b=ruin();b.rect(0,0,47,1,'lavender');corners(b,3);b.rect(0,7,47,47,'stone')
    for j,(x,y) in enumerate([(1,15),(5,9),(9,17),(14,8),(18,13),(23,6),(27,14),(31,10),(36,17),(40,7),(44,13)]):
        b.rect(x,y,x+2,39,'slate');b.rect(x,y,x+2,y+1,None);b.rect(x,y+3,x+2,y+4,'bronze')
        if j%3==0:b.line([(x+1,y+7),(x+1,35)],'ivory',1)
    for x in [4,19,34]:b.ellipse(x,37,x+7,44,'graphite');b.rect(x+2,40,x+4,42,None)
    b.poly([(34,43),(48,38),(48,48),(28,48)],'cerulean');b.line([(32,46),(41,42),(47,43)],'white',2)
    b.rect(12,1,14,2,'white');b.rect(30,2,32,3,'ice');out[309]=b
    b=Board('sand');b.bands(['lavender','coral','sand','stone','graphite','slate'],[0,4,8,12,23,35,48])
    b.line([(0,10),(15,8),(31,11),(47,8)],'brown',2)
    b.poly([(3,7),(7,3),(12,7)],'ivory');b.poly([(32,7),(37,4),(42,7)],'orange')
    b.line([(18,3),(18,11),(26,11),(26,3),(18,3)],'umber',1);b.rect(20,10,23,19,None)
    for x in [6,17,32,42]:gear(b,x,17,5)
    b.rect(0,22,47,24,'umber')
    for x in [4,13,22,31,40]:
        b.rect(x,25,x+5,33,'bronze');b.rect(x,25,x+5,26,'silver');b.rect(x,30,x+5,31,'gold')
    b.rect(0,34,47,36,'stone');b.rect(22,38,39,46,'graphite');loop(b,30,42,7,4,'verdigris',2)
    b.ellipse(27,39,34,45,'teal');b.ellipse(29,40,32,43,'cyan');b.rect(30,40,31,41,'white')
    b.rect(8,39,11,45,None);b.rect(43,38,45,43,None);b.rect(0,0,2,1,None);b.rect(8,39,11,45,'slate');b.rect(43,38,45,43,'slate')
    out[310]=b
    # Revised festival scenes: large connected forms, no confetti vocabulary.
    b=sky(('cerulean','lavender','graphite'),(0,19,39,48));b.rect(0,0,47,2,None)
    for x in [0,41]:
        b.rect(x,3,x+6,38,'ivory');b.line([(x+5,4),(x+5,36)],'stone',1)
        for y in [7,20,31]:b.rect(x+2,y,x+3,y+3,None)
    b.ellipse(15,7,34,27,'yellow');b.ellipse(20,11,28,19,'white')
    b.ellipse(5,20,27,38,'magenta');b.ellipse(8,22,19,30,'pink');b.rect(7,31,24,39,'magenta')
    b.ellipse(25,22,42,39,'cyan');b.ellipse(29,25,39,32,'seafoam');b.rect(28,33,40,39,'cyan')
    b.rect(0,39,47,45,'umber')
    for x in [2,9,16,24,32,40]:b.ellipse(x,36,x+4,41,'umber')
    b.rect(0,46,47,47,'stone');out[311]=b
    b=sky(('cerulean','cerulean','ivory'),(0,16,39,48));b.rect(0,0,47,3,None);b.rect(0,4,5,7,None)
    b.ellipse(3,12,20,23,'red');b.poly([(4,16),(0,12),(0,24),(5,20)],'orange');b.rect(16,14,18,16,'white')
    b.line([(9,13),(9,22)],'gold',2)
    for i in range(5):
        x=24+i*5;y=6+(i%2)*3;b.ellipse(x,y,x+4,y+5,'purple');b.ellipse(x+1,y+1,x+3,y+4,'yellow')
    for x,y,c in [(24,27,'blue'),(39,26,'magenta')]:
        b.poly([(x,y-6),(x+5,y),(x,y+6),(x-5,y)],c);b.line([(x-3,y),(x+3,y)],'white',1)
        b.line([(x,y+5),(x-2,39)],'stone',1)
    b.line([(12,23),(14,38)],'ivory',1)
    for x,y,c in [(0,38,'coral'),(10,37,'brown'),(22,36,'coral'),(34,38,'brown')]:b.poly([(x,y),(x+5,y-5),(x+10,y),(x+10,41),(x,41)],c)
    b.rect(0,43,47,45,'green');b.rect(0,46,47,47,'forest');out[312]=b
    b=Board('stone');b.rect(0,0,9,47,'brown');b.rect(38,0,47,47,'coral')
    b.rect(10,0,12,47,'magenta');b.rect(35,0,37,47,'purple')
    for y in [8,24,40]:b.line([(0,y),(8,y)],'umber',1);b.line([(39,y+4),(47,y+4)],'maroon',1)
    for x,y in [(2,17),(3,39),(42,29)]:b.rect(x,y,x+3,y+4,None)
    flower(b,23,8,7,'red','yellow');flower(b,24,23,7,'orange','white');flower(b,23,38,7,'pink','gold')
    b.rect(22,45,27,47,'ivory');out[313]=b
    b=sky(('lavender','rose','coral'),(0,17,32,48));b.rect(0,0,47,2,None);b.rect(0,39,47,47,'sand')
    for x,y in [(7,7),(31,11)]:
        b.ellipse(x,y,x+7,y+7,'gold');b.rect(x+3,y+7,x+5,y+9,'bronze')
        b.poly([(x-2,y+10),(x+10,y+10),(x+7,y+24),(x+10,39),(x-3,39),(x,y+24)],'gold')
        for yy in range(y+12,39,5):b.line([(x,yy),(x+7,yy)],'bronze',2)
        b.rect(x+2,y+16,x+4,y+18,None)
        b.line([(x,y+12),(x-4,y+9),(x-4,y+1)],'gold',3)
        b.line([(x+8,y+12),(x+11,y+5)],'gold',3)
    b.line([(12,24),(23,27),(34,24)],'red',3);b.line([(13,29),(24,24),(33,27)],'cyan',3)
    b.line([(19,10),(21,37)],'umber',2);b.ellipse(17,5,23,11,'ivory');b.ellipse(20,4,24,8,'lavender')
    b.rect(8,7,15,8,'olive');b.rect(32,11,38,12,'yellow');out[314]=b
    b=sky(('blush','blush','green'),(0,21,40,48));corners(b,14)
    b.rect(0,45,47,47,'forest');b.rect(21,6,23,42,'ivory')
    for x,c in zip([1,7,13,18,27,33,39,46],['red','orange','yellow','lime','cyan','blue','purple','magenta']):
        b.line([(22,7),(x,37)],c,2);b.rect(max(0,x-1),37,min(47,x+1),41,'ivory')
    b.ellipse(17,3,26,8,'pink');b.rect(20,4,23,6,'gold');out[315]=b
    b=sky(('navy','navy','white'),(0,20,41,48));b.rect(0,0,47,1,None)
    b.rect(2,12,17,40,'white')
    for x,y in [(2,9),(8,5),(14,10)]:b.rect(x,y,x+3,16,'ice')
    b.rect(5,20,14,34,'magenta');b.rect(7,23,12,31,'pink');b.rect(8,35,11,40,None)
    b.ellipse(20,10,40,24,'ice');b.poly([(38,16),(46,9),(46,25),(38,21)],'ice');b.ellipse(24,13,35,20,'cyan');b.rect(23,15,24,16,'graphite')
    b.ellipse(27,29,44,37,'white');b.ellipse(23,27,30,34,'white');b.ellipse(23,25,26,28,'ice');b.ellipse(27,25,30,28,'white')
    for x in [26,31,38,42]:b.rect(x,35,x+2,40,'white')
    b.ellipse(32,31,42,35,'lavender');b.rect(24,30,25,31,'navy')
    b.rect(0,42,47,44,'slate');out[316]=b
    b=Board('navy');b.rect(0,0,47,2,None)
    for x,y,c in [(0,3,'gold'),(4,7,'magenta'),(8,11,'cyan'),(12,15,'orange'),(16,19,'purple'),(20,23,'yellow')]:
        b.line([(x,47),(x,y+6),(x+4,y),(47-x-4,y),(47-x,y+6),(47-x,47)],c,3)
        if x<13:
            for xx in [x+6,23,41-x]:b.rect(xx,y,xx+1,y+1,'white')
    b.poly([(23,30),(27,30),(43,48),(6,48)],'stone');b.line([(25,31),(24,47)],'slate',3)
    b.rect(23,25,26,30,'white');out[317]=b
    b=Board('cerulean');b.poly([(0,36),(13,21),(28,21),(36,3),(48,3),(48,48),(0,48)],'coral');corners(b,5)
    b.line([(3,46),(20,44),(17,34),(33,31),(23,23),(39,20),(38,7)],'ivory',3)
    for x,y,c,d,a in [(1,33,'gold','orange','white'),(14,31,'cyan','blue','yellow'),(32,29,'magenta','lime','ivory'),(9,16,'red','yellow','white'),(32,4,'pink','purple','white')]:
        b.rect(x,y,x+12,y+11,c);b.rect(x,y,x+12,y+2,d)
        b.rect(x+2,y+4,x+4,y+5,None);b.rect(x+8,y+4,x+10,y+5,None)
        b.rect(x+4,y+8,x+8,y+9,a)
    out[318]=b
    b=sky(('rose','rose','stone'),(0,24,36,48));b.rect(0,0,47,1,None);b.rect(0,3,7,39,'ivory');b.rect(2,9,4,13,None);b.rect(2,25,4,29,None)
    for cx,top,rx,h,cs in [(11,20,4,11,['lime','green','yellow']),(20,15,5,17,['cyan','blue','white']),(30,11,6,23,['magenta','pink','purple']),(40,6,7,30,['orange','red','yellow'])]:
        b.ellipse(cx-rx,top,cx+rx,top+h,cs[0]);b.ellipse(cx-rx+2,top+3,cx+rx-2,top+h-2,cs[1]);b.ellipse(cx-2,top+6,cx+2,top+h-3,cs[2])
        y=top+h-6;b.rect(cx-1,y,cx+1,y+2,'umber');b.rect(cx-2,y+3,cx+2,y+7,'gold')
        b.line([(cx-2,y+7),(cx-2,y+11)],'umber',2);b.line([(cx+2,y+7),(cx+3,y+11)],'umber',2)
    out[319]=b
    b=sky(('navy','navy','indigo'),(0,21,34,48))
    b.ellipse(-14,28,62,104,'teal');b.poly([(25,28),(48,32),(48,48),(25,48)],'indigo')
    b.line([(0,43),(12,39),(22,42)],'sage',3);b.line([(28,41),(38,38),(47,41)],'blue',3)
    b.line([(0,23),(9,20),(21,26),(33,20),(47,16)],'lime',3);b.line([(4,23),(15,22),(27,26)],'seafoam',2)
    for cx,cy,c in [(10,10,'magenta'),(25,8,'gold'),(40,10,'cyan')]:
        for a in range(0,360,45):
            t=math.radians(a);b.line([(cx+3*math.cos(t),cy+3*math.sin(t)),(cx+6*math.cos(t),cy+6*math.sin(t))],c,3)
        loop(b,cx,cy,3,3,c,2)
        b.ellipse(cx-1,cy-1,cx+1,cy+1,None)
    b.rect(3,34,10,39,'ivory');b.poly([(7,26),(11,30),(7,34),(3,30)],'red')
    b.rect(18,31,28,36,'stone');loop(b,23,30,5,5,'yellow',2)
    b.rect(35,33,43,38,'lavender');b.ellipse(36,29,42,35,'white');b.rect(37,33,40,35,'ice')
    out[320]=b
    # Alien life hierarchy: primary form, secondary life, painted environment.
    b=sky(('lavender','blush','sand'),(0,24,42,48));b.rect(0,0,47,3,None)
    for x,y in [(4,29),(13,25),(24,32),(35,27),(44,25)]:b.rect(x,y,x+2,43,'plum');b.ellipse(x-1,y-2,x+3,y+1,'mauve')
    b.ellipse(4,7,31,21,'lime');b.line([(7,12),(16,9),(27,12)],'plum',2);b.line([(7,17),(19,15),(28,17)],'plum',2)
    for a,z in [(10,14),(18,25),(27,36)]:b.line([(a,20),(a,26),(z,30)],'olive',2)
    for x,y in [(33,5),(36,20)]:b.ellipse(x,y,x+9,y+6,'green');b.line([(x+4,y+5),(x+6,y+13)],'olive',2)
    out[321]=b
    b=sky(('lavender','sage','olive'),(0,29,43,48));b.rect(0,0,47,1,None)
    b.line([(5,45),(10,33),(8,24),(14,20),(20,25),(16,29),(13,26)],'verdigris',3)
    for cx,cy,r in [(16,16,12),(35,33,8)]:
        for sign in [-1,1]:
            pts=[(cx+sign*2,cy),(cx+sign*r,cy-8),(cx+sign*(r-1),cy+3),(cx+sign*2,cy+4)]
            b.poly(pts,'ice');b.line(pts+[pts[0]],'rose',3)
            b.line([(cx+sign*3,cy),(cx+sign*(r-2),cy-3)],'coral',2)
            pts=[(cx+sign*2,cy+3),(cx+sign*(r-2),cy+8),(cx+sign*5,cy+12)]
            b.poly(pts,'seafoam');b.line(pts+[pts[0]],'rose',2)
        b.line([(cx,cy-6),(cx,cy+10)],'graphite',3)
        b.rect(cx-1,cy-6,cx+1,cy-4,'stone')
    corners(b,5);out[322]=b
    b=Board('seafoam');b.rect(0,0,47,1,None);b.rect(0,42,47,47,'umber')
    for cx,base,ys in [(5,43,[23,33]),(24,44,[5,13,21,29,37]),(43,43,[18,29])]:
        b.rect(cx-2,min(ys),cx+2,base,'mauve')
        for y in ys:
            r=8 if cx==24 else 5;b.ellipse(cx-r,y,cx+r,y+4,'olive');b.rect(cx-r+1,y+3,cx+r-1,y+5,'magenta')
            b.line([(cx-r+3,y+1),(cx+r-3,y+1)],'gold',1)
    out[323]=b
    b=Board(None);b.ellipse(-4,-4,51,51,'blush');b.ellipse(-1,-1,48,48,'brown')
    for x,y in [(25,4),(43,22),(31,42),(9,39),(4,14)]:
        b.line([(22,24),(x,y)],'ivory',7);b.line([(22,24),(x,y)],'sand',2)
        b.ellipse(x-3,y-3,x+3,y+3,'cerulean');b.ellipse(x-1,y-1,x+1,y+1,'coral')
    b.ellipse(16,18,28,30,'stone');b.ellipse(20,22,24,26,None)
    b.line([(8,16),(13,21),(17,20)],'sage',2);b.line([(29,32),(28,38),(32,40)],'sage',2)
    out[324]=b
    b=sky(('lavender','blush','sand'),(0,26,39,48));corners(b,15);b.rect(23,7,25,43,'plum')
    for i,(y,r) in enumerate([(3,5),(10,7),(17,9),(24,11),(31,13)]):
        cx=24+(-1 if i%2 else 1);b.poly([(cx,y),(cx+r,y+6),(cx-r,y+6)],'amethyst' if i%2==0 else 'seafoam')
    out[325]=b
    b=Board('lavender');b.rect(0,0,47,1,None)
    b.poly([(0,27),(10,24),(20,18),(33,20),(48,27),(48,48),(0,48)],'sage')
    for y in [28,38,45]:b.line([(0,y+3),(15,y),(32,y+1),(47,y+4)],'plum',4)
    for x,y in [(9,21),(24,15),(41,22)]:
        b.rect(x,y,x+2,y+7,'mauve');b.ellipse(x-4,y-6,x+6,y+1,'gold')
    b.ellipse(27,26,40,35,'olive');b.ellipse(29,28,38,34,'gold');b.rect(33,27,34,34,None)
    b.rect(0,0,47,1,'lavender');out[326]=b
    b=Board('ice');corners(b,11);b.rect(0,43,47,47,'sand');b.ellipse(8,35,27,42,'mauve');b.ellipse(1,39,24,46,'teal');b.ellipse(3,40,21,44,'seafoam')
    for i,(x,y) in enumerate([(40,43),(40,36),(39,29),(38,22),(35,16),(30,12),(24,9),(17,8),(10,10),(7,15)]):
        b.ellipse(x-4,y-4,x+4,y+4,'coral');b.ellipse(x-2,y-2,x+2,y+2,'cerulean')
        if i in [2,5,8]:b.rect(x,y-1,x+1,y+1,'gold')
    out[327]=b
    b=sky(('rose','blush','pine'),(0,5,14,48));b.rect(0,0,47,1,None)
    for y,c,t in [(14,'pine','seafoam'),(23,'plum','lime'),(32,'pine','cyan'),(41,'plum','seafoam')]:
        pts=[(0,y+3),(10,y+1),(24,y-2),(37,y+1),(47,y+2)]
        b.poly(pts+[(48,48),(0,48)],c);b.line(pts,t,2)
    b.poly([(0,45),(13,34),(21,31),(25,35),(13,41),(5,48)],'umber')
    b.ellipse(17,23,36,35,'stone');b.ellipse(21,24,33,31,'lavender');b.poly([(32,25),(39,27),(36,31),(32,31)],'stone')
    for x in [20,28,33]:b.rect(x,32,x+2,36,'graphite')
    corners(b,5);out[328]=b
    b=Board('sage');b.rect(0,0,47,1,None);b.rect(0,42,47,44,'stone');b.rect(0,45,47,47,'umber')
    b.ellipse(0,31,18,47,'mauve');b.line([(4,35),(8,40),(14,34)],'gold',2)
    for x,y,r in [(13,31,3),(18,24,4),(23,17,5),(31,12,6),(40,12,7)]:
        b.ellipse(x-r,y-r,x+r,y+r,'mauve');b.ellipse(x-r+2,y-r+2,x+r-2,y+r-2,'lavender')
    for x,y in [(34,2),(43,2),(45,25)]:b.ellipse(x,y,x+3,y+3,'lime');b.rect(x+1,y+2,x+2,y+3,'plum')
    b.ellipse(37,39,44,45,'mauve');corners(b,6);out[329]=b
    b=Board('blush');b.rect(0,0,47,0,None)
    rim(b,[(0,4),(13,8),(20,4),(24,2),(28,5),(35,8),(48,3),(47,15),(39,20),(31,24),(26,28),(20,25),(10,19),(0,13)],'plum','plum',2)
    b.ellipse(16,9,31,26,'mauve')
    b.line([(3,8),(12,13),(17,15)],'lavender',2);b.line([(44,8),(35,13),(31,15)],'lavender',2)
    b.rect(5,11,8,12,None);b.rect(39,11,42,12,None)
    for x,y,c in [(9,21,'lime'),(21,25,'verdigris'),(35,22,'lime')]:
        b.poly([(x,y),(x+5,y-1),(x+6,y+10),(x+3,y+14),(x-2,y+9)],c);b.line([(x+2,y+2),(x+2,y+10)],'forest',2)
    b.line([(17,23),(17,35),(14,43)],'ice',2);b.line([(31,24),(31,37),(35,43)],'seafoam',2)
    b.rect(0,40,47,47,'olive');b.ellipse(16,44,35,49,'cerulean')
    for x,y in [(2,34),(11,37),(37,35),(44,37)]:b.rect(x,y,x+2,42,'umber');b.ellipse(x-2,y-2,x+4,y+1,'magenta')
    out[330]=b
    # Interior material/light planes. Each is a named, broad region clipped to
    # an existing mass; silhouettes and revised form counts stay intact.
    planes = {
        291: [('ultramarine','plum',25,3,42,8),('navy','indigo',4,30,14,36),('amethyst','mauve',25,34,47,39),('teal','verdigris',22,44,45,47),('navy','gold',7,12,10,14)],
        292: [('indigo','cerulean',0,20,8,27),('amethyst','plum',32,38,47,47)],
        293: [('amethyst','lavender',0,32,47,35),('ultramarine','navy',0,14,9,27)],
        294: [('amethyst','plum',0,41,47,47),('ultramarine','purple',32,3,47,11),('navy','indigo',0,29,6,37),('indigo','yellow',45,27,47,32),('navy','ultramarine',10,36,16,39),('lavender','ice',25,17,28,20)],
        295: [('amethyst','gold',4,44,22,47),('indigo','lavender',36,29,47,34),('ivory','white',5,15,10,29),('navy','ultramarine',35,15,47,23),('ivory','lavender',4,30,9,34),('ice','seafoam',16,29,19,32)],
        296: [('ultramarine','plum',0,12,8,19),('purple','amethyst',15,5,24,8),('magenta','rose',20,22,29,26),('stone','navy',9,37,37,38),('indigo','ice',40,25,47,29),('purple','mauve',28,6,32,9),('gold','yellow',9,45,19,47)],
        297: [('rose','lavender',0,0,14,7),('coral','navy',0,18,8,23),('ultramarine','blue',19,38,22,46),('ice','white',37,30,45,33),('indigo','lavender',0,44,8,47)],
        298: [('ultramarine','amethyst',0,0,9,6),('amethyst','plum',0,43,3,47),('orange','coral',40,30,47,36),('yellow','ivory',31,12,35,17),('indigo','cerulean',1,24,6,28),('orange','rose',40,40,45,44),('navy','ultramarine',6,42,10,46),('gold','bronze',33,9,36,11)],
        299: [('ultramarine','mauve',0,0,5,3),('amethyst','magenta',10,36,13,41),('teal','verdigris',0,46,47,47),('sage','sand',16,43,27,44),('indigo','lavender',21,17,26,20),('cerulean','ice',17,3,28,5)],
        301: [('lavender','cerulean',0,2,47,4),('stone','ivory',3,6,10,9)],
        302: [('lavender','silver',0,2,22,4),('sage','navy',0,28,5,33)],
        303: [('sage','ice',24,24,35,27)],
        304: [('stone','silver',5,24,9,32),('lavender','rose',31,2,47,6)],
        305: [('navy','teal',29,43,47,47)],
        306: [('sage','ice',0,20,5,26),('stone','silver',4,40,20,42),('graphite','umber',25,18,27,29),('stone','sand',5,44,20,47)],
        307: [('stone','ivory',0,10,4,35)],
        308: [('lavender','ice',34,2,47,6),('stone','ivory',28,19,32,27),('stone','sage',32,32,36,36)],
        309: [('stone','sage',3,27,12,33),('stone','verdigris',19,26,23,32),('stone','silver',32,21,36,28),('sand','olive',0,46,23,47),('slate','navy',15,34,21,38),('stone','gold',36,35,44,36),('slate','teal',44,35,46,39)],
        311: [('cerulean','purple',9,5,14,11),('ivory','gold',0,34,6,35),('stone','slate',0,46,47,47),('lavender','lime',8,33,10,37),('ivory','white',41,4,43,8),('umber','coral',0,43,7,45),('lavender','orange',36,34,39,36),('ivory','lavender',41,34,45,37)],
        312: [('ivory','gold',0,41,47,42),('blue','cyan',23,26,25,28)],
        313: [('stone','sand',13,45,21,47)],
        314: [('sand','olive',0,44,47,47),('gold','yellow',9,33,13,36),('coral','orange',0,34,4,37),('sand','green',0,40,6,42),('gold','ivory',31,31,35,33),('rose','purple',23,18,26,21)],
        316: [('navy','indigo',20,3,40,7),('white','seafoam',2,36,5,40),('white','stone',26,38,42,39),('slate','cerulean',30,42,47,44),('ice','silver',32,10,38,12),('white','purple',2,26,3,31),('white','gold',0,45,6,47)],
        317: [('stone','slate',7,45,18,47),('navy','indigo',0,25,10,35),('stone','coral',31,44,36,47),('navy','blue',32,20,37,26),('stone','lavender',26,34,28,38),('navy','lime',17,18,19,21),('stone','red',9,44,11,46),('stone','pink',38,45,40,47),('stone','blue',39,42,42,44)],
        318: [('cerulean','navy',5,24,9,30),('coral','stone',40,21,47,25),('coral','brown',32,44,47,47),('cerulean','green',3,28,7,32)],
        319: [('stone','slate',8,44,20,47)],
        320: [('teal','verdigris',0,44,24,47),('navy','rose',18,2,20,4),('indigo','purple',35,44,47,47),('stone','orange',19,34,21,36)],
        321: [('sand','umber',0,46,47,47),('sand','gold',16,44,32,45),('lime','white',9,8,17,10),('green','rose',35,7,40,9),('blush','ice',0,36,2,41),('lime','sage',5,19,13,20)],
        322: [('olive','umber',0,46,47,47),('sage','green',15,40,29,43),('sage','gold',18,36,22,38),('ice','blush',7,13,10,15)],
        323: [('seafoam','sage',0,36,47,41),('umber','graphite',0,46,47,47),('olive','lime',17,3,30,4),('mauve','plum',22,33,26,42),('seafoam','lavender',0,2,7,8),('magenta','pink',18,24,29,25),('umber','rose',7,43,18,44),('sage','stone',35,39,46,41),('seafoam','blush',40,2,47,7),('umber','stone',26,43,33,45)],
        324: [('brown','umber',1,35,10,44),('brown','graphite',34,4,42,12),('blush','lavender',0,18,3,31),('brown','gold',35,30,40,34),('brown','seafoam',8,25,12,28),('blush','rose',16,45,31,47),('brown','sand',26,11,28,17),('ivory','white',23,8,26,12),('brown','rose',2,4,7,7),('brown','lavender',36,42,40,45)],
        325: [('sand','stone',0,45,8,47),('sand','sage',35,43,47,47),('sand','gold',9,45,30,47),('lavender','white',14,0,32,1),('amethyst','plum',16,36,33,37),('seafoam','teal',20,28,25,29),('sand','ivory',10,41,15,43)],
        326: [('sage','forest',0,43,10,47),('sage','stone',38,43,47,47),('plum','amethyst',0,30,12,32),('lavender','ivory',4,2,18,4),('sage','lime',17,21,22,23),('mauve','umber',9,24,11,28),('plum','graphite',24,39,37,40),('lavender','cerulean',41,7,47,12),('gold','rose',6,20,11,22),('sage','blush',0,27,5,28)],
        327: [('coral','rose',37,31,42,33),('coral','pink',27,8,33,9),('sand','umber',0,46,47,47),('mauve','plum',14,38,25,40),('seafoam','lime',4,40,9,41),('coral','ivory',9,8,12,10),('cerulean','blue',37,42,41,44),('sand','stone',26,43,34,45)],
        328: [('stone','ivory',32,27,37,28),('pine','green',36,38,47,40),('plum','mauve',1,26,8,28),('umber','gold',2,42,7,44),('pine','teal',0,36,6,38)],
        329: [('umber','graphite',0,46,47,47),('sage','blush',0,2,15,6),('mauve','amethyst',3,40,10,44),('mauve','rose',37,41,43,43),('sage','coral',24,37,31,41),('stone','sand',23,42,36,44),('mauve','ivory',38,8,44,9),('mauve','plum',8,31,14,32),('sage','gold',0,38,3,41)],
        330: [('olive','sage',0,43,14,45),('cerulean','blue',23,47,33,47),('mauve','rose',17,18,22,21),('olive','gold',39,43,46,45),('plum','graphite',0,10,3,13)],
    }
    for i,regions in planes.items():
        for source,target,x0,y0,x1,y1 in regions:
            b=out[i]
            for y in range(y0,y1+1):
                for x in range(x0,x1+1):
                    if b.cells[y][x]==source:b.put(x,y,target)
    # Coherent dark framing respects each board's intended density range.
    for i,n in [(301,7),(304,7),(306,6),(308,8),(324,5)]:corners(out[i],n)
    out[326].rect(0,0,47,1,None)
    out[326].rect(0,2,11,2,None)
    return out

if __name__ == '__main__':
    worlds={30:'COSMIC_GODS',31:'ANCIENT_MACHINES',32:'FESTIVAL_WORLDS',33:'ALIEN_ECOSYSTEMS'}
    titles={}
    for w,name in worlds.items():
        text=(DESIGN/f'WORLD_{w}_{name}.md').read_text()
        titles.update({int(i):t.strip().replace(' *(breather)*','').replace(' *(finale)*','').replace(' *(milestone finale)*','') for i,t in re.findall(r'^## (\d+) — (.+)$',text,re.M)})
    result=[]
    for i,b in boards().items():
        grid=b.rows();used=set(''.join(grid))-set('.')
        result.append(dict(id=i,title=titles[i],grid=grid,legend={c:LEGEND[c] for c in sorted(used)}))
        print(i,2304-sum(r.count('.') for r in grid),len(used))
    Path('dist/m16b').mkdir(parents=True,exist_ok=True)
    Path('dist/m16b/art.json').write_text(json.dumps(result,indent=2)+'\n')
