"""Hand-drawn M16A boards. Integer raster primitives; no random generation.

Only writes artwork drafts under dist/m16a. Production queues are authored by
m16a-author.ts against the unmodified production engine after visual review.
"""
import json
import math
import re
from pathlib import Path

DESIGN = Path('/Users/andres/Desktop/pixel-arcadia-design-251-350')
COLORS = re.findall(r"^  (\w+): '#[0-9A-Fa-f]{6}',", Path('src/theme/colors.ts').read_text().split('export const orbColors:')[1].split('export const orbGlow:')[0], re.M)
CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmno'
LEGEND = dict(zip(CHARS, COLORS))
ENCODE = {v: k for k, v in LEGEND.items()}

class Board:
    def __init__(self, color):
        self.cells = [[color] * 48 for _ in range(48)]
    def put(self, x, y, c):
        if 0 <= x < 48 and 0 <= y < 48:
            self.cells[y][x] = c
    def rect(self, x0, y0, x1, y1, c):
        for y in range(max(0, int(y0)), min(48, int(y1)+1)):
            for x in range(max(0, int(x0)), min(48, int(x1)+1)):
                self.put(x, y, c)
    def ellipse(self, x0, y0, x1, y1, c):
        cx, cy = (x0+x1)/2, (y0+y1)/2
        rx, ry = (x1-x0+1)/2, (y1-y0+1)/2
        for y in range(max(0, int(y0)), min(48, int(y1)+1)):
            for x in range(max(0, int(x0)), min(48, int(x1)+1)):
                if ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1:
                    self.put(x, y, c)
    def poly(self, points, c):
        for y in range(48):
            for x in range(48):
                inside = False
                for i, (ax, ay) in enumerate(points):
                    bx, by = points[i-1]
                    if (ay > y) != (by > y) and x < (bx-ax)*(y-ay)/(by-ay)+ax:
                        inside = not inside
                if inside:
                    self.put(x, y, c)
    def line(self, points, c, w=1):
        for (ax, ay), (bx, by) in zip(points, points[1:]):
            length = (bx-ax)**2+(by-ay)**2
            for y in range(48):
                for x in range(48):
                    t = max(0, min(1, ((x-ax)*(bx-ax)+(y-ay)*(by-ay))/max(1, length)))
                    if (x-ax-t*(bx-ax))**2 + (y-ay-t*(by-ay))**2 <= (w/2)**2:
                        self.put(x, y, c)
    def bands(self, colors, boundaries):
        for c, (a,b) in zip(colors, zip(boundaries,boundaries[1:])):
            self.rect(0,a,47,b-1,c)
    def rows(self):
        return [''.join('.' if c is None else ENCODE[c] for c in r) for r in self.cells]


def desert():
    b=Board('cerulean'); b.rect(0,0,47,7,'ice')
    b.poly([(0,31),(15,24),(31,28),(48,19),(48,48),(0,48)],'sand')
    b.poly([(0,42),(22,34),(48,40),(48,48),(0,48)],'brown')
    b.line([(0,40),(22,32),(47,38)],'gold',2)
    return b

def foliage():
    b=Board('sage'); b.bands(['sage','olive','forest','pine'],[0,9,21,35,48])
    for x,y,r in [(0,6,15),(37,4,12),(9,24,10),(44,29,12),(4,44,12)]:
        b.ellipse(x-r,y-r,x+r,y+r,'forest')
        b.ellipse(x-r+2,y-r,x+r-3,y+2,'green')
    b.line([(3,0),(7,18),(2,35)],'pine',3)
    b.line([(44,3),(39,20),(46,46)],'umber',3)
    return b

def cave():
    b=Board('graphite'); b.rect(0,0,47,7,'plum'); b.rect(0,40,47,47,'slate')
    b.poly([(0,0),(8,0),(5,18),(9,32),(5,48),(0,48)],'umber')
    b.poly([(43,0),(48,0),(48,48),(40,48),(45,28),(41,14)],'stone')
    return b

def ocean():
    b=Board('cerulean'); b.bands(['cerulean','blue','navy'],[0,15,30,48])
    b.poly([(0,42),(17,39),(31,44),(48,40),(48,48),(0,48)],'slate')
    return b

def windows(b,x,y,n,c='gold',step=5):
    for i in range(n): b.rect(x+i*step,y,x+i*step+1,y+2,c)

def palm(b,x,y,h):
    b.line([(x,y),(x-2,y+h)],'umber',2)
    b.line([(x+1,y+2),(x-1,y+h)],'brown',1)
    b.ellipse(x-8,y-3,x+8,y+2,'green')
    b.poly([(x,y-2),(x-8,y-4),(x-10,y+3),(x-4,y)],'sage')
    b.poly([(x,y),(x+8,y-2),(x+10,y+6),(x+5,y+3)],'olive')
    b.rect(x,y+1,x+1,y+3,'bronze')

