'use strict';
(function(){
const G=window.G={};
// ===================== Hilfsfunktionen =====================
const h2=(x,y,s)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;};
const DX4=[1,-1,0,0],DY4=[0,0,1,-1];// Nachbarfelder ohne Array-Erzeugung
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
G.settings={mode:'3d',quality:'mid',diff:'normal',dmgNums:true,zoom:'normal',cam:'top',invX:'0',invY:'0',sens:'1',rd:'auto',win:'window',fps:'60',gui:'112',mini:'140',vMaster:80,vSfx:80,vMusic:55,vVoice:85,voices:'speech'};
try{const s=JSON.parse(localStorage.getItem(SETK)||'null');if(s)Object.assign(G.settings,s);}catch(e){}
// v23: alte GUI-Stufen auf die neue (etwas größere) Skala heben
if(!G.settings.guiV){G.settings.gui=({'85':'95','100':'112','120':'128','140':'145'})[G.settings.gui]||G.settings.gui;G.settings.guiV=23;}
G.saveSettings=()=>{try{localStorage.setItem(SETK,JSON.stringify(G.settings));}catch(e){}};
G.DIFF={
 leicht:{n:'Leicht',d:'Für Entdecker. Monster sind schwächer, du steigst schneller auf und Quests sind kürzer.',mhp:1,mdmg:1,xpN:.75,pen:.05,ilvl:0,N:[55.544,28,12,4,0.446,0.005],B:[26.596,35,25,11,2.394,0.006],M:[41.24,32,18,7.5,1.24,0.01],chM:.6,chN:.30,chB:.70,gold:1,goldLoss:0},
 normal:{n:'Normal',d:'Ausgewogen. Gegner über deiner Stufe sind gefährlich, und gute Ausrüstung ist Pflicht.',mhp:1.5,mdmg:1.45,xpN:1,pen:.09,ilvl:1,N:[52.539,29,13,5,0.441,0.009],B:[23.988,35,26,12,2.982,0.018],M:[37.485,32,20,9,1.485,0.015],chM:.62,chN:.30,chB:.72,gold:1.15,goldLoss:.1},
 schwer:{n:'Schwer',d:'Für Veteranen. Gnadenlose Gegner und längere Quests, dafür aber deutlich besserer Loot.',mhp:2.2,mdmg:2,xpN:1.35,pen:.12,ilvl:3,N:[43.347,31,17,7.5,1.103,0.023],B:[15.16,30,32,18,4.74,0.06],M:[26.96,32,25,13,2.96,0.04],chM:.7,chN:.36,chB:.82,gold:1.35,goldLoss:.2},
};
const DK=['leicht','normal','schwer'];
G.D=()=>G.DIFF[G.settings.diff]||G.DIFF.normal;
G.di=()=>Math.max(0,DK.indexOf(G.settings.diff));
const QD={prove:[4,6,8],lvR:[2,3,4],knut:[4,5,6],lvE:[4,5,6],hermit:[6,7,8],lvWo:[6,7,8],wolfmom:[8,9,10],lvA:[8,9,10],malrik:[10,11,12],lvN:[10,11,12],falk:[12,13,14],lvW:[13,14,15],grimelda:[15,16,17],lvO:[16,17,18],brakka:[18,19,20],lvMo:[18,19,20],moorkill:[8,10,12],lvWa:[20,21,22],gobkill:[10,14,16],lvG:[22,23,24],grukk:[23,24,25],lvM:[24,25,26],morvax:[25,26,27],lvL:[26,27,28],legion:[6,8,10],severin:[28,29,30],lvZ:[28,29,30],grimbart:[29,30,31],lvV:[2,2,2],lvF1:[29,30,31],lvF2:[29,30,31],jagd:[6,8,10],grimmholt:[30,31,32],lvWk:[30,31,32],lvDo:[31,32,33],dorn:[6,8,10],morwenna:[32,33,34],lvH:[31,32,33],schnitter:[32,33,34],eldtree:[33,34,35],sandking:[34,35,36],lvD:[35,36,37],dragon:[36,37,38],lvN1:[36,37,38],lvN2:[36,37,38],sucherkill:[10,12,14],lvN3:[37,38,39],queen:[38,40,41],lvN4:[39,40,40],garde:[8,10,12],valdrik:[41,42,43],wolves:[6,8,12],ears:[4,6,9],draugr:[6,8,12]};
const qd=k=>QD[k][G.di()];G.qd=qd;


// ===================== Welt =====================
const TILE=32,WW=1312,H=1152,W=WW+120,VCX=576,VCY=600,RV=48,CH=16,SEED=4242;
const T={GRASS:0,GRASS2:1,PATH:2,WATER:3,TREE:4,ROCK:5,SAND:6,COBBLE:7,HOUSE:8,FIELD:9,ASH:10,WALL:11,FLOWER:12,DEAD:13,SWAMP:14,LAVA:15,DIRT:16,WELL:17,CWALL:18,TOWER:19,TENT:20,FIRE:21,RUIN:22,BARRIER:23,CRYPT:24,CROP:25,VOID:26,WOOD:27,STONEF:28,IWALL:29,SWALL:30,DOOR:31,TABLE:32,BED:33,BARREL:34,SHELF:35,HEARTH:36,ANVIL:37,ALTAR:38,PEW:39,CARPET:40,CHEST:41,PILLAR:42,CRATE:43,THRONE:44,SNOW:45,ICE:46,GOLD:47,FWALL:48,WAYSTONE:49,CLIFF:50,CACTUS:51,MUSH:52,DGRASS:53,BONES:54,BURNT:55,STUMP:56,HERBS:57,BRIDGE:58,LEDGE:59,CLIMB:60,PFURN:61,HAY:62,STALL:63,STRAW:64,TROUGH:65,CART:66,SACK:67,PFENCE:68,OVEN:69,RACK:70,DUMMY:71,COUNTER:72,LOOM:73,CAULDRON:74,BENCH:75,ARMOR:76,DESK:77,GRIND:78,WHEEL:79,DIVAN:80,FUR:81,SLOTM:82,FELT:83,MISTW:84};
const SOLIDS=new Uint8Array(96);[T.WATER,T.TREE,T.ROCK,T.HOUSE,T.WALL,T.DEAD,T.LAVA,T.WELL,T.CWALL,T.TOWER,T.TENT,T.FIRE,T.RUIN,T.CRYPT,T.VOID,T.IWALL,T.SWALL,T.TABLE,T.BED,T.BARREL,T.SHELF,T.HEARTH,T.ANVIL,T.ALTAR,T.PEW,T.CHEST,T.PILLAR,T.CRATE,T.THRONE,T.FWALL,T.WAYSTONE,T.CLIFF,T.CACTUS,T.MUSH,T.STUMP,T.CLIMB,T.PFURN,T.HAY,T.STALL,T.TROUGH,T.CART,T.SACK,T.PFENCE,T.OVEN,T.RACK,T.DUMMY,T.COUNTER,T.LOOM,T.CAULDRON,T.BENCH,T.ARMOR,T.DESK,T.GRIND,T.WHEEL,T.DIVAN,T.SLOTM,T.FELT].forEach(t=>SOLIDS[t]=1);
const map=new Uint8Array(W*H),BIO=new Uint8Array(WW*H);
const BNAMES=['village','meadow','forest','swamp','waste','winter','ash','dark','desert','peaks','mist'];
const dV=(x,y)=>Math.hypot(x-VCX,y-VCY);
const TOWNS=[{id:'frost',name:'Frosthafen',x:300,y:190,r:23,gnd:'snow',wall:'wood',gates:[Math.PI/2,0]},
 {id:'glut',name:'Glutwacht',x:700,y:280,r:25,gnd:'ash',wall:'stone',gates:[Math.PI/2,-Math.PI/4]},
 {id:'moor',name:'Moorbruck',x:168,y:636,r:21,gnd:'swamp',wall:'wood',gates:[0,Math.PI/2]},
 {id:'wald',name:'Waldheim',x:1000,y:540,r:24,gnd:'forest',wall:'wood',gates:[Math.PI,Math.PI/2]},
 {id:'nebel',name:'Nebelwacht',x:1220,y:556,r:20,gnd:'mist',wall:'stone',gates:[Math.PI,Math.PI/2]},
 {id:'sand',name:'Sandfeste',x:940,y:1010,r:22,gnd:'sand',wall:'stone',gates:[-Math.PI*0.8,Math.PI/4]},
 // v20: neue Königreiche – Fellvolk (Tiermenschen), Walküren (Verbündete), Schwarzwall (feindlich)
 {id:'fell',name:'Rotfellhain',x:860,y:790,r:24,gnd:'forest',wall:'wood',gates:[2.36,-Math.PI/2],realm:'Fellvolk'},
 {id:'schild',name:'Schildhorst',x:500,y:84,r:23,gnd:'snow',wall:'stone',gates:[Math.PI/2],realm:'Walküren'},
 {id:'schwarz',name:'Schwarzwall',x:210,y:1050,r:23,gnd:'mist',wall:'stone',gates:[-1.71,0],hostile:1,realm:'Dornenreich'}];
const townHostile=t=>!!t&&!!t.hostile&&!(G.P&&G.pastStep&&G.pastStep('dorn'));G.townHostile=townHostile;
const townAt=(x,y)=>TOWNS.find(t=>Math.hypot(x-t.x,y-t.y)<t.r+.5);
G.SUMMIT={x:116,y:76,r:10};
const CANYON=[[428,904],[490,932],[556,940],[620,934],[690,956],[768,940]];
function segD(px,py,P){let best=1e9,bu=0,bi=0;for(let i=0;i<P.length-1;i++){const [ax,ay]=P[i],[bx,by]=P[i+1];const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let u=((px-ax)*dx+(py-ay)*dy)/L2;u=clamp(u,0,1);const d=Math.hypot(px-ax-dx*u,py-ay-dy*u);if(d<best){best=d;bu=u;bi=i;}}return [best,bi+bu];}
const canyonW=(x,y)=>{const n=noise(x/9,y/9,611);return 3.2+n*1.6;};
function biomeRaw(x,y){const d=dV(x,y);if(d<RV+1)return'village';const mx=x+(noise(x/70,y/70,405)-.5)*70;if(mx>1180)return'mist';
 const wx=x+(noise(x/110,y/110,401)-.5)*160+(noise(x/28,y/28,403)-.5)*36,wy=y+(noise(x/110,y/110,402)-.5)*160+(noise(x/28,y/28,404)-.5)*36;
 if(wy<300||y<264){if(wx<472)return'winter';if(wx<600)return'peaks';return'ash';}
 if(wy>884||y>924){if(wx<444)return'dark';if(wx<744)return'waste';return'desert';}
 if(wx<304)return'swamp';if(wx>864)return'forest';return'meadow';}
// v23 (Ladezeit): gleiche Berechnung wie biomeRaw, aber Gitterwerte des Rauschens werden zwischengespeichert (identisches Ergebnis, viel schneller)
(()=>{const mkNC=s=>{let lx=1e9,ly=1e9,a=0,b=0,c=0,d=0;return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y);if(xi!==lx||yi!==ly){lx=xi;ly=yi;a=h2(xi,yi,s);b=h2(xi+1,yi,s);c=h2(xi,yi+1,s);d=h2(xi+1,yi+1,s);}const xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};};
 const n405=mkNC(405),n401=mkNC(401),n403=mkNC(403),n402=mkNC(402),n404=mkNC(404),BI={};BNAMES.forEach((n,i)=>BI[n]=i);
 for(let y=0;y<H;y++)for(let x=0;x<WW;x++){let r;const d=dV(x,y);if(d<RV+1)r='village';else{const mx=x+(n405(x/70,y/70)-.5)*70;if(mx>1180)r='mist';else{
  const wx=x+(n401(x/110,y/110)-.5)*160+(n403(x/28,y/28)-.5)*36,wy=y+(n402(x/110,y/110)-.5)*160+(n404(x/28,y/28)-.5)*36;
  if(wy<300||y<264)r=wx<472?'winter':wx<600?'peaks':'ash';else if(wy>884||y>924)r=wx<444?'dark':wx<744?'waste':'desert';else r=wx<304?'swamp':wx>864?'forest':'meadow';}}BIO[y*WW+x]=BI[r];}})();
// v23 (Ladezeit): Glättung mit gleitendem Fenster statt 7×7-Zählung pro Feld – identisches Ergebnis
(()=>{const vi=BNAMES.indexOf('village'),NB=BNAMES.length;for(let it=0;it<2;it++){const src=BIO.slice();const col=new Int16Array(WW*NB),win=new Int16Array(NB);
 const addRow=(yy,s1)=>{if(yy<0||yy>=H)return;const o=yy*WW;for(let x=0;x<WW;x++){const b=src[o+x];if(b!==vi)col[x*NB+b]+=s1;}};
 for(let yy=0;yy<=3;yy++)addRow(yy,1);
 for(let y=0;y<H;y++){if(y>0){addRow(y+3,1);addRow(y-4,-1);}win.fill(0);let tot=0;for(let x=0;x<=3&&x<WW;x++)for(let k=0;k<NB;k++){win[k]+=col[x*NB+k];tot+=col[x*NB+k];}
  for(let x=0;x<WW;x++){if(x>0){const xa=x+3,xr=x-4;if(xa<WW)for(let k=0;k<NB;k++){const v=col[xa*NB+k];win[k]+=v;tot+=v;}if(xr>=0)for(let k=0;k<NB;k++){const v=col[xr*NB+k];win[k]-=v;tot-=v;}}
   const c=src[y*WW+x];if(c===vi)continue;let bb=c,bn=win[c];if(bn*2>tot){BIO[y*WW+x]=c;continue;}for(let k=0;k<NB;k++)if(win[k]>bn){bn=win[k];bb=k;}BIO[y*WW+x]=bb;}}}})();
function biome(x,y){x=Math.floor(x);y=Math.floor(y);if(x>=WW)return'interior';if(x<0||y<0||y>=H)return'waste';return BNAMES[BIO[y*WW+x]];}
const BL={meadow:'m',forest:'f',swamp:'s',waste:'w',winter:'i',ash:'a',village:'v',interior:'x',dark:'d',desert:'e',peaks:'p',mist:'n'};
// Gegnerstufe: wächst mit der Entfernung zum Dorf (Stufe 1 bis 40), je Region etwas verschoben
const ZOFF={meadow:-1,forest:0,swamp:0,waste:1,winter:1,peaks:2,dark:1,desert:-4,ash:0,mist:0},ZMIN={meadow:1,forest:6,swamp:8,waste:12,winter:14,peaks:18,dark:16,desert:16,ash:20,mist:30},ZMAX={meadow:16,forest:30,swamp:28,waste:30,winter:36,peaks:38,dark:32,desert:36,ash:39,mist:40};
function zoneLevel(x,y){if(x>=WW)return G.room&&G.room.dungeon?G.room.lvl:0;const b=biome(x,y);if(b==='village'||townAt(x,y))return 0;const base=1+Math.max(0,dV(x,y)-70)/16.5;return clamp(Math.round(base+ZOFF[b]),ZMIN[b],ZMAX[b]);}
const ZN={mist:'Nebellande',interior:'Innenraum',village:'Eichenhain',meadow:'Sonnenwiesen',forest:'Finsterwald',swamp:'Nebelmoor',waste:'Steinöde',winter:'Frostlande',ash:'Aschenberge',dark:'Schattenwald',desert:'Sengende Dünen',peaks:'Graukamm-Gebirge'};
const GC={mist:'#4f4a63',interior:'#3a2a1a',village:'#64933f',meadow:'#5f9440',forest:'#43742f',swamp:'#4a5e3c',waste:'#8a7b5c',winter:'#e8eef4',ash:'#4a3f3c',dark:'#2e4630',desert:'#d6c086',peaks:'#77786f'};
const CASTLE={x0:VCX-13,y0:VCY-41,x1:VCX+13,y1:VCY-16};
const inCastle=(x,y)=>x>=CASTLE.x0&&x<=CASTLE.x1&&y>=CASTLE.y0&&y<=CASTLE.y1;
const HILL={x:VCX,y:VCY-29,r:21,h:3.2};
const CAMP={x:1044,y:684},CRYPT={x:124,y:796},LAIR={x:1000,y:116},BANDITS={x:814,y:448},ASHVALE={x:744,y:412},RAUB={x:660,y:524},HUNT={x:900,y:852},LEGION={x:442,y:988},CITADEL={x:1226,y:758};
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
 // v22: größeres Eichenhain – Casino, Handwerkshof, Trankladen, neue Wohnhäuser
 {id:'casino',kind:'house',x:28,y:-6,w:8,h:4,roof:'#6a1a4a',name:'Casino „Goldene Krone“',sign:'🎰',chimney:1,status:3},
 {id:'cas1',kind:'house',x:32,y:4,w:4,h:3,roof:'#5a2a4a',name:'Villa Fortunato',status:3,annex:'garden'},
 {id:'cas2',kind:'house',x:30,y:-11,w:3,h:3,roof:'#4a2a3a',name:'Haus Kasimir',status:2},
 {id:'cas3',kind:'house',x:30,y:10,w:3,h:3,roof:'#6a3a4a',name:'Haus Bella',status:2},
 {id:'werk',kind:'house',x:-14,y:30,w:9,h:4,roof:'#7a5a2a',name:'Handwerkshof',sign:'🪚',chimney:1,status:2},
 {id:'trank',kind:'house',x:4,y:30,w:4,h:3,roof:'#3a6a5a',name:'Trankladen',sign:'🧪',annex:'garden',status:2},
 {id:'h10',kind:'house',x:14,y:28,w:4,h:3,roof:'#6a4a4a',name:'Pfarrhaus',status:1},
 {id:'h11',kind:'house',x:-24,y:26,w:4,h:3,roof:'#7a4a2a',annex:'garden',status:1},
 {id:'h12',kind:'house',x:34,y:16,w:4,h:3,roof:'#5a4a3a',annex:'woodpile',status:2},
];
BUILD.forEach(b=>{b.x+=VCX;b.y+=VCY;});
const TP=(id,dx,dy)=>{const t=TOWNS.find(q=>q.id===id);return{x:t.x+dx,y:t.y+dy};};
const SCHWC=TP('schwarz',6,-6);
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
tb('nhall','nebel',-3,-8,6,3,{roof:'#3a3448',name:'Halle der Nebelwacht',sign:'🛡️',stone:1,annex:'rack'});tb('n1','nebel',-9,0,3,3,{roof:'#4a4458',name:'Runenhaus',annex:'barrels'});tb('n2','nebel',5,0,4,3,{roof:'#3a3448',name:'Odos Lager',sign:'⚖️',annex:'barrels'});tb('n3','nebel',-4,6,4,3,{roof:'#4a4458',name:'Späherhaus',annex:'woodpile'});
tb('spal','sand',-4,-8,8,3,{roof:'#c9a060',name:'Palast der Fürstin',sign:'🌙',flat:1});
tb('s1','sand',-9,0,3,3,{roof:'#b89050',flat:1,annex:'barrels'});tb('s2','sand',5,0,4,3,{roof:'#c0a070',flat:1,name:'Basar',sign:'⚖️'});
// Update 13: Jede Stadt bekommt Markt, Bauernhof mit Feld und mehr Wohnhäuser
const TADD={
 frost:{stall:[-4,-4],farm:[3,-14],field:[6,-8],houses:[[-7,7,4,3,'Fischerkate'],[-9,-8,3,3,'Holzhauerhütte'],[4,7,3,3,'Webstube'],[-12,2,3,3,'Sigruns Haus']],roof:'#5a4a3a',snow:1},
 glut:{stall:[-4,-4],farm:[-6,-13],field:[4,-11],houses:[[-11,2,4,3,'Mannschaftshaus'],[8,2,3,3,'Quartiermeisterei'],[-11,-8,3,3,'Wachstube'],[-8,8,3,3,'Hannes Kate']],roof:'#4a3a34',stone:1},
 moor:{stall:[-4,3],farm:[9,-4],field:[4,-10],houses:[[-8,-8,4,3,'Flößerhaus'],[2,7,3,3,'Reetkate'],[-4,8,3,3,'Gesas Kate'],[-9,5,3,3,'Torfstecherhütte']],roof:'#4a5a3a',stilt:1},
 wald:{stall:[-5,-3],farm:[9,-4],field:[5,5],houses:[[-8,5,4,3,'Holzfällerhaus'],[-10,-4,3,3,'Jägerkate'],[-7,-10,3,3,'Ansgars Haus'],[5,-10,3,3,'Kräuterhütte']],roof:'#5a3a1a'},
 sand:{stall:[-2,-4],farm:[0,-14],field:[5,-8],houses:[[-6,7,4,3,'Weberei'],[-9,-7,3,3,'Wasserträgerhaus'],[6,4,3,3,'Leylas Haus'],[0,8,3,3,'Lehmhaus']],roof:'#b89050',flat:1},
 fell:{stall:[-4,-4],farm:[8,-6],field:[4,5],houses:[[-9,4,4,3,'Bau der Jäger'],[-10,-5,3,3,'Kräuterbau'],[-6,-11,3,3,'Webstube'],[9,0,3,3,'Schnitzerhütte']],roof:'#8a4a22'},
 schild:{stall:[-4,-4],farm:[8,-5],field:[4,5],houses:[[-9,4,4,3,'Federhalle'],[-10,-5,3,3,'Schildschmiede'],[-6,-11,3,3,'Rabenhorst'],[8,1,3,3,'Wachhaus']],roof:'#5a5a6a',snow:1,stone:1},
 schwarz:{stall:[-5,2],farm:[-5,9],field:[3,8],houses:[[-11,3,4,3,'Gesindehaus'],[-11,-6,3,3,'Köhlerkate'],[-8,-12,3,3,'Kerkerturm'],[9,3,3,3,'Hehlerei']],roof:'#2a2a32',stone:1}};
const TFIELDS=[],JOBS_ADD={},SHOP_ADD={};
for(const tid in TADD){const a=TADD[tid],ex={};for(const k of ['snow','stone','stilt','flat'])if(a[k])ex[k]=1;
 tb(tid+'_mkt',tid,a.stall[0],a.stall[1],3,2,{kind:'stall',roof:'#b03a2a',name:'Markt',sign:'⚖️'});
 tb(tid+'_farm',tid,a.farm[0],a.farm[1],4,3,Object.assign({roof:a.roof,name:'Bauernhof',sign:'🌾',annex:'pen'},ex));
 a.houses.forEach((h,i)=>tb(tid+'_h'+i,tid,h[0],h[1],h[2],h[3],Object.assign({roof:a.roof,name:h[4],annex:['woodpile','barrels','garden',null][i],chimney:i%2},ex)));
 const fp=TP(tid,a.field[0],a.field[1]);for(let y=0;y<3;y++)for(let x=0;x<5;x++)TFIELDS.push([fp.x+x,fp.y+y]);}
tb('fhall','fell',2,-9,6,3,{roof:'#7a3a1a',name:'Rotfellhalle',sign:'🦊',annex:'rack'});
tb('shall','schild',1,-10,8,4,{kind:'keep',roof:'#4a4a5a',name:'Walkürenburg',sign:'🪽',stone:1,snow:1,status:3,tx22:'keep'});
tb('dornkeep','schwarz',3,-13,8,4,{roof:'#1a1a22',name:'Dornenfeste',sign:'🥀',stone:1});
// v22: Tavernen, Burgen, Schmieden & Trankläden in den Städten – freie Plätze werden gesucht
function townSpot(tid,w,h){const t=TOWNS.find(q=>q.id===tid);const occ=(x,y)=>{for(const b of BUILD)if(x>=b.x-1&&x<=b.x+b.w&&y>=b.y-1&&y<=b.y+b.h+1)return true;for(const f of TFIELDS)if(f[0]===x&&f[1]===y)return true;return false;};
 let best=null;for(let rr=t.r-4;rr>=5&&!best;rr-=.5)for(let a=0;a<96;a++){const an=a/96*6.283+.2;{const x0=Math.round(t.x+Math.cos(an)*rr-w/2),y0=Math.round(t.y+Math.sin(an)*rr-h/2);let ok=true;
  for(let y=y0-1;y<=y0+h+2&&ok;y++)for(let x=x0-1;x<=x0+w&&ok;x++){const dx=x-t.x,dy=y-t.y;if(Math.hypot(dx,dy)>t.r-1.8||Math.abs(dx)<=1||Math.abs(dy)<=1||occ(x,y))ok=false;const aa=Math.atan2(dy,dx);if(ok&&t.gates.some(g=>Math.abs(((aa-g)+Math.PI*3)%(Math.PI*2)-Math.PI)<.35))ok=false;}
  if(ok){best={x:x0,y:y0};break;}}if(best)break;}return best;}
const TEXTRA={glut:['tav','smith'],moor:['tav'],wald:['tav','keep','potion'],nebel:['tav','smith'],sand:['tav','potion'],fell:['tav','keep'],schild:['tav','smith'],frost:[]};
const TXN={tav:['Taverne','🍺','#8b3a3a',6,3],keep:['Burg','🏰','#555b66',8,4],smith:['Schmiede','⚒️','#59606b',5,3],potion:['Trankladen','🧪','#3a6a5a',4,3]};
for(const tid in TEXTRA)for(const k of TEXTRA[tid]){const d=TXN[k],sp=townSpot(tid,d[3],d[4]);if(!sp){console.warn('kein Platz',tid,k);continue;}const tw=TOWNS.find(q=>q.id===tid);
 BUILD.push({id:tid+'_'+k,kind:k==='keep'?'keep':'house',x:sp.x,y:sp.y,w:d[3],h:d[4],roof:d[2],name:k==='keep'?'Burg '+tw.name:d[0],sign:d[1],chimney:k==='tav'||k==='smith'?1:0,stone:k==='keep'||TADD[tid]&&TADD[tid].stone?1:0,snow:TADD[tid]&&TADD[tid].snow?1:0,flat:TADD[tid]&&TADD[tid].flat?1:0,stilt:TADD[tid]&&TADD[tid].stilt&&k!=='keep'?1:0,annex:k==='smith'?'forge':k==='tav'?'barrels':null,status:k==='keep'?3:2,tx22:k});}
const WILD=[{id:'hut',kind:'hut',x:456,y:716,w:4,h:3,roof:'#3a2a1a',name:'Verlassene Jägerhütte',def:'boar'},
 {id:'cave',kind:'cave',x:1040,y:392,w:4,h:3,name:'Spinnenhöhle',def:'spider'},
 {id:'wtower',kind:'wtower',x:296,y:492,w:3,h:3,name:'Alter Wachturm',def:'skeleton'},
 {id:'mine',kind:'cave',x:592,y:1080,w:4,h:3,name:'Verlassene Mine',def:'golem'},
 {id:'icecave',kind:'cave',x:208,y:104,w:4,h:3,snow:1,name:'Eishöhle',def:'frostslime'},
 {id:'shrine',kind:'shrine',x:840,y:224,w:5,h:3,name:'Feuerschrein',def:'imp'},
 {id:'grotto',kind:'cave',x:552,y:936,w:4,h:3,name:'Schluchtgrotte',def:'orc',canyon:1},
 {id:'pyramid',kind:'pyramid',x:1052,y:1072,w:6,h:4,name:'Grab des Sandkönigs',def:'mummy'},
 {id:'abbey',kind:'wtower',x:300,y:1000,w:3,h:3,name:'Ruine der Abtei',def:'wraith',ruin:1},
 {id:'witchhut',kind:'hut',x:192,y:940,w:4,h:3,roof:'#2a2a1a',name:'Hexenkate',def:'witch'},
 {id:'dwarf',kind:'cave',x:524,y:184,w:4,h:3,name:'Zwergenbinge',def:'greydwarf',snow:1},
 {id:'banditcave',kind:'cave',x:806,y:418,w:4,h:3,name:'Räuberhöhle',def:'bandit'},
 {id:'cellar',kind:'hut',x:748,y:400,w:4,h:3,roof:'#2a2420',name:'Verkohlter Keller',def:'ghoul',burnt:1},
 {id:'wolfden',kind:'cave',x:460,y:448,w:4,h:3,name:'Wolfsbau',def:'wolf'},
 {id:'mistgate',kind:'shrine',x:1214,y:410,w:5,h:3,name:'Wurzeltor',def:'sucher'},
 {id:'angler',kind:'hut',x:466,y:558,w:4,h:3,roof:'#4a3a24',name:'Anglerhütte',peace:1}];
WILD.forEach(s=>{s.wild=1;BUILD.push(s);});
BUILD.forEach(b=>{b.door={tx:b.x+Math.floor(b.w/2),ty:b.y+b.h-1};});
const FIELD_POS=TFIELDS.slice();for(let y=-6;y<=-5;y++)for(let x=-14;x<=-12;x++)FIELD_POS.push([VCX+x,VCY+y]);for(let y=12;y<=16;y++)for(let x=-25;x<=-21;x++)FIELD_POS.push([VCX+x,VCY+y]);
const WAYS=[{id:'city',name:'Eichenhain',tx:VCX+3,ty:VCY+3}];TOWNS.forEach(t=>WAYS.push({id:t.id,name:t.name,tx:t.x+2,ty:t.y+2}));
WAYS.push({id:'w_ash',name:'Ruinen von Aschental',tx:ASHVALE.x+4,ty:ASHVALE.y+17,wild:1},{id:'w_gob',name:'Goblinlager',tx:CAMP.x-14,ty:CAMP.y+3,wild:1},{id:'w_cry',name:'Krypta im Nebelmoor',tx:CRYPT.x+12,ty:CRYPT.y-4,wild:1},{id:'w_leg',name:'Kriegslager',tx:LEGION.x+3,ty:LEGION.y+18,wild:1},{id:'w_lair',name:'Fuß des Goldbergs',tx:LAIR.x+3,ty:LAIR.y+22,wild:1},{id:'w_cit',name:'Vor der Nebelzitadelle',tx:CITADEL.x+3,ty:CITADEL.y+19,wild:1});
const ROADS=[
 [V(-37,0),[400,604],[300,612],[200,632],[192,636]],
 [[400,604],[376,480],[336,344],[304,220]],
 [V(37,0),[760,592],[880,572],[974,544]],
 [[760,592],[744,464],[744,428],[724,352],[702,308]],[[744,428],[752,408]],
 [[720,258],[800,216],[844,232]],[[848,234],[920,168],[1000,148]],
 [V(0,37),[580,800],[588,904],[584,940],[592,976],[612,1060],[612,1092],[596,1092]],[[584,940],[558,944]],
 [[580,800],[760,880],[880,972],[916,992]],
 [[580,800],[460,896],[352,972],[302,1010]],
 [[300,166],[236,124],[212,112]],[[330,190],[440,200],[528,194]],
 [[168,658],[144,740],[126,780]],[[1000,564],[1024,640],[1042,668]],[[1000,572],[1030,520],[1044,402]],
 [[880,572],[840,500],[814,462]],[[300,612],[298,502]],[[400,604],[440,690],[460,724]],[[200,632],[196,800],[196,948]],[[960,1032],[1020,1060],[1058,1082]]];
ROADS.push([[1000,562],[1060,578],[1140,566],[1204,557]]);
ROADS.push([[760,880],[806,842],[848,803]],[[860,772],[900,700],[960,620],[1000,572]],[[470,197],[486,150],[500,101]],[[196,948],[202,990],[207,1030]],[[229,1050],[268,1030],[302,1010]],[[880,808],[900,846]]);
const RLIST=[];
const HERALDRING=()=>{const ab=BUILD.find(b=>b.id==='abbey'),py=BUILD.find(b=>b.id==='pyramid');return[[ab.x+1,ab.y+5,9.2],[py.x+3,py.y+5,9.6]];};
const HERALDPOS=()=>{const ab=BUILD.find(b=>b.id==='abbey'),py=BUILD.find(b=>b.id==='pyramid');return{eldtree:{x:ab.x+1,y:ab.y+10},sandking:{x:py.x+3,y:py.y+10}};};G.HERALDPOS=HERALDPOS;
function gen(){
 map.fill(T.VOID);
 for(let y=0;y<H;y++)for(let x=0;x<WW;x++){
  const d=dV(x,y),b=biome(x,y),n=fbm(x*.62,y*.62,SEED),m=noise(x/3.2,y/3.2,SEED+50),r=h2(x,y,SEED+99),o=noise(x/30,y/30,SEED+7);let t=T.GRASS;
  if(b==='village'){t=r<.5?T.GRASS:T.GRASS2;if(r>.95)t=T.FLOWER;const cross=Math.abs(x-VCX)<=1||Math.abs(y-VCY)<=1;if(d<5||(cross&&d<RV-.4&&y>=CASTLE.y0))t=T.COBBLE;}
  else if(b==='meadow'){if(n<.26)t=T.WATER;else if(n<.29)t=T.SAND;else if(m>.78&&o>.35)t=T.TREE;else if(r<.004)t=T.ROCK;else t=r<.05?T.FLOWER:(r<.5?T.GRASS:T.GRASS2);}
  else if(b==='forest'){if(n<.25)t=T.WATER;else if(n<.28)t=T.SAND;else if(m>.52||r<.05)t=T.TREE;else if(r>.992)t=T.STUMP;else t=r<.5?T.GRASS:T.GRASS2;}
  else if(b==='swamp'){if(n<.34)t=T.WATER;else if(m>.66||r<.03)t=T.DEAD;else if(r>.985)t=T.MUSH;else t=T.SWAMP;}
  else if(b==='waste'){if(m>.66||r<.025)t=T.ROCK;else if(r>.993)t=T.BONES;else t=T.DIRT;}
  else if(b==='winter'){if(n<.3)t=T.ICE;else if(m>.6||r<.03)t=T.TREE;else if(r>.985)t=T.ROCK;else t=T.SNOW;}
  else if(b==='dark'){if(n<.24)t=T.WATER;else if(m>.48||r<.06)t=T.TREE;else if(r>.975)t=T.MUSH;else if(r>.965)t=T.BONES;else t=T.DGRASS;}
  else if(b==='desert'){if(n<.2&&o>.55)t=T.WATER;else if(r<.012)t=T.CACTUS;else if(m>.8&&r<.3)t=T.ROCK;else if(r>.994)t=T.BONES;else t=T.SAND;}
  else if(b==='mist'){const big=noise(x/9,y/9,SEED+61);if(n<.2)t=T.WATER;else if(big>.78||m>.7||r<.025)t=T.TREE;else if(r>.982)t=T.MUSH;else if(r>.976)t=T.BONES;else if(r>.972)t=T.ROCK;else t=T.DGRASS;}
  else if(b==='peaks'){const rg=noise(x/6,y/6,SEED+31);if(rg>.62)t=T.CLIFF;else if(m>.6||r<.05)t=T.ROCK;else t=(y<180||rg>.5)?T.SNOW:T.DIRT;}
  else{if(n<.3)t=T.LAVA;else if(m>.66||r<.03)t=T.ROCK;else if(r>.99)t=T.BONES;else t=T.ASH;}
  // Schlucht
  if(b==='waste'||b==='dark'||b==='desert'){const [dc]=segD(x,y,CANYON);const cw=canyonW(x,y);if(dc<cw)t=(r<.02)?T.ROCK:(r>.99?T.BONES:T.DIRT);else if(dc<cw+1.6)t=T.CLIFF;}
  if(inCastle(x,y)){const ex=x===CASTLE.x0||x===CASTLE.x1,ey=y===CASTLE.y0||y===CASTLE.y1;const gate=Math.abs(x-VCX)<=2&&y===CASTLE.y1;t=(ex&&ey)?T.TOWER:((ex||ey)&&!gate?T.CWALL:T.COBBLE);
   if(y===CASTLE.y1&&(Math.abs(x-VCX)===3||Math.abs(x-VCX)===4))t=T.TOWER;if((ex&&Math.abs(y-(CASTLE.y0+CASTLE.y1)/2)<1)||(ey&&Math.abs(x-VCX)===9))t=T.TOWER;if(Math.abs(x-VCX)<=2&&y>CASTLE.y0+8)t=T.COBBLE;}
  else if(b==='village'&&d>=RV-.6&&d<RV+.6&&!inCastle(x,y)){const gate=(Math.abs(x-VCX)<=1&&y>VCY)||Math.abs(y-VCY)<=1;t=gate?T.COBBLE:T.WALL;}
  if(x<3||y<3||x>=WW-3||y>=H-3)t=(b==='ash'||b==='waste'||b==='winter'||b==='peaks'||b==='desert')?T.CLIFF:T.TREE;
  map[y*W+x]=t;}
 const set=(x,y,t)=>{if(x>=3&&y>=3&&x<WW-3&&y<H-3)map[y*W+x]=t;};
 const get=(x,y)=>map[y*W+x];
 const road=(x,y)=>{if(dV(x,y)<RV-.5||inCastle(x,y)||townAt(x,y))return;const t=get(x,y),b=biome(x,y);if(t===T.FWALL||t===T.BARRIER)return;
  set(x,y,t===T.WATER||t===T.ICE||t===T.LAVA?T.BRIDGE:(b==='desert'?T.PATH:T.PATH));};
 for(const R of ROADS)for(let i=0;i<R.length-1;i++){const [ax,ay]=R[i],[bx,by]=R[i+1];const L=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/L,ny=(bx-ax)/L;for(let s=0;s<=L*2;s++){const u=s/(L*2),wb=Math.round(Math.sin((ax+ay+s*.5)*.12)*1.6*Math.min(1,s/6,(L*2-s)/6));const x=Math.round(ax+(bx-ax)*u+nx*wb),y=Math.round(ay+(by-ay)*u+ny*wb);road(x,y);road(x+1,y);road(x,y+1);road(x+1,y+1);RLIST.push(x,y);}}
 // Städte
 for(const tw of TOWNS){const gt={snow:T.SNOW,ash:T.ASH,swamp:T.SWAMP,forest:T.GRASS,sand:T.SAND,mist:T.DGRASS}[tw.gnd];
  for(let dy=-tw.r-3;dy<=tw.r+3;dy++)for(let dx=-tw.r-3;dx<=tw.r+3;dx++){const dd=Math.hypot(dx,dy),x=tw.x+dx,y=tw.y+dy;if(dd>=tw.r+2.6)continue;let t=gt;const a=Math.atan2(dy,dx);
   const nearGate=tw.gates.some(g=>{let da=Math.abs(((a-g)+Math.PI*3)%(Math.PI*2)-Math.PI);return da*dd<1.6;});const cross=Math.abs(dx)<=1||Math.abs(dy)<=1;
   if(dd<tw.r-1.2){if(cross)t=tw.gnd==='sand'?T.SAND:T.COBBLE;if(dd<3)t=T.COBBLE;if(tw.gnd==='forest'&&h2(x,y,3)<.06)t=T.FLOWER;}
   else if(dd<tw.r+.5){t=nearGate?T.COBBLE:(tw.wall==='stone'?T.CWALL:T.WALL);}
   set(x,y,t);}
  for(const g of tw.gates)for(let k=tw.r-1;k<=tw.r+4;k++)for(let s=-1;s<=1;s++){const x=Math.round(tw.x+Math.cos(g)*k-Math.sin(g)*s),y=Math.round(tw.y+Math.sin(g)*k+Math.cos(g)*s);if(k>tw.r+.6){if(get(x,y)!==T.WALL&&get(x,y)!==T.CWALL)set(x,y,T.PATH);}else set(x,y,T.COBBLE);}}
 if(true){const tw=TOWNS.find(t=>t.id==='nebel');for(const g of tw.gates)for(let s=-1;s<=1;s++)set(Math.round(tw.x+Math.cos(g)*tw.r-Math.sin(g)*s),Math.round(tw.y+Math.sin(g)*tw.r+Math.cos(g)*s),T.MISTW);}// v22: Nebelschleier
 { const g=TOWNS[1];[[-6,4],[6,5],[-4,8],[3,8]].forEach(([a,b])=>set(g.x+a,g.y+b,T.TENT));set(g.x-1,g.y+3,T.FIRE);}
 // Goblinlager & Banditenlager
 for(const [C,rr,wall] of [[CAMP,7,false],[BANDITS,8,true]]){for(let dy=-rr-1;dy<=rr+1;dy++)for(let dx=-rr-1;dx<=rr+1;dx++){const dd=Math.hypot(dx,dy);if(dd<rr-.5)set(C.x+dx,C.y+dy,T.DIRT);else if(wall&&dd<rr+.5&&!(Math.abs(dx)<=1&&dy>0))set(C.x+dx,C.y+dy,T.WALL);}
  [[-3,-2],[3,-3],[-3,3],[4,2]].forEach(([a,b])=>set(C.x+a,C.y+b,T.TENT));set(C.x,C.y,T.FIRE);}
 // Räuberlager (Sonnenwiesen) & Kriegslager der Schwarzen Legion (Steinöde)
 {const C=RAUB,rr=6;for(let dy=-rr-1;dy<=rr+1;dy++)for(let dx=-rr-1;dx<=rr+1;dx++){const dd=Math.hypot(dx,dy);if(dd<rr-.5)set(C.x+dx,C.y+dy,T.DIRT);else if(dd<rr+.5&&!(Math.abs(dx)<=1&&dy>0))set(C.x+dx,C.y+dy,T.WALL);}
  [[-3,-2],[3,-2],[-3,2]].forEach(([a,b])=>set(C.x+a,C.y+b,T.TENT));set(C.x,C.y,T.FIRE);}
 {const C=HUNT,rr=7;for(let dy=-rr-1;dy<=rr+1;dy++)for(let dx=-rr-1;dx<=rr+1;dx++){const dd=Math.hypot(dx,dy);if(dd<rr-.5)set(C.x+dx,C.y+dy,T.DIRT);else if(dd<rr+.5&&!(Math.abs(dx)<=1&&dy>0))set(C.x+dx,C.y+dy,T.WALL);}
  [[-3,-2],[3,-2],[-3,2]].forEach(([a,b])=>set(C.x+a,C.y+b,T.TENT));set(C.x,C.y,T.FIRE);}
 {const C=LEGION,rr=11;for(let dy=-rr-1;dy<=rr+1;dy++)for(let dx=-rr-1;dx<=rr+1;dx++){const dd=Math.hypot(dx,dy);if(dd<rr-.5)set(C.x+dx,C.y+dy,T.DIRT);else if(dd<rr+.5&&!(Math.abs(dx)<=1&&dy>0))set(C.x+dx,C.y+dy,T.CWALL);}
  [[-6,-4],[-2,-7],[3,-7],[7,-3],[-7,3],[6,4],[-4,7],[4,7]].forEach(([a,b])=>set(C.x+a,C.y+b,T.TENT));[[0,-1],[-4,1],[4,1]].forEach(([a,b])=>set(C.x+a,C.y+b,T.FIRE));set(C.x-2,C.y+rr,T.TOWER);set(C.x+2,C.y+rr,T.TOWER);}
 {const C=CITADEL,rr=12;for(let dy=-rr-1;dy<=rr+1;dy++)for(let dx=-rr-1;dx<=rr+1;dx++){const dd=Math.hypot(dx,dy);if(dd<rr-.5)set(C.x+dx,C.y+dy,(h2(C.x+dx,C.y+dy,77)<.18)?T.DIRT:T.COBBLE);else if(dd<rr+.5&&!(Math.abs(dx)<=1&&dy>0))set(C.x+dx,C.y+dy,T.CWALL);}
  [[-7,-6],[7,-6],[-8,4],[8,4]].forEach(([a,b])=>set(C.x+a,C.y+b,T.TOWER));[[-3,-4],[3,-4],[0,3]].forEach(([a,b])=>set(C.x+a,C.y+b,T.PILLAR));set(C.x-2,C.y+rr,T.TOWER);set(C.x+2,C.y+rr,T.TOWER);}
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
 const ruinBi=['meadow','forest','swamp','waste','winter','dark','desert','peaks','ash','mist'];G.RUINS=[];
 for(let i=0;i<300;i++){const x=6+Math.floor(h2(i,1,901)*(WW-12)),y=6+Math.floor(h2(i,2,901)*(H-12));const b=biome(x,y);if(ruinBi.indexOf(b)<0||dV(x,y)<RV+12||townAt(x,y)||TOWNS.some(t=>Math.hypot(x-t.x,y-t.y)<t.r+8))continue;
  let near=false;for(let k=0;k<RLIST.length;k+=2*25)if(Math.abs(RLIST[k]-x)<4&&Math.abs(RLIST[k+1]-y)<4){near=true;break;}if(near)continue;
  const kind=h2(i,3,901)<.35?'circle':'house';G.RUINS.push({x,y,kind,b});
  const gt=get(x,y);const ground=SOLIDS[gt]||gt===T.WATER?({desert:T.SAND,winter:T.SNOW,waste:T.DIRT,ash:T.ASH,dark:T.DGRASS,mist:T.DGRASS,swamp:T.SWAMP,peaks:T.DIRT}[b]||T.GRASS):gt;
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(Math.hypot(dx,dy)<4.5)set(x+dx,y+dy,ground);
  if(kind==='circle'){for(let k=0;k<9;k++){const a=k/9*6.283;if(h2(i,k,902)<.8)set(x+Math.round(Math.cos(a)*3.2),y+Math.round(Math.sin(a)*3.2),T.RUIN);}set(x,y,T.BONES);}
  else{const w=4+Math.floor(h2(i,4,901)*3),h=3+Math.floor(h2(i,5,901)*2);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){if(!(xx===0||yy===0||xx===w-1||yy===h-1))continue;if(h2(x+xx,y+yy,903)<.62)set(x-2+xx,y-2+yy,T.RUIN);}}}
 // Wildnis-Strukturen freiräumen
 for(const b of BUILD){if(!b.wild)continue;const bi=biome(b.x,b.y),gt={meadow:T.GRASS,forest:T.GRASS2,swamp:T.SWAMP,waste:T.DIRT,ash:T.ASH,winter:T.SNOW,dark:T.DGRASS,mist:T.DGRASS,desert:T.SAND,peaks:T.DIRT}[bi]||T.GRASS;for(let y=b.y-3;y<=b.y+b.h+3;y++)for(let x=b.x-3;x<=b.x+b.w+2;x++){const tt=get(x,y);if(SOLIDS[tt]||tt===T.WATER||tt===T.ICE||tt===T.LAVA)set(x,y,b.canyon?T.DIRT:gt);}}
 // ---- Sprung- & Kletterorte, Weiher, Gipfel ----
 {const AH=BUILD.find(b=>b.id==='angler'),P0={x:AH.x+2,y:AH.y+11};for(let dy=-6;dy<=6;dy++)for(let dx=-8;dx<=8;dx++){const d=Math.hypot(dx/1.3,dy)+noise((P0.x+dx)/3,(P0.y+dy)/3,77)*1.2;const x=P0.x+dx,y=P0.y+dy;if(d<4.2)set(x,y,T.WATER);else if(d<5.6)set(x,y,(h2(x,y,4)<.12)?T.FLOWER:T.DGRASS);}
  for(let y=P0.y-13;y<=P0.y-5;y++)for(let x=P0.x-6;x<=P0.x+4;x++){const t=get(x,y);if(SOLIDS[t]||t===T.WATER)set(x,y,T.DGRASS);}for(let x=P0.x-7;x<=P0.x+6;x++)if(!SOLIDS[get(x,P0.y-4)])set(x,P0.y-4,T.PATH);}
 for(const [cx,cy,rr] of HERALDRING())for(let dy=-11;dy<=11;dy++)for(let dx=-11;dx<=11;dx++){const d=Math.hypot(dx,dy);if(d<rr-.5||d>rr+.5)continue;const x=cx+dx,y=cy+dy,t=get(x,y);if(t===T.WATER||t===T.LAVA)continue;if(!SOLIDS[t]||t===T.TREE||t===T.ROCK||t===T.CACTUS||t===T.STUMP||t===T.DEAD)set(x,y,T.LEDGE);}
 {const S0=G.SUMMIT;for(let dy=-16;dy<=16;dy++)for(let dx=-16;dx<=16;dx++){const d=Math.hypot(dx,dy),x=S0.x+dx,y=S0.y+dy;if(d>15.5)continue;if(d<6.4)set(x,y,d<1.2?T.SNOW:(h2(x,y,6)<.08?T.ROCK:T.SNOW));else if(d<10.5){const climb=Math.abs(dx)<=1&&dy>0;set(x,y,climb?T.CLIMB:T.CLIFF);}else if(d<12)set(x,y,T.SNOW);}}
 for(let i=0;i<CANYON.length-1;i++){const [ax,ay]=CANYON[i],[bx,by]=CANYON[i+1];for(const u of [.3,.72]){const mx=ax+(bx-ax)*u,my=ay+(by-ay)*u,L=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/L,ny=(bx-ax)/L;for(const sd of [-1,1])for(let k=0;k<=9;k++)for(const w of [-1,0,1]){const x=Math.round(mx+nx*sd*k+(bx-ax)/L*w),y=Math.round(my+ny*sd*k+(by-ay)/L*w);if(get(x,y)===T.CLIFF)set(x,y,T.CLIMB);}}}
 {const tx=VCX+56,ty=VCY+6;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)set(tx+dx,ty+dy,T.LEDGE);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(Math.abs(dx)<=1&&Math.abs(dy)<=1)continue;const t=get(tx+dx,ty+dy);if(SOLIDS[t]||t===T.WATER)set(tx+dx,ty+dy,T.GRASS);}}
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
let BIGN=0;function makeRoom(b,w,h,floor,wall){const si=ROOMS.length;let ox=WW+8+(si%6)*18,oy=2+Math.floor(si/6)*15;if(w>16||h>13){ox=WW+8+(BIGN%2)*54;oy=700+Math.floor(BIGN/2)*34;BIGN++;}
 for(let y=oy;y<=oy+h+1;y++)for(let x=ox;x<=ox+w+1;x++){const edge=x===ox||y===oy||x===ox+w+1||y===oy+h+1;map[y*W+x]=edge?wall:floor;}
 const dx=ox+1+Math.floor(w/2),dy=oy+h+1;map[dy*W+dx]=T.DOOR;
 const r={id:b.id,name:b.name||'Wohnhaus',kind:b.kind,x0:ox+1,y0:oy+1,w,h,floor,door:{tx:dx,ty:dy},chests:[],b,dungeon:!!b.wild,ent:{x:(b.door.tx+.5)*TILE,y:(b.y+b.h+.65)*TILE}};
 if(r.dungeon)r.lvl=Math.max(2,zoneLevel(b.door.tx,b.door.ty+2)+1);ROOMS.push(r);b.room=r;return r;}
const F=(r,x,y,t)=>{map[(r.y0+y)*W+r.x0+x]=t;};
const CH_=(r,x,y,loot)=>{F(r,x,y,T.CHEST);r.chests.push({tx:r.x0+x,ty:r.y0+y,loot,opened:false,at:0});};
const LAYOUT={"cbarr": ["B.B.B.B.RR", "B.B.B.B..M", "..........", "TTTT....D.", "..........", "C........M", "bc...._.Rc"], "guard": ["B.B..RRM", "B.B.....", "........", "..TT..D.", "S.......", "SC....bc"], "gkeep": ["M.SPS..M", "........", ".TT...R.", ".TT...R.", "_......B", "C..._..B"], "gforge": ["HH.RR.bb", "........", ".A..G.t.", "........", "B......c", "B.....Cc"], "gbarr": ["B.B.B.SS", "B.B.B...", "........", "K....T.B", ".....T.B", "c.....C."], "smith": ["SHHH.RRb", "S.......", "S..A..G.", ".......t", "B......c", "B.....Cb"], "bakery": ["OHO..kkS", ".......S", ".TT.....", "........", "BNNN.NNc", "B....C.b"], "healer": ["SSK.SB", ".....B", ".TT...", ".....B", "C..._B"], "tavern": ["bbbNNNN.HS", "..........", "B.TT..TT.B", "B........B", "B.TT..TT.B", "B........B", "bc..._...C"], "jarl": ["S.H.Y..F.S", "I...._...I", ".TTT._.TTT", "....._....", ".TTT._.TTT", "B...._...B", "B..bc_cb.B"], "h1": ["BB..H.Lb", "BB......", "....TT..", "Z...TT..", ".......S", "c...._CS"], "h2": ["B.B..H.b", "B.B.....", ".....TT.", ".....TT.", "S......c", "S..._..C"], "h3": [".HK.SS.B", ".......B", ".TT.....", ".TT....b", "c......L", "C..._..b"], "h5": ["B..H..cc", "B.......", "..TT..W.", "..TT....", "S......F", "S..._.Cb"], "h6": ["SS.H..BB", "......BB", ".TT.....", ".TT..Z..", "b.......", "bc.._..C"], "h9": ["B.K.H.SS", "B.......", "...TT...", "...TT..L", "c.......", "C..._.bb"], "farm": ["B..H.kkk", "B......h", ".TT....h", ".TT.....", "b.......", "bc.._.Cc"], "h7": ["SS.H.ccc", "B.......", "B.WW..T.", "......T.", "c.......", "cC.._.W."], "h8": ["SSS.KPSB", ".......B", ".TT.....", ".TT..K..", "S.......", "SC.._..b"], "f1": ["B..H.bbb", "B.......", ".TT...F.", ".TT.....", "c.......", "C..._.bc"], "f2": ["B.RR.H.M", "B.......", "..F..WW.", ".TT.....", ".TT....c", "S..._.Cb"], "f3": ["SSPS.H.B", ".......B", ".TT..F..", ".TT.....", "A.......", "c..._.Cb"], "sven": ["SS.H.ccB", ".......B", "NNN..kkc", "........", "bb......", "cbc._..C"], "mhall": ["S.PSP.HB", ".......B", ".TTTT...", "._____..", ".TTTT...", "S..._..C"], "m1": ["B..HK..S", "B......S", "..TT....", "..TT..Z.", "b.......", "bc.._.Cc"], "m2": ["SSK.H..B", ".......B", ".TT..K..", ".TT.....", "S.......", "S..._.Cc"], "whall": ["RR..H.MB", ".......B", ".TTTT...", "...F....", ".TTTT..B", "c..._.CB"], "w1": ["B..H..SS", "B.......", ".F.TT...", "...TT..L", "c.......", "C..._.bb"], "w2": ["RRR.H..B", ".......B", ".WW..cc.", "........", ".TT....R", ".TT._.CR"], "spal": ["I.VY_.VI", "...___..", "I..___.I", ".V.___V.", "I..___.B", "C..___.B"], "s1": ["B..VV.SS", "B.......", "..___...", "..___.T.", "b.....T.", "bc.._..C"], "s2": ["kkkc.V.B", ".......B", ".NNN..k.", ".___....", ".___..V.", "c..._.Cb"]};
const LEG={'B':T.BED,'T':T.TABLE,'b':T.BARREL,'S':T.SHELF,'H':T.HEARTH,'A':T.ANVIL,'c':T.CRATE,'k':T.SACK,'h':T.HAY,'O':T.OVEN,'R':T.RACK,'D':T.DUMMY,'N':T.COUNTER,'L':T.LOOM,'K':T.CAULDRON,'W':T.BENCH,'M':T.ARMOR,'P':T.DESK,'G':T.GRIND,'Z':T.WHEEL,'V':T.DIVAN,'F':T.FUR,'_':T.CARPET,'I':T.PILLAR,'X':T.ALTAR,'Y':T.THRONE,'t':T.TROUGH,'$':T.SLOTM,'J':T.FELT};
const LOOTOF={smith:'smith',gforge:'smith',bakery:'bakery',healer:'healer',gbarr:'healer',h8:'healer',m2:'healer',tavern:'tavern',jarl:'tavern',guard:'guard',cbarr:'guard',gkeep:'guard'};
const STONEB={cbarr:1,gkeep:1,spal:1,gforge:1};
const LAY22={"casino": ["$.$.$.$.$.$.#S.P...S_C", "............#.......__", "............#V.......F", "____........#V....T...", "____........####.#####", "....JJJ............bbb", "....JJJ........N....bb", "...................NNN", "..JJJ..........T..T...", "..JJJ..........T..T...", ".....................b", "M..I...........I.....M", "M....................M"], "werk": ["SWW...S#M......M#SP...PS", "......c#........#.......", "c.....c#..I..I..#..TT...", "W......#........#..TT...", "W......#........#.......", "cc....b#b......b#S.....S", "###.########.#####.#####", "________................", "________................", "________..........T....b", "________..............bb"], "tavern": ["B.c#B.c#B.c#B.c#BB.T", "B..#B..#B..#B..#BB._", "...#...#...#...#...S", "S..#S..#S..#S..#....", "#.###.###.###.###.##", "bbbbb..............H", ".TTTTT..............", "............TT......", ".TT.................", "...........TT.......", "b.................TT", "b.................C."], "tav": ["B.c#B.c#BB.T", "B..#B..#BB._", "##.###.###.#", "bbb........H", ".......TT...", ".TT.........", ".......TT...", "b..........b", "b..........c"], "potion": ["SKS..SSS", "........", "..NNNN..", "........", "B......b", "B.....Cb"], "keep2": ["S..I...Y...I..S", "_______________", "..I.........I..", "..........#####", "..TT......#B..S", "..TT......#B...", "..........#.._.", "M.........+....", "M.........#..C.", "C.........#####"]};
// v22: Räume aus ASCII-Plänen bauen ('#' Innenwand, '+' Durchgang)
function layRoom(b,L,floor,wall,loot){const r=makeRoom(b,L[0].length,L.length,floor,wall);for(let y=0;y<L.length;y++)for(let x=0;x<L[0].length;x++){const ch=L[y][x];if(ch==='#')F(r,x,y,wall);else if(ch==='C')CH_(r,x,y,loot||'home');else if(LEG[ch]!=null)F(r,x,y,LEG[ch]);}return r;}
function bigKeep(b){const r=makeRoom(b,36,24,T.STONEF,T.SWALL),S=(x,y,t)=>F(r,x,y,t),wall=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)S(x,y,T.SWALL);};
 wall(8,0,8,10);wall(27,0,27,10);wall(0,11,35,11);wall(13,12,13,23);wall(22,12,22,23);wall(23,18,35,18);
 for(const [x,y] of [[17,11],[18,11],[13,16],[13,17],[22,14],[22,20],[8,5],[27,5],[4,11],[30,18]])S(x,y,T.STONEF);
 // Thronsaal
 S(17,1,T.THRONE);for(let y=2;y<=10;y++){S(17,y,T.CARPET);S(18,y,T.CARPET);}for(let y=12;y<=23;y++){S(17,y,T.CARPET);S(18,y,T.CARPET);}for(let x=15;x<=20;x++)S(x,1,x===17?T.THRONE:T.CARPET);
 [[11,3],[24,3],[11,7],[24,7],[14,5],[21,5]].forEach(([x,y])=>S(x,y,T.PILLAR));S(10,0,T.ARMOR);S(25,0,T.ARMOR);CH_(r,9,0,'keep');CH_(r,26,0,'keep');S(9,10,T.SHELF);S(26,10,T.SHELF);
 // Küche
 S(1,0,T.OVEN);S(2,0,T.OVEN);S(4,0,T.HEARTH);S(6,1,T.CAULDRON);S(3,4,T.TABLE);S(4,4,T.TABLE);S(3,7,T.TABLE);S(4,7,T.TABLE);S(0,9,T.SACK);S(0,10,T.SACK);S(1,10,T.BARREL);S(7,0,T.SHELF);S(7,9,T.BARREL);S(0,3,T.SHELF);
 // Waffenkammer
 S(29,0,T.RACK);S(31,0,T.RACK);S(33,0,T.RACK);S(35,2,T.ARMOR);S(35,4,T.ARMOR);S(35,6,T.ARMOR);S(31,6,T.DUMMY);S(34,10,T.CRATE);S(35,10,T.CRATE);S(28,10,T.ANVIL);
 // Festsaal
 for(let x=2;x<=10;x++){S(x,14,T.TABLE);S(x,20,T.TABLE);S(x,13,T.BENCH);S(x,21,T.BENCH);}S(6,12,T.HEARTH);S(0,23,T.BARREL);S(1,23,T.BARREL);S(12,23,T.BARREL);S(0,17,T.ARMOR);S(12,12,T.SHELF);for(let x=3;x<=9;x++)S(x,17,T.CARPET);
 // Flur
 [[15,14],[20,14],[15,19],[20,19]].forEach(([x,y])=>S(x,y,T.PILLAR));S(14,12,T.ARMOR);S(21,12,T.ARMOR);
 // Gemach des Fürsten
 S(33,12,T.BED);S(34,12,T.BED);S(33,13,T.BED);S(34,13,T.BED);S(25,12,T.DIVAN);S(35,16,T.SHELF);S(24,16,T.DESK);for(let y=14;y<=16;y++)for(let x=28;x<=31;x++)S(x,y,T.CARPET);S(35,12,T.LOOM);
 // Bibliothek
 for(const x of [23,24,25,26,28,29,31,32,33,34,35])S(x,19,T.SHELF);for(const x of [23,24,25,26,27,28,29,31,32,33,34,35])S(x,23,T.SHELF);S(28,21,T.DESK);S(32,21,T.DESK);S(25,21,T.CARPET);S(26,21,T.CARPET);
 r.name='Schloss Eichenhain';r.zones=[[9,0,26,10,'Thronsaal'],[0,0,7,10,'Schlossküche'],[28,0,35,10,'Waffenkammer'],[0,12,12,23,'Festsaal'],[14,12,21,23,'Schlossflur'],[23,12,35,17,'Gemach des Fürsten'],[23,19,35,23,'Bibliothek']];return r;}
function furnish(b){let r;const k=b.id;
 if(k==='keep'){bigKeep(b);return;}
 if(k==='h4'){r=makeRoom(b,24,13,T.WOOD,T.IWALL);return;}
 if(k==='casino'){r=layRoom(b,LAY22.casino,T.WOOD,T.IWALL,'tavern');r.zones=[[13,0,21,3,'Büro des Inhabers']];for(let y=8;y<=9;y++)for(let x=9;x<=11;x++)F(r,x,y,T.FELT);r.roul={x:r.x0+9,y:r.y0+8};return;}// v23: Roulette-Tisch
 if(k==='werk'){r=layRoom(b,LAY22.werk,T.WOOD,T.IWALL);r.zones=[[0,0,6,5,'Schreinerei Holger'],[8,0,15,5,'Gartenkunst Flora'],[17,0,23,5,'Baumeister Baldur'],[0,7,7,10,'Schaufenster']];r.show=[[1,7],[4,7]];return;}
 if(k==='tavern'){r=layRoom(b,LAY22.tavern,T.WOOD,T.IWALL,'tavern');r.guest=[r.x0+16,r.y0,r.x0+19,r.y0+3];r.zones=[[16,0,19,3,'Gästezimmer']];return;}
 if(b.tx22==='tav'){r=layRoom(b,LAY22.tav,T.WOOD,T.IWALL,'tavern');r.guest=[r.x0+8,r.y0,r.x0+11,r.y0+1];r.zones=[[8,0,11,1,'Gästezimmer']];return;}
 if(b.tx22==='potion'||k==='trank'){r=layRoom(b,LAY22.potion,T.WOOD,T.IWALL,'healer');return;}
 if(b.tx22==='smith'){r=layRoom(b,LAYOUT.smith,T.STONEF,T.IWALL,'smith');return;}
 if(b.tx22==='keep'){r=layRoom(b,LAY22.keep2,T.STONEF,T.SWALL,'keep');return;}
 if(b.kind==='house'&&!b.wild&&!LAYOUT[k]&&b.status!==1&&b.status!=null){const st=b.status;
  if(st===0){r=makeRoom(b,7,5,T.STRAW,T.IWALL);F(r,0,0,T.HAY);F(r,0,1,T.BED);F(r,5,0,T.HEARTH);F(r,6,0,T.SACK);F(r,6,1,T.BARREL);F(r,3,2,T.TABLE);F(r,6,3,T.CRATE);CH_(r,0,4,'home');return;}
  if(st===2){r=makeRoom(b,9,6,T.WOOD,T.IWALL);F(r,0,0,T.BED);F(r,1,0,T.BED);F(r,0,1,T.BED);F(r,1,1,T.BED);F(r,7,0,T.HEARTH);F(r,8,0,T.SHELF);F(r,4,0,T.SHELF);F(r,4,2,T.TABLE);F(r,5,2,T.TABLE);F(r,8,3,T.BARREL);for(let x=3;x<=6;x++)F(r,x,4,T.CARPET);F(r,0,4,T.DESK);CH_(r,8,5,'home');return;}
  if(st===3){r=makeRoom(b,11,7,T.WOOD,T.IWALL);F(r,0,0,T.BED);F(r,1,0,T.BED);F(r,0,1,T.BED);F(r,1,1,T.BED);F(r,9,0,T.HEARTH);F(r,10,0,T.SHELF);F(r,4,0,T.SHELF);F(r,5,0,T.SHELF);F(r,3,3,T.TABLE);F(r,4,3,T.TABLE);F(r,5,3,T.TABLE);F(r,10,3,T.DIVAN);F(r,10,4,T.DIVAN);F(r,0,5,T.DESK);F(r,0,3,T.ARMOR);for(let y=2;y<=5;y++)for(let x=7;x<=8;x++)F(r,x,y,T.CARPET);CH_(r,10,6,'home');return;}}
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
for(const b of BUILD){if(b.wild||b.status!=null)continue;const nm=b.name||'';b.status=/_farm$|^farm$/.test(b.id)||/Kate|Hütte|Bau\b|Torf/.test(nm)?0:/Handelshaus|Halle|Palast|Villa|Vogtshaus|Bäckerei|Schmiede|Alchemist|Basar|Feste|Jarl/.test(nm)||b.kind==='keep'?2:1;}
for(const b of BUILD)if(b.kind!=='mill'&&b.kind!=='stall')furnish(b);
const roomAt=(tx,ty)=>ROOMS.find(r=>tx>=r.x0-1&&tx<=r.x0+r.w&&ty>=r.y0-1&&ty<=r.y0+r.h);
G.ROOMS=ROOMS;G.roomAt=roomAt;G.room=null;
function hgt(x,y){if(x>WW+1)return 0;let h=0;{const sd=Math.hypot(x-G.SUMMIT.x-.5,y-G.SUMMIT.y-.5);if(sd<6.5)h+=7.2;else if(sd<11)h+=7.2*(.5+.5*Math.cos(Math.PI*(sd-6.5)/4.5));}const dc=Math.hypot(x-HILL.x,y-HILL.y);{const cdx=Math.max(CASTLE.x0-.5-x,0,x-CASTLE.x1-1.5),cdy=Math.max(CASTLE.y0-.5-y,0,y-CASTLE.y1-1.5),cd=Math.hypot(cdx,cdy);if(cd<10){const k=cd<=.6?1:.5*(1+Math.cos(Math.PI*Math.min(1,(cd-.6)/9.4)));h+=HILL.h*k;}}
 const dv=Math.hypot(x-VCX-.5,y-VCY-.5);let out=sm(RV,RV+8,dv)*(1-(dc<HILL.r+4?sm(HILL.r+4,HILL.r-2,dc):0));for(const tw of TOWNS){const dt=Math.hypot(x-tw.x,y-tw.y);out*=sm(tw.r+1,tw.r+7,dt);}
 const b=biome(x,y);
 if(out>0){h+=(noise(x/13,y/13,77)-.5)*1.7*out;h+=(noise(x/40,y/40,78)-.5)*2.2*out;
  if(b==='peaks'){const rg=noise(x/6,y/6,SEED+31);h+=(1.5+noise(x/9,y/9,91)*4.5+Math.max(0,rg-.45)*9)*out;}
  else if(y<320){h+=noise(x/7,y/7,88)*(x>600?2.4:1.6)*sm(330,280,y)*out;}
  if(b==='desert')h+=Math.sin(x*.21+noise(x/8,y/8,92)*4)*.45*out;}
 if(y>840){const [dcn]=segD(x,y,CANYON);const cw=canyonW(x,y);if(dcn<cw+3){const k=sm(cw+2.2,cw-.3,dcn);let ramp=0;for(let i=0;i<RLIST.length;i+=6){if(Math.abs(RLIST[i]-x)<3&&Math.abs(RLIST[i+1]-y)<3){ramp=1;break;}}h-=k*(ramp?2.2:3.6);}}
 const dl=Math.hypot(x-LAIR.x,y-LAIR.y);if(dl<24)h+=4.5*.5*(1+Math.cos(Math.PI*dl/24));
 return h;}
G.flags={barrier:false};
const tileAt=(tx,ty)=>(tx<0||ty<0||tx>=W||ty>=H)?T.ROCK:map[ty*W+tx];
const VDS=new Uint8Array(W*H);G.VDS=VDS;// v22: aufgestellte Möbel/Deko blockieren
const isSolidT=t=>SOLIDS[t]||(t===T.BARRIER&&!G.flags.barrier)||(t===T.MISTW&&!(G.mistOpen&&G.mistOpen()));
const walkTile=(tx,ty)=>!isSolidT(tileAt(tx,ty))&&!VDS[ty*W+tx];
// v21: Bäume blockieren nur am Stamm (kleiner Kreis) – Wälder sind durchquerbar
// am Baumstamm vorbeigleiten statt hängen zu bleiben
function treeSlide(nx,ny,sp){const P=G.P;const ax=P.x+nx*16,ay=P.y+ny*16,tx=Math.floor(ax/TILE),ty=Math.floor(ay/TILE);let best=null;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const qx=tx+dx,qy=ty+dy;if(tileAt(qx,qy)!==T.TREE)continue;const cx=(qx+.5)*TILE,cy=(qy+.62)*TILE,d=Math.hypot(cx-ax,cy-ay);if(!best||d<best.d)best={cx,cy,d};}if(!best)return;
 let px=-ny,py=nx;if((best.cx-P.x)*px+(best.cy-P.y)*py>0){px=-px;py=-py;}const sx=P.x+px*sp*.9+nx*sp*.3,sy=P.y+py*sp*.9+ny*sp*.3;if(canMoveP(sx,sy,10)){P.x=sx;P.y=sy;}}
const trunkHit=(px,py,tx,ty)=>{const dx=px-(tx+.5)*TILE,dy=py-(ty+.62)*TILE;return dx*dx+dy*dy<49;};
const solidPx=(px,py)=>{const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE),t=tileAt(tx,ty);if(VDS[ty*W+tx]&&tx>=0&&ty>=0&&tx<W)return true;if(t===T.TREE&&tx<WW)return false;return isSolidT(t);};
// Kreis gegen Stamm: zwischen zwei benachbarten Bäumen passt man immer hindurch
const trunkNear=(x,y,r)=>{const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE),lim=r*.6+5;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const qx=tx+dx,qy=ty+dy;if(qx>=WW||tileAt(qx,qy)!==T.TREE)continue;const ex=x-(qx+.5)*TILE,ey=y-(qy+.62)*TILE;if(ex*ex+ey*ey<lim*lim)return true;}return false;};
const canMove=(x,y,r)=>!solidPx(x-r,y-r)&&!solidPx(x+r,y-r)&&!solidPx(x-r,y+r)&&!solidPx(x+r,y+r)&&!trunkNear(x,y,r);
const solidPP=(px,py)=>{const tx0=Math.floor(px/TILE),ty0=Math.floor(py/TILE),t=tileAt(tx0,ty0);if(VDS[ty0*W+tx0]&&tx0>=0&&ty0>=0&&tx0<W)return true;const p=G.P;if(t===T.TREE&&tx0<WW)return false;if(t===T.LEDGE)return!(p&&(p.z>13||p.onLedge));if(t===T.CLIMB)return false;return isSolidT(t);};
const canMoveP=(x,y,r)=>!solidPP(x-r,y-r)&&!solidPP(x+r,y-r)&&!solidPP(x-r,y+r)&&!solidPP(x+r,y+r)&&!trunkNear(x,y,r);
const vDist=(px,py)=>Math.hypot(px/TILE-VCX-.5,py/TILE-VCY-.5);
const inSafe=(px,py)=>{if(px>=WW*TILE)return !(G.room&&G.room.dungeon);const tx=px/TILE,ty=py/TILE;if(vDist(px,py)<RV-.4||inCastle(Math.floor(tx),Math.floor(ty)))return true;return TOWNS.some(t=>!townHostile(t)&&Math.hypot(tx-t.x-.5,ty-t.y-.5)<t.r-.4);};
const monBlocked=(px,py)=>{const tx=px/TILE,ty=py/TILE;if(vDist(px,py)<RV+.6||inCastle(Math.floor(tx),Math.floor(ty)))return true;return TOWNS.some(t=>!townHostile(t)&&Math.hypot(tx-t.x-.5,ty-t.y-.5)<t.r+1.2);};
Object.assign(G,{TILE,WW,W,H,VCX,VCY,RV,CH,T,map,biome,BL,zoneLevel,dV,hgt,CASTLE,inCastle,HILL,CAMP,CRYPT,LAIR,BANDITS,ASHVALE,RAUB,LEGION,CITADEL,HUNT,SCHWC,CANYON,ZN,GC,BUILD,TOWNS,WAYS,tileAt,isSolidT,walkTile,solidPx,canMove,vDist,inSafe,townAt,SOLIDS});

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
const STACK={beer:{name:'Bier',type:'food',heal:5,beer:1,desc:'Frisch gezapftes Bier aus der Taverne. Prost! Ab 3 Bier bist du betrunken, ab 10 kippst du um.',price:6,sell:2},met:{name:'Honigmet',type:'food',heal:10,beer:2,desc:'Starker Honigmet – zählt wie 2 Bier.',price:14,sell:5},bread:{name:'Brot',type:'food',heal:40,desc:'Heilt 40 LP. Tippen zum Essen.',price:8,sell:3},carrot:{name:'Karotte',type:'food',heal:25,plant:'carrot',desc:'Heilt 25 LP. Kann auch nahe Wasser gepflanzt werden.',price:4,sell:2},
 potion:{name:'Heiltrank',type:'food',pct:.5,desc:'Heilt 50 % deiner LP und heilt Gift. Tippen zum Trinken.',price:30,sell:10},potion2:{name:'Großer Heiltrank',type:'food',pct:1,desc:'Heilt alle LP und alle Zustände.',price:90,sell:30},
 seed:{name:'Weizensaat',type:'seed',plant:'wheat',desc:'Pflanzen: auf Gras/Erde nahe Wasser (max. 4 Felder) oder auf Ackerfeldern.',price:2,sell:1},hseed:{name:'Heilkrautsamen',type:'seed',plant:'herb',desc:'Pflanzen nahe Wasser. Heilkraut wird bei Mara zu Heiltränken.',price:6,sell:2},
 arrow:{name:'Pfeile',type:'ammo',desc:'Munition für Bogen und Langbogen. Jeder Schuss verbraucht einen Pfeil.',price:1,pack:20,sell:0},bolt:{name:'Armbrustbolzen',type:'ammo',desc:'Munition für die Armbrust. Jeder Schuss verbraucht einen Bolzen.',price:2,pack:12,sell:0},
 mpotion:{name:'Manatrank',type:'food',mana:.6,desc:'Füllt 60 % deines Manas auf. Tippen zum Trinken.',price:25,sell:8},
 wheat:{name:'Weizen',type:'material',desc:'Für Bäcker Bernd.',sell:2},herb:{name:'Heilkraut',type:'material',desc:'3 Heilkraut → 1 Heiltrank bei Heilerin Mara.',sell:4},ear:{name:'Goblin-Ohr',type:'quest',desc:'Für Wache Otto.',sell:0}};
// ===== v21 (Teil 3A): Garten, Holz, Gerichte =====
const FOODC=[['salat','Salat','🥬',[35,55],'leaf','#7ccf4a',18,4],['rbete','Rote Bete','🟣',[40,60],'root','#8a1a3a',22,5],['radies','Radieschen','🔴',[25,40],'root','#e03a4a',12,3],['kohl','Kohl','🥬',[55,80],'leaf','#9ad07a',30,7],['tomate','Tomate','🍅',[45,70],'vine','#e8302a',20,5],['kuerbis','Kürbis','🎃',[70,100],'pumpkin','#f08a1a',45,12],['zwiebel','Zwiebel','🧅',[40,60],'root','#e0c080',14,4],['lauch','Lauch','🥬',[45,65],'tall','#d8f0b0',16,4],['mais','Mais','🌽',[55,85],'corn','#f0d040',24,6],['gurke','Gurke','🥒',[40,60],'vine','#3a8a2a',16,4],['ruebe','Rübe','🟤',[40,60],'root','#e8d0a0',20,5],['spinat','Spinat','🥬',[30,45],'leaf','#2e7a2a',14,4],['erdbeere','Erdbeeren','🍓',[40,65],'vine','#e02040',18,6],['paprika','Paprika','🫑',[45,70],'vine','#e8a020',18,5],['knoblauch','Knoblauch','🧄',[45,65],'root','#f0ece0',12,5]];
const FLOWC=[['sonnenblume','Sonnenblume','🌻','#f8c818'],['rose','Rose','🌹','#d81e3a'],['kornblume','Kornblume','💠','#3a6ae8'],['mohn','Mohn','🌺','#e8281e'],['lavendel','Lavendel','💜','#9a7ae0'],['tulpe','Tulpe','🌷','#f05a8a'],['gaensebl','Gänseblümchen','🌼','#ffffff'],['veilchen','Veilchen','🪻','#6a3ab0'],['ringelbl','Ringelblume','🏵️','#f89a1a'],['lilie','Lilie','⚜️','#f8f0f0']];
const TREEC=[['eiche','Eiche','oak'],['birke','Birke','birch'],['kiefer','Kiefer','pine'],['weide','Weide','willow'],['ahorn','Ahorn','maple'],['kirsche','Kirschbaum','cherry']];
for(const [id,n,ic,,,col,heal,sl] of FOODC){STACK[id]={name:n,type:'food',heal,ic,desc:`Frische Feldfrucht. Heilt ${heal} LP. Zutat für Gerichte beim Bäcker.`,price:sl*3,sell:sl,crop:1};STACK['s_'+id]={name:n+'-Samen',type:'seed',plant:id,ic:'🌱',desc:'Lebensmittel-Saat: Boden erst mit der Harke lockern, max. 3 Felder von Wasser entfernt säen, dann mit der Gießkanne gießen.',price:3+Math.round(sl*.6),sell:1};}
for(const [id,n,ic,col] of FLOWC){STACK['fl_'+id]={name:n,type:'material',ic,desc:'Frisch gepflückte Blume. Hübsch – und der Gärtner kauft sie.',sell:4,flower:1};STACK['f_'+id]={name:n+'-Samen',type:'seed',plant:'fl_'+id,ic:'🌸',desc:'Blumensaat: wächst überall auf Gras und Erde (auch außerhalb der Mauern), ohne Gießen. Nicht auf Wasser, Lava oder Wegen.',price:5,sell:1};}
for(const [id,n] of TREEC)STACK['t_'+id]={name:n+'-Setzling',type:'seed',plant:'tr_'+id,ic:'🌳',desc:'Setzling: auf Gras oder Erde mit etwas Platz drumherum pflanzen (auch außerhalb der Mauern). Wächst in etwa zwei Tagen zu einem Baum.',price:25,sell:6};
Object.assign(STACK,{harke:{name:'Harke',type:'tool',tool:'hoe',ic:'⛏️',desc:'In die Hand nehmen und auf ein Feld (3×3 um dich) klicken/tippen oder ⚔ drücken: lockert den Boden für Lebensmittel-Saat.',price:40,sell:12},
 kanne:{name:'Gießkanne',type:'tool',tool:'can',ic:'🚿',desc:'Gießt gesäte Felder (ein Guss hält einen Tag). Leer? Am Wasser auffüllen.',price:35,sell:10},
 axt:{name:'Holzfälleraxt',type:'tool',tool:'axe',ic:'🪓',desc:'In die Hand nehmen und auf Bäume schlagen: gibt Holz, Stöcke und manchmal Harz oder Setzlinge. Gefällte Bäume wachsen nach ein paar Tagen nach.',price:90,sell:25},
 holz:{name:'Holz',type:'material',ic:'🪵',desc:'Rohstoff vom Holzfällen. Noch ohne Handwerk – wird später gebraucht. Förster und Händler kaufen es.',sell:2,wood:1},
 stock:{name:'Stock',type:'material',ic:'🥢',desc:'Rohstoff vom Holzfällen. Noch ohne Handwerk – wird später gebraucht.',sell:1,wood:1},
 harz:{name:'Harz',type:'material',ic:'🟠',desc:'Seltener Rohstoff aus Baumrinde. Noch ohne Handwerk – wird später gebraucht.',sell:6,wood:1}});
// Gerichte vom Bäcker – zeitlich begrenzte Stärkungen (wie in Stardew Valley)
const BUFFN={spd:['💨','Tempo +15 %'],regen:['💚','Regeneration'],str:['💪','Stärke +15 %'],res:['🛡','Resistenz +15'],luck:['🍀','Glück +15'],sta:['⚡','Ausdauer +40'],hp:['❤','Leben +20 %'],mp:['🔮','Mana +40']};G.BUFFN=BUFFN;
const DISH=[['d_eintopf','Gemüseeintopf','🍲',{kohl:1,carrot:1,zwiebel:1},'regen',240,60],['d_salat','Gartensalat','🥗',{salat:1,tomate:1,gurke:1},'spd',240,35],['d_kuerbis','Kürbiskuchen','🥧',{kuerbis:1,wheat:2},'hp',300,50],['d_kraut','Kräuterbrot','🥖',{bread:1,knoblauch:1,herb:1},'res',300,45],['d_erdbeer','Erdbeertörtchen','🍰',{erdbeere:2,wheat:1},'luck',300,30],['d_mais','Maisfladen mit Paprika','🫓',{mais:1,paprika:1},'sta',300,40],['d_suppe','Rote-Bete-Suppe','🥣',{rbete:1,ruebe:1,radies:1},'str',240,45],['d_quiche','Spinatquiche','🥧',{spinat:1,lauch:1,wheat:1},'mp',300,40]];
for(const [id,n,ic,ing,bf,dur,heal] of DISH)STACK[id]={name:n,type:'food',heal,ic,buff:bf,dur,desc:`Heilt ${heal} LP und gibt ${Math.round(dur/60)} Min. ${BUFFN[bf][1]}.`,sell:Math.round(heal/3)+8};
G.DISH=DISH;
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
 if(type==='weapon'){const k=WKIND[o.kind]?o.kind:pick(Object.keys(WKIND));const K=WKIND[k];it.kind=k;it.dmg=Math.round(pw(ilvl)*M*K.m);pool=AFPOOL[K.cls];
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
 {const S0=it.stack&&STACK[it.id];if(S0&&S0.ic){if(it.type==='quest'){const gr=g.createRadialGradient(16,16,2,16,16,16);gr.addColorStop(0,'rgba(255,220,120,.55)');gr.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);}g.font='21px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(S0.ic,16,17);if(it.type==='quest'){g.fillStyle='#ffd54a';g.font='bold 10px Georgia';g.fillText('!',27,6);}g.restore();return;}}
 switch(it.type){
 case'weapon':{g.translate(16,16);g.rotate(Math.PI/4);const k=it.kind,wood=it.name==='Rostiges Schwert';
  if(k==='sword'||k==='dagger'){const L=k==='dagger'?10:15;g.fillStyle=wood?'#a07a5a':mt;g.beginPath();g.moveTo(-2.6,4);g.lineTo(-2.6,-L+3);g.lineTo(0,-L);g.lineTo(2.6,-L+3);g.lineTo(2.6,4);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.45)';g.stroke();g.fillStyle=c;g.fillRect(-7,4,14,3.2);g.fillStyle='#6b4423';g.fillRect(-1.6,7,3.2,6);g.fillStyle=c;g.beginPath();g.arc(0,14,2.2,0,7);g.fill();}
  else if(k==='spear'||k==='halberd'){g.fillStyle='#7a5230';g.fillRect(-1.3,-6,2.6,22);g.fillStyle=mt;g.beginPath();g.moveTo(0,-16);g.lineTo(3.5,-7);g.lineTo(-3.5,-7);g.closePath();g.fill();if(k==='halberd'){g.beginPath();g.moveTo(1,-9);g.lineTo(9,-12);g.quadraticCurveTo(11,-6,8,-2);g.lineTo(1,-4);g.fill();}g.fillStyle=c;g.fillRect(-2.5,-7,5,2);}
  else if(k==='bow'||k==='longbow'){g.rotate(-Math.PI/4);g.strokeStyle='#8a5a2a';g.lineWidth=k==='longbow'?2.4:3;const R=k==='longbow'?14:11;g.beginPath();g.arc(-4,0,R,-1.25,1.25);g.stroke();g.strokeStyle='#eee';g.lineWidth=.8;g.beginPath();g.moveTo(-4+Math.cos(-1.25)*R,Math.sin(-1.25)*R);g.lineTo(-4+Math.cos(1.25)*R,Math.sin(1.25)*R);g.stroke();g.fillStyle=c;g.fillRect(R-6,-2,3,4);}
  else if(k==='crossbow'){g.rotate(-Math.PI/4);g.fillStyle='#5a3a1e';g.fillRect(-13,-2.5,24,5);g.fillStyle='#3e2814';g.fillRect(-14,-3.5,5,7);g.fillStyle='#8a8f96';g.fillRect(-5,-3,2,6);g.fillRect(4,-3,2,6);g.strokeStyle=mt;g.lineWidth=2.6;g.beginPath();g.moveTo(12,-12);g.quadraticCurveTo(6,-6,9,0);g.quadraticCurveTo(6,6,12,12);g.stroke();g.strokeStyle='#efe6cf';g.lineWidth=1;g.beginPath();g.moveTo(12,-12);g.lineTo(0,0);g.lineTo(12,12);g.stroke();g.fillStyle='#c9c9d2';g.beginPath();g.moveTo(16,0);g.lineTo(11,-2);g.lineTo(11,2);g.fill();g.fillStyle='#7a5a32';g.fillRect(0,-.8,11,1.6);g.fillStyle=c;g.fillRect(-9,2.5,3,3);}
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
 case'food':{if(it.id==='beer'||it.id==='met'){const m=it.id==='met';g.fillStyle=m?'#6b4a2a':'#8a5a2b';g.fillRect(7,9,15,20);g.fillStyle=m?'#4e341c':'#6b4220';g.fillRect(7,13,15,2);g.fillRect(7,23,15,2);g.strokeStyle=m?'#6b4a2a':'#8a5a2b';g.lineWidth=3;g.beginPath();g.arc(23,18,5,-1.3,1.3);g.stroke();g.fillStyle=m?'#ffe9a8':'#fffbe8';g.beginPath();g.ellipse(14.5,9,8.5,4,0,0,7);g.fill();g.beginPath();g.arc(10,7,3,0,7);g.arc(18,6.5,3.5,0,7);g.fill();g.fillStyle=m?'#e0a030':'#f2c14e';g.fillRect(9,12,2,14);break;}if(it.id==='carrot'){g.fillStyle='#ff8a1e';g.beginPath();g.moveTo(9,9);g.lineTo(25,25);g.lineTo(13,7);g.closePath();g.fill();g.beginPath();g.ellipse(11,9,5,4,.8,0,7);g.fill();g.fillStyle='#3fae3f';g.fillRect(5,3,3,7);g.fillRect(8,1,3,7);break;}if(it.id==='potion2'){g.fillStyle='#cfe3ee';g.fillRect(13,3,6,8);g.fillStyle='#8a5a24';g.fillRect(12.5,1,7,4);g.fillStyle='#9a2ad3';g.beginPath();g.arc(16,20,11,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(12,16,3,0,7);g.fill();break;}if(it.id==='mpotion'){g.fillStyle='#cfe3ee';g.fillRect(13,5,6,9);g.fillStyle='#8a5a24';g.fillRect(12.5,3,7,4);g.fillStyle='#2962ff';g.beginPath();g.arc(16,20,9,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(13,17,2.5,0,7);g.fill();break;}if(it.id==='potion'){g.fillStyle='#cfe3ee';g.fillRect(13,5,6,9);g.fillStyle='#8a5a24';g.fillRect(12.5,3,7,4);g.fillStyle='#d32f2f';g.beginPath();g.arc(16,20,9,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(13,17,2.5,0,7);g.fill();}
  else{g.fillStyle='#c98a3e';g.beginPath();g.ellipse(16,18,13,8.5,0,0,7);g.fill();g.strokeStyle='#8a5a24';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(9+i*6,13);g.lineTo(12+i*6,22);g.stroke();}}break;}
 case'ammo':{const b=it.id==='bolt';for(let i=0;i<3;i++){g.save();g.translate(9+i*6,27);g.rotate(-.5+i*.05);g.strokeStyle='#7a5230';g.lineWidth=b?2.4:1.8;g.beginPath();g.moveTo(0,0);g.lineTo(9,-20);g.stroke();g.fillStyle='#c8ccd2';g.beginPath();g.moveTo(10.5,-23);g.lineTo(7,-17);g.lineTo(11,-16.5);g.closePath();g.fill();if(!b){g.fillStyle='#e8e0c8';g.fillRect(-1.5,-3,3,4);}g.restore();}break;}
 case'seed':{if(it.id==='hseed'){g.fillStyle='#4a8a3a';for(let i=0;i<6;i++){g.beginPath();g.arc(9+(i%3)*7,13+Math.floor(i/3)*8,2.6,0,7);g.fill();}g.strokeStyle='#2a5a1a';g.lineWidth=1;g.strokeRect(5,24,22,4);break;}g.fillStyle='#d8b450';for(let i=0;i<7;i++){g.beginPath();g.ellipse(8+(i%4)*5+(i>3?2:0),12+Math.floor(i/4)*8+(i%2)*2,2.6,3.6,.4,0,7);g.fill();}g.strokeStyle='#7a5a20';g.lineWidth=1;g.strokeRect(5,24,22,4);break;}
 case'material':{if(it.id==='herb'){g.fillStyle='#3a9a3a';for(let i=0;i<5;i++){g.save();g.translate(16,24);g.rotate(-1+i*.5);g.beginPath();g.ellipse(0,-9,3.5,8,0,0,7);g.fill();g.restore();}g.fillStyle='#e8f0a0';g.beginPath();g.arc(16,12,2.5,0,7);g.fill();break;}g.strokeStyle='#c9a64a';g.lineWidth=1.8;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(16,29);g.lineTo(16+i*7,6);g.stroke();g.fillStyle='#e8c95a';for(let j=0;j<4;j++){g.beginPath();g.ellipse(16+i*7-i*j*1.2-2,8+j*3.5,2,3,-.4,0,7);g.fill();g.beginPath();g.ellipse(16+i*7-i*j*1.2+2,8+j*3.5,2,3,.4,0,7);g.fill();}}break;}
 case'quest':{g.fillStyle='#7bb661';g.beginPath();g.moveTo(10,26);g.quadraticCurveTo(4,10,18,5);g.quadraticCurveTo(28,8,22,20);g.quadraticCurveTo(18,24,10,26);g.fill();g.strokeStyle='#3e6b2a';g.lineWidth=2;g.stroke();g.beginPath();g.moveTo(14,20);g.quadraticCurveTo(12,12,18,10);g.stroke();break;}
 case'furn':case'tool':{g.font='22px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(it.type==='tool'?'🔨':(G.FDECO&&G.FDECO[it.id]||{}).ic||'🪑',16,17);break;}
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
 unicorn:{n:'Einhorn',c:'#f4f4ff',r:16,spd:125,hp:1.6,dmg:1.3,xp:2.4,lv:[20,20],shape:'horse',horn:1,ai:'charge',b:'m',lg:'mythic',passive:1,rare:.08,minD:200},
 slime:{n:'Schleim',c:'#5fcf5f',r:11,spd:55,hp:.7,dmg:.7,xp:.8,lv:[6,9],shape:'blob',b:'f',lg:'slime'},
 sucher:{n:'Sucher',c:'#5a3a7a',r:13,spd:135,hp:1.25,dmg:1.3,xp:2.1,lv:[30,40],shape:'spider',scale:1.25,poison:1,sk:['leap'],b:'n',lg:'venom'},
 sucherkrieger:{n:'Sucher-Krieger',c:'#3a2050',r:16,spd:110,wind:.5,hp:2.2,dmg:1.55,xp:2.8,lv:[32,40],shape:'spider',scale:1.7,b:'n',lg:'venom'},
 zecke:{n:'Blutzecke',c:'#7a2030',r:8,spd:165,hp:.6,dmg:.9,xp:1.4,lv:[30,40],shape:'spider',scale:.55,poison:1,b:'n',lg:'venom'},
 runenwirker:{n:'Nebelzwerg-Runenwirker',c:'#3a4a6a',skin:'#d0b090',hood:'#2a2a4a',r:10,spd:80,hp:1,dmg:1.25,xp:2.2,lv:[30,40],shape:'hum',wpn:'staff',scale:.85,ai:'ranged',shot:{c:'#c07bff',spd:300,cd:2.2,kind:'orb'},b:'n',lg:'mythic'},
 gjall:{n:'Gjall',c:'#c9a6d8',r:16,spd:70,hp:1.8,dmg:1.4,xp:2.6,lv:[33,40],shape:'ghost',scale:1.7,ai:'ranged',shot:{c:'#ff7a3b',spd:260,cd:2.6,kind:'fire'},b:'n',lg:'spirit'},
 nebelgarde:{wind:.55,n:'Nebelgardist',c:'#2a2238',skin:'#777',helm:'#3a3048',r:13,spd:90,human:1,hp:1.8,dmg:1.45,xp:2.4,lv:[30,42],shape:'hum',wpn:'sword',eye:'#b77bff',b:'',lg:'knight'},
 legion:{n:'Legionär der Schwarzen Legion',c:'#3a1f1f',skin:'#e0ac7e',helm:'#4a4a52',r:12,spd:100,human:1,hp:1.15,dmg:1.1,xp:1.4,lv:[12,30],shape:'hum',wpn:'sword',b:'',lg:'knight'},
 legarch:{n:'Legionsschütze',c:'#2a1a1a',skin:'#e0ac7e',helm:'#4a4a52',r:11,spd:80,human:1,hp:.8,dmg:1,xp:1.4,lv:[12,30],shape:'hum',wpn:'bow',ai:'ranged',shot:{c:'#d8c08a',spd:360,cd:2.1,kind:'arrow'},b:'',lg:'hunter'},
 blackknight:{wind:.55,n:'Schwarzritter',c:'#1e1e28',skin:'#666',helm:'#18181c',r:13,spd:85,human:1,hp:1.6,dmg:1.3,xp:1.9,lv:[14,30],shape:'hum',wpn:'sword',eye:'#ff5a3b',b:'',lg:'knight'},
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
 knut:{n:'Räuberhauptmann Knut',base:'bandit',c:'#5a2a1a',r:17,lv:[3,8],b:'',fixed:1,lite:1,abil:['slam','summon'],minion:'bandit',loot:[{k:'sword',name:'Knuts Entermesser',f:'melee'},{t:'ring',name:'Knuts Siegelring',f:'luck'},{set:'waldlaeufer',s:'boots',name:'Räuberstiefel',f:'spd'}]},
 valdrik:{n:'Kaiser Valdrik, der Nebelfürst',base:'nebelgarde',c:'#2a1240',r:22,lv:[30,45],b:'',fixed:1,abil:['slam','summon','volley','slam'],minion:'nebelgarde',loot:[{k:'greatsword',name:'Valdriks Kaiserklinge',f:'melee',ufx:{crit:10},d:'+10 % Krit'},{t:'amulet',name:'Herz des Nebels',f:'dmg'},{set:'ritter',s:'chest',name:'Nebelkaiser-Harnisch',f:'armor'}]},
 severin:{n:'Feldherr Severin',base:'blackknight',c:'#3a0f0f',r:20,lv:[16,30],b:'',fixed:1,abil:['slam','summon','slam'],minion:'legion',loot:[{k:'greatsword',name:'Severins Kriegsklinge',f:'melee',ufx:{crit:6},d:'+6 % Krit'},{t:'amulet',name:'Siegel der Schwarzen Legion',f:'dmg'},{k:'mace',name:'Legionskolben',f:'melee',ufx:{stun:.12},d:'12 % Betäubung'}]},
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
BOSSES.nebelalter={n:'Der Alte im Nebel',base:'sucherkrieger',c:'#4a2a6a',r:26,lv:[32,45],b:'n',abil:['slam','summon','leap'],minion:'sucher',loot:[{k:'scythe',name:'Sichel des Alten',f:'melee',ufx:{poison:1},d:'vergiftet'},{t:'ring',name:'Ring der tausend Augen',f:'crit'}]};
Object.assign(BOSSES,{grimmholt:{n:'Häschermeister Grimmholt',base:'legarch',c:'#4a3a1a',r:19,lv:[20,34],b:'',fixed:1,abil:['volley','combo','summon','slam'],minion:'legion',loot:[{k:'crossbow',name:'Grimmholts Fangarmbrust',f:'ranged',ufx:{slow:1},d:'verlangsamt Gegner'},{k:'longbow',name:'Häscherbogen Grimmholts',f:'ranged',ufx:{crit:6},d:'+6 % Krit'},{t:'ring',name:'Grimmholts Käfigring',f:'luck'}]},
 morwenna:{n:'Königin Morwenna, die Fluchweberin',base:'necro',c:'#3a0a2a',r:21,lv:[24,44],b:'',fixed:1,abil:['volley','summon','fire','sweep','slam'],minion:'legion',loot:[{k:'tome_storm',name:'Morwennas Fluchgewebe',f:'spell',ufx:{ls:.05},d:'5 % Lebensraub'},{k:'dagger',name:'Dornendolch der Königin',f:'melee',ufx:{poison:1,crit:6},d:'vergiftet, +6 % Krit'},{t:'amulet',name:'Morwennas Dornenreif',f:'dmg'},{set:'magier',s:'chest',name:'Robe der Fluchweberin',f:'spell'}]}});
// v20: Jede Boss-Waffe bekommt eine passende Spezialfähigkeit (falls noch keine gesetzt ist)
const UFX_K=k=>k==='dagger'?[{poison:1,crit:4},'vergiftet, +4 % Krit']:(k==='axe'||k==='mace'||k==='warhammer'||k==='flail')?[{stun:.12},'12 % Betäubung']:(k==='bow'||k==='longbow')?[{crit:7},'+7 % Krit']:k==='crossbow'?[{slow:1},'verlangsamt Gegner']:k==='tome_fire'?[{burn:1},'setzt in Brand']:k==='tome_frost'?[{slow:1},'verlangsamt Gegner']:k==='tome_light'?[{ls:.05},'5 % Lebensraub']:k==='tome_storm'?[{crit:8},'+8 % Krit']:k==='scythe'?[{ls:.04},'4 % Lebensraub']:[{crit:6},'+6 % Krit'];
for(const k in BOSSES)for(const e of BOSSES[k].loot||[])if(e.k&&WKIND[e.k]&&!e.ufx){const u=UFX_K(e.k);e.ufx=u[0];e.d=u[1];}
for(const k in BOSSES){const B=BOSSES[k];if(!B.fixed&&B.lv)B.lv[1]=Math.max(B.lv[1],Math.min(45,Math.round(B.lv[1]*1.5)));}
G.MT=MT;G.BOSSES=BOSSES;G.LG=LG;
// v20: Seltene Mob-Trophäen (ca. 5 %) – noch ohne eigene Fähigkeit, später fürs Handwerk gedacht
const MDROP='rabbit:Hasenpfote:🐾|rat:Rattenschwanz:🐀|boar:Wildschweinhauer:🦷|fox:Fuchsschwanz:🦊|wolf:Wolfsfell:🐺|unicorn:Einhornhaar:✨|slime:Schleimklumpen:🟢|sucher:Sucher-Chitin:🪲|sucherkrieger:Sucher-Klinge:🪲|zecke:Zeckenpanzer:🕷️|runenwirker:Runensplitter:🔷|gjall:Gjall-Drüse:🫧|nebelgarde:Nebelgarde-Abzeichen:🎖️|legion:Legionsabzeichen:🎖️|legarch:Legionsbogensehne:🏹|blackknight:Schwarzer Panzersplitter:⚫|bandit:Gestohlene Münze:🪙|archer:Gefiederte Pfeilspitze:🏹|spider:Spinnenseide:🕸️|goblin:Goblinzahn:🦷|shaman:Schamanenfeder:🪶|bear:Bärenpelz:🐻|centaur:Zentaurenhuf:🐎|skeleton:Knochensplitter:🦴|skarcher:Knochenpfeil:🦴|ghoul:Moorschlamm:🟤|witch:Hexenkraut:🌿|ghost:Geisteressenz:👻|basilisk:Basiliskenauge:👁️|orc:Orkhauer:🦷|golem:Golemkern:🪨|troll:Trollblut:🩸|minotaur:Minotaurenhorn:📯|griffin:Greifenfeder:🪶|frostslime:Frostgel:❄️|penguin:Pinguinfeder:🪶|icewolf:Eiswolfpelz:🐺|draugr:Draugr-Rune:🔷|frostgiant:Riesenzahn:🦷|lavaslime:Lavaperle:🔥|imp:Dämonenhorn:😈|salamander:Salamanderschuppe:🦎|wyrmling:Drachenschuppe:🐉|knight:Dunkelritter-Wappen:🛡️|kobold:Koboldschleuder:🪃|wasp:Wespenstachel:🐝|greydwarf:Grauzwerg-Moos:🌿|zombie:Verrottete Hand:✋|bat:Fledermausflügel:🦇|vampire:Vampirzahn:🧛|werewolf:Werwolfkralle:🐺|wraith:Schattenfetzen:🌫️|pilzling:Pilzhut:🍄|treant:Borkenstück:🪵|scorpion:Skorpionstachel:🦂|mummy:Mumienbinde:🩹|jackal:Schakalfell:🐕|harpy:Harpyienfeder:🪶|thornvine:Dornenranke:🌵|trapper:Fallenseil:🪢|icewitch:Eiskristall:💎|reaper:Sensensplitter:💀|banshee:Bansheeschleier:🌫️|shadowhound:Schattenfell:🐕|necro:Nekromantenschädel:💀|wisp:Irrlichtfunke:✨|phoenix:Phönixfeder:🔥'.split('|').map(x=>x.split(':'));
for(const [k,n,ic] of MDROP)if(MT[k]){const l0=(MT[k].lv&&MT[k].lv[0])||1;STACK['m_'+k]={name:n,type:'material',ic,desc:`Seltene Trophäe (${MT[k].n}). Hat noch keine Wirkung – wird später fürs Handwerk gebraucht.`,price:0,sell:2+Math.round(l0*.7),trophy:1};}
function mkMonster(key,lvl,x,y){const t=MT[key],D=G.D();const hpS=1+Math.max(0,lvl-10)*.04,dmS=1+Math.max(0,lvl-15)*.02;
 const m={x,y,type:key,lvl,t,r:t.r,cr:Math.min(t.r,11),maxhp:Math.round((34+lvl*15)*hpS*t.hp*D.mhp),dmg:(5+lvl*2.8)*dmS*t.dmg*D.mdmg,spd:t.spd*rnd(.92,1.08),xp:Math.round((8+lvl*6)*t.xp),name:t.n,c:t.c,shape:t.shape,ai:t.ai||'melee',atkCd:.6,wd:{x:0,y:0,t:0},hitT:0,kx:0,ky:0,fx:1,fy:0,swing:0,anim:Math.random()*9,shotCd:rnd(.6,2),chCd:rnd(1,3),st:null,stT:0,strafe:Math.random()<.5?-1:1,scale:t.scale||1,home:{x,y},voiceT:0,passive:!!t.passive};m.hp=m.maxhp;
 if(t.lg==='beast'&&CORCH[key]!=null){const bi=biome(Math.floor(x/TILE),Math.floor(y/TILE));const ch=Math.min(.95,CORCH[key]+(bi==='ash'?.5:bi==='dark'||bi==='swamp'?.2:0)+(G.P&&G.P.main>=4?.15:0));if(Math.random()<ch){m.cor=1;m.passive=false;m.name=(key==='boar'?'Aschbefallenes ':key==='rabbit'?'Aschbefallener ':'Aschbefallener ')+t.n;m.maxhp=m.hp=Math.round(m.maxhp*1.15);m.dmg*=1.15;m.xp=Math.round(m.xp*1.25);m.spd*=1.08;}else if(key==='rabbit'||key==='fox'){m.passive=true;m.flee=1;}else if(key==='boar'){m.passive=true;m.terr=1;}}
 return m;}
// Aschenfluch: Chance, dass ein Tier von Ignaroks Asche befallen ist (rote Augen, Ascheglut, aggressiv)
const CORCH={rabbit:.3,fox:.45,boar:.4,deer:.2,bear:.7};
function mkBoss(key,lvl,x,y){const B=BOSSES[key];const m=mkMonster(B.base,lvl,x,y);const dr=key==='dragon';m.boss=key;m.B=B;m.name=B.n;m.c=B.c;m.r=B.r;m.cr=Math.min(14,B.r*.5);const roam=!B.fixed,lite=!!B.lite;m.maxhp=m.hp=Math.round(m.maxhp*(dr?24:lite?5:roam?7:15));m.dmg*=dr?1.8:lite?1.3:roam?1.25:1.6;m.armor=dr?.3:lite?.05:roam?.05:.2;m.xp=Math.round(m.xp*(dr?8:4));m.spd*=.85;m.home={x,y};m.abT=3;m.abI=0;m.ai='melee';m.passive=false;m.scale=B.r/MT[B.base].r*(MT[B.base].scale||1);m.heads=B.heads||0;if(dr)m.shape='dragon';return m;}
function mkMini(key,lvl,x,y){const t=MT[key];const m=mkMonster(key,lvl,x,y);m.boss='mini';m.B={n:t.n,mini:1,fixed:1,abil:t.ai==='ranged'?['volley','slam']:['slam','summon'],minion:key,lg:t.lg,poison:t.poison};m.name=`${t.n}-${pick(['Champion','Koloss','Anführer','Urahn'])}`;
 m.maxhp=m.hp=Math.round(m.maxhp*4.5);m.dmg*=1.15;m.armor=0;m.xp=Math.round(m.xp*3);m.scale=(t.scale||1)*1.7;m.r=Math.round(t.r*1.7);m.cr=Math.min(14,m.r*.5);m.abT=3;m.abI=0;m.passive=false;return m;}
G.mkMonster=mkMonster;G.mkBoss=mkBoss;G.mkMini=mkMini;G.hitMonster=(...a)=>hitMonster(...a);
function pickType(tx,ty,lvl){const bl=BL[biome(tx,ty)],d=dV(tx,ty);let c=Object.keys(MT).filter(k=>{const t=MT[k];if(t.b.indexOf(bl)<0)return false;if(t.rare)return d>=t.minD&&Math.random()<t.rare;return lvl>=t.lv[0]-1&&lvl<=Math.max(t.lv[1]*1.6+4,t.lv[1]+12);});
 if(!c.length)c=Object.keys(MT).filter(k=>MT[k].b.indexOf(bl)>=0&&!MT[k].rare);if(!c.length)return 'rat';
 const rare=c.find(k=>MT[k].rare);if(rare)return rare;return pick(c);}
// ===================== NPCs =====================
const LORE='Das Spiel spielt im Königreich Eldmar. In der Mitte liegt die Stadt Eichenhain mit der mächtigen Burg Eichenhain auf einem Hügel im Norden der Stadt. Vor drei Nächten griff der Feuerdrache Ignarok das Land an, brannte das Dorf Aschental nieder und entführte Prinzessin Elara, die Tochter von Fürst Aldric. Der Spieler ist ein gefallener Ritter der Silberwacht, der am Aschenpass gegen Ignarok starb. Die Walküren verwehrten ihm den Einzug nach Valhalla, weil sein Werk unvollendet ist. Heilerin Mara fand ihn am Flussufer. Feinde: Die Schwarze Legion von Kaiser Valdrik aus dem Süden plant eine Invasion von Eldmar und bezahlt Räuber und Goblins; ihr Feldherr Severin hat ein Kriegslager in der Steinöde. Orte: Räuberlager von Räuberhauptmann Knut nordöstlich des Dorfes, die Hütte des Einsiedlers Bertolt im Südwesten der Wiesen, das Räubernest (Höhle von Räuberfürst Falk) bei Aschental, der alte Wachturm im Nebelmoor (Moorhexe Grimelda), Sonnenwiesen rund um Eichenhain (Tiere, Kobolde, Grauzwerge, Riesenwespen, am Rand selten Einhörner), Banditenlager im Osten der Wiesen, das zerstörte Dorf Aschental im Nordosten der Wiesen, der Finsterwald im Osten mit dem Dorf Waldheim (Försterin Liv), dem Goblinlager und der Spinnenhöhle, das Nebelmoor im Westen mit dem Pfahldorf Moorbruck (Vogt Aldwin) und der Krypta des Knochenfürsten Morvax, die Frostlande im Nordwesten mit Frosthafen (Jarl Ragna), das Graukamm-Gebirge im Norden mit der Zwergenbinge, die Aschenberge im Nordosten mit dem Außenposten Glutwacht und der Drachenfestung auf dem Goldberg, im Süden die Steinöde mit einer tiefen Schlucht und der verlassenen Mine, im Südosten die Sengenden Dünen mit Sandfeste (Fürstin Samira) und dem Grab des Sandkönigs, im Südwesten der finstere Schattenwald mit der Ruine der Abtei und einer Hexenkate. Nachts erheben sich Zombies, Skelette, Fledermäuse und Vampire, bei Vollmond Werwölfe. Der Aschenfluch: Seit Ignaroks Erwachen liegt ein Fluch über Eldmar, gewoben von Königin Morwenna (der Fluchweberin, Valdriks Schwester) in die Aschenkrone, die Kaiser Valdrik trägt. Außerhalb geweihter Mauern verfallen fast alle Geschöpfe dem Zorn; nur Runensteine der Dörfer und fließendes Wasser halten ihn fern – deshalb ist Angler Fiete an seinem Bach sicher. Der Drache ist nur Valdriks Werkzeug, nicht der eigentliche Feind. Weitere Völker: das Fellvolk in Rotfellhain südlich des Finsterwalds (Tiermenschen mit Ohren und Schweifen von Fuchs, Katze, Hund und Wolf; Häuptlingin Sirka), die Walküren und Einherjer auf dem Schildhorst hoch im Graukamm (Walküre Svanhild, die den Spieler einst nach Eldmar zurückschickte), und das feindliche Dornenreich Schwarzwall im Schattenwald im Südwesten, wo Morwennas Dornenwachen jeden Fremden angreifen, während die unterdrückten Bürger friedlich sind. Stallmeister Matthes in Eichenhain hilft beim Zähmen von Pferden (mit Karotten) und gibt Reitern einen Sattel. Dorf Eichenhain (v21): Gärtnerin Linde (Gärtnerei) verkauft Saat, Setzlinge, Harke und Gießkanne; Lebensmittel brauchen gelockerten Boden, Wasser in höchstens 3 Feldern Nähe und Gießen; Blumen und Bäume wachsen überall außer auf Wasser, Lava und Wegen. Bäcker Bernd backt aus Feldfrüchten Gerichte mit zeitlich begrenzter Stärkung. Gildenmeisterin Isolde (Abenteurergilde) vergibt alle 3 Tage neue Aufträge und kauft Jagdbeute. Kartograph Edwin (Kartenstube) entziffert Karten, verkauft Ortsmarker und verbessert die Erkundungsreichweite. Försterin Liv in Waldheim verkauft Äxte; Holz, Stöcke und Harz sind Rohstoffe für später. Jeder Händler kauft nur, was zu ihm passt; die Schmiedin nur Ausrüstung.';
const OX=VCX-96,OY=VCY-120;
const NPCS=[
 {id:'mara',name:'Heilerin Mara',short:'Mara',tx:113,ty:118,look:{body:'#5b8c5a',skin:'#f1c27d',hair:'#e8e8e8',dress:1},persona:'Ältere, weise Kräuterheilerin. Sie hat den Spieler bewusstlos am Flussufer gefunden und gesund gepflegt. Mütterlich, ruhig, ein wenig geheimnisvoll. Sie spürt, dass die Götter den Spieler zurückgeschickt haben. Sie braut aus Heilkraut Heiltränke.',greet:['Wie geht es deinen Wunden?','Die Kräuter blühen dieses Jahr spät …']},
 {id:'aldric',name:'Fürst Aldric',short:'Aldric',tx:95,ty:89,look:{body:'#6a1b2a',skin:'#e8b88a',hair:'#bdbdbd',crown:1,cape:'#8b0000'},persona:'Fürst von Eichenhain und Herr der Burg. Ernst und stolz, voller Sorge um seine entführte Tochter Elara. Spricht förmlich und gebieterisch, aber gerecht.',greet:['Sprich, Ritter.']},
 {id:'elara',name:'Prinzessin Elara',short:'Elara',abs:1,tx:LAIR.x,ty:LAIR.y+2,look:{body:'#6a4ab0',skin:'#f5d0b0',hair:'#e8c35a',dress:1,crown:1},persona:'Tochter von Fürst Aldric, vom Drachen entführt. Mutig, schlagfertig und alles andere als hilflos. Im Hort hat sie selbst nach einem Fluchtweg gesucht.',greet:['Da bist du ja, mein Retter!']},
 {id:'gunnar',name:'Drachenjäger Gunnar',short:'Gunnar',tx:82,ty:127,look:{body:'#7a2e2e',skin:'#d9a066',hair:'#c9a227',beard:'#c9a227',helm:'#8a8f96'},persona:'Rauer, vernarbter Drachenjäger aus dem Norden. Trinkt gern Met in der Taverne. Er hat seinen Bruder an Ignarok verloren und will Rache. Wortkarg, mit trockenem Humor. Er glaubt an Valhalla.',greet:['Hmpf.','Noch ein Met, und ich erzähl dir von Drachen.']},
 {id:'hilda',name:'Schmiedin Hilda',short:'Hilda',tx:108,ty:114,look:{body:'#5a4636',skin:'#e8b88a',hair:'#d35400'},persona:'Kräftige Schmiedin, direkt und laut, stolz auf ihr Handwerk. Sie hasst Wölfe, weil sie ihre Schafe reißen. Sie kennt sich mit Waffen aus: Speere stechen weit, Armbrüste durchschlagen, Langbögen treffen von weit weg.',greet:['Die Esse ist heiß!','Gute Klingen brauchen Geduld.']},
 {id:'bernd',name:'Bäcker Bernd',short:'Bernd',tx:87,ty:113,look:{body:'#e8e0cc',skin:'#f1c27d',hat:'#ffffff'},persona:'Gemütlicher, rundlicher Bäcker, redselig, lacht gern und macht schlechte Brotwitze. Er weiß, dass Saat nur nahe am Wasser gedeiht.',greet:['Frisches Brot – na ja, bald wieder!']},
 {id:'otto',name:'Wache Otto',short:'Otto',tx:108,ty:127,look:{body:'#4a5a7a',skin:'#f1c27d',helm:'#9aa0a6'},persona:'Pflichtbewusster, etwas ängstlicher Wachsoldat. Er hasst Goblins und erzählt gern, wie er beinahe einen gefangen hätte.',greet:['Alles ruhig. Glaube ich.']},
 {id:'greta',name:'Händlerin Greta',short:'Greta',tx:89,ty:132,shop:1,look:{body:'#b06a2a',skin:'#e8b88a',hair:'#5a2a1a',dress:1},persona:'Reisende Händlerin, geschäftstüchtig, feilscht gern und kennt Gerüchte aus fernen Ländern. Sie verkauft Heiltränke, Brot, Karotten und Saat und kauft Beute an.',greet:['Tränke, Brot, Saatgut! Und ich kaufe deine Beute!']},
 {id:'konrad',name:'Burgwache Konrad',short:'Konrad',tx:100,ty:106,look:{body:'#3a4a6a',skin:'#f1c27d',helm:'#9aa0a6'},persona:'Junger Wachsoldat am Burgtor. Gelangweilt, neugierig, liebt Gerüchte und Klatsch über den Hof.',greet:['Halt! Ach, du bist es.','Langweiliger Dienst heute.']},
 {id:'lukas',name:'Barde Lukas',short:'Lukas',tx:86,ty:124,wander:1.5,look:{body:'#2a7a6a',skin:'#f1c27d',hair:'#3a2a1a',hat:'#7a1a4a'},persona:'Eitler, fröhlicher Barde. Er reimt gern, übertreibt maßlos und will die Heldentaten des Spielers besingen.',greet:['♪ Oh tapfrer Recke, hör mein Lied … ♪']},
 {id:'anselm',name:'Bruder Anselm',short:'Anselm',tx:102,ty:135,wander:1,look:{body:'#6b4a2a',skin:'#e8c8a0',hair:'#9a9a9a',dress:1},persona:'Sanftmütiger Mönch der Kapelle. Er hütet alte Schriften über Drachen, Walküren, Valhalla und Fabelwesen wie Einhörner, Greife und Zentauren.',greet:['Friede sei mit dir.']},
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
// v20: Bewohner der neuen Königreiche
Object.assign(TPPL,{
 fell:[['ruko','Bauer Ruko','Ruko','m','#6a4a2a','#b8602a','Fuchsmann vom Fellvolk, baut Rüben und Pilze an. Redet schnell und lacht viel.',['Riechst du das? Regen kommt.','Meine Rüben sind die besten im ganzen Wald.','Ein Mensch, hier? Na so was.']],
  ['mauz','Händlerin Mauz','Mauz','f','#7a5a8a','#d9a060','Katzenfrau vom Fellvolk. Handelt mit Kräutern und Tränken und lässt sich nie übers Ohr hauen.',['Schnurr … was darf es sein?','Ich sehe im Dunkeln. Und ich sehe, wenn jemand schummelt.','Frische Kräuter, scharfe Preise.']],
  ['wuffel','Fährtenleser Bolder','Bolder','m','#5a4a3a','#8a6a4a','Hundemann vom Fellvolk, bester Spurenleser weit und breit. Treu bis in den Tod.',['Ich hab deine Spur schon vor einer Stunde gerochen.','Die Häscher riechen nach Eisen und Angst.','Wuff – äh, hallo.']],
  ['nala','Weberin Nala','Nala','f','#4a5a6a','#7a7a80','Graue Katzenfrau vom Fellvolk, webt Umhänge aus Wolfshaar.',['Fell ist wärmer als jede Wolle.','Die Legion hat meinen Bruder geholt …','Komm nicht zu nah an meine Spindel.']],
  ['tiko','Fuchsjunge Tiko','Tiko','m','#8a5a2a','#d07a32','Neugieriger Fuchsjunge vom Fellvolk, will Ritter werden.',['Bist du ein echter Ritter?!','Ich kann schon fast so schnell rennen wie Bolder!','Darf ich dein Schwert halten?'],1]],
 schild:[['ulf','Einherjer Ulf','Ulf','m','#5a6070','#c8b070','Gefallener Krieger, der auf dem Schildhorst auf seinen Platz in Valhalla wartet. Hütet die Bergziegen.',['Valhalla wartet. Ich habe Zeit.','Die Ziegen hier oben sind stärker als manche Krieger.','Auch du bist gefallen, nicht wahr? Ich sehe es an deinen Augen.']],
  ['brynja','Walküre Brynja','Brynja','f','#c8ccd8','#e8d8a8','Walküre, verwaltet Met und Vorräte des Horsts. Streng, aber gerecht.',['Met und Heiltrank, für alle, die noch kämpfen.','Wir wählen die Gefallenen. Nicht umgekehrt.','Steh gerade, Ritter.']],
  ['randver','Einherjer Randver','Randver','m','#4a5a4a','#6a4a2a','Gefallener Bogenschütze, der hier oben Pfeile schnitzt.',['Ein guter Pfeil fliegt gerade, wie ein guter Mann.','Der Wind hier oben trägt jeden Schuss.','Ich fiel bei Glutwacht. Lang ist es her.']],
  ['eira','Walküre Eira','Eira','f','#d8dce8','#f0e6c8','Junge Walküre und Heilerin des Horsts.',['Deine Wunden erzählen Geschichten.','Valhalla ist schöner, als du denkst.','Flieg nicht zu nah an die Sonne – auch wir lernen das.']],
  ['skeggi','Rabenhüter Skeggi','Skeggi','m','#3a3a3a','#2a2a2a','Wortkarger Alter, der die Raben des Horsts füttert. Die Raben bringen den Walküren Nachrichten.',['Krah.','Meine Raben sehen alles.','Die Raben sagen, du hast viel vor.']]],
 schwarz:[['wilma','Magd Wilma','Wilma','f','#5a4a4a','#6a4a3a','Magd auf den Feldern der Königin. Hasst die Dornenwachen, flüstert nur.',['Psst! Die Wachen hören alles.','Die Königin nimmt uns das halbe Korn.','Bist du … nicht von hier? Dann pass auf dich auf.']],
  ['rike','Hehlerin Rike','Rike','f','#3a3a4a','#2a1a1a','Verkauft unter der Hand, was die Dornenwachen nicht sehen sollen.',['Schnell, bevor die Wache vorbeikommt.','Keine Fragen, keine Namen.','Gold riecht nicht. Zum Glück.']],
  ['jost','Bettler Jost','Jost','m','#4a4038','#8a8a8a','Ehemaliger Schmied, dem die Königin die Werkstatt nahm.',['Eine Münze für einen alten Mann?','Ich habe einst Schwerter geschmiedet. Jetzt bettle ich.','Die Dornenfeste … dort gehen Menschen hinein, aber selten heraus.']],
  ['oswin','Köhler Oswin','Oswin','m','#2a2a2a','#3a3a3a','Köhler, der Holzkohle für die Schmieden der Legion brennen muss.',['Rauch und Asche, jeden Tag.','Die Legion braucht Kohle für ihre Klingen.','Wenn die Königin fällt … dann brenne ich nur noch für mich.']],
  ['ella','Ella','Ella','f','#6a5a7a','#a07a4a','Kleines Mädchen aus Schwarzwall, das heimlich Blumen pflanzt.',['Willst du eine Blume? Psst!','Die Wachen sind gemein.','Mama sagt, irgendwann kommt ein Ritter.'],1]]});
Object.assign(TSHOP,{mauz:['potion','potion2','mpotion','hseed','bread','arrow'],brynja:['potion','potion2','mpotion','met','arrow','bolt'],rike:['potion','potion2','bread','arrow','bolt']});
for(const tid in TPPL){const a=TADD[tid];const homes=[[tid+'_farm',a.farm[0],a.farm[1],4,3],[tid+'_h3',...a.houses[3]],[tid+'_h0',...a.houses[0]],[tid+'_h1',...a.houses[1]],[tid+'_h2',...a.houses[2]]];
 TPPL[tid].forEach((d,i)=>{const h=homes[i];const p=TP(tid,h[1]+Math.floor(h[3]/2),h[2]+h[4]);const fem=d[3]==='f';
  NPCS.push({id:d[0],name:d[1],short:d[2],abs:1,tx:p.x,ty:p.y,child:d[8]?1:0,wander:i>=2?2:0,town:tid,look:{body:d[4],skin:tid==='sand'?'#c68642':tid==='glut'?'#d9a066':'#f0d0b0',hair:d[5],dress:fem?1:0,hat:i===0?'#c9a86a':null,beard:!fem&&i%2===0&&!d[8]?d[5]:null},persona:d[6]+' Lebt in '+TOWNS.find(t=>t.id===tid).name+'.',greet:d[7]});
  if(i===0)JOBS_ADD[d[0]]=[['field','hoe',[8,12]],['door:'+tid+'_farm','idle',[3,5]],['field','hoe',[6,10]],['home','idle',[2,4]]];
  else if(i===1){JOBS_ADD[d[0]]=[['door:'+tid+'_mkt','idle',[7,10]],['home','idle',[2,4]]];SHOP_ADD[d[0]]={n:d[1].split(' ')[1]+'s Marktstand',items:TSHOP[d[0]]};}
  else JOBS_ADD[d[0]]=[['patrol','idle',[3,5]],['door:'+tid+'_mkt','idle',[3,5]],['home','idle',[3,6]],['patrol','idle',[2,4]]];});}
// Update 16: Stadtwachen
for(const [tid,nm,sh] of [['frost','Wache Torvald','Torvald'],['moor','Wache Hennes','Hennes'],['wald','Wache Kuno','Kuno'],['sand','Wache Rashid','Rashid'],['fell','Wächter Grauzahn','Grauzahn'],['schild','Walküre Gunnhild','Gunnhild']]){const tw=TOWNS.find(t=>t.id===tid);const p=TP(tid,1,tw.r-4);NPCS.push({id:'wache_'+tid,name:nm,short:sh,abs:1,tx:p.x,ty:p.y,town:tid,guard:1,look:{body:'#4a5a7a',skin:tid==='sand'?'#c68642':'#f0d0b0',helm:'#9aa0a6'},persona:'Stadtwache von '+tw.name+'. Streng, aber fair. Achtet auf Diebe und Unruhestifter.',greet:['Halte dich an die Gesetze, Fremder.','Alles ruhig in '+tw.name+'.','Diebe landen bei mir im Kerker.']});JOBS_ADD['wache_'+tid]=[['patrol','idle',[3,5]]];}
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
 const q=[[sx,sy]];prev[id(sx,sy)]=id(sx,sy);let found=false;for(let i=0;i<q.length&&i<1800;i++){const [x,y]=q[i];if(x===tx&&y===ty){found=true;break;}for(let q4=0;q4<4;q4++){const dx=DX4[q4],dy=DY4[q4];const nx=x+dx,ny=y+dy;if(Math.abs(nx-sx)>R0||Math.abs(ny-sy)>R0)continue;const k=id(nx,ny);if(prev[k]>=0)continue;if(!walkTile(nx,ny))continue;prev[k]=id(x,y);q.push([nx,ny]);}}
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
 P={x:SPAWN.x,y:SPAWN.y,fx:0,fy:1,hp:112,level:1,xp:0,gold:15,inv:new Array(36).fill(null),eq:{helm:null,chest:null,legs:null,boots:null,ring:null,amulet:null},sel:0,q:{},main:0,ms:0,lgN:0,mN:0,macc:false,mflag:0,barrier:false,chat:{},kills:{},ways:{city:1},atkCd:0,swing:0,hurtT:0,dead:false,anim:0,moving:false,dodgeT:0,dodgeCd:0,poison:null,burn:null,slow:0,sta:100,mp:44,staT:0,dayT:60,side:{},z:0,vz:0,home:{bed:1},pet:null,och:{},diff:G.settings.diff,started:Date.now()};
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
 const cb=s.cls==='magic'?s.spell:s.cls==='ranged'?s.ranged:s.melee;s.total=(s.base+s.wdmg)*(1+cb/100);s.speed=140*(1+s.spd/100)*(P.slow>0?.6:1)*((P.drunk||0)>=3?Math.max(.62,.88-((P.drunk||0)-3)*.04):1);if(P.hangover&&P.dayT<P.hangover)s.maxSta=Math.round((s.maxSta||100)*.75);if(P.rested&&P.dayT<P.rested.until){s.maxhp=Math.round(s.maxhp*(1+P.rested.b/100));s.regen*=1+P.rested.b/40;}if(P.pet)s.luck=(s.luck||0)+5;{const BF=P.buffs||{},on=k=>(BF[k]||0)>P.dayT;if(on('spd'))s.speed*=1.15;if(on('regen'))s.regen+=3+s.maxhp*.012;if(on('str'))s.total*=1.15;if(on('res'))s.res=Math.min(80,(s.res||0)+15);if(on('luck'))s.luck=(s.luck||0)+15;if(on('sta'))s.maxSta=(s.maxSta||100)+40;if(on('hp'))s.maxhp=Math.round(s.maxhp*1.2);if(on('mp')){s.maxMp+=40;s.mpRegen*=1.3;}}if(P.riding)s.speed*=1.65;s.regen=Math.round(s.regen*10)/10;return s;}
G.calc=calc;
function addItem(it){if(it.stack){for(let i=0;i<36;i++){const s=P.inv[i];const cap=it.type==='ammo'?999:64;if(s&&s.stack&&s.id===it.id&&s.count<cap){const mv=Math.min(cap-s.count,it.count);s.count+=mv;it.count-=mv;if(it.count<=0){G.invDirty=true;return true;}}}}
 for(let i=0;i<36;i++)if(!P.inv[i]){P.inv[i]=it;G.invDirty=true;return true;}return false;}
function countItem(id){let n=0;for(const s of P.inv)if(s&&s.id===id)n+=s.count;return n;}
function removeItem(id,n){for(let i=0;i<36&&n>0;i++){const s=P.inv[i];if(s&&s.id===id){const t=Math.min(n,s.count);s.count-=t;n-=t;if(s.count<=0)P.inv[i]=null;}}G.invDirty=true;}
function dropGround(it,x,y){G.grounds.push({x:x+rnd(-10,10),y:y+rnd(-10,10),it,t:0});}
function give(it){const nm=it.stack?`${it.name} ×${it.count}`:it.name;if(!addItem(it)){dropGround(it,P.x,P.y+20);G.toast('Inventar voll, liegt am Boden','#ff8a80');}G.toast('Erhalten: '+nm,RAR[it.rarity||0].c,false,it);}
// ===== Bier & Betrunkenheit =====
const drunkLvl=()=>{const d=P.drunk||0;return d<1?0:d<3?1:d<6?2:d<9?3:4;};G.drunkLvl=drunkLvl;
const DRUNKN=['Nüchtern','Angeheitert','Betrunken','Sturzbetrunken','Kurz vorm Umkippen'];G.DRUNKN=DRUNKN;
function drinkBeer(n){const before=drunkLvl();P.drunk=(P.drunk||0)+n;P.drunkTot=(P.drunkTot||0)+n;sfx('drink');G.floats.push({x:P.x,y:P.y-34,t:pick(['Prost! 🍺','Hicks!','Aaah …','Noch eins!']),c:'#ffd54a',life:1});
 if(P.drunk>=10){passOut();return;}const l=drunkLvl();if(l!==before&&l>=2)G.toast(`🍺 ${DRUNKN[l]}! ${l===2?'Du läufst etwas langsamer und schwankst.':'Die Welt dreht sich … du torkelst stark.'}`,'#ffd54a');G.S=calc();}
function passOut(){P.drunk=0;{const st=P.stats||(P.stats={});st.passOut=(st.passOut||0)+1;}if(G.ui&&G.ui.closeDialog)G.ui.closeDialog();G.sleepFx=3.2;G.reviveNPCs&&G.reviveNPCs();const n=Math.floor(P.dayT/DAYLEN),t=P.dayT%DAYLEN;P.dayT=(t>=28?n+1:n)*DAYLEN+60;P.poison=null;P.burn=null;G.mons=G.mons.filter(m=>m.boss==='dragon');G.proj=[];G.teles=[];
 G.room=HR;let bx=HR.door.tx,by=HR.door.ty-1;const hb=G.homeBed&&P.home&&P.home.items?G.homeBed():null,a=hb?[hb.x,hb.y]:null;if(a){const fp=G.decoFoot(hb.i,a[0],a[1]);let best=null;for(const [fx,fy] of fp)for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=HR.x0+fx+ox,y=HR.y0+fy+oy;if(x<=HR.x0||x>=HR.x0+HR.w-1||y<=HR.y0||y>=HR.y0+HR.h-1)continue;if(fp.some(([qx,qy])=>qx===fx+ox&&qy===fy+oy))continue;if(!walkTile(x,y)||SOLIDS[tileAt(x,y)])continue;best=[x,y];break;}if(best){bx=best[0];by=best[1];}}
 P.x=(bx+.5)*TILE;P.y=(by+.5)*TILE;P.prevX=null;const S=calc();G.S=S;P.hp=Math.max(P.hp,Math.round(S.maxhp*.6));P.sta=S.maxSta*.5;P.hangover=P.dayT+300;
 G.toast('😵 Du bist umgekippt …','#ffcc80',true);setTimeout(()=>G.toast('🏠 Du wachst mit dickem Kopf in deinem Haus auf. Kater: weniger Ausdauer für eine Weile.','#ffe9a0',true),1100);G.save();}
G.passOut=passOut;
function useItem(i){const it=P.inv[i];if(!it||it.type!=='food')return;const S=G.S;if(STACK[it.id].buff){const sd=STACK[it.id];P.buffs=P.buffs||{};P.buffs[sd.buff]=P.dayT+sd.dur;G.S=calc();P.hp=Math.min(G.S.maxhp,P.hp+sd.heal);sfx('eat');G.floats.push({x:P.x,y:P.y-34,t:`${BUFFN[sd.buff][0]} ${BUFFN[sd.buff][1]}`,c:'#ffe082',life:1.3});G.toast(`${sd.ic||'🍽'} ${sd.name}: ${BUFFN[sd.buff][1]} für ${Math.round(sd.dur/60)} Min.`,'#ffe082');it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;return;}if(STACK[it.id].beer){drinkBeer(STACK[it.id].beer);P.hp=Math.min(S.maxhp,P.hp+STACK[it.id].heal);it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;return;}if(STACK[it.id].mana){if(P.mp>=S.maxMp){G.toast('Dein Mana ist schon voll','#ccc');return;}const v=Math.round(S.maxMp*STACK[it.id].mana);P.mp=Math.min(S.maxMp,P.mp+v);sfx('drink');G.floats.push({x:P.x,y:P.y-34,t:`+${v} Mana`,c:'#82b1ff',life:.9});it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;return;}if(P.hp>=S.maxhp&&!P.poison&&!P.burn){G.toast('Deine LP sind schon voll','#ccc');return;}const s=STACK[it.id];const h=s.pct?Math.round(S.maxhp*s.pct):s.heal;P.hp=Math.min(S.maxhp,P.hp+h);if(it.id.indexOf('potion')===0){P.poison=null;P.burn=null;P.slow=0;}sfx(it.id.indexOf('potion')===0?'drink':'eat');G.floats.push({x:P.x,y:P.y-34,t:`+${h}`,c:'#69f0ae',life:.9});it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;}
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
 {const n=cr?9:4,col=cr?'#ffd54a':(m.undead||m.type==='skeleton'?'#e0e0e0':'#ff6b5a');for(let i=0;i<n;i++)G.parts.push({x:m.x,y:m.y,z:14,vx:rnd(-120,120),vy:rnd(-120,120),life:.28,c:col});if(cr)G.floats.push({x:m.x,y:m.y-m.r-30,t:'KRITISCH!',c:'#ffd54a',life:.7});}
 if(G.settings.dmgNums)G.floats.push({x:m.x+rnd(-6,6),y:m.y-m.r-8,t:cr?`${dmg}!`:`${dmg}`,c:cr?'#ffd54a':(o.elem==='fire'?'#ffb070':o.elem==='frost'?'#9be7ff':'#fff'),life:.8,big:cr});
 for(let i=0;i<4;i++)G.parts.push({x:m.x,y:m.y,z:10,vx:rnd(-90,90),vy:rnd(-90,90),life:.35,c:o.pc||m.c});
 if(m.hp<=0)killMonster(m);}
function pickTarget(range,cone){let best=null,bs=-1e9;const ax=G.aim?G.aim.x:P.fx,ay=G.aim?G.aim.y:P.fy;
 for(const m of G.mons){if(m.dead||m.passive&&!m.provoked&&!m.aggro&&false)continue;const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy);if(d-m.r>range)continue;const dot=(dx*ax+dy*ay)/(d||1);if(dot<cone)continue;const sc=dot*200-d;if(sc>bs){bs=sc;best=m;}}return best;}
let warnT=0;function warn(t){if(G.time-warnT<1.4)return;warnT=G.time;G.floats.push({x:P.x,y:P.y-40,t,c:'#ffcc80',life:1});}
function attack(){if(P.atkCd>0||P.dead||P.dodgeT>0)return;{const hs=P.inv[P.sel];if(hs&&hs.id==='rod'){if(!G._rodLatch){G._rodLatch=1;G.fishAct();}return;}if(hs&&STACK[hs.id]&&STACK[hs.id].tool&&!G.room){P.atkCd=.35;G.toolSwing();return;}}const S=G.S;if(S.cls==='melee'&&!G.room)cutGrass();
 if(S.tooHigh){warn(`Benötigt Stufe ${reqLvl(S.tooHigh)}!`);}
 let weak=1;if(S.cls==='melee'){if(P.sta<S.staCost){weak=.45;P.sta=Math.max(0,P.sta-S.staCost*.3);warn('Erschöpft – schwacher Schlag!');}else P.sta-=S.staCost;P.staT=.7;}
 else if(S.cls==='magic'){if(P.mp<S.mpCost){warn('Kein Mana!');P.atkCd=.3;return;}P.mp-=S.mpCost;}
 else{const am=WKIND[S.kind].proj==='bolt'?'bolt':'arrow';if(countItem(am)<1){warn(am==='bolt'?'Keine Bolzen!':'Keine Pfeile!');P.atkCd=.4;return;}removeItem(am,1);}
 P.atkCd=S.cd*(weak<1?1.35:1);P.swing=.22;
 if(G.aim){P.fx=G.aim.x;P.fy=G.aim.y;}const FPB=G.settings.cam==='fp'?12:0,RCH=S.reach+FPB;const rng=S.cls==='melee'?RCH+6:S.range;const precise=S.cls!=='melee'&&!!G.aim;const t=pickTarget(rng,S.cls==='melee'?(S.thrust?.9:.55):precise?.972:.86);
 if(t){const d=Math.hypot(t.x-P.x,t.y-P.y)||1;const k=S.cls==='melee'?1:precise?.5:.72;let fx=P.fx*(1-k)+(t.x-P.x)/d*k,fy=P.fy*(1-k)+(t.y-P.y)/d*k;const l=Math.hypot(fx,fy)||1;P.fx=fx/l;P.fy=fy/l;}P.atkFx=P.fx;P.atkFy=P.fy;
 if(S.cls==='melee'){const fa=Math.atan2(P.fy,P.fx);let hit=false,anyCrit=false;
  for(const m of G.mons){if(m.dead)continue;const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy);if(d>RCH+m.r+6)continue;let a=Math.atan2(dy,dx)-fa;while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;
   let ok;if(S.thrust){const al=dx*P.fx+dy*P.fy,pe=Math.abs(-dx*P.fy+dy*P.fx);ok=al>-4&&pe<m.r+12;}else ok=Math.abs(a)<S.arc+Math.min(.45,(m.r+6)/Math.max(d,1));if(m===t)ok=true;
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
 dmg=Math.max(1,Math.round(dmg*rnd(.9,1.1)));if(P.riding&&P.mount&&!P.mount.dead){const hd=Math.round(dmg*.45);dmg=Math.max(1,dmg-hd);if(hd>0)horseHurt(hd);}if(P.hp-dmg<=0&&skR('second')&&!(P.secondT>0)){dmg=Math.max(0,P.hp-1);P.secondT=600;P.invT=2;G.toast('🕯 Zweite Chance! Du überlebst mit letzter Kraft.','#ffd54a',true);for(let i=0;i<20;i++)G.parts.push({x:P.x,y:P.y,z:20,vx:rnd(-120,120),vy:rnd(-120,120),life:.8,c:'#ffe082'});}P.hp-=dmg;P.hurtT=.25;sfx('hurt');G.floats.push({x:P.x,y:P.y-30,t:'-'+dmg,c:'#ff5252',life:.8});
 const rf=1-S.res/100;if(src.poison)P.poison={t:3.5,dps:Math.max(1,dmg*.12*rf)};if(src.burn)P.burn={t:3,dps:Math.max(1,dmg*.14*rf)};if(src.chill)P.slow=2*rf;if(src.root&&P.dodgeT<=0){P.rootT=Math.max(P.rootT||0,src.root*rf);G.floats.push({x:P.x,y:P.y-30,t:src.net?'Im Netz gefangen!':'Festgehalten!',c:'#ff8a80',life:.9});}if(src.grab||src.slow)P.slow=Math.max(P.slow||0,(src.slow?2.4:1.4)*rf);if(src.pull&&!src.pull.dead){P.pullFrom=src.pull;P.pullT=.32;G.floats.push({x:P.x,y:P.y-30,t:'Herangezogen!',c:'#ff8a80',life:.8});}if(src.vamp&&!src.vamp.dead){src.vamp.hp=Math.min(src.vamp.maxhp,src.vamp.hp+dmg*.6);}
 if(P.hp<=0){P.hp=0;die();}}
function die(){sfx('death');P.dead=true;P.poison=null;P.burn=null;const loss=G.deathLoss?G.deathLoss():Math.floor(P.gold*G.D().goldLoss);P.gold-=loss;{const st=P.stats||(P.stats={});st.deaths=(st.deaths||0)+1;st.deathGold=(st.deathGold||0)+loss;}G.lastLoss=loss;G.ui&&G.ui.onDeath&&G.ui.onDeath(loss);}
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
G.UNIQ=UNIQ;G.killMonster=m=>killMonster(m);G.hitPlayer=(d,o)=>hitPlayer(d,o||{});
function mkUnique(e,il,src){const o={name:e.name,src,ufx:e.ufx,ud:e.d,uniq:1};const rar=Math.random()<.25?4:3;if(e.k&&WKIND[e.k])return genItem('weapon',il+1,rar,Object.assign(o,{kind:e.k}));if(e.set)return genItem(e.s,il+1,rar,Object.assign(o,{set:e.set,kind:e.k}));return genItem(e.t,il+1,rar,o);}
function killMonster(m){m.dead=true;if(m.boss&&!m.summoned){P.bossK=(P.bossK||0)+1;if(BOSSES[m.boss]){const bs=P.bossSeen||(P.bossSeen={});bs[m.boss]=(bs[m.boss]||0)+1;}}if(m.realm)G.realmKilled(m);if(m.mistg)G.mistKilled(m);if(!m.summoned&&(m.type==='centaur'&&Math.random()<(m.boss?.6:.18)||m.boss&&m.boss!=='mini'&&Math.random()<.05)){const D=G.D();dropGround(mkBarding(m.lvl+(D.ilvl||0),Math.max(m.boss?2:0,rollRar(D.M))),m.x,m.y);G.toast('🐎 Eine Pferderüstung ist gefallen!','#ffd54a');}if(P.side)for(const k in SQ){const q=SQ[k],st=P.side[k];if(st&&st.st==='active'&&q.kill===m.type&&st.c<q.cnt){st.c++;if(st.c===q.cnt)G.toast(`📜 ${q.n}: erledigt! Zurück zu ${npcById(q.npc).short}.`,'#ffd54a',true);}}sfx(m.boss?'bosskill':'kill',m);if(m.boss==='dragon')sfx('aggro',{type:'dragon'});const D=G.D();const diff=m.lvl-P.level;let xp=m.xp;if(diff<=-7)xp*=.05;else if(diff<=-4)xp*=.3;else if(diff>=2)xp*=1+Math.min(diff,4)*.08;if(m.summoned)xp*=.3;if(m.boss){const bk=m.boss==='mini'?'mini:'+(m.room||m.type):m.boss;P.bossN=P.bossN||{};const bn=P.bossN[bk]||0;xp*=Math.max(.15,1/(1+bn*.8));P.bossN[bk]=bn+1;}xp=Math.max(1,Math.round(xp));
 gainXP(xp);G.floats.push({x:m.x,y:m.y-m.r-22,t:`+${xp} XP`,c:'#b388ff',life:1.1});
 for(let i=0;i<14;i++)G.parts.push({x:m.x,y:m.y,z:12,vx:rnd(-140,140),vy:rnd(-140,140),life:.55,c:m.c});
 const q=P.q;if(!m.boss&&!m.summoned)P.kills[m.type]=(P.kills[m.type]||0)+1;{const st=P.stats||(P.stats={});st.kills=(st.kills||0)+1;if(m.boss&&m.boss!=='mini')st.bosses=(st.bosses||0)+1;else if(m.boss==='mini')st.minis=(st.minis||0)+1;}
 if(P.main===2&&P.mN<qd('prove')){P.mN++;if(P.mN===qd('prove'))G.toast('⚔ Bewährt! Kehre zu Fürst Aldric zurück.','#ffd54a',true);}
 if((m.type==='wolf'||m.type==='icewolf')&&q.wolves==='active'&&q.wolfN<qd('wolves')){q.wolfN++;if(q.wolfN===qd('wolves'))G.toast('🐺 Genug Wölfe erlegt! Zurück zu Schmiedin Hilda.','#ffd54a',true);}
 if(m.type==='draugr'&&q.draugr==='active'&&q.draugrN<qd('draugr')){q.draugrN++;if(q.draugrN===qd('draugr'))G.toast('⚔ Die Draugr sind zurückgeschlagen! Zurück zu Jarl Ragna.','#ffd54a',true);}
 if(m.type==='goblin'&&q.ears==='active'&&countItem('ear')+G.grounds.filter(g=>g.it.id==='ear').length<qd('ears')&&Math.random()<.5)dropGround(mkStack('ear',1),m.x,m.y);
 mainKill(m);
 if(m.boss){if(m.B.fixed&&BOSSES[m.boss]&&!m.B.mini)G.fixT[m.boss]=m.boss==='dragon'?180:240;
  if(m.B.herald&&P.main===5&&P.macc&&!(P.shards||{})[m.boss]){P.shards=P.shards||{};P.shards[m.boss]=1;const n=Object.keys(P.shards).length;G.flashT=1;G.toast(`🔥 Glutsiegel-Splitter erbeutet! (${n}/3)`+(n>=3?' Bring sie zu Gunnar!':''),'#ffd54a',true);}
  else if(m.boss==='dragon'&&P.main===6){P.main=7;placeElara();G.toast('🐉 IGNAROK IST GEFALLEN! Sprich mit Prinzessin Elara.','#ffd54a',true);G.flashT=1.2;}
  else G.toast(`🏆 ${m.name} besiegt!`,'#ffd54a',true);}
 if(Math.random()<.6||m.boss){const g=Math.max(1,Math.round(rint(m.lvl,m.lvl*3)*(m.boss?8:1)*D.gold));G.grounds.push({x:m.x+rnd(-8,8),y:m.y+rnd(-8,8),gold:g,it:G.goldIt,t:0});}
 if(Math.random()<(m.boss?.35:.05))dropGround(mkStack(m.lvl>=18&&Math.random()<.3?'potion2':'potion',1),m.x,m.y);
 if(!m.boss&&Math.random()<.04)dropGround(mkStack(pick(P.carrotOK?['seed','hseed','carrot']:['seed','hseed','seed']),rint(1,2)),m.x,m.y);
 if(m.t.shot&&m.t.shot.kind==='arrow'&&Math.random()<.45)dropGround(mkStack('arrow',rint(3,8)),m.x,m.y);else if(Math.random()<.04)dropGround(mkStack(Math.random()<.6?'arrow':'bolt',rint(2,6)),m.x,m.y);
 if(Math.random()<.025)dropGround(mkStack('mpotion',1),m.x,m.y);
 if(m.summoned)return;
 if(!m.boss&&STACK['m_'+m.type]&&Math.random()<.05*(1+G.S.luck/200)){dropGround(mkStack('m_'+m.type,1),m.x,m.y);G.floats.push({x:m.x,y:m.y-m.r-36,t:'✦ '+STACK['m_'+m.type].name,c:'#ffcc80',life:1.4});}
 {const U=UNIQ[m.type]||(m.B&&m.B.mini&&UNIQ[m.B.base]);if(U){const e=pick(U);if(Math.random()<(e.ch||.035)*(m.boss?4:1)*(1+G.S.luck/100)){const it=mkUnique(e,m.lvl+G.D().ilvl,`${m.name} (Stufe ${m.lvl})`);dropGround(it,m.x,m.y);G.flashT=.8;G.toast(`★ EINZIGARTIG: ${it.name}!`,'#ff9e40',true,it);}}}
 const mini=m.B&&m.B.mini;const ch=m.B&&m.B.herald?1:Math.min(.95,(mini?D.chM:m.boss?D.chB:D.chN)*(1+G.S.luck/100));
 if(Math.random()<ch){const rar=rollRar(mini?D.M:m.boss?D.B:D.N);const il=m.lvl+D.ilvl+(m.boss?2:0);let it;const src=`${m.name} (Stufe ${m.lvl})`;
  if(m.boss&&(!mini||m.B.dboss)&&m.B.loot&&m.B.loot.length&&(m.B.herald||rar>=4||Math.random()<.6)){const e=pick(m.B.loot);const xo={ufx:e.ufx,ud:e.d};const rr=m.B.herald?Math.max(rar,3):rar;const bk=mini?undefined:m.boss;it=e.k&&WKIND[e.k]?genItem('weapon',il,rr,Object.assign({kind:e.k,name:e.name,boss:bk,f:e.f,src},xo)):e.set?genItem(e.s,il,rr,Object.assign({set:e.set,kind:e.k,name:e.name,boss:bk,f:e.f,src},xo)):genItem(e.t,il,rr,Object.assign({name:e.name,boss:bk,f:e.f,src},xo));if(!it.ufx&&it.af){const fk=e.f&&it.af[e.f]!=null?e.f:Object.keys(it.af)[0];if(fk){it.af[fk]=Math.round(it.af[fk]*1.6*10)/10;it.uniq=1;it.ud=`Segen von ${m.name.split(',')[0]}: Hauptwert +60 %`;}}}
  else{const lg=LG[(m.B&&m.B.lg)||(m.B?MT[m.B.base]&&MT[m.B.base].lg:null)||m.t.lg]||LG.beast;it=lootItem(pick(lg),il,rar,{bossy:!!m.boss,src});}
  dropGround(it,m.x,m.y);if(it.kind&&WKIND[it.kind]&&WKIND[it.kind].cls==='ranged')dropGround(mkStack(it.kind==='crossbow'?'bolt':'arrow',it.kind==='crossbow'?8:15),m.x,m.y);
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
// v20: Boss-Phasen, angekündigte Angriffe, thematische Diener
const ABN={slam:'Zerschmettern!',leap:'Sprungangriff!',combo:'Klingenwirbel!',sweep:'Rundumschlag!',fire:'Feuerregen!',volley:'Geschosshagel!',summon:'Ruft Diener!',line:'Sturmangriff!',quake:'Erdbeben!',inferno:'FEUERSTURM!'};
const MTHEME={zombie:'skeleton',ghoul:'skeleton',mummy:'scorpion',vampire:'bat',wraith:'skeleton',reaper:'skeleton',necro:'skeleton',banshee:'skeleton',treant:'pilzling',frostgiant:'icewolf',troll:'kobold',knight:'skeleton',basilisk:'salamander',minotaur:'bandit'};
const FIREB=new Set(['imp','lavaslime','salamander','wyrmling','phoenix']);
function bossExtra(m){if(m._ex)return m._ex;const b=m.B.base||m.type,t=MT[b]||m.t||{};return m._ex=m.boss==='dragon'?['inferno','line']:FIREB.has(b)?['inferno']:t.ai==='ranged'||t.shot?['quake']:['line','quake'];}
function bossAbility(m,dt,d){const isB=m.boss!=='mini'||m.B.dboss;
 if(!m.enraged&&m.hp<m.maxhp*.5&&isB){m.enraged=true;m.spd*=1.2;sfx('horn');G.toast(`🔥 ${m.name} gerät in Raserei – neue Angriffe!`,'#ff6e6e',true);for(let i=0;i<14;i++)G.parts.push({x:m.x,y:m.y,z:20,vx:rnd(-160,160),vy:rnd(-160,160),life:.6,c:'#ff4a2a'});}
 if(!m.desp&&m.hp<m.maxhp*.25&&isB){m.desp=true;G.toast(`☠ ${m.name} kämpft verzweifelt – weich aus!`,'#ff5252',true);m.abT=Math.min(m.abT,.6);const kids=G.mons.filter(k=>k.parent===m&&!k.dead).length;if(kids<5)for(let i=0;i<3;i++){const k=mkMonster(m.B.minion||MTHEME[m.B.base]||m.type,Math.max(1,m.lvl-2),m.x+rnd(-70,70),m.y+rnd(-70,70));if(!canMove(k.x,k.y,k.cr)){k.x=m.x;k.y=m.y;}k.parent=m;k.aggro=true;k.provoked=true;k.passive=false;k.summoned=true;k.room=m.room;G.mons.push(k);}}
 m.abT-=dt*(m.desp?1.7:m.enraged?1.35:1);if(m.abT>0||d>380||m.st)return;const ab=m.enraged&&isB?m.B.abil.concat(bossExtra(m)):m.B.abil,a=ab[m.abI++%ab.length],dr=m.boss==='dragon';m.abT=dr?2.6:3.6;
 if(ABN[a]&&(isB||a!=='slam'))G.floats.push({x:m.x,y:m.y-m.r-30,t:ABN[a],c:a==='inferno'||a==='fire'?'#ffb74d':'#ffe082',life:1.3});
 if(a==='inferno'){if(dr)G.toast('🔥 Ignarok holt tief Luft … such eine Lücke im Feuer!','#ff8a50',true);const safe=Math.random()*6.283,cx=P.x,cy=P.y;let n=0;for(let ring=0;ring<4;ring++){const R0=ring*78,cnt=ring?Math.round(ring*7):1;for(let i=0;i<cnt;i++){const an=i/cnt*6.283+ring*.4;let da=Math.abs(((an-safe)+Math.PI*3)%(Math.PI*2)-Math.PI);if(ring>0&&da<.55)continue;if(ring===0&&Math.random()<.5)continue;G.teles.push({x:cx+Math.cos(an)*R0,y:cy+Math.sin(an)*R0,r:46,t:1.75,max:1.75,dmg:m.dmg*1.35,lvl:m.lvl,c:'255,110,0',type:'magic',burn:1,q:n++>0});}}return;}
 if(a==='line'){const ux=(P.x-m.x)/(d||1),uy=(P.y-m.y)/(d||1);for(let i=0;i<12;i++){const dd=30+i*40;G.teles.push({x:m.x+ux*dd,y:m.y+uy*dd,r:34,t:1.2,max:1.2,dmg:m.dmg*1.3,lvl:m.lvl,c:'255,200,60',type:'phys',q:i>0});}m.st='leap';m.stT=1.1;m.lx=m.x+ux*Math.min(460,d+120);m.ly=m.y+uy*Math.min(460,d+120);if(!canMove(m.lx,m.ly,m.cr)){m.lx=P.x;m.ly=P.y;}m.sx0=m.x;m.sy0=m.y;return;}
 if(a==='quake'){for(let w=1;w<=3;w++){const R0=w*85,cnt=Math.round(R0/26);for(let i=0;i<cnt;i++){const an=i/cnt*6.283;G.teles.push({x:m.x+Math.cos(an)*R0,y:m.y+Math.sin(an)*R0,r:26,t:.8+w*.45,max:.8+w*.45,dmg:m.dmg*1.1,lvl:m.lvl,c:'200,160,90',type:'phys',q:i>0});}}return;}
 if(a==='leap'){m.st='leap';m.stT=1.1;m.lx=P.x;m.ly=P.y;m.sx0=m.x;m.sy0=m.y;G.teles.push({x:P.x,y:P.y,r:Math.max(60,m.r*2.2),t:1.1,max:1.1,dmg:m.dmg*1.5,lvl:m.lvl,c:'255,90,40',type:'phys'});return;}
 if(a==='combo'){const ux=(P.x-m.x)/(d||1),uy=(P.y-m.y)/(d||1);for(let i=0;i<3;i++){const dd=Math.min(d,40+i*38);G.teles.push({x:m.x+ux*dd,y:m.y+uy*dd,r:48+i*6,t:.75+i*.38,max:.75+i*.38,dmg:m.dmg*.9,lvl:m.lvl,c:'255,60,60',type:'phys'});}return;}
 if(a==='sweep'){G.teles.push({x:m.x,y:m.y,r:Math.max(110,m.r*3.6),t:1.25,max:1.25,dmg:m.dmg*1.2,lvl:m.lvl,c:'255,160,40',type:'phys',ring:1});return;}
 if(a==='slam')G.teles.push({x:P.x,y:P.y,r:dr?82:64,t:1.05,max:1.05,dmg:m.dmg*1.4,lvl:m.lvl,c:dr?'255,130,0':'255,50,50',type:'phys'});
 else if(a==='fire'){for(let i=0;i<3;i++){const ox=i?rnd(-95,95):0,oy=i?rnd(-95,95):0;G.teles.push({x:P.x+ox,y:P.y+oy,r:72,t:1.1+i*.18,max:1.1+i*.18,dmg:m.dmg*1.25,lvl:m.lvl,c:'255,130,0',type:'magic',burn:1});}}
 else if(a==='volley'){const n=dr?14:10,col=dr||m.heads?'#ff7a1a':(m.B.poison?'#9cff3b':(m.t.chill?'#9fe3ff':'#c77dff'));for(let i=0;i<n;i++){const an=i/n*6.283+m.anim;shoot(m,Math.cos(an),Math.sin(an),{c:col,spd:dr?230:190,kind:'orb',mul:.7,poison:m.B.poison,burn:dr||m.heads?1:0,chill:m.t.chill});}}
 else if(a==='summon'){const kids=G.mons.filter(k=>k.parent===m&&!k.dead).length;if(kids<4)for(let i=0;i<2;i++){const k=mkMonster(m.B.minion||MTHEME[m.B.base]||m.type,Math.max(1,m.lvl-2),m.x+rnd(-50,50),m.y+rnd(-50,50));if(!canMove(k.x,k.y,k.cr)){k.x=m.x;k.y=m.y;}k.parent=m;k.aggro=true;k.provoked=true;k.passive=false;k.summoned=true;k.room=m.room;G.mons.push(k);}}}
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
  const lvl=Math.max(1,zoneLevel(tx,ty)+rint(-1,1));const di=G.dayInfo();let key;if(di.night&&Math.random()<.55){const NL=['zombie','zombie','skeleton','spider','bat','shadowhound','wisp','banshee'];if(lvl>=8)NL.push('reaper','necro');if(lvl>=10)NL.push('vampire');if(di.full)NL.push('werewolf','werewolf','werewolf');key=pick(NL);}else key=pickType(tx,ty,lvl);const t=MT[key];const L=t.night?lvl:(t.rare?Math.max(t.lv[0],lvl):clamp(lvl,t.lv[0],40));const n=1+(t.pack&&Math.random()<.5?rint(1,Math.min(2,t.pack)):0);
  for(let k=0;k<n;k++){const x=(tx+.5)*TILE+(k?rnd(-30,30):0),y=(ty+.5)*TILE+(k?rnd(-30,30):0);if(k&&!canMove(x,y,10))continue;G.mons.push(mkMonster(key,L,x,y));}break;}}
function spawnBoss(){const ptx=P.x/TILE,pty=P.y/TILE,zl=zoneLevel(Math.floor(ptx),Math.floor(pty));if(zl<1)return false;const bl=BL[biome(ptx,pty)];
 if(G.dayInfo().night&&zl>=12&&Math.random()<.35){for(let i=0;i<20;i++){const a=Math.random()*6.283,d=rnd(7,11);const tx=Math.floor(ptx+Math.cos(a)*d),ty=Math.floor(pty+Math.sin(a)*d);if(!walkTile(tx,ty)||townAt(tx,ty)||dV(tx,ty)<RV+2)continue;const m=mkBoss('vampirelord',clamp(Math.min(zl+1,P.level+2),12,42),(tx+.5)*TILE,(ty+.5)*TILE);G.mons.push(m);sfx('horn');G.toast(`🦇 ${m.name} erhebt sich aus der Nacht! (Stufe ${m.lvl})`,'#ff6e6e',true);return true;}}
 let c=Object.keys(BOSSES).filter(k=>!BOSSES[k].fixed&&BOSSES[k].b.indexOf(bl)>=0&&zl>=BOSSES[k].lv[0]-1&&zl<=BOSSES[k].lv[1]);if(!c.length)c=Object.keys(BOSSES).filter(k=>!BOSSES[k].fixed&&BOSSES[k].b.indexOf(bl)>=0);if(!c.length)return false;const key=pick(c);
 for(let i=0;i<25;i++){const a=Math.random()*6.283,d=rnd(7,11);const tx=Math.floor(ptx+Math.cos(a)*d),ty=Math.floor(pty+Math.sin(a)*d);
  if(tx>=WW-2||!walkTile(tx,ty)||dV(tx,ty)<RV+14||townAt(tx,ty)||TOWNS.some(t=>Math.hypot(tx-t.x,ty-t.y)<t.r+12))continue;const m=mkBoss(key,clamp(Math.min(zl+1,P.level+2),1,BOSSES[key].lv[1]),(tx+.5)*TILE,(ty+.5)*TILE);G.mons.push(m);sfx('horn');sfx('aggro',{type:'boss'});G.toast(`⚠ Ein Boss ist erschienen: ${m.name} (Stufe ${m.lvl})`,'#ff6e6e',true);return true;}return false;}
G.spawnBoss=spawnBoss;
const FIX=[{key:'knut',at:RAUB,lv:()=>qd('knut'),cond:()=>stepIs('raub')&&P.macc&&!P.mflag},
 {key:'grimmholt',at:HUNT,lv:()=>qd('grimmholt'),cond:()=>stepIs('jagd')&&P.macc&&!P.mflag&&(P.lgN||0)>=qd('jagd')},
 {key:'morwenna',at:SCHWC,lv:()=>qd('morwenna'),cond:()=>stepIs('dorn')&&P.macc&&!P.mflag&&(P.lgN||0)>=qd('dorn')},
 {key:'severin',at:LEGION,lv:()=>qd('severin'),cond:()=>stepIs('legion')&&P.macc&&!P.mflag&&(P.lgN||0)>=qd('legion')},
 {key:'valdrik',at:CITADEL,lv:()=>qd('valdrik'),cond:()=>stepIs('n4')&&P.macc&&!P.mflag&&(P.lgN||0)>=qd('garde')},
 {key:'grukk',at:CAMP,lv:()=>qd('grukk'),cond:()=>pastStep('grukk')||(stepIs('grukk')&&P.macc)},
 {key:'bonelord',at:CRYPT,lv:()=>qd('morvax'),cond:()=>pastStep('morvax')||(stepIs('morvax')&&P.macc)},
 {key:'dragon',at:LAIR,lv:()=>qd('dragon'),cond:()=>P.main>=6&&(P.frost||P.main>6)},{key:'schnitter',at:{x:ASHVALE.x,y:ASHVALE.y-4},lv:()=>qd('schnitter'),cond:()=>P.main>5||(P.main===5&&P.macc)},{key:'eldtree',at:HERALDPOS().eldtree,lv:()=>qd('eldtree'),cond:()=>P.main>5||(P.main===5&&P.macc)},{key:'sandking',at:HERALDPOS().sandking,lv:()=>qd('sandking'),cond:()=>P.main>5||(P.main===5&&P.macc)}];
// v20: Dornenwachen von Schwarzwall – nur die Wachen greifen an, die Bürger nicht
const RPOST=[[-2,-14],[2,-8],[-6,-2],[6,0],[14,-1],[-3,9],[8,-5],[10,6]];G._realmDead=G._realmDead||{};
function realmTick(dt){G._rmT=(G._rmT||0)-dt;if(G._rmT>0||G.room)return;G._rmT=2;const t=TOWNS.find(q=>q.id==='schwarz');const near=Math.hypot(P.x/TILE-t.x,P.y/TILE-t.y)<t.r+30;
 if(!townHostile(t)||!near){for(const m of G.mons)if(m.realm&&!m.aggro)m.dead=true;return;}
 const lvl=Math.max(zoneLevel(t.x,t.y)+4,qd('lvDo')-2);RPOST.forEach(([dx,dy],i)=>{if(G.mons.some(m=>m.realm===i+1&&!m.dead))return;if((G._realmDead[i]||0)>G.time)return;const x=(t.x+dx+.5)*TILE,y=(t.y+dy+.5)*TILE;if(Math.hypot(P.x-x,P.y-y)<TILE*9)return;
  const m=mkMonster(i%3===2?'legarch':i===0?'blackknight':'legion',lvl,x,y);m.realm=i+1;m.passive=false;m.home={x,y};m.name='Dornenwache';G.mons.push(m);});}
G.realmKilled=m=>{if(m.realm)G._realmDead[m.realm-1]=G.time+150;};
function fixedTick(dt){campTick(dt);realmTick(dt);G.mistTick&&G.mistTick(dt);G.weekTick&&G.weekTick();for(const f of FIX){G.fixT[f.key]-=dt;if(G.fixT[f.key]>0||!f.cond())continue;if(G.mons.some(m=>m.boss===f.key&&!m.dead))continue;const px=(f.at.x+.5)*TILE,py=(f.at.y+.5)*TILE;if(Math.hypot(P.x-px,P.y-py)>TILE*40)continue;
 const m=mkBoss(f.key,f.lv(),px,f.key==='dragon'?py-TILE*1:py+TILE*1.5);G.mons.push(m);if(BOSSES[f.key].herald)G.toast(`☠ ${m.name} erwartet dich! (Stufe ${m.lvl})`,'#ff8a65',true);if(f.key==='dragon')sfx('aggro',{type:'dragon'});else{for(let i=0;i<3;i++){const FM={grukk:['goblin','goblin','shaman'],eldtree:['pilzling','treant','thornvine'],sandking:['mummy','scorpion'],knut:['bandit','bandit','archer'],severin:['legion','legarch','blackknight'],grimmholt:['legion','legarch'],morwenna:['legion','blackknight','legarch'],valdrik:['nebelgarde','runenwirker','nebelgarde']};const k=mkMonster(pick(FM[f.key]||['skeleton','skarcher']),Math.max(1,m.lvl-2),m.x+rnd(-90,90),m.y+rnd(-90,90));if(canMove(k.x,k.y,k.cr))G.mons.push(k);}}}}

// ===================== Quests & Story =====================
const npcById=id=>NPCS.find(n=>n.id===id);G.npcById=npcById;
const CHAP=['Kapitel 1: Erwachen','Kapitel 1: Audienz','Kapitel 1: Bewährung','','','Kapitel 19: Die drei Herolde','Kapitel 20: Ignarok','Kapitel 20: Die Prinzessin','Kapitel 21: Heimkehr','','Epilog'];
// ===== Hauptquest-Schritte (P.main 3, 4 und 9; Unterschritt P.ms) =====
// kind: fix (Boss im Freien) | dungeon (Boss im Dungeon) | kill (Gegner zählen) | camp (Lager stürmen, dann Boss) | talk (zu jemandem reisen)
const tpT=(x,y)=>({x:(x+.5)*TILE,y:(y+.5)*TILE});const roomTo=id=>{const r=ROOMS.find(q=>q.id===id);return r?{x:r.ent.x,y:r.ent.y}:null;};
const MSQ={3:[
 {id:'vorrat',qitem:'Saatbeutel vom Fürsten',qic:'🌾',ch:'Kapitel 2: Nach dem Feuer',gate:'lvV',kind:'bring',item:'wheat',n:5,turnin:'bernd',
  low:L=>'Komm erst wieder zu Kräften.',
  give:'Bevor wir uns um das Reich kümmern: Unser Dorf hungert. Vor drei Tagen hat Ignarok die Kornspeicher niedergebrannt, und Bäcker Bernd hat kein Mehl mehr. Geh zu Gärtnerin Linde in der Gärtnerei – sie gibt dir in meinem Namen Saat, Harke und Gießkanne. Bring Bernd fünf Bündel Weizen.',
  acc:'Ich kümmere mich um Weizen',goal:()=>`Baue Weizen an und bring Bäcker Bernd 5 Weizen (${countItem('wheat')}/5) – Saat & Werkzeug bei Gärtnerin Linde`,to:()=>{const n=npcById(P.q.lindeKit?'bernd':'linde');return n?{x:n.x,y:n.y}:null;},
  wait:'Gärtnerin Linde in der Gärtnerei hilft dir mit Saat und Werkzeug. Bernd wartet in der Bäckerei.',ret:'Bring Bäcker Bernd 5 Weizen',
  done:'Fünf Bündel! Den Göttern sei Dank – heute riecht Eichenhain wieder nach Brot. Komm mit Zutaten von deinen Feldern zu mir: Ich backe dir Gerichte, die dich stärker, schneller oder zäher machen. Und Ritter – Fürst Aldric hat nach dir gefragt.',
  btn:'Weizen übergeben',gold:30,items:()=>[mkStack('bread',4)],lore:'Der Spieler hat Bäcker Bernd nach dem Drachenangriff mit Weizen versorgt.',after:()=>{P.q.bread='done';}},
 {id:'gilde',ch:'Kapitel 3: Die Abenteurergilde',gate:'lvV',kind:'talk',turnin:'isolde',
  low:L=>'Ruh dich aus.',
  give:'Gut, dass du da bist. Die Abenteurergilde hat endlich wieder eine Meisterin: Isolde, eine alte Söldnerin. Melde dich bei ihr – sie hat ein Kopfgeld, das uns alle betrifft.',
  acc:'Ich gehe zur Gilde',goal:()=>'Melde dich bei Gildenmeisterin Isolde in der Abenteurergilde',to:()=>{const n=npcById('isolde');return n?{x:n.x,y:n.y}:null;},
  wait:'Die Abenteurergilde liegt im Westen des Dorfes.',ret:'Sprich mit Gildenmeisterin Isolde',
  done:'Du bist also der Ritter, über den alle reden. Ich trage dich ein. Hier ist dein erster Aushang: Heute Nacht sind Räuber in die Burg eingestiegen und haben die Karte des Reiches gestohlen. Kopfgeld auf ihren Hauptmann Knut! Und merk dir: Bei der Gilde gibt es alle drei Tage neue Aufträge – und ich kaufe dir Jagdbeute ab.',
  btn:'Eingetragen!',gold:20,items:()=>[mkStack('potion',1)],lore:'Der Spieler ist der Abenteurergilde von Eichenhain beigetreten.'},
 {id:'raub',qitem:'Die Karte des Reiches (verschmiert)',qic:'🗺️',ch:'Kapitel 4: Die gestohlene Karte',gate:'lvR',kind:'fix',boss:'knut',giver:'isolde',where:'Gildenmeisterin Isolde in der Abenteurergilde',turnin:'edwin',
  low:L=>`Du bist noch zu schwach, Ritter. Werde stärker, mindestens Stufe ${qd('lvR')} – die Wiesen vor den Toren sind ein guter Ort dafür. Du bist Stufe ${L}.`,
  give:'Das Kopfgeld: Räuberhauptmann Knut hat die Karte des Reiches gestohlen – mit allen Wegen, Furten und Festungen von Eldmar! Sein Lager liegt nordöstlich, ein gutes Stück hinter den Feldern. Hol die Karte zurück. Und bring sie zuerst zu Kartograph Edwin – Räuber kritzeln gern ihre eigenen Zeichen darauf.',
  acc:'Ich hole die Karte zurück',goal:()=>'Besiege Räuberhauptmann Knut im Räuberlager (nordöstlich des Dorfes)',to:()=>tpT(RAUB.x,RAUB.y),
  wait:'Das Räuberlager liegt nordöstlich des Dorfes. Folge dem goldenen ★.',ret:'Bring die Karte zu Kartograph Edwin in der Kartenstube',
  found:'📜 Die gestohlene Karte ist zurück! Knut trug außerdem einen Brief mit schwarzem Siegel bei sich.',
  done:'*Edwin rückt seine Brille zurecht.* Verschmiert, zerknittert … und die Räuber haben ihre Zeichen daraufgekritzelt. Moment … das sind keine Kritzeleien. Das ist eine Geheimschrift! Gib mir einen Augenblick … So. Ich habe sie entziffert und die Ortsmarker der Städte gleich mit eingetragen. Bring sie dem Fürsten.',
  btn:'Karte zum Entziffern geben',gold:40,items:()=>[mkStack('potion',2)],lore:'Der Spieler hat die gestohlene Karte von Räuberhauptmann Knut zurückgeholt und Kartograph Edwin hat sie entziffert.',after:()=>{P.mapMarks=1;G.ui&&G.ui.revealTowns&&G.ui.revealTowns();}},
 {id:'karte',qitem:'Entzifferte Karte des Reiches',qic:'🗺️',ch:'Kapitel 5: Die entzifferte Karte',gate:'lvV',kind:'talk',giver:'edwin',where:'Kartograph Edwin in der Kartenstube',turnin:'aldric',
  low:L=>'…',give:'Die Räuber haben eine Geheimschrift benutzt – und zwar eine, die ich vom Siegel der Schwarzen Legion kenne. Da steht: „Die Ware zur Hütte des Einsiedlers“. Bring dem Fürsten die Karte, schnell!',
  acc:'Ich bringe sie dem Fürsten',goal:()=>'Bring die entzifferte Karte zu Fürst Aldric',to:()=>{const n=npcById('aldric');return n?{x:n.x,y:n.y}:null;},wait:'Fürst Aldric wartet auf der Burg.',ret:'Bring die entzifferte Karte zu Fürst Aldric',
  done:'Meine Karte – und entziffert! Gut gemacht. Aber diese Geheimschrift … ein schwarzes Siegel mit einer eisernen Krone. Das Zeichen der Schwarzen Legion aus dem Süden! „Die Ware zur Hütte des Einsiedlers“. Was haben Räuber mit dem alten Bertolt zu schaffen?',
  btn:'Karte übergeben',gold:20,items:()=>[],lore:'Fürst Aldric hat die entzifferte Karte erhalten.'},
 {id:'hut',qitem:'Tagebuch des Einsiedlers',qic:'📓',ch:'Kapitel 3: Die Hütte des Einsiedlers',gate:'lvE',kind:'dungeon',room:'hut',base:'ghoul',add:'spider',lv:'hermit',name:'Der verfluchte Einsiedler',
  enter:'☠ Ein fauliger Gestank … Etwas Untotes haust in der Hütte!',
  low:L=>`Die Hütte des Einsiedlers liegt weit draußen in den Wiesen. Komm mit Stufe ${qd('lvE')} wieder. Du bist Stufe ${L}.`,
  give:'Der alte Einsiedler Bertolt lebt allein in seiner Hütte südwestlich von hier, am Rand der Wiesen. Seit Wochen hat ihn niemand gesehen. Geh hin und finde heraus, was dort vor sich geht.',
  acc:'Ich sehe nach',goal:()=>'Erkunde die Hütte des Einsiedlers (Wiesen, Südwesten)',to:()=>roomTo('hut'),
  wait:'Die Hütte liegt südwestlich in den Wiesen. Folge dem goldenen ★.',ret:'Bring Bertolts Zeichnungen zu Fürst Aldric',
  found:'📜 Du findest beim Einsiedler Zeichnungen von Soldaten mit schwarzen Bannern – und von Wölfen in Käfigen!',
  done:'Bertolt … verflucht und untot. Möge er Frieden finden. Diese Zeichnungen: Legionäre, die Wölfe in Käfigen halten und mit Asche füttern! Das erklärt, warum die Wölfe im Nordwesten so rasend sind. Ihr Bau liegt dort draußen.',
  btn:'Zeichnungen übergeben',gold:60,items:L=>[genItem('chest',Math.max(3,L),1)],lore:'Der Einsiedler Bertolt wurde verflucht aufgefunden; die Legion füttert Wölfe mit Asche.'},
 {id:'wolf',qitem:'Graumähnes Reißzahn',qic:'🦷',ch:'Kapitel 4: Die Wolfsmutter',gate:'lvWo',kind:'dungeon',room:'wolfden',base:'wolf',add:'wolf',lv:'wolfmom',name:'Graumähne, die Wolfsmutter',
  enter:'🐺 Ein tiefes Knurren hallt durch den Bau … Augen glühen wie Kohlen.',
  low:L=>`Die Wölfe im Nordwesten zerreißen jeden Anfänger. Werde mindestens Stufe ${qd('lvWo')}. Du bist Stufe ${L}.`,
  give:'Die Wölfe aus dem Bau im Nordwesten reißen Hildas Schafe und greifen sogar Reisende an. Ihre Mutter, Graumähne, ist von der Asche wahnsinnig geworden. Erlöse sie – und finde heraus, wer ihr das angetan hat.',
  acc:'Ich gehe zum Wolfsbau',goal:()=>'Erlöse Graumähne im Wolfsbau (Wiesen, Nordwesten)',to:()=>roomTo('wolfden'),
  wait:'Der Wolfsbau liegt nordwestlich in den Wiesen. Folge dem goldenen ★.',ret:'Bring das Aschenamulett zu Fürst Aldric',
  found:'🐺 Graumähne ist erlöst. An ihrem Hals hing ein glühendes Aschenamulett mit dem Zeichen eines Brandstifters.',
  done:'Ein Aschenamulett … Dieses Zeichen kenne ich: Es wurde in den Ruinen von Aschental an die Wände geschmiert. Vielleicht hat nicht nur der Drache Aschental verbrannt. Im verkohlten Keller dort soll sich jemand verstecken.',
  btn:'Amulett übergeben',gold:80,items:L=>[genItem('helm',Math.max(4,L),1)],lore:'Graumähne, die Wolfsmutter, wurde mit einem Aschenamulett der Legion wahnsinnig gemacht.'},
 {id:'ash',qitem:'Malriks Brandbrief',qic:'✉️',ch:'Kapitel 5: Asche über Aschental',gate:'lvA',kind:'dungeon',room:'cellar',base:'shaman',add:'ghoul',lv:'malrik',name:'Brandstifter Malrik',
  enter:'🔥 „Noch ein Held, der verbrennen will? Wie schön!“',
  low:L=>`Aschental ist gefährlich geworden. Komm mit Stufe ${qd('lvA')} wieder. Du bist Stufe ${L}.`,
  give:'Aschental liegt im Norden, an der Straße nach Glutwacht. Im verkohlten Keller unter den Ruinen haust ein Brandstifter. Finde ihn und finde heraus, für wen er arbeitet.',
  acc:'Auf nach Aschental',goal:()=>'Besiege den Brandstifter im verkohlten Keller (Ruinen von Aschental)',to:()=>roomTo('cellar'),
  wait:'Die Ruinen von Aschental liegen nördlich an der Straße. Folge dem goldenen ★.',ret:'Bring Malriks Notizen zu Fürst Aldric',
  found:'📜 Brandstifter Malrik ist besiegt. Seine Notizen sprechen von Waffenlieferungen ins Räubernest.',
  done:'Malrik hat Aschental angezündet, BEVOR der Drache kam – im Auftrag der Legion! Und die Waffen dafür kamen aus dem Räubernest, der Höhle von Räuberfürst Falk östlich der Ruinen.',
  btn:'Notizen übergeben',gold:90,items:L=>[genItem('weapon',Math.max(5,L),2)],lore:'Brandstifter Malrik hat Aschental im Auftrag der Legion angezündet.'},
 {id:'nest',qitem:'Falks Beuteliste',qic:'📃',ch:'Kapitel 6: Das Räubernest',gate:'lvN',kind:'dungeon',room:'banditcave',base:'bandit',add:'archer',lv:'falk',name:'Räuberfürst Falk',
  enter:'⚔ „Wer wagt es, in mein Nest einzudringen?!“',
  low:L=>`Im Räubernest hausen Dutzende Halsabschneider. Werde stärker, mindestens Stufe ${qd('lvN')}. Du bist Stufe ${L}.`,
  give:'Das Räubernest ist eine Höhle östlich der Ruinen von Aschental. Dort sitzt Räuberfürst Falk. Bring mir Beweise, für wen er arbeitet!',
  acc:'Auf ins Räubernest',goal:()=>'Besiege Räuberfürst Falk im Räubernest',to:()=>roomTo('banditcave'),
  wait:'Das Räubernest liegt östlich von Aschental. Folge dem goldenen ★.',ret:'Bring Falks Sold-Brief zu Fürst Aldric',
  found:'📜 Falk trug einen Sold-Brief der Schwarzen Legion bei sich!',
  done:'Ein Sold-Brief, unterschrieben von Feldherr Severin! Die Legion bezahlt Räuber, Orks UND Goblins. Hier steht auch: Eine Hexe im Moor erschafft Untote für sie – und sie hat den Schlüssel zur Krypta des Morvax gestohlen.',
  btn:'Brief übergeben',gold:110,items:L=>[genItem('weapon',Math.max(6,L),2,{kind:'sword'})],lore:'Räuberfürst Falk ist besiegt; Feldherr Severin der Legion bezahlt Räuber, Orks und Goblins.'},
 {id:'gift',qitem:'Bündel Heilkraut',qic:'🌿',ch:'Kapitel: Das Moorgift',gate:'lvW',kind:'bring',item:'herb',n:3,turnin:'mara',
  low:L=>`Das Moor ist tödlich. Komm mit Stufe ${qd('lvW')} wieder. Du bist Stufe ${L}.`,
  give:'Bevor du ins Nebelmoor gehst: Die Hexe dort vergiftet Brunnen und Pfeile. Heilerin Mara kann ein Gegengift brauen – aber ihr fehlt Heilkraut. Gärtnerin Linde verkauft Heilkrautsamen; sie wachsen am Wasser. Bring Mara drei Heilkraut.',
  acc:'Ich besorge Heilkraut',goal:()=>`Bring Heilerin Mara 3 Heilkraut (${countItem('herb')}/3) – Samen bei Gärtnerin Linde`,to:()=>{const n=npcById('mara');return n?{x:n.x,y:n.y}:null;},
  wait:'Heilkrautsamen gibt es bei Gärtnerin Linde. Sie wachsen nur nahe am Wasser.',ret:'Bring Heilerin Mara 3 Heilkraut',
  done:'Genau richtig! *Sie zerstößt das Kraut und murmelt etwas.* Hier – drei Fläschchen Gegengift. Das Moor wird dir nichts anhaben.',
  btn:'Kraut übergeben',gold:40,items:()=>[mkStack('potion2',2)],lore:'Heilerin Mara hat dem Spieler Gegengift gebraut.'},
 {id:'schmied',ch:'Kapitel: Hildas Meisterstück',gate:'lvW',kind:'talk',turnin:'hilda',
  low:L=>'…',give:'Schmiedin Hilda hat die ganze Nacht an der Esse gestanden. Sie sagt, sie habe etwas für dich – gegen das, was im Moor lauert. Geh zu ihr.',
  acc:'Ich gehe zu Hilda',goal:()=>'Sprich mit Schmiedin Hilda in der Schmiede',to:()=>{const n=npcById('hilda');return n?{x:n.x,y:n.y}:null;},wait:'Die Schmiede liegt im Norden des Dorfes.',ret:'Sprich mit Schmiedin Hilda',
  done:'Da bist du ja! Für dich, Ritter – geschmiedet aus dem Eisen der alten Kornspeicher, die der Drache zerstört hat. Möge es Eichenhain rächen. Und denk dran: Ausrüstung, die du nicht brauchst, kauf ich dir ab – aber nur Ausrüstung, keine Rüben!',
  btn:'Danke, Hilda',gold:0,items:L=>[genItem('weapon',L+1,2,{name:'Hildas Meisterstück'})],lore:'Schmiedin Hilda hat dem Spieler eine Waffe geschmiedet.'},
 {id:'turm',qitem:'Grimeldas Hexenbuch',qic:'📕',ch:'Kapitel 7: Der Wachturm im Moor',gate:'lvW',kind:'dungeon',room:'wtower',base:'witch',add:'ghoul',lv:'grimelda',name:'Moorhexe Grimelda',
  enter:'🌫 Kichern hallt durch den Turm … die Moorhexe erwartet dich!',
  low:L=>`Das Nebelmoor verschlingt Unvorsichtige. Werde stärker, mindestens Stufe ${qd('lvW')}. Du bist Stufe ${L}.`,
  give:'Die Moorhexe Grimelda haust im alten Wachturm am Rand des Nebelmoors, westlich von hier. Sie erschafft Moorleichen für die Legion und hat den Kryptaschlüssel. Halte sie auf!',
  acc:'Auf zum Wachturm',goal:()=>'Besiege Moorhexe Grimelda im alten Wachturm (Nebelmoor)',to:()=>roomTo('wtower'),
  wait:'Der alte Wachturm steht am Rand des Nebelmoors im Westen. Folge dem goldenen ★.',ret:'Bring den Kryptaschlüssel zu Fürst Aldric',
  found:'🗝 Du hast den Kryptaschlüssel – und einen Brief an die Orks in der Schlucht!',
  done:'Der Kryptaschlüssel! Gut. Aber dieser Brief ist noch schlimmer: Orks in der Schluchtgrotte im Süden sollen Eichenhain angreifen, sobald die Legion das Zeichen gibt.',
  btn:'Schlüssel übergeben',gold:140,items:()=>[mkStack('potion2',1)],lore:'Moorhexe Grimelda ist besiegt, der Kryptaschlüssel gefunden.'},
 {id:'grotte',qitem:'Brakkas Kriegshorn',qic:'📯',ch:'Kapitel 8: Die Orks der Schlucht',gate:'lvO',kind:'dungeon',room:'grotto',base:'orc',add:'orc',lv:'brakka',name:'Orkhäuptling Brakka',
  enter:'🪓 „Menschling! Brakka zerquetscht dich!“',
  low:L=>`Orks sind keine Räuber. Werde stärker, mindestens Stufe ${qd('lvO')}. Du bist Stufe ${L}.`,
  give:'Die Schluchtgrotte liegt in der Steinöde, im Süden, tief in der großen Schlucht. Dort sammelt Orkhäuptling Brakka seine Krieger. Schlag zu, bevor sie es tun!',
  acc:'Ich stelle mich den Orks',goal:()=>'Besiege Orkhäuptling Brakka in der Schluchtgrotte (Steinöde, Süden)',to:()=>roomTo('grotto'),
  wait:'Die Schluchtgrotte liegt in der Schlucht der Steinöde im Süden. Folge dem goldenen ★.',ret:'Bring Brakkas Kriegskarte zu Fürst Aldric',
  found:'🗺 Brakka ist gefallen! Seine Kriegskarte zeigt die Wege der Legion durchs Moor und den Finsterwald.',
  done:'Mit dieser Karte sehen wir ihre Wege. Das Moor und der Finsterwald brennen an allen Ecken. Unsere Verbündeten brauchen Hilfe: Vogt Aldwin in Moorbruck im Westen und Försterin Liv in Waldheim im Osten. Geh zuerst zu Aldwin.',
  btn:'Kriegskarte übergeben',gold:170,items:L=>[genItem('legs',L,2)],lore:'Orkhäuptling Brakka ist besiegt; seine Kriegskarte zeigt die Wege der Legion.'}],
 4:[
 {id:'moor',ch:'Kapitel 9: Die Moorleichen von Moorbruck',gate:'lvMo',kind:'kill',giver:'aldwin',where:'Vogt Aldwin in Moorbruck (Nebelmoor, Westen)',types:['ghoul','zombie','skeleton'],cnt:'moorkill',near:()=>TP('moor',0,0),rad:110,
  low:L=>`Fürst Aldric schickt dich? Das Moor ist kein Ort für Stufe ${L}. Komm mit Stufe ${qd('lvMo')} wieder.`,
  give:`Seit Grimelda tot ist, wandern ihre Moorleichen führerlos umher – und Moorbruck ist umzingelt! Schick ${qd('moorkill')} Untote rund um Moorbruck zurück ins Grab.`,
  acc:'Ich helfe Moorbruck',goal:()=>`Erschlage Untote rund um Moorbruck: ${P.lgN||0}/${qd('moorkill')}`,to:()=>null,
  wait:'Die Untoten streifen rund um Moorbruck durchs Moor.',ret:'Kehre zu Vogt Aldwin zurück',
  found:'💀 Genug Untote erschlagen! Kehre zu Vogt Aldwin zurück.',
  done:'Moorbruck atmet wieder auf. Danke, Ritter. Ein Bote aus Waldheim kam gestern: Försterin Liv braucht dich dringend im Finsterwald, im Osten.',
  btn:'Gern geschehen',gold:200,items:L=>[genItem('boots',L,2)],lore:'Der Spieler hat Moorbruck von den Moorleichen befreit.'},
 {id:'forst',qitem:'Bündel für die Palisade',qic:'🪵',ch:'Kapitel: Holz für Waldheim',gate:'lvWa',kind:'bring',item:'holz',n:10,turnin:'liv',
  low:L=>`Der Finsterwald ist gefährlich. Komm mit Stufe ${qd('lvWa')} wieder. Du bist Stufe ${L}.`,
  give:'Waldheim im Finsterwald ruft um Hilfe: Goblins haben die Palisade niedergebrannt, und Försterin Liv hat niemanden mehr, der Holz schlägt. Reise nach Waldheim – Liv gibt dir eine Axt. Schlag zehn Holz und bring es ihr.',
  acc:'Ich helfe Waldheim',goal:()=>`Schlag Holz und bring Försterin Liv 10 Holz (${countItem('holz')}/10) – die Axt gibt dir Liv`,to:()=>{const n=npcById('liv');return n?{x:n.x,y:n.y}:null;},
  wait:'Waldheim liegt im Finsterwald im Osten.',ret:'Bring Försterin Liv 10 Holz',
  done:'Zehn Stämme! Damit flicken wir die Palisade noch heute. Behalte die Axt – Holz kauf ich dir immer ab, und Setzlinge gibt es bei mir auch. Aber die Goblins kommen wieder …',
  btn:'Holz übergeben',gold:80,items:()=>[mkStack('potion',2)],lore:'Der Spieler hat Waldheim mit Holz für die Palisade geholfen.'},
 {id:'wald',ch:'Kapitel 10: Krieg im Finsterwald',gate:'lvWa',kind:'kill',giver:'liv',where:'Försterin Liv in Waldheim (Finsterwald, Osten)',types:['goblin','shaman'],cnt:'gobkill',near:()=>TP('wald',0,0),rad:140,
  low:L=>`Du willst im Finsterwald kämpfen? Mit Stufe ${L}? Komm mit Stufe ${qd('lvWa')} wieder.`,
  give:`Grukks Goblins brennen meinen Wald nieder! Erlege ${qd('gobkill')} Goblins rund um Waldheim, dann zeig ich dir den Weg zu ihrem Häuptling.`,
  acc:'Ich jage die Goblins',goal:()=>`Erlege Goblins rund um Waldheim: ${P.lgN||0}/${qd('gobkill')}`,to:()=>null,
  wait:'Die Goblins streifen durch den Finsterwald rund um Waldheim.',ret:'Kehre zu Försterin Liv zurück',
  found:'👺 Die Goblins fliehen! Kehre zu Försterin Liv zurück.',
  done:'Gute Jagd! Grukks Lager liegt südlich von hier, tief im Wald. Er hat die Karte, die Aldrics Späher bei sich trug – den einzigen Weg zum Drachenhort.',
  btn:'Zeig mir den Weg',gold:220,items:L=>[genItem('weapon',L,2,{kind:'longbow'})],lore:'Der Spieler hat Waldheim gegen Grukks Goblins verteidigt.'},
 {id:'grukk',qitem:'Grukks Häuptlingsknochen',qic:'🦴',ch:'Kapitel 11: Grukks Lager',gate:'lvG',kind:'fix',boss:'grukk',giver:'liv',where:'Försterin Liv in Waldheim',turnin:'aldric',
  low:L=>`Grukk ist kein gewöhnlicher Gegner. Werde stärker, mindestens Stufe ${qd('lvG')}. Du bist Stufe ${L}.`,
  give:'Grukks Lager liegt südlich von Waldheim, tief im Finsterwald. Hol dir die Karte des Spähers und bring sie Fürst Aldric!',
  acc:'Ich hole die Karte',goal:()=>'Besiege Goblinhäuptling Grukk im Goblinlager (südlich von Waldheim)',to:()=>tpT(CAMP.x,CAMP.y),
  wait:'Grukks Lager liegt südlich von Waldheim. Folge dem goldenen ★.',ret:'Bring die Karte des Spähers zu Fürst Aldric',
  found:'📜 Du hast die Karte des Spähers gefunden! Bring sie zu Fürst Aldric.',
  done:'Die Karte! Bei allen Göttern … Der Weg zum Hort ist durch ein Aschensiegel versperrt. Nur der Siegelstein öffnet es – und den hütet Knochenfürst Morvax in seiner Krypta. Den Schlüssel hast du ja schon.',
  btn:'Karte übergeben',gold:260,items:L=>[genItem('amulet',L+1,2)],lore:'Grukk ist besiegt und die Karte des Spähers gefunden.'},
 {id:'morvax',qitem:'Splitter des Siegelsteins',qic:'💠',ch:'Kapitel 12: Der Siegelstein',gate:'lvM',kind:'fix',boss:'bonelord',
  low:L=>`Morvax hat ganze Heere ins Grab gebracht. Werde stärker, mindestens Stufe ${qd('lvM')}. Du bist Stufe ${L}.`,
  give:'Mit Grimeldas Schlüssel kommst du in die Krypta des Knochenfürsten, weit im Südwesten des Nebelmoors. Bring mir den Siegelstein!',
  acc:'Auf zur Krypta',goal:()=>'Besiege Knochenfürst Morvax in der Krypta (Nebelmoor, Südwesten)',to:()=>tpT(CRYPT.x,CRYPT.y),
  wait:'Die Krypta liegt im Südwesten des Nebelmoors. Folge dem goldenen ★.',ret:'Bring den Siegelstein zu Fürst Aldric',
  found:'💠 Der Siegelstein ist dein! Bring ihn zu Fürst Aldric.',
  done:'Der Siegelstein … er glüht wie Kohle. Doch meine Späher melden Schreckliches: Die Schwarze Legion hat in der Steinöde ein Kriegslager errichtet. Sie will Eldmar überfallen, sobald Ignarok das Land in Brand setzt!',
  btn:'Siegelstein übergeben',gold:300,items:L=>[genItem('ring',L+1,2)],lore:'Morvax ist besiegt und der Siegelstein gefunden.'},
 {id:'legion',qitem:'Kriegspläne der Legion',qic:'📜',ch:'Kapitel 13: Die Schwarze Legion',gate:'lvL',kind:'camp',at:()=>LEGION,types:['legion','legion','legarch','blackknight'],cnt:'legion',lv:'severin',boss:'severin',
  low:L=>`Das Kriegslager wird von Legionären und Schwarzrittern bewacht. Werde stärker, mindestens Stufe ${qd('lvL')}. Du bist Stufe ${L}.`,
  give:'Das Kriegslager der Schwarzen Legion liegt im Süden, in der Steinöde. Dring ein, schalte die Wachen und Ritter aus und besiege Feldherr Severin. Bring mir seine Kriegspläne!',
  acc:'Ich dringe ins Lager ein',goal:()=>(P.lgN||0)<qd('legion')?`Dring ins Kriegslager der Legion ein (Steinöde): Wachen & Ritter ${P.lgN||0}/${qd('legion')}`:'Besiege Feldherr Severin im Kriegslager',to:()=>tpT(LEGION.x,LEGION.y),
  wait:'Das Kriegslager liegt im Süden in der Steinöde. Folge dem goldenen ★.',ret:'Bring Severins Kriegspläne zu Fürst Aldric',
  found:'⚔ Feldherr Severin ist besiegt! Du erbeutest die Kriegspläne der Legion.',
  done:'Diese Pläne … Die Legion wartet nur darauf, dass Ignarok Eldmar niederbrennt – dann marschiert Kaiser Valdrik ein. Und der Siegelstein hat einen Riss! Nur die Glutesse der Zwerge kann ihn neu schmieden. Zwerg Durin in Frosthafen kennt den Weg.',
  btn:'Pläne übergeben',gold:350,items:L=>[genItem('weapon',L+1,3)],lore:'Feldherr Severin der Schwarzen Legion ist besiegt, seine Kriegspläne erbeutet.'},
 {id:'zwerg',qitem:'Neu geschmiedeter Siegelstein',qic:'💎',ch:'Kapitel 14: Die Glutesse der Zwerge',gate:'lvZ',kind:'dungeon',room:'dwarf',base:'greydwarf',add:'golem',lv:'grimbart',name:'Steinkönig Grimbart',giver:'durin',where:'Zwerg Durin in Frosthafen (Frostlande, Nordwesten)',
  enter:'⛏ Steinstaub rieselt … der Steinkönig erhebt sich von seinem Thron!',
  low:L=>`Ein Riss im Siegelstein? Hm. Die Binge ist voller Ungeheuer, Stufe ${L} reicht da nicht. Komm mit Stufe ${qd('lvZ')} wieder.`,
  give:'Die Glutesse meiner Ahnen liegt in der Zwergenbinge im Graukamm-Gebirge. Ein Steinkönig aus Fels und Zorn hat sie besetzt. Besiege ihn, dann schmiede ich den Siegelstein neu.',
  acc:'Ich befreie die Binge',goal:()=>'Besiege Steinkönig Grimbart in der Zwergenbinge (Graukamm-Gebirge)',to:()=>roomTo('dwarf'),
  wait:'Die Zwergenbinge liegt im Graukamm-Gebirge östlich von Frosthafen. Folge dem goldenen ★.',ret:'Kehre zu Zwerg Durin zurück',
  found:'🔥 Die Glutesse brennt wieder! Kehre zu Durin zurück.',
  done:'Bei meinem Bart … die Esse brennt! *Hämmern* … Hier, der Siegelstein ist wieder ganz. Bring Fürst Aldric die Nachricht. Wenn die Zeit reif ist, bricht Gunnar, der Drachenjäger, damit das Aschensiegel.',
  btn:'Danke, Durin',gold:400,items:L=>[genItem('chest',L+1,3)],lore:'Durin hat den Siegelstein in der Glutesse der Zwerge neu geschmiedet.'},
 {id:'fell',ch:'Kapitel 15: Das Fellvolk',gate:'lvF1',kind:'talk',turnin:'sirka',
  low:L=>`Ruh dich aus, Ritter. Mit Stufe ${qd('lvF1')} habe ich einen heiklen Auftrag für dich. Du bist Stufe ${L}.`,
  give:'Durin hat den Siegelstein neu geschmiedet – Gunnar wird ihn brauchen. Doch bevor wir uns dem Drachen stellen, brauchen wir Verbündete. In Severins Kriegsplänen stand etwas, das ich nur aus Ammenmärchen kenne: das Fellvolk. Menschen mit den Ohren und Schweifen von Fuchs, Katze, Hund und Wolf. Sie leben verborgen in Rotfellhain, südlich des Finsterwalds – und die Legion macht Jagd auf sie. Reise hin und biete ihnen unser Bündnis an.',
  acc:'Ich suche das Fellvolk',goal:()=>'Reise nach Rotfellhain (südlich des Finsterwalds) und sprich mit Häuptlingin Sirka',to:()=>{const n=npcById('sirka');return n?{x:n.x,y:n.y}:null;},
  wait:'Rotfellhain liegt südlich des Finsterwalds, zwischen Wald und Dünen.',ret:'Sprich mit Häuptlingin Sirka in Rotfellhain',qitem:'Bündnisbrief des Fürsten',qic:'📜',
  done:'Ein Mensch, der nicht mit Ketten kommt? Das ist selten. *Sie liest den Brief und schnuppert daran.* Ich bin Sirka Rotfell, Häuptlingin des Fellvolks. Unsere Nasen riechen den Aschenfluch, deshalb meiden wir eure Städte. Doch die Schwarze Legion fängt unsere Jungen und verkauft sie als Spürhunde. Hilf uns – dann steht Rotfellhain an Eichenhains Seite.',
  btn:'Ich helfe euch',gold:350,items:()=>[mkStack('potion2',2)],lore:'Der Spieler hat das Fellvolk in Rotfellhain gefunden und ein Bündnis angeboten.'},
 {id:'jagd',ch:'Kapitel 16: Die Häscher',gate:'lvF2',kind:'camp',giver:'sirka',where:'Häuptlingin Sirka in Rotfellhain',at:()=>HUNT,types:['legion','legarch','legarch','blackknight'],cnt:'jagd',lv:'grimmholt',boss:'grimmholt',
  low:L=>`Die Häscher sind gut bewaffnet. Komm mit Stufe ${qd('lvF2')} wieder. Du bist Stufe ${L}.`,
  give:'Südöstlich von hier, am Rand der Dünen, liegt das Häscherlager der Legion. Ihr Anführer heißt Grimmholt – er hält drei unserer Jungen in Käfigen. Zerschlag seine Wachen, dann wird er sich zeigen. Bring mir den Schlüssel zu den Käfigen.',
  acc:'Ich befreie die Jungen',goal:()=>(P.lgN||0)<qd('jagd')?`Stürme das Häscherlager: Häscher ${P.lgN||0}/${qd('jagd')}`:'Besiege Häschermeister Grimmholt im Häscherlager',to:()=>tpT(HUNT.x,HUNT.y),
  wait:'Das Häscherlager liegt südöstlich von Rotfellhain. Folge dem goldenen ★.',ret:'Bring den Käfigschlüssel zu Häuptlingin Sirka',qitem:'Käfigschlüssel der Häscher',qic:'🗝️',
  found:'🗝 Grimmholt ist gefallen! Du nimmst ihm den Käfigschlüssel ab – und einen Brief mit einem Dornensiegel.',
  done:'Die Jungen sind frei! Das Fellvolk vergisst das nie. Und dieser Brief … das Dornensiegel gehört Königin Morwenna von Schwarzwall, Valdriks Schwester. Man nennt sie die Fluchweberin. Unsere alte Schamanin sagt: Morwenna hat den Fluch in die Aschenkrone gewoben. Gegen sie brauchst du Hilfe von oben – von den Walküren. Ihr Horst liegt hoch im Graukamm.',
  btn:'Ich suche die Walküren',gold:400,items:L=>[genItem('weapon',L+1,3,{kind:'dagger',name:'Rotfell-Kralle'})],lore:'Der Spieler hat Häschermeister Grimmholt besiegt und die Jungen des Fellvolks befreit.'},
 {id:'walk',ch:'Kapitel 17: Der Ruf der Walküren',gate:'lvWk',kind:'talk',giver:'sirka',where:'Häuptlingin Sirka in Rotfellhain',turnin:'svanhild',
  low:L=>`Der Weg zum Schildhorst ist eisig und gefährlich. Komm mit Stufe ${qd('lvWk')} wieder.`,
  give:'Der Walkürenhorst Schildhorst liegt auf den Gipfeln des Graukamms, nördlich der Zwergenbinge. Nimm Morwennas Brief mit. Wenn jemand weiß, wie man die Fluchweberin besiegt, dann die Töchter Valhallas.',
  acc:'Auf zum Schildhorst',goal:()=>'Reise zum Schildhorst (Graukamm-Gipfel, Norden) und sprich mit Walküre Svanhild',to:()=>{const n=npcById('svanhild');return n?{x:n.x,y:n.y}:null;},
  wait:'Schildhorst liegt hoch im Graukamm, nördlich der Zwergenbinge.',ret:'Bring Morwennas Brief zu Walküre Svanhild',qitem:'Morwennas Brief mit Dornensiegel',qic:'✉️',
  done:'Ich kenne dich, Ritter. Wir waren es, die dich zurückschickten, als du am Aschenpass fielst. *Sie liest den Brief.* Morwenna … Sie webt den Fluch, der die Tiere zornig macht und die Toten nicht ruhen lässt. Solange sie lebt, nährt sie die Aschenkrone ihres Bruders. Wir Walküren dürfen keine Burg der Lebenden betreten – in Schwarzwall musst du allein gehen. Ihre Dornenwachen greifen jeden an, den sie sehen. Die Bürger aber sind Gefangene, keine Feinde. Verschone sie.',
  btn:'Ich gehe nach Schwarzwall',gold:400,items:L=>[genItem('amulet',L+1,3,{name:'Feder der Walküren'})],lore:'Die Walküren unterstützen den Spieler gegen Königin Morwenna.'},
 {id:'dorn',ch:'Kapitel 18: Die Dornenfeste',gate:'lvDo',kind:'camp',giver:'svanhild',where:'Walküre Svanhild auf dem Schildhorst',turnin:'aldric',at:()=>SCHWC,types:['legion','legion','legarch','blackknight'],cnt:'dorn',lv:'morwenna',boss:'morwenna',
  low:L=>`Morwennas Dornenwachen sind Elitekrieger. Du brauchst Stufe ${qd('lvDo')}. Du bist Stufe ${L}.`,
  give:'Schwarzwall liegt im Schattenwald, ganz im Südwesten von Eldmar. Brich durch die Dornenwachen im Burghof vor der Dornenfeste, bis Morwenna selbst erscheint. Und denk daran: Nur die Wachen und die Königin sind deine Feinde.',
  acc:'Für Eldmar!',goal:()=>(P.lgN||0)<qd('dorn')?`Stürme den Burghof von Schwarzwall: Dornenwachen ${P.lgN||0}/${qd('dorn')}`:'Besiege Königin Morwenna, die Fluchweberin',to:()=>tpT(SCHWC.x,SCHWC.y),
  wait:'Schwarzwall liegt im Schattenwald, ganz im Südwesten. Folge dem goldenen ★.',ret:'Bring Morwennas Dornenreif zu Fürst Aldric',qitem:'Zerbrochener Dornenreif',qic:'🥀',
  found:'🥀 Königin Morwenna ist gefallen! Ihr Fluchgewebe zerfällt zu Asche – doch die Aschenkrone selbst hält den Fluch noch. Kehre zu Fürst Aldric zurück.',
  done:'Morwenna tot und Schwarzwall frei? Bei allen Göttern … Das Fellvolk und die Walküren an unserer Seite – so etwas gab es in Eldmar seit tausend Jahren nicht. Doch der Fluch lebt weiter, solange Valdrik die Aschenkrone trägt. Zuerst aber der Drache: Geh zu Gunnar in die Taverne. Mit Durins Siegelstein könnt ihr das Aschensiegel brechen.',
  btn:'Zu Gunnar',gold:600,items:L=>[genItem('weapon',L+1,4)],lore:'Königin Morwenna von Schwarzwall ist besiegt, Schwarzwall ist befreit.'}],
 9:[
 {id:'n1',qitem:'Brief der Prinzessin',qic:'✉️',ch:'Kapitel 22: Die Nebellande',gate:'lvN1',kind:'talk',turnin:'runa',
  low:L=>`Ruh dich aus, Held. Wenn du Stufe ${qd('lvN1')} erreichst, habe ich eine letzte Bitte.`,
  give:'Elara hat mir etwas erzählt, das mir das Blut gefrieren lässt: Kaiser Valdrik hat einen Pakt mit etwas Uraltem in den Nebellanden geschlossen, ganz im Osten hinter dem Finsterwald. Reise nach Nebelwacht und sprich mit Wächterin Runa.',
  acc:'Ich reise in die Nebellande',goal:()=>'Reise nach Nebelwacht (Nebellande, ganz im Osten) und sprich mit Wächterin Runa',to:()=>{const n=npcById('runa');return n?{x:n.x,y:n.y}:null;},
  wait:'Nebelwacht liegt ganz im Osten, hinter Waldheim.',ret:'Sprich mit Wächterin Runa',
  done:'Ein Ritter aus Eichenhain? Endlich. Valdrik ist hier. Er hat die Sucher geweckt – Wesen aus dem Nebel – und baut seine Zitadelle im Süden der Nebellande. Wir halten kaum noch stand.',
  btn:'Ich helfe euch',gold:300,items:()=>[mkStack('potion2',2)],lore:'Der Spieler ist in Nebelwacht in den Nebellanden angekommen.'},
 {id:'n2',ch:'Kapitel 23: Das Summen im Nebel',gate:'lvN2',kind:'kill',giver:'runa',where:'Wächterin Runa in Nebelwacht',types:['sucher','sucherkrieger','zecke','gjall','runenwirker'],cnt:'sucherkill',
  low:L=>`Die Sucher zerreißen dich in Stücken. Komm mit Stufe ${qd('lvN2')} wieder.`,
  give:`Die Sucher schwärmen um Nebelwacht wie Hornissen. Erschlage ${qd('sucherkill')} Kreaturen des Nebels, damit wir Luft holen können.`,
  acc:'Ich lichte den Nebel',goal:()=>`Erschlage Kreaturen der Nebellande: ${P.lgN||0}/${qd('sucherkill')}`,to:()=>null,
  wait:'Die Sucher schwärmen überall in den Nebellanden.',ret:'Kehre zu Wächterin Runa zurück',
  found:'🦗 Der Schwarm weicht zurück! Kehre zu Wächterin Runa zurück.',
  done:'Ihr Schwarm wird von einer Königin gelenkt. Sie nistet im Wurzeltor, nördlich von hier. Solange sie lebt, kommen immer neue.',
  btn:'Dann töte ich die Königin',gold:350,items:L=>[genItem('helm',L,3)],lore:'Der Spieler hat den Sucherschwarm um Nebelwacht zurückgeschlagen.'},
 {id:'n3',qitem:'Valdriks Siegel',qic:'🔱',ch:'Kapitel 24: Das Wurzeltor',gate:'lvN3',kind:'dungeon',room:'mistgate',base:'sucherkrieger',add:'sucher',lv:'queen',name:'Die Sucherkönigin',giver:'runa',where:'Wächterin Runa in Nebelwacht',
  enter:'👑 Ein schrilles Kreischen – die Sucherkönigin verteidigt ihr Nest!',
  low:L=>`Die Königin ist zu stark für dich. Komm mit Stufe ${qd('lvN3')} wieder.`,
  give:'Das Wurzeltor liegt nördlich von Nebelwacht, unter den Wurzeln eines toten Weltbaums. Töte die Sucherkönigin!',
  acc:'Auf zum Wurzeltor',goal:()=>'Töte die Sucherkönigin im Wurzeltor (nördlich von Nebelwacht)',to:()=>roomTo('mistgate'),
  wait:'Das Wurzeltor liegt nördlich von Nebelwacht. Folge dem goldenen ★.',ret:'Kehre zu Wächterin Runa zurück',
  found:'👑 Die Sucherkönigin ist tot! In ihrem Nest liegt Valdriks Siegel.',
  done:'Valdriks Siegel im Nest der Königin … er hat sie gezüchtet! Jetzt ist er allein mit seiner Nebelgarde. Seine Zitadelle liegt im Süden. Beende das, Ritter – für Eldmar und für Nebelwacht.',
  btn:'Für Eldmar!',gold:400,items:L=>[genItem('weapon',L+1,4)],lore:'Die Sucherkönigin ist tot.'},
 {id:'n4',qitem:'Valdriks Kaiserkrone (zerbrochen)',qic:'👑',ch:'Kapitel 25: Die Nebelzitadelle',gate:'lvN4',kind:'camp',giver:'runa',where:'Wächterin Runa in Nebelwacht',turnin:'aldric',at:()=>CITADEL,types:['nebelgarde','nebelgarde','runenwirker','sucherkrieger'],cnt:'garde',lv:'valdrik',boss:'valdrik',
  low:L=>`Die Nebelgarde ist Valdriks Elite. Du brauchst Stufe ${qd('lvN4')}. Du bist Stufe ${L}.`,
  give:'Die Nebelzitadelle liegt im Süden der Nebellande. Brich durch die Nebelgarde und stelle Kaiser Valdrik. Danach kehr heim zu deinem Fürsten.',
  acc:'Zur Nebelzitadelle',goal:()=>(P.lgN||0)<qd('garde')?`Stürme die Nebelzitadelle: Nebelgarde ${P.lgN||0}/${qd('garde')}`:'Besiege Kaiser Valdrik in der Nebelzitadelle',to:()=>tpT(CITADEL.x,CITADEL.y),
  wait:'Die Nebelzitadelle liegt im Süden der Nebellande. Folge dem goldenen ★.',ret:'Kehre zu Fürst Aldric nach Eichenhain zurück',
  found:'👑 KAISER VALDRIK IST GEFALLEN! Die Nebel lichten sich. Kehre heim zu Fürst Aldric.',
  done:'Valdrik ist tot … die Legion ist führerlos, der Drache besiegt, meine Tochter zu Hause. Du hast Eldmar zweimal gerettet. Von heute an bist du kein gefallener Ritter mehr – du bist der Schild von Eldmar.',
  btn:'Es war mir eine Ehre',gold:2000,items:L=>[genItem('weapon',qd('valdrik'),5,{name:'Nebelbrecher',kind:'greatsword',boss:'valdrik',f:'melee'})],lore:'Kaiser Valdrik ist besiegt.'}]};
G.MSQ=MSQ;
// v20: Quest-Gegenstände – fest im Inventar, nicht verkaufbar, nicht wegwerfbar, werden bei der Abgabe entfernt
for(const m of [3,4,9])MSQ[m].forEach(st=>{if(st.qitem)STACK['q_'+st.id]={name:st.qitem,type:'quest',ic:st.qic||'📜',desc:'Quest-Gegenstand: '+st.ret+'.',sell:0,qitem:1};});
const qHas=st=>st&&st.qitem&&P.inv.some(x=>x&&x.id==='q_'+st.id);
function qGive(st){if(!st||!st.qitem||qHas(st))return;const it=mkStack('q_'+st.id,1);let slot=-1;for(let i=9;i<36;i++)if(!P.inv[i]){slot=i;break;}if(slot<0)for(let i=0;i<9;i++)if(!P.inv[i]){slot=i;break;}if(slot<0){slot=35;const old=P.inv[35];if(old&&!(STACK[old.id]&&STACK[old.id].qitem))dropGround(old,P.x,P.y);}P.inv[slot]=it;G.invDirty=true;G.toast(`${st.qic||'📜'} Quest-Gegenstand: ${st.qitem}`,'#ffd54a');}
function qTake(st){for(let i=0;i<36;i++){const x=P.inv[i];if(x&&x.id==='q_'+st.id)P.inv[i]=null;}G.invDirty=true;}
// Abgleich: nur der aktuelle Schritt darf seinen Gegenstand haben (alte/verwaiste werden entfernt)
function qSync(){const st=curStep();for(let i=0;i<36;i++){const x=P.inv[i];if(x&&STACK[x.id]&&STACK[x.id].qitem&&!(st&&x.id==='q_'+st.id&&P.macc))P.inv[i]=null;}if(st&&st.qitem&&P.macc&&(P.mflag||st.kind==='talk'||st.kind==='bring'))qGive(st);}
G.qSync=()=>{try{qSync();}catch(e){}};
const MORDER=[];for(const m of [3,4])MSQ[m].forEach((st,i)=>MORDER.push(st.id));MORDER.push('herald','dragon','elara','home');MSQ[9].forEach(st=>MORDER.push(st.id));
const curStep=()=>MSQ[P.main]?MSQ[P.main][Math.min(P.ms||0,MSQ[P.main].length-1)]:null;
const progIdx=()=>P.main<3?-1:P.main===3?(P.ms||0):P.main===4?MSQ[3].length+(P.ms||0):P.main<=8?MSQ[3].length+MSQ[4].length+(P.main-5):P.main===9?MSQ[3].length+MSQ[4].length+4+(P.ms||0):999;
const stepIs=id=>{const st=curStep();return !!st&&st.id===id;};const pastStep=id=>{const i=MORDER.indexOf(id);return i>=0&&progIdx()>i;};
G.curStep=curStep;G.pastStep=pastStep;
const npcName=id=>{const n=npcById(id);return n?n.name:id;};
const stepGiver=st=>st.giver||'aldric',stepTurn=st=>st.turnin||stepGiver(st);
const stepXP=st=>Math.round(xpNeed(qd(st.gate))*.45);
function finishStep(st){const L=P.level;gainXP(stepXP(st));P.gold+=Math.round((st.gold||0)*G.D().gold);(st.items?st.items(L):[]).forEach(it=>give(it));G.toast(`+${Math.round((st.gold||0)*G.D().gold)} Gold`,'#ffd54a');if(st.after)st.after();
 qTake(st);const last=P.ms>=MSQ[P.main].length-1;P.macc=false;P.mflag=0;P.lgN=0;if(last){P.main=P.main===4?5:P.main+1;P.ms=0;}else P.ms++;
 if(P.main===10){G.ui&&G.ui.cutscene&&G.ui.cutscene('outro');}else G.toast(`📜 Weiter: ${G.chapter()}`,'#ffd54a',true);G.save();}
function mainDialog(n){const st=curStep();if(!st)return null;const L=P.level,B=(l,f,c)=>({l,f,c}),gv=stepGiver(st),tn=stepTurn(st);
 if(!P.macc&&n.id===gv){if(L<qd(st.gate))return{t:st.low(L),b:[]};return{t:st.give,b:[B(st.acc,()=>{P.macc=true;P.mflag=0;P.lgN=0;G.toast(`📜 ${st.ch}`,'#ffd54a',true);if(st.kind==='talk'||st.kind==='bring')qGive(st);},1)]};}
 if(P.macc&&n.id===tn&&st.kind==='bring'){if(countItem(st.item)>=st.n)return{t:st.done,b:[B(st.btn,()=>{removeItem(st.item,st.n);finishStep(st);},1)]};return{t:`Du hast ${countItem(st.item)}/${st.n} ${STACK[st.item].name}. ${st.wait}`,b:[]};}
 if(P.macc&&n.id===tn&&(P.mflag||st.kind==='talk'))return{t:st.done,b:[B(st.btn,()=>finishStep(st),1)]};
 if(P.macc&&n.id===gv)return{t:st.wait,b:[]};
 if(n.id==='aldric'){const who=P.macc?(P.mflag||st.kind==='talk'?tn:null):gv;if(who&&who!=='aldric')return{t:`Geh zu ${st.where&&who===gv?st.where:npcName(who)}. Eldmar zählt auf dich.`,b:[]};}
 return null;}
G.mainDialog=mainDialog;
function mainMark(n){const st=curStep();if(!st)return '';const gv=stepGiver(st),tn=stepTurn(st);if(!P.macc&&n.id===gv)return P.level>=qd(st.gate)?'!':'.';if(P.macc&&n.id===tn&&(P.mflag||st.kind==='talk'||st.kind==='bring'&&countItem(st.item)>=st.n))return '?';return '';}
G.mainMark=mainMark;
// v21: Kapitel werden fortlaufend durchnummeriert (neue Dorf-Kapitel eingeschoben)
{let n=2;const re=/^Kapitel[^:]*: /;for(const st of MSQ[3])st.ch=`Kapitel ${n++}: `+st.ch.replace(re,'');for(const st of MSQ[4])st.ch=`Kapitel ${n++}: `+st.ch.replace(re,'');CHAP[5]=`Kapitel ${n++}: Die drei Herolde`;CHAP[6]=`Kapitel ${n}: Ignarok`;CHAP[7]=`Kapitel ${n++}: Die Prinzessin`;CHAP[8]=`Kapitel ${n++}: Heimkehr`;for(const st of MSQ[9])st.ch=`Kapitel ${n++}: `+st.ch.replace(re,'');}
// Spielstände: Schritt über seine ID wiederfinden (neue Schritte verschieben keine Fortschritte)
const OLDQ={3:['raub','hut','wolf','ash','nest','turm','grotte'],4:['moor','wald','grukk','morvax','legion','zwerg','fell','jagd','walk','dorn']};
G.questMigrate=()=>{const L=MSQ[P.main];if(!L)return;let id=P.msId;if(!id&&(P.qv||0)<21&&OLDQ[P.main])id=OLDQ[P.main][P.ms];if(id){const i=L.findIndex(st=>st.id===id);if(i>=0)P.ms=i;}P.qv=21;P.msId=L[P.ms]&&L[P.ms].id;};
G.chapter=()=>{const st=curStep();return st?st.ch:CHAP[Math.min(P.main,10)];};
// Questfortschritt bei Kills (Kill- und Lager-Schritte)
function mainKill(m){const had=P.mflag;mainKill0(m);const st=curStep();if(!had&&P.mflag&&st)qGive(st);}
function mainKill0(m){const st=curStep();if(!st||!P.macc||P.mflag)return;
 if(st.kind==='kill'&&st.types.indexOf(m.type)>=0&&!m.summoned){if(st.near){const c=st.near();if(Math.hypot(m.x/TILE-c.x,m.y/TILE-c.y)>(st.rad||120))return;}P.lgN=(P.lgN||0)+1;if(P.lgN>=qd(st.cnt)){P.mflag=1;G.toast(st.found,'#ffd54a',true);}}
 else if(st.kind==='camp'&&m.camp&&(P.lgN||0)<qd(st.cnt)){P.lgN=(P.lgN||0)+1;if(P.lgN>=qd(st.cnt))G.toast(`⚔ Die Wachen sind gefallen! ${BOSSES[st.boss].n} stellt sich dir!`,'#ffd54a',true);}
 else if((st.kind==='fix'||st.kind==='camp')&&m.boss===st.boss){P.mflag=1;G.flashT=1;G.toast(st.found,'#ffd54a',true);}
 else if(st.kind==='dungeon'&&m.qkey===st.room){P.mflag=1;G.flashT=.6;G.toast(st.found,'#ffd54a',true);}}
// Lager-Schritte: Soldaten nachrücken lassen
function campTick(dt){const st=curStep();if(!st||st.kind!=='camp'||!P.macc||P.mflag||G.room)return;const C=st.at(),cx=(C.x+.5)*TILE,cy=(C.y+.5)*TILE;if(Math.hypot(P.x-cx,P.y-cy)>TILE*34)return;G._lgT=(G._lgT||0)-dt;if(G._lgT>0)return;G._lgT=5;if((P.lgN||0)>=qd(st.cnt))return;
 const alive=G.mons.filter(m=>m.camp&&!m.dead).length;if(alive>=6)return;for(let n=alive;n<Math.min(6,alive+3);n++){for(let i=0;i<12;i++){const a=Math.random()*6.283,d=rnd(2,9);const tx=Math.floor(C.x+Math.cos(a)*d),ty=Math.floor(C.y+Math.sin(a)*d);if(!walkTile(tx,ty)||SOLIDS[tileAt(tx,ty)])continue;const x=(tx+.5)*TILE,y=(ty+.5)*TILE;if(Math.hypot(P.x-x,P.y-y)<TILE*6)continue;const m=mkMonster(pick(st.types),qd(st.lv)-rint(1,2),x,y);m.camp=1;m.legion=1;m.passive=false;m.home={x,y};G.mons.push(m);break;}}}
G.objective=function(){const L=P.level;const tp=(x,y)=>({x:(x+.5)*TILE,y:(y+.5)*TILE});const N=id=>{const n=npcById(id);if(n.loc&&G.room!==n.loc)return{x:n.loc.ent.x,y:n.loc.ent.y-10};return{x:n.x,y:n.y};};
 switch(P.main){
 case 0:return{t:'Sprich mit Heilerin Mara',to:N('mara')};
 case 1:return{t:'Geh zur Burg und sprich mit Fürst Aldric',to:N('aldric')};
 case 2:return P.mN>=qd('prove')?{t:'Kehre zu Fürst Aldric zurück',to:N('aldric')}:{t:`Besiege Monster vor den Mauern: ${P.mN}/${qd('prove')}`,to:null};
 case 3:case 4:case 9:{const st=curStep(),gv=stepGiver(st),tn=stepTurn(st);if(!P.macc)return L<qd(st.gate)?{t:`Erreiche Stufe ${qd(st.gate)}, dann zu ${npcName(gv)}`,to:null}:{t:`Sprich mit ${gv!=='aldric'&&st.where?st.where:npcName(gv)}`,to:N(gv)};
  if(st.kind==='talk')return{t:st.goal(),to:st.to()};if(st.kind==='bring')return countItem(st.item)>=st.n?{t:st.ret,to:N(tn)}:{t:st.goal(),to:st.to()};return P.mflag?{t:st.ret,to:N(tn)}:{t:st.goal(),to:st.to()};}
 case 5:{if(!P.macc)return L<qd('lvH')?{t:`Erreiche Stufe ${qd('lvH')} und sprich mit Gunnar in der Taverne`,to:N('gunnar')}:{t:'Sprich mit Drachenjäger Gunnar in der Taverne',to:N('gunnar')};
  const sh=P.shards||{},n=Object.keys(sh).length;if(n>=3)return L<qd('lvD')?{t:`Alle Splitter! Erreiche Stufe ${qd('lvD')} und bring sie Gunnar`,to:N('gunnar')}:{t:'Bring die drei Glutsiegel-Splitter zu Gunnar',to:N('gunnar')};
  const H=[['schnitter','Vael, den Schnitter, in den Ruinen von Aschental',ASHVALE.x,ASHVALE.y-4],['eldtree','Mortholz, den Baumhirten, an der Abtei im Schattenwald',HERALDPOS().eldtree.x,HERALDPOS().eldtree.y],['sandking','Khepri, den Sandkönig, am Grab in den Dünen',HERALDPOS().sandking.x,HERALDPOS().sandking.y]].filter(h=>!sh[h[0]]);
  const near=H.reduce((a,h)=>Math.hypot(h[2]*TILE-P.x,h[3]*TILE-P.y)<Math.hypot(a[2]*TILE-P.x,a[3]*TILE-P.y)?h:a);return{t:`Glutsiegel ${n}/3 – besiege ${near[1]}`,to:tp(near[2],near[3])};}
 case 6:return{t:'Erschlage Ignarok in der Drachenfestung auf dem Goldberg (Aschenberge, Nordosten)',to:tp(LAIR.x,LAIR.y)};
 case 7:return{t:'Sprich mit Prinzessin Elara im Drachenhort',to:N('elara')};
 case 8:return{t:'Kehre zu Fürst Aldric in die Burg zurück',to:N('aldric')};
 default:return{t:'Die Geschichte ist erzählt. Erkunde Eldmar, jage Bosse und finde alle Geheimnisse!',to:null};}};
G.storyContext=function(){const o=G.objective();const q=P.q;const lore=[];for(const m of [3,4,9])for(const st of MSQ[m])if(pastStep(st.id)&&st.lore)lore.push(st.lore);return `${G.chapter()}. Aktuelles Ziel des Spielers: ${o.t}. Spielerstufe ${P.level}, Schwierigkeit ${G.D().n}. `+lore.join(' ')+' '+(P.main>=6?'Gunnar hat das Aschensiegel gebrochen. ':'')+(P.main>=7?'Ignarok ist tot! ':'')+(P.main>=8?'Elara ist wieder in der Burg. ':'')+(q.bread==='done'?'Der Spieler hat Bernd mit Weizen geholfen. ':'')+(q.wolves==='done'?'Der Spieler hat Hildas Wolfsplage beendet. ':'');};
G.npcMark=function(n){{const em=G.extraMark&&G.extraMark(n);if(em)return em;if(n.lie)return '';}{const mm=mainMark(n);if(mm==='?'||mm==='!')return mm;}const sm0=G.sqMark(n);if(sm0==='?')return '?';const r0=npcMark0(n);return r0||sm0;};
const npcMark0=function(n){const q=P.q,L=P.level;switch(n.id){
 case'mara':return P.main===0?'!':'';
 case'ragna':return !q.draugr?(L>=26?'!':'.'):(q.draugr==='active'&&q.draugrN>=qd('draugr')?'?':'');
 case'aldric':{if(P.main===1||(P.main===2&&P.mN>=qd('prove'))||P.main===8)return'?';return '';}
 case'gunnar':return P.main===5?(!P.macc?(L>=qd('lvH')?'!':'.'):(Object.keys(P.shards||{}).length>=3?(L>=qd('lvD')?'?':'.'):'')):'';
 case'elara':return P.main===7?'?':'';
 case'bernd':return !q.bread?'!':(q.bread==='active'&&countItem('wheat')>=5?'?':'');
 case'hilda':return !q.wolves?(L>=4?'!':'.'):(q.wolves==='active'&&q.wolfN>=qd('wolves')?'?':'');
 case'otto':return !q.ears?(L>=12?'!':'.'):(q.ears==='active'&&countItem('ear')>=qd('ears')?'?':'');}return '';};
const SHOPS={wirt:{n:'Schankstube „Zum Krummen Krug“',items:['beer','met','bread']},greta:{n:'Gretas Marktstand',items:['potion','mpotion','bread','carrot','seed','hseed','arrow','bolt']},
 sven:{n:'Svens Handelshaus',items:['potion','potion2','mpotion','bread','carrot','arrow','bolt']},
 brann:{n:'Feldscher Brann',items:['potion','potion2','mpotion','arrow','bolt']},
 hilda:{n:'Hildas Schmiede',items:['arrow','bolt'],smith:1}};Object.assign(SHOPS,SHOP_ADD);G.SHOPS=SHOPS;
// ===== v21: Jeder NPC kauft und verkauft nur, was zu ihm passt =====
Object.assign(SHOPS,{bernd:{n:'Bernds Backstube',items:['bread'],buys:'bake',recipes:1},
 linde:{n:'Lindes Gärtnerei',items:['harke','kanne',...FOODC.map(c=>'s_'+c[0]),'seed','hseed',...FLOWC.map(c=>'f_'+c[0]),...TREEC.map(c=>'t_'+c[0])],buys:'garden'},
 liv:{n:'Livs Försterhütte',items:['axt',...TREEC.map(c=>'t_'+c[0]),'arrow'],buys:'wood'},
 isolde:{n:'Abenteurergilde von Eichenhain',items:['potion','potion2','mpotion','arrow','bolt'],buys:'hunt'}});
SHOPS.hilda.buys='gear';SHOPS.wirt.buys='tavern';SHOPS.brann.buys='potion';SHOPS.fiete&&(SHOPS.fiete.buys='fish');
const BUYN={gear:'nur Waffen, Rüstungen, Amulette und Ringe',garden:'nur Saatgut, Pflanzen, Blumen, Feldfrüchte und Gartenwerkzeug',bake:'nur Weizen, Feldfrüchte und Backwaren',tavern:'nur Speisen und Getränke',potion:'nur Tränke und Heilkräuter',hunt:'nur Jagdbeute und Trophäen von Monstern',wood:'nur Holz, Stöcke, Harz und Setzlinge',fish:'nur Fisch und Angelkram'};G.BUYN=BUYN;
function shopAccepts(sid,it){const r=(SHOPS[sid]&&SHOPS[sid].buys)||'all';if(!it)return false;const S=it.stack?STACK[it.id]:null;if(S&&(S.qitem||S.type==='quest'))return false;if(r==='all')return true;
 if(r==='gear')return !it.stack;if(!S)return false;const id=it.id;
 if(r==='garden')return S.type==='seed'||!!S.flower||!!S.crop||id==='wheat'||id==='carrot'||id==='herb'||id==='harke'||id==='kanne';
 if(r==='bake')return id==='wheat'||id==='carrot'||id==='bread'||!!S.crop||!!S.buff;
 if(r==='tavern')return S.type==='food'&&!/potion/.test(id);
 if(r==='potion')return /potion/.test(id)||id==='herb'||id==='hseed';
 if(r==='hunt')return !!S.trophy;
 if(r==='wood')return !!S.wood||/^t_/.test(id)||id==='axt';
 if(r==='fish')return !!S.fish||S.type==='junk'||id==='rod';return false;}
G.shopAccepts=shopAccepts;
G.shopPrice=(sid,it)=>{if(!sid)return sellPrice(it);if(!shopAccepts(sid,it))return 0;const S=it.stack&&STACK[it.id];return Math.round(sellPrice(it)*(S&&S.trophy&&SHOPS[sid].buys==='hunt'?1.5:1));};
G.shopWhy=sid=>{const r=SHOPS[sid]&&SHOPS[sid].buys;return r&&BUYN[r]?`${npcName(sid)} kauft ${BUYN[r]}. Alles andere bekommst du beim Händler los.`:'Das kauft hier niemand.';};
// Bäcker-Rezepte (Zutaten → Gericht mit Stärkung); 3 Weizen → 2 Brot bleibt
G.RECIPES=[['bread',2,{wheat:3}],...DISH.map(d=>[d[0],1,d[3]])];
G.cook=i=>{const r=G.RECIPES[i];if(!r)return false;for(const k in r[2])if(countItem(k)<r[2][k]){G.toast('Dir fehlen Zutaten.','#ff8a80');return false;}for(const k in r[2])removeItem(k,r[2][k]);give(mkStack(r[0],r[1]));sfx('coin');P.cooked=(P.cooked||0)+1;return true;};

const SQ={
 berta:{npc:'berta',n:'Bertas Ehering',lv:11,fetch:'banditcave',item:'Bertas Ehering',give:'Banditen haben mir den Ehering meines Mannes gestohlen … Sie hausen im Räubernest, einer Höhle östlich der Ruinen von Aschental. Bitte bring ihn mir zurück.',done:'Mein Ring! Den Göttern sei Dank. Nimm das, es ist nicht viel … aber von Herzen.',rw:{gold:180,xp:700,it:['ring',2]}},
 durin:{npc:'durin',n:'Der Ahnenhammer',lv:27,fetch:'dwarf',item:'Durins Ahnenhammer',give:'Die Zwergenbinge im Graukamm-Gebirge, östlich von hier … Grauzwerge und Golems haben sie überrannt. Der Hammer meines Vaters liegt dort in einer Truhe. Hol ihn, und ich schmiede dir etwas Feines.',done:'Bei meinem Bart! Vaters Hammer! Hier, nimm diesen – ich hab ihn für dich neu geschärft.',rw:{gold:300,xp:2400,it:['mace',3,'Runenhammer der Binge']}},
 samira:{npc:'samira',n:'Das Skarabäus-Siegel',lv:32,fetch:'pyramid',item:'Skarabäus-Siegel',give:'Im Grab des Sandkönigs, südöstlich meiner Stadt, ruht das Skarabäus-Siegel meiner Ahnen. Seit es dort liegt, wandeln die Toten. Bring es mir, und Sandfeste wird dich ehren.',done:'Das Siegel … die Wüste atmet auf. Nimm dieses Amulett meiner Mutter.',rw:{gold:350,xp:2200,it:['amulet',3,'Amulett der Dünenfürstin']}},
 liv:{npc:'liv',n:'Brut im Finsterwald',lv:24,kill:'spider',cnt:12,give:'Die Riesenspinnen fressen sich durch meinen Wald. Erlege zwölf von ihnen. Die Spinnenhöhle liegt nördlich von Waldheim.',done:'Gute Jagd! Dieser Bogen ist aus meiner eigenen Eibe.',rw:{gold:160,xp:900,it:['longbow',2,'Livs Eibenbogen']}},
 aldwin:{npc:'aldwin',n:'Die Hexen des Moors',lv:21,kill:'witch',cnt:6,give:'Grimeldas Schwestern, die Sumpfhexen, verfluchen unsere Brunnen. Bring sechs von ihnen zur Strecke.',done:'Das Wasser ist wieder klar. Nimm diese Robe, sie hält Gift fern.',rw:{gold:200,xp:1300,it:['heiler',2]}},
 anselm:{npc:'anselm',n:'Die verschollene Chronik',lv:27,fetch:'abbey',item:'Chronik von Eldmar',give:'In der Ruine der Abtei im Schattenwald, südwestlich, ruht die Chronik von Eldmar. Darin steht, wie Ignarok einst gebannt wurde. Bring sie mir.',done:'Die Chronik! Hier steht es … Ignarok fürchtet Licht. Nimm dieses heilige Buch.',rw:{gold:200,xp:2000,it:['tome_light',3,'Psalter der Morgenröte']}},
 brann:{npc:'brann',n:'Welpenplage',lv:27,kill:'wyrmling',cnt:6,give:'Drachenwelpen nisten in den Aschenbergen. Erlege sechs, bevor sie groß werden.',done:'Sechs weniger! Hier, ein Harnisch aus Welpenschuppen.',rw:{gold:400,xp:3500,it:['ritter',3]}},
 wendla:{npc:'wendla',n:'Hexenwerk',lv:29,fetch:'witchhut',item:'Hexenkessel-Rezept',give:'Die Sumpfhexe in ihrer Kate im Süden stiehlt meine Rezepte! Hol mir mein Kesselbuch zurück.',done:'Kröte, Kraut … ja, alles da! Nimm diese Tränke.',rw:{gold:120,xp:1200,stack:['potion2',3]}},
 jorg:{npc:'jorg',n:'Rattenplage',lv:2,kill:'rat',cnt:8,give:'Riesenratten fressen mir das Korn aus der Scheune! Erschlag acht von den Biestern draußen auf den Wiesen.',done:'Endlich Ruhe in der Scheune. Hier, für deine Mühe – und ein Brot von Bernd.',rw:{gold:30,xp:220,stack:['bread',3]}},
 hedwig:{npc:'hedwig',n:'Wilde Keiler',lv:4,kill:'boar',cnt:6,give:'Ach, die Wildschweine wühlen mir den Kräutergarten um, Kindchen. Jag sechs von ihnen fort, ja?',done:'Du bist ein Schatz. Nimm diesen alten Ring, er hat meinem Mann Glück gebracht.',rw:{gold:45,xp:420,it:['ring',1,'Hedwigs Glücksring']}},
 lukas:{npc:'lukas',n:'Die gestohlene Laute',lv:8,fetch:'wolfden',item:'Lukas’ Laute',give:'Meine Laute! Ein Wolf hat sie mir auf der Wiese aus der Hand gerissen und in seinen Bau im Nordwesten geschleppt. Ohne sie kann ich keine Balladen über dich singen!',done:'Meine Laute! Hör nur: „Der Ritter, der aus Valhalla kam …“ Nimm das, als Dank.',rw:{gold:80,xp:900,it:['amulet',2,'Bardenamulett']}},
 konrad:{npc:'konrad',n:'Das Schwert meines Vaters',lv:10,fetch:'cellar',item:'Konrads Familienschwert',give:'Mein Vater fiel in Aschental, als das Dorf brannte. Sein Schwert liegt noch im verkohlten Keller. Bring es mir, bitte.',done:'Vaters Schwert … Danke. Nimm meins, ich trage jetzt seins.',rw:{gold:90,xp:1200,it:['sword',2,'Wachschwert der Burg']}},
 greta:{npc:'greta',n:'Wegelagerer',lv:14,kill:'bandit',cnt:10,give:'Banditen überfallen meine Wagen am Rand des Finsterwalds. Erledige zehn von ihnen, dann fahre ich wieder.',done:'Meine Wagen rollen wieder! Hier, ein Anteil am Gewinn.',rw:{gold:180,xp:2100,stack:['potion',5]}},
 finn:{npc:'finn',n:'Zentaurenjagd',lv:22,kill:'centaur',cnt:6,give:'Die Zentauren schießen auf meine Holzfäller. Erlege sechs, und ich baue dir einen Bogen, wie du noch keinen gesehen hast.',done:'Sechs! Hier, mein Meisterstück.',rw:{gold:300,xp:5200,it:['longbow',3,'Finns Meisterbogen']}},
 hakim:{npc:'hakim',n:'Skorpione im Brunnen',lv:27,kill:'scorpion',cnt:10,give:'Riesenskorpione nisten bei den Wasserstellen der Dünen. Zehn von ihnen, und das Wasser gehört wieder uns!',done:'Wasser für alle! Hakim zahlt gut, mein Freund.',rw:{gold:420,xp:8000,stack:['potion2',3]}},
 sven:{npc:'sven',n:'Die Bernsteinkette',lv:33,fetch:'icecave',item:'Svens Bernsteinkette',give:'Ich hab die Bernsteinkette meiner Frau in der Eishöhle verloren, ganz im Norden. Da drin ist es bitterkalt und voller Biester. Holst du sie mir?',done:'Bei Odin, du hast sie! Meine Frau wird weinen vor Glück.',rw:{gold:600,xp:12000,it:['amulet',3,'Bernsteinamulett']}},
 ylva:{npc:'ylva',n:'Das Lied der Harpyien',lv:30,kill:'harpy',cnt:8,give:'Die Harpyien im Graukamm singen ein falsches Lied, das meine Skalden verwirrt. Bring sie zum Schweigen – acht sollten reichen.',done:'Stille … und dann mein Lied. Nimm diesen Umhang aus Rabenfedern.',rw:{gold:500,xp:10500,it:['waldlaeufer',3,'Rabenfeder-Rüstung']}},
 runa:{npc:'runa',n:'Feuer im Nebel',lv:37,kill:'gjall',cnt:5,give:'Die Gjall spucken Feuer auf unsere Palisaden. Hol fünf von ihnen vom Himmel.',done:'Die Palisaden stehen. Nebelwacht dankt dir.',rw:{gold:800,xp:20000,it:['ritter',4,'Rüstung der Nebelwacht']}},
 odo:{npc:'odo',n:'Nebelbernstein',lv:38,fetch:'mistgate',item:'Nebelbernstein',give:'Im Wurzeltor wächst Nebelbernstein, so groß wie eine Faust. Bring mir einen – ich zahle fürstlich.',done:'Prachtvoll! Fürstlich, wie versprochen.',rw:{gold:1500,xp:22000,stack:['potion2',5]}}};
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
 case'mara':{if(P.main===0)return{t:'Du bist wach, den Göttern sei Dank! Ich fand dich vor drei Tagen am Flussufer, halb erfroren und ohne Erinnerung. Doch in deinen Augen brennt etwas … als hätten dich die Walküren selbst zurückgeschickt. Eichenhain braucht dich: Der Drache Ignarok hat Prinzessin Elara entführt. Und seit er erwacht ist, liegt der Aschenfluch über dem Land. Draußen vor den Mauern verfällt fast jedes Geschöpf dem Zorn – Hasen, Keiler, Füchse, ja sogar Wanderer bekommen glühend rote Augen und greifen alles an. Nur die Runensteine unserer Mauern halten den Fluch fern, und fließendes Wasser wäscht ihn ab – darum lässt er den alten Angler Fiete an seinem Weiher in Ruhe. Woher der Fluch kommt? Das weiß niemand. Geh hinauf zur Burg und sprich mit Fürst Aldric.',b:[B('Ich gehe zur Burg',()=>{P.main=1;give(mkStack('potion',2));G.toast('📜 Hauptquest: Audienz beim Fürsten','#ffd54a',true);},1)]};
  const bb=[B('Heile mich',()=>{P.hp=G.S.maxhp;P.poison=null;P.burn=null;G.toast('❤ Vollständig geheilt','#ef9a9a');})];if(countItem('herb')>=3)bb.push(B('3 Heilkraut → Heiltrank',()=>{removeItem('herb',3);give(mkStack('potion',1));}));else bb.push(B('Heilkrautsamen (Geschenk)',()=>{if(q.maraSeed){G.toast('Mara: Pflanze die Samen nahe am Wasser.','#ccc');return;}q.maraSeed=1;give(mkStack('hseed',3));}));return{t:pick(['Komm zu mir, wann immer du verwundet bist. Innerhalb der Mauern heilen Wunden schneller.','Die Walküren warten auf dich, Ritter. Aber nicht heute.','Gift? Lass mich sehen … meine Kräuter helfen.']),b:bb};}
 case'aldric':{
  if(P.main===0)return{t:'Ein Fremder in meiner Burg? Die Heilerin Mara hat von dir erzählt. Ruh dich erst aus und sprich mit ihr.',b:[]};
  if(P.main===1)return{t:`Man nennt dich einen gefallenen Ritter? Mir ist gleich, woher du kommst, solange du ein Schwert führen kannst. Ignarok hat meine Tochter Elara geraubt. Bevor ich dir ihr Leben anvertraue, beweise dich: Erschlage ${qd('prove')} Kreaturen vor unseren Mauern.`,b:[B('Ich werde mich beweisen',()=>{P.main=2;P.mN=0;G.toast('📜 Hauptquest: Bewährung','#ffd54a',true);},1)]};
  if(P.main===2){if(P.mN>=qd('prove'))return{t:'Du kämpfst wie ein Ritter der alten Zeit. Nimm diese Klinge aus meiner Waffenkammer – du wirst sie brauchen.',b:[B('Bericht erstatten',()=>{P.main=3;P.ms=0;P.macc=false;P.mflag=0;gainXP(150);give(genItem('weapon',Math.max(2,L+1),1,{kind:'sword'}));},0)]};
   return{t:`Du hast erst ${P.mN} von ${qd('prove')} Kreaturen erschlagen. Die Wildnis vor den Toren wartet.`,b:[]};}
  if(P.main===3||P.main===4||P.main===9){const md=mainDialog(n);if(md)return md;return{t:'Eldmar zählt auf dich, Ritter.',b:[]};}
  if(P.main<8)return{t:P.main===5?'Gunnar wartet in der Taverne „Zum Goldenen Krug“.':'Bring mir meine Tochter zurück, Ritter. Ich flehe dich an.',b:[]};
  if(P.main===8)return{t:'Elara ist zurück … Du hast mir alles zurückgegeben, was ich verloren glaubte. Ganz Eldmar wird deinen Namen kennen. Nimm diese Klinge meiner Ahnen und den Dank eines Vaters.',b:[B('Es war mir eine Ehre',()=>{P.main=9;P.ms=0;P.macc=false;P.mflag=0;gainXP(Math.round(xpNeed(P.level)*.5));P.gold+=1000;give(genItem('weapon',qd('dragon')+2,4,{name:'Eichenhains Erbe',kind:'sword',boss:'dragon',f:'melee'}));G.toast('+1000 Gold','#ffd54a');G.toast('📜 Doch Eldmars Geschichte ist noch nicht zu Ende …','#ffd54a',true);},1)]};
  return{t:'Eichenhain steht für immer in deiner Schuld, Held. Die Tore meiner Burg stehen dir offen.',b:[]};}
 case'gunnar':{
  if(P.main<5)return{t:pick(['Hmpf. Noch ein Grünschnabel, der Drachen jagen will? Ignarok hat meinen Bruder geholt. Komm wieder, wenn du einen Weg zum Hort hast.','Met. Feuer. Rache. Mehr brauch ich nicht.']),b:[]};
  if(P.main===5&&!P.macc){if(L<qd('lvH'))return{t:`Der Siegelstein, ha! Aber sieh dich an, Stufe ${L}. Komm wieder ab Stufe ${qd('lvH')}, dann erzähl ich dir, was du wirklich brauchst.`,b:[]};
   return{t:'Der Siegelstein allein reicht nicht. Das Aschensiegel nährt sich aus drei Glutsiegeln, getragen von Ignaroks Herolden. Vael, der Schnitter, spukt in den Ruinen von Aschental, dem Dorf, das der Drache zuerst verbrannt hat. Mortholz, ein uralter Baumhirte, verdorben von Drachenfeuer, wacht an der Abtei im Schattenwald. Und Khepri, der Sandkönig, ist vor seinem Grab in den Dünen erwacht. Bring mir ihre drei Splitter.',b:[B('Ich jage die Herolde',()=>{P.macc=true;P.shards={};G.toast('📜 Hauptquest: Die drei Herolde','#ffd54a',true);},1)]};}
  if(P.main===5){const n=Object.keys(P.shards||{}).length;if(n<3)return{t:`${n} von 3 Glutsiegel-Splittern. Die Herolde fallen nicht leicht – nutz deine Rolle, wenn sie ausholen. Und sie kehren zurück … ihre Beute ist es wert, sie öfter zu jagen.`,b:[]};
   if(L<qd('lvD'))return{t:`Alle drei Splitter! Aber gegen Ignarok selbst bist du mit Stufe ${L} noch Futter. Komm ab Stufe ${qd('lvD')} wieder.`,b:[]};
   return{t:'Gib her. Ich weiß, wie man das Siegel bricht: Stein und Blut. Ignaroks Festung liegt auf dem Goldberg im Nordosten. Hier, nimm meinen Glücksbringer, er hat mich durch drei Drachenjagden gebracht. Das Siegel ist gebrochen, der Weg zum Hort ist offen. Tu, was ich nicht konnte.',b:[B('Für deinen Bruder',()=>{P.main=6;P.barrier=true;G.flags.barrier=true;give(genItem('amulet',L+1,3,{name:'Gunnars Glücksbringer',f:'luck'}));G.toast('🔥 Das Aschensiegel ist gebrochen!','#ff8a50',true);},1)]};}
  if(P.main===6)return{t:'Ignarok schläft in seiner Festung auf dem Goldberg, ganz im Nordosten der Aschenberge. Der Außenposten Glutwacht ist der letzte sichere Ort davor, aktiviere dort den Wegschrein. Weiche den glühenden Kreisen aus und nutze deine Rolle (🌀)! Und nimm Heiltränke mit.',b:[]};
  return{t:'Du hast es geschafft. Mein Bruder kann nun in Valhalla ruhen. Und du eines Tages auch.',b:[]};}
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
  if(!q.wolves){if(L<4)return{t:`Ich bin Hilda, die Schmiedin. Arbeit hätte ich, aber du bist noch grün hinter den Ohren. Komm ab Stufe 4 wieder. (Du bist Stufe ${L}.)`,b:[]};
   return{t:`Wölfe reißen jede Nacht unsere Schafe! Draußen in den Sonnenwiesen jagen sie im Rudel. Erlege ${need} Wölfe, und ich schmiede dir eine seltene Waffe.`,b:[B('Ich jage sie!',()=>{q.wolves='active';q.wolfN=0;QT('Wolfsplage');},1)]};}
  if(q.wolves==='active'){if(q.wolfN>=need)return{t:'Ha! Du bist ein echter Jäger. Hier, frisch aus der Esse und noch warm.',b:[B('Belohnung nehmen',()=>{q.wolves='done';gainXP(450);give(genItem('weapon',L+2,2));DONE('Wolfsplage');})]};
   return{t:`Du hast ${q.wolfN}/${need} Wölfe erlegt. Pass auf, sie kommen im Rudel!`,b:[]};}
  return{t:'Meine Esse glüht für dich, Held. Bring mir Geschichten von deinen Kämpfen.',b:[]};}
 case'otto':{const need=qd('ears');
  if(!q.ears){if(L<12)return{t:`Halt! Die Goblins am Rand des Finsterwalds werden immer frecher, aber dafür bist du zu unerfahren. Komm ab Stufe 12 wieder. (Du bist Stufe ${L}.)`,b:[]};
   return{t:`Goblins überfallen unsere Händler! Bring mir ${need} Goblin-Ohren als Beweis, dann bekommst du ein Stück aus der Waffenkammer. Goblins findest du im Finsterwald.`,b:[B('Wird erledigt!',()=>{q.ears='active';QT('Goblin-Ohren');},1)]};}
  if(q.ears==='active'){const e=countItem('ear');if(e>=need)return{t:'Ha, die Goblins werden es sich zweimal überlegen! Hier, eine Rüstung aus der Waffenkammer.',b:[B('Ohren abgeben',()=>{removeItem('ear',need);q.ears='done';gainXP(800);give(genItem(pick(['helm','chest','legs','boots']),L+2,2));DONE('Goblin-Ohren');})]};
   return{t:`Du hast ${e}/${need} Goblin-Ohren. Nicht jeder Goblin lässt eins fallen, also bleib dran!`,b:[]};}
  return{t:'Dank dir ist die Straße wieder sicherer.',b:[]};}
 case'ragna':{const need=qd('draugr');
  if(!q.draugr){if(L<26)return{t:`Skål, Fremder. Die Draugr erheben sich aus ihren Hügelgräbern und bedrängen Frosthafen. Doch du bist erst Stufe ${L}. Komm wieder ab Stufe 26, dann reden wir.`,b:[]};
   return{t:`Du hast den Blick eines Kriegers. Die Draugr, untote Krieger aus alter Zeit, ziehen durch die Frostlande. Erschlage ${need} von ihnen, und ich gebe dir eine Rüstung aus der Schatzkammer meiner Ahnen.`,b:[B('Für Frosthafen!',()=>{q.draugr='active';q.draugrN=0;QT('Draugr-Plage');},1)]};}
  if(q.draugr==='active'){if(q.draugrN>=need)return{t:'Die Toten ruhen wieder. Nimm diese Rüstung, sie hat schon meinem Großvater das Leben gerettet.',b:[B('Belohnung nehmen',()=>{q.draugr='done';gainXP(2500);give(genItem(pick(SLOTS4),L+2,3,{set:'waechter'}));DONE('Draugr-Plage');})]};
   return{t:`${q.draugrN}/${need} Draugr erschlagen. Sie wandern zwischen den verschneiten Grabhügeln.`,b:[]};}
  return{t:'Frosthafen wird dich nicht vergessen. Skål!',b:[]};}
 case'sven':return{t:`Hah, ein Kunde! Du hast ${P.gold} Gold. Hier oben braucht man Kraft, und gute Ware!`,b:[]};
 case'brann':return{t:'Der Atem der Drachenwelpen brennt durch jede Rüstung. Lass mich deine Wunden versorgen, bevor du weiterziehst.',b:[B('Heile mich',()=>{P.hp=G.S.maxhp;P.poison=null;P.burn=null;G.toast('❤ Vollständig geheilt','#ef9a9a');}),]};
 case'greta':return{t:`Willkommen an meinem Stand! Du hast ${P.gold} Gold. Was darf es sein?`,b:[]};
 }
 return{t:pick(n.greet||['Sei gegrüßt.']),b:[]};};
G.npcDialog=function(n){(P.met||(P.met={}))[n.id]=1;const d=(G.extraDialog&&G.extraDialog(n))||mainDialog(n)||npcDialog0(n);d.b=d.b||[];sqDialog(n,d);if(G.services)G.services(n,d);const sh=SHOPS[n.id];if(sh&&G.shopOpen&&!G.shopOpen(n.id)&&!(isGuard(n)&&P.bounty>0)){d.b.push({l:`🔒 Laden geschlossen – geöffnet ${G.shopHoursTxt(n.id)}`,f:()=>G.toast(`🕰 Es ist ${WDAY[wday()]}, ${clockStr(G.dayInfo().t)} Uhr. ${n.short||n.name} verkauft ${G.shopHoursTxt(n.id)}.`,'#ffcc80',true),c:0});return d;}if(sh){d.b=d.b||[];if(sh.smith){d.b.unshift({l:'⚒ Schmiede: Umschmieden',f:()=>G.ui&&G.ui.openShop(n.id,'forge'),c:1});d.b.unshift({l:'⚔ Ausrüstung kaufen',f:()=>G.ui&&G.ui.openShop(n.id,'gear'),c:1});}d.b.unshift({l:'🛒 Handeln (Kaufen & Verkaufen)',f:()=>G.ui&&G.ui.openShop(n.id,'buy'),c:1});}return d;};


// ===================== Update =====================

// v20: Jeder Dungeon hat immer denselben Boss (gezielt farmbar), mit eigenen Angriffen, Dienern und Beute
const DBOSS={
 hut:{abil:['slam','summon','line'],minion:'skeleton',loot:[{k:'scythe',name:'Sense des Einsiedlers',f:'melee',ufx:{poison:1},d:'vergiftet'},{t:'amulet',name:'Bertolts Fluchamulett',f:'regen'}]},
 wolfden:{abil:['leap','summon','line'],minion:'wolf',loot:[{k:'dagger',name:'Graumähnes Reißzahn',f:'melee',ufx:{crit:6},d:'+6 % Krit'},{set:'waldlaeufer',s:'chest',name:'Pelz der Wolfsmutter',f:'spd'}]},
 cellar:{abil:['fire','volley','summon'],minion:'ghoul',loot:[{k:'tome_fire',name:'Malriks Brandfibel',f:'spell',ufx:{burn:1},d:'setzt in Brand'},{t:'ring',name:'Malriks Zunderring',f:'spell'}]},
 banditcave:{abil:['volley','combo','summon','line'],minion:'archer',loot:[{k:'sword',name:'Räuberfürst Falks Säbel',f:'melee',ufx:{crit:5},d:'+5 % Krit'},{k:'bow',name:'Räuberfürst Falks Bogen',f:'ranged',ufx:{crit:6},d:'+6 % Krit'},{k:'dagger',name:'Räuberfürst Falks Dolch',f:'melee',ufx:{poison:1},d:'vergiftet'}]},
 wtower:{abil:['volley','summon','quake'],minion:'zombie',loot:[{k:'tome_storm',name:'Grimeldas Sumpfgrimoire',f:'spell',ufx:{slow:1},d:'verlangsamt Gegner'},{set:'magier',s:'helm',name:'Grimeldas Hexenhut',f:'spell'}]},
 grotto:{abil:['combo','leap','line','summon'],minion:'orc',loot:[{k:'axe',name:'Brakkas Schädelspalter',f:'melee',ufx:{stun:.12},d:'12 % Betäubung'},{k:'warhammer',name:'Brakkas Kriegshammer',f:'melee',ufx:{stun:.15},d:'15 % Betäubung'}]},
 dwarf:{abil:['quake','slam','summon'],minion:'golem',loot:[{k:'warhammer',name:'Grimbarts Essenhammer',f:'melee',ufx:{burn:1},d:'setzt in Brand'},{set:'ritter',s:'helm',name:'Steinkrone Grimbarts',f:'hp'}]},
 mistgate:{abil:['volley','summon','leap','quake'],minion:'sucher',loot:[{k:'spear',name:'Stachel der Sucherkönigin',f:'melee',ufx:{poison:1,crit:4},d:'vergiftet, +4 % Krit'},{t:'amulet',name:'Herz des Schwarms',f:'crit'}]},
 cave:{name:'Spinnenmutter Ezzra',base:'spider',add:'spider',abil:['volley','summon','leap'],minion:'spider',loot:[{k:'dagger',name:'Ezzras Giftzahn',f:'melee',ufx:{poison:1},d:'vergiftet'},{k:'crossbow',name:'Ezzras Netzwerfer',f:'ranged',ufx:{slow:1},d:'verlangsamt Gegner'}]},
 mine:{name:'Erzkoloss Grollbart',base:'golem',add:'greydwarf',abil:['quake','slam','line'],minion:'greydwarf',loot:[{k:'mace',name:'Faust des Erzkolosses',f:'melee',ufx:{stun:.15},d:'15 % Betäubung'},{set:'ritter',s:'chest',name:'Erzpanzer Grollbarts',f:'hp'}]},
 icecave:{name:'Eishexe Hrimgerd',base:'icewitch',add:'frostslime',abil:['volley','quake','summon'],minion:'frostslime',loot:[{k:'tome_frost',name:'Hrimgerds Frostfibel',f:'spell',ufx:{slow:1},d:'verlangsamt Gegner'},{t:'ring',name:'Hrimgerds Eisherz',f:'res'}]},
 shrine:{name:'Glutdämon Azhrak',base:'imp',add:'lavaslime',abil:['inferno','volley','summon'],minion:'imp',loot:[{k:'flail',name:'Azhraks Glutflegel',f:'melee',ufx:{burn:1},d:'setzt in Brand'},{t:'amulet',name:'Azhraks Höllenauge',f:'crit'}]},
 pyramid:{name:'Pharao Setnakht',base:'mummy',add:'scorpion',abil:['summon','combo','quake'],minion:'scorpion',loot:[{k:'scythe',name:'Setnakhts Sichelklinge',f:'melee',ufx:{ls:.04},d:'4 % Lebensraub'},{set:'magier',s:'helm',name:'Maske des Pharaos',f:'spell'}]},
 abbey:{name:'Abt Mordrian, der Schattengeist',base:'wraith',add:'skeleton',abil:['volley','summon','line'],minion:'skeleton',loot:[{k:'tome_light',name:'Mordrians Totenbuch',f:'spell',ufx:{ls:.04},d:'4 % Lebensraub'},{k:'halberd',name:'Mordrians Kirchenhellebarde',f:'melee',ufx:{crit:5},d:'+5 % Krit'}]},
 witchhut:{name:'Hexenmutter Morgha',base:'witch',add:'zombie',abil:['volley','summon','fire'],minion:'zombie',loot:[{k:'tome_storm',name:'Morghas Kessel-Grimoire',f:'spell',ufx:{poison:1},d:'vergiftet'},{t:'ring',name:'Morghas Krötenring',f:'luck'}]}};
G.DBOSS=DBOSS;
function dungeonBoss(r){const dq=[...MSQ[3],...MSQ[4],...MSQ[9]].find(st=>st.kind==='dungeon'&&st.room===r.id);const D0=DBOSS[r.id]||{};
 const base=dq?dq.base:(D0.base||(r.b&&r.b.def)||'skeleton'),add=dq?dq.add:(D0.add||base),name=dq?dq.name:(D0.name||null);
 const lvl=dq?Math.max(r.lvl+1,qd(dq.lv)):r.lvl+1;return{dq,base,add,name,lvl,def:D0};}
function enterRoom(r){if(P.riding){dismount(true);G.toast(`🐴 Du sitzt ab – ${P.mount.name} wartet draußen.`,'#e8d0a0');}G.mons=G.mons.filter(m=>m.boss==='dragon');G.proj=[];G.teles=[];G.room=r;P.x=(r.door.tx+.5)*TILE;P.y=(r.door.ty-.5)*TILE;P.prevX=null;P.fx=0;P.fy=-1;G.enterT=.7;sfx('door');
 if(r.dungeon){for(const c of r.chests)if(c.opened&&Date.now()-c.at>240000)c.opened=false;const b=r.b;const ks=Object.keys(P.kills||{}).filter(k=>MT[k]&&!MT[k].passive);const dq=curStep(),qa=dq&&dq.kind==='dungeon'&&dq.room===r.id&&P.macc&&!P.mflag;const DB=dungeonBoss(r);let key=DB.add;const m=mkMini(DB.base,qa?qd(dq.lv):DB.lvl,(r.x0+r.w/2)*TILE,(r.y0+2.5)*TILE);if(DB.name)m.name=DB.name;m.maxhp=m.hp=Math.round(m.maxhp*1.15);Object.assign(m.B,{dboss:1,abil:DB.def.abil||m.B.abil,minion:DB.def.minion||DB.add,loot:DB.def.loot||[]});if(qa){m.qkey=r.id;G.toast(dq.enter,'#ff8a65',true);}m.room=r.id;G.mons.push(m);
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
const CROPS={wheat:{n:'Weizen',grow:[40,70],col:'#e8c95a',yield:()=>[['wheat',rint(1,2)],['seed',Math.random()<.4?1:0]]},carrot:{n:'Karotten',grow:[35,60],col:'#ff8a1e',yield:()=>[['carrot',rint(1,2)]]},herb:{n:'Heilkraut',grow:[45,80],col:'#4ac04a',yield:()=>[['herb',rint(1,2)],['hseed',Math.random()<.35?1:0]]}};
// v21: Lebensmittel (Harke + Wasser ≤3 + Gießkanne), Blumen (überall, ohne Gießen), Bäume (Setzlinge)
CROPS.wheat.kind=CROPS.carrot.kind=CROPS.herb.kind='food';CROPS.wheat.shape='wheat';CROPS.carrot.shape='carrot';CROPS.herb.shape='herb';
const SEEDBACK=.33;CROPS.carrot.yield=()=>[['carrot',rint(1,2)],['carrot',0]];
for(const [id,n,ic,gr,shape,col,heal,sl] of FOODC)CROPS[id]={n,grow:gr,col,shape,kind:'food',yield:()=>[[id,id==='kuerbis'?1:rint(1,2)],['s_'+id,Math.random()<SEEDBACK?1:0]]};
for(const [id,n,ic,col] of FLOWC)CROPS['fl_'+id]={n,grow:[30,50],col,shape:'flower',kind:'flower',yield:()=>[['fl_'+id,1],['f_'+id,Math.random()<.5?1:0]]};
for(const [id,n,kind] of TREEC)CROPS['tr_'+id]={n:n+'-Setzling',grow:[300,420],col:'#5a8a3a',shape:'sapling',kind:'tree',tree:kind,yield:()=>[]};
G.CROPS=CROPS;const fk=(x,y)=>x*2048+y;G.farmAt=(x,y)=>G.farm.has(fk(x,y));G.fk=fk;
const FARMABLE=[T.GRASS,T.GRASS2,T.DIRT,T.FLOWER,T.SWAMP,T.SAND,T.FIELD,T.SNOW];
function nearWater(tx,ty,r){r=r||3;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(tileAt(tx+dx,ty+dy)===T.WATER)return true;return false;}
const BADGROUND=new Set([T.WATER,T.LAVA,T.PATH,T.COBBLE,T.BRIDGE,T.ICE,T.FIELD,T.STONEF,T.WOOD,T.CARPET]);
const FLOWERGROUND=new Set([T.GRASS,T.GRASS2,T.DIRT,T.FLOWER,T.DGRASS,T.SNOW,T.SAND,T.SWAMP,T.BURNT]);
const heldTool=()=>{const it=P.inv[P.sel];return it&&STACK[it.id]&&STACK[it.id].tool||null;};G.heldTool=heldTool;
// Ackerfelder (T.FIELD) im Dorf gelten als schon gelockert und bewässert.
function plantable(tx,ty,c){if(tx>=WW)return false;const f=G.farm.get(fk(tx,ty)),C=CROPS[c];if(!C)return false;const t=tileAt(tx,ty);
 if(C.kind==='food'){if(t===T.FIELD)return !f;return !!(f&&f.c==null)&&nearWater(tx,ty,3);}
 if(f||BADGROUND.has(t)||!FLOWERGROUND.has(t))return false;
 if(C.kind==='tree'){if(inSafe((tx+.5)*TILE,(ty+.5)*TILE)&&vDist((tx+.5)*TILE,(ty+.5)*TILE)<RV-2)return false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const q=tileAt(tx+dx,ty+dy);if(SOLIDS[q]||q===T.WATER||q===T.LAVA||G.farm.has(fk(tx+dx,ty+dy))&&(dx||dy)&&CROPS[G.farm.get(fk(tx+dx,ty+dy)).c]&&CROPS[G.farm.get(fk(tx+dx,ty+dy)).c].kind==='tree')return false;}}
 return true;}
const tillable=(tx,ty)=>tx<WW&&!G.farm.has(fk(tx,ty))&&FARMABLE.indexOf(tileAt(tx,ty))>=0&&tileAt(tx,ty)!==T.FIELD;
function seedSlot(){const it=P.inv[P.sel];if(it&&STACK[it.id]&&STACK[it.id].plant)return P.sel;for(const id of ['seed','carrot','hseed']){const i=P.inv.findIndex(s=>s&&s.id===id);if(i>=0)return i;}return -1;}
const seedCrop=()=>{const i=seedSlot();return i<0?null:STACK[P.inv[i].id].plant;};
// Aktion auf ein Feld (Klick/Tipp oder ⚔ mit Werkzeug). Ziel wird auf das 3×3 um den Spieler gelegt.
function tileUse(tx,ty,dry){const f=G.farm.get(fk(tx,ty)),tool=heldTool(),sc=seedCrop(),t=tileAt(tx,ty);
 if(tool==='axe'&&(t===T.TREE))return dry||chopTree(tx,ty);
 if(tool==='can'&&t===T.WATER)return dry||refillCan();
 if(f){if(f.c&&f.s>=3)return dry||harvest(f);if(tool==='can'&&f.c)return dry||waterCrop(f);if(f.c==null&&sc&&plantable(tx,ty,sc))return dry||plant(tx,ty);
  if(dry)return false;if(f.c==null){G.toast(sc&&CROPS[sc].kind!=='food'?'🌱 Blumen und Setzlinge brauchen keinen gelockerten Boden – setz sie auf Gras.':(nearWater(tx,ty,3)?'🌱 Gelockerter Boden – jetzt Lebensmittel-Saat auswählen und säen.':'💧 Zu weit vom Wasser (max. 3 Felder) – hier wächst nichts.'),'#a5d6a7');return true;}
  const C=CROPS[f.c];G.toast(C.kind==='food'&&!cropWet(f)?`💧 ${C.n} ist trocken – mit der Gießkanne gießen!`:`🌱 ${C.n} wächst noch (Stufe ${f.s+1}/4)`,'#a5d6a7');return true;}
 if(tool==='hoe'&&tillable(tx,ty))return dry||till(tx,ty);
 if(sc&&plantable(tx,ty,sc))return dry||plant(tx,ty);
 return false;}
G.tileUse=tileUse;
// ===== v21: Natur-Schicht (hohes Gras, Gestrüpp, Riesenbüsche, große Blumen) – deterministisch, einmal berechnet =====
// 1 hohes Gras (schlagbar, Samen) · 2 Gestrüpp (durchquerbar, bremst leicht) · 3 Riesenbusch (durchquerbar, Versteck) · 4 große Blume
let DECO=null;const DECOP={meadow:[.17,.012,.004,.018],forest:[.08,.075,.022,.01],dark:[.05,.085,.025,0],swamp:[.13,.04,.006,0],village:[.05,0,0,.01],mist:[.03,.035,.01,0],peaks:[.02,0,0,0]};
function buildDeco(){DECO=new Uint8Array(WW*H);for(let ty=1;ty<H-1;ty++)for(let tx=1;tx<WW-1;tx++){const t=map[ty*W+tx];if(t!==T.GRASS&&t!==T.GRASS2&&t!==T.DGRASS&&t!==T.FLOWER)continue;const pr=DECOP[biome(tx,ty)];if(!pr)continue;
  const cl=.55+G.noise(tx*.09,ty*.09,31)*.9,r=G.h2(tx,ty,301);let nearT=0;if(pr[1]>.03)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(map[(ty+dy)*W+tx+dx]===T.TREE)nearT++;
  let v=0,acc=pr[2]*cl;if(r<acc)v=3;else if(r<(acc+=pr[1]*cl*(1+nearT*.6)))v=2;else if(r<(acc+=pr[3]*cl))v=4;else if(r<(acc+=pr[0]*cl*1.2))v=1;if(!v)continue;
  if(vDist((tx+.5)*TILE,(ty+.5)*TILE)<RV+1.5||townAt(tx,ty)||inCastle(tx,ty))continue;let road=false;for(let q4=0;q4<4;q4++){const dx=DX4[q4],dy=DY4[q4];const q=map[(ty+dy)*W+tx+dx];if(q===T.PATH||q===T.COBBLE||q===T.BRIDGE||q===T.DOOR)road=true;}if(road&&v!==1)continue;DECO[ty*WW+tx]=v;}}
const decoCut=new Map();
function decoAt(tx,ty){if(tx<0||ty<0||tx>=WW||ty>=H)return 0;if(!DECO)buildDeco();const v=DECO[ty*WW+tx];if(!v)return 0;if(decoCut.size&&decoCut.has(fk(tx,ty)))return 0;if(G.farm.has(fk(tx,ty)))return 0;return v;}
G.decoAt=decoAt;
// Gras schlagen: Chance auf Samen (wie in Minecraft)
function cutGrass(){const cx=P.x+P.fx*TILE*.8,cy=P.y+P.fy*TILE*.8;const tx0=Math.floor(cx/TILE),ty0=Math.floor(cy/TILE);let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const tx=tx0+dx,ty=ty0+dy;if(decoAt(tx,ty)!==1)continue;const wx=(tx+.5)*TILE,wy=(ty+.5)*TILE;if(Math.hypot(wx-cx,wy-cy)>TILE*1.25)continue;
  decoCut.set(fk(tx,ty),P.dayT+DAYLEN*2);n++;G.dirtyTile(tx,ty);for(let i=0;i<5;i++)G.parts.push({x:wx+rnd(-10,10),y:wy,z:10,vx:rnd(-50,50),vy:rnd(-50,20),life:.5,c:i%2?'#7cbf4a':'#a6d86a'});
  if(Math.random()<.11*(1+G.S.luck/200)){const r=Math.random(),id=r<.55?'seed':r<.7?'hseed':r<.85?'s_'+pick(FOODC)[0]:'f_'+pick(FLOWC)[0];dropGround(mkStack(id,1),wx,wy);}}
 if(n)sfx('swish');}
G.cutGrass=cutGrass;
// nachwachsendes Gras (selten geprüft, billig)
G.decoTick=()=>{if(!decoCut.size)return;for(const [k,t] of decoCut)if(t<P.dayT){decoCut.delete(k);const tx=Math.floor(k/2048),ty=k%2048;G.dirtyTile(tx,ty);}};
// ===== v21: Baumarten (nicht immer derselbe Baum) & Holzfällen =====
const ptree=new Map(),MODS=new Map();
G.dirtyTile=(tx,ty)=>{for(const r of [G.R2D,G.R3D])if(r&&r.dirtyTile)try{r.dirtyTile(tx,ty);}catch(e){}};
const setTileMod=(tx,ty,t)=>{const k=ty*W+tx;if(!MODS.has(k))MODS.set(k,map[k]);map[k]=t;G.dirtyTile(tx,ty);};
G.treeKind=(tx,ty)=>{const k=ptree.get(fk(tx,ty));if(k)return k;const b=biome(tx,ty),r=G.h2(tx,ty,11),r2=G.h2(tx,ty,77);
 if(b==='winter'||b==='peaks')return 'pine';if(b==='swamp')return r2<.22?'birch':'willow';if(b==='dark')return r>.45?'pine':'dark';if(b==='ash'||b==='waste')return 'dry';
 if(b==='forest')return r>.4?'pine':r2<.18?'birch':r2<.3?'maple':r2<.36?'giant':'oak';
 return r2<.14?'birch':r2<.2?'cherry':r2<.27?'maple':r2<.31?'giant':'oak';};
const TREEFROM={oak:'eiche',giant:'eiche',birch:'birke',pine:'kiefer',willow:'weide',maple:'ahorn',cherry:'kirsche',dark:'kiefer',dry:'eiche'};
function chopTree(tx,ty){if(tx>=WW)return false;const k=fk(tx,ty);P.chopHits=P.chopHits&&P.chopHits.k===k?P.chopHits:{k,n:0};P.chopHits.n++;sfx('hit');P.sta=Math.max(0,P.sta-4);
 for(let i=0;i<5;i++)G.parts.push({x:(tx+.5)*TILE+rnd(-6,6),y:(ty+.6)*TILE,z:18,vx:rnd(-50,50),vy:rnd(-40,10),life:.5,c:'#8a6a3a'});
 const need=G.treeKind(tx,ty)==='giant'?5:3;if(P.chopHits.n<need){G.floats.push({x:(tx+.5)*TILE,y:ty*TILE-10,t:'🪓 '+P.chopHits.n+'/'+need,c:'#e8d0a0',life:.6});return true;}
 const kind=G.treeKind(tx,ty);P.chopHits=null;setTileMod(tx,ty,T.GRASS);ptree.delete(k);P.chopped=P.chopped||{};P.chopped[k]=[P.dayT+DAYLEN*3,kind];G.dirtyTile(tx,ty);sfx('boom');
 const wx=(tx+.5)*TILE,wy=(ty+.5)*TILE;give(mkStack('holz',rint(2,4)+(kind==='giant'?3:0)));if(Math.random()<.7)give(mkStack('stock',rint(1,3)));if(Math.random()<.12)give(mkStack('harz',1));if(Math.random()<.15)dropGround(mkStack('t_'+TREEFROM[kind],1),wx,wy+16);
 P.woodN=(P.woodN||0)+1;return true;}
function growTree(f){G.farm.delete(fk(f.tx,f.ty));const kind=CROPS[f.c].tree;setTileMod(f.tx,f.ty,T.TREE);ptree.set(fk(f.tx,f.ty),kind);P.ptrees=P.ptrees||{};P.ptrees[fk(f.tx,f.ty)]=kind;G.dirtyTile(f.tx,f.ty);G.toast(`🌳 Dein ${CROPS[f.c].n.replace('-Setzling','')} ist ausgewachsen!`,'#a5d6a7');}
// gefällte Bäume wachsen nach; gepflanzte Bäume bleiben (gespeichert in P)
function applyTrees(reset){if(reset){for(const [k,t] of MODS){map[k]=t;G.dirtyTile(k%W,Math.floor(k/W));}MODS.clear();ptree.clear();}const ch=P.chopped||{},pt=P.ptrees||{};
 for(const k in pt){const tx=Math.floor(k/2048),ty=k%2048;if(map[ty*W+tx]!==T.TREE&&!SOLIDS[map[ty*W+tx]])setTileMod(tx,ty,T.TREE);ptree.set(+k,pt[k]);}
 for(const k in ch){const tx=Math.floor(k/2048),ty=k%2048;if(ch[k][0]<P.dayT){delete ch[k];if(map[ty*W+tx]===T.GRASS)setTileMod(tx,ty,T.TREE);}else if(map[ty*W+tx]===T.TREE)setTileMod(tx,ty,T.GRASS);}}
G.applyTrees=applyTrees;
G.tapTile=(tx,ty)=>{if(G.room||P.dead)return false;if(Math.hypot(tx+.5-P.x/TILE,ty+.5-P.y/TILE)>4.6)return false;const px=Math.floor(P.x/TILE),py=Math.floor(P.y/TILE);if(Math.max(Math.abs(tx-px),Math.abs(ty-py))>1){const c=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)c.push([px+dx,py+dy]);c.sort((a,b)=>Math.hypot(a[0]-tx,a[1]-ty)-Math.hypot(b[0]-tx,b[1]-ty));const ok=c.find(([x,y])=>tileUse(x,y,true));if(!ok)return false;tx=ok[0];ty=ok[1];}return !!tileUse(tx,ty,false);};
// ⚔ mit Werkzeug in der Hand: Feld direkt vor dem Spieler (oder das beste im 3×3)
G.toolSwing=()=>{const px=Math.floor(P.x/TILE),py=Math.floor(P.y/TILE),fx=Math.floor((P.x+P.fx*TILE*.9)/TILE),fy=Math.floor((P.y+P.fy*TILE*.9)/TILE);P.swing=.22;if(tileUse(fx,fy,true))return tileUse(fx,fy,false);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(tileUse(px+dx,py+dy,true))return tileUse(px+dx,py+dy,false);const tl=heldTool();warn(tl==='axe'?'Kein Baum in Reichweite':tl==='can'?'Nichts zu gießen':'Hier lässt sich nichts umgraben');return false;};
const cropWet=f=>tileAt(f.tx,f.ty)===T.FIELD||(f.wet||0)>P.dayT;G.cropWet=cropWet;
function till(tx,ty){G.farm.set(fk(tx,ty),{tx,ty,c:null,s:-1,t:0,wet:0});sfx('plant');for(let i=0;i<5;i++)G.parts.push({x:(tx+.5)*TILE+rnd(-8,8),y:(ty+.5)*TILE,z:6,vx:rnd(-30,30),vy:rnd(-30,10),life:.4,c:'#6a4a2a'});if(!nearWater(tx,ty,3))G.toast('⛏ Gelockert – aber hier ist kein Wasser in der Nähe (max. 3 Felder). Lebensmittel wachsen hier nicht.','#ffcc80');return true;}
function refillCan(){const it=P.inv[P.sel];it.wc=25;G.invDirty=true;sfx('splash');G.toast('🚿 Gießkanne aufgefüllt (25 Güsse)','#90caf9');return true;}
function waterCrop(f){const it=P.inv[P.sel];if(it.wc==null)it.wc=25;if(it.wc<=0){G.toast('🚿 Die Gießkanne ist leer – fülle sie am Wasser auf.','#90caf9');return true;}if(CROPS[f.c].kind!=='food'){G.toast('🌸 Das braucht kein Wasser.','#a5d6a7');return true;}
 let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const q=G.farm.get(fk(f.tx+dx,f.ty+dy));if(q&&q.c&&CROPS[q.c].kind==='food'&&!cropWet(q)&&it.wc>0&&(dx===0&&dy===0||n<8)){q.wet=P.dayT+DAYLEN;it.wc--;n++;}}if(!n){G.toast('💧 Schon gegossen.','#90caf9');return true;}
 for(let i=0;i<8;i++)G.parts.push({x:(f.tx+.5)*TILE+rnd(-14,14),y:(f.ty+.5)*TILE-10,z:16,vx:rnd(-10,10),vy:rnd(10,40),life:.5,c:'#7ec8ff'});sfx('splash');G.invDirty=true;return true;}
function plant(tx,ty){const i=seedSlot();if(i<0)return;const it=P.inv[i];const c=STACK[it.id].plant;const old=G.farm.get(fk(tx,ty));G.farm.set(fk(tx,ty),{tx,ty,c,s:0,t:rnd(...CROPS[c].grow),wet:old&&old.wet||0});it.count--;if(it.count<=0)P.inv[i]=null;G.invDirty=true;sfx('plant');const C=CROPS[c];G.toast(C.kind==='food'&&tileAt(tx,ty)!==T.FIELD?`🌱 ${C.n} gesät – jetzt mit der Gießkanne gießen!`:`🌱 ${C.n} gepflanzt`,'#a5d6a7');return true;}
function harvest(f){const C=CROPS[f.c];if(C.kind==='food'&&tileAt(f.tx,f.ty)!==T.FIELD)G.farm.set(fk(f.tx,f.ty),{tx:f.tx,ty:f.ty,c:null,s:-1,t:0,wet:f.wet||0});else G.farm.delete(fk(f.tx,f.ty));sfx('pickup');for(const [id,n] of C.yield())if(n>0)give(mkStack(id,n));return true;}
// ---- Wegschreine
G.travel=function(id){const w=WAYS.find(q=>q.id===id);if(!w||!P.ways[id])return;if(G.room)exitRoom();G.mons=G.mons.filter(m=>m.boss==='dragon');G.proj=[];G.teles=[];P.x=(w.tx+.5)*TILE;P.y=(w.ty+1.6)*TILE;P.fy=1;sfx('quest');G.toast('✨ Gereist nach '+w.name,'#b388ff',true);};
function act(){const t=target();if(!t)return;if(G.extraAct&&G.extraAct(t))return;if(t.k==='npc'){G.ui&&G.ui.openDialog(t.n);return;}
 if(t.k==='door'){enterRoom(t.b.room);return;}if(t.k==='exit'){exitRoom();return;}if(t.k==='chest'){openChest(t.c);return;}
 if(t.k==='way'){G.ui&&G.ui.openTravel&&G.ui.openTravel();return;}
 if(t.k==='soil'){tileUse(t.tx,t.ty,false);return;}
 if(t.k==='crop'){tileUse(t.f.tx,t.f.ty,false);}}
function target(){let best=null,bd=52;
 if(G.room){const r=G.room;for(const c of r.chests){if(c.opened)continue;const d=Math.hypot((c.tx+.5)*TILE-P.x,(c.ty+.5)*TILE-P.y);if(d<bd){bd=d;best={k:'chest',c};}}const dd=Math.hypot((r.door.tx+.5)*TILE-P.x,(r.door.ty+.5)*TILE-P.y);if(dd<bd){bd=dd;best={k:'exit',r};}return G.extraTarget?G.extraTarget(best,bd):best;}
 for(const n of NPCS){if(!G.npcVisible(n))continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best={k:'npc',n};}}
 for(const w of WAYS){const d=Math.hypot((w.tx+.5)*TILE-P.x,(w.ty+.5)*TILE-P.y);if(d<bd){bd=d;best={k:'way',w};}}
 const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const f=G.farm.get(fk(ptx+dx,pty+dy));if(!f)continue;const d=Math.hypot((f.tx+.5)*TILE-P.x,(f.ty+.5)*TILE-P.y)-(f.s>=3?6:0);if(d<Math.min(bd,44)){bd=d;best={k:'crop',f};}}
 const mt=G.mouseTile;if(mt&&Math.hypot(mt.x+.5-P.x/TILE,mt.y+.5-P.y/TILE)<3.6){const f=G.farm.get(fk(mt.x,mt.y));if(f)return{k:'crop',f};const hs=P.inv[P.sel];if(hs&&STACK[hs.id]&&(STACK[hs.id].plant||STACK[hs.id].tool)&&tileUse(mt.x,mt.y,true))return{k:'soil',tx:mt.x,ty:mt.y};}
 if((!best||(best.k==='crop'&&best.f.s<3))&&seedSlot()>=0&&!G.mouseTile){const ftx=Math.floor((P.x+P.fx*30)/TILE),fty=Math.floor((P.y+P.fy*30)/TILE);const c=[[ftx,fty],[ptx,pty]];for(const [x,y] of c)if(tileUse(x,y,true)){best={k:'soil',tx:x,ty:y};break;}}
 for(const b of BUILD){if(!b.room)continue;const d=Math.hypot((b.door.tx+.5)*TILE-P.x,(b.y+b.h+.25)*TILE-P.y);if(d<Math.min(bd,46)){bd=d;best={k:'door',b};}}return G.extraTarget?G.extraTarget(best,bd):best;}
G.targetPos=t=>t.k==='npc'?{x:t.n.x,y:t.n.y}:t.k==='crop'?{x:(t.f.tx+.5)*TILE,y:(t.f.ty+.5)*TILE}:t.k==='soil'?{x:(t.tx+.5)*TILE,y:(t.ty+.5)*TILE}:t.k==='way'?{x:(t.w.tx+.5)*TILE,y:(t.w.ty+.5)*TILE}:t.k==='door'?{x:(t.b.door.tx+.5)*TILE,y:(t.b.y+t.b.h+.2)*TILE}:t.k==='chest'?{x:(t.c.tx+.5)*TILE,y:(t.c.ty+.5)*TILE}:{x:(t.r.door.tx+.5)*TILE,y:(t.r.door.ty+.3)*TILE};
G.targetLabel=t=>t.k==='npc'?['💬','Reden']:t.k==='soil'?['🌱','Pflanzen']:t.k==='crop'?(t.f.c==null?(seedCrop()?['🌱','Säen']:['🟫','Feld']):t.f.s>=3?['🌾','Ernten']:heldTool()==='can'&&!cropWet(t.f)?['🚿','Gießen']:CROPS[t.f.c].kind==='food'&&!cropWet(t.f)?['💧','Trocken']:['⏳',`${t.f.s+1}/4`]):t.k==='soil'?(heldTool()==='hoe'?['⛏️','Umgraben']:heldTool()==='axe'?['🪓','Fällen']:heldTool()==='can'?['🚿','Auffüllen']:['🌱','Pflanzen']):t.k==='way'?['✨','Reisen']:t.k==='door'?['🚪','Betreten']:t.k==='chest'?['🧰','Öffnen']:['🚪','Verlassen'];
Object.assign(G,{act,target});
const DAYLEN=720;
G.dayInfo=()=>{const t=((G.P&&G.P.dayT)||0)%DAYLEN,n=Math.floor(((G.P&&G.P.dayT)||0)/DAYLEN);let L;if(t<470)L=1;else if(t<530)L=1-(t-470)/60*.78;else if(t<680)L=.22;else L=.22+(t-680)/40*.78;
 return{t,n,light:clamp(L,.22,1),night:t>=505&&t<700,dusk:t>=440&&t<540,full:h2(n,7,777)<.1,sunA:(t/DAYLEN)};};
G.update=function(dt){if(P&&!P.dead){const st=P.stats||(P.stats={});st.time=(st.time||0)+dt;}P=G.P;G.time+=dt;P.dayT=(P.dayT||0)+dt;{const di=G.dayInfo();if(di.night!==G._wasNight){if(di.night){G.toast(di.full?'🌕 Vollmond! Werwölfe streifen umher …':'🌙 Die Nacht bricht herein. Untote erheben sich.','#b3c7ff',true);sfx('horn');}else if(G._wasNight!=null)G.toast('🌅 Der Morgen graut.','#ffe0a0');G._wasNight=di.night;}}const S=G.S=calc();if(P.hp>S.maxhp)P.hp=S.maxhp;
 let mx=G.input.x,my=G.input.y;
 if(P.drunk>0){const d0=P.drunk;P.drunk=Math.max(0,P.drunk-dt/20);if(d0>=3&&P.drunk<3){G.toast('🙂 Du bist wieder einigermaßen nüchtern.','#c8e6c9');G.S=calc();}else if(Math.floor(d0)!==Math.floor(P.drunk))G.S=calc();
  if(P.drunk>=3){const amp=Math.min(1.05,.38+(P.drunk-3)*.1),a=Math.sin(G.time*1.6)*amp+Math.sin(G.time*3.7+1)*amp*.35;if(Math.hypot(mx,my)>.05){const c=Math.cos(a),s2=Math.sin(a);const nx=mx*c-my*s2,ny=mx*s2+my*c;mx=nx;my=ny;}else if(P.drunk>=6&&!P.dead){const w=Math.sin(G.time*.9)*.22;mx=Math.cos(G.time*.7)*w;my=Math.sin(G.time*1.1)*w;}}}
 const len=Math.hypot(mx,my);P.moving=false;
 P.dodgeCd-=dt;if(P.invT>0)P.invT-=dt;if(P.secondT>0)P.secondT-=dt;
 {const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE),ct=tileAt(ptx,pty);const wasC=P.climb;P.onLedge=ct===T.LEDGE&&P.z<=1;P.climb=ct===T.CLIMB;
  if(P.climb&&!wasC){P.climbFrom={x:P.prevX||P.x,y:P.prevY||P.y};G.tip('🧗 Beim Klettern sinkt deine Ausdauer – ist sie leer, rutschst du ab.','climb');}
  if(P.climb&&!P.dead){P.sta-=9*dt;P.staT=.6;if(P.sta<=0){P.sta=0;const f=P.climbFrom||{x:P.x,y:P.y};P.x=f.x;P.y=f.y;P.climb=false;const dmg=Math.round(G.S.maxhp*.15);P.hp=Math.max(1,P.hp-dmg);P.hurtT=.4;G.floats.push({x:P.x,y:P.y-34,t:'Abgerutscht! -'+dmg,c:'#ff8a80',life:1});sfx('hurt');}}
  P.sprint=!!(G.sprintHeld&&len>.15&&!P.climb&&P.sta>4&&!P.dead&&P.dodgeT<=0);if(P.sprint){P.sta-=9*dt*(G.S.staMul||1);P.staT=.5;if(Math.random()<.25)G.parts.push({x:P.x+rnd(-5,5),y:P.y+8,z:2,vx:-mx*30,vy:-my*30,life:.3,c:'#d8c8a0'});}
  if(P.z>0||P.vz>0){P.vz-=980*dt;P.z+=P.vz*dt;if(P.z<=0){P.z=0;P.vz=0;if(P.landSfx){sfx('step');P.landSfx=false;}}}
  if(!P.climb&&!P.onLedge&&P.z<=0&&!G.noclip&&tileAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE))!==T.LEDGE&&solidPP(P.x,P.y)){const f=P.prevX!=null&&P.prevRoom===(G.room?G.room.id:null)&&Math.hypot(P.prevX-P.x,P.prevY-P.y)<TILE*1.5?{x:P.prevX,y:P.prevY}:null;if(f&&!solidPP(f.x,f.y)){P.x=f.x;P.y=f.y;}else{const rr=G.room;let done=0;for(let rad=6;rad<=TILE*3&&!done;rad+=6)for(let a=0;a<16&&!done;a++){const x=P.x+Math.cos(a*.3927)*rad,y=P.y+Math.sin(a*.3927)*rad;if(rr&&(x<rr.x0*TILE||y<rr.y0*TILE||x>=(rr.x0+rr.w)*TILE||y>=(rr.y0+rr.h)*TILE))continue;if(!solidPP(x,y)&&canMoveP(x,y,10)){P.x=x;P.y=y;done=1;}}}}
  P.prevX=P.x;P.prevY=P.y;P.prevRoom=G.room?G.room.id:null;}
 if(P.pullT>0&&P.pullFrom&&!P.dead&&P.dodgeT<=0){P.pullT-=dt;const m=P.pullFrom,ddx=m.x-P.x,ddy=m.y-P.y,dd=Math.hypot(ddx,ddy)||1;if(dd>m.r+18){const sp=520*dt;if(canMoveP(P.x+ddx/dd*sp,P.y,10))P.x+=ddx/dd*sp;if(canMoveP(P.x,P.y+ddy/dd*sp,10))P.y+=ddy/dd*sp;}}
 if(P.dodgeT>0&&!P.dead){P.dodgeT-=dt;const sp=S.speed*3.3*dt;if(canMoveP(P.x+P.ddx*sp,P.y,10))P.x+=P.ddx*sp;if(canMoveP(P.x,P.y+P.ddy*sp,10))P.y+=P.ddy*sp;P.moving=true;P.anim+=dt*1.5;if(Math.random()<.6)G.parts.push({x:P.x,y:P.y+6,z:2,vx:rnd(-20,20),vy:rnd(-20,20),life:.3,c:'#d8c8a0'});}
 else if(P.rootT>0&&!P.dead){P.rootT-=dt;P.moving=false;if(Math.random()<.2)G.parts.push({x:P.x+rnd(-10,10),y:P.y+4,z:6,vx:0,vy:0,life:.3,c:'#5a8a3a'});}
 else if(len>.15&&!P.dead){const nx=mx/len,ny=my/len;if(G.fpDir){P.fx=G.fpDir.x;P.fy=G.fpDir.y;}else if(!G.aim||!G.attackHeld){P.fx=nx;P.fy=ny;}const dr=G.attackHeld&&S.kind&&WKIND[S.kind].draw?WKIND[S.kind].draw:1;const dco=!G.room?decoAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE)):0;const sp=S.speed*Math.min(1,len)*dt*dr*(P.climb?.45:1)*(dco===2||dco===3?.82:1)*(P.sprint?1.6:1)*(G.devSpd||1);const ox0=P.x,oy0=P.y;if(G.noclip||canMoveP(P.x+nx*sp,P.y,10))P.x+=nx*sp;if(G.noclip||canMoveP(P.x,P.y+ny*sp,10))P.y+=ny*sp;if(!G.room&&!G.noclip&&Math.hypot(P.x-ox0,P.y-oy0)<sp*.3)treeSlide(nx,ny,sp);P.moving=true;P.anim+=dt;}
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
  if(!m.room&&!m.boss&&!m.realm&&!m.camp&&(dV(m.x/TILE,m.y/TILE)<RV+.5||townAt(m.x/TILE,m.y/TILE))){m.dead=true;continue;}
  if(m.t.night&&!m.boss&&!m.room){const di=G.dayInfo();if(!di.night&&!di.dusk){m.hp-=m.maxhp*.2*dt;if(Math.random()<.4)G.parts.push({x:m.x+rnd(-8,8),y:m.y,z:12,vx:0,vy:-50,life:.6,c:'#555',smoke:1});if(m.hp<=0){m.dead=true;continue;}}}
  if(m.t.human&&m.aggro&&!m.wereCk&&!m.room){m.wereCk=1;const di=G.dayInfo();if(di.night&&di.full&&Math.random()<.4){const w=mkMonster('werewolf',m.lvl+1,m.x,m.y);w.aggro=true;Object.assign(m,{dead:true});G.mons.push(w);sfx('aggro',{type:'wolf',x:m.x,y:m.y});G.toast(`🌕 ${m.name} verwandelt sich in einen Werwolf!`,'#ffab91',true);for(let i=0;i<16;i++)G.parts.push({x:w.x,y:w.y,z:16,vx:rnd(-120,120),vy:rnd(-120,120),life:.6,c:'#5a4a3a'});continue;}}
  if(m.cor&&Math.random()<.12)G.parts.push({x:m.x+rnd(-m.r,m.r),y:m.y+rnd(-4,4),z:m.r*1.4,vx:rnd(-10,10),vy:-rnd(20,45),life:.7,c:Math.random()<.5?'#ff6a1a':'#3a2a22'});
  const dx=P.x-m.x,dy=P.y-m.y,d=Math.hypot(dx,dy)||1;let vx=0,vy=0,spd=m.spd*(m.slowT>0?.5:1);
  const aggroR=m.boss?340:(m.ai==='ranged'?300:240);
  m.voiceT-=dt;const hd0=Math.hypot(m.x-m.home.x,m.y-m.home.y);const leashed=m.boss==='dragon'?hd0>TILE*8:(hd0>TILE*(m.room?60:m.boss?30:m.realm?14:45)&&d>TILE*6);
  if(m.terr&&!m.provoked&&d<70&&!P.dead&&!safe){m.provoked=true;G.floats.push({x:m.x,y:m.y-m.r-14,t:'Grunz! Revier!',c:'#ffcc80',life:.9});}
  if(m.flee&&(m.provoked||d<90)&&!P.dead){m.aggro=false;m.provoked=false;const fx=-dx/d,fy=-dy/d;const sp2=m.spd*(m.slowT>0?.6:1.35)*dt;let nx=m.x+fx*sp2,ny=m.y+fy*sp2;if(!canMove(nx,ny,m.cr)){nx=m.x+fy*sp2;ny=m.y-fx*sp2;}if(canMove(nx,ny,m.cr)){m.x=nx;m.y=ny;m.fx=fx;m.fy=fy;}m.fleeT=(m.fleeT||0)+dt;if(d>TILE*14&&m.fleeT>4)m.dead=true;continue;}
  const can=!P.dead&&!safe&&!leashed&&(!m.passive||m.provoked)&&(d<aggroR||(m.aggro&&d<aggroR*2.6));
  if(m.aggro&&!m.evade&&(P.dead||safe||leashed)){m.aggro=false;m.evade=true;m.evT=0;m.st=null;G.floats.push({x:m.x,y:m.y-m.r-14,t:'Entkommen!',c:'#9be7ff',life:1});}
  if(m.evade){m.evT+=dt;m.hp=Math.min(m.maxhp,m.hp+m.maxhp*.6*dt);if(hd0<TILE*.9||m.evT>7){if(m.evT>7){m.x=m.home.x;m.y=m.home.y;}m.evade=false;m.hp=m.maxhp;}else{vx=(m.home.x-m.x)/hd0;vy=(m.home.y-m.y)/hd0;spd=m.spd*1.8;}}
  else if(m.st==='leap'){m.stT-=dt;const p=1-Math.max(0,m.stT)/1.1;m.x=m.sx0+(m.lx-m.sx0)*p;m.y=m.sy0+(m.ly-m.sy0)*p;m.jump=Math.sin(p*Math.PI);if(m.stT<=0){m.st=null;m.jump=0;if(!canMove(m.x,m.y,m.cr)){m.x=m.sx0;m.y=m.sy0;}for(let i=0;i<12;i++)G.parts.push({x:m.x,y:m.y,z:4,vx:rnd(-140,140),vy:rnd(-140,140),life:.5,c:'#8a7a6a'});sfx('boom',m);}}
  else if(m.st==='blink'){m.stT-=dt;if(m.stT<=0){m.st=null;for(let k=0;k<10;k++){const a=Math.random()*6.283,r=rnd(50,80);const nx=P.x+Math.cos(a)*r,ny=P.y+Math.sin(a)*r;if(canMove(nx,ny,m.cr)&&(m.room||!monBlocked(nx,ny))){for(let i=0;i<10;i++)G.parts.push({x:m.x,y:m.y,z:14,vx:rnd(-90,90),vy:rnd(-90,90),life:.4,c:'#6a3a8a'});m.x=nx;m.y=ny;m.atkCd=Math.min(m.atkCd,.2);break;}}}}
  else if(m.st==='wind'){m.stT-=dt;if(m.stT<=0){m.st='dash';m.stT=.45;m.hitDone=false;}}
  else if(m.st==='dash'){m.stT-=dt;vx=m.ddx;vy=m.ddy;spd=m.spd*3.6;if(!m.hitDone&&d<m.r+16){m.hitDone=true;hitPlayer(m.dmg*1.3,{lvl:m.lvl,type:'phys',burn:m.t.burn,chill:m.t.chill});}if(m.stT<=0){m.st=null;m.chCd=rnd(2.5,4);}}
  else if(can){if(m.cor&&!P.corSeen&&d<260){P.corSeen=1;G.toast('🔥 Rot glühende Augen … Der Aschenfluch hat dieses Tier ganz ergriffen. Befallene greifen alles an – weniger befallene Hasen und Füchse fliehen, Wildschweine verteidigen nur ihr Revier.','#ffab91',true);}if(!m.aggro&&m.voiceT<=0){sfx('aggro',{type:m.boss?(m.boss==='dragon'?'dragon':'boss'):m.type,x:m.x,y:m.y});m.voiceT=12;}m.aggro=true;
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
 for(const f of G.farm.values())if(f.c&&f.s<3){const C=CROPS[f.c];if(C.kind==='food'&&!cropWet(f))continue;f.t-=dt*(tileAt(f.tx,f.ty)===T.FIELD?1.3:1);if(f.t<=0){f.s++;f.t=rnd(...C.grow);if(f.s>=3&&C.kind==='tree')growTree(f);}}
 if(!G.room)for(const w of WAYS){if(!P.ways[w.id]&&Math.hypot((w.tx+.5)*TILE-P.x,(w.ty+.5)*TILE-P.y)<TILE*3){P.ways[w.id]=1;sfx('quest');G.toast(`✨ Wegschrein „${w.name}“ entdeckt! Du kannst nun hierher reisen.`,'#b388ff',true);}}
 for(const t of G.teles){t.t-=dt;if(t.t<=0&&!t.done){t.done=true;if(!t.q)sfx('boom',t);if(Math.hypot(P.x-t.x,P.y-t.y)<t.r)hitPlayer(t.dmg,{lvl:t.lvl,type:t.type||'phys',burn:t.burn,root:t.root,slow:t.slow});for(let i=0;i<16;i++)G.parts.push({x:t.x+rnd(-t.r,t.r)*.7,y:t.y+rnd(-t.r,t.r)*.7,z:4,vx:rnd(-40,40),vy:rnd(-40,40),vz:rnd(40,120),life:.5,c:`rgb(${t.c})`});}}
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
 if(!P.curseTip&&P.main>=1&&!G.room&&vDist(P.x,P.y)>RV+3&&!townAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE))){P.curseTip=1;G.toast('🜂 Du verlässt den Schutz der Runensteine. Hier draußen wirkt der Aschenfluch: Fast jedes Geschöpf ist dir feindlich gesinnt – selbst der kleinste Hase.','#ff8a65',true);}
 if(!safe&&!P.dead&&!G.room){bossT-=dt;if(bossT<=0){if(!G.mons.some(m=>m.boss&&!BOSSES[m.boss].fixed&&!m.dead)){bossT=(P.level>=3&&spawnBoss())?rnd(480,720):30;}else bossT=30;}}
 G.flashT-=dt;};

// ===================== Speichern =====================
G.slot=+(()=>{try{return localStorage.getItem('aschen_slot')||1}catch(e){return 1}})()||1;const SK=n=>n===1?SAVEK:SAVEK+'_s'+n;G.SK=SK;G.rawSlot=n=>{try{return localStorage.getItem(SK(n))||(n===1?localStorage.getItem(SAVEK4):null);}catch(e){return null;}};
G.setSlot=n=>{G.slot=n;try{localStorage.setItem('aschen_slot',n)}catch(e){}};
G.slotInfo=n=>{try{const raw=localStorage.getItem(SK(n))||(n===1?localStorage.getItem(SAVEK4):null);if(!raw)return null;const s=JSON.parse(raw);if(!s||!s.P)return null;const p=s.P;return{lvl:p.lvl||1,gold:p.gold||0,diff:p.diff,at:p.savedAt||0,look:p.look||null,chapter:p.chapter||null};}catch(e){return null;}};
G.wipeSlot=n=>{try{localStorage.removeItem(SK(n));if(n===1)localStorage.removeItem(SAVEK4);}catch(e){}};
G.hasSave=()=>{try{return !!(localStorage.getItem(SK(G.slot))||(G.slot===1&&localStorage.getItem(SAVEK4)));}catch(e){return false;}};
G.save=function(){if(!G.P)return;try{if(MSQ[G.P.main])G.P.msId=(MSQ[G.P.main][G.P.ms]||{}).id;G.P.qv=21;const p=Object.assign({},G.P);delete p.dead;p.roomId=G.room?G.room.id:null;p.savedAt=Date.now();p.wv=2;const ch={};ROOMS.forEach(r=>{if(r.chests.length)ch[r.id]=r.chests.map(c=>[c.opened?1:0,c.at]);});localStorage.setItem(SK(G.slot),JSON.stringify({P:p,farm:[...G.farm.values()],fixT:G.fixT,chests2:ch}));}catch(e){}};
G.load=function(){try{let raw=localStorage.getItem(SK(G.slot)),mig=false;if(!raw&&G.slot===1){raw=localStorage.getItem(SAVEK4);mig=!!raw;}const s=JSON.parse(raw||'null');if(!s||!s.P)return false;if(mig){delete s.farm;delete s.chests;s.P.roomId=null;s.P.x=SPAWN.x;s.P.y=SPAWN.y;}newGame(s.P.diff||G.settings.diff);Object.assign(P,s.P);if(P.sta==null)P.sta=100;if(P.mp==null)P.mp=40;P.staT=0;P.dead=false;P.poison=null;P.dodgeT=0;
 if(!Array.isArray(P.inv)||P.inv.length!==36)return false;if(!P.chat)P.chat={};const oldW=!P.wv;if(Array.isArray(s.farm))s.farm.forEach(f=>{if(f&&(f.c==null||CROPS[f.c])){if(oldW){const q=oldToNew(f.tx,f.ty);if(!q)return;f.tx=q[0];f.ty=q[1];}G.farm.set(fk(f.tx,f.ty),f);}});if(!P.kills)P.kills={};if(P.ms==null){P.ms=P.main===3?((P.macc||P.level>=qd('lvG'))?3:0):P.main===4?(P.macc?1:0):0;P.lgN=0;}if(!P.ways)P.ways={city:1};P.burn=null;P.slow=0;if(s.fixT)G.fixT=Object.assign({grukk:0,bonelord:0,dragon:0},s.fixT);
 G.flags.barrier=!!P.barrier;if(s.chests2)for(const id in s.chests2){const r=ROOMS.find(q=>q.id===id),a=s.chests2[id];if(r&&Array.isArray(a))a.forEach((v,j)=>{if(r.chests[j]){r.chests[j].opened=!!v[0];r.chests[j].at=v[1]||0;}});}if(!oldW&&!s.chests2&&Array.isArray(s.chests))s.chests.forEach((a,i)=>{const r=ROOMS[i];if(r&&Array.isArray(a))a.forEach((v,j)=>{if(r.chests[j]){r.chests[j].opened=!!v[0];r.chests[j].at=v[1]||0;}});});G.room=null;if(oldW){migrateWorld();}if(P.roomId){const r=ROOMS.find(q=>q.id===P.roomId);if(r){P.x=r.ent.x;P.y=r.ent.y;}}if(P.diff){G.settings.diff=P.diff;}if(!P.side)P.side={};if(P.dayT==null)P.dayT=60;if(mig){P.x=SPAWN.x;P.y=SPAWN.y;G.toast('🗺 Die Welt ist gewachsen! Du startest wieder in Eichenhain. Deine Ausrüstung und Stufe bleiben.','#ffd54a',true);}placeElara();P.furn=P.furn||{};P.inv.forEach((it,i)=>{if(it&&it.stack&&STACK[it.id]&&STACK[it.id].type==='furn'){P.furn[it.id]=(P.furn[it.id]||0)+it.count;P.inv[i]=null;}});{let nb=0;const fixIt=it=>{if(!it||it.stack||it.v13||it.rarity==null)return;const k=RMULT[it.rarity]/RMULT_OLD[it.rarity];if(it.dmg!=null)it.dmg=Math.max(1,Math.round(it.dmg*k));if(it.def!=null)it.def=Math.max(1,Math.round(it.def*k));it.v13=1;if(it.rarity>0)nb++;};(P.inv||[]).forEach(fixIt);for(const k in P.eq||{})fixIt(P.eq[k]);if(P.chest)(P.chest||[]).forEach(fixIt);if(nb)setTimeout(()=>G.toast('⚖ Update 13: Seltene Waffen & Rüstungen wurden neu ausbalanciert.','#ffd54a',true),3500);}if(!canMove(P.x,P.y,10)){P.x=SPAWN.x;P.y=SPAWN.y;}P.inv=P.inv.map(x=>x&&x.stack&&!STACK[x.id]?null:x);G.questMigrate();qSync();applyTrees(true);G.S=calc();if(P.hp<=0)P.hp=G.S.maxhp;return true;}catch(e){console.error(e);return false;}};
G.wipe=()=>G.wipeSlot(G.slot);
// ===== v18: alte Spielstände (kleine Karte) auf die große Welt umrechnen =====
function oldToNew(x,y){const OT=t=>({x:t.x/2,y:t.y/2});let nx,ny;if(Math.hypot(x-288,y-300)<RV+4){nx=x+VCX-288;ny=y+VCY-300;}else{const t=TOWNS.find(t=>{const o=OT(t);return Math.hypot(x-o.x,y-o.y)<t.r+4;});if(t){const o=OT(t);nx=t.x+(x-o.x);ny=t.y+(y-o.y);}else{nx=x*2;ny=y*2;}}
 for(let r=0;r<12;r++)for(let a=0;a<Math.max(1,r*8);a++){const xx=Math.round(nx+Math.cos(a/(r*8||1)*6.283)*r),yy=Math.round(ny+Math.sin(a/(r*8||1)*6.283)*r);if(xx>3&&yy>3&&xx<WW-3&&yy<H-3&&walkTile(xx,yy))return[xx,yy];}return null;}
function migrateWorld(){const tx=P.x/TILE,ty=P.y/TILE;if(tx<576){const q=oldToNew(Math.floor(tx),Math.floor(ty));if(q){P.x=(q[0]+.5)*TILE;P.y=(q[1]+.5)*TILE;}else{P.x=SPAWN.x;P.y=SPAWN.y;}}P.prevX=null;P.fog=null;
 // Hauptquest auf die neue, längere Questreihe abbilden
 const MAP3=[[3,0],[3,1],[3,4],[4,2]],MAP4=[[3,5],[4,3],[4,4]];let tgt=null;if(P.main===3)tgt=MAP3[Math.min(P.ms||0,3)];else if(P.main===4)tgt=MAP4[Math.min(P.ms||0,2)];
 if(tgt){const seq=[];for(const m of [3,4])MSQ[m].forEach((st,i)=>seq.push([m,i,st]));let idx=seq.findIndex(q=>q[0]===tgt[0]&&q[1]===tgt[1]);const cap=seq.findIndex(q=>qd(q[2].gate)>P.level+1);let keep=true;if(cap>=0&&cap<idx){idx=cap;keep=false;}P.main=seq[idx][0];P.ms=seq[idx][1];if(!keep||seq[idx][2].id!==(P.main===3?['raub','hut','nest','grukk'][0]:'')){}if(!keep){P.macc=false;P.mflag=0;}P.lgN=0;}
 setTimeout(()=>G.toast('🗺 Update 18: Die Welt ist doppelt so groß geworden! Deine Position und deine Quests wurden übernommen.','#ffd54a',true),1500);}
// ===================== v8: Zuhause, Möbel, Angeln, Katzen, Schätze, Tagesablauf =====================
const HOMEB=BUILD.find(b=>b.id==='h4'),HR=HOMEB.room;HOMEB.name='Dein Haus';HOMEB.sign='🏠';HOMEB.player=1;HR.name='Dein Haus';HR.player=true;HR.chests=[];
const CARPB=BUILD.find(b=>b.id==='h7');
{const ab=BUILD.find(b=>b.id==='angler');if(ab&&ab.room){const r=ab.room;r.dungeon=false;r.name='Anglerhütte';for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)F(r,x,y,T.WOOD);r.chests=[];F(r,0,0,T.BED);F(r,0,1,T.BED);F(r,r.w-1,0,T.HEARTH);F(r,4,3,T.TABLE);F(r,5,3,T.TABLE);F(r,r.w-1,3,T.BARREL);F(r,r.w-1,4,T.BARREL);F(r,2,0,T.SHELF);F(r,r.w-1,r.h-1,T.CRATE);CH_(r,1,r.h-1,'home');}}
G.HOME={b:HOMEB,r:HR};
// v22: das alte Stufen-Möbelsystem wurde durch Einzelstücke ersetzt (siehe „Möbel & Deko“ weiter unten)
function applyHome(){}
let comfort=()=>0;
STACK.hammer={name:'Schreinerhammer',type:'tool',desc:'In der Hand halten: Rechtsklick (Handy: ✋ im Haus) öffnet dein Möbellager. Im eigenen Haus ein Möbelstück anvisieren und [F]/✋ drücken baut es ab.',price:60,sell:20};
function furnAdd(id,n){P.furn=P.furn||{};P.furn[id]=(P.furn[id]||0)+(n||1);}G.furnAdd=furnAdd;
G.HR=HR;
const hasHammerHeld=()=>{const h=P.inv[P.sel];return h&&h.id==='hammer';};G.hasHammer=()=>hasHammerHeld();
function furnAt(){return null;}
G.sleepNow=()=>sleep();
function sleep(){const di=G.dayInfo();if(!(di.t>=430||di.t<40)){G.toast('😴 Du bist noch nicht müde. Ab dem Abend kannst du schlafen.','#ccc');return;}if(G.reviveNPCs)G.reviveNPCs();const n=Math.floor(P.dayT/DAYLEN);P.dayT=(di.t>=430?(n+1):n)*DAYLEN+28;const S=calc();P.hp=S.maxhp;P.sta=S.maxSta;P.mp=S.maxMp;P.poison=null;P.burn=null;const c=G.room&&G.room!==HR&&G.rentedHere&&G.rentedHere()?12:comfort();if(G.room!==HR)P.rent=null;P.rested={until:P.dayT+680,b:Math.min(30,c)};G.sleepFx=2.6;G.mons=G.mons.filter(m=>m.room===undefined&&false);sfx('quest');if(P.mount){const wasDead=P.mount.dead;P.mount.dead=0;P.mount.hp=mountMax();if(wasDead)setTimeout(()=>G.toast(`🐎 ${P.mount.name} ist im Stall wieder auf den Beinen!`,'#a5d6a7',true),1800);}
 setTimeout(()=>{G.toast(`☀ Guten Morgen! Ausgeruht: +${Math.min(30,c)} % Leben & Regeneration (Gemütlichkeit ${c})`,'#ffe9a0',true);if(P.pet&&G.homeBed()&&G.FDECO[G.homeBed().i].sh==='bedk')G.toast(`😺 ${P.pet.name} hat sich die ganze Nacht neben dich gekuschelt.`,'#ffd0e0');else if(P.pet)G.toast(`🐱 ${P.pet.name} hat im ${G.homeItems().some(it=>G.FDECO[it.i].sh==='basket')?'Körbchen':'Eck'} geschlafen.`,'#ffd0e0');},900);G.save();}
// Schreiner & Angler
const mkN=(o)=>{o.x=o.hx=(o.tx+.5)*TILE;o.y=o.hy=(o.ty+.5)*TILE;o.fx=0;o.fy=1;o.wt=0;o.vx=0;o.vy=0;o.anim=0;NPCS.push(o);return o;};
mkN({id:'holger',name:'Schreiner Holger',short:'Holger',abs:1,tx:CARPB.door.tx+1,ty:CARPB.y+CARPB.h+1,look:{body:'#7a5a3a',skin:'#e0b890',hair:'#8a5a2a',beard:'#8a5a2a'},persona:'Gemütlicher, etwas brummiger Schreiner aus Eichenhain. Baut Betten, Tische und Kamine und liebt den Duft von frischem Holz.',greet:['Holz lebt, mein Freund.','Mein Hobel ist mein bester Freund.']});
mkN({id:'runa',name:'Wächterin Runa',short:'Runa',lord:1,abs:1,tx:TP('nebel',0,-3).x,ty:TP('nebel',0,-3).y,look:{body:'#3a3050',skin:'#e8c8a8',hair:'#d8d8e8',helm:'#7a7290',cape:'#2a2240'},persona:'Kühle, unerschütterliche Wächterin von Nebelwacht, dem letzten Außenposten am Rand der Nebellande. Spricht knapp, kennt die Sucher und die Nebelzwerge, hasst Kaiser Valdrik, der den Nebel geweckt hat.',greet:['Der Nebel schläft nie. Wir auch nicht.','Halte deine Klinge bereit.','Nebelwacht steht – noch.']});

// v20: Anführer der neuen Königreiche
mkN({id:'sirka',name:'Häuptlingin Sirka',short:'Sirka',lord:1,abs:1,tx:TP('fell',5,-5).x,ty:TP('fell',5,-5).y,look:{body:'#5a2a1a',skin:'#f0d0b0',hair:'#c8692a',cape:'#3a5a2a'},persona:'Häuptlingin des Fellvolks in Rotfellhain, eine Fuchsfrau mit rotem Haar, Fuchsohren und buschigem Schweif. Klug, misstrauisch gegenüber Menschen, aber ehrenhaft. Das Fellvolk riecht den Aschenfluch und meidet deshalb die Menschenstädte. Die Schwarze Legion jagt ihre Jungen.',greet:['Deine Nase ist schlecht, Mensch, aber dein Herz scheint gut.','Das Fellvolk vergisst nie – weder Freund noch Feind.','Rotfellhain steht.']});
mkN({id:'svanhild',name:'Walküre Svanhild',short:'Svanhild',lord:1,abs:1,tx:TP('schild',5,-5).x,ty:TP('schild',5,-5).y,look:{body:'#d8dce8',skin:'#f4dcc4',hair:'#f0e0a0',helm:'#c8ccd2',cape:'#6a7aa8'},persona:'Anführerin der Walküren auf dem Schildhorst. Sie hat den Spieler einst am Aschenpass zurückgeschickt, weil sein Werk unvollendet war. Spricht feierlich, wählt die Gefallenen für Valhalla. Walküren dürfen keine Burg der Lebenden betreten.',greet:['Valhalla wartet, Ritter. Noch nicht.','Wir sehen alles, was unter dem Himmel geschieht.','Dein Werk ist noch nicht vollendet.']});
{const SP={sirka:['fox','#c8692a'],ruko:['fox','#b8602a'],mauz:['cat','#d9a060'],wuffel:['dog','#8a6a4a'],nala:['cat','#7a7a80'],tiko:['fox','#d07a32'],wache_fell:['wolf','#8a8a90']};
 for(const n of NPCS){const sp=SP[n.id];if(sp){n.look.ears=sp[0];n.look.tail=sp[0];n.look.fur=sp[1];n.look.hair=sp[1];n.look.skin=sp[0]==='wolf'||sp[0]==='dog'?'#e0b890':'#f0d0b0';n.look.beard=null;n.look.hat=null;n.folk=1;if(n.id==='wache_fell'){n.look.helm=null;n.look.body='#4a3a2a';}}
  if(['svanhild','brynja','eira','wache_schild'].indexOf(n.id)>=0){n.look.wings='#f4f2ec';n.look.helm=n.look.helm||'#c8ccd2';n.look.dress=0;n.look.cape=n.look.cape||'#6a7aa8';}}}
mkN({id:'odo',name:'Händler Odo',short:'Odo',abs:1,tx:TP('nebel',7,4).x,ty:TP('nebel',7,4).y,look:{body:'#4a4060',skin:'#d8b890',hair:'#6a5a4a',beard:'#6a5a4a',hat:'#3a3048'},persona:'Zwielichtiger, aber ehrlicher Händler in Nebelwacht. Verkauft Tränke und kauft Nebelbeute zu guten Preisen.',greet:['Große Tränke, frisch aus dem Kessel!','Was der Nebel ausspuckt, kaufe ich.']});
SHOPS.odo={n:'Odos Nebelladen',items:['potion2','potion','mpotion','bread','arrow','bolt']};
const ANG=BUILD.find(b=>b.id==='angler');
mkN({id:'fiete',name:'Angler Fiete',short:'Fiete',abs:1,tx:ANG.x+6,ty:ANG.y+7,look:{body:'#3a4a5a',skin:'#d9a878',hair:'#9a9a8a',beard:'#9a9a8a',hat:'#4a5a3a'},persona:'Einsamer, wortkarger alter Angler, der an seinem Weiher in den Wiesen westlich von Eichenhain lebt. Redet gern über Fische, Köder und Katzen. Misstraut Städtern. Er ist der Einzige außerhalb der Mauern, den der Aschenfluch verschont: Fließendes Wasser wäscht den Fluch ab, und er lebt seit Jahren am Bach.',greet:['Psst. Du verscheuchst die Fische.','Heute beißen sie …','Der Fluch? Der kommt nicht übers Wasser. Die Fische und ich, wir haben unsere Ruhe.','Mein Weiher wird vom Bach gespeist. Fließendes Wasser – da hat der Aschenfluch nichts zu melden.']});
JOBS.holger=[['door:h7','saw',[6,10]],['home','idle',[3,5]],['door:h7','saw',[5,8]]];JOBS.fiete=[['home','fish',[12,20]],['door:angler','idle',[3,5]]];
SHOPS.fiete={n:'Fietes Angelkram',items:['bread','potion','arrow']};
const killsOf=s=>{let n=0;for(const k in P.kills||{})if(k.indexOf(s)>=0)n+=P.kills[k];return n;};
// Außentruhen
const OCH=[{id:'tut',tx:VCX+56,ty:VCY+6,loot:'small'},{id:'can1',tx:458,ty:918,loot:'canyon'},{id:'can2',tx:654,ty:944,loot:'canyon'},{id:'bait',tx:722,ty:948,loot:'bait'},{id:'summit',tx:G.SUMMIT.x+2,ty:G.SUMMIT.y-1,loot:'summit'},{id:'abbeyring',tx:HERALDRING()[0][0]-5,ty:HERALDRING()[0][1]+2,loot:'canyon'},{id:'pyrring',tx:HERALDRING()[1][0]+6,ty:HERALDRING()[1][1]+4,loot:'canyon'}];
for(const c of OCH){const t=tileAt(c.tx,c.ty);if(t!==T.LEDGE&&SOLIDS[t])map[c.ty*W+c.tx]=T.DIRT;}G.OCH=OCH;
function openOCH(c){P.och=P.och||{};if(P.och[c.id])return;P.och[c.id]=1;sfx('chest');const L=Math.max(P.level,zoneLevel(c.tx,c.ty)),D=G.D();const gold=n=>{P.gold+=n;G.floats.push({x:P.x,y:P.y-40,t:`+${n} Gold`,c:'#ffd54a',life:1});G.invDirty=true;};
 if(c.loot==='small'){gold(30);give(mkStack('potion',1));give(mkStack('arrow',20));G.tip('🦘 Gut gesprungen! Mit '+(G.ui&&G.ui.isPc&&G.ui.isPc()?'der Leertaste':'dem ⤒-Knopf')+' kommst du auf Felsstufen.','jump');G.toast('💰 Versteck gefunden!','#ffe0a0');}
 else if(c.loot==='bait'){gold(30);P.q.anglerBait=1;G.toast('🎣 Fietes goldener Köder! Bring ihn zum Angler am Weiher westlich von Eichenhain.','#ffd54a',true);sfx('quest');}
 else if(c.loot==='secret'){gold(rint(L*8,L*16));const rar=Math.max(3,rollRar(D.M+.5));give(lootItem(pick(ALLK),L+D.ilvl+2,rar,{src:'Geheimes Versteck'}));if(Math.random()<.5)give(mkStack('potion2',1));sfx('rare');G.toast('🗝 Ein geheimes Versteck! Erkunden lohnt sich.','#ffd54a',true);}
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
  if(inR&&G.room===HR&&G.dayInfo().night&&G.homeBed&&G.homeBed()&&G.FDECO[G.homeBed().i].sh==='bedk'){const b=G.homeFoot('bed');if(b.length){c.x=(b[1][0]+.5)*TILE;c.y=(b[0][1]+.7)*TILE;c.moving=false;c.lie=1;return;}}c.lie=0;
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
{const DLV={hut:6,wolfden:8,cellar:10,banditcave:12,wtower:15,grotto:18,dwarf:28,mistgate:38};for(const r of ROOMS)if(r.dungeon&&DLV[r.id])r.lvl=DLV[r.id];}
for(const r of ROOMS){if(r.dungeon||r.player||r.kind==='barn')continue;let beds=0;for(let y=r.y0;y<r.y0+r.h;y++)for(let x=r.x0;x<r.x0+r.w;x++)if(tileAt(x,y)===T.BED)beds++;if(beds)continue;const want=r.b&&(r.b.id==='tavern'||r.b.id==='jarl')?3:r.b&&r.b.kind==='keep'?1:1;let placed=0;const fl=t=>t===T.WOOD||t===T.STONEF;
 for(let k=0;k<r.w&&placed<want;k++){const x=k%2?r.x0+r.w-1-Math.floor(k/2):r.x0+Math.floor(k/2);if(Math.abs(x-r.door.tx)<1)continue;const y=r.y0+r.h-2;if(fl(tileAt(x,y))&&fl(tileAt(x,y+1))&&tileAt(x,y+2)!==T.DOOR){map[y*W+x]=T.BED;map[(y+1)*W+x]=T.BED;placed++;}}}
const TAVS=BUILD.filter(b=>b.room&&(b.id==='tavern'||b.id==='jarl'||/taverne|schenke|gasthaus/i.test(b.name||'')));
function houseOf(n){if(n._house!==undefined)return n._house;if(n.id==='konrad'||n.id==='otto'){n._house=BUILD.find(b=>b.id==='guard')||null;if(n._house)return n._house;}let best=null,bd=12;const hx=n.hx/TILE,hy=n.hy/TILE;for(const b of BUILD){if(!b.room||b.kind==='barn'||b.wild&&b.id!=='angler'||b.player||b.kind==='chapel'&&n.id!=='anselm'||b.kind==='keep'&&!(n.id==='aldric'))continue;const d=Math.hypot(b.door.tx-hx,b.y+b.h-hy);if(d<bd){bd=d;best=b;}}if(n.id==='aldric')best=BUILD.find(b=>b.id==='keep');if(n.id==='anselm')best=BUILD.find(b=>b.id==='chapel')||best;n._house=best;return best;}
function tavOf(n){let best=null,bd=70;for(const b of TAVS){const d=Math.hypot(b.door.tx-n.hx/TILE,b.door.ty-n.hy/TILE);if(d<bd){bd=d;best=b;}}return best;}
const ROLE={hilda:['anvil','hammer'],bernd:['hearth','knead'],mara:['shelf','brew'],anselm:['altar','pray'],durin:['anvil','hammer'],holger:['table','saw'],aldric:['throne','sit'],samira:['throne','sit'],liv:['table','eat'],aldwin:['table','eat'],jarl:['throne','sit']};
const FT={bed:T.BED,table:T.TABLE,hearth:T.HEARTH,shelf:T.SHELF,altar:T.ALTAR,anvil:T.ANVIL,throne:T.THRONE,pew:T.PEW};
function phase(t){return t>=505||t<22?'sleep':t<75?'morning':t<370?'work':t<465?'social':'home';}
function want(n,t,dayO){const ph=phase(t),h=houseOf(n);if(n.id==='elara')return null;const day=dayO!=null?dayO:Math.floor(((P&&P.dayT)||0)/DAYLEN),r=h2(n.id.length*31+n.id.charCodeAt(0),day,991),wd=day%7;
 {const J=G.jobNow&&G.jobNow(n,t,wd);if(J)return J;if(h&&G.weekWant){const ww=G.weekWant(n,t,ph,h,r,wd);if(ww)return ww;}}
 if(n.id==='otto'||n.id==='berta'&&false)return ph==='sleep'&&t>=600?{b:h,spot:'bed',act:'sleep'}:null;
 if(ph==='work')return null;if(!h)return ph==='sleep'?null:null;
 if(ph==='sleep')return{b:h,spot:n.child&&false?'any':'bed',act:'sleep'};
 if(ph==='social'){const tv=tavOf(n);if(tv&&r<.5&&!n.lord&&n.id!=='aldric')return{b:tv,spot:'table',act:'drink'};if(r<.72)return null;}
 const ro=ROLE[n.id];if(ro&&(ph!=='social'||r<.86))return{b:ro[0]==='altar'&&n.id==='anselm'?BUILD.find(b=>b.id==='chapel'):h,spot:ro[0],act:ro[1]};
 return{b:h,spot:r<.5?'table':r<.75?'hearth':'any',act:r<.5?'eat':'warm'};}
function spotIn(r,kind,n){if(kind&&typeof kind==='object'){if(kind.bed){const s=G.nbBed(r,kind.x,kind.y+1);return{fx:kind.x,fy:kind.y,sx:s[0],sy:s[1]};}return{fx:kind.x,fy:kind.y+1,sx:kind.x,sy:kind.y};}const want=FT[kind];const c=[];for(let y=r.y0;y<r.y0+r.h;y++)for(let x=r.x0;x<r.x0+r.w;x++){const t=tileAt(x,y);if(want!=null&&t!==want)continue;if(want==null){if(!SOLIDS[t]&&t!==T.DOOR)c.push({fx:x,fy:y,sx:x,sy:y});continue;}for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const ax=x+dx,ay=y+dy;if(ax<r.x0||ay<r.y0||ax>=r.x0+r.w||ay>=r.y0+r.h)continue;const at=tileAt(ax,ay);if(!SOLIDS[at]&&at!==T.DOOR)c.push({fx:x,fy:y,sx:ax,sy:ay});}}
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
function jail(why){G.reviveNPCs();const fine=Math.floor(P.gold*.25)+Math.min(Math.floor(P.gold*.75),Math.round((P.bounty||0)*.5));P.gold-=fine;const took=G.jailTake();P.guardKill=null;{const st=P.stats||(P.stats={});st.jail=(st.jail||0)+1;st.bountyPaid=(st.bountyPaid||0)+fine;}P.bounty=0;P.guardHostile=0;P.dayT+=720;if(G.room){G.room=null;}P.x=SPAWN.x;P.y=SPAWN.y;P.prevX=null;G.mons.length=0;P.hp=Math.max(P.hp,Math.round((G.S||calc()).maxhp*.5));for(const n of NPCS)if(isGuard(n)){n.ghp=0;}G.toast(`⛓ ${why||''}Du hast einen Tag im Kerker verbracht${fine?` und ${fine} Gold Strafe gezahlt`:''}. Das Kopfgeld ist erlassen.`,'#ffcc80',true);if(took.length)setTimeout(()=>G.toast(`👮 Die Wachen haben dir abgenommen: ${took.join(', ')}`,'#ff8a80',true),1200);G.save();}
G.jail=jail;
// Wirt in der Taverne
{const tv=ROOMS.find(r=>r.b&&r.b.id==='tavern');if(tv&&!NPCS.find(n=>n.id==='wirt')){let bx=0,by=0;for(const [rx,ry] of [[6,1],[6,0],[6,2],[7,1],[0,1],[0,2]]){const x=tv.x0+rx,y=tv.y0+ry;if(walkTile(x,y)&&!SOLIDS[tileAt(x,y)]){bx=x;by=y;break;}}
 if(bx)NPCS.push({id:'wirt',name:'Wirt Bodo',short:'Bodo',abs:1,tx:bx,ty:by,post:tv,look:{body:'#8a6a3a',skin:'#f0c8a0',hair:'#5a3a1a',beard:'#5a3a1a'},persona:'Gemütlicher, dicker Wirt der Taverne „Zum Krummen Krug“ in Eichenhain. Zapft Bier und Met, kennt jeden Tratsch im Dorf, lacht laut und warnt Gäste augenzwinkernd, nicht zu viel zu trinken.',greet:['Willkommen im Krummen Krug! Ein frisches Bier?','Na, durstig? Mein Bier ist das beste im ganzen Tal!','Pass auf, nach dem zehnten Krug hat noch keiner den Heimweg gefunden!'],hx:(bx+.5)*TILE,hy:(by+.5)*TILE,x:(bx+.5)*TILE,y:(by+.5)*TILE,fx:0,fy:1,wt:0,vx:0,vy:0,anim:0,loc:tv});}}
// Burgwache: steht immer in der Burg
{const keep=ROOMS.find(r=>r.id==='keep');if(keep&&!NPCS.find(n=>n.id==='wache_burg')){let bx=keep.x0+Math.floor(keep.w/2),by=keep.y0+Math.floor(keep.h/2),bd=1e9;const cx=keep.chests.length?keep.chests.reduce((a,c)=>a+c.tx,0)/keep.chests.length:bx,cy=keep.chests.length?keep.chests.reduce((a,c)=>a+c.ty,0)/keep.chests.length:by;const tx0=(cx+keep.door.tx)/2,ty0=(cy+keep.door.ty)/2;for(let y=keep.y0+1;y<keep.y0+keep.h-1;y++)for(let x=keep.x0+1;x<keep.x0+keep.w-1;x++){if(!walkTile(x,y)||SOLIDS[tileAt(x,y)])continue;if(x===keep.door.tx&&Math.abs(y-keep.door.ty)<2)continue;const d=Math.hypot(x-tx0,y-ty0);if(d<bd){bd=d;bx=x;by=y;}}
 NPCS.push({id:'wache_burg',name:'Burgwache Bertram',short:'Bertram',abs:1,tx:bx,ty:by,guard:1,lord:1,post:keep,look:{body:'#7a1b1b',skin:'#e8c0a0',helm:'#b0b6bc'},persona:'Burgwache in der Burg von Eichenhain. Pflichtbewusst, misstrauisch, lässt niemanden aus den Augen. Bewacht die Schatztruhen des Fürsten.',greet:['Ich behalte dich im Auge, Fremder.','Finger weg von den Truhen des Fürsten!','Die Burg steht unter dem Schutz des Fürsten.'],hx:(bx+.5)*TILE,hy:(by+.5)*TILE,x:(bx+.5)*TILE,y:(by+.5)*TILE,fx:0,fy:1,wt:0,vx:0,vy:0,anim:0,loc:keep});GUARDS.add('wache_burg');}}
function addBounty(v,why){P.bounty=Math.round((P.bounty||0)+v);{const st=P.stats||(P.stats={});st.bountyTot=(st.bountyTot||0)+v;st.crimes=(st.crimes||0)+1;}G.toast(`🚨 ${why} Kopfgeld +${v} (gesamt ${P.bounty} Gold). Zahle es bei einer Wache.`,'#ff6b5a',true);sfx('horn');}
G.addBounty=addBounty;
function stealAt(t){const key=t.rid+':'+t.x+','+t.y;P.searched=P.searched||{};P.searched[key]=dayNo();sfx('pickup');
 const r=Math.random();let val=0;if(r<.42){const g=rint(2,12);P.gold+=g;val=g;G.floats.push({x:P.x,y:P.y-40,t:`+${g} Gold`,c:'#ffd54a',life:.9});}else if(r<.67){give(mkStack(pick(['bread','carrot','bread']),rint(1,2)));val=6;}else if(r<.77){give(mkStack('potion',1));val=15;}else if(r<.88){give(mkStack('arrow',rint(3,8)));val=6;}else{G.toast('Nichts Brauchbares gefunden.','#ccc');}
 const w=witnesses();if(w.length){const n=w[0];G.floats.push({x:n.x,y:n.y-46,t:'Dieb! Wachen!',c:'#ff5252',life:1.4});addBounty(20+val*2,`Diebstahl – ${n.short||n.name} hat dich gesehen!`);if(!isGuard(n))G.floats.push({x:n.x,y:n.y-60,t:'📣 Meldet es den Wachen!',c:'#ffcc80',life:1.6});}else if(val)G.toast('🤫 Niemand hat dich gesehen …','#b0bec5');G.save();}
function hitNPC(n,dmg){if(n.dead||n.ko>0)return;sfx('hit');if(isGuard(n)&&!hostile()){P.guardHostile=1;addBounty(80,`Angriff auf ${n.short||n.name}!`);n.ghp=0;return;}
 if(isGuard(n)&&hostile()){const gl=guardLvl(),mx=60+gl*22;if(!(n.ghp>0))n.ghp=mx;const d=Math.max(1,Math.round(dmg*rnd(.85,1.15)));n.ghp-=d;n.hitFlash=.15;if(G.settings.dmgNums)G.floats.push({x:n.x+rnd(-6,6),y:n.y-44,t:`${d}`,c:'#fff',life:.8});P.bounty+=5;if(n.ghp<=0){n.ghp=0;G.guardDown(n);addBounty(150,`${n.short||n.name} getötet!`);G.toast(`☠ ${n.short||n.name} ist tot. Das Kopfgeld kannst du erst morgen früh bei einer anderen Wache begleichen.`,'#ffcc80',true);}return;}
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
function guardDialog(n){const b=P.bounty,B=(l,f,c)=>({l,f,c}),st=wanted();if(G.bountyBlocked())return{t:`Du hast heute eine Wache getötet! Mit dir verhandle ich nicht – erst morgen früh kann das Kopfgeld (${b} Gold) beglichen werden. Bis dahin: Ergib dich oder flieh!`,b:[B('⛓ Ergeben (Kerker)',()=>jail(''),1),B('🏃 Fliehen',()=>{P.guardCd=G.time+12;P.guardHostile=1;},1)]};return{t:`Halt, im Namen des Gesetzes! Auf deinen Kopf sind ${b} Gold ausgesetzt (Fahndungsstufe ${'★'.repeat(st)}). Bezahl, oder du wanderst in den Kerker.`,b:[
 B(`⚖ Kopfgeld bezahlen (${b} Gold)`,()=>{if(P.gold<b){G.toast(`Du hast nur ${P.gold} Gold.`,'#ff8a80');return;}P.gold-=b;{const st=P.stats||(P.stats={});st.bountyPaid=(st.bountyPaid||0)+b;}P.bounty=0;P.guardHostile=0;for(const q of NPCS)if(isGuard(q))q.ghp=0;sfx('coin');G.toast('⚖ Kopfgeld bezahlt. Du bist wieder ein freier Bürger.','#a5d6a7',true);},1),
 B('⛓ Ins Gefängnis (Kopfgeld wird erlassen)',()=>jail(''),1),
 B('🏃 Fliehen',()=>{P.guardCd=G.time+12;P.bounty+=10;P.guardHostile=1;G.toast('🏃 Widerstand! Die Wachen greifen dich jetzt an.','#ff8a80');},1)]};}
// Ziel-Erweiterung: Truhen, Gipfel, Bett, Katzen
G.extraTarget=(best,bd)=>{if(G.room){if(G.room===HR&&hasHammerHeld()){const f=furnAt();if(f)return f;return{k:'furnbox'};}if(G.room===HR&&!hasHammerHeld()){for(const [x,y] of G.homeFoot('bed')){const d=Math.hypot((x+.5)*TILE-P.x,(y+.5)*TILE-P.y);if(d<Math.min(bd,50)){bd=d;best={k:'bed',x,y};}}}
  {const r=G.room;if(r.guest&&G.rentedHere()){for(let y=r.guest[1];y<=r.guest[3];y++)for(let x=r.guest[0];x<=r.guest[2];x++){if(tileAt(x,y)!==T.BED)continue;const d=Math.hypot((x+.5)*TILE-P.x,(y+.5)*TILE-P.y);if(d<Math.min(bd,50)){bd=d;best={k:'bed',x,y};}}}
   if(r.roul){const x=r.roul.x+1.5,y=r.roul.y+1;const d=Math.hypot(x*TILE-P.x,y*TILE-P.y);if(d<Math.min(bd,70)){bd=d;best={k:'roul',x:x-.5,y:y-.5};}}
   if(r.id==='casino'){const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE);for(let yy=pty-1;yy<=pty+1;yy++)for(let xx=ptx-1;xx<=ptx+1;xx++){if(tileAt(xx,yy)!==T.SLOTM)continue;const d=Math.hypot((xx+.5)*TILE-P.x,(yy+.5)*TILE-P.y);if(d<Math.min(bd,46)){bd=d;best={k:'slot',x:xx,y:yy};}}}
   if(r.show){for(const s0 of r.show){const x=r.x0+s0[0]+.5,y=r.y0+s0[1]+.5;const d=Math.hypot(x*TILE-P.x,y*TILE-P.y);if(d<Math.min(bd,62)){bd=d;best={k:'show',x:x-.5,y:y-.5};}}}}
  for(const n of NPCS){if(n.loc!==G.room||n.dead)continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<Math.min(bd,52)){bd=d;best={k:'npc',n};}}
  {const r=G.room;if(r&&!r.player&&!r.dungeon&&r.b&&r.kind!=='stall'){const ptx=Math.floor(P.x/TILE),pty=Math.floor(P.y/TILE),dn=dayNo();for(let yy=pty-1;yy<=pty+1;yy++)for(let xx=ptx-1;xx<=ptx+1;xx++){if(!STEALT.has(tileAt(xx,yy)))continue;if(P.searched&&P.searched[r.id+':'+xx+','+yy]===dn)continue;const d=Math.hypot((xx+.5)*TILE-P.x,(yy+.5)*TILE-P.y);if(d<Math.min(bd,44)){bd=d;best={k:'steal',rid:r.id,x:xx,y:yy};}}}}for(const h of G.HORSES||[]){if(h.room!==G.room)continue;const d=Math.hypot(h.x+h.fx*28-P.x,h.y+h.fy*28-P.y);if(d<Math.min(bd,46)){bd=d;best={k:'horse',h};}}if(G.PET&&G.PET.room===G.room){}return best;}
 if(hasHammerHeld()&&G.townIdAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE)))return{k:'vdeco'};
 for(const c of OCH){if(P.och&&P.och[c.id])continue;const d=Math.hypot((c.tx+.5)*TILE-P.x,(c.ty+.5)*TILE-P.y);if(d<Math.min(bd,48)){bd=d;best={k:'och',c};}}
 {const d=Math.hypot((G.SUMMIT.x+.5)*TILE-P.x,(G.SUMMIT.y+.5)*TILE-P.y);if(d<Math.min(bd,60)){bd=d;best={k:'frost'};}}
 for(const c of G.CATS||[]){const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<Math.min(bd,44)){bd=d;best={k:'cat',c};}}for(const h of G.HORSES||[]){if(h.room)continue;const d=Math.hypot(h.x+h.fx*20-P.x,h.y+h.fy*20-P.y);if(d<Math.min(bd,52)){bd=d;best={k:'horse',h};}}return best;};
G.extraAct=t=>{if(t.k==='roul'){G.ui&&G.ui.openCasino('roulette');return true;}if(t.k==='vdeco'){G.ui&&G.ui.openBuild('town');return true;}if(t.k==='slot'){G.ui&&G.ui.openCasino('slots');return true;}if(t.k==='show'){G.ui&&G.ui.openShowcase();return true;}if(t.k==='steal'){stealAt(t);return true;}if(t.k==='furnbox'){G.ui&&G.ui.openFurnBox&&G.ui.openFurnBox();return true;}if(t.k==='bed'){sleep();return true;}if(t.k==='och'){openOCH(t.c);return true;}if(t.k==='frost'){takeFrost();return true;}if(t.k==='cat'){feedCat(t.c);return true;}if(t.k==='horse'){feedHorse(t.h);return true;}return false;};
G.extraPos=t=>t.k==='roul'?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:t.k==='vdeco'?{x:P.x,y:P.y}:t.k==='slot'||t.k==='show'||(t.k==='bed'&&t.x!=null)?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:t.k==='steal'?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:t.k==='furnbox'?{x:P.x,y:P.y}:t.k==='furnpick'?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:t.k==='och'?{x:(t.c.tx+.5)*TILE,y:(t.c.ty+.5)*TILE}:t.k==='frost'?{x:(G.SUMMIT.x+.5)*TILE,y:(G.SUMMIT.y+.5)*TILE}:t.k==='cat'?{x:t.c.x,y:t.c.y}:t.k==='horse'?{x:t.h.x+t.h.fx*20,y:t.h.y+t.h.fy*20}:t.k==='bed'?(()=>{const b=G.homeFoot('bed')[0];return{x:(b[0]+.5)*TILE,y:(b[1]+.5)*TILE};})():null;
G.extraLabel=t=>t.k==='roul'?['🎡','Roulette']:t.k==='vdeco'?['🏡','Dorf dekorieren']:t.k==='slot'?['🎰','Spielautomat']:t.k==='show'?['🪟','Schaufenster']:t.k==='steal'?['🖐','Stehlen']:t.k==='furnbox'?['📦','Möbellager']:t.k==='horse'?(countItem('carrot')>0&&(!P.mount||G.HORSES.indexOf(t.h)===P.mount.idx)?['🥕','Füttern']:['🐴','Streicheln']):t.k==='bed'?['🛏','Schlafen']:t.k==='och'?['🧰','Öffnen']:t.k==='frost'?['❄','Frostherz']:t.k==='cat'?(['trout','carp','salmon','pike','cfish','goldfish'].some(id=>countItem(id)>0)?['🐟','Füttern']:['🐱','Streicheln']):null;
// Dialoge
// ===== v21: Abenteurergilde – Aufträge rotieren alle 3 Tage und skalieren mit der Spielerstufe =====
const GTYPES=['rabbit','boar','fox','wolf','slime','spider','goblin','bandit','skeleton','ghoul','bear','centaur','orc','zombie','wasp','jackal','scorpion','icewolf','draugr','imp','salamander','troll','wraith','minotaur','golem','harpy','mummy','frostgiant','vampire','reaper','sucher','nebelgarde','legion','blackknight','shadowhound','banshee'];
function mkContract(){const L=P.level;const fit=GTYPES.filter(k=>MT[k]&&MT[k].lv&&MT[k].lv[0]<=L+2&&MT[k].lv[1]>=L-3);const pool=fit.length?fit:['wolf','boar'];const k=pick(pool),mn=MT[k].n,r=Math.random();
 const gold=Math.round((40+L*16)*G.D().gold),xp=Math.round(xpNeed(L)*.3),it=Math.random()<.4;
 if(L>=8&&r<.2)return{k:'boss',n:1,t:'Erschlage einen Boss oder Dungeon-Boss',gold:gold*2,xp:xp*2,it:1};
 if(r<.5&&STACK['m_'+k])return{k:'trophy',id:'m_'+k,n:L<10?1:2,t:`Bring ${L<10?'eine Trophäe':'zwei Trophäen'}: ${STACK['m_'+k].name} (${mn})`,gold:Math.round(gold*1.2),xp,it};
 const n=Math.round(6+L*.35);return{k:'kill',type:k,n,t:`Erlege ${n}× ${mn}`,gold,xp,it};}
function guildState(){const cyc=Math.floor(Math.floor(P.dayT/DAYLEN)/3);if(!P.guild||P.guild.cyc!==cyc)P.guild={cyc,acc:0,done:0,base:0,ct:mkContract()};return P.guild;}
const guildBase=c=>c.k==='kill'?killsOf(c.type):c.k==='boss'?(P.bossK||0):0;
const guildProg=g=>{const c=g.ct;if(!g.acc)return 0;return c.k==='kill'?killsOf(c.type)-g.base:c.k==='boss'?(P.bossK||0)-g.base:countItem(c.id);};
G.guildState=guildState;G.guildProg=guildProg;
G.extraDialog=n=>{const q=P.q,B=(l,f,c)=>({l,f,c});
 if(isGuard(n)&&P.bounty>0)return guardDialog(n);
 if(n.id==='isolde'){{const md=mainDialog(n);if(md)return md;}const g=guildState(),c=g.ct,L=P.level;const prog=guildProg(g),left=3-(Math.floor(P.dayT/DAYLEN)%3);
  if(g.done)return{t:`Auftrag erledigt – gute Arbeit. Der nächste Aushang kommt in ${left} ${left===1?'Tag':'Tagen'}. Bis dahin kaufe ich dir gern Jagdbeute ab: Felle, Hauer, Hasenpfoten – alles, was Monster so fallen lassen.`,b:[]};
  if(!g.acc)return{t:`📋 Aushang der Gilde (gilt noch ${left} ${left===1?'Tag':'Tage'}): „${c.t}“ – Belohnung: ${c.gold} Gold und Erfahrung${c.it?' + Ausrüstung':''}.`,b:[B('Auftrag annehmen',()=>{g.acc=1;g.base=guildBase(c);QT('Gildenauftrag: '+c.t);},1)]};
  if(prog>=c.n)return{t:`Ausgezeichnet! „${c.t}“ – erledigt. Hier ist dein Lohn.`,b:[B('Belohnung',()=>{if(c.k==='trophy')removeItem(c.id,c.n);g.done=1;P.gold+=c.gold;gainXP(c.xp);if(c.it)give(genItem(pick(['ring','amulet','boots','gloves','helm']),Math.max(2,L),2));P.guildN=(P.guildN||0)+1;DONE('Gildenauftrag: '+c.t);},1)]};
  return{t:`„${c.t}“ – Fortschritt: ${Math.min(prog,c.n)}/${c.n}. Der Aushang gilt noch ${left} ${left===1?'Tag':'Tage'}.`,b:[]};}
 if(n.id==='edwin'){{const md=mainDialog(n);if(md)return md;}const lv=P.mapR||0;return{t:`Willkommen in meiner Kartenstube. Ich verkaufe Ortsmarker für alle Städte und verbessere deine Karte, damit du beim Erkunden mehr siehst.${lv>=3?' Deine Karte ist so gut, wie Karten nur sein können.':''} Und wenn du alte oder beschädigte Karten findest – bring sie mir, ich entziffere sie.`,b:[]};}
 if(n.id==='linde'){const st=curStep();if(st&&st.id==='vorrat'&&P.macc&&!P.q.lindeKit){return{t:'Aldric schickt dich? Dann bekommst du das hier umsonst: eine Harke, eine Gießkanne und Weizensaat. So geht’s: Mit der Harke den Boden nahe am Wasser lockern (höchstens 3 Felder entfernt), dann säen und mit der Gießkanne gießen. Die Ackerfelder im Dorf sind schon gelockert und bewässert – da reicht säen.',b:[B('Danke, Linde!',()=>{P.q.lindeKit=1;give(mkStack('harke',1));give(mkStack('kanne',1));give(mkStack('seed',6));},1)]};}
  return{t:'Lebensmittel: Boden mit der Harke lockern, max. 3 Felder vom Wasser entfernt säen, dann gießen – ein Guss hält einen Tag. Blumen wachsen überall ohne Gießen, Setzlinge werden in zwei Tagen zu Bäumen – auch draußen vor den Mauern, nur nicht auf Wasser, Lava oder Wegen. Bei der Ernte springt manchmal Saat zurück.',b:[]};}
 if(n.id==='liv'){const st=curStep();if(st&&st.id==='forst'&&P.macc&&!P.q.livAxe&&countItem('holz')<10&&countItem('axt')<1)return{t:'Holz für die Palisade? Endlich jemand, der anpackt! Hier, nimm meine alte Axt. Drei, vier Schläge, dann fällt ein Baum. Und keine Sorge – gefällte Bäume wachsen bei uns nach ein paar Tagen nach.',b:[B('Axt nehmen',()=>{P.q.livAxe=1;give(mkStack('axt',1));},1)]};}
 if(n.id==='matthes'){const L=P.level,need=6;
  if(!q.stall){if(L<3)return{t:`Die Wölfe werden frech … Komm wieder, wenn du Stufe 3 bist. Dann hätte ich Arbeit für dich.`,b:[]};return{t:'Seit dem Fluch kommen die Wölfe bis an die Koppel und reißen mir die Schafe. Erschlag sechs von ihnen, dann sorge ich dafür, dass Greta dir Karotten verkauft – die besten Freunde eines Pferdes.',b:[B('Ich jage die Wölfe',()=>{q.stall='active';q.stallW0=killsOf('wolf');QT('Wölfe an der Koppel');},1)]};}
  if(q.stall==='active'){const k=killsOf('wolf')-(q.stallW0||0);if(k>=need)return{t:'Ha! Meine Schafe sind wieder sicher. Ab heute verkauft Greta dir Karotten. Und hier, drei zum Anfangen: Gib einem Pferd drei Karotten, dann vertraut es dir. Komm dann wieder – ein Pferd ohne Sattel ist nur ein großer Hund.',b:[B('Belohnung nehmen',()=>{q.stall='done';P.carrotOK=1;give(mkStack('carrot',3));P.gold+=Math.round(40*G.D().gold);gainXP(Math.round(xpNeed(P.level)*.25));DONE('Wölfe an der Koppel');G.toast('🥕 Karotten sind jetzt bei Händlerin Greta erhältlich.','#ffd54a',true);},1)]};return{t:`${Math.max(0,k)}/${need} Wölfe erschlagen. Sie streunen in den Wiesen rund ums Dorf.`,b:[]};}
  if(!P.mount)return{t:'Such dir ein Pferd aus – in der Koppel oder im Stall. Drei Karotten, und es folgt dir überallhin.',b:[]};
  if(!P.mount.saddle)return{t:`${P.mount.name}? Ein prächtiges Tier! Hier, nimm diesen Sattel. Damit kannst du reiten – schneller als zu Fuß, und du kannst vom Pferd aus kämpfen. Aber pass auf: Was dich trifft, trifft auch dein Pferd. Fällt es, pflege ich es im Stall – erst nach einer Nacht, in der du wirklich geschlafen hast, ist es wieder bei Kräften.`,b:[B('Sattel nehmen',()=>{P.mount.saddle=1;sfx('quest');DONE('Ein eigenes Pferd');G.toast('🐎 Sattel erhalten! Auf- und Absitzen: Taste R (PC) oder 🐴-Knopf (Handy).','#ffd54a',true);G.save();},1)]};
  if(P.mount.dead)return{t:`${P.mount.name} liegt hier im Stroh und schnauft. Ich hab die Wunden versorgt. Schlaf dich aus – morgen früh steht es wieder.`,b:[]};
  return{t:`${P.mount.name} sieht gut aus${P.mount.armor?' in der '+P.mount.armor.name:''}. Pferderüstung findest du bei Zentauren in den Wiesen und Wäldern – je stärker der Zentaur, desto besser die Rüstung. Und Karotten heilen dein Pferd unterwegs.`,b:[]};}
 if(n.id==='holger')return{t:`Na, ${P.level>=10?'Held':'Neuling'}? Dein Haus ist ${comfort()<6?'ja noch ziemlich leer':comfort()<15?'schon recht gemütlich':'richtig prächtig'} (Gemütlichkeit ${comfort()}). Jedes Stück baue ich einzeln – stell so viele auf, wie du magst. Mein Laden im Handwerkshof hat ${G.shopHoursTxt('holger')} geöffnet.`,b:[]};
 if(n.id==='fiete'){if(n.lie)return{t:'Zzz … hm? Die Fische schlafen auch, Junge. Komm morgen wieder.',b:[]};
  if(!q.angler)return{t:'Psst! Du verscheuchst die Fische. … Na gut, wo du schon da bist: Meine Angelschnur ist gerissen, und die beste Schnur macht man aus Spinnenseide. Erlege 6 Spinnen, dann knüpfe ich mir eine neue.',b:[B('Ich jage Spinnen für dich',()=>{q.angler='spiders';q.anglerK=killsOf('spider');G.toast('📜 Nebenquest: Fietes Angelschnur (6 Spinnen)','#ffd54a',true);},1)]};
  if(q.angler==='spiders'){const k=killsOf('spider')-q.anglerK;if(k<6)return{t:`${k} von 6 Spinnen. Die fetten sitzen im Finsterwald und in der Spinnenhöhle.`,b:[]};return{t:'Prächtige Seide! Jetzt fehlt nur mein goldener Köder. Der ist mir in die Schlucht im Süden gefallen, als ich übers Geröll gestiegen bin. Runter kommst du nur über die Kletterwände an den Schluchträndern, behalte deine Ausdauer im Auge!',b:[B('Ich hole den Köder',()=>{q.angler='bait';G.toast('📜 Fietes goldener Köder (Schlucht, klettern!)','#ffd54a',true);},1)]};}
  if(q.angler==='bait'){if(!q.anglerBait)return{t:'Der Köder liegt in der Schlucht, ganz im Osten, in einer alten Truhe. Kletterwände erkennst du an den Ranken und Seilen.',b:[]};return{t:'Mein Glücksköder! Hier, nimm meine zweite Angelrute. Wähle sie aus, schau aufs Wasser und wirf mit ⚔ aus. Wenn der Schwimmer zuckt, sofort einholen! Und noch was: Die Streunerkatzen in Eichenhain würden für Fisch alles tun. Ein paar Fische, und eine bleibt bei dir.',b:[B('Danke, Fiete!',()=>{q.angler='done';give(mkStack('rod',1));gainXP(Math.round(xpNeed(P.level)*.3));G.toast('🎣 Du hast eine ANGELRUTE!','#81d4fa',true);sfx('quest');},1)]};}
  return{t:pick([`${q.fishN||0} Fische hast du schon rausgezogen. ${(q.fishN||0)>30?'Respekt!':'Weiter so.'}`,'Nachts beißen die großen Hechte.','In der Schlucht schwimmen Forellen, die es sonst nirgends gibt.','Goldfische bringen ein Vermögen beim Händler.']),b:[]};}
 if(n.lie)return{t:pick(['Zzz … *gähn* … Was ist denn? Es ist mitten in der Nacht!','Hm? … Komm morgen wieder, ich schlafe.','*schnarch* … oh! Du hast mich erschreckt.']),b:[],keep:1};
 return null;};
G.extraMark=n=>{const q=P.q;if(n.id==='isolde'){const mm=mainMark(n);if(mm)return mm;const g=guildState();return g.done?'':!g.acc?'!':guildProg(g)>=g.ct.n?'?':'';}if(n.id==='linde'){const st=curStep();return st&&st.id==='vorrat'&&P.macc&&!q.lindeKit?'!':'';}if(n.id==='liv'){const st=curStep();if(st&&st.id==='forst'&&P.macc&&!q.livAxe&&countItem('holz')<10&&countItem('axt')<1)return '!';}if(n.id==='matthes')return !q.stall?(P.level>=3?'!':'.'):q.stall==='active'&&killsOf('wolf')-(q.stallW0||0)>=6?'?':(P.mount&&!P.mount.saddle?'?':'');if(n.id==='fiete')return !q.angler?'!':q.angler==='spiders'&&killsOf('spider')-q.anglerK>=6?'?':q.angler==='bait'&&q.anglerBait?'?':'';if(n.id==='holger')return '';return null;};
// ===== v9: Pferde & Koppel =====
const PEN={x0:309,y0:316,x1:316,y1:320};{const sb=BUILD.find(b=>b.id==='stable');if(sb){PEN.x0=sb.x-1;PEN.x1=sb.x+sb.w+1;PEN.y0=sb.y+sb.h+1;PEN.y1=PEN.y0+4;}
 let ok=true;for(let y=PEN.y0;y<=PEN.y1;y++)for(let x=PEN.x0;x<=PEN.x1;x++){const t=tileAt(x,y);if(SOLIDS[t]&&t!==T.TREE||t===T.WATER||t===T.DOOR)ok=false;}
 if(ok){for(let y=PEN.y0;y<=PEN.y1;y++)for(let x=PEN.x0;x<=PEN.x1;x++){const ring=x===PEN.x0||x===PEN.x1||y===PEN.y0||y===PEN.y1;map[y*W+x]=ring?T.PFENCE:(h2(x,y,5)<.15?T.FLOWER:T.GRASS);}}else PEN.none=1;}
G.PEN=PEN;
// v21: Gärtnerin, Abenteurergilde, Kartograph – in bisher namenlose Häuser von Eichenhain
{const place=(bid,name,sign)=>{const b=BUILD.find(q=>q.id===bid);if(!b)return {x:VCX,y:VCY+3};b.name=name;b.sign=sign;let x=b.door?b.door.tx+1:b.x+b.w,y=b.y+b.h+1;for(let k=0;k<20&&!walkTile(x,y);k++){x=b.x+(k%(b.w+2))-1;y=b.y+b.h+1+Math.floor(k/(b.w+2));}return{x,y};};
 const pl=place('h9','Gärtnerei','🌻'),pg=place('h1','Abenteurergilde','⚔'),pk=place('h3','Kartenstube','🗺');
 mkN({id:'linde',name:'Gärtnerin Linde',short:'Linde',abs:1,tx:pl.x,ty:pl.y,look:{body:'#4a7a3a',skin:'#f0d0b0',hair:'#b86a2a',hat:'#c9a64a',dress:1},persona:'Gärtnerin von Eichenhain. Liebt Pflanzen, redet mit ihren Blumen, verkauft Saatgut, Setzlinge, Harken und Gießkannen. Erklärt geduldig: Lebensmittel brauchen gelockerten Boden, Wasser in max. 3 Feldern Nähe und die Gießkanne; Blumen und Bäume wachsen fast überall.',greet:['Erde unter den Fingernägeln ist ein gutes Zeichen.','Gieß deine Beete, sonst wächst nichts!','Blumen sind die Freude, Gemüse das Brot.']});
 mkN({id:'isolde',name:'Gildenmeisterin Isolde',short:'Isolde',abs:1,tx:pg.x,ty:pg.y,look:{body:'#5a3a2a',skin:'#e8c4a0',hair:'#2a2a2a',cape:'#7a2a2a'},persona:'Meisterin der Abenteurergilde von Eichenhain, ehemalige Söldnerin mit Narbe über dem Auge. Vergibt Kopfgelder und Jagdaufträge, die alle drei Tage wechseln, und kauft Jagdbeute wie Wolfsfelle und Wildschweinhauer zu guten Preisen.',greet:['Neue Aufträge alle drei Tage. Wer zögert, verliert.','Bring mir Felle und Hauer – ich zahl besser als jeder Krämer.','Die Gilde vergisst keinen, der liefert.']});
 mkN({id:'edwin',name:'Kartograph Edwin',short:'Edwin',abs:1,tx:pk.x,ty:pk.y,look:{body:'#3a4a6a',skin:'#f0d8c0',hair:'#9a9a9a',beard:'#9a9a9a',hat:'#4a3a2a'},persona:'Alter, pedantischer Kartograph in der Kartenstube von Eichenhain. Kann alte und beschädigte Karten entziffern, verkauft Ortsmarker und verbessert Karten, damit man beim Erkunden mehr sieht. Liebt Tinte und Pergament.',greet:['Vorsicht, die Tinte ist noch feucht!','Eine Karte ist nur so gut wie der, der sie zeichnet.','Weißt du, wie viele Furten es in Eldmar gibt? Ich schon.']});}
// v20: Stallmeister Matthes – Schafe, Pferde, Karotten und Sättel
{let mx=PEN.none?VCX+20:PEN.x0-2,my=PEN.none?VCY+16:PEN.y0+2;for(let k=0;k<12&&!walkTile(mx,my);k++){mx--;}mkN({id:'matthes',name:'Stallmeister Matthes',short:'Matthes',abs:1,tx:mx,ty:my,look:{body:'#6a5a3a',skin:'#e0b890',hair:'#7a5a3a',beard:'#7a5a3a',hat:'#8a6a3a'},persona:'Stallmeister von Eichenhain. Kümmert sich um Pferde und Schafe, riecht nach Heu, redet mit seinen Tieren mehr als mit Menschen. Gibt Reitern Sättel und erklärt, wie man Pferde zähmt (drei Karotten) und reitet.',greet:['Ein Pferd ist ein Freund, kein Werkzeug.','Hast du Karotten dabei? Die Tiere riechen das.','Pass auf die Hufe auf.']});}
const HCOL=[['#7a4a26','#2a1a10'],['#2a2422','#141010'],['#d8d2c6','#efe9dc'],['#a0582a','#5a2a12'],['#8a7a6a','#3a3028']];
function spawnHorses(){G.HORSES=[];let ci=0;const mk=(x,y,fx,fy,room,pen)=>G.HORSES.push({x,y,fx,fy,c:HCOL[ci%5][0],mane:HCOL[ci++%5][1],room,pen,anim:Math.random()*9,moving:false,graze:Math.random()<.5?1:0,gt:0,wt:1+Math.random()*4,tx:x,ty:y,pat:0,hx0:x,hy0:y,hroom:room,hpen:pen,hfx:fx,hfy:fy});
 for(const r of ROOMS){if(r.kind!=='barn'||r.id==='barn')continue;const boxes=r.id==='stable'?[0,3,9]:[0,6];for(const bx of boxes)mk((r.x0+bx+1)*TILE,(r.y0+1.95)*TILE,0,-1,r,null);}
 if(!PEN.none)for(let i=0;i<2;i++)mk((PEN.x0+2+i*3)*TILE,(PEN.y0+2.5)*TILE,i?-1:1,0,null,PEN);}
function horseTick(h,dt){if(h.ridden){h.x=P.x;h.y=P.y;h.fx=P.fx;h.fy=P.fy;h.moving=P.moving;h.anim=P.anim||0;return;}h.anim+=dt*(h.moving?1:.3);if(h.pat>0)h.pat-=dt;h.gt-=dt;if(h.gt<=0){h.graze=h.room?(Math.random()<.6?1:0):(Math.random()<.7?1:0);h.gt=2+Math.random()*6;}
 if(!h.pen)return;if(h.moving){const dx=h.tx-h.x,dy=h.ty-h.y,d=Math.hypot(dx,dy),sp=24*dt;if(d<=sp){h.moving=false;h.wt=3+Math.random()*7;}else{h.x+=dx/d*sp;h.y+=dy/d*sp;const k=Math.min(1,dt*3);h.fx+=(dx/d-h.fx)*k;h.fy+=(dy/d-h.fy)*k;const l=Math.hypot(h.fx,h.fy)||1;h.fx/=l;h.fy/=l;}return;}
 h.wt-=dt;if(h.wt<=0&&h.pat<=0){const p=h.pen,o=G.HORSES.find(q=>q!==h&&q.pen);for(let k=0;k<8;k++){const nx=(p.x0+1.9+Math.random()*(p.x1-p.x0-2.8))*TILE,ny=(p.y0+1.9+Math.random()*(p.y1-p.y0-2.8))*TILE;if(o&&Math.hypot(nx-o.x,ny-o.y)<TILE*2.2)continue;if(Math.hypot(nx-h.x,ny-h.y)<TILE)continue;h.tx=nx;h.ty=ny;h.moving=true;h.graze=0;break;}if(!h.moving)h.wt=2;}}
function horseVisible(h){if(h.ridden||(P&&P.mount&&P.mount.dead&&G.HORSES&&G.HORSES[P.mount.idx]===h))return false;return h.room?G.room===h.room:!G.room;}
// ===================== v20: Reiten =====================
const HORSEN=['Blitz','Sturmwind','Asche','Donner','Falbe','Mira','Kastanie','Nebel','Rabe','Funke','Sleipnir','Wolke'];
const mountMax=()=>Math.round(140+P.level*9+(P.mount&&P.mount.armor?P.mount.armor.hp||0:0));G.mountMax=mountMax;
const myHorse=()=>P.mount&&G.HORSES?G.HORSES[P.mount.idx]:null;
function feedHorse(h){const idx=G.HORSES.indexOf(h);if(countItem('carrot')<1){patHorse(h);if(!P.mount&&!h._hint){h._hint=1;setTimeout(()=>G.toast(P.carrotOK?'🥕 Mit Karotten könntest du das Pferd zähmen (3 Stück).':'🥕 Pferde lieben Karotten – doch die sind gerade knapp. Frag Stallmeister Matthes.','#e8d0a0'),900);}return;}
 if(P.mount){if(idx===P.mount.idx){removeItem('carrot',1);P.mount.hp=Math.min(mountMax(),P.mount.hp+60);h.pat=3;G.toast(`🥕 ${P.mount.name} frisst genüsslich. (+60 Pferde-LP)`,'#e8d0a0');}else{patHorse(h);G.toast(`🐴 Du hast schon ${P.mount.name}.`,'#e8d0a0');}return;}
 removeItem('carrot',1);h.trust=(h.trust||0)+1;h.pat=3;h.graze=0;h.moving=false;for(let i=0;i<6;i++)G.parts.push({x:h.x+rnd(-8,8),y:h.y-14,z:22,vx:rnd(-20,20),vy:-40,life:.9,c:'#ff9a3a'});
 if(h.trust>=3){const nm=pick(HORSEN);P.mount={idx,c:h.c,mane:h.mane,name:nm,hp:0,dead:0,armor:null,saddle:0};P.mount.hp=mountMax();sfx('quest');G.flashT=.5;G.toast(`🐎 Das Pferd vertraut dir! Du nennst es „${nm}“. Für einen Ritt brauchst du noch einen Sattel – Stallmeister Matthes am Stall hilft dir.`,'#ffd54a',true);G.save();}
 else{G.toast(`🥕 Das Pferd frisst und stupst dich an … (${h.trust}/3 Vertrauen)`,'#e8d0a0');sfx('pickup');}}
function dismount(quiet){if(!P.riding)return;P.riding=false;const h=myHorse();if(h){h.ridden=0;let px=P.x-P.fy*26,py=P.y+P.fx*26;if(!canMove(px,py,12)){px=P.x+P.fy*26;py=P.y-P.fx*26;}if(!canMove(px,py,12)){px=P.x;py=P.y+20;}h.x=px;h.y=py;h.fx=P.fx||1;h.fy=P.fy||0;h.room=null;h.pen=null;h.moving=false;h.free=1;}G.S=calc();if(!quiet)G.toast('🐴 Abgesessen.','#e8d0a0');}
G.dismount=dismount;
G.toggleRide=function(){if(P.dead)return;if(P.riding){dismount();return;}
 if(!P.mount){G.toast('🐴 Du hast noch kein Pferd. Zähme eines mit drei Karotten.','#e8d0a0');return;}
 if(!P.mount.saddle){G.toast('🐴 Ohne Sattel kannst du nicht reiten. Stallmeister Matthes am Stall von Eichenhain hilft dir.','#e8d0a0');return;}
 if(P.mount.dead){G.toast(`🐴 ${P.mount.name} ist verletzt und wird im Stall gepflegt. Schlaf eine Nacht in deinem Bett – dann ist es wieder auf den Beinen.`,'#ffab91',true);return;}
 if(G.room){G.toast('🐴 Drinnen kann man nicht reiten.','#e8d0a0');return;}
 const h=myHorse();if(h){const far=h.room||Math.hypot(h.x-P.x,h.y-P.y)>TILE*3;h.ridden=1;h.free=0;G.toast(far?`🐎 Ein Pfiff – ${P.mount.name} trabt herbei. Aufgesessen!`:`🐎 Aufgesessen auf ${P.mount.name}!`,'#ffd54a');}
 P.riding=true;sfx('click');G.S=calc();};
G.canRide=()=>!!(P&&P.mount&&P.mount.saddle);
function horseHurt(d){const m=P.mount;if(!m||m.dead)return;const def=m.armor?m.armor.def:0;d=Math.max(1,Math.round(d*70/(70+def)));m.hp-=d;G.floats.push({x:P.x+14,y:P.y-18,t:'🐴-'+d,c:'#ffb38a',life:.7});if(m.hp<=0)horseDie();}
function horseDie(){const m=P.mount;m.hp=0;m.dead=1;P.riding=false;const h=myHorse();if(h){h.ridden=0;h.free=0;h.x=h.hx0;h.y=h.hy0;h.room=h.hroom;h.pen=h.hpen;h.fx=h.hfx;h.fy=h.hfy;h.trust=3;}G.S=calc();sfx('hurt');G.flashT=.5;G.toast(`💀 ${m.name} ist zusammengebrochen! Stallmeister Matthes bringt es in den Stall. Erst wenn du eine Nacht in deinem Bett geschlafen hast, ist es wieder auf den Beinen.`,'#ff8a80',true);G.save();}
G.mountTick=dt=>{const m=P.mount;if(!m)return;if(m.dead){if(P.riding)P.riding=false;return;}const mx=mountMax();if(m.hp>mx)m.hp=mx;if(m.hp<mx&&!(P.hurtT>0))m.hp=Math.min(mx,m.hp+mx*(P.riding?.004:.02)*dt);if(P.riding&&(G.room||P.dead))dismount(true);};
// Pferderüstung (Barde): fällt bei Zentauren (und selten bei Bossen), stufenabhängig
const BARDN=['Leder-Pferdedecke','Beschlagene Pferdedecke','Kettenbarde','Plattenbarde','Drachenbarde','Mythische Barde'];
function mkBarding(ilvl,rar){ilvl=Math.max(1,Math.round(ilvl));rar=Math.max(0,Math.min(5,rar|0));const M=RMULT[rar]||1;return{uid:(Date.now()%1e8)+'-'+(uidC++),type:'barding',rarity:rar,ilvl,def:Math.round((6+ilvl*1.7)*M),hp:Math.round((20+ilvl*4.5)*M),name:BARDN[rar],v13:1,af:{}};}
G.mkBarding=mkBarding;
G.equipBarding=idx=>{const it=P.inv[idx];if(!it||it.type!=='barding')return false;if(!P.mount){G.toast('🐴 Du brauchst erst ein eigenes Pferd.','#ff8a80');return false;}if(P.level<reqLvl(it)){G.toast(`Benötigt Stufe ${reqLvl(it)}`,'#ff8a80');return false;}const old=P.mount.armor;P.mount.armor=it;P.inv[idx]=old||null;P.mount.hp=Math.min(mountMax(),P.mount.hp+(it.hp||0));G.invDirty=true;G.toast(`🐎 ${P.mount.name} trägt jetzt: ${it.name} (Rüstung ${it.def})`,'#ffd54a');G.save();return true;};
function patHorse(h){h.pat=3;h.graze=0;h.moving=false;h.wt=3;sfx('click');G.toast(pick(['🐴 Das Pferd schnaubt zufrieden und stupst dich an.','🐴 Es wiehert leise und lässt sich den Hals kraulen.','🐴 Das Pferd legt dir den Kopf auf die Schulter.','🐴 Weiches Fell, warme Nüstern. Es mag dich.']),'#e8d0a0');}
function horsePush(){if(P.riding)return;for(const h of G.HORSES||[]){if(!horseVisible(h))continue;const hx=h.x,hy=h.y;if(Math.abs(hx-P.x)>TILE*2||Math.abs(hy-P.y)>TILE*2)continue;const L=.72*TILE;const ax=hx-h.fx*L,ay=hy-h.fy*L,bx=hx+h.fx*L,by=hy+h.fy*L;const vx=bx-ax,vy=by-ay;let t=((P.x-ax)*vx+(P.y-ay)*vy)/(vx*vx+vy*vy);t=Math.max(0,Math.min(1,t));const cx=ax+vx*t,cy=ay+vy*t;const dx=P.x-cx,dy=P.y-cy,d=Math.hypot(dx,dy),R=.42*TILE+10;if(d<R&&d>.01){const nx=cx+dx/d*R,ny=cy+dy/d*R;if(canMoveP(nx,ny,10)){P.x=nx;P.y=ny;}}}}
G.horseVisible=horseVisible;
G.smithStock=()=>{const day=Math.floor((P.dayT||0)/720);let st=P.smithStock;if(!st||st.day!==day||st.lvl!==P.level){const L=P.level||1,maxR=L<6?1:L<12?2:L<20?3:L<30?4:5,items=[];const keys=['sword','axe','mace','spear','dagger','greatsword','halberd','warhammer','bow','longbow','crossbow','ritter','waechter','waldlaeufer','magier','heiler','ring','amulet'].filter(k=>WKIND[k]||SETS[k]||k==='ring'||k==='amulet');
  for(let i=0;i<8;i++){const rr=Math.random();let r=rr<.45?0:rr<.75?1:rr<.9?2:rr<.97?3:4;if(i===0)r=maxR;r=Math.min(r,maxR);const it=lootItem(pick(keys),L,r,{});if(!it)continue;it.shopPrice=Math.round(sellPrice(it)*7/(1+r*.35)/5)*5;items.push(it);}
  st=P.smithStock={day,lvl:L,items};}return st.items;};
G.buyGear=i=>{const st=G.smithStock(),it=st[i];if(!it)return false;if(P.gold<it.shopPrice){G.toast('Nicht genug Gold','#ff8a80');return false;}if(!P.inv.some((s,k)=>k>=9&&!s)&&!P.inv.some(s=>!s)){G.toast('Kein Platz im Rucksack','#ff8a80');return false;}P.gold-=it.shopPrice;const c=Object.assign({},it);delete c.shopPrice;give(c);st.splice(i,1);sfx('coin');G.invDirty=true;return true;};
G.dev={mkStack,give,genItem,gainXP,STACK,RAR,BUILD,spawnHorses:()=>{G.HORSES=null;}};

// ===== v12.3: Waldpfad zum Angler & Entdeckungen =====
{const A=BUILD.find(b=>b.id==='angler'),sx=A.door.tx,sy=A.door.ty+1;let best=null,bd=1e9;for(let k=0;k<RLIST.length;k+=2){const d=Math.hypot(RLIST[k]-sx,RLIST[k+1]-sy);if(d<bd){bd=d;best=[RLIST[k],RLIST[k+1]];}}
 const carve=(x,y)=>{const t=tileAt(x,y);if(t===T.HOUSE||t===T.DOOR||t===T.BRIDGE||t===T.WAYSTONE||t===T.CHEST||t===T.PATH)return;map[y*W+x]=t===T.WATER?T.BRIDGE:T.PATH;};
 if(best){const [ex,ey]=best,n=Math.ceil(bd*2);for(let k=0;k<=n;k++){const f=k/n,x=Math.round(sx+(ex-sx)*f+Math.sin(f*7)*1.6),y=Math.round(sy+(ey-sy)*f+Math.cos(f*5)*1.2);carve(x,y);}
  // kleines Schild am Abzweig
  G.ANGSIGN={tx:ex,ty:ey};}}
for(const b of BUILD){if(!b.room||!b.door)continue;for(let d=1;d<=2;d++){const x=b.door.tx,y=b.door.ty+d,t=tileAt(x,y);if(t===T.HOUSE||t===T.DOOR)continue;if(SOLIDS[t]||t===T.WATER||t===T.SWAMP||t===T.LAVA||t===T.ICE)map[y*W+x]=T.COBBLE;}}
const POI=[];G.POI=POI;
{const groundOf=b=>b==='winter'?T.SNOW:b==='desert'?T.SAND:b==='ash'?T.ASH:b==='waste'||b==='peaks'?T.DIRT:T.GRASS;
 const DEF=[[120,660,'skeleton','Gefallener Abenteurer','Ein Skelett in rostiger Rüstung umklammert noch seinen Beutel. Er hat es nicht aus dem Moor geschafft.'],
  [340,460,'stones','Alter Steinkreis','Uralte Steine stehen im Kreis. Man sagt, hier hätten die ersten Könige von Eldmar geschworen.'],
  [910,580,'camp','Verlassenes Jägerlager','Die Glut ist längst kalt. Wer hier lagerte, ist in großer Eile aufgebrochen.'],
  [1040,500,'grove','Verborgene Lichtung','Sonnenlicht fällt durch die Baumkronen. Die Luft riecht nach Blüten, du fühlst dich erfrischt.'],
  [460,260,'cairn','Gipfelsteinmann','Wanderer haben hier Steine aufgeschichtet. In einen ist eingeritzt: „Der Drache schläft nie ganz.“'],
  [190,260,'stones','Frostkreis','Die Steine sind von Raureif überzogen, aber in der Mitte schmilzt der Schnee nie.'],
  [940,220,'skeleton','Verkohlte Überreste','Ein Abenteurer, der dem Drachen zu nahe kam. Seine Schätze hat das Feuer verschont.'],
  [600,940,'cairn','Grenzstein der Alten','Ein verwitterter Stein markiert die alte Grenze des Königreichs. Darunter ist etwas vergraben.'],
  [940,1010,'camp','Karawanenrast','Eine verlassene Rast der Wüstenhändler. In einer Kiste liegt noch Ware.'],
  [120,940,'grove','Elfenlichtung','Glühende Pilze bilden einen Ring. Es heißt, wer hier rastet, kehrt gestärkt zurück.'],
  [370,1000,'skeleton','Verirrter Pilger','Er suchte die Abtei und fand nur den Schattenwald.'],
  [720,770,'stones','Sonnenstein','Ein einzelner Stein, der mittags keinen Schatten wirft.'],
  [690,700,'cairn','Steinmännchen mit Inschrift','In einen Stein ist geritzt: „Diese Welt erschuf Akuma. Wer dies liest, hat zu viel Zeit – und genau richtig erkundet.“'],
  [520,520,'grove','Feenring','Ein Kreis aus winzigen Pilzen. In der Mitte liegt ein Hut, nicht größer als dein Daumen. Du fühlst dich erfrischt.'],
  [640,780,'skeleton','Der ungeduldige Abenteurer','Neben dem Skelett liegt ein Zettel: „Bin gleich wieder da. Nur kurz Level 40 holen.“'],
  [420,620,'stones','Verwitterter Steinkreis','Zwölf Steine, einer fehlt. Bauer Jorg schwört, dass er ihn nicht für seinen Stall geklaut hat.'],
  [760,720,'camp','Lager eines Kartografen','Überall Skizzen derselben Wiese. Auf der letzten steht nur: „Alles ist doppelt so groß geworden?!“'],
  [880,380,'rune','Runenstein von Aschental','Die Runen erzählen von einem Dorf, das zweimal brannte – einmal durch Feuer, einmal durch Verrat.'],
  [330,520,'skeleton','Versunkener Fischer','Er wollte im Moor angeln. Seine Rute ragt noch aus dem Schlamm.'],
  [210,700,'rune','Moorstein','„Wer im Nebel wandelt, hört die Toten flüstern. Wer zurückflüstert, bleibt.“'],
  [90,880,'grove','Irrlichtlichtung','Kleine Lichter tanzen über dem Wasser und weichen dir aus. Eines setzt sich kurz auf deine Schulter.'],
  [960,640,'camp','Verlassenes Holzfällerlager','Die Axt steckt noch im Stamm. Daneben eine Spur aus Goblinfüßen.'],
  [1100,460,'cairn','Grenzstein des Finsterwalds','„Bis hierher und nicht weiter“, steht darauf. Dahinter beginnt der Nebel.'],
  [1080,760,'skeleton','Gefallener Späher','Er trägt das Wappen von Eichenhain. In seiner Hand: ein leerer Kartenköcher.'],
  [520,1000,'rune','Runenstein der Schlucht','Eine Zeichnung zeigt Orks, die einer Gestalt mit eiserner Krone huldigen.'],
  [700,1080,'camp','Verlassene Grabungsstelle','Spitzhacken, Seile und ein Tagebuch: „Tag 40: Golems. Überall Golems.“'],
  [360,1100,'grove','Schattenquelle','Eine Quelle, so klar wie Glas, mitten im finstersten Wald. Das Wasser schmeckt nach Minze.'],
  [180,1040,'skeleton','Der letzte Pilger','Auf seinem Grabstein steht: „Er hatte nur eine Zeile Text.“'],
  [960,1100,'cairn','Sandbedeckter Obelisk','Eine Inschrift warnt: „Wer den Sandkönig weckt, weckt auch seinen Hunger.“'],
  [1180,1000,'camp','Oase des Händlers','Ein Teppich, eine leere Wasserkanne und ein Schild: „Bin beten. Nicht klauen.“'],
  [1040,300,'skeleton','Verbrannter Drachenjäger','Ein Helm mit Hörnern. Gunnar würde ihn erkennen.'],
  [820,160,'rune','Runenstein der Asche','„Ignarok war einst ein Wächter. Dann vergaß er, was er bewachte.“'],
  [640,220,'stones','Hügelkreis der Zwerge','Zwergenrunen: „Hier tranken Durins Ahnen auf jedes neue Bier.“'],
  [400,120,'skeleton','Erfrorener Sammler','Er umklammert eine Feder von etwas sehr Großem.'],
  [260,320,'grove','Nordlichtlichtung','Selbst im Schnee blühen hier blaue Blumen. Der Himmel schimmert grün.'],
  [150,240,'cairn','Steinmann der Skalden','„Die beste Geschichte ist die, die du selbst erlebst.“ – Skaldin Ylva'],
  [1250,700,'rune','Nebelrune','Die Rune leuchtet violett, als du näherkommst. Ein Summen geht davon aus.'],
  [1260,500,'skeleton','Gefallener Nebelwächter','Seine Rüstung trägt das Zeichen von Nebelwacht. Er fiel mit dem Gesicht zum Nebel.'],
  [1290,860,'grove','Herz des Nebels','Hier lichtet sich der Nebel. Ein uralter Baumstumpf atmet ruhig wie ein schlafendes Tier.'],
  [1230,360,'camp','Lager der Nebelzwerge','Seltsame Werkzeuge aus blauem Metall. Ein Topf mit noch warmem Eintopf.'],
  [560,440,'cairn','Ein rostiges Schwert im Stein','Es steckt fest. Ganz fest. Vielleicht später. Vielleicht nie.'],
  [600,860,'stones','Der singende Stein','Wenn der Wind darüber streicht, klingt es fast wie Lukas’ Laute. Nur schöner.']];
 const near=(x,y)=>BUILD.some(b=>x>b.x-8&&x<b.x+b.w+8&&y>b.y-8&&y<b.y+b.h+8)||TOWNS.some(t=>Math.hypot(t.x-x,t.y-y)<t.r+8)||Math.hypot(x-VCX,y-VCY)<40;
 DEF.forEach(([x0,y0,kind,name,text],i)=>{let best=null;for(let r=0;r<30&&!best;r+=2)for(let k=0;k<16&&!best;k++){const an=k/16*6.283,x=Math.round(x0+Math.cos(an)*r),y=Math.round(y0+Math.sin(an)*r);if(x<8||y<8||x>WW-8||y>H-8||near(x,y))continue;let wat=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const t=tileAt(x+dx,y+dy);if(t===T.WATER||t===T.LAVA||t===T.HOUSE||t===T.WAYSTONE||t===T.PATH||t===T.COBBLE)wat++;}if(!wat)best=[x,y];}
  if(!best)return;const [cx,cy]=best,g=groundOf(biome(cx,cy));for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){if(dx*dx+dy*dy>18)continue;map[(cy+dy)*W+cx+dx]=g;}
  const id='poi'+i;let chest=true;
  if(kind==='stones'){for(let k=0;k<8;k++){const an=k/8*6.283;map[(cy+Math.round(Math.sin(an)*3))*W+cx+Math.round(Math.cos(an)*3)]=T.ROCK;}}
  else if(kind==='cairn'){map[(cy-1)*W+cx]=T.RUIN;map[(cy-1)*W+cx+1]=T.ROCK;}
  else if(kind==='rune'){map[(cy-1)*W+cx]=T.WAYSTONE===undefined?T.ROCK:T.RUIN;chest=h2(cx,cy,5)<.5;}
  else if(kind==='camp'){map[(cy-2)*W+cx-1]=T.TENT;map[cy*W+cx+2]=T.FIRE;map[(cy+1)*W+cx-2]=T.STUMP;}
  else if(kind==='skeleton'){map[cy*W+cx-1]=T.BONES;map[(cy+1)*W+cx+1]=T.BONES;}
  else if(kind==='grove'){for(let k=0;k<10;k++){const an=k/10*6.283;const x=cx+Math.round(Math.cos(an)*3),y=cy+Math.round(Math.sin(an)*3);map[y*W+x]=biome(cx,cy)==='dark'?T.MUSH:T.FLOWER;}chest=false;}
  if(chest)OCH.push({id:'c_'+id,tx:cx,ty:cy,loot:'canyon'});POI.push({id,name,text,kind,tx:cx,ty:cy});});}
// ===== v18: Wildwechsel-Pfade, versteckte Truhen und Erreichbarkeit =====
(()=>{const R=(i,k)=>h2(i,k,1801);const okB=new Set(['forest','dark','mist','meadow','winter','swamp']);
 const groundAt=(x,y)=>{const b=biome(x,y);return b==='winter'?T.SNOW:b==='swamp'?T.SWAMP:(b==='dark'||b==='mist')?T.DGRASS:b==='desert'?T.SAND:b==='waste'||b==='peaks'?T.DIRT:b==='ash'?T.ASH:T.GRASS2;};
 const SOFT=new Set([T.TREE,T.DEAD,T.STUMP,T.MUSH,T.ROCK,T.CACTUS]);
 const carve1=(x,y)=>{if(x<4||y<4||x>=WW-4||y>=H-4)return;const t=map[y*W+x];if(SOFT.has(t))map[y*W+x]=groundAt(x,y);};
 let made=0;for(let i=0;i<3000&&made<260;i++){let x=8+Math.floor(R(i,1)*(WW-16)),y=8+Math.floor(R(i,2)*(H-16));const b=biome(x,y);if(!okB.has(b)||dV(x,y)<RV+12||townAt(x,y))continue;
  let tr=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(map[(y+dy)*W+x+dx]===T.TREE)tr++;if(tr<16)continue;
  made++;let a=R(i,3)*6.283;const len=16+Math.floor(R(i,4)*36);for(let st=0;st<len;st++){carve1(Math.round(x),Math.round(y));a+=(h2(i,st,1802)-.5)*.9;x+=Math.cos(a);y+=Math.sin(a);if(x<6||y<6||x>WW-6||y>H-6)break;}
  if(made%3===0){const cx=Math.round(x),cy=Math.round(y);if(cx>6&&cy>6&&cx<WW-6&&cy<H-6&&!townAt(cx,cy)){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)carve1(cx+dx,cy+dy);const t=map[cy*W+cx];if(!SOLIDS[t]&&t!==T.WATER&&t!==T.LAVA)OCH.push({id:'s_'+i,tx:cx,ty:cy,loot:'secret'});}}}
 // Erreichbarkeit: abgeschlossene Inseln mit dem Rest der Welt verbinden (Bäume/Felsen weg, über Wasser Stege)
 const N=WW*H,par=new Int32Array(N).fill(-1),SOFTA=new Uint8Array(128);SOFT.forEach(t=>SOFTA[t]=1);const cost=i=>{const y0=(i/WW)|0,t=map[y0*W+i-y0*WW];if(!SOLIDS[t]||t===T.CLIMB||t===T.BARRIER||t===T.LEDGE||t===T.WAYSTONE)return 0;if(SOFTA[t])return 1;if(t===T.WATER)return 2;return -1;};
 const start=VCY*WW+VCX+2;const best=new Int32Array(N).fill(1e9);best[start]=0;
 // Dijkstra mit kleiner Gewichtung über Ringpuffer (0-1-2-BFS)
 const buckets=[[start],[],[]];let cur=0,bi=0,guard=0;const done=new Uint8Array(N);
 while(guard++<40000000){let list=buckets[bi%3];if(!list.length){let any=false;for(let k=1;k<=2;k++)if(buckets[(bi+k)%3].length){any=true;break;}if(!any)break;bi++;continue;}const i=list.pop();if(done[i])continue;done[i]=1;const x=i%WW,y=(i/WW)|0;
  for(let q4=0;q4<4;q4++){const dx=DX4[q4],dy=DY4[q4];const nx=x+dx,ny=y+dy;if(nx<3||ny<3||nx>=WW-3||ny>=H-3)continue;const j=ny*WW+nx;if(done[j])continue;const c=cost(j);if(c<0)continue;const nd=best[i]+c;if(nd<best[j]){best[j]=nd;par[j]=i;buckets[(bi+c)%3].push(j);}}}
 // Inseln (begehbare Felder, die nur über Umwege erreichbar sind) finden und verbinden
 const seen=new Uint8Array(N);let fixed=0;
 for(let i=0;i<N;i++){if(seen[i]||best[i]===0||best[i]>=1e9||cost(i)!==0)continue;const comp=[i];seen[i]=1;let mi=i;for(let k=0;k<comp.length;k++){const c=comp[k],x=c%WW,y=(c/WW)|0;if(best[c]<best[mi])mi=c;for(let q4=0;q4<4;q4++){const dx=DX4[q4],dy=DY4[q4];const j=(y+dy)*WW+x+dx;if(!seen[j]&&best[j]>0&&best[j]<1e9&&cost(j)===0){seen[j]=1;comp.push(j);}}}
  if(comp.length<5)continue;let c=mi,g2=0;while(c>=0&&best[c]>0&&g2++<4000){const x=c%WW,y=(c/WW)|0,t=map[y*W+x];if(SOFT.has(t))map[y*W+x]=groundAt(x,y);else if(t===T.WATER)map[y*W+x]=T.BRIDGE;c=par[c];}fixed++;}
 // winzige, weiterhin unerreichbare Lücken (1–4 Felder) zuwachsen lassen, damit man nirgends feststecken kann
 {const pass=i=>{const t=map[Math.floor(i/WW)*W+i%WW];return !SOLIDS[t]||t===T.CLIMB||t===T.BARRIER||t===T.LEDGE;};const rs=new Uint8Array(N);const q=[start];rs[start]=1;for(let k=0;k<q.length;k++){const c=q[k],x=c%WW,y=(c/WW)|0;for(let q4=0;q4<4;q4++){const dx=DX4[q4],dy=DY4[q4];const nx=x+dx,ny=y+dy;if(nx<1||ny<1||nx>=WW-1||ny>=H-1)continue;const j=ny*WW+nx;if(!rs[j]&&pass(j)){rs[j]=1;q.push(j);}}}
  const s3=new Uint8Array(N);for(let i=0;i<N;i++){if(rs[i]||s3[i]||!pass(i))continue;const comp=[i];s3[i]=1;for(let k=0;k<comp.length&&comp.length<6;k++){const c=comp[k],x=c%WW,y=(c/WW)|0;for(let q4=0;q4<4;q4++){const dx=DX4[q4],dy=DY4[q4];const j=(y+dy)*WW+x+dx;if(!rs[j]&&!s3[j]&&pass(j)){s3[j]=1;comp.push(j);}}}
   if(comp.length<5)for(const c0 of comp){const x=c0%WW,y=(c0/WW)|0,t=map[y*W+x];if(t===T.WATER||t===T.BRIDGE||t===T.WAYSTONE||t===T.PATH||t===T.COBBLE||t===T.LEDGE||t===T.CLIMB)continue;if(OCH.some(o=>o.tx===x&&o.ty===y))continue;const b=biome(x,y);map[y*W+x]=(b==='desert'||b==='waste'||b==='ash'||b==='peaks')?T.ROCK:T.TREE;}}}
 G.REACHFIX=fixed;})();
let poiT=0;function poiTick(dt){poiT+=dt;if(poiT<.5||G.room)return;poiT=0;P.disc=P.disc||{};for(const p of POI){if(P.disc[p.id])continue;if(Math.hypot(P.x/TILE-p.tx,P.y/TILE-p.ty)<4.5){P.disc[p.id]=1;const n=Object.keys(P.disc).length;sfx('rare');gainXP(60+zoneLevel(p.tx,p.ty)*12);if(p.kind==='grove'){const S=G.calc();P.hp=S.maxhp;P.mp=S.maxMp;}G.toast(`✦ Entdeckt: ${p.name} (${n}/${POI.length})\n${p.text}`,'#ffe9a0',true);G.save();}}}
// Hooks
G.v8tick=dt=>{poiTick(dt);G._natT=(G._natT||0)-dt;if(G._natT<=0){G._natT=5;G.decoTick();if(P.buffs){let ch=false;for(const k in P.buffs)if(P.buffs[k]<=P.dayT){delete P.buffs[k];ch=true;}if(ch){G.S=calc();G.toast('⌛ Eine Stärkung ist abgeklungen.','#ccc');}}if(P.chopped&&Object.keys(P.chopped).length)applyTrees();}if(!G.HORSES)spawnHorses();if(P.riding){const mh=myHorse();if(mh&&!mh.ridden)mh.ridden=1;}G.mountTick(dt);for(const h of G.HORSES)if(h.ridden||(h.room?G.room===h.room:(!G.room&&Math.hypot(h.x-P.x,h.y-P.y)<TILE*40)))horseTick(h,dt);horsePush();G.fishTick(dt);if(!G.CATS)spawnCats();for(const c of G.CATS)if(!G.room&&Math.hypot(c.x-P.x,c.y-P.y)<TILE*30)catTick(c,dt,false);if(P.pet){if(!G.PET)G.PET={x:P.x,y:P.y+14,fx:0,fy:1,c:P.pet.c,anim:0,room:G.room,pet:1};catTick(G.PET,dt,true);}
 if(P.main===6&&!P.frost&&!P.q.frostHint){P.q.frostHint=1;G.toast('❄ Gunnar: „Ohne das Frostherz vom Frostgipfel verbrennt dich Ignarok! Klettere hinauf, ganz im Nordwesten der Frostlande.“','#81d4fa',true);}
 if(G.sleepFx>0)G.sleepFx-=dt;};
G.fishAct=fishAct;

// ===================== v22 (Teil 3B): Möbel & Deko, Haus-Upgrades, Wochentage, Casino, Läden, Strafen =====================
// ---- Wochentage & Uhrzeit (Tag 0 = Montag, t=0 entspricht 06:00 Uhr)
const WDAY=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],WD2=['Mo','Di','Mi','Do','Fr','Sa','So'];
const wday=()=>Math.floor(((P&&P.dayT)||0)/DAYLEN)%7;
const hourOf=t=>(6+t/DAYLEN*24)%24;
const clockStr=t=>{const h=hourOf(t),hh=Math.floor(h),mm=Math.floor((h-hh)*60/10)*10;return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');};
Object.assign(G,{WDAY,WD2,wday,hourOf,clockStr});
// ---- Öffnungszeiten (Stunden von–bis, Tage-Maske; bis < von = über Mitternacht)
const HOURS={chapel:[7,20,'all'],craft:[9,18,'MoSa'],shop:[8,19,'MoSa'],inn:[10,2,'all'],potion:[8,20,'all'],casino:[12,2,'all'],guild:[8,20,'MoSa']};
const HCLS=id=>id==='anselm'?'chapel':id==='holger'||id==='flora'||id==='baldur'?'craft':id==='edwin'||id==='isolde'?'guild':/^(wirt|inn_)/.test(id)?'inn':/^(fortunato|kasimir|bella)$/.test(id)?'casino':/^(wenda|pot_)/.test(id)||id==='brann'||id==='mara'?'potion':'shop';
G.shopOpen=(id,t,wd)=>{const c=HOURS[HCLS(id)],h=hourOf(t==null?G.dayInfo().t:t);if(wd==null)wd=wday();let open=c[1]>c[0]?(h>=c[0]&&h<c[1]):(h>=c[0]||h<c[1]);if(c[2]==='MoSa'&&wd===6)open=false;return open;};
G.shopHoursTxt=id=>{const c=HOURS[HCLS(id)];return `${String(c[0]).padStart(2,'0')}:00–${String(c[1]).padStart(2,'0')}:00 Uhr, ${c[2]==='MoSa'?'Mo–Sa (sonntags Ruhetag)':'täglich'}`;};

// ---- Möbel- & Deko-Katalog: Formen × Materialien
// sh: Form-Schlüssel | w,h Grundfläche | s: blockiert | l: Ebene (f=flach am Boden, w=Wand, n=normal) | o: Außen | p: Grundpreis | c: Gemütlichkeit
const SHP={
 bed1:{n:'Strohlager',ic:'🛏',w:1,h:1,s:1,p:400,c:1,bed:1},bed2:{n:'Einzelbett',ic:'🛏',w:1,h:2,s:1,p:1400,c:3,bed:1},bed3:{n:'Doppelbett',ic:'🛏',w:2,h:2,s:1,p:3600,c:5,bed:1},bedk:{n:'Himmelbett',ic:'👑',w:2,h:2,s:1,p:9500,c:8,bed:1},
 table1:{n:'Runder Tisch',ic:'🪵',w:1,h:1,s:1,p:500,c:1},table2:{n:'Langer Tisch',ic:'🪵',w:2,h:1,s:1,p:1300,c:2},chair:{n:'Stuhl',ic:'🪑',w:1,h:1,s:0,p:300,c:1},stool:{n:'Hocker',ic:'🪑',w:1,h:1,s:0,p:150,c:0},
 bench:{n:'Sitzbank',ic:'🪑',w:2,h:1,s:1,p:700,c:1},sofa:{n:'Sofa',ic:'🛋',w:2,h:1,s:1,p:2600,c:4},shelf:{n:'Wandregal',ic:'📚',w:1,h:1,s:1,l:'w',p:700,c:1},bookcase:{n:'Bücherschrank',ic:'📚',w:2,h:1,s:1,l:'w',p:2400,c:3},
 wardrobe:{n:'Kleiderschrank',ic:'🚪',w:1,h:1,s:1,l:'w',p:1900,c:2},chest:{n:'Truhe',ic:'🧰',w:1,h:1,s:1,p:900,c:1},hearth:{n:'Kamin',ic:'🔥',w:2,h:1,s:1,l:'w',p:3800,c:5},stove:{n:'Kachelofen',ic:'🔥',w:1,h:1,s:1,p:2300,c:3},
 lampf:{n:'Stehlampe',ic:'🕯',w:1,h:1,s:0,p:800,c:1},candle:{n:'Kerzenständer',ic:'🕯',w:1,h:1,s:0,p:250,c:1},rug:{n:'Teppich',ic:'🟥',w:2,h:2,s:0,l:'f',p:1500,c:2},rugs:{n:'Kleiner Teppich',ic:'🟧',w:1,h:1,s:0,l:'f',p:500,c:1},
 plant:{n:'Topfpflanze',ic:'🪴',w:1,h:1,s:0,p:350,c:1},vase:{n:'Blumenvase',ic:'🏺',w:1,h:1,s:0,p:600,c:1},painting:{n:'Gemälde',ic:'🖼',w:1,h:1,s:0,l:'w',p:1600,c:2},tapestry:{n:'Wandteppich',ic:'🧶',w:2,h:1,s:0,l:'w',p:2600,c:3},
 mirror:{n:'Spiegel',ic:'🪞',w:1,h:1,s:0,l:'w',p:1700,c:1},clock:{n:'Standuhr',ic:'🕰',w:1,h:1,s:1,p:2900,c:2},statue:{n:'Statue',ic:'🗿',w:1,h:1,s:1,p:4200,c:2},armor:{n:'Rüstungsständer',ic:'🛡',w:1,h:1,s:1,p:3600,c:2},
 barrel:{n:'Fass',ic:'🛢',w:1,h:1,s:1,p:250,c:0},crate:{n:'Kiste',ic:'📦',w:1,h:1,s:1,p:200,c:0},desk:{n:'Schreibtisch',ic:'✒',w:2,h:1,s:1,p:1900,c:2},piano:{n:'Spinett',ic:'🎹',w:2,h:1,s:1,p:7200,c:5},
 globe:{n:'Globus',ic:'🌍',w:1,h:1,s:1,p:2600,c:2},aquarium:{n:'Aquarium',ic:'🐠',w:2,h:1,s:1,p:5200,c:4},bath:{n:'Badezuber',ic:'🛁',w:2,h:1,s:1,p:3900,c:4},basket:{n:'Katzenkorb',ic:'🧺',w:1,h:1,s:0,p:450,c:1,cat:1},
 trophy:{n:'Jagdtrophäe',ic:'🦌',w:1,h:1,s:0,l:'w',p:2100,c:2},banner:{n:'Wappenbanner',ic:'🚩',w:1,h:1,s:0,l:'w',p:900,c:1},throne:{n:'Thron',ic:'👑',w:1,h:1,s:1,p:12000,c:6},harp:{n:'Harfe',ic:'🎼',w:1,h:1,s:1,p:4800,c:3},
 // Außen
 obench:{n:'Parkbank',ic:'🪑',w:2,h:1,s:1,o:1,p:900},lantern:{n:'Laterne',ic:'🏮',w:1,h:1,s:1,o:1,p:1200},fountain:{n:'Springbrunnen',ic:'⛲',w:2,h:2,s:1,o:1,p:8500},fbed:{n:'Blumenbeet',ic:'🌷',w:2,h:1,s:0,l:'f',o:1,p:700},
 ostatue:{n:'Denkmal',ic:'🗽',w:1,h:1,s:1,o:1,p:5200},hedge:{n:'Hecke',ic:'🌳',w:1,h:1,s:1,o:1,p:400},arch:{n:'Rosenbogen',ic:'🌹',w:1,h:1,s:0,o:1,p:1900},sign:{n:'Wegweiser',ic:'🪧',w:1,h:1,s:1,o:1,p:500},
 birdbath:{n:'Vogeltränke',ic:'🐦',w:1,h:1,s:1,o:1,p:1500},owell:{n:'Zierbrunnen',ic:'🪣',w:1,h:1,s:1,o:1,p:4600},pavilion:{n:'Pavillon',ic:'⛺',w:2,h:2,s:1,o:1,p:9200},flag:{n:'Fahnenmast',ic:'🚩',w:1,h:1,s:1,o:1,p:800},
 planter:{n:'Kübelbäumchen',ic:'🌲',w:1,h:1,s:1,o:1,p:900},scarecrow:{n:'Vogelscheuche',ic:'🎃',w:1,h:1,s:1,o:1,p:600},sundial:{n:'Sonnenuhr',ic:'☀',w:1,h:1,s:1,o:1,p:2600},campfire:{n:'Feuerschale',ic:'🔥',w:1,h:1,s:1,o:1,p:700},
 fence:{n:'Zierzaun',ic:'🚧',w:1,h:1,s:1,o:1,p:150},stonepath:{n:'Pflasterstein',ic:'🪨',w:1,h:1,s:0,l:'f',o:1,p:120},pond:{n:'Zierteich',ic:'💧',w:2,h:2,s:1,o:1,p:3600},cart:{n:'Blumenkarren',ic:'🛒',w:2,h:1,s:1,o:1,p:1700},
 hay:{n:'Heuballen',ic:'🌾',w:1,h:1,s:1,o:1,p:400},obelisk:{n:'Obelisk',ic:'🗼',w:1,h:1,s:1,o:1,p:6200},picnic:{n:'Picknicktisch',ic:'🧺',w:2,h:1,s:1,o:1,p:1400},swing:{n:'Schaukel',ic:'🎠',w:2,h:1,s:1,o:1,p:2400}};
// Materialien: [Name, Hauptfarbe, Akzentfarbe, Preisfaktor]
const MW=[['Kiefer','#a07a4a','#7a4a2a',1],['Eiche','#73502a','#a02828',1.25],['Nussbaum','#4e3420','#2a5a9a',1.5],['Birke','#d8c8a0','#3a7a4a',1.3],['Kirschholz','#8a3a26','#e0b040',1.7],['Weiß lackiert','#ece6da','#6a8ab0',1.8],['Ebenholz','#2a1e18','#c8a040',2.2]];
const MC=[['Rot','#a02828','#e8d0a0',1],['Blau','#2a4a8a','#e0e0e8',1.1],['Grün','#2a6a3a','#e8d8a0',1.1],['Gold','#d8a830','#7a1020',1.8],['Violett','#5a2a7a','#e0c060',1.5],['Beige','#d8c8a0','#8a5a30',1]];
const MS=[['Sandstein','#c8b088','#8a7050',1],['Granit','#8a8a90','#5a5a62',1.2],['Marmor','#ece8e0','#b0a890',1.8],['Bronze','#a8743a','#5a3a1a',2],['Moosstein','#7a8a70','#3a6a2a',1.3]];
const MFL=[['Rosen','#d83a5a','#3a7a3a',1],['Tulpen','#f0c020','#3a8a3a',1],['Lavendel','#8a6ad8','#4a7a4a',1.1],['Sonnenblumen','#f0b020','#4a7a2a',1.2],['Vergissmeinnicht','#5a8ae8','#3a7a3a',1.1]];
const SHMAT={bed1:[['Stroh','#d8c070','#8a6a3a',1],['Heu & Decke','#c8a860','#a03030',1.3]],bed2:MW.slice(0,6),bed3:MW,bedk:MW.slice(1),table1:MW.slice(0,5),table2:MW,chair:MW,stool:MW.slice(0,4),bench:MW.slice(0,5),sofa:MC,
 shelf:MW.slice(0,5),bookcase:MW,wardrobe:MW,chest:MW.slice(0,5),hearth:MS,stove:[['Weiße Kacheln','#ece8e0','#3a6ab0',1],['Grüne Kacheln','#3a7a5a','#e8e0c0',1.2],['Rote Kacheln','#a04030','#e8d8b0',1.2]],lampf:[['Messing','#c8a040','#ffe0a0',1],['Eisen','#4a4a50','#ffd080',1],['Silber','#c8ccd4','#e0f0ff',1.6]],
 candle:[['Eisen','#3a3a40','#ffe0a0',1],['Messing','#c8a040','#ffe0a0',1.4],['Silber','#c8ccd4','#fff0c0',2]],rug:MC,rugs:MC,plant:[['Farn','#3a8a3a','#a06a3a',1],['Palme','#4a9a3a','#c88a5a',1.5],['Kaktus','#5a8a4a','#d07040',1.2],['Zitronenbaum','#4a8a2a','#f0e030',2]],
 vase:MFL,painting:[['Landschaft','#4a8ad0','#c8a040',1],['Porträt','#8a5a3a','#c8a040',1.3],['Seestück','#2a5a8a','#a07a3a',1.2],['Stillleben','#a06a3a','#c8a040',1.1],['Drachenjagd','#a02828','#c8a040',2]],
 tapestry:MC,mirror:[['Holzrahmen','#73502a','#cfe0ec',1],['Goldrahmen','#d8a830','#cfe0ec',2]],clock:MW.slice(1),statue:MS,armor:[['Eisen','#8a8e96','#73502a',1],['Ritter','#c8ccd4','#a02828',1.5],['Gold','#d8a830','#2a2a30',2.5]],barrel:MW.slice(0,3),crate:MW.slice(0,3),desk:MW,
 piano:[['Ebenholz','#2a1e18','#ece6da',1],['Weiß','#ece6da','#2a1e18',1.1],['Nussbaum','#4e3420','#ece6da',1]],globe:[['Messing','#c8a040','#4a8ad0',1],['Holz','#73502a','#4a9a6a',.9]],aquarium:[['Klar','#73502a','#4ab0d0',1],['Korallen','#2a1e18','#e07a5a',1.3]],bath:[['Holz','#8a5a30','#bfe0f0',1],['Kupfer','#b8703a','#bfe0f0',1.4]],
 basket:[['Weide','#b08850','#d8c8a0',1],['Kuschelkissen','#b08850','#d070a0',2]],trophy:[['Hirsch','#73502a','#d8c8a0',1],['Keiler','#4e3420','#ece6da',1.2],['Wolf','#5a5a60','#ece6da',1.4]],banner:MC,throne:[['Eiche','#73502a','#a02828',1],['Gold','#d8a830','#7a1020',1.8]],harp:[['Gold','#d8a830','#ece6da',1],['Holz','#73502a','#ece6da',.8]],
 obench:MW.slice(0,4).concat([['Schmiedeeisen','#2a2a30','#73502a',1.4]]),lantern:[['Eisen','#2a2a30','#ffd080',1],['Messing','#c8a040','#ffe0a0',1.3],['Steinsockel','#8a8a90','#ffd080',1.5]],fountain:MS,fbed:MFL,ostatue:MS,
 hedge:[['Buchs','#3a6a2a','#2a4a1a',1],['Eibe','#2a5a32','#1a3a22',1.1],['Blühend','#3a7a3a','#e870a0',1.4]],arch:MFL.slice(0,3),sign:MW.slice(0,3),birdbath:MS.slice(0,4),owell:MS.slice(0,3),pavilion:[['Weiß','#ece6da','#a02828',1],['Grün','#2a6a3a','#ece6da',1.1],['Blau','#2a4a8a','#ece6da',1.1]],
 flag:MC,planter:[['Buchskugel','#3a7a2a','#a06a3a',1],['Zypresse','#2a5a32','#8a8a90',1.2],['Apfelbäumchen','#4a8a2a','#d03030',1.4]],scarecrow:[['Klassisch','#c8a860','#a02828',1],['Kürbiskopf','#c8a860','#e07a20',1.3]],sundial:MS.slice(1,4),campfire:[['Eisen','#3a3a40','#ff8a30',1],['Stein','#8a8a90','#ff8a30',1.2]],
 fence:[['Weißer Lattenzaun','#ece6da','#c8c0b0',1],['Holzzaun','#73502a','#4e3420',1],['Schmiedeeisen','#2a2a30','#c8a040',2]],stonepath:MS.slice(0,3),pond:[['Seerosen','#3a6aa0','#e870a0',1],['Goldfische','#3a6aa0','#f08020',1.2]],cart:MFL.slice(0,3),hay:[['Stroh','#d8c070','#a08040',1]],
 obelisk:MS.slice(1,4),picnic:MW.slice(0,3),swing:MW.slice(0,3)};
const FDECO={};let DECO_N=0;
const mkDeco=(sh,m,i,ex)=>{const S=SHP[sh],id='d_'+sh+'_'+(ex?'x':'')+i;const price=Math.round(S.p*m[3]*(ex?2.6:1)/50)*50;FDECO[id]={id,sh,c1:m[1],c2:m[2],n:ex?`${S.n} „${m[0]}“`:`${S.n} (${m[0]})`,mat:m[0],price,o:!!S.o,ex:!!ex,ic:S.ic};DECO_N++;};
for(const sh in SHMAT)SHMAT[sh].forEach((m,i)=>mkDeco(sh,m,i,0));
// Exklusive Schaufenster-Stücke (nur einzeln im Schaufenster, täglich wechselnd)
const MEX=[['Drachenglut','#7a1010','#ffb030'],['Mondsilber','#b8c8e0','#5a7ab0'],['Feenholz','#c8e0b0','#e890c0'],['Obsidian','#1a1420','#9a5ad8'],['Elfenbein','#f4ecd8','#c8a040'],['Smaragd','#1a7a4a','#e8d890'],['Bernstein','#d88a20','#5a3010'],['Kristall','#bfeaf4','#ffffff'],['Sturmfeder','#3a4a6a','#e0e8f0']];
const EXSH=['bedk','sofa','throne','clock','statue','hearth','harp','lampf','fountain','ostatue','pavilion','lantern'];
{let k=0;for(let i=0;i<MEX.length;i++)for(let j=0;j<8;j++){const sh=EXSH[(i*5+j)%EXSH.length];mkDeco(sh,[MEX[i][0],MEX[i][1],MEX[i][2],1],k++,1);}}
G.FDECO=FDECO;G.SHP=SHP;
for(const id in FDECO){const d=FDECO[id],S=SHP[d.sh];STACK[id]={name:d.n,type:'furn',deco:1,desc:`${S.o?'Außen-Deko fürs Dorf':'Möbelstück fürs Haus'} · ${S.w}×${S.h} Felder${S.s?'':' · begehbar'}${S.l==='w'?' · an die Wand':''}${S.c?` · Gemütlichkeit +${S.c}`:''}`,sell:Math.round(d.price*.3)};}
const decoFoot=(id,x,y)=>{const S=SHP[FDECO[id].sh],o=[];for(let j=0;j<S.h;j++)for(let i=0;i<S.w;i++)o.push([x+i,y+j]);return o;};
G.decoFoot=decoFoot;G.decoInfo=id=>{const d=FDECO[id];return d?Object.assign({},SHP[d.sh],d):null;};
// Alte Möbel (Stufen-System) auf neue Einzelstücke abbilden
const OLDF={bed:[null,'d_bed1_0','d_bed2_0','d_bed2_1','d_bed3_1','d_bedk_1'],table:[null,'d_table1_0','d_table2_0','d_table2_1','d_table2_4'],hearth:[null,'d_hearth_0','d_hearth_1','d_hearth_2'],shelf:[null,'d_shelf_0','d_bookcase_1','d_trophy_0'],rug:[null,'d_rugs_5','d_rug_0','d_rug_3'],lamp:[null,'d_candle_0','d_lampf_0','d_lampf_2'],deco:[null,'d_plant_0','d_painting_0','d_tapestry_0','d_armor_1'],basket:[null,'d_basket_0','d_basket_1']};
for(const k in OLDF)OLDF[k].forEach((id,t)=>{if(id&&!STACK['f_'+k+t])STACK['f_'+k+t]={name:FDECO[id].n,type:'furn',desc:'Altes Möbelstück – wird ins Möbellager übernommen.',sell:1};});
const oldFid=id=>{const m=/^f_([a-z]+)(\d)$/.exec(id);return m&&OLDF[m[1]]?OLDF[m[1]][+m[2]]:null;};

// ---- Haus: großer Grundriss, Ausbaustufen schalten Räume frei
const HZ=[[8,7,15,12,0,'Stube'],[8,0,15,5,1,'Schlafzimmer'],[0,0,6,12,2,'Westflügel'],[17,0,23,12,2,'Ostflügel']];
const HUPG=[null,{n:'Schlafzimmer-Anbau',p:8000,d:'Ein zweiter Raum im Norden – Platz für Betten, Schränke und mehr.'},{n:'Zwei Seitenflügel',p:30000,d:'Ost- und Westflügel: zwei große Räume für Bibliothek, Festsaal oder Bad.'}];
G.HUPG=HUPG;G.HZ=HZ;
function homeLayout(){const lv=(P.home&&P.home.lvl)||0,L=(x,y,t)=>F(HR,x,y,t);for(let y=0;y<HR.h;y++)for(let x=0;x<HR.w;x++)L(x,y,T.VOID);
 for(const z of HZ){if(z[4]>lv)continue;for(let y=z[1];y<=z[3];y++)for(let x=z[0];x<=z[2];x++)L(x,y,T.WOOD);}
 const wallH=(y,x0,x1)=>{for(let x=x0;x<=x1;x++)if(tileAt(HR.x0+x,HR.y0+y)===T.VOID)L(x,y,T.IWALL);},wallV=(x,y0,y1)=>{for(let y=y0;y<=y1;y++)if(tileAt(HR.x0+x,HR.y0+y)===T.VOID)L(x,y,T.IWALL);};
 wallH(6,7,16);wallV(7,0,12);wallV(16,0,12);if(lv>=1){L(11,6,T.WOOD);L(12,6,T.WOOD);}if(lv>=2){L(7,9,T.WOOD);L(7,10,T.WOOD);L(16,9,T.WOOD);L(16,10,T.WOOD);}}
G.homeLayout=homeLayout;
// Feste Kollision für platzierte Stücke (Haus, Schaufenster, Dorf) – billige Lookup-Tabelle
const markItems=(list,ox,oy,on)=>{for(const it of list){const S=SHP[(FDECO[it.i]||{}).sh];if(!S||!S.s)continue;for(const [x,y] of decoFoot(it.i,ox+it.x,oy+it.y))VDS[y*W+x]=on?1:0;}};
function homeItems(){const h=P.home||(P.home={});if(!h.items)h.items=[];return h.items;}
G.homeItems=homeItems;
applyHome=function(){if(!P.home)P.home={};homeLayout();for(let y=HR.y0;y<HR.y0+HR.h;y++)for(let x=HR.x0;x<HR.x0+HR.w;x++)VDS[y*W+x]=0;markItems(homeItems(),HR.x0,HR.y0,1);G.homeV=(G.homeV||0)+1;};
G.applyHome=applyHome;
// Alte Spielstände: Stufen-Möbel → Einzelstücke, Lager-IDs umschreiben
function migrateHome(){const h=P.home||(P.home={});if(h.items)return;h.items=[];h.lvl=h.lvl||0;
 for(const k in OLDF){const t=h[k]||0;if(!t)continue;const id=OLDF[k][t];const pos=h.pos&&h.pos[k];let x,y;if(pos){x=pos[0]+8;y=pos[1]+7;}else{const d={bed:[8,7],table:[12,9],hearth:[14,7],shelf:[11,7],rug:[12,10],lamp:[10,7],deco:[13,7],basket:[14,12]}[k];x=d[0];y=d[1];}h.items.push({i:id,x,y});delete h[k];}
 delete h.pos;if(!h.items.some(it=>SHP[FDECO[it.i].sh].bed))h.items.push({i:'d_bed1_0',x:8,y:7});
 const f=P.furn||{},nf={};for(const id in f){const nid=FDECO[id]?id:oldFid(id);if(nid&&f[id]>0)nf[nid]=(nf[nid]||0)+f[id];}P.furn=nf;
 for(let i=0;i<P.inv.length;i++){const s=P.inv[i];if(s&&s.stack&&/^f_/.test(s.id)){const nid=oldFid(s.id);if(nid)P.furn[nid]=(P.furn[nid]||0)+s.count;P.inv[i]=null;}}
 // ungültige Plätze (z. B. nach dem Umbau) ins Lager
 homeLayout();h.items=h.items.filter(it=>{if(!itemFits(it.i,it.x,it.y,it,'home')){P.furn[it.i]=(P.furn[it.i]||0)+1;return false;}return true;});}
G.migrateHome=migrateHome;
const floorOK=t=>t===T.WOOD||t===T.STONEF||t===T.CARPET||t===T.STRAW;
const wallT=t=>t===T.IWALL||t===T.SWALL;
// Darf ein Stück hier stehen? mode 'home' (relativ zum Haus) oder 'town' (Weltkoordinaten)
function itemFits(id,x,y,skip,mode){const d=FDECO[id];if(!d)return false;const S=SHP[d.sh],lay=S.l||'n';const fp=decoFoot(id,x,y);
 if(mode==='home'){if(S.o)return false;const dx=HR.door.tx-HR.x0,dy=HR.h-1;for(const [a,b] of fp){if(a<0||b<0||a>=HR.w||b>=HR.h)return false;if(!floorOK(tileAt(HR.x0+a,HR.y0+b)))return false;if(lay!=='f'&&lay!=='w'&&a===dx&&b>=dy-1)return false;if(lay==='w'&&!wallT(tileAt(HR.x0+a,HR.y0+b-1)))return false;}
  const px=Math.floor(P.x/TILE)-HR.x0,py=Math.floor(P.y/TILE)-HR.y0;if(G.room===HR&&S.s&&fp.some(([a,b])=>a===px&&b===py))return false;
  for(const it of homeItems()){if(it===skip)continue;const S2=SHP[FDECO[it.i].sh],l2=S2.l||'n';if(l2!==lay)continue;if(decoFoot(it.i,it.x,it.y).some(([a,b])=>fp.some(([c,e])=>a===c&&b===e)))return false;}return true;}
 // Dorf
 if(!S.o)return false;const tw=G.townIdAt(x,y);if(!tw)return false;
 for(const [a,b] of fp){if(G.townIdAt(a,b)!==tw)return false;const t=tileAt(a,b);if(SOLIDS[t]||t===T.WATER||t===T.FIELD||t===T.CROP||t===T.WELL||t===T.WAYSTONE)return false;if(S.s&&(t===T.COBBLE||t===T.PATH||t===T.BRIDGE))return false;
  if(S.s)for(const bb of BUILD)if(!bb.wild&&a>=bb.door.tx-1&&a<=bb.door.tx+1&&b>=bb.y+bb.h&&b<=bb.y+bb.h+1)return false;}
 for(const it of townItems(tw)){if(it===skip)continue;const S2=SHP[FDECO[it.i].sh],l2=S2.l||'n';if(l2!==lay&&!(S.s&&S2.s))continue;if(decoFoot(it.i,it.x,it.y).some(([a,b])=>fp.some(([c,e])=>a===c&&b===e)))return false;}
 if(S.s){const px=Math.floor(P.x/TILE),py=Math.floor(P.y/TILE);if(fp.some(([a,b])=>a===px&&b===py))return false;}return true;}
G.itemFits=itemFits;
// Gemütlichkeit (Schlaf-Bonus) aus allen aufgestellten Stücken
comfort=()=>{let c=0;for(const it of homeItems()){const d=FDECO[it.i];if(d)c+=(SHP[d.sh].c||0)*(d.ex?2:1);}return Math.min(60,c);};G.comfort=comfort;
const homeBed=()=>{let best=null;for(const it of homeItems()){const S=SHP[FDECO[it.i].sh];if(S.bed&&(!best||S.c>SHP[FDECO[best.i].sh].c))best=it;}return best;};
G.homeBed=homeBed;
G.homeFoot=k=>{if(k!=='bed')return[];const b=homeBed();return b?decoFoot(b.i,HR.x0+b.x,HR.y0+b.y):[];};
G.homePut=(id,x,y)=>{if(!(P.furn&&P.furn[id]>0)||!itemFits(id,x,y,null,'home'))return false;P.furn[id]--;if(P.furn[id]<=0)delete P.furn[id];homeItems().push({i:id,x,y});applyHome();sfx('door');G.invDirty=true;G.save();return true;};
G.homeMove=(it,x,y)=>{if(!itemFits(it.i,x,y,it,'home'))return false;it.x=x;it.y=y;applyHome();sfx('door');G.save();return true;};
G.homeTake=it=>{const L=homeItems(),i=L.indexOf(it);if(i<0)return;L.splice(i,1);furnAdd(it.i);applyHome();sfx('hit');G.invDirty=true;G.save();};
G.homeAt=(x,y)=>{let hit=null;for(const it of homeItems())if(decoFoot(it.i,it.x,it.y).some(([a,b])=>a===x&&b===y)){const l=SHP[FDECO[it.i].sh].l||'n';if(!hit||l==='n'||(l==='w'&&(SHP[FDECO[hit.i].sh].l==='f')))hit=it;}return hit;};

// ---- Dorf-Deko: nur im Dorf, in dem man gerade steht
G.townIdAt=(x,y)=>{if(dV(x,y)<RV-1.5&&!inCastle(x,y))return'city';for(const t of TOWNS)if(!t.hostile&&Math.hypot(x-t.x,y-t.y)<t.r-1.5)return t.id;return null;};
function townItems(tid){const v=P.vdeco||(P.vdeco={});return v[tid]||(v[tid]=[]);}
G.townItems=townItems;
const VIDX=new Map();G.VIDX=VIDX;// Chunk-Schlüssel → Liste für Renderer
const vchunk=(x,y)=>Math.floor(x/CH)+','+Math.floor(y/CH);
function rebuildVillage(){VIDX.clear();VDS.fill(0);markItems(homeItems(),HR.x0,HR.y0,1);if(G.showMark)G.showMark();
 for(const tid in (P.vdeco||{}))for(const it of P.vdeco[tid]){const k=vchunk(it.x,it.y);if(!VIDX.has(k))VIDX.set(k,[]);VIDX.get(k).push(it);markItems([it],0,0,1);}G.vdecoV=(G.vdecoV||0)+1;}
G.rebuildVillage=rebuildVillage;
const dirtyFoot=(id,x,y)=>{for(const [a,b] of decoFoot(id,x,y))G.dirtyTile&&G.dirtyTile(a,b);};
G.townPut=(id,x,y)=>{const tw=G.townIdAt(x,y);if(!tw||!(P.furn&&P.furn[id]>0)||!itemFits(id,x,y,null,'town'))return false;P.furn[id]--;if(P.furn[id]<=0)delete P.furn[id];const it={i:id,x,y};townItems(tw).push(it);const k=vchunk(x,y);if(!VIDX.has(k))VIDX.set(k,[]);VIDX.get(k).push(it);markItems([it],0,0,1);G.vdecoV=(G.vdecoV||0)+1;dirtyFoot(id,x,y);sfx('door');G.save();return true;};
const vUnlink=it=>{const k=vchunk(it.x,it.y),L=VIDX.get(k);if(L){const i=L.indexOf(it);if(i>=0)L.splice(i,1);}markItems([it],0,0,0);dirtyFoot(it.i,it.x,it.y);};
G.townMove=(it,x,y)=>{if(!itemFits(it.i,x,y,it,'town'))return false;vUnlink(it);it.x=x;it.y=y;const k=vchunk(x,y);if(!VIDX.has(k))VIDX.set(k,[]);VIDX.get(k).push(it);markItems([it],0,0,1);G.vdecoV=(G.vdecoV||0)+1;dirtyFoot(it.i,x,y);sfx('door');G.save();return true;};
G.townTake=it=>{const tw=G.townIdAt(it.x,it.y)||Object.keys(P.vdeco||{}).find(k=>P.vdeco[k].includes(it));const L=townItems(tw),i=L.indexOf(it);if(i<0)return;L.splice(i,1);vUnlink(it);furnAdd(it.i);G.vdecoV=(G.vdecoV||0)+1;sfx('hit');G.save();};
G.townAt=(x,y)=>{const tw=G.townIdAt(x,y);if(!tw)return null;let hit=null;for(const it of townItems(tw))if(decoFoot(it.i,it.x,it.y).some(([a,b])=>a===x&&b===y))if(!hit||(SHP[FDECO[it.i].sh].l||'n')!=='f')hit=it;return hit;};

// ---- Schaufenster im Handwerkshof: täglich 1–2 zufällige Exklusiv-Stücke
const WERK=ROOMS.find(r=>r.id==='werk');G.WERK=WERK;
const EXPOOL=Object.keys(FDECO).filter(id=>FDECO[id].ex);G.EXPOOL_N=EXPOOL.length;
function showcase(){const dn=Math.floor(((P&&P.dayT)||0)/DAYLEN);if(!P.shopSeed)P.shopSeed=1+Math.floor(Math.random()*99999);const sd=P.shopSeed;
 const n=h2(dn,sd,4401)<.45?1:2,out=[];let k=0;while(out.length<n&&k<20){const id=EXPOOL[Math.floor(h2(dn*7+k,sd,4402)*EXPOOL.length)];if(!out.includes(id))out.push(id);k++;}
 const sold=(P.showSold&&P.showSold.d===dn)?P.showSold.ids:[];return out.map((id,i)=>({i:id,x:WERK.show[i][0],y:WERK.show[i][1],sold:sold.includes(id)}));}
G.showcase=showcase;G.showDay=()=>Math.floor(((P&&P.dayT)||0)/DAYLEN);
G.showMark=()=>{if(!WERK)return;for(let y=WERK.y0+7;y<WERK.y0+WERK.h;y++)for(let x=WERK.x0;x<WERK.x0+8;x++)VDS[y*W+x]=0;markItems(showcase().filter(s=>!s.sold),WERK.x0,WERK.y0,1);};
G.buyShow=id=>{const s=showcase().find(q=>q.i===id);if(!s||s.sold)return false;if(!G.shopOpen('baldur')){G.toast('🔒 Der Laden ist gerade geschlossen.','#ffcc80');return false;}const d=FDECO[id];if(P.gold<d.price){G.toast(`Zu wenig Gold (${d.price} nötig)`,'#ff8a80');return false;}
 P.gold-=d.price;furnAdd(id);const dn=G.showDay();if(!P.showSold||P.showSold.d!==dn)P.showSold={d:dn,ids:[]};P.showSold.ids.push(id);G.showMark();G.showV=(G.showV||0)+1;sfx('coin');G.toast(`✨ ${d.n} gehört dir! Es liegt in deinem Möbellager.`,'#ffd54a',true);G.save();return true;};
G.buyDeco=id=>{const d=FDECO[id];if(!d||d.ex)return false;if(P.gold<d.price){G.toast(`Zu wenig Gold (${d.price} nötig)`,'#ff8a80');sfx('click');return false;}P.gold-=d.price;furnAdd(id);sfx('coin');G.invDirty=true;G.save();return true;};
G.buyUpgrade=()=>{const lv=(P.home.lvl||0)+1,u=HUPG[lv];if(!u)return false;if(P.gold<u.p){G.toast(`Zu wenig Gold (${u.p.toLocaleString('de-DE')} nötig)`,'#ff8a80');return false;}P.gold-=u.p;P.home.lvl=lv;applyHome();sfx('quest');G.toast(`🏗 ${u.n} fertig! Dein Haus hat jetzt ${HZ.filter(z=>z[4]<=lv).length} Räume.`,'#ffd54a',true);G.save();return true;};

// ---- Neue Bewohner: Handwerkshof, Casino, Trankläden, Tavernen, Schmieden, Schlosswachen
const inRoom=(id,rx,ry)=>{const r=ROOMS.find(q=>q.id===id);return r?{r,x:r.x0+rx,y:r.y0+ry}:null;};
const homeDoor=id=>{const b=BUILD.find(q=>q.id===id);return b?{x:b.door.tx,y:b.y+b.h+1,b}:null;};
function mkWorker(o,home,job,bed){const hd=homeDoor(home);if(!hd)return null;const n=mkN(Object.assign({abs:1,tx:hd.x,ty:hd.y},o));n._house=hd.b;if(job){const J=inRoom(job[0],job[1],job[2]);if(J)n.job22={b:J.r.b,x:J.x,y:J.y};}if(bed){const B=inRoom(bed[0],bed[1],bed[2]);if(B)n.bed22={x:B.x,y:B.y};}return n;}
// Holger zieht in den Handwerkshof (wohnt weiter im alten Haus)
{const ho=npcById('holger');if(ho){ho._house=BUILD.find(b=>b.id==='h7');const J=inRoom('werk',3,3);ho.job22={b:J.r.b,x:J.x,y:J.y};const hd=homeDoor('h7');ho.hx=ho.x=(hd.x+.5)*TILE;ho.hy=ho.y=(hd.y+.5)*TILE;}
 const cb=BUILD.find(b=>b.id==='h7');cb.name='Holgers Haus';cb.sign=null;cb.room.name='Holgers Haus';}
mkWorker({id:'flora',name:'Gartenkünstlerin Flora',short:'Flora',look:{body:'#4a7a3a',skin:'#f0d0b0',hair:'#c8602a',dress:1,hat:'#d8c070'},persona:'Fröhliche Gartenkünstlerin im Handwerkshof von Eichenhain. Verkauft Bänke, Laternen, Brunnen, Beete und Statuen, mit denen man das Dorf schmücken kann. Schwärmt von Rosen.',greet:['Ein Dorf ist nur so schön wie seine Beete!','Eine Laterne hier, ein Brunnen da …','Riechst du die Rosen?']},'h11',['werk',12,3]);
mkWorker({id:'baldur',name:'Baumeister Baldur',short:'Baldur',look:{body:'#5a4a3a',skin:'#e0b890',hair:'#7a7a7a',beard:'#7a7a7a',hat:'#8a6a3a'},persona:'Bärbeißiger, genauer Baumeister im Handwerkshof von Eichenhain. Baut Häuser aus und plant neue Räume. Rechnet alles zweimal nach und mag keine Ausreden.',greet:['Erst messen, dann sägen.','Ein Haus wächst mit seinem Besitzer.','Gutes Handwerk hat seinen Preis.']},'h12',['werk',20,3]);
mkWorker({id:'fortunato',name:'Casinobesitzer Fortunato',short:'Fortunato',look:{body:'#5a1a3a',skin:'#e8c098',hair:'#1a1a1a',beard:'#1a1a1a',hat:'#2a1a2a',cape:'#3a0a2a'},persona:'Charmanter, geschniegelter Besitzer des Casinos „Goldene Krone“ in Eichenhain. Liebt Glücksspiel, Gold und große Worte. Ehrlich im Spiel, aber nie um einen Spruch verlegen.',greet:['Willkommen in der Goldenen Krone! Das Glück wartet.','Das Haus gewinnt immer? Nicht heute, mein Freund!','Setz dein Gold weise.']},'cas1',['casino',16,2]);
mkWorker({id:'kasimir',name:'Croupier Kasimir',short:'Kasimir',look:{body:'#2a2a3a',skin:'#e8c8a8',hair:'#3a2a1a',beard:'#3a2a1a'},persona:'Ruhiger, undurchschaubarer Croupier am Pokertisch des Casinos. Spricht leise, verzieht nie eine Miene.',greet:['Die Karten lügen nicht.','Setzen Sie, bitte.','Pokerface, mein Freund.']},'cas2',['casino',3,7]);
mkWorker({id:'bella',name:'Croupière Bella',short:'Bella',look:{body:'#7a1a2a',skin:'#f0d0b8',hair:'#e0c060',dress:1},persona:'Flinke, freundliche Croupière am Blackjack-Tisch des Casinos. Zählt schneller als jeder andere im Dorf.',greet:['Einundzwanzig – oder drüber?','Karten gefällig?','Viel Glück am Tisch!']},'cas3',['casino',5,4]);
mkWorker({id:'wenda',name:'Trankmischerin Wenda',short:'Wenda',look:{body:'#3a6a5a',skin:'#f0d0b0',hair:'#6a3a8a',dress:1},persona:'Junge Trankmischerin mit eigenem Laden in Eichenhain. Verkauft kleine Heil- und Manatränke für Anfänger. Riecht immer nach Minze.',greet:['Klein, aber wirksam!','Frisch gemischt, heute früh!','Für die großen Tränke musst du weiter reisen.']},'trank',['trank',4,1],['trank',0,4]);
// Bewohner in den Städten: Wirte, Schmiede, Trankhändler – wohnen in ihren Häusern
const TNPC={glut_tav:['inn_glut','Wirtin Hedda','Hedda','f'],moor_tav:['inn_moor','Wirt Fenno','Fenno','m'],wald_tav:['inn_wald','Wirtin Maren','Maren','f'],nebel_tav:['inn_nebel','Wirt Grimwald','Grimwald','m'],sand_tav:['inn_sand','Wirt Yusuf','Yusuf','m'],fell_tav:['inn_fell','Wirtin Pelzi','Pelzi','f'],schild_tav:['inn_schild','Wirt Hrolf','Hrolf','m'],
 glut_smith:['smith_glut','Waffenmeister Brandt','Brandt','m'],nebel_smith:['smith_nebel','Runenschmied Thrain','Thrain','m'],schild_smith:['smith_schild','Schildschmiedin Gudrun','Gudrun','f'],wald_potion:['pot_wald','Kräuterhändler Alrik','Alrik','m'],sand_potion:['pot_sand','Alchemistin Zahra','Zahra','f']};
for(const bid in TNPC){const b=BUILD.find(q=>q.id===bid);if(!b)continue;const [id,name,short,sx]=TNPC[bid],tw=TOWNS.find(t=>Math.hypot(b.x-t.x,b.y-t.y)<t.r+2),k=b.tx22;const fem=sx==='f';
 const job=k==='tav'?[bid,6,3]:k==='smith'?[bid,4,3]:[bid,4,1],bed=k==='tav'?[bid,4,0]:k==='smith'?[bid,0,4]:[bid,0,4];
 const n=mkWorker({id,name,short,town:tw&&tw.id,look:{body:k==='smith'?'#4a4a50':k==='tav'?'#8a6a3a':'#3a6a5a',skin:tw&&tw.id==='sand'?'#c68642':'#f0d0b0',hair:fem?'#8a4a2a':'#5a3a1a',dress:fem?1:0,beard:!fem?'#5a3a1a':null},persona:`${k==='tav'?'Wirt der Taverne':k==='smith'?'Schmied':'Trankhändler'} in ${tw?tw.name:'der Stadt'}.${k==='tav'?' Vermietet ein Gästezimmer für die Nacht.':''}`,greet:k==='tav'?['Ein Zimmer für die Nacht?','Setz dich, das Feuer brennt!','Bier, Met oder ein Bett?']:k==='smith'?['Der Amboss ruft.','Gutes Eisen, gute Klinge.','Für Anfänger hab ich nichts.']:['Tränke für jede Wunde.','Frisch destilliert!','Nur das Beste aus dem Kessel.']},bid,job,bed);
 if(!n)continue;if(k==='tav')SHOPS[id]={n:'Taverne '+(tw?tw.name:''),items:['beer','met','bread'],buys:'tavern',inn:1};else if(k==='smith')SHOPS[id]={n:name,items:['arrow','bolt'],smith:1,buys:'gear'};else SHOPS[id]={n:name,items:[],buys:'potion'};}
// Bodo: Arbeit hinter dem Tresen, eigenes Bett in der Taverne
{const bo=npcById('wirt');if(bo){bo.post=null;const tv=BUILD.find(b=>b.id==='tavern');bo._house=tv;const J=inRoom('tavern',6,5);bo.job22={b:tv,x:J.x,y:J.y};const B=inRoom('tavern',12,0);bo.bed22={x:B.x,y:B.y};const hd=homeDoor('tavern');bo.hx=(hd.x+.5)*TILE;bo.hy=(hd.y+.5)*TILE;}
 SHOPS.wirt&&(SHOPS.wirt.inn=1);}
// Jorg schläft in seinem Hof, Bruder Anselm im Pfarrhaus (tagsüber in der Kapelle)
{const j=npcById('jorg');if(j)j._house=BUILD.find(b=>b.id==='farm');const a=npcById('anselm');if(a){a._house=BUILD.find(b=>b.id==='h10');const J=inRoom('chapel',3,2);if(J)a.job22={b:J.r.b,x:J.x,y:J.y};}}
// Zwei Schlosswachen am Thron
{const K=ROOMS.find(r=>r.id==='keep');if(K)[[15,2,'wache_s1','Schlosswache Edmund','Edmund'],[20,2,'wache_s2','Schlosswache Wilhelm','Wilhelm']].forEach(([rx,ry,id,name,short])=>{const x=K.x0+rx,y=K.y0+ry;NPCS.push({id,name,short,abs:1,tx:x,ty:y,guard:1,lord:1,post:K,look:{body:'#7a1b1b',skin:'#e8c0a0',helm:'#c8ccd4',cape:'#5a0a10'},persona:'Schlosswache im Thronsaal von Schloss Eichenhain. Steht stramm neben dem Thron des Fürsten und spricht nur das Nötigste.',greet:['Halt. Der Fürst empfängt nur zu festen Zeiten.','Benimm dich im Thronsaal.','Für Eichenhain!'],hx:(x+.5)*TILE,hy:(y+.5)*TILE,x:(x+.5)*TILE,y:(y+.5)*TILE,fx:0,fy:1,wt:0,vx:0,vy:0,anim:0,loc:K});GUARDS.add(id);});}
// ---- Läden nach Spielerfortschritt staffeln: Schmiede (max. Stufe) & Tränke (klein / mittel / groß)
const SMCAP={hilda:12,smith_glut:24,smith_schild:36,smith_nebel:50};G.SMCAP=SMCAP;
Object.assign(STACK,{potion_s:{name:'Kleiner Heiltrank',type:'food',pct:.3,desc:'Heilt 30 % deiner LP und heilt Gift. Tippen zum Trinken.',price:14,sell:5},
 mpotion_s:{name:'Kleiner Manatrank',type:'food',mana:.35,desc:'Füllt 35 % deines Manas auf. Tippen zum Trinken.',price:12,sell:4},
 mpotion2:{name:'Großer Manatrank',type:'food',mana:1,desc:'Füllt dein Mana komplett auf.',price:80,sell:26}});
STACK.potion.name='Mittlerer Heiltrank';STACK.mpotion.name='Mittlerer Manatrank';
const PTIER=tid=>!tid||tid==='city'?0:({frost:1,moor:1,wald:1,glut:1,fell:1,sand:2,schild:2,nebel:2,schwarz:2})[tid]||1;
const PSET=[['potion_s','mpotion_s'],['potion_s','potion','mpotion_s','mpotion'],['potion','potion2','mpotion','mpotion2']];
const shopTown=id=>{const n=npcById(id);if(!n)return null;if(n.town)return n.town;const x=n.hx/TILE,y=n.hy/TILE;if(x>=WW&&n._house)return G.townIdAt(n._house.x,n._house.y);return G.townIdAt(Math.floor(x),Math.floor(y))||(TOWNS.find(t=>Math.hypot(x-t.x,y-t.y)<t.r+6)||{}).id||null;};
const isPot=id=>/^m?potion/.test(id);
for(const sid in SHOPS){const sh=SHOPS[sid];if(!sh.items)continue;const tier=PTIER(shopTown(sid));const hadPot=sh.items.some(isPot)||/^pot_|^wenda$/.test(sid);sh.items=sh.items.filter(i=>!isPot(i));if(hadPot)sh.items=PSET[tier].concat(sh.items);}
SHOPS.wenda={n:'Wendas Trankladen',items:PSET[0].slice(),buys:'potion'};SHOPS.pot_wald&&(SHOPS.pot_wald.items=PSET[1].slice());SHOPS.pot_sand&&(SHOPS.pot_sand.items=PSET[2].slice());
// Schmiede-Ware: je Schmied eigene Höchststufe
{const _ss=G.smithStock;G.smithStock=sid=>{sid=sid||G._shopSid||'hilda';const cap=SMCAP[sid]||P.level;const L0=P.level;const st=P.smithStocks||(P.smithStocks={});const day=Math.floor((P.dayT||0)/720);let s=st[sid];
 if(!s||s.day!==day||s.lvl!==L0){const keep=P.smithStock;P.smithStock=null;P.level=Math.min(L0,cap);try{_ss();}finally{P.level=L0;}s=st[sid]={day,lvl:L0,items:P.smithStock.items,cap};P.smithStock=keep;}return s.items;};
 G.buyGear=i=>{const st=G.smithStock(),it=st[i];if(!it)return false;if(P.gold<it.shopPrice){G.toast('Nicht genug Gold','#ff8a80');return false;}if(!P.inv.some(s=>!s)){G.toast('Kein Platz im Rucksack','#ff8a80');return false;}P.gold-=it.shopPrice;const c=Object.assign({},it);delete c.shopPrice;give(c);st.splice(i,1);sfx('coin');G.invDirty=true;return true;};}
// quickHeal kennt auch kleine Tränke
{const _qh=quickHeal;quickHeal=G.quickHeal=function(){if(!P.inv.some(s=>s&&(s.id==='potion'||s.id==='potion2'))){const i=P.inv.findIndex(s=>s&&s.id==='potion_s');if(i>=0){useItem(i);return;}}return _qh();};}

// ---- Tagesabläufe: Arbeitszeiten, Sonntags-Andacht, Mittwochs-Stammtisch, feste Betten
G.jobNow=(n,t,wd)=>{if(!n.job22||!G.shopOpen(n.id,t,wd))return null;return{b:n.job22.b,spot:{x:n.job22.x,y:n.job22.y},act:'work'};};
const CHAPEL=BUILD.find(b=>b.id==='chapel');
G.weekWant=(n,t,ph,h,r,wd0)=>{const wd=wd0!=null?wd0:wday();
 if(n.bed22&&ph==='sleep')return{b:h,spot:{x:n.bed22.x,y:n.bed22.y,bed:1},act:'sleep'};
 if(wd===6&&t>=90&&t<165&&!n.lord&&!n.job22&&r<.75){if(!n.town&&CHAPEL)return{b:CHAPEL,spot:'pew',act:'sit'};const tv=n.town&&BUILD.find(b=>b.id===n.town+'_tav');if(tv&&tv.room)return{b:tv,spot:'table',act:'sit'};}
 if(wd===2&&ph==='social'&&!n.lord&&!n.child&&!n.job22){const tv=!n.town?BUILD.find(b=>b.id==='tavern'):BUILD.find(b=>b.id===n.town+'_tav');if(tv&&tv.room)return{b:tv,spot:'table',act:'drink'};}
 return null;};
G.nbBed=(r,x,y)=>{for(const [dx,dy] of [[1,0],[-1,0],[0,1],[1,1],[-1,1],[0,2],[1,2],[-1,2]]){const ax=x+dx,ay=y+dy;if(ax<r.x0||ay<r.y0||ax>=r.x0+r.w||ay>=r.y0+r.h)continue;const t=tileAt(ax,ay);if(!SOLIDS[t]&&t!==T.DOOR&&!VDS[ay*W+ax])return[ax,ay];}return[x,y];};

// ---- Gästezimmer mieten (eine Nacht)
const RENT={wirt:60,inn_moor:90,inn_wald:120,inn_glut:180,inn_fell:150,inn_sand:300,inn_schild:350,inn_nebel:500};G.RENT=RENT;
G.rentRoom=(id,paid)=>{const pr=RENT[id]||100,n=npcById(id),b=n&&n._house;if(!b||!b.room||!b.room.guest)return false;if(!paid){if(P.gold<pr){G.toast(`Zu wenig Gold (${pr} nötig)`,'#ff8a80');return false;}P.gold-=pr;}P.rent={r:b.room.id,until:(Math.floor((P.dayT||0)/DAYLEN)+1)*DAYLEN+90};sfx('coin');G.toast(`🛏 Das Gästezimmer gehört heute Nacht dir. Leg dich ab dem Abend ins Bett (bis morgen 09:00 Uhr).`,'#ffd54a',true);G.save();return true;};
G.rentedHere=()=>!!(P.rent&&G.room&&P.rent.r===G.room.id&&(P.dayT||0)<P.rent.until);

// ---- Wachen: getötete Wachen bleiben bis zum Morgen liegen; Kopfgeld nur bei lebenden Wachen
G.guardDown=n=>{n.dead=1;n.ko=0;n.lie=1;n.path=[];const dn=Math.floor((P.dayT||0)/DAYLEN),t=(P.dayT||0)%DAYLEN;n.deadUntil=(t<0?dn:dn+1)*DAYLEN+5;P.guardKill=dn;};
G.bountyBlocked=()=>P.guardKill!=null&&P.guardKill===Math.floor((P.dayT||0)/DAYLEN);

// ---- Nebelwacht: Nebelschleier an den Toren, bis die Reise in die Nebellande beginnt; Nebelwächter halten die Zufahrt
const NEB=TOWNS.find(t=>t.id==='nebel');
G.mistOpen=()=>!!(P&&(P.devMist||G.pastStep('n1')||(G.curStep&&G.curStep()&&G.curStep().id==='n1'&&P.macc)));
const MISTPOST=[];NEB.gates.forEach(g=>{for(const k of [6,9])for(const s2 of [-2,2])MISTPOST.push([Math.round(NEB.x+Math.cos(g)*(NEB.r+k)-Math.sin(g)*s2),Math.round(NEB.y+Math.sin(g)*(NEB.r+k)+Math.cos(g)*s2)]);});
G._mistDead={};
function mistTick(dt){G._msT=(G._msT||0)-dt;if(G._msT>0)return;G._msT=2;const op=G.mistOpen();if(op!==G._mistWas){G._mistWas=op;for(const g of NEB.gates)for(let s2=-1;s2<=1;s2++){const x=Math.round(NEB.x+Math.cos(g)*NEB.r-Math.sin(g)*s2),y=Math.round(NEB.y+Math.sin(g)*NEB.r+Math.cos(g)*s2);G.dirtyTile&&G.dirtyTile(x,y);}}
 if(G.room)return;const near=Math.hypot(P.x/TILE-NEB.x,P.y/TILE-NEB.y)<NEB.r+34;if(!near){for(const m of G.mons)if(m.mistg&&!m.aggro)m.dead=true;return;}
 if(!op&&!P._mistTip&&Math.hypot(P.x/TILE-NEB.x,P.y/TILE-NEB.y)<NEB.r+6){P._mistTip=1;G.toast('🌫 Ein uralter Nebelschleier versiegelt die Tore von Nebelwacht. Erst wenn dich die Hauptquest in die Nebellande führt, öffnet Wächterin Runa den Weg.','#c8b8ff',true);}
 const lvl=Math.max(34,zoneLevel(NEB.x-30,NEB.y));MISTPOST.forEach(([x0,y0],i)=>{if(G.mons.some(m=>m.mistg===i+1&&!m.dead))return;if((G._mistDead[i]||0)>G.time)return;const x=(x0+.5)*TILE,y=(y0+.5)*TILE;if(Math.hypot(P.x-x,P.y-y)<TILE*10||!walkTile(x0,y0))return;
  const m=mkMonster(i%4===0?'runenwirker':'sucherkrieger',lvl+(i%4===0?2:0),x,y);m.mistg=i+1;m.passive=false;m.home={x,y};m.name='Nebelwächter';G.mons.push(m);});}
G.mistKilled=m=>{if(m.mistg)G._mistDead[m.mistg-1]=G.time+240;};
G.mistTick=mistTick;

// ---- Härtere Strafen: Tod & Kerker
G.deathLoss=()=>{const D=G.D();const pct=Math.max(D.goldLoss||0,G.settings.diff==='leicht'?.08:G.settings.diff==='schwer'?.3:.2);return Math.floor(P.gold*pct)+Math.min(P.gold,Math.round(P.level*15*(G.settings.diff==='leicht'?.5:1)));};
G.jailTake=()=>{const cand=[];P.inv.forEach((s,i)=>{if(s&&!(s.stack&&STACK[s.id]&&(STACK[s.id].qitem||STACK[s.id].type==='quest'))&&i!==P.sel)cand.push(i);});const out=[];for(let k=0;k<3&&cand.length;k++){const j=cand.splice(Math.floor(Math.random()*cand.length),1)[0],s=P.inv[j];out.push(G.iname?G.iname(s)+(s.count>1?' ×'+s.count:''):s.id);P.inv[j]=null;}G.invDirty=true;return out;};


// ---- Angebote (Shop-Fenster mit Bild, Beschreibung & Werten) und Dienste der NPCs
const OB=(l,f,c)=>({l,f,c:c==null?1:c});
G.offers=id=>{const lv=P.mapR||0,out=[];
 if(id==='edwin'){out.push({ic:'🗺',n:'Ortsmarker aller Städte',d:'Trägt alle Städte, Dörfer und Königreiche dauerhaft auf deiner Karte ein – auch die, die du noch nicht besucht hast.',st:['Einmaliger Kauf','Wirkt sofort'],price:120,own:!!P.mapMarks,buy:()=>{P.mapMarks=1;G.ui&&G.ui.revealTowns&&G.ui.revealTowns();G.toast('🗺 Alle Städte und Dörfer sind jetzt auf deiner Karte eingetragen.','#ffd54a',true);}});
  [250,600,1400].forEach((c,i)=>out.push({ic:'🔭',n:`Kartenverbesserung Stufe ${i+1}`,d:'Beim Erkunden deckst du einen größeren Bereich um dich herum auf der Karte auf.',st:[`Sichtweite ${9+i*3} → ${12+i*3} Felder`,i?`Benötigt Stufe ${i}`:'Erste Stufe'],price:c,own:lv>i,lock:lv<i,buy:()=>{P.mapR=i+1;sfx('quest');G.toast(`🔭 Beim Erkunden deckst du jetzt ${12+i*3} Felder um dich auf.`,'#ffd54a',true);}}));}
 if(id==='holger')out.push({ic:'🔨',n:'Schreinerhammer',d:'Werkzeug zum Einrichten. Halte ihn im eigenen Haus in der Hand und öffne mit ✋ / Rechtsklick den Einrichtungsplan.',st:['Werkzeug','Unbegrenzt haltbar'],price:60,own:countItem('hammer')>0,buy:()=>give(mkStack('hammer',1))});
 if(id==='baldur'){const L=P.home.lvl||0;HUPG.forEach((u,i)=>{if(!u)return;out.push({ic:'🏗',n:u.n,d:u.d,st:[`Ausbaustufe ${i}`,`Räume danach: ${HZ.filter(z=>z[4]<=i).length}`,`Neue Fläche: ${HZ.filter(z=>z[4]===i).reduce((a,z)=>a+(z[2]-z[0]+1)*(z[3]-z[1]+1),0)} Felder`],price:u.p,own:L>=i,lock:L<i-1,plan:i,buy:()=>{P.home.lvl=i;applyHome();sfx('quest');G.toast(`🏗 ${u.n} fertig! Dein Haus hat jetzt ${HZ.filter(z=>z[4]<=i).length} Räume.`,'#ffd54a',true);}});});}
 if(RENT[id]){const n=npcById(id),b=n&&n._house;out.push({ic:'🛏',n:'Gästezimmer für eine Nacht',d:'Ein eigenes Zimmer mit Bett in dieser Taverne. Ab dem Abend kannst du dort schlafen – mit vollem Ausruh-Bonus wie zu Hause.',st:['Gilt bis morgen 09:00 Uhr','Leben, Ausdauer & Mana voll',`Ausgeruht-Bonus +12 %`],price:RENT[id],own:!!(P.rent&&b&&b.room&&P.rent.r===b.room.id&&(P.dayT||0)<P.rent.until),buy:()=>G.rentRoom(id,1)});}
 return out;};
G.buyOffer=(id,k)=>{const o=G.offers(id)[k];if(!o||o.own||o.lock)return false;if(P.gold<o.price){G.toast(`Zu wenig Gold (${o.price} nötig)`,'#ff8a80');sfx('click');return false;}P.gold-=o.price;o.buy();sfx('coin');G.invDirty=true;G.save();return true;};
G.services=(n,d)=>{const id=n.id,open=!G.shopOpen||G.shopOpen(id),U=G.ui;if(!U)return;const add=(l,f)=>d.b.unshift(OB(l,f));
 if(['holger','flora','baldur','edwin','fortunato','kasimir','bella'].includes(id)||RENT[id]){if(!open){if(!SHOPS[id])d.b.push(OB(`🔒 Geschlossen – geöffnet ${G.shopHoursTxt(id)}`,()=>G.toast(`🕰 ${WDAY[wday()]}, ${clockStr(G.dayInfo().t)} Uhr – ${n.short} ist ${G.shopHoursTxt(id)} für dich da.`,'#ffcc80',true),0));return;}
  const inShop=n.job22&&n.loc===n.job22.b.room;if((id==='holger'||id==='flora'||id==='baldur')&&!inShop){d.b.push(OB('🏪 Verkauf nur im Laden (Handwerkshof)',()=>G.toast('🪚 Holger, Flora und Baldur verkaufen nur in ihrem Handwerkshof im Süden des Dorfs.','#ffcc80',true),0));return;}
  if(id==='holger'){add('🔨 Werkzeug',()=>U.openOffers('holger'));add('🪑 Möbelkatalog',()=>U.openCatalog('in'));}
  if(id==='flora')add('🌷 Dorf- & Park-Deko',()=>U.openCatalog('out'));
  if(id==='baldur'){add('🪟 Schaufenster (heute)',()=>U.openShowcase());add('🏗 Haus ausbauen',()=>U.openOffers('baldur'));}
  if(id==='edwin')add('🗺 Kartenladen',()=>U.openOffers('edwin'));
  if(RENT[id])add(`🛏 Zimmer mieten (${RENT[id]} G)`,()=>U.openOffers(id));
  if(id==='kasimir')add('🃏 Casino Hold’em spielen',()=>U.openCasino('poker'));
  if(id==='bella')add('🂡 Blackjack spielen',()=>U.openCasino('bj'));
  if(id==='fortunato'){add('🎡 Roulette',()=>U.openCasino('roulette'));add('🎰 Spielautomat',()=>U.openCasino('slots'));const q=P.q||(P.q={});if(!q.casino)d.b.push(OB('Gibt es hier auch Arbeit?',()=>{q.casino='on';q.casW0=P.casWins||0;G.toast('📜 Nebenquest: Glückssträhne – gewinne 5 Runden im Casino.','#ffd54a',true);}));else if(q.casino==='on'&&(P.casWins||0)-(q.casW0||0)>=5)d.b.unshift(OB('🍀 Glückssträhne abgeben',()=>{q.casino='done';P.gold+=400;furnAdd('d_flag_3');gainXP(Math.round(xpNeed(P.level)*.15));G.toast('🍀 Fortunato: „Ein Naturtalent!“ +400 Gold und ein goldener Fahnenmast fürs Dorf.','#ffd54a',true);sfx('quest');G.save();}));}}};
// Casino: Ein- und Auszahlungen
G.casinoBet=v=>{v=Math.floor(v);if(v<=0||P.gold<v)return false;P.gold-=v;G.invDirty=true;return true;};
G.casinoPay=(v,win)=>{v=Math.floor(v);if(v>0)P.gold+=v;if(win){P.casWins=(P.casWins||0)+1;}const st=P.stats||(P.stats={});st.casino=(st.casino||0)+1;G.invDirty=true;G.save();};

// Neuer Tag: Wochentag ansagen
G.weekTick=()=>{const dn=Math.floor((P.dayT||0)/DAYLEN);if(G._wdN===dn)return;const first=G._wdN==null;G._wdN=dn;if(first)return;const wd=wday();G.toast(`📅 ${WDAY[wd]}${wd===6?' – Sonntag: Die Läden im Handwerkshof haben Ruhetag, viele gehen in die Kapelle.':wd===2?' – abends trifft sich das Dorf in der Taverne.':''}`,'#ffe9b0');if(G.showMark)G.showMark();G.showV=(G.showV||0)+1;};


// ===================== v23 (Teil 4): Guide-Buch – Daten (spoilerfrei, schaltet sich durch Spielen frei) =====================
const GUIDE_MECH=[
 ['🧭 Steuerung & Grundlagen','Laufen mit WASD bzw. dem linken Stick, angreifen mit Linksklick bzw. ⚔. Mit ✋ / Rechtsklick sprichst du mit Leuten, öffnest Türen und Kisten oder nutzt Werkzeuge. Hinter Wegpunkt-Steinen kannst du später schnell reisen.'],
 ['🌱 Anbauen (Harke & Gießkanne)','Mit der Harke lockerst du Erde auf, nur höchstens 3 Felder vom Wasser entfernt. Säe, dann gieße mit der Gießkanne – ein Guss hält einen Tag. Die Kanne füllst du am Wasser wieder auf. Pflanzen wachsen nur, solange sie nass sind. Die Ackerfelder im Dorf gelten schon als bewässert. Beim Ernten springt manchmal Saat zurück.'],
 ['🌸 Blumen & Setzlinge','Blumen wachsen ohne Gießen. Setzlinge werden nach etwa zwei Tagen zu echten Bäumen. Beides geht auch außerhalb der Mauern – aber nie auf Wasser, Lava oder Wegen.'],
 ['🌾 Gras schneiden für Samen','Hohes Gras kannst du mit jeder Waffe oder jedem Werkzeug abschlagen. Ab und zu fallen dabei Samen heraus. Das Gras wächst mit der Zeit nach.'],
 ['🪓 Holzfällen','Mit einer Axt in der Hand fällst du Bäume mit wenigen Schlägen. Du bekommst Holz, Stöcke, manchmal Harz und Setzlinge. Gefällte Bäume wachsen nach ein paar Tagen nach.'],
 ['🌳 Wald & Gestrüpp','Bäume blockieren nur am Stamm – du gleitest daran vorbei. Gestrüpp und Riesenbüsche kannst du durchqueren; sie bremsen dich etwas, verstecken dich aber auch.'],
 ['🐱 Katzen zähmen','Streunende Katzen sind scheu. Wer geduldig ist und ihnen immer wieder etwas Leckeres anbietet, gewinnt vielleicht einen treuen Begleiter fürs eigene Haus.'],
 ['🐴 Pferde & Reiten','Am Stall gibt es Pferde und Zubehör. Mit der Reit-Taste (R bzw. 🐎) steigst du auf und ab. Pferde mögen Karotten. Ein gestürztes Pferd erholt sich erst, wenn du richtig geschlafen hast.'],
 ['🔍 Geheimnisse & Kisten','Eldmar ist voller versteckter Kisten, Höhlen und Orte, die man nicht gleich sieht. Schau hinter Felsen, in Ruinen, an Ufern und am Ende von Pfaden. Manche Wege öffnen sich erst später.'],
 ['🛏 Schlafen & Gemütlichkeit','Schlafen geht ab dem Abend im eigenen Bett oder in einem gemieteten Gästezimmer. Danach bist du „ausgeruht“. Je gemütlicher dein Haus eingerichtet ist, desto stärker wirkt das.'],
 ['🏡 Einrichten & Dorf-Deko','Mit dem Schreinerhammer in der Hand öffnest du im eigenen Haus (oder in einem befreundeten Dorf) einen zoombaren Plan. Dort stellst du gekaufte Möbel bzw. Deko frei auf – so viele du willst.'],
 ['📅 Woche & Öffnungszeiten','Eine Woche hat sieben Tage. Händler haben Arbeitszeiten, manche einen Ruhetag. Die genauen Zeiten einer Person stehen hier im Buch, sobald du einmal mit ihr gesprochen hast.'],
 ['🍞 Kochen & Stärkungen','Bäcker backen aus Zutaten Gerichte, die dich für einige Minuten stärken (Tempo, Stärke, Glück …). Aktive Stärkungen siehst du oben neben deinem Gold.'],
 ['⚖ Gesetz & Strafen','Diebstahl und Angriffe bringen Kopfgeld. Wachen bieten Bezahlen, Kerker oder Flucht an. Im Kerker verlierst du Gold und die Wachen nehmen dir Gegenstände ab. Auch der Tod kostet spürbar Gold – sei vorsichtig.'],
 ['💰 Was sich zum Farmen lohnt','Gildenaufträge bringen gutes Gold und wechseln alle drei Tage. Jagdtrophäen verkaufst du am besten bei der Abenteurergilde. Holz, Ernte und Blumen sind sichere Einnahmen. Bosse lassen öfter starke Ausrüstung fallen. Im Handwerkshof gibt es täglich wechselnde Einzelstücke – schau öfter vorbei.']];
G.GUIDE_MECH=GUIDE_MECH;
const TNAME=tid=>tid==='city'?'Eichenhain':tid==='wild'?'Unterwegs in Eldmar':(TOWNS.find(t=>t.id===tid)||{}).name||tid;
const npcTown=n=>{if(n.town)return n.town;let x=n.hx/TILE,y=n.hy/TILE;if(x>=WW){const b=n._house||(n.loc&&n.loc.b)||(n.post&&n.post.b);if(b){x=b.x;y=b.y;}else{const r=ROOMS.find(q=>x>=q.x0&&x<q.x0+q.w&&y>=q.y0&&y<q.y0+q.h);if(r&&r.b){x=r.b.x;y=r.b.y;}}}
 const tx=Math.floor(x),ty=Math.floor(y);if(dV(tx,ty)<RV+6)return'city';const t=TOWNS.find(q=>Math.hypot(tx-q.x,ty-q.y)<q.r+6);return t?t.id:'wild';};
const ROLEW=n=>{const nm=n.name||'',sh=n.short||'';const r=nm.replace(sh,'').trim();return r&&r!==nm?r:(n.child?'Kind':'Bewohner');};
function npcCan(n){const id=n.id,c=[],sh=SHOPS[id];if(sh){if(sh.smith)c.push('Schmiedeware & Ausrüstung');else c.push('Handel: '+(sh.n||'Waren'));}
 if(id==='holger')c.push('Möbel & Schreinerhammer');if(id==='flora')c.push('Dorf- & Park-Deko');if(id==='baldur')c.push('Hausausbau & Schaufenster');if(id==='edwin')c.push('Karten & Ortsmarker');
 if(RENT[id])c.push('Gästezimmer');if(id==='fortunato')c.push('Spielautomaten & Roulette');if(id==='kasimir')c.push('Casino Hold’em');if(id==='bella')c.push('Blackjack');if(id==='mara')c.push('Heilung');if(id==='isolde')c.push('Gildenaufträge');
 if(isGuard(n))c.push('Wache – Kopfgeld begleichen');if(n.horse||id==='matthes')c.push('Pferde & Stall');return c;}
function npcDetail(n){const id=n.id,o=[];const hrs=(SHOPS[id]||G.offers(id).length||['fortunato','kasimir','bella','anselm'].includes(id))?G.shopHoursTxt(id):null;if(hrs)o.push('🕰 '+hrs);
 if(n.job22){const b=n.job22.b;o.push('🛠 Arbeitet '+(b&&b.name?'im Gebäude „'+b.name+'“':'an festem Platz')+'.');}
 const h=n._house||(typeof houseOf==='function'?houseOf(n):null);if(h&&h.name)o.push('🛏 Schläft nachts: '+h.name+'.');else if(h)o.push('🛏 Schläft nachts in ihrem/seinem Haus.');
 if(!n.lord&&!n.job22&&!isGuard(n)){const tw=npcTown(n);o.push(tw==='city'?'⛪ Sonntagvormittag oft in der Kapelle, mittwochabends in der Taverne.':'🍺 Mittwochabends meist in der Taverne.');}
 const sh=SHOPS[id];if(sh&&sh.items&&sh.items.length)o.push('💰 Preise: '+sh.items.slice(0,10).map(i=>STACK[i]&&STACK[i].price?`${STACK[i].name} ${STACK[i].price*(STACK[i].pack||1)} G`:'').filter(Boolean).join(' · '));
 if(SMCAP[id])o.push(`⚒ Ausrüstung bis höchstens Stufe ${SMCAP[id]}.`);if(RENT[id])o.push(`🛏 Gästezimmer: ${RENT[id]} Gold pro Nacht.`);
 if(id==='baldur')o.push('🏗 Ausbau: '+HUPG.filter(Boolean).map(u=>`${u.n} ${u.p.toLocaleString('de-DE')} G`).join(' · '));if(id==='edwin')o.push('🗺 '+G.offers('edwin').map(x=>`${x.n} ${x.price} G`).join(' · '));
 return o;}
// v24: genauer Wochenplan einer Person – direkt aus derselben Tagesablauf-Logik berechnet, nach der sie im Spiel läuft
const ACTN={hammer:'schmiedet',knead:'backt',brew:'braut Tränke',saw:'sägt',mend:'flickt',write:'schreibt',spin:'spinnt',stir:'kocht',sleep:'schläft',work:'arbeitet',drink:'sitzt bei einem Getränk',eat:'isst',warm:'wärmt sich am Feuer',sit:'sitzt',pray:'betet',read:'liest',cook:'kocht',sew:'näht',craft:'werkelt',count:'zählt Gold',guard:'hält Wache'};
const placeName=b=>b?(b.room&&b.room.name)||b.name||(b.kind==='keep'?'Burg':b.kind==='chapel'?'Kapelle':'Haus'):'';
const outsideName=n=>{const x=n.hx/TILE,y=n.hy/TILE;let best=null,bd=1e9;for(const b of BUILD){if(b.wild||!b.name)continue;const d=Math.hypot(b.x+b.w/2-x,b.y+b.h/2-y);if(d<bd){bd=d;best=b;}}const tw=npcTown(n);return (bd<14&&best?'bei „'+best.name+'“':'draußen')+(tw==='wild'?'':' ('+TNAME(tw)+')');};
G.weekPlan=n=>{const dn=Math.floor((P.dayT||0)/DAYLEN),ws=dn-dn%7,out=[];const fixed=n.post&&n.post.b?placeName(n.post.b):null;
 for(let wd=0;wd<7;wd++){const segs=[];let cur=null;for(let t=0;t<DAYLEN;t+=15){let lab;if(fixed)lab='hält sich in „'+fixed+'“ auf';else{const w=want(n,t,ws+wd);if(!w)lab=(phase(t)==='sleep'?'unterwegs ':'ist ')+outsideName(n);else{const pl=placeName(w.b);lab=(ACTN[w.act]||'ist')+(pl?' – '+pl:'');}}
  if(!cur||cur.l!==lab){cur={l:lab,a:t,b:t+15};segs.push(cur);}else cur.b=t+15;}
  // über Mitternacht (06:00-Grenze) zusammenfassen bleibt getrennt, damit die Uhrzeiten stimmen
  out.push({wd,name:WDAY[wd],today:wd===dn%7,segs:segs.map(q=>({from:clockStr(q.a),to:clockStr(q.b%DAYLEN),l:q.l,now:wd===dn%7&&(P.dayT%DAYLEN)>=q.a&&(P.dayT%DAYLEN)<q.b}))});}
 return out;};
G.guideNPCs=()=>{const g={};for(const n of NPCS){if(n.hidden||n.id==='elara'&&!G.npcVisible(n))continue;const tw=npcTown(n);(g[tw]||(g[tw]=[])).push(n);}
 const order=['city'].concat(TOWNS.map(t=>t.id),['wild']).filter(k=>g[k]);return order.map(k=>({id:k,name:TNAME(k),list:g[k].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(n=>{const met=!!(P.met&&P.met[n.id]);return{id:n.id,name:n.name,role:ROLEW(n),can:npcCan(n),met,det:met?npcDetail(n):null};})}));};
const BIOME_ORDER=['m','f','s','w','i','a','d','e','p','n',''];const BIOME_N={m:'Sonnenwiesen',f:'Finsterwald',s:'Nebelmoor',w:'Steinöde',i:'Frostlande',a:'Aschenberge',d:'Schattenwald',e:'Sengende Dünen',p:'Graukamm-Gebirge',n:'Nebellande','':'Dungeons & Verliese'};
G.guideMobs=()=>{const D=G.D(),luck=1+(G.S.luck||0)/100,pc=v=>v>=.995?'100 %':v>=.1?Math.round(v*100)+' %':(Math.round(v*1000)/10).toLocaleString('de-DE')+' %';const out=BIOME_ORDER.map(b=>({b,name:BIOME_N[b],list:[]}));
 for(const k in MT){const t=MT[k],n=(P.kills||{})[k]||0;const b0=(t.b||'')[0]||'';const sec=out.find(s=>s.b===b0)||out[out.length-1];if(!n){sec.list.push({k,unknown:1});continue;}
  const dr=[['🪙 Gold',pc(.6)],['⚔ Ausrüstung (zufällig)',pc(Math.min(.95,D.chN*luck))],['🧪 Heiltrank',pc(.05)],['🔷 Manatrank',pc(.025)],['🌱 Saat',pc(.04)],[t.shot&&t.shot.kind==='arrow'?'🏹 Pfeile':'🏹 Pfeile/Bolzen',pc(t.shot&&t.shot.kind==='arrow'?.45:.04)]];
  if(STACK['m_'+k])dr.push(['✦ '+STACK['m_'+k].name,pc(.05*(1+(G.S.luck||0)/200))]);for(const e of UNIQ[k]||[])dr.push(['★ '+e.name+(e.d?' ('+e.d+')':''),pc((e.ch||.035)*luck)]);
  sec.list.push({k,name:t.n,kills:n,lv:t.lv,passive:!!t.passive,drops:dr});}
 const bosses=Object.keys(BOSSES).map(k=>{const B=BOSSES[k],n=(P.bossSeen||{})[k]||0;if(!n)return{k,unknown:1};return{k,name:B.n,kills:n,lv:B.lv,drops:[['⚔ Beute (selten bis mythisch)',pc(Math.min(.95,D.chB*luck))]].concat((B.loot||[]).map(e=>['👑 '+e.name,'Teil der Boss-Beute'])).concat([['🪙 Viel Gold','immer'],['🧪 Heiltrank',pc(.35)]])};});
 return{biomes:out.filter(s=>s.list.length),bosses};};
G.guideQuests=()=>{const QL=G.questLog();const st=P.stats||{};return{main:QL.main,side:QL.side,done:Object.values(P.q||{}).filter(v=>v==='done').length,kills:st.kills||0,bosses:st.bosses||0,met:Object.keys(P.met||{}).length,npcs:NPCS.length};};


// ===================== v23: Einzigartige Menschen in 3D – Statur nach Stand/Beruf, Frisur, Gesichtsmerkmale, Händigkeit =====================
const FAT=/Fürst|König|Jarl|Kaufmann|Händler|Wirt|Casinobesitzer|Bürgermeister|Vogt|Bäcker|Koch|Köchin|Graf|Sultan|Kämmerer/,MUSC=/Schmied|Wache|Hauptmann|Förster|Holzfäll|Bauer|Bäuerin|Knecht|Jäger|Söldner|Walküre|Krieger|Ritter|Waffenmeister|Stallmeister|Fischer|Zimmermann|Schreiner|Baumeister|Bergmann|Gladiator|Schlosswache|Torwache/,THIN=/Witwe|Heiler|Bettler|Gelehrt|Kartograph|Schreiber|Bruder|Mönch|Alchemist|Trank|Croupier|Kräuter|Prophet|Seher|Nonne|Weise|Bibliothek|Waise/,SCHOL=/Kartograph|Gelehrt|Schreiber|Baumeister|Bibliothek|Alchemist|Astrolog|Chronist/;
const HSM=['short','messy','side','buzz','curly','wavy','short','side','bald'],HSF=['long','wavy','curly','bun','braid','long','side','bun'],BEARDS=['short','stubble','mustache','goatee','long','small','full'];
G.look3=n=>{if(n._l3)return n._l3;const l=n.look||{},nm=n.name||'',id=n.id||'x';let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;const r=k=>h2(h%9973,k,5101);const fem=!!(l.dress||l.fem);
 const o={};if(!n.child){if(FAT.test(nm)||r(1)<.08)o.fat=FAT.test(nm)?1:.6;else if(MUSC.test(nm)||r(2)<.1)o.musc=1;else if(THIN.test(nm)||r(3)<.12)o.thin=1;o.ht=.94+r(4)*.12+(o.musc?.03:0);}
 if(!l.hairStyle&&l.hair)o.hairStyle=fem?HSF[Math.floor(r(5)*HSF.length)]:HSM[Math.floor(r(5)*HSM.length)];
 if(l.beard&&!l.beardS)o.beardS=BEARDS[Math.floor(r(6)*BEARDS.length)];
 const mk=r(7);o.mark=l.mark||(mk<.14?'freckles':mk<.22?'scar':mk<.3?'mole':null);if(SCHOL.test(nm)||r(8)<.07)o.glasses=1;if(r(9)<.12)o.lefty=1;
 o.eyeC=l.eyeC||['#4a3020','#2a4a7a','#3a6a3a','#6a5a3a','#3a3a3a'][Math.floor(r(10)*5)];if(fem&&!l.lips)o.lips=['#b0505a','#a04040','#c06070'][Math.floor(r(11)*3)];if(!fem&&r(12)<.3)o.brows='thick';
 return n._l3=o;};
{const _tp=G.targetPos,_tl=G.targetLabel;G.targetPos=t=>G.extraPos(t)||_tp(t);G.targetLabel=t=>G.extraLabel(t)||_tl(t);}
{const _ng=G.newGame;G.newGame=function(d){_ng(d);P.qv=22;P.home={lvl:0,items:[{i:'d_bed1_0',x:8,y:7}]};P.vdeco={};P.furn={};G.migrateHome();applyHome();G.rebuildVillage();G._wdN=null;try{G.applyTrees(true);}catch(e){}G.CATS=null;G.PET=null;G.room=HR;P.x=(HR.door.tx+.5)*TILE;P.y=(HR.y0+9.5)*TILE;P.fx=0;P.fy=1;for(const n of NPCS){n.loc=null;clearPose(n);}};}
{const _ld=G.load;G.load=function(){const ok=_ld();if(ok){if(!P.home)P.home={bed:1};P.och=P.och||{};P.z=0;P.vz=0;G.migrateHome();applyHome();G.rebuildVillage();G._wdN=null;{const tx=Math.floor(P.x/TILE),ty=Math.floor(P.y/TILE);if(tx>=HR.x0-1&&tx<=HR.x0+HR.w&&ty>=HR.y0-1&&ty<=HR.y0+HR.h&&!walkTile(tx,ty)){P.x=(HR.door.tx+.5)*TILE;P.y=(HR.door.ty-1.5)*TILE;}}G.CATS=null;G.PET=null;}return ok;};}
})();
