'use strict';
(function(){
const G=window.G,$=id=>document.getElementById(id),TILE=G.TILE,RAR=G.RAR;
const ui=G.ui={dlgNpc:null};
let state='menu',invOpen=false,invMode='normal',invSel=null,helpOpen=false,pauseOpen=false,setOpen=false,chatNpc=null,discardArm=false;
G.paused=()=>state!=='game'||(typeof furnOpen!=='undefined'&&(furnOpen||buildOpen))||(typeof mapOpen!=='undefined'&&mapOpen)||(typeof travelOpen!=='undefined'&&travelOpen)||invOpen||helpOpen||pauseOpen||setOpen||!!ui.dlgNpc||!!chatNpc||(G.P&&G.P.dead);
const c2d=$('c2d'),ctx=c2d.getContext('2d'),c3d=$('c3d');
let VW=1,VH=1,DPR=1,use3d=false;
let RS=1,rsT=0;const qPR=()=>{const d=window.devicePixelRatio||1,q=G.settings.quality;let pr={low:Math.min(d,1.5),mid:Math.min(d,2),high:Math.min(d,2.5)}[q]||1;const px=Math.max(1,innerWidth*innerHeight),bud={low:1.3e6,mid:2.6e6,high:3.9e6}[q]||2.6e6;pr=Math.min(pr,Math.sqrt(bud/px));return Math.max(.5,pr)*RS;};
function placeBoss(){const bb=$('bossbar');if(!bb||bb.style.display!=='block')return;if(document.body.classList.contains('pc')){bb.style.left=bb.style.width=bb.style.top=bb.style.transform='';return;}
 const port=innerHeight>innerWidth,sa=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat'))||0;
 if(port){const mi=$('mini').getBoundingClientRect(),tb=document.querySelector('#hudTR .tbtns').getBoundingClientRect();const L=Math.max(mi.left-6,innerWidth*.58),W=innerWidth-L-8;bb.style.transform='none';bb.style.left=L+'px';bb.style.width=W+'px';bb.style.top=(Math.max(mi.bottom,tb.bottom)+8)+'px';return;}
 const br=document.querySelector('#hudTL .bars').getBoundingClientRect();let R=innerWidth;for(const e of $('hudTR').querySelectorAll('canvas,.rbtn,button')){const r=e.getBoundingClientRect();if(r.width&&r.top<70)R=Math.min(R,r.left);}
 const L=br.right+10,W=Math.min(320,R-L-10);bb.style.transform='none';bb.style.width=W+'px';bb.style.left=(L+(R-10-L-W)/2)+'px';bb.style.top='';}
addEventListener('resize',()=>setTimeout(placeBoss,60));
function resize(){VW=innerWidth;VH=innerHeight;DPR=Math.min(window.devicePixelRatio||1,2);c2d.width=Math.round(VW*DPR);c2d.height=Math.round(VH*DPR);c2d.style.width=VW+'px';c2d.style.height=VH+'px';if(use3d)G.R3D.resize(VW,VH,qPR());}
addEventListener('resize',resize);
function applyMode(){if(G.settings.mode==='3d'&&!G.R3D.ok){if(!G.R3D.init(c3d)){G.settings.mode='2d';G.saveSettings();toast(G.R3D.noCtx?'3D konnte nicht starten: WebGL ist im Browser aus. Tipp: In den Browser-Einstellungen „Hardwarebeschleunigung“ einschalten und neu starten. 2D ist aktiv.':'3D konnte auf diesem Gerät nicht starten. 2D ist aktiv.','#ff8a80');}}
 use3d=G.settings.mode==='3d'&&G.R3D.ok;c3d.style.display=use3d&&state==='game'?'block':'none';applyGui();resize();}
function applyGui(){const g=(+G.settings.gui||100)/100,m=+G.settings.mini||120;document.documentElement.style.setProperty('--gui',g);mini.style.width=mini.style.height=m+'px';const bc=$('bCam');if(bc)bc.style.display='flex';for(const id of ['bRotL','bRotR','bTiltU','bTiltD']){const el=$(id);if(el)el.style.display=use3d&&G.settings.cam!=='fp'?'flex':'none';}if(G.settings.cam!=='fp'&&document.pointerLockElement)document.exitPointerLock();document.body.classList.toggle('fp',G.settings.cam==='fp');}
function isFP(){return G.settings.cam==='fp';}
function fpDir(){const y=G.camYaw||0;return{x:Math.sin(y),y:-Math.cos(y)};}
function toggleCam(){const P=G.P;G.settings.cam=G.settings.cam==='fp'?'top':'fp';if(G.settings.cam==='fp'){G.camYaw=Math.atan2(P.fx,-P.fy);G.camPitch=-.06;toast(pcMode?'👁 Ego-Sicht · Klick ins Bild fängt die Maus · V wechselt zurück':'👁 Ego-Sicht · Rechte Bildschirmhälfte ziehen zum Umsehen','#ffd54a',true);}else toast('🗺 Ansicht von oben','#ffd54a');G.saveSettings();applyGui();refreshSettings&&setOpen&&refreshSettings();}
ui.toggleCam=toggleCam;
// ===================== Toasts =====================
const toastsEl=$('toasts');
function toast(txt,col,big,it){const d=document.createElement('div');d.className='toast'+(big?' big':'');if(it){const im=new Image();im.src=G.icon(it).url;d.appendChild(im);d.style.borderColor=RAR[it.rarity||0].c;}const s=document.createElement('span');s.textContent=txt;if(col)s.style.color=col;d.appendChild(s);toastsEl.appendChild(d);while(toastsEl.children.length>4)toastsEl.firstChild.remove();setTimeout(()=>d.remove(),big?4500:3000);}
ui.toast=toast;
ui.onGLLost=()=>{use3d=false;c3d.style.display='none';G.settings.mode='2d';G.saveSettings();toast('Dein Gerät hat die 3D-Grafik zurückgesetzt. 2D ist jetzt aktiv. Mit Grafikqualität „Niedrig“ kannst du 3D erneut versuchen.','#ff8a80',true);};
// ===================== Hotbar & Inventar =====================
function setSlotEl(el,it){el.style.backgroundImage=it?`url(${G.icon(it).url})`:'';el.style.borderColor=it?RAR[it.rarity||0].c:'';el.style.boxShadow=it&&it.rarity>=1?`inset 0 0 10px ${RAR[it.rarity].c}`:'';const c=el.querySelector('.cnt');if(c)c.textContent=it&&it.stack&&it.count>1?it.count:'';}
const hotEls=[];
for(let i=0;i<9;i++){const e=document.createElement('div');e.className='slot';e.innerHTML=`<span class="num">${i+1}</span><span class="cnt"></span>`;e.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();hotTap(i);});$('hotbar').appendChild(e);hotEls.push(e);}
function hotTap(i){if(G.paused())return;const it=G.P.inv[i];if(it&&it.type==='food'){G.useItem(i);return;}G.P.sel=i;G.invDirty=true;}
function renderHot(){for(let i=0;i<9;i++){setSlotEl(hotEls[i],G.P.inv[i]);hotEls[i].classList.toggle('sel',G.P.sel===i);}}
const EQL=[['helm','Helm'],['chest','Brust'],['legs','Beine'],['boots','Stiefel']],EQR=[['ring','Ring'],['amulet','Amulett']];
const invEls={};let hoverK=null,marked=new Set(),markMode=false,shopId=null,shopTab='buy',forgeK=null;
function mkInvSlot(key,parent,label){const e=document.createElement('div');e.className='slot';e.innerHTML='<span class="cnt"></span>';if(label)e.dataset.l=label;
 e.addEventListener('click',ev=>{if(performance.now()-dragEnd<350)return;if((ev.shiftKey||markMode)&&key[0]==='i'){toggleMark(key);return;}slotTap(key);});bindDrag(e,key);
 e.addEventListener('contextmenu',ev=>{ev.preventDefault();if(key[0]==='i'&&getS(key))toggleMark(key);});
 e.addEventListener('mouseenter',()=>{if(!pcMode)return;hoverK=key;renderInfo();});e.addEventListener('mouseleave',()=>{if(hoverK===key){hoverK=null;renderInfo();}});
 parent.appendChild(e);invEls[key]=e;}
EQL.forEach(([k,l])=>mkInvSlot('e:'+k,$('eqL'),l));EQR.forEach(([k,l])=>mkInvSlot('e:'+k,$('eqR'),l));
for(let i=9;i<36;i++)mkInvSlot('i'+i,$('gMain'));for(let i=0;i<9;i++)mkInvSlot('i'+i,$('gHot'));
const getS=k=>k[0]==='e'?G.P.eq[k.slice(2)]:G.P.inv[+k.slice(1)];
const setS=(k,v)=>{if(k[0]==='e')G.P.eq[k.slice(2)]=v||null;else G.P.inv[+k.slice(1)]=v||null;G.invDirty=true;};
const fits=(k,it)=>!it||k[0]!=='e'||it.type===k.slice(2);
const lvOK=it=>!it||G.reqLvl(it)<=G.P.level;
function toggleMark(k){if(!getS(k))return;if(marked.has(k))marked.delete(k);else marked.add(k);invSel=null;renderInv();}
function slotTap(k){discardArm=false;
 if(shopId&&shopTab==='forge'){const it=getS(k);if(it&&!it.stack){forgeK=k;invSel=k;}renderInv();return;}
 if(moveArm&&invSel!==null&&invSel!==k){moveArm=false;moveSlot(invSel,k);renderInv();return;}moveArm=false;
 if(invSel===k)invSel=null;else invSel=getS(k)?k:null;
 renderInv();}
let moveArm=false;
// Gegenstand von Slot a nach Slot b bewegen (tauschen / stapeln)
function moveSlot(from,k){const a=getS(from),b=getS(k);if(!a||from===k)return false;
 if(b&&a.stack&&b.stack&&a.id===b.id){const cap=a.type==='ammo'?999:64;const mv=Math.min(cap-b.count,a.count);b.count+=mv;a.count-=mv;if(a.count<=0)setS(from,null);G.invDirty=true;invSel=null;return true;}
 if(fits(k,a)&&fits(from,b)){if(k[0]==='e'&&!lvOK(a)||from[0]==='e'&&!lvOK(b)){toast(`Benötigt Stufe ${G.reqLvl(k[0]==='e'?a:b)}`,'#ff8a80');return false;}setS(k,a);setS(from,b);marked.delete(k);marked.delete(from);invSel=k;return true;}
 toast('Das passt dort nicht hinein','#ff8a80');return false;}
// Ziehen (Drag & Drop) – Maus sofort, Touch nach kurzem Halten
let drag=null,dragEnd=0;
function dragStart(k,x,y){const it=getS(k);if(!it)return;const src=invEls[k];const g=src.cloneNode(true);g.className='slot dragGhost';g.style.left=x+'px';g.style.top=y+'px';const cv=src.querySelector('canvas');if(cv){const c2=g.querySelector('canvas');if(c2)c2.getContext('2d').drawImage(cv,0,0);}document.body.appendChild(g);drag={k,g};src.classList.add('dragFrom');}
function dragMove(x,y){if(!drag)return;drag.g.style.left=x+'px';drag.g.style.top=y+'px';const t=document.elementFromPoint(x,y);for(const kk in invEls)invEls[kk].classList.toggle('dropT',!!t&&invEls[kk].contains(t)&&kk!==drag.k);}
function dragDrop(x,y){if(!drag)return;const d=drag;drag=null;d.g.remove();for(const kk in invEls)invEls[kk].classList.remove('dropT','dragFrom');dragEnd=performance.now();const t=document.elementFromPoint(x,y);let to=null;for(const kk in invEls)if(t&&invEls[kk].contains(t))to=kk;if(to&&to!==d.k){moveSlot(d.k,to);}renderInv();}
function bindDrag(e,key){let st=null,hold=null;
 e.addEventListener('mousedown',ev=>{if(ev.button!==0||!getS(key)||(shopId&&shopTab==='forge'))return;st={x:ev.clientX,y:ev.clientY};const mv=m=>{if(!drag&&st&&Math.hypot(m.clientX-st.x,m.clientY-st.y)>6)dragStart(key,m.clientX,m.clientY);if(drag)dragMove(m.clientX,m.clientY);};const up=m=>{removeEventListener('mousemove',mv);removeEventListener('mouseup',up);st=null;if(drag)dragDrop(m.clientX,m.clientY);};addEventListener('mousemove',mv);addEventListener('mouseup',up);});
 e.addEventListener('touchstart',ev=>{if(ev.touches.length!==1||!getS(key)||(shopId&&shopTab==='forge'))return;const t=ev.touches[0];st={x:t.clientX,y:t.clientY};clearTimeout(hold);hold=setTimeout(()=>{if(st){dragStart(key,st.x,st.y);if(navigator.vibrate)try{navigator.vibrate(15);}catch(_){}}},420);},{passive:true});
 e.addEventListener('touchmove',ev=>{const t=ev.touches[0];if(drag){ev.preventDefault();dragMove(t.clientX,t.clientY);return;}if(st&&Math.hypot(t.clientX-st.x,t.clientY-st.y)>8){clearTimeout(hold);st=null;}},{passive:false});
 e.addEventListener('touchend',ev=>{clearTimeout(hold);const t=ev.changedTouches[0];if(drag){ev.preventDefault();dragDrop(t.clientX,t.clientY);}st=null;},{passive:false});
 e.addEventListener('touchcancel',()=>{clearTimeout(hold);st=null;if(drag){drag.g.remove();for(const kk in invEls)invEls[kk].classList.remove('dropT','dragFrom');drag=null;}});}
function freeBag(){for(let i=9;i<36;i++)if(!G.P.inv[i])return 'i'+i;for(let i=0;i<9;i++)if(!G.P.inv[i])return 'i'+i;return null;}
// ---- einheitliche Werte für den Vergleich
const ROWS=[['dmg','⚔ Schaden',''],['aps','⏱ Angriffe/s',''],['dps','💥 Schaden/s',''],['rng','📏 Reichweite',''],['mana','🔷 Mana/Zauber',''],['sta','⚡ Ausdauer/Schlag',''],['def','🛡 Rüstung',''],
 ['melee','🗡 Nahkampf','%'],['ranged','🏹 Fernkampf','%'],['spell','🔮 Zauber','%'],['hp','❤ Leben',''],['hpPct','❤ Leben','%'],['defp','🛡 Rüstung','%'],['res','✚ Resistenz','%'],['crit','🎯 Krit','%'],['spd','💨 Tempo','%'],['regen','💗 Regeneration','/s'],['luck','🍀 Glück','%']];
const LOWER={mana:1,sta:1};
function itemStats(it){const o={};if(!it||it.stack)return o;const e=G.itemEff(it);
 if(it.dmg!=null){const K=G.WKIND[it.kind];o.dmg=e.dmg;o.aps=Math.round(10/e.cd)/10;o.dps=Math.round(e.dmg/e.cd);o.rng=K.cls==='melee'?Math.round(K.reach/32*10)/10+' F':Math.round(K.range/32)+' F';if(K.mana)o.mana=K.mana;if(K.cls==='melee')o.sta=Math.round(8+K.cd*13);}
 if(e.def!=null)o.def=e.def;if(e.crit)o.crit=(o.crit||0)+e.crit;if(e.hpPct)o.hpPct=e.hpPct;if(e.luck)o.luck=e.luck;if(e.spd)o.spd=e.spd;
 for(const k in it.af)o[k]=(o[k]||0)+it.af[k];return o;}
function head(it){const r=RAR[it.rarity],req=G.reqLvl(it),ok=req<=G.P.level;const K=it.kind&&G.WKIND[it.kind];
 return `<div class="ih" style="color:${r.d}">${G.iname(it)}</div><div class="isub"><span style="color:${r.d}">${r.n}</span> · ${K?(K.cls==='melee'?'Nahkampf':K.cls==='ranged'?'Fernkampf':'Zauber'):G.SLOTN[it.type]} · ⭐ ${G.itemScore(it)}<br><span style="color:${ok?'#5a4a30':'#c62828'};font-weight:${ok?'normal':'bold'}">Benötigt Stufe ${req}</span>${it.set?` · <span style="color:${G.SETS[it.set].c==='#f0f0e0'?'#8a7a50':G.SETS[it.set].c}">${G.SETS[it.set].n}-Set</span>`:''}</div>`;}
function statTable(it,other){const a=itemStats(it),b=other?itemStats(other):null;let h='<table class="ist">';
 for(const [k,l,u] of ROWS){if(a[k]==null&&!(b&&b[k]!=null))continue;const v=a[k];let dd='';
  if(b&&typeof (v||0)==='number'&&typeof (b[k]||0)==='number'){const d=Math.round(((v||0)-(b[k]||0))*10)/10;if(d){const good=LOWER[k]?d<0:d>0;dd=` <i style="color:${good?'#1b7e2a':'#c62828'}">${d>0?'▲':'▼'}${Math.abs(d)}</i>`;}}
  h+=`<tr${v==null?' class="miss"':''}><td>${l}</td><td>${v==null?'–':v+u}${dd}</td></tr>`;}
 return h+'</table>';}
function cmpFor(it,k){const P=G.P;if(!it||it.stack)return null;if(it.type==='weapon')return G.held()===it?null:G.held();if(k&&k[0]==='e')return null;return P.eq[it.type]||null;}
function itemHTML(it,k){if(it.type==='barding'){const R=G.RAR[it.rarity||0],cur=G.P.mount&&G.P.mount.armor;return `<div class="ih" style="color:${R.c}">🐎 ${it.name}</div><div class="isub">${R.n} · Pferderüstung · Stufe ${it.ilvl}<br>🛡 Rüstung <b>${it.def}</b> · ❤ +${it.hp} Pferde-LP${cur?`<br><small>Dein Pferd trägt: ${cur.name} (Rüstung ${cur.def}, +${cur.hp} LP)</small>`:''}</div>`+(shopId?`<div class="isub">Verkaufswert: <b>${G.shopPrice(shopId,it)} Gold</b></div>`:'');}
 if(it.stack){const s=G.STACK[it.id];return `<div class="ih">${s.name} ×${it.count}</div><div class="isub">${s.desc}</div>`+(it.id==='kanne'?`<div class="isub">💧 Füllstand: <b>${it.wc==null?25:it.wc}/25</b></div>`:'')+(s.qitem?'<div class="isub" style="color:#8a5a00;font-weight:bold">🔒 Quest-Gegenstand – kann nicht verkauft oder weggeworfen werden.</div>':'')+(shopId&&s.sell?`<div class="isub">Verkaufswert: ${G.shopPrice(shopId,it)} Gold</div>`:'');}
 const c=cmpFor(it,k);let h='<div class="cmp">';
 if(c)h+=`<div class="ccol cur"><div class="ctag">Angelegt</div>${head(c)}${statTable(c,null)}</div>`;
 h+=`<div class="ccol"><div class="ctag">${c?'Ausgewählt':'Gegenstand'}</div>${head(it)}${statTable(it,c)}</div></div>`;
 if(it.kind)h+=`<div class="isub">${G.WKIND[it.kind].sp}</div>`;
 if(it.set){const S=G.SETS[it.set],n=(G.S&&G.S.sets&&G.S.sets[it.set])||0;h+=`<div class="iset" style="border-color:${S.c}"><b>${S.n}-Rüstung</b> (${n}/4 angelegt) · 2 Teile: <span style="color:${n>=2?'#1b5e20':'#8a7a60'}">${S.b2}</span> · 4 Teile: <span style="color:${n>=4?'#1b5e20':'#8a7a60'}">${S.b4}</span></div>`;}
 if(it.uniq||it.ud)h+=`<div class="isub" style="color:#c25a00;font-weight:bold">★ Einzigartig${it.ud?': '+it.ud:''}</div>`;
 if(it.boss&&G.BOSSES[it.boss])h+=`<div class="isub" style="color:#8b0000">☠ Boss-Beute: ${G.BOSSES[it.boss].n}</div>`;else if(it.src)h+=`<div class="isub">Herkunft: ${it.src}</div>`;
 if(shopId)h+=`<div class="isub">Verkaufswert: <b>${G.shopPrice(shopId,it)} Gold</b></div>`;return h;}
// ---- Shop
function renderShop(){const el=$('shopBar');if(!shopId){el.style.display='none';return;}el.style.display='block';const sh=G.SHOPS[shopId],P=G.P;
 let h=`<div class="tabs"><button data-t="buy" class="${shopTab==='buy'?'on':''}">🛒 Kaufen</button><button data-t="sell" class="${shopTab==='sell'?'on':''}">💰 Verkaufen</button>${sh.recipes?`<button data-t="cook" class="${shopTab==='cook'?'on':''}">🍳 Backen</button>`:''}${sh.smith?`<button data-t="gear" class="${shopTab==='gear'?'on':''}">⚔ Ausrüstung</button><button data-t="forge" class="${shopTab==='forge'?'on':''}">⚒ Umschmieden</button>`:''}</div>`;
 if(shopTab==='buy'){h+='<div class="shopL">';sh.items.filter(id=>id!=='carrot'||G.P.carrotOK).forEach(id=>{const s=G.STACK[id],n=s.pack||1,pr=s.price*n;h+=`<div class="shopI" data-id="${id}"><span class="slot sm" style="background-image:url(${G.icon(G.mkStack(id,n)).url})"></span><span class="sn">${s.name}${n>1?' ×'+n:''}<small>${s.desc}</small></span><button class="btn ${P.gold<pr?'dis':''}">${pr} G</button></div>`;});h+='</div>';}
 else if(shopTab==='gear'){const st=G.smithStock();h+='<div class="hint">Neue Ware jeden Morgen und bei jedem Stufenaufstieg. Nur Ausrüstung für deine Stufe.</div><div class="shopL">';if(!st.length)h+='<div class="hint">Ausverkauft. Komm morgen wieder.</div>';st.forEach((it,i)=>{h+=`<div class="shopI gear" data-i="${i}"><span class="slot sm" style="background-image:url(${G.icon(it).url});border-color:${G.RAR[it.rarity].c}"></span><span class="sn" style="color:${G.RAR[it.rarity].d}">${G.iname(it)}<small>${G.RAR[it.rarity].n} · Stufe ${G.reqLvl(it)}${it.dmg?' · '+it.dmg+' Schaden':''}${it.def?' · '+it.def+' Rüstung':''}</small></span><button class="btn ${P.gold<it.shopPrice?'dis':''}">${it.shopPrice} G</button></div>`;});h+='</div>';}
 else if(shopTab==='cook'){h+='<div class="hint">Bring Zutaten von deinen Feldern – Bernd backt daraus Gerichte mit zeitlich begrenzter Stärkung.</div><div class="shopL">';G.RECIPES.forEach((r,i)=>{const s=G.STACK[r[0]];let ok=true;const ing=Object.keys(r[2]).map(k=>{const h=G.countItem(k),n=r[2][k];if(h<n)ok=false;return `<span style="color:${h>=n?'#1b5e20':'#b71c1c'}">${G.STACK[k].name} ${h}/${n}</span>`;}).join(', ');h+=`<div class="shopI cook" data-r="${i}"><span class="slot sm" style="background-image:url(${G.icon(G.mkStack(r[0],r[1])).url})"></span><span class="sn">${s.name}${r[1]>1?' ×'+r[1]:''}<small>${s.buff?G.BUFFN[s.buff][0]+' '+G.BUFFN[s.buff][1]+' · '+Math.round(s.dur/60)+' Min. · ':''}${ing}</small></span><button class="btn ${ok?'':'dis'}">Backen</button></div>`;});h+='</div>';}
 else if(shopTab==='sell')h+=(sh.buys?`<div class="hint"><b>${G.shopWhy(shopId)}</b></div>`:'')+'<div class="hint">Tippe einen Gegenstand an, um ihn zu verkaufen. <b>Shift+Klick</b>, Rechtsklick oder „☑ Markieren“ wählt mehrere aus, die du gesammelt verkaufen kannst.</div>';
 else h+='<div class="hint">Wähle eine Waffe, Rüstung oder Schmuck. Umschmieden gibt einen zufälligen Zusatz wie <i>Scharf</i>, <i>Schnell</i> oder <i>Legendär</i> (Waffen) bzw. <i>Wehrhaft</i> (Rüstung und Schmuck). Der alte Zusatz geht dabei verloren.</div>';
 el.innerHTML=h;el.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{shopTab=b.dataset.t;invSel=null;forgeK=null;marked.clear();renderInv();});
 el.querySelectorAll('.shopI.gear').forEach(r=>{const i=+r.dataset.i;r.querySelector('.sn').onclick=()=>{const it=G.smithStock()[i];if(it)$('itemInfo').innerHTML=itemHTML(it,null);};r.querySelector('button').onclick=()=>{if(G.buyGear(i)){toast('⚔ Gekauft!','#ffd54a');renderInv();}};});
 el.querySelectorAll('.shopI.cook').forEach(r=>r.querySelector('button').onclick=()=>{if(G.cook(+r.dataset.r))renderInv();});
 el.querySelectorAll('.shopI:not(.gear):not(.cook)').forEach(r=>r.querySelector('button').onclick=()=>{const id=r.dataset.id,s=G.STACK[id],n=s.pack||1;if(G.buy(id,n,s.price*n))renderInv();});}
ui.openShop=(id,tab)=>{shopId=id;G._shopSid=id;shopTab=tab||'buy';openInv('shop');};
// ---- Info unten (feste Höhe)
function renderInfo(){if(!invOpen)return;const P=G.P,info=$('itemInfo');const k=hoverK&&getS(hoverK)?hoverK:invSel;
 if(!k||!getS(k)){let t=shopId?(shopTab==='forge'?'Wähle einen Gegenstand zum Umschmieden.':shopTab==='sell'?'Wähle Gegenstände zum Verkaufen.':'Kaufe oben, oder wechsle zu „Verkaufen“.'):(pcMode?'Klicke einen Gegenstand an, um ihn auszuwählen. Zum Verschieben ziehst du ihn mit gedrückter Maustaste auf einen anderen Platz.':'Tippe einen Gegenstand an, um ihn auszuwählen. Zum Verschieben hältst du ihn kurz gedrückt und ziehst ihn auf einen anderen Platz.')+(pcMode?' Fahre mit der Maus darüber, um ihn mit deiner Ausrüstung zu vergleichen. Shift+Klick markiert mehrere.':'');
  info.innerHTML=`<div class="hint">${t}</div>`;return;}
 const it=getS(k);info.innerHTML=itemHTML(it,k)+(k===invSel?'<div class="btns" id="ib"></div>':'<div class="hint" style="margin-top:4px">Klicken für Aktionen</div>');
 if(k!==invSel)return;const ib=$('ib');const inEq=k[0]==='e',idx=inEq?-1:+k.slice(1);
 const btn=(l,f,cls)=>{const b=document.createElement('button');b.className='btn'+(cls?' '+cls:'');b.textContent=l;b.addEventListener('click',f);ib.appendChild(b);};
 if(shopId&&shopTab==='forge'&&!it.stack){const c=G.reforgeCost(it);btn(`⚒ Umschmieden: ${c} Gold`,()=>{if(P.gold<c){toast('Nicht genug Gold','#ff8a80');return;}P.gold-=c;const old=it.pre;let n;do n=G.rollPre(it);while(n===old&&Math.random()<.7);it.pre=n;G.sfx('hit');G.sfx('coin');const p=G.PRE[n];toast(`⚒ ${G.iname(it)}`,p.best?'#ffd54a':p.dmg<0||p.def<0||p.spd<0||p.mspd<0?'#ff8a80':'#a5d6a7',!!p.best);G.invDirty=true;renderInv();});return;}
 if(shopId){const pr=G.shopPrice(shopId,it);if(pr>0)btn(`💰 Verkaufen: ${pr} Gold`,()=>{P.gold+=pr;setS(k,null);invSel=null;G.sfx('coin');toast(`+${pr} Gold`,'#ffd54a');renderInv();});else ib.insertAdjacentHTML('beforeend',`<small>${G.shopWhy(shopId)}</small>`);}
 if(it.type==='food')btn('Benutzen',()=>{G.useItem(idx);if(!P.inv[idx])invSel=null;renderInv();});
 if(!shopId){btn(moveArm?'↔ Ziel antippen …':'↔ Verschieben',()=>{moveArm=!moveArm;renderInv();});if(!inEq&&idx>=9&&!it.stack||(!inEq&&idx>=9&&it.type!=='furn')){btn('⬇ In die Hotbar',()=>{let t=-1;for(let i=0;i<9;i++)if(!P.inv[i]){t=i;break;}if(t<0)t=P.sel;moveSlot(k,'i'+t);renderInv();});}}
 
 if(it.id==='hammer')btn('📦 Möbellager öffnen',()=>{closeInv();ui.openFurnBox();});
 if(it.id==='hammer'&&idx>=9)btn('In die Hand nehmen',()=>{const o=P.inv[P.sel];P.inv[P.sel]=it;P.inv[idx]=o;invSel=null;G.invDirty=true;renderInv();});
 if(!inEq&&!shopId&&(it.type==='furn'||it.type==='tool'))btn('🗑 Wegwerfen',()=>{if(!confirmDrop){confirmDrop=k;toast('Nochmal tippen zum Wegwerfen','#ffcc80');return;}confirmDrop=null;setS(k,null);invSel=null;G.sfx('click');renderInv();},'warn');
 if(it.type==='barding'&&!inEq)btn('🐎 Dem Pferd anlegen',()=>{if(G.equipBarding(idx)){invSel=null;renderInv();}});
 if(!inEq&&P.eq[it.type]!==undefined)btn('Anlegen',()=>{if(!lvOK(it)){toast(`Benötigt Stufe ${G.reqLvl(it)}`,'#ff8a80');return;}const old=P.eq[it.type];P.eq[it.type]=it;P.inv[idx]=old;invSel=null;G.invDirty=true;renderInv();});
 if(it.type==='weapon'){if(idx>=9)btn('In die Hand nehmen',()=>{const o=P.inv[P.sel];P.inv[P.sel]=it;P.inv[idx]=o;invSel=null;G.invDirty=true;renderInv();});else if(idx>=0&&idx!==P.sel)btn('In die Hand nehmen',()=>{P.sel=idx;invSel=null;G.invDirty=true;renderInv();});}
 if(inEq)btn('Ablegen',()=>{const f=freeBag();if(!f){toast('Kein Platz im Rucksack','#ff8a80');return;}setS(f,it);setS(k,null);invSel=null;renderInv();});
 if(!shopId)btn(discardArm?'Wirklich wegwerfen?':'Wegwerfen',()=>{if(!discardArm){discardArm=true;renderInfo();return;}discardArm=false;setS(k,null);invSel=null;renderInv();},'red');}
function renderMarks(){const el=$('markBar'),P=G.P;for(const k of [...marked])if(!getS(k))marked.delete(k);
 let h=`<button class="btn sm ${markMode?'on':''}" id="mkM">☑ Markieren${markMode?' (an)':''}</button>`;
 if(marked.size){const val=[...marked].reduce((a,k)=>a+G.shopPrice(shopId,getS(k)),0);h+=`<span class="mkn">${marked.size} markiert</span>`;if(shopId)h+=`<button class="btn sm" id="mkS">💰 Alle verkaufen (${val} G)</button>`;else h+=`<button class="btn sm red" id="mkD">${discardArm?'Wirklich alle wegwerfen?':'🗑 Alle wegwerfen'}</button>`;h+=`<button class="btn sm" id="mkC">✕</button>`;}
 el.innerHTML=h;$('mkM').onclick=()=>{markMode=!markMode;if(!markMode)marked.clear();invSel=null;renderInv();};
 if($('mkC'))$('mkC').onclick=()=>{marked.clear();markMode=false;renderInv();};
 if($('mkS'))$('mkS').onclick=()=>{let g=0;for(const k of marked){g+=G.shopPrice(shopId,getS(k));setS(k,null);}P.gold+=g;marked.clear();G.sfx('coin');toast(`+${g} Gold`,'#ffd54a');renderInv();};
 if($('mkD'))$('mkD').onclick=()=>{if(!discardArm){discardArm=true;renderMarks();return;}discardArm=false;for(const k of marked)setS(k,null);marked.clear();renderInv();};}
