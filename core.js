'use strict';
(function(){
const G=window.G={};
// ===================== Hilfsfunktionen =====================
const h2=(x,y,s)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;};
function noise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=h2(xi,yi,s),b=h2(xi+1,yi,s),c=h2(xi,yi+1,s),d=h2(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
const fbm=(x,y,s)=>noise(x/9,y/9,s)*.6+noise(x/4,y/4,s+1)*.3+noise(x,y,s+2)*.1;
const rnd=(a,b)=>a+Math.random()*(b-a),rint=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const sm=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
function shade(hx,a){const n=parseInt(hx.slice(1),16);const c=v=>Math.max(0,Math.min(255,v|0));return `rgb(${c((n>>16)+a)},${c(((n>>8)&255)+a)},${c((n&255)+a)})`;}
const hexRGB=hx=>{const n=parseInt(hx.slice(1),16);return [(n>>16)/255,((n>>8)&255)/255,(n&255)/255];};
Object.assign(G,{h2,noise,fbm,rnd,rint,pick,shuffle,clamp,sm,shade,hexRGB});
G.toast=(...a)=>{if(G.ui&&G.ui.toast)G.ui.toast(...a);};
const sfx=(n,o)=>{if(G.sfx)G.sfx(n,o);};

// ===================== Einstellungen & Schwierigkeit =====================
const SETK='eichenhain_settings_v2',SAVEK='eichenhain_save_v5',SAVEK4='eichenhain_save_v4';
G.settings={mode:'3d',quality:'mid',diff:'normal',dmgNums:true,zoom:'normal',cam:'top',invX:'0',invY:'0',sens:'1',rd:'auto',win:'window',fps:'60',gui:'100',mini:'140',vMaster:80,vSfx:80,vMusic:55,vVoice:85,voices:'speech'};
try{const s=JSON.parse(localStorage.getItem(SETK)||'null');if(s)Object.assign(G.settings,s);}catch(e){}
G.saveSettings=()=>{try{localStorage.setItem(SETK,JSON.stringify(G.settings));}catch(e){}};
G.DIFF={
 leicht:{n:'Leicht',d:'Für Entdecker. Monster sind schwächer, du steigst schneller auf und Quests sind kürzer.',mhp:1,mdmg:1,xpN:.75,pen:.05,ilvl:0,N:[55.544,28,12,4,0.446,0.005],B:[26.596,35,25,11,2.394,0.006],M:[41.24,32,18,7.5,1.24,0.01],chM:.6,chN:.30,chB:.70,gold:1,goldLoss:0},
 normal:{n:'Normal',d:'Ausgewogen. Gegner über deiner Stufe sind gefährlich, und gute Ausrüstung ist Pflicht.',mhp:1.5,mdmg:1.45,xpN:1,pen:.09,ilvl:1,N:[52.539,29,13,5,0.441,0.009],B:[23.988,35,26,12,2.982,0.018],M:[37.485,32,20,9,1.485,0.015],chM:.62,chN:.30,chB:.72,gold:1.15,goldLoss:.1},
 schwer:{n:'Schwer',d:'Für Veteranen. Gnadenlose Gegner und längere Quests, dafür aber deutlich besserer Loot.',mhp:2.2,mdmg:2,xpN:1.35,pen:.12,ilvl:3,N:[43.347,31,17,7.5,1.103,0.023],B:[15.16,30,32,18,4.74,0.06],M:[26.96,32,25,13,2.96,0.04],chM:.7,chN:.36,chB:.82,gold:1.35,goldLoss:.2},
};
const DK=['leicht','normal','schwer'];
G.D=()=>G.DIFF[G.settings.diff]||G.DIFF.normal;
G.di=()=>Math.max(0,DK.indexOf(G.settings.diff));
const QD={lvH:[11,12,14],schnitter:[13,14,16],eldtree:[15,16,18],sandking:[16,17,19],prove:[4,6,10],wolves:[6,8,12],ears:[4,6,9],draugr:[6,8,12],lvG:[4,5,7],lvM:[9,10,12],lvD:[18,20,23],grukk:[6,7,9],morvax:[11,12,14],dragon:[22,24,27]};
const qd=k=>QD[k][G.di()];G.qd=qd;


// ===================== Welt =====================
const TILE=32,WW=576,H=576,W=WW+120,VCX=288,VCY=300,RV=36,CH=16,SEED=4242;
const T={GRASS:0,GRASS2:1,PATH:2,WATER:3,TREE:4,ROCK:5,SAND:6,COBBLE:7,HOUSE:8,FIELD:9,ASH:10,WALL:11,FLOWER:12,DEAD:13,SWAMP:14,LAVA:15,DIRT:16,WELL:17,CWALL:18,TOWER:19,TENT:20,FIRE:21,RUIN:22,BARRIER:23,CRYPT:24,CROP:25,VOID:26,WOOD:27,STONEF:28,IWALL:29,SWALL:30,DOOR:31,TABLE:32,BED:33,BARREL:34,SHELF:35,HEARTH:36,ANVIL:37,ALTAR:38,PEW:39,CARPET:40,CHEST:41,PILLAR:42,CRATE:43,THRONE:44,SNOW:45,ICE:46,GOLD:47,FWALL:48,WAYSTONE:49,CLIFF:50,CACTUS:51,MUSH:52,DGRASS:53,BONES:54,BURNT:55,STUMP:56,HERBS:57,BRIDGE:58,LEDGE:59,CLIMB:60,PFURN:61,HAY:62,STALL:63,STRAW:64,TROUGH:65,CART:66,SACK:67,PFENCE:68,OVEN:69,RACK:70,DUMMY:71,COUNTER:72,LOOM:73,CAULDRON:74,BENCH:75,ARMOR:76,DESK:77,GRIND:78,WHEEL:79,DIVAN:80,FUR:81};
const SOLIDS=new Uint8Array(96);[T.WATER,T.TREE,T.ROCK,T.HOUSE,T.WALL,T.DEAD,T.LAVA,T.WELL,T.CWALL,T.TOWER,T.TENT,T.FIRE,T.RUIN,T.CRYPT,T.VOID,T.IWALL,T.SWALL,T.TABLE,T.BED,T.BARREL,T.SHELF,T.HEARTH,T.ANVIL,T.ALTAR,T.PEW,T.CHEST,T.PILLAR,T.CRATE,T.THRONE,T.FWALL,T.WAYSTONE,T.CLIFF,T.CACTUS,T.MUSH,T.STUMP,T.CLIMB,T.PFURN,T.HAY,T.STALL,T.TROUGH,T.CART,T.SACK,T.PFENCE,T.OVEN,T.RACK,T.DUMMY,T.COUNTER,T.LOOM,T.CAULDRON,T.BENCH,T.ARMOR,T.DESK,T.GRIND,T.WHEEL,T.DIVAN].forEach(t=>SOLIDS[t]=1);
const map=new Uint8Array(W*H),BIO=new Uint8Array(WW*H);
const BNAMES=['village','meadow','forest','swamp','waste','winter','ash','dark','desert','peaks'];
const dV=(x,y)=>Math.hypot(x-VCX,y-VCY);
const TOWNS=[{id:'frost',name:'Frosthafen',x:150,y:95,r:18,gnd:'snow',wall:'wood',gates:[Math.PI/2,0]},
 {id:'glut',name:'Glutwacht',x:350,y:140,r:17,gnd:'ash',wall:'stone',gates:[Math.PI/2,-Math.PI/4]},
 {id:'moor',name:'Moorbruck',x:84,y:318,r:16,gnd:'swamp',wall:'wood',gates:[0,Math.PI/2]},
 {id:'wald',name:'Waldheim',x:500,y:270,r:16,gnd:'forest',wall:'wood',gates:[Math.PI,Math.PI/2]},
 {id:'sand',name:'Sandfeste',x:470,y:505,r:17,gnd:'sand',wall:'stone',gates:[-Math.PI*0.8,Math.PI/4]}];
const townAt=(x,y)=>TOWNS.find(t=>Math.hypot(x-t.x,y-t.y)<t.r+.5);
G.SUMMIT={x:58,y:38,r:10};
const CANYON=[[214,452],[245,466],[278,470],[310,467],[345,478],[384,470]];
function segD(px,py,P){let best=1e9,bu=0,bi=0;for(let i=0;i<P.length-1;i++){const [ax,ay]=P[i],[bx,by]=P[i+1];const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let u=((px-ax)*dx+(py-ay)*dy)/L2;u=clamp(u,0,1);const d=Math.hypot(px-ax-dx*u,py-ay-dy*u);if(d<best){best=d;bu=u;bi=i;}}return [best,bi+bu];}
const canyonW=(x,y)=>{const n=noise(x/9,y/9,611);return 3.2+n*1.6;};
function biomeRaw(x,y){const d=dV(x,y);if(d<RV+1)return'village';const wx=x+(noise(x/55,y/55,401)-.5)*80+(noise(x/14,y/14,403)-.5)*18,wy=y+(noise(x/55,y/55,402)-.5)*80+(noise(x/14,y/14,404)-.5)*18;
 if(wy<150||y<132){if(wx<236)return'winter';if(wx<300)return'peaks';return'ash';}
 if(wy>442||y>462){if(wx<222)return'dark';if(wx<372)return'waste';return'desert';}
 if(wx<152)return'swamp';if(wx>432)return'forest';return'meadow';}
for(let y=0;y<H;y++)for(let x=0;x<WW;x++)BIO[y*WW+x]=BNAMES.indexOf(biomeRaw(x,y));
{const vi=BNAMES.indexOf('village');for(let it=0;it<2;it++){const src=BIO.slice();const cnt=new Int16Array(BNAMES.length);for(let y=0;y<H;y++)for(let x=0;x<WW;x++){const c=src[y*WW+x];if(c===vi)continue;cnt.fill(0);for(let dy=-3;dy<=3;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;for(let dx=-3;dx<=3;dx++){const xx=x+dx;if(xx<0||xx>=WW)continue;const b=src[yy*WW+xx];if(b!==vi)cnt[b]++;}}let bb=c,bn=cnt[c];for(let k=0;k<cnt.length;k++)if(cnt[k]>bn){bn=cnt[k];bb=k;}BIO[y*WW+x]=bb;}}}
function biome(x,y){x=Math.floor(x);y=Math.floor(y);if(x>=WW)return'interior';if(x<0||y<0||y>=H)return'waste';return BNAMES[BIO[y*WW+x]];}
const BL={meadow:'m',forest:'f',swamp:'s',waste:'w',winter:'i',ash:'a',village:'v',interior:'x',dark:'d',desert:'e',peaks:'p'};
const BLV={meadow:[1,10,40,8.5],forest:[7,16,150,10],swamp:[9,18,150,10],waste:[12,21,150,9],winter:[12,22,170,9],ash:[22,32,190,7],dark:[16,25,190,8],desert:[14,23,200,10],peaks:[18,26,170,8]};
function zoneLevel(x,y){if(x>=WW)return G.room&&G.room.dungeon?G.room.lvl:0;const b=biome(x,y);if(b==='village'||townAt(x,y))return 0;const L=BLV[b];return clamp(Math.floor(L[0]+Math.max(0,dV(x,y)-L[2])/L[3]),L[0],L[1]);}
const ZN={interior:'Innenraum',village:'Eichenhain',meadow:'Sonnenwiesen',forest:'Finsterwald',swamp:'Nebelmoor',waste:'Steinöde',winter:'Frostlande',ash:'Aschenberge',dark:'Schattenwald',desert:'Sengende Dünen',peaks:'Graukamm-Gebirge'};
const GC={interior:'#3a2a1a',village:'#64933f',meadow:'#5f9440',forest:'#43742f',swamp:'#4a5e3c',waste:'#8a7b5c',winter:'#e8eef4',ash:'#4a3f3c',dark:'#2e4630',desert:'#d6c086',peaks:'#77786f'};
const CASTLE={x0:VCX-13,y0:VCY-41,x1:VCX+13,y1:VCY-16};
const inCastle=(x,y)=>x>=CASTLE.x0&&x<=CASTLE.x1&&y>=CASTLE.y0&&y<=CASTLE.y1;
const HILL={x:VCX,y:VCY-29,r:21,h:3.2};
const CAMP={x:522,y:342},CRYPT={x:62,y:398},LAIR={x:500,y:58},BANDITS={x:426,y:228},ASHVALE={x:372,y:206};
const V=(dx,dy)=>[VCX+dx,VCY+dy];
const BUILD=[
 {id:'bakery',kind:'house',x:-15,y:-10,w:5,h:3,roof:'#a0522d',name:'Bäckerei',sign:'🥖',annex:'oven'},
 {id:'smith',kind:'house',x:10,y:-10,w:5,h:3,roof:'#59606b',name:'Schmiede',sign:'⚒️',chimney:1,annex:'forge'},
 {id:'healer',kind:'house',x:16,y:-5,w:3,h:2,roof:'#6b8e23',name:'Heilerin',sign:'🌿',annex:'garden'},
 {id:'tavern',kind:'house',x:-17,y:3,w:6,h:3,roof:'#8b3a3a',name:'Taverne',sign:'🍺',chimney:1,annex:'barrels'},
 {id:'guard',kind:'house',x:10,y:3,w:5,h:3,roof:'#4a5a7a',name:'Wache',sign:'🛡️',annex:'rack'},
 {id:'chapel',kind:'chapel',x:5,y:10,w:4,h:4,roof:'#5a4a6a',name:'Kapelle',sign:'🔔'},
 {id:'market',kind:'stall',x:-8,y:9,w:3,h:2,roof:'#c0392b',name:'Markt',sign:'⚖️'},
 {id:'h1',kind:'house',x:-20,y:-6,w:4,h:3,roof:'#8a5a3a',annex:'woodpile'},
 {id:'h2',kind:'house',x:-10,y:16,w:4,h:3,roof:'#7a4a2a',annex:'garden'},
 {id:'h3',kind:'house',x:12,y:12,w:4,h:3,roof:'#6a5a3a',annex:'woodpile'},
 {id:'h4',kind:'house',x:16,y:5,w:4,h:3,roof:'#8a3a2a',chimney:1},
 {id:'mill',kind:'mill',x:-18,y:9,w:2,h:2,roof:'#7a4a2a',name:'Mühle'},
 {id:'farm',kind:'house',x:-31,y:5,w:5,h:3,roof:'#9a6a3a',name:'Hof Jorg',annex:'pen'},
 {id:'barn',kind:'barn',x:-31,y:11,w:4,h:3,roof:'#8a2a1a',name:'Scheune'},
 {id:'stable',kind:'barn',x:22,y:12,w:5,h:3,roof:'#6a4a2a',name:'Stallungen'},
 {id:'h5',kind:'house',x:-27,y:-15,w:4,h:3,roof:'#7a5a3a',annex:'woodpile'},
 {id:'h6',kind:'house',x:-6,y:24,w:4,h:3,roof:'#8a4a2a',annex:'garden'},
 {id:'h7',kind:'house',x:9,y:23,w:4,h:3,roof:'#6a4a3a',chimney:1},
 {id:'h8',kind:'house',x:20,y:-15,w:4,h:3,roof:'#7a3a2a',name:'Alchemist',sign:'⚗️',annex:'garden'},
 {id:'h9',kind:'house',x:-22,y:19,w:4,h:3,roof:'#5a4a3a',annex:'woodpile'},
 {id:'keep',kind:'keep',x:-7,y:-39,w:14,h:7,roof:'#555b66',name:'Burg Eichenhain',sign:'🏰'},
 {id:'cbarr',kind:'house',x:-12,y:-28,w:4,h:3,roof:'#4a5060',name:'Kaserne',annex:'rack'},
 {id:'cstab',kind:'barn',x:8,y:-28,w:4,h:3,roof:'#4a5060',name:'Burgstall'},
];
BUILD.forEach(b=>{b.x+=VCX;b.y+=VCY;});
const TP=(id,dx,dy)=>{const t=TOWNS.find(q=>q.id===id);return{x:t.x+dx,y:t.y+dy};};
const tb=(id,town,dx,dy,w,h,o)=>{const p=TP(town,dx,dy);BUILD.push(Object.assign({id,kind:'house',x:p.x,y:p.y,w,h,roof:'#5a4a3a'},o));};
tb('jarl','frost',-3,-9,7,3,{roof:'#5a4a3a',snow:1,name:'Jarlshalle',sign:'🪓',chimney:1,annex:'woodpile'});
tb('f1','frost',-10,-3,3,3,{roof:'#6a4a3a',snow:1,name:'Fischerhütte',annex:'barrels'});
tb('f2','frost',7,-3,3,3,{roof:'#5a3a2a',snow:1,name:'Jägerhaus',annex:'rack'});
tb('f3','frost',-8,3,3,3,{roof:'#6a5a4a',snow:1,name:'Skaldenhaus'});
tb('sven','frost',5,3,4,3,{roof:'#7a3a2a',snow:1,name:'Svens Handelshaus',sign:'⚖️',annex:'barrels'});
tb('gkeep','glut',-3,-8,6,3,{roof:'#3a3434',name:'Feste Glutwacht',sign:'🛡️',stone:1,annex:'rack'});
tb('gforge','glut',5,-4,4,3,{roof:'#4a3a3a',name:'Feldschmiede',chimney:1,stone:1,annex:'forge'});
tb('gbarr','glut',-9,-3,4,3,{roof:'#4a3434',name:'Lazarett',stone:1,annex:'barrels'});
tb('mhall','moor',-3,-7,6,3,{roof:'#4a5a3a',name:'Vogtshaus',sign:'⚖️',stilt:1});
tb('m1','moor',-8,0,3,3,{roof:'#5a5a3a',stilt:1,annex:'barrels'});tb('m2','moor',4,1,3,3,{roof:'#4a4a2a',stilt:1,name:'Kräuterkate',annex:'garden'});
tb('whall','wald',-3,-7,6,3,{roof:'#5a3a1a',name:'Försterhalle',sign:'🌲',annex:'woodpile'});
tb('w1','wald',-8,1,3,3,{roof:'#6a4a2a',annex:'woodpile'});tb('w2','wald',4,1,4,3,{roof:'#5a3a2a',name:'Bogenmacher',annex:'rack'});
tb('spal','sand',-4,-8,8,3,{roof:'#c9a060',name:'Palast der Fürstin',sign:'🌙',flat:1});
tb('s1','sand',-9,0,3,3,{roof:'#b89050',flat:1,annex:'barrels'});tb('s2','sand',5,0,4,3,{roof:'#c0a070',flat:1,name:'Basar',sign:'⚖️'});
// Update 13: Jede Stadt bekommt Markt, Bauernhof mit Feld und mehr Wohnhäuser
const TADD={
 frost:{stall:[-4,-4],farm:[3,-14],field:[6,-8],houses:[[-7,7,4,3,'Fischerkate'],[-9,-8,3,3,'Holzhauerhütte'],[4,7,3,3,'Webstube'],[-12,2,3,3,'Sigruns Haus']],roof:'#5a4a3a',snow:1},
 glut:{stall:[-4,-4],farm:[-6,-13],field:[4,-11],houses:[[-11,2,4,3,'Mannschaftshaus'],[8,2,3,3,'Quartiermeisterei'],[-11,-8,3,3,'Wachstube'],[-8,8,3,3,'Hannes Kate']],roof:'#4a3a34',stone:1},
 moor:{stall:[-4,3],farm:[9,-4],field:[4,-10],houses:[[-8,-8,4,3,'Flößerhaus'],[2,7,3,3,'Reetkate'],[-4,8,3,3,'Gesas Kate'],[-9,5,3,3,'Torfstecherhütte']],roof:'#4a5a3a',stilt:1},
 wald:{stall:[-5,-3],farm:[9,-4],field:[5,5],houses:[[-8,5,4,3,'Holzfällerhaus'],[-10,-4,3,3,'Jägerkate'],[-7,-10,3,3,'Ansgars Haus'],[5,-10,3,3,'Kräuterhütte']],roof:'#5a3a1a'},
 sand:{stall:[-2,-4],farm:[0,-14],field:[5,-8],houses:[[-6,7,4,3,'Weberei'],[-9,-7,3,3,'Wasserträgerhaus'],[6,4,3,3,'Leylas Haus'],[0,8,3,3,'Lehmhaus']],roof:'#b89050',flat:1}};
const TFIELDS=[],JOBS_ADD={},SHOP_ADD={};
for(const tid in TADD){const a=TADD[tid],ex={};for(const k of ['snow','stone','stilt','flat'])if(a[k])ex[k]=1;
 tb(tid+'_mkt',tid,a.stall[0],a.stall[1],3,2,{kind:'stall',roof:'#b03a2a',name:'Markt',sign:'⚖️'});
 tb(tid+'_farm',tid,a.farm[0],a.farm[1],4,3,Object.assign({roof:a.roof,name:'Bauernhof',sign:'🌾',annex:'pen'},ex));
 a.houses.forEach((h,i)=>tb(tid+'_h'+i,tid,h[0],h[1],h[2],h[3],Object.assign({roof:a.roof,name:h[4],annex:['woodpile','barrels','garden',null][i],chimney:i%2},ex)));
 const fp=TP(tid,a.field[0],a.field[1]);for(let y=0;y<3;y++)for(let x=0;x<5;x++)TFIELDS.push([fp.x+x,fp.y+y]);}
const WILD=[{id:'hut',kind:'hut',x:228,y:358,w:4,h:3,roof:'#3a2a1a',name:'Verlassene Jägerhütte',def:'boar'},
 {id:'cave',kind:'cave',x:520,y:196,w:4,h:3,name:'Spinnenhöhle',def:'spider'},
 {id:'wtower',kind:'wtower',x:148,y:246,w:3,h:3,name:'Alter Wachturm',def:'skeleton'},
 {id:'mine',kind:'cave',x:296,y:540,w:4,h:3,name:'Verlassene Mine',def:'golem'},
 {id:'icecave',kind:'cave',x:104,y:52,w:4,h:3,snow:1,name:'Eishöhle',def:'frostslime'},
 {id:'shrine',kind:'shrine',x:420,y:112,w:5,h:3,name:'Feuerschrein',def:'imp'},
 {id:'grotto',kind:'cave',x:276,y:468,w:4,h:3,name:'Schluchtgrotte',def:'orc',canyon:1},
 {id:'pyramid',kind:'pyramid',x:526,y:536,w:6,h:4,name:'Grab des Sandkönigs',def:'mummy'},
 {id:'abbey',kind:'wtower',x:150,y:500,w:3,h:3,name:'Ruine der Abtei',def:'wraith',ruin:1},
 {id:'witchhut',kind:'hut',x:96,y:470,w:4,h:3,roof:'#2a2a1a',name:'Hexenkate',def:'witch'},
 {id:'dwarf',kind:'cave',x:262,y:92,w:4,h:3,name:'Zwergenbinge',def:'greydwarf',snow:1},
 {id:'banditcave',kind:'cave',x:428,y:220,w:4,h:3,name:'Räuberhöhle',def:'bandit'},
 {id:'cellar',kind:'hut',x:374,y:200,w:4,h:3,roof:'#2a2420',name:'Verkohlter Keller',def:'ghoul',burnt:1},
 {id:'angler',kind:'hut',x:104,y:522,w:4,h:3,roof:'#4a3a24',name:'Anglerhütte',peace:1}];
WILD.forEach(s=>{s.wild=1;BUILD.push(s);});
BUILD.forEach(b=>{b.door={tx:b.x+Math.floor(b.w/2),ty:b.y+b.h-1};});
const FIELD_POS=TFIELDS.slice();for(let y=-6;y<=-5;y++)for(let x=-14;x<=-12;x++)FIELD_POS.push([VCX+x,VCY+y]);for(let y=12;y<=16;y++)for(let x=-25;x<=-21;x++)FIELD_POS.push([VCX+x,VCY+y]);
const WAYS=[{id:'city',name:'Eichenhain',tx:VCX+3,ty:VCY+3}];TOWNS.forEach(t=>WAYS.push({id:t.id,name:t.name,tx:t.x+2,ty:t.y+2}));
const ROADS=[
 [V(-37,0),[200,302],[150,306],[100,316],[96,318]],
 [[200,302],[188,240],[168,172],[152,110]],
 [V(37,0),[380,296],[440,286],[487,272]],
 [[380,296],[372,232],[372,214],[362,176],[351,154]],[[372,214],[376,204]],
 [[360,129],[400,108],[422,116]],[[424,117],[460,84],[500,74]],
 [V(0,37),[290,400],[294,452],[292,470],[296,488],[306,530],[306,546],[298,546]],[[292,470],[279,472]],
 [[290,400],[380,440],[440,486],[458,496]],
 [[290,400],[230,448],[176,486],[151,505]],
 [[150,83],[118,62],[106,56]],[[165,95],[220,100],[264,97]],
 [[84,329],[72,370],[63,390]],[[500,282],[512,320],[521,334]],[[500,286],[515,260],[522,201]],
 [[440,286],[432,252],[426,237]],[[150,306],[149,251]],[[200,302],[220,345],[230,362]],[[100,316],[98,400],[98,474]],[[480,516],[510,530],[529,541]]];
const RLIST=[];
function gen(){
 map.fill(T.VOID);
 for(let y=0;y<H;y++)for(let x=0;x<WW;x++){
  const d=dV(x,y),b=biome(x,y),n=fbm(x*1.15,y*1.15,SEED),m=noise(x/3.2,y/3.2,SEED+50),r=h2(x,y,SEED+99),o=noise(x/30,y/30,SEED+7);let t=T.GRASS;
  if(b==='village'){t=r<.5?T.GRASS:T.GRASS2;if(r>.95)t=T.FLOWER;const cross=Math.abs(x-VCX)<=1||Math.abs(y-VCY)<=1;if(d<5||(cross&&d<RV-.4))t=T.COBBLE;}
  else if(b==='meadow'){if(n<.26)t=T.WATER;else if(n<.29)t=T.SAND;else if(m>.78&&o>.35)t=T.TREE;else if(r<.004)t=T.ROCK;else t=r<.05?T.FLOWER:(r<.5?T.GRASS:T.GRASS2);}
  else if(b==='forest'){if(n<.25)t=T.WATER;else if(n<.28)t=T.SAND;else if(m>.52||r<.05)t=T.TREE;else if(r>.992)t=T.STUMP;else t=r<.5?T.GRASS:T.GRASS2;}
  else if(b==='swamp'){if(n<.34)t=T.WATER;else if(m>.66||r<.03)t=T.DEAD;else if(r>.985)t=T.MUSH;else t=T.SWAMP;}
  else if(b==='waste'){if(m>.66||r<.025)t=T.ROCK;else if(r>.993)t=T.BONES;else t=T.DIRT;}
  else if(b==='winter'){if(n<.3)t=T.ICE;else if(m>.6||r<.03)t=T.TREE;else if(r>.985)t=T.ROCK;else t=T.SNOW;}
  else if(b==='dark'){if(n<.24)t=T.WATER;else if(m>.48||r<.06)t=T.TREE;else if(r>.975)t=T.MUSH;else if(r>.965)t=T.BONES;else t=T.DGRASS;}
  else if(b==='desert'){if(n<.2&&o>.55)t=T.WATER;else if(r<.012)t=T.CACTUS;else if(m>.8&&r<.3)t=T.ROCK;else if(r>.994)t=T.BONES;else t=T.SAND;}
  else if(b==='peaks'){const rg=noise(x/6,y/6,SEED+31);if(rg>.62)t=T.CLIFF;else if(m>.6||r<.05)t=T.ROCK;else t=(y<90||rg>.5)?T.SNOW:T.DIRT;}
  else{if(n<.3)t=T.LAVA;else if(m>.66||r<.03)t=T.ROCK;else if(r>.99)t=T.BONES;else t=T.ASH;}
  // Schlucht
  if(b==='waste'||b==='dark'||b==='desert'){const [dc]=segD(x,y,CANYON);const cw=canyonW(x,y);if(dc<cw)t=(r<.02)?T.ROCK:(r>.99?T.BONES:T.DIRT);else if(dc<cw+1.6)t=T.CLIFF;}
  if(inCastle(x,y)){const ex=x===CASTLE.x0||x===CASTLE.x1,ey=y===CASTLE.y0||y===CASTLE.y1;const gate=Math.abs(x-VCX)<=2&&y===CASTLE.y1;t=(ex&&ey)?T.TOWER:((ex||ey)&&!gate?T.CWALL:T.COBBLE);
   if(y===CASTLE.y1&&(Math.abs(x-VCX)===3||Math.abs(x-VCX)===4))t=T.TOWER;if((ex&&Math.abs(y-(CASTLE.y0+CASTLE.y1)/2)<1)||(ey&&Math.abs(x-VCX)===9))t=T.TOWER;if(Math.abs(x-VCX)<=2&&y>CASTLE.y0+8)t=T.COBBLE;}
  else if(b==='village'&&d>=RV-.6&&d<RV+.6&&!(y<CASTLE.y1&&x>CASTLE.x0-3&&x<CASTLE.x1+3)){const gate=Math.abs(x-VCX)<=1||Math.abs(y-VCY)<=1;t=gate?T.COBBLE:T.WALL;}
  if(x<3||y<3||x>=WW-3||y>=H-3)t=(b==='ash'||b==='waste'||b==='winter'||b==='peaks'||b==='desert')?T.CLIFF:T.TREE;
  map[y*W+x]=t;}
 const set=(x,y,t)=>{if(x>=3&&y>=3&&x<WW-3&&y<H-3)map[y*W+x]=t;};
 const get=(x,y)=>map[y*W+x];
 const road=(x,y)=>{if(dV(x,y)<RV-.5||inCastle(x,y)||townAt(x,y))return;const t=get(x,y),b=biome(x,y);if(t===T.FWALL||t===T.BARRIER)return;
  set(x,y,t===T.WATER||t===T.ICE||t===T.LAVA?T.BRIDGE:(b==='desert'?T.PATH:T.PATH));};
 for(const R of ROADS)for(let i=0;i<R.length-1;i++){const [ax,ay]=R[i],[bx,by]=R[i+1];const L=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/L,ny=(bx-ax)/L;for(let s=0;s<=L*2;s++){const u=s/(L*2),wb=Math.round(Math.sin((ax+ay+s*.5)*.12)*1.6*Math.min(1,s/6,(L*2-s)/6));const x=Math.round(ax+(bx-ax)*u+nx*wb),y=Math.round(ay+(by-ay)*u+ny*wb);road(x,y);road(x+1,y);road(x,y+1);road(x+1,y+1);RLIST.push(x,y);}}
 // Städte
 for(const tw of TOWNS){const gt={snow:T.SNOW,ash:T.ASH,swamp:T.SWAMP,forest:T.GRASS,sand:T.SAND}[tw.gnd];
  for(let dy=-tw.r-3;dy<=tw.r+3;dy++)for(let dx=-tw.r-3;dx<=tw.r+3;dx++){const dd=Math.hypot(dx,dy),x=tw.x+dx,y=tw.y+dy;if(dd>=tw.r+2.6)continue;let t=gt;const a=Math.atan2(dy,dx);
   const nearGate=tw.gates.some(g=>{let da=Math.abs(((a-g)+Math.PI*3)%(Math.PI*2)-Math.PI);return da*dd<1.6;});const cross=Math.abs(dx)<=1||Math.abs(dy)<=1;
   if(dd<tw.r-1.2){if(cross)t=tw.gnd==='sand'?T.SAND:T.COBBLE;if(dd<3)t=T.COBBLE;if(tw.gnd==='forest'&&h2(x,y,3)<.06)t=T.FLOWER;}
   else if(dd<tw.r+.5){t=nearGate?T.COBBLE:(tw.wall==='stone'?T.CWALL:T.WALL);}
   set(x,y,t);}
  for(const g of tw.gates)for(let k=tw.r-1;k<=tw.r+4;k++)for(let s=-1;s<=1;s++){const x=Math.round(tw.x+Math.cos(g)*k-Math.sin(g)*s),y=Math.round(tw.y+Math.sin(g)*k+Math.cos(g)*s);if(k>tw.r+.6){if(get(x,y)!==T.WALL&&get(x,y)!==T.CWALL)set(x,y,T.PATH);}else set(x,y,T.COBBLE);}}
 { const g=TOWNS[1];[[-6,4],[6,5],[-4,8],[3,8]].forEach(([a,b])=>set(g.x+a,g.y+b,T.TENT));set(g.x-1,g.y+3,T.FIRE);}
 // Goblinlager & Banditenlager
 for(const [C,rr,wall] of [[CAMP,7,false],[BANDITS,8,true]]){for(let dy=-rr-1;dy<=rr+1;dy++)for(let dx=-rr-1;dx<=rr+1;dx++){const dd=Math.hypot(dx,dy);if(dd<rr-.5)set(C.x+dx,C.y+dy,T.DIRT);else if(wall&&dd<rr+.5&&!(Math.abs(dx)<=1&&dy>0))set(C.x+dx,C.y+dy,T.WALL);}
  [[-3,-2],[3,-3],[-3,3],[4,2]].forEach(([a,b])=>set(C.x+a,C.y+b,T.TENT));set(C.x,C.y,T.FIRE);}
 // Krypta
 for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++)if(Math.hypot(dx,dy)<6.5)set(CRYPT.x+dx,CRYPT.y+dy,T.SWAMP);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;set(CRYPT.x+Math.round(Math.cos(a)*4.5),CRYPT.y+Math.round(Math.sin(a)*4.5),T.RUIN);}set(CRYPT.x,CRYPT.y-3,T.CRYPT);
 // Zerstörtes Dorf Aschental
 const AV=ASHVALE;for(let dy=-14;dy<=14;dy++)for(let dx=-14;dx<=14;dx++){const dd=Math.hypot(dx,dy),x=AV.x+dx,y=AV.y+dy;if(dd>13+noise(x/3,y/3,9)*3)continue;const t=get(x,y);if(t===T.PATH||t===T.BRIDGE)continue;const r=h2(x,y,71);set(x,y,r<.08?T.ASH:(r<.12?T.DEAD:(r<.14?T.BONES:T.BURNT)));}
 [[-9,-7,5,4],[3,-9,4,4],[-10,3,4,3],[6,4,5,4],[-2,9,4,3]].forEach(([a,b,w,h],i)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ed=x===0||y===0||x===w-1||y===h-1;if(!ed)continue;if(h2(AV.x+a+x,AV.y+b+y,72+i)<.68)set(AV.x+a+x,AV.y+b+y,T.RUIN);}});
 set(AV.x-1,AV.y+1,T.WELL);
 // Drachenfestung auf dem Goldberg
 for(let dy=-15;dy<=15;dy++)for(let dx=-15;dx<=15;dx++){const dd=Math.hypot(dx,dy),x=LAIR.x+dx,y=LAIR.y+dy;const gate=Math.abs(dx)<=1&&dy>0;
  if(dd<6)set(x,y,T.GOLD);else if(dd<9.6)set(x,y,(h2(x,y,5)<.25)?T.GOLD:T.ASH);else if(dd<10.6)set(x,y,T.BARRIER);else if(dd<12)set(x,y,gate?T.PATH:T.ASH);else if(dd<13.4)set(x,y,gate?T.PATH:T.FWALL);else if(dd<15)set(x,y,gate?T.PATH:T.ASH);}
 // verstreute Ruinen & Steinkreise
 const ruinBi=['meadow','forest','swamp','waste','winter','dark','desert','peaks','ash'];G.RUINS=[];
 for(let i=0;i<70;i++){const x=6+Math.floor(h2(i,1,901)*(WW-12)),y=6+Math.floor(h2(i,2,901)*(H-12));const b=biome(x,y);if(ruinBi.indexOf(b)<0||dV(x,y)<RV+12||townAt(x,y)||TOWNS.some(t=>Math.hypot(x-t.x,y-t.y)<t.r+8))continue;
  let near=false;for(let k=0;k<RLIST.length;k+=2*25)if(Math.abs(RLIST[k]-x)<4&&Math.abs(RLIST[k+1]-y)<4){near=true;break;}if(near)continue;
  const kind=h2(i,3,901)<.35?'circle':'house';G.RUINS.push({x,y,kind,b});
  const gt=get(x,y);const ground=SOLIDS[gt]||gt===T.WATER?({desert:T.SAND,winter:T.SNOW,waste:T.DIRT,ash:T.ASH,dark:T.DGRASS,swamp:T.SWAMP,peaks:T.DIRT}[b]||T.GRASS):gt;
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(Math.hypot(dx,dy)<4.5)set(x+dx,y+dy,ground);
  if(kind==='circle'){for(let k=0;k<9;k++){const a=k/9*6.283;if(h2(i,k,902)<.8)set(x+Math.round(Math.cos(a)*3.2),y+Math.round(Math.sin(a)*3.2),T.RUIN);}set(x,y,T.BONES);}
  else{const w=4+Math.floor(h2(i,4,901)*3),h=3+Math.floor(h2(i,5,901)*2);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){if(!(xx===0||yy===0||xx===w-1||yy===h-1))continue;if(h2(x+xx,y+yy,903)<.62)set(x-2+xx,y-2+yy,T.RUIN);}}}
 // Wildnis-Strukturen freiräumen
 for(const b of BUILD){if(!b.wild)continue;const bi=biome(b.x,b.y),gt={meadow:T.GRASS,forest:T.GRASS2,swamp:T.SWAMP,waste:T.DIRT,ash:T.ASH,winter:T.SNOW,dark:T.DGRASS,desert:T.SAND,peaks:T.DIRT}[bi]||T.GRASS;for(let y=b.y-3;y<=b.y+b.h+3;y++)for(let x=b.x-3;x<=b.x+b.w+2;x++){const tt=get(x,y);if(SOLIDS[tt]||tt===T.WATER||tt===T.ICE||tt===T.LAVA)set(x,y,b.canyon?T.DIRT:gt);}}
 // ---- Sprung- & Kletterorte, Weiher, Gipfel ----
 {const P0={x:106,y:533};for(let dy=-6;dy<=6;dy++)for(let dx=-8;dx<=8;dx++){const d=Math.hypot(dx/1.3,dy)+noise((P0.x+dx)/3,(P0.y+dy)/3,77)*1.2;const x=P0.x+dx,y=P0.y+dy;if(d<4.2)set(x,y,T.WATER);else if(d<5.6)set(x,y,(h2(x,y,4)<.12)?T.FLOWER:T.DGRASS);}
  for(let y=520;y<=528;y++)for(let x=100;x<=110;x++){const t=get(x,y);if(SOLIDS[t]||t===T.WATER)set(x,y,T.DGRASS);}for(let x=99;x<=112;x++)if(!SOLIDS[get(x,529)])set(x,529,T.PATH);}
 for(const [cx,cy,rr] of [[151,505,9.2],[529,541,9.6]])for(let dy=-11;dy<=11;dy++)for(let dx=-11;dx<=11;dx++){const d=Math.hypot(dx,dy);if(d<rr-.5||d>rr+.5)continue;const x=cx+dx,y=cy+dy,t=get(x,y);if(t===T.WATER||t===T.LAVA)continue;if(!SOLIDS[t]||t===T.TREE||t===T.ROCK||t===T.CACTUS||t===T.STUMP||t===T.DEAD)set(x,y,T.LEDGE);}
 {const S0=G.SUMMIT;for(let dy=-16;dy<=16;dy++)for(let dx=-16;dx<=16;dx++){const d=Math.hypot(dx,dy),x=S0.x+dx,y=S0.y+dy;if(d>15.5)continue;if(d<6.4)set(x,y,d<1.2?T.SNOW:(h2(x,y,6)<.08?T.ROCK:T.SNOW));else if(d<10.5){const climb=Math.abs(dx)<=1&&dy>0;set(x,y,climb?T.CLIMB:T.CLIFF);}else if(d<12)set(x,y,T.SNOW);}}
 for(let i=0;i<CANYON.length-1;i++){const [ax,ay]=CANYON[i],[bx,by]=CANYON[i+1];for(const u of [.3,.72]){const mx=ax+(bx-ax)*u,my=ay+(by-ay)*u,L=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/L,ny=(bx-ax)/L;for(const sd of [-1,1])for(let k=0;k<=9;k++)for(const w of [-1,0,1]){const x=Math.round(mx+nx*sd*k+(bx-ax)/L*w),y=Math.round(my+ny*sd*k+(by-ay)/L*w);if(get(x,y)===T.CLIFF)set(x,y,T.CLIMB);}}}
 {const tx=VCX+44,ty=VCY+6;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)set(tx+dx,ty+dy,T.LEDGE);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(Math.abs(dx)<=1&&Math.abs(dy)<=1)continue;const t=get(tx+dx,ty+dy);if(SOLIDS[t]||t===T.WATER)set(tx+dx,ty+dy,T.GRASS);}}
 for(const b of BUILD)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)map[y*W+x]=T.HOUSE;
 // Anbauten & Höfe
 for(const b of BUILD){if(b.wild)continue;const by=b.y+b.h;if(b.annex==='forge'){set(b.x+b.w,b.y+b.h-1,T.ANVIL);}else if(b.annex==='garden'){for(let x=b.x-1;x<b.x+b.w+1;x++){if(x===b.door.tx)continue;const t=get(x,by+1);if(!SOLIDS[t]&&t!==T.COBBLE&&t!==T.PATH)set(x,by+1,T.HERBS);}}else if(b.annex==='barrels'){set(b.x-1,b.y+b.h-1,T.BARREL);}else if(b.annex==='woodpile'){set(b.x+b.w,b.y+1,T.CRATE);}else if(b.annex==='rack'){set(b.x-1,b.y+b.h-1,T.CRATE);}}
 for(const [x,y] of FIELD_POS)map[y*W+x]=T.FIELD;
 for(let y=12;y<=15;y++)for(let x=-16;x<=-12;x++)map[(VCY+y)*W+VCX+x]=T.CROP;
 map[VCY*W+VCX]=T.WELL;
 for(const w of WAYS){map[w.ty*W+w.tx]=T.WAYSTONE;if(SOLIDS[map[(w.ty+1)*W+w.tx]])map[(w.ty+1)*W+w.tx]=T.COBBLE;}
}
gen();

// ===================== Innenräume =====================
const ROOMS=[];
function makeRoom(b,w,h,floor,wall){const si=ROOMS.length,ox=WW+8+(si%6)*18,oy=2+Math.floor(si/6)*15;
 for(let y=oy;y<=oy+h+1;y++)for(let x=ox;x<=ox+w+1;x++){const edge=x===ox||y===oy||x===ox+w+1||y===oy+h+1;map[y*W+x]=edge?wall:floor;}
 const dx=ox+1+Math.floor(w/2),dy=oy+h+1;map[dy*W+dx]=T.DOOR;
 const r={id:b.id,name:b.name||'Wohnhaus',kind:b.kind,x0:ox+1,y0:oy+1,w,h,floor,door:{tx:dx,ty:dy},chests:[],b,dungeon:!!b.wild,ent:{x:(b.door.tx+.5)*TILE,y:(b.y+b.h+.65)*TILE}};
 if(r.dungeon)r.lvl=Math.max(2,zoneLevel(b.door.tx,b.door.ty+2)+1);ROOMS.push(r);b.room=r;return r;}
const F=(r,x,y,t)=>{map[(r.y0+y)*W+r.x0+x]=t;};
const CH_=(r,x,y,loot)=>{F(r,x,y,T.CHEST);r.chests.push({tx:r.x0+x,ty:r.y0+y,loot,opened:false,at:0});};
const LAYOUT={"cbarr": ["B.B.B.B.RR", "B.B.B.B..M", "..........", "TTTT....D.", "..........", "C........M", "bc...._.Rc"], "guard": ["B.B..RRM", "B.B.....", "........", "..TT..D.", "S.......", "SC....bc"], "gkeep": ["M.SPS..M", "........", ".TT...R.", ".TT...R.", "_......B", "C..._..B"], "gforge": ["HH.RR.bb", "........", ".A..G.t.", "........", "B......c", "B.....Cc"], "gbarr": ["B.B.B.SS", "B.B.B...", "........", "K....T.B", ".....T.B", "c.....C."], "smith": ["SHHH.RRb", "S.......", "S..A..G.", ".......t", "B......c", "B.....Cb"], "bakery": ["OHO..kkS", ".......S", ".TT.....", "........", "BNNN.NNc", "B....C.b"], "healer": ["SSK.SB", ".....B", ".TT...", ".....B", "C..._B"], "tavern": ["bbbNNNN.HS", "..........", "B.TT..TT.B", "B........B", "B.TT..TT.B", "B........B", "bc..._...C"], "jarl": ["S.H.Y..F.S", "I...._...I", ".TTT._.TTT", "....._....", ".TTT._.TTT", "B...._...B", "B..bc_cb.B"], "h1": ["BB..H.Lb", "BB......", "....TT..", "Z...TT..", ".......S", "c...._CS"], "h2": ["B.B..H.b", "B.B.....", ".....TT.", ".....TT.", "S......c", "S..._..C"], "h3": [".HK.SS.B", ".......B", ".TT.....", ".TT....b", "c......L", "C..._..b"], "h5": ["B..H..cc", "B.......", "..TT..W.", "..TT....", "S......F", "S..._.Cb"], "h6": ["SS.H..BB", "......BB", ".TT.....", ".TT..Z..", "b.......", "bc.._..C"], "h9": ["B.K.H.SS", "B.......", "...TT...", "...TT..L", "c.......", "C..._.bb"], "farm": ["B..H.kkk", "B......h", ".TT....h", ".TT.....", "b.......", "bc.._.Cc"], "h7": ["SS.H.ccc", "B.......", "B.WW..T.", "......T.", "c.......", "cC.._.W."], "h8": ["SSS.KPSB", ".......B", ".TT.....", ".TT..K..", "S.......", "SC.._..b"], "f1": ["B..H.bbb", "B.......", ".TT...F.", ".TT.....", "c.......", "C..._.bc"], "f2": ["B.RR.H.M", "B.......", "..F..WW.", ".TT.....", ".TT....c", "S..._.Cb"], "f3": ["SSPS.H.B", ".......B", ".TT..F..", ".TT.....", "A.......", "c..._.Cb"], "sven": ["SS.H.ccB", ".......B", "NNN..kkc", "........", "bb......", "cbc._..C"], "mhall": ["S.PSP.HB", ".......B", ".TTTT...", "._____..", ".TTTT...", "S..._..C"], "m1": ["B..HK..S", "B......S", "..TT....", "..TT..Z.", "b.......", "bc.._.Cc"], "m2": ["SSK.H..B", ".......B", ".TT..K..", ".TT.....", "S.......", "S..._.Cc"], "whall": ["RR..H.MB", ".......B", ".TTTT...", "...F....", ".TTTT..B", "c..._.CB"], "w1": ["B..H..SS", "B.......", ".F.TT...", "...TT..L", "c.......", "C..._.bb"], "w2": ["RRR.H..B", ".......B", ".WW..cc.", "........", ".TT....R", ".TT._.CR"], "spal": ["I.VY_.VI", "...___..", "I..___.I", ".V.___V.", "I..___.B", "C..___.B"], "s1": ["B..VV.SS", "B.......", "..___...", "..___.T.", "b.....T.", "bc.._..C"], "s2": ["kkkc.V.B", ".......B", ".NNN..k.", ".___....", ".___..V.", "c..._.Cb"]};
const LEG={'B':T.BED,'T':T.TABLE,'b':T.BARREL,'S':T.SHELF,'H':T.HEARTH,'A':T.ANVIL,'c':T.CRATE,'k':T.SACK,'h':T.HAY,'O':T.OVEN,'R':T.RACK,'D':T.DUMMY,'N':T.COUNTER,'L':T.LOOM,'K':T.CAULDRON,'W':T.BENCH,'M':T.ARMOR,'P':T.DESK,'G':T.GRIND,'Z':T.WHEEL,'V':T.DIVAN,'F':T.FUR,'_':T.CARPET,'I':T.PILLAR,'X':T.ALTAR,'Y':T.THRONE,'t':T.TROUGH};
const LOOTOF={smith:'smith',gforge:'smith',bakery:'bakery',healer:'healer',gbarr:'healer',h8:'healer',m2:'healer',tavern:'tavern',jarl:'tavern',guard:'guard',cbarr:'guard',gkeep:'guard'};
const STONEB={cbarr:1,gkeep:1,spal:1,gforge:1};
function furnish(b){let r;const k=b.id;
 if(LAYOUT[k]&&b.kind==='house'){const L=LAYOUT[k];r=makeRoom(b,L[0].length,L.length,STONEB[k]||k==='smith'?T.STONEF:T.WOOD,STONEB[k]?T.SWALL:T.IWALL);for(let y=0;y<L.length;y++)for(let x=0;x<L[0].length;x++){const ch=L[y][x];if(ch==='C')CH_(r,x,y,LOOTOF[k]||'home');else if(LEG[ch]!=null)F(r,x,y,LEG[ch]);}return;}
 if(b.kind==='keep'){r=makeRoom(b,12,9,T.STONEF,T.SWALL);F(r,6,0,T.THRONE);for(let y=1;y<9;y++)for(let x=5;x<=7;x++)F(r,x,y,T.CARPET);[[2,2],[9,2],[2,6],[9,6]].forEach(([x,y])=>F(r,x,y,T.PILLAR));F(r,0,4,T.TABLE);F(r,0,5,T.TABLE);F(r,11,4,T.TABLE);F(r,11,5,T.TABLE);F(r,3,0,T.SHELF);F(r,8,0,T.SHELF);CH_(r,0,0,'keep');CH_(r,11,0,'keep');return;}
 if(b.kind==='chapel'){r=makeRoom(b,8,8,T.STONEF,T.SWALL);F(r,3,0,T.ALTAR);F(r,4,0,T.ALTAR);for(let y=1;y<8;y++){F(r,3,y,T.CARPET);F(r,4,y,T.CARPET);}for(const y of [2,4,6]){for(const x of [0,1,2,5,6,7])F(r,x,y,T.PEW);}CH_(r,7,0,'chapel');return;}
 if(b.wild){const stone=b.kind!=='hut';r=makeRoom(b,14,11,stone?T.STONEF:T.WOOD,stone?T.SWALL:T.IWALL);[[3,3],[10,3],[3,7],[10,7]].forEach(([x,y])=>F(r,x,y,b.kind==='hut'?T.BARREL:T.PILLAR));
  [[0,0],[13,0],[0,10],[13,10],[1,10],[12,10]].forEach(([x,y],i)=>F(r,x,y,i%2?T.BARREL:T.CRATE));if(b.id==='shrine'){F(r,1,5,T.LAVA);F(r,12,5,T.LAVA);}if(b.kind==='cave'){F(r,0,5,T.ROCK);F(r,13,6,T.ROCK);F(r,6,9,T.ROCK);}
  CH_(r,1,0,'dungeon');CH_(r,12,0,'dungeon');return;}
 if(k==='tavern'||k==='jarl'){r=makeRoom(b,10,7,T.WOOD,T.IWALL);for(let x=1;x<=5;x++)F(r,x,1,T.TABLE);for(let x=0;x<=4;x++)F(r,x,0,T.BARREL);F(r,9,0,T.HEARTH);F(r,7,3,T.TABLE);F(r,8,3,T.TABLE);F(r,1,4,T.TABLE);F(r,2,4,T.TABLE);F(r,8,5,T.TABLE);F(r,0,6,T.BARREL);CH_(r,9,6,k==='jarl'?'keep':'tavern');return;}
 if(k==='smith'){r=makeRoom(b,8,6,T.STONEF,T.IWALL);F(r,3,0,T.HEARTH);F(r,4,0,T.HEARTH);F(r,4,2,T.ANVIL);F(r,0,0,T.SHELF);F(r,0,1,T.SHELF);F(r,0,2,T.SHELF);F(r,7,0,T.BARREL);F(r,7,1,T.CRATE);CH_(r,7,5,'smith');return;}
 if(k==='bakery'){r=makeRoom(b,8,6,T.WOOD,T.IWALL);F(r,1,0,T.HEARTH);F(r,2,0,T.HEARTH);for(let x=4;x<=6;x++)F(r,x,1,T.TABLE);F(r,7,0,T.BARREL);F(r,7,1,T.BARREL);F(r,0,3,T.SHELF);F(r,0,4,T.SHELF);CH_(r,7,5,'bakery');return;}
 if(k==='healer'){r=makeRoom(b,6,5,T.WOOD,T.IWALL);F(r,0,0,T.SHELF);F(r,1,0,T.SHELF);F(r,2,0,T.SHELF);F(r,5,0,T.BED);F(r,5,1,T.BED);F(r,2,2,T.TABLE);F(r,2,3,T.CARPET);F(r,3,3,T.CARPET);CH_(r,0,4,'healer');return;}
 if(k==='guard'){r=makeRoom(b,8,6,T.WOOD,T.IWALL);F(r,0,0,T.BED);F(r,0,1,T.BED);F(r,0,3,T.BED);F(r,0,4,T.BED);F(r,7,0,T.SHELF);F(r,7,1,T.SHELF);F(r,7,2,T.SHELF);F(r,3,1,T.TABLE);F(r,4,1,T.TABLE);F(r,7,5,T.CRATE);CH_(r,1,5,'guard');return;}
 if(b.kind==='barn'){if(k==='barn'){r=makeRoom(b,9,6,T.STRAW,T.IWALL);[[0,0],[1,0],[2,0],[0,1],[1,1],[6,0],[7,0],[8,0],[8,1],[0,2]].forEach(([x,y])=>F(r,x,y,T.HAY));F(r,3,0,T.SHELF);F(r,4,0,T.SHELF);F(r,5,3,T.CART);F(r,6,3,T.CART);F(r,8,3,T.SACK);F(r,8,4,T.SACK);F(r,0,4,T.BARREL);F(r,0,5,T.CRATE);F(r,1,5,T.CRATE);CH_(r,8,5,'home');return;}
  r=makeRoom(b,11,7,T.STRAW,T.IWALL);for(const px of [2,5,8])for(let y=0;y<3;y++)F(r,px,y,T.STALL);for(const bx of [0,3,6,9]){F(r,bx,0,T.TROUGH);F(r,bx+1,0,T.HAY);}
  [[0,6],[0,5],[1,6],[10,6],[10,5]].forEach(([x,y])=>F(r,x,y,T.HAY));F(r,9,6,T.SACK);F(r,10,3,T.BARREL);CH_(r,10,4,'home');return;}
 r=makeRoom(b,8,6,T.WOOD,T.IWALL);F(r,0,0,T.BED);F(r,0,1,T.BED);F(r,6,0,T.HEARTH);F(r,7,0,T.BARREL);F(r,3,2,T.TABLE);F(r,4,2,T.TABLE);F(r,7,3,T.SHELF);F(r,3,4,T.CARPET);F(r,4,4,T.CARPET);CH_(r,0,5,'home');}
for(const b of BUILD)if(b.kind!=='mill'&&b.kind!=='stall')furnish(b);
const roomAt=(tx,ty)=>ROOMS.find(r=>tx>=r.x0-1&&tx<=r.x0+r.w&&ty>=r.y0-1&&ty<=r.y0+r.h);
G.ROOMS=ROOMS;G.roomAt=roomAt;G.room=null;
function hgt(x,y){if(x>WW+1)return 0;let h=0;{const sd=Math.hypot(x-G.SUMMIT.x-.5,y-G.SUMMIT.y-.5);if(sd<6.5)h+=7.2;else if(sd<11)h+=7.2*(.5+.5*Math.cos(Math.PI*(sd-6.5)/4.5));}const dc=Math.hypot(x-HILL.x,y-HILL.y);{const cdx=Math.max(CASTLE.x0-.5-x,0,x-CASTLE.x1-1.5),cdy=Math.max(CASTLE.y0-.5-y,0,y-CASTLE.y1-1.5),cd=Math.hypot(cdx,cdy);if(cd<10){const k=cd<=.6?1:.5*(1+Math.cos(Math.PI*Math.min(1,(cd-.6)/9.4)));h+=HILL.h*k;}}
 const dv=Math.hypot(x-VCX-.5,y-VCY-.5);let out=sm(RV,RV+8,dv)*(1-(dc<HILL.r+4?sm(HILL.r+4,HILL.r-2,dc):0));for(const tw of TOWNS){const dt=Math.hypot(x-tw.x,y-tw.y);out*=sm(tw.r+1,tw.r+7,dt);}
 const b=biome(x,y);
 if(out>0){h+=(noise(x/13,y/13,77)-.5)*1.7*out;h+=(noise(x/40,y/40,78)-.5)*2.2*out;
  if(b==='peaks'){const rg=noise(x/6,y/6,SEED+31);h+=(1.5+noise(x/9,y/9,91)*4.5+Math.max(0,rg-.45)*9)*out;}
  else if(y<160){h+=noise(x/7,y/7,88)*(x>300?2.4:1.6)*sm(165,140,y)*out;}
  if(b==='desert')h+=Math.sin(x*.21+noise(x/8,y/8,92)*4)*.45*out;}
 if(y>420){const [dcn]=segD(x,y,CANYON);const cw=canyonW(x,y);if(dcn<cw+3){const k=sm(cw+2.2,cw-.3,dcn);let ramp=0;for(let i=0;i<RLIST.length;i+=6){if(Math.abs(RLIST[i]-x)<3&&Math.abs(RLIST[i+1]-y)<3){ramp=1;break;}}h-=k*(ramp?2.2:3.6);}}
 const dl=Math.hypot(x-LAIR.x,y-LAIR.y);if(dl<24)h+=4.5*.5*(1+Math.cos(Math.PI*dl/24));
 return h;}
G.flags={barrier:false};
const tileAt=(tx,ty)=>(tx<0||ty<0||tx>=W||ty>=H)?T.ROCK:map[ty*W+tx];
const isSolidT=t=>SOLIDS[t]||(t===T.BARRIER&&!G.flags.barrier);
const walkTile=(tx,ty)=>!isSolidT(tileAt(tx,ty));
const solidPx=(px,py)=>isSolidT(tileAt(Math.floor(px/TILE),Math.floor(py/TILE)));
const canMove=(x,y,r)=>!solidPx(x-r,y-r)&&!solidPx(x+r,y-r)&&!solidPx(x-r,y+r)&&!solidPx(x+r,y+r);
const solidPP=(px,py)=>{const t=tileAt(Math.floor(px/TILE),Math.floor(py/TILE));const p=G.P;if(t===T.LEDGE)return!(p&&(p.z>13||p.onLedge));if(t===T.CLIMB)return false;return isSolidT(t);};
const canMoveP=(x,y,r)=>!solidPP(x-r,y-r)&&!solidPP(x+r,y-r)&&!solidPP(x-r,y+r)&&!solidPP(x+r,y+r);
const vDist=(px,py)=>Math.hypot(px/TILE-VCX-.5,py/TILE-VCY-.5);
const inSafe=(px,py)=>{if(px>=WW*TILE)return !(G.room&&G.room.dungeon);const tx=px/TILE,ty=py/TILE;if(vDist(px,py)<RV-.4||inCastle(Math.floor(tx),Math.floor(ty)))return true;return TOWNS.some(t=>Math.hypot(tx-t.x-.5,ty-t.y-.5)<t.r-.4);};
const monBlocked=(px,py)=>{const tx=px/TILE,ty=py/TILE;if(vDist(px,py)<RV+.6||inCastle(Math.floor(tx),Math.floor(ty)))return true;return TOWNS.some(t=>Math.hypot(tx-t.x-.5,ty-t.y-.5)<t.r+1.2);};
Object.assign(G,{TILE,WW,W,H,VCX,VCY,RV,CH,T,map,biome,BL,zoneLevel,dV,hgt,CASTLE,inCastle,HILL,CAMP,CRYPT,LAIR,BANDITS,ASHVALE,CANYON,ZN,GC,BUILD,TOWNS,WAYS,tileAt,isSolidT,walkTile,solidPx,canMove,vDist,inSafe,townAt,SOLIDS});

// ===================== Gegenstände =====================
const RAR=[{n:'Gewöhnlich',c:'#a6a6a6',d:'#6b6b6b'},{n:'Ungewöhnlich',c:'#41c94a',d:'#23852b'},{n:'Selten',c:'#3d8bff',d:'#1f5fd1'},{n:'Episch',c:'#b14cff',d:'#7d22c9'},{n:'Legendär',c:'#ffb300',d:'#b87500'},{n:'Mythisch',c:'#ff2d55',d:'#c8002a'}];
const RMULT=[1,1.16,1.34,1.55,1.8,2.1];const RMULT_OLD=[1,1.4,1.85,2.4,3.1,4.2];
const pw=l=>4+l*1.8+.06*l*l;G.pw=pw;
function rollRar(t){const r=Math.random()*100;let a=0;for(let i=5;i>=0;i--){a+=t[i];if(r<a)return i;}return 0;}
const METAL=['#b8bcc2','#d0d6dc','#e8eef6','#a9ecff','#ffd970','#ff7a96'];
const AFX={melee:v=>`+${v}% Nahkampfschaden`,ranged:v=>`+${v}% Fernkampfschaden`,spell:v=>`+${v}% Zauberschaden`,hp:v=>`+${v} Lebenspunkte`,defp:v=>`+${v}% Rüstung`,res:v=>`+${v}% Resistenz (Gift & Magie)`,spd:v=>`+${v}% Lauftempo`,crit:v=>`+${v}% kritische Treffer`,regen:v=>`+${v} LP/Sek. Regeneration`,luck:v=>`+${v}% Beute-Chance`};
const AFX_SUF={melee:' der Stärke',ranged:' des Falken',spell:' des Arkanen',hp:' des Lebens',defp:' der Festung',res:' der Reinheit',spd:' des Windes',crit:' der Präzision',regen:' der Heilung',luck:' des Glücks'};
const SLOTN={weapon:'Waffe',helm:'Helm',chest:'Brustrüstung',legs:'Beinschutz',boots:'Stiefel',ring:'Ring',amulet:'Amulett'};
const WKIND={
 sword:{n:'schwert',cls:'melee',m:1,cd:.45,reach:46,arc:.95,sp:'Hieb im Bogen vor dir, ausgewogen',mat:'metal'},
 axe:{n:'streitaxt',cls:'melee',m:1.18,cd:.58,reach:46,arc:1.1,sp:'langsamer, breiter Hieb',mat:'metal'},
 mace:{n:'streitkolben',cls:'melee',m:1.32,cd:.7,reach:42,arc:.95,stag:1,sp:'wuchtig: stößt weit zurück und unterbricht Angriffe',mat:'metal'},
 dagger:{n:'dolch',cls:'melee',m:.72,cd:.24,reach:32,arc:.8,sp:'sehr kurz, sehr schnell, +8% Krit',mat:'metal'},
 spear:{n:'speer',cls:'melee',m:1.05,cd:.5,reach:94,arc:.2,thrust:1,sp:'nur gerader Stich nach vorn, größte Reichweite',mat:'metal'},
 halberd:{n:'hellebarde',cls:'melee',m:1.35,cd:.76,reach:86,arc:.3,thrust:1,sp:'schwerer gerader Stich, sehr große Reichweite',mat:'metal'},
 greatsword:{n:'zweihänder',cls:'melee',m:1.6,cd:.88,reach:56,arc:1.4,sp:'riesiger, langsamer Rundhieb',mat:'metal'},
 warhammer:{n:'kriegshammer',cls:'melee',m:1.75,cd:.98,reach:44,arc:1,stag:1,stun:.25,sp:'betäubt mit 25 % Chance, wirft zurück',mat:'metal'},
 flail:{n:'morgenstern',cls:'melee',m:1.42,cd:.8,reach:52,arc:1.6,stag:1,sp:'weit schwingend, unterbricht Angriffe',mat:'metal'},
 scythe:{n:'sense',cls:'melee',m:1.3,cd:.72,reach:64,arc:2.3,sp:'fast Rundumschlag – nur Sensenmänner tragen sie',mat:'metal'},
 bow:{n:'bogen',cls:'ranged',m:.8,cd:.5,range:330,spd:560,proj:'arrow',sp:'mittlere Reichweite, volle Bewegung beim Schießen',mat:'wood'},
 longbow:{n:'langbogen',cls:'ranged',m:.74,cd:.4,range:520,spd:820,proj:'arrow',draw:.6,sp:'schnellste Schussfolge, größte Reichweite, langsamer beim Zielen',mat:'wood'},
 crossbow:{n:'armbrust',cls:'ranged',m:1.95,cd:1.3,range:400,spd:880,proj:'bolt',pierce:1,kbk:2,sp:'langsam nachladen, massiver Schaden, durchschlagend',mat:'wood'},
 tome_fire:{mana:14,n:'Zauberbuch des Feuers',cls:'magic',m:1,cd:.8,range:320,spd:330,proj:'fire',elem:'fire',sp:'Feuerball, setzt in Brand',mat:'tome'},
 tome_frost:{mana:11,n:'Zauberbuch des Frostes',cls:'magic',m:.9,cd:.72,range:330,spd:380,proj:'frost',elem:'frost',sp:'Frostlanze, verlangsamt',mat:'tome'},
 tome_storm:{mana:12,n:'Zauberbuch der Blitze',cls:'magic',m:.82,cd:.62,range:300,spd:560,proj:'storm',elem:'storm',sp:'Blitz, springt über',mat:'tome'},
 tome_light:{mana:10,n:'Zauberbuch des Lichts',cls:'magic',m:.78,cd:.7,range:310,spd:420,proj:'light',elem:'holy',sp:'Lichtstrahl, heilt dich',mat:'tome'},
};
const SETS={
 ritter:{n:'Ritter',defm:1,mat:'metal',prim:'melee',pieces:{helm:'Ritterhelm',chest:'Ritterharnisch',legs:'Ritterbeinschienen',boots:'Rittersabatons'},b2:'+15% Nahkampfschaden',b4:'+25% Nahkampfschaden, +10% Krit',c:'#c0c6d0',fx:(s,n)=>{if(n>=2)s.melee+=15;if(n>=4){s.melee+=25;s.crit+=10;}}},
 waldlaeufer:{n:'Waldläufer',defm:.75,mat:'leather',prim:'ranged',pieces:{helm:'Waldläuferkappe',chest:'Waldläuferweste',legs:'Waldläuferhose',boots:'Waldläuferstiefel'},b2:'+15% Fernkampfschaden',b4:'+25% Fernkampfschaden, +15% Tempo',c:'#6a8a3a',fx:(s,n)=>{if(n>=2)s.ranged+=15;if(n>=4){s.ranged+=25;s.spd+=15;}}},
 waechter:{n:'Wächter',defm:1.35,mat:'metal',prim:'defp',pieces:{helm:'Wächterhelm',chest:'Wächterpanzer',legs:'Wächterbeinschutz',boots:'Wächterstiefel'},b2:'+20% Rüstung',b4:'+40% Rüstung, +15% Leben',c:'#7a8090',fx:(s,n)=>{if(n>=2)s.defp+=20;if(n>=4){s.defp+=40;s.hpPct+=15;}}},
 heiler:{n:'Heiler',defm:.7,mat:'cloth',prim:'res',pieces:{helm:'Heilerhaube',chest:'Heilerrobe',legs:'Heilerhose',boots:'Heilerschuhe'},b2:'+30% Resistenz gegen Gift & Magie',b4:'+60% Resistenz, +2% LP pro Sek.',c:'#f0f0e0',fx:(s,n)=>{if(n>=2)s.res+=30;if(n>=4){s.res+=30;s.regenPct+=2;}}},
 magier:{n:'Magier',defm:.6,mat:'cloth',prim:'spell',pieces:{helm:'Magierhut',chest:'Magierrobe',legs:'Magierhose',boots:'Magierschuhe'},b2:'+15% Zauberschaden',b4:'+30% Zauberschaden, 20% schnellere Zauber',c:'#5a3aa8',fx:(s,n)=>{if(n>=2)s.spell+=15;if(n>=4){s.spell+=30;s.castFast=1;}}},
};
const MAT={metal:['Kupfer','Bronze','Eisen','Stahl','Mithril','Adamant','Drachen'],wood:['Kiefern','Eschen','Eiben','Ulmen','Elfen','Weltbaum','Drachenknochen'],leather:['Leder','Wildleder','Wolfsleder','Bärenleder','Wyvernleder','Greifenleder','Drachenleder'],cloth:['Leinen','Woll','Seiden','Mondseiden','Sternen','Himmels','Götter'],gem:['Kupfer','Silber','Gold','Saphir','Rubin','Smaragd','Sternen'],tome:['Abgegriffenes','Altes','Gelehrtes','Arkanes','Uraltes','Verbotenes','Göttliches']};
const band=l=>clamp(Math.floor((l-1)/4.4),0,6);
const SLM={helm:.6,chest:1,legs:.8,boots:.5};
const STACK={bread:{name:'Brot',type:'food',heal:40,desc:'Heilt 40 LP. Tippen zum Essen.',price:8,sell:3},carrot:{name:'Karotte',type:'food',heal:25,plant:'carrot',desc:'Heilt 25 LP. Kann auch nahe Wasser gepflanzt werden.',price:4,sell:2},
 potion:{name:'Heiltrank',type:'food',pct:.5,desc:'Heilt 50 % deiner LP und heilt Gift. Tippen zum Trinken.',price:30,sell:10},potion2:{name:'Großer Heiltrank',type:'food',pct:1,desc:'Heilt alle LP und alle Zustände.',price:90,sell:30},
 seed:{name:'Weizensaat',type:'seed',plant:'wheat',desc:'Pflanzen: auf Gras/Erde nahe Wasser (max. 4 Felder) oder auf Ackerfeldern.',price:2,sell:1},hseed:{name:'Heilkrautsamen',type:'seed',plant:'herb',desc:'Pflanzen nahe Wasser. Heilkraut wird bei Mara zu Heiltränken.',price:6,sell:2},
 arrow:{name:'Pfeile',type:'ammo',desc:'Munition für Bogen und Langbogen. Jeder Schuss verbraucht einen Pfeil.',price:1,pack:20,sell:0},bolt:{name:'Armbrustbolzen',type:'ammo',desc:'Munition für die Armbrust. Jeder Schuss verbraucht einen Bolzen.',price:2,pack:12,sell:0},
 mpotion:{name:'Manatrank',type:'food',mana:.6,desc:'Füllt 60 % deines Manas auf. Tippen zum Trinken.',price:25,sell:8},
 wheat:{name:'Weizen',type:'material',desc:'Für Bäcker Bernd.',sell:2},herb:{name:'Heilkraut',type:'material',desc:'3 Heilkraut → 1 Heiltrank bei Heilerin Mara.',sell:4},ear:{name:'Goblin-Ohr',type:'quest',desc:'Für Wache Otto.',sell:0}};
const PRE={
 scharf:{n:'Scharf',c:'w',dmg:.1},schnell:{n:'Schnell',c:'w',spd:.1},wuchtig:{n:'Wuchtig',c:'w',dmg:.15,spd:-.05},toedlich:{n:'Tödlich',c:'w',dmg:.08,crit:5},
 flink:{n:'Flink',c:'w',spd:.15,dmg:-.05},meister:{n:'Meisterhaft',c:'w',dmg:.12,spd:.08,crit:3},legendaer:{n:'Legendär',c:'w',dmg:.15,spd:.1,crit:5,best:1},
 stumpf:{n:'Stumpf',c:'w',dmg:-.15},traege:{n:'Träge',c:'w',spd:-.12},kaputt:{n:'Kaputt',c:'w',dmg:-.2,crit:-3},
 hart:{n:'Hart',c:'a',def:.1},bewacht:{n:'Bewacht',c:'a',def:.15},vital:{n:'Vital',c:'a',hp:4},gluecklich:{n:'Glücklich',c:'a',crit:2,luck:5},
 leichtfuss:{n:'Leichtfüßig',c:'a',mspd:4},wehrhaft:{n:'Wehrhaft',c:'a',def:.2,hp:3,best:1},bruechig:{n:'Brüchig',c:'a',def:-.15},schwer:{n:'Schwerfällig',c:'a',mspd:-4}};
const preCls=it=>it.type==='weapon'?'w':'a';
function rollPre(it){const ks=Object.keys(PRE).filter(k=>PRE[k].c===preCls(it));return pick(ks);}
const reqLvl=it=>!it||it.stack?0:Math.max(1,it.ilvl-2);
const iname=it=>it.pre&&PRE[it.pre]?`${it.name} «${PRE[it.pre].n}»`:it.name;
const reforgeCost=it=>Math.round(12+(4+pw(it.ilvl)*1.5)*(1+it.rarity*.6)*.9);
// wirksame Werte eines Gegenstands inkl. Präfix
function itemEff(it){const p=(it.pre&&PRE[it.pre])||{};const e={};if(it.dmg!=null){const K=WKIND[it.kind];e.dmg=Math.round(it.dmg*(1+(p.dmg||0)));e.cd=K.cd/(1+(p.spd||0));e.crit=(p.crit||0)+(it.kind==='dagger'?8:0);}
 if(it.def!=null)e.def=Math.round(it.def*(1+(p.def||0)));if(p.c==='a'){if(p.hp)e.hpPct=p.hp;if(p.crit)e.crit=p.crit;if(p.luck)e.luck=p.luck;if(p.mspd)e.spd=p.mspd;}return e;}
const mkStack=(id,n)=>({id,stack:true,count:n,rarity:0,type:STACK[id].type,name:STACK[id].name});
let uidC=1;
const AFPOOL={melee:['melee','crit','hp','spd','luck','regen'],ranged:['ranged','crit','spd','luck','hp'],magic:['spell','crit','regen','res','luck'],ritter:['melee','hp','crit','defp'],waldlaeufer:['ranged','spd','crit','luck'],waechter:['defp','hp','res','regen'],heiler:['res','regen','hp','spell'],magier:['spell','crit','res','spd'],jewel:['melee','ranged','spell','hp','crit','spd','regen','luck','res','defp']};
function afxVal(k,l,r){const M=RMULT[r];switch(k){case'melee':case'ranged':case'spell':return Math.round((3+l*.25)*M*.8);case'hp':return Math.round(pw(l)*1.3*M);case'defp':return Math.round((3+l*.2)*M*.7);case'res':return Math.round((4+l*.3)*M*.6);case'spd':return Math.round(2+r*1.6);case'crit':return Math.round(2+r*1.5+l*.06);case'regen':return Math.round((.3+pw(l)*.035)*M*10)/10;case'luck':return Math.round(3+r*3);}return 0;}
// o: {kind,set,name,boss,bossy,f,src}
function genItem(type,ilvl,rar,o){o=o||{};ilvl=Math.max(1,Math.round(ilvl));
 const it={uid:(Date.now()%1e8)+'-'+(uidC++),type,rarity:rar,ilvl,af:{},v13:1};const M=RMULT[rar]*(o.boss||o.bossy?1.2:1),b=band(ilvl);let pool,base;
 if(type==='weapon'){const k=o.kind||pick(Object.keys(WKIND));const K=WKIND[k];it.kind=k;it.dmg=Math.round(pw(ilvl)*M*K.m);pool=AFPOOL[K.cls];
  base=K.mat==='tome'?`${MAT.tome[b]} ${K.n}`:MAT[K.mat][b]+K.n;}
 else if(SLM[type]){const st=o.set||pick(Object.keys(SETS));const S=SETS[st];it.set=st;it.def=Math.round(pw(ilvl)*.5*SLM[type]*S.defm*M);if(o.kind)it.kind=o.kind;pool=AFPOOL[st];base=MAT[S.mat][b]+'-'+S.pieces[type];}
 else{pool=AFPOOL.jewel;base=MAT.gem[b]+(type==='ring'?'ring':'amulett');}
 let n=(type==='ring'||type==='amulet')?rar+1:rar;if(o.boss||o.bossy)n++;n=Math.min(n,pool.length);
 const keys=shuffle(pool.slice());if(it.set&&n>0){const p=SETS[it.set].prim;keys.splice(keys.indexOf(p),1);keys.unshift(p);}if(o.f&&keys.indexOf(o.f)>=0){keys.splice(keys.indexOf(o.f),1);keys.unshift(o.f);}else if(o.f&&n>0){keys.unshift(o.f);}
 for(let i=0;i<n;i++)it.af[keys[i]]=afxVal(keys[i],ilvl,rar);
 it.name=o.name||(base+(n>0&&rar>=2&&!(it.kind&&WKIND[it.kind].mat==='tome')?AFX_SUF[keys[0]]:''));
 if(o.boss)it.boss=o.boss;if(o.src)it.src=o.src;if(o.ufx){it.ufx=o.ufx;it.ud=o.ud;it.uniq=1;}if(!o.name&&Math.random()<.3)it.pre=rollPre(it);return it;}
const itemScore=it=>{if(!it||it.stack)return 0;const p=(it.pre&&PRE[it.pre])||{};const pm=1+(p.dmg||0)+(p.spd||0)*.8+(p.crit||0)*.01+(p.def||0)+(p.hp||0)*.01+(p.luck||0)*.004+(p.mspd||0)*.01;return Math.round(pw(it.ilvl)*RMULT[it.rarity]*(it.boss?1.2:1)*pm*10);};
const SLOTS4=['helm','chest','legs','boots'];
function lootItem(key,ilvl,rar,o){o=o||{};if(WKIND[key])return genItem('weapon',ilvl,rar,Object.assign({},o,{kind:key}));if(SETS[key])return genItem(pick(SLOTS4),ilvl,rar,Object.assign({},o,{set:key}));return genItem(key==='ring'||key==='amulet'?key:pick(['ring','amulet']),ilvl,rar,o);}
const sellPrice=it=>it.stack?(STACK[it.id].sell||0)*it.count:Math.round((4+pw(it.ilvl)*1.5)*(1+it.rarity*it.rarity*.9)*(it.pre&&PRE[it.pre].best?1.3:1));
Object.assign(G,{PRE,rollPre,reqLvl,iname,reforgeCost,itemEff,RAR,RMULT,rollRar,METAL,AFX,SLOTN,WKIND,SETS,STACK,mkStack,genItem,sellPrice,itemScore,lootItem});

function drawIcon(g,it,s){const c=RAR[it.rarity||0].c;let mt=METAL[it.rarity||0];if(it.set){const S=SETS[it.set];if(S.mat==='leather')mt=['#7a5a32','#86653a','#946f40','#a07a48','#b08850','#c09858'][it.rarity||0];else if(S.mat==='cloth')mt=S.c;}g.save();g.scale(s/32,s/32);g.lineCap='round';g.lineJoin='round';g.lineWidth=1.5;
 switch(it.type){
 case'weapon':{g.translate(16,16);g.rotate(Math.PI/4);const k=it.kind,wood=it.name==='Rostiges Schwert';
  if(k==='sword'||k==='dagger'){const L=k==='dagger'?10:15;g.fillStyle=wood?'#a07a5a':mt;g.beginPath();g.moveTo(-2.6,4);g.lineTo(-2.6,-L+3);g.lineTo(0,-L);g.lineTo(2.6,-L+3);g.lineTo(2.6,4);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.45)';g.stroke();g.fillStyle=c;g.fillRect(-7,4,14,3.2);g.fillStyle='#6b4423';g.fillRect(-1.6,7,3.2,6);g.fillStyle=c;g.beginPath();g.arc(0,14,2.2,0,7);g.fill();}
  else if(k==='spear'||k==='halberd'){g.fillStyle='#7a5230';g.fillRect(-1.3,-6,2.6,22);g.fillStyle=mt;g.beginPath();g.moveTo(0,-16);g.lineTo(3.5,-7);g.lineTo(-3.5,-7);g.closePath();g.fill();if(k==='halberd'){g.beginPath();g.moveTo(1,-9);g.lineTo(9,-12);g.quadraticCurveTo(11,-6,8,-2);g.lineTo(1,-4);g.fill();}g.fillStyle=c;g.fillRect(-2.5,-7,5,2);}
  else if(k==='bow'||k==='longbow'){g.rotate(-Math.PI/4);g.strokeStyle='#8a5a2a';g.lineWidth=k==='longbow'?2.4:3;const R=k==='longbow'?14:11;g.beginPath();g.arc(-4,0,R,-1.25,1.25);g.stroke();g.strokeStyle='#eee';g.lineWidth=.8;g.beginPath();g.moveTo(-4+Math.cos(-1.25)*R,Math.sin(-1.25)*R);g.lineTo(-4+Math.cos(1.25)*R,Math.sin(1.25)*R);g.stroke();g.fillStyle=c;g.fillRect(R-6,-2,3,4);}
  else if(k==='crossbow'){g.rotate(-Math.PI/4);g.fillStyle='#6a4626';g.fillRect(-12,-2,22,4);g.strokeStyle=mt;g.lineWidth=2.5;g.beginPath();g.arc(8,0,9,Math.PI*.6,Math.PI*1.4);g.stroke();g.fillStyle=c;g.fillRect(-4,-3,4,6);}
  else if(k&&k.indexOf('tome')===0){g.rotate(-Math.PI/4);const ec={tome_fire:'#c0391b',tome_frost:'#2a7ab0',tome_storm:'#6a4ab0',tome_light:'#d8b030'}[k];g.fillStyle=ec;g.fillRect(-10,-12,20,24);g.fillStyle='#f4e6c4';g.fillRect(8,-11,3,22);g.fillStyle=c;g.fillRect(-10,-12,3,24);g.fillStyle='#fff3b0';g.beginPath();g.arc(1,0,4.5,0,7);g.fill();g.fillStyle=ec;g.beginPath();g.arc(1,0,2.2,0,7);g.fill();}
  else if(k==='greatsword'){g.fillStyle=mt;g.beginPath();g.moveTo(-3.4,6);g.lineTo(-3.4,-15);g.lineTo(0,-19);g.lineTo(3.4,-15);g.lineTo(3.4,6);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.45)';g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-.6,-15,1.2,20);g.fillStyle=c;g.fillRect(-8,6,16,3);g.fillStyle='#4a3020';g.fillRect(-1.6,9,3.2,8);}
  else if(k==='warhammer'){g.fillStyle='#7a5230';g.fillRect(-1.6,-10,3.2,26);g.fillStyle=mt;g.fillRect(-9,-16,18,9);g.strokeStyle='rgba(0,0,0,.5)';g.strokeRect(-9,-16,18,9);g.fillStyle=c;g.fillRect(-9,-13,18,2);}
  else if(k==='flail'){g.fillStyle='#7a5230';g.fillRect(-1.6,2,3.2,14);g.strokeStyle='#888';g.lineWidth=1.4;g.beginPath();g.moveTo(0,2);g.quadraticCurveTo(-6,-4,-2,-9);g.stroke();g.fillStyle=mt;g.beginPath();g.arc(-2,-12,5,0,7);g.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(-2+Math.cos(a)*4,-12+Math.sin(a)*4);g.lineTo(-2+Math.cos(a)*8,-12+Math.sin(a)*8);g.lineTo(-2+Math.cos(a+.3)*4,-12+Math.sin(a+.3)*4);g.fill();}}
  else if(k==='scythe'){g.fillStyle='#3a2a1a';g.fillRect(-1.4,-15,2.8,31);g.fillStyle=mt;g.beginPath();g.moveTo(1,-15);g.quadraticCurveTo(14,-14,15,-2);g.quadraticCurveTo(10,-10,1,-10);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=1.5;g.stroke();}
  else if(k==='axe'){g.fillStyle='#7a5230';g.fillRect(-1.6,-12,3.2,26);g.fillStyle=mt;g.beginPath();g.moveTo(1,-13);g.lineTo(9,-16);g.quadraticCurveTo(14,-8,9,0);g.lineTo(1,-4);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=2;g.stroke();}
  else{g.fillStyle='#7a5230';g.fillRect(-1.6,-5,3.2,19);g.fillStyle=c;g.fillRect(-2.6,6,5.2,2.5);g.fillStyle=mt;for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.moveTo(Math.cos(a)*4,-9+Math.sin(a)*4);g.lineTo(Math.cos(a)*9,-9+Math.sin(a)*9);g.lineTo(Math.cos(a+.5)*4,-9+Math.sin(a+.5)*4);g.fill();}g.beginPath();g.arc(0,-9,6,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.4)';g.stroke();}
  break;}
 case'helm':{if(it.kind==='crown'){g.fillStyle='#ffcf40';g.beginPath();g.moveTo(5,24);g.lineTo(5,10);g.lineTo(10,17);g.lineTo(16,7);g.lineTo(22,17);g.lineTo(27,10);g.lineTo(27,24);g.closePath();g.fill();g.strokeStyle='#8a6a00';g.stroke();g.fillStyle=c;g.beginPath();g.arc(16,19,3,0,7);g.fill();}
  else{g.fillStyle=mt;g.beginPath();g.arc(16,19,11,Math.PI,0);g.lineTo(27,26);g.lineTo(5,26);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=2;g.stroke();g.fillStyle='#333';g.fillRect(8,18,16,3);g.fillRect(15,18,2,8);g.fillStyle=c;g.fillRect(14.5,4,3,5);}break;}
 case'chest':{g.fillStyle=mt;g.beginPath();g.moveTo(9,5);g.lineTo(13,4);g.quadraticCurveTo(16,8,19,4);g.lineTo(23,5);g.lineTo(29,12);g.lineTo(25,15);g.lineTo(24,28);g.lineTo(8,28);g.lineTo(7,15);g.lineTo(3,12);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=2;g.stroke();g.strokeStyle='rgba(0,0,0,.3)';g.beginPath();g.moveTo(16,9);g.lineTo(16,27);g.moveTo(9,18);g.lineTo(23,18);g.stroke();break;}
 case'legs':{g.fillStyle=mt;g.beginPath();g.moveTo(9,6);g.lineTo(23,6);g.lineTo(25,28);g.lineTo(18.5,28);g.lineTo(16,14);g.lineTo(13.5,28);g.lineTo(7,28);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=2;g.stroke();g.fillStyle=c;g.fillRect(8.5,5,15,3.5);break;}
 case'boots':{g.fillStyle=mt;g.beginPath();g.moveTo(9,5);g.lineTo(18,5);g.lineTo(18,19);g.lineTo(27,21);g.quadraticCurveTo(29,28,25,28);g.lineTo(9,28);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=2;g.stroke();g.fillStyle=c;g.fillRect(8,5,11,4);break;}
 case'ring':{g.strokeStyle=mt;g.lineWidth=4;g.beginPath();g.arc(16,19,8,0,7);g.stroke();g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;g.stroke();g.fillStyle=c;g.beginPath();g.moveTo(16,4);g.lineTo(21,9);g.lineTo(16,14);g.lineTo(11,9);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(14,7,2,2);break;}
 case'amulet':{g.strokeStyle=mt;g.lineWidth=2;g.beginPath();g.moveTo(6,3);g.quadraticCurveTo(16,20,26,3);g.stroke();g.fillStyle=mt;g.beginPath();g.arc(16,21,7.5,0,7);g.fill();g.fillStyle=c;g.beginPath();g.arc(16,21,5,0,7);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(13.5,18,2,2);break;}
 case'food':{if(it.id==='carrot'){g.fillStyle='#ff8a1e';g.beginPath();g.moveTo(9,9);g.lineTo(25,25);g.lineTo(13,7);g.closePath();g.fill();g.beginPath();g.ellipse(11,9,5,4,.8,0,7);g.fill();g.fillStyle='#3fae3f';g.fillRect(5,3,3,7);g.fillRect(8,1,3,7);break;}if(it.id==='potion2'){g.fillStyle='#cfe3ee';g.fillRect(13,3,6,8);g.fillStyle='#8a5a24';g.fillRect(12.5,1,7,4);g.fillStyle='#9a2ad3';g.beginPath();g.arc(16,20,11,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(12,16,3,0,7);g.fill();break;}if(it.id==='mpotion'){g.fillStyle='#cfe3ee';g.fillRect(13,5,6,9);g.fillStyle='#8a5a24';g.fillRect(12.5,3,7,4);g.fillStyle='#2962ff';g.beginPath();g.arc(16,20,9,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(13,17,2.5,0,7);g.fill();break;}if(it.id==='potion'){g.fillStyle='#cfe3ee';g.fillRect(13,5,6,9);g.fillStyle='#8a5a24';g.fillRect(12.5,3,7,4);g.fillStyle='#d32f2f';g.beginPath();g.arc(16,20,9,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(13,17,2.5,0,7);g.fill();}
  else{g.fillStyle='#c98a3e';g.beginPath();g.ellipse(16,18,13,8.5,0,0,7);g.fill();g.strokeStyle='#8a5a24';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(9+i*6,13);g.lineTo(12+i*6,22);g.stroke();}}break;}
 case'ammo':{const b=it.id==='bolt';for(let i=0;i<3;i++){g.save();g.translate(9+i*6,27);g.rotate(-.5+i*.05);g.strokeStyle='#7a5230';g.lineWidth=b?2.4:1.8;g.beginPath();g.moveTo(0,0);g.lineTo(9,-20);g.stroke();g.fillStyle='#c8ccd2';g.beginPath();g.moveTo(10.5,-23);g.lineTo(7,-17);g.lineTo(11,-16.5);g.closePath();g.fill();if(!b){g.fillStyle='#e8e0c8';g.fillRect(-1.5,-3,3,4);}g.restore();}break;}
 case'seed':{if(it.id==='hseed'){g.fillStyle='#4a8a3a';for(let i=0;i<6;i++){g.beginPath();g.arc(9+(i%3)*7,13+Math.floor(i/3)*8,2.6,0,7);g.fill();}g.strokeStyle='#2a5a1a';g.lineWidth=1;g.strokeRect(5,24,22,4);break;}g.fillStyle='#d8b450';for(let i=0;i<7;i++){g.beginPath();g.ellipse(8+(i%4)*5+(i>3?2:0),12+Math.floor(i/4)*8+(i%2)*2,2.6,3.6,.4,0,7);g.fill();}g.strokeStyle='#7a5a20';g.lineWidth=1;g.strokeRect(5,24,22,4);break;}
 case'material':{if(it.id==='herb'){g.fillStyle='#3a9a3a';for(let i=0;i<5;i++){g.save();g.translate(16,24);g.rotate(-1+i*.5);g.beginPath();g.ellipse(0,-9,3.5,8,0,0,7);g.fill();g.restore();}g.fillStyle='#e8f0a0';g.beginPath();g.arc(16,12,2.5,0,7);g.fill();break;}g.strokeStyle='#c9a64a';g.lineWidth=1.8;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(16,29);g.lineTo(16+i*7,6);g.stroke();g.fillStyle='#e8c95a';for(let j=0;j<4;j++){g.beginPath();g.ellipse(16+i*7-i*j*1.2-2,8+j*3.5,2,3,-.4,0,7);g.fill();g.beginPath();g.ellipse(16+i*7-i*j*1.2+2,8+j*3.5,2,3,.4,0,7);g.fill();}}break;}
 case'quest':{g.fillStyle='#7bb661';g.beginPath();g.moveTo(10,26);g.quadraticCurveTo(4,10,18,5);g.quadraticCurveTo(28,8,22,20);g.quadraticCurveTo(18,24,10,26);g.fill();g.strokeStyle='#3e6b2a';g.lineWidth=2;g.stroke();g.beginPath();g.moveTo(14,20);g.quadraticCurveTo(12,12,18,10);g.stroke();break;}
 case'furn':case'tool':{g.font='22px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(it.type==='tool'?'🔨':(FURN[STACK[it.id].fk]||{}).ic||'🪑',16,17);if(it.type==='furn'){g.fillStyle='#ffd54a';g.font='bold 9px Georgia';g.fillText('★'+STACK[it.id].ft,25,27);}break;}
 case'gold':{g.fillStyle='#b8860b';g.beginPath();g.arc(13,19,8,0,7);g.fill();g.fillStyle='#ffd54a';g.beginPath();g.arc(19,14,8,0,7);g.fill();g.strokeStyle='#8a6a00';g.lineWidth=1.5;g.stroke();g.fillStyle='#fff3b0';g.fillRect(16,11,3,3);break;}
 }g.restore();}
const iconCache=new Map();
G.icon=function(it){const k=it.type+'|'+(it.kind||it.id||'')+'|'+(it.set||'')+'|'+(it.rarity||0)+'|'+(it.name==='Rostiges Schwert'?1:0);let c=iconCache.get(k);if(!c){const e=document.createElement('canvas');e.width=e.height=64;drawIcon(e.getContext('2d'),it,64);c={cv:e,url:e.toDataURL()};iconCache.set(k,c);}return c;};
G.goldIt={type:'gold',rarity:0};

// ===================== Monster =====================
const MT={
 rabbit:{n:'Feldhase',c:'#a0805a',r:8,spd:100,hp:.45,dmg:.5,xp:.6,lv:[1,3],shape:'rabbit',b:'m',lg:'beast',passive:1},
 rat:{n:'Riesenratte',c:'#8a7a6a',r:10,spd:85,hp:.6,dmg:.8,xp:.8,lv:[1,5],shape:'rat',b:'m',lg:'beast'},
 boar:{n:'Wildschwein',c:'#6b4a33',r:13,spd:70,hp:1,dmg:1.1,xp:1.1,lv:[2,8],shape:'boar',ai:'charge',b:'m',lg:'beast'},
 fox:{n:'Rotfuchs',c:'#d2691e',r:10,spd:150,sk:['leap'],hp:.7,dmg:.85,xp:.9,lv:[3,8],shape:'wolf',scale:.8,b:'m',lg:'beast'},
 wolf:{n:'Wolf',c:'#8d8d99',r:12,spd:140,sk:['leap','howl'],hp:.85,dmg:.95,xp:1,lv:[4,12],shape:'wolf',pack:2,b:'mf',lg:'beast'},
 unicorn:{n:'Einhorn',c:'#f4f4ff',r:16,spd:125,hp:1.6,dmg:1.3,xp:2.4,lv:[20,20],shape:'horse',horn:1,ai:'charge',b:'m',lg:'mythic',passive:1,rare:.08,minD:100},
 slime:{n:'Schleim',c:'#5fcf5f',r:11,spd:55,hp:.7,dmg:.7,xp:.8,lv:[6,9],shape:'blob',b:'f',lg:'slime'},
 bandit:{n:'Bandit',c:'#6b3a2a',skin:'#e0ac7e',hood:'#3a2a1a',r:11,spd:118,human:1,hp:.95,dmg:1,xp:1.1,lv:[6,12],shape:'hum',wpn:'sword',b:'f',lg:'outlaw'},
 archer:{n:'Banditenschütze',c:'#4a5a2a',skin:'#e0ac7e',hood:'#2a3a1a',r:11,spd:75,hp:.7,dmg:.9,xp:1.2,lv:[7,12],shape:'hum',wpn:'bow',ai:'ranged',shot:{c:'#d8c08a',spd:330,cd:2.2,kind:'arrow'},b:'f',lg:'hunter'},
 spider:{n:'Riesenspinne',c:'#2b2b33',r:13,spd:130,hp:.9,dmg:.8,xp:1.2,lv:[8,15],shape:'spider',poison:1,sk:['web'],b:'fsd',lg:'venom'},
 goblin:{n:'Goblin',c:'#7a4a2a',skin:'#7bb661',r:10,spd:125,hp:.85,dmg:1,xp:1,lv:[7,13],shape:'hum',wpn:'dagger',scale:.85,b:'f',lg:'goblin'},
 shaman:{n:'Goblin-Schamane',c:'#5a2a6a',skin:'#7bb661',r:10,spd:70,hp:.7,dmg:1.1,xp:1.3,lv:[8,14],shape:'hum',wpn:'staff',scale:.85,ai:'ranged',shot:{c:'#7cff6b',spd:240,cd:2.6,kind:'orb'},b:'f',lg:'goblin'},
 bear:{n:'Braunbär',c:'#6b4423',r:17,spd:110,wind:.6,sk:['leap'],hp:1.7,dmg:1.35,xp:1.6,lv:[10,15],shape:'bear',b:'f',lg:'beast'},
 centaur:{n:'Zentaur',c:'#8a5a3a',skin:'#e0ac7e',r:15,spd:105,hp:1.2,dmg:1.15,xp:1.8,lv:[12,15],shape:'horse',torso:1,ai:'ranged',shot:{c:'#d8c08a',spd:400,cd:1.9,kind:'arrow'},b:'f',lg:'hunter'},
 skeleton:{skel:1,n:'Skelett',c:'#d8d2bd',skin:'#eeeadc',r:11,spd:72,hp:1,dmg:1.1,xp:1.1,lv:[10,16],shape:'hum',wpn:'sword',eye:'#ff3b3b',b:'sw',lg:'bone'},
 skarcher:{skel:1,n:'Skelettschütze',c:'#cfc8b0',skin:'#eeeadc',r:11,spd:70,hp:.75,dmg:1,xp:1.3,lv:[11,17],shape:'hum',wpn:'bow',eye:'#ff3b3b',ai:'ranged',shot:{c:'#eeeadc',spd:360,cd:2,kind:'arrow'},b:'s',lg:'bone'},
 ghoul:{n:'Moorleiche',c:'#4a5a3a',skin:'#8a9a6a',r:12,spd:70,sk:['grab'],zombie:1,hp:1.6,dmg:1.15,xp:1.3,lv:[10,16],shape:'hum',wpn:'none',poison:1,b:'s',lg:'spirit'},
 witch:{sk:['blink'],n:'Sumpfhexe',c:'#2a3a2a',skin:'#9ab07a',hat:'#1a1a1a',r:11,spd:68,hp:.8,dmg:1.2,xp:1.5,lv:[11,24],shape:'hum',wpn:'staff',ai:'ranged',shot:{c:'#9cff3b',spd:220,cd:2.4,kind:'orb',poison:1},b:'sd',lg:'spirit'},
 ghost:{n:'Irrgeist',c:'#bfe6ff',r:11,spd:135,sk:['blink'],hp:.75,dmg:1.1,xp:1.3,lv:[13,18],shape:'ghost',b:'s',lg:'spirit'},
 basilisk:{n:'Basilisk',c:'#5a8a3a',r:15,spd:110,hp:1.4,dmg:1.3,xp:1.7,lv:[14,24],shape:'lizard',ai:'charge',poison:1,b:'se',lg:'venom'},
 orc:{n:'Ork',c:'#6b4a2b',skin:'#5b8a3c',r:14,spd:72,hp:1.3,dmg:1.2,xp:1.3,lv:[14,19],shape:'hum',wpn:'axe',scale:1.2,b:'w',lg:'brute'},
 golem:{n:'Steingolem',c:'#7d7a70',r:17,spd:60,hp:2.4,dmg:1.5,xp:1.8,lv:[15,26],shape:'golem',wind:.75,b:'wp',lg:'brute'},
 troll:{n:'Troll',c:'#5d6a6e',skin:'#8a989c',r:17,spd:80,hp:1.8,dmg:1.4,xp:1.6,lv:[16,25],shape:'hum',wpn:'mace',scale:1.5,wind:.7,sk:['regen'],b:'wdp',lg:'brute'},
 minotaur:{n:'Minotaurus',c:'#5a3a2a',skin:'#6b4a33',r:16,spd:80,hp:2,dmg:1.6,xp:2,lv:[18,21],shape:'hum',horns:1,wpn:'axe',scale:1.45,ai:'charge',b:'w',lg:'brute'},
 griffin:{n:'Greif',c:'#c8a050',r:16,spd:150,hp:1.4,dmg:1.4,xp:1.9,lv:[17,26],shape:'bird',sk:['leap'],b:'wp',lg:'mythic'},
 frostslime:{n:'Frostschleim',c:'#9fe3ff',r:12,spd:55,hp:.9,dmg:.9,xp:1,lv:[12,16],shape:'blob',chill:1,b:'i',lg:'frost'},
 penguin:{n:'Pinguin',c:'#20242a',r:9,spd:60,hp:.6,dmg:.6,xp:.8,lv:[12,15],shape:'penguin',pack:3,b:'i',lg:'frost'},
 icewolf:{n:'Eiswolf',c:'#dfe9f2',r:13,spd:150,sk:['leap','howl'],hp:1,dmg:1.05,xp:1.2,lv:[13,20],shape:'wolf',pack:2,chill:1,b:'i',lg:'beast'},
 draugr:{n:'Draugr',c:'#3a4a5a',skin:'#8ab0c0',helm:'#5a6a7a',eye:'#7fd8ff',r:12,spd:78,hp:1.4,dmg:1.25,xp:1.4,lv:[15,22],shape:'hum',wpn:'axe',b:'i',lg:'undead'},
 frostgiant:{n:'Frostriese',c:'#6a8aa8',skin:'#a8c8e8',r:19,spd:55,hp:2.4,dmg:1.6,xp:2.2,lv:[18,22],shape:'hum',wpn:'mace',scale:1.75,chill:1,b:'i',lg:'brute'},
 lavaslime:{n:'Lavaschleim',c:'#ff6a1a',r:12,spd:60,hp:1,dmg:1.1,xp:1.2,lv:[20,25],shape:'blob',burn:1,b:'a',lg:'fire'},
 imp:{sk:['blink'],n:'Feuerdämon',c:'#e0562a',r:12,spd:120,hp:1,dmg:1.3,xp:1.5,lv:[21,28],shape:'imp',ai:'ranged',shot:{c:'#ff8a2a',spd:260,cd:2.2,kind:'orb',burn:1},b:'a',lg:'fire'},
 salamander:{n:'Lavaechse',c:'#c0441a',r:14,spd:80,hp:1.3,dmg:1.4,xp:1.6,lv:[22,28],shape:'lizard',ai:'charge',burn:1,b:'a',lg:'fire'},
 wyrmling:{n:'Drachenwelpe',c:'#c0301a',r:16,spd:95,hp:1.5,dmg:1.5,xp:2,lv:[24,30],shape:'dragon',ai:'ranged',shot:{c:'#ff7a1a',spd:280,cd:2.2,kind:'orb',burn:1},b:'a',lg:'fire'},
 knight:{wind:.55,n:'Dunkelritter',c:'#2e2e3e',skin:'#555',helm:'#222',r:13,spd:80,hp:1.5,dmg:1.4,xp:1.6,lv:[24,30],shape:'hum',wpn:'sword',eye:'#ff3b3b',b:'a',lg:'knight'},
 kobold:{n:'Kobold-Schleuderer',c:'#7a6a3a',skin:'#b0905a',hood:'#4a3a1a',r:9,spd:120,hp:.55,dmg:.75,xp:.9,lv:[2,7],shape:'hum',wpn:'none',scale:.7,ai:'ranged',shot:{c:'#9a8a7a',spd:300,cd:2.2,kind:'rock'},b:'m',lg:'goblin'},
 wasp:{n:'Riesenwespe',c:'#e8c020',r:9,spd:165,hp:.45,dmg:.65,xp:.9,lv:[3,9],shape:'wasp',poison:1,wind:.3,fly:1,b:'mf',lg:'venom'},
 greydwarf:{n:'Grauzwerg',c:'#4a5a42',skin:'#7a8a6a',eye:'#9fffa0',r:10,spd:115,hp:.8,dmg:.9,xp:1,lv:[4,12],shape:'hum',wpn:'none',scale:.78,moss:1,ai:'ranged',shot:{c:'#8a8070',spd:280,cd:2.6,kind:'rock'},b:'mfp',lg:'brute'},
 zombie:{n:'Zombie',c:'#4a5a3a',skin:'#7a9a6a',r:11,spd:62,hp:1.3,dmg:1.05,xp:1.1,lv:[1,40],shape:'hum',wpn:'none',zombie:1,sk:['grab'],night:1,b:'',lg:'undead'},
 bat:{n:'Fledermaus',c:'#3a2a3a',r:8,spd:175,hp:.4,dmg:.6,xp:.8,lv:[1,40],shape:'bat',fly:1,wind:.25,night:1,b:'',lg:'beast'},
 vampire:{n:'Vampir',c:'#2a0a1a',skin:'#e0d8e0',hood:'#6a0a1a',r:11,spd:130,hp:1.3,dmg:1.25,xp:1.8,lv:[10,40],shape:'hum',wpn:'dagger',vamp:1,eye:'#ff2a2a',sk:['blink','pull'],night:1,b:'',lg:'spirit'},
 werewolf:{n:'Werwolf',c:'#4a3a2e',r:15,spd:160,hp:1.9,dmg:1.5,xp:2.2,lv:[5,40],shape:'werewolf',sk:['leap','howl'],wind:.4,night:1,b:'',lg:'beast'},
 wraith:{n:'Schattengeist',c:'#2a2a3e',r:12,spd:130,hp:1,dmg:1.25,xp:1.5,lv:[16,25],shape:'ghost',dark:1,sk:['blink','pull'],b:'d',lg:'spirit'},
 pilzling:{n:'Pilzling',c:'#b0402a',r:11,spd:80,hp:1,dmg:1,xp:1.2,lv:[15,23],shape:'mushroom',ai:'ranged',shot:{c:'#d8c0ff',spd:200,cd:2.8,kind:'orb',slow:1},b:'d',lg:'slime'},
 treant:{n:'Baumhirte',c:'#5a4428',r:18,spd:62,hp:2.6,dmg:1.6,xp:2.2,lv:[18,26],shape:'treant',wind:.8,sk:['pull','regen'],b:'d',lg:'brute'},
 scorpion:{n:'Riesenskorpion',c:'#a0702a',r:15,spd:125,hp:1.3,dmg:1.35,xp:1.6,lv:[15,24],shape:'scorpion',poison:1,sk:['leap'],b:'e',lg:'venom'},
 mummy:{n:'Mumie',c:'#c8b890',skin:'#a89870',r:12,spd:72,hp:1.6,dmg:1.3,xp:1.6,lv:[16,24],shape:'hum',wpn:'none',mummy:1,sk:['grab'],eye:'#3aff6a',b:'e',lg:'undead'},
 jackal:{n:'Schakal',c:'#b8904a',r:11,spd:155,hp:.8,dmg:1,xp:1.1,lv:[15,22],shape:'wolf',scale:.85,pack:3,sk:['leap'],b:'e',lg:'beast'},
 harpy:{n:'Harpyie',c:'#8a6a9a',skin:'#d8b0a0',r:13,spd:150,hp:1.1,dmg:1.25,xp:1.6,lv:[18,26],shape:'bird',harpy:1,ai:'ranged',shot:{c:'#c8a0ff',spd:300,cd:2.2,kind:'orb'},fly:1,b:'p',lg:'hunter'},
 thornvine:{n:'Dornenranke',c:'#3a6a2a',r:13,spd:0,hp:1.1,dmg:.8,xp:1.1,lv:[3,24],shape:'vine',sk:['root'],ai:'ranged',shot:{c:'#5a8a3a',spd:260,cd:2.6,kind:'thorn',mul:.7},b:'mfsd',lg:'slime'},
 trapper:{n:'Kobold-Fallensteller',c:'#6a5a2a',skin:'#a88a5a',hood:'#3a4a1a',r:9,spd:125,hp:.6,dmg:.7,xp:1,lv:[3,9],shape:'hum',wpn:'dagger',scale:.72,sk:['net'],b:'m',lg:'goblin'},
 icewitch:{n:'Eishexe',c:'#5a7aa0',skin:'#d8e8f0',hat:'#2a3a5a',r:11,spd:90,hp:.9,dmg:1.1,xp:1.5,lv:[13,22],shape:'hum',wpn:'staff',ai:'ranged',sk:['aura','root'],shot:{c:'#9be7ff',spd:240,cd:2.4,kind:'orb',chill:1},b:'ip',lg:'frost'},
 reaper:{n:'Sensenmann',c:'#141418',skin:'#e8e4d8',hood:'#0a0a0e',r:12,spd:135,hp:1.4,dmg:1.45,xp:2.2,lv:[8,40],shape:'hum',wpn:'scythe',skel:1,robe:1,eye:'#7affff',wind:.55,sk:['blink'],night:1,b:'',lg:'reaper'},
 banshee:{n:'Banshee',c:'#a0b0d8',r:11,spd:125,hp:.9,dmg:1.1,xp:1.6,lv:[6,40],shape:'ghost',sk:['scream','blink'],night:1,b:'',lg:'spirit'},
 shadowhound:{n:'Schattenhund',c:'#1a1a24',r:12,spd:170,hp:.8,dmg:1,xp:1.2,lv:[4,40],shape:'wolf',pack:3,eye:'#b04aff',sk:['leap'],night:1,b:'',lg:'beast'},
 necro:{n:'Nekromant',c:'#2a1a3a',skin:'#c8c0b0',hood:'#1a0a2a',r:11,spd:95,hp:1,dmg:1.15,xp:2,lv:[9,40],shape:'hum',wpn:'staff',ai:'ranged',shot:{c:'#b04aff',spd:250,cd:2.6,kind:'orb'},sk:['raise','blink'],night:1,b:'',lg:'spirit'},
 wisp:{n:'Irrlicht',c:'#a0ffe0',r:8,spd:150,hp:.5,dmg:.8,xp:1,lv:[2,40],shape:'ghost',wisp:1,ai:'ranged',shot:{c:'#a0ffe0',spd:280,cd:2,kind:'orb',slow:1},sk:['blink'],night:1,b:'',lg:'spirit'},
 phoenix:{n:'Phönix',c:'#ff9a2a',r:15,spd:120,hp:1.4,dmg:1.6,xp:2.3,lv:[27,30],shape:'bird',fire:1,ai:'ranged',shot:{c:'#ffb030',spd:320,cd:1.8,kind:'orb',burn:1},b:'a',lg:'mythic'},
};
const LG={reaper:['scythe'],bone:['bow','longbow','bow','sword','ritter','amulet'],hunter:['bow','longbow','waldlaeufer','waldlaeufer','dagger'],beast:['waldlaeufer','waldlaeufer','dagger','spear','amulet','ring'],slime:['ring','amulet','heiler','magier','dagger','tome_frost'],outlaw:['crossbow','flail','dagger','waldlaeufer','waldlaeufer','ring','crossbow'],goblin:['dagger','spear','tome_fire','magier','waldlaeufer','ring'],venom:['dagger','heiler','waldlaeufer','amulet','tome_storm'],undead:['sword','axe','greatsword','halberd','ritter','ritter','waechter'],spirit:['tome_frost','tome_light','tome_storm','heiler','magier','amulet','ring'],brute:['axe','mace','warhammer','halberd','waechter','waechter','ritter','amulet'],frost:['tome_frost','ring','amulet','magier','heiler','spear'],fire:['tome_fire','tome_storm','magier','heiler','amulet','ring'],knight:['sword','greatsword','halberd','mace','ritter','ritter','waechter'],mythic:['longbow','spear','tome_light','heiler','waldlaeufer','amulet','ring']};
const BOSSES={
 fenris:{n:'Rudelführer Fenris',base:'wolf',c:'#5d6b7a',r:24,lv:[5,10],b:'m',abil:['leap','slam','summon','combo'],loot:[{k:'dagger',name:"Fenris' Fangzahn",f:'crit'},{set:'waldlaeufer',s:'chest',name:'Wolfspelzmantel',f:'spd'},{t:'amulet',name:'Heulender Anhänger',f:'spd'}]},
 keiler:{n:'Eisenkeiler Borst',base:'boar',c:'#3a2a1a',r:26,lv:[3,8],b:'m',abil:['leap','slam','sweep','summon'],loot:[{k:'spear',name:'Keilerjäger-Speer',f:'melee'},{set:'waechter',s:'chest',name:'Borstenpanzer',f:'hp'},{t:'ring',name:'Hauerring',f:'crit'}]},
 slimeking:{n:'Schleimkönig Glibbo',base:'slime',c:'#22b573',r:30,lv:[6,10],b:'f',abil:['slam','summon'],loot:[{set:'heiler',s:'helm',name:'Glibbo-Krone',k:'crown',f:'regen'},{t:'ring',name:'Glibberring',f:'regen'},{k:'mace',name:'Klebrige Keule'}]},
 varg:{n:'Banditenhauptmann Varg',base:'bandit',c:'#4a1a1a',r:20,lv:[6,12],b:'f',abil:['slam','volley'],minion:'archer',loot:[{k:'longbow',name:'Vargs Jagdbogen',f:'ranged'},{set:'waldlaeufer',s:'boots',name:'Räuberstiefel',f:'spd'},{t:'ring',name:'Diebesring',f:'luck'}]},
 grukk:{n:'Goblinhäuptling Grukk',base:'goblin',c:'#7a3a1a',r:22,lv:[8,12],b:'f',fixed:1,abil:['slam','summon','slam'],loot:[{k:'axe',name:'Grukks Hackbeil',f:'melee',ufx:{stun:.12},d:'12 % Betäubung'},{k:'dagger',name:'Grukks Zahnstocher',f:'melee',ufx:{poison:1,crit:5},d:'vergiftet, +5 % Krit'},{set:'waldlaeufer',s:'helm',name:'Häuptlingskrone',k:'crown',f:'luck'},{t:'ring',name:'Grukks Glücksring',f:'luck'}]},
 ursus:{n:'Ursus der Alte',base:'bear',c:'#4a2a14',r:30,lv:[10,15],b:'f',abil:['combo','leap','sweep','summon'],minion:'wolf',loot:[{k:'halberd',name:'Bärentöter',f:'melee'},{set:'waechter',s:'chest',name:'Bärenfellpanzer',f:'hp'},{t:'amulet',name:'Bärenkralle',f:'melee'}]},
 arachna:{n:'Spinnenkönigin Arachna',base:'spider',c:'#3a1a3a',r:28,lv:[10,15],b:'fs',poison:1,abil:['volley','slam','summon'],loot:[{k:'dagger',name:'Giftzahn',f:'crit'},{set:'heiler',s:'chest',name:'Seidenpanzer',f:'regen'},{t:'amulet',name:'Spinnenauge',f:'luck'}]},
 bonelord:{n:'Knochenfürst Morvax',base:'skeleton',c:'#5a4a6a',r:22,lv:[14,18],b:'s',fixed:1,abil:['volley','summon','slam'],minion:'skeleton',loot:[{k:'sword',name:'Grabesklinge',f:'melee',ufx:{ls:.07},d:'Lebensraub 7 %'},{k:'longbow',name:'Morvax’ Knochenbogen',f:'ranged',ufx:{pierce:1,crit:6},d:'durchschlagend, +6 % Krit'},{set:'ritter',s:'helm',name:'Knochenschädelhelm',f:'crit'},{k:'tome_frost',name:'Grimoire des Morvax',f:'spell'}]},
 basiliskq:{n:'Basiliskenkönigin',base:'basilisk',c:'#2a5a1a',r:28,lv:[14,18],b:'s',poison:1,abil:['volley','slam'],loot:[{k:'spear',name:'Versteinerter Speer',f:'crit'},{set:'heiler',s:'chest',name:'Schuppenrobe',f:'res'},{t:'ring',name:'Auge der Medusa',f:'spell'}]},
 brokk:{n:'Steintroll Brokk',base:'troll',c:'#4e5a5e',r:30,lv:[15,24],b:'wp',abil:['combo','leap','sweep','volley'],loot:[{k:'mace',name:'Trollfaust',f:'melee'},{set:'waechter',s:'legs',name:'Steinhaut-Beinschienen',f:'hp'},{set:'waechter',s:'boots',name:'Felsenstampfer',f:'hp'}]},
 asterion:{n:'Asterion, König des Labyrinths',base:'minotaur',c:'#3a1a0a',r:30,lv:[18,21],b:'w',abil:['combo','leap','sweep','slam'],loot:[{k:'axe',name:'Labrys',f:'melee'},{set:'ritter',s:'helm',name:'Stierhornhelm',f:'crit'},{t:'amulet',name:'Ariadnes Faden',f:'spd'}]},
 skoll:{n:'Sköll der Mondjäger',base:'icewolf',c:'#bcd0e0',r:26,lv:[13,20],b:'i',abil:['slam','summon','volley'],minion:'icewolf',loot:[{k:'bow',name:'Mondbogen',f:'ranged'},{set:'waldlaeufer',s:'helm',name:'Wolfskopfhaube',f:'crit'},{t:'ring',name:'Mondsteinring',f:'luck'}]},
 hrimthur:{n:'Hrimthur der Frostriese',base:'frostgiant',c:'#4a6a8a',r:34,lv:[18,22],b:'i',abil:['sweep','combo','volley','leap'],loot:[{k:'mace',name:'Gletscherhammer',f:'melee'},{set:'waechter',s:'legs',name:'Frostriesen-Beinschienen',f:'hp'},{k:'tome_frost',name:'Buch des ewigen Winters',f:'spell'}]},
 darkknight:{n:'Der Schwarze Ritter',base:'knight',c:'#1a1a2a',r:22,lv:[24,30],b:'a',abil:['combo','leap','sweep','summon'],minion:'knight',loot:[{k:'sword',name:'Klinge der Finsternis',f:'crit'},{set:'ritter',s:'chest',name:'Schattenharnisch',f:'hp'},{set:'ritter',s:'boots',name:'Schattenschreiter',f:'spd'}]},
 cerberus:{n:'Zerberus, Wächter der Unterwelt',base:'wolf',c:'#2a1a1a',r:32,lv:[25,30],b:'a',heads:3,abil:['fire','volley','summon'],minion:'lavaslime',loot:[{k:'dagger',name:'Höllenfang',f:'crit'},{set:'ritter',s:'chest',name:'Harnisch des Hades',f:'melee'},{t:'amulet',name:'Kette der Unterwelt',f:'res'}]},
 eldtree:{n:'Herold Mortholz, der Uralte Baumhirte',base:'treant',c:'#3a2a14',r:34,lv:[18,26],b:'d',fixed:1,herald:1,abil:['sweep','combo','summon','leap'],minion:'pilzling',loot:[{k:'warhammer',name:'Weltenwurzel',f:'melee',ufx:{stun:.2,ls:.04},d:'20 % Betäubung, Lebensraub 4 %'},{k:'tome_light',name:'Rinde des Weltenbaums',f:'spell',ufx:{ls:.05},d:'Lebensraub 5 %'},{set:'heiler',s:'chest',name:'Borkenrobe',f:'regen'},{t:'amulet',name:'Herz des Waldes',f:'hp',ufx:{},d:'pulsiert wie ein Herzschlag'}]},
 schnitter:{n:'Herold Vael, der Schnitter',base:'reaper',c:'#0c0c10',r:22,lv:[16,24],b:'',fixed:1,herald:1,abil:['combo','leap','sweep','summon'],minion:'skeleton',loot:[{k:'scythe',name:'Sense der Ewigen Nacht',f:'melee',ufx:{ls:.12},d:'Lebensraub 12 %'},{set:'magier',s:'chest',name:'Robe des Schnitters',f:'spell'},{t:'ring',name:'Seelenring',f:'crit',ufx:{crit:8},d:'+8 % Krit'},{k:'longbow',name:'Bogen der Totenwache',f:'ranged',ufx:{pierce:1},d:'Pfeile durchschlagen'}]},
 sandking:{n:'Herold Khepri, der Sandkönig',fixed:1,herald:1,base:'mummy',c:'#d8b860',r:26,lv:[16,26],b:'',abil:['combo','summon','leap','volley'],minion:'mummy',loot:[{k:'halberd',name:'Szepter des Sandkönigs',f:'melee',ufx:{poison:1},d:'vergiftet Gegner'},{k:'crossbow',name:'Skarabäus-Armbrust',f:'ranged',ufx:{pierce:1,crit:6},d:'durchschlagend, +6 % Krit'},{set:'magier',s:'helm',name:'Krone der Dünen',k:'crown',f:'spell'},{t:'ring',name:'Skarabäusring',f:'luck'}]},
 vampirelord:{n:'Graf Morgrath',base:'vampire',c:'#3a0a1a',r:20,lv:[12,30],b:'',night:1,abil:['combo','leap','summon','volley'],minion:'bat',loot:[{k:'dagger',name:'Blutdolch',f:'crit'},{set:'magier',s:'chest',name:'Mantel der Nacht',f:'spell'},{t:'ring',name:'Blutmondring',f:'regen'}]},
 dragon:{n:'Drache Ignarok',base:'imp',c:'#b3261e',r:40,lv:[28,33],b:'a',fixed:1,abil:['fire','volley','slam','summon'],minion:'wyrmling',loot:[{k:'sword',name:'Drachenzahn-Klinge',f:'melee'},{set:'ritter',s:'chest',name:'Drachenschuppen-Harnisch',f:'hp'},{set:'waldlaeufer',s:'helm',name:'Drachenhorn-Helm',f:'crit'},{k:'longbow',name:'Ignaroks Schwinge',f:'ranged'},{k:'tome_fire',name:'Herz des Drachen',f:'spell'},{t:'amulet',name:'Drachenherz-Amulett',f:'regen'}]},
 mini:{n:'Champion',fixed:1,mini:1,b:'',lv:[1,40],abil:['slam'],loot:[]},
};
G.MT=MT;G.BOSSES=BOSSES;G.LG=LG;
function mkMonster(key,lvl,x,y){const t=MT[key],D=G.D();const hpS=1+Math.max(0,lvl-10)*.04,dmS=1+Math.max(0,lvl-15)*.02;
 const m={x,y,type:key,lvl,t,r:t.r,cr:Math.min(t.r,11),maxhp:Math.round((34+lvl*15)*hpS*t.hp*D.mhp),dmg:(5+lvl*2.8)*dmS*t.dmg*D.mdmg,spd:t.spd*rnd(.92,1.08),xp:Math.round((8+lvl*6)*t.xp),name:t.n,c:t.c,shape:t.shape,ai:t.ai||'melee',atkCd:.6,wd:{x:0,y:0,t:0},hitT:0,kx:0,ky:0,fx:1,fy:0,swing:0,anim:Math.random()*9,shotCd:rnd(.6,2),chCd:rnd(1,3),st:null,stT:0,strafe:Math.random()<.5?-1:1,scale:t.scale||1,home:{x,y},voiceT:0,passive:!!t.passive};m.hp=m.maxhp;
 if(t.lg==='beast'&&CORCH[key]!=null){const bi=biome(Math.floor(x/TILE),Math.floor(y/TILE));const ch=Math.min(.95,CORCH[key]+(bi==='ash'?.5:bi==='dark'||bi==='swamp'?.2:0)+(G.P&&G.P.main>=4?.15:0));if(Math.random()<ch){m.cor=1;m.passive=false;m.name=(key==='boar'?'Aschbefallenes ':key==='rabbit'?'Aschbefallener ':'Aschbefallener ')+t.n;m.maxhp=m.hp=Math.round(m.maxhp*1.15);m.dmg*=1.15;m.xp=Math.round(m.xp*1.25);m.spd*=1.08;}else if(key==='rabbit'||key==='fox'){m.passive=true;m.flee=1;}else if(key==='boar'){m.passive=true;m.terr=1;}}
 return m;}
// Aschenfluch: Chance, dass ein Tier von Ignaroks Asche befallen ist (rote Augen, Ascheglut, aggressiv)
const CORCH={rabbit:.3,fox:.45,boar:.4,deer:.2,bear:.7};
function mkBoss(key,lvl,x,y){const B=BOSSES[key];const m=mkMonster(B.base,lvl,x,y);const dr=key==='dragon';m.boss=key;m.B=B;m.name=B.n;m.c=B.c;m.r=B.r;m.cr=Math.min(14,B.r*.5);const roam=!B.fixed;m.maxhp=m.hp=Math.round(m.maxhp*(dr?24:roam?7:15));m.dmg*=dr?1.8:roam?1.25:1.6;m.armor=dr?.3:roam?.05:.2;m.xp=Math.round(m.xp*(dr?15:10));m.spd*=.85;m.home={x,y};m.abT=3;m.abI=0;m.ai='melee';m.passive=false;m.scale=B.r/MT[B.base].r*(MT[B.base].scale||1);m.heads=B.heads||0;if(dr)m.shape='dragon';return m;}
function mkMini(key,lvl,x,y){const t=MT[key];const m=mkMonster(key,lvl,x,y);m.boss='mini';m.B={n:t.n,mini:1,fixed:1,abil:t.ai==='ranged'?['volley','slam']:['slam','summon'],minion:key,lg:t.lg,poison:t.poison};m.name=`${t.n}-${pick(['Champion','Koloss','Anführer','Urahn'])}`;
 m.maxhp=m.hp=Math.round(m.maxhp*4.5);m.dmg*=1.15;m.armor=0;m.xp=Math.round(m.xp*5);m.scale=(t.scale||1)*1.7;m.r=Math.round(t.r*1.7);m.cr=Math.min(14,m.r*.5);m.abT=3;m.abI=0;m.passive=false;return m;}
G.mkMonster=mkMonster;G.mkBoss=mkBoss;G.mkMini=mkMini;
function pickType(tx,ty,lvl){const bl=BL[biome(tx,ty)],d=dV(tx,ty);let c=Object.keys(MT).filter(k=>{const t=MT[k];if(t.b.indexOf(bl)<0)return false;if(t.rare)return d>=t.minD&&Math.random()<t.rare;return lvl>=t.lv[0]-1&&lvl<=t.lv[1]+1;});
 if(!c.length)c=Object.keys(MT).filter(k=>MT[k].b.indexOf(bl)>=0&&!MT[k].rare);if(!c.length)return 'rat';
 const rare=c.find(k=>MT[k].rare);if(rare)return rare;return pick(c);}
// ===================== NPCs =====================
const LORE='Das Spiel spielt im Königreich Eldmar. In der Mitte liegt die Stadt Eichenhain mit der mächtigen Burg Eichenhain auf einem Hügel im Norden der Stadt. Vor drei Nächten griff der Feuerdrache Ignarok das Land an, brannte das Dorf Aschental nieder und entführte Prinzessin Elara, die Tochter von Fürst Aldric. Der Spieler ist ein gefallener Ritter der Silberwacht, der am Aschenpass gegen Ignarok starb. Die Walküren verwehrten ihm den Einzug nach Walhall, weil sein Werk unvollendet ist. Heilerin Mara fand ihn am Flussufer. Orte: Sonnenwiesen rund um Eichenhain (Tiere, Kobolde, Grauzwerge, Riesenwespen, am Rand selten Einhörner), Banditenlager im Osten der Wiesen, das zerstörte Dorf Aschental im Nordosten der Wiesen, der Finsterwald im Osten mit dem Dorf Waldheim (Försterin Liv), dem Goblinlager und der Spinnenhöhle, das Nebelmoor im Westen mit dem Pfahldorf Moorbruck (Vogt Aldwin) und der Krypta des Knochenfürsten Morvax, die Frostlande im Nordwesten mit Frosthafen (Jarl Ragna), das Graukamm-Gebirge im Norden mit der Zwergenbinge, die Aschenberge im Nordosten mit dem Außenposten Glutwacht und der Drachenfestung auf dem Goldberg, im Süden die Steinöde mit einer tiefen Schlucht und der verlassenen Mine, im Südosten die Sengenden Dünen mit Sandfeste (Fürstin Samira) und dem Grab des Sandkönigs, im Südwesten der finstere Schattenwald mit der Ruine der Abtei und einer Hexenkate. Nachts erheben sich Zombies, Skelette, Fledermäuse und Vampire, bei Vollmond Werwölfe.';
const OX=VCX-96,OY=VCY-120;
const NPCS=[
 {id:'mara',name:'Heilerin Mara',short:'Mara',tx:113,ty:118,look:{body:'#5b8c5a',skin:'#f1c27d',hair:'#e8e8e8',dress:1},persona:'Ältere, weise Kräuterheilerin. Sie hat den Spieler bewusstlos am Flussufer gefunden und gesund gepflegt. Mütterlich, ruhig, ein wenig geheimnisvoll. Sie spürt, dass die Götter den Spieler zurückgeschickt haben. Sie braut aus Heilkraut Heiltränke.',greet:['Wie geht es deinen Wunden?','Die Kräuter blühen dieses Jahr spät …']},
 {id:'aldric',name:'Fürst Aldric',short:'Aldric',tx:95,ty:89,look:{body:'#6a1b2a',skin:'#e8b88a',hair:'#bdbdbd',crown:1,cape:'#8b0000'},persona:'Fürst von Eichenhain und Herr der Burg. Ernst und stolz, voller Sorge um seine entführte Tochter Elara. Spricht förmlich und gebieterisch, aber gerecht.',greet:['Sprich, Ritter.']},
 {id:'elara',name:'Prinzessin Elara',short:'Elara',abs:1,tx:LAIR.x,ty:LAIR.y+2,look:{body:'#6a4ab0',skin:'#f5d0b0',hair:'#e8c35a',dress:1,crown:1},persona:'Tochter von Fürst Aldric, vom Drachen entführt. Mutig, schlagfertig und alles andere als hilflos. Im Hort hat sie selbst nach einem Fluchtweg gesucht.',greet:['Da bist du ja, mein Retter!']},
 {id:'gunnar',name:'Drachenjäger Gunnar',short:'Gunnar',tx:82,ty:127,look:{body:'#7a2e2e',skin:'#d9a066',hair:'#c9a227',beard:'#c9a227',helm:'#8a8f96'},persona:'Rauer, vernarbter Drachenjäger aus dem Norden. Trinkt gern Met in der Taverne. Er hat seinen Bruder an Ignarok verloren und will Rache. Wortkarg, mit trockenem Humor. Er glaubt an Walhall.',greet:['Hmpf.','Noch ein Met, und ich erzähl dir von Drachen.']},
 {id:'hilda',name:'Schmiedin Hilda',short:'Hilda',tx:108,ty:114,look:{body:'#5a4636',skin:'#e8b88a',hair:'#d35400'},persona:'Kräftige Schmiedin, direkt und laut, stolz auf ihr Handwerk. Sie hasst Wölfe, weil sie ihre Schafe reißen. Sie kennt sich mit Waffen aus: Speere stechen weit, Armbrüste durchschlagen, Langbögen treffen von weit weg.',greet:['Die Esse ist heiß!','Gute Klingen brauchen Geduld.']},
 {id:'bernd',name:'Bäcker Bernd',short:'Bernd',tx:87,ty:113,look:{body:'#e8e0cc',skin:'#f1c27d',hat:'#ffffff'},persona:'Gemütlicher, rundlicher Bäcker, redselig, lacht gern und macht schlechte Brotwitze. Er weiß, dass Saat nur nahe am Wasser gedeiht.',greet:['Frisches Brot – na ja, bald wieder!']},
 {id:'otto',name:'Wache Otto',short:'Otto',tx:108,ty:127,look:{body:'#4a5a7a',skin:'#f1c27d',helm:'#9aa0a6'},persona:'Pflichtbewusster, etwas ängstlicher Wachsoldat. Er hasst Goblins und erzählt gern, wie er beinahe einen gefangen hätte.',greet:['Alles ruhig. Glaube ich.']},
 {id:'greta',name:'Händlerin Greta',short:'Greta',tx:89,ty:132,shop:1,look:{body:'#b06a2a',skin:'#e8b88a',hair:'#5a2a1a',dress:1},persona:'Reisende Händlerin, geschäftstüchtig, feilscht gern und kennt Gerüchte aus fernen Ländern. Sie verkauft Heiltränke, Brot, Karotten und Saat und kauft Beute an.',greet:['Tränke, Brot, Saatgut! Und ich kaufe deine Beute!']},
 {id:'konrad',name:'Burgwache Konrad',short:'Konrad',tx:100,ty:106,look:{body:'#3a4a6a',skin:'#f1c27d',helm:'#9aa0a6'},persona:'Junger Wachsoldat am Burgtor. Gelangweilt, neugierig, liebt Gerüchte und Klatsch über den Hof.',greet:['Halt! Ach, du bist es.','Langweiliger Dienst heute.']},
 {id:'lukas',name:'Barde Lukas',short:'Lukas',tx:86,ty:124,wander:1.5,look:{body:'#2a7a6a',skin:'#f1c27d',hair:'#3a2a1a',hat:'#7a1a4a'},persona:'Eitler, fröhlicher Barde. Er reimt gern, übertreibt maßlos und will die Heldentaten des Spielers besingen.',greet:['♪ Oh tapfrer Recke, hör mein Lied … ♪']},
 {id:'anselm',name:'Bruder Anselm',short:'Anselm',tx:102,ty:135,wander:1,look:{body:'#6b4a2a',skin:'#e8c8a0',hair:'#9a9a9a',dress:1},persona:'Sanftmütiger Mönch der Kapelle. Er hütet alte Schriften über Drachen, Walküren, Walhall und Fabelwesen wie Einhörner, Greife und Zentauren.',greet:['Friede sei mit dir.']},
 {id:'mia',name:'Mia',short:'Mia',tx:93,ty:124,wander:4,child:1,look:{body:'#d84a6a',skin:'#f5d0b0',hair:'#8a4a1a',dress:1},persona:'Neugieriges achtjähriges Mädchen. Sie will unbedingt Ritterin werden, stellt viele Fragen und plappert drauflos. Sie träumt davon, einmal ein Einhorn zu sehen.',greet:['Bist du ein echter Ritter?!']},
 {id:'jorg',name:'Bauer Jorg',short:'Jorg',tx:85,ty:131,wander:2,look:{body:'#7a6a3a',skin:'#d9a066',hat:'#c9a86a'},persona:'Grummeliger Bauer. Er schimpft über Wölfe, Wetter und Steuern, hat aber ein gutes Herz. Er weiß: Felder brauchen Wasser in der Nähe, sonst wächst nichts.',greet:['Diese verflixten Wölfe …']},
 {id:'hedwig',name:'Oma Hedwig',short:'Hedwig',tx:78,ty:118,wander:1,look:{body:'#5a4a6a',skin:'#e8c8a0',hair:'#ffffff',dress:1},persona:'Uralte Dorfälteste. Sie erzählt Geschichten vom letzten Drachenangriff vor 60 Jahren, ist etwas schwerhörig und sehr liebevoll.',greet:['Komm näher, Kind, ich hör so schlecht.']},
 {id:'ragna',name:'Jarl Ragna',short:'Ragna',abs:1,tx:TP('frost',0,-5).x,ty:TP('frost',0,-5).y,look:{body:'#3a4a6a',skin:'#f0d0b0',hair:'#e8c35a',helm:'#9aa0a6',cape:'#2a3a5a'},persona:'Stolze Kriegerin und Herrin von Frosthafen im hohen Norden. Hart, ehrlich, spricht wie eine Wikingerin. Die Draugr, untote Krieger, plagen ihre Stadt.',greet:['Skål, Fremder.']},
 {id:'sven',name:'Händler Sven',short:'Sven',abs:1,tx:TP('frost',7,7).x,ty:TP('frost',7,7).y,shop:2,look:{body:'#6a3a2a',skin:'#f0d0b0',hair:'#b05a1a',beard:'#b05a1a'},persona:'Dicker, fröhlicher Händler aus Frosthafen. Verkauft Große Heiltränke und Pelze, erzählt von Pinguinen und Frostriesen.',greet:['Kalt, was? Kauf was Warmes!']},
 {id:'ylva',name:'Skaldin Ylva',short:'Ylva',abs:1,tx:TP('frost',-4,1).x,ty:TP('frost',-4,1).y,wander:2,look:{body:'#4a6a8a',skin:'#f0d0b0',hair:'#ffffff',dress:1},persona:'Junge Skaldin, singt von Göttern, Walküren, Fenrir und Ragnarök. Poetisch und geheimnisvoll.',greet:['Die Nornen weben dein Schicksal, Fremder.']},
 {id:'brann',name:'Feldscher Brann',short:'Brann',abs:1,tx:TP('glut',-2,3).x,ty:TP('glut',-2,3).y,look:{body:'#5a2a1a',skin:'#d9a066',hair:'#3a2a1a',beard:'#3a2a1a',helm:'#5a5a5a'},persona:'Narbiger Feldscher und Anführer des Außenpostens Glutwacht am Rand der Aschenberge. Er heilt Verwundete und warnt vor Drachenwelpen, Lavaschleimen und dem Phönix.',greet:['Willkommen an der Glutwacht. Bleib nicht zu lange.']},
 {id:'aldwin',name:'Vogt Aldwin',short:'Aldwin',lord:1,abs:1,tx:TP('moor',0,-3).x,ty:TP('moor',0,-3).y,look:{body:'#3a4a2a',skin:'#e0b890',hair:'#5a4a3a',beard:'#5a4a3a',cape:'#2a3a1a'},persona:'Hagerer, misstrauischer Vogt von Moorbruck, einem Pfahldorf im Nebelmoor. Die Moorleichen und Irrlichter rauben ihm den Schlaf. Spricht leise und düster.',greet:['Leise … das Moor hört mit.']},
 {id:'wendla',name:'Kräuterweib Wendla',short:'Wendla',abs:1,tx:TP('moor',5,4).x,ty:TP('moor',5,4).y,wander:2,look:{body:'#4a5a3a',skin:'#d9b890',hair:'#9a9a8a',dress:1},persona:'Kauzige alte Kräuterfrau aus Moorbruck. Verkauft Tränke und murmelt Moorsprüche.',greet:['Kröte, Kraut und Krähenbein …']},
 {id:'liv',name:'Försterin Liv',short:'Liv',lord:1,abs:1,tx:TP('wald',0,-3).x,ty:TP('wald',0,-3).y,look:{body:'#3a5a2a',skin:'#f0d0b0',hair:'#c9a227',cape:'#2a4a1a'},persona:'Herrin von Waldheim, kühne Jägerin und Hüterin des Finsterwalds. Klar, schnell, spöttisch. Die Spinnen breiten sich gefährlich aus.',greet:['Leise Schritte, Fremder. Der Wald zählt sie.']},
 {id:'finn',name:'Bogenmacher Finn',short:'Finn',abs:1,tx:TP('wald',6,5).x,ty:TP('wald',6,5).y,look:{body:'#5a4a2a',skin:'#e0b890',hair:'#7a4a1a',hat:'#3a5a2a'},persona:'Bogenmacher in Waldheim. Prahlt mit seinen Langbögen und verkauft Pfeile und Bolzen.',greet:['Eibe, Sehne, Federn – mehr braucht es nicht.']},
 {id:'samira',name:'Fürstin Samira',short:'Samira',lord:1,abs:1,tx:TP('sand',0,-3).x,ty:TP('sand',0,-3).y,look:{body:'#c08a2a',skin:'#c68642',hair:'#1a1a1a',crown:1,cape:'#8a2a5a',dress:1},persona:'Stolze, kluge Fürstin der Wüstenstadt Sandfeste. Spricht blumig und bildreich. Aus dem Grab des Sandkönigs steigen Mumien, und das Skarabäus-Siegel ihrer Ahnen wurde dort begraben.',greet:['Der Wüstenwind hat dich hergetragen.']},
 {id:'hakim',name:'Händler Hakim',short:'Hakim',abs:1,tx:TP('sand',7,4).x,ty:TP('sand',7,4).y,look:{body:'#6a2a5a',skin:'#c68642',hair:'#1a1a1a',beard:'#1a1a1a',hat:'#e8e0cc'},persona:'Geschwätziger Basarhändler mit dem besten Wasser der Wüste.',greet:['Wasser, Tränke, Datteln! Beste Preise!']},
 {id:'durin',name:'Zwerg Durin',short:'Durin',abs:1,tx:TP('frost',-7,7).x,ty:TP('frost',-7,7).y,look:{body:'#5a3a2a',skin:'#e0a880',hair:'#a05a2a',beard:'#a05a2a',helm:'#8a8f96'},persona:'Grimmiger Zwergenschmied, letzter seines Clans. Die Zwergenbinge im Graukamm-Gebirge wurde von Grauzwergen und Golems überrannt; dort liegt der Ahnenhammer seines Vaters.',greet:['Bei meinem Bart …']},
 {id:'berta',name:'Witwe Berta',short:'Berta',tx:79,ty:139,wander:2,look:{body:'#4a3a4a',skin:'#e8c8a0',hair:'#9a8a7a',dress:1},persona:'Witwe aus Eichenhain. Banditen haben ihr den Ehering ihres verstorbenen Mannes gestohlen, als sie über die Felder ging. Traurig, aber zäh.',greet:['Ach … guten Tag.']}
];
// Update 13: neue Stadtbewohner (Bauer, Markthändler, Dorfleute) mit eigenem Zuhause & Tagesablauf
const TPPL={
 frost:[['eirik','Bauer Eirik','Eirik','m','#5a4a3a','#e8d8b0','Wortkarger Bauer aus Frosthafen. Baut Gerste und Rüben im kurzen Nordsommer an, schwört auf Schafsmist und hasst Frostriesen.',['Die Gerste mag keine Kälte. Ich auch nicht.','Wenn du Rüben willst – Sigrun am Markt hat welche.','Mein Schaf heißt Odin. Frag nicht.']],
  ['sigrun','Händlerin Sigrun','Sigrun','f','#6a2a2a','#d8a040','Resolute Markthändlerin aus Frosthafen. Kauft alles, was man tragen kann, und feilscht hart, aber fair.',['Kaufen, verkaufen – Hauptsache, die Münzen klingen!','Pelze, Fisch, Tränke … was brauchst du?','Ich nehme auch deinen Plunder. Zum fairen Preis!']],
  ['olaf','Fischer Olaf','Olaf','m','#3a4a5a','#c8c0b0','Alter Eisfischer. Erzählt von Seeschlangen unter dem Eis, die er natürlich alle selbst gesehen hat.',['Unter dem Eis lebt etwas Großes. Ich schwör’s.','Der Fang war mager. Die Asche verdirbt sogar das Wasser.','Setz dich, Fremder. Erzähl mir vom Süden.']],
  ['freya','Weberin Freya','Freya','f','#4a6a8a','#e8c35a','Junge Weberin, träumt davon, eines Tages mit einem Langschiff in den Süden zu segeln.',['Siehst du das Muster? Es zeigt Yggdrasil.','Eines Tages segle ich weit weg von hier.','Die Wolle von Eiriks Schafen ist die beste.']],
  ['knut','Holzhauer Knut','Knut','m','#5a3a2a','#a05a2a','Bärenstarker Holzhauer mit Rauschebart. Trinkt viel Met, lacht laut.',['Holz hacken wärmt zweimal!','Gestern sah ich einen Bären mit roten Augen. Asche im Fell, sag ich dir.','Skål, Freund!']]],
 glut:[['rurik','Feldkoch Rurik','Rurik','m','#5a3a2a','#3a2a1a','Feldkoch der Glutwacht. Baut zähen Aschenroggen an, weil sonst nichts in dieser verbrannten Erde wächst.',['Aschenroggen schmeckt bitter. Aber er macht satt.','Hunger ist der schlimmste Feind einer Wache.','Iss was, du siehst blass aus.']],
  ['hanne','Marketenderin Hanne','Hanne','f','#6a4a2a','#8a3a1a','Marketenderin, die die Soldaten versorgt. Geschäftstüchtig und schlagfertig.',['Tränke, Pfeile, Proviant – alles, was ein Soldat braucht.','Ich kaufe Beute an. Nichts Verfluchtes, bitte.','Die Drachenwelpen sind schlecht fürs Geschäft.']],
  ['dieter','Soldat Dieter','Dieter','m','#4a3a3a','#3a2a1a','Erschöpfter Soldat der Glutwacht, zählt die Tage bis zu seiner Ablösung.',['Noch 112 Tage Dienst. Dann geh ich heim.','Hörst du das Grollen? Die Berge atmen.','Halt die Augen offen hier draußen.']],
  ['ilse','Rekrutin Ilse','Ilse','f','#5a4a3a','#c9a227','Junge, übermotivierte Rekrutin, will unbedingt einen Drachenwelpen erlegen.',['Ich trainiere jeden Tag! Bald bin ich so stark wie du!','Hast du schon mal einen Drachen gesehen? Wie war’s?','Brann sagt, ich soll Geduld haben. Pah!']],
  ['gerd','Quartiermeister Gerd','Gerd','m','#3a3a3a','#7a7a7a','Pedantischer Quartiermeister, der jede Schraube zählt.',['Drei Schwerter fehlen im Bestand. DREI!','Wer hat meine Liste verlegt?','Ordnung ist das halbe Überleben.']]],
 moor:[['hinnerk','Torfbauer Hinnerk','Hinnerk','m','#4a4a2a','#6a5a3a','Torfbauer und Gemüsegärtner auf Pfählen. Kennt jedes Moorloch.',['Im Moor wächst mehr, als man denkt. Man muss nur wissen, wo.','Tritt nie auf das helle Moos. Nie.','Die Moorleichen stehlen mir die Rüben. Jede Nacht!']],
  ['gesa','Fischhändlerin Gesa','Gesa','f','#3a5a4a','#a05a2a','Laute Fischhändlerin vom Moorbrucker Markt. Hat für jeden einen Spruch.',['Frischer Aal! Fast noch lebendig!','Ich kauf dir alles ab, was nicht stinkt. Und manches, was stinkt.','Na, Held? Was darf’s sein?']],
  ['jan','Flößer Jan','Jan','m','#4a3a2a','#3a2a1a','Flößer, der Baumstämme durch die Kanäle bringt. Ruhig und abergläubisch.',['Wirf nie Brot ins Wasser. Die Toten werden hungrig.','Das Moor flüstert nachts.','Mein Floß ist mein Zuhause.']],
  ['lotte','Lotte','Lotte','f','#7a4a5a','#d08a3a','Neugieriges Moorkind, das Frösche sammelt.',['Willst du meinen Frosch sehen? Er heißt Herr Quak!','Mama sagt, ich darf nicht ins Moor. Aber die Frösche sind da!','Bist du ein echter Held?'],1],
  ['wiebke','Torfstecherin Wiebke','Wiebke','f','#5a4a3a','#9a9a8a','Ruppige Torfstecherin mit Herz aus Gold.',['Torf brennt langsam, aber lange. Wie ich.','Pass auf deine Stiefel auf, hier versinkt alles.','Schon wieder Nebel. Wie immer.']]],
 wald:[['marlene','Imkerin Marlene','Marlene','f','#6a5a2a','#c9a227','Imkerin und Bäuerin von Waldheim. Spricht mit ihren Bienen und baut Kürbisse an.',['Die Bienen sind unruhig. Die Asche verwirrt sie.','Honig heilt fast alles. Fast.','Willst du mithelfen? Nein? Schade.']],
  ['ansgar','Pelzhändler Ansgar','Ansgar','m','#5a3a1a','#5a3a1a','Pelzhändler und Markthändler in Waldheim. Kauft Felle, Fänge und Beute.',['Gute Felle, gute Preise.','Fuchspelz ist gefragt. Aber nur von gesunden Füchsen!','Was hast du mir mitgebracht?']],
  ['bodo','Holzfäller Bodo','Bodo','m','#6a3a2a','#3a2a1a','Holzfäller, riesig und sanft. Fällt nur kranke Bäume.',['Ich fälle nur, was krank ist. Der Wald dankt es mir.','Hörst du die Spechte? Gutes Zeichen.','Mein Rücken … ach.']],
  ['rika','Jägerin Rika','Rika','f','#3a5a2a','#7a4a1a','Junge Jägerin, Schülerin von Liv. Erklärt gern, warum manche Tiere rote Augen haben.',['Gesunde Füchse fliehen vor dir. Die mit roten Augen nicht – die hat Ignaroks Asche vergiftet.','Wildschweine greifen nur an, wenn du ihrem Revier zu nahe kommst.','Ein guter Jäger tötet nur, was er muss.']],
  ['kraut','Kräutermann Ole','Ole','m','#4a5a3a','#9a9a8a','Zerstreuter Kräutersammler.',['Hast du Pilzlinge gesehen? Nicht essen!','Die Schafgarbe blüht. Wunderbar.','Wo war ich? Ach ja. Kräuter.']]],
 sand:[['karim','Dattelbauer Karim','Karim','m','#8a6a3a','#1a1a1a','Dattelbauer am Rand der Oase. Bewässert sein Feld mit Kanälen, die sein Großvater grub.',['Ohne Wasser kein Leben. So einfach ist das.','Die Datteln sind dieses Jahr süß.','Der Sand frisst alles, was man nicht pflegt.']],
  ['leyla','Gewürzhändlerin Leyla','Leyla','f','#8a2a5a','#1a1a1a','Gewürzhändlerin auf dem Markt von Sandfeste. Kauft und verkauft alles, riecht nach Zimt.',['Safran, Zimt, Heiltränke – und ich kaufe deine Beute!','Hakim? Pah, meine Preise sind besser.','Komm näher, riech mal!']],
  ['amir','Wasserträger Amir','Amir','m','#e8e0cc','#1a1a1a','Fleißiger Wasserträger, kennt alle Gerüchte der Stadt.',['Wasser! Kühles Wasser!','Die Fürstin hat schlecht geschlafen, sagt man.','Hast du die Skorpione gesehen? Riesig!']],
  ['nadia','Weberin Nadia','Nadia','f','#c08a2a','#1a1a1a','Teppichweberin, deren Muster Geschichten erzählen.',['Dieser Teppich erzählt vom Sandkönig.','Jeder Faden ist eine Erinnerung.','Möchtest du einen Teppich? Er fliegt nicht. Leider.']],
  ['tarik','Töpfer Tarik','Tarik','m','#9a6a4a','#3a2a1a','Töpfer, der Krüge aus rotem Lehm brennt.',['Ein guter Krug hält das Wasser kühl.','Vorsicht, frisch gebrannt!','Die Mumien … sie stehlen meine Krüge. Warum?!']]]};
const TSHOP={sigrun:['potion','potion2','bread','carrot','arrow'],hanne:['potion','potion2','mpotion','arrow','bolt','bread'],gesa:['bread','carrot','potion','mpotion','arrow'],ansgar:['arrow','bolt','bread','potion','carrot'],leyla:['potion','potion2','mpotion','bread','arrow','bolt']};
for(const tid in TPPL){const a=TADD[tid];const homes=[[tid+'_farm',a.farm[0],a.farm[1],4,3],[tid+'_h3',...a.houses[3]],[tid+'_h0',...a.houses[0]],[tid+'_h1',...a.houses[1]],[tid+'_h2',...a.houses[2]]];
 TPPL[tid].forEach((d,i)=>{const h=homes[i];const p=TP(tid,h[1]+Math.floor(h[3]/2),h[2]+h[4]);const fem=d[3]==='f';
  NPCS.push({id:d[0],name:d[1],short:d[2],abs:1,tx:p.x,ty:p.y,child:d[8]?1:0,wander:i>=2?2:0,town:tid,look:{body:d[4],skin:tid==='sand'?'#c68642':tid==='glut'?'#d9a066':'#f0d0b0',hair:d[5],dress:fem?1:0,hat:i===0?'#c9a86a':null,beard:!fem&&i%2===0&&!d[8]?d[5]:null},persona:d[6]+' Lebt in '+TOWNS.find(t=>t.id===tid).name+'.',greet:d[7]});
  if(i===0)JOBS_ADD[d[0]]=[['field','hoe',[8,12]],['door:'+tid+'_farm','idle',[3,5]],['field','hoe',[6,10]],['home','idle',[2,4]]];
  else if(i===1){JOBS_ADD[d[0]]=[['door:'+tid+'_mkt','idle',[7,10]],['home','idle',[2,4]]];SHOP_ADD[d[0]]={n:d[1].split(' ')[1]+'s Marktstand',items:TSHOP[d[0]]};}
  else JOBS_ADD[d[0]]=[['patrol','idle',[3,5]],['door:'+tid+'_mkt','idle',[3,5]],['home','idle',[3,6]],['patrol','idle',[2,4]]];});}
// Update 16: Stadtwachen
for(const [tid,nm,sh] of [['frost','Wache Torvald','Torvald'],['moor','Wache Hennes','Hennes'],['wald','Wache Kuno','Kuno'],['sand','Wache Rashid','Rashid']]){const tw=TOWNS.find(t=>t.id===tid);const p=TP(tid,1,tw.r-4);NPCS.push({id:'wache_'+tid,name:nm,short:sh,abs:1,tx:p.x,ty:p.y,town:tid,guard:1,look:{body:'#4a5a7a',skin:tid==='sand'?'#c68642':'#f0d0b0',helm:'#9aa0a6'},persona:'Stadtwache von '+tw.name+'. Streng, aber fair. Achtet auf Diebe und Unruhestifter.',greet:['Halte dich an die Gesetze, Fremder.','Alles ruhig in '+tw.name+'.','Diebe landen bei mir im Kerker.']});JOBS_ADD['wache_'+tid]=[['patrol','idle',[3,5]]];}
NPCS.forEach(n=>{if(!n.abs){n.tx+=OX;n.ty+=OY;}n.x=n.hx=(n.tx+.5)*TILE;n.y=n.hy=(n.ty+.5)*TILE;n.fx=0;n.fy=1;n.wt=0;n.vx=0;n.vy=0;n.anim=0;});
G.NPCS=NPCS;G.LORE=LORE;
const JOBS={hilda:[['anvil','hammer',[7,12]],['home','idle',[3,6]],['anvil','hammer',[6,9]],['door:smith','idle',[2,4]]],
 jorg:[['field','hoe',[8,12]],['door:farm','idle',[3,5]],['field','hoe',[6,10]],['door:barn','idle',[2,4]]],
 mara:[['garden','hoe',[5,8]],['npc','heal',[3,4]],['home','idle',[3,6]],['npc','heal',[3,4]]],
 bernd:[['door:bakery','knead',[5,8]],['door:market','idle',[3,5]],['home','idle',[4,6]]],
 otto:[['patrol','idle',[2,4]],['patrol','idle',[2,4]],['home','idle',[3,5]]],konrad:[['patrol','idle',[2,3]],['home','idle',[4,6]]],
 greta:[['door:market','idle',[5,8]],['home','idle',[3,6]]],lukas:[['plaza','play',[5,8]],['door:tavern','play',[4,6]],['patrol','play',[3,5]]],
 mia:[['patrol','idle',[1,2]],['plaza','idle',[2,3]],['patrol','idle',[1,2]],['npc','idle',[2,3]]],anselm:[['door:chapel','pray',[5,8]],['garden','hoe',[4,6]],['home','idle',[3,5]]],
 hedwig:[['home','idle',[6,9]],['plaza','idle',[4,6]]],berta:[['patrol','idle',[3,5]],['home','idle',[4,6]]],gunnar:[['home','idle',[5,8]],['door:tavern','idle',[4,6]]],
 wendla:[['garden','hoe',[5,8]],['home','idle',[3,5]]],finn:[['patrol','idle',[3,5]],['home','idle',[3,5]]],hakim:[['patrol','idle',[3,5]],['home','idle',[4,6]]],durin:[['patrol','idle',[3,5]],['home','idle',[4,6]]],ylva:[['patrol','play',[3,5]],['home','play',[3,5]]],sven:[['home','idle',[4,7]],['patrol','idle',[3,5]]]};
Object.assign(JOBS,JOBS_ADD);
function npcSpot(n,at){const ht=Math.floor(n.hx/TILE),hy=Math.floor(n.hy/TILE);const ok=(x,y)=>walkTile(x,y)&&!SOLIDS[tileAt(x,y)];
 if(at==='home')return[ht,hy];if(at==='plaza')return[VCX+rint(-4,4),VCY+rint(2,4)];
 if(at.startsWith('door:')){const b=BUILD.find(q=>q.id===at.slice(5));if(b)return[b.door.tx+rint(-1,1),b.door.ty+2];}
 if(at==='anvil'){for(const b of BUILD)if(b.annex==='forge'&&Math.hypot(b.x-ht,b.y-hy)<14)return[b.x+b.w,b.y+b.h];}
 const scan=(test,R0)=>{const c=[];for(let y=hy-R0;y<=hy+R0;y++)for(let x=ht-R0;x<=ht+R0;x++)if(test(tileAt(x,y),x,y))c.push([x,y]);return c.length?pick(c):null;};
 if(at==='field'){const r=scan(t=>t===T.FIELD,14);if(r)return r;}
 if(at==='garden'){const r=scan((t,x,y)=>t===T.HERBS||(t===T.FLOWER),9);if(r)return r;}
 if(at==='npc'){const o=pick(NPCS.filter(q=>q!==n&&!q.abs&&Math.hypot(q.x-n.x,q.y-n.y)<TILE*16));if(o){n.healT=o;return[Math.floor(o.x/TILE)+1,Math.floor(o.y/TILE)];}}
 for(let k=0;k<12;k++){const x=ht+rint(-6,6),y=hy+rint(-6,6);if(ok(x,y))return[x,y];}return[ht,hy];}
function npcPath(n,tx,ty){const sx=Math.floor(n.x/TILE),sy=Math.floor(n.y/TILE);if(sx===tx&&sy===ty)return[];const R0=22,Wd=R0*2+1,prev=new Int32Array(Wd*Wd).fill(-1);const id=(x,y)=>(y-sy+R0)*Wd+(x-sx+R0);
 const q=[[sx,sy]];prev[id(sx,sy)]=id(sx,sy);let found=false;for(let i=0;i<q.length&&i<1800;i++){const [x,y]=q[i];if(x===tx&&y===ty){found=true;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(Math.abs(nx-sx)>R0||Math.abs(ny-sy)>R0)continue;const k=id(nx,ny);if(prev[k]>=0)continue;if(!walkTile(nx,ny))continue;prev[k]=id(x,y);q.push([nx,ny]);}}
 if(!found)return null;const path=[];let k=id(tx,ty);while(k!==id(sx,sy)){const x=k%Wd-R0+sx,y=Math.floor(k/Wd)-R0+sy;path.unshift([x,y]);k=prev[k];}return path;}
function npcTick(n,dt,dn){const J=JOBS[n.id];if(!J&&!n.wander)return;
 if(dn<70||(G.ui&&G.ui.dlgNpc===n)){n.moving=false;n.act=null;return;}
 if(!J){n.wt-=dt;if(n.wt<=0){n.wt=rnd(2,5);const s=npcSpot(n,'patrol');n.path=npcPath(n,s[0],s[1])||[];}}
 else if(!n.job||(n.job.done&&n.jobT<=0)){n.ji=((n.ji==null?Math.floor(Math.random()*J.length):n.ji)+1)%J.length;const j=J[n.ji];const s=npcSpot(n,j[0]);n.job={act:j[1],dur:j[2],done:false};n.path=npcPath(n,s[0],s[1])||[];n.act=null;n.jobT=0;}
 if(n.path&&n.path.length){const [px,py]=n.path[0];const gx=(px+.5)*TILE,gy=(py+.5)*TILE,ddx=gx-n.x,ddy=gy-n.y,dd=Math.hypot(ddx,ddy);const sp=(n.child?62:40)*dt;
  if(dd<=sp){n.x=gx;n.y=gy;n.path.shift();}else{n.x+=ddx/dd*sp;n.y+=ddy/dd*sp;n.fx=ddx/dd;n.fy=ddy/dd;}n.moving=true;n.act=null;return;}
 n.moving=false;if(n.job&&!n.job.done){n.job.done=true;n.jobT=rnd(n.job.dur[0],n.job.dur[1]);n.act=n.job.act==='idle'?null:n.job.act;if(n.act==='hammer'){n.fx=0;n.fy=-1;}if(n.act==='heal'&&n.healT){const o=n.healT,l=Math.hypot(o.x-n.x,o.y-n.y)||1;n.fx=(o.x-n.x)/l;n.fy=(o.y-n.y)/l;}}
 if(n.job)n.jobT-=dt;
 if(n.act){n.actT=(n.actT||0)+dt;const cyc=n.act==='hammer'?.9:n.act==='hoe'?1.1:1.4;if(n.actT>cyc){n.actT=0;
   if(n.act==='hammer'){for(let i=0;i<6;i++)G.parts.push({x:n.x+n.fx*14+rnd(-4,4),y:n.y+n.fy*14,z:14,vx:rnd(-90,90),vy:rnd(-90,30),life:.35,c:i%2?'#ffd54a':'#ff8a2a'});if(dn<260)sfx('hit',{x:n.x,y:n.y,vol:.25});}
   else if(n.act==='hoe'){for(let i=0;i<4;i++)G.parts.push({x:n.x+n.fx*14,y:n.y+n.fy*14+6,z:4,vx:rnd(-40,40),vy:rnd(-40,10),life:.4,c:'#6a4a2a'});}
   else if(n.act==='heal'&&n.healT){const o=n.healT;for(let i=0;i<8;i++)G.parts.push({x:o.x+rnd(-10,10),y:o.y+rnd(-6,6),z:10,vx:0,vy:-40,life:.7,c:i%2?'#7fff9a':'#c8ffd0'});}
   else if(n.act==='play'){G.parts.push({x:n.x+rnd(-6,6),y:n.y-6,z:30,vx:rnd(-20,20),vy:-40,life:.9,c:'#ffe9a0'});}
   else if(n.act==='pray'){G.parts.push({x:n.x,y:n.y-6,z:34,vx:0,vy:-25,life:.8,c:'#fff3b0'});}}}}
G.npcSwing=n=>n.swingAt&&G.time-n.swingAt<.3?Math.max(0,.22-(G.time-n.swingAt)):n.act==='hammer'||n.act==='hoe'?Math.max(0,.22-(n.actT||0)):0;
G.npcTool=n=>G.isGuard&&G.isGuard(n)?(n.id==='wache_burg'||n.id==='konrad'?'sword':'spear'):n.id==='fiete'&&n.act==='fish'?'rod':n.ract==='saw'?'axe':n.act==='hammer'?'mace':n.act==='hoe'?'hoe':n.act==='heal'?'staff':n.act==='play'?'lute':null;
G.npcVisible=n=>!n.dead&&(n.id!=='elara'||G.P.main>=7);
function placeElara(){const e=NPCS.find(n=>n.id==='elara');if(G.P.main>=8){e.x=(VCX+2.5)*TILE;e.y=(VCY-29.5)*TILE;}else{e.x=(LAIR.x+.5)*TILE;e.y=(LAIR.y+2.5)*TILE;}}

// ===================== Spieler & Zustand =====================
const SPAWN={x:(VCX+15.5)*TILE,y:(VCY-.5)*TILE};
let P;G.mons=[];G.grounds=[];G.proj=[];G.pproj=[];G.teles=[];G.floats=[];G.parts=[];G.farm=new Map();G.time=0;G.input={x:0,y:0};
G.fixT={grukk:0,bonelord:0,dragon:0,schnitter:0,eldtree:0,sandking:0};let bossT=300,spawnT=0;G.flashT=0;let fullT=0;
function newGame(diff){G.room=null;ROOMS.forEach(r=>r.chests.forEach(c=>{c.opened=false;c.at=0;}));if(diff)G.settings.diff=diff;G.saveSettings();
 P={x:SPAWN.x,y:SPAWN.y,fx:0,fy:1,hp:112,level:1,xp:0,gold:15,inv:new Array(36).fill(null),eq:{helm:null,chest:null,legs:null,boots:null,ring:null,amulet:null},sel:0,q:{},main:0,mN:0,macc:false,mflag:0,barrier:false,chat:{},kills:{},ways:{city:1},atkCd:0,swing:0,hurtT:0,dead:false,anim:0,moving:false,dodgeT:0,dodgeCd:0,poison:null,burn:null,slow:0,sta:100,mp:44,staT:0,dayT:60,side:{},z:0,vz:0,home:{bed:1},pet:null,och:{},diff:G.settings.diff,started:Date.now()};
 G.P=P;const sw=genItem('weapon',1,0,{kind:'sword',name:'Rostiges Schwert'});sw.dmg=4;P.inv[0]=sw;P.inv[1]=mkStack('bread',2);P.inv[2]=mkStack('seed',3);
 P.eq.chest=genItem('chest',1,0,{set:'ritter',name:'Leinenhemd'});P.eq.chest.def=1;
 G.slashes=[];G.farm=new Map();G.mons=[];G.grounds=[];G.proj=[];G.pproj=[];G.teles=[];G.fixT={grukk:0,bonelord:0,dragon:0,schnitter:0,eldtree:0,sandking:0};bossT=300;G.flags.barrier=false;placeElara();G.S=calc();}
G.newGame=newGame;
const xpNeed=l=>Math.round((8+6*l)*(12+1.15*l)*G.D().xpN);G.xpNeed=xpNeed;
const held=()=>{const it=P.inv[P.sel];return it&&it.type==='weapon'?it:null;};G.held=held;
function setCounts(){const c={};for(const k of SLOTS4){const it=P.eq[k];if(it&&it.set&&reqLvl(it)<=P.level)c[it.set]=(c[it.set]||0)+1;}return c;}G.setCounts=()=>setCounts();
// ===== Skilltree: 1 Punkt pro Stufe =====
const SKILLS=[
 {id:'vit',n:'Lebenskraft',ic:'❤',max:10,g:'Grundwerte',d:r=>`+${r*4}% max. Leben`},
 {id:'sta',n:'Ausdauer',ic:'⚡',max:10,g:'Grundwerte',d:r=>`+${r*4}% max. Ausdauer`},
 {id:'mana',n:'Geisteskraft',ic:'🔷',max:10,g:'Grundwerte',d:r=>`+${r*4}% max. Mana`},
 {id:'reg',n:'Regeneration',ic:'✚',max:10,g:'Grundwerte',d:r=>`+${r*8}% Regeneration (Leben, Ausdauer, Mana)`},
 {id:'str',n:'Waffenmeister',ic:'⚔',max:10,g:'Kampf',d:r=>`+${r*2}% Nahkampfschaden`},
 {id:'aim',n:'Adlerauge',ic:'🏹',max:10,g:'Kampf',d:r=>`+${r*2}% Fernkampfschaden`},
 {id:'arc',n:'Arkane Macht',ic:'🔮',max:10,g:'Kampf',d:r=>`+${r*2}% Zauberschaden`},
 {id:'tough',n:'Zähigkeit',ic:'🛡',max:10,g:'Kampf',d:r=>`−${(r*1.5).toFixed(1).replace('.0','')}% erlittener Schaden`},
 {id:'swift',n:'Leichtfuß',ic:'🪶',max:5,g:'Besonderes',d:r=>`+${r*2}% Tempo, −${r*5}% Ausdauer für Sprinten, Springen & Ausweichen`},
 {id:'second',n:'Zweite Chance',ic:'🕯',max:1,g:'Besonderes',req:15,d:r=>`Ein tödlicher Treffer lässt dich mit 1 Leben überleben (+2 s unverwundbar). Lädt 10 Minuten nach.`}];
G.SKILLS=SKILLS;
const skR=id=>(P.skill&&P.skill[id])||0;
G.skillSpent=()=>{let n=0;for(const k in P.skill||{})n+=P.skill[k];return n;};
G.skillPts=()=>Math.max(0,(P.level-1)-G.skillSpent());
G.skillUp=id=>{const k=SKILLS.find(x=>x.id===id);if(!k)return false;P.skill=P.skill||{};const r=skR(id);if(r>=k.max||G.skillPts()<1)return false;if(k.req&&G.skillSpent()<k.req){G.toast(`Erst ${k.req} Punkte in andere Fähigkeiten stecken.`,'#ffcc80');return false;}P.skill[id]=r+1;G.S=calc();sfx('coin');G.save();return true;};
G.skillResetCost=()=>Math.max(50,P.level*25);
G.skillReset=()=>{const c=G.skillResetCost();if(!G.skillSpent())return false;if(P.gold<c){G.toast(`Zurücksetzen kostet ${c} Gold.`,'#ff8a80');return false;}P.gold-=c;P.skill={};G.S=calc();P.hp=Math.min(P.hp,G.S.maxhp);G.toast('Alle Skillpunkte zurückgesetzt.','#ffd54a');G.save();return true;};
function calc(){const L=P.level,s={base:3+L*1.2,def:0,maxhp:100+L*12,melee:0,ranged:0,spell:0,defp:0,res:0,crit:5,regen:.4,regenPct:0,hpPct:0,luck:0,spd:0,cd:.5,cls:'melee',kind:null,reach:52,arc:1.3,wdmg:0};
 const add=af=>{for(const k in af){if(k==='hp')s.maxhp+=af[k];else s[k]=(s[k]||0)+af[k];}};
 s.maxSta=100+Math.min(60,L*2);s.maxMp=40+L*4;s.mpRegen=2.5+L*.15;
 s.ufx={};const w=held();if(w&&reqLvl(w)>L)s.tooHigh=w;else if(w){const K=WKIND[w.kind],e=itemEff(w);if(w.ufx){s.ufx=w.ufx;if(w.ufx.crit)s.crit+=w.ufx.crit;}s.wdmg=e.dmg;s.cd=e.cd;s.crit+=e.crit;s.cls=K.cls;s.kind=w.kind;s.reach=K.reach||52;s.arc=K.arc||1.3;s.range=K.range;s.thrust=K.thrust;add(w.af);}
 for(const k in P.eq){const it=P.eq[k];if(!it)continue;if(reqLvl(it)>L){s.eqHigh=1;continue;}const e=itemEff(it);if(e.def)s.def+=e.def;if(e.hpPct)s.hpPct+=e.hpPct;if(e.crit)s.crit+=e.crit;if(e.luck)s.luck+=e.luck;if(e.spd)s.spd+=e.spd;add(it.af);}
 const sc=setCounts();s.sets=sc;for(const k in sc)SETS[k].fx(s,sc[k]);
 if(s.castFast&&s.cls==='magic')s.cd*=.8;if(sc.magier>=2){s.maxMp=Math.round(s.maxMp*1.3);s.mpRegen*=1.4;}if(s.spell>0)s.mpRegen*=1+s.spell/200;
 if(s.cls==='melee'){const K=WKIND[s.kind||'sword'];s.staCost=Math.round(5+K.cd*9);}else if(s.cls==='magic')s.mpCost=WKIND[s.kind].mana;
 {const R=skR;s.hpPct+=R('vit')*4;s.maxSta=Math.round(s.maxSta*(1+R('sta')*.04));s.maxMp=Math.round(s.maxMp*(1+R('mana')*.04));const rg=1+R('reg')*.08;s.regen*=rg;s.mpRegen*=rg;s.staReg=rg;s.melee+=R('str')*2;s.ranged+=R('aim')*2;s.spell+=R('arc')*2;s.dr=R('tough')*.015;s.spd+=R('swift')*2;s.staMul=1-R('swift')*.05;if(s.staCost)s.staCost=Math.max(3,Math.round(s.staCost*s.staMul));}
 s.def=Math.round(s.def*(1+s.defp/100));s.maxhp=Math.round(s.maxhp*(1+s.hpPct/100));s.regen+=s.maxhp*s.regenPct/100;
 s.crit=Math.min(s.crit,75);s.spd=Math.min(s.spd,50);s.res=Math.min(s.res,80);
 const cb=s.cls==='magic'?s.spell:s.cls==='ranged'?s.ranged:s.melee;s.total=(s.base+s.wdmg)*(1+cb/100);s.speed=140*(1+s.spd/100)*(P.slow>0?.6:1);if(P.rested&&P.dayT<P.rested.until){s.maxhp=Math.round(s.maxhp*(1+P.rested.b/100));s.regen*=1+P.rested.b/40;}if(P.pet)s.luck=(s.luck||0)+5;s.regen=Math.round(s.regen*10)/10;return s;}
G.calc=calc;
function addItem(it){if(it.stack){for(let i=0;i<36;i++){const s=P.inv[i];const cap=it.type==='ammo'?999:64;if(s&&s.stack&&s.id===it.id&&s.count<cap){const mv=Math.min(cap-s.count,it.count);s.count+=mv;it.count-=mv;if(it.count<=0){G.invDirty=true;return true;}}}}
 for(let i=0;i<36;i++)if(!P.inv[i]){P.inv[i]=it;G.invDirty=true;return true;}return false;}
function countItem(id){let n=0;for(const s of P.inv)if(s&&s.id===id)n+=s.count;return n;}
function removeItem(id,n){for(let i=0;i<36&&n>0;i++){const s=P.inv[i];if(s&&s.id===id){const t=Math.min(n,s.count);s.count-=t;n-=t;if(s.count<=0)P.inv[i]=null;}}G.invDirty=true;}
function dropGround(it,x,y){G.grounds.push({x:x+rnd(-10,10),y:y+rnd(-10,10),it,t:0});}
function give(it){const nm=it.stack?`${it.name} ×${it.count}`:it.name;if(!addItem(it)){dropGround(it,P.x,P.y+20);G.toast('Inventar voll, liegt am Boden','#ff8a80');}G.toast('Erhalten: '+nm,RAR[it.rarity||0].c,false,it);}
function useItem(i){const it=P.inv[i];if(!it||it.type!=='food')return;const S=G.S;if(STACK[it.id].mana){if(P.mp>=S.maxMp){G.toast('Dein Mana ist schon voll','#ccc');return;}const v=Math.round(S.maxMp*STACK[it.id].mana);P.mp=Math.min(S.maxMp,P.mp+v);sfx('drink');G.floats.push({x:P.x,y:P.y-34,t:`+${v} Mana`,c:'#82b1ff',life:.9});it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;return;}if(P.hp>=S.maxhp&&!P.poison&&!P.burn){G.toast('Deine LP sind schon voll','#ccc');return;}const s=STACK[it.id];const h=s.pct?Math.round(S.maxhp*s.pct):s.heal;P.hp=Math.min(S.maxhp,P.hp+h);if(it.id.indexOf('potion')===0){P.poison=null;P.burn=null;P.slow=0;}sfx(it.id.indexOf('potion')===0?'drink':'eat');G.floats.push({x:P.x,y:P.y-34,t:`+${h}`,c:'#69f0ae',life:.9});it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;}
function buy(id,n,price){const p=price!=null?price:STACK[id].price*n;if(P.gold<p){G.toast('Nicht genug Gold','#ff8a80');return false;}P.gold-=p;sfx('coin');give(mkStack(id,n));return true;}
function quickHeal(){let i=P.inv.findIndex(s=>s&&s.id==='potion');if(i<0)i=P.inv.findIndex(s=>s&&s.id==='potion2');if(i<0)i=P.inv.findIndex(s=>s&&(s.id==='bread'||s.id==='carrot'));if(i<0){G.toast('Keine Heiltränke oder Essen dabei','#ff8a80');return;}useItem(i);}
Object.assign(G,{addItem,countItem,removeItem,give,useItem,dropGround,buy,quickHeal});
// ===================== Kampf =====================
function lvlMul(m){const d=m.lvl-P.level;return d>0?Math.max(.05,1-d*G.D().pen*1.6):1;}
function hitMonster(m,dmg,cr,o){m.lastHit=G.time;o=o||{};if(m.dead)return;if(m.evade){G.floats.push({x:m.x,y:m.y-m.r-8,t:'Immun',c:'#9be7ff',life:.6});sfx('immune');return;}
 dmg=Math.max(1,Math.round(dmg*lvlMul(m)*(1-(m.armor||0))));m.hp-=dmg;if(m.boss&&m.boss!=='mini'&&!m.enraged&&m.hp<m.maxhp*.4&&m.hp>0){m.enraged=1;m.dmg*=1.3;m.spd*=1.2;m.abT=Math.min(m.abT||3,.6);G.toast(`🔥 ${m.name} gerät in Raserei!`,'#ff8a65',true);for(let i=0;i<20;i++)G.parts.push({x:m.x,y:m.y,z:20,vx:rnd(-160,160),vy:rnd(-160,160),life:.7,c:'#ff5722'});}m.hitT=.12;m.aggro=true;m.provoked=true;
 if(o.pl){const uf=(G.S&&G.S.ufx)||{};if(uf.ls){const h=Math.max(1,Math.round(dmg*uf.ls));P.hp=Math.min(G.S.maxhp,P.hp+h);}if(uf.burn&&!o.elem)m.burn={t:3,dps:dmg*.15};if(uf.slow)m.slowT=2;if(uf.poison)m.burn={t:4,dps:dmg*.1};if(uf.stun&&Math.random()<uf.stun&&!m.boss)m.stunT=.9;}
 if(o.stag&&m.wind>0&&m.boss!=='dragon'){m.wind=0;m.atkCd=Math.max(m.atkCd,.6);G.floats.push({x:m.x,y:m.y-m.r-18,t:'Unterbrochen!',c:'#ffcc80',life:.6});}
 if(o.stun&&Math.random()<o.stun&&!m.boss){m.stunT=1;G.floats.push({x:m.x,y:m.y-m.r-18,t:'Betäubt!',c:'#fff59d',life:.7});}
 if(!m.st&&o.kb!==0){const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy)||1,kb=(m.boss?30:150)*(o.kb||1);m.kx=dx/d*kb;m.ky=dy/d*kb;}
 if(o.elem==='fire')m.burn={t:3,dps:dmg*.18};if(o.elem==='frost')m.slowT=2.2;if(o.elem==='holy'){const h=Math.max(1,Math.round(dmg*.15));P.hp=Math.min(G.S.maxhp,P.hp+h);}
 if(G.settings.dmgNums)G.floats.push({x:m.x+rnd(-6,6),y:m.y-m.r-8,t:cr?`${dmg}!`:`${dmg}`,c:cr?'#ffd54a':(o.elem==='fire'?'#ffb070':o.elem==='frost'?'#9be7ff':'#fff'),life:.8,big:cr});
 for(let i=0;i<4;i++)G.parts.push({x:m.x,y:m.y,z:10,vx:rnd(-90,90),vy:rnd(-90,90),life:.35,c:o.pc||m.c});
 if(m.hp<=0)killMonster(m);}
function pickTarget(range,cone){let best=null,bs=-1e9;const ax=G.aim?G.aim.x:P.fx,ay=G.aim?G.aim.y:P.fy;
 for(const m of G.mons){if(m.dead||m.passive&&!m.provoked&&!m.aggro&&false)continue;const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy);if(d-m.r>range)continue;const dot=(dx*ax+dy*ay)/(d||1);if(dot<cone)continue;const sc=dot*200-d;if(sc>bs){bs=sc;best=m;}}return best;}
let warnT=0;function warn(t){if(G.time-warnT<1.4)return;warnT=G.time;G.floats.push({x:P.x,y:P.y-40,t,c:'#ffcc80',life:1});}
function attack(){if(P.atkCd>0||P.dead||P.dodgeT>0)return;{const hs=P.inv[P.sel];if(hs&&hs.id==='rod'){if(!G._rodLatch){G._rodLatch=1;G.fishAct();}return;}}const S=G.S;
 if(S.tooHigh){warn(`Benötigt Stufe ${reqLvl(S.tooHigh)}!`);}
 let weak=1;if(S.cls==='melee'){if(P.sta<S.staCost){weak=.45;P.sta=Math.max(0,P.sta-S.staCost*.3);warn('Erschöpft – schwacher Schlag!');}else P.sta-=S.staCost;P.staT=.7;}
 else if(S.cls==='magic'){if(P.mp<S.mpCost){warn('Kein Mana!');P.atkCd=.3;return;}P.mp-=S.mpCost;}
 else{const am=WKIND[S.kind].proj==='bolt'?'bolt':'arrow';if(countItem(am)<1){warn(am==='bolt'?'Keine Bolzen!':'Keine Pfeile!');P.atkCd=.4;return;}removeItem(am,1);}
 P.atkCd=S.cd*(weak<1?1.35:1);P.swing=.22;
 if(G.aim){P.fx=G.aim.x;P.fy=G.aim.y;}const FPB=G.settings.cam==='fp'&&G.settings.mode!=='2d'?12:0,RCH=S.reach+FPB;const rng=S.cls==='melee'?RCH+24:S.range;const precise=S.cls!=='melee'&&!!G.aim;const t=pickTarget(rng,S.cls==='melee'?(S.thrust?.9:.55):precise?.972:.86);
 if(t){const d=Math.hypot(t.x-P.x,t.y-P.y)||1;const k=S.cls==='melee'?1:precise?.5:.72;let fx=P.fx*(1-k)+(t.x-P.x)/d*k,fy=P.fy*(1-k)+(t.y-P.y)/d*k;const l=Math.hypot(fx,fy)||1;P.fx=fx/l;P.fy=fy/l;}P.atkFx=P.fx;P.atkFy=P.fy;
 if(S.cls==='melee'){const fa=Math.atan2(P.fy,P.fx);let hit=false,anyCrit=false;
  for(const m of G.mons){if(m.dead)continue;const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy);if(d>RCH+m.r)continue;let a=Math.atan2(dy,dx)-fa;while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;
   let ok;if(S.thrust){const al=dx*P.fx+dy*P.fy,pe=Math.abs(-dx*P.fy+dy*P.fx);ok=al>-4&&pe<m.r+9;}else ok=Math.abs(a)<S.arc+Math.min(.35,m.r/Math.max(d,1));
   if(ok){hit=true;let dmg=S.total*rnd(.85,1.15)*weak;const cr=Math.random()*100<S.crit;if(cr){dmg*=2;anyCrit=true;}const K=WKIND[S.kind];hitMonster(m,dmg,cr,{kb:S.thrust?.6:K.stag?2.2:1,pl:1,stag:K.stag,stun:K.stun});}}
  if(!hit){for(const n of NPCS){if(!G.npcVisible(n)||n.ko>0||n.lie||(G.room?n.loc!==G.room:!!n.loc))continue;const dx=n.x-P.x,dy=n.y-P.y,d=Math.hypot(dx,dy);if(d>RCH+10)continue;let a=Math.atan2(dy,dx)-fa;while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;if(Math.abs(a)<S.arc*.8){hitNPC(n,S.total);hit=true;break;}}}
  if(!hit&&!G.room){for(const c of G.CATS||[]){const dx=c.x-P.x,dy=c.y-P.y,d=Math.hypot(dx,dy);if(d>RCH+12)continue;let a=Math.atan2(dy,dx)-fa;while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;if(Math.abs(a)<S.arc+.3){hitCat(c);hit=true;break;}}}
  G.slashes.push({x:P.x,y:P.y,a:fa,arc:S.arc,r:S.reach,thrust:S.thrust,t:.18});
  sfx(hit?(anyCrit?'crit':'hit'):'swing');return;}
 const K=WKIND[S.kind];const cr=Math.random()*100<S.crit;let dmg=S.total*rnd(.9,1.1);if(cr)dmg*=2;
 const uf=S.ufx||{};G.pproj.push({x:P.x+P.fx*14,y:P.y+P.fy*14,vx:P.fx*K.spd,vy:P.fy*K.spd,dmg,cr,kind:K.proj,elem:K.elem||(uf.burn?'fire':uf.slow?'frost':null),pierce:(K.pierce?3:0)+(uf.pierce?2:0),kb:K.kbk||.4,life:K.range/K.spd+.05,hits:[]});
 sfx(K.cls==='magic'?'zap':'arrow');}
function jump(){if(P.dead||P.z>0||P.vz>0||P.climb||P.rootT>0||P.dodgeT>0)return;if(P.sta<6){warn('Erschöpft!');return;}P.sta-=6*(G.S.staMul||1);P.staT=.4;P.vz=262;P.z=.01;P.landSfx=true;sfx('dodge');}
G.jump=()=>jump();
function dodge(){if(P.dead||P.dodgeCd>0||P.climb)return;if(P.sta<16){warn('Erschöpft!');return;}if(P.rootT>0){if(P.sta<35){warn('Erschöpft!');return;}P.sta-=15;P.rootT=0;G.floats.push({x:P.x,y:P.y-34,t:'Losgerissen!',c:'#a5d6a7',life:.8});}P.sta-=16*(G.S.staMul||1);P.staT=.7;let dx=G.input.x,dy=G.input.y;const l=Math.hypot(dx,dy);if(l<.2){dx=P.fx;dy=P.fy;}else{dx/=l;dy/=l;}P.ddx=dx;P.ddy=dy;P.dodgeT=.26;P.dodgeCd=1.1;sfx('dodge');}
// Schaden am Spieler: src {lvl, type:'phys'|'magic', poison, burn, chill}
function hitPlayer(dmg,src){if(P.dead||G.god)return;if(P.frost&&src&&(src.burn||src.fire||src.boss==='dragon'||src.type==='dragon'))dmg*=.5;if(P.dodgeT>0){G.floats.push({x:P.x,y:P.y-30,t:'Ausgewichen!',c:'#9be7ff',life:.6});return;}
 const D=G.D(),lvl=src.lvl||1,diff=Math.max(0,lvl-P.level),S=G.S;dmg*=1+diff*D.pen*2.4;
 const red=S.def/(S.def+50+lvl*6);if(src.type==='magic')dmg*=(1-S.res/100)*(1-red*.5);else dmg*=1-red;
 if(P.invT>0)return;dmg*=1-(S.dr||0);
 dmg=Math.max(1,Math.round(dmg*rnd(.9,1.1)));if(P.hp-dmg<=0&&skR('second')&&!(P.secondT>0)){dmg=Math.max(0,P.hp-1);P.secondT=600;P.invT=2;G.toast('🕯 Zweite Chance! Du überlebst mit letzter Kraft.','#ffd54a',true);for(let i=0;i<20;i++)G.parts.push({x:P.x,y:P.y,z:20,vx:rnd(-120,120),vy:rnd(-120,120),life:.8,c:'#ffe082'});}P.hp-=dmg;P.hurtT=.25;sfx('hurt');G.floats.push({x:P.x,y:P.y-30,t:'-'+dmg,c:'#ff5252',life:.8});
 const rf=1-S.res/100;if(src.poison)P.poison={t:3.5,dps:Math.max(1,dmg*.12*rf)};if(src.burn)P.burn={t:3,dps:Math.max(1,dmg*.14*rf)};if(src.chill)P.slow=2*rf;if(src.root&&P.dodgeT<=0){P.rootT=Math.max(P.rootT||0,src.root*rf);G.floats.push({x:P.x,y:P.y-30,t:src.net?'Im Netz gefangen!':'Festgehalten!',c:'#ff8a80',life:.9});}if(src.grab||src.slow)P.slow=Math.max(P.slow||0,(src.slow?2.4:1.4)*rf);if(src.pull&&!src.pull.dead){P.pullFrom=src.pull;P.pullT=.32;G.floats.push({x:P.x,y:P.y-30,t:'Herangezogen!',c:'#ff8a80',life:.8});}if(src.vamp&&!src.vamp.dead){src.vamp.hp=Math.min(src.vamp.maxhp,src.vamp.hp+dmg*.6);}
 if(P.hp<=0){P.hp=0;die();}}
function die(){sfx('death');P.dead=true;P.poison=null;P.burn=null;const loss=Math.floor(P.gold*G.D().goldLoss);P.gold-=loss;G.lastLoss=loss;G.ui&&G.ui.onDeath&&G.ui.onDeath(loss);}
G.respawn=()=>{if(G.room){G.mons=G.mons.filter(m=>m.room!==G.room.id);G.room=null;}P.dead=false;P.x=SPAWN.x;P.y=SPAWN.y;G.S=calc();P.hp=G.S.maxhp;P.slow=0;G.teles=[];G.proj=[];G.mons.forEach(m=>m.aggro=false);};
function gainXP(x){P.xp+=x;let up=false;while(P.xp>=xpNeed(P.level)){P.xp-=xpNeed(P.level);P.level++;up=true;}if(up){sfx('levelup');G.S=calc();P.hp=G.S.maxhp;G.toast(`⭐ Stufe ${P.level} erreicht! Volle Heilung. +1 Skillpunkt (Taste K / ⭐ im Inventar)`,'#ffd54a',true);for(let i=0;i<24;i++)G.parts.push({x:P.x,y:P.y,z:20,vx:rnd(-120,120),vy:rnd(-120,120),life:.8,c:'#ffd54a'});}}
G.gainXP=gainXP;
const UNIQ={
 skeleton:[{k:'bow',name:'Knochenbogen',ufx:{crit:10},d:'+10 % Krit'}],skarcher:[{k:'longbow',name:'Bogen des Grabwächters',ufx:{pierce:1},d:'Pfeile durchschlagen 2 weitere Gegner'}],
 reaper:[{k:'scythe',name:'Sense des Schnitters',ufx:{ls:.08},d:'Lebensraub 8 %',ch:.09},{t:'amulet',name:'Stundenglas des Todes',ufx:{crit:6},d:'+6 % Krit'}],
 vampire:[{k:'dagger',name:'Blutfang',ufx:{ls:.1},d:'Lebensraub 10 %'}],werewolf:[{k:'dagger',name:'Mondklaue',ufx:{crit:12},d:'+12 % Krit'},{set:'waldlaeufer',s:'chest',name:'Werwolfpelz',ufx:{},d:'Pelz einer Vollmondbestie'}],
 mummy:[{set:'heiler',s:'chest',name:'Binden des Pharao',ufx:{},d:'uralte Leinenbinden'}],treant:[{k:'warhammer',name:'Rindenhammer',ufx:{stun:.15},d:'zusätzlich 15 % Betäubung'}],
 scorpion:[{k:'spear',name:'Stachel der Dünen',ufx:{poison:1},d:'vergiftet Gegner'}],imp:[{k:'tome_fire',name:'Höllenfeuer-Kodex',ufx:{burn:1},d:'brennt stärker'}],
 frostgiant:[{k:'warhammer',name:'Gletscherbrecher',ufx:{slow:1},d:'verlangsamt Gegner'}],wraith:[{t:'amulet',name:'Schattenschleier',ufx:{},d:'aus Schatten gewoben'}],
 knight:[{k:'greatsword',name:'Zweihänder des Ordens',ufx:{crit:8},d:'+8 % Krit'}],draugr:[{k:'axe',name:'Draugr-Bartaxt',ufx:{slow:1},d:'verlangsamt Gegner'}],
 bandit:[{k:'flail',name:'Banditenflegel',ufx:{stun:.12},d:'12 % Betäubung'}],harpy:[{k:'longbow',name:'Federbogen der Harpyie',ufx:{crit:10},d:'+10 % Krit'}],centaur:[{k:'longbow',name:'Kentaurenbogen',ufx:{pierce:1},d:'Pfeile durchschlagen'}],
 necro:[{k:'tome_storm',name:'Buch der Toten',ufx:{ls:.05},d:'Lebensraub 5 %'}],banshee:[{t:'ring',name:'Ring der Klage',ufx:{crit:5},d:'+5 % Krit'}],
 golem:[{k:'warhammer',name:'Golemfaust',ufx:{stun:.2},d:'20 % Betäubung'}],greydwarf:[{k:'mace',name:'Moosknüppel',ufx:{slow:1},d:'verlangsamt Gegner'}],wasp:[{k:'dagger',name:'Wespenstachel',ufx:{poison:1},d:'vergiftet Gegner'}],
 kobold:[{k:'crossbow',name:'Koboldschleuder-Armbrust',ufx:{pierce:1},d:'durchschlagend'}],icewitch:[{k:'tome_frost',name:'Eisherz-Grimoire',ufx:{slow:1},d:'stärkere Verlangsamung'}],
 thornvine:[{k:'spear',name:'Dornenspieß',ufx:{poison:1},d:'vergiftet Gegner'}],shadowhound:[{k:'dagger',name:'Schattenzahn',ufx:{ls:.06},d:'Lebensraub 6 %'}]};
G.UNIQ=UNIQ;G.killMonster=m=>killMonster(m);
function mkUnique(e,il,src){const o={name:e.name,src,ufx:e.ufx,ud:e.d,uniq:1};const rar=Math.random()<.25?4:3;if(e.k)return genItem('weapon',il+1,rar,Object.assign(o,{kind:e.k}));if(e.set)return genItem(e.s,il+1,rar,Object.assign(o,{set:e.set}));return genItem(e.t,il+1,rar,o);}
function killMonster(m){m.dead=true;if(P.side)for(const k in SQ){const q=SQ[k],st=P.side[k];if(st&&st.st==='active'&&q.kill===m.type&&st.c<q.cnt){st.c++;if(st.c===q.cnt)G.toast(`📜 ${q.n}: erledigt! Zurück zu ${npcById(q.npc).short}.`,'#ffd54a',true);}}sfx(m.boss?'bosskill':'kill',m);if(m.boss==='dragon')sfx('aggro',{type:'dragon'});const D=G.D();const diff=m.lvl-P.level;let xp=m.xp;if(diff<=-7)xp*=.05;else if(diff<=-4)xp*=.3;else if(diff>=2)xp*=1+Math.min(diff,4)*.08;if(m.summoned)xp*=.3;xp=Math.max(1,Math.round(xp));
 gainXP(xp);G.floats.push({x:m.x,y:m.y-m.r-22,t:`+${xp} XP`,c:'#b388ff',life:1.1});
 for(let i=0;i<14;i++)G.parts.push({x:m.x,y:m.y,z:12,vx:rnd(-140,140),vy:rnd(-140,140),life:.55,c:m.c});
 const q=P.q;if(!m.boss&&!m.summoned)P.kills[m.type]=(P.kills[m.type]||0)+1;
 if(P.main===2&&P.mN<qd('prove')){P.mN++;if(P.mN===qd('prove'))G.toast('⚔ Bewährt! Kehre zu Fürst Aldric zurück.','#ffd54a',true);}
 if((m.type==='wolf'||m.type==='icewolf')&&q.wolves==='active'&&q.wolfN<qd('wolves')){q.wolfN++;if(q.wolfN===qd('wolves'))G.toast('🐺 Genug Wölfe erlegt! Zurück zu Schmiedin Hilda.','#ffd54a',true);}
 if(m.type==='draugr'&&q.draugr==='active'&&q.draugrN<qd('draugr')){q.draugrN++;if(q.draugrN===qd('draugr'))G.toast('⚔ Die Draugr sind zurückgeschlagen! Zurück zu Jarl Ragna.','#ffd54a',true);}
 if(m.type==='goblin'&&q.ears==='active'&&countItem('ear')+G.grounds.filter(g=>g.it.id==='ear').length<qd('ears')&&Math.random()<.5)dropGround(mkStack('ear',1),m.x,m.y);
 if(m.boss){if(m.B.fixed&&BOSSES[m.boss]&&!m.B.mini)G.fixT[m.boss]=m.boss==='dragon'?180:240;
  if(m.boss==='grukk'&&P.main===3&&P.macc&&!P.mflag){P.mflag=1;G.toast('📜 Du hast die Karte des Spähers gefunden! Bring sie zu Fürst Aldric.','#ffd54a',true);}
  else if(m.boss==='bonelord'&&P.main===4&&P.macc&&!P.mflag){P.mflag=1;G.toast('💠 Der Siegelstein ist dein! Bring ihn zu Fürst Aldric.','#ffd54a',true);}
  else if(m.B.herald&&P.main===5&&P.macc&&!(P.shards||{})[m.boss]){P.shards=P.shards||{};P.shards[m.boss]=1;const n=Object.keys(P.shards).length;G.flashT=1;G.toast(`🔥 Glutsiegel-Splitter erbeutet! (${n}/3)`+(n>=3?' Bring sie zu Gunnar!':''),'#ffd54a',true);}
  else if(m.boss==='dragon'&&P.main===6){P.main=7;placeElara();G.toast('🐉 IGNAROK IST GEFALLEN! Sprich mit Prinzessin Elara.','#ffd54a',true);G.flashT=1.2;}
  else G.toast(`🏆 ${m.name} besiegt!`,'#ffd54a',true);}
 if(Math.random()<.6||m.boss){const g=Math.max(1,Math.round(rint(m.lvl,m.lvl*3)*(m.boss?8:1)*D.gold));G.grounds.push({x:m.x+rnd(-8,8),y:m.y+rnd(-8,8),gold:g,it:G.goldIt,t:0});}
 if(Math.random()<(m.boss?.35:.05))dropGround(mkStack(m.lvl>=18&&Math.random()<.3?'potion2':'potion',1),m.x,m.y);
 if(!m.boss&&Math.random()<.04)dropGround(mkStack(pick(['seed','hseed','carrot']),rint(1,2)),m.x,m.y);
 if(m.t.shot&&m.t.shot.kind==='arrow'&&Math.random()<.45)dropGround(mkStack('arrow',rint(3,8)),m.x,m.y);else if(Math.random()<.04)dropGround(mkStack(Math.random()<.6?'arrow':'bolt',rint(2,6)),m.x,m.y);
 if(Math.random()<.025)dropGround(mkStack('mpotion',1),m.x,m.y);
 if(m.summoned)return;
 {const U=UNIQ[m.type]||(m.B&&m.B.mini&&UNIQ[m.B.base]);if(U){const e=pick(U);if(Math.random()<(e.ch||.035)*(m.boss?4:1)*(1+G.S.luck/100)){const it=mkUnique(e,m.lvl+G.D().ilvl,`${m.name} (Stufe ${m.lvl})`);dropGround(it,m.x,m.y);G.flashT=.8;G.toast(`★ EINZIGARTIG: ${it.name}!`,'#ff9e40',true,it);}}}
 const mini=m.B&&m.B.mini;const ch=m.B&&m.B.herald?1:Math.min(.95,(mini?D.chM:m.boss?D.chB:D.chN)*(1+G.S.luck/100));
 if(Math.random()<ch){const rar=rollRar(mini?D.M:m.boss?D.B:D.N);const il=m.lvl+D.ilvl+(m.boss?2:0);let it;const src=`${m.name} (Stufe ${m.lvl})`;
  if(m.boss&&!mini&&m.B.loot.length&&(m.B.herald||Math.random()<.6)){const e=pick(m.B.loot);const xo={ufx:e.ufx,ud:e.d};const rr=m.B.herald?Math.max(rar,3):rar;it=e.k?genItem('weapon',il,rr,Object.assign({kind:e.k,name:e.name,boss:m.boss,f:e.f,src},xo)):e.set?genItem(e.s,il,rr,Object.assign({set:e.set,kind:e.k,name:e.name,boss:m.boss,f:e.f,src},xo)):genItem(e.t,il,rr,Object.assign({name:e.name,boss:m.boss,f:e.f,src},xo));}
  else{const lg=LG[(m.B&&m.B.lg)||(m.B?MT[m.B.base]&&MT[m.B.base].lg:null)||m.t.lg]||LG.beast;it=lootItem(pick(lg),il,rar,{bossy:!!m.boss,src});}
  dropGround(it,m.x,m.y);if(it.kind&&WKIND[it.kind].cls==='ranged')dropGround(mkStack(it.kind==='crossbow'?'bolt':'arrow',it.kind==='crossbow'?8:15),m.x,m.y);
  if(rar===5){G.flashT=2;G.toast(`✦✦ MYTHISCH! ${it.name} ✦✦`,RAR[5].c,true,it);}else if(rar>=3)G.toast(`${RAR[rar].n}e Beute ist gefallen!`,RAR[rar].c,false);}}
function shoot(m,ax,ay,s){if(s.root){s=Object.assign({},s);}sfx(s.kind==='arrow'||s.kind==='rock'?'arrow':'zap',m);const d=Math.hypot(ax,ay)||1;G.proj.push({x:m.x,y:m.y,vx:ax/d*s.spd,vy:ay/d*s.spd,dmg:m.dmg*(s.mul||1),lvl:m.lvl,c:s.c,kind:s.kind,poison:s.poison,burn:s.burn,chill:s.chill,slow:s.slow,pull:s.pull,root:s.root,net:s.net,type:s.kind==='arrow'||s.kind==='rock'?'phys':'magic',life:2.4,r:s.kind==='arrow'||s.kind==='rock'?5:7});}
function monSkills(m,dt,d,dx,dy){const sk=m.t.sk;if(!sk||m.boss==='dragon')return;m.skCd=(m.skCd==null?rnd(1.5,3.5):m.skCd)-dt;
 if(sk.indexOf('regen')>=0&&G.time-(m.lastHit||0)>3&&m.hp<m.maxhp){m.hp=Math.min(m.maxhp,m.hp+m.maxhp*.03*dt);if(Math.random()<.1)G.parts.push({x:m.x+rnd(-10,10),y:m.y,z:20,vx:0,vy:-30,life:.5,c:'#7fff7a'});}
 if(sk.indexOf('howl')>=0&&!m.howled&&!m.summoned&&m.aggro){m.howled=1;if(Math.random()<.5){sfx('aggro',{type:'wolf',x:m.x,y:m.y});G.floats.push({x:m.x,y:m.y-m.r-16,t:'Auuuu!',c:'#ffcc80',life:1});const k=mkMonster(m.type,m.lvl,m.x+rnd(-60,60),m.y+rnd(-60,60));if(canMove(k.x,k.y,k.cr)){k.aggro=true;k.howled=1;k.summoned=true;G.mons.push(k);}}}
 if(m.skCd>0||m.st)return;
 if(sk.indexOf('aura')>=0&&d<130){P.slow=Math.max(P.slow||0,.4);}
 const opts=sk.filter(k=>(k==='leap'&&d>70&&d<230)||(k==='web'&&d<300)||(k==='pull'&&d>90&&d<300)||(k==='blink'&&d>60&&d<320)||(k==='root'&&d<200)||(k==='net'&&d<260)||(k==='scream'&&d<220)||(k==='raise'&&d<300&&G.mons.filter(q=>q.summoner===m&&!q.dead).length<3));if(!opts.length)return;const a=pick(opts);
 if(a==='root'){G.teles.push({x:P.x,y:P.y,r:38,t:.85,max:.85,dmg:m.dmg*.4,lvl:m.lvl,c:'90,200,70',type:'phys',root:1.4});m.skCd=rnd(4,6);m.swing=.3;return;}
 if(a==='net'){shoot(m,dx,dy,{c:'#d8c8a0',spd:300,kind:'net',mul:.2,root:1,net:1});m.skCd=rnd(5,7);m.swing=.25;return;}
 if(a==='scream'){G.teles.push({x:m.x,y:m.y,r:150,t:.9,max:.9,dmg:m.dmg*.5,lvl:m.lvl,c:'190,160,255',type:'magic',slow:1,ring:1});m.skCd=rnd(6,8);return;}
 if(a==='raise'){for(let i=0;i<2;i++){const k=mkMonster(pick(['skeleton','zombie']),Math.max(1,m.lvl-1),m.x+rnd(-50,50),m.y+rnd(-50,50));if(canMove(k.x,k.y,k.cr)){k.aggro=true;k.summoned=true;k.summoner=m;G.mons.push(k);for(let j=0;j<8;j++)G.parts.push({x:k.x,y:k.y,z:4,vx:rnd(-50,50),vy:-60,life:.5,c:'#7a5aa0'});}}m.skCd=rnd(7,9);return;}
 if(a==='leap'){m.st='wind';m.stT=.45;m.ddx=dx/d;m.ddy=dy/d;m.skCd=rnd(3,5);}
 else if(a==='web'){shoot(m,dx,dy,{c:'#e8e8f0',spd:260,kind:'web',mul:.4,slow:1});m.skCd=rnd(4,6);m.swing=.25;}
 else if(a==='pull'){shoot(m,dx,dy,{c:m.t.vamp?'#c0102a':'#6a8a3a',spd:330,kind:'hook',mul:.5,pull:m});m.skCd=rnd(5,7);m.swing=.25;}
 else if(a==='blink'){m.st='blink';m.stT=.45;m.skCd=rnd(5,8);}}
function bossAbility(m,dt,d){if(!m.enraged&&m.hp<m.maxhp*.5&&m.boss!=='mini'){m.enraged=true;m.spd*=1.2;sfx('horn');G.toast(`🔥 ${m.name} gerät in Raserei!`,'#ff6e6e',true);for(let i=0;i<14;i++)G.parts.push({x:m.x,y:m.y,z:20,vx:rnd(-160,160),vy:rnd(-160,160),life:.6,c:'#ff4a2a'});}
 m.abT-=dt*(m.enraged?1.35:1);if(m.abT>0||d>340||m.st)return;const ab=m.B.abil,a=ab[m.abI++%ab.length],dr=m.boss==='dragon';m.abT=dr?2.6:3.6;
 if(a==='leap'){m.st='leap';m.stT=1.1;m.lx=P.x;m.ly=P.y;m.sx0=m.x;m.sy0=m.y;G.teles.push({x:P.x,y:P.y,r:Math.max(60,m.r*2.2),t:1.1,max:1.1,dmg:m.dmg*1.5,lvl:m.lvl,c:'255,90,40',type:'phys'});return;}
 if(a==='combo'){const ux=(P.x-m.x)/(d||1),uy=(P.y-m.y)/(d||1);for(let i=0;i<3;i++){const dd=Math.min(d,40+i*38);G.teles.push({x:m.x+ux*dd,y:m.y+uy*dd,r:48+i*6,t:.75+i*.38,max:.75+i*.38,dmg:m.dmg*.9,lvl:m.lvl,c:'255,60,60',type:'phys'});}return;}
 if(a==='sweep'){G.teles.push({x:m.x,y:m.y,r:Math.max(110,m.r*3.6),t:1.25,max:1.25,dmg:m.dmg*1.2,lvl:m.lvl,c:'255,160,40',type:'phys',ring:1});return;}
 if(a==='slam')G.teles.push({x:P.x,y:P.y,r:dr?82:64,t:1.05,max:1.05,dmg:m.dmg*1.4,lvl:m.lvl,c:dr?'255,130,0':'255,50,50',type:'phys'});
 else if(a==='fire'){for(let i=0;i<3;i++){const ox=i?rnd(-95,95):0,oy=i?rnd(-95,95):0;G.teles.push({x:P.x+ox,y:P.y+oy,r:72,t:1.1+i*.18,max:1.1+i*.18,dmg:m.dmg*1.25,lvl:m.lvl,c:'255,130,0',type:'magic',burn:1});}}
 else if(a==='volley'){const n=dr?14:10,col=dr||m.heads?'#ff7a1a':(m.B.poison?'#9cff3b':(m.t.chill?'#9fe3ff':'#c77dff'));for(let i=0;i<n;i++){const an=i/n*6.283+m.anim;shoot(m,Math.cos(an),Math.sin(an),{c:col,spd:dr?230:190,kind:'orb',mul:.7,poison:m.B.poison,burn:dr||m.heads?1:0,chill:m.t.chill});}}
 else if(a==='summon'){const kids=G.mons.filter(k=>k.parent===m&&!k.dead).length;if(kids<4)for(let i=0;i<2;i++){const k=mkMonster(m.B.minion||m.type,Math.max(1,m.lvl-2),m.x+rnd(-50,50),m.y+rnd(-50,50));if(!canMove(k.x,k.y,k.cr)){k.x=m.x;k.y=m.y;}k.parent=m;k.aggro=true;k.provoked=true;k.passive=false;k.summoned=true;k.room=m.room;G.mons.push(k);}}}
Object.assign(G,{attack,dodge});
// ===================== Spawns =====================
// Spawns nur im Umkreis des Spielers; weniger Monster; Energiesparmodus außerhalb der Sichtweite
G.simR=()=>{const rd=G.settings.rd;const v=rd&&rd!=='auto'&&rd!=='0'?+rd:40;return TILE*Math.max(16,Math.min(40,v*.8));};
function spawnTick(dt){spawnT-=dt;if(spawnT>0)return;spawnT=1.8;
 G.mons=G.mons.filter(m=>!m.dead&&(m.boss==='dragon'||m.boss&&Math.hypot(m.x-P.x,m.y-P.y)<TILE*40||Math.hypot(m.x-P.x,m.y-P.y)<TILE*34));if(G.room)return;
 if(G.mons.filter(m=>!m.boss&&!m.passive).length>=(G.dayInfo().night?8:6))return;
 const ptx=P.x/TILE,pty=P.y/TILE;
 for(let i=0;i<10;i++){const a=Math.random()*6.283,d=rnd(13,26);const tx=Math.floor(ptx+Math.cos(a)*d),ty=Math.floor(pty+Math.sin(a)*d);
  if(G.mons.some(m=>!m.dead&&Math.hypot(m.x-(tx+.5)*TILE,m.y-(ty+.5)*TILE)<TILE*7))continue;
  if(tx<2||ty<2||tx>=WW-2||ty>=H-2||!walkTile(tx,ty)||dV(tx,ty)<RV+9||townAt(tx,ty)||TOWNS.some(t=>Math.hypot(tx-t.x,ty-t.y)<t.r+6)||Math.hypot(tx-LAIR.x,ty-LAIR.y)<15||TOWNS.some(t=>Math.hypot(tx-t.x,ty-t.y)<t.r+4)||BUILD.some(b=>b.wild&&Math.abs(tx-b.x-2)<5&&Math.abs(ty-b.y-1)<5))continue;
  const lvl=Math.max(1,zoneLevel(tx,ty)+rint(-1,1));const di=G.dayInfo();let key;if(di.night&&Math.random()<.55){const NL=['zombie','zombie','skeleton','spider','bat','shadowhound','wisp','banshee'];if(lvl>=8)NL.push('reaper','necro');if(lvl>=10)NL.push('vampire');if(di.full)NL.push('werewolf','werewolf','werewolf');key=pick(NL);}else key=pickType(tx,ty,lvl);const t=MT[key];const L=t.night?lvl:(t.rare?t.lv[0]:clamp(lvl,t.lv[0],t.lv[1]));const n=1+(t.pack&&Math.random()<.5?rint(1,Math.min(2,t.pack)):0);
  for(let k=0;k<n;k++){const x=(tx+.5)*TILE+(k?rnd(-30,30):0),y=(ty+.5)*TILE+(k?rnd(-30,30):0);if(k&&!canMove(x,y,10))continue;G.mons.push(mkMonster(key,L,x,y));}break;}}
function spawnBoss(){const ptx=P.x/TILE,pty=P.y/TILE,zl=zoneLevel(Math.floor(ptx),Math.floor(pty));if(zl<1)return false;const bl=BL[biome(ptx,pty)];
 if(G.dayInfo().night&&zl>=12&&Math.random()<.35){for(let i=0;i<20;i++){const a=Math.random()*6.283,d=rnd(7,11);const tx=Math.floor(ptx+Math.cos(a)*d),ty=Math.floor(pty+Math.sin(a)*d);if(!walkTile(tx,ty)||townAt(tx,ty)||dV(tx,ty)<RV+2)continue;const m=mkBoss('vampirelord',clamp(Math.min(zl+1,P.level+2),12,30),(tx+.5)*TILE,(ty+.5)*TILE);G.mons.push(m);sfx('horn');G.toast(`🦇 ${m.name} erhebt sich aus der Nacht! (Stufe ${m.lvl})`,'#ff6e6e',true);return true;}}
 let c=Object.keys(BOSSES).filter(k=>!BOSSES[k].fixed&&BOSSES[k].b.indexOf(bl)>=0&&zl>=BOSSES[k].lv[0]-1&&zl<=BOSSES[k].lv[1]);if(!c.length)c=Object.keys(BOSSES).filter(k=>!BOSSES[k].fixed&&BOSSES[k].b.indexOf(bl)>=0);if(!c.length)return false;const key=pick(c);
 for(let i=0;i<25;i++){const a=Math.random()*6.283,d=rnd(7,11);const tx=Math.floor(ptx+Math.cos(a)*d),ty=Math.floor(pty+Math.sin(a)*d);
  if(tx>=WW-2||!walkTile(tx,ty)||dV(tx,ty)<RV+14||townAt(tx,ty)||TOWNS.some(t=>Math.hypot(tx-t.x,ty-t.y)<t.r+12))continue;const m=mkBoss(key,clamp(Math.min(zl+1,P.level+2),1,BOSSES[key].lv[1]),(tx+.5)*TILE,(ty+.5)*TILE);G.mons.push(m);sfx('horn');sfx('aggro',{type:'boss'});G.toast(`⚠ Ein Boss ist erschienen: ${m.name} (Stufe ${m.lvl})`,'#ff6e6e',true);return true;}return false;}
G.spawnBoss=spawnBoss;
const FIX=[{key:'grukk',at:CAMP,lv:()=>qd('grukk'),cond:()=>P.main>3||(P.main===3&&P.macc)},{key:'bonelord',at:CRYPT,lv:()=>qd('morvax'),cond:()=>P.main>4||(P.main===4&&P.macc)},{key:'dragon',at:LAIR,lv:()=>qd('dragon'),cond:()=>P.main>=6&&(P.frost||P.main>6)},{key:'schnitter',at:{x:ASHVALE.x,y:ASHVALE.y-4},lv:()=>qd('schnitter'),cond:()=>P.main>5||(P.main===5&&P.macc)},{key:'eldtree',at:{x:151,y:510},lv:()=>qd('eldtree'),cond:()=>P.main>5||(P.main===5&&P.macc)},{key:'sandking',at:{x:529,y:546},lv:()=>qd('sandking'),cond:()=>P.main>5||(P.main===5&&P.macc)}];
function fixedTick(dt){for(const f of FIX){G.fixT[f.key]-=dt;if(G.fixT[f.key]>0||!f.cond())continue;if(G.mons.some(m=>m.boss===f.key&&!m.dead))continue;const px=(f.at.x+.5)*TILE,py=(f.at.y+.5)*TILE;if(Math.hypot(P.x-px,P.y-py)>TILE*40)continue;
 const m=mkBoss(f.key,f.lv(),px,f.key==='dragon'?py-TILE*1:py+TILE*1.5);G.mons.push(m);if(BOSSES[f.key].herald)G.toast(`☠ ${m.name} erwartet dich! (Stufe ${m.lvl})`,'#ff8a65',true);if(f.key==='dragon')sfx('aggro',{type:'dragon'});else{for(let i=0;i<3;i++){const k=mkMonster(f.key==='grukk'?pick(['goblin','goblin','shaman']):f.key==='eldtree'?pick(['pilzling','treant','thornvine']):f.key==='sandking'?pick(['mummy','scorpion']):pick(['skeleton','skarcher']),Math.max(1,m.lvl-2),m.x+rnd(-90,90),m.y+rnd(-90,90));if(canMove(k.x,k.y,k.cr))G.mons.push(k);}}}}

// ===================== Quests & Story =====================
const npcById=id=>NPCS.find(n=>n.id===id);G.npcById=npcById;
const CHAP=['Kapitel 1: Erwachen','Kapitel 1: Audienz','Kapitel 2: Bewährung','Kapitel 3: Spuren im Finsterwald','Kapitel 4: Der Siegelstein','Kapitel 5: Die drei Herolde','Kapitel 6: Ignarok','Kapitel 6: Die Prinzessin','Kapitel 7: Heimkehr','Epilog'];
G.chapter=()=>CHAP[Math.min(P.main,9)];
G.objective=function(){const L=P.level;const tp=(x,y)=>({x:(x+.5)*TILE,y:(y+.5)*TILE});const N=id=>{const n=npcById(id);if(n.loc&&G.room!==n.loc)return{x:n.loc.ent.x,y:n.loc.ent.y-10};return{x:n.x,y:n.y};};
 switch(P.main){
 case 0:return{t:'Sprich mit Heilerin Mara',to:N('mara')};
 case 1:return{t:'Geh zur Burg und sprich mit Fürst Aldric',to:N('aldric')};
 case 2:return P.mN>=qd('prove')?{t:'Kehre zu Fürst Aldric zurück',to:N('aldric')}:{t:`Besiege Monster vor den Mauern: ${P.mN}/${qd('prove')}`,to:null};
 case 3:if(!P.macc)return L<qd('lvG')?{t:`Erreiche Stufe ${qd('lvG')}, dann zu Fürst Aldric`,to:null}:{t:'Sprich mit Fürst Aldric',to:N('aldric')};
  return P.mflag?{t:'Bring die Karte zu Fürst Aldric',to:N('aldric')}:{t:'Besiege Goblinhäuptling Grukk im Goblinlager (Finsterwald, Osten)',to:tp(CAMP.x,CAMP.y)};
 case 4:if(!P.macc)return L<qd('lvM')?{t:`Erreiche Stufe ${qd('lvM')}, dann zu Fürst Aldric`,to:null}:{t:'Sprich mit Fürst Aldric',to:N('aldric')};
  return P.mflag?{t:'Bring den Siegelstein zu Fürst Aldric',to:N('aldric')}:{t:'Besiege Knochenfürst Morvax in der Krypta (Nebelmoor, Westen)',to:tp(CRYPT.x,CRYPT.y)};
 case 5:{if(!P.macc)return L<qd('lvH')?{t:`Erreiche Stufe ${qd('lvH')} und sprich mit Gunnar in der Taverne`,to:N('gunnar')}:{t:'Sprich mit Drachenjäger Gunnar in der Taverne',to:N('gunnar')};
  const sh=P.shards||{},n=Object.keys(sh).length;if(n>=3)return L<qd('lvD')?{t:`Alle Splitter! Erreiche Stufe ${qd('lvD')} und bring sie Gunnar`,to:N('gunnar')}:{t:'Bring die drei Glutsiegel-Splitter zu Gunnar',to:N('gunnar')};
  const H=[['schnitter','Vael, den Schnitter, in den Ruinen von Aschental',ASHVALE.x,ASHVALE.y-4],['eldtree','Mortholz, den Baumhirten, an der Abtei im Schattenwald',151,510],['sandking','Khepri, den Sandkönig, am Grab in den Dünen',529,546]].filter(h=>!sh[h[0]]);
  const near=H.reduce((a,h)=>Math.hypot(h[2]*TILE-P.x,h[3]*TILE-P.y)<Math.hypot(a[2]*TILE-P.x,a[3]*TILE-P.y)?h:a);return{t:`Glutsiegel ${n}/3 – besiege ${near[1]}`,to:tp(near[2],near[3])};}
 case 6:return{t:'Erschlage Ignarok in der Drachenfestung auf dem Goldberg (Aschenberge, Nordosten)',to:tp(LAIR.x,LAIR.y)};
 case 7:return{t:'Sprich mit Prinzessin Elara im Drachenhort',to:N('elara')};
 case 8:return{t:'Kehre zu Fürst Aldric in die Burg zurück',to:N('aldric')};
 default:return{t:'Die Geschichte ist erzählt. Jage Bosse und mythische Beute!',to:null};}};
G.storyContext=function(){const o=G.objective();const q=P.q;return `${G.chapter()}. Aktuelles Ziel des Spielers: ${o.t}. Spielerstufe ${P.level}, Schwierigkeit ${G.D().n}. `+(P.main>=4?'Grukk ist besiegt und die Karte gefunden. ':'')+(P.main>=5?'Morvax ist besiegt und der Siegelstein gefunden. ':'')+(P.main>=6?'Gunnar hat das Aschensiegel gebrochen. ':'')+(P.main>=7?'Ignarok ist tot! ':'')+(P.main>=8?'Elara ist wieder in der Burg. ':'')+(q.bread==='done'?'Der Spieler hat Bernd mit Weizen geholfen. ':'')+(q.wolves==='done'?'Der Spieler hat Hildas Wolfsplage beendet. ':'');};
G.npcMark=function(n){{const em=G.extraMark&&G.extraMark(n);if(em)return em;if(n.lie)return '';}const sm0=G.sqMark(n);if(sm0==='?')return '?';const r0=npcMark0(n);return r0||sm0;};
const npcMark0=function(n){const q=P.q,L=P.level;switch(n.id){
 case'mara':return P.main===0?'!':'';
 case'ragna':return !q.draugr?(L>=15?'!':'.'):(q.draugr==='active'&&q.draugrN>=qd('draugr')?'?':'');
 case'aldric':return(P.main===1||(P.main===2&&P.mN>=qd('prove'))||(P.main===3&&(!P.macc&&L>=qd('lvG')||P.mflag))||(P.main===4&&(!P.macc&&L>=qd('lvM')||P.mflag))||P.main===8)?'?':(P.main===3||P.main===4)&&!P.macc?'.':'';
 case'gunnar':return P.main===5?(!P.macc?(L>=qd('lvH')?'!':'.'):(Object.keys(P.shards||{}).length>=3?(L>=qd('lvD')?'?':'.'):'')):'';
 case'elara':return P.main===7?'?':'';
 case'bernd':return !q.bread?'!':(q.bread==='active'&&countItem('wheat')>=5?'?':'');
 case'hilda':return !q.wolves?(L>=3?'!':'.'):(q.wolves==='active'&&q.wolfN>=qd('wolves')?'?':'');
 case'otto':return !q.ears?(L>=5?'!':'.'):(q.ears==='active'&&countItem('ear')>=qd('ears')?'?':'');}return '';};
const SHOPS={greta:{n:'Gretas Marktstand',items:['potion','mpotion','bread','carrot','seed','hseed','arrow','bolt']},
 sven:{n:'Svens Handelshaus',items:['potion','potion2','mpotion','bread','carrot','arrow','bolt']},
 brann:{n:'Feldscher Brann',items:['potion','potion2','mpotion','arrow','bolt']},
 hilda:{n:'Hildas Schmiede',items:['arrow','bolt'],smith:1}};Object.assign(SHOPS,SHOP_ADD);G.SHOPS=SHOPS;
const SQ={
 berta:{npc:'berta',n:'Bertas Ehering',lv:6,fetch:'banditcave',item:'Bertas Ehering',give:'Banditen haben mir den Ehering meines Mannes gestohlen … Sie hausen in einer Höhle in ihrem Lager im Osten der Sonnenwiesen, am Rand des Finsterwalds. Bitte bring ihn mir zurück.',done:'Mein Ring! Den Göttern sei Dank. Nimm das, es ist nicht viel … aber von Herzen.',rw:{gold:180,xp:700,it:['ring',2]}},
 durin:{npc:'durin',n:'Der Ahnenhammer',lv:18,fetch:'dwarf',item:'Durins Ahnenhammer',give:'Die Zwergenbinge im Graukamm-Gebirge, östlich von hier … Grauzwerge und Golems haben sie überrannt. Der Hammer meines Vaters liegt dort in einer Truhe. Hol ihn, und ich schmiede dir etwas Feines.',done:'Bei meinem Bart! Vaters Hammer! Hier, nimm diesen – ich hab ihn für dich neu geschärft.',rw:{gold:300,xp:2400,it:['mace',3,'Runenhammer der Binge']}},
 samira:{npc:'samira',n:'Das Skarabäus-Siegel',lv:17,fetch:'pyramid',item:'Skarabäus-Siegel',give:'Im Grab des Sandkönigs, südöstlich meiner Stadt, ruht das Skarabäus-Siegel meiner Ahnen. Seit es dort liegt, wandeln die Toten. Bring es mir, und Sandfeste wird dich ehren.',done:'Das Siegel … die Wüste atmet auf. Nimm dieses Amulett meiner Mutter.',rw:{gold:350,xp:2200,it:['amulet',3,'Amulett der Dünenfürstin']}},
 liv:{npc:'liv',n:'Brut im Finsterwald',lv:9,kill:'spider',cnt:12,give:'Die Riesenspinnen fressen sich durch meinen Wald. Erlege zwölf von ihnen. Die Spinnenhöhle liegt nördlich von Waldheim.',done:'Gute Jagd! Dieser Bogen ist aus meiner eigenen Eibe.',rw:{gold:160,xp:900,it:['longbow',2,'Livs Eibenbogen']}},
 aldwin:{npc:'aldwin',n:'Die Moorleichen',lv:11,kill:'ghoul',cnt:10,give:'Die Moorleichen steigen jede Nacht näher an Moorbruck heran. Schick zehn von ihnen zurück in den Schlamm.',done:'Ruhe im Moor … für eine Weile. Nimm diese Robe, sie hält Gift fern.',rw:{gold:200,xp:1300,it:['heiler',2]}},
 anselm:{npc:'anselm',n:'Die verschollene Chronik',lv:16,fetch:'abbey',item:'Chronik von Eldmar',give:'In der Ruine der Abtei im Schattenwald, südwestlich, ruht die Chronik von Eldmar. Darin steht, wie Ignarok einst gebannt wurde. Bring sie mir.',done:'Die Chronik! Hier steht es … Ignarok fürchtet Licht. Nimm dieses heilige Buch.',rw:{gold:200,xp:2000,it:['tome_light',3,'Psalter der Morgenröte']}},
 brann:{npc:'brann',n:'Welpenplage',lv:23,kill:'wyrmling',cnt:6,give:'Drachenwelpen nisten in den Aschenbergen. Erlege sechs, bevor sie groß werden.',done:'Sechs weniger! Hier, ein Harnisch aus Welpenschuppen.',rw:{gold:400,xp:3500,it:['ritter',3]}},
 wendla:{npc:'wendla',n:'Hexenwerk',lv:13,fetch:'witchhut',item:'Hexenkessel-Rezept',give:'Die Sumpfhexe in ihrer Kate im Süden stiehlt meine Rezepte! Hol mir mein Kesselbuch zurück.',done:'Kröte, Kraut … ja, alles da! Nimm diese Tränke.',rw:{gold:120,xp:1200,stack:['potion2',3]}}};
G.SQ=SQ;
function sqState(k){return (P.side&&P.side[k])||null;}
function sqDialog(n,d){for(const k in SQ){const q=SQ[k];if(q.npc!==n.id)continue;const st=sqState(k),B=(l,f,c)=>({l,f,c});
  if(!st){if(P.level<q.lv-2){d.b.push(B(`📜 ${q.n} (ab Stufe ${q.lv-2})`,()=>G.toast(`${n.short}: Komm wieder, wenn du stärker bist (Stufe ${q.lv-2}).`,'#ccc')));continue;}
   d.b.unshift(B(`📜 Auftrag: ${q.n}`,()=>{G.ui&&G.ui.showText&&G.ui.showText(n,q.give,[{l:'Ich übernehme das',f:()=>{P.side[k]={st:'active',c:0};QT(q.n);},c:1},{l:'Später',f:()=>{},c:1}]);},0));}
  else if(st.st==='active'){const ok=q.kill?st.c>=q.cnt:st.got;if(ok)d.b.unshift(B(`✔ ${q.n} abschließen`,()=>{st.st='done';DONE(q.n);G.ui&&G.ui.showText&&G.ui.showText(n,q.done,[]);P.gold+=Math.round(q.rw.gold*G.D().gold);gainXP(q.rw.xp);if(q.rw.it)give(lootItem(q.rw.it[0],Math.max(P.level,q.lv)+1,q.rw.it[1],{name:q.rw.it[2],src:n.name}));if(q.rw.stack)give(mkStack(q.rw.stack[0],q.rw.stack[1]));},0));
   else d.t=(q.kill?`${q.n}: ${st.c}/${q.cnt}. `:`Hast du ${q.item} schon? `)+d.t;}}return d;}
G.sideList=()=>{const L=[];for(const k in SQ){const st=sqState(k);if(!st||st.st!=='active')continue;const q=SQ[k];L.push(q.kill?`📜 ${q.n}: ${st.c}/${q.cnt}`:(st.got?`📜 ${q.n}: zurück zu ${npcById(q.npc).short}`:`📜 ${q.n}: finde „${q.item}“`));}return L;};
// Questbuch: strukturierte Liste (Haupt- + Nebenquests) mit Zielen
G.questLog=function(){const out={main:null,side:[],done:[]};const ob=G.objective();out.main={ch:G.chapter(),t:ob.t,to:ob.to};
 const q=P.q,bp=b=>b?{x:(b.door?b.door.tx+.5:b.x+b.w/2)*TILE,y:(b.door?b.door.ty+1:b.y+b.h)*TILE}:null;const nTo=id=>{const n=npcById(id);if(!n)return null;if(n.loc)return{x:n.loc.ent.x,y:n.loc.ent.y-10};return{x:n.x,y:n.y};};
 if(q.bread==='active')out.side.push({n:'Brot für den Bäcker',t:`Weizen ${G.countItem('wheat')}/5 – ernte oder kaufe Weizen`,to:G.countItem('wheat')>=5?nTo('bernd'):null,giver:'Bäcker Bernd'});
 if(q.wolves==='active')out.side.push({n:'Wolfsplage',t:`Wölfe erlegt: ${q.wolfN}/${G.qd('wolves')} – im Wald nördlich des Dorfes`,to:null,giver:'Jäger'});
 if(q.ears==='active')out.side.push({n:'Goblin-Ohren',t:`Ohren: ${G.countItem('ear')}/${G.qd('ears')} – Goblins hausen im Finsterwald im Osten (Goblinlager)`,to:{x:(CAMP.x-14.5)*TILE,y:(CAMP.y+.5)*TILE},giver:'Hauptmann'});
 for(const k in SQ){const st=sqState(k);if(!st)continue;const sq=SQ[k],gv=npcById(sq.npc);if(st.st==='done'){out.done.push(sq.n);continue;}if(st.st!=='active')continue;
  let t,to=null;if(sq.kill){t=st.c>=sq.cnt?`Erledigt (${st.c}/${sq.cnt}) – zurück zu ${gv.short}`:`${MT[sq.kill]?MT[sq.kill].n:sq.kill}: ${st.c}/${sq.cnt}`;if(st.c>=sq.cnt)to=nTo(sq.npc);}
  else if(st.got){t=`„${sq.item}“ gefunden – zurück zu ${gv.short}`;to=nTo(sq.npc);}else{t=`Finde „${sq.item}“`;const b=G.BUILD.find(b=>b.id===sq.fetch);to=bp(b);}
  out.side.push({n:sq.n,t,to,giver:gv?gv.name:'',info:sq.give});}
 return out;};
G.dirTo=function(to){if(!to)return '';const dx=to.x-P.x,dy=to.y-P.y,d=Math.hypot(dx,dy)/TILE;if(d<3)return 'hier';const a=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;const D=['N','NO','O','SO','S','SW','W','NW'][Math.round(a/45)%8];const ar=['↑','↗','→','↘','↓','↙','←','↖'][Math.round(a/45)%8];return `${ar} ${D} · ${Math.round(d)} m`;};
G.sqMark=n=>{for(const k in SQ){const q=SQ[k];if(q.npc!==n.id)continue;const st=sqState(k);if(!st&&P.level>=q.lv-2)return '!';if(st&&st.st==='active'&&(q.kill?st.c>=q.cnt:st.got))return '?';}return '';};
const QT=t=>{sfx('quest');G.toast('📜 Neue Quest: '+t,'#ffd54a',true);},DONE=t=>{sfx('quest');G.toast('✔ Quest abgeschlossen: '+t,'#ffd54a',true);};
const npcDialog0=function(n){const q=P.q,L=P.level,B=(l,f,c)=>({l,f,c});
 switch(n.id){
 case'mara':{if(P.main===0)return{t:'Du bist wach, den Göttern sei Dank! Ich fand dich vor drei Tagen am Flussufer, halb erfroren und ohne Erinnerung. Doch in deinen Augen brennt etwas … als hätten dich die Walküren selbst zurückgeschickt. Eichenhain braucht dich: Der Drache Ignarok hat Prinzessin Elara entführt – und seit seiner Rückkehr rieselt seine Asche über das Land. Sie vergiftet sogar die Tiere: Hasen, Keiler, Füchse … wer davon frisst, bekommt glühend rote Augen und greift alles an. Geh hinauf zur Burg und sprich mit Fürst Aldric.',b:[B('Ich gehe zur Burg',()=>{P.main=1;give(mkStack('potion',2));G.toast('📜 Hauptquest: Audienz beim Fürsten','#ffd54a',true);},1)]};
  const bb=[B('Heile mich',()=>{P.hp=G.S.maxhp;P.poison=null;P.burn=null;G.toast('❤ Vollständig geheilt','#ef9a9a');})];if(countItem('herb')>=3)bb.push(B('3 Heilkraut → Heiltrank',()=>{removeItem('herb',3);give(mkStack('potion',1));}));else bb.push(B('Heilkrautsamen (Geschenk)',()=>{if(q.maraSeed){G.toast('Mara: Pflanze die Samen nahe am Wasser.','#ccc');return;}q.maraSeed=1;give(mkStack('hseed',3));}));return{t:pick(['Komm zu mir, wann immer du verwundet bist. Innerhalb der Mauern heilen Wunden schneller.','Die Walküren warten auf dich, Ritter. Aber nicht heute.','Gift? Lass mich sehen … meine Kräuter helfen.']),b:bb};}
 case'aldric':{
  if(P.main===0)return{t:'Ein Fremder in meiner Burg? Die Heilerin Mara hat von dir erzählt. Ruh dich erst aus und sprich mit ihr.',b:[]};
  if(P.main===1)return{t:`Man nennt dich einen gefallenen Ritter? Mir ist gleich, woher du kommst, solange du ein Schwert führen kannst. Ignarok hat meine Tochter Elara geraubt. Bevor ich dir ihr Leben anvertraue, beweise dich: Erschlage ${qd('prove')} Kreaturen vor unseren Mauern.`,b:[B('Ich werde mich beweisen',()=>{P.main=2;P.mN=0;G.toast('📜 Hauptquest: Bewährung','#ffd54a',true);},1)]};
  if(P.main===2){if(P.mN>=qd('prove'))return{t:'Du kämpfst wie ein Ritter der alten Zeit. Nimm diese Klinge aus meiner Waffenkammer. Und höre: Mein Späher wurde im Finsterwald von Goblins überfallen. Er trug eine Karte zum Drachenhort bei sich.',b:[B('Bericht erstatten',()=>{P.main=3;P.macc=false;P.mflag=0;gainXP(250);give(genItem('weapon',Math.max(3,L+1),1,{kind:'sword'}));},0)]};
   return{t:`Du hast erst ${P.mN} von ${qd('prove')} Kreaturen erschlagen. Die Wildnis vor den Toren wartet.`,b:[]};}
  if(P.main===3){if(!P.macc){if(L<qd('lvG'))return{t:`Der Goblinhäuptling Grukk ist kein gewöhnlicher Gegner. Werde stärker, mindestens Stufe ${qd('lvG')}, dann sprechen wir weiter. Du bist Stufe ${L}.`,b:[]};
    return{t:'Grukk, der Goblinhäuptling, haust in einem Lager tief im Finsterwald, im Osten. Er hat die Karte meines Spähers. Hol sie mir!',b:[B('Ich hole die Karte',()=>{P.macc=true;P.mflag=0;G.toast('📜 Hauptquest: Spuren im Finsterwald','#ffd54a',true);},1)]};}
   if(P.mflag)return{t:'Die Karte! Bei allen Göttern … Der Weg zum Hort ist durch ein Aschensiegel versperrt. Nur der Siegelstein öffnet es. Und den hütet der Knochenfürst Morvax in seiner Krypta im Nebelmoor, westlich von hier.',b:[B('Karte übergeben',()=>{P.main=4;P.macc=false;P.mflag=0;gainXP(600);give(genItem('amulet',L+1,2));P.gold+=80;G.toast('+80 Gold','#ffd54a');},0)]};
   return{t:'Das Goblinlager liegt im Osten, im Finsterwald. Folge dem goldenen ★ im Kompass.',b:[]};}
  if(P.main===4){if(!P.macc){if(L<qd('lvM'))return{t:`Morvax hat ganze Heere ins Grab gebracht. Werde stärker, mindestens Stufe ${qd('lvM')}. Du bist Stufe ${L}.`,b:[]};
    return{t:'Die Krypta des Knochenfürsten liegt im Nebelmoor, weit im Westen. Bring mir den Siegelstein!',b:[B('Auf ins Nebelmoor',()=>{P.macc=true;P.mflag=0;G.toast('📜 Hauptquest: Der Siegelstein','#ffd54a',true);},1)]};}
   if(P.mflag)return{t:'Der Siegelstein … er glüht wie Kohle. Nur einer weiß, wie man ihn gegen das Aschensiegel einsetzt: Gunnar, der Drachenjäger. Er sitzt in der Taverne.',b:[B('Zu Gunnar',()=>{P.main=5;P.macc=false;P.mflag=0;gainXP(1000);P.gold+=150;G.toast('+150 Gold','#ffd54a');},1)]};
   return{t:'Die Krypta liegt im Nebelmoor im Westen. Folge dem goldenen ★ im Kompass.',b:[]};}
  if(P.main<8)return{t:P.main===5?'Gunnar wartet in der Taverne „Zum Goldenen Krug“.':'Bring mir meine Tochter zurück, Ritter. Ich flehe dich an.',b:[]};
  if(P.main===8)return{t:'Elara ist zurück … Du hast mir alles zurückgegeben, was ich verloren glaubte. Ganz Eldmar wird deinen Namen kennen. Nimm diese Klinge meiner Ahnen und den Dank eines Vaters.',b:[B('Es war mir eine Ehre',()=>{P.main=9;gainXP(3000);P.gold+=1000;give(genItem('weapon',qd('dragon')+2,4,{name:'Eichenhains Erbe',kind:'sword',boss:'dragon',f:'melee'}));G.toast('+1000 Gold','#ffd54a');G.ui&&G.ui.cutscene&&G.ui.cutscene('outro');},1)]};
  return{t:'Eichenhain steht für immer in deiner Schuld, Held. Die Tore meiner Burg stehen dir offen.',b:[]};}
 case'gunnar':{
  if(P.main<5)return{t:pick(['Hmpf. Noch ein Grünschnabel, der Drachen jagen will? Ignarok hat meinen Bruder geholt. Komm wieder, wenn du einen Weg zum Hort hast.','Met. Feuer. Rache. Mehr brauch ich nicht.']),b:[]};
  if(P.main===5&&!P.macc){if(L<qd('lvH'))return{t:`Der Siegelstein, ha! Aber sieh dich an, Stufe ${L}. Komm wieder ab Stufe ${qd('lvH')}, dann erzähl ich dir, was du wirklich brauchst.`,b:[]};
   return{t:'Der Siegelstein allein reicht nicht. Das Aschensiegel nährt sich aus drei Glutsiegeln, getragen von Ignaroks Herolden. Vael, der Schnitter, spukt in den Ruinen von Aschental, dem Dorf, das der Drache zuerst verbrannt hat. Mortholz, ein uralter Baumhirte, verdorben von Drachenfeuer, wacht an der Abtei im Schattenwald. Und Khepri, der Sandkönig, ist vor seinem Grab in den Dünen erwacht. Bring mir ihre drei Splitter.',b:[B('Ich jage die Herolde',()=>{P.macc=true;P.shards={};G.toast('📜 Hauptquest: Die drei Herolde','#ffd54a',true);},1)]};}
  if(P.main===5){const n=Object.keys(P.shards||{}).length;if(n<3)return{t:`${n} von 3 Glutsiegel-Splittern. Die Herolde fallen nicht leicht – nutz deine Rolle, wenn sie ausholen. Und sie kehren zurück … ihre Beute ist es wert, sie öfter zu jagen.`,b:[]};
   if(L<qd('lvD'))return{t:`Alle drei Splitter! Aber gegen Ignarok selbst bist du mit Stufe ${L} noch Futter. Komm ab Stufe ${qd('lvD')} wieder.`,b:[]};
   return{t:'Gib her. Ich weiß, wie man das Siegel bricht: Stein und Blut. Ignaroks Festung liegt auf dem Goldberg im Nordosten. Hier, nimm meinen Glücksbringer, er hat mich durch drei Drachenjagden gebracht. Das Siegel ist gebrochen, der Weg zum Hort ist offen. Tu, was ich nicht konnte.',b:[B('Für deinen Bruder',()=>{P.main=6;P.barrier=true;G.flags.barrier=true;give(genItem('amulet',L+1,3,{name:'Gunnars Glücksbringer',f:'luck'}));G.toast('🔥 Das Aschensiegel ist gebrochen!','#ff8a50',true);},1)]};}
  if(P.main===6)return{t:'Ignarok schläft in seiner Festung auf dem Goldberg, ganz im Nordosten der Aschenberge. Der Außenposten Glutwacht ist der letzte sichere Ort davor, aktiviere dort den Wegschrein. Weiche den glühenden Kreisen aus und nutze deine Rolle (🌀)! Und nimm Heiltränke mit.',b:[]};
  return{t:'Du hast es geschafft. Mein Bruder kann nun in Walhall ruhen. Und du eines Tages auch.',b:[]};}
 case'elara':{if(P.main===7)return{t:'Du hast ihn besiegt?! Ich dachte schon, ich müsste mich selbst durch die Aschenberge kämpfen. Ich kenne einen geheimen Pfad nach Hause. Wir treffen uns auf der Burg, beeil dich!',b:[B('Bis gleich auf der Burg',()=>{P.main=8;placeElara();G.toast('📜 Hauptquest: Heimkehr','#ffd54a',true);},1)]};
  return{t:'Ohne dich wäre ich noch immer in diesem Hort. Danke, Ritter.',b:[]};}
 case'bernd':{const w=countItem('wheat');
  if(!q.bread)return{t:'Grüß dich! Seit der Drache da war, ist mein Weizen verbrannt, und ohne Mehl gibt es kein Brot! Hier hast du 5 Weizensaat. Pflanze sie auf den Äckern vor meiner Backstube oder auf Gras nahe am Wasser – höchstens vier Schritte entfernt, wie es die Alten lehrten. Ernte die goldenen Ähren und bring mir 5 Weizen.',b:[B('Ich helfe dir!',()=>{q.bread='active';give(mkStack('seed',5));QT('Brot für den Bäcker');},1)]};
  if(q.bread==='active'){if(w>=5)return{t:'Was für prächtiger Weizen! Gib her, dann backe ich dir etwas Feines.',b:[B('5 Weizen abgeben',()=>{removeItem('wheat',5);q.bread='done';gainXP(150);give(mkStack('bread',5));give(genItem(pick(['ring','amulet','boots']),Math.max(2,L),1));DONE('Brot für den Bäcker');})]};
   let grow=0;for(const f of G.farm.values())if(f.c==='wheat')grow++;const have=countItem('seed')+grow+w;const bb=[];if(have<5)bb.push(B('Mehr Saat, bitte',()=>give(mkStack('seed',5-have))));
   return{t:`Du hast ${w}/5 Weizen. Stell dich mit Saat vor ein Ackerfeld oder auf Gras nahe Wasser und drück ✋. Weizen wächst langsam in vier Stufen. Ist er golden, erntest du ihn mit ✋ und bekommst auch neue Saat.`,b:bb};}
  const bb=[];if(w>=3)bb.push(B('3 Weizen → 2 Brot',()=>{removeItem('wheat',3);give(mkStack('bread',2));}));bb.push(B('Saat holen',()=>give(mkStack('seed',5))));
  return{t:'Dein Weizen war der beste im ganzen Land! Bring mir jederzeit 3 Weizen, dann backe ich dir 2 frische Brote.',b:bb};}
 case'hilda':{const need=qd('wolves');
  if(!q.wolves){if(L<3)return{t:`Ich bin Hilda, die Schmiedin. Arbeit hätte ich, aber du bist noch grün hinter den Ohren. Komm ab Stufe 3 wieder. (Du bist Stufe ${L}.)`,b:[]};
   return{t:`Wölfe reißen jede Nacht unsere Schafe! Draußen in den Sonnenwiesen jagen sie im Rudel. Erlege ${need} Wölfe, und ich schmiede dir eine seltene Waffe.`,b:[B('Ich jage sie!',()=>{q.wolves='active';q.wolfN=0;QT('Wolfsplage');},1)]};}
  if(q.wolves==='active'){if(q.wolfN>=need)return{t:'Ha! Du bist ein echter Jäger. Hier, frisch aus der Esse und noch warm.',b:[B('Belohnung nehmen',()=>{q.wolves='done';gainXP(450);give(genItem('weapon',L+2,2));DONE('Wolfsplage');})]};
   return{t:`Du hast ${q.wolfN}/${need} Wölfe erlegt. Pass auf, sie kommen im Rudel!`,b:[]};}
  return{t:'Meine Esse glüht für dich, Held. Bring mir Geschichten von deinen Kämpfen.',b:[]};}
 case'otto':{const need=qd('ears');
  if(!q.ears){if(L<5)return{t:`Halt! Die Goblins werden immer frecher, aber dafür bist du zu unerfahren. Komm ab Stufe 5 wieder. (Du bist Stufe ${L}.)`,b:[]};
   return{t:`Goblins überfallen unsere Händler! Bring mir ${need} Goblin-Ohren als Beweis, dann bekommst du ein Stück aus der Waffenkammer. Goblins findest du im Finsterwald.`,b:[B('Wird erledigt!',()=>{q.ears='active';QT('Goblin-Ohren');},1)]};}
  if(q.ears==='active'){const e=countItem('ear');if(e>=need)return{t:'Ha, die Goblins werden es sich zweimal überlegen! Hier, eine Rüstung aus der Waffenkammer.',b:[B('Ohren abgeben',()=>{removeItem('ear',need);q.ears='done';gainXP(800);give(genItem(pick(['helm','chest','legs','boots']),L+2,2));DONE('Goblin-Ohren');})]};
   return{t:`Du hast ${e}/${need} Goblin-Ohren. Nicht jeder Goblin lässt eins fallen, also bleib dran!`,b:[]};}
  return{t:'Dank dir ist die Straße wieder sicherer.',b:[]};}
 case'ragna':{const need=qd('draugr');
  if(!q.draugr){if(L<15)return{t:`Skål, Fremder. Die Draugr erheben sich aus ihren Hügelgräbern und bedrängen Frosthafen. Doch du bist erst Stufe ${L}. Komm wieder ab Stufe 15, dann reden wir.`,b:[]};
   return{t:`Du hast den Blick eines Kriegers. Die Draugr, untote Krieger aus alter Zeit, ziehen durch die Frostlande. Erschlage ${need} von ihnen, und ich gebe dir eine Rüstung aus der Schatzkammer meiner Ahnen.`,b:[B('Für Frosthafen!',()=>{q.draugr='active';q.draugrN=0;QT('Draugr-Plage');},1)]};}
  if(q.draugr==='active'){if(q.draugrN>=need)return{t:'Die Toten ruhen wieder. Nimm diese Rüstung, sie hat schon meinem Großvater das Leben gerettet.',b:[B('Belohnung nehmen',()=>{q.draugr='done';gainXP(2500);give(genItem(pick(SLOTS4),L+2,3,{set:'waechter'}));DONE('Draugr-Plage');})]};
   return{t:`${q.draugrN}/${need} Draugr erschlagen. Sie wandern zwischen den verschneiten Grabhügeln.`,b:[]};}
  return{t:'Frosthafen wird dich nicht vergessen. Skål!',b:[]};}
 case'sven':return{t:`Hah, ein Kunde! Du hast ${P.gold} Gold. Hier oben braucht man Kraft, und gute Ware!`,b:[]};
 case'brann':return{t:'Der Atem der Drachenwelpen brennt durch jede Rüstung. Lass mich deine Wunden versorgen, bevor du weiterziehst.',b:[B('Heile mich',()=>{P.hp=G.S.maxhp;P.poison=null;P.burn=null;G.toast('❤ Vollständig geheilt','#ef9a9a');}),]};
 case'greta':return{t:`Willkommen an meinem Stand! Du hast ${P.gold} Gold. Was darf es sein?`,b:[]};
 }
 return{t:pick(n.greet||['Sei gegrüßt.']),b:[]};};
G.npcDialog=function(n){const d=(G.extraDialog&&G.extraDialog(n))||npcDialog0(n);d.b=d.b||[];sqDialog(n,d);const sh=SHOPS[n.id];if(sh){d.b=d.b||[];if(sh.smith){d.b.unshift({l:'⚒ Schmiede: Umschmieden',f:()=>G.ui&&G.ui.openShop(n.id,'forge'),c:1});d.b.unshift({l:'⚔ Ausrüstung kaufen',f:()=>G.ui&&G.ui.openShop(n.id,'gear'),c:1});}d.b.unshift({l:'🛒 Handeln (Kaufen & Verkaufen)',f:()=>G.ui&&G.ui.openShop(n.id,'buy'),c:1});}return d;};


// ===================== Update =====================
function enterRoom(r){G.mons=G.mons.filter(m=>m.boss==='dragon');G.proj=[];G.teles=[];G.room=r;P.x=(r.door.tx+.5)*TILE;P.y=(r.door.ty-.5)*TILE;P.prevX=null;P.fx=0;P.fy=-1;G.enterT=.7;sfx('door');
 if(r.dungeon){for(const c of r.chests)if(c.opened&&Date.now()-c.at>240000)c.opened=false;const b=r.b;const ks=Object.keys(P.kills||{}).filter(k=>MT[k]&&!MT[k].passive);const key=ks.length?pick(ks):b.def;const m=mkMini(key,r.lvl+1,(r.x0+r.w/2)*TILE,(r.y0+2.5)*TILE);m.room=r.id;G.mons.push(m);
  [[3,5],[r.w-4,5],[Math.floor(r.w/2),7]].forEach(([x,y])=>{const k=mkMonster(key,r.lvl,(r.x0+x+.5)*TILE,(r.y0+y+.5)*TILE);k.room=r.id;k.passive=false;G.mons.push(k);});
  G.toast(`☠ ${r.name}: ${m.name} lauert hier!`,'#ff8a80',true);sfx('aggro',{type:'boss'});}
 else G.toast('🚪 '+r.name,'#ffe9b0');}
function exitRoom(){const r=G.room;if(!r)return;G.mons=G.mons.filter(m=>m.room!==r.id);G.proj=[];G.teles=[];P.x=r.ent.x;P.y=r.ent.y;P.prevX=null;P.fy=1;G.room=null;G.enterT=.7;sfx('door');}
function openChest(c){const r=G.room,L=Math.max(1,P.level),D=G.D();c.opened=true;let qf=false;if(r&&r.b&&P.side)for(const k in SQ){const q=SQ[k],st=P.side[k];if(st&&st.st==='active'&&q.fetch===r.b.id)qf=true;if(st&&st.st==='active'&&q.fetch===r.b.id&&!st.got){st.got=true;sfx('quest');G.toast(`📜 Gefunden: ${q.item}! Bring es zu ${npcById(q.npc).short}.`,'#ffd54a',true);}}c.at=Date.now();sfx('chest');if(r&&!r.player&&!r.dungeon&&r.b&&!qf&&G.chestTheft)G.chestTheft(r);const gold=n=>{P.gold+=n;G.floats.push({x:P.x,y:P.y-40,t:`+${n} Gold`,c:'#ffd54a',life:1});G.invDirty=true;};
 switch(c.loot){
 case'dungeon':gold(rint(r.lvl*4,r.lvl*10));if(Math.random()<.75){const rar=rollRar(D.M);const it=lootItem(pick(ALLK),r.lvl+D.ilvl+1,rar,{src:r.name});give(it);if(rar>=3)G.toast(`${RAR[rar].n}er Fund!`,RAR[rar].c,true);}if(Math.random()<.5)give(mkStack('potion',1));break;
 case'keep':gold(120);give(lootItem(pick(ALLK),L+2,2));break;
 case'smith':gold(15);give(genItem('weapon',L+1,1));break;
 case'healer':give(mkStack('potion',2));break;
 case'bakery':give(mkStack('bread',4));break;
 case'tavern':gold(25);give(mkStack('bread',2));break;
 case'chapel':gold(30);give(mkStack('potion',1));break;
 case'guard':gold(20);give(genItem(pick(['helm','chest','legs','boots']),L,1));break;
 default:gold(rint(5,20));if(Math.random()<.5)give(mkStack(Math.random()<.5?'bread':'potion',1));if(Math.random()<.2)give(lootItem(pick(ALLK),L,1));}
 if(!r.dungeon)G.toast('Diese Truhe ist nun leer.','#ccc');else G.toast('Die Truhe füllt sich nach einigen Minuten wieder.','#ccc');}
Object.assign(G,{enterRoom,exitRoom});
const ALLK=Object.keys(WKIND).concat(Object.keys(SETS),['ring','amulet']);
// ---- Ackerbau (wie Minecraft: nahe Wasser, wächst langsam in Stufen)
const CROPS={wheat:{n:'Weizen',grow:[40,70],col:'#e8c95a',yield:()=>[['wheat',rint(1,2)],['seed',rint(1,3)]]},carrot:{n:'Karotten',grow:[35,60],col:'#ff8a1e',yield:()=>[['carrot',rint(2,4)]]},herb:{n:'Heilkraut',grow:[45,80],col:'#4ac04a',yield:()=>[['herb',rint(1,2)],['hseed',rint(0,2)]]}};
G.CROPS=CROPS;const fk=(x,y)=>x*1000+y;
const FARMABLE=[T.GRASS,T.GRASS2,T.DIRT,T.FLOWER,T.SWAMP,T.SAND,T.FIELD,T.SNOW];
function nearWater(tx,ty){for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(tileAt(tx+dx,ty+dy)===T.WATER)return true;return false;}
function plantable(tx,ty){if(tx>=WW||G.farm.has(fk(tx,ty)))return false;const t=tileAt(tx,ty);if(t===T.FIELD)return true;if(FARMABLE.indexOf(t)<0)return false;return nearWater(tx,ty);}
function seedSlot(){const it=P.inv[P.sel];if(it&&STACK[it.id]&&STACK[it.id].plant)return P.sel;for(const id of ['seed','carrot','hseed']){const i=P.inv.findIndex(s=>s&&s.id===id);if(i>=0)return i;}return -1;}
function plant(tx,ty){const i=seedSlot();if(i<0)return;const it=P.inv[i];const c=STACK[it.id].plant;G.farm.set(fk(tx,ty),{tx,ty,c,s:0,t:rnd(...CROPS[c].grow)});it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;sfx('plant');G.toast(`🌱 ${CROPS[c].n} gepflanzt`,'#a5d6a7');}
function harvest(f){G.farm.delete(fk(f.tx,f.ty));sfx('pickup');for(const [id,n] of CROPS[f.c].yield())if(n>0)give(mkStack(id,n));}
// ---- Wegschreine
G.travel=function(id){const w=WAYS.find(q=>q.id===id);if(!w||!P.ways[id])return;if(G.room)exitRoom();G.mons=G.mons.filter(m=>m.boss==='dragon');G.proj=[];G.teles=[];P.x=(w.tx+.5)*TILE;P.y=(w.ty+1.6)*TILE;P.fy=1;sfx('quest');G.toast('✨ Gereist nach '+w.name,'#b388ff',true);};
function act(){const t=target();if(!t)return;if(G.extraAct&&G.extraAct(t))return;if(t.k==='npc'){G.ui&&G.ui.openDialog(t.n);return;}
 if(t.k==='door'){enterRoom(t.b.room);return;}if(t.k==='exit'){exitRoom();return;}if(t.k==='chest'){openChest(t.c);return;}
 if(t.k==='way'){G.ui&&G.ui.openTravel&&G.ui.openTravel();return;}
 if(t.k==='soil'){plant(t.tx,t.ty);return;}
 if(t.k==='crop'){if(t.f.s>=3)harvest(t.f);else G.toast(`🌱 ${CROPS[t.f.c].n} wächst noch (Stufe ${t.f.s+1}/4)`,'#a5d6a7');}}
function target(){let best=null,bd=52;
 if(G.room){const r=G.room;for(const c of r.chests){if(c.opened)continue;const d=Math.hypot((c.tx+.5)*TILE-P.x,(c.ty+.5)*TILE-P.y);if(d<bd){bd=d;best={k:'chest',c};}}const dd=Math.hypot((r.door.tx+.5)*TILE-P.x,(r.door.ty+.5)*TILE-P.y);if(dd<bd){bd=dd;best={k:'exit',r};}return G.extraTarget?G.extraTarget(best,bd):best;}
 for(const n of NPCS){if(!G.npcVisible(n))continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best={k:'npc',n};}}
 for(const w of WAYS){const d=Math.hypot((w.tx+.5)*TILE-P.x,(w.ty+.5)*TILE-P.y);if(d<bd){bd=d;best={k:'way',w};}}
 const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const f=G.farm.get(fk(ptx+dx,pty+dy));if(!f)continue;const d=Math.hypot((f.tx+.5)*TILE-P.x,(f.ty+.5)*TILE-P.y)-(f.s>=3?6:0);if(d<Math.min(bd,44)){bd=d;best={k:'crop',f};}}
 const mt=G.mouseTile;if(mt&&Math.hypot(mt.x+.5-P.x/TILE,mt.y+.5-P.y/TILE)<3.6){const f=G.farm.get(fk(mt.x,mt.y));if(f)return{k:'crop',f};const hs=P.inv[P.sel];if(hs&&STACK[hs.id]&&STACK[hs.id].plant&&plantable(mt.x,mt.y))return{k:'soil',tx:mt.x,ty:mt.y};}
 if(!best&&seedSlot()>=0&&!G.mouseTile){const ftx=Math.floor((P.x+P.fx*30)/TILE),fty=Math.floor((P.y+P.fy*30)/TILE);const c=[[ftx,fty],[ptx,pty]];for(const [x,y] of c)if(plantable(x,y)&&!(x===ptx&&y===pty&&false)){best={k:'soil',tx:x,ty:y};break;}}
 for(const b of BUILD){if(!b.room)continue;const d=Math.hypot((b.door.tx+.5)*TILE-P.x,(b.y+b.h+.25)*TILE-P.y);if(d<Math.min(bd,46)){bd=d;best={k:'door',b};}}return G.extraTarget?G.extraTarget(best,bd):best;}
G.targetPos=t=>t.k==='npc'?{x:t.n.x,y:t.n.y}:t.k==='crop'?{x:(t.f.tx+.5)*TILE,y:(t.f.ty+.5)*TILE}:t.k==='soil'?{x:(t.tx+.5)*TILE,y:(t.ty+.5)*TILE}:t.k==='way'?{x:(t.w.tx+.5)*TILE,y:(t.w.ty+.5)*TILE}:t.k==='door'?{x:(t.b.door.tx+.5)*TILE,y:(t.b.y+t.b.h+.2)*TILE}:t.k==='chest'?{x:(t.c.tx+.5)*TILE,y:(t.c.ty+.5)*TILE}:{x:(t.r.door.tx+.5)*TILE,y:(t.r.door.ty+.3)*TILE};
G.targetLabel=t=>t.k==='npc'?['💬','Reden']:t.k==='soil'?['🌱','Pflanzen']:t.k==='crop'?(t.f.s>=3?['🌾','Ernten']:['⏳',`${t.f.s+1}/4`]):t.k==='way'?['✨','Reisen']:t.k==='door'?['🚪','Betreten']:t.k==='chest'?['🧰','Öffnen']:['🚪','Verlassen'];
Object.assign(G,{act,target});
const DAYLEN=720;
G.dayInfo=()=>{const t=((G.P&&G.P.dayT)||0)%DAYLEN,n=Math.floor(((G.P&&G.P.dayT)||0)/DAYLEN);let L;if(t<470)L=1;else if(t<530)L=1-(t-470)/60*.78;else if(t<680)L=.22;else L=.22+(t-680)/40*.78;
 return{t,n,light:clamp(L,.22,1),night:t>=505&&t<700,dusk:t>=440&&t<540,full:h2(n,7,777)<.1,sunA:(t/DAYLEN)};};
G.update=function(dt){P=G.P;G.time+=dt;P.dayT=(P.dayT||0)+dt;{const di=G.dayInfo();if(di.night!==G._wasNight){if(di.night){G.toast(di.full?'🌕 Vollmond! Werwölfe streifen umher …':'🌙 Die Nacht bricht herein. Untote erheben sich.','#b3c7ff',true);sfx('horn');}else if(G._wasNight!=null)G.toast('🌅 Der Morgen graut.','#ffe0a0');G._wasNight=di.night;}}const S=G.S=calc();if(P.hp>S.maxhp)P.hp=S.maxhp;
 let mx=G.input.x,my=G.input.y;const len=Math.hypot(mx,my);P.moving=false;
 P.dodgeCd-=dt;if(P.invT>0)P.invT-=dt;if(P.secondT>0)P.secondT-=dt;
 {const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE),ct=tileAt(ptx,pty);const wasC=P.climb;P.onLedge=ct===T.LEDGE&&P.z<=1;P.climb=ct===T.CLIMB;
  if(P.climb&&!wasC){P.climbFrom={x:P.prevX||P.x,y:P.prevY||P.y};G.toast('🧗 Klettern! Ausdauer im Blick behalten.','#ffe0a0');}
  if(P.climb&&!P.dead){P.sta-=9*dt;P.staT=.6;if(P.sta<=0){P.sta=0;const f=P.climbFrom||{x:P.x,y:P.y};P.x=f.x;P.y=f.y;P.climb=false;const dmg=Math.round(G.S.maxhp*.15);P.hp=Math.max(1,P.hp-dmg);P.hurtT=.4;G.floats.push({x:P.x,y:P.y-34,t:'Abgerutscht! -'+dmg,c:'#ff8a80',life:1});sfx('hurt');}}
  P.sprint=!!(G.sprintHeld&&len>.15&&!P.climb&&P.sta>4&&!P.dead&&P.dodgeT<=0);if(P.sprint){P.sta-=9*dt*(G.S.staMul||1);P.staT=.5;if(Math.random()<.25)G.parts.push({x:P.x+rnd(-5,5),y:P.y+8,z:2,vx:-mx*30,vy:-my*30,life:.3,c:'#d8c8a0'});}
  if(P.z>0||P.vz>0){P.vz-=980*dt;P.z+=P.vz*dt;if(P.z<=0){P.z=0;P.vz=0;if(P.landSfx){sfx('step');P.landSfx=false;}}}
  if(!P.climb&&!P.onLedge&&P.z<=0&&!G.noclip&&tileAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE))!==T.LEDGE&&solidPP(P.x,P.y)){const f=P.prevX!=null&&P.prevRoom===(G.room?G.room.id:null)&&Math.hypot(P.prevX-P.x,P.prevY-P.y)<TILE*1.5?{x:P.prevX,y:P.prevY}:null;if(f&&!solidPP(f.x,f.y)){P.x=f.x;P.y=f.y;}else{const rr=G.room;let done=0;for(let rad=6;rad<=TILE*3&&!done;rad+=6)for(let a=0;a<16&&!done;a++){const x=P.x+Math.cos(a*.3927)*rad,y=P.y+Math.sin(a*.3927)*rad;if(rr&&(x<rr.x0*TILE||y<rr.y0*TILE||x>=(rr.x0+rr.w)*TILE||y>=(rr.y0+rr.h)*TILE))continue;if(!solidPP(x,y)&&canMoveP(x,y,10)){P.x=x;P.y=y;done=1;}}}}
  P.prevX=P.x;P.prevY=P.y;P.prevRoom=G.room?G.room.id:null;}
 if(P.pullT>0&&P.pullFrom&&!P.dead&&P.dodgeT<=0){P.pullT-=dt;const m=P.pullFrom,ddx=m.x-P.x,ddy=m.y-P.y,dd=Math.hypot(ddx,ddy)||1;if(dd>m.r+18){const sp=520*dt;if(canMoveP(P.x+ddx/dd*sp,P.y,10))P.x+=ddx/dd*sp;if(canMoveP(P.x,P.y+ddy/dd*sp,10))P.y+=ddy/dd*sp;}}
 if(P.dodgeT>0&&!P.dead){P.dodgeT-=dt;const sp=S.speed*3.3*dt;if(canMoveP(P.x+P.ddx*sp,P.y,10))P.x+=P.ddx*sp;if(canMoveP(P.x,P.y+P.ddy*sp,10))P.y+=P.ddy*sp;P.moving=true;P.anim+=dt*1.5;if(Math.random()<.6)G.parts.push({x:P.x,y:P.y+6,z:2,vx:rnd(-20,20),vy:rnd(-20,20),life:.3,c:'#d8c8a0'});}
 else if(P.rootT>0&&!P.dead){P.rootT-=dt;P.moving=false;if(Math.random()<.2)G.parts.push({x:P.x+rnd(-10,10),y:P.y+4,z:6,vx:0,vy:0,life:.3,c:'#5a8a3a'});}
 else if(len>.15&&!P.dead){const nx=mx/len,ny=my/len;if(G.fpDir){P.fx=G.fpDir.x;P.fy=G.fpDir.y;}else if(!G.aim||!G.attackHeld){P.fx=nx;P.fy=ny;}const dr=G.attackHeld&&S.kind&&WKIND[S.kind].draw?WKIND[S.kind].draw:1;const sp=S.speed*Math.min(1,len)*dt*dr*(P.climb?.45:1)*(P.sprint?1.6:1)*(G.devSpd||1);if(G.noclip||canMoveP(P.x+nx*sp,P.y,10))P.x+=nx*sp;if(G.noclip||canMoveP(P.x,P.y+ny*sp,10))P.y+=ny*sp;P.moving=true;P.anim+=dt;}
 {const rr=G.room;if(rr&&!P.dead&&(P.x<rr.x0*TILE||P.y<rr.y0*TILE||P.x>=(rr.x0+rr.w)*TILE||P.y>=(rr.y0+rr.h)*TILE)){if(rr.door){P.x=(rr.door.tx+.5)*TILE;P.y=(rr.door.ty-.5)*TILE;}}}
 G.enterT=(G.enterT||0)-dt;
 if(G.enterT<=0&&!P.dead){if(G.room){if(tileAt(Math.floor(P.x/TILE),Math.floor((P.y+6)/TILE))===T.DOOR){exitRoom();}}
  else if(P.moving&&P.fy<-.5){for(const b of BUILD){if(!b.room)continue;const fx=(b.door.tx+.5)*TILE,fy=(b.y+b.h)*TILE;if(Math.abs(P.x-fx)<16&&P.y-fy>0&&P.y-fy<16){enterRoom(b.room);break;}}}}
 if(G.v8tick){if(!G.attackHeld)G._rodLatch=0;G.v8tick(dt);}P.atkCd-=dt;P.swing-=dt;P.hurtT-=dt;P.staT-=dt;if(P.staT<=0)P.sta=Math.min(S.maxSta,P.sta+50*dt*(S.staReg||1));P.mp=Math.min(S.maxMp,P.mp+S.mpRegen*dt);if(G.attackHeld)attack();
 const safe=inSafe(P.x,P.y);if(!P.dead){P.hp=Math.min(S.maxhp,P.hp+S.regen*(safe?5:1)*dt);P.slow=Math.max(0,(P.slow||0)-dt);if(P.burn){P.burn.t-=dt;P.hp-=P.burn.dps*dt;if(Math.random()<.4)G.parts.push({x:P.x+rnd(-8,8),y:P.y,z:16,vx:0,vy:-40,life:.4,c:'#ff8a2a'});if(P.burn.t<=0)P.burn=null;if(P.hp<=0){P.hp=0;die();}}if(P.poison){P.poison.t-=dt;P.hp-=P.poison.dps*dt;if(Math.random()<.3)G.parts.push({x:P.x+rnd(-8,8),y:P.y,z:20,vx:0,vy:-30,life:.4,c:'#7cff6b'});if(P.poison.t<=0)P.poison=null;if(P.hp<=0){P.hp=0;die();}}}
 // Monster
 const SLEEPR=G.simR();for(const m of G.mons){if(m.dead)continue;if(!m.boss&&!m.aggro&&!m.room&&Math.abs(m.x-P.x)+Math.abs(m.y-P.y)>SLEEPR){m.mvg=0;continue;}m.atkCd-=dt;m.hitT-=dt;m.swing-=dt;{const _d=Math.hypot(m.x-(m._lx==null?m.x:m._lx),m.y-(m._ly==null?m.y:m._ly));m._lx=m.x;m._ly=m.y;m.mvg=(m.mvg||0)*.82+(_d>dt*6?.18:0);if(m.mvg>.3)m.anim+=dt*Math.min(1.6,Math.max(.5,_d/dt/55));}
  if(m.burn){m.burn.t-=dt;m.hp-=m.burn.dps*dt;if(Math.random()<.3)G.parts.push({x:m.x+rnd(-8,8),y:m.y,z:14,vx:0,vy:-40,life:.4,c:'#ff8a2a'});if(m.burn.t<=0)m.burn=null;if(m.hp<=0){killMonster(m);continue;}}
  m.slowT=(m.slowT||0)-dt;if(m.stunT>0){m.stunT-=dt;m.wind=0;if(Math.random()<.15)G.parts.push({x:m.x+rnd(-8,8),y:m.y,z:m.r*2+8,vx:0,vy:0,life:.3,c:'#fff59d'});continue;}
  if(!m.room&&!m.boss&&(dV(m.x/TILE,m.y/TILE)<RV+.5||townAt(m.x/TILE,m.y/TILE))){m.dead=true;continue;}
  if(m.t.night&&!m.boss&&!m.room){const di=G.dayInfo();if(!di.night&&!di.dusk){m.hp-=m.maxhp*.2*dt;if(Math.random()<.4)G.parts.push({x:m.x+rnd(-8,8),y:m.y,z:12,vx:0,vy:-50,life:.6,c:'#555',smoke:1});if(m.hp<=0){m.dead=true;continue;}}}
  if(m.t.human&&m.aggro&&!m.wereCk&&!m.room){m.wereCk=1;const di=G.dayInfo();if(di.night&&di.full&&Math.random()<.4){const w=mkMonster('werewolf',m.lvl+1,m.x,m.y);w.aggro=true;Object.assign(m,{dead:true});G.mons.push(w);sfx('aggro',{type:'wolf',x:m.x,y:m.y});G.toast(`🌕 ${m.name} verwandelt sich in einen Werwolf!`,'#ffab91',true);for(let i=0;i<16;i++)G.parts.push({x:w.x,y:w.y,z:16,vx:rnd(-120,120),vy:rnd(-120,120),life:.6,c:'#5a4a3a'});continue;}}
  if(m.cor&&Math.random()<.12)G.parts.push({x:m.x+rnd(-m.r,m.r),y:m.y+rnd(-4,4),z:m.r*1.4,vx:rnd(-10,10),vy:-rnd(20,45),life:.7,c:Math.random()<.5?'#ff6a1a':'#3a2a22'});
  const dx=P.x-m.x,dy=P.y-m.y,d=Math.hypot(dx,dy)||1;let vx=0,vy=0,spd=m.spd*(m.slowT>0?.5:1);
  const aggroR=m.boss?340:(m.ai==='ranged'?300:240);
  m.voiceT-=dt;const hd0=Math.hypot(m.x-m.home.x,m.y-m.home.y);const leashed=m.boss==='dragon'?hd0>TILE*8:(hd0>TILE*(m.room?60:m.boss?30:45)&&d>TILE*6);
  if(m.terr&&!m.provoked&&d<70&&!P.dead&&!safe){m.provoked=true;G.floats.push({x:m.x,y:m.y-m.r-14,t:'Grunz! Revier!',c:'#ffcc80',life:.9});}
  if(m.flee&&(m.provoked||d<90)&&!P.dead){m.aggro=false;m.provoked=false;const fx=-dx/d,fy=-dy/d;const sp2=m.spd*(m.slowT>0?.6:1.35)*dt;let nx=m.x+fx*sp2,ny=m.y+fy*sp2;if(!canMove(nx,ny,m.cr)){nx=m.x+fy*sp2;ny=m.y-fx*sp2;}if(canMove(nx,ny,m.cr)){m.x=nx;m.y=ny;m.fx=fx;m.fy=fy;}m.fleeT=(m.fleeT||0)+dt;if(d>TILE*14&&m.fleeT>4)m.dead=true;continue;}
  const can=!P.dead&&!safe&&!leashed&&(!m.passive||m.provoked)&&(d<aggroR||(m.aggro&&d<aggroR*2.6));
  if(m.aggro&&!m.evade&&(P.dead||safe||leashed)){m.aggro=false;m.evade=true;m.evT=0;m.st=null;G.floats.push({x:m.x,y:m.y-m.r-14,t:'Entkommen!',c:'#9be7ff',life:1});}
  if(m.evade){m.evT+=dt;m.hp=Math.min(m.maxhp,m.hp+m.maxhp*.6*dt);if(hd0<TILE*.9||m.evT>7){if(m.evT>7){m.x=m.home.x;m.y=m.home.y;}m.evade=false;m.hp=m.maxhp;}else{vx=(m.home.x-m.x)/hd0;vy=(m.home.y-m.y)/hd0;spd=m.spd*1.8;}}
  else if(m.st==='leap'){m.stT-=dt;const p=1-Math.max(0,m.stT)/1.1;m.x=m.sx0+(m.lx-m.sx0)*p;m.y=m.sy0+(m.ly-m.sy0)*p;m.jump=Math.sin(p*Math.PI);if(m.stT<=0){m.st=null;m.jump=0;if(!canMove(m.x,m.y,m.cr)){m.x=m.sx0;m.y=m.sy0;}for(let i=0;i<12;i++)G.parts.push({x:m.x,y:m.y,z:4,vx:rnd(-140,140),vy:rnd(-140,140),life:.5,c:'#8a7a6a'});sfx('boom',m);}}
  else if(m.st==='blink'){m.stT-=dt;if(m.stT<=0){m.st=null;for(let k=0;k<10;k++){const a=Math.random()*6.283,r=rnd(50,80);const nx=P.x+Math.cos(a)*r,ny=P.y+Math.sin(a)*r;if(canMove(nx,ny,m.cr)&&(m.room||!monBlocked(nx,ny))){for(let i=0;i<10;i++)G.parts.push({x:m.x,y:m.y,z:14,vx:rnd(-90,90),vy:rnd(-90,90),life:.4,c:'#6a3a8a'});m.x=nx;m.y=ny;m.atkCd=Math.min(m.atkCd,.2);break;}}}}
  else if(m.st==='wind'){m.stT-=dt;if(m.stT<=0){m.st='dash';m.stT=.45;m.hitDone=false;}}
  else if(m.st==='dash'){m.stT-=dt;vx=m.ddx;vy=m.ddy;spd=m.spd*3.6;if(!m.hitDone&&d<m.r+16){m.hitDone=true;hitPlayer(m.dmg*1.3,{lvl:m.lvl,type:'phys',burn:m.t.burn,chill:m.t.chill});}if(m.stT<=0){m.st=null;m.chCd=rnd(2.5,4);}}
  else if(can){if(m.cor&&!P.corSeen&&d<260){P.corSeen=1;G.toast('🔥 Rot glühende Augen … Die Asche Ignaroks vergiftet die Tiere. Befallene greifen alles an – gesunde Hasen und Füchse fliehen, Wildschweine verteidigen nur ihr Revier.','#ffab91',true);}if(!m.aggro&&m.voiceT<=0){sfx('aggro',{type:m.boss?(m.boss==='dragon'?'dragon':'boss'):m.type,x:m.x,y:m.y});m.voiceT=12;}m.aggro=true;
   if(m.ai==='ranged'){if(d<130){vx=-dx/d;vy=-dy/d;}else if(d>220){vx=dx/d;vy=dy/d;}else{vx=-dy/d*.45*m.strafe;vy=dx/d*.45*m.strafe;}
    m.shotCd-=dt;if(m.shotCd<=0&&d<340){shoot(m,dx,dy,m.t.shot);m.shotCd=m.t.shot.cd*rnd(.85,1.15);m.swing=.25;}monSkills(m,dt,d,dx,dy);}
   else{if(m.ai==='charge'){m.chCd-=dt;if(m.chCd<=0&&d<210&&d>50&&!(m.wind>0)){m.st='wind';m.stT=.6;m.ddx=dx/d;m.ddy=dy/d;}}
    if(!m.st){if(m.wind>0){m.wind-=dt;vx=dx/d*.15;vy=dy/d*.15;if(m.wind<=0){m.swing=.25;m.atkCd=m.boss?1.3:rnd(1,1.3);if(d<m.r+26){const T0=m.t;hitPlayer(m.dmg,{lvl:m.lvl,type:'phys',poison:T0.poison||(m.B&&m.B.poison),burn:T0.burn,chill:T0.chill,grab:(T0.sk||[]).indexOf('grab')>=0,vamp:T0.vamp?m:null});}else G.floats.push({x:m.x,y:m.y-m.r-10,t:'verfehlt',c:'#ccc',life:.5});}}
     else if(d>m.r+12){vx=dx/d;vy=dy/d;}else if(m.atkCd<=0){m.wind=m.windMax=m.boss?(m.boss==='dragon'?.7:.6):(m.t.wind||.42);}}
    if(!(m.wind>0))monSkills(m,dt,d,dx,dy);}
   if(m.boss)bossAbility(m,dt,d);}
  else{m.aggro=false;if(m.hp<m.maxhp)m.hp=Math.min(m.maxhp,m.hp+m.maxhp*.04*dt);if(m.home&&hd0>TILE*(m.boss?2:5)){const hx=m.home.x-m.x,hy=m.home.y-m.y,hd=Math.hypot(hx,hy);vx=hx/hd;vy=hy/hd;if(m.hp<m.maxhp)m.hp=Math.min(m.maxhp,m.hp+m.maxhp*.08*dt);}
   else{m.wd.t-=dt;if(m.wd.t<=0){m.wd.t=rnd(1,3);if(Math.random()<.4){m.wd.x=0;m.wd.y=0;}else{const a=Math.random()*6.283;m.wd.x=Math.cos(a)*.45;m.wd.y=Math.sin(a)*.45;}}vx=m.wd.x;vy=m.wd.y;}}
  if(vx||vy){const l=Math.hypot(vx,vy);m.fx=vx/l;m.fy=vy/l;}
  const sx=(vx*spd+m.kx)*dt,sy=(vy*spd+m.ky)*dt;m.kx*=Math.pow(.002,dt);m.ky*=Math.pow(.002,dt);
  if(canMove(m.x+sx,m.y,m.cr)&&(m.room||!monBlocked(m.x+sx,m.y)))m.x+=sx;else{m.wd.t=0;if(m.st==='dash')m.stT=0;}
  if(canMove(m.x,m.y+sy,m.cr)&&(m.room||!monBlocked(m.x,m.y+sy)))m.y+=sy;else{m.wd.t=0;if(m.st==='dash')m.stT=0;}}
 // Projektile
 for(const p of G.proj){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(solidPx(p.x,p.y)&&tileAt(Math.floor(p.x/TILE),Math.floor(p.y/TILE))!==T.WATER&&tileAt(Math.floor(p.x/TILE),Math.floor(p.y/TILE))!==T.LAVA)p.life=0;
  if(p.life>0&&!P.dead&&Math.hypot(p.x-P.x,p.y-P.y)<p.r+11){if(P.dodgeT>0){}else{p.life=0;hitPlayer(p.dmg,p);}}
  if(p.life<=0)for(let i=0;i<4;i++)G.parts.push({x:p.x,y:p.y,z:10,vx:rnd(-60,60),vy:rnd(-60,60),life:.3,c:p.c});}
 G.proj=G.proj.filter(p=>p.life>0);
 for(const p of G.pproj){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const tt=tileAt(Math.floor(p.x/TILE),Math.floor(p.y/TILE));if(isSolidT(tt)&&tt!==T.WATER&&tt!==T.LAVA&&tt!==T.FIELD)p.life=0;
  if(p.life>0)for(const m of G.mons){if(m.dead||p.hits.indexOf(m)>=0)continue;if(Math.hypot(m.x-p.x,m.y-p.y)<m.r+7){p.hits.push(m);hitMonster(m,p.dmg,p.cr,{elem:p.elem,kb:p.kb||.4,pl:1,pc:p.kind==='fire'?'#ff8a2a':p.kind==='frost'?'#9be7ff':p.kind==='storm'?'#d0b0ff':p.kind==='light'?'#fff3b0':null});
   if(p.elem==='storm'){let n=0;for(const o of G.mons){if(o===m||o.dead||n>=2)continue;if(Math.hypot(o.x-m.x,o.y-m.y)<130){n++;G.parts.push({x:o.x,y:o.y,z:20,vx:0,vy:0,life:.25,c:'#e0d0ff'});hitMonster(o,p.dmg*.6,false,{elem:'storm',kb:0});}}}
   if(p.pierce>0)p.pierce--;else{p.life=0;break;}}}
  if(p.life<=0)for(let i=0;i<4;i++)G.parts.push({x:p.x,y:p.y,z:10,vx:rnd(-60,60),vy:rnd(-60,60),life:.3,c:p.kind==='fire'?'#ff8a2a':p.kind==='frost'?'#9be7ff':'#e8e0c8'});}
 G.pproj=G.pproj.filter(p=>p.life>0);G.slashes=(G.slashes||[]).filter(s=>(s.t-=dt)>0);
 for(const f of G.farm.values())if(f.s<3){f.t-=dt*(tileAt(f.tx,f.ty)===T.FIELD?1.3:1);if(f.t<=0){f.s++;f.t=rnd(...CROPS[f.c].grow);}}
 if(!G.room)for(const w of WAYS){if(!P.ways[w.id]&&Math.hypot((w.tx+.5)*TILE-P.x,(w.ty+.5)*TILE-P.y)<TILE*3){P.ways[w.id]=1;sfx('quest');G.toast(`✨ Wegschrein „${w.name}“ entdeckt! Du kannst nun hierher reisen.`,'#b388ff',true);}}
 for(const t of G.teles){t.t-=dt;if(t.t<=0&&!t.done){t.done=true;sfx('boom',t);if(Math.hypot(P.x-t.x,P.y-t.y)<t.r)hitPlayer(t.dmg,{lvl:t.lvl,type:t.type||'phys',burn:t.burn,root:t.root,slow:t.slow});for(let i=0;i<16;i++)G.parts.push({x:t.x+rnd(-t.r,t.r)*.7,y:t.y+rnd(-t.r,t.r)*.7,z:4,vx:rnd(-40,40),vy:rnd(-40,40),vz:rnd(40,120),life:.5,c:`rgb(${t.c})`});}}
 G.teles=G.teles.filter(t=>!t.done);
 // Boden
 fullT-=dt;for(const g of G.grounds){g.t+=dt;if(g.t>.4&&Math.hypot(g.x-P.x,g.y-P.y)<30){if(g.gold){sfx('coin');P.gold+=g.gold;g.gone=true;G.floats.push({x:P.x,y:P.y-40,t:`+${g.gold} Gold`,c:'#ffd54a',life:.9});G.invDirty=true;continue;}
  const nm=g.it.stack?`${g.it.name} ×${g.it.count}`:g.it.name;if(addItem(g.it)){g.gone=true;sfx((g.it.rarity||0)>=3?'rare':'pickup');G.toast('Aufgehoben: '+nm,RAR[g.it.rarity||0].c,false,g.it);}else if(fullT<=0){fullT=3;G.toast('Inventar voll!','#ff8a80');}}}
 G.grounds=G.grounds.filter(g=>!g.gone);if(G.grounds.length>70)G.grounds.shift();
 // NPCs
 for(const n of NPCS){n.anim+=dt;const dn=Math.hypot(P.x-n.x,P.y-n.y);if(dn<110&&!n.lie&&!n.sit){const l=dn||1;n.fx=(P.x-n.x)/l;n.fy=(P.y-n.y)/l;}
  if(n.id==='elara')continue;if(G.crimeTick(n,dt,dn))continue;if(G.routine&&G.routine(n,dt,dn))continue;if(n.id==='aldric'||n.lord&&!JOBS[n.id])continue;if(dn<TILE*40)npcTick(n,dt,dn);}
 for(const f of G.floats){f.life-=dt;f.y-=28*dt;}G.floats=G.floats.filter(f=>f.life>0);
 for(const p of G.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92;p.z=(p.z||0)+(p.vz||0)*dt;}G.parts=G.parts.filter(p=>p.life>0);if(G.parts.length>400)G.parts.splice(0,G.parts.length-400);
 spawnTick(dt);if(!G.room)fixedTick(dt);
 if(!safe&&!P.dead&&!G.room){bossT-=dt;if(bossT<=0){if(!G.mons.some(m=>m.boss&&!BOSSES[m.boss].fixed&&!m.dead)){bossT=(P.level>=3&&spawnBoss())?rnd(480,720):30;}else bossT=30;}}
 G.flashT-=dt;};

// ===================== Speichern =====================
G.slot=+(()=>{try{return localStorage.getItem('aschen_slot')||1}catch(e){return 1}})()||1;const SK=n=>n===1?SAVEK:SAVEK+'_s'+n;G.SK=SK;G.rawSlot=n=>{try{return localStorage.getItem(SK(n))||(n===1?localStorage.getItem(SAVEK4):null);}catch(e){return null;}};
G.setSlot=n=>{G.slot=n;try{localStorage.setItem('aschen_slot',n)}catch(e){}};
G.slotInfo=n=>{try{const raw=localStorage.getItem(SK(n))||(n===1?localStorage.getItem(SAVEK4):null);if(!raw)return null;const s=JSON.parse(raw);if(!s||!s.P)return null;const p=s.P;return{lvl:p.lvl||1,gold:p.gold||0,diff:p.diff,at:p.savedAt||0,look:p.look||null,chapter:p.chapter||null};}catch(e){return null;}};
G.wipeSlot=n=>{try{localStorage.removeItem(SK(n));if(n===1)localStorage.removeItem(SAVEK4);}catch(e){}};
G.hasSave=()=>{try{return !!(localStorage.getItem(SK(G.slot))||(G.slot===1&&localStorage.getItem(SAVEK4)));}catch(e){return false;}};
G.save=function(){if(!G.P)return;try{const p=Object.assign({},G.P);delete p.dead;p.roomId=G.room?G.room.id:null;p.savedAt=Date.now();localStorage.setItem(SK(G.slot),JSON.stringify({P:p,farm:[...G.farm.values()],fixT:G.fixT,chests:ROOMS.map(r=>r.chests.map(c=>[c.opened?1:0,c.at]))}));}catch(e){}};
G.load=function(){try{let raw=localStorage.getItem(SK(G.slot)),mig=false;if(!raw&&G.slot===1){raw=localStorage.getItem(SAVEK4);mig=!!raw;}const s=JSON.parse(raw||'null');if(!s||!s.P)return false;if(mig){delete s.farm;delete s.chests;s.P.roomId=null;s.P.x=SPAWN.x;s.P.y=SPAWN.y;}newGame(s.P.diff||G.settings.diff);Object.assign(P,s.P);if(P.sta==null)P.sta=100;if(P.mp==null)P.mp=40;P.staT=0;P.dead=false;P.poison=null;P.dodgeT=0;
 if(!Array.isArray(P.inv)||P.inv.length!==36)return false;if(!P.chat)P.chat={};if(Array.isArray(s.farm))s.farm.forEach(f=>{if(f&&CROPS[f.c])G.farm.set(fk(f.tx,f.ty),f);});if(!P.kills)P.kills={};if(!P.ways)P.ways={city:1};P.burn=null;P.slow=0;if(s.fixT)G.fixT=Object.assign({grukk:0,bonelord:0,dragon:0},s.fixT);
 G.flags.barrier=!!P.barrier;if(Array.isArray(s.chests))s.chests.forEach((a,i)=>{const r=ROOMS[i];if(r&&Array.isArray(a))a.forEach((v,j)=>{if(r.chests[j]){r.chests[j].opened=!!v[0];r.chests[j].at=v[1]||0;}});});G.room=null;if(P.roomId){const r=ROOMS.find(q=>q.id===P.roomId);if(r){P.x=r.ent.x;P.y=r.ent.y;}}if(P.diff){G.settings.diff=P.diff;}if(!P.side)P.side={};if(P.dayT==null)P.dayT=60;if(mig){P.x=SPAWN.x;P.y=SPAWN.y;G.toast('🗺 Die Welt ist gewachsen! Du startest wieder in Eichenhain. Deine Ausrüstung und Stufe bleiben.','#ffd54a',true);}placeElara();P.furn=P.furn||{};P.inv.forEach((it,i)=>{if(it&&it.stack&&STACK[it.id]&&STACK[it.id].type==='furn'){P.furn[it.id]=(P.furn[it.id]||0)+it.count;P.inv[i]=null;}});{let nb=0;const fixIt=it=>{if(!it||it.stack||it.v13||it.rarity==null)return;const k=RMULT[it.rarity]/RMULT_OLD[it.rarity];if(it.dmg!=null)it.dmg=Math.max(1,Math.round(it.dmg*k));if(it.def!=null)it.def=Math.max(1,Math.round(it.def*k));it.v13=1;if(it.rarity>0)nb++;};(P.inv||[]).forEach(fixIt);for(const k in P.eq||{})fixIt(P.eq[k]);if(P.chest)(P.chest||[]).forEach(fixIt);if(nb)setTimeout(()=>G.toast('⚖ Update 13: Seltene Waffen & Rüstungen wurden neu ausbalanciert.','#ffd54a',true),3500);}if(!canMove(P.x,P.y,10)){P.x=SPAWN.x;P.y=SPAWN.y;}G.S=calc();if(P.hp<=0)P.hp=G.S.maxhp;return true;}catch(e){console.error(e);return false;}};
G.wipe=()=>G.wipeSlot(G.slot);
// ===================== v8: Zuhause, Möbel, Angeln, Katzen, Schätze, Tagesablauf =====================
const HOMEB=BUILD.find(b=>b.id==='h4'),HR=HOMEB.room;HOMEB.name='Dein Haus';HOMEB.sign='🏠';HOMEB.player=1;HR.name='Dein Haus';HR.player=true;HR.chests=[];
const CARPB=BUILD.find(b=>b.id==='h7');CARPB.name='Schreinerei';CARPB.sign='🪑';CARPB.room.name='Schreinerei Holger';
{const ab=BUILD.find(b=>b.id==='angler');if(ab&&ab.room){const r=ab.room;r.dungeon=false;r.name='Anglerhütte';for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)F(r,x,y,T.WOOD);r.chests=[];F(r,0,0,T.BED);F(r,0,1,T.BED);F(r,r.w-1,0,T.HEARTH);F(r,4,3,T.TABLE);F(r,5,3,T.TABLE);F(r,r.w-1,3,T.BARREL);F(r,r.w-1,4,T.BARREL);F(r,2,0,T.SHELF);F(r,r.w-1,r.h-1,T.CRATE);CH_(r,1,r.h-1,'home');}}
G.HOME={b:HOMEB,r:HR};
const FURN={bed:{n:'Bett',ic:'🛏',t:[null,['Strohlager',0],['Feldbett',60],['Einzelbett',180],['Doppelbett',450],['Königsbett',1200]]},
 table:{n:'Tisch',ic:'🪵',t:[null,['Holzklotz',25],['Brettertisch',80],['Eichentisch mit Stühlen',220],['Festtafel',600]]},
 hearth:{n:'Kamin',ic:'🔥',t:[null,['Feuerstelle',50],['Steinkamin',200],['Prunkkamin',550]]},
 shelf:{n:'Regal',ic:'📚',t:[null,['Brettregal',35],['Bücherregal',140],['Trophäenregal',420]]},
 rug:{n:'Teppich',ic:'🟥',t:[null,['Strohmatte',20],['Wollteppich',90],['Bärenfell',260]]},
 lamp:{n:'Licht',ic:'🕯',t:[null,['Kerzenständer',25],['Öllampe',90],['Kronleuchter',380]]},
 deco:{n:'Deko',ic:'🖼',t:[null,['Topfpflanze',30],['Gemälde',120],['Wandteppich',300],['Rüstungsständer',700]]},
 basket:{n:'Katzenkorb',ic:'🧺',t:[null,['Katzenkorb',45],['Kuschelkissen',150]]}};
G.FURN=FURN;
const FOOT={bed:t=>t>=4?[[0,0],[1,0],[0,1],[1,1]]:t>=2?[[0,0],[0,1]]:[[0,0]],table:t=>t>=3?[[3,2],[4,2]]:[[4,2]],hearth:t=>[[7,0]],shelf:t=>t>=3?[[3,0],[4,0]]:[[3,0]],deco:t=>t===1||t===4?[[7,5]]:[],basket:t=>[],rug:t=>[],lamp:t=>[]};
const homeRel=(k,t,pos)=>{const f=FOOT[k](t);if(!f.length)return f;const p=pos||(P.home&&P.home.pos&&P.home.pos[k]);if(!p)return f;const a=f[0];return f.map(([x,y])=>[x-a[0]+p[0],y-a[1]+p[1]]);};
G.homeFoot=k=>{const t=(G.P&&G.P.home&&G.P.home[k])||0;return t?homeRel(k,t).map(([x,y])=>[HR.x0+x,HR.y0+y]):[];};
const HDEF={rug:[4,3],lamp:[2,0],basket:[6,5],deco:[5,0]};
G.homePos=(k,def)=>{const p=(G.P&&G.P.home&&G.P.home.pos&&G.P.home.pos[k])||def||HDEF[k]||[0,0];return[HR.x0+p[0],HR.y0+p[1]];};
G.homeCustom=k=>!!(G.P&&G.P.home&&G.P.home.pos&&G.P.home.pos[k]);
function applyHome(){const h=P.home||(P.home={bed:1});for(let y=0;y<HR.h;y++)for(let x=0;x<HR.w;x++)F(HR,x,y,T.WOOD);for(const k of ['bed','table','hearth','shelf','deco']){const t=h[k]||0;if(!t)continue;for(const [x,y] of homeRel(k,t))if(x>=0&&y>=0&&x<HR.w&&y<HR.h&&!(y===HR.h-1&&Math.abs(x-(HR.door.tx-HR.x0))<1))F(HR,x,y,T.PFURN);}G.homeV=(G.homeV||0)+1;}
G.applyHome=applyHome;
const comfort=()=>{const h=P.home||{};let c=0;for(const k in FURN)c+=(h[k]||0)*(k==='bed'?2:1);return c;};G.comfort=comfort;
// Freies Einrichten: Möbel kommen ins Inventar und werden im eigenen Haus frei aufgestellt
for(const k in FURN)FURN[k].t.forEach((v,t)=>{if(!v)return;STACK['f_'+k+t]={name:v[0],type:'furn',fk:k,ft:t,desc:`${FURN[k].n} (Stufe ${t}). In deinem Haus: auswählen und „Aufstellen“ – es landet auf dem Feld vor dir. Mit dem Schreinerhammer wieder abbauen.`,sell:Math.max(1,Math.round(v[1]*.35))};});
STACK.hammer={name:'Schreinerhammer',type:'tool',desc:'In der Hand halten: Rechtsklick (Handy: ✋ im Haus) öffnet dein Möbellager. Im eigenen Haus ein Möbelstück anvisieren und [F]/✋ drücken baut es ab.',price:60,sell:20};
const bestFurn=k=>{let b=P.home[k]||0;for(const id in P.furn||{})if(P.furn[id]>0&&STACK[id]&&STACK[id].fk===k)b=Math.max(b,STACK[id].ft);for(const it of P.inv)if(it&&it.stack&&STACK[it.id]&&STACK[it.id].fk===k)b=Math.max(b,STACK[it.id].ft);return b;};G.bestFurn=bestFurn;
function buyFurn(k){const f=FURN[k],cur=bestFurn(k),nx=f.t[cur+1];if(!nx){G.toast('Das ist schon die beste Stufe!','#ccc');return;}if(P.gold<nx[1]){G.toast(`Zu wenig Gold (${nx[1]} nötig)`,'#ff8a80');sfx('click');return;}P.gold-=nx[1];furnAdd('f_'+k+(cur+1));G.invDirty=true;sfx('coin');G.toast(`${f.ic} ${nx[0]} liegt jetzt in deinem Möbellager (nimmt keinen Inventarplatz weg). Im Haus: Hammer in die Hand und Rechtsklick (Handy: ✋) zum Aufstellen.`,'#ffd54a',true);G.save();}
function furnAdd(id,n){P.furn=P.furn||{};P.furn[id]=(P.furn[id]||0)+(n||1);}G.furnAdd=furnAdd;
const WALLF={hearth:1,shelf:1};const wallItem=(k,t)=>WALLF[k]||(k==='deco'&&(t===2||t===3))||(k==='lamp'&&t===2);
G.placeFurn=function(i,fromBox){const it=fromBox?(P.furn&&P.furn[i]>0?{id:i,count:P.furn[i],box:1}:null):P.inv[i];if(!it||!STACK[it.id]||STACK[it.id].type!=='furn')return false;if(G.room!==HR){G.toast('🏠 Möbel kannst du nur in deinem eigenen Haus aufstellen.','#ffcc80');return false;}
 const S=STACK[it.id],k=S.fk,t=S.ft;let ax=Math.floor(P.x/TILE)-HR.x0+Math.round(P.fx),ay=Math.floor(P.y/TILE)-HR.y0+Math.round(P.fy);if(wallItem(k,t))ay=0;
 const f0=FOOT[k](t);const fp=f0.length?homeRel(k,t,[ax,ay]):[[ax,ay]];
 if(f0.length&&fp.some(([x,y])=>x>=HR.w)){const sh=Math.max(...fp.map(q=>q[0]))-(HR.w-1);ax-=sh;}if(f0.length&&fp.some(([x,y])=>y>=HR.h)){const sh=Math.max(...fp.map(q=>q[1]))-(HR.h-1);ay-=sh;}
 const fp2=f0.length?homeRel(k,t,[ax,ay]):[[ax,ay]];const px=Math.floor(P.x/TILE)-HR.x0,py=Math.floor(P.y/TILE)-HR.y0,dx=HR.door.tx-HR.x0;
 const bad=fp2.some(([x,y])=>x<0||y<0||x>=HR.w||y>=HR.h||(y>=HR.h-2&&Math.abs(x-dx)<1)||(f0.length&&x===px&&y===py));
 let clash=false;if(f0.length)for(const k2 of ['bed','table','hearth','shelf','deco']){if(k2===k)continue;const t2=P.home[k2]||0;if(!t2)continue;for(const q of homeRel(k2,t2))if(fp2.some(([x,y])=>x===q[0]&&y===q[1]))clash=true;}
 if(bad||clash){G.toast(bad?'Hier ist kein Platz (Wand, Tür oder du stehst im Weg). Dreh dich zu einer freien Stelle.':'Da steht schon ein anderes Möbelstück. Bau es mit dem Hammer ab oder such dir einen anderen Platz.','#ff8a80');sfx('click');return false;}
 const old=P.home[k]||0;if(it.box){P.furn[i]--;if(P.furn[i]<=0)delete P.furn[i];}else{it.count--;if(it.count<=0)P.inv[i]=null;}if(old)furnAdd('f_'+k+old);P.home[k]=t;P.home.pos=P.home.pos||{};P.home.pos[k]=[ax,ay];applyHome();G.invDirty=true;sfx('door');
 G.toast(`${FURN[k].ic} ${S.name} aufgestellt!${old?` Das alte Stück liegt in deinem Möbellager.`:''}`,'#ffd54a',true);G.save();return true;};
// ===== Einrichtungsmodus (Rasterplan von oben) =====
const LDEF={1:[2,0],2:[5,0],3:[4,2]};
G.furnAnchor=k=>{const t=P.home[k]||0;if(!t)return null;const p=P.home.pos&&P.home.pos[k];if(p)return p.slice();const f=FOOT[k](t);if(f.length)return f[0].slice();if(k==='lamp')return (LDEF[t]||[2,0]).slice();if(k==='deco')return[5,0];return (HDEF[k]||[0,0]).slice();};
G.furnFoot=(k,t,ax,ay)=>{const f=FOOT[k](t);return f.length?homeRel(k,t,[ax,ay]):[[ax,ay]];};
G.furnSolid=(k,t)=>FOOT[k](t).length>0;
G.furnWall=(k,t)=>wallItem(k,t);
G.furnValid=(k,t,ax,ay)=>{if(wallItem(k,t)&&ay!==0)return false;const fp=G.furnFoot(k,t,ax,ay),dx=HR.door.tx-HR.x0;if(fp.some(([x,y])=>x<0||y<0||x>=HR.w||y>=HR.h))return false;if(!G.furnSolid(k,t))return true;if(fp.some(([x,y])=>y>=HR.h-2&&Math.abs(x-dx)<1))return false;
 for(const k2 of ['bed','table','hearth','shelf','deco']){if(k2===k)continue;const t2=P.home[k2]||0;if(!t2)continue;for(const q of homeRel(k2,t2))if(fp.some(([x,y])=>x===q[0]&&y===q[1]))return false;}return true;};
G.furnPut=(id,ax,ay)=>{const S=STACK[id];if(!S||!(P.furn&&P.furn[id]>0))return false;const k=S.fk,t=S.ft;if(!G.furnValid(k,t,ax,ay))return false;const old=P.home[k]||0;P.furn[id]--;if(P.furn[id]<=0)delete P.furn[id];if(old)furnAdd('f_'+k+old);P.home[k]=t;P.home.pos=P.home.pos||{};P.home.pos[k]=[ax,ay];applyHome();sfx('door');G.invDirty=true;G.save();return true;};
G.furnMoveTo=(k,ax,ay)=>{const t=P.home[k]||0;if(!t||!G.furnValid(k,t,ax,ay))return false;P.home.pos=P.home.pos||{};P.home.pos[k]=[ax,ay];applyHome();sfx('door');G.save();return true;};
G.HR=HR;
const hasHammerHeld=()=>{const h=P.inv[P.sel];return h&&h.id==='hammer';};G.hasHammer=()=>hasHammerHeld();
function furnAt(){let best=null,bd=60;for(const k in FURN){const t=P.home[k]||0;if(!t)continue;let tiles=G.homeFoot(k);if(!tiles.length){const p=G.homePos(k,k==='lamp'?(t===2?[5,0]:t>=3?[4,2]:[2,0]):k==='deco'?[5,0]:null);tiles=[p];}for(const [x,y] of tiles){const d=Math.hypot((x+.5)*TILE-P.x,(y+.5)*TILE-P.y);if(d<bd){bd=d;best={k:'furnpick',fk:k,x,y};}}}return best;}
G.pickFurn=function(fk){const t=P.home[fk]||0;if(!t)return;furnAdd('f_'+fk+t);P.home[fk]=0;if(P.home.pos)delete P.home.pos[fk];applyHome();G.invDirty=true;sfx('hit');G.toast(`🔨 ${FURN[fk].t[t][0]} abgebaut – liegt im Möbellager.`,'#ffd54a');G.save();};
G.sleepNow=()=>sleep();
function sleep(){const di=G.dayInfo();if(!(di.t>=430||di.t<40)){G.toast('😴 Du bist noch nicht müde. Ab dem Abend kannst du schlafen.','#ccc');return;}if(G.reviveNPCs)G.reviveNPCs();const n=Math.floor(P.dayT/DAYLEN);P.dayT=(di.t>=430?(n+1):n)*DAYLEN+28;const S=calc();P.hp=S.maxhp;P.sta=S.maxSta;P.mp=S.maxMp;P.poison=null;P.burn=null;const c=comfort();P.rested={until:P.dayT+680,b:Math.min(30,c)};G.sleepFx=2.6;G.mons=G.mons.filter(m=>m.room===undefined&&false);sfx('quest');
 setTimeout(()=>{G.toast(`☀ Guten Morgen! Ausgeruht: +${Math.min(30,c)} % Leben & Regeneration (Gemütlichkeit ${c})`,'#ffe9a0',true);if(P.pet&&(P.home.bed||0)>=5)G.toast(`😺 ${P.pet.name} hat sich die ganze Nacht neben dich gekuschelt.`,'#ffd0e0');else if(P.pet)G.toast(`🐱 ${P.pet.name} hat im ${P.home.basket?'Körbchen':'Eck'} geschlafen.`,'#ffd0e0');},900);G.save();}
// Schreiner & Angler
const mkN=(o)=>{o.x=o.hx=(o.tx+.5)*TILE;o.y=o.hy=(o.ty+.5)*TILE;o.fx=0;o.fy=1;o.wt=0;o.vx=0;o.vy=0;o.anim=0;NPCS.push(o);return o;};
mkN({id:'holger',name:'Schreiner Holger',short:'Holger',abs:1,tx:CARPB.door.tx+1,ty:CARPB.y+CARPB.h+1,look:{body:'#7a5a3a',skin:'#e0b890',hair:'#8a5a2a',beard:'#8a5a2a'},persona:'Gemütlicher, etwas brummiger Schreiner aus Eichenhain. Baut Betten, Tische und Kamine und liebt den Duft von frischem Holz.',greet:['Holz lebt, mein Freund.','Mein Hobel ist mein bester Freund.']});
const ANG=BUILD.find(b=>b.id==='angler');
mkN({id:'fiete',name:'Angler Fiete',short:'Fiete',abs:1,tx:110,ty:529,look:{body:'#3a4a5a',skin:'#d9a878',hair:'#9a9a8a',beard:'#9a9a8a',hat:'#4a5a3a'},persona:'Einsamer, wortkarger alter Angler, der im Schattenwald an seinem Weiher lebt. Redet gern über Fische, Köder und Katzen. Misstraut Städtern.',greet:['Psst. Du verscheuchst die Fische.','Heute beißen sie …']});
JOBS.holger=[['door:h7','saw',[6,10]],['home','idle',[3,5]],['door:h7','saw',[5,8]]];JOBS.fiete=[['home','fish',[12,20]],['door:angler','idle',[3,5]]];
SHOPS.fiete={n:'Fietes Angelkram',items:['bread','potion','arrow']};
const killsOf=s=>{let n=0;for(const k in P.kills||{})if(k.indexOf(s)>=0)n+=P.kills[k];return n;};
// Außentruhen
const OCH=[{id:'tut',tx:VCX+44,ty:VCY+6,loot:'small'},{id:'can1',tx:229,ty:459,loot:'canyon'},{id:'can2',tx:327,ty:472,loot:'canyon'},{id:'bait',tx:361,ty:474,loot:'bait'},{id:'summit',tx:G.SUMMIT.x+2,ty:G.SUMMIT.y-1,loot:'summit'},{id:'abbeyring',tx:146,ty:507,loot:'canyon'},{id:'pyrring',tx:535,ty:545,loot:'canyon'}];
for(const c of OCH){const t=tileAt(c.tx,c.ty);if(t!==T.LEDGE&&SOLIDS[t])map[c.ty*W+c.tx]=T.DIRT;}G.OCH=OCH;
function openOCH(c){P.och=P.och||{};if(P.och[c.id])return;P.och[c.id]=1;sfx('chest');const L=Math.max(P.level,zoneLevel(c.tx,c.ty)),D=G.D();const gold=n=>{P.gold+=n;G.floats.push({x:P.x,y:P.y-40,t:`+${n} Gold`,c:'#ffd54a',life:1});G.invDirty=true;};
 if(c.loot==='small'){gold(30);give(mkStack('potion',1));give(mkStack('arrow',20));G.toast('🦘 Gut gesprungen! Mit der Leertaste kommst du auf Felsstufen.','#ffe0a0',true);}
 else if(c.loot==='bait'){gold(30);P.q.anglerBait=1;G.toast('🎣 Fietes goldener Köder! Bring ihn zum Angler im Schattenwald.','#ffd54a',true);sfx('quest');}
 else if(c.loot==='summit'){gold(250);give(lootItem(pick(ALLK),L+3,4,{src:'Frostgipfel'}));}
 else{gold(rint(L*6,L*12));const rar=Math.max(2,rollRar(D.M));give(lootItem(pick(ALLK),L+D.ilvl+2,rar,{src:'Versteckte Truhe'}));if(Math.random()<.6)give(mkStack('potion2',1));}}
// Frostherz
function takeFrost(){if(P.frost){G.toast('❄ Das Frostherz pulsiert in deinem Gepäck.','#b3e5fc');return;}P.frost=1;sfx('quest');G.flashT=1;give(genItem('amulet',Math.max(P.level,18),4,{name:'Frostherz',f:'hp',ufx:{},ud:'Halbiert Drachenfeuer und Verbrennungen'}));G.toast('❄ Du hast das FROSTHERZ! Ignaroks Feuer kann dir jetzt nur noch halb so viel anhaben.','#81d4fa',true);G.save();}
// Angeln
const FISH={trout:['Forelle',30,4],carp:['Karpfen',35,5],salmon:['Lachs',55,9],pike:['Hecht',70,14],goldfish:['Goldfisch',10,120],cfish:['Schluchtforelle',80,25]};
for(const k in FISH){const f=FISH[k];STACK[k]={name:f[0],type:'food',heal:f[1],fish:1,desc:`Fisch: heilt ${f[1]} LP. Katzen lieben ${f[0]==='Goldfisch'?'ihn (aber er ist sehr wertvoll)':'ihn'}! Tippen zum Essen.`,price:f[2]*3,sell:f[2]};}
STACK.boot={name:'Alter Stiefel',type:'junk',desc:'Nass und muffig. Vielleicht kauft ihn jemand …',price:2,sell:1};STACK.kelp={name:'Seetang',type:'junk',desc:'Glitschig.',price:1,sell:1};
STACK.rod={name:'Angelrute',type:'tool',desc:'Auswählen und mit ⚔/Linksklick zum Wasser hin auswerfen. Zuckt der Schwimmer („!“), sofort nochmal drücken!',price:0,sell:8};
STACK.bottle={name:'Flaschenpost',type:'food',open:1,desc:'Eine verkorkte Flasche. Tippen zum Öffnen.',price:0,sell:5};
const isFish=id=>!!FISH[id];G.isFish=isFish;
function fishAct(){const f=G.fish;if(f){if(f.st==='bite'){catchFish();return;}G.fish=null;G.toast('Eingeholt.','#ccc');return;}
 let wt=null;for(let d=1.2;d<=3.6;d+=.4){const x=P.x+P.fx*d*TILE,y=P.y+P.fy*d*TILE,t=tileAt(Math.floor(x/TILE),Math.floor(y/TILE));if(t===T.WATER){wt={x,y,t};break;}}
 if(!wt){G.toast('🎣 Schau zum Wasser, um die Angel auszuwerfen.','#ccc');return;}P.swing=.22;G.fish={x:wt.x,y:wt.y,t:0,bite:rnd(2.5,7),st:'wait',bx:P.x,by:P.y};sfx('swing');}
function catchFish(){const f=G.fish;G.fish=null;const ctx=tileAt(Math.floor(f.x/TILE),Math.floor(f.y/TILE));const can=f.y/TILE>440&&f.y/TILE<490&&f.x/TILE>200&&f.x/TILE<400;const night=G.dayInfo().night,lk=1+(G.S.luck||0)/100+(P.pet?.05:0);const r=Math.random()/lk;let it=null,msg='';
 if(r<.035){const sp=Math.random();if(sp<.4){it=mkStack('bottle',1);msg='📜 Eine Flaschenpost!';}else if(sp<.75){it=genItem('ring',P.level+2,4,{name:'Ring des Anglerglücks',f:'luck',ufx:{crit:5},ud:'+5 % Krit, mehr Glück beim Angeln'});msg='💍 Etwas glänzt am Haken!';}else{it=genItem('weapon',P.level+2,3+(Math.random()<.3?1:0),{kind:'spear',name:'Dreizack der Tiefe',ufx:{slow:1},ud:'verlangsamt Gegner'});msg='🔱 Ein Dreizack aus der Tiefe!';}}
 else if(r<.14){if(Math.random()<.5){P.gold+=rint(10,60);msg='💰 Ein Beutel voller Münzen!';}else{it=Math.random()<.5?mkStack('potion',1):mkStack('mpotion',1);msg='🧪 Eine Flasche treibt herbei.';}}
 else if(r<.28){it=mkStack(Math.random()<.5?'boot':'kelp',1);msg='🥾 Nur Müll …';}
 else{const roll=Math.random()*lk*(night?1.25:1);const id=can&&Math.random()<.35?'cfish':roll>1.18?'goldfish':roll>1.05?'pike':roll>.85?'salmon':roll>.45?'carp':'trout';it=mkStack(id,1);msg=`🐟 ${STACK[id].name} gefangen!`;}
 if(it)give(it);G.toast(msg,'#81d4fa');sfx('pickup');P.q.fishN=(P.q.fishN||0)+1;for(let i=0;i<10;i++)G.parts.push({x:f.x+rnd(-8,8),y:f.y,z:4,vx:rnd(-50,50),vy:rnd(-80,-20),life:.5,c:'#9be7ff'});}
G.fishTick=dt=>{const f=G.fish;if(!f)return;const h=P.inv[P.sel];if(!h||h.id!=='rod'||P.dead||Math.hypot(P.x-f.bx,P.y-f.by)>TILE*2.5){G.fish=null;return;}f.t+=dt;if(f.st==='wait'&&f.t>=f.bite){f.st='bite';f.bt=0;sfx('bell');G.floats.push({x:f.x,y:f.y-20,t:'!',c:'#ffeb3b',life:.8});}else if(f.st==='bite'){f.bt+=dt;if(f.bt>.95){f.st='wait';f.t=0;f.bite=rnd(2.5,6);G.toast('💨 Der Fisch ist entwischt!','#ccc');}}};
// Katzen
const CATC=['#d08a3a','#2a2a2a','#9a9a9a','#e8e0d0','#a0582a','#5a4a3a'],CATN=['Mieze','Minka','Felix','Tiger','Luna','Schnurri','Pfote','Mohrle'];
function spawnCats(){G.CATS=[];for(let i=0;i<6;i++){for(let k=0;k<30;k++){const x=VCX+rint(-24,24),y=VCY+rint(-14,24);if(walkTile(x,y)&&!SOLIDS[tileAt(x,y)]&&tileAt(x,y)!==T.WATER){G.CATS.push({x:(x+.5)*TILE,y:(y+.5)*TILE,fx:0,fy:1,c:CATC[i%CATC.length],wt:0,path:null,anim:Math.random()*9,moving:false,sit:0});break;}}}}
G.spawnCats=spawnCats;
function catTick(c,dt,pet){c.anim+=dt;if(pet){const inR=!!G.room;const tx=P.x-P.fx*24,ty=P.y-P.fy*24+6,d=Math.hypot(tx-c.x,ty-c.y);if(c.room!==G.room||d>TILE*9){c.x=P.x-P.fx*20;c.y=P.y+14;c.room=G.room;}
  if(inR&&G.room===HR&&G.dayInfo().night&&(P.home.bed||0)>=5){const b=G.homeFoot('bed');if(b.length){c.x=(b[1][0]+.5)*TILE;c.y=(b[0][1]+.7)*TILE;c.moving=false;c.lie=1;return;}}c.lie=0;
  if(d>20){const sp=Math.min(d,(d>60?P.sprint?230:150:80)*dt);c.x+=(tx-c.x)/d*sp;c.y+=(ty-c.y)/d*sp;c.fx=(tx-c.x)/d;c.fy=(ty-c.y)/d;c.moving=true;}else c.moving=false;return;}
 if(c.scared>0){c.scared-=dt;c.sit=0;const dx=c.x-P.x,dy=c.y-P.y,d=Math.hypot(dx,dy)||1;if(d<TILE*7){const sp=140*dt,nx=c.x+dx/d*sp,ny=c.y+dy/d*sp;if(canMove(nx,ny,6)){c.x=nx;c.y=ny;}else if(canMove(nx,c.y,6))c.x=nx;else if(canMove(c.x,ny,6))c.y=ny;c.fx=dx/d;c.fy=dy/d;c.moving=true;}else c.moving=false;return;}
 if(c.path&&c.path.length){const [px,py]=c.path[0];const gx=(px+.5)*TILE,gy=(py+.5)*TILE,dx=gx-c.x,dy=gy-c.y,dd=Math.hypot(dx,dy),sp=34*dt;if(dd<=sp){c.x=gx;c.y=gy;c.path.shift();}else{c.x+=dx/dd*sp;c.y+=dy/dd*sp;c.fx=dx/dd;c.fy=dy/dd;}c.moving=true;return;}
 c.moving=false;c.wt-=dt;if(c.wt<=0){c.wt=rnd(3,9);c.sit=Math.random()<.5?1:0;if(Math.random()<.7){const tx=Math.floor(c.x/TILE)+rint(-5,5),ty=Math.floor(c.y/TILE)+rint(-5,5);if(dV(tx,ty)<RV-2)c.path=npcPath(c,tx,ty);}}}
function feedCat(c){const fid=['trout','carp','salmon','pike','cfish','goldfish'].find(id=>countItem(id)>0);if(!fid){G.toast('🐱 Die Katze schnurrt kurz … Mit Fisch könntest du sie zähmen!','#ffd0e0');for(let i=0;i<3;i++)G.parts.push({x:c.x,y:c.y-10,z:16,vx:rnd(-20,20),vy:-30,life:.8,c:'#ff8fb0'});return;}
 if(P.pet){G.toast(`🐱 Du hast schon ${P.pet.name}. Die Katze frisst trotzdem gern.`,'#ffd0e0');removeItem(fid,1);return;}
 removeItem(fid,1);c.trust=(c.trust||0)+(fid==='salmon'||fid==='pike'||fid==='cfish'||fid==='goldfish'?2:1);for(let i=0;i<6;i++)G.parts.push({x:c.x+rnd(-6,6),y:c.y-10,z:16,vx:rnd(-20,20),vy:-40,life:.9,c:'#ff6f9a'});
 if(c.trust>=3){const nm=pick(CATN);P.pet={c:c.c,name:nm};G.CATS=G.CATS.filter(q=>q!==c);G.PET={x:c.x,y:c.y,fx:0,fy:1,c:c.c,anim:0,room:G.room,pet:1};sfx('quest');G.flashT=.6;G.toast(`😻 Die Katze folgt dir jetzt! Du nennst sie „${nm}“. (+5 % Glück)`,'#ff8fb0',true);G.save();}
 else{G.toast(`🐟 Die Katze frisst und schnurrt … (${c.trust}/3 Vertrauen)`,'#ffd0e0');sfx('pickup');}}
// Tagesablauf der Dorfbewohner
for(const r of ROOMS){if(r.dungeon||r.player||r.kind==='barn')continue;let beds=0;for(let y=r.y0;y<r.y0+r.h;y++)for(let x=r.x0;x<r.x0+r.w;x++)if(tileAt(x,y)===T.BED)beds++;if(beds)continue;const want=r.b&&(r.b.id==='tavern'||r.b.id==='jarl')?3:r.b&&r.b.kind==='keep'?1:1;let placed=0;const fl=t=>t===T.WOOD||t===T.STONEF;
 for(let k=0;k<r.w&&placed<want;k++){const x=k%2?r.x0+r.w-1-Math.floor(k/2):r.x0+Math.floor(k/2);if(Math.abs(x-r.door.tx)<1)continue;const y=r.y0+r.h-2;if(fl(tileAt(x,y))&&fl(tileAt(x,y+1))&&tileAt(x,y+2)!==T.DOOR){map[y*W+x]=T.BED;map[(y+1)*W+x]=T.BED;placed++;}}}
const TAVS=BUILD.filter(b=>b.room&&(b.id==='tavern'||b.id==='jarl'||/taverne|schenke|gasthaus/i.test(b.name||'')));
function houseOf(n){if(n._house!==undefined)return n._house;if(n.id==='konrad'||n.id==='otto'){n._house=BUILD.find(b=>b.id==='guard')||null;if(n._house)return n._house;}let best=null,bd=12;const hx=n.hx/TILE,hy=n.hy/TILE;for(const b of BUILD){if(!b.room||b.kind==='barn'||b.wild&&b.id!=='angler'||b.player||b.kind==='chapel'&&n.id!=='anselm'||b.kind==='keep'&&!(n.id==='aldric'))continue;const d=Math.hypot(b.door.tx-hx,b.y+b.h-hy);if(d<bd){bd=d;best=b;}}if(n.id==='aldric')best=BUILD.find(b=>b.id==='keep');if(n.id==='anselm')best=BUILD.find(b=>b.id==='chapel')||best;n._house=best;return best;}
function tavOf(n){let best=null,bd=70;for(const b of TAVS){const d=Math.hypot(b.door.tx-n.hx/TILE,b.door.ty-n.hy/TILE);if(d<bd){bd=d;best=b;}}return best;}
const ROLE={hilda:['anvil','hammer'],bernd:['hearth','knead'],mara:['shelf','brew'],anselm:['altar','pray'],durin:['anvil','hammer'],holger:['table','saw'],aldric:['throne','sit'],samira:['throne','sit'],liv:['table','eat'],aldwin:['table','eat'],jarl:['throne','sit']};
const FT={bed:T.BED,table:T.TABLE,hearth:T.HEARTH,shelf:T.SHELF,altar:T.ALTAR,anvil:T.ANVIL,throne:T.THRONE,pew:T.PEW};
function phase(t){return t>=505||t<22?'sleep':t<75?'morning':t<370?'work':t<465?'social':'home';}
function want(n,t){const ph=phase(t),h=houseOf(n);if(n.id==='elara')return null;const day=Math.floor(((P&&P.dayT)||0)/DAYLEN),r=h2(n.id.length*31+n.id.charCodeAt(0),day,991);
 if(n.id==='otto'||n.id==='berta'&&false)return ph==='sleep'&&t>=600?{b:h,spot:'bed',act:'sleep'}:null;
 if(ph==='work')return null;if(!h)return ph==='sleep'?null:null;
 if(ph==='sleep')return{b:h,spot:n.child&&false?'any':'bed',act:'sleep'};
 if(ph==='social'){const tv=tavOf(n);if(tv&&r<.5&&!n.lord&&n.id!=='aldric')return{b:tv,spot:'table',act:'drink'};if(r<.72)return null;}
 const ro=ROLE[n.id];if(ro&&(ph!=='social'||r<.86))return{b:ro[0]==='altar'&&n.id==='anselm'?BUILD.find(b=>b.id==='chapel'):h,spot:ro[0],act:ro[1]};
 return{b:h,spot:r<.5?'table':r<.75?'hearth':'any',act:r<.5?'eat':'warm'};}
function spotIn(r,kind,n){const want=FT[kind];const c=[];for(let y=r.y0;y<r.y0+r.h;y++)for(let x=r.x0;x<r.x0+r.w;x++){const t=tileAt(x,y);if(want!=null&&t!==want)continue;if(want==null){if(!SOLIDS[t]&&t!==T.DOOR)c.push({fx:x,fy:y,sx:x,sy:y});continue;}for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const ax=x+dx,ay=y+dy;if(ax<r.x0||ay<r.y0||ax>=r.x0+r.w||ay>=r.y0+r.h)continue;const at=tileAt(ax,ay);if(!SOLIDS[at]&&at!==T.DOOR)c.push({fx:x,fy:y,sx:ax,sy:ay});}}
 if(!c.length)return null;const taken=new Set(NPCS.filter(q=>q!==n&&q.spot).map(q=>q.spot.sx+','+q.spot.sy+(kind==='bed'?'b'+q.spot.fx+','+q.spot.fy:'')));const free=c.filter(s=>!taken.has(s.sx+','+s.sy+(kind==='bed'?'b'+s.fx+','+s.fy:'')));const L=free.length?free:c;return L[Math.floor(h2(n.id.length,n.id.charCodeAt(1)||3,77)*L.length)%L.length];}
function goTo(n,x,y){n.path=npcPath(n,x,y)||[];n.moving=true;}
function stepPath(n,dt){if(!n.path||!n.path.length)return false;const [px,py]=n.path[0];const gx=(px+.5)*TILE,gy=(py+.5)*TILE,ddx=gx-n.x,ddy=gy-n.y,dd=Math.hypot(ddx,ddy);const sp=(n.child?62:44)*dt;if(dd<=sp){n.x=gx;n.y=gy;n.path.shift();}else{n.x+=ddx/dd*sp;n.y+=ddy/dd*sp;n.fx=ddx/dd;n.fy=ddy/dd;}n.moving=true;n.anim+=dt;return true;}
function clearPose(n){n.lie=0;n.sit=0;n.spot=null;n.ract=null;n.act=null;}
function enterB(n,b){const r=b.room;n.loc=r;n.x=(r.door.tx+.5)*TILE;n.y=(r.door.ty-.5)*TILE;n.path=[];}
function leaveB(n){const r=n.loc;n.loc=null;const b=r.b;n.x=(b.door.tx+.5)*TILE;n.y=(b.y+b.h+.6)*TILE;n.path=[];clearPose(n);n.job=null;}
G.routine=(n,dt,dn)=>{if(n.abs&&n.id==='elara')return false;const di=G.dayInfo(),w=want(n,di.t);const near=dn<TILE*40;
 if(!near){n._ft=(n._ft||0)-dt;if(n._ft>0)return !!(w||n.loc);n._ft=2.5;if(w&&w.b&&w.b.room){if(n.loc!==w.b.room){n.loc=w.b.room;}if(n.spot&&n.ract===w.act&&n.posed&&n.loc===w.b.room){n.path=[];return true;}const s=spotIn(n.loc,w.spot,n);clearPose(n);n.path=[];n.moving=false;if(s){n.spot=s;n.x=(s.sx+.5)*TILE;n.y=(s.sy+.5)*TILE;n.ract=w.act;applyPose(n,s);}return true;}if(n.loc){leaveB(n);n.path=[];}if(n.lord||n.id==='aldric'){n.x=n.hx;n.y=n.hy;}return false;}
 if(dn<70&&!n.lie&&(!n.path||!n.path.length)){n.moving=false;return !!(w||n.loc);}
 if(G.ui&&G.ui.dlgNpc===n){n.moving=false;return true;}
 if(!w||!w.b||!w.b.room){if(n.loc){const r=n.loc;if(n.lie||n.sit)clearPose(n);const tx=r.door.tx,ty=r.door.ty-1;if(Math.floor(n.x/TILE)===tx&&Math.floor(n.y/TILE)===ty){leaveB(n);return true;}if(!n.path||!n.path.length)goTo(n,tx,ty);if(!stepPath(n,dt)){n.x=(tx+.5)*TILE;n.y=(ty+.5)*TILE;}return true;}
  if((n.lord||n.id==='aldric')&&!JOBS[n.id]){const d=Math.hypot(n.x-n.hx,n.y-n.hy);if(d>8){if(!n.path||!n.path.length)goTo(n,Math.floor(n.hx/TILE),Math.floor(n.hy/TILE));if(!stepPath(n,dt)){n.x=n.hx;n.y=n.hy;}return true;}}return false;}
 const R0=w.b.room;
 if(n.loc!==R0){if(n.loc){const r=n.loc;if(n.lie||n.sit)clearPose(n);const tx=r.door.tx,ty=r.door.ty-1;if(Math.floor(n.x/TILE)===tx&&Math.floor(n.y/TILE)===ty){leaveB(n);return true;}if(!n.path||!n.path.length)goTo(n,tx,ty);if(!stepPath(n,dt)){n.x=(tx+.5)*TILE;n.y=(ty+.5)*TILE;}return true;}
  const b=w.b,tx=b.door.tx,ty=b.y+b.h;if(Math.abs(Math.floor(n.x/TILE)-tx)<=0&&Math.abs(Math.floor(n.y/TILE)-ty)<=1){enterB(n,b);return true;}n.act=null;n.job=null;if(!n.path||!n.path.length||n._goal!==b.id){n._goal=b.id;goTo(n,tx,ty);if(!n.path.length){n.x=(tx+.5)*TILE;n.y=(ty+.5)*TILE;}}if(!stepPath(n,dt)&&n.path&&!n.path.length&&!(Math.floor(n.y/TILE)>=ty-1)){n.x=(tx+.5)*TILE;n.y=(ty+.5)*TILE;}return true;}
 if(n.spot&&n.ract===w.act){if(!n.posed&&stepPath(n,dt))return true;if(!n.posed){n.path=[];applyPose(n,n.spot);}n.moving=false;poseAct(n,dt);return true;}
 clearPose(n);n.posed=0;const s=spotIn(R0,w.spot,n)||spotIn(R0,'any',n);if(!s)return true;n.spot=s;n.ract=w.act;goTo(n,s.sx,s.sy);if(!n.path.length){n.x=(s.sx+.5)*TILE;n.y=(s.sy+.5)*TILE;}return true;};
function applyPose(n,s){n.posed=1;const dx=s.fx-s.sx,dy=s.fy-s.sy,l=Math.hypot(dx,dy)||1;n.fx=dx/l||0;n.fy=dy/l||1;if(n.ract==='sleep'){n.lie=1;let top=s.fy;while(tileAt(s.fx,top-1)===T.BED)top--;const by=top+Math.floor((s.fy-top)/2)*2+1;n.x=(s.fx+.5)*TILE;n.y=(Math.min(by,s.fy+1)+.5)*TILE;if(tileAt(s.fx,Math.floor(n.y/TILE))!==T.BED)n.y=(s.fy+.5)*TILE;}else if(n.ract==='drink'||n.ract==='eat'||n.ract==='sit'){n.sit=1;if(n.ract==='sit'){n.x=(s.fx+.5)*TILE;n.y=(s.fy+.62)*TILE;n.fx=0;n.fy=1;}}n.act=n.ract==='hammer'?'hammer':n.ract==='saw'?'hammer':n.ract==='knead'?'hoe':n.ract==='brew'?'heal':n.ract==='pray'?'pray':null;n.moving=false;}
function poseAct(n,dt){n.moving=false;n.actT=(n.actT||0)+dt;if(n.actT>1.3){n.actT=0;if(n.lie)G.parts.push({x:n.x+8,y:n.y-14,z:22,vx:8,vy:-18,life:1.2,c:'#cfd8ff',txt:'z'});else if(n.ract==='drink'&&Math.random()<.3)G.parts.push({x:n.x,y:n.y-10,z:26,vx:0,vy:-20,life:.8,c:'#ffd54a'});else if(n.ract==='brew')G.parts.push({x:n.x+n.fx*12,y:n.y+n.fy*12,z:18,vx:0,vy:-30,life:.8,c:'#7fff9a'});else if(n.ract==='hammer'||n.ract==='saw'){for(let i=0;i<4;i++)G.parts.push({x:n.x+n.fx*14,y:n.y+n.fy*14,z:14,vx:rnd(-60,60),vy:rnd(-60,20),life:.3,c:n.ract==='saw'?'#c8a070':'#ffb04a'});}}}
G.npcPose=n=>n.lie?'lie':n.sit?'sit':null;
// ===================== Kriminalität: Diebstahl, Angriffe, Kopfgeld, Wachen =====================
const GUARDS=new Set(['otto','konrad','dieter','ilse','gerd','wache_frost','wache_moor','wache_wald','wache_sand']);
const isGuard=n=>!!n&&(GUARDS.has(n.id)||!!n.guard);G.isGuard=isGuard;
const QUESTNPC=()=>{const s2=new Set(['mara','aldric','elara','gunnar','hilda','bernd','greta','holger','fiete','liv','ragna','samira','aldwin','brann','konrad','otto']);for(const k in SQ)s2.add(SQ[k].npc);return s2;};
const killable=n=>!!n.town&&!SHOPS[n.id]&&!isGuard(n)&&!QUESTNPC().has(n.id);
const STEALT=new Set([T.BARREL,T.CRATE,T.SACK,T.SHELF]);
const dayNo=()=>Math.floor((P.dayT||0)/720);
function witnesses(){const out=[];for(const n of NPCS){if(n.dead||n.ko>0||n.lie||!G.npcVisible(n))continue;if(G.room?n.loc!==G.room:!!n.loc)continue;if(G.room||Math.hypot(n.x-P.x,n.y-P.y)<TILE*8)out.push(n);}out.sort((a,b)=>(isGuard(b)?1:0)-(isGuard(a)?1:0));return out;}
// Fahndungsstufe (Sterne) aus dem Kopfgeld; Wachen werden mit der Stufe stärker
const wanted=()=>{const b=P.bounty||0;return b<=0?0:b<100?1:b<250?2:b<500?3:b<900?4:5;};G.wanted=wanted;
const guardLvl=()=>Math.max(2,P.level+wanted());G.guardLvl=guardLvl;
const hostile=()=>P.bounty>0&&(wanted()>=2||!!P.guardHostile);G.guardHostile=hostile;
function jail(why){G.reviveNPCs();const fine=Math.floor(P.gold*.1);P.gold-=fine;P.bounty=0;P.guardHostile=0;P.dayT+=720;if(G.room){G.room=null;}P.x=SPAWN.x;P.y=SPAWN.y;P.prevX=null;G.mons.length=0;P.hp=Math.max(P.hp,Math.round((G.S||calc()).maxhp*.5));for(const n of NPCS)if(isGuard(n)){n.ghp=0;}G.toast(`⛓ ${why||''}Du hast einen Tag im Kerker verbracht${fine?` und ${fine} Gold Strafe gezahlt`:''}. Das Kopfgeld ist erlassen.`,'#ffcc80',true);G.save();}
G.jail=jail;
// Burgwache: steht immer in der Burg
{const keep=ROOMS.find(r=>r.id==='keep');if(keep&&!NPCS.find(n=>n.id==='wache_burg')){let bx=keep.x0+Math.floor(keep.w/2),by=keep.y0+Math.floor(keep.h/2),bd=1e9;const cx=keep.chests.length?keep.chests.reduce((a,c)=>a+c.tx,0)/keep.chests.length:bx,cy=keep.chests.length?keep.chests.reduce((a,c)=>a+c.ty,0)/keep.chests.length:by;const tx0=(cx+keep.door.tx)/2,ty0=(cy+keep.door.ty)/2;for(let y=keep.y0+1;y<keep.y0+keep.h-1;y++)for(let x=keep.x0+1;x<keep.x0+keep.w-1;x++){if(!walkTile(x,y)||SOLIDS[tileAt(x,y)])continue;if(x===keep.door.tx&&Math.abs(y-keep.door.ty)<2)continue;const d=Math.hypot(x-tx0,y-ty0);if(d<bd){bd=d;bx=x;by=y;}}
 NPCS.push({id:'wache_burg',name:'Burgwache Bertram',short:'Bertram',abs:1,tx:bx,ty:by,guard:1,lord:1,post:keep,look:{body:'#7a1b1b',skin:'#e8c0a0',helm:'#b0b6bc'},persona:'Burgwache in der Burg von Eichenhain. Pflichtbewusst, misstrauisch, lässt niemanden aus den Augen. Bewacht die Schatztruhen des Fürsten.',greet:['Ich behalte dich im Auge, Fremder.','Finger weg von den Truhen des Fürsten!','Die Burg steht unter dem Schutz des Fürsten.'],hx:(bx+.5)*TILE,hy:(by+.5)*TILE,x:(bx+.5)*TILE,y:(by+.5)*TILE,fx:0,fy:1,wt:0,vx:0,vy:0,anim:0,loc:keep});GUARDS.add('wache_burg');}}
function addBounty(v,why){P.bounty=Math.round((P.bounty||0)+v);G.toast(`🚨 ${why} Kopfgeld +${v} (gesamt ${P.bounty} Gold). Zahle es bei einer Wache.`,'#ff6b5a',true);sfx('horn');}
G.addBounty=addBounty;
function stealAt(t){const key=t.rid+':'+t.x+','+t.y;P.searched=P.searched||{};P.searched[key]=dayNo();sfx('pickup');
 const r=Math.random();let val=0;if(r<.42){const g=rint(2,12);P.gold+=g;val=g;G.floats.push({x:P.x,y:P.y-40,t:`+${g} Gold`,c:'#ffd54a',life:.9});}else if(r<.67){give(mkStack(pick(['bread','carrot','bread']),rint(1,2)));val=6;}else if(r<.77){give(mkStack('potion',1));val=15;}else if(r<.88){give(mkStack('arrow',rint(3,8)));val=6;}else{G.toast('Nichts Brauchbares gefunden.','#ccc');}
 const w=witnesses();if(w.length){const n=w[0];G.floats.push({x:n.x,y:n.y-46,t:'Dieb! Wachen!',c:'#ff5252',life:1.4});addBounty(20+val*2,`Diebstahl – ${n.short||n.name} hat dich gesehen!`);if(!isGuard(n))G.floats.push({x:n.x,y:n.y-60,t:'📣 Meldet es den Wachen!',c:'#ffcc80',life:1.6});}else if(val)G.toast('🤫 Niemand hat dich gesehen …','#b0bec5');G.save();}
function hitNPC(n,dmg){if(n.dead||n.ko>0)return;sfx('hit');if(isGuard(n)&&!hostile()){P.guardHostile=1;addBounty(80,`Angriff auf ${n.short||n.name}!`);n.ghp=0;return;}
 if(isGuard(n)&&hostile()){const gl=guardLvl(),mx=60+gl*22;if(!(n.ghp>0))n.ghp=mx;const d=Math.max(1,Math.round(dmg*rnd(.85,1.15)));n.ghp-=d;n.hitFlash=.15;if(G.settings.dmgNums)G.floats.push({x:n.x+rnd(-6,6),y:n.y-44,t:`${d}`,c:'#fff',life:.8});P.bounty+=5;if(n.ghp<=0){n.ghp=0;n.ko=60;n.lie=1;n.path=[];addBounty(60,`${n.short||n.name} niedergeschlagen!`);G.toast(`💫 ${n.short||n.name} ist bewusstlos.`,'#ffcc80');}return;}
 n.scared=6;n.hitCnt=(n.hitCnt||0)+1;G.floats.push({x:n.x,y:n.y-40,t:pick(['Au!','Hey!','Lass das!','Hilfe!']),c:'#ff8a80',life:.9});
 if(!P.npcWarn||G.time-P.npcWarn>90){P.npcWarn=G.time;n.hitCnt=0;G.toast('⚠ Vorsicht! Wer Bürger angreift, bekommt Kopfgeld und die Wachen jagen ihn.','#ffcc80',true);return;}
 addBounty(isGuard(n)?80:40,`Angriff auf ${n.short||n.name}!`);
 if(n.hitCnt>=4){n.hitCnt=0;if(killable(n)){n.dead=1;n.deadUntil=(P.dayT||0)+1080;n.loc=null;n.path=[];addBounty(250,`${n.name} ist tot!`);}else{n.ko=45;n.lie=1;n.path=[];G.toast(`💫 ${n.short||n.name} ist bewusstlos.`,'#ffcc80');}}}
G.hitNPC=hitNPC;
G.chestTheft=r=>{const w=witnesses();if(w.length){const n=w[0];G.floats.push({x:n.x,y:n.y-46,t:isGuard(n)?'Halt! Dieb!':'Dieb! Wachen!',c:'#ff5252',life:1.4});addBounty(r.id==='keep'?120:50,`Truhe geplündert – ${n.short||n.name} hat dich gesehen!`);}else G.toast('🤫 Niemand hat dich gesehen …','#b0bec5');};
function hitCat(c){sfx('hit');c.trust=0;c.scared=5;c.path=null;c.sit=0;G.floats.push({x:c.x,y:c.y-24,t:pick(['Miau!!','Fauch!','Mrrrau!']),c:'#ff8a80',life:.9});for(let i=0;i<5;i++)G.parts.push({x:c.x,y:c.y,z:6,vx:rnd(-60,60),vy:rnd(-60,60),life:.3,c:'#ddd'});addBounty(30,'Tierquälerei – du hast eine Katze angegriffen!');}
G.hitCat=hitCat;
G.reviveNPCs=()=>{for(const n of NPCS){if(n.dead){n.dead=0;n.x=n.hx;n.y=n.hy;n.loc=null;n.path=[];}if(n.ko>0||n.dead===0){n.ko=0;n.lie=0;}n.ghp=0;n.hitCnt=0;n.scared=0;}};
G.crimeTick=(n,dt,dn)=>{if(n.dead){if((P.dayT||0)>=(n.deadUntil||0)){n.dead=0;n.x=n.hx;n.y=n.hy;n.loc=null;n.lie=0;}return true;}
 if(n.ko>0){n.ko-=dt;n.moving=false;if(n.ko<=0){n.ko=0;n.lie=0;}return true;}
 const same=G.room?n.loc===G.room:!n.loc;
 if(n.post&&!(n.ko>0)){if(n.loc!==n.post){n.loc=n.post;n.x=n.hx;n.y=n.hy;}if(!(P.bounty>0&&G.room===n.post)){n.lie=0;n.sit=0;n.path=[];const dx=n.hx-n.x,dy=n.hy-n.y,d=Math.hypot(dx,dy);if(d>3){const sp=Math.min(d,70*dt);n.x+=dx/d*sp;n.y+=dy/d*sp;n.fx=dx/d;n.fy=dy/d;n.moving=true;n.anim+=dt;}else{n.moving=false;n.fx=0;n.fy=1;}return true;}}
 if(P.bounty>0&&isGuard(n)&&hostile()&&same&&!n.lie&&!P.dead&&dn<TILE*24&&!(G.ui&&G.ui.dlgNpc)){const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;n.sit=0;n.path=[];n.fx=dx/d;n.fy=dy/d;if(!P._hostT||G.time-P._hostT>30){P._hostT=G.time;G.toast(`⚔ Die Wachen (Stufe ${guardLvl()}) greifen dich an! Sprich eine Wache an, um dich zu ergeben.`,'#ff6b5a',true);}
  if(d<34){n.moving=false;n.gcd=(n.gcd||0)-dt;if(n.gcd<=0){n.gcd=1.15;n.swingAt=G.time;const gl=guardLvl(),raw=4+gl*1.6;if(P.hp<=raw*1.4&&!(P.invT>0)&&!(P.dodgeT>0)){jail(`${n.short||n.name} hat dich überwältigt. `);return true;}hitPlayer(raw,{lvl:gl,type:'melee',name:n.name});}return true;}
  n.gcd=Math.min(n.gcd||0,.5);const sp=150*dt;const nx=n.x+dx/d*sp,ny=n.y+dy/d*sp;if(canMove(nx,ny,10)||G.room){n.x=nx;n.y=ny;}else if(canMove(nx,n.y,10))n.x=nx;else if(canMove(n.x,ny,10))n.y=ny;n.moving=true;n.anim+=dt;if(!n._shout||G.time-n._shout>4){n._shout=G.time;G.floats.push({x:n.x,y:n.y-44,t:pick(['Ergib dich!','Halt, Verbrecher!','Im Namen des Fürsten!']),c:'#ff8a80',life:1.2});}return true;}
 if(P.bounty>0&&isGuard(n)&&same&&!n.lie&&!P.dead&&dn<TILE*16&&(G.time>(P.guardCd||0))&&!(G.ui&&G.ui.dlgNpc)){const dx=P.x-n.x,dy=P.y-n.y,d=Math.hypot(dx,dy)||1;n.sit=0;n.path=[];if(d<38){P.guardCd=G.time+25;P.guardHostile=1;n.moving=false;G.ui&&G.ui.openDialog&&G.ui.openDialog(n);return true;}const sp=150*dt;const nx=n.x+dx/d*sp,ny=n.y+dy/d*sp;if(canMove(nx,ny,10)||G.room){n.x=nx;n.y=ny;}else if(canMove(nx,n.y,10))n.x=nx;else if(canMove(n.x,ny,10))n.y=ny;n.fx=dx/d;n.fy=dy/d;n.moving=true;n.anim+=dt;if(!n._shout||G.time-n._shout>4){n._shout=G.time;G.floats.push({x:n.x,y:n.y-44,t:'Halt! Stehen bleiben!',c:'#ffcc80',life:1.2});}return true;}
 if(n.scared>0&&isGuard(n))n.scared=0;
 if(n.scared>0){n.scared-=dt;if(!same||n.lie)return false;const dx=n.x-P.x,dy=n.y-P.y,d=Math.hypot(dx,dy)||1;if(d<TILE*6){const sp=120*dt;const nx=n.x+dx/d*sp,ny=n.y+dy/d*sp;if(canMove(nx,ny,10)){n.x=nx;n.y=ny;n.moving=true;n.fx=dx/d;n.fy=dy/d;n.anim+=dt;}}return true;}
 return !!n.post;};
function guardDialog(n){const b=P.bounty,B=(l,f,c)=>({l,f,c}),st=wanted();return{t:`Halt, im Namen des Gesetzes! Auf deinen Kopf sind ${b} Gold ausgesetzt (Fahndungsstufe ${'★'.repeat(st)}). Bezahl, oder du wanderst in den Kerker.`,b:[
 B(`⚖ Kopfgeld bezahlen (${b} Gold)`,()=>{if(P.gold<b){G.toast(`Du hast nur ${P.gold} Gold.`,'#ff8a80');return;}P.gold-=b;P.bounty=0;P.guardHostile=0;for(const q of NPCS)if(isGuard(q))q.ghp=0;sfx('coin');G.toast('⚖ Kopfgeld bezahlt. Du bist wieder ein freier Bürger.','#a5d6a7',true);},1),
 B('⛓ Ins Gefängnis (Kopfgeld wird erlassen)',()=>jail(''),1),
 B('🏃 Fliehen',()=>{P.guardCd=G.time+12;P.bounty+=10;P.guardHostile=1;G.toast('🏃 Widerstand! Die Wachen greifen dich jetzt an.','#ff8a80');},1)]};}
// Ziel-Erweiterung: Truhen, Gipfel, Bett, Katzen
G.extraTarget=(best,bd)=>{if(G.room){if(G.room===HR&&hasHammerHeld()){const f=furnAt();if(f)return f;return{k:'furnbox'};}if(G.room===HR&&!hasHammerHeld()){for(const [x,y] of G.homeFoot('bed')){const d=Math.hypot((x+.5)*TILE-P.x,(y+.5)*TILE-P.y);if(d<Math.min(bd,50)){bd=d;best={k:'bed'};}}}
  for(const n of NPCS){if(n.loc!==G.room||n.dead)continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<Math.min(bd,52)){bd=d;best={k:'npc',n};}}
  {const r=G.room;if(r&&!r.player&&!r.dungeon&&r.b&&r.kind!=='stall'){const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE),dn=dayNo();for(let yy=pty-1;yy<=pty+1;yy++)for(let xx=ptx-1;xx<=ptx+1;xx++){if(!STEALT.has(tileAt(xx,yy)))continue;if(P.searched&&P.searched[r.id+':'+xx+','+yy]===dn)continue;const d=Math.hypot((xx+.5)*TILE-P.x,(yy+.5)*TILE-P.y);if(d<Math.min(bd,44)){bd=d;best={k:'steal',rid:r.id,x:xx,y:yy};}}}}for(const h of G.HORSES||[]){if(h.room!==G.room)continue;const d=Math.hypot(h.x+h.fx*28-P.x,h.y+h.fy*28-P.y);if(d<Math.min(bd,46)){bd=d;best={k:'horse',h};}}if(G.PET&&G.PET.room===G.room){}return best;}
 for(const c of OCH){if(P.och&&P.och[c.id])continue;const d=Math.hypot((c.tx+.5)*TILE-P.x,(c.ty+.5)*TILE-P.y);if(d<Math.min(bd,48)){bd=d;best={k:'och',c};}}
 {const d=Math.hypot((G.SUMMIT.x+.5)*TILE-P.x,(G.SUMMIT.y+.5)*TILE-P.y);if(d<Math.min(bd,60)){bd=d;best={k:'frost'};}}
 for(const c of G.CATS||[]){const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<Math.min(bd,44)){bd=d;best={k:'cat',c};}}for(const h of G.HORSES||[]){if(h.room)continue;const d=Math.hypot(h.x+h.fx*20-P.x,h.y+h.fy*20-P.y);if(d<Math.min(bd,52)){bd=d;best={k:'horse',h};}}return best;};
G.extraAct=t=>{if(t.k==='steal'){stealAt(t);return true;}if(t.k==='furnbox'){G.ui&&G.ui.openFurnBox&&G.ui.openFurnBox();return true;}if(t.k==='furnpick'){G.pickFurn(t.fk);return true;}if(t.k==='bed'){sleep();return true;}if(t.k==='och'){openOCH(t.c);return true;}if(t.k==='frost'){takeFrost();return true;}if(t.k==='cat'){feedCat(t.c);return true;}if(t.k==='horse'){patHorse(t.h);return true;}return false;};
G.extraPos=t=>t.k==='steal'?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:t.k==='furnbox'?{x:P.x,y:P.y}:t.k==='furnpick'?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:t.k==='och'?{x:(t.c.tx+.5)*TILE,y:(t.c.ty+.5)*TILE}:t.k==='frost'?{x:(G.SUMMIT.x+.5)*TILE,y:(G.SUMMIT.y+.5)*TILE}:t.k==='cat'?{x:t.c.x,y:t.c.y}:t.k==='horse'?{x:t.h.x+t.h.fx*20,y:t.h.y+t.h.fy*20}:t.k==='bed'?(()=>{const b=G.homeFoot('bed')[0];return{x:(b[0]+.5)*TILE,y:(b[1]+.5)*TILE};})():null;
G.extraLabel=t=>t.k==='steal'?['🖐','Stehlen']:t.k==='furnbox'?['📦','Möbellager']:t.k==='furnpick'?['🔨','Abbauen: '+FURN[t.fk].t[P.home[t.fk]||1][0]]:t.k==='horse'?['🐴','Streicheln']:t.k==='bed'?['🛏','Schlafen']:t.k==='och'?['🧰','Öffnen']:t.k==='frost'?['❄','Frostherz']:t.k==='cat'?(['trout','carp','salmon','pike','cfish','goldfish'].some(id=>countItem(id)>0)?['🐟','Füttern']:['🐱','Streicheln']):null;
// Dialoge
G.extraDialog=n=>{const q=P.q,B=(l,f,c)=>({l,f,c});
 if(isGuard(n)&&P.bounty>0)return guardDialog(n);
 if(n.id==='holger'){const b=[];if(countItem('hammer')<1)b.push(B('🔨 Schreinerhammer – 60 Gold',()=>{if(buy('hammer',1,60))G.toast('🔨 Halte den Hammer in der Hand und bau in deinem Haus Möbel ab, um sie neu zu stellen.','#ffd54a',true);setTimeout(()=>G.ui&&G.ui.openDialog(n),60);},0));for(const k in FURN){const f=FURN[k],cur=bestFurn(k),nx=f.t[cur+1];if(nx)b.push(B(`${f.ic} ${nx[0]} – ${nx[1]} Gold`,()=>{buyFurn(k);setTimeout(()=>G.ui&&G.ui.openDialog(n),60);},0));}
  return{t:`Na, ${P.level>=10?'Held':'Neuling'}? Dein Haus ist ja noch ziemlich ${comfort()<6?'leer':comfort()<15?'gemütlich':'prächtig'}. Ich zimmere dir, was du willst – du nimmst es mit und stellst es in deinem Haus auf, wo du magst. Mit meinem Schreinerhammer kannst du alles wieder abbauen und umstellen. Gemütlichkeit: ${comfort()}. (Du hast ${P.gold} Gold)`,b};}
 if(n.id==='fiete'){if(n.lie)return{t:'Zzz … hm? Die Fische schlafen auch, Junge. Komm morgen wieder.',b:[]};
  if(!q.angler)return{t:'Psst! Du verscheuchst die Fische. … Na gut, wo du schon da bist: Meine Angelschnur ist gerissen, und die beste Schnur macht man aus Spinnenseide. Erlege 6 Spinnen, dann knüpfe ich mir eine neue.',b:[B('Ich jage Spinnen für dich',()=>{q.angler='spiders';q.anglerK=killsOf('spider');G.toast('📜 Nebenquest: Fietes Angelschnur (6 Spinnen)','#ffd54a',true);},1)]};
  if(q.angler==='spiders'){const k=killsOf('spider')-q.anglerK;if(k<6)return{t:`${k} von 6 Spinnen. Die fetten sitzen im Finsterwald und in der Spinnenhöhle.`,b:[]};return{t:'Prächtige Seide! Jetzt fehlt nur mein goldener Köder. Der ist mir in die Schlucht im Süden gefallen, als ich übers Geröll gestiegen bin. Runter kommst du nur über die Kletterwände an den Schluchträndern, behalte deine Ausdauer im Auge!',b:[B('Ich hole den Köder',()=>{q.angler='bait';G.toast('📜 Fietes goldener Köder (Schlucht, klettern!)','#ffd54a',true);},1)]};}
  if(q.angler==='bait'){if(!q.anglerBait)return{t:'Der Köder liegt in der Schlucht, ganz im Osten, in einer alten Truhe. Kletterwände erkennst du an den Ranken und Seilen.',b:[]};return{t:'Mein Glücksköder! Hier, nimm meine zweite Angelrute. Wähle sie aus, schau aufs Wasser und wirf mit ⚔ aus. Wenn der Schwimmer zuckt, sofort einholen! Und noch was: Die Streunerkatzen in Eichenhain würden für Fisch alles tun. Ein paar Fische, und eine bleibt bei dir.',b:[B('Danke, Fiete!',()=>{q.angler='done';give(mkStack('rod',1));gainXP(Math.round(xpNeed(P.level)*.3));G.toast('🎣 Du hast eine ANGELRUTE!','#81d4fa',true);sfx('quest');},1)]};}
  return{t:pick([`${q.fishN||0} Fische hast du schon rausgezogen. ${(q.fishN||0)>30?'Respekt!':'Weiter so.'}`,'Nachts beißen die großen Hechte.','In der Schlucht schwimmen Forellen, die es sonst nirgends gibt.','Goldfische bringen ein Vermögen beim Händler.']),b:[]};}
 if(n.lie)return{t:pick(['Zzz … *gähn* … Was ist denn? Es ist mitten in der Nacht!','Hm? … Komm morgen wieder, ich schlafe.','*schnarch* … oh! Du hast mich erschreckt.']),b:[],keep:1};
 return null;};
G.extraMark=n=>{const q=P.q;if(n.id==='fiete')return !q.angler?'!':q.angler==='spiders'&&killsOf('spider')-q.anglerK>=6?'?':q.angler==='bait'&&q.anglerBait?'?':'';if(n.id==='holger')return '';return null;};
// ===== v9: Pferde & Koppel =====
const PEN={x0:309,y0:316,x1:316,y1:320};{const sb=BUILD.find(b=>b.id==='stable');if(sb){PEN.x0=sb.x-1;PEN.x1=sb.x+sb.w+1;PEN.y0=sb.y+sb.h+1;PEN.y1=PEN.y0+4;}
 let ok=true;for(let y=PEN.y0;y<=PEN.y1;y++)for(let x=PEN.x0;x<=PEN.x1;x++){const t=tileAt(x,y);if(SOLIDS[t]&&t!==T.TREE||t===T.WATER||t===T.DOOR)ok=false;}
 if(ok){for(let y=PEN.y0;y<=PEN.y1;y++)for(let x=PEN.x0;x<=PEN.x1;x++){const ring=x===PEN.x0||x===PEN.x1||y===PEN.y0||y===PEN.y1;map[y*W+x]=ring?T.PFENCE:(h2(x,y,5)<.15?T.FLOWER:T.GRASS);}}else PEN.none=1;}
G.PEN=PEN;
const HCOL=[['#7a4a26','#2a1a10'],['#2a2422','#141010'],['#d8d2c6','#efe9dc'],['#a0582a','#5a2a12'],['#8a7a6a','#3a3028']];
function spawnHorses(){G.HORSES=[];let ci=0;const mk=(x,y,fx,fy,room,pen)=>G.HORSES.push({x,y,fx,fy,c:HCOL[ci%5][0],mane:HCOL[ci++%5][1],room,pen,anim:Math.random()*9,moving:false,graze:Math.random()<.5?1:0,gt:0,wt:1+Math.random()*4,tx:x,ty:y,pat:0});
 for(const r of ROOMS){if(r.kind!=='barn'||r.id==='barn')continue;const boxes=r.id==='stable'?[0,3,9]:[0,6];for(const bx of boxes)mk((r.x0+bx+1)*TILE,(r.y0+1.95)*TILE,0,-1,r,null);}
 if(!PEN.none)for(let i=0;i<2;i++)mk((PEN.x0+2+i*3)*TILE,(PEN.y0+2.5)*TILE,i?-1:1,0,null,PEN);}
function horseTick(h,dt){h.anim+=dt*(h.moving?1:.3);if(h.pat>0)h.pat-=dt;h.gt-=dt;if(h.gt<=0){h.graze=h.room?(Math.random()<.6?1:0):(Math.random()<.7?1:0);h.gt=2+Math.random()*6;}
 if(!h.pen)return;if(h.moving){const dx=h.tx-h.x,dy=h.ty-h.y,d=Math.hypot(dx,dy),sp=24*dt;if(d<=sp){h.moving=false;h.wt=3+Math.random()*7;}else{h.x+=dx/d*sp;h.y+=dy/d*sp;const k=Math.min(1,dt*3);h.fx+=(dx/d-h.fx)*k;h.fy+=(dy/d-h.fy)*k;const l=Math.hypot(h.fx,h.fy)||1;h.fx/=l;h.fy/=l;}return;}
 h.wt-=dt;if(h.wt<=0&&h.pat<=0){const p=h.pen,o=G.HORSES.find(q=>q!==h&&q.pen);for(let k=0;k<8;k++){const nx=(p.x0+1.9+Math.random()*(p.x1-p.x0-2.8))*TILE,ny=(p.y0+1.9+Math.random()*(p.y1-p.y0-2.8))*TILE;if(o&&Math.hypot(nx-o.x,ny-o.y)<TILE*2.2)continue;if(Math.hypot(nx-h.x,ny-h.y)<TILE)continue;h.tx=nx;h.ty=ny;h.moving=true;h.graze=0;break;}if(!h.moving)h.wt=2;}}
function horseVisible(h){return h.room?G.room===h.room:!G.room;}
function patHorse(h){h.pat=3;h.graze=0;h.moving=false;h.wt=3;sfx('click');G.toast(pick(['🐴 Das Pferd schnaubt zufrieden und stupst dich an.','🐴 Es wiehert leise und lässt sich den Hals kraulen.','🐴 Das Pferd legt dir den Kopf auf die Schulter.','🐴 Weiches Fell, warme Nüstern. Es mag dich.']),'#e8d0a0');}
function horsePush(){for(const h of G.HORSES||[]){if(!horseVisible(h))continue;const hx=h.x,hy=h.y;if(Math.abs(hx-P.x)>TILE*2||Math.abs(hy-P.y)>TILE*2)continue;const L=.72*TILE;const ax=hx-h.fx*L,ay=hy-h.fy*L,bx=hx+h.fx*L,by=hy+h.fy*L;const vx=bx-ax,vy=by-ay;let t=((P.x-ax)*vx+(P.y-ay)*vy)/(vx*vx+vy*vy);t=Math.max(0,Math.min(1,t));const cx=ax+vx*t,cy=ay+vy*t;const dx=P.x-cx,dy=P.y-cy,d=Math.hypot(dx,dy),R=.42*TILE+10;if(d<R&&d>.01){const nx=cx+dx/d*R,ny=cy+dy/d*R;if(canMoveP(nx,ny,10)){P.x=nx;P.y=ny;}}}}
G.horseVisible=horseVisible;
G.smithStock=()=>{const day=Math.floor((P.dayT||0)/720);let st=P.smithStock;if(!st||st.day!==day||st.lvl!==P.level){const L=P.level||1,maxR=L<6?1:L<12?2:L<20?3:L<30?4:5,items=[];const keys=['sword','axe','mace','spear','dagger','greatsword','halberd','warhammer','bow','longbow','crossbow','ritter','waechter','waldlaeufer','magier','heiler','ring','amulet'].filter(k=>WKIND[k]||SETS[k]||k==='ring'||k==='amulet');
  for(let i=0;i<8;i++){const rr=Math.random();let r=rr<.45?0:rr<.75?1:rr<.9?2:rr<.97?3:4;if(i===0)r=maxR;r=Math.min(r,maxR);const it=lootItem(pick(keys),L,r,{});if(!it)continue;it.shopPrice=Math.round(sellPrice(it)*7/(1+r*.35)/5)*5;items.push(it);}
  st=P.smithStock={day,lvl:L,items};}return st.items;};
G.buyGear=i=>{const st=G.smithStock(),it=st[i];if(!it)return false;if(P.gold<it.shopPrice){G.toast('Nicht genug Gold','#ff8a80');return false;}if(!P.inv.some((s,k)=>k>=9&&!s)&&!P.inv.some(s=>!s)){G.toast('Kein Platz im Rucksack','#ff8a80');return false;}P.gold-=it.shopPrice;const c=Object.assign({},it);delete c.shopPrice;give(c);st.splice(i,1);sfx('coin');G.invDirty=true;return true;};
G.dev={mkStack,give,genItem,gainXP,STACK,RAR,BUILD,spawnHorses:()=>{G.HORSES=null;}};

// ===== v12.3: Waldpfad zum Angler & Entdeckungen =====
{const pts=[[100,475],[97,484],[102,493],[99,502],[104,511],[107,518],[106,525]];const carve=(x,y)=>{const t=tileAt(x,y);if(t===T.HOUSE||t===T.DOOR||t===T.WATER||t===T.BRIDGE||t===T.WAYSTONE||t===T.CHEST)return;if(SOLIDS[t]||t===T.DGRASS||t===T.GRASS||t===T.GRASS2)map[y*W+x]=T.DIRT;};
 for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2;for(let k=0;k<=n;k++){const f=k/n,x=Math.round(x0+(x1-x0)*f+Math.sin(f*6+i)*1.2),y=Math.round(y0+(y1-y0)*f);carve(x,y);carve(x+1,y);if(h2(x,y,77)<.5)carve(x-1,y);}}}
for(const b of BUILD){if(!b.room||!b.door)continue;for(let d=1;d<=2;d++){const x=b.door.tx,y=b.door.ty+d,t=tileAt(x,y);if(t===T.HOUSE||t===T.DOOR)continue;if(SOLIDS[t]||t===T.WATER||t===T.SWAMP||t===T.LAVA||t===T.ICE)map[y*W+x]=T.COBBLE;}}
const POI=[];G.POI=POI;
{const groundOf=b=>b==='winter'?T.SNOW:b==='desert'?T.SAND:b==='ash'?T.ASH:b==='waste'||b==='peaks'?T.DIRT:T.GRASS;
 const DEF=[[60,330,'skeleton','Gefallener Abenteurer','Ein Skelett in rostiger Rüstung umklammert noch seinen Beutel. Er hat es nicht aus dem Moor geschafft.'],
  [170,230,'stones','Alter Steinkreis','Uralte Steine stehen im Kreis. Man sagt, hier hätten die ersten Könige von Eldmar geschworen.'],
  [455,290,'camp','Verlassenes Jägerlager','Die Glut ist längst kalt. Wer hier lagerte, ist in großer Eile aufgebrochen.'],
  [520,250,'grove','Verborgene Lichtung','Sonnenlicht fällt durch die Baumkronen. Die Luft riecht nach Blüten, du fühlst dich erfrischt.'],
  [230,130,'cairn','Gipfelsteinmann','Wanderer haben hier Steine aufgeschichtet. In einen ist eingeritzt: „Der Drache schläft nie ganz.“'],
  [95,130,'stones','Frostkreis','Die Steine sind von Raureif überzogen, aber in der Mitte schmilzt der Schnee nie.'],
  [470,110,'skeleton','Verkohlte Überreste','Ein Abenteurer, der dem Drachen zu nahe kam. Seine Schätze hat das Feuer verschont.'],
  [300,470,'cairn','Grenzstein der Alten','Ein verwitterter Stein markiert die alte Grenze des Königreichs. Darunter ist etwas vergraben.'],
  [470,505,'camp','Karawanenrast','Eine verlassene Rast der Wüstenhändler. In einer Kiste liegt noch Ware.'],
  [60,470,'grove','Elfenlichtung','Glühende Pilze bilden einen Ring. Es heißt, wer hier rastet, kehrt gestärkt zurück.'],
  [185,500,'skeleton','Verirrter Pilger','Er suchte die Abtei und fand nur den Schattenwald.'],
  [360,385,'stones','Sonnenstein','Ein einzelner Stein, der mittags keinen Schatten wirft.']];
 const near=(x,y)=>BUILD.some(b=>x>b.x-8&&x<b.x+b.w+8&&y>b.y-8&&y<b.y+b.h+8)||TOWNS.some(t=>Math.hypot(t.x-x,t.y-y)<t.r+8)||Math.hypot(x-VCX,y-VCY)<40;
 DEF.forEach(([x0,y0,kind,name,text],i)=>{let best=null;for(let r=0;r<30&&!best;r+=2)for(let k=0;k<16&&!best;k++){const an=k/16*6.283,x=Math.round(x0+Math.cos(an)*r),y=Math.round(y0+Math.sin(an)*r);if(x<8||y<8||x>WW-8||y>H-8||near(x,y))continue;let wat=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const t=tileAt(x+dx,y+dy);if(t===T.WATER||t===T.LAVA||t===T.HOUSE||t===T.WAYSTONE||t===T.PATH||t===T.COBBLE)wat++;}if(!wat)best=[x,y];}
  if(!best)return;const [cx,cy]=best,g=groundOf(biome(cx,cy));for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){if(dx*dx+dy*dy>18)continue;map[(cy+dy)*W+cx+dx]=g;}
  const id='poi'+i;let chest=true;
  if(kind==='stones'){for(let k=0;k<8;k++){const an=k/8*6.283;map[(cy+Math.round(Math.sin(an)*3))*W+cx+Math.round(Math.cos(an)*3)]=T.ROCK;}}
  else if(kind==='cairn'){map[(cy-1)*W+cx]=T.RUIN;map[(cy-1)*W+cx+1]=T.ROCK;}
  else if(kind==='camp'){map[(cy-2)*W+cx-1]=T.TENT;map[cy*W+cx+2]=T.FIRE;map[(cy+1)*W+cx-2]=T.STUMP;}
  else if(kind==='skeleton'){map[cy*W+cx-1]=T.BONES;map[(cy+1)*W+cx+1]=T.BONES;}
  else if(kind==='grove'){for(let k=0;k<10;k++){const an=k/10*6.283;const x=cx+Math.round(Math.cos(an)*3),y=cy+Math.round(Math.sin(an)*3);map[y*W+x]=biome(cx,cy)==='dark'?T.MUSH:T.FLOWER;}chest=false;}
  if(chest)OCH.push({id:'c_'+id,tx:cx,ty:cy,loot:'canyon'});POI.push({id,name,text,kind,tx:cx,ty:cy});});}
let poiT=0;function poiTick(dt){poiT+=dt;if(poiT<.5||G.room)return;poiT=0;P.disc=P.disc||{};for(const p of POI){if(P.disc[p.id])continue;if(Math.hypot(P.x/TILE-p.tx,P.y/TILE-p.ty)<4.5){P.disc[p.id]=1;const n=Object.keys(P.disc).length;sfx('rare');gainXP(60+zoneLevel(p.tx,p.ty)*12);if(p.kind==='grove'){const S=G.calc();P.hp=S.maxhp;P.mp=S.maxMp;}G.toast(`✦ Entdeckt: ${p.name} (${n}/${POI.length})\n${p.text}`,'#ffe9a0',true);G.save();}}}
// Hooks
G.v8tick=dt=>{poiTick(dt);if(!G.HORSES)spawnHorses();for(const h of G.HORSES)if(h.room?G.room===h.room:(!G.room&&Math.hypot(h.x-P.x,h.y-P.y)<TILE*40))horseTick(h,dt);horsePush();G.fishTick(dt);if(!G.CATS)spawnCats();for(const c of G.CATS)if(!G.room&&Math.hypot(c.x-P.x,c.y-P.y)<TILE*30)catTick(c,dt,false);if(P.pet){if(!G.PET)G.PET={x:P.x,y:P.y+14,fx:0,fy:1,c:P.pet.c,anim:0,room:G.room,pet:1};catTick(G.PET,dt,true);}
 if(P.main===6&&!P.frost&&!P.q.frostHint){P.q.frostHint=1;G.toast('❄ Gunnar: „Ohne das Frostherz vom Frostgipfel verbrennt dich Ignarok! Klettere hinauf, ganz im Nordwesten der Frostlande.“','#81d4fa',true);}
 if(G.sleepFx>0)G.sleepFx-=dt;};
G.fishAct=fishAct;

{const _tp=G.targetPos,_tl=G.targetLabel;G.targetPos=t=>G.extraPos(t)||_tp(t);G.targetLabel=t=>G.extraLabel(t)||_tl(t);}
{const _ng=G.newGame;G.newGame=function(d){_ng(d);applyHome();G.CATS=null;G.PET=null;G.room=HR;P.x=(HR.door.tx+.5)*TILE;P.y=(HR.y0+3.5)*TILE;P.fx=0;P.fy=1;for(const n of NPCS){n.loc=null;clearPose(n);}};}
{const _ld=G.load;G.load=function(){const ok=_ld();if(ok){if(!P.home)P.home={bed:1};P.och=P.och||{};P.z=0;P.vz=0;applyHome();G.CATS=null;G.PET=null;}return ok;};}
})();
