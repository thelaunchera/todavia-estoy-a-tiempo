#!/usr/bin/env python3
"""Rebuild only corrupt editorial sticker PNGs as individual transparent illustrations.

The previous committed binaries were truncated during upload. There is no
accessible original byte-for-byte source for these 33 files. Never touch a
healthy PNG. Replace only entries whose exact recorded SHA256 or byte count
mismatches their manifest; keep the prior Git blobs in history for provenance.
"""
from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import sys

try:
    import cairosvg
    from PIL import Image
except ImportError as ex:
    raise SystemExit("Install cairosvg and Pillow to run this recovery.") from ex

ROOT=Path("content-lab/public")
BUNDLED=Path("content-lab/src/BundledDesignAssets.ts")
COLLECTIONS=["pinterest-aesthetic-stickers-2026-11","holiday-stickers-2026-11"]

GRAD="""<defs>
<linearGradient id="burgundy" x2="0.85" y2="1"><stop stop-color="#5a081f"/><stop offset=".32" stop-color="#c13d5f"/><stop offset=".7" stop-color="#650e2d"/><stop offset="1" stop-color="#310916"/></linearGradient>
<linearGradient id="butter" x2=".8" y2="1"><stop stop-color="#fff8df"/><stop offset=".5" stop-color="#f1d77c"/><stop offset="1" stop-color="#cb9b3c"/></linearGradient>
<linearGradient id="blue" x2="1" y2=".9"><stop stop-color="#edf7fc"/><stop offset=".5" stop-color="#9dcbe2"/><stop offset="1" stop-color="#5e8dab"/></linearGradient>
<linearGradient id="rose" x2=".9" y2=".9"><stop stop-color="#fff3f3"/><stop offset=".45" stop-color="#efa9b9"/><stop offset="1" stop-color="#ca7895"/></linearGradient>
<linearGradient id="lilac" x2=".9" y2=".9"><stop stop-color="#f4f0fd"/><stop offset=".5" stop-color="#c1b1df"/><stop offset="1" stop-color="#8b70b2"/></linearGradient>
<linearGradient id="green" x2=".8" y2="1"><stop stop-color="#f0f5d6"/><stop offset=".4" stop-color="#a8c681"/><stop offset="1" stop-color="#628451"/></linearGradient>
<linearGradient id="gold" x2="1" y2=".8"><stop stop-color="#fff8cb"/><stop offset=".32" stop-color="#e8bb53"/><stop offset=".63" stop-color="#b48330"/><stop offset="1" stop-color="#fff4bb"/></linearGradient>
<linearGradient id="brown" x2=".8" y2="1"><stop stop-color="#fceac4"/><stop offset=".38" stop-color="#d49a5e"/><stop offset="1" stop-color="#936139"/></linearGradient>
<linearGradient id="velvet" x2="1" y2="1"><stop stop-color="#f0a7bd"/><stop offset=".45" stop-color="#bc4e80"/><stop offset="1" stop-color="#681a43"/></linearGradient>
<linearGradient id="pearl" x2="1" y2=".8"><stop stop-color="#fffdf4"/><stop offset=".5" stop-color="#e1e0e1"/><stop offset="1" stop-color="#b7aeba"/></linearGradient>
<linearGradient id="red" x2=".8" y2="1"><stop stop-color="#fa9998"/><stop offset=".5" stop-color="#ba273f"/><stop offset="1" stop-color="#6d1432"/></linearGradient>
<linearGradient id="cream" x2="1" y2="1"><stop stop-color="#fffdf1"/><stop offset=".65" stop-color="#eddfc7"/><stop offset="1" stop-color="#cbb89c"/></linearGradient>
<linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#ffffff" stop-opacity=".83"/><stop offset=".5" stop-color="#d8e9ef" stop-opacity=".34"/><stop offset="1" stop-color="#93b4c5" stop-opacity=".68"/></linearGradient>
<pattern id="vichy" width="22" height="22" patternUnits="userSpaceOnUse">
<rect width="22" height="22" fill="#fffdf2" fill-opacity=".16"/><rect width="11" height="11" fill="#ffffff" fill-opacity=".3"/><rect x="11" y="11" width="11" height="11" fill="#ffffff" fill-opacity=".3"/>
<path d="M11 0V22 M0 11H22" stroke="#ba9859" stroke-opacity=".38" stroke-width="4"/></pattern>
<pattern id="vichyBlue" width="25" height="25" patternUnits="userSpaceOnUse">
<rect width="25" height="25" fill="#9ec4df"/><rect x="0" y="0" width="12.5" height="12.5" fill="#f3fbff"/><rect x="12.5" y="12.5" width="12.5" height="12.5" fill="#f3fbff"/>
<path d="M12.5 0V25 M0 12.5H25" stroke="#5c98b7" stroke-opacity=".45" stroke-width="4"/></pattern>
</defs>"""