// Scrollposition beim Neuzeichnen behalten (Shop, Inventar, Fähigkeiten, Quests)
function saveScroll(){const o=[];const root=$('inv');if(!root)return o;root.querySelectorAll('*').forEach(e=>{if(e.scrollTop>0)o.push([e.id?'#'+e.id:null,e.id?null:[...root.querySelectorAll('*')].indexOf(e),e.className,e.scrollTop]);});return o;}
function restoreScroll(o,late){if(!late&&o.length){requestAnimationFrame(()=>restoreScroll(o,1));setTimeout(()=>restoreScroll(o,2),120);}const root=$('inv');if(!root)return;const all=[...root.querySelectorAll('*')];for(const [id,i,cls,t] of o){const e=id?root.querySelector(id):all[i];if(e&&(id||e.className===cls))e.scrollTop=t;}}
function renderInv(){const _sv=saveScroll();try{return renderInv_();}finally{restoreScroll(_sv);}}
function renderInv_(){if(!invOpen)return;const P=G.P;const S=G.S=G.calc();
 $('invTitle').textContent=shopId?`${G.SHOPS[shopId].n} · 🪙 ${P.gold} Gold`:'⚜ Inventar ⚜';renderShop();
 for(const k in invEls){const it=getS(k),e=invEls[k];setSlotEl(e,it);e.classList.toggle('pick',invSel===k);e.classList.toggle('mark',marked.has(k));e.classList.toggle('low',!!it&&!lvOK(it));if(k[0]==='e')e.classList.toggle('eqe',!it);if(k[0]==='i'&&+k.slice(1)<9)e.classList.toggle('sel',+k.slice(1)===P.sel&&invSel!==k);}
 const w=G.held();
 $('statBox').innerHTML=`Stufe <b>${P.level}</b><br>❤ Leben <b>${Math.ceil(P.hp)}/${S.maxhp}</b><br>⚡ Ausdauer <b>${S.maxSta}</b><br>🔷 Mana <b>${S.maxMp}</b><br>⚔ Schaden <b>${Math.round(S.total)}</b><br>🛡 Rüstung <b>${S.def}</b><br>🗡/🏹/🔮 <b>${S.melee}/${S.ranged}/${S.spell}%</b><br>✚ Resist. <b>${S.res}%</b><br>🎯 Krit <b>${S.crit}%</b><br>💨 Tempo <b>+${S.spd}%</b><br>🍀 Glück <b>+${S.luck}%</b><div style="clear:both;font-size:10px;margin-top:2px;color:#5a3d1e">In der Hand: ${w?G.iname(w):'nichts'}${S.tooHigh?' <b style="float:none;color:#c62828">(Stufe zu niedrig!)</b>':''}</div>`;
 renderMarks();renderInfo();}