def dome(b,x,y,w,h):
    b.ellipse(x,y,x+w,y+h,'cyan'); b.ellipse(x+1,y+1,x+w-1,y+h-1,'ice')
    b.ellipse(x+2,y+2,x+w-2,y+h-2,'verdigris')
    b.rect(x+1,y+h//2,x+w-1,y+h,'verdigris')
    b.line([(x,y+h),(x,y+h//2)],'ice',1); b.line([(x+w,y+h),(x+w,y+h//2)],'cyan',1)
    for j in range(3):
        tx=x+3+j*max(3,(w-5)//3); top=y+h//2+2-(j%2)*3
        b.rect(tx,top,tx+2,y+h-2,'stone' if j%2 else 'ivory')
        b.put(tx+1,top+2,'gold')
    b.line([(x+2,y+h-1),(x+w-2,y+h-1)],'lime',2)

def coral(b,x,y,c='coral',h=7):
    b.line([(x,y),(x,y-h)],c,3)
    b.line([(x,y-2),(x-3,y-5),(x-3,y-h)],c,2)
    b.line([(x,y-3),(x+4,y-6),(x+4,y-h+1)],'rose' if c=='coral' else 'gold',2)

def board(id):
    if id <=260: b=desert()
    elif id<=270: b=foliage()
    elif id<=280: b=cave()
    else: b=ocean()
    if id==251:
        b.poly([(0,40),(48,11),(48,48),(0,48)],'gold')
        b.poly([(0,43),(48,16),(48,25),(0,48)],'sand')
        b.poly([(0,0),(18,0),(14,8),(0,10)],None)
        for x,y,s in [(5,33,1.2),(14,28,1),(23,22,.9),(31,17,.8),(39,12,.7)]:
            b.line([(x+2,y+3),(x+9,y+14)],'brown',3)
            b.rect(x,y,x+6,y+3,'umber'); b.ellipse(x+1,y-3,x+5,y+1,'brown')
            b.line([(x+5,y),(x+7,y-4),(x+9,y-4)],'brown',2)
            for lx in [x+1,x+5]: b.line([(lx,y+2),(lx-1,y+6)],'umber',1)
            b.rect(x+2,y-4,x+3,y-2,'maroon'); b.put(x+2,y-5,'ivory')
            b.line([(x+8,y-1),(x+11,y-3)],'umber',1)
        b.line([(0,45),(25,30),(47,20)],'orange',2)
        b.line([(7,46),(29,36)],'coral',2); b.rect(42,42,47,47,'blush')
        b.line([(0,14),(14,14)],'yellow',1); b.rect(6,32,7,33,'bronze'); b.rect(24,21,25,22,'stone')
    elif id==252:
        b.rect(6,10,38,39,'umber'); b.rect(8,12,36,39,'stone')
        b.rect(6,9,14,13,'ivory'); b.rect(30,9,38,13,'ivory')
        b.rect(7,15,37,18,'gold'); windows(b,9,15,6,'bronze')
        b.ellipse(16,19,29,36,None); b.rect(16,27,30,39,None)
        b.line([(13,19),(13,36)],'brown',2); b.line([(32,19),(32,36)],'slate',2)
        b.poly([(47,7),(47,48),(0,48),(5,41),(28,29)],'sand')
        b.line([(30,28),(47,9)],'gold',2)
        b.line([(0,43),(22,37),(47,43)],'coral',2)
        b.rect(0,0,10,1,None); b.rect(8,19,9,23,'maroon'); b.rect(34,19,35,22,'yellow')
        b.rect(7,30,9,32,'blush'); b.rect(42,43,46,47,'orange')
    elif id==253:
        b.bands(['ice','cerulean','lavender','ice','sand'],[0,6,22,27,43,48])
        for x,y,w,h,c in [(5,12,10,9,'ivory'),(17,8,12,13,'sand'),(32,13,8,8,'blush')]:
            b.rect(x,y,x+w,y+h,'umber'); b.rect(x+1,y+1,x+w-1,y+h,c)
            b.ellipse(x,y-4,x+w,y+3,'gold'); b.rect(x+w//2,y-6,x+w//2,y-3,'maroon')
            windows(b,x+2,y+5,2,'brown',4)
        for x,y,w,h,c in [(6,29,9,8,'blush'),(18,29,11,12,'ivory'),(33,29,5,6,'lavender')]:
            b.rect(x,y,x+w,y+h,c); b.ellipse(x,y+h-2,x+w,y+h+3,'lavender')
            b.line([(x+2,y+2),(x+2,y+5)],'ice',2)
        for x in range(0,48,8): b.rect(x,23,x+5,25,None)
        b.rect(40,31,46,35,None); b.line([(0,46),(17,44),(40,46)],'orange',2)
        b.rect(21,16,23,21,'bronze'); b.rect(8,18,10,20,'white'); b.rect(10,6,10,8,'rose')
    elif id==254:
        b.rect(0,0,47,3,None)
        b.ellipse(8,7,40,20,'umber'); b.ellipse(8,7,38,17,'brown')
        for x in [13,22,31]: b.line([(x,8),(x-2,15),(x+3,18)],'sand',2)
        for x,y,dx in [(12,18,-4),(20,19,1),(31,18,-2),(37,17,5)]:
            b.line([(x,y),(x+dx,30),(x+dx-2,42)],'umber',3)
            b.line([(x,y),(x+dx,29)],'brown',2); b.rect(x+dx-1,28,x+dx+1,29,'gold')
        b.rect(22,5,29,8,'ivory'); b.rect(21,4,30,5,'maroon')
        b.rect(21,4,22,4,'yellow'); b.rect(29,4,30,4,'gold')
        b.ellipse(12,42,38,46,'umber'); b.line([(0,33),(12,30),(29,35),(47,29)],'blush',2)
        b.line([(1,45),(8,44)],'bronze',2); b.rect(42,42,47,45,'coral')
        b.line([(0,24),(8,24)],'white',1)
    elif id==255:
        b.rect(0,0,22,7,None); b.rect(35,22,37,30,None)
        b.ellipse(-7,28,28,55,'umber'); b.ellipse(-5,30,26,53,'teal')
        b.line([(0,35),(12,32),(24,35)],'seafoam',2); b.line([(1,40),(17,38),(23,40)],'cyan',2)
        b.rect(19,21,28,32,'brown'); b.rect(19,20,28,22,'ivory'); b.rect(22,25,25,32,'umber')
        for x,y,h in [(30,12,27),(40,8,32),(44,23,20)]: palm(b,x,y,h)
        b.line([(0,26),(11,22),(19,25)],'gold',2)
    elif id==256:
        b.poly([(22,8),(48,43),(48,48),(0,48),(0,39)],'umber')
        for y,left,right in [(10,17,29),(15,14,32),(20,11,35),(25,8,38),(30,5,41),(35,2,44),(40,0,47)]:
            b.rect(left,y,22,y+5,'gold'); b.rect(23,y,right,y+5,'brown')
            b.rect(left,y+4,21,y+4,'sand'); b.rect(24,y+4,right,y+4,'umber')
            b.put(left-1,y+3,None); b.put(right+1,y+3,None)
            b.rect(27,y+1,29,y+2,'maroon')
        b.line([(4,44),(20,10)],'umber',4); b.line([(5,44),(21,10)],'ivory',2)
        for y in range(14,44,4): b.line([(int(25-y*.45),y),(int(27-y*.45),y)],'bronze',1)
        b.rect(17,4,28,10,'ivory'); b.rect(21,6,24,10,'garnet'); b.rect(16,3,29,4,'gold')
        b.rect(0,0,10,6,None); b.rect(39,0,47,4,None)
        b.line([(0,47),(18,47)],'coral',2); b.line([(34,43),(47,45)],'orange',2)
        b.rect(35,38,39,40,'stone'); b.rect(18,3,19,3,'yellow')
    elif id==257:
        b.rect(0,3,21,47,'umber'); b.ellipse(3,4,19,18,'stone')
        b.rect(3,4,19,7,'bronze'); b.rect(7,8,17,15,'sand')
        b.line([(8,10),(10,10)],'umber',1); b.line([(14,10),(16,10)],'umber',1)
        b.rect(12,11,13,14,'ivory'); b.rect(10,16,15,17,'brown')
        b.poly([(7,18),(17,18),(20,34),(19,43),(1,43),(3,27)],'stone')
        b.rect(2,22,5,31,'sand'); b.rect(6,24,8,33,None)
        b.rect(15,25,18,34,'sand'); b.rect(1,33,8,39,'ivory'); b.rect(12,34,21,40,'ivory')
        b.line([(24,48),(30,39),(27,32),(39,24),(40,18)],'umber',5)
        b.line([(24,48),(30,39),(27,32),(39,24),(40,18)],'gold',3)
        b.poly([(31,0),(46,0),(42,12),(38,12)],None)
        b.rect(30,4,33,11,'coral'); b.rect(36,12,38,17,'blush')
        b.rect(27,43,29,45,'maroon'); b.rect(28,41,29,42,'yellow')
        b.line([(1,45),(21,45)],'slate',2); b.rect(43,36,47,40,'sage')
        b.line([(1,18),(4,22),(2,27)],'graphite',1)
    elif id==258:
        for x,y,w,h in [(0,20,7,27),(9,25,6,22),(17,17,7,30)]:
            b.rect(x,y,x+w,y+h,'stone'); b.rect(x,y,x+2,y+h,'ivory')
            b.rect(x,y-1,x+w,y,'gold'); windows(b,x+3,y+5,1,'yellow')
        b.rect(0,36,28,47,'brown'); windows(b,2,39,5,'graphite')
        for x,y in [(38,5),(37,19),(44,32)]:
            b.ellipse(x-17,y-15,58,y+18,'sand'); b.ellipse(x-10,y-11,58,y+17,'brown'); b.ellipse(x-3,y-7,58,y+16,'umber')
        b.poly([(0,0),(13,0),(7,9),(0,8)],None)
        b.line([(7,19),(15,18)],'maroon',2); b.rect(0,45,15,46,'bronze')
        b.line([(30,5),(29,15),(27,20)],'blush',2); b.rect(38,40,46,42,'orange')
        b.rect(22,38,25,39,'coral'); b.rect(32,29,34,31,'garnet'); b.line([(0,14),(12,14)],'ice',2)
    elif id==259:
        b.rect(12,6,36,44,'umber'); b.rect(14,8,34,43,'blush')
        b.rect(13,18,35,20,'gold'); b.rect(13,32,35,34,'gold')
        for x in [15,21,27,33]:
            b.rect(x,21,x+1,30,None); b.rect(x-1,20,x-1,32,'brown')
        b.ellipse(20,8,28,18,'sand'); b.rect(19,7,29,9,'ivory'); b.rect(23,4,25,7,'gold')
        b.rect(22,36,27,44,'maroon'); b.rect(24,38,25,44,'graphite')
        for left in [True,False]:
            pts=[(0,0),(11,0),(14,12),(10,26),(14,47),(0,48)] if left else [(37,0),(48,0),(48,48),(34,48),(39,30),(35,14)]
            b.poly(pts,'umber')
            for y,c in [(6,'brown'),(15,'coral'),(28,'brown'),(39,'coral')]:
                b.line([(0 if left else 39,y),(10 if left else 47,y+3)],c,3)
        b.rect(16,0,32,3,None); b.rect(2,43,6,46,'stone'); b.rect(41,43,45,46,'slate')
        b.rect(17,12,18,14,'bronze'); b.rect(30,12,31,14,'rose'); b.rect(23,17,25,17,'yellow')
        b.line([(17,45),(33,45)],'orange',2)
    elif id==260:
        b.bands(['orange','coral','cerulean','sand'],[0,10,20,48])
        b.ellipse(19,2,29,12,'gold'); b.ellipse(21,3,27,10,'yellow')
        b.rect(16,0,17,6,None); b.rect(31,0,32,6,None)
        for x,w in [(0,16),(33,14)]:
            b.rect(x,0,x+w,42,'umber')
            b.poly([(x,0),(x+w-3,0),(x+w,42),(x,42)],'brown')
            for y in [5,17,28]:
                b.rect(x+2,y,x+w-2,y+7,'coral'); b.rect(x+3,y+1,x+w-3,y+1,'gold')
                windows(b,x+4,y+3,2,'garnet',5); b.rect(x+2,y+6,x+w-2,y+6,'blush')
                b.line([(x+3,y+7),(x+7,y+7)],'sage',1)
        for y in [14,24,33]:
            b.poly([(14,y+4),(18,y),(29,y),(35,y+4),(35,y+6),(29,y+2),(19,y+2),(14,y+6)],'stone')
            b.line([(16,y+1),(32,y+1)],'ivory',2)
            b.rect(22,y+3,26,y+4,None)
        b.line([(0,46),(12,43),(22,45),(34,42),(47,45)],'verdigris',5)
        b.line([(0,46),(12,43),(22,45),(34,42),(47,45)],'teal',3)
        b.line([(24,45),(35,43),(44,45)],'cyan',1); b.rect(38,40,41,42,None)
        b.rect(3,38,8,40,'sand'); b.rect(8,36,9,39,'bronze'); b.line([(4,40),(3,43)],'graphite',1)
        b.rect(5,36,6,38,'maroon'); b.rect(43,29,44,30,'yellow')
    elif id==261:
        b.rect(17,13,33,47,'slate'); b.rect(20,14,30,47,'stone')
        b.rect(19,20,31,22,'gold'); windows(b,20,20,3,'ivory',4)
        for pts in [[(12,47),(18,34),(16,23),(24,10)],[(34,47),(30,34),(33,20),(28,9)],[(22,47),(26,31),(22,17)],[(30,47),(23,32),(29,18)]]:
            b.line(pts,'umber',4); b.line(pts,'brown',2)
        for x,y in [(17,27),(25,24),(28,35),(19,39),(15,34),(27,43)]: b.rect(x,y,x+2,y+3,None)
        b.ellipse(1,-5,39,15,'pine'); b.ellipse(0,-6,33,9,'green'); b.line([(2,9),(31,12)],'sage',3)
        b.rect(39,0,47,7,None); b.line([(38,9),(34,23)],'lime',2)
        b.rect(21,27,23,30,'olive'); b.rect(29,15,30,17,'yellow')
        b.line([(0,45),(8,36)],'verdigris',3); b.rect(3,41,4,43,'seafoam')
    elif id==262:
        b.rect(14,4,33,40,'slate')
        b.rect(20,13,21,32,None); b.rect(26,7,27,33,None)
        for x,w,top in [(16,4,4),(23,3,3),(29,2,7)]:
            b.rect(x,top,x+w-1,40,'white'); b.rect(x,top+4,x,39,'ice')
            b.rect(x+w-1,16,x+w-1,31,'cerulean')
        b.ellipse(11,36,36,42,None); b.rect(11,41,36,47,'seafoam')
        b.line([(10,35),(20,34),(33,37),(38,35)],'lavender',3)
        b.line([(11,37),(23,36),(36,38)],'ice',2)
        b.line([(37,0),(34,10),(35,16)],'lime',3); b.line([(38,1),(36,12)],'ice',2)
        b.rect(14,14,16,18,'stone'); b.rect(27,22,29,25,'graphite')
        b.line([(7,12),(10,20),(7,29)],'verdigris',2); b.rect(7,26,9,28,'brown')
        b.rect(40,36,43,39,'olive'); b.line([(13,46),(35,46)],'cyan',2)
    elif id==263:
        b.poly([(9,4),(24,4),(29,10),(12,12)],None)
        b.line([(0,43),(47,11)],'umber',6); b.line([(0,41),(47,9)],'brown',2)
        b.poly([(9,31),(12,24),(34,10),(40,13),(37,19),(16,35)],'umber')
        b.poly([(11,30),(14,25),(35,12),(38,14),(35,18),(15,33)],'orange')
        b.ellipse(7,28,17,35,'gold'); b.rect(8,28,10,29,'umber'); b.put(9,30,'lime')
        b.line([(36,16),(42,20),(46,18),(45,13)],'gold',3)
        for x,y in [(15,27),(20,23),(25,20),(30,17),(34,15),(17,29),(24,24)]:
            b.rect(x,y,x+2,y+2,'umber'); b.put(x+1,y+1,'gold')
        b.line([(16,31),(17,36),(14,38)],'gold',2); b.line([(29,22),(30,27),(26,30)],'gold',2)
        b.line([(8,32),(4,32)],'ivory',1); b.rect(3,16,6,19,'verdigris')
        b.line([(35,44),(41,38)],'seafoam',2); b.rect(38,35,39,37,'yellow')
        b.rect(2,45,4,47,'stone'); b.line([(0,23),(5,19)],'slate',2)
    elif id==264:
        b.ellipse(13,0,37,9,None)
        b.line([(7,47),(10,30),(3,19)],'olive',3); b.line([(24,47),(36,37),(44,28)],'verdigris',3)
        for x,y,r in [(5,17,7),(4,33,7),(37,35,8),(44,24,6)]:
            for dx,dy in [(-3,0),(3,0),(0,-3),(0,3)]: b.ellipse(x+dx-r//2,y+dy-r//2,x+dx+r//2,y+dy+r//2,'pink')
            b.ellipse(x-2,y-2,x+2,y+2,'magenta'); b.rect(x,y,x+1,y+1,'gold')
            b.rect(x-4,y-2,x-3,y+1,'white')
        b.line([(23,13),(26,24),(24,36)],'graphite',7); b.line([(23,13),(26,24),(24,36)],'blush',5)
        b.poly([(18,8),(30,8),(24,15)],'graphite'); b.poly([(19,9),(29,9),(24,13)],'white')
        b.rect(19,9,20,10,'lime'); b.rect(28,9,29,10,'lime')
        for pts in [[(24,18),(15,13),(12,6),(16,8)],[(25,18),(34,14),(36,5),(32,8)],[(25,29),(16,36),(13,43)],[(25,28),(34,34),(32,43)]]:
            b.line(pts,'graphite',3); b.line(pts,'lavender',1)
        b.rect(26,20,28,24,'seafoam'); b.rect(1,44,4,47,'stone'); b.rect(39,3,42,6,'sage')
    elif id==265:
        b.bands(['teal','navy'],[0,24,48]); b.ellipse(0,2,13,12,None); b.ellipse(24,32,38,41,None)
        for x,y,r in [(7,34,8),(13,16,6),(26,22,8),(36,7,6),(41,34,5)]:
            b.ellipse(x-r,y-r,x+r,y+r,'olive'); b.ellipse(x-r+1,y-r+1,x+r-1,y+r-1,'green')
            b.poly([(x,y),(x+r+1,y-2),(x+r+1,y+3)],'navy')
            for dx,dy in [(-r,0),(0,-r),(-r//2,r//2)]: b.line([(x,y),(x+dx,y+dy)],'forest',1)
            b.line([(x-r+3,y-r+1),(x,y-r+1)],'lime',1)
        b.ellipse(23,18,29,24,'blush'); b.rect(25,18,26,24,'white'); b.rect(23,21,29,22,'white'); b.rect(25,21,26,22,'gold')
        b.line([(4,5),(10,3)],'ice',2); b.line([(19,38),(23,33),(21,29),(24,30)],'slate',2)
        b.line([(3,47),(13,47)],'seafoam',2); b.rect(42,16,45,18,'sage')
    elif id==266:
        b.rect(5,10,28,13,None); b.rect(9,14,20,17,None)
        b.ellipse(4,16,41,40,'slate'); b.ellipse(6,17,39,37,'stone')
        b.rect(6,18,12,37,'gold'); b.rect(8,20,10,35,'bronze')
        b.ellipse(14,19,18,24,None); b.ellipse(14,30,18,34,None)
        b.poly([(20,21),(28,24),(24,29),(20,31)],'sand')
        b.line([(29,22),(31,26),(29,32)],'umber',2)
        b.ellipse(32,22,39,32,'sage'); b.ellipse(34,24,37,30,'slate')
        b.line([(0,14),(9,15),(16,20),(19,35)],'brown',3)
        b.line([(4,0),(11,12),(23,15)],'umber',3)
        b.rect(23,33,26,35,'olive'); b.line([(24,18),(23,25),(26,30)],'verdigris',2)
        b.line([(0,43),(17,41),(36,45),(47,42)],'teal',5); b.line([(0,44),(17,43),(35,46)],'cerulean',2)
        b.rect(30,4,36,7,'ice'); b.rect(40,15,42,17,'lime')
    elif id==267:
        b.rect(0,0,14,9,None); b.ellipse(11,0,23,7,None)
        for x,y in [(3,4),(12,9),(21,3)]:
            b.poly([(x,y),(x-2,y-2),(x-3,y+1),(x,y+2),(x+3,y+1),(x+2,y-2)],'lavender'); b.put(x,y,'stone')
        b.line([(35,47),(39,37),(33,27)],'verdigris',4)
        center=(33,22)
        for dx,dy in [(-12,-3),(-7,-11),(3,-12),(12,-7),(13,3),(6,11),(-5,12),(-12,6)]:
            b.poly([(33,22),(33+dx-3,22+dy),(33+dx,22+dy-3),(33+dx+3,22+dy),(33,22)],'ice')
            b.line([(33,22),(33+dx,22+dy)],'white',2)
            b.line([(33,22),(33+dx*.7,22+dy*.7)],'cyan',1)
        b.ellipse(29,18,37,26,'seafoam'); b.ellipse(31,20,35,24,'gold')
        b.rect(35,42,37,44,'lime'); b.rect(8,38,10,40,'seafoam')
        b.ellipse(13,30,16,34,'navy'); b.ellipse(4,25,7,28,'graphite'); b.ellipse(44,7,46,10,'magenta')
    elif id==268:
        b.rect(14,3,33,39,'slate'); b.rect(17,4,30,10,None); b.rect(19,24,28,32,None)
        b.poly([(0,0),(13,0),(17,20),(13,48),(0,48)],'pine')
        b.poly([(34,0),(48,0),(48,48),(32,48),(36,27)],'forest')
        b.line([(12,11),(18,15),(24,17),(30,15),(35,11)],'ivory',1)
        b.line([(12,15),(18,19),(24,21),(30,19),(35,15)],'brown',3)
        for x in range(15,34,3):
            y=round(21-abs(x-24)*.55); b.line([(x,y-1),(x,y+1)],'bronze',1)
        for x in [12,35]: b.line([(x,8),(x,17)],'gold',2)
        b.line([(0,45),(19,41),(33,45),(47,42)],'teal',5); b.line([(1,45),(20,43),(32,46)],'cerulean',2)
        b.line([(16,35),(23,36),(31,34)],'ice',3)
        b.line([(5,7),(9,14),(6,29)],'green',3); b.line([(40,14),(37,25),(43,33)],'sage',3)
        b.rect(1,31,5,34,'stone'); b.rect(44,4,47,7,'olive'); b.rect(8,35,10,38,'lime')
        b.rect(40,40,43,42,'umber'); b.rect(1,0,5,3,'verdigris')
    elif id==269:
        for pts in [[(0,8),(47,31)],[(0,35),(47,11)],[(7,48),(25,0)],[(35,48),(43,0)]]:
            b.line(pts,'umber',4); b.line(pts,'brown',2)
        for x,y in [(11,15),(23,3),(28,32),(8,39),(39,36),(31,14)]: b.rect(x,y,x+3,y+3,None)
        snake=[(0,46),(13,39),(25,37),(29,30),(22,25),(16,21),(19,14),(34,11),(40,9)]
        b.line(snake,'pine',8); b.line(snake,'green',6); b.line([(0,48),(13,42),(25,40),(31,30),(25,23),(19,20)],'lime',2)
        for x,y in [(9,41),(22,37),(26,29),(18,22),(19,15),(29,11)]: b.poly([(x,y-2),(x+2,y),(x,y+2),(x-2,y)],'forest')
        for pts in [[(8,43),(15,27)],[(21,18),(28,21)],[(34,12),(40,8)]]: b.line(pts,'brown',3)
        b.ellipse(35,5,44,12,'green'); b.rect(41,7,42,8,'gold'); b.put(42,7,'graphite')
        b.line([(44,10),(47,12)],'rose',1); b.rect(3,17,5,20,'verdigris'); b.rect(43,43,46,46,'stone')
        b.rect(1,28,3,30,'slate'); b.rect(31,43,33,45,'seafoam'); b.rect(35,1,37,3,'yellow')
    elif id==270:
        b.bands(['sage','forest','pine','slate','navy'],[0,8,20,36,42,48])
        for x,r in [(5,8),(21,11),(40,8)]:
            b.ellipse(x-r,-5,x+r,9,'olive'); b.ellipse(x-r,-5,x+r,5,'green')
        for x in [10,24,38]:
            b.poly([(x-1,7),(x+1,7),(x+3,29),(x-2,29)],'lime'); b.rect(x,8,x,26,'yellow')
            b.line([(x+1,10),(x+2,29)],'ice',1)
        for x,y,w in [(1,26,14),(17,24,15),(31,29,13)]:
            b.rect(x,y,x+w,y+8,'stone'); b.rect(x+2,y-3,x+w-2,y,'slate')
            b.rect(x+4,y+3,x+7,y+8,'graphite'); b.line([(x,y+6),(x+w,y+6)],'sand',1)
            b.line([(x,y-8),(x+3,y),(x+w-1,y+9)],'umber',3); b.line([(x+1,y-8),(x+4,y),(x+w,y+9)],'brown',1)
        b.rect(1,38,7,42,None); b.rect(14,15,16,19,None); b.rect(29,12,31,16,None)
        b.line([(45,18),(44,32),(47,40)],'white',3); b.line([(46,18),(45,32),(47,40)],'ice',1)
        b.line([(0,45),(17,43),(33,46),(47,44)],'verdigris',4)
        b.line([(0,46),(17,45),(33,47),(47,45)],'cyan',1)
        for x in [8,22,34]: b.line([(x,43),(x+2,40)],'seafoam',2)
        b.rect(30,5,32,7,'red'); b.rect(33,6,35,7,'blue'); b.put(30,4,'gold')
    elif id==271:
        b.bands(['graphite','plum','slate','navy'],[0,9,26,33,48])
        b.poly([(0,0),(13,0),(10,9),(0,12)],None)
        b.line([(0,44),(19,41),(36,43),(47,40)],'stone',2)
        b.poly([(6,31),(38,31),(32,36),(12,36)],'bronze'); b.line([(9,32),(35,32)],'gold',1)
        b.poly([(17,31),(19,18),(23,13),(27,18),(30,31)],'graphite')
        b.ellipse(21,11,26,17,'ivory'); b.rect(22,13,25,14,None); b.rect(23,15,24,17,'umber')
        b.line([(25,24),(30,20)],'ivory',2); b.line([(29,14),(37,41)],'gold',1)
        b.rect(23,17,24,31,'garnet'); b.rect(20,29,28,31,'plum')
        b.line([(21,19),(20,24),(18,30)],'slate',2)
        b.line([(30,4),(32,6),(30,9),(33,11)],'ice',2); b.line([(7,18),(8,21),(6,23)],'lavender',2)
        b.line([(4,38),(16,38)],'yellow',1); b.line([(15,46),(25,45)],'seafoam',1)
    elif id==272:
        b.rect(0,0,47,7,'stone'); b.rect(0,3,47,5,'ivory')
        b.poly([(0,48),(21,26),(27,26),(48,48)],'slate')
        b.line([(2,47),(24,27),(45,47)],'bronze',2)
        for y in [32,38,45]: b.line([(int(48-y),y),(int(y),y)],'graphite',1)
        for i in range(7):
            x=2+i*3; top=6+i*3; bottom=47-i*3
            b.line([(x,bottom),(x+1,top+7),(24,top),(46-x,top+7),(47-x,bottom)],'sand',3)
            b.line([(x,bottom),(x+1,top+7),(24,top),(46-x,top+7),(47-x,bottom)],'ivory',2)
        for x,y in [(5,15),(12,22),(34,19),(39,12),(2,28),(43,28)]: b.rect(x,y,x+2,y+7,None)
        b.ellipse(21,24,27,31,'orange'); b.ellipse(23,26,25,29,'gold')
        for x,y in [(2,41),(9,35),(37,35),(44,41)]: b.rect(x,y,x+1,y+2,'yellow')
        b.rect(5,2,8,3,'umber'); b.rect(38,2,42,3,'lavender'); b.rect(0,45,1,47,'garnet'); b.rect(24,43,26,45,'ice')
    elif id==273:
        b.bands(['plum','graphite'],[0,13,48])
        for pts in [[(0,0),(10,11),(19,17),(31,31),(47,47)],[(10,11),(8,20),(21,34),(31,31)],[(19,17),(30,16),(37,26),(31,31)]]:
            b.line(pts,'red',3); b.line(pts,'orange',2); b.line(pts,'gold',1)
        b.line([(1,0),(8,9)],'yellow',1)
        for x,y in [(12,5),(24,26),(40,35),(3,33),(35,7),(18,43)]: b.ellipse(x,y,x+3,y+3,None)
        b.rect(41,0,47,6,None)
        for pts in [[(0,18),(45,7)],[(4,46),(47,28)]]:
            b.line(pts,'slate',4); b.line(pts,'stone',2)
        for x,y in [(5,15),(23,10),(18,39),(35,32)]: b.rect(x,y,x+1,y+2,'bronze')
        b.poly([(18,19),(23,17),(27,22),(23,26)],'garnet')
        b.line([(17,18),(22,16)],'maroon',2); b.rect(43,17,46,20,'umber')
        b.line([(1,40),(4,36)],'ivory',2); b.rect(13,32,15,33,'lavender')
    elif id==274:
        b.poly([(12,48),(12,31),(17,22),(22,20),(28,20),(34,27),(37,39),(35,48)],'slate')
        b.ellipse(19,12,30,23,'graphite'); b.ellipse(20,14,28,22,'stone')
        b.poly([(18,24),(25,22),(32,28),(34,40),(29,46),(16,43)],'stone')
        b.line([(24,24),(24,39)],'graphite',2)
        anchors=[(2,4),(1,21),(13,0),(38,0),(47,8),(47,29)]
        ends=[(16,29),(14,35),(22,23),(28,23),(33,30),(35,35)]
        for (ax,ay),(ex,ey) in zip(anchors,ends):
            b.rect(ax-2,ay-2,ax+2,ay+2,'garnet'); b.line([(ax,ay),(ex,ey)],'umber',3)
            b.line([(ax,ay),(ex,ey)],'bronze',2)
            for t in [.2,.45,.7]:
                x=round(ax+(ex-ax)*t); y=round(ay+(ey-ay)*t); b.put(x,y,'gold')
        for x,y in [(8,7),(31,4),(5,28),(39,32),(37,16)]: b.rect(x,y,x+4,y+4,None)
        b.line([(20,33),(27,35)],'ivory',2); b.line([(7,45),(15,46)],'orange',1)
        b.rect(8,40,12,42,'sand'); b.rect(39,43,44,45,'lavender'); b.rect(29,8,32,10,'maroon'); b.line([(0,38),(5,34)],'lavender',2); b.rect(21,22,22,23,'ice')
    elif id==275:
        b.rect(8,0,39,4,None); b.rect(16,5,34,6,None)
        b.poly([(0,6),(15,6),(48,39),(48,48),(32,48),(0,15)],'plum')
        for i in range(8):
            x=i*5; y=8+i*4
            b.line([(x,y),(x+12,y)],'bronze',2)
            b.line([(x+1,y+2),(x+12,y+2)],'graphite',2)
        for x,y,w in [(1,0,6),(29,4,7)]:
            b.rect(x,y,x+w,36,'stone'); b.rect(x+2,y,x+w,36,'graphite')
            b.rect(x,y+10,x+w,y+12,'garnet'); b.rect(x,y+30,x+w,y+32,'bronze')
        b.ellipse(33,33,54,54,'orange'); b.ellipse(38,38,54,54,'gold'); b.ellipse(43,43,54,54,'yellow')
        b.line([(35,35),(39,39)],'ivory',2); b.rect(8,38,13,40,'sand')
        b.rect(16,41,23,43,'slate'); b.line([(44,22),(46,29)],'umber',2)
    elif id==276:
        b.rect(0,0,47,8,'stone'); b.rect(0,4,47,7,'slate')
        b.poly([(6,7),(40,7),(40,20),(36,22),(13,22),(8,17)],'graphite')
        b.rect(13,9,34,19,'plum'); b.rect(17,11,30,16,'garnet')
        for x,y,w,h in [(8,12,6,17),(18,16,5,13),(28,13,7,20),(37,10,4,15)]:
            b.rect(x,y,x+w,y+h-5,'graphite'); b.poly([(x,y+h-5),(x+w,y+h-5),(x+w//2,y+h+1)],'plum')
            windows(b,x+2,y+3,1,'gold'); b.line([(x,y+2),(x,y+h-4)],'ivory',1)
        b.ellipse(5,30,18,37,None); b.ellipse(35,30,43,39,None)
        b.line([(31,34),(31,43)],'orange',2); b.put(31,38,'yellow')
        b.ellipse(21,42,44,51,'garnet'); b.ellipse(25,44,41,51,'gold')
        b.line([(5,0),(11,10)],'bronze',2); b.line([(42,0),(39,10)],'bronze',2)
        b.rect(15,14,16,17,'maroon'); b.rect(25,11,26,14,'lavender'); b.rect(9,38,12,40,'sand')
    elif id==277:
        b.bands(['slate','graphite','stone'],[0,12,43,48])
        for x,top,w,robe in [(0,11,13,'plum'),(17,2,14,'garnet'),(35,9,12,'graphite')]:
            b.rect(x,top+8,x+w,42,'bronze'); b.rect(x+1,top+6,x+w-1,top+8,'gold')
            b.poly([(x+2,42),(x+3,top+19),(x+2,top+9),(x+w//2,top),(x+w-1,top+9),(x+w-2,top+19),(x+w,42)],robe)
            b.ellipse(x+5,top+8,x+w-4,top+12,None)
            b.line([(x+3,top+17),(x+3,36)],'maroon' if robe=='plum' else 'slate',2)
            b.rect(x+2,top+21,x+4,top+23,'ivory'); b.rect(x+w-3,top+21,x+w-1,top+23,'sand')
        b.rect(15,19,16,35,None); b.rect(32,22,33,35,None)
        b.line([(2,29),(10,29)],'gold',1); b.line([(6,26),(6,33)],'gold',1)
        b.line([(21,27),(27,27)],'ice',2); b.rect(26,26,28,29,'ice')
        b.rect(39,31,44,35,'lavender'); b.line([(42,31),(42,35)],'umber',1)
        b.rect(1,45,46,46,'ivory'); b.rect(11,3,14,6,'rose'); b.rect(38,3,41,5,'plum'); b.line([(1,6),(9,3),(14,6)],'sage',2)
    elif id==278:
        b.bands(['plum','graphite','slate'],[0,17,41,48])
        b.line([(0,13),(12,23),(24,29),(33,39),(47,46)],'lavender',4)
        b.line([(0,13),(12,23),(24,29),(33,39),(47,46)],'ice',2)
        for x,y,h in [(8,41,34),(23,39,25),(36,41,27),(17,24,16),(43,25,15)]:
            b.line([(x,y),(x-1,y-h)],'bronze',4); b.line([(x+1,y),(x,y-h)],'graphite',3)
            for dx,dy in [(-7,-h+3),(6,-h+7),(-5,-h+13)]:
                b.line([(x,y-h//2),(x+dx,y+dy),(x+dx-2,y+dy-5)],'graphite',3)
                b.line([(x,y-h//2),(x+dx,y+dy)],'bronze',1)
                b.rect(x+dx-1,y+dy-1,x+dx,y+dy,'garnet'); b.put(x+dx,y+dy-1,'rose')
        for x,y in [(1,3),(13,5),(27,2),(39,3),(1,25),(28,19)]: b.rect(x,y,x+3,y+4,None)
        b.line([(36,45),(46,47)],'seafoam',2); b.rect(3,44,5,46,'garnet'); b.rect(15,44,18,46,'stone')
        b.rect(24,38,27,40,'umber'); b.rect(35,29,37,31,'sand'); b.rect(46,33,47,36,'gold')
        b.rect(18,8,20,10,'maroon'); b.rect(31,9,33,11,'ivory')
    elif id==279:
        b.bands(['plum','garnet','graphite','maroon','slate'],[0,13,19,33,48])
        b.ellipse(15,18,37,31,'orange'); b.ellipse(19,20,33,29,'gold'); b.ellipse(23,21,29,28,'yellow')
        for x,h,w in [(2,6,5),(10,8,5),(20,5,4),(29,8,5),(39,5,5)]:
            b.poly([(x,13),(x+w,13),(x+w//2,13+h)],'sand')
            b.poly([(x,13),(x+w-1,13),(x+w//2,13+h-1)],'ivory')
        for x,h in [(5,7),(15,5),(26,7),(36,6),(43,9)]:
            b.poly([(x,35),(x+5,35),(x+2,35-h)],'sand'); b.line([(x+2,35-h),(x+1,34)],'ivory',2)
        for x,y in [(7,20),(15,20),(34,21),(41,21),(2,25),(36,29)]: b.rect(x,y,x+2,y+5,None)
        b.line([(0,47),(8,40),(14,36),(20,29),(26,25)],'bronze',4)
        b.line([(0,47),(8,40),(14,36),(20,29),(26,25)],'stone',2)
        b.rect(9,39,10,40,'ice'); b.rect(3,3,9,5,'umber'); b.rect(39,43,45,45,'lavender')
        b.rect(2,34,4,37,'brown'); b.rect(24,42,27,44,'rose')
    elif id==280:
        b.bands(['plum','graphite','slate','garnet'],[0,8,28,40,48])
        b.rect(0,0,47,3,'ivory')
        for x,h in [(3,4),(12,7),(24,3),(36,5),(44,4)]: b.poly([(x,3),(x+3,3),(x+1,3+h)],'sand')
        b.rect(3,10,10,14,None)
        b.rect(25,15,46,28,'umber'); b.rect(27,16,45,26,'graphite')
        b.rect(31,12,41,25,'plum'); b.rect(34,17,38,25,'bronze'); b.rect(35,19,37,25,'garnet')
        for x,top in [(27,9),(34,6),(42,8)]:
            b.rect(x,top+3,x+3,22,'graphite'); b.poly([(x-1,top+3),(x+4,top+3),(x+1,top-1)],'plum')
            b.rect(x+1,top+6,x+2,top+7,'garnet')
        for x,y in [(22,29),(39,31)]:
            b.line([(x,y+8),(x,y+2),(x+4,y)],'ivory',3)
            for dx in [0,3,6]:
                b.line([(x+dx,y+2),(x+dx-1,y-4)],'ivory',2)
                if dx<6: b.put(x+dx+1,y,None)
        b.line([(0,46),(28,26)],'umber',5); b.line([(0,46),(28,26)],'stone',3)
        for x,y in [(4,43),(9,39),(14,36),(19,32),(24,29)]:
            b.line([(x-2,y+1),(x-2,y-3),(x+2,y-5),(x+4,y-2),(x+4,y)],'ivory',2)
            b.put(x,y-2,None); b.put(x+1,y-2,None)
        for pts in [[(0,34),(7,32),(13,34)],[(28,44),(34,41),(46,43)],[(34,36),(46,34),(47,31)]]:
            b.line(pts,'red',5); b.line(pts,'orange',3); b.line(pts,'gold',1)
        b.line([(34,42),(41,42)],'yellow',1); b.rect(44,21,45,24,'maroon')
        b.rect(35,13,38,14,'lavender'); b.rect(43,26,45,27,'ice')
        b.rect(24,44,26,47,'bronze'); b.rect(29,31,31,33,'sand'); b.line([(3,35),(8,33)],'brown',2)
    elif id==281:
        b.rect(0,0,19,5,None); b.rect(21,6,25,12,None)
        dome(b,2,18,22,25); dome(b,28,23,16,19); dome(b,30,4,10,11)
        b.line([(24,36),(28,36)],'ice',3); b.line([(24,36),(28,36)],'cyan',1)
        b.line([(36,15),(36,23)],'ice',3); b.line([(36,15),(36,23)],'cyan',1)
        coral(b,4,47); coral(b,43,47,'orange',6)
        b.line([(8,11),(14,11)],'orange',2); b.poly([(7,11),(4,9),(4,13)],'gold')
        b.rect(41,8,42,9,'white'); b.rect(26,44,29,46,'green'); b.rect(13,44,15,45,'rose')
    elif id==282:
        b.rect(0,0,14,5,None); b.rect(36,3,47,8,None)
        b.poly([(18,44),(18,14),(24,0),(30,14),(30,44)],'slate'); b.rect(21,14,27,43,'stone')
        b.line([(24,0),(24,43)],'verdigris',2); windows(b,21,18,2,'gold',5)
        windows(b,21,27,2,'yellow',5); windows(b,21,36,2,'gold',5)
        b.rect(11,14,34,16,'stone'); b.rect(15,28,38,30,'slate')
        for pts,c in [([(0,47),(13,36),(29,29),(35,18),(26,9)],'forest'),([(10,47),(18,33),(12,25),(19,18),(33,13)],'sage'),([(46,47),(35,39),(18,31),(14,16),(21,4)],'olive'),([(40,47),(30,34),(34,25),(26,17),(29,3)],'forest')]:
            b.line(pts,c,3)
        b.ellipse(9,11,16,14,'orange'); b.ellipse(33,25,40,28,'coral')
        b.rect(11,12,13,13,'ice'); b.rect(35,26,37,27,'ice')
        b.line([(1,12),(12,28)],'ice',2); b.rect(42,19,43,20,'ultramarine')
        b.rect(7,43,10,45,'sand'); b.rect(44,43,46,45,'cyan')
    elif id==283:
        b.ellipse(16,8,29,17,None); b.rect(3,43,8,45,None); b.rect(39,43,44,45,None)
        pts=[(0,44),(9,37),(13,24),(10,15),(16,5),(28,3),(36,9),(34,20),(27,26),(23,33),(29,39),(39,37),(47,31)]
        b.line(pts,'ice',5); b.line(pts,'cyan',3); b.line(pts,'blue',1)
        b.line([(11,16),(13,21),(18,27)],'white',3); b.line([(14,22),(18,27)],'orange',2)
        b.rect(12,18,13,19,'gold'); b.rect(16,24,17,25,'gold')
        for x,y,c,h in [(4,37,'coral',12),(16,45,'pink',9),(35,47,'magenta',8),(44,23,'coral',11)]: coral(b,x,y,c,h)
        b.rect(1,44,3,47,'sand'); b.line([(28,46),(32,42)],'lime',3)
        b.line([(40,8),(44,9)],'gold',2); b.rect(34,32,36,34,'seafoam')
        b.rect(8,3,11,5,'teal'); b.rect(3,39,6,41,'rose')
    elif id==284:
        b.rect(30,24,47,47,'navy'); b.rect(38,27,46,43,None); b.rect(30,33,34,45,None)
        b.poly([(0,26),(24,26),(29,33),(29,48),(0,48)],'slate')
        b.rect(4,11,25,26,'stone'); b.rect(5,12,24,14,'white'); b.rect(5,24,24,26,'orange')
        b.rect(7,16,12,21,'verdigris'); b.rect(16,16,22,21,'navy')
        b.line([(7,26),(7,32)],'ivory',2); b.line([(22,26),(22,35)],'ivory',2)
        b.poly([(25,18),(40,22),(31,24)],'ice'); b.rect(25,17,26,19,'gold')
        b.line([(25,12),(38,12),(38,34)],'ivory',1)
        b.ellipse(35,34,42,39,'orange'); b.ellipse(37,35,40,37,'cyan')
        b.rect(33,41,34,42,'lime'); b.rect(44,27,45,28,'magenta')
        b.rect(5,40,9,43,'umber'); b.rect(1,29,3,33,'brown'); b.rect(10,26,13,27,'bronze')
        b.rect(1,0,19,1,None)
    elif id==285:
        b.ellipse(1,3,46,45,'coral'); b.ellipse(10,12,35,39,'blue')
        b.rect(12,27,33,45,'blue'); b.rect(0,36,47,47,'sand')
        b.line([(5,33),(5,17),(13,9),(30,8),(40,17),(43,35)],'rose',4)
        b.line([(8,33),(8,17),(16,11),(29,10),(37,18),(39,35)],'orange',2)
        b.rect(15,15,32,24,None); b.rect(17,25,29,26,None)
        b.poly([(10,34),(16,29),(24,27),(32,29),(38,34),(28,32),(24,35),(20,32)],'ice')
        b.line([(16,34),(16,37)],'white',2); b.line([(31,34),(31,37)],'white',2)
        b.line([(0,44),(18,42),(35,45),(47,43)],'ivory',1)
        b.line([(1,2),(7,2)],'gold',2); b.rect(42,0,47,3,'navy')
        b.rect(12,31,14,33,'seafoam'); b.rect(33,27,35,29,'teal')
    elif id==286:
        b.poly([(0,37),(48,26),(48,48),(0,48)],'slate')
        b.line([(0,42),(47,31)],'sand',2); b.line([(0,47),(47,37)],'stone',2)
        b.rect(14,19,18,35,None); b.rect(28,21,31,30,None); b.rect(10,22,12,33,None); b.rect(38,24,40,29,None)
        b.rect(43,9,47,23,None); b.poly([(22,20),(26,21),(25,37),(22,37)],None)
        for x,y,w,h in [(0,0,9,44),(14,7,7,31),(27,12,5,23),(36,15,4,17),(43,17,3,13)]:
            b.rect(x,y,x+w,y+h,'stone'); b.rect(x,y,x+1,y+h,'ivory')
            b.rect(x-1,y,x+w+1,y+2,'ivory'); b.rect(x-1,y+h,x+w+1,y+h+1,'stone')
            b.line([(x+3,y+4),(x+3,y+h-2)],'slate',1)
        b.line([(0,3),(47,17)],'ivory',3)
        b.line([(12,0),(24,24)],'ice',2); b.line([(30,0),(42,24)],'cerulean',3)
        for x,y in [(10,29),(24,27)]:
            b.ellipse(x,y-8,x+3,y-5,'ivory'); b.rect(x,y-4,x+3,y+3,'stone'); b.rect(x-1,y+4,x+4,y+6,'slate')
        b.ellipse(34,37,43,41,'sage'); b.rect(40,38,44,39,'verdigris')
        b.rect(8,35,11,38,'orange'); b.rect(26,33,28,35,'gold')
        coral(b,45,46,'magenta',6); b.rect(18,41,21,44,'rose')
        b.rect(1,45,3,47,'ultramarine'); b.line([(19,29),(20,33),(22,34)],'bronze',2)
    elif id==287:
        b.bands(['navy','verdigris','slate'],[0,20,48]); b.rect(0,0,19,3,None); b.rect(35,1,47,3,None)
        for x in [0,17,36]:
            b.rect(x,10,x+10,27,'verdigris'); b.rect(x,10,x+1,27,'stone'); b.rect(x+9,10,x+10,27,'stone'); b.rect(x,10,x+10,11,'stone'); windows(b,x+2,14,2,'cyan',5)
        for row in [0,1,2]:
            y=23+row*9
            for j in [0,1]:
                x=j*24+row*2+1; yy=y-j*3
                b.rect(x,yy+3,x+14,yy+7,'ivory')
                b.poly([(x-1,yy+2),(x+2,yy-1),(x+14,yy-1),(x+16,yy+2)],['coral','gold','purple'][row])
                b.rect(x+3,yy,x+4,yy+2,'cyan'); b.rect(x+7,yy,x+8,yy+2,'orange')
                b.rect(x+5,yy+5,x+7,yy+7,'graphite')
        for x,y,c in [(4,8,'magenta'),(14,4,'seafoam'),(24,9,'pink'),(36,3,'lime'),(44,13,'magenta'),(11,20,'seafoam'),(31,18,'pink')]:
            b.line([(x,y+3),(x,23 if y<14 else 32)],'white',1)
            b.ellipse(x-3,y-3,x+3,y+1,c); b.rect(x-3,y,x+3,y+1,c)
            b.line([(x-2,y+1),(x-2,y+4)],c,1); b.line([(x+2,y+1),(x+2,y+4)],c,1)
            b.rect(x-1,y-2,x+1,y-1,'white')
        b.rect(0,30,4,31,None); b.rect(15,37,22,38,None)
        b.rect(27,40,28,42,'bronze'); b.rect(43,44,45,46,'rose')
    elif id==288:
        b.ellipse(2,4,41,44,'umber'); b.ellipse(4,6,39,42,'ivory')
        b.line([(7,37),(6,24),(10,12),(21,7),(33,13),(37,25),(31,35),(20,36),(13,29),(15,20),(24,16),(29,21),(28,28),(23,29),(20,25),(23,23)],'coral',5)
        b.line([(7,37),(6,24),(10,12),(21,7),(33,13),(37,25),(31,35),(20,36),(13,29),(15,20),(24,16),(29,21),(28,28),(23,29),(20,25),(23,23)],'bronze',2)
        for pts in [[(6,24),(14,25)],[(11,12),(18,20)],[(26,8),(25,17)],[(36,19),(28,22)],[(33,32),(27,28)],[(21,37),(21,29)]]: b.line(pts,'bronze',2)
        b.rect(21,22,24,25,None); b.rect(43,4,47,17,None); b.rect(41,30,47,34,None)
        for x,y,c in [(10,20,'lime'),(20,11,'gold'),(31,18,'cyan'),(27,34,'rose'),(10,31,'teal'),(20,33,'sand')]: b.rect(x,y,x+2,y+3,c)
        b.line([(4,15),(3,27),(9,39),(17,42)],'ice',1)
        b.line([(11,39),(4,47)],'umber',3); b.line([(17,42),(14,47)],'coral',3)
        b.rect(45,40,47,42,'ultramarine'); b.rect(38,6,40,8,'seafoam')
    elif id==289:
        b.rect(0,3,8,47,'slate'); b.rect(40,0,47,47,'stone')
        b.rect(0,10,47,13,'ivory'); b.rect(0,13,47,15,'stone')
        for x in range(8,40,4):
            b.rect(x,16,x,27,'stone'); b.ellipse(x+1,17,x+3,21,None); b.rect(x+1,20,x+3,24,'navy')
            b.rect(x+1,25,x+3,26,'verdigris')
        b.rect(6,27,42,29,'stone')
        for x in [8,14,20,26,33]:
            b.rect(x,29,x+1,38,'stone'); b.ellipse(x+2,30,x+5,35,None)
            if x in [8,20,33]:
                b.line([(x+2,34),(x+5,34)],'bronze',1); b.line([(x+4,32),(x+4,36)],'gold',1)
        b.rect(0,38,47,40,'slate'); b.line([(9,7),(33,7)],'white',3); b.line([(9,9),(33,9)],'orange',1)
        windows(b,12,6,4,'cyan',5)
        b.poly([(14,43),(25,39),(34,43),(25,42),(24,46)],'teal')
        b.rect(2,23,4,25,'graphite'); b.rect(42,18,44,20,'ultramarine'); b.rect(5,37,6,39,'seafoam'); b.rect(11,21,11,23,'navy'); b.rect(15,21,15,23,'navy'); b.rect(19,21,19,23,'navy')
        b.rect(2,44,5,46,'sand'); b.rect(43,43,46,45,'umber')
    elif id==290:
        b.bands(['coral','orange','cerulean','blue','navy'],[0,6,12,24,36,48])
        b.line([(0,12),(9,13),(18,12),(29,13),(39,12),(47,13)],'white',2)
        b.poly([(0,48),(0,25),(12,24),(17,34),(28,36),(33,48)],'slate')
        for y,x,w in [(21,0,21),(33,0,29),(43,0,37)]: b.rect(x,y,x+w,y+2,'stone')
        for x,y,w,h in [(3,16,12,8),(18,25,10,9),(25,36,10,9)]: dome(b,x,y,w,h)
        for x,top,bottom in [(18,3,23),(26,1,23),(32,6,30)]:
            b.rect(x,top+4,x+3,bottom,'verdigris'); b.poly([(x-1,top+4),(x+4,top+4),(x+1,top)],'gold')
            b.rect(x+1,top+5,x+2,11,'ivory'); b.rect(x+1,16,x+2,18,'ice')
        b.poly([(7,11),(12,5),(12,11)],'ivory'); b.line([(12,4),(12,11)],'gold',1)
        b.line([(15,22),(24,24),(14,33),(29,35),(22,44),(36,44)],'ice',3)
        b.line([(15,22),(24,24),(14,33),(29,35),(22,44),(36,44)],'cyan',1)
        b.line([(39,14),(44,24)],'ice',2); b.line([(5,14),(10,19)],'ice',2)
        b.rect(43,36,47,43,None); b.rect(6,20,7,22,None); b.rect(22,30,23,32,None)
        for x,y,c in [(2,41,'magenta'),(13,41,'lime'),(18,44,'seafoam')]: b.rect(x,y,x+2,y+2,c)
        coral(b,2,23); coral(b,11,35,'rose',5)
        b.ellipse(35,29,44,33,'slate'); b.poly([(36,31),(32,28),(32,34)],'slate')
        b.rect(38,30,39,31,'ice'); b.put(42,31,'stone'); b.rect(43,4,47,5,'rose')
        b.rect(3,7,6,8,'gold'); b.line([(7,33),(11,34)],'sand',2)
    if id==286:
        b.rect(11,24,13,35,None); b.rect(22,25,24,33,None); b.rect(36,29,38,34,None)
        b.line([(10,40),(13,40)],'bronze',2)
    if id==262:
        b.cells=[[{'olive':'forest','brown':'stone'}.get(c,c) for c in row] for row in b.cells]
    if id==267:
        b.cells=[['forest' if c=='olive' else c for c in row] for row in b.cells]
    if id==270:
        b.cells=[[{'graphite':'pine','sand':'ice'}.get(c,c) for c in row] for row in b.cells]
    return b

if __name__ == '__main__':
    drafts=[]
    for world,name in [(26,'DESERT_KINGDOMS'),(27,'DEEP_JUNGLE'),(28,'UNDERWORLD'),(29,'OCEAN_CITIES')]:
        text=(DESIGN/f'WORLD_{world}_{name}.md').read_text()
        for id,title in re.findall(r'^## (\d+) — (.+)$',text,re.M):
            id=int(id); title=title.split(' *')[0]
            b=board(id); colors={c for row in b.cells for c in row if c}
            drafts.append(dict(id=id,title=title,grid=b.rows(),legend={ENCODE[c]:c for c in sorted(colors)}))
            print(id,title,sum(c is not None for row in b.cells for c in row),len(colors))
    Path('dist/m16a/art.json').write_text(json.dumps(drafts,indent=2)+'\n')