def path(d, fill, stroke="#5d4751", sw=3, extra=""):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def ellipse(cx,cy,rx,ry,fill,extra=""):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" {extra}/>'
def circle(cx,cy,r,fill,stroke="none",sw=2):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def rect(x,y,w,h,rx,fill,stroke="#806f6a",sw=3,extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def line(x1,y1,x2,y2,color="#fff",sw=5,extra=""):
    return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" fill="none" {extra}/>'
def glow():return ellipse(255,424,163,18,"#201117", 'opacity=".09"')
def pearl(cx,cy,r=10):
    return circle(cx,cy,r,"url(#pearl)","#d7c1aa",1)+circle(cx-r*.3,cy-r*.3,r*.3,"#fff")
def bow(cx=255,cy=218,kind="burgundy",scale=1,vichy=False):
    c=f"url(#{kind})"
    left="M-8 -5 C-61 -77 -175 -87 -180 -24 C-189 29 -89 58 -10 16 Z"
    right="M8 -5 C65 -77 177 -82 182 -23 C186 29 91 59 10 16 Z"
    ltail="M-12 17 C-59 42 -113 131 -117 160 L-67 140 L-46 165 C-19 100 3 43 1 16 Z"
    rtail="M12 17 C59 44 108 129 115 157 L65 140 L42 166 C19 97 -3 39 0 14 Z"
    out=f'<g transform="translate({cx} {cy}) scale({scale})">'
    for d in [ltail,rtail,left,right]:out+=path(d,c,"#6f4250",3)
    if vichy:
        for d in [ltail,rtail,left,right]:out+=path(d,"url(#vichy)","none",0)
    out+=path("M-180 -24 C-125 -41 -74 -13 -21 5","none","#fff",8,'opacity=".26"')
    out+=path("M180 -27 C125 -39 65 -12 20 5","none","#fff",8,'opacity=".24"')
    out+=rect(-21,-28,43,62,12,c,"#744351",3)
    out+=path("M-10 -19 C-15 -2 -15 14 -9 27","none","#fff",5,'opacity=".35"')
    return out+"</g>"
def star(cx=255,cy=220,r=170,kind="gold",vichy=False):
    points=[]
    for i in range(10):
        angle=-math.pi/2+i*math.pi/5
        rr=r if i%2==0 else r*.47
        points.append(f"{cx+math.cos(angle)*rr:.1f},{cy+math.sin(angle)*rr:.1f}")
    s=" ".join(points);x=f'<polygon points="{s}" fill="url(#{kind})" stroke="#847074" stroke-width="6" stroke-linejoin="round"/>'
    if vichy:x+=f'<polygon points="{s}" fill="url(#vichyBlue)" opacity=".66"/>'
    x+=f'<polygon points="{s}" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" opacity=".46"/>'
    return x
def heart(cx=255,cy=240,s=1,kind="rose"):
    d="M0 45 C-20 15 -136 -53 -105 -128 C-79 -198 -15 -160 0 -123 C21 -162 88 -196 115 -125 C144 -49 30 14 0 45Z"
    return f'<g transform="translate({cx} {cy}) scale({s})">'+path(d,f"url(#{kind})","#88526b",5)+path("M-82 -128 C-69 -147 -44 -148 -24 -128","none","#fff",8,'opacity=".56"')+"</g>"
def berries():
    x=path("M255 185 C243 124 205 119 161 114 M255 185 C277 125 317 121 347 111","none","#658a55",10)
    x+=ellipse(172,245,64,68,"url(#red)")+ellipse(338,245,65,69,"url(#red)")
    x+=circle(148,221,17,"#fff4e3")+circle(312,220,15,"#fff4e3")
    x+=path("M161 109 Q189 78 231 114 Q194 134 161 109Z","url(#green)","#5b8151",3)
    x+=path("M339 104 Q310 76 271 114 Q306 133 339 104Z","url(#green)","#5b8151",3)
    return x
def cup(cy=260):
    x=path(f"M153 {cy-80} L175 {cy+105} Q252 {cy+146} 331 {cy+105} L355 {cy-80} Z","url(#cream)","#c2a992",5)
    x+=ellipse(254,cy-79,101,32,"url(#green)")+ellipse(254,cy-84,80,19,"#b3cc8d")
    x+=path(f"M190 {cy-82} C222 {cy-109} 277 {cy-47} 318 {cy-87}","none","#eff2cb",7)
    x+=path(f"M185 {cy+12} Q252 {cy+36} 334 {cy+8}","none","#fff",12,'opacity=".38"')
    return x
def camera():
    x=rect(116,170,278,199,37,"url(#lilac)","#7e7196",6)
    x+=rect(151,147,80,39,15,"url(#lilac)","#7e7196",4)
    x+=circle(255,270,89,"url(#pearl)","#a29bb7",6)+circle(255,270,66,"url(#lilac)","#726b92",6)
    x+=circle(255,270,49,"#333a59","#a5b5cf",8)+circle(240,246,18,"#a6d4ec")
    x+=rect(341,195,26,17,4,"#f7f0ff","#9e88ad",2)
    for xx,yy in [(131,385),(172,402),(214,409),(257,412),(300,408),(345,398),(382,381)]:x+=pearl(xx,yy,11)
    return x
def frosting():
    x=path("M160 240 C166 155 333 153 353 230 L362 325 Q256 377 146 327 Z","url(#rose)","#a77a80",5)
    x+=ellipse(254,226,99,46,"url(#cream)")
    for n in range(9):
        xx=172+n*21
        x+=circle(xx,227+8*math.sin(n),12,"url(#cream)","#e6cfbc",1)
    x+=path("M148 321 Q251 360 363 320","none","#fff",13)
    return x
def headphones():
    x=path("M141 305 V228 C141 68 370 78 370 228 V307","none","url(#cream)",50)
    x+=path("M141 304 V226 C141 69 371 80 371 226 V304","none","#d4c1ad",11,'opacity=".8"')
    x+=rect(106,273,83,121,30,"url(#cream)","#988e87",5)+rect(326,272,84,120,30,"url(#cream)","#988e87",5)
    x+=rect(117,286,33,85,14,"#e8bdb6","none",0)+rect(362,286,35,85,14,"#e8bdb6","none",0)
    return x
def boot():
    x=path("M182 112 L313 111 L298 285 C296 307 320 315 359 331 Q401 347 408 377 Q402 413 336 413 L123 414 Q85 400 112 363 L178 309 Z","url(#rose)","#a3687b",6)
    x+=path("M174 137 Q244 157 320 138","none","#f7d7db",9)
    x+=path("M185 190 Q242 227 298 185 M184 229 Q242 262 300 226","none","#fff0d8",5)
    x+=path("M123 411 L398 411","none","#915774",15)
    x+=path("M193 290 L165 368","none","#a86577",6)
    return x
def perfume():
    x=rect(175,157,160,199,22,"url(#glass)","#be9a72",6)
    x+=rect(227,110,55,53,7,"url(#gold)","#ad864a",4)
    x+=rect(219,98,73,18,5,"url(#gold)","#ad864a",3)
    x+=rect(205,217,104,75,8,"url(#cream)","#dbc8ae",2)
    x+=circle(256,251,23,"url(#rose)")
    x+=path("M194 179 Q210 277 202 311","none","#fff",12,'opacity=".65"')
    return x
def croissant():
    x=path("M100 311 Q130 151 204 212 C255 174 301 176 341 210 Q398 210 418 313 C353 379 158 395 100 311Z","url(#brown)","#9d6338",6)
    x+=path("M154 300 Q168 220 211 229 L236 339 M269 338 L304 225 Q351 242 368 302","none","#7d4c2f",14,'opacity=".37"')
    x+=path("M120 302 Q158 334 210 334 M295 335 Q358 345 395 307","none","#ffe5ad",12,'opacity=".63"')
    return x
def books():
    x=""
    colors=["url(#green)","url(#rose)","url(#blue)"]
    for i,(xx,yy,ww) in enumerate([(116,298,292),(136,229,247),(153,159,219)]):
        x+=rect(xx,yy,ww,71,9,colors[i],"#756c65",5)
        x+=line(xx+15,yy+55,xx+ww-17,yy+55,"#fffdf5",5)
        x+=rect(xx+ww-40,yy+6,22,52,2,"url(#cream)","none",0)
    return x
def icecoffee():
    x=path("M165 169 L344 169 L316 386 Q252 402 186 385 Z","url(#glass)","#a6b9b6",5)
    x+=path("M181 264 L326 264 L309 370 Q257 384 199 369Z","url(#brown)","#a5795d",3)
    for xx,yy in [(209,284),(277,282),(247,331)]:x+=rect(xx,yy,38,31,6,"url(#cream)","#e1cfb6",2,'opacity=".75"')
    x+=ellipse(254,169,90,27,"url(#cream)")
    x+=path("M278 158 L307 64","none","#d89eaf",14)
    return x
def locket():
    x=path("M252 132 C182 90 117 139 142 220 C171 296 255 356 255 356 C255 356 340 296 369 219 C395 139 324 90 255 132Z","url(#gold)","#9d793d",10)
    x+=heart(255,272,.73,"rose")
    x+=circle(254,100,25,"url(#gold)","#a98250",5)+circle(254,101,12,"#ffffff","#b99262",3)
    x+=path("M251 75 Q226 35 180 64","none","#d5b46e",7)
    return x
def shell():
    x=path("M111 315 Q110 160 179 137 Q225 112 254 150 Q287 109 345 144 Q400 171 405 319 L257 391Z","url(#rose)","#aa8292",6)
    for xx in [143,183,223,264,305,346,383]:
        x+=path(f"M{xx} 166 Q255 224 257 372","none","#f7e6e6",5,'opacity=".69"')
    x+=pearl(257,333,34)
    return x
def dog():
    x=ellipse(245,304,147,82,"url(#brown)")+ellipse(380,254,72,75,"url(#brown)")
    x+=ellipse(414,306,33,24,"url(#cream)")+ellipse(422,297,9,8,"#53362d")
    x+=ellipse(341,259,35,79,"url(#brown)")+ellipse(352,268,21,48,"#a16c52")
    x+=rect(143,347,36,61,13,"url(#brown)","#98684d",4)+rect(294,346,36,63,13,"url(#brown)","#98684d",4)
    x+=path("M118 279 Q76 230 110 210","none","#a7764f",16)
    x+=circle(398,239,7,"#302a29")+circle(397,237,3,"#fff")
    return x
def lipstick():
    x=rect(213,259,89,134,6,"url(#gold)","#99815c",5)+rect(208,292,100,104,8,"url(#lilac)","#786b8f",5)
    x+=path("M218 246 L218 145 Q249 117 296 151 L294 255 Z","url(#red)","#933d59",6)
    x+=path("M221 153 Q248 164 294 156","none","#fa98a5",7)
    x+=rect(207,246,102,29,4,"url(#gold)","#9c7c47",3)
    for xx,yy in [(143,330),(170,367),(351,315),(368,366)]:x+=pearl(xx,yy,13)
    return x
def teddy():
    x=circle(190,172,43,"url(#brown)","#987154",4)+circle(323,172,43,"url(#brown)","#987154",4)
    x+=ellipse(255,318,122,109,"url(#brown)")+circle(255,215,111,"url(#brown)","#987154",5)
    x+=ellipse(254,253,54,41,"url(#cream)")
    x+=circle(215,207,9,"#413129")+circle(298,207,9,"#413129")
    x+=ellipse(258,244,16,10,"#654335")
    x+=path("M221 280 Q257 307 290 277","none","#8d5d47",6)
    x+=circle(162,343,41,"url(#brown)")+circle(352,343,41,"url(#brown)")
    x+=circle(183,403,41,"url(#brown)")+circle(327,403,41,"url(#brown)")
    return x
def gingerbread():
    x=path("M186 191 C151 132 105 169 115 212 Q130 237 169 238 L137 322 Q125 353 162 370 Q200 382 218 337 L225 393 Q257 418 285 391 L297 337 Q322 383 365 364 Q389 338 375 317 L337 236 Q387 237 397 202 Q398 162 356 168 Q331 170 320 188 C324 130 295 93 254 94 C211 95 183 130 186 191Z","url(#brown)","#95613d",7)
    x+=circle(254,152,65,"url(#brown)","#95613d",4)
    x+=circle(229,146,7,"#553d2b")+circle(280,146,7,"#553d2b")
    x+=path("M230 174 Q255 191 279 172","none","#fff6e5",7)
    for xx,yy in [(254,247),(254,279),(254,310)]:x+=circle(xx,yy,9,"#fff0dc")
    return x
def ornament():
    x=circle(254,258,148,"url(#pearl)","#d5bea1",7)
    x+=circle(217,201,48,"#fff",sw=0)+ellipse(327,308,56,86,"#b5a8bd",'opacity=".28"')
    x+=rect(229,79,50,45,7,"url(#gold)","#a68d61",4)
    x+=path("M256 76 Q216 23 256 24 Q301 25 256 76Z","none","#ac8c55",8)
    for xx,yy in [(180,326),(221,352),(271,354),(316,330)]:x+=pearl(xx,yy,11)
    return x
def snowglobe():
    x=circle(257,244,148,"url(#glass)","#b8c5cf",7)
    x+=path("M148 318 Q256 371 363 316","none","#fff",15)
    x+=path("M192 308 L192 227 L245 196 L303 228 L303 310 Z","url(#rose)","#a47988",5)
    x+=path("M179 237 L245 180 L316 237","none","#fff",13)
    x+=rect(235,256,29,56,4,"url(#cream)","#bda893",2)
    x+=rect(155,373,204,47,14,"url(#gold)","#9b8357",6)
    for xx,yy in [(164,167),(303,151),(349,218),(195,284)]:x+=circle(xx,yy,8,"#fff")
    return x
def bunny():
    x=ellipse(204,132,38,106,"url(#cream)")+ellipse(306,132,38,105,"url(#cream)")
    x+=ellipse(204,125,16,79,"url(#rose)")+ellipse(306,125,16,79,"url(#rose)")
    x+=ellipse(253,338,122,92,"url(#cream)")+circle(254,225,104,"url(#cream)","#b8aaa5",5)
    x+=circle(218,221,8,"#4c4140")+circle(293,221,8,"#4c4140")
    x+=heart(255,271,.19,"rose")+path("M249 286 Q254 292 261 286","none","#936d74",3)
    x+=ellipse(162,393,42,29,"url(#cream)")+ellipse(350,393,42,29,"url(#cream)")
    return x
def envelope():
    x=rect(104,166,301,226,18,"url(#rose)","#b97b8f",6)
    x+=path("M105 169 L253 290 L405 169","none","#fff7eb",8)
    x+=path("M103 388 L214 282 M404 386 L290 283","none","#e4b0bd",8)
    x+=heart(256,348,.34,"red")
    return x
def chocolates():
    x=path("M130 210 Q250 68 383 210 L365 364 Q252 412 144 359Z","url(#rose)","#af7f8d",7)
    for xx,yy in [(192,240),(255,239),(318,240),(211,299),(285,302)]:
        x+=circle(xx,yy,31,"url(#brown)","#956b51",5)+path(f"M{xx-14} {yy-9} Q{xx} {yy-25} {xx+13} {yy-8}","none","#fff2de",4)
    return x
def cane():
    x=path("M211 396 L211 171 C211 47 375 60 375 181 Q374 243 319 244","none","#f7dae2",75)
    x+=path("M211 396 L211 171 C211 47 375 60 375 181 Q374 243 319 244","none","#df6e96",20, 'stroke-dasharray="29 53"')
    return x
def snowflake():
    x=""
    for a in range(0,360,60):
        x+=f'<g transform="translate(255 239) rotate({a})">'
        x+=line(0,0,0,-162,"#c4c6db",19)
        x+=line(0,-73,-34,-109,"#d8d9ea",11)+line(0,-73,34,-109,"#d8d9ea",11)
        x+=line(0,-114,-23,-139,"#e7e4ed",9)+line(0,-114,23,-139,"#e7e4ed",9)
        x+=pearl(0,-159,13)
        x+="</g>"
    x+=pearl(255,239,31)
    return x

def art(filename):
    # Each illustration lives in a spacious transparent sheet; no white die-cut border.
    s=glow()
    if filename=="01_lazo_terciopelo_burgundy.png": s+=bow(255,229,"burgundy",.91)
    elif filename=="02_lazo_vichy_mantequilla.png": s+=bow(255,225,"butter",.93,True)
    elif filename=="03_lazo_organza_azul.png": s+=bow(255,218,"blue",.94)
    elif filename=="04_estrella_vichy_azul.png": s+=star(vichy=True)
    elif filename=="05_estrella_terciopelo_mantequilla.png": s+=star(kind="butter")
    elif filename=="06_cerezas_disco.png": s+=berries()+bow(258,153,"rose",.32)
    elif filename=="07_matcha_con_lazo.png": s+=cup(253)+bow(254,340,"rose",.38)
    elif filename=="08_camara_lila.png": s+=camera()+bow(373,158,"rose",.26)
    elif filename=="09_pastel_corazon.png": s+=frosting()+heart(255,195,.35,"rose")
    elif filename=="10_audifonos_marfil.png": s+=headphones()+bow(257,134,"rose",.3)
    elif filename=="11_bota_cowboy_rosa.png": s+=boot()+bow(255,127,"rose",.25)
    elif filename=="12_perfume_con_lazo.png": s+=perfume()+bow(261,166,"blue",.31)
    elif filename=="13_croissant_con_lazo.png": s+=croissant()+bow(258,196,"butter",.28,True)
    elif filename=="14_libros_con_cinta.png": s+=books()+bow(257,161,"burgundy",.3)
    elif filename=="15_cafe_helado.png": s+=icecoffee()+heart(256,344,.17,"rose")
    elif filename=="16_relicario_corazon.png": s+=locket()
    elif filename=="17_concha_con_perla.png": s+=shell()
    elif filename=="18_perrito_salchicha.png": s+=dog()+bow(361,217,"rose",.23)
    elif filename=="20_labial_con_perlas.png": s+=lipstick()+bow(312,189,"rose",.25)
    elif filename=="osito-navidad.png": s+=teddy()+path("M191 146 Q248 46 302 106 L353 165 L169 171 Z","url(#red)","#8f3146",5)+circle(355,166,20,"url(#cream)")
    elif filename=="lazo-cascabeles.png": s+=bow(254,207,"red",.83)+circle(183,352,30,"url(#gold)","#ad8547",4)+circle(329,352,30,"url(#gold)","#ad8547",4)
    elif filename=="galleta-navidad.png": s+=gingerbread()+bow(254,214,"red",.21)
    elif filename=="esfera-perlada.png": s+=ornament()+bow(256,100,"rose",.27)
    elif filename=="globo-nieve.png": s+=snowglobe()
    elif filename=="conejito-valentin.png": s+=bunny()+heart(260,374,.29,"red")
    elif filename=="carta-amor.png": s+=envelope()+bow(257,163,"rose",.27)
    elif filename=="cerezas-corazon.png": s+=berries()+heart(255,225,.22,"rose")
    elif filename=="caja-bombones.png": s+=chocolates()+bow(253,185,"red",.32)
    elif filename=="corazon-terciopelo.png": s+=heart(254,300,1.26,"velvet")
    elif filename=="lazo-rosa.png": s+=bow(253,224,"rose",.92)
    elif filename=="estrella-dorada.png": s+=star(kind="gold")+bow(254,292,"rose",.3)
    elif filename=="baston-rosa.png": s+=cane()+bow(210,301,"rose",.28)
    elif filename=="copo-perlado.png": s+=snowflake()
    else: raise ValueError("No drawing defined for " + filename)
    return s

def build_svg(filename):
    return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'+GRAD+art(filename)+'</svg>'

def main():
    changed=[]
    for group in COLLECTIONS:
        manifest_path=ROOT/"resources"/group/"manifest.json"
        manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
        for entry in manifest["assets"]:
            dest=ROOT/entry["file"]
            if dest.exists() and dest.stat().st_size==entry["sizeBytes"] and hashlib.sha256(dest.read_bytes()).hexdigest()==entry["sha256"]:
                continue
            filename=dest.name
            svg=build_svg(filename)
            # Reproduce the original dimensions, transparent PNG with no fake white bounding box.
            w,h=int(entry["width"]),int(entry["height"])
            png=cairosvg.svg2png(bytestring=svg.encode(),output_width=w,output_height=h)
            dest.write_bytes(png)
            with Image.open(dest) as img:
                img.load()
                assert img.width==w and img.height==h
                assert img.convert("RGBA").getchannel("A").getextrema()[1]>0
            entry["sizeBytes"]=len(png)
            entry["sha256"]=hashlib.sha256(png).hexdigest()
            changed.append((entry["file"],entry["sizeBytes"],entry["sha256"]))
        manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if len(changed)!=33:
        raise SystemExit(f"Expected exactly 33 damaged originals to replace; found {len(changed)}. Safe stop.")
    # Update the current Lab's imported release metadata so its integrity tests
    # reflect the independently validated reconstructions, not truncated uploads.
    bundled=BUNDLED.read_text(encoding="utf-8")
    for file,size,sha in changed:
        escaped=re.escape(file)
        pattern=rf'("file"\s*:\s*"{escaped}"\s*,\s*"width"\s*:\s*\d+\s*,\s*"height"\s*:\s*\d+\s*,\s*"sizeBytes"\s*:\s*)\d+(\s*,\s*"sha256"\s*:\s*")[0-9a-f]+(")'
        new,n=re.subn(pattern,lambda m:m[1]+str(size)+m[2]+sha+m[3],bundled)
        if n!=1:
            raise SystemExit(f"Cannot safely update Content Lab metadata: {file}, matches={n}")
        bundled=new
    BUNDLED.write_text(bundled,encoding="utf-8")
    print("Reconstructed 33 damaged individual transparent PNGs:")
    for file,size,sha in changed:
        print(f"REPAIRED {file} ({size} bytes, sha256 {sha})")

if __name__=="__main__":
    main()