let confirmDrop=null;
function setInvTab(t){invTab=t;document.querySelectorAll('#invTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('qBook').style.display=t==='quest'?'block':'none';$('skBook').style.display=t==='skill'?'block':'none';document.querySelector('#inv .invWrap').style.display=t!=='inv'?'none':'';if(t==='quest')renderQBook();if(t==='skill')renderSkills();$('stBook').style.display=t==='stat'?'block':'none';if(t==='stat')renderStats();$('gBook').style.display=t==='guide'?'block':'none';if(t==='guide')renderGuide();}

// --- v23: Guide-Buch (wird nur beim Öffnen bzw. beim Blättern neu aufgebaut)
let gSec='mech',gSub=null,gNpc=null,gDay=null,gMob=null;
function renderGuide(){const el=$('gBook'),P=G.P;const E=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 const secs=[['mech','🧭 Grundlagen'],['npc','👥 Leute & Orte'],['mob','🐺 Gegner'],['boss','👑 Bosse'],['quest','📜 Fortschritt']];
 let h=`<div class="gtoc">${secs.map(([k,l])=>`<button data-s="${k}" class="${gSec===k?'on':''}">${l}</button>`).join('')}</div>`;
 if(gSec==='mech'){h+=`<div class="hint">Was man in Eldmar alles machen kann – ohne Spoiler.</div>`+G.GUIDE_MECH.map(([t,x])=>`<div class="gent"><b>${E(t)}</b><br>${E(x)}</div>`).join('');}
 else if(gSec==='npc'){const T=G.guideNPCs();if(!gSub||!T.find(t=>t.id===gSub))gSub=T[0].id;h+=`<div class="gtoc gsub">${T.map(t=>`<button data-sub="${t.id}" class="${gSub===t.id?'on':''}">${E(t.name)}</button>`).join('')}</div>`;const t=T.find(q=>q.id===gSub);
  h+=`<div class="hint">Wer hier lebt und was man grob bei ihnen machen kann. Genaue Zeiten, Abläufe und Preise erscheinen, sobald du einmal mit der Person gesprochen hast. Tippe auf einen Namen für den genauen Wochenplan (Mo–So).</div>`;
  if(gNpc){const n=G.npcById(gNpc),met=G.P.met&&G.P.met[gNpc];h=h.replace(/<div class="hint">Wer hier lebt[\s\S]*$/,'');h+=`<div class="gent"><button data-back="1" class="btn" style="padding:3px 9px;font-size:12px">← Zurück</button> <b style="font-size:15px">${E(n.name)}</b></div>`;
   if(!met)h+=`<div class="gent glock">🔒 Den genauen Wochenablauf erfährst du, sobald du einmal mit ${E(n.short||n.name)} gesprochen hast.</div>`;
   else{const W=G.weekPlan(n);if(gDay==null)gDay=W.find(d=>d.today).wd;h+=`<div class="gtoc gsub">${W.map(d=>`<button data-day="${d.wd}" class="${gDay===d.wd?'on':''}">${G.WD2[d.wd]}${d.today?' •':''}</button>`).join('')}</div>`;const D=W[gDay];h+=`<div class="gent"><b>${E(D.name)}${D.today?' (heute)':''}</b><table>${D.segs.map(q=>`<tr style="${q.now?'background:rgba(255,213,74,.45);font-weight:bold':''}"><td style="white-space:nowrap;text-align:left">${q.from}–${q.to}</td><td style="text-align:left;white-space:normal">${E(q.l)}${q.now?' ◀ jetzt':''}</td></tr>`).join('')}</table></div><div class="hint">Der Plan stammt direkt aus dem Tagesablauf im Spiel. Nur wer gerade flieht, kämpft oder dir folgt, weicht davon ab.</div>`;}
  }else h+=t.list.map(n=>`<div class="gent"><b data-npc="${n.id}" style="cursor:pointer;text-decoration:underline dotted">${E(n.name)} 🗓</b> <small>· ${E(n.role)}</small>${n.can.length?`<br>${E(n.can.join(' · '))}`:''}${n.met?(n.det.length?'<br>'+n.det.map(E).join('<br>'):''):'<br><span class="glock">🔒 Sprich mit dieser Person, um mehr zu erfahren.</span>'}</div>`).join('');}
 else if(gSec==='mob'||gSec==='boss'){const M=G.guideMobs();const bossS=gSec==='boss';let list;
  if(bossS){list=M.bosses;}else{if(gSub==null||!M.biomes.find(b=>b.b===gSub))gSub=M.biomes[0].b;list=M.biomes.find(b=>b.b===gSub).list;}
  const sel=gMob&&list.find(m=>m.k===gMob&&!m.unknown);
  if(sel){const m=sel,rg=a=>a[0]===a[1]?a[0].toLocaleString('de-DE'):a[0].toLocaleString('de-DE')+'–'+a[1].toLocaleString('de-DE');
   h+=`<div style="margin:2px 0 6px"><button data-back="1" class="btn" style="padding:6px 12px;font-size:13px">← Zurück zur Liste</button></div><div class="gent"><b style="font-size:15px">${E(m.name)}</b><br><small>Stufe ${m.lv[0]}–${m.lv[1]} · von dir besiegt: ${m.kills}×</small>
   <div class="gh">Werte <small>(auf deinem Schwierigkeitsgrad)</small></div><table><tr><td>Lebenspunkte</td><td>${rg(m.hp)}</td></tr><tr><td>Schaden pro Treffer</td><td>${rg(m.dmg)}</td></tr>${m.armor!=null?`<tr><td>Rüstung</td><td>${m.armor} %</td></tr>`:''}<tr><td>Tempo</td><td>${m.spd}</td></tr></table>
   <div class="gh">Angriffe</div>${m.atk.map(a=>`<div class="gat"><b>${E(a[0])}</b> – ${E(a[1])}</div>`).join('')}
   ${m.tr.length?`<div class="gh">Besonderheiten</div><div class="gat">${m.tr.map(E).join(' · ')}</div>`:''}
   <div class="gh">Beute</div><table>${m.drops.map(([a,b])=>`<tr><td>${E(a)}</td><td>${E(b)}</td></tr>`).join('')}</table></div>`;}
  else{if(!bossS)h+=`<div class="gtoc gsub">${M.biomes.map(b=>`<button data-sub="${b.b}" class="${gSub===b.b?'on':''}">${E(b.name)} (${b.list.filter(x=>!x.unknown).length}/${b.list.length})</button>`).join('')}</div>`;
   h+=`<div class="hint">${bossS?'Bosse erscheinen hier, nachdem du sie bezwungen hast.':'Ein Gegner erscheint hier, sobald du ihn einmal besiegt hast.'} Tippe auf einen Eintrag für Werte, Angriffe und Beute.</div>`;
   const kn=list.filter(m=>!m.unknown),un=list.length-kn.length;
   h+=kn.map(m=>`<div class="gent grow" data-mob="${m.k}"><span><b>${E(m.name)}</b><small> · Stufe ${m.lv[0]}–${m.lv[1]} · ${m.kills}× besiegt</small></span><span class="garr">›</span></div>`).join('');
   if(un)h+=`<div class="gent glock">❓ ${un} ${bossS?(un===1?'unbekannter Boss':'unbekannte Bosse'):(un===1?'unbekannter Gegner':'unbekannte Gegner')} – noch nicht besiegt.</div>`;}}
 else{const Q=G.guideQuests();h+=`<div class="gent"><b>⭐ Hauptquest</b><br>${E(Q.main.ch)}<br>➤ ${E(Q.main.t)}</div><div class="gent"><b>📜 Nebenquests</b><br>Erledigt: ${Q.done}${Q.side.length?'<br>Aktiv: '+Q.side.map(s=>E(s.n)).join(', '):''}</div><div class="gent"><b>📊 Übersicht</b><br>Gegner besiegt: ${Q.kills} · Bosse: ${Q.bosses}<br>Leute kennengelernt: ${Q.met} von ${Q.npcs}</div>`;}
 el.innerHTML=h;el.querySelectorAll('.gent').forEach(c=>{if(c.querySelector('[data-npc]'))c.classList.add('gclk');});if(!el._gtap){el._gtap=1;
 const doAct=t=>{const ck=t.closest('.gclk');const g=t.closest('[data-s],[data-sub],[data-npc],[data-day],[data-back],[data-mob]')||(ck?ck.querySelector('[data-npc]'):null);if(!g||!el.contains(g))return false;const d=g.dataset;
  if(d.s!=null){gSec=d.s;gSub=null;gNpc=null;gMob=null;renderGuide();el.scrollTop=0;}else if(d.sub!=null){gSub=d.sub;gNpc=null;gMob=null;renderGuide();}else if(d.mob!=null){gMob=d.mob;renderGuide();const pn=el.closest('.panel');if(pn)pn.scrollTop=Math.min(pn.scrollTop,el.offsetTop);}else if(d.npc!=null){gNpc=d.npc;gDay=null;renderGuide();el.scrollTop=0;const pn=el.closest('.panel');if(pn)pn.scrollTop=Math.min(pn.scrollTop,el.offsetTop);}else if(d.day!=null){gDay=+d.day;renderGuide();}else if(d.back!=null){gNpc=null;gMob=null;renderGuide();}return true;};
 let pd=null,lastT=0;el.addEventListener('pointerdown',e=>{pd={x:e.clientX,y:e.clientY,t:performance.now(),tg:e.target};});
 const up=e=>{if(!pd)return;const m=Math.hypot(e.clientX-pd.x,e.clientY-pd.y),dt=performance.now()-pd.t,tg=pd.tg;pd=null;if(m<14&&dt<700&&doAct(tg)){lastT=performance.now();ui._gSupp=lastT;}};if(!ui._gSuppL){ui._gSuppL=1;document.addEventListener('click',e=>{if(performance.now()-(ui._gSupp||0)<500){e.stopPropagation();e.preventDefault();ui._gSupp=0;}},true);}
 el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>{pd=null;});
 el.addEventListener('click',e=>{if(performance.now()-lastT<600)return;doAct(e.target);});}}
ui.openGuide=()=>{ui.openInv&&ui.openInv();setInvTab('guide');};
function renderStats(){const P=G.P,st=P.stats||{},sum=Object.values(P.kills||{}).reduce((a,b)=>a+b,0);const fmt=s=>{s=Math.floor(s||0);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} Std ${m} Min`:`${m} Min ${s%60} Sek`;};
 const top=Object.entries(P.kills||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,n])=>`<tr><td>${G.MT[k]?G.MT[k].n:k}</td><td>${n}</td></tr>`).join('');
 const row=(i,l,v)=>`<tr><td>${i} ${l}</td><td><b>${v}</b></td></tr>`;
 $('stBook').innerHTML=`<table class="stT">${row('⏱','Spielzeit',fmt(st.time))}${row('⚔','Besiegte Gegner',Math.max(st.kills||0,sum))}${row('☠','Davon Bosse',st.bosses||0)}${row('💀','Davon Champions',st.minis||0)}${row('🪦','Tode',st.deaths||0)}${row('💸','Gold durch Tode verloren',(st.deathGold||0)+' Gold')}${row('🚨','Verbrechen',st.crimes||0)}${row('⚖','Kopfgeld insgesamt',(st.bountyTot||0)+' Gold')}${row('💰','Strafen & Kopfgeld bezahlt',(st.bountyPaid||0)+' Gold')}${row('⛓','Nächte im Kerker',st.jail||0)}${row('🍺','Bier getrunken',P.drunkTot||0)}${row('😵','Umgekippt',st.passOut||0)}${row('⭐','Stufe',P.level)}${row('🪙','Gold jetzt',P.gold)}</table>${top?`<div class="stH">🏆 Meistbesiegte Gegner</div><table class="stT">${top}</table>`:''}`;}
function skBadge(){const b=document.querySelector('#invTabs button[data-t=skill]');if(!b||!G.P)return;const n=G.skillPts();b.innerHTML='⭐ Fähigkeiten'+(n?` <span class="skb">${n}</span>`:'');const l=$('lvl');if(l)l.classList.toggle('skp',n>0);}
function renderSkills(){const _sv=saveScroll();try{return renderSkills_();}finally{restoreScroll(_sv);}}
function renderSkills_(){const P=G.P,pts=G.skillPts(),sp=G.skillSpent();let h=`<div class="skh"><b>Freie Punkte: <span style="color:${pts?'#2e7d32':'#6b5233'}">${pts}</span></b><small>1 Punkt pro Stufe · ausgegeben: ${sp}</small></div>`;let grp='';
 for(const k of G.SKILLS){if(k.g!==grp){grp=k.g;h+=`<div class="qbh">${grp}</div>`;}const r=(P.skill&&P.skill[k.id])||0,lock=k.req&&sp<k.req&&!r,can=pts>0&&r<k.max&&!lock;
  h+=`<div class="skc${r>=k.max?' max':''}${lock?' lock':''}"><span class="ski">${k.ic}</span><div class="skt"><b>${k.n}</b> <small>${r}/${k.max}</small><div class="skbar"><i style="width:${r/k.max*100}%"></i></div><div class="skd">${r?'Jetzt: '+k.d(r):'Noch nicht gelernt'}${r<k.max?`<br><span style="color:#2e7d32">Nächste Stufe: ${k.d(r+1)}</span>`:''}${lock?`<br><span style="color:#a02818">🔒 Erst ${k.req} Punkte in andere Fähigkeiten stecken</span>`:''}</div></div><button class="btn skplus" data-k="${k.id}" ${can?'':'disabled'}>+</button></div>`;}
 h+=`<div class="btns"><button class="btn red" id="skReset" ${sp?'':'disabled'}>↺ Alle Punkte zurücksetzen (${G.skillResetCost()} Gold)</button></div>`;
 $('skBook').innerHTML=h;$('skBook').querySelectorAll('.skplus').forEach(b=>b.onclick=()=>{if(G.skillUp(b.dataset.k)){renderSkills();skBadge();G.invDirty=true;}});const rs=$('skReset');rs.onclick=()=>{if(rs.dataset.c!=='1'){rs.dataset.c='1';rs.textContent='Wirklich zurücksetzen?';return;}if(G.skillReset()){renderSkills();skBadge();}};}
ui.openSkills=()=>{if(!invOpen)openInv();setInvTab('skill');};
let invTab='inv';
function renderQBook(){const QL=G.questLog(),m=QL.main;let h=`<div class="qbh">⭐ Hauptquest</div><div class="qbc"><div class="qbt">${m.ch}</div><div>➤ ${m.t}</div>${m.to?`<div class="qbd">Richtung: ${G.dirTo(m.to)} – der goldene ★ im Kompass oben zeigt den Weg.</div>`:''}</div>`;
 h+=`<div class="qbh">📜 Nebenquests (${QL.side.length})</div>`;if(!QL.side.length)h+=`<div class="qbc qbe">Keine aktiven Nebenquests. Achte auf <b style="color:#b8860b">!</b> über den Köpfen der Dorfbewohner.</div>`;
 for(const s of QL.side)h+=`<div class="qbc"><div class="qbt">${s.n}</div><div>➤ ${s.t}</div>${s.to?`<div class="qbd">Richtung: ${G.dirTo(s.to)}</div>`:''}${s.giver?`<div class="qbg">Auftraggeber: ${s.giver}</div>`:''}${s.info?`<div class="qbi">„${s.info}“</div>`:''}</div>`;
 if(QL.done.length)h+=`<div class="qbh">✔ Abgeschlossen</div><div class="qbc qbe">${QL.done.join(' · ')}</div>`;
 $('qBook').innerHTML=h;}
ui.openQuests=()=>{if(!invOpen)openInv();setInvTab('quest');};
function openInv(mode){if(G.P.dead)return;ui._ovT=performance.now();closeDialog();if(mode!=='shop')shopId=null;invMode=mode||'normal';invOpen=true;$('invTabs').style.display=mode==='shop'?'none':'flex';setInvTab('inv');skBadge();invSel=null;hoverK=null;marked.clear();markMode=false;G.attackHeld=false;$('inv').classList.add('show');renderInv();}
function closeInv(){invOpen=false;invSel=null;shopId=null;marked.clear();markMode=false;$('inv').classList.remove('show');G.invDirty=true;}
ui.openInv=openInv;
$('invClose').addEventListener('click',closeInv);document.querySelectorAll('#invTabs button').forEach(b=>b.addEventListener('click',()=>setInvTab(b.dataset.t)));$('inv').addEventListener('click',e=>{if(e.target.id==='inv'&&performance.now()-(ui._ovT||0)>500)closeInv();});
// ===================== Dialog =====================
function openDialog(n){ui.dlgNpc=n;G.attackHeld=false;renderDialog();const t=NPCTIP[n.id];if(t)showTip(t[0],t[1]);}
// ===== Dezente Tipps (einmalig, links unter der Quest-Anzeige) =====
const NPCTIP={hilda:['smith','💡 Bei Hilda kannst du Waffen & Rüstungen kaufen, Beute verkaufen und unter „Schmiede“ Ausrüstung umschmieden.'],holger:['carp','💡 Holger verkauft im Handwerkshof (Mo–Sa 9–18 Uhr) Möbel einzeln und den Schreinerhammer. Mit dem Hammer in der Hand richtest du dein Haus frei ein – und im Dorf stellst du Deko auf.'],wirt:['beer','💡 Bier hebt die Stimmung – ab 3 Krügen torkelst du, ab 10 kippst du um.'],greta:['sell','💡 Jeder Händler kauft dir Beute ab: Tippe im Shop auf einen Gegenstand in deiner Tasche und dann auf „Verkaufen“.']};
const TIPS=[
 {k:'skill',c:P=>G.skillPts&&G.skillPts()>0,t:()=>`💡 Du hast ${G.skillPts()} freie Fähigkeitspunkte – Inventar → ⭐ Fähigkeiten.`},
 {k:'carp',c:P=>P.main>=2,t:()=>NPCTIP.holger[1].replace('Bei Holger','Beim Schreiner Holger in Eichenhain')},
 {k:'smith',c:P=>P.level>=3,t:()=>NPCTIP.hilda[1].replace('Bei Hilda','Bei Schmiedin Hilda')},
 {k:'sell',c:P=>P.level>=2,t:()=>NPCTIP.greta[1]},
 {k:'sleep',c:P=>P.level>=2,t:()=>'💡 Schlafe nachts im Bett deines Hauses: volle LP und ein Ausgeruht-Bonus für den nächsten Tag.'},
 {k:'dodge',c:P=>P.level>=3,t:()=>pcMode?'💡 Mit Leertaste springst du, mit Shift (gedrückt) sprintest du. Ausweichen macht dich kurz unverwundbar.':'💡 Doppeltippe rechts auf den Bildschirm, um auszuweichen – das macht dich kurz unverwundbar.'},
 {k:'farm',c:P=>P.level>=4,t:()=>'💡 Saat von Greta kannst du nahe Wasser pflanzen und später ernten.'},
 {k:'beer',c:P=>P.level>=5,t:()=>'💡 In der Taverne schenkt Wirt Bodo Bier aus – aber Vorsicht, zu viel davon haut dich um.'},
 {k:'law',c:P=>P.level>=4,t:()=>'💡 Stehlen und Angriffe auf Bürger geben Kopfgeld. Die Wachen verstehen da keinen Spaß!'},
 {k:'mapzoom',c:P=>P.level>=2,t:()=>'💡 Die Karte (M oder Minikarte antippen) lässt sich zoomen und verschieben – praktisch in der riesigen Welt.'},
 {k:'secret',c:P=>P.level>=5,t:()=>'💡 Abseits der Wege führen schmale Pfade durch die Wälder. Manchmal endet einer an einer versteckten Truhe …'},
 {k:'side',c:P=>P.level>=3,t:()=>'💡 Wartest du auf die nächste Hauptquest? Bewohner mit gelbem ! haben Nebenquests für dich.'},
 {k:'stats',c:P=>P.level>=6,t:()=>'💡 Im Inventar unter 📊 Statistik siehst du deine Spielzeit, Siege, Tode und Kopfgelder.'}];
let tipEl=null,tipT=0,tipNext=150;
function showTip(k,txt){const P=G.P;if(!P)return false;P.tips=P.tips||{};if(k&&P.tips[k])return false;if(k)P.tips[k]=1;
 if(!tipEl){tipEl=document.createElement('div');tipEl.id='tipBox';document.body.appendChild(tipEl);tipEl.onclick=()=>{tipEl.classList.remove('on');};}
 const q=$('quests'),r=q&&q.getBoundingClientRect();if(r&&r.width){tipEl.style.left=r.left+'px';tipEl.style.top=(r.bottom+6)+'px';tipEl.style.width=Math.max(200,r.width)+'px';}
 tipEl.textContent=txt;tipEl.classList.add('on');clearTimeout(tipEl._t);tipEl._t=setTimeout(()=>tipEl.classList.remove('on'),9000);tipT=0;return true;}
ui.tip=showTip;ui.isPc=()=>pcMode;G.tip=(t,k)=>showTip(k||null,t);
function tipTick(dt){const P=G.P;if(!P||state!=='game'||G.paused()||ui.dlgNpc||P.dead||(P.tut!=null&&P.tut<99&&P.tut<6))return;tipT+=dt;if(tipT<tipNext)return;if(G.mons.some(m=>!m.dead&&m.aggro&&Math.hypot(m.x-P.x,m.y-P.y)<400))return;tipNext=240;P.tips=P.tips||{};const t=TIPS.find(x=>!P.tips[x.k]&&x.c(P));if(t)showTip(t.k,t.t());else tipT=0;}
ui.tipTick=tipTick;
ui.openDialog=openDialog;
let lastSpoken='';
ui.showText=(n,t,b)=>{ui.dlgNpc=n;ui._custom={t,b:b||[]};};
function renderDialog(){const n=ui.dlgNpc;if(!n)return;G.S=G.calc();const cu=ui._custom;ui._custom=null;const d=cu||G.npcDialog(n),el=$('dialog');if(d.t!==lastSpoken){lastSpoken=d.t;G.voice&&G.voice.speak(n,d.t);}el.innerHTML=`<div class="dn">${n.name}</div><div class="dt"></div><div class="btns"></div>`;el.querySelector('.dt').textContent=d.t;const bb=el.querySelector('.btns');
 const add=(l,f,cls)=>{const e=document.createElement('button');e.className='btn'+(cls?' '+cls:'');e.textContent=l;e.addEventListener('click',f);bb.appendChild(e);};
 const SERV=/Handeln|Ausrüstung|Schmiede|Heile mich|→|Gold|Hammer|Saat|Später|Geschenk|Kopfgeld|Gefängnis|Fliehen|Möbel|Werkzeug|Deko|ausbauen|Schaufenster|Kartenladen|Zimmer|spielen|Spielautomat|Geschlossen|Laden|Kerker/;const isQ=b=>b.q||!SERV.test(b.l);const qb=d.b.filter(isQ),sb=d.b.filter(b=>!isQ(b));
 if(qb.length){const h=document.createElement('div');h.className='dqh';h.textContent='❗ Quest';bb.appendChild(h);}
 qb.forEach(b=>add('❗ '+b.l.replace(/^📜\s*/,''),()=>{if(b.f)b.f();if(b.c)closeDialog();else renderDialog();G.save();},'qopt'));
 if(qb.length&&sb.length){const h=document.createElement('div');h.className='dqh dqs';h.textContent='Sonstiges';bb.appendChild(h);}
 sb.forEach(b=>add(b.l,()=>{if(b.f)b.f();if(b.c)closeDialog();else renderDialog();G.save();}));
 if(!cu)add('💬 Unterhalten',()=>{closeDialog();openChat(n);},'blue');add(cu?'Weiter':'Tschüss',cu?renderDialog:closeDialog);el.style.display=pcMode?'block':'flex';}
ui.closeDialog=()=>closeDialog();function closeDialog(){if(ui.dlgNpc&&G.voice)G.voice.stop();lastSpoken='';ui.dlgNpc=null;$('dialog').style.display='none';}
// ===================== Gespräche (KI) =====================
let sampleFn=null,aiTried=false,aiOff=false;
async function getSample(){if(sampleFn)return sampleFn;if(aiOff)return null;if(!window.claude||!window.claude.use){return null;}
 if(!aiTried){aiTried=true;try{sampleFn=await Promise.race([window.claude.use('sample'),new Promise(r=>setTimeout(()=>r(null),10000))]);}catch(e){sampleFn=null;}if(!sampleFn)aiOff=true;}return sampleFn;}
setTimeout(()=>{getSample();},1500);
function openChat(n){chatNpc=n;G.attackHeld=false;$('chatName').textContent='💬 '+n.name;const log=$('chatLog');log.innerHTML='';const hist=G.P.chat[n.id]||[];
 if(!hist.length){const gr=G.pick(n.greet||['Sei gegrüßt.']);addMsg('n',gr,n);G.voice&&G.voice.speak(n,gr);}else hist.slice(-10).forEach(h=>addMsg(h.r,h.t,n));
 $('chatNote').textContent=aiOff||!window.claude?'Hinweis: Freie KI-Antworten sind hier gerade nicht verfügbar. Die Figuren antworten mit einfachen Sätzen.':'Schreib, was dein Ritter sagt. '+n.short+' antwortet frei darauf.';
 $('chat').classList.add('show');setTimeout(()=>{try{$('chatIn').focus();}catch(e){}},50);}
function closeChat(){if(chatNpc&&G.voice)G.voice.stop();chatNpc=null;$('chat').classList.remove('show');try{$('chatIn').blur();}catch(e){}}
function addMsg(r,t,n){const d=document.createElement('div');d.className='msg '+r;if(r==='n'){const b=document.createElement('b');b.textContent=(n||chatNpc).short;d.appendChild(b);}const s=document.createElement('span');s.textContent=t;d.appendChild(s);$('chatLog').appendChild(d);$('chatLog').scrollTop=1e6;return s;}
const clean=(t,n)=>(t||'').replace(/^\s*["„“»]*/,'').replace(new RegExp('^'+n.short+'\\s*:\\s*'),'').replace(/["“”«]+\s*$/,'').trim();
function buildPrompt(n,hist){const lines=hist.slice(-12).map(h=>(h.r==='p'?'Ritter (Spieler)':n.short)+': '+h.t).join('\n');
 return `Du spielst ${n.name} in einem mittelalterlichen Fantasy-Rollenspiel namens „Aschenkrone – Die Chroniken von Eldmar“.
Deine Rolle: ${n.persona}
Die Welt: ${G.LORE}
Aktueller Spielstand: ${G.storyContext()}
Regeln:
- Antworte ausschließlich als ${n.short}, auf Deutsch, in 1 bis 3 kurzen Sätzen (höchstens 60 Wörter), im Ton einer mittelalterlichen Welt.
- Reagiere direkt und persönlich auf das, was der Ritter gerade gesagt hat, und bleib bei deiner Persönlichkeit.
- Erfinde keine Belohnungen, Gegenstände, Orte oder Spielregeln, die oben nicht vorkommen, und versprich nichts.
- Wenn nach dem Weg oder der Aufgabe gefragt wird, hilf passend zum aktuellen Spielstand.
- Keine modernen Begriffe. Erwähne nie, dass du eine KI oder eine Spielfigur bist.
- Bei unpassenden oder anstößigen Themen weichst du höflich und in deiner Rolle aus.
Bisheriges Gespräch:
${lines}
Antworte jetzt nur mit dem, was ${n.short} als Nächstes sagt, ohne Namen davor und ohne Anführungszeichen.`;}
function fallback(n,text){const t=text.toLowerCase(),o=G.objective().t,pk=G.pick;
 const R=[[/(drache|ignarok)/,['Ignarok … allein der Name lässt mich erschaudern. Er haust in den Aschenbergen im hohen Norden.','Der Drache? Möge er an seinem eigenen Feuer ersticken!']],
 [/(elara|prinzessin)/,['Die arme Prinzessin! Fürst Aldric ist außer sich vor Sorge.']],
 [/(weg|wohin|aufgabe|quest|was soll|hilfe|tun)/,[`Wenn du mich fragst: ${o}.`]],
 [/(wer bist|dein name|heißt)/,[`Man nennt mich ${n.name}.`]],
 [/(walhall|walküre|götter|gott)/,['Man munkelt, die Walküren haben dich zurückgeschickt. Dein Werk ist wohl noch nicht getan.']],
 [/(danke|dank)/,['Gern geschehen, Ritter.']],
 [/(tschüss|lebewohl|auf wiedersehen|bis bald)/,['Mögen die Götter dich schützen!']],
 [/(gold|kaufen|händler|trank|verkauf)/,['Händlerin Greta auf dem Markt verkauft Tränke und kauft Beute an.']],
 [/(burg|aldric|fürst)/,['Die Burg thront auf dem Hügel im Norden des Dorfes. Dort regiert Fürst Aldric.']],
 [/(goblin|grukk)/,['Goblins hausen im Finsterwald, im Südosten. Ihr Häuptling heißt Grukk.']],
 [/(hallo|hi\b|grüß|servus|moin|guten)/,[`Sei gegrüßt, Ritter! Was führt dich zu mir?`]]];
 for(const [re,a] of R)if(re.test(t))return pk(a);
 return pk(n.greet||['Hm.'])+' '+pk(['Erzähl mir mehr.','Pass auf dich auf da draußen.','So so …','Das ist eine Geschichte für die Taverne!']);}
let chatBusy=false;
$('chatRow').addEventListener('submit',async e=>{e.preventDefault();const inp=$('chatIn'),text=inp.value.trim();if(!text||chatBusy||!chatNpc)return;inp.value='';const n=chatNpc;
 const hist=G.P.chat[n.id]||(G.P.chat[n.id]=[]);hist.push({r:'p',t:text});addMsg('p',text);const el=addMsg('n','…',n);chatBusy=true;$('chatSend').disabled=true;
 let out='';const s=await getSample();
 if(s){try{const res=await s(buildPrompt(n,hist),{modelTier:'quick',cache:false,onText:({text})=>{const c=clean(text,n);if(c)el.textContent=c;$('chatLog').scrollTop=1e6;}});out=clean(res&&res.text,n);}
  catch(err){if(err&&err.code==='not_granted'){aiOff=true;sampleFn=null;$('chatNote').textContent='KI-Antworten wurden abgelehnt. Die Figuren antworten mit einfachen Sätzen.';}else if(err&&err.code==='rate_limited'){$('chatNote').textContent='Zu viele Nachrichten, warte einen Moment.';}}}
 if(!out)out=fallback(n,text);el.textContent=out;if(chatNpc===n&&G.voice)G.voice.speak(n,out);hist.push({r:'n',t:out});if(hist.length>16)hist.splice(0,hist.length-16);
 chatBusy=false;$('chatSend').disabled=false;$('chatLog').scrollTop=1e6;G.save();});
$('chatClose').addEventListener('click',closeChat);
// ===================== Menüs =====================
function show(id,on){$(id).classList.toggle('show',!!on);}
document.querySelectorAll('#settings .vol input').forEach(inp=>{const k=inp.dataset.v;const upd=()=>{G.settings[k]=+inp.value;inp.nextElementSibling.textContent=inp.value;G.applyVol&&G.applyVol();};inp.addEventListener('input',upd);inp.addEventListener('change',()=>{upd();G.saveSettings();if(k==='vSfx')G.sfx&&G.sfx('coin');if(k==='vVoice'&&G.voice)G.voice.speak({id:'mara'},'So klinge ich.');});});
function refreshSettings(){document.querySelectorAll('#settings .vol input').forEach(inp=>{const k=inp.dataset.v;inp.value=G.settings[k]??80;inp.nextElementSibling.textContent=inp.value;});document.querySelectorAll('#settings .seg').forEach(seg=>{const k=seg.dataset.k;let v=G.settings[k];if(k==='dmgNums'||k==='sound'||k==='music')v=v===false?'0':'1';seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));});
 const D=G.D();$('diffNote').textContent=D.d+(state==='game'?' Gilt sofort für neue Gegner und Beute.':'');}
document.querySelectorAll('#settings .seg').forEach(seg=>seg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=seg.dataset.k;let v=b.dataset.v;if(k==='dmgNums'||k==='sound'||k==='music')v=v==='1';
 G.settings[k]=v;if(k==='diff'&&G.P)G.P.diff=v;G.saveSettings();if(k==='win')applyWin(v);if(k==='sound'||k==='music')G.applyVol&&G.applyVol();if(k==='voices'&&G.voice&&ui.dlgNpc)G.voice.speak(ui.dlgNpc,'Hört Ihr mich?');if(k==='quality'&&G.R3D.dispose)G.R3D.dispose();if(k==='cam'&&v==='fp'){G.camYaw=Math.atan2(G.P?G.P.fx:0,G.P?-G.P.fy:1);G.camPitch=-.06;}if(k==='mode'||k==='quality')applyMode();applyGui();refreshSettings();}));
const openSettings=()=>{if(document.pointerLockElement)document.exitPointerLock();setOpen=true;refreshSettings();keyCap=null;renderKeys();show('settings',1);};
$('setClose').addEventListener('click',()=>{setOpen=false;show('settings',0);});
function fillHelp(){const D=G.D();let h='<tr><th>Seltenheit</th><th>Monster</th><th>Boss</th></tr>';for(let i=0;i<6;i++)h+=`<tr><td style="color:${RAR[i].d};font-weight:bold">● ${RAR[i].n}</td><td>${D.N[i]} %</td><td>${D.B[i]} %</td></tr>`;$('dropTable').innerHTML=h;
 $('dropInfo').innerHTML=`Schwierigkeit <b>${D.n}</b>: Monster droppen zu <b>${Math.round(D.chN*100)} %</b> einen Gegenstand, Bosse zu <b>${Math.round(D.chB*100)} %</b>. XP bekommst du immer. Glück erhöht die Drop-Chance.`;}
const openHelp=()=>{helpOpen=true;fillHelp();show('help',1);};
$('helpClose').addEventListener('click',()=>{helpOpen=false;show('help',0);});
$('bHelp').addEventListener('click',()=>{openHelp();ui.flashHint&&ui.flashHint();});
$('bPause').addEventListener('click',()=>{pauseOpen=true;G.attackHeld=false;show('pause',1);});
$('pauseClose').addEventListener('click',()=>{pauseOpen=false;show('pause',0);});$('pResume').addEventListener('click',()=>{pauseOpen=false;show('pause',0);const w=G.settings.win;if(w==='full'||w==='borderless')applyWin(w,1);regrab();});
$('pSettings').addEventListener('click',openSettings);$('pHelp').addEventListener('click',openHelp);
$('pMenu').addEventListener('click',()=>{G.save();pauseOpen=false;show('pause',0);toMenu();});
$('bRespawn').addEventListener('click',()=>{G.respawn();show('death',0);});
ui.onDeath=loss=>{G.attackHeld=false;closeDialog();closeChat();$('deathTxt').textContent='Die Dorfbewohner haben dich zurück nach Eichenhain getragen. Deine Ausrüstung ist sicher.'+(loss>0?` Du hast ${loss} Gold verloren.`:'');show('death',1);};
// Hauptmenü
function toMenu(){state='menu';$('hud').style.display='none';c3d.style.display='none';closeDialog();closeChat();closeInv();show('menu',1);$('mContinue').style.display=G.hasSave()?'block':'none';$('mContinue').textContent=G.hasSave()?`Fortsetzen (Spielstand ${G.slot})`:'Fortsetzen';$('mNew').textContent='Spielstände';}
// ===== Spielstand sichern: Export / Import (Datei oder Text-Code) =====
const SAVEPRE='ASCHENKRONE-SAVE:';
async function packSave(n){const raw=localStorage.getItem(G.SK?G.SK(n):null)||G.rawSlot(n);if(!raw)return null;const obj={v:1,game:'aschenkrone',slot:n,at:Date.now(),save:raw,settings:localStorage.getItem('eichenhain_settings_v2')};const js=JSON.stringify(obj);
 try{if(window.CompressionStream){const cs=new Blob([js]).stream().pipeThrough(new CompressionStream('gzip'));const buf=new Uint8Array(await new Response(cs).arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return SAVEPRE+'Z'+btoa(s);}}catch(e){}
 return SAVEPRE+'J'+btoa(unescape(encodeURIComponent(js)));}
async function unpackSave(code){code=(code||'').trim().replace(/\s+/g,'');if(code.startsWith('{')){return JSON.parse(code);}const i=code.indexOf(SAVEPRE.replace(/\s/g,''));if(i<0)throw new Error('Kein Aschenkrone-Code');code=code.slice(i+SAVEPRE.length);const kind=code[0],b=atob(code.slice(1));
 if(kind==='Z'){const u8=new Uint8Array(b.length);for(let k=0;k<b.length;k++)u8[k]=b.charCodeAt(k);const ds=new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(ds).text());}
 return JSON.parse(decodeURIComponent(escape(b)));}
function saveModal(title,html){const ov=document.createElement('div');ov.className='overlay';ov.style.display='flex';ov.style.zIndex=80;ov.innerHTML=`<div class="panel parch" style="width:min(460px,100%)"><div class="ph"><span>${title}</span><button class="x">✕</button></div>${html}</div>`;document.body.appendChild(ov);const close=()=>ov.remove();ov.querySelector('.x').onclick=close;return{ov,close};}
async function exportSlot(n){if(G.slot===n&&state==='game')G.save();const code=await packSave(n);if(!code){toast('Dieser Spielstand ist leer.','#ff8a80');return;}
 const inf=G.slotInfo(n)||{};const fname=`Aschenkrone_Spielstand${n}_Stufe${inf.lvl||1}_${new Date().toISOString().slice(0,10)}.txt`;
 const {ov}=saveModal('💾 Spielstand '+n+' sichern',`<p style="font-size:13px">Speichere die Datei oder kopiere den Code (z. B. in deine Notizen oder an dich selbst schicken). Damit kannst du den Spielstand jederzeit wiederherstellen.</p><div class="btns" style="flex-wrap:wrap"><button class="btn" data-a="file">⬇ Als Datei speichern</button>${navigator.share?'<button class="btn" data-a="share">📤 Teilen / Senden</button>':''}<button class="btn" data-a="copy">📋 Code kopieren</button></div><textarea readonly style="width:100%;height:110px;font:11px monospace;margin-top:8px;word-break:break-all">${code}</textarea><p style="font-size:11px;color:#6b5233">${Math.round(code.length/1024)} KB Code</p>`);
 ov.querySelector('[data-a=file]').onclick=()=>{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download=fname;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);toast('⬇ Datei wird gespeichert (Downloads-Ordner).','#a5d6a7');}catch(e){toast('Download nicht möglich – nimm „Code kopieren“.','#ff8a80');}};
 const sh=ov.querySelector('[data-a=share]');if(sh)sh.onclick=async()=>{try{const f=new File([code],fname,{type:'text/plain'});if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:'Aschenkrone Spielstand'});else await navigator.share({title:'Aschenkrone Spielstand',text:code});}catch(e){}};
 ov.querySelector('[data-a=copy]').onclick=async()=>{const ta=ov.querySelector('textarea');try{await navigator.clipboard.writeText(code);toast('📋 Code kopiert!','#a5d6a7');}catch(e){ta.focus();ta.select();try{document.execCommand('copy');toast('📋 Code kopiert!','#a5d6a7');}catch(_){toast('Markiere den Code und kopiere ihn von Hand.','#ffcc80');}}};}
function importSlot(n){const {ov,close}=saveModal('📂 Spielstand in Platz '+n+' laden',`<p style="font-size:13px">Wähle eine gesicherte Datei aus oder füge deinen Code ein.${G.slotInfo(n)?' <b style="color:#a02818">Achtung: Der jetzige Spielstand '+n+' wird ersetzt.</b>':''}</p><div class="btns"><label class="btn" style="position:relative;overflow:hidden">📁 Datei auswählen<input type="file" accept=".txt,.json,text/plain,application/json" style="position:absolute;inset:0;opacity:0"></label></div><textarea placeholder="ASCHENKRONE-SAVE:… hier einfügen" style="width:100%;height:110px;font:11px monospace;margin-top:8px"></textarea><div class="btns"><button class="btn big" data-a="go">✔ Spielstand laden</button></div>`);
 const ta=ov.querySelector('textarea');ov.querySelector('input[type=file]').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{ta.value=r.result;toast('Datei geladen – jetzt „Spielstand laden“ drücken.','#a5d6a7');};r.readAsText(f);};
 ov.querySelector('[data-a=go]').onclick=async()=>{try{const o=await unpackSave(ta.value);const raw=o.save||JSON.stringify(o);const s=JSON.parse(raw);if(!s||!s.P)throw new Error('kaputt');localStorage.setItem(G.SK(n),raw);if(o.settings&&!localStorage.getItem('eichenhain_settings_v2'))localStorage.setItem('eichenhain_settings_v2',o.settings);close();toast('✔ Spielstand wiederhergestellt!','#a5d6a7',true);openSlots();}catch(e){toast('❌ Der Code oder die Datei ist ungültig.','#ff8a80',true);}};}
ui.exportSlot=exportSlot;ui.importSlot=importSlot;window.__save={packSave,unpackSave,exportSlot,importSlot};
function openSlots(){const el=$('slotList');el.innerHTML='';for(let n=1;n<=3;n++){const inf=G.slotInfo(n),d=document.createElement('div');d.className='slotCard'+(G.slot===n?' cur':'');
  const dt=inf&&inf.at?new Date(inf.at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
  d.innerHTML=`<div class="sh">Spielstand ${n}</div>`+(inf?`<div class="si">⚔ Stufe ${inf.lvl} · 🪙 ${inf.gold} Gold${inf.diff?' · '+({easy:'Leicht',normal:'Normal',hard:'Schwer',hc:'Hardcore'}[inf.diff]||inf.diff):''}${dt?'<br><small>zuletzt: '+dt+'</small>':''}</div><div class="sb"><button class="btn" data-a="load">▶ Laden</button><button class="btn" data-a="new">✦ Neu</button><button class="btn red" data-a="del">🗑</button></div><div class="sb"><button class="btn" data-a="exp">💾 Sichern</button><button class="btn" data-a="imp">📂 Wiederherstellen</button></div>`:`<div class="si"><i>leer</i></div><div class="sb"><button class="btn" data-a="new">✦ Neues Spiel</button><button class="btn" data-a="imp">📂 Wiederherstellen</button></div>`);
  d.querySelectorAll('button').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='exp'){exportSlot(n);return;}if(a==='imp'){importSlot(n);return;}if(a==='load'){G.setSlot(n);if(G.load()){show('slotSel',0);show('menu',0);enterGame(true);}else toast('Spielstand defekt','#ff8a80');}
   else if(a==='new'){if(inf&&!b.dataset.ok){b.dataset.ok=1;b.textContent='Überschreiben?';return;}G.setSlot(n);show('slotSel',0);buildDiff();show('diffSel',1);}
   else if(a==='del'){if(!b.dataset.ok){b.dataset.ok=1;b.textContent='Sicher?';return;}G.wipeSlot(n);openSlots();}});el.appendChild(d);}show('slotSel',1);}
$('slotClose').addEventListener('click',()=>show('slotSel',0));
$('pBackup')&&$('pBackup').addEventListener('click',()=>exportSlot(G.slot));
addEventListener('pagehide',()=>{if(state==='game')G.save();});
$('mContinue').addEventListener('click',()=>{if(G.load()){show('menu',0);enterGame(true);}else openSlots();});
$('mNew').addEventListener('click',()=>openSlots());
$('mSettings').addEventListener('click',openSettings);$('mHelp').addEventListener('click',()=>{if(!G.P)G.newGame();openHelp();});
let pickDiff=G.settings.diff;
function buildDiff(){const el=$('diffCards');el.innerHTML='';pickDiff=G.settings.diff;const info={leicht:['Monster mit normaler Stärke','Schneller Stufenaufstieg, kurze Quests','Beute: Standard (Mythisch 0,01 %)'],normal:['Monster +50 % Leben, +45 % Schaden','Stufenunterschiede zählen stark','Beute: besser (Mythisch 0,02 %)'],schwer:['Monster +120 % Leben, doppelter Schaden','Längere Quests, höhere Stufen nötig','Beute: viel besser (Mythisch 0,05 %, Boss 0,1 %)']};
 for(const k of ['leicht','normal','schwer']){const D=G.DIFF[k];const c=document.createElement('div');c.className='dcard'+(k===pickDiff?' on':'');c.innerHTML=`<b>${{leicht:'🌿',normal:'⚔',schwer:'💀'}[k]} ${D.n}</b><p>${D.d}</p><ul>${info[k].map(s=>'<li>'+s+'</li>').join('')}</ul>`;c.addEventListener('click',()=>{pickDiff=k;el.querySelectorAll('.dcard').forEach(x=>x.classList.remove('on'));c.classList.add('on');});el.appendChild(c);}
 $('diffWarn').textContent=G.hasSave()?`Achtung: Spielstand ${G.slot} wird überschrieben.`:`Neues Spiel in Spielstand ${G.slot}.`;}
$('diffClose').addEventListener('click',()=>show('diffSel',0));
$('diffGo').addEventListener('click',()=>{show('diffSel',0);openChar(false);});
const LOOKOPT={gender:[['m','♂ Mann'],['f','♀ Frau']],
 skin:['#fbe3cc','#f6d5b0','#f1c27d','#e5b088','#d9a066','#c68a58','#b07a4a','#8d5a36','#7a4e2d','#5a3822','#4e3020','#3a2418'],
 hair:['#0e0a08','#1e1410','#3a2414','#4a2a14','#6b3e1e','#8a5226','#a0622a','#c07a3a','#d8b060','#ecd496','#e8e0d0','#9a9a9e','#a02818','#d04a20','#3a3a48','#2a4a8a','#6a2a7a','#2a6a4a'],
 styleM:[['short','Kurz'],['side','Seitenscheitel'],['messy','Zerzaust'],['curly','Locken'],['long','Lang'],['tail','Pferdeschwanz'],['braid','Flechtzopf'],['bun','Dutt'],['mohawk','Irokese'],['buzz','Kurzgeschoren'],['bald','Glatze']],
 styleF:[['long','Lang offen'],['wavy','Wellig'],['tail','Pferdeschwanz'],['braid','Flechtzopf'],['twin','Zwei Zöpfe'],['sidebraid','Seitenzopf'],['bun','Dutt'],['crown','Kranzfrisur'],['bob','Bob'],['pixie','Kurz'],['curly','Locken'],['messy','Zerzaust'],['buzz','Kurzgeschoren']],
 eyes:['#3a6ea8','#5a9ad8','#4a8a4a','#7aa05a','#6a4020','#8a5a2a','#2a2a2a','#7a9ab0','#a07020','#7a3a8a'],
 brows:[['thin','Schmal'],['normal','Normal'],['thick','Buschig']],
 beard:[[null,'Ohne'],['stubble','Stoppeln'],['mustache','Schnurrbart'],['goatee','Kinnbart'],['small','Kranzbart'],['short','Kurz'],['full','Vollbart'],['long','Langbart']],
 lips:['#c98a80','#b5615a','#d8707a','#b02838','#7a2a3a','#8a5a50'],
 mark:[['none','Nichts'],['freckles','Sommersprossen'],['scar','Narbe'],['paint','Kriegsbemalung'],['mole','Schönheitsfleck']],
 ear:[['none','Kein'],['gold','Gold'],['silver','Silber']],
 build:[['slim','Schlank'],['normal','Normal'],['broad','Kräftig']],
 height:[['s','Klein'],['m','Mittel'],['l','Groß']],
 tunic:['#3d6fb6','#2a4a7a','#a03030','#7a1a2a','#3a7a3a','#2a5a3a','#6a4a8a','#8a6a3a','#5a3a22','#2a2a30','#c8a040','#d8d0c0','#c86a3a','#4a8a8a'],
 cut:[['pants','Hose'],['skirt','Rock']],
 cape:['none','#8a1a1a','#1a3a7a','#2a5a2a','#2a2a2a','#5a3a1e','#6a2a7a','#c8a040']};
let charLook=null,charEdit=false,charT=0,charTab='body',charTried3d=false;G._pvRot=0;let pvDrag=null;
function openChar(edit){charEdit=edit;charLook=Object.assign({gender:'m',skin:'#f1c27d',hair:'#6b3e1e',style:'short',eyes:'#3a6ea8',brows:'normal',beard:null,lips:'#b5615a',mark:'none',ear:'none',build:'normal',height:'m',tunic:'#3d6fb6',cut:'pants',cape:'none'},edit&&G.P&&G.P.look||{});if(charLook.style==='wild')charLook.style='messy';G._pvRot=0;buildChar();show('charSel',1);}
function buildChar(){const el=$('charOpts');el.innerHTML='';const fem=charLook.gender==='f';
 const row=(lab,k,opts)=>{const d=document.createElement('div');d.className='crow';d.innerHTML=`<span>${lab}</span>`;const w=document.createElement('div');w.className='cops';const isCol=opts.length&&typeof opts[0]==='string'&&opts.some(o=>/^#/.test(o));if(isCol){const pk=document.createElement('label');pk.className='cpick';const cur=/^#/.test(charLook[k]||'')?charLook[k]:'#888888';pk.innerHTML=`<input type="color" value="${cur}"><span style="background:${charLook[k]==='none'?'transparent':cur}"></span>🎨`;const inp=pk.querySelector('input');inp.addEventListener('input',()=>{charLook[k]=inp.value;pk.querySelector('span').style.background=inp.value;});inp.addEventListener('change',()=>{charLook[k]=inp.value;buildChar();});w.appendChild(pk);}
 opts.forEach(o=>{const v=Array.isArray(o)?o[0]:o,txt=Array.isArray(o)?o[1]:'';const b=document.createElement('button');b.className='cop'+(charLook[k]===v?' on':'')+(txt?' txt':'');if(txt)b.textContent=txt;else if(v==='none'){b.textContent='✕';b.className+=' none';}else b.style.background=v;b.addEventListener('click',()=>{charLook[k]=v;if(k==='gender'){const L=v==='f'?LOOKOPT.styleF:LOOKOPT.styleM;if(!L.some(q=>q[0]===charLook.style))charLook.style=L[0][0];if(v==='f')charLook.beard=null;}buildChar();});w.appendChild(b);});d.appendChild(w);el.appendChild(d);};
 row('Geschlecht','gender',LOOKOPT.gender);
 const tabs=document.createElement('div');tabs.className='ctabs';for(const [k,t] of [['body','Körper'],['face','Gesicht'],['hair','Haare'],['cloth','Kleidung']]){const b=document.createElement('button');b.className='ctab'+(charTab===k?' on':'');b.textContent=t;b.addEventListener('click',()=>{charTab=k;buildChar();});tabs.appendChild(b);}el.appendChild(tabs);
 if(charTab==='body'){row('Haut','skin',LOOKOPT.skin);row('Statur','build',LOOKOPT.build);row('Größe','height',LOOKOPT.height);}
 else if(charTab==='face'){row('Augen','eyes',LOOKOPT.eyes);row('Brauen','brows',LOOKOPT.brows);if(fem)row('Lippen','lips',LOOKOPT.lips);row('Merkmal','mark',LOOKOPT.mark);row('Ohrringe','ear',LOOKOPT.ear);}
 else if(charTab==='hair'){row('Frisur','style',fem?LOOKOPT.styleF:LOOKOPT.styleM);row('Haarfarbe','hair',LOOKOPT.hair);if(!fem){row('Bart','beard',LOOKOPT.beard);if(charLook.beard){row('Bartfarbe','beardC',LOOKOPT.hair);}}}
 else{row('Farbe','tunic',LOOKOPT.tunic);row('Schnitt','cut',LOOKOPT.cut);row('Umhang','cape',LOOKOPT.cape);}
 $('charGo').textContent=charEdit?'✔ Übernehmen':'⚔ Abenteuer beginnen';}
function charPreview(dt){const cv=$('charCv');const L=charLook,ld=G.lookDraw(L);
 if(!charTried3d&&G.settings.mode==='3d'&&!G.R3D.ok){charTried3d=true;try{G.R3D.init(c3d);}catch(e){}}
 const a=G._pvRot,o=Object.assign({},ld,{body:L.tunic,legs:'#4a3a2a',cape:ld.lcape,fx:Math.sin(a),fy:Math.cos(a),moving:false,anim:charT,swing:0,wkind:'sword',wc:'#9aa0a6',guard:'#c9a86a',scale:1,zoom:.92,ty:.18});
 if(G.R3D.ok&&G.R3D.preview&&G.R3D.preview(cv,o))return;G.R2D.preview(cv,L,charT);}
{const cv=$('charCv');cv.addEventListener('pointerdown',e=>{pvDrag={x:e.clientX};cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);e.preventDefault();});cv.addEventListener('pointermove',e=>{if(!pvDrag)return;G._pvRot+=(e.clientX-pvDrag.x)*.015;pvDrag.x=e.clientX;});const up=()=>pvDrag=null;cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);}
$('charRnd').addEventListener('click',()=>{const p=a=>{const o=a[Math.floor(Math.random()*a.length)];return Array.isArray(o)?o[0]:o;};const g=charLook.gender||'m';charLook={gender:g,skin:p(LOOKOPT.skin),hair:p(LOOKOPT.hair.slice(0,13)),style:p(g==='f'?LOOKOPT.styleF:LOOKOPT.styleM),eyes:p(LOOKOPT.eyes),brows:p(LOOKOPT.brows),beard:g==='m'&&Math.random()<.5?p(LOOKOPT.beard):null,lips:p(LOOKOPT.lips),mark:Math.random()<.35?p(LOOKOPT.mark):'none',ear:Math.random()<.3?p(LOOKOPT.ear):'none',build:p(LOOKOPT.build),height:p(LOOKOPT.height),tunic:p(LOOKOPT.tunic),cut:Math.random()<(g==='f'?.4:.1)?'skirt':'pants',cape:Math.random()<.3?p(LOOKOPT.cape):'none'};buildChar();});
$('charClose').addEventListener('click',()=>{show('charSel',0);if(!charEdit)show('diffSel',1);});
$('charGo').addEventListener('click',()=>{show('charSel',0);if(charEdit){G.P.look=Object.assign({},charLook);G.save();toast('🎨 Aussehen gespeichert','#ffd54a');return;}show('menu',0);G.wipe();G.newGame(pickDiff);G.P.look=Object.assign({},charLook);G.save();cutscene('intro',()=>enterGame(false));});
$('pLook').addEventListener('click',()=>{pauseOpen=false;show('pause',0);openChar(true);});
function enterGame(cont){perfGrace=8;fogLoad();{const w=G.settings.win;if(w==='full'||w==='borderless')applyWin(w,1);}state='game';$('hud').style.display='block';show('menu',0);applyMode();G.invDirty=true;G.S=G.calc();
 if(cont)toast(`Willkommen zurück! ${G.chapter()}`,'#ffd54a',true);else if(G.P.main===0)toast('📜 Folge dem goldenen ★ im Kompass zu Heilerin Mara','#ffd54a',true);}
ui.cutscene=(id)=>{G.save();cutscene(id,()=>enterGame(true));};
// ===================== Zwischensequenzen =====================
const CUTS={intro:[['night','Eldmar. Tausend Jahre lang schlief der Feuerdrache Ignarok unter den Aschenbergen. Dann, in einer Nacht ohne Wind, glühten die Felsen auf – und etwas öffnete die Augen.'],
 ['crown','Weit im Süden setzte sich eine Gestalt ohne Gesicht eine Krone auf: geschmiedet aus Drachenasche und gebrochenen Eiden. Die Aschenkrone. Mit ihr rief sie den Drachen – und den Fluch.'],
 ['curse','Seitdem kriecht der Aschenfluch über das Land. Was außerhalb geweihter Mauern lebt, verfällt dem Zorn – Wolf, Bär, selbst der kleinste Hase. Nur die Runensteine der Dörfer und fließendes Wasser halten ihn fern.'],
 ['battle','Die Ritter der Silberwacht ritten dem Drachen entgegen. Du warst einer von ihnen. Am Aschenpass hieltest du stand, als alle anderen fielen … bis das Feuer auch dich verschlang.'],
 ['valhalla','Doch die Walküren verwehrten dir den Einzug nach Valhalla. „Dein Werk ist unvollendet“, sprachen sie. „Der Drache ist nur ein Werkzeug. Finde den, der die Aschenkrone trägt.“'],
 ['raid','Vor drei Nächten fiel Ignarok über das Dorf Eichenhain her. Er brannte die Felder nieder und entführte Prinzessin Elara, die Tochter von Fürst Aldric.'],
 ['dawn','Am Flussufer vor Eichenhain schlägst du die Augen auf – ohne Rüstung, mit einem rostigen Schwert. Heilerin Mara hat dich gefunden. Dein Weg nach Valhalla beginnt hier.']],
 outro:[['victory','Kaiser Valdrik ist gefallen, die Aschenkrone liegt zerbrochen im Staub. Elara ist daheim, und in Eichenhain läuten die Glocken die ganze Nacht.'],
 ['curse','Der Fluch hat seinen Meister verloren. Doch Jahre des Zorns sitzen tief im Land – noch lange wird hinter den Mauern nicht alles friedlich sein.'],
 ['gates','In jener Nacht öffneten sich die Tore Valhallas für dich. Doch du bliebst. Solange Eldmar dich braucht, braucht es seinen Ritter.'],
 ['dawn','Ende der Hauptgeschichte. Du kannst weiterspielen, Bosse jagen, mythische Beute finden und deine Verbündeten besuchen.']]};
let cs=null;
function cutscene(id,cb){state='cutscene';show('menu',0);$('hud').style.display='none';c3d.style.display='none';closeDialog();closeChat();cs={list:CUTS[id],i:0,t:0,chars:0,hold:0,cb,shown:''};show('cs',1);}
function csNext(){cs.i++;cs.t=0;cs.chars=0;cs.hold=0;if(cs.i>=cs.list.length)csEnd();}
function csEnd(){if(!cs)return;const cb=cs.cb;cs=null;show('cs',0);$('csText').textContent='';cb&&cb();}
$('cs').addEventListener('click',e=>{if(!cs||e.target.id==='csSkip')return;const txt=cs.list[cs.i][1];if(cs.chars<txt.length)cs.chars=txt.length;else csNext();});
$('csSkip').addEventListener('click',e=>{e.stopPropagation();csEnd();});
// ===================== Story-Bilder (v20: neu gezeichnet) =====================
// Kleine Mal-Bibliothek: Himmel, Bergketten, Wälder, Wolken, Lichtstrahlen, Figuren. Alles skaliert mit m=min(w,h).
const NZ=(x,s)=>G.noise(x,s,s*.7);
function sky(g,w,h,st){const gr=g.createLinearGradient(0,0,0,h);st.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);}
function stars(g,w,h,t,k){k=k||.55;for(let i=0;i<110;i++){const x=G.h2(i,1,7)*w,y=G.h2(i,2,7)*h*k,s=G.h2(i,3,7)<.12?2.2:1.3;g.globalAlpha=.35+.65*Math.abs(Math.sin(t*1.3+i*1.7));g.fillStyle=G.h2(i,4,7)<.2?'#ffe9c0':'#fff';g.fillRect(x,y,s,s);}g.globalAlpha=1;}
function glow(g,x,y,r,col,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
function fireGlow(g,x,y,r,t,a){glow(g,x,y,r*(1+Math.sin(t*9+x)*.06),'255,150,50',a);}
// Bergkette mit Verlauf und heller Kante
function ridge(g,w,h,y0,amp,seed,sc,top,bot,rim,jag){const pts=[];const N=90;for(let i=0;i<=N;i++){const u=i/N,x=u*w;let v=NZ(u*sc,seed)*.7+NZ(u*sc*3.1,seed+5)*.22+(jag?Math.abs(NZ(u*sc*7,seed+9)-.5)*.5:NZ(u*sc*8,seed+9)*.08);pts.push([x,y0-v*amp]);}
 let mn=1e9;for(const p of pts)mn=Math.min(mn,p[1]);const gr=g.createLinearGradient(0,mn,0,h);gr.addColorStop(0,top);gr.addColorStop(1,bot);g.fillStyle=gr;g.beginPath();g.moveTo(0,h);for(const p of pts)g.lineTo(p[0],p[1]);g.lineTo(w,h);g.closePath();g.fill();
 if(rim){g.strokeStyle=rim;g.lineWidth=Math.max(1,w/600);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();}return pts;}
function hills(g,w,h,y0,amp,col,seed,sc){ridge(g,w,h,y0,amp,seed,sc||4,col,col);}
function haze(g,w,y,hh,col,a){const gr=g.createLinearGradient(0,y-hh,0,y+hh);gr.addColorStop(0,`rgba(${col},0)`);gr.addColorStop(.5,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(0,y-hh,w,hh*2);}
function clouds(g,w,h,t,y,n,col,a,seed,spd,sz){const m=Math.min(w,h);for(let i=0;i<n;i++){const r=m*(sz||.16)*(.6+G.h2(i,1,seed)*.8),x=((G.h2(i,2,seed)*1.4*w+t*(spd||6)*(1+G.h2(i,4,seed)))%(w*1.4))-w*.2,yy=y+(G.h2(i,3,seed)-.5)*m*.12;
 for(let k=0;k<5;k++){const ox=(k-2)*r*.42,oy=-Math.sin(k/4*Math.PI)*r*.22;const gr=g.createRadialGradient(x+ox,yy+oy,0,x+ox,yy+oy,r*.55);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.beginPath();g.ellipse(x+ox,yy+oy,r*.55,r*.32,0,0,7);g.fill();}}}
function rays(g,x,y,len,n,col,a,t,spread,dir){g.save();g.translate(x,y);g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const an=(dir||Math.PI/2)+(i/(n-1)-.5)*(spread||1.2)+Math.sin(t*.3+i)*.02,wd=len*(.02+.03*G.h2(i,8,3));g.save();g.rotate(an-Math.PI/2);const gr=g.createLinearGradient(0,0,0,len);gr.addColorStop(0,`rgba(${col},${a*(.5+.5*Math.abs(Math.sin(t*.7+i*2.1)))})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.beginPath();g.moveTo(-wd*.2,0);g.lineTo(-wd,len);g.lineTo(wd,len);g.lineTo(wd*.2,0);g.fill();g.restore();}g.restore();}
function embers(g,w,h,t,n,col){for(let i=0;i<n;i++){const x=(G.h2(i,5,9)*w+Math.sin(t*1.3+i)*24)%w,y=h-((t*42*(.5+G.h2(i,6,9))+G.h2(i,7,9)*h)%h),s=1.5+G.h2(i,1,9)*2.2;g.fillStyle=col?`rgba(${col},${.5+G.h2(i,8,9)*.5})`:`rgba(255,${130+i%100},50,${.5+G.h2(i,8,9)*.5})`;g.fillRect(x,y,s,s);}}
function pines(g,w,y0,s,col,seed,dens){g.fillStyle=col;const n=Math.ceil(w/(14*s)*(dens||1));for(let i=0;i<n;i++){const x=(i+G.h2(i,1,seed)*.8)*w/n,hh=(26+G.h2(i,2,seed)*30)*s,ww=hh*.32;g.beginPath();g.moveTo(x,y0-hh);for(let k=1;k<=4;k++){const yy=y0-hh+hh*k/4.4,wk=ww*k/4;g.lineTo(x+wk,yy);g.lineTo(x+wk*.45,yy);}g.lineTo(x+ww*.15,y0);g.lineTo(x-ww*.15,y0);for(let k=4;k>=1;k--){const yy=y0-hh+hh*k/4.4,wk=ww*k/4;g.lineTo(x-wk*.45,yy);g.lineTo(x-wk,yy);}g.closePath();g.fill();}}
let _grain=null;function post(g,w,h,t,vig){if(!_grain){_grain=document.createElement('canvas');_grain.width=_grain.height=128;const q=_grain.getContext('2d'),im=q.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=14;}q.putImageData(im,0,0);}
 const vg=g.createRadialGradient(w/2,h*.5,Math.min(w,h)*.3,w/2,h*.5,Math.max(w,h)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${vig==null?.55:vig})`);g.fillStyle=vg;g.fillRect(0,0,w,h);
 g.save();const pat=g.createPattern(_grain,'repeat');g.translate((t*97)%128,(t*61)%128);g.fillStyle=pat;g.fillRect(-128,-128,w+256,h+256);g.restore();}
// ---- Figuren ----
// Drache: Körper, langer Hals, gehörnter Kopf, zwei Flügel mit Fingerknochen und Häuten, Schwanz mit Spitze
function dragon(g,x,y,s,f,col,o){o=o||{};g.save();g.translate(x,y);g.scale(s*(o.flip?-1:1),s);g.fillStyle=col;g.strokeStyle=col;const fl=Math.max(-.6,Math.min(1.2,f));
 const wing=(back)=>{g.save();g.translate(back?-6:4,-8);const lift=(back?.82:1);g.rotate(-.2-fl*.9*lift);g.beginPath();g.moveTo(0,0);const tip=[-30,-78*lift],elb=[-8,-46*lift];g.lineTo(elb[0],elb[1]);g.lineTo(tip[0],tip[1]);
  const fing=[[-62,-58],[-80,-30],[-86,-6],[-70,14]];let px=tip[0],py=tip[1];for(const [fx,fy] of fing){const mx=(px+fx)/2+6,my=(py+fy)/2+10;g.quadraticCurveTo(mx,my,fx*lift,fy*lift);px=fx*lift;py=fy*lift;}g.quadraticCurveTo(-34,10,-2,6);g.closePath();
  if(back){g.globalAlpha*=.82;}g.fill();g.globalAlpha=o.a||1;if(o.rim){g.strokeStyle=o.rim;g.lineWidth=1.4;g.stroke();}
  g.strokeStyle=o.bone||'rgba(0,0,0,.35)';g.lineWidth=2.2;g.beginPath();g.moveTo(0,0);g.lineTo(elb[0],elb[1]);g.lineTo(tip[0],tip[1]);for(const [fx,fy] of fing){g.moveTo(elb[0],elb[1]);g.lineTo(fx*lift,fy*lift);}g.stroke();g.restore();};
 if(o.a)g.globalAlpha=o.a;wing(true);
 g.beginPath();g.moveTo(-30,0);g.bezierCurveTo(-60,6,-90,-4,-118,10);g.lineTo(-132,4);g.lineTo(-126,16);g.lineTo(-136,22);g.lineTo(-118,16);g.bezierCurveTo(-88,8,-58,16,-28,12);g.fill();
 g.beginPath();g.ellipse(0,4,36,13,-.05,0,7);g.fill();g.beginPath();g.ellipse(14,8,16,12,.3,0,7);g.fill();
 g.beginPath();g.moveTo(-18,14);g.lineTo(-24,30);g.lineTo(-16,30);g.lineTo(-10,15);g.fill();g.beginPath();g.moveTo(14,16);g.lineTo(12,30);g.lineTo(20,30);g.lineTo(22,15);g.fill();
 g.beginPath();g.moveTo(26,-2);g.bezierCurveTo(44,-10,48,-30,62,-34);g.lineTo(68,-28);g.bezierCurveTo(56,-22,52,-2,34,10);g.closePath();g.fill();
 g.beginPath();g.moveTo(58,-38);g.lineTo(78,-36);g.lineTo(92,-30);g.lineTo(80,-26);g.lineTo(90,-22);g.lineTo(70,-22);g.lineTo(60,-24);g.closePath();g.fill();
 g.beginPath();g.moveTo(62,-36);g.lineTo(52,-50);g.lineTo(68,-38);g.fill();g.beginPath();g.moveTo(67,-37);g.lineTo(62,-48);g.lineTo(72,-37);g.fill();
 for(let i=0;i<8;i++){const u=i/8,bx=-26+u*70,by=-6-Math.sin(u*Math.PI)*6-(u>.75?(u-.75)*80:0);g.beginPath();g.moveTo(bx-3,by+3);g.lineTo(bx,by-5);g.lineTo(bx+3,by+3);g.fill();}
 wing(false);
 if(o.eye){g.globalAlpha=1;g.fillStyle=o.eye;g.beginPath();g.ellipse(74,-32,2.6,1.4,-.2,0,7);g.fill();g.globalCompositeOperation='lighter';glow(g,74,-32,10,'255,170,60',.7);g.globalCompositeOperation='source-over';}
 if(o.fire){g.globalCompositeOperation='lighter';const L=o.fire;const gr=g.createLinearGradient(90,-26,90+L,-26+L*.55);gr.addColorStop(0,'rgba(255,250,200,.95)');gr.addColorStop(.35,'rgba(255,170,40,.85)');gr.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(88,-28);g.lineTo(90+L,-26+L*.55-L*.25);g.lineTo(90+L*.92,-26+L*.55+L*.25);g.closePath();g.fill();g.globalCompositeOperation='source-over';}
 g.restore();}
// Ritter mit Umhang, Schild, Federbusch; o.up=Schwert hoch, o.rot=kippen, o.rim=Lichtkante
function knight(g,x,y,s,o){o=o||{};g.save();g.translate(x,y);g.scale(s,s);if(o.rot)g.rotate(o.rot);const c=o.col||'#07070d';g.fillStyle=c;const wv=Math.sin((o.t||0)*3)*4;
 g.beginPath();g.moveTo(-11,-60);g.quadraticCurveTo(-30+wv,-28,-26+wv*1.4,0);g.lineTo(-4,-6);g.lineTo(8,-58);g.fill();
 g.beginPath();g.moveTo(-9,0);g.lineTo(-7,-30);g.lineTo(-1,-30);g.lineTo(-2,0);g.fill();g.beginPath();g.moveTo(2,0);g.lineTo(1,-30);g.lineTo(8,-30);g.lineTo(9,0);g.fill();g.fillRect(-11,-2,9,3);g.fillRect(1,-2,10,3);
 g.beginPath();g.moveTo(-12,-30);g.lineTo(12,-30);g.lineTo(14,-56);g.quadraticCurveTo(0,-64,-14,-56);g.closePath();g.fill();g.beginPath();g.ellipse(-13,-55,6,4,0,0,7);g.ellipse(13,-55,6,4,0,0,7);g.fill();
 g.beginPath();g.arc(0,-70,9,0,7);g.fill();g.fillRect(-9,-70,18,9);g.beginPath();g.moveTo(-1,-79);g.quadraticCurveTo(14,-98,24,-84+wv*.4);g.quadraticCurveTo(12,-86,2,-76);g.fill();
 g.save();g.translate(-14,-44);g.beginPath();g.moveTo(-9,-12);g.lineTo(9,-12);g.lineTo(8,4);g.quadraticCurveTo(0,16,-8,4);g.closePath();g.fill();if(o.rim){g.strokeStyle=o.rim;g.lineWidth=1;g.stroke();}g.restore();
 g.save();g.translate(12,-54);g.rotate(o.up?-2.7:-.2);g.fillRect(-2.5,0,5,18);g.fillRect(-9,16,18,3.5);g.beginPath();g.moveTo(-2,19);g.lineTo(2,19);g.lineTo(1.4,62);g.lineTo(0,68);g.lineTo(-1.4,62);g.closePath();g.fill();if(o.blade){g.fillStyle=o.blade;g.fillRect(-.6,22,1.2,40);}g.restore();
 if(o.rim){g.strokeStyle=o.rim;g.lineWidth=1.3;g.beginPath();g.arc(0,-70,9,-2.2,-.3);g.moveTo(14,-56);g.lineTo(12,-30);g.stroke();}
 g.restore();}
function lady(g,x,y,s,col,o){o=o||{};g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;const wv=Math.sin((o.t||0)*2.4)*3;
 g.beginPath();g.moveTo(-20,0);g.quadraticCurveTo(-14,-24,-8,-46);g.lineTo(8,-46);g.quadraticCurveTo(14,-24,22+wv,0);g.closePath();g.fill();
 g.beginPath();g.moveTo(-8,-46);g.lineTo(8,-46);g.lineTo(6,-58);g.lineTo(-6,-58);g.fill();g.beginPath();g.ellipse(-8,-54,3,10,.3,0,7);g.ellipse(8,-54,3,10,-.3,0,7);g.fill();
 g.beginPath();g.arc(0,-66,7.5,0,7);g.fill();g.beginPath();g.moveTo(-7,-68);g.quadraticCurveTo(-12-wv,-40,-10-wv,-30);g.lineTo(-4,-50);g.fill();g.beginPath();g.moveTo(7,-68);g.quadraticCurveTo(13+wv,-44,10+wv,-34);g.lineTo(4,-52);g.fill();
 if(o.hood){g.beginPath();g.moveTo(-10,-60);g.quadraticCurveTo(0,-86,10,-60);g.quadraticCurveTo(16,-40,12,-30);g.lineTo(-12,-30);g.quadraticCurveTo(-16,-40,-10,-60);g.fill();}
 if(o.crown!==false&&!o.hood){g.fillStyle=o.gold||col;g.beginPath();g.moveTo(-6,-72);g.lineTo(-6,-78);g.lineTo(-3,-75);g.lineTo(0,-80);g.lineTo(3,-75);g.lineTo(6,-78);g.lineTo(6,-72);g.fill();}
 if(o.staff){g.fillStyle=col;g.fillRect(14,-74,2.4,74);g.globalCompositeOperation='lighter';glow(g,15,-78,10,'140,255,160',.7);g.globalCompositeOperation='source-over';}
 g.restore();}
function valk(g,x,y,s,t,col,o){o=o||{};g.save();g.translate(x,y);g.scale(s,s);const f=Math.sin(t*2)*.12;
 for(const sd of [-1,1]){g.save();g.scale(sd,1);g.translate(4,-56);g.rotate(f-.15);for(let r=0;r<3;r++){g.fillStyle=r===0?col:o.wing2||col;g.globalAlpha=r===0?1:.85-r*.15;for(let i=0;i<7;i++){const a=-1.25+i*.24,L=(62-r*14)*(1-i*.06);g.save();g.rotate(a+.9);g.beginPath();g.ellipse(L*.5,0,L*.55,5.5-r,0,0,7);g.fill();g.restore();}}g.globalAlpha=1;g.restore();}
 knight(g,0,0,1,{up:true,col,rim:o.rim,blade:o.blade,t});g.fillStyle=col;for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*7,-74);g.lineTo(sd*18,-86);g.lineTo(sd*9,-70);g.fill();}g.restore();}
function castle(g,cx,y0,s,col,lit,t,o){o=o||{};g.fillStyle=col;const R=(x,y,w,h)=>g.fillRect(cx+x*s,y0-(y+h)*s,w*s,h*s);
 g.beginPath();g.moveTo(cx-110*s,y0);g.quadraticCurveTo(cx,y0-46*s,cx+110*s,y0);g.fill();R(-44,30,88,62);for(let i=0;i<6;i++)R(-44+i*16,92,9,9);
 for(const sd of [-1,1]){R(sd*52-11,20,22,100);g.beginPath();g.moveTo(cx+(sd*52-15)*s,y0-120*s);g.lineTo(cx+sd*52*s,y0-150*s);g.lineTo(cx+(sd*52+15)*s,y0-120*s);g.fill();
  if(o.banner){const bx=cx+sd*52*s,by=y0-150*s;g.fillRect(bx-.6*s,by-14*s,1.2*s,14*s);g.fillStyle=o.banner;g.beginPath();g.moveTo(bx,by-14*s);g.quadraticCurveTo(bx+8*s,by-12*s+Math.sin(t*4+sd)*2*s,bx+14*s,by-10*s);g.lineTo(bx,by-7*s);g.fill();g.fillStyle=col;}}
 R(-12,92,24,40);g.beginPath();g.moveTo(cx-16*s,y0-132*s);g.lineTo(cx,y0-168*s);g.lineTo(cx+16*s,y0-132*s);g.fill();
 if(lit){g.fillStyle=lit;for(const [x,y] of [[-30,60],[-12,64],[10,58],[28,62],[-54,90],[50,96],[-4,108]]){const fl=.7+Math.sin(t*3+x)*.15;g.globalAlpha=fl;g.fillRect(cx+x*s,y0-y*s,4*s,6*s);}g.globalAlpha=1;}}
function village(g,w,h,y0,s,col,lit,t){g.fillStyle=col;for(let i=0;i<11;i++){const x=w*(.03+i*.095),hh=(16+G.h2(i,3,3)*16)*s,ww=(24+G.h2(i,4,3)*14)*s;g.fillRect(x,y0-hh,ww,hh);g.beginPath();g.moveTo(x-4*s,y0-hh);g.lineTo(x+ww/2,y0-hh-15*s);g.lineTo(x+ww+4*s,y0-hh);g.fill();g.fillRect(x+ww*.7,y0-hh-14*s,4*s,10*s);
  if(lit){g.fillStyle=`rgba(255,200,90,${.6+Math.sin(t*3+i)*.2})`;g.fillRect(x+ww*.35,y0-hh*.62,5*s,6*s);g.fillStyle=col;}}
 castle(g,w*.52,y0,s,col,lit?'#ffcf70':null,t);}
function smoke(g,x,y,t,m,col,n){for(let i=0;i<(n||6);i++){const u=((t*.12+i/(n||6))%1),r=m*(.012+u*.035);g.fillStyle=`rgba(${col||'40,34,34'},${.2*(1-u)})`;g.beginPath();g.arc(x+Math.sin(t+i)*m*.03+u*m*.08,y-u*m*.45,r,0,7);g.fill();}}
function eyes(g,x,y,s,t,i){const bl=Math.sin(t*1.7+i*3)>.93?.1:1;g.fillStyle='#ff3a20';g.globalCompositeOperation='lighter';glow(g,x,y,8*s,'255,40,20',.5*bl);g.fillRect(x-3*s,y-1*s*bl,2.2*s,2*s*bl);g.fillRect(x+1*s,y-1*s*bl,2.2*s,2*s*bl);g.globalCompositeOperation='source-over';}
function aschenkrone(g,x,y,s,t){g.save();g.translate(x,y);g.scale(s,s);g.globalCompositeOperation='lighter';glow(g,0,0,70,'255,120,40',.45+.15*Math.sin(t*3));g.globalCompositeOperation='source-over';
 const gr=g.createLinearGradient(0,-24,0,10);gr.addColorStop(0,'#3a3030');gr.addColorStop(1,'#151012');g.fillStyle=gr;g.beginPath();g.moveTo(-26,8);g.lineTo(-26,-6);g.lineTo(-18,-24);g.lineTo(-11,-8);g.lineTo(-6,-30);g.lineTo(0,-10);g.lineTo(6,-30);g.lineTo(11,-8);g.lineTo(18,-24);g.lineTo(26,-6);g.lineTo(26,8);g.closePath();g.fill();
 g.strokeStyle=`rgba(255,${120+Math.sin(t*5)*40|0},40,.95)`;g.lineWidth=1.4;g.beginPath();g.moveTo(-20,2);g.lineTo(-12,-2);g.lineTo(-4,4);g.lineTo(4,-3);g.lineTo(12,3);g.lineTo(20,-1);g.moveTo(-6,-26);g.lineTo(-4,-12);g.moveTo(6,-26);g.lineTo(4,-12);g.stroke();
 for(let i=0;i<3;i++){g.fillStyle=['#ff5a2a','#ffb040','#ff5a2a'][i];g.beginPath();g.arc(-12+i*12,-2,2.6,0,7);g.fill();}g.restore();}
const SCN={
 menu(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#0e1230'],[.45,'#3a2c5a'],[.72,'#b8604a'],[.86,'#e8a060'],[1,'#2a1a10']]);stars(g,w,h,t,.45);glow(g,w*.5,h*.74,m*.7,'255,150,80',.35);clouds(g,w,h,t,h*.3,6,'255,190,170',.16,11,5);
  ridge(g,w,h,h*.62,h*.2,3,3,'#4a3a62','#2a2238',null,1);haze(g,w,h*.66,h*.06,'230,140,110',.25);ridge(g,w,h,h*.74,h*.1,8,5,'#2a1e30','#150e16');pines(g,w,h*.82,s*.9,'#120c14',4);
  village(g,w,h,h*.86,s,'#0c080e',true,t);ridge(g,w,h,h*.97,h*.04,8,6,'#08050a','#030203');
  dragon(g,w*(1.35-(t*.03)%1.9),h*.24+Math.sin(t)*10,s*.42,.4+.6*Math.sin(t*3.6),'rgba(10,6,14,.92)',{flip:1});embers(g,w,h,t,24);post(g,w,h,t,.45);},
 night(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#040716'],[.55,'#141a3c'],[.85,'#3a1c2a'],[1,'#120608']]);stars(g,w,h,t);
  const mx=w*.76,my=h*.2;glow(g,mx,my,m*.3,'200,210,255',.25);g.fillStyle='#f4ecd0';g.beginPath();g.arc(mx,my,m*.06,0,7);g.fill();g.fillStyle='rgba(180,170,150,.35)';g.beginPath();g.arc(mx-m*.015,my-m*.01,m*.015,0,7);g.arc(mx+m*.02,my+m*.02,m*.01,0,7);g.fill();clouds(g,w,h,t,h*.25,4,'150,160,200',.12,3,4);
  ridge(g,w,h,h*.62,h*.3,1,2.4,'#2a2440','#130f20','rgba(200,210,255,.35)',1);
  // Glühende Risse im Berg: der Drache erwacht
  const k=Math.min(1,t/3),pul=.6+.4*Math.sin(t*4);g.strokeStyle=`rgba(255,${110+60*pul|0},30,${.9*k})`;g.lineWidth=2.2;g.beginPath();g.moveTo(w*.42,h*.52);g.lineTo(w*.45,h*.58);g.lineTo(w*.43,h*.64);g.lineTo(w*.47,h*.72);g.moveTo(w*.45,h*.58);g.lineTo(w*.5,h*.6);g.lineTo(w*.53,h*.68);g.stroke();g.globalCompositeOperation='lighter';glow(g,w*.46,h*.6,m*.22*k,'255,100,20',.45*pul);g.globalCompositeOperation='source-over';
  ridge(g,w,h,h*.8,h*.14,2,5,'#0d0a16','#050308');pines(g,w,h*.88,s,'#040306',7);
  if(t>2.2){const a=Math.min(1,(t-2.2)/1.5);g.globalAlpha=a;eyes(g,w*.46,h*.47,s*1.6,t,0);g.globalAlpha=1;}embers(g,w,h,t,18*k);post(g,w,h,t);},
 crown(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#0a0608'],[.6,'#1a0c10'],[1,'#2a0e0c']]);
  for(let i=0;i<6;i++){const x=w*(.08+i*.168),pw=m*.07;const gr=g.createLinearGradient(x,0,x+pw,0);gr.addColorStop(0,'#1a1214');gr.addColorStop(.5,'#2e2226');gr.addColorStop(1,'#120c0e');g.fillStyle=gr;g.fillRect(x,h*.1,pw,h*.8);g.fillRect(x-pw*.2,h*.1,pw*1.4,h*.04);g.fillRect(x-pw*.2,h*.86,pw*1.4,h*.04);}
  rays(g,w*.5,-h*.05,h*.9,7,'255,140,60',.07,t,.5);g.fillStyle='#0c0709';g.beginPath();g.moveTo(w*.32,h);g.lineTo(w*.4,h*.78);g.lineTo(w*.6,h*.78);g.lineTo(w*.68,h);g.fill();
  // Gesichtslose Gestalt in Kutte hebt die Aschenkrone
  const fx=w*.5,fy=h*.8,S=m/300;g.fillStyle='#050304';g.beginPath();g.moveTo(fx-34*S,fy);g.quadraticCurveTo(fx-30*S,fy-60*S,fx-14*S,fy-96*S);g.quadraticCurveTo(fx,fy-122*S,fx+14*S,fy-96*S);g.quadraticCurveTo(fx+30*S,fy-60*S,fx+34*S,fy);g.fill();
  g.beginPath();g.moveTo(fx-16*S,fy-84*S);g.lineTo(fx-30*S,fy-128*S);g.lineTo(fx-22*S,fy-132*S);g.lineTo(fx-8*S,fy-90*S);g.fill();g.beginPath();g.moveTo(fx+16*S,fy-84*S);g.lineTo(fx+30*S,fy-128*S);g.lineTo(fx+22*S,fy-132*S);g.lineTo(fx+8*S,fy-90*S);g.fill();
  g.fillStyle='#000';g.beginPath();g.ellipse(fx,fy-100*S,8*S,10*S,0,0,7);g.fill();const lift=Math.min(1,t/3.5);aschenkrone(g,fx,fy-(140+lift*16)*S,S*1.15,t);embers(g,w,h,t,34,'255,120,40');post(g,w,h,t,.65);},
 curse(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#1a0a12'],[.5,'#4a1a20'],[.8,'#7a3a2a'],[1,'#2a1410']]);glow(g,w*.15,h*.3,m*.5,'255,80,40',.25);clouds(g,w,h,t,h*.2,6,'60,20,24',.5,5,7,.22);
  ridge(g,w,h,h*.58,h*.16,5,3,'#3a1e22','#1a0c10',null,1);
  // Der Fluch kriecht als rote Adern übers Land
  const k=Math.min(1,t/4);g.save();g.globalCompositeOperation='lighter';for(const [lw,col] of [[5,'rgba(255,40,20,.12)'],[1.4,'rgba(255,90,50,.75)']]){g.strokeStyle=col;g.lineWidth=lw;for(let i=0;i<8;i++){g.beginPath();let x=w*.02,y=h*(.6+i*.03);g.moveTo(x,y);for(let j=0;j<40;j++){x+=w*.016;y+=(NZ(j*.35+i*3,40+i)-.5)*h*.03;if(x>w*(.04+.56*k))break;g.lineTo(x,y);if(j%9===4){g.moveTo(x,y);g.lineTo(x+w*.03,y+(G.h2(i,j,4)-.5)*h*.06);g.moveTo(x,y);}}g.stroke();}}g.restore();
  haze(g,w,h*.7,h*.08,'120,30,30',.35*k);
  // Dorf mit schützendem Runenschimmer
  const vx=w*.74,vy=h*.8;g.save();g.globalCompositeOperation='lighter';const dg=g.createRadialGradient(vx,vy,m*.05,vx,vy,m*.26);dg.addColorStop(0,'rgba(120,200,255,0)');dg.addColorStop(.85,`rgba(120,200,255,${.12+.06*Math.sin(t*2)})`);dg.addColorStop(1,'rgba(120,200,255,0)');g.fillStyle=dg;g.beginPath();g.ellipse(vx,vy,m*.27,m*.2,0,Math.PI,0);g.fill();g.restore();
  ridge(g,w,h,h*.84,h*.06,9,6,'#1a0e10','#0a0506');g.fillStyle='#0a0506';castle(g,vx,vy+m*.02,s*.5,'#0a0506','#ffcf70',t);pines(g,w*.5,h*.86,s*.9,'#070304',12);
  // Rote Augen im Dickicht
  for(let i=0;i<6;i++){const ex=w*(.06+i*.075),ey=h*(.8+G.h2(i,2,5)*.06);if(t>1+i*.35)eyes(g,ex,ey,s*.9,t,i);}
  // Der Fluss und der Angler – das Wasser wäscht den Fluch ab
  g.fillStyle='#1a3a5a';g.beginPath();g.moveTo(w*.48,h);g.quadraticCurveTo(w*.52,h*.9,w*.6,h*.88);g.lineTo(w*.64,h*.9);g.quadraticCurveTo(w*.58,h*.94,w*.58,h);g.fill();g.fillStyle='rgba(140,220,255,.5)';for(let i=0;i<5;i++)g.fillRect(w*(.52+i*.015)+Math.sin(t+i)*3,h*(.93+i*.01),w*.02,1.5);
  g.fillStyle='#050304';g.beginPath();g.ellipse(w*.62,h*.885,5*s,9*s,0,0,7);g.fill();g.beginPath();g.arc(w*.62,h*.855,4*s,0,7);g.fill();g.strokeStyle='#050304';g.lineWidth=1.2;g.beginPath();g.moveTo(w*.625,h*.87);g.quadraticCurveTo(w*.6,h*.78,w*.55,h*.8);g.stroke();g.strokeStyle='rgba(220,240,255,.5)';g.lineWidth=.7;g.beginPath();g.moveTo(w*.55,h*.8);g.lineTo(w*.548,h*.91);g.stroke();
  embers(g,w,h,t,20,'255,90,60');post(g,w,h,t);},
 battle(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#1a0606'],[.45,'#6a1a0c'],[.8,'#d86a24'],[1,'#ffb050']]);clouds(g,w,h,t,h*.18,7,'30,8,6',.55,6,9,.2);embers(g,w,h,t,70);
  ridge(g,w,h,h*.66,h*.26,4,2.6,'#2a0c08','#140504','rgba(255,140,60,.5)',1);fireGlow(g,w*.22,h*.84,m*.36,t,.55);fireGlow(g,w*.76,h*.88,m*.3,t,.5);ridge(g,w,h,h*.88,h*.08,7,4,'#0e0403','#050101');
  const fx=t>1?Math.min(1,(t-1)*1.5):0;dragon(g,w*.8,h*.3,m/300,.3+.35*Math.sin(t*3),'#080202',{flip:1,eye:'#ffcc40',fire:fx>0?m*.9*fx:0,rim:'rgba(255,120,40,.5)'});
  for(let i=0;i<4;i++){const kx=w*(.12+i*.07),dead=t>2.2+i*.2;knight(g,kx,h*.93,m/420,{rot:dead?Math.min(1.5,(t-2.2-i*.2)*1.4)*(i%2?1:-1):0,t,col:'#050202'});}
  knight(g,w*.42,h*.93,m/300,{up:t<2.8,rot:t>3?Math.min(1.4,(t-3)*.8):0,t,rim:'rgba(255,170,80,.8)',blade:'rgba(255,220,160,.8)'});post(g,w,h,t);},
 valhalla(g,w,h,t){const m=Math.min(w,h);sky(g,w,h,[[0,'#fff7e0'],[.5,'#f6d28a'],[.8,'#d89a50'],[1,'#8a5a2a']]);rays(g,w/2,h*.4,m*1.2,16,'255,250,220',.14,t,6.2,0);
  clouds(g,w,h,t,h*.72,8,'255,255,250',.85,4,6,.26);clouds(g,w,h,t*.6,h*.88,7,'255,245,230',.9,8,4,.3);
  const gw=m*.5,gx=w/2-gw/2,gy=h*.2,gh=h*.45;const pg=g.createLinearGradient(gx,0,gx+gw,0);pg.addColorStop(0,'#6a4a1a');pg.addColorStop(.5,'#b08a3a');pg.addColorStop(1,'#5a3a12');g.fillStyle=pg;g.fillRect(gx-m*.07,gy,m*.07,gh);g.fillRect(gx+gw,gy,m*.07,gh);
  g.beginPath();g.moveTo(gx-m*.09,gy);g.quadraticCurveTo(w/2,gy-m*.24,gx+gw+m*.09,gy);g.lineTo(gx+gw+m*.09,gy+m*.045);g.quadraticCurveTo(w/2,gy-m*.18,gx-m*.09,gy+m*.045);g.fill();
  g.fillStyle='#ffe9a0';for(let i=0;i<9;i++){const u=i/8,x=gx-m*.08+u*(gw+m*.16),y=gy-Math.sin(u*Math.PI)*m*.2;g.beginPath();g.ellipse(x,y,m*.02,m*.012,0,0,7);g.fill();}
  g.fillStyle='rgba(255,255,240,.97)';g.fillRect(gx,gy,gw,gh);glow(g,w/2,gy+gh/2,gw*.8,'255,255,230',.6);const close=Math.min(1,t/5.5);const dg=g.createLinearGradient(gx,0,gx+gw/2,0);dg.addColorStop(0,'#7a5a22');dg.addColorStop(1,'#a07a3a');g.fillStyle=dg;g.fillRect(gx,gy,gw/2*close,gh);g.fillRect(gx+gw-gw/2*close,gy,gw/2*close,gh);
  valk(g,w*.17,h*.66,m/400,t,'rgba(70,46,22,.92)',{wing2:'rgba(120,90,50,.8)',rim:'rgba(255,245,200,.9)',blade:'rgba(255,255,230,.9)'});valk(g,w*.83,h*.66,m/400,t+1,'rgba(70,46,22,.92)',{wing2:'rgba(120,90,50,.8)',rim:'rgba(255,245,200,.9)',blade:'rgba(255,255,230,.9)'});
  knight(g,w/2,h*.94,m/400,{col:'rgba(40,26,12,.95)',t,rim:'rgba(255,240,200,.8)'});post(g,w,h,t,.35);},
 raid(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#08050e'],[.5,'#3a0e1c'],[.85,'#c0401a'],[1,'#ff8a30']]);clouds(g,w,h,t,h*.22,6,'20,6,10',.6,2,8,.22);embers(g,w,h,t,60);
  for(let i=0;i<6;i++){fireGlow(g,w*(.08+i*.17),h*.8,m*.22,t+i,.5);smoke(g,w*(.08+i*.17),h*.72,t+i,m,'30,20,22',7);}village(g,w,h,h*.86,s,'#0a0508',false,t);
  for(let i=0;i<11;i++){const x=w*(.03+i*.095)+m*.02,fh=m*(.04+.03*Math.abs(Math.sin(t*6+i)));const gr=g.createLinearGradient(0,h*.84-fh,0,h*.84);gr.addColorStop(0,'rgba(255,200,80,0)');gr.addColorStop(1,'rgba(255,120,30,.9)');g.fillStyle=gr;g.beginPath();g.moveTo(x-m*.02,h*.84);g.quadraticCurveTo(x,h*.84-fh*1.4,x+m*.02,h*.84);g.fill();}
  g.fillStyle='#000';g.fillRect(0,h*.86,w,h*.14);const dx=w*(1.2-(t*.11)%1.5),dy=h*(.3+.08*Math.sin(t*1.3));dragon(g,dx,dy,m/480,.5+.6*Math.sin(t*5),'#050204',{eye:'#ffb030',rim:'rgba(255,110,40,.45)'});lady(g,dx+m*.005,dy+m*.075,m/1000,'#1a0a14',{t,gold:'#c9a227'});post(g,w,h,t);},
 dawn(g,w,h,t){const m=Math.min(w,h),s=m/420;sky(g,w,h,[[0,'#5a7ac0'],[.45,'#e8a88a'],[.7,'#ffd8a0'],[1,'#4a6a3a']]);const sy=h*(.66-Math.min(.12,t*.02));glow(g,w*.7,sy,m*.5,'255,220,150',.45);g.fillStyle='#fff3c0';g.beginPath();g.arc(w*.7,sy,m*.08,0,7);g.fill();rays(g,w*.7,sy,m,12,'255,230,170',.1,t,6.2,0);
  clouds(g,w,h,t,h*.3,6,'255,220,200',.4,9,5,.2);ridge(g,w,h,h*.68,h*.1,5,3,'#6a7a8c','#4a5868');haze(g,w,h*.68,h*.05,'255,230,200',.4);village(g,w,h,h*.7,m/900,'#3a3a4a',false,t);for(let i=0;i<3;i++)smoke(g,w*(.3+i*.2),h*.62,t+i,m,'90,90,100',5);
  ridge(g,w,h,h*.78,h*.05,6,5,'#3a5a2a','#2a4a20');const rg=g.createLinearGradient(0,h*.8,0,h*.87);rg.addColorStop(0,'#5a8ac8');rg.addColorStop(1,'#2a5a90');g.fillStyle=rg;g.fillRect(0,h*.8,w,h*.07);g.fillStyle='rgba(255,240,200,.55)';for(let i=0;i<14;i++)g.fillRect((i*w/14+t*20)%w,h*(.81+G.h2(i,1,2)*.05),w*.04,1.6);
  g.fillStyle='#22341a';g.fillRect(0,h*.87,w,h*.13);for(let i=0;i<60;i++){const x=G.h2(i,1,6)*w,hh=h*(.01+G.h2(i,2,6)*.025);g.fillStyle='#1a2a12';g.fillRect(x,h*.87-hh*.3,1.5,hh);}
  knight(g,w*.35,h*.93,m/360,{rot:t<3?-1.5:-1.5+Math.min(1.5,(t-3)*1.2),t,col:'#141810',rim:'rgba(255,220,150,.7)'});lady(g,w*.6,h*.93,m/400,'#2a2030',{hood:1,staff:1,t});post(g,w,h,t,.35);},
 victory(g,w,h,t){const m=Math.min(w,h);sky(g,w,h,[[0,'#8ab0e8'],[.55,'#ffd8a0'],[1,'#6a4a2a']]);glow(g,w*.5,h*.5,m*.6,'255,240,190',.5);g.fillStyle='#fff3c0';g.beginPath();g.arc(w*.5,h*.5,m*.11,0,7);g.fill();rays(g,w*.5,h*.5,m*1.2,14,'255,245,210',.12,t,6.2,0);
  clouds(g,w,h,t,h*.3,6,'255,240,230',.5,7,5);ridge(g,w,h,h*.74,h*.22,9,2.4,'#5a4a5a','#3a2a2a','rgba(255,230,190,.5)',1);haze(g,w,h*.76,h*.06,'255,220,190',.45);ridge(g,w,h,h*.9,h*.06,3,5,'#1a2a1a','#0e180e');
  g.save();g.translate(w*.56,h*.9);g.rotate(.5);aschenkrone(g,0,0,m/700,t*.2);g.restore();g.strokeStyle='#0a0a0a';g.lineWidth=2;g.beginPath();g.moveTo(w*.54,h*.88);g.lineTo(w*.57,h*.9);g.stroke();
  knight(g,w*.38,h*.92,m/300,{up:true,col:'#0a0a12',t,rim:'rgba(255,240,200,.9)',blade:'rgba(255,255,230,.9)'});lady(g,w*.48,h*.92,m/330,'#1a0a22',{t,gold:'#d8b030'});post(g,w,h,t,.3);},
 gates(g,w,h,t){SCN.valhalla(g,w,h,99);const m=Math.min(w,h),gw=m*.5,gy=h*.2,gh=h*.45,o=Math.min(1,t/4);g.fillStyle='rgba(255,255,240,1)';g.fillRect(w/2-gw/2*o,gy,gw*o,gh);glow(g,w/2,gy+gh/2,m*.6*o,'255,250,220',.5*o);}};
window.__SCN=SCN;
function drawCS(dt){cs.t+=dt;const [scn,text]=cs.list[cs.i];ctx.setTransform(DPR,0,0,DPR,0,0);SCN[scn](ctx,VW,VH,cs.t);
 const bar=VH*.07;ctx.fillStyle='#000';ctx.fillRect(0,0,VW,bar);ctx.fillRect(0,VH-bar,VW,bar);
 if(cs.t<.8){ctx.fillStyle=`rgba(0,0,0,${1-cs.t/.8})`;ctx.fillRect(0,0,VW,VH);}
 cs.chars+=dt*24;const s=text.slice(0,Math.floor(cs.chars));if(s!==cs.shown){cs.shown=s;$('csText').textContent=s;}
 const done=cs.chars>=text.length;$('csTap').style.opacity=done?(.55+.45*Math.sin(G.time*0+performance.now()/300)):'0';if(done)cs.hold+=dt;}
// ===================== HUD =====================
const mini=$('mini'),mctx=mini.getContext('2d');
const mmBase=document.createElement('canvas');mmBase.width=G.WW;mmBase.height=G.H;
(()=>{const g=mmBase.getContext('2d'),T=G.T,im=g.createImageData(G.WW,G.H);const COL={[T.WATER]:[59,124,192],[T.TREE]:[40,90,34],[T.ROCK]:[110,110,110],[T.SAND]:[216,199,142],[T.COBBLE]:[150,145,135],[T.HOUSE]:[150,70,55],[T.FIELD]:[107,74,43],[T.CROP]:[150,140,60],[T.WALL]:[90,61,30],[T.DEAD]:[58,46,34],[T.LAVA]:[220,80,26],[T.PATH]:[181,154,106],[T.WELL]:[100,100,100],[T.CWALL]:[120,118,112],[T.TOWER]:[120,118,112],[T.BARRIER]:[170,80,230],[T.TENT]:[140,60,40],[T.RUIN]:[130,130,120],[T.CRYPT]:[60,60,60],[T.FIRE]:[255,140,40],[T.SNOW]:[232,238,244],[T.CLIFF]:[70,66,62],[T.CACTUS]:[60,130,60],[T.MUSH]:[150,60,150],[T.BONES]:[220,214,190],[T.BURNT]:[50,44,40],[T.HERBS]:[90,140,70],[T.BRIDGE]:[140,100,60],[T.STUMP]:[100,70,40],[T.ICE]:[180,220,240],[T.GOLD]:[240,190,40],[T.FWALL]:[40,34,32],[T.WAYSTONE]:[120,200,255]};
 for(let y=0;y<G.H;y++)for(let x=0;x<G.WW;x++){const t=G.map[y*G.W+x];let c=COL[t];if(!c){const n=parseInt(G.GC[G.biome(x,y)].slice(1),16);c=[n>>16,(n>>8)&255,n&255];}const i=(y*G.WW+x)*4;im.data[i]=c[0];im.data[i+1]=c[1];im.data[i+2]=c[2];im.data[i+3]=255;}g.putImageData(im,0,0);})();
const skc=$('skyclock'),skx=skc.getContext('2d');
// v26: Questbox auf dem Handy standardmäßig kompakt – Tippen klappt sie auf/zu (nur Klassenwechsel, kein Neuaufbau pro Frame)
{const qb=$('quests');const apply=()=>{qb.classList.toggle('qc',!G.settings.qOpen);hud.qH=null;};apply();qb.addEventListener('click',e=>{if(document.body.classList.contains('pc'))return;e.stopPropagation();G.settings.qOpen=!G.settings.qOpen;G.saveSettings&&G.saveSettings();apply();});}
// Steuerungshinweis blendet sich nach ein paar Sekunden aus; „?“ zeigt ihn wieder
ui.flashHint=()=>{const j=$('joyHint');if(!j)return;j.classList.remove('jhOut');void j.offsetWidth;j.classList.add('jhOut');};setTimeout(ui.flashHint,50);
function drawSkyClock(){const d=Math.min(window.devicePixelRatio||1,2);if(skc.width!==120*d){skc.width=120*d;skc.height=44*d;}skx.setTransform(d,0,0,d,0,0);skx.clearRect(0,0,120,44);
 const di=G.dayInfo(),t=di.t,hr=(6+t/720*24)%24,hh=Math.floor(hr),mm=Math.floor((hr-hh)*6)*10,L=di.light;
 const g=skx.createLinearGradient(0,0,0,44);g.addColorStop(0,`rgb(${30+90*L|0},${40+120*L|0},${80+150*L|0})`);g.addColorStop(1,`rgb(${20+120*L|0},${16+90*L|0},${30+40*L|0})`);skx.fillStyle=g;skx.beginPath();skx.roundRect?skx.roundRect(1,1,118,42,8):skx.rect(1,1,118,42);skx.fill();skx.strokeStyle='#5a3d1e';skx.lineWidth=2;skx.stroke();
 skx.save();skx.beginPath();skx.rect(2,2,116,30);skx.clip();
 if(L<.6){skx.fillStyle=`rgba(255,255,255,${.8*(1-L)})`;for(let i=0;i<14;i++)skx.fillRect(6+((i*37)%108),4+((i*13)%22),1.2,1.2);}
 const sunA=(hr-5.5)/16*Math.PI;if(sunA>0&&sunA<Math.PI){const x=60-Math.cos(sunA)*48,y=31-Math.sin(sunA)*24;const sg=skx.createRadialGradient(x,y,1,x,y,10);sg.addColorStop(0,'#fffbe0');sg.addColorStop(.4,'#ffd54a');sg.addColorStop(1,'rgba(255,180,40,0)');skx.fillStyle=sg;skx.beginPath();skx.arc(x,y,10,0,7);skx.fill();}
 const mh=(hr-20.5+24)%24,moA=mh/9.5*Math.PI;if(moA>0&&moA<Math.PI){const x=60-Math.cos(moA)*48,y=31-Math.sin(moA)*24;skx.fillStyle='#eef2ff';skx.beginPath();skx.arc(x,y,5.5,0,7);skx.fill();if(!di.full){skx.fillStyle=g;skx.fillStyle='rgba(30,40,80,.95)';skx.beginPath();skx.arc(x+2.6,y-1.2,4.8,0,7);skx.fill();}}
 skx.restore();skx.fillStyle='rgba(60,45,25,.85)';skx.fillRect(2,32,116,10);skx.fillStyle='#ffe9b0';skx.font='bold 10px Georgia';skx.textAlign='center';skx.fillText(`${G.WD2[G.wday()]} ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}${di.full&&di.night?' 🌕':''}`,60,41);skx.textAlign='left';}
const FG=4,FW=Math.ceil(G.WW/FG),FH=Math.ceil(G.H/FG);let fog=new Uint8Array(FW*FH),fogC=document.createElement('canvas'),fogX,fogDirty=true,fogSaveT=0;fogC.width=FW;fogC.height=FH;fogX=fogC.getContext('2d');
function fogRedraw(){const im=fogX.createImageData(FW,FH);for(let i=0;i<fog.length;i++){const o=i*4;im.data[o]=26;im.data[o+1]=20;im.data[o+2]=14;im.data[o+3]=fog[i]?0:255;}fogX.putImageData(im,0,0);fogDirty=false;}
ui.revealTowns=()=>{for(const t of G.TOWNS)fogReveal(t.x,t.y,t.r+6);fogReveal(G.VCX,G.VCY,30);fogDirty=true;try{fogStore();}catch(e){}};
function fogLoad(){fog=new Uint8Array(FW*FH);const P=G.P;let ok=false;if(P&&P.fog){try{const b=atob(P.fog);if(b.length===Math.ceil(fog.length/8)){for(let i=0;i<fog.length;i++)fog[i]=(b.charCodeAt(i>>3)>>(i&7))&1;ok=true;}}catch(e){}}if(!ok)fogReveal(G.VCX,G.VCY,26);if(P){fogReveal(P.x/TILE,P.y/TILE,9);if(P.ways)for(const w of G.WAYS)if(P.ways[w.id])fogReveal(w.tx,w.ty,10);if(P.mapMarks)for(const t of G.TOWNS)fogReveal(t.x,t.y,t.r+6);}fogTick._x=null;fogDirty=true;}
function fogStore(){const by=new Uint8Array(Math.ceil(fog.length/8));for(let i=0;i<fog.length;i++)if(fog[i])by[i>>3]|=1<<(i&7);let s='';for(let i=0;i<by.length;i++)s+=String.fromCharCode(by[i]);G.P.fog=btoa(s);}
function fogReveal(tx,ty,r){const c0=Math.floor((tx-r)/FG),c1=Math.floor((tx+r)/FG),r0=Math.floor((ty-r)/FG),r1=Math.floor((ty+r)/FG);for(let cy=Math.max(0,r0);cy<=Math.min(FH-1,r1);cy++)for(let cx=Math.max(0,c0);cx<=Math.min(FW-1,c1);cx++){const dx=(cx+.5)*FG-tx,dy=(cy+.5)*FG-ty;if(dx*dx+dy*dy<=r*r&&!fog[cy*FW+cx]){fog[cy*FW+cx]=1;fogDirty=true;}}}
const fogSeen=(tx,ty)=>G.devReveal||fog[Math.floor(ty/FG)*FW+Math.floor(tx/FG)]===1;
function fogTick(dt){const P=G.P;if(!P)return;fogSaveT+=dt;if(G.room){const e=G.room.ent;if(e&&!G.room.player)fogReveal(e.x/TILE,e.y/TILE,6);}else{const tx=P.x/TILE,ty=P.y/TILE;if(fogTick._x==null||Math.abs(tx-fogTick._x)+Math.abs(ty-fogTick._y)>.5){fogTick._x=tx;fogTick._y=ty;fogReveal(tx,ty,9+3*(P.mapR||0));}}if(fogSaveT>2){fogSaveT=0;fogStore();}}
G.fogAll=v=>{fog.fill(v?1:0);if(!v)fogReveal(G.P.x/TILE,G.P.y/TILE,9);fogDirty=true;fogStore();};
function drawMini(){const P=G.P,MS=+G.settings.mini||120,d=Math.min(window.devicePixelRatio||1,2)*MS/96;if(mini.width!==Math.round(96*d)){mini.width=mini.height=Math.round(96*d);}mctx.setTransform(d,0,0,d,0,0);mctx.imageSmoothingEnabled=false;
 const V=Math.round(110*Math.sqrt(MS/96)),pp=G.room?G.room.ent:P,ptx=pp.x/TILE,pty=pp.y/TILE,ox=Math.max(0,Math.min(G.WW-V,ptx-V/2)),oy=Math.max(0,Math.min(G.H-V,pty-V/2)),sc=96/V,X=x=>(x-ox)*sc,Y=y=>(y-oy)*sc;
 mctx.fillStyle='#000';mctx.fillRect(0,0,96,96);mctx.drawImage(mmBase,ox,oy,V,V,0,0,96,96);if(fogDirty)fogRedraw();mctx.imageSmoothingEnabled=true;mctx.drawImage(fogC,ox/FG,oy/FG,V/FG,V/FG,0,0,96,96);mctx.imageSmoothingEnabled=false;
 for(const w of G.WAYS){if(!fogSeen(w.tx,w.ty))continue;mctx.fillStyle=P.ways[w.id]?'#8fd8ff':'#667';mctx.fillRect(X(w.tx)-2,Y(w.ty)-2,4,4);}
 for(const n of G.NPCS){if(!G.npcVisible(n))continue;const mk=G.npcMark(n);mctx.fillStyle=mk==='!'||mk==='?'?'#ffd54a':'#ffe9b0';const s=mk&&mk!=='.'?3:2;mctx.fillRect(X(n.x/TILE)-1,Y(n.y/TILE)-1,s,s);}
 mctx.textAlign='center';
 for(const m of G.mons){if(m.dead||!m.boss)continue;mctx.fillStyle=m.boss==='dragon'?'#ff8a00':m.boss==='mini'?'#ff9800':'#ff1744';mctx.beginPath();mctx.arc(X(m.x/TILE),Y(m.y/TILE),2.5,0,7);mctx.fill();}
 const ob=G.objective();if(ob.to){let x=X(ob.to.x/TILE),y=Y(ob.to.y/TILE);x=Math.max(3,Math.min(93,x));y=Math.max(3,Math.min(93,y));const p=2.5+Math.sin(G.time*5)*1;mctx.strokeStyle='#ffd54a';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(x,y,p+1.5,0,7);mctx.stroke();}
 {// v23: Richtungspfeil statt Punkt (Blick-/Laufrichtung)
  const an=Math.atan2(P.fy,P.fx),px=X(ptx),py=Y(pty);mctx.save();mctx.translate(px,py);mctx.rotate(an);mctx.fillStyle='#fff';mctx.strokeStyle='#000';mctx.lineWidth=1.1;mctx.lineJoin='round';mctx.beginPath();mctx.moveTo(5.2,0);mctx.lineTo(-3.6,3.6);mctx.lineTo(-1.6,0);mctx.lineTo(-3.6,-3.6);mctx.closePath();mctx.fill();mctx.stroke();mctx.restore();}
 const tw=G.townAt&&G.townAt(Math.floor(ptx),Math.floor(pty));const bn={village:'Eichenhain',meadow:'Wiesen',forest:'Wald',swamp:'Sumpf',waste:'Ödland',winter:'Frostlande',ash:'Aschland',dark:'Schattenwald',desert:'Wüste',peaks:'Gebirge'}[G.biome(Math.floor(ptx),Math.floor(pty))];
 mctx.fillStyle='rgba(0,0,0,.55)';mctx.fillRect(0,82,96,14);mctx.fillStyle='#ffe9b0';mctx.font='bold 9px Georgia';mctx.fillText(G.room?'Innenraum':tw?tw.name:(bn||''),48,92);}
// ===== Kleines Tutorial für neue Spieler =====
const TUT=[
 {t:()=>pcMode?'🚶 Bewege dich mit <b>W A S D</b>. Mit <b>Shift</b> sprintest du.':'🚶 Bewege dich mit dem <b>linken Daumen</b> (Joystick). Mit 🚶/🏃 schaltest du Sprinten fest an.',ok:s=>s.dist>TILE*3},
 {t:()=>pcMode?'🎥 Drehe die Kamera mit gedrückter <b>rechter Maustaste</b>, zoomen mit dem <b>Mausrad</b>. <b>V</b> wechselt die Ansicht.':'🎥 Wische mit dem <b>rechten Daumen</b>, um die Kamera zu drehen.',ok:s=>s.t>7},
 {t:()=>`⭐ Der <b>Kompass</b> oben zeigt dein Ziel. Geh zu <b>Heilerin Mara</b> und sprich mit ihr: ${pcMode?'<b>F</b>':'<b>✋</b>'}.`,ok:s=>G.P.main>=1||(ui.dlgNpc&&ui.dlgNpc.id==='mara')},
 {t:()=>`🎒 Öffne dein <b>Inventar</b>: ${pcMode?'<b>E</b>':'<b>🎒</b>'}. Ausrüstung legst du über „Anlegen“ an, verschieben per Ziehen.`,ok:()=>invOpen},
 {t:()=>pcMode?'⚔ <b>Linksklick</b> greift an, <b>C</b> weicht aus, <b>Leertaste</b> springt. Ohne Ausdauer schlägst du nur schwach zu.':'⚔ <b>⚔-Knopf</b> greift an, <b>doppelt rechts tippen</b> weicht aus. Ohne Ausdauer schlägst du nur schwach zu.',ok:s=>s.t>14||Object.keys(G.P.kills||{}).length>0},
 {t:()=>`📜 Quests: ${pcMode?'<b>J</b>':'Reiter im Inventar'} · ⭐ Fähigkeiten: ${pcMode?'<b>K</b>':'Reiter im Inventar'} – pro Stufe 1 Punkt. Viel Spaß in Eldmar!`,ok:s=>s.t>10}];
let tutS=null;
function tutTick(){const P=G.P;if(!P)return;if(P.tut==null){P.tut=(P.level>1||P.main>1)?99:0;}if(P.tut>=TUT.length){const e=$('tut');if(e)e.remove();return;}
 if(G.cutscene||state!=='game')return;let e=$('tut');if(!e){e=document.createElement('div');e.id='tut';document.body.appendChild(e);tutS=null;}
 if(!tutS||tutS.i!==P.tut){tutS={i:P.tut,t:0,x:P.x,y:P.y,dist:0};e.innerHTML=`<div class="tutn">Tipp ${P.tut+1}/${TUT.length}</div><div class="tutt">${TUT[P.tut].t()}</div><button class="tutx">Überspringen</button>`;e.querySelector('.tutx').onclick=ev=>{ev.stopPropagation();P.tut=99;e.remove();G.save();};}
 if(!G.paused()||invOpen||ui.dlgNpc){tutS.t+=1/60;tutS.dist+=Math.hypot(P.x-tutS.x,P.y-tutS.y);tutS.x=P.x;tutS.y=P.y;}
 if(TUT[P.tut].ok(tutS)){P.tut++;tutS=null;if(P.tut>=TUT.length){e.remove();G.save();}}}
function hud(){{const now=performance.now(),dt=Math.min(.5,(now-(hud._t||now))/1000);hud._t=now;tipTick(dt);}tutTick();const P=G.P,S=G.S||G.calc(),tx=Math.floor(P.x/TILE),ty=Math.floor(P.y/TILE);
 {const dk=P.drunk||0,st=dk>=3?`rotate(${(Math.sin(G.time*.8)*Math.min(1.6,(dk-2)*.3)).toFixed(2)}deg) scale(${(1+Math.min(.05,(dk-2)*.008)).toFixed(3)})`:'';if(st!==ui._dst){ui._dst=st;$('c3d').style.transform=st;$('c2d').style.transform=st;}}$('lvl').textContent=P.level;$('hpf').style.width=(100*Math.max(0,P.hp)/S.maxhp)+'%';$('hpf').classList.toggle('poison',!!P.poison);$('hpt').textContent=`${Math.ceil(Math.max(0,P.hp))} / ${S.maxhp} LP${P.poison?' · vergiftet':''}${(P.drunk||0)>=1?' · 🍺 '+G.DRUNKN[G.drunkLvl()]:''}${P.hangover&&P.dayT<P.hangover?' · 🤕 Kater':''}`;
 $('stf').style.width=(100*Math.max(0,P.sta)/S.maxSta)+'%';$('stt').textContent=`⚡ ${Math.floor(P.sta)}`;$('mpf').style.width=(100*Math.max(0,P.mp)/S.maxMp)+'%';$('mpt').textContent=`🔷 ${Math.floor(P.mp)}`;const am=S.cls==='ranged'?(G.WKIND[S.kind].proj==='bolt'?'bolt':'arrow'):null;$('ammo').style.display=am?'block':'none';if(am)$('ammo').textContent=`${am==='bolt'?'Bolzen':'Pfeile'}: ${G.countItem(am)}`;
 const xn=G.xpNeed(P.level);$('xpf').style.width=(100*P.xp/xn)+'%';$('xpt').textContent=`XP ${Math.floor(P.xp)} / ${xn}`;{const fx=[],sec=v=>Math.ceil(v)+'s';if(P.poison)fx.push(['#7cff6b','☠ Vergiftet '+sec(P.poison.t)]);if(P.burn)fx.push(['#ff8a3b','🔥 Brennt '+sec(P.burn.t)]);if(P.slow>0)fx.push(['#9ecbff','🐌 Verlangsamt '+sec(P.slow)]);if(P.rootT>0)fx.push(['#9bd16b','🌿 Festgehalten '+sec(P.rootT)]);if(P.invT>0)fx.push(['#fff3a0','⛨ Unverwundbar']);if((P.drunk||0)>=1)fx.push(['#ffd54a','🍺 '+G.DRUNKN[G.drunkLvl()]]);if(P.hangover&&P.dayT<P.hangover)fx.push(['#d7b9ff','🤕 Kater']);if(P.rested&&P.dayT<P.rested.until)fx.push(['#c8f5c8','✨ Ausgeruht +'+P.rested.b+'%']);if(P.buffs)for(const k in P.buffs){const r=P.buffs[k]-P.dayT;if(r>0&&G.BUFFN[k])fx.push(['#fff3c4',G.BUFFN[k][0]+' '+G.BUFFN[k][1]+' '+Math.ceil(r/60)+'′']);}{const rb=$('bRide');const sh=!!(P.mount&&P.mount.saddle);if(rb.classList.contains('show')!==sh)rb.classList.toggle('show',sh);if(rb.classList.contains('on')!==!!P.riding)rb.classList.toggle('on',!!P.riding);}if(P.mount&&P.mount.saddle){const m=P.mount;fx.push(m.dead?['#ff8a80','🐴 '+m.name+' verletzt (Stall)']:[P.riding?'#ffe082':'#d7ccc8',(P.riding?'🐎 ':'🐴 ')+m.name+' '+Math.round(10*m.hp/G.mountMax())*10+'%']);}const sig=fx.map(f=>f[1]).join('|');if(sig!==ui._fxSig){ui._fxSig=sig;let el=$('fxBar');if(!el){el=document.createElement('div');el.id='fxBar';$('gold').after(el);}el.innerHTML=fx.map(f=>`<span class="fxc" style="border-color:${f[0]};color:${f[0]}">${f[1]}</span>`).join('');}}{const gh=`<span class="gch">🪙 ${P.gold}<small> Gold</small></span><span class="dch">${G.D().n}</span>`+(P.bounty>0?`<span class="bch">⚖ ${P.bounty} <span style="color:#ffd54a">${'★'.repeat(G.wanted())}</span>${G.guardHostile()?' ⚔':''}</span>`:'');if(gh!==hud.gH){hud.gH=gh;$('gold').innerHTML=gh;}}
 const b=G.biome(tx,ty),zl=G.zoneLevel(tx,ty);{const zEl={set textContent(v){if(v!==hud.zT){hud.zT=v;$('zone').textContent=v;}}};const tw0=!G.room&&G.townAt(tx,ty);if(tw0&&G.townHostile(tw0)){zEl.textContent=`☠ ${tw0.name} · Feindliches Königreich – Dornenwachen!`;}else zEl.textContent=G.room?(G.room.dungeon?`☠ ${G.room.name} · Stufe ~${G.room.lvl}`:`🏠 ${G.room.name}${(()=>{const r=G.room;if(r.player){const z=G.HZ.find(q=>tx-r.x0>=q[0]&&tx-r.x0<=q[2]&&ty-r.y0>=q[1]&&ty-r.y0<=q[3]);return z?' · '+z[5]:'';}const z=r.zones&&r.zones.find(q=>tx-r.x0>=q[0]&&tx-r.x0<=q[2]&&ty-r.y0>=q[1]&&ty-r.y0<=q[3]);return z?' · '+z[4]:'';})()}`):G.inSafe(P.x,P.y)?(G.inCastle(tx,ty)?'🏰 Burg Eichenhain · Sicher':G.townAt(tx,ty)?`🏘 ${G.townAt(tx,ty).name} · Sicher`:'🏡 Eichenhain · Sicher'):`⚔ ${G.ZN[b]} · Monster Stufe ~${zl}`;}
 if(!hud.qT||G.time-hud.qT>.25){hud.qT=G.time;skBadge();const QL=G.questLog(),m=QL.main;hud.QL=QL;let h=`<div class="qh">⭐ Hauptquest · ${m.ch}</div><div class="ob">➤ ${m.t}${m.to&&!G.room?` <span class="qd">${G.dirTo(m.to)}</span>`:''}</div>`;
  if(QL.side.length){h+=`<div class="qh2">📜 Nebenquests</div>`+QL.side.slice(0,4).map(s=>`<div class="sq">• <b>${s.n}</b>: ${s.t.split(' – ')[0]}${s.to&&!G.room?` <span class="qd">${G.dirTo(s.to)}</span>`:''}</div>`).join('')+(QL.side.length>4?`<div class="sq">… +${QL.side.length-4} (Questbuch: J)</div>`:'');}
  h=`<button class="qtg" aria-label="Questbox auf- oder zuklappen">${G.settings.qOpen?'−':'+'}</button>${QL.side.length?`<span class="qnq">NQ: ${QL.side.length}</span>`:''}`+h;if(h!==hud.qH){hud.qH=h;$('quests').innerHTML=h;}}
 const t=G.target(),ba=$('bAct');if(t){ba.classList.remove('off');const lb=G.targetLabel(t);ba.innerHTML=lb[0]+'<br>'+lb[1];}else{ba.classList.add('off');ba.innerHTML='✋';}
 $('bDodge').classList.toggle('cd',P.dodgeCd>0);
 let nb=null,nd=520;for(const m of G.mons){if(m.dead||!m.boss)continue;const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<nd){nd=d;nb=m;}}
 const bb=$('bossbar');if(nb){if(bb.style.display!=='block'){bb.style.display='block';document.body.classList.add('bossOn');placeBoss();}$('bbn').textContent=`☠ ${nb.name} · Stufe ${nb.lvl}`;$('bbf').style.width=(100*Math.max(0,nb.hp)/nb.maxhp)+'%';}else if(bb.style.display!=='none'){bb.style.display='none';document.body.classList.remove('bossOn');}
 $('flash').style.opacity=G.flashT>0?Math.min(1,G.flashT):0;
 if(G.invDirty){renderHot();if(invOpen)renderInv();G.invDirty=false;}
 drawMini();drawSkyClock();}
// ===================== Overlay =====================
function scr(x,y,h){return use3d?G.R3D.toScreen(x,y,h||0):G.R2D._fp?G.R2D.toScreen(x,y,h||0):G.R2D.toScreen(x,y);}
const monTop=m=>use3d?G.R3D.monTop(m):(m.shape==='hum'?1.4*(m.scale||1):m.r/TILE*2.4+.4);
function lbl(x,y,t,col,font){ctx.font=font||'bold 11px Georgia';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y);}
// Kompassleiste oben: Himmelsrichtungen + Quest-Icons
// 2D: kleiner Wegweiser-Pfeil, der um die Spielfigur kreist und zum Questziel zeigt (statt Kompassleiste)
function drawGuide2D(){const P=G.P,ob=G.objective();if(!ob||!ob.to)return;const d=Math.hypot(ob.to.x-P.x,ob.to.y-P.y);if(d<TILE*4)return;const ps=scr(P.x,P.y,0);if(!ps)return;const ts=scr(ob.to.x,ob.to.y,0);
 if(ts&&ts.x>30&&ts.x<VW-30&&ts.y>150&&ts.y<VH-120)return;
 const ang=ts?Math.atan2(ts.y-ps.y,ts.x-ps.x):Math.atan2(ob.to.y-P.y,ob.to.x-P.x),R=48+Math.sin(G.time*3)*2,x=ps.x+Math.cos(ang)*R,y=ps.y-8+Math.sin(ang)*R;
 ctx.save();ctx.globalAlpha=.88;ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle='#ffd54a';ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-6,-9);ctx.lineTo(-2,0);ctx.lineTo(-6,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 const m=Math.round(d/TILE),tx=ps.x+Math.cos(ang)*(R+20),ty=ps.y-8+Math.sin(ang)*(R+20);ctx.globalAlpha=.85;lbl(tx,ty+4,m+' m','#ffe9a0','bold 10px Georgia');ctx.globalAlpha=1;}
function drawCompass(){const P=G.P;if(G.room||P.dead)return;if(!use3d&&!(G.R2D&&G.R2D._fp)){drawGuide2D();return;}const port=VH>VW,W=Math.min(440,VW*(pcMode?.36:port?.62:.5)),H=24,cx=VW/2,gu=(+G.settings.gui||100)/100,y0=port?Math.round(254*gu):pcMode?58:Math.round(10+44*gu*.8),half=Math.PI*.55;
 let hd;if(isFP()){const f=fpDir();hd=Math.atan2(f.x,-f.y);}else hd=use3d?-(G.camRot||0):0;
 const rel=b=>{let r=b-hd;while(r>Math.PI)r-=2*Math.PI;while(r<-Math.PI)r+=2*Math.PI;return r;};const X=r=>cx+r/half*W/2;
 ctx.save();const g=ctx.createLinearGradient(cx-W/2,0,cx+W/2,0);g.addColorStop(0,'rgba(20,12,6,0)');g.addColorStop(.12,'rgba(20,12,6,.62)');g.addColorStop(.88,'rgba(20,12,6,.62)');g.addColorStop(1,'rgba(20,12,6,0)');ctx.fillStyle=g;ctx.fillRect(cx-W/2,y0,W,H);
 ctx.strokeStyle='rgba(201,168,106,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-W/2+20,y0+H);ctx.lineTo(cx+W/2-20,y0+H);ctx.stroke();
 ctx.beginPath();ctx.rect(cx-W/2,y0-30,W,H+80);ctx.clip();
 const L=['N','NO','O','SO','S','SW','W','NW'];for(let i=0;i<24;i++){const b=i*Math.PI/12,r=rel(b);if(Math.abs(r)>half)continue;const x=X(r),a=1-Math.abs(r)/half*.6;if(i%3===0){ctx.globalAlpha=a;ctx.fillStyle=i===0?'#ff6b5a':'#f4e6c4';ctx.font=(i%6===0?'bold 14px':'bold 11px')+' Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(L[i/3],x,y0+H/2+1);}else{ctx.globalAlpha=a*.7;ctx.fillStyle='#c9a86a';ctx.fillRect(x-.5,y0+H-7,1,6);}}
 ctx.globalAlpha=1;const QL=hud.QL;const ic=[];if(QL){if(QL.main&&QL.main.to)ic.push({to:QL.main.to,c:'#ffd54a',t:'★',m:1});for(const s of QL.side)if(s.to)ic.push({to:s.to,c:'#9ad0ff',t:'!',m:0});}
 for(const q of ic){const dx=q.to.x-P.x,dy=q.to.y-P.y,d=Math.hypot(dx,dy);let r=rel(Math.atan2(dx,-dy));const out=Math.abs(r)>half*.92;r=Math.max(-half*.92,Math.min(half*.92,r));const x=X(r),yy=y0+H+11;
  ctx.fillStyle=q.c;ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y0+H-1);ctx.lineTo(x-6,yy-4);ctx.lineTo(x+6,yy-4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(x,yy+5,q.m?9:7.5,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#2a1a08';ctx.font='bold '+(q.m?12:11)+'px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(out?(r<0?'‹':'›'):q.t,x,yy+5.5);
  if(q.m||!out){ctx.font='bold 10px Georgia';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';const tx=Math.round(d/TILE)+' m';ctx.strokeText(tx,x,yy+21);ctx.fillStyle=q.c;ctx.fillText(tx,x,yy+21);}}
 ctx.restore();}
function fpAng(dx,dy){const f=fpDir();const lx=dx*-f.y+dy*f.x,lz=dx*f.x+dy*f.y;return Math.atan2(-lz,lx);}
function edgeArrow(ang,col,txt){const cx=VW/2,cy=VH/2,dx=Math.cos(ang),dy=Math.sin(ang);const mx=VW/2-30,myTop=VH/2-215,myBot=VH/2-175;let k=Math.min(mx/Math.max(.001,Math.abs(dx)),(dy<0?myTop:myBot)/Math.max(.001,Math.abs(dy)));const x=cx+dx*k,y=cy+dy*k;
 ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=col;ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(-9,-12);ctx.lineTo(-3,0);ctx.lineTo(-9,12);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();if(txt)lbl(x-dx*26,y-dy*26+4,txt,col,'bold 10px Georgia');}
function drawOverlay(){const P=G.P;ctx.setTransform(DPR,0,0,DPR,0,0);
 const fp2=!use3d&&G.R2D._fp;if(use3d||fp2){const near=(x,y,r)=>Math.hypot(x-P.x,y-P.y)<TILE*(r||(fp2?18:24));
  if(!G.room)for(const b of G.BUILD){if(!b.name)continue;const x=(b.x+b.w/2)*TILE,y=(b.y+b.h/2)*TILE;if(!near(x,y,12))continue;const s=scr(x,y,b.kind==='keep'?5.2:3.4);if(s)lbl(s.x,s.y,(b.sign||'')+' '+b.name,'#ffe9b0','bold 11px Georgia');}
  for(const n of G.NPCS){if(!G.npcVisible(n)||!near(n.x,n.y,16))continue;if(G.room?n.loc!==G.room:!!n.loc)continue;const s=scr(n.x,n.y,n.child?1.05:1.4);if(!s)continue;lbl(s.x,s.y,n.name,'#ffe9b0','bold 10px Georgia');const mk=G.npcMark(n);if(mk){const s2=scr(n.x,n.y,2);if(s2)lbl(s2.x,s2.y+Math.sin(G.time*4)*3,'!'===mk||'.'===mk?'!':'?',mk==='.'?'#9e9e9e':'#ffd54a','bold 22px Georgia');}else{ctx.font='12px serif';ctx.globalAlpha=.75;ctx.fillText('💬',s.x+(ctx.measureText(n.name).width/2)+10,s.y);ctx.globalAlpha=1;}}
  for(const m of G.mons){if(m.dead||!near(m.x,m.y,22))continue;const s=scr(m.x,m.y,monTop(m)+.15);if(!s)continue;const bw=m.boss?64:30;if(m.hp<m.maxhp||m.boss){ctx.fillStyle='#200';ctx.fillRect(s.x-bw/2,s.y,bw,4);ctx.fillStyle='#e53935';ctx.fillRect(s.x-bw/2,s.y,bw*Math.max(0,m.hp/m.maxhp),4);}
   const diff=m.lvl-P.level;lbl(s.x,s.y-3,m.boss?`${m.name} · Lv ${m.lvl}`:`Lv ${m.lvl}`,m.boss?'#ff8a80':diff>=5?'#ff5252':diff>=3?'#ffab40':diff<=-4?'#9e9e9e':'#fff',m.boss?'bold 11px Georgia':'bold 9px Georgia');}
  for(const f of G.floats){const s=scr(f.x,f.y,1.3);if(!s)continue;ctx.globalAlpha=Math.min(1,f.life*2);lbl(s.x,s.y,f.t,f.c,f.big?'bold 17px Georgia':'bold 13px Georgia');}ctx.globalAlpha=1;}
 if(pcMode&&!G.paused()){const t=G.target();if(t){const tp=G.targetPos(t),tx=tp.x,ty=tp.y;const s=scr(tx,ty,use3d?-.2:0);if(s){const lb=G.targetLabel(t),txt=(t.k==='crop'&&t.f.s<3)?'Wächst … '+lb[1]:'[F] '+lb[1];lbl(s.x,s.y+(use3d?18:30),txt,'#fff3b0','bold 12px Georgia');}}}
 const ps=scr(P.x,P.y,1)||{x:VW/2,y:VH/2};
 const ob=G.objective();if(ob.to&&!G.room){const s=scr(ob.to.x,ob.to.y,use3d?2.4:0);const d=Math.hypot(ob.to.x-P.x,ob.to.y-P.y);
  if(s&&s.x>24&&s.x<VW-24&&s.y>150&&s.y<VH-120){if(d>60){const yy=s.y-(use3d?0:46)+Math.sin(G.time*4)*4;ctx.fillStyle='#ffd54a';ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x,yy+10);ctx.lineTo(s.x-8,yy-2);ctx.lineTo(s.x,yy-14);ctx.lineTo(s.x+8,yy-2);ctx.closePath();ctx.fill();ctx.stroke();}}
}
 drawCompass();
 for(const m of G.mons){if(m.dead||!m.boss)continue;const d=Math.hypot(m.x-P.x,m.y-P.y);if(d>TILE*45)continue;const s=scr(m.x,m.y,1);if(s&&s.x>0&&s.x<VW&&s.y>0&&s.y<VH)continue;const ang=isFP()?fpAng(m.x-P.x,m.y-P.y):s?Math.atan2(s.y-ps.y,s.x-ps.x):Math.atan2(m.y-P.y,m.x-P.x);edgeArrow(ang,m.boss==='dragon'?'#ff8a00':'#ff3b3b');}
 if(G.sleepFx>0){const a=Math.min(1,Math.sin(Math.min(1,G.sleepFx/2.6)*Math.PI)*1.6);ctx.fillStyle=`rgba(5,6,18,${a})`;ctx.fillRect(0,0,VW,VH);ctx.fillStyle=`rgba(220,225,255,${a})`;ctx.font='bold 28px Georgia';ctx.textAlign='center';ctx.fillText('Zzz …',VW/2,VH/2);ctx.textAlign='left';}
 if(isFP()&&!G.paused()){const cx=VW/2,cy=VH/2;ctx.strokeStyle='rgba(255,245,220,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,3,0,7);ctx.stroke();const S=G.S,sp=S&&S.cls==='melee'?0:6;ctx.beginPath();for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ctx.moveTo(cx+a*(7+sp),cy+b*(7+sp));ctx.lineTo(cx+a*(13+sp),cy+b*(13+sp));}ctx.stroke();
  if(P.hurtT>0){ctx.fillStyle=`rgba(200,0,0,${Math.min(.35,P.hurtT*1.2)})`;ctx.fillRect(0,0,VW,VH);}
  if(P.rootT>0){ctx.strokeStyle='rgba(120,200,90,.55)';ctx.lineWidth=3;for(let i=0;i<14;i++){const a=i/14*6.283+G.time*.3;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*VW*.6,cy+Math.sin(a)*VH*.7);ctx.quadraticCurveTo(cx+Math.cos(a+.4)*VW*.35,cy+Math.sin(a+.4)*VH*.4,cx+Math.cos(a)*VW*.3,cy+Math.sin(a)*VH*.32);ctx.stroke();}}}
 else if(pcMode&&mouse.on&&!mouse.overUI&&!G.paused()&&!ui.dlgNpc){ctx.strokeStyle='rgba(255,240,200,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x-5,mouse.y);ctx.moveTo(mouse.x+5,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y-5);ctx.moveTo(mouse.x,mouse.y+5);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke();}
 const S=G.S;if(S&&P.hp<S.maxhp*.3&&!P.dead){const a=.25+Math.sin(G.time*6)*.1;const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.3,VW/2,VH/2,Math.max(VW,VH)*.7);g.addColorStop(0,'rgba(180,0,0,0)');g.addColorStop(1,`rgba(180,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
 if(P.poison){const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.7);g.addColorStop(0,'rgba(80,200,40,0)');g.addColorStop(1,'rgba(80,200,40,.22)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}}
// ===================== Eingabe =====================
const joy={id:null,ox:0,oy:0,dx:0,dy:0},joyEl=$('joy'),knob=$('knob');let joyUsed=false;
let pcMode=false,mouse={x:0,y:0,on:false};
function setPC(on){if(pcMode===on)return;pcMode=on;document.body.classList.toggle('pc',on);if(on&&state==='game'&&!setPC.told){setPC.told=1;toast('🖱 PC-Steuerung: WASD laufen · Linksklick angreifen · Leertaste springen · Shift sprinten · Strg/C ausweichen · F reden · E Inventar','#ffd54a',true);}}
c2d.addEventListener('pointerdown',e=>{if(state!=='game'||G.paused())return;
 if(e.pointerType==='mouse'&&isFP()&&document.pointerLockElement!==c2d){try{const r=c2d.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(_){}}
 if(e.pointerType!=='mouse'&&e.clientX>=VW*.5&&look.id===null){look.id=e.pointerId;look.x=look.sx=e.clientX;look.y=look.sy=e.clientY;look.t=performance.now();look.mv=0;e.preventDefault();return;}
 if(e.pointerType==='mouse'){setPC(true);mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;if(e.button===0){updAim();updMouseTile();const hs=G.P.inv[G.P.sel],mt=G.mouseTile,sel=hs&&G.STACK[hs.id]&&G.STACK[hs.id].plant;if(mt&&(sel||G.tileAt(mt.x,mt.y)===G.T.FIELD||G.farmAt(mt.x,mt.y))&&G.tapTile(mt.x,mt.y)){}else G.attackHeld=true;}else if(e.button===2){if(G.hasHammer&&G.hasHammer()){ui.openFurnBox();e.preventDefault();return;}if(use3d&&!isFP()){rot.on=true;rot.x=e.clientX;rot.y=e.clientY;}else G.dodge();}e.preventDefault();return;}
 setPC(false);
 if(joy.id===null&&e.clientX<VW*.5){joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.dx=joy.dy=0;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.style.display='block';knob.style.transform='';if(!joyUsed){joyUsed=true;$('joyHint').style.display='none';}}});
try{if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!('ontouchstart' in window&&navigator.maxTouchPoints>0)){pcMode=true;document.body.classList.add('pc');}}catch(_){}
const look={id:null,x:0,y:0};
const IX=()=>(G.settings.invX==='1'?-1:1)*(+G.settings.sens||1),IY=()=>(G.settings.invY==='1'?-1:1)*(+G.settings.sens||1);
addEventListener('pointermove',e=>{if(e.pointerType==='mouse')mouse.overUI=!(e.target===c2d||e.target===c3d);if(rot.on&&e.pointerType==='mouse'){G.camRot=(G.camRot||0)+(e.clientX-rot.x)*.009*IX();G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+(e.clientY-rot.y)*.006*IY()));rot.x=e.clientX;rot.y=e.clientY;}if(e.pointerId===look.id){const dx=e.clientX-look.x,dy=e.clientY-look.y;look.mv+=Math.abs(dx)+Math.abs(dy);if(isFP()){G.camYaw=(G.camYaw||0)+dx*.0058*IX();G.camPitch=Math.max(-1.2,Math.min(1,(G.camPitch||0)-dy*.0045*IY()));}else if(use3d){G.camRot=(G.camRot||0)+dx*.009*IX();G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+dy*.006*IY()));}look.x=e.clientX;look.y=e.clientY;return;}
 if(e.pointerType==='mouse'&&isFP()&&document.pointerLockElement===c2d&&!G.paused()){G.camYaw=(G.camYaw||0)+e.movementX*.0024*IX();G.camPitch=Math.max(-1.2,Math.min(1,(G.camPitch||0)-e.movementY*.0022*IY()));return;}
 if(e.pointerType==='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;if(!pcMode&&state==='game'&&(Math.abs(e.movementX)+Math.abs(e.movementY))>0)setPC(true);}});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button===0)G.attackHeld=false;});
c2d.addEventListener('wheel',e=>{if(state!=='game'||G.paused())return;e.preventDefault();const d=e.deltaY>0?1:-1;G.P.sel=(G.P.sel+d+9)%9;G.invDirty=true;},{passive:false});
document.addEventListener('mouseleave',()=>{mouse.on=false;G.attackHeld=false;});
function tapPlant(mx,my){if(state!=='game'||G.room||G.paused())return false;const P=G.P,cx=Math.floor(P.x/TILE),cy=Math.floor(P.y/TILE);let best=null,bd=1e9;for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++){const s=scr((x+.5)*TILE,(y+.5)*TILE,0);if(!s)continue;const d=Math.hypot(s.x-mx,s.y-my);if(d<bd){bd=d;best={x,y};}}if(!best||bd>60)return false;return G.tapTile(best.x,best.y);}
function updMouseTile(){if(isFP()||!pcMode||!mouse.on||state!=='game'||G.room){G.mouseTile=null;return;}const P=G.P,cx=Math.floor(P.x/TILE),cy=Math.floor(P.y/TILE);let best=null,bd=1e9;
 for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++){const s=scr((x+.5)*TILE,(y+.5)*TILE,0);if(!s)continue;const d=Math.hypot(s.x-mouse.x,s.y-mouse.y);if(d<bd){bd=d;best={x,y};}}
 G.mouseTile=bd<70?best:null;}
function updAim(){if(isFP()&&state==='game'){G.aim=fpDir();return;}if(!pcMode||!mouse.on||state!=='game'){G.aim=null;return;}const P=G.P,h=.6,s=scr(P.x,P.y,h);if(!s){G.aim=null;return;}if(Math.hypot(mouse.x-s.x,mouse.y-s.y)<8){G.aim=null;return;}
 // Mausposition auf den Boden zurückrechnen (berücksichtigt Kameradrehung und Perspektive)
 let wx=P.x,wy=P.y;for(let it=0;it<4;it++){const a=scr(wx,wy,h),b=scr(wx+16,wy,h),c=scr(wx,wy+16,h);if(!a||!b||!c)break;const ax=(b.x-a.x)/16,ay=(b.y-a.y)/16,bx=(c.x-a.x)/16,by=(c.y-a.y)/16,det=ax*by-bx*ay;if(Math.abs(det)<1e-6)break;const ex=mouse.x-a.x,ey=mouse.y-a.y;let ux=(ex*by-bx*ey)/det,uy=(ax*ey-ex*ay)/det;const ul=Math.hypot(ux,uy);if(ul>600){ux*=600/ul;uy*=600/ul;}wx+=ux;wy+=uy;if(Math.hypot(ux,uy)<1)break;}
 let dx=wx-P.x,dy=wy-P.y;const l=Math.hypot(dx,dy);G.aim=l>4?{x:dx/l,y:dy/l}:null;}
let rotHold=0,tiltHold=0;
addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),mx=50;if(d>mx){dx=dx/d*mx;dy=dy/d*mx;}joy.dx=dx/mx;joy.dy=dy/mx;knob.style.transform=`translate(${dx}px,${dy}px)`;const sp=!!sprintTog;if(G.sprintHeld!==sp){G.sprintHeld=sp;joyEl.classList.toggle('sprint',sp);}});
const jEnd=e=>{if(e.pointerType==='mouse'&&e.button===2)rot.on=false;if(e.pointerId===look.id){look.id=null;const now=performance.now();if(look.mv<14&&now-look.t<260){if(tapPlant(e.clientX,e.clientY)){look.lastTap=0;}else if(now-(look.lastTap||0)<330){G.dodge();look.lastTap=0;}else look.lastTap=now;}}if(e.pointerId===joy.id){joy.id=null;joy.dx=joy.dy=0;joyEl.style.display='none';G.sprintHeld=!!sprintTog;joyEl.classList.remove('sprint');}};
addEventListener('pointerup',jEnd);addEventListener('pointercancel',jEnd);c2d.addEventListener('contextmenu',e=>e.preventDefault());
const bAtk=$('bAtk');
bAtk.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(G.paused())return;G.attackHeld=true;bAtk.classList.add('on');});
['pointerup','pointercancel','pointerleave'].forEach(t=>bAtk.addEventListener(t,()=>{G.attackHeld=false;bAtk.classList.remove('on');}));
$('bAct').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G.paused())G.act();});
$('bDodge').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G.paused())G.dodge();});
for(const [id,dir,tl] of [['bRotL',-1,0],['bRotR',1,0],['bTiltU',1,1],['bTiltD',-1,1]]){const el=$(id);const st=v=>{if(tl)tiltHold=v;else rotHold=v;};el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();st(dir);});el.addEventListener('pointerup',()=>st(0));el.addEventListener('pointerleave',()=>st(0));el.addEventListener('pointercancel',()=>st(0));}
addEventListener('wheel',e=>{if(state!=='game'||!use3d||isFP()||G.paused())return;G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+(e.deltaY>0?.06:-.06)*IY()));},{passive:true});
$('bJump').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G.paused())G.jump();});
$('bRide').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();G.toggleRide();});
$('bSprint').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();sprintTog=!sprintTog;G.sprintHeld=sprintTog;$('bSprint').classList.toggle('on',sprintTog);$('bSprint').textContent=sprintTog?'🏃':'🚶';toast(sprintTog?'🏃 Sprinten (fest) – nochmal tippen zum Gehen':'🚶 Gehen','#ffe0a0');});
$('bCam').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();toggleCam();});
$('bInv').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(state!=='game')return;invOpen?closeInv():openInv();});
// Fokus behalten: Maus wieder einfangen & versteckte Eingabefelder freigeben
// ===== Tastenbelegung =====
const KACT=[['up','Vorwärts','w'],['down','Rückwärts','s'],['left','Links','a'],['right','Rechts','d'],['jump','Springen',' '],['sprint','Sprinten','shift'],['dodge','Ausweichen','c'],['act','Reden / Benutzen','f'],['inv','Inventar','e'],['heal','Schnellheilung','q'],['map','Karte','m'],['quest','Questbuch','j'],['skill','Fähigkeiten','k'],['help','Hilfe','h'],['cam','Kamera wechseln','v']];
let keyCap=null;
function mapKey(k){const B=G.settings.keys||{};for(const [id,,def] of KACT){if((B[id]||def)===k)return def;}for(const [id,,def] of KACT){if(def===k&&(B[id]||def)!==k)return '';}return k;}
const keyName=k=>({' ':'Leertaste','shift':'Shift','control':'Strg','alt':'Alt','tab':'Tab','enter':'Enter','arrowup':'↑','arrowdown':'↓','arrowleft':'←','arrowright':'→','capslock':'Feststell','backspace':'⌫'})[k]||k.toUpperCase();
function renderKeys(){const el=$('keyBind');if(!el)return;const B=G.settings.keys||{};el.innerHTML='';
 for(const [id,lab,def] of KACT){const r=document.createElement('div');r.className='krow';const cur=B[id]||def;r.innerHTML=`<span>${lab}</span>`;const b=document.createElement('button');b.className='kbtn'+(keyCap===id?' cap':'');b.textContent=keyCap===id?'Taste drücken …':keyName(cur);b.onclick=()=>{keyCap=keyCap===id?null:id;renderKeys();};r.appendChild(b);el.appendChild(r);}
 const rs=document.createElement('button');rs.className='btn';rs.style.marginTop='6px';rs.textContent='↺ Standard-Tasten';rs.onclick=()=>{G.settings.keys={};G.saveSettings();keyCap=null;renderKeys();};el.appendChild(rs);}
window.addEventListener('keydown',e=>{if(!keyCap)return;e.preventDefault();e.stopImmediatePropagation();const k=e.key.toLowerCase();if(k==='escape'){keyCap=null;renderKeys();return;}if(/^[1-9]$/.test(k)){toast('Die Zahlen 1–9 sind für die Hotbar reserviert.','#ffcc80');return;}
 const B=G.settings.keys=Object.assign({},G.settings.keys||{});const old=B[keyCap]||KACT.find(a=>a[0]===keyCap)[2];for(const [id,,def] of KACT)if(id!==keyCap&&(B[id]||def)===k)B[id]=old;B[keyCap]=k;G.saveSettings();keyCap=null;renderKeys();},true);
let lockLostT=0;
function regrab(){try{const a=document.activeElement;if(a&&a!==document.body&&a!==c2d&&(a.offsetWidth===0||!a.getClientRects().length||a.tagName==='BUTTON'))a.blur();}catch(_){}try{window.focus();}catch(_){}
 if(state==='game'&&pcMode&&isFP()&&!G.paused()&&document.pointerLockElement!==c2d&&performance.now()-lockLostT>1100){try{const r=c2d.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(_){}}
 const w=G.settings.win;if(state==='game'&&pcMode&&(w==='full'||w==='borderless')&&!document.fullscreenElement&&regrab.fsWant)applyWin(w,1);}
document.addEventListener('click',e=>{if(state!=='game')return;setTimeout(()=>{if(!G.paused())regrab();},0);},true);
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===c2d)return;lockLostT=performance.now();if(state==='game'&&isFP()&&!G.paused()&&!(G.P&&G.P.dead)){pauseOpen=true;G.attackHeld=false;show('pause',1);}});
function applyWin(v,quiet){const de=document.documentElement;const kl=on=>{try{if(!navigator.keyboard)return;if(on&&navigator.keyboard.lock)navigator.keyboard.lock(['Escape','MetaLeft','MetaRight','Tab']).catch(()=>{});else if(navigator.keyboard.unlock)navigator.keyboard.unlock();}catch(_){}};
 if(v==='window'){regrab.fsWant=0;kl(0);if(document.fullscreenElement)try{document.exitFullscreen();}catch(_){}return;}
 regrab.fsWant=1;if(document.fullscreenElement){kl(v==='full');return;}
 try{const r=(de.requestFullscreen||de.webkitRequestFullscreen).call(de,{navigationUI:'hide'});if(r&&r.then)r.then(()=>kl(v==='full')).catch(()=>{if(!quiet)toast('⚠ Der Browser hat Vollbild blockiert – öffne das Spiel in einem eigenen Tab.','#ffcc80',true);regrab.fsWant=0;});}catch(_){if(!quiet)toast('⚠ Vollbild ist hier nicht möglich.','#ffcc80');}}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){regrab.fsWant=0;try{navigator.keyboard&&navigator.keyboard.unlock&&navigator.keyboard.unlock();}catch(_){}}setTimeout(resize,60);});
const keys={};
addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')){const el=e.target;if(el.offsetWidth>0&&el.getClientRects().length){if(e.key==='Escape')closeChat();return;}try{el.blur();}catch(_){}}if(state==='game'&&!e.repeat&&/^(w|a|s|d|arrow\w+| |shift)$/i.test(e.key))regrab();if(ui.closeTravel&&(e.key==='Escape'||e.key.toLowerCase()==='f')){ui.closeTravel();return;}if(ui.closeFurn&&e.key==='Escape'){ui.closeFurn();return;}if(ui.closeBuild&&e.key==='Escape'){ui.closeBuild();return;}if(keyCap)return;const k=mapKey(e.key.toLowerCase());if(k==='')return;keys[k]=true;if(state==='cutscene'&&cs&&(k===' '||k==='enter')&&!e.repeat){e.preventDefault();const txt=cs.list[cs.i][1];if(cs.chars<txt.length)cs.chars=txt.length;else csNext();return;}if(state!=='game')return;
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))setPC(true);
 if(k===' '||k.startsWith('arrow')||k==='tab')e.preventDefault();
 if(k==='escape'&&mapOpen){closeMap();return;}if(k==='m'&&mapOpen&&!e.repeat){closeMap();return;}
 if(k==='escape'&&pauseOpen&&performance.now()-lockLostT<250)return;
 if(k==='escape'){if(invOpen||ui.dlgNpc||chatNpc||helpOpen||setOpen){closeInv();closeDialog();closeChat();helpOpen=false;show('help',0);setOpen=false;show('settings',0);}else{pauseOpen=!pauseOpen;show('pause',pauseOpen);}return;}
 if(ui.dlgNpc&&!e.repeat){if(k>='1'&&k<='9'){const b=$('dialog').querySelectorAll('.btn')[+k-1];if(b)b.click();return;}if(k==='f'||k==='e'){closeDialog();return;}}
 if(k==='e'&&!e.repeat){if(invOpen)closeInv();else if(!G.paused())openInv();return;}
 if(k==='k'&&!e.repeat){if(invOpen&&invTab==='skill')closeInv();else if(!G.paused()||invOpen)ui.openSkills();return;}
 if(k==='j'&&!e.repeat){if(invOpen&&invTab==='quest')closeInv();else if(!G.paused()||invOpen)ui.openQuests();return;}
 if(k==='h'&&!e.repeat){if(helpOpen){helpOpen=false;show('help',0);}else if(!G.paused())openHelp();return;}
 if(G.paused())return;
 if(k==='shift')G.sprintHeld=true;
 if(e.repeat)return;
 if(k===' ')G.jump();
 if(k==='control'||k==='c'){e.preventDefault();G.dodge();}
 if(k==='f')G.act();
 if(k==='q')G.quickHeal();
 if(k==='r'&&!e.repeat&&state==='game'&&!G.paused())G.toggleRide();
 if(k==='m')openMap();
 if(k==='v'&&!e.repeat)toggleCam();
 if(k>='1'&&k<='9')hotTap(+k-1);});
addEventListener('keyup',e=>{const k=mapKey(e.key.toLowerCase());if(k==='')return;keys[k]=false;if(k==='shift')G.sprintHeld=!!sprintTog;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;G.attackHeld=false;G.sprintHeld=!!sprintTog;});
let sprintTog=false,rot={on:false,x:0};
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.btn,.mbtn,.seg button,.dcard,.x'))G.sfx&&G.sfx('click');},true);
// ===================== Hauptschleife =====================
let last=performance.now(),hudT=0,saveT=10,mt=0,stepT=0,moodT=0;
let perfA=0,perfT=0,perfCool=0;
let perfGrace=8;function perfWatch(rdt){if(window.__noPerf||state!=='game'||G.settings.mode!=='3d'||G.paused()||document.hidden){perfT=0;perfGrace=Math.max(perfGrace,2);return;}if(G.R3D._built>0)return;{const P=G.P,j=perfWatch.lp?Math.hypot(P.x-perfWatch.lp.x,P.y-perfWatch.lp.y):0;perfWatch.lp={x:P.x,y:P.y};if(j>TILE*15)perfGrace=Math.max(perfGrace,4);}if(G.room!==perfWatch.rm){perfWatch.rm=G.room;perfGrace=Math.max(perfGrace,3);}if(perfGrace>0){perfGrace-=rdt;perfA=1/60;perfT=0;return;}perfA=perfA*.95+rdt*.05;perfCool-=rdt;rsT+=rdt;if(rsT>.8){rsT=0;if(perfA>1/45&&RS>.62){RS=Math.max(.6,RS-.08);resize();}else if(perfA<1/58&&RS<1){RS=Math.min(1,RS+.04);resize();}}perfT=perfA>1/22&&RS<=.62?perfT+rdt:0;
 if(perfT>9&&perfCool<=0&&G.settings.quality!=='low'){const nq=G.settings.quality==='high'?'mid':'low';G.settings.quality=nq;G.saveSettings();G.R3D.dispose&&G.R3D.dispose();applyMode();refreshSettings();perfT=0;perfCool=15;perfA=0;toast(`⚙ Grafik automatisch auf „${nq==='mid'?'Mittel':'Niedrig'}“ gestellt, damit es flüssig läuft`,'#ffd54a',true);}}

// ===== Entwickler-Konsole (passwortgeschützt) =====
const DEVH='dfa0fada0ff524ab9aca3ad786c1c0e9c369a841e0bdcf141f9744af8a446442';
async function sha(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}catch(e){return '';}}
const devOK=()=>{try{return localStorage.getItem('aschen_dev')===DEVH;}catch(e){return false;}};
const DEVC=[['/hilfe','Alle Befehle anzeigen'],['/karte aufdecken','Ganze Karte aufdecken'],['/karte verdecken','Karte wieder verdecken (nur Umgebung bleibt)'],['/gold 1000','Gold hinzufügen'],['/stufe 10','Auf Stufe setzen'],['/xp 500','Erfahrung geben'],['/heilen','Leben, Mana und Ausdauer auffüllen'],['/gott','Unverwundbar an/aus'],['/geist','Durch Wände laufen an/aus'],['/tempo 2','Laufgeschwindigkeit (1 = normal)'],['/tp dorf','Teleport: dorf, burg, lager, gruft, hort, gipfel, angler, Stadtname oder x y'],['/zeit 12','Uhrzeit setzen (0–23)'],['/tag','Auf Mittag springen'],['/nacht','Auf Mitternacht springen'],['/item potion 10','Stapelgegenstand geben (ID)'],['/items','Alle Stapel-IDs auflisten'],['/ausruestung sword 4','Ausrüstung geben: Typ + Seltenheit 0–5'],['/typen','Alle Waffen/Rüstungstypen auflisten'],['/spawn wolf 3','Monster erschaffen'],['/monster','Alle Monster-IDs auflisten'],['/toeten','Alle Gegner in der Nähe besiegen'],['/schmied','Schmied-Ware neu würfeln'],['/speichern','Sofort speichern'],['/pos','Aktuelle Position anzeigen'],['/leeren','Ausgabe leeren'],['/sperren','Konsole auf diesem Gerät wieder sperren']];
let devTap=0,devTapT=0;
function devLog(t,c){const o=$('devOut');const d=document.createElement('div');d.textContent=t;if(c)d.style.color=c;o.appendChild(d);o.scrollTop=1e9;}
function devSug(){const v=$('devIn').value.trim().toLowerCase(),el=$('devSug');el.innerHTML='';const list=DEVC.filter(([c])=>!v||c.startsWith(v.split(' ')[0])||c.includes(v));for(const [c,d] of list.slice(0,10)){const r=document.createElement('div');r.className='dsug';r.innerHTML=`<b>${c}</b> <small>${d}</small>`;r.onclick=()=>{$('devIn').value=c.split(' ').slice(0,c.startsWith('/karte')?2:1).join(' ')+' ';$('devIn').focus();devSug();};el.appendChild(r);}}
function openDev(){if(state!=='game')return;if(devOK()){show('devC',1);$('devPw').style.display='none';$('devMain').style.display='block';devSug();setTimeout(()=>$('devIn').focus(),50);}else{show('devC',1);$('devPw').style.display='block';$('devMain').style.display='none';$('devPwIn').value='';setTimeout(()=>$('devPwIn').focus(),50);}}
$('devPwGo').onclick=async()=>{const h=await sha('aschen:'+$('devPwIn').value.trim());if(h===DEVH){try{localStorage.setItem('aschen_dev',DEVH);}catch(e){}openDev();devLog('🔓 Entwickler-Konsole freigeschaltet. Tippe / für Vorschläge.','#ffd54a');}else{toast('Falsches Passwort','#ff8a80');show('devC',0);}};
$('devPwIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('devPwGo').click();});
$('devClose').onclick=()=>show('devC',0);$('devClose2').onclick=()=>show('devC',0);
$('devIn').addEventListener('input',devSug);
$('devIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){const v=$('devIn').value.trim();if(v){devLog('> '+v,'#9ad');try{devRun(v);}catch(er){devLog('Fehler: '+er.message,'#ff8a80');}}$('devIn').value='';devSug();}else if(e.key==='Escape')show('devC',0);else if(e.key==='Tab'){e.preventDefault();const f=$('devSug').firstChild;if(f)f.click();}});
$('devGo').onclick=()=>{const ev=new KeyboardEvent('keydown',{key:'Enter'});$('devIn').dispatchEvent(ev);};
$('lvl').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();const t=performance.now();if(t-devTapT>1500)devTap=0;devTapT=t;if(++devTap>=5){devTap=0;openDev();}});
addEventListener('keydown',e=>{if(e.key==='F8'||(e.key==='^'||e.key==='Dead'&&e.code==='Backquote')){if(state==='game'){e.preventDefault();openDev();}}});
function devTP(x,y){const P=G.P;G.room=null;let best=null;for(let r=0;r<12&&!best;r++)for(let dy=-r;dy<=r&&!best;dy++)for(let dx=-r;dx<=r;dx++){const tx=Math.round(x)+dx,ty=Math.round(y)+dy;if(G.walkTile&&G.walkTile(tx,ty)){best=[tx,ty];break;}}if(!best)best=[x,y];P.x=(best[0]+.5)*TILE;P.y=(best[1]+.5)*TILE;G.invDirty=true;devLog(`Teleportiert nach ${best[0]}, ${best[1]}`);}
function devRun(v){const P=G.P,a=v.replace(/^\//,'').split(/\s+/),c=a[0].toLowerCase(),n=+a[1];
 switch(c){
 case 'hilfe':case 'help':DEVC.forEach(([k,d])=>devLog(k+'  –  '+d));break;
 case 'karte':if((a[1]||'').startsWith('auf')){G.devReveal=true;G.fogAll(1);devLog('🗺 Karte aufgedeckt');}else if((a[1]||'').startsWith('ver')){G.devReveal=false;G.fogAll(0);devLog('🌫 Karte verdeckt');}else devLog('Nutze /karte aufdecken oder /karte verdecken');break;
 case 'gold':P.gold+=isNaN(n)?1000:n;G.invDirty=true;devLog(`🪙 Gold: ${P.gold}`);break;
 case 'stufe':case 'level':{const t=Math.max(1,Math.min(99,n||P.level+1));let g=0;while(P.level<t&&g++<200)G.gainXP(G.xpNeed(P.level)-(P.xp||0)+1);devLog(`⚔ Stufe ${P.level}`);break;}
 case 'xp':G.gainXP(n||100);devLog(`+${n||100} XP`);break;
 case 'heilen':case 'heal':{const S=G.calc();P.hp=S.maxhp;P.mp=S.maxMp;P.sta=S.maxSta||100;devLog('❤ Aufgefüllt');break;}
 case 'gott':case 'god':G.god=!G.god;devLog('🛡 Unverwundbar: '+(G.god?'AN':'AUS'));break;
 case 'geist':case 'noclip':G.noclip=!G.noclip;devLog('👻 Durch Wände: '+(G.noclip?'AN':'AUS'));break;
 case 'tempo':case 'speed':G.devSpd=Math.max(.2,Math.min(8,n||1));devLog('🏃 Tempo ×'+G.devSpd);break;
 case 'tp':{const w=(a[1]||'').toLowerCase();if(!isNaN(+a[1])&&!isNaN(+a[2])){devTP(+a[1],+a[2]);break;}const L={dorf:[G.VCX,G.VCY+5],burg:[G.VCX,G.VCY-15],lager:[G.CAMP.x,G.CAMP.y+3],gruft:[G.CRYPT.x,G.CRYPT.y+3],hort:[G.LAIR.x,G.LAIR.y+6],gipfel:[G.SUMMIT.x,G.SUMMIT.y]};{const ab=G.BUILD.find(b=>b.id==='angler');if(ab)L.angler=[ab.door.tx,ab.door.ty+1];}if(L[w]){devTP(...L[w]);break;}const t=G.TOWNS.find(t=>t.name.toLowerCase().includes(w));if(t&&w){devTP(t.x,t.y+2);break;}devLog('Unbekanntes Ziel. Orte: dorf, burg, lager, gruft, hort, gipfel, '+G.TOWNS.map(t=>t.name).join(', '),'#ff8a80');break;}
 case 'zeit':case 'time':{const h=((n||0)%24+24)%24,day=Math.floor(P.dayT/720);P.dayT=day*720+((h-6+24)%24)/24*720;devLog(`🕐 ${h}:00 Uhr`);break;}
 case 'tag':devRun('/zeit 12');break;case 'nacht':devRun('/zeit 0');break;
 case 'item':{const id=a[1],k=Math.max(1,+a[2]||1);if(!G.STACK[id]){devLog('Unbekannte ID. /items zeigt alle.','#ff8a80');break;}G.dev.give(G.dev.mkStack(id,k));G.invDirty=true;devLog(`🎒 ${k}× ${G.STACK[id].name}`);break;}
 case 'items':devLog(Object.keys(G.STACK).map(k=>k+' ('+G.STACK[k].name+')').join(', '));break;
 case 'ausruestung':case 'gear':{const k=a[1]||'sword',r=Math.max(0,Math.min(5,isNaN(+a[2])?3:+a[2]));const it=G.lootItem(k,P.level,r,{});if(!it){devLog('Unbekannter Typ. /typen zeigt alle.','#ff8a80');break;}G.dev.give(it);G.invDirty=true;devLog(`⚔ ${G.iname(it)} (${G.RAR[r].n})`);break;}
 case 'typen':devLog('Waffen: '+Object.keys(G.WKIND).join(', ')+' · Rüstungssets: '+Object.keys(G.SETS).join(', ')+' · ring, amulet');break;
 case 'spawn':{const t=a[1],k=Math.max(1,Math.min(20,+a[2]||1));if(!G.MT[t]){devLog('Unbekanntes Monster. /monster zeigt alle.','#ff8a80');break;}for(let i=0;i<k;i++){const an=Math.random()*6.283;G.mons.push(G.mkMonster(t,P.level,P.x+Math.cos(an)*80,P.y+Math.sin(an)*80));}devLog(`👹 ${k}× ${G.MT[t].n}`);break;}
 case 'monster':devLog(Object.keys(G.MT).join(', '));break;
 case 'toeten':case 'kill':{let k=0;for(const m of G.mons)if(!m.dead&&Math.hypot(m.x-P.x,m.y-P.y)<TILE*14){G.killMonster(m);k++;}devLog(`💀 ${k} Gegner besiegt`);break;}
 case 'schmied':P.smithStock=null;devLog('⚒ Neue Ware beim Schmied');break;
 case 'speichern':case 'save':G.save();devLog('💾 Gespeichert in Spielstand '+G.slot);break;
 case 'pos':devLog(`📍 ${Math.floor(P.x/TILE)}, ${Math.floor(P.y/TILE)}${G.room?' (Innenraum '+G.room.name+')':''}`);break;
 case 'leeren':case 'clear':$('devOut').innerHTML='';break;
 case 'sperren':try{localStorage.removeItem('aschen_dev');}catch(e){}show('devC',0);toast('🔒 Konsole gesperrt','#ffd54a');break;
 default:devLog('Unbekannter Befehl. Tippe /hilfe','#ff8a80');}}
{const bye=()=>{try{if(state==='game'&&G.P&&!G.P.dead){fogStore();G.save();}}catch(e){}};addEventListener('pagehide',bye);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')bye();});}
let fpsAcc=0;function loop(now){{const lim=+(G.settings.fps||60);if(lim>0&&last){const fi=1000/lim;if(now-last<fi-2.5){requestAnimationFrame(loop);return;}}}const dt=Math.min(.05,(now-last)/1000);const rdt=Math.min(.5,(now-last)/1000);last=now;
 try{{const ig=state==='game'&&pcMode&&!G.paused()&&!ui.dlgNpc;if(ig!==ui._ig){ui._ig=ig;document.body.classList.toggle('ingame',ig);}}if(document.pointerLockElement&&(state!=='game'||G.paused()))document.exitPointerLock();if(pcMode)updMouseTile();else G.mouseTile=null;perfWatch(rdt);
 if(state==='game'){let mx=joy.dx,my=joy.dy;if(keys.w||keys.arrowup)my-=1;if(keys.s||keys.arrowdown)my+=1;if(keys.a)mx-=1;if(keys.d)mx+=1;if(isFP()){if(keys.arrowright)G.camYaw=(G.camYaw||0)+dt*2.4;if(keys.arrowleft)G.camYaw=(G.camYaw||0)-dt*2.4;const f=fpDir();const wx=-f.y*mx+f.x*(-my),wy=f.x*mx+f.y*(-my);mx=wx;my=wy;G.fpDir=f;if(!G.P.dead&&!G.paused()){G.P.fx=f.x;G.P.fy=f.y;}}else{G.fpDir=null;if(keys.arrowright)mx+=1;if(keys.arrowleft)mx-=1;if(use3d&&G.camRot){const r=G.camRot,c=Math.cos(r),sn=Math.sin(r);const wx=c*mx+sn*my,wy=-sn*mx+c*my;mx=wx;my=wy;}}if(rotHold)G.camRot=(G.camRot||0)+rotHold*dt*1.8;if(tiltHold)G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+tiltHold*dt*.9));G.input.x=mx;G.input.y=my;updAim();
  if(!G.paused())G.update(dt);else{G.S=G.calc();for(const k in keys)keys[k]=false;G.input.x=G.input.y=0;G.attackHeld=false;if(G.P){G.P.moving=false;}if(joy.id!==null){joy.id=null;joy.dx=joy.dy=0;joyEl.style.display='none';}}
  if(use3d){G.R3D.render();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c2d.width,c2d.height);}else if(isFP())G.R2D.renderFP(ctx,VW,VH,DPR);else G.R2D.render(ctx,VW,VH,DPR);
  stepT-=dt;const P=G.P;if(P.moving&&!P.dead&&!G.paused()&&stepT<=0){stepT=P.dodgeT>0?.12:.31*140/((G.S&&G.S.speed)||140);const tt=G.tileAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE));const T_=G.T;const surf=G.room?(tt===T_.STONEF||G.room.floor===T_.STONEF?'hard':'wood'):[T_.COBBLE,T_.PATH,T_.ASH,T_.DIRT].includes(tt)?'hard':[T_.SWAMP,T_.SAND].includes(tt)?'wet':'soft';G.sfx&&G.sfx('step',{surf});}
  moodT-=dt;if(moodT<=0&&G.setMood){moodT=1;const nb=G.mons.some(m=>m.boss&&!m.dead&&Math.hypot(m.x-P.x,m.y-P.y)<520);const b=G.biome(Math.floor(P.x/TILE),Math.floor(P.y/TILE));const tw=G.townAt&&G.townAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE));G.setMood(nb?'boss':G.room?(G.room.dungeon?'dungeon':'house'):(b==='village'||(tw&&tw.id!=='glut'))?(tw&&tw.id==='frost'?'frost':'village'):b==='winter'?'frost':(b==='meadow'||b==='forest')?'wild':b==='ash'||tw?'ash':'dark');}
  drawOverlay();try{fogTick(dt);}catch(e){}hudT-=dt;if(hudT<=0){hudT=.1;try{hud();}catch(e){if(!ui._hudErr){ui._hudErr=1;console.error('HUD',e);}}}saveT-=dt;if(saveT<=0){saveT=10;if(!G.P.dead){try{fogStore();}catch(e){}G.save();}}}
 else if(state==='menu'){if(G.setMood)G.setMood('menu');mt+=dt;ctx.setTransform(DPR,0,0,DPR,0,0);SCN.menu(ctx,VW,VH,mt);}
 else if(state==='cutscene'&&cs)drawCS(dt);
 if(charLook&&$('charSel').classList.contains('show')){charT+=dt;charPreview(dt);}
 }catch(err){console.error(err);}
 requestAnimationFrame(loop);}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='game')G.save();});
resize();toMenu();requestAnimationFrame(loop);
let mapOpen=false;const mapEl=document.createElement('div');mapEl.className='overlay';mapEl.id='bigmap';mapEl.innerHTML='<div class="panel parch mapP"><div class="ph"><span>🗺 Karte von Eldmar</span><button class="x">✕</button></div><canvas id="mapC"></canvas><div class="hint" style="text-align:center">Ziehen = verschieben · Mausrad / zwei Finger / +− = zoomen · ✨ Wegschrein · ⚔ Dungeon</div></div>';document.body.appendChild(mapEl);
mapEl.querySelector('.x').onclick=()=>closeMap();mapEl.addEventListener('click',e=>{if(e.target===mapEl&&performance.now()-(ui._ovT||0)>500)closeMap();});$('mini').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(state==='game'&&!G.paused())openMap();});
let mz=1,mcx=0,mcy=0;const mptr=new Map();let mpinch=null;
function openMap(){if(state!=='game')return;ui._ovT=performance.now();mapOpen=true;G.attackHeld=false;mapEl.classList.add('show');const P=G.P,pp=G.room?G.room.ent:P;mz=Math.max(mz,2.5);mcx=pp.x/TILE;mcy=pp.y/TILE;drawBig();}
function closeMap(){mapOpen=false;mapEl.classList.remove('show');}
const MV=()=>Math.max(G.WW,G.H)/mz;
function mClamp(){const V=MV();mcx=Math.max(V/2-40,Math.min(G.WW-V/2+40,mcx));mcy=Math.max(V/2-40,Math.min(G.H-V/2+40,mcy));if(mz<=1.01){mcx=G.WW/2;mcy=G.H/2;}}
function mZoom(f,sx,sy){const c=$('mapC'),sz=parseFloat(c.style.width)||600,V=MV(),k=sz/V;const wx=mcx-V/2+(sx==null?sz/2:sx)/k,wy=mcy-V/2+(sy==null?sz/2:sy)/k;mz=Math.max(1,Math.min(12,mz*f));const V2=MV(),k2=sz/V2;mcx=wx-(sx==null?sz/2:sx)/k2+V2/2;mcy=wy-(sy==null?sz/2:sy)/k2+V2/2;mClamp();drawBig();}
{const bar=document.createElement('div');bar.className='mapBar';bar.innerHTML='<button class="btn" data-z="out">−</button><button class="btn" data-z="in">+</button><button class="btn" data-z="me">📍 Ich</button><button class="btn" data-z="all">🗺 Ganz</button>';mapEl.querySelector('.panel').insertBefore(bar,$('mapC'));
 bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{const z=b.dataset.z;if(z==='in')mZoom(1.6);else if(z==='out')mZoom(1/1.6);else if(z==='me'){const P=G.P,pp=G.room?G.room.ent:P;mz=Math.max(mz,3);mcx=pp.x/TILE;mcy=pp.y/TILE;mClamp();drawBig();}else{mz=1;mClamp();drawBig();}});
 const c=$('mapC');c.style.touchAction='none';
 c.addEventListener('wheel',e=>{e.preventDefault();const r=c.getBoundingClientRect();mZoom(e.deltaY<0?1.25:1/1.25,e.clientX-r.left,e.clientY-r.top);},{passive:false});
 c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);mptr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(mptr.size===2){const [a,b]=[...mptr.values()];mpinch={d:Math.hypot(a.x-b.x,a.y-b.y)};}});
 c.addEventListener('pointermove',e=>{if(!mptr.has(e.pointerId))return;const o=mptr.get(e.pointerId),n={x:e.clientX,y:e.clientY};mptr.set(e.pointerId,n);const r=c.getBoundingClientRect(),sz=r.width,k=sz/MV();
  if(mptr.size===2&&mpinch){const [a,b]=[...mptr.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>10&&mpinch.d>10){mZoom(d/mpinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);}mpinch.d=d;return;}
  if(mptr.size===1){mcx-=(n.x-o.x)/k;mcy-=(n.y-o.y)/k;mClamp();drawBig();}});
 const up=e=>{mptr.delete(e.pointerId);if(mptr.size<2)mpinch=null;};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);}
function drawBig(){const c=$('mapC'),P=G.P;const sz=Math.min(innerWidth-40,innerHeight-150,720);const d=Math.min(window.devicePixelRatio||1,2);c.style.width=c.style.height=sz+'px';if(c.width!==Math.round(sz*d)){c.width=c.height=Math.round(sz*d);}const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.fillStyle='#1a120a';g.fillRect(0,0,sz,sz);
 mClamp();const V=MV(),k=sz/V,ox=mcx-V/2,oy=mcy-V/2;
 g.save();g.translate(-ox*k,-oy*k);g.scale(k,k);g.imageSmoothingEnabled=mz<3;g.drawImage(mmBase,0,0);if(fogDirty)fogRedraw();if(!G.devReveal){g.imageSmoothingEnabled=true;g.drawImage(fogC,0,0,FW,FH,0,0,FW*FG,FH*FG);}g.restore();
 const X=x=>(x-ox)*k,Y=y=>(y-oy)*k;
 g.textAlign='center';g.font='bold 12px Georgia';g.lineWidth=3;
 const lab=(t,x,y,col)=>{if(!fogSeen(x,y))return;const sx=X(x),sy=Y(y);if(sx<-60||sy<-20||sx>sz+60||sy>sz+20)return;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(t,sx,sy);g.fillStyle=col||'#ffe9b0';g.fillText(t,sx,sy);};
 const bn={meadow:[430,760,'Sonnenwiesen'],forest:[1060,440,'Finsterwald'],swamp:[100,490,'Nebelmoor'],waste:[600,1050,'Steinöde'],winter:[160,50,'Frostlande'],ash:[900,60,'Aschenberge'],dark:[160,1090,'Schattenwald'],desert:[1020,900,'Sengende Dünen'],peaks:[536,90,'Graukamm'],mist:[1250,620,'Nebellande'],ashvale:[744,384,'Aschental (zerstört)']};g.font='italic '+Math.round(11+Math.min(4,mz))+'px Georgia';for(const kk in bn)lab(bn[kk][2],bn[kk][0],bn[kk][1],'rgba(255,240,200,.75)');
 g.font='bold 12px Georgia';lab('Eichenhain',G.VCX,G.VCY-12);for(const t of G.TOWNS)lab(t.name,t.x,t.y-t.r-1);
 g.font=Math.round(13+Math.min(6,mz))+'px serif';for(const w of G.WAYS){if(!fogSeen(w.tx,w.ty))continue;g.fillText(P.ways[w.id]?'✨':'·',X(w.tx+.5),Y(w.ty+.5)+5);}
 if(mz>=3){g.font='bold 11px Georgia';for(const b of G.BUILD){if(!b.wild||!b.room||!fogSeen(b.x,b.y))continue;lab((b.room.dungeon?'⚔ ':'🏠 ')+(b.name||''),b.x+b.w/2,b.y-1,'#f4d08a');}}
 const ob=G.objective();if(ob.to){g.strokeStyle='#ffd54a';g.lineWidth=2;g.beginPath();g.arc(X(ob.to.x/TILE),Y(ob.to.y/TILE),7+Math.min(5,mz),0,7);g.stroke();}
 const pp=G.room?G.room.ent:P;g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.arc(X(pp.x/TILE),Y(pp.y/TILE),5,0,7);g.fill();g.stroke();
 g.font='bold 11px Georgia';g.textAlign='right';g.fillStyle='rgba(255,240,200,.8)';g.fillText('Zoom ×'+mz.toFixed(1),sz-6,sz-6);g.textAlign='left';}
ui.openTravel=function(){if(travelOpen)return;const P=G.P;const ov=document.createElement('div');ov.className='overlay';ov.style.display='flex';ov.innerHTML=`<div class="panel parch" style="max-width:340px"><div class="ph"><span>✨ Wegschrein · Schnellreise</span><button class="x">✕</button></div><div id="twl"></div><p style="font-size:12px;color:#6b5233;margin-top:6px">Entdecke weitere Wegschreine, indem du in ihre Nähe läufst.</p></div>`;document.body.appendChild(ov);travelOpen=true;
 const close=()=>{ov.remove();travelOpen=false;ui.closeTravel=null;};ui.closeTravel=close;ov.id='travelOv';ov.style.zIndex=60;ov.querySelector('.x').onclick=close;const l=ov.querySelector('#twl');
 for(const w of G.WAYS){const b=document.createElement('button');b.className='btn';b.style.cssText='display:block;width:100%;margin:5px 0';const on=P.ways[w.id];const here=Math.hypot((w.tx+.5)*TILE-P.x,(w.ty+.5)*TILE-P.y)<TILE*4;b.textContent=(on?'✨ ':'🔒 ')+w.name+(here?' (hier)':'')+(on?'':' – unentdeckt');b.disabled=!on||here;if(!on||here)b.style.opacity=.5;b.onclick=()=>{close();G.travel(w.id);};l.appendChild(b);}};
let travelOpen=false;

// ===================== v22: Läden mit Bild & Werten, Möbelkatalog, Schaufenster, Einrichten (Haus & Dorf), Casino =====================
const esc22=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let buildOpen=false,furnOpen=false;
function ov22(title,w){G.attackHeld=false;buildOpen=true;ui._ovT=performance.now();const ov=document.createElement('div');ov.className='overlay ov22';ov.style.display='flex';ov.style.zIndex=62;ov.innerHTML=`<div class="panel parch" style="max-width:${w||460}px;width:96vw;max-height:92vh;display:flex;flex-direction:column"><div class="ph"><span>${title}</span><button class="x">✕</button></div><div class="ob" style="overflow:auto;flex:1;min-height:0"></div></div>`;document.body.appendChild(ov);
 const close=()=>{ov.remove();if(ui.closeBuild===close)ui.closeBuild=null;buildOpen=document.querySelectorAll('.ov22').length>0;};ov.querySelector('.x').onclick=close;ov.addEventListener('click',e=>{if(e.target===ov&&performance.now()-(ui._ovT||0)>500)close();});ui.closeBuild=close;return{ov,body:ov.querySelector('.ob'),close};}
const GOLDF=n=>n.toLocaleString('de-DE');
// Vorschau eines Stücks auf einer kleinen Bodenfläche
function furnPrev(id,px,room){const S=G.SHP[G.FDECO[id].sh],cv=document.createElement('canvas'),dp=devicePixelRatio||1,n=Math.max(S.w,S.h),s=Math.floor((px||64)/(n+.6));cv.width=(px||64)*dp;cv.height=(px||64)*dp;cv.style.width=cv.style.height=(px||64)+'px';const g=cv.getContext('2d');g.scale(dp,dp);const P0=px||64,ox=(P0-S.w*s)/2,oy=(P0-S.h*s)/2+2;
 if(room){g.fillStyle='#5a3d20';g.fillRect(0,0,P0,P0*.32);for(let i=0;i<P0;i+=8){g.fillStyle=i%16?'#4e341c':'#5f4223';g.fillRect(i,0,6,P0*.32);}g.fillStyle='#b8895a';g.fillRect(0,P0*.32,P0,P0);g.fillStyle='rgba(0,0,0,.12)';for(let y=P0*.32;y<P0;y+=10)g.fillRect(0,y,P0,1);}
 else{g.fillStyle=S.o?'#6a9a48':'#c9a46a';g.fillRect(0,0,P0,P0);g.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<P0;i+=s){g.fillRect(i,0,1,P0);g.fillRect(0,i,P0,1);}}
 g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(ox+S.w*s/2,oy+S.h*s-3,S.w*s*.42,5,0,0,7);g.fill();G.R2D.drawFurn(g,id,ox,oy,s);return cv;}
// --- Angebote (Karte: Bild, Name, Beschreibung, Werte, Preis)
ui.openOffers=function(id){const n=G.npcById(id),W=ov22(`🛒 ${esc22(n?n.name:'Laden')}`,460);const render=()=>{const P=G.P,L=G.offers(id);W.body.innerHTML=`<div class="hint" style="margin:4px 0">Dein Gold: <b>${GOLDF(P.gold)}</b></div>`;
  L.forEach((o,k)=>{const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;align-items:flex-start;padding:8px;margin:6px 0;background:rgba(255,245,215,.6);border:1px solid #a88a5a;border-radius:8px';
   const pic=document.createElement('div');pic.style.cssText='flex:0 0 64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:38px;background:#e8d6b0;border-radius:6px;border:1px solid #a88a5a';
   if(o.plan!=null){pic.appendChild(planPrev(o.plan,64));}else pic.textContent=o.ic;row.appendChild(pic);
   const t=document.createElement('div');t.style.flex='1';t.innerHTML=`<b>${esc22(o.n)}</b><div style="font-size:12px;color:#5a4020;margin:2px 0">${esc22(o.d)}</div><div style="font-size:12px;color:#2e5a1e">${(o.st||[]).map(x=>'• '+esc22(x)).join('<br>')}</div>`;row.appendChild(t);
   const b=document.createElement('button');b.className='btn'+(o.own||o.lock||P.gold<o.price?' dis':'');b.style.minWidth='86px';b.textContent=o.own?'✔ Besitzt du':o.lock?'🔒 Gesperrt':`${GOLDF(o.price)} G`;b.onclick=()=>{if(o.own||o.lock)return;if(G.buyOffer(id,k)){toast(`✔ ${o.n}`,'#a5d6a7');render();}};row.appendChild(b);W.body.appendChild(row);});};render();};
// Grundriss-Vorschau des Hauses für eine Ausbaustufe
function planPrev(lv,px){const cv=document.createElement('canvas'),Z=G.HZ,s=px/24;cv.width=px*2;cv.height=px*2;cv.style.width=cv.style.height=px+'px';const g=cv.getContext('2d');g.scale(2,2);g.fillStyle='#2a1a0c';g.fillRect(0,0,px,px);const oy=(px-13*s)/2;
 for(const z of Z){if(z[4]>lv)continue;g.fillStyle=z[4]===lv&&lv>0?'#e8c070':'#c9a46a';g.fillRect(z[0]*s,oy+z[1]*s,(z[2]-z[0]+1)*s,(z[3]-z[1]+1)*s);}g.fillStyle='#3b2410';g.fillRect(12*s,oy+12.6*s,s,s*.6);return cv;}
// --- Möbel- / Deko-Katalog mit Vorschau
ui.openCatalog=function(kind){const out=kind==='out',W=ov22(out?'🌷 Flora · Dorf- & Park-Deko':'🪑 Holger · Möbelkatalog',560);const P=G.P;const shapes=Object.keys(G.SHP).filter(k=>!!G.SHP[k].o===out);let cur=shapes[0];
 const tabs=document.createElement('div');tabs.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px';const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px';const head=document.createElement('div');head.className='hint';
 W.body.appendChild(head);W.body.appendChild(tabs);W.body.appendChild(grid);
 const render=()=>{head.innerHTML=`Dein Gold: <b>${GOLDF(P.gold)}</b> · Gekauftes landet im 📦 Möbellager. ${out?'Aufstellen: Hammer in die Hand und im Dorf ✋ drücken.':'Aufstellen: im eigenen Haus mit dem Hammer (✋).'}`;
  tabs.innerHTML='';shapes.forEach(k=>{const b=document.createElement('button');b.className='btn'+(k===cur?'':' dim');b.style.cssText='padding:4px 8px;font-size:13px';b.textContent=G.SHP[k].ic+' '+G.SHP[k].n;b.onclick=()=>{cur=k;render();};tabs.appendChild(b);});
  grid.innerHTML='';Object.values(G.FDECO).filter(d=>d.sh===cur&&!d.ex).forEach(d=>{const S=G.SHP[d.sh],card=document.createElement('div');card.style.cssText='background:rgba(255,245,215,.65);border:1px solid #a88a5a;border-radius:8px;padding:6px;display:flex;flex-direction:column;align-items:center;text-align:center';
   card.appendChild(furnPrev(d.id,96,!out));const own=(P.furn&&P.furn[d.id])||0;const t=document.createElement('div');t.style.cssText='font-size:13px;margin:4px 0';t.innerHTML=`<b>${esc22(d.n)}</b><div style="font-size:11px;color:#5a4020">${S.w}×${S.h} Felder${S.s?'':' · begehbar'}${S.l==='w'?' · Wand':''}${S.c?` · Gemütlichkeit +${S.c}`:''}${S.bed?' · zum Schlafen':''}${own?` · im Lager: ${own}`:''}</div>`;card.appendChild(t);
   const b=document.createElement('button');b.className='btn'+(P.gold<d.price?' dis':'');b.textContent=`${GOLDF(d.price)} G`;b.onclick=()=>{if(G.buyDeco(d.id)){toast(`${S.ic} ${d.n} gekauft!`,'#ffd54a');render();}};card.appendChild(b);grid.appendChild(card);});};render();};
// --- Schaufenster: das heutige Exklusiv-Stück im Raum
ui.openMail=function(){const W=ov22('✉ Dein Briefkasten',480);let cur=null;const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));const WD=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];const ds=d=>WD[d%7]+', Tag '+(d+1);
 const render=()=>{const L=G.mailList();if(cur){const m=L.find(x=>x.id===cur);if(!m){cur=null;return render();}G.mailRead(m.id);
   W.body.innerHTML=`<div class="mlL"><div class="mlH"><b>${esc(m.f)}</b><span>${ds(m.d)}</span></div><div class="mlS">${esc(m.s)}</div><div class="mlT">${esc(m.t)}</div>${m.g?`<div class="mlG">${m.gc?'Beilage angenommen: ':'Beilage: '}<b>${esc(G.mailGiftName(m))}</b>${m.gc?'':' <button class="btn" data-a="claim">Annehmen</button>'}</div>`:''}</div><div class="mlB"><button class="btn" data-a="back">Zurück</button><button class="btn" data-a="del">Löschen</button></div>`;}
  else{W.body.innerHTML=L.length?`<div class="mlList">${L.map(m=>`<div class="mlR${m.r?'':' un'}" data-id="${m.id}"><i class="mlDot"></i><div class="mlRt"><div class="mlRf">${esc(m.f.split(' · ')[0])}<span>${ds(m.d)}</span></div><div class="mlRs">${esc(m.s)}${m.g&&!m.gc?' <em>+ Beilage</em>':''}</div></div></div>`).join('')}</div><div class="mlB"><button class="btn" data-a="delr">Gelesene löschen</button></div>`:'<div class="mlE">Dein Briefkasten ist leer. Schau später wieder vorbei.</div>';}
  ui.hudDirty=true;};
 W.body.onclick=e=>{const a=e.target.closest('[data-a]'),r=e.target.closest('.mlR');if(a){const k=a.dataset.a;if(k==='back')cur=null;else if(k==='del'){G.mailDel(cur);cur=null;}else if(k==='claim'){G.mailClaim(cur);G.save&&G.save();}else if(k==='delr')G.mailDelRead();render();return;}if(r){cur=+r.dataset.id;render();}};render();};
ui.openShowcase=function(){const W=ov22('🪟 Schaufenster · nur heute',460),P=G.P;const render=()=>{W.body.innerHTML=`<div class="hint">Jeden Tag stellt der Handwerkshof 1–2 Einzelstücke aus, die es nur heute und nur hier gibt. Morgen ist es etwas anderes. (Dein Gold: <b>${GOLDF(P.gold)}</b>)</div>`;const open=G.shopOpen('baldur');
  for(const it of G.showcase()){const d=G.FDECO[it.i],S=G.SHP[d.sh];const box=document.createElement('div');box.style.cssText='margin:8px 0;padding:8px;background:rgba(255,245,215,.65);border:2px solid #c8a040;border-radius:10px;text-align:center';box.appendChild(furnPrev(it.i,220,!S.o));
   const t=document.createElement('div');t.innerHTML=`<b style="font-size:16px">✨ ${esc22(d.n)}</b><div style="font-size:12px;color:#5a4020">Exklusives Einzelstück · ${S.o?'Außen-Deko fürs Dorf':'fürs Haus'} · ${S.w}×${S.h} Felder${S.c?` · Gemütlichkeit +${S.c*2}`:''}</div>`;box.appendChild(t);
   const b=document.createElement('button');b.className='btn'+(it.sold||!open||P.gold<d.price?' dis':'');b.style.marginTop='6px';b.textContent=it.sold?'✔ Verkauft':!open?`🔒 Geschlossen (${G.shopHoursTxt('baldur')})`:`${GOLDF(d.price)} G – kaufen`;b.onclick=()=>{if(!it.sold&&G.buyShow(it.i))render();};box.appendChild(b);W.body.appendChild(box);}};render();};
// --- Einrichten: Rasterplan von oben, zoombar – Haus oder das Dorf, in dem du stehst
ui.openBuild=function(mode){const P=G.P,home=mode!=='town'&&G.room&&G.room.player;if(!home&&mode!=='town'){ui.openFurnBox();return;}
 let tid=null,X0,Y0,WW2,HH2;if(home){const HR=G.HR;X0=HR.x0;Y0=HR.y0;WW2=HR.w;HH2=HR.h;}else{const tx=Math.floor(P.x/32),ty=Math.floor(P.y/32);tid=G.townIdAt(tx,ty);if(!tid||G.room){toast('🏡 Deko kannst du nur in einem befreundeten Dorf aufstellen – geh hinein und versuch es dort.','#ffcc80',true);return;}
  const t=tid==='city'?{x:G.VCX,y:G.VCY,r:G.RV}:G.TOWNS.find(q=>q.id===tid);X0=t.x-t.r;Y0=t.y-t.r;WW2=HH2=t.r*2+1;}
 const W=ov22(home?'🔨 Haus einrichten':'🏡 Dorf dekorieren · '+(tid==='city'?'Eichenhain':G.TOWNS.find(q=>q.id===tid).name),720);const body=W.body;
 body.innerHTML=`<div class="bhint hint" style="min-height:34px"></div><div style="display:flex;gap:6px;align-items:center;margin:4px 0"><button class="btn zm">－</button><button class="btn zp">＋</button><span class="hint">Wischen = verschieben · zwei Finger / Mausrad = zoomen</span><span style="flex:1"></span><button class="btn me">📍 Zu mir</button></div><div class="bwrap" style="overflow:hidden;height:52vh;border:2px solid #8a6a3a;border-radius:6px;background:#1a120a;touch-action:none"><canvas class="bcv" style="display:block"></canvas></div><div class="bbtns btns" style="margin-top:6px"></div><div class="bsub" style="margin-top:6px"><b>📦 Möbellager</b></div><div class="blist" style="display:flex;flex-wrap:wrap;gap:6px;max-height:22vh;overflow:auto"></div>`;
 const cv=body.querySelector('.bcv'),cx=cv.getContext('2d'),wrap=body.querySelector('.bwrap'),hint=body.querySelector('.bhint'),bb=body.querySelector('.bbtns'),bl=body.querySelector('.blist');
 let cs=home?36:14,sel=null;// {mode:'new',id,x,y} | {mode:'pick',it} | {mode:'move',it,x,y}
 const items=()=>home?G.homeItems():G.townItems(tid),abs=(x,y)=>home?[x,y]:[x+X0,y+Y0],rel=it=>home?[it.x,it.y]:[it.x-X0,it.y-Y0];
 const fits=(id,x,y,skip)=>{const [a,b]=abs(x,y);return G.itemFits(id,a,b,skip,home?'home':'town');};
 const TC=t=>{const T=G.T;if(t===T.VOID)return'#000';if(t===T.IWALL||t===T.SWALL)return'#4a3018';if(t===T.WOOD||t===T.STRAW||t===T.STONEF||t===T.CARPET)return'#c9a46a';if(t===T.WATER||t===T.ICE)return'#3b7cc0';if(t===T.HOUSE||t===T.DOOR)return'#8a4a2a';if(t===T.WALL||t===T.CWALL||t===T.TOWER)return'#6a6a70';if(t===T.COBBLE||t===T.PATH||t===T.BRIDGE)return'#b8b0a0';if(t===T.FIELD||t===T.CROP)return'#7a5a30';if(t===T.TREE)return'#2a5a24';if(t===T.SAND)return'#d6c086';if(t===T.SNOW)return'#e8eef4';if(G.SOLIDS[t])return'#5a5a50';return'#5f9440';};
 function size(){cv.width=WW2*cs*devicePixelRatio;cv.height=HH2*cs*devicePixelRatio;cv.style.width=WW2*cs+'px';cv.style.height=HH2*cs+'px';cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
 function draw(){cx.fillStyle='#000';cx.fillRect(0,0,WW2*cs,HH2*cs);for(let y=0;y<HH2;y++)for(let x=0;x<WW2;x++){const a=X0+x,b=Y0+y;const t=G.tileAt(a,b);cx.fillStyle=(!home&&G.townIdAt(a,b)!==tid)?'#2a2a22':TC(t);cx.fillRect(x*cs,y*cs,cs,cs);}
  if(cs>=10){cx.strokeStyle='rgba(0,0,0,.18)';cx.lineWidth=1;cx.beginPath();for(let x=0;x<=WW2;x++){cx.moveTo(x*cs+.5,0);cx.lineTo(x*cs+.5,HH2*cs);}for(let y=0;y<=HH2;y++){cx.moveTo(0,y*cs+.5);cx.lineTo(WW2*cs,y*cs+.5);}cx.stroke();}
  if(home){const HR=G.HR;const dx=HR.door.tx-HR.x0;cx.fillStyle='rgba(60,140,60,.35)';cx.fillRect(dx*cs,(HH2-2)*cs,cs,2*cs);}
  const L=items().slice().sort((p,q)=>((G.SHP[G.FDECO[p.i].sh].l==='f')?-1:0)-((G.SHP[G.FDECO[q.i].sh].l==='f')?-1:0));for(const it of L){if(sel&&sel.mode==='move'&&sel.it===it)continue;const [x,y]=rel(it);G.R2D.drawFurn(cx,it.i,x*cs,y*cs,cs,sel&&sel.mode==='pick'&&sel.it===it?.6:1);if(sel&&sel.mode==='pick'&&sel.it===it){const S=G.SHP[G.FDECO[it.i].sh];cx.strokeStyle='#ffd54a';cx.lineWidth=3;cx.strokeRect(x*cs+1,y*cs+1,S.w*cs-2,S.h*cs-2);}}
  {const px=P.x/32-X0,py=P.y/32-Y0;cx.fillStyle='#2a5aa8';cx.beginPath();cx.arc(px*cs,py*cs,Math.max(3,cs*.22),0,7);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();}
  if(sel&&(sel.mode==='new'||sel.mode==='move')&&sel.x!=null){const id=sel.mode==='new'?sel.id:sel.it.i,S=G.SHP[G.FDECO[id].sh];sel.ok=fits(id,sel.x,sel.y,sel.it);G.R2D.drawFurn(cx,id,sel.x*cs,sel.y*cs,cs,.75);cx.strokeStyle=sel.ok?'#43a047':'#e53935';cx.lineWidth=3;cx.strokeRect(sel.x*cs+1,sel.y*cs+1,S.w*cs-2,S.h*cs-2);}}
 const nm=id=>G.FDECO[id].n;
 function btns(){bb.innerHTML='';const B=(l,f,c)=>{const b=document.createElement('button');b.className='btn'+(c?' '+c:'');b.textContent=l;b.onclick=f;bb.appendChild(b);};
  if(!sel)hint.innerHTML=`Wähle unten ein Stück aus dem Lager und tippe ins Raster – oder tippe ein aufgestelltes Stück an, um es umzustellen oder abzubauen.${home?' Wandstücke kommen an eine Wand.':' Nur innerhalb dieses Dorfs; nichts darf Wege oder Türen versperren.'}`;
  else if(sel.mode==='pick'){hint.innerHTML=`<b>${esc22(nm(sel.it.i))}</b> ausgewählt.`;B('↔ Umstellen',()=>{const [x,y]=rel(sel.it);sel={mode:'move',it:sel.it,x,y};render();});B('📦 Abbauen',()=>{home?G.homeTake(sel.it):G.townTake(sel.it);sel=null;render();});B('Abbrechen',()=>{sel=null;render();});}
  else{const id=sel.mode==='new'?sel.id:sel.it.i;hint.innerHTML=`<b>${esc22(nm(id))}</b>: tippe oder ziehe im Raster an die gewünschte Stelle.${sel.x!=null?(sel.ok?' <span style="color:#2e7d32">✔ passt</span>':' <span style="color:#c62828">✖ hier nicht möglich</span>'):''}`;
   B('✔ Platzieren',()=>{if(sel.x==null||!sel.ok){toast('Wähle zuerst eine freie (grüne) Stelle.','#ff8a80');return;}const [a,b]=abs(sel.x,sel.y);let ok;if(sel.mode==='new')ok=home?G.homePut(sel.id,a,b):G.townPut(sel.id,a,b);else ok=home?G.homeMove(sel.it,a,b):G.townMove(sel.it,a,b);if(ok){const keep=sel.mode==='new'&&P.furn&&P.furn[sel.id]>0?sel.id:null;sel=keep?{mode:'new',id:keep,x:null,y:null}:null;}render();},sel.x!=null&&sel.ok?'':'dim');B('Abbrechen',()=>{sel=null;render();});}}
 function list(){bl.innerHTML='';const ids=Object.keys(P.furn||{}).filter(id=>P.furn[id]>0&&G.FDECO[id]&&!!G.FDECO[id].o===!home);if(!ids.length){bl.innerHTML=`<div class="hint">Nichts Passendes im Lager. ${home?'Möbel verkauft Schreiner Holger':'Dorf-Deko verkauft Gartenkünstlerin Flora'} im Handwerkshof.</div>`;return;}
  ids.sort().forEach(id=>{const e=document.createElement('button');e.className='bitem'+(sel&&sel.mode==='new'&&sel.id===id?' on':'');e.style.cssText='display:flex;align-items:center;gap:4px;padding:3px 6px';e.appendChild(furnPrev(id,34,false));const s=document.createElement('span');s.style.fontSize='12px';s.innerHTML=`${esc22(G.FDECO[id].n)}${P.furn[id]>1?' ×'+P.furn[id]:''}`;e.appendChild(s);e.onclick=()=>{sel={mode:'new',id,x:null,y:null};render();};bl.appendChild(e);});}
 function render(){draw();btns();list();}
 const cell=e=>{const r=cv.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/cs),Math.floor((e.clientY-r.top)/cs)];};
 // v23: frei wischen (1 Finger / Maus ziehen), zoomen (2 Finger / Mausrad), tippen = auswählen bzw. Platz wählen
 const pts=new Map();let mode0=null,moved=0,pinch=null,last=null;cv.style.touchAction='none';
 const zoomAt=(nc,mx,my)=>{const r=wrap.getBoundingClientRect(),lx=mx-r.left,ly=my-r.top,wx=(wrap.scrollLeft+lx)/cs,wy=(wrap.scrollTop+ly)/cs;nc=Math.max(home?14:5,Math.min(56,nc));if(Math.abs(nc-cs)<.01)return;cs=nc;size();render();wrap.scrollLeft=wx*cs-lx;wrap.scrollTop=wy*cs-ly;};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;last={x:e.clientX,y:e.clientY};
  if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),c:cs};mode0='pinch';return;}
  const [x,y]=cell(e);mode0=(sel&&(sel.mode==='new'||sel.mode==='move')&&sel.x!=null&&(()=>{const S=G.SHP[G.FDECO[sel.mode==='new'?sel.id:sel.it.i].sh];return x>=sel.x&&x<sel.x+S.w&&y>=sel.y&&y<sel.y+S.h;})())?'ghost':'pan';});
 cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(mode0==='pinch'&&pts.size>=2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(Math.round(pinch.c*d/pinch.d),(a.x+b.x)/2,(a.y+b.y)/2);return;}
  const dx=e.clientX-last.x,dy=e.clientY-last.y;moved+=Math.abs(dx)+Math.abs(dy);last={x:e.clientX,y:e.clientY};
  if(mode0==='ghost'){const [x,y]=cell(e);if(x!==sel.x||y!==sel.y){sel.x=x;sel.y=y;render();}}else if(mode0==='pan'){wrap.scrollLeft-=dx;wrap.scrollTop-=dy;}});
 const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(mode0==='pinch'){if(pts.size===0)mode0=null;return;}
  if(mode0==='pan'&&moved<8){const [x,y]=cell(e);if(sel&&(sel.mode==='new'||sel.mode==='move')){sel.x=x;sel.y=y;render();}else{const [a,b]=abs(x,y);const it=home?G.homeAt(x,y):G.townAt(a,b);sel=it?{mode:'pick',it}:null;render();}}mode0=null;};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 const center=()=>{const px=(P.x/32-X0)*cs,py=(P.y/32-Y0)*cs;wrap.scrollLeft=px-wrap.clientWidth/2;wrap.scrollTop=py-wrap.clientHeight/2;};
 const zoom=f=>{const r=wrap.getBoundingClientRect();zoomAt(Math.round(cs*f),r.left+wrap.clientWidth/2,r.top+wrap.clientHeight/2);};
 body.querySelector('.zp').onclick=()=>zoom(1.35);body.querySelector('.zm').onclick=()=>zoom(1/1.35);body.querySelector('.me').onclick=center;
 wrap.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.round(cs*(e.deltaY<0?1.15:1/1.15)),e.clientX,e.clientY);},{passive:false});
 size();render();setTimeout(center,30);};
ui.openFurnBox=function(force){const P=G.P;if(!force&&G.room&&G.room.player){ui.openBuild('home');return;}if(!force&&!G.room&&G.hasHammer&&G.hasHammer()&&G.townIdAt(Math.floor(P.x/32),Math.floor(P.y/32))){ui.openBuild('town');return;}
 const W=ov22('📦 Möbellager',460);const ids=Object.keys(P.furn||{}).filter(id=>P.furn[id]>0&&G.FDECO[id]);
 W.body.innerHTML=`<div class="hint">Gekaufte und abgebaute Stücke liegen hier und nehmen keinen Inventarplatz weg. Möbel stellst du im eigenen Haus auf, Außen-Deko in einem befreundeten Dorf – jeweils mit dem Schreinerhammer in der Hand (✋ / Rechtsklick).</div>`;
 if(!ids.length)W.body.insertAdjacentHTML('beforeend','<div class="hint" style="padding:8px">Dein Lager ist leer. Holger (Möbel) und Flora (Dorf-Deko) verkaufen im Handwerkshof.</div>');
 const g=document.createElement('div');g.style.cssText='display:flex;flex-direction:column;gap:6px;margin-top:6px';ids.sort().forEach(id=>{const d=G.FDECO[id],r=document.createElement('div');r.style.cssText='display:flex;gap:8px;align-items:center;padding:5px;background:rgba(255,245,215,.55);border:1px solid #a88a5a;border-radius:6px';r.appendChild(furnPrev(id,48,!d.o));const t=document.createElement('div');t.style.flex='1';t.innerHTML=`<b>${esc22(d.n)}</b>${P.furn[id]>1?' ×'+P.furn[id]:''}<br><small>${d.o?'Außen-Deko':'Möbel'}${d.ex?' · ✨ Einzelstück':''}</small>`;r.appendChild(t);g.appendChild(r);});W.body.appendChild(g);};

// --- Casino „Goldene Krone“: Spielautomat, Blackjack, Casino Hold'em (Originalregeln)
const SUITS=['♠','♥','♦','♣'],RANKS=['2','3','4','5','6','7','8','9','10','B','D','K','A'];// B=Bube, D=Dame, K=König, A=Ass
const shoe=n=>{const d=[];for(let k=0;k<n;k++)for(let s=0;s<4;s++)for(let r=0;r<13;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;};
const cardH=(c,hid)=>hid?'<span class="cd hid">🂠</span>':`<span class="cd" style="color:${c.s===1||c.s===2?'#c62828':'#1a1a1a'}">${RANKS[c.r]}${SUITS[c.s]}</span>`;
const CCSS='<style>.cd{display:inline-block;min-width:34px;padding:8px 4px;margin:2px;background:#fdfaf2;border:1px solid #888;border-radius:6px;font:bold 17px Georgia;text-align:center;box-shadow:0 2px 3px rgba(0,0,0,.3)}.cd.hid{background:#7a1a2a;color:#e8c060}.ctab{background:#1f5a34;border:3px solid #6a3a1a;border-radius:14px;padding:10px;color:#fff;margin:6px 0}.ctab .lb{font-size:12px;opacity:.85}.cbet{display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin:6px 0}</style>';
ui.openCasino=function(game){const P=G.P,T={roulette:'🎡 Roulette',slots:'🎰 Spielautomat',bj:'🂡 Blackjack · Bella',poker:'🃏 Casino Hold’em · Kasimir'}[game];const W=ov22(T,game==='roulette'?560:480);let bet=Math.max(10,Math.min(P.gold||10,Math.round((P.gold||0)*.05/10)*10||10));// v23: kein Höchstlimit – jeder setzt, so viel er will
 const betBar=(cb,dis)=>{const d=document.createElement('div');d.className='cbet';bet=Math.max(1,Math.min(Math.max(1,P.gold),Math.floor(bet)));d.innerHTML=`<span>Einsatz:</span>`;const inp=document.createElement('input');inp.type='number';inp.min=1;inp.max=Math.max(1,P.gold);inp.value=bet;inp.disabled=!!dis;inp.style.cssText='width:110px;font:bold 15px Georgia;padding:3px 6px;border:1px solid #8a6a3a;border-radius:6px';inp.onchange=()=>{bet=Math.max(1,Math.min(Math.max(1,P.gold),Math.floor(+inp.value||1)));cb();};d.appendChild(inp);
  [['½',()=>bet/2],['−10 %',()=>bet*.9],['+10 %',()=>bet*1.1+1],['×2',()=>bet*2],['Alles',()=>P.gold]].forEach(([l,f])=>{const b=document.createElement('button');b.className='btn'+(dis?' dis':'');b.style.padding='3px 8px';b.textContent=l;b.onclick=()=>{if(dis)return;bet=Math.max(1,Math.min(Math.max(1,P.gold),Math.floor(f())));cb();};d.appendChild(b);});d.insertAdjacentHTML('beforeend',`<small style="opacity:.8">Dein Gold: ${GOLDF(P.gold)}</small>`);return d;};
 if(game==='slots'){const SY=['🍒','🍋','🔔','⭐','💎','👑'],WG=[6,5,4,3,2,1],MU=[5,8,12,20,50,100];let reel=['👑','👑','👑'],msg='Drei gleiche Symbole gewinnen. 🍒🍒 = 2×, eine 🍒 = halber Einsatz zurück.',spin=false;
  const roll=()=>{let r=Math.random()*21;for(let i=0;i<6;i++){r-=WG[i];if(r<0)return i;}return 0;};
  const render=()=>{W.body.innerHTML=CCSS+`<div class="ctab" style="text-align:center"><div style="font-size:52px;letter-spacing:10px;background:#2a0a1a;border-radius:10px;padding:8px">${reel.join('')}</div><div style="margin-top:6px">${msg}</div></div><div class="hint">Gewinne (× Einsatz): ${SY.map((s,i)=>s+s+s+' '+MU[i]+'×').join(' · ')}</div>`;W.body.appendChild(betBar(render,spin));const b=document.createElement('button');b.className='btn'+(spin?' dis':'');b.style.cssText='width:100%;font-size:18px;margin-top:6px';b.textContent='🎰 Hebel ziehen';b.onclick=go;W.body.appendChild(b);};
  const go=()=>{if(spin)return;if(!G.casinoBet(bet)){toast('Nicht genug Gold.','#ff8a80');return;}spin=true;G.sfx('click');const res=[roll(),roll(),roll()];let k=0;const iv=setInterval(()=>{k++;reel=reel.map((s,i)=>k>6+i*4?SY[res[i]]:SY[Math.floor(Math.random()*6)]);render();if(k>14){clearInterval(iv);spin=false;let win=0;if(res[0]===res[1]&&res[1]===res[2])win=bet*MU[res[0]];else{const c=res.filter(x=>x===0).length;if(c===2)win=bet*2;else if(c===1)win=Math.floor(bet/2);}
    G.casinoPay(win,win>bet);msg=win>bet?`🎉 Gewinn: ${GOLDF(win)} Gold!`:win>0?`${GOLDF(win)} Gold zurück.`:'Leider nichts. Noch einmal?';if(win>=bet*20)G.sfx('quest');else if(win>bet)G.sfx('coin');render();}},70);};render();return;}

 if(game==='roulette'){// Amerikanisches Roulette: 0, 00 und 1–36. Auszahlung: Zahl 35:1 · Dutzend/Kolonne 2:1 · Rot/Schwarz, Gerade/Ungerade, 1–18/19–36 1:1
  const WH=['0','28','9','26','30','11','7','20','32','17','5','22','34','15','3','24','36','13','1','00','27','10','25','29','12','8','19','31','18','6','21','33','16','4','23','35','14','2'];
  const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);const colN=v=>v==='0'||v==='00'?'#1f7a3a':RED.has(+v)?'#c62828':'#1a1a1a';
  const BETS={};let spin=false,res=null,msg='Setze Chips auf Zahlen oder Felder, dann „Drehen“. Je unwahrscheinlicher der Treffer, desto höher die Auszahlung.',ang=0;
  const OUT={red:['Rot',1,v=>RED.has(+v)],black:['Schwarz',1,v=>+v>0&&!RED.has(+v)&&v!=='00'],even:['Gerade',1,v=>+v>0&&v!=='00'&&+v%2===0],odd:['Ungerade',1,v=>+v>0&&v!=='00'&&+v%2===1],low:['1–18',1,v=>+v>=1&&+v<=18&&v!=='00'],high:['19–36',1,v=>+v>=19],d1:['1. Dutzend',2,v=>+v>=1&&+v<=12&&v!=='00'],d2:['2. Dutzend',2,v=>+v>=13&&+v<=24],d3:['3. Dutzend',2,v=>+v>=25],c1:['Kolonne 1',2,v=>+v>0&&v!=='00'&&+v%3===1],c2:['Kolonne 2',2,v=>+v>0&&v!=='00'&&+v%3===2],c3:['Kolonne 3',2,v=>+v>0&&v!=='00'&&+v%3===0]};
  const payOf=(k,v)=>OUT[k]?(OUT[k][2](v)?OUT[k][1]:-1):(k===v?35:-1);const total=()=>Object.values(BETS).reduce((a,b)=>a+b,0);
  const wheel=()=>{const c=document.createElement('canvas'),S=190,dp=devicePixelRatio||1;c.width=c.height=S*dp;c.style.width=c.style.height=S+'px';const g=c.getContext('2d');g.scale(dp,dp);const R0=S/2-4;g.translate(S/2,S/2);
   g.fillStyle='#5a3418';g.beginPath();g.arc(0,0,R0+3,0,7);g.fill();const n=WH.length;for(let i=0;i<n;i++){const a0=ang+i/n*6.283-Math.PI/2,a1=a0+6.283/n;g.fillStyle=colN(WH[i]);g.beginPath();g.moveTo(0,0);g.arc(0,0,R0,a0,a1);g.fill();g.save();g.rotate((a0+a1)/2);g.fillStyle='#fff';g.font='bold 9px Georgia';g.textAlign='center';g.fillText(WH[i],R0-11,3);g.restore();}
   g.fillStyle='#8a5a2a';g.beginPath();g.arc(0,0,R0*.62,0,7);g.fill();g.fillStyle='#d8a830';g.beginPath();g.arc(0,0,R0*.18,0,7);g.fill();for(let i=0;i<4;i++){g.save();g.rotate(ang+i*Math.PI/2);g.fillStyle='#d8a830';g.fillRect(-2,0,4,R0*.5);g.restore();}
   if(res!=null){const i=WH.indexOf(res),a=ang+(i+.5)/n*6.283-Math.PI/2;g.fillStyle='#fff';g.beginPath();g.arc(Math.cos(a)*(R0-22),Math.sin(a)*(R0-22),5,0,7);g.fill();}
   g.fillStyle='#ffd54a';g.beginPath();g.moveTo(0,-R0-4);g.lineTo(-6,-R0+8);g.lineTo(6,-R0+8);g.fill();return c;};
  const cellS='display:flex;align-items:center;justify-content:center;border:1px solid #d8c890;color:#fff;font:bold 13px Georgia;cursor:pointer;position:relative;min-height:30px;user-select:none';
  const chip=k=>BETS[k]?`<span style="position:absolute;right:1px;top:1px;background:#ffd54a;color:#3b2410;border-radius:9px;font-size:9px;padding:0 3px">${GOLDF(BETS[k])}</span>`:'';
  const render=()=>{W.body.innerHTML=CCSS;const top=document.createElement('div');top.style.cssText='display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center';top.appendChild(wheel());const info=document.createElement('div');info.style.cssText='flex:1;min-width:150px;font-size:13px';info.innerHTML=`${res!=null?`<div style="font-size:26px;font-weight:bold;color:${colN(res)==='#1a1a1a'?'#222':colN(res)}">● ${res}</div>`:''}<div>${msg}</div><div style="margin-top:4px">Gesetzt: <b>${GOLDF(total())}</b> G</div>`;top.appendChild(info);W.body.appendChild(top);
   const tb=document.createElement('div');tb.className='ctab';tb.style.padding='6px';const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:34px repeat(12,1fr) 40px;gap:0';
   const add=(k,label,bg,style)=>{const d=document.createElement('div');d.style.cssText=cellS+';background:'+bg+';'+(style||'');d.innerHTML=label+chip(k);d.onclick=()=>{if(spin)return;if(total()+bet>P.gold){toast('Nicht genug Gold für diesen Einsatz.','#ff8a80');return;}BETS[k]=(BETS[k]||0)+bet;G.sfx('click');render();};d.oncontextmenu=e=>{e.preventDefault();delete BETS[k];render();};grid.appendChild(d);};
   add('0','0','#1f7a3a','grid-row:1/3;grid-column:1');add('00','00','#1f7a3a','grid-row:3/4;grid-column:1');
   for(let row=0;row<3;row++){for(let c=0;c<12;c++){const v=String(c*3+(3-row));add(v,v,colN(v),`grid-row:${row+1};grid-column:${c+2}`);}add('c'+(3-row),'2:1','#1f5a34',`grid-row:${row+1};grid-column:14;font-size:11px`);}
   [['d1',2],['d2',6],['d3',10]].forEach(([k,c],i)=>add(k,(i+1)+'. 12','#1f5a34',`grid-row:4;grid-column:${c}/${c+4}`));
   [['low','1–18'],['even','Gerade'],['red','◆','#c62828'],['black','◆','#1a1a1a'],['odd','Ungerade'],['high','19–36']].forEach(([k,l,bg],i)=>add(k,l,bg||'#1f5a34',`grid-row:5;grid-column:${2+i*2}/${4+i*2};font-size:12px`));
   tb.appendChild(grid);W.body.appendChild(tb);W.body.appendChild(betBar(render,spin));W.body.insertAdjacentHTML('beforeend','<div class="hint">Antippen = Chip in Höhe des Einsatzes setzen (mehrmals möglich), Rechtsklick = Feld leeren. Zahl 35:1 · Dutzend/Kolonne 2:1 · Rot/Schwarz, Gerade/Ungerade, 1–18/19–36 1:1.</div>');
   const row=document.createElement('div');row.className='btns';const B=(l,f,ok)=>{const b=document.createElement('button');b.className='btn'+(ok?'':' dis');b.textContent=l;b.onclick=()=>ok&&f();row.appendChild(b);};B('🎡 Drehen',go,!spin&&total()>0&&total()<=P.gold);B('Einsätze löschen',()=>{for(const k in BETS)delete BETS[k];render();},!spin);W.body.appendChild(row);};
  const go=()=>{const T=total();if(!G.casinoBet(T)){toast('Nicht genug Gold.','#ff8a80');return;}spin=true;res=null;msg='Die Kugel rollt …';const r=WH[Math.floor(Math.random()*WH.length)];let v=.42,k=0;G.sfx('click');
   const iv=setInterval(()=>{ang+=v;v*=.965;k++;if(k%3===0)render();if(v<.006){clearInterval(iv);res=r;spin=false;let pay=0;const hits=[];for(const kk in BETS){const m=payOf(kk,r);if(m>0){pay+=BETS[kk]*(m+1);hits.push((OUT[kk]?OUT[kk][0]:kk)+' '+m+':1');}}
    const net=pay-T;G.casinoPay(pay,net>0);msg=pay?`Treffer: ${hits.join(', ')} · ${net>=0?'+'+GOLDF(net):'−'+GOLDF(-net)} Gold`:`Nichts getroffen · −${GOLDF(T)} Gold`;if(net>0)G.sfx(net>=T*10?'quest':'coin');for(const kk in BETS)delete BETS[kk];render();}},40);render();};
  render();return;}
 if(game==='bj'){let deck=shoe(6),st='bet',hands=[],cur=0,dl=[],msg='Blackjack nach Originalregeln: Der Croupier zieht bis 16 und steht ab 17. Blackjack zahlt 3:2. Verdoppeln auf die ersten zwei Karten, einmal Teilen bei Paaren.';
  const cv=c=>c.r===12?11:c.r>=8?10:c.r+2;const draw=()=>{if(deck.length<52)deck=shoe(6);return deck.pop();};const val=h=>{let v=0,a=0;for(const c of h){const r=c.r;v+=r===12?11:r>=8?10:r+2;if(r===12)a++;}while(v>21&&a){v-=10;a--;}return v;};const bj=h=>h.length===2&&val(h)===21;
  const render=()=>{let h=CCSS+`<div class="ctab"><div class="lb">Croupière Bella ${st==='play'?'':'· '+val(dl)}</div><div>${dl.map((c,i)=>cardH(c,st==='play'&&i===1)).join('')}</div>`;hands.forEach((H,i)=>{h+=`<div class="lb" style="margin-top:8px">${hands.length>1?'Hand '+(i+1)+' ':'Deine Hand '}· ${val(H.c)}${H.dbl?' · verdoppelt':''}${i===cur&&st==='play'?' ◀':''}</div><div>${H.c.map(c=>cardH(c)).join('')}</div>`;});h+=`<div style="margin-top:8px">${msg}</div></div>`;W.body.innerHTML=h;
   if(st==='bet'||st==='done'){W.body.appendChild(betBar(render));const b=document.createElement('button');b.className='btn';b.style.cssText='width:100%;font-size:17px';b.textContent='🂡 Karten geben';b.onclick=deal;W.body.appendChild(b);}
   else{const row=document.createElement('div');row.className='btns';const B=(l,f,ok)=>{const b=document.createElement('button');b.className='btn'+(ok?'':' dis');b.textContent=l;b.onclick=()=>ok&&f();row.appendChild(b);};const H=hands[cur];
    B('Karte',hit,true);B('Stehen',stand,true);B('Verdoppeln',dbl,H.c.length===2&&P.gold>=H.b);B('Teilen',split,hands.length===1&&H.c.length===2&&cv(H.c[0])===cv(H.c[1])&&P.gold>=H.b);W.body.appendChild(row);}};
  const deal=()=>{if(!G.casinoBet(bet)){toast('Nicht genug Gold.','#ff8a80');return;}hands=[{c:[draw(),draw()],b:bet}];dl=[draw(),draw()];cur=0;st='play';msg='';G.sfx('click');
   if(bj(hands[0].c)||bj(dl)){finish();return;}render();};
  const hit=()=>{const H=hands[cur];H.c.push(draw());G.sfx('click');if(val(H.c)>=21)next();else render();};
  const stand=()=>next();
  const dbl=()=>{const H=hands[cur];if(!G.casinoBet(H.b))return;H.b*=2;H.dbl=1;H.c.push(draw());next();};
  const split=()=>{const H=hands[0];if(!G.casinoBet(H.b))return;const ace=H.c[0].r===12;hands=[{c:[H.c[0],draw()],b:H.b,ace},{c:[H.c[1],draw()],b:H.b,ace}];if(ace){finish();return;}render();};
  const next=()=>{if(cur<hands.length-1){cur++;render();}else finish();};
  const finish=()=>{st='done';const allBust=hands.every(H=>val(H.c)>21);const pBJ=hands.length===1&&bj(hands[0].c);if(!allBust&&!pBJ)while(val(dl)<17)dl.push(draw());const dv=val(dl),dBJ=bj(dl);let pay=0,net=0;const out=[];
   for(const H of hands){const pv=val(H.c);let r;if(pv>21)r=0;else if(hands.length===1&&bj(H.c)&&!dBJ)r=H.b*2.5;else if(dBJ&&!(hands.length===1&&bj(H.c)))r=0;else if(dv>21||pv>dv)r=H.b*2;else if(pv===dv)r=H.b;else r=0;pay+=r;net+=r-H.b;out.push(r>H.b?'gewonnen':r===H.b?'unentschieden':'verloren');}
   G.casinoPay(pay,net>0);msg=(pBJ&&!dBJ?'♠ BLACKJACK! ':dBJ?'Die Croupière hat Blackjack. ':'')+`Croupière: ${dv>21?'überkauft':dv} · ${out.join(' / ')} · ${net>0?'+'+GOLDF(net):net<0?'−'+GOLDF(-net):'±0'} Gold`;if(net>0)G.sfx('coin');render();};render();return;}
 if(game==='poker'){let st='bet',ph=[],dh=[],bd=[],ante=bet,msg='Casino Hold’em nach Originalregeln: Du setzt die Ante und bekommst 2 Karten, dazu kommt der Flop. Dann gibst du auf oder gehst mit (2× Ante). Der Croupier qualifiziert sich ab einem Paar Vieren.';
  const HN=['Höchste Karte','Paar','Zwei Paare','Drilling','Straße','Flush','Full House','Vierling','Straight Flush','Royal Flush'],AP=[1,1,1,1,1,2,3,10,20,100];
  const ev5=c=>{const r=c.map(x=>x.r).sort((a,b)=>b-a),fl=c.every(x=>x.s===c[0].s);const cnt={};r.forEach(x=>cnt[x]=(cnt[x]||0)+1);const grp=Object.entries(cnt).map(([k,v])=>[v,+k]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);let u=[...new Set(r)],strTop=-1;if(u.length===5){if(u[0]-u[4]===4)strTop=u[0];else if(u.join()==='12,3,2,1,0')strTop=3;}
   let cat;if(strTop>=0&&fl)cat=strTop===12?9:8;else if(grp[0][0]===4)cat=7;else if(grp[0][0]===3&&grp[1][0]===2)cat=6;else if(fl)cat=5;else if(strTop>=0)cat=4;else if(grp[0][0]===3)cat=3;else if(grp[0][0]===2&&grp[1][0]===2)cat=2;else if(grp[0][0]===2)cat=1;else cat=0;
   const kick=strTop>=0?[strTop]:grp.map(g=>g[1]);return [cat].concat(kick);};
  const best=c=>{let b=null;for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){const h=c.filter((_,k)=>k!==i&&k!==j),v=ev5(h);if(!b||cmp(v,b)>0)b=v;}return b;};const cmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;};
  let deck=[];const render=()=>{let h=CCSS+`<div class="ctab"><div class="lb">Croupier Kasimir</div><div>${dh.map(c=>cardH(c,st!=='done')).join('')||'&nbsp;'}</div><div class="lb" style="margin-top:8px">Tisch</div><div>${bd.map(c=>cardH(c)).join('')||'&nbsp;'}</div><div class="lb" style="margin-top:8px">Deine Karten</div><div>${ph.map(c=>cardH(c)).join('')||'&nbsp;'}</div><div style="margin-top:8px">${msg}</div></div>`;W.body.innerHTML=h;
   if(st==='bet'||st==='done'){W.body.appendChild(betBar(render));W.body.insertAdjacentHTML('beforeend',`<div class="hint">Ante-Bonus: ${HN.slice(4).map((n,i)=>n+' '+AP[i+4]+':1').join(' · ')}</div>`);const b=document.createElement('button');b.className='btn';b.style.cssText='width:100%;font-size:17px';b.textContent='🃏 Ante setzen & geben';b.onclick=deal;W.body.appendChild(b);}
   else{const row=document.createElement('div');row.className='btns';const B=(l,f,ok)=>{const b=document.createElement('button');b.className='btn'+(ok?'':' dis');b.textContent=l;b.onclick=()=>ok&&f();row.appendChild(b);};B(`Mitgehen (${GOLDF(ante*2)} G)`,call,P.gold>=ante*2);B('Aufgeben',fold,true);W.body.appendChild(row);}};
  const deal=()=>{if(!G.casinoBet(bet)){toast('Nicht genug Gold.','#ff8a80');return;}ante=bet;deck=shoe(1);ph=[deck.pop(),deck.pop()];dh=[deck.pop(),deck.pop()];bd=[deck.pop(),deck.pop(),deck.pop()];st='play';msg=`Flop liegt. Du hast: ${HN[ev5(ph.concat(bd))[0]]}`;G.sfx('click');render();};
  const fold=()=>{st='done';msg=`Aufgegeben – die Ante (${GOLDF(ante)} G) ist weg.`;G.casinoPay(0,false);render();};
  const call=()=>{if(!G.casinoBet(ante*2))return;bd.push(deck.pop(),deck.pop());const pv=best(ph.concat(bd)),dv=best(dh.concat(bd));const qual=dv[0]>=2||(dv[0]===1&&dv[1]>=2);let pay=0;
   if(!qual){pay=ante+ante*AP[pv[0]]+ante*2;msg=`Der Croupier qualifiziert sich nicht (${HN[dv[0]]}). Ante zahlt ${AP[pv[0]]}:1, Mitgehen ist ein Unentschieden.`;}
   else{const c=cmp(pv,dv);if(c>0){pay=ante+ante*AP[pv[0]]+ante*4;msg=`Gewonnen! ${HN[pv[0]]} schlägt ${HN[dv[0]]}.`;}else if(c<0){pay=0;msg=`Verloren: ${HN[dv[0]]} schlägt dein ${HN[pv[0]]}.`;}else{pay=ante*3;msg=`Unentschieden (${HN[pv[0]]}).`;}}
   const net=pay-ante*3;G.casinoPay(pay,net>0);msg+=` · ${net>0?'+'+GOLDF(net):net<0?'−'+GOLDF(-net):'±0'} Gold`;st='done';if(net>0)G.sfx('coin');render();};render();}};

window.__ui={enterGame,cutscene,get state(){return state;},applyMode,openChar,setLook:l=>{Object.assign(charLook,l);buildChar();}};
})();
