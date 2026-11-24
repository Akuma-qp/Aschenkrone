'use strict';
(function(){
const G=window.G,$=id=>document.getElementById(id),TILE=G.TILE,RAR=G.RAR;
const ui=G.ui={dlgNpc:null};
let state='menu',invOpen=false,invMode='normal',invSel=null,helpOpen=false,pauseOpen=false,setOpen=false,chatNpc=null,discardArm=false;
G.paused=()=>state!=='game'||(typeof furnOpen!=='undefined'&&(furnOpen||buildOpen))||(typeof mapOpen!=='undefined'&&mapOpen)||(typeof travelOpen!=='undefined'&&travelOpen)||invOpen||helpOpen||pauseOpen||setOpen||!!ui.dlgNpc||!!chatNpc||(G.P&&G.P.dead);
const c2d=$('c2d'),ctx=c2d.getContext('2d'),c3d=$('c3d');
let VW=1,VH=1,DPR=1,use3d=false;
let RS=1,rsT=0;const qPR=()=>{const d=window.devicePixelRatio||1,q=G.settings.quality;let pr={low:Math.min(d,1.5),mid:Math.min(d,2),high:Math.min(d,2.5)}[q]||1;const px=Math.max(1,innerWidth*innerHeight),bud={low:1.3e6,mid:2.6e6,high:3.9e6}[q]||2.6e6;pr=Math.min(pr,Math.sqrt(bud/px));return Math.max(.5,pr)*RS;};
function resize(){VW=innerWidth;VH=innerHeight;DPR=Math.min(window.devicePixelRatio||1,2);c2d.width=Math.round(VW*DPR);c2d.height=Math.round(VH*DPR);c2d.style.width=VW+'px';c2d.style.height=VH+'px';if(use3d)G.R3D.resize(VW,VH,qPR());}
addEventListener('resize',resize);
function applyMode(){if(G.settings.mode==='3d'&&!G.R3D.ok){if(!G.R3D.init(c3d)){G.settings.mode='2d';G.saveSettings();toast('3D wird auf diesem Gerät nicht unterstützt. 2D ist aktiv.','#ff8a80');}}
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
function itemHTML(it,k){if(it.stack){const s=G.STACK[it.id];return `<div class="ih">${s.name} ×${it.count}</div><div class="isub">${s.desc}</div>`+(shopId&&s.sell?`<div class="isub">Verkaufswert: ${G.sellPrice(it)} Gold</div>`:'');}
 const c=cmpFor(it,k);let h='<div class="cmp">';
 if(c)h+=`<div class="ccol cur"><div class="ctag">Angelegt</div>${head(c)}${statTable(c,null)}</div>`;
 h+=`<div class="ccol"><div class="ctag">${c?'Ausgewählt':'Gegenstand'}</div>${head(it)}${statTable(it,c)}</div></div>`;
 if(it.kind)h+=`<div class="isub">${G.WKIND[it.kind].sp}</div>`;
 if(it.set){const S=G.SETS[it.set],n=(G.S&&G.S.sets&&G.S.sets[it.set])||0;h+=`<div class="iset" style="border-color:${S.c}"><b>${S.n}-Rüstung</b> (${n}/4 angelegt) · 2 Teile: <span style="color:${n>=2?'#1b5e20':'#8a7a60'}">${S.b2}</span> · 4 Teile: <span style="color:${n>=4?'#1b5e20':'#8a7a60'}">${S.b4}</span></div>`;}
 if(it.uniq||it.ud)h+=`<div class="isub" style="color:#c25a00;font-weight:bold">★ Einzigartig${it.ud?': '+it.ud:''}</div>`;
 if(it.boss&&G.BOSSES[it.boss])h+=`<div class="isub" style="color:#8b0000">☠ Boss-Beute: ${G.BOSSES[it.boss].n}</div>`;else if(it.src)h+=`<div class="isub">Herkunft: ${it.src}</div>`;
 if(shopId)h+=`<div class="isub">Verkaufswert: <b>${G.sellPrice(it)} Gold</b></div>`;return h;}
// ---- Shop
function renderShop(){const el=$('shopBar');if(!shopId){el.style.display='none';return;}el.style.display='block';const sh=G.SHOPS[shopId],P=G.P;
 let h=`<div class="tabs"><button data-t="buy" class="${shopTab==='buy'?'on':''}">🛒 Kaufen</button><button data-t="sell" class="${shopTab==='sell'?'on':''}">💰 Verkaufen</button>${sh.smith?`<button data-t="gear" class="${shopTab==='gear'?'on':''}">⚔ Ausrüstung</button><button data-t="forge" class="${shopTab==='forge'?'on':''}">⚒ Umschmieden</button>`:''}</div>`;
 if(shopTab==='buy'){h+='<div class="shopL">';sh.items.forEach(id=>{const s=G.STACK[id],n=s.pack||1,pr=s.price*n;h+=`<div class="shopI" data-id="${id}"><span class="slot sm" style="background-image:url(${G.icon(G.mkStack(id,n)).url})"></span><span class="sn">${s.name}${n>1?' ×'+n:''}<small>${s.desc}</small></span><button class="btn ${P.gold<pr?'dis':''}">${pr} G</button></div>`;});h+='</div>';}
 else if(shopTab==='gear'){const st=G.smithStock();h+='<div class="hint">Neue Ware jeden Morgen und bei jedem Stufenaufstieg. Nur Ausrüstung für deine Stufe.</div><div class="shopL">';if(!st.length)h+='<div class="hint">Ausverkauft. Komm morgen wieder.</div>';st.forEach((it,i)=>{h+=`<div class="shopI gear" data-i="${i}"><span class="slot sm" style="background-image:url(${G.icon(it).url});border-color:${G.RAR[it.rarity].c}"></span><span class="sn" style="color:${G.RAR[it.rarity].d}">${G.iname(it)}<small>${G.RAR[it.rarity].n} · Stufe ${G.reqLvl(it)}${it.dmg?' · '+it.dmg+' Schaden':''}${it.def?' · '+it.def+' Rüstung':''}</small></span><button class="btn ${P.gold<it.shopPrice?'dis':''}">${it.shopPrice} G</button></div>`;});h+='</div>';}
 else if(shopTab==='sell')h+='<div class="hint">Tippe einen Gegenstand an, um ihn zu verkaufen. <b>Shift+Klick</b>, Rechtsklick oder „☑ Markieren“ wählt mehrere aus, die du gesammelt verkaufen kannst.</div>';
 else h+='<div class="hint">Wähle eine Waffe, Rüstung oder Schmuck. Umschmieden gibt einen zufälligen Zusatz wie <i>Scharf</i>, <i>Schnell</i> oder <i>Legendär</i> (Waffen) bzw. <i>Wehrhaft</i> (Rüstung und Schmuck). Der alte Zusatz geht dabei verloren.</div>';
 el.innerHTML=h;el.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{shopTab=b.dataset.t;invSel=null;forgeK=null;marked.clear();renderInv();});
 el.querySelectorAll('.shopI.gear').forEach(r=>{const i=+r.dataset.i;r.querySelector('.sn').onclick=()=>{const it=G.smithStock()[i];if(it)$('itemInfo').innerHTML=itemHTML(it,null);};r.querySelector('button').onclick=()=>{if(G.buyGear(i)){toast('⚔ Gekauft!','#ffd54a');renderInv();}};});
 el.querySelectorAll('.shopI:not(.gear)').forEach(r=>r.querySelector('button').onclick=()=>{const id=r.dataset.id,s=G.STACK[id],n=s.pack||1;if(G.buy(id,n,s.price*n))renderInv();});}
ui.openShop=(id,tab)=>{shopId=id;shopTab=tab||'buy';openInv('shop');};
// ---- Info unten (feste Höhe)
function renderInfo(){if(!invOpen)return;const P=G.P,info=$('itemInfo');const k=hoverK&&getS(hoverK)?hoverK:invSel;
 if(!k||!getS(k)){let t=shopId?(shopTab==='forge'?'Wähle einen Gegenstand zum Umschmieden.':shopTab==='sell'?'Wähle Gegenstände zum Verkaufen.':'Kaufe oben, oder wechsle zu „Verkaufen“.'):(pcMode?'Klicke einen Gegenstand an, um ihn auszuwählen. Zum Verschieben ziehst du ihn mit gedrückter Maustaste auf einen anderen Platz.':'Tippe einen Gegenstand an, um ihn auszuwählen. Zum Verschieben hältst du ihn kurz gedrückt und ziehst ihn auf einen anderen Platz.')+(pcMode?' Fahre mit der Maus darüber, um ihn mit deiner Ausrüstung zu vergleichen. Shift+Klick markiert mehrere.':'');
  info.innerHTML=`<div class="hint">${t}</div>`;return;}
 const it=getS(k);info.innerHTML=itemHTML(it,k)+(k===invSel?'<div class="btns" id="ib"></div>':'<div class="hint" style="margin-top:4px">Klicken für Aktionen</div>');
 if(k!==invSel)return;const ib=$('ib');const inEq=k[0]==='e',idx=inEq?-1:+k.slice(1);
 const btn=(l,f,cls)=>{const b=document.createElement('button');b.className='btn'+(cls?' '+cls:'');b.textContent=l;b.addEventListener('click',f);ib.appendChild(b);};
 if(shopId&&shopTab==='forge'&&!it.stack){const c=G.reforgeCost(it);btn(`⚒ Umschmieden: ${c} Gold`,()=>{if(P.gold<c){toast('Nicht genug Gold','#ff8a80');return;}P.gold-=c;const old=it.pre;let n;do n=G.rollPre(it);while(n===old&&Math.random()<.7);it.pre=n;G.sfx('hit');G.sfx('coin');const p=G.PRE[n];toast(`⚒ ${G.iname(it)}`,p.best?'#ffd54a':p.dmg<0||p.def<0||p.spd<0||p.mspd<0?'#ff8a80':'#a5d6a7',!!p.best);G.invDirty=true;renderInv();});return;}
 if(shopId){const pr=G.sellPrice(it);if(pr>0)btn(`💰 Verkaufen: ${pr} Gold`,()=>{P.gold+=pr;setS(k,null);invSel=null;G.sfx('coin');toast(`+${pr} Gold`,'#ffd54a');renderInv();});else ib.insertAdjacentHTML('beforeend','<small>Das kauft hier niemand.</small>');}
 if(it.type==='food')btn('Benutzen',()=>{G.useItem(idx);if(!P.inv[idx])invSel=null;renderInv();});
 if(!shopId){btn(moveArm?'↔ Ziel antippen …':'↔ Verschieben',()=>{moveArm=!moveArm;renderInv();});if(!inEq&&idx>=9&&!it.stack||(!inEq&&idx>=9&&it.type!=='furn')){btn('⬇ In die Hotbar',()=>{let t=-1;for(let i=0;i<9;i++)if(!P.inv[i]){t=i;break;}if(t<0)t=P.sel;moveSlot(k,'i'+t);renderInv();});}}
 if(it.type==='furn'&&!inEq)btn(G.room&&G.room.player?'🏠 Aufstellen (Feld vor dir)':'🏠 Aufstellen (nur im eigenen Haus)',()=>{if(G.placeFurn(idx)){invSel=null;closeInv();}else renderInv();});
 if(it.id==='hammer')btn('📦 Möbellager öffnen',()=>{closeInv();ui.openFurnBox();});
 if(it.id==='hammer'&&idx>=9)btn('In die Hand nehmen',()=>{const o=P.inv[P.sel];P.inv[P.sel]=it;P.inv[idx]=o;invSel=null;G.invDirty=true;renderInv();});
 if(!inEq&&!shopId&&(it.type==='furn'||it.type==='tool'))btn('🗑 Wegwerfen',()=>{if(!confirmDrop){confirmDrop=k;toast('Nochmal tippen zum Wegwerfen','#ffcc80');return;}confirmDrop=null;setS(k,null);invSel=null;G.sfx('click');renderInv();},'warn');
 if(!inEq&&P.eq[it.type]!==undefined)btn('Anlegen',()=>{if(!lvOK(it)){toast(`Benötigt Stufe ${G.reqLvl(it)}`,'#ff8a80');return;}const old=P.eq[it.type];P.eq[it.type]=it;P.inv[idx]=old;invSel=null;G.invDirty=true;renderInv();});
 if(it.type==='weapon'){if(idx>=9)btn('In die Hand nehmen',()=>{const o=P.inv[P.sel];P.inv[P.sel]=it;P.inv[idx]=o;invSel=null;G.invDirty=true;renderInv();});else if(idx>=0&&idx!==P.sel)btn('In die Hand nehmen',()=>{P.sel=idx;invSel=null;G.invDirty=true;renderInv();});}
 if(inEq)btn('Ablegen',()=>{const f=freeBag();if(!f){toast('Kein Platz im Rucksack','#ff8a80');return;}setS(f,it);setS(k,null);invSel=null;renderInv();});
 if(!shopId)btn(discardArm?'Wirklich wegwerfen?':'Wegwerfen',()=>{if(!discardArm){discardArm=true;renderInfo();return;}discardArm=false;setS(k,null);invSel=null;renderInv();},'red');}
function renderMarks(){const el=$('markBar'),P=G.P;for(const k of [...marked])if(!getS(k))marked.delete(k);
 let h=`<button class="btn sm ${markMode?'on':''}" id="mkM">☑ Markieren${markMode?' (an)':''}</button>`;
 if(marked.size){const val=[...marked].reduce((a,k)=>a+G.sellPrice(getS(k)),0);h+=`<span class="mkn">${marked.size} markiert</span>`;if(shopId)h+=`<button class="btn sm" id="mkS">💰 Alle verkaufen (${val} G)</button>`;else h+=`<button class="btn sm red" id="mkD">${discardArm?'Wirklich alle wegwerfen?':'🗑 Alle wegwerfen'}</button>`;h+=`<button class="btn sm" id="mkC">✕</button>`;}
 el.innerHTML=h;$('mkM').onclick=()=>{markMode=!markMode;if(!markMode)marked.clear();invSel=null;renderInv();};
 if($('mkC'))$('mkC').onclick=()=>{marked.clear();markMode=false;renderInv();};
 if($('mkS'))$('mkS').onclick=()=>{let g=0;for(const k of marked){g+=G.sellPrice(getS(k));setS(k,null);}P.gold+=g;marked.clear();G.sfx('coin');toast(`+${g} Gold`,'#ffd54a');renderInv();};
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
function setInvTab(t){invTab=t;document.querySelectorAll('#invTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('qBook').style.display=t==='quest'?'block':'none';$('skBook').style.display=t==='skill'?'block':'none';document.querySelector('#inv .invWrap').style.display=t!=='inv'?'none':'';if(t==='quest')renderQBook();if(t==='skill')renderSkills();$('stBook').style.display=t==='stat'?'block':'none';if(t==='stat')renderStats();}
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
function openInv(mode){if(G.P.dead)return;closeDialog();if(mode!=='shop')shopId=null;invMode=mode||'normal';invOpen=true;$('invTabs').style.display=mode==='shop'?'none':'flex';setInvTab('inv');skBadge();invSel=null;hoverK=null;marked.clear();markMode=false;G.attackHeld=false;$('inv').classList.add('show');renderInv();}
function closeInv(){invOpen=false;invSel=null;shopId=null;marked.clear();markMode=false;$('inv').classList.remove('show');G.invDirty=true;}
ui.openInv=openInv;
$('invClose').addEventListener('click',closeInv);document.querySelectorAll('#invTabs button').forEach(b=>b.addEventListener('click',()=>setInvTab(b.dataset.t)));$('inv').addEventListener('click',e=>{if(e.target.id==='inv')closeInv();});
// ===================== Dialog =====================
function openDialog(n){ui.dlgNpc=n;G.attackHeld=false;renderDialog();}
ui.openDialog=openDialog;
let lastSpoken='';
ui.showText=(n,t,b)=>{ui.dlgNpc=n;ui._custom={t,b:b||[]};};
function renderDialog(){const n=ui.dlgNpc;if(!n)return;G.S=G.calc();const cu=ui._custom;ui._custom=null;const d=cu||G.npcDialog(n),el=$('dialog');if(d.t!==lastSpoken){lastSpoken=d.t;G.voice&&G.voice.speak(n,d.t);}el.innerHTML=`<div class="dn">${n.name}</div><div class="dt"></div><div class="btns"></div>`;el.querySelector('.dt').textContent=d.t;const bb=el.querySelector('.btns');
 const add=(l,f,cls)=>{const e=document.createElement('button');e.className='btn'+(cls?' '+cls:'');e.textContent=l;e.addEventListener('click',f);bb.appendChild(e);};
 const SERV=/Handeln|Ausrüstung|Schmiede|Heile mich|→|Gold|Hammer|Saat|Später|Geschenk|Kopfgeld|Gefängnis|Fliehen|Möbel/;const isQ=b=>b.q||!SERV.test(b.l);const qb=d.b.filter(isQ),sb=d.b.filter(b=>!isQ(b));
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
$('bHelp').addEventListener('click',openHelp);
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
 const row=(lab,k,opts)=>{const d=document.createElement('div');d.className='crow';d.innerHTML=`<span>${lab}</span>`;const w=document.createElement('div');w.className='cops';const isCol=opts.length&&typeof opts[0]==='string'&&opts.some(o=>/^#/.test(o));if(isCol){const pk=document.createElement('label');pk.className='cpick';const cur=/^#/.test(charLook[k]||'')?charLook[k]:'#888888';pk.innerHTML=`<input type="color" value="${cur}"><span style="background:${charLook[k]==='none'?'transparent':cur}"></span>🎨`;const inp=pk.querySelector('input');inp.addEventListener('input',()=>{charLook[k]=inp.value;pk.querySelector('span').style.background=inp.value;});inp.addEventListener('change',()=>buildChar());w.appendChild(pk);}
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
const CUTS={intro:[['night','Eldmar, im Jahr des Aschenwinters. Seit Generationen schlief der Feuerdrache Ignarok tief in den Aschenbergen.'],
 ['battle','Als er erwachte, ritten die Ritter der Silberwacht gegen ihn. Du warst einer von ihnen. Am Aschenpass stelltest du dich dem Drachen … und fielst.'],
 ['valhalla','Doch die Walküren verwehrten dir den Einzug nach Walhall. „Dein Werk ist unvollendet“, sprachen sie. „Kehre zurück, bis deine Klinge den Drachen bezwungen hat.“'],
 ['raid','Vor drei Nächten fiel Ignarok über das Dorf Eichenhain her. Er brannte die Felder nieder und entführte Prinzessin Elara, die Tochter von Fürst Aldric.'],
 ['dawn','Am Flussufer vor Eichenhain erwachst du, ohne Rüstung und nur mit einem rostigen Schwert. Die Heilerin Mara hat dich gefunden. Hier beginnt dein Weg nach Walhall.']],
 outro:[['victory','Ignarok ist gefallen. Prinzessin Elara ist heimgekehrt, und in Eichenhain läuten die Glocken die ganze Nacht.'],
 ['gates','In jener Nacht öffneten sich die Tore Walhalls für dich. Doch du bliebst. Solange Monster durch Eldmar ziehen, braucht diese Welt ihren Ritter.'],
 ['dawn','Ende der Hauptgeschichte. Du kannst weiterspielen, Bosse jagen, mythische Beute finden und Ignarok erneut herausfordern.']]};
let cs=null;
function cutscene(id,cb){state='cutscene';show('menu',0);$('hud').style.display='none';c3d.style.display='none';closeDialog();closeChat();cs={list:CUTS[id],i:0,t:0,chars:0,hold:0,cb,shown:''};show('cs',1);}
function csNext(){cs.i++;cs.t=0;cs.chars=0;cs.hold=0;if(cs.i>=cs.list.length)csEnd();}
function csEnd(){if(!cs)return;const cb=cs.cb;cs=null;show('cs',0);$('csText').textContent='';cb&&cb();}
$('cs').addEventListener('click',e=>{if(!cs||e.target.id==='csSkip')return;const txt=cs.list[cs.i][1];if(cs.chars<txt.length)cs.chars=txt.length;else csNext();});
$('csSkip').addEventListener('click',e=>{e.stopPropagation();csEnd();});
function sky(g,w,h,st){const gr=g.createLinearGradient(0,0,0,h);st.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);}
function hills(g,w,h,y0,amp,col,seed,sc){g.fillStyle=col;g.beginPath();g.moveTo(0,h);for(let i=0;i<=40;i++){const x=i/40*w;g.lineTo(x,y0-G.noise(i/40*(sc||5),seed,seed)*amp);}g.lineTo(w,h);g.closePath();g.fill();}
function stars(g,w,h,t){for(let i=0;i<70;i++){const x=G.h2(i,1,7)*w,y=G.h2(i,2,7)*h*.55;g.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.5+i));g.fillStyle='#fff';g.fillRect(x,y,1.6,1.6);}g.globalAlpha=1;}
function dragon(g,x,y,s,f,col){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.beginPath();g.ellipse(0,0,40,13,0,0,7);g.fill();g.beginPath();g.moveTo(28,-5);g.quadraticCurveTo(55,-22,72,-15);g.lineTo(84,-10);g.lineTo(70,-5);g.quadraticCurveTo(52,-5,34,7);g.fill();
 g.beginPath();g.moveTo(-35,-4);g.quadraticCurveTo(-72,-12,-98,8);g.lineTo(-104,3);g.lineTo(-95,15);g.quadraticCurveTo(-66,4,-35,7);g.fill();
 g.beginPath();g.moveTo(-14,-6);g.lineTo(-38,-10-62*f);g.lineTo(-6,-6-42*f);g.lineTo(16,-12-72*f);g.lineTo(20,-4);g.fill();g.restore();}
function knight(g,x,y,s,o){o=o||{};g.save();g.translate(x,y);g.scale(s,s);if(o.rot)g.rotate(o.rot);g.fillStyle=o.col||'#07070d';
 g.fillRect(-9,-30,7,30);g.fillRect(2,-30,7,30);g.beginPath();g.moveTo(-13,-30);g.lineTo(13,-30);g.lineTo(11,-62);g.lineTo(-11,-62);g.fill();
 g.beginPath();g.moveTo(-12,-60);g.quadraticCurveTo(-28,-30,-24,-2);g.lineTo(-8,-30);g.fill();g.beginPath();g.arc(0,-71,9.5,0,7);g.fill();g.beginPath();g.moveTo(-2,-80);g.quadraticCurveTo(10,-96,18,-84);g.lineTo(2,-78);g.fill();
 g.save();g.translate(11,-58);g.rotate(o.up?-2.6:-.25);g.fillRect(-2.5,0,5,20);g.fillRect(-1.6,20,3.2,42);g.fillRect(-8,18,16,3.5);g.restore();g.restore();}
function lady(g,x,y,s,col){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.beginPath();g.moveTo(-18,0);g.lineTo(18,0);g.lineTo(7,-48);g.lineTo(-7,-48);g.fill();g.fillRect(-7,-60,14,14);g.beginPath();g.arc(0,-66,8,0,7);g.fill();g.beginPath();g.moveTo(-7,-73);g.lineTo(-7,-80);g.lineTo(-3,-76);g.lineTo(0,-82);g.lineTo(3,-76);g.lineTo(7,-80);g.lineTo(7,-73);g.fill();g.restore();}
function valk(g,x,y,s,t,col){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;const f=Math.sin(t*2)*.15;for(const sd of [-1,1]){g.save();g.scale(sd,1);g.rotate(f);g.beginPath();g.moveTo(4,-55);g.quadraticCurveTo(60,-110,75,-40);g.quadraticCurveTo(45,-60,4,-35);g.fill();g.restore();}knight(g,0,0,1,{up:true,col});g.restore();}
function village(g,w,h,y0,s,col,lit,t){g.fillStyle=col;for(let i=0;i<9;i++){const x=w*(.08+i*.11),hh=(18+G.h2(i,3,3)*16)*s,ww=(26+G.h2(i,4,3)*14)*s;g.fillRect(x,y0-hh,ww,hh);g.beginPath();g.moveTo(x-4*s,y0-hh);g.lineTo(x+ww/2,y0-hh-16*s);g.lineTo(x+ww+4*s,y0-hh);g.fill();if(lit){g.fillStyle=`rgba(255,200,90,${.6+Math.sin(t*3+i)*.2})`;g.fillRect(x+ww*.35,y0-hh*.6,5*s,6*s);g.fillStyle=col;}}
 const cx=w*.52;g.beginPath();g.moveTo(cx-90*s,y0);g.quadraticCurveTo(cx,y0-70*s,cx+90*s,y0);g.fill();g.fillRect(cx-40*s,y0-110*s,80*s,70*s);for(let i=0;i<5;i++)g.fillRect(cx-40*s+i*18*s,y0-120*s,10*s,12*s);for(const sd of [-1,1]){g.fillRect(cx+sd*48*s-10*s,y0-130*s,20*s,90*s);g.beginPath();g.moveTo(cx+sd*48*s-14*s,y0-130*s);g.lineTo(cx+sd*48*s,y0-158*s);g.lineTo(cx+sd*48*s+14*s,y0-130*s);g.fill();}}
function fireGlow(g,x,y,r,t,a){const gr=g.createRadialGradient(x,y,0,x,y,r*(1+Math.sin(t*9+x)*.06));gr.addColorStop(0,`rgba(255,170,60,${a})`);gr.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=gr;g.fillRect(x-r*1.2,y-r*1.2,r*2.4,r*2.4);}
function embers(g,w,h,t,n){for(let i=0;i<n;i++){const x=(G.h2(i,5,9)*w+Math.sin(t+i)*20)%w,y=h-((t*40*(.5+G.h2(i,6,9))+G.h2(i,7,9)*h)%h);g.fillStyle=`rgba(255,${150+i%80},60,${.5+G.h2(i,8,9)*.5})`;g.fillRect(x,y,2.5,2.5);}}
const SCN={
 menu(g,w,h,t){sky(g,w,h,[[0,'#141a3a'],[.55,'#4a3a6a'],[.8,'#c06a4a'],[1,'#2a1a10']]);stars(g,w,h,t);hills(g,w,h,h*.72,h*.12,'#2a2238',3,4);const s=Math.min(w,h)/420;village(g,w,h,h*.84,s,'#120c14',true,t);hills(g,w,h,h*.95,h*.05,'#0a0608',8,6);dragon(g,w*(1.3-(t*.03)%1.8),h*.22+Math.sin(t)*10,s*.4,.6+.5*Math.sin(t*4),'rgba(10,6,14,.9)');},
 night(g,w,h,t){sky(g,w,h,[[0,'#060a1e'],[.6,'#1b1840'],[1,'#3a1a20']]);stars(g,w,h,t);const m=Math.min(w,h);g.fillStyle='#f4ecd0';g.beginPath();g.arc(w*.78,h*.18,m*.06,0,7);g.fill();fireGlow(g,w*.8,h*.7,m*.5,t,.25);hills(g,w,h,h*.62,h*.22,'#1a1530',1,4);hills(g,w,h,h*.78,h*.16,'#0b0816',2,6);dragon(g,w*(1.25-(t*.09)%1.6),h*(.34+.04*Math.sin(t)),m/650,.6+.5*Math.sin(t*5),'#05030a');},
 battle(g,w,h,t){sky(g,w,h,[[0,'#2a0a08'],[.5,'#8a2a10'],[1,'#e07a2a']]);embers(g,w,h,t,60);hills(g,w,h,h*.7,h*.2,'#1a0805',4,3);const m=Math.min(w,h);fireGlow(g,w*.25,h*.82,m*.3,t,.5);fireGlow(g,w*.75,h*.86,m*.25,t,.45);g.fillStyle='#0a0302';g.fillRect(0,h*.85,w,h*.15);
  const fx=t>1?Math.min(1,(t-1)*1.5):0;if(fx>0){const gr=g.createLinearGradient(w*.72,h*.32,w*.45,h*.8);gr.addColorStop(0,'rgba(255,240,150,.95)');gr.addColorStop(1,'rgba(255,90,0,0)');g.fillStyle=gr;g.globalAlpha=fx*(.7+Math.sin(t*20)*.2);g.beginPath();g.moveTo(w*.74,h*.33);g.lineTo(w*.32,h*.75);g.lineTo(w*.52,h*.92);g.closePath();g.fill();g.globalAlpha=1;}
  dragon(g,w*.82,h*.3,m/330,.3+.25*Math.sin(t*3),'#050101');g.save();g.scale(-1,1);g.restore();knight(g,w*.42,h*.86,m/300,{up:t<2.5,rot:t>2.8?Math.min(1.4,(t-2.8)*.9):0});},
 valhalla(g,w,h,t){sky(g,w,h,[[0,'#fff6d8'],[.6,'#f0c870'],[1,'#a0703a']]);const m=Math.min(w,h);g.save();g.translate(w/2,h*.45);g.rotate(t*.05);for(let i=0;i<12;i++){g.rotate(Math.PI/6);g.fillStyle='rgba(255,255,230,.18)';g.beginPath();g.moveTo(0,0);g.lineTo(-m*.08,-m);g.lineTo(m*.08,-m);g.fill();}g.restore();
  for(let i=0;i<7;i++){g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse((G.h2(i,1,4)*w+t*8*(i%2?1:-1))%w,h*(.62+G.h2(i,2,4)*.25),m*.22,m*.05,0,0,7);g.fill();}
  const gw=m*.5,gx=w/2-gw/2,gy=h*.2,gh=h*.45;g.fillStyle='#6a4a1a';g.fillRect(gx-m*.06,gy,m*.06,gh);g.fillRect(gx+gw,gy,m*.06,gh);g.beginPath();g.moveTo(gx-m*.08,gy);g.quadraticCurveTo(w/2,gy-m*.22,gx+gw+m*.08,gy);g.lineTo(gx+gw+m*.08,gy+m*.04);g.quadraticCurveTo(w/2,gy-m*.17,gx-m*.08,gy+m*.04);g.fill();
  g.fillStyle='rgba(255,255,240,.95)';g.fillRect(gx,gy,gw,gh);const close=Math.min(1,t/5.5);g.fillStyle='#8a6a2a';g.fillRect(gx,gy,gw/2*close,gh);g.fillRect(gx+gw-gw/2*close,gy,gw/2*close,gh);
  valk(g,w*.18,h*.62,m/420,t,'rgba(60,40,20,.85)');valk(g,w*.82,h*.62,m/420,t+1,'rgba(60,40,20,.85)');knight(g,w/2,h*.92,m/420,{col:'rgba(40,25,10,.9)'});},
 raid(g,w,h,t){sky(g,w,h,[[0,'#0a0610'],[.55,'#3a1020'],[1,'#c0401a']]);embers(g,w,h,t,50);const m=Math.min(w,h),s=m/420;for(let i=0;i<5;i++)fireGlow(g,w*(.15+i*.18),h*.8,m*.2,t+i,.45);village(g,w,h,h*.84,s,'#0a0508',false,t);
  for(let i=0;i<6;i++){g.fillStyle=`rgba(40,30,30,${.35})`;g.beginPath();g.arc(w*(.12+i*.16)+Math.sin(t+i)*10,h*.6-((t*20+i*30)%(h*.4)),m*.06+(t*3%20),0,7);g.fill();}
  g.fillStyle='#000';g.fillRect(0,h*.84,w,h*.16);const dx=w*(1.2-(t*.11)%1.5),dy=h*(.3+.08*Math.sin(t*1.3));dragon(g,dx,dy,m/520,.6+.5*Math.sin(t*5),'#030102');lady(g,dx+m*.02,dy+m*.06,m/900,'#1a0a14');},
 dawn(g,w,h,t){sky(g,w,h,[[0,'#6a8ac8'],[.5,'#f0b088'],[.75,'#ffd8a0'],[1,'#4a6a3a']]);const m=Math.min(w,h);const sy=h*(.66-Math.min(.12,t*.02));g.fillStyle='#fff3c0';g.beginPath();g.arc(w*.7,sy,m*.09,0,7);g.fill();fireGlow(g,w*.7,sy,m*.4,t,.25);
  hills(g,w,h,h*.68,h*.08,'#5a6a7a',5,3);village(g,w,h,h*.7,m/900,'#3a3a4a',false,t);for(let i=0;i<3;i++){g.fillStyle='rgba(90,90,100,.35)';g.beginPath();g.arc(w*(.3+i*.2),h*.55-((t*10+i*20)%60),m*.03+(t*2%10),0,7);g.fill();}
  hills(g,w,h,h*.78,h*.05,'#3a5a2a',6,5);g.fillStyle='#3b6ea8';g.fillRect(0,h*.8,w,h*.07);g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<8;i++)g.fillRect((i*w/8+t*20)%w,h*.83,w*.05,2);g.fillStyle='#2a3a1a';g.fillRect(0,h*.87,w,h*.13);
  if(t<3)knight(g,w*.35,h*.93,m/380,{rot:-1.5});else knight(g,w*.35,h*.93,m/380,{rot:-1.5+Math.min(1.5,(t-3)*1.2)});lady(g,w*.6,h*.93,m/420,'#2a2030');},
 victory(g,w,h,t){sky(g,w,h,[[0,'#8ab0e8'],[.6,'#ffd8a0'],[1,'#6a4a2a']]);const m=Math.min(w,h);g.fillStyle='#fff3c0';g.beginPath();g.arc(w*.5,h*.5,m*.12,0,7);g.fill();hills(g,w,h,h*.72,h*.25,'#3a2a2a',9,2);g.save();g.translate(w*.62,h*.6);g.rotate(.4);dragon(g,0,0,m/400,.05,'#1a0a0a');g.restore();
  hills(g,w,h,h*.9,h*.06,'#1a2a1a',3,5);knight(g,w*.38,h*.92,m/300,{up:true,col:'#0a0a12'});lady(g,w*.5,h*.92,m/330,'#1a0a22');},
 gates(g,w,h,t){SCN.valhalla(g,w,h,99);const m=Math.min(w,h),gw=m*.5,gx=w/2-gw/2,gy=h*.2,gh=h*.45,o=Math.min(1,t/4);g.fillStyle='rgba(255,255,240,1)';g.fillRect(w/2-gw/2*o,gy,gw*o,gh);fireGlow(g,w/2,gy+gh/2,m*.5*o,t,.4*o);}};
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
function drawSkyClock(){const d=Math.min(window.devicePixelRatio||1,2);if(skc.width!==120*d){skc.width=120*d;skc.height=44*d;}skx.setTransform(d,0,0,d,0,0);skx.clearRect(0,0,120,44);
 const di=G.dayInfo(),t=di.t,hr=(6+t/720*24)%24,hh=Math.floor(hr),mm=Math.floor((hr-hh)*6)*10,L=di.light;
 const g=skx.createLinearGradient(0,0,0,44);g.addColorStop(0,`rgb(${30+90*L|0},${40+120*L|0},${80+150*L|0})`);g.addColorStop(1,`rgb(${20+120*L|0},${16+90*L|0},${30+40*L|0})`);skx.fillStyle=g;skx.beginPath();skx.roundRect?skx.roundRect(1,1,118,42,8):skx.rect(1,1,118,42);skx.fill();skx.strokeStyle='#5a3d1e';skx.lineWidth=2;skx.stroke();
 skx.save();skx.beginPath();skx.rect(2,2,116,30);skx.clip();
 if(L<.6){skx.fillStyle=`rgba(255,255,255,${.8*(1-L)})`;for(let i=0;i<14;i++)skx.fillRect(6+((i*37)%108),4+((i*13)%22),1.2,1.2);}
 const sunA=(hr-5.5)/16*Math.PI;if(sunA>0&&sunA<Math.PI){const x=60-Math.cos(sunA)*48,y=31-Math.sin(sunA)*24;const sg=skx.createRadialGradient(x,y,1,x,y,10);sg.addColorStop(0,'#fffbe0');sg.addColorStop(.4,'#ffd54a');sg.addColorStop(1,'rgba(255,180,40,0)');skx.fillStyle=sg;skx.beginPath();skx.arc(x,y,10,0,7);skx.fill();}
 const mh=(hr-20.5+24)%24,moA=mh/9.5*Math.PI;if(moA>0&&moA<Math.PI){const x=60-Math.cos(moA)*48,y=31-Math.sin(moA)*24;skx.fillStyle='#eef2ff';skx.beginPath();skx.arc(x,y,5.5,0,7);skx.fill();if(!di.full){skx.fillStyle=g;skx.fillStyle='rgba(30,40,80,.95)';skx.beginPath();skx.arc(x+2.6,y-1.2,4.8,0,7);skx.fill();}}
 skx.restore();skx.fillStyle='rgba(60,45,25,.85)';skx.fillRect(2,32,116,10);skx.fillStyle='#ffe9b0';skx.font='bold 10px Georgia';skx.textAlign='center';const ph=t>=505||t<22?'Nacht':t<75?'Morgen':t<370?'Tag':t<465?'Abend':'Spätabend';skx.fillText(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · ${ph}${di.full&&di.night?' 🌕':''}`,60,41);skx.textAlign='left';}
const FG=4,FW=Math.ceil(576/FG),FH=Math.ceil(576/FG);let fog=new Uint8Array(FW*FH),fogC=document.createElement('canvas'),fogX,fogDirty=true,fogSaveT=0;fogC.width=FW;fogC.height=FH;fogX=fogC.getContext('2d');
function fogRedraw(){const im=fogX.createImageData(FW,FH);for(let i=0;i<fog.length;i++){const o=i*4;im.data[o]=26;im.data[o+1]=20;im.data[o+2]=14;im.data[o+3]=fog[i]?0:255;}fogX.putImageData(im,0,0);fogDirty=false;}
function fogLoad(){fog=new Uint8Array(FW*FH);const P=G.P;if(P&&P.fog){try{const b=atob(P.fog);for(let i=0;i<fog.length;i++)fog[i]=(b.charCodeAt(i>>3)>>(i&7))&1;}catch(e){}}else fogReveal(G.VCX,G.VCY,26);fogDirty=true;}
function fogStore(){const by=new Uint8Array(Math.ceil(fog.length/8));for(let i=0;i<fog.length;i++)if(fog[i])by[i>>3]|=1<<(i&7);let s='';for(let i=0;i<by.length;i++)s+=String.fromCharCode(by[i]);G.P.fog=btoa(s);}
function fogReveal(tx,ty,r){const c0=Math.floor((tx-r)/FG),c1=Math.floor((tx+r)/FG),r0=Math.floor((ty-r)/FG),r1=Math.floor((ty+r)/FG);for(let cy=Math.max(0,r0);cy<=Math.min(FH-1,r1);cy++)for(let cx=Math.max(0,c0);cx<=Math.min(FW-1,c1);cx++){const dx=(cx+.5)*FG-tx,dy=(cy+.5)*FG-ty;if(dx*dx+dy*dy<=r*r&&!fog[cy*FW+cx]){fog[cy*FW+cx]=1;fogDirty=true;}}}
const fogSeen=(tx,ty)=>G.devReveal||fog[Math.floor(ty/FG)*FW+Math.floor(tx/FG)]===1;
function fogTick(dt){const P=G.P;if(!P||G.room)return;fogReveal(P.x/TILE,P.y/TILE,9);fogSaveT+=dt;if(fogSaveT>2){fogSaveT=0;fogStore();}}
G.fogAll=v=>{fog.fill(v?1:0);if(!v)fogReveal(G.P.x/TILE,G.P.y/TILE,9);fogDirty=true;fogStore();};
function drawMini(){const P=G.P,MS=+G.settings.mini||120,d=Math.min(window.devicePixelRatio||1,2)*MS/96;if(mini.width!==Math.round(96*d)){mini.width=mini.height=Math.round(96*d);}mctx.setTransform(d,0,0,d,0,0);mctx.imageSmoothingEnabled=false;
 const V=Math.round(110*Math.sqrt(MS/96)),pp=G.room?G.room.ent:P,ptx=pp.x/TILE,pty=pp.y/TILE,ox=Math.max(0,Math.min(G.WW-V,ptx-V/2)),oy=Math.max(0,Math.min(G.H-V,pty-V/2)),sc=96/V,X=x=>(x-ox)*sc,Y=y=>(y-oy)*sc;
 mctx.fillStyle='#000';mctx.fillRect(0,0,96,96);mctx.drawImage(mmBase,ox,oy,V,V,0,0,96,96);if(fogDirty)fogRedraw();mctx.imageSmoothingEnabled=true;mctx.drawImage(fogC,ox/FG,oy/FG,V/FG,V/FG,0,0,96,96);mctx.imageSmoothingEnabled=false;
 for(const w of G.WAYS){if(!fogSeen(w.tx,w.ty))continue;mctx.fillStyle=P.ways[w.id]?'#8fd8ff':'#667';mctx.fillRect(X(w.tx)-2,Y(w.ty)-2,4,4);}
 for(const n of G.NPCS){if(!G.npcVisible(n))continue;const mk=G.npcMark(n);mctx.fillStyle=mk==='!'||mk==='?'?'#ffd54a':'#ffe9b0';const s=mk&&mk!=='.'?3:2;mctx.fillRect(X(n.x/TILE)-1,Y(n.y/TILE)-1,s,s);}
 mctx.textAlign='center';
 for(const m of G.mons){if(m.dead||!m.boss)continue;mctx.fillStyle=m.boss==='dragon'?'#ff8a00':m.boss==='mini'?'#ff9800':'#ff1744';mctx.beginPath();mctx.arc(X(m.x/TILE),Y(m.y/TILE),2.5,0,7);mctx.fill();}
 const ob=G.objective();if(ob.to){let x=X(ob.to.x/TILE),y=Y(ob.to.y/TILE);x=Math.max(3,Math.min(93,x));y=Math.max(3,Math.min(93,y));const p=2.5+Math.sin(G.time*5)*1;mctx.strokeStyle='#ffd54a';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(x,y,p+1.5,0,7);mctx.stroke();}
 mctx.fillStyle='#fff';mctx.strokeStyle='#000';mctx.lineWidth=1;mctx.beginPath();mctx.arc(X(ptx),Y(pty),2.6,0,7);mctx.fill();mctx.stroke();
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
function hud(){tutTick();const P=G.P,S=G.S||G.calc(),tx=Math.floor(P.x/TILE),ty=Math.floor(P.y/TILE);
 {const dk=P.drunk||0,st=dk>=3?`rotate(${(Math.sin(G.time*.8)*Math.min(1.6,(dk-2)*.3)).toFixed(2)}deg) scale(${(1+Math.min(.05,(dk-2)*.008)).toFixed(3)})`:'';if(st!==ui._dst){ui._dst=st;$('c3d').style.transform=st;$('c2d').style.transform=st;}}$('lvl').textContent=P.level;$('hpf').style.width=(100*Math.max(0,P.hp)/S.maxhp)+'%';$('hpf').classList.toggle('poison',!!P.poison);$('hpt').textContent=`${Math.ceil(Math.max(0,P.hp))} / ${S.maxhp} LP${P.poison?' · vergiftet':''}${(P.drunk||0)>=1?' · 🍺 '+G.DRUNKN[G.drunkLvl()]:''}${P.hangover&&P.dayT<P.hangover?' · 🤕 Kater':''}`;
 $('stf').style.width=(100*Math.max(0,P.sta)/S.maxSta)+'%';$('stt').textContent=`⚡ ${Math.floor(P.sta)}`;$('mpf').style.width=(100*Math.max(0,P.mp)/S.maxMp)+'%';$('mpt').textContent=`🔷 ${Math.floor(P.mp)}`;const am=S.cls==='ranged'?(G.WKIND[S.kind].proj==='bolt'?'bolt':'arrow'):null;$('ammo').style.display=am?'block':'none';if(am)$('ammo').textContent=`${am==='bolt'?'Bolzen':'Pfeile'}: ${G.countItem(am)}`;
 const xn=G.xpNeed(P.level);$('xpf').style.width=(100*P.xp/xn)+'%';$('xpt').textContent=`XP ${Math.floor(P.xp)} / ${xn}`;$('gold').innerHTML=`🪙 ${P.gold} Gold · ${G.D().n}`+(P.bounty>0?` · <span style="color:#ff6b5a">⚖ ${P.bounty} <span style="color:#ffd54a">${'★'.repeat(G.wanted())}</span>${G.guardHostile()?' ⚔':''}</span>`:'');
 const b=G.biome(tx,ty),zl=G.zoneLevel(tx,ty);$('zone').textContent=G.room?(G.room.dungeon?`☠ ${G.room.name} · Stufe ~${G.room.lvl}`:`🏠 ${G.room.name}`):G.inSafe(P.x,P.y)?(G.inCastle(tx,ty)?'🏰 Burg Eichenhain · Sicher':G.townAt(tx,ty)?`🏘 ${G.townAt(tx,ty).name} · Sicher`:'🏡 Eichenhain · Sicher'):`⚔ ${G.ZN[b]} · Monster Stufe ~${zl}`;
 if(!hud.qT||G.time-hud.qT>.25){hud.qT=G.time;skBadge();const QL=G.questLog(),m=QL.main;hud.QL=QL;let h=`<div class="qh">⭐ Hauptquest · ${m.ch}</div><div class="ob">➤ ${m.t}${m.to&&!G.room?` <span class="qd">${G.dirTo(m.to)}</span>`:''}</div>`;
  if(QL.side.length){h+=`<div class="qh2">📜 Nebenquests</div>`+QL.side.slice(0,4).map(s=>`<div class="sq">• <b>${s.n}</b>: ${s.t.split(' – ')[0]}${s.to&&!G.room?` <span class="qd">${G.dirTo(s.to)}</span>`:''}</div>`).join('')+(QL.side.length>4?`<div class="sq">… +${QL.side.length-4} (Questbuch: J)</div>`:'');}
  if(h!==hud.qH){hud.qH=h;$('quests').innerHTML=h;}}
 const t=G.target(),ba=$('bAct');if(t){ba.classList.remove('off');const lb=G.targetLabel(t);ba.innerHTML=lb[0]+'<br>'+lb[1];}else{ba.classList.add('off');ba.innerHTML='✋';}
 $('bDodge').classList.toggle('cd',P.dodgeCd>0);
 let nb=null,nd=520;for(const m of G.mons){if(m.dead||!m.boss)continue;const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<nd){nd=d;nb=m;}}
 const bb=$('bossbar');if(nb){bb.style.display='block';$('bbn').textContent=`☠ ${nb.name} · Stufe ${nb.lvl}`;$('bbf').style.width=(100*Math.max(0,nb.hp)/nb.maxhp)+'%';}else bb.style.display='none';
 $('flash').style.opacity=G.flashT>0?Math.min(1,G.flashT):0;
 if(G.invDirty){renderHot();if(invOpen)renderInv();G.invDirty=false;}
 fogTick(1/60);drawMini();drawSkyClock();}
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
function drawCompass(){const P=G.P;if(G.room||P.dead)return;if(!use3d&&!(G.R2D&&G.R2D._fp)){drawGuide2D();return;}const port=VH>VW,W=Math.min(440,VW*(pcMode?.36:port?.62:.5)),H=24,cx=VW/2,y0=port?Math.round(254*(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gui'))||1)):pcMode?58:54,half=Math.PI*.55;
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
 else if(pcMode&&mouse.on&&!G.paused()){ctx.strokeStyle='rgba(255,240,200,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x-5,mouse.y);ctx.moveTo(mouse.x+5,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y-5);ctx.moveTo(mouse.x,mouse.y+5);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke();}
 const S=G.S;if(S&&P.hp<S.maxhp*.3&&!P.dead){const a=.25+Math.sin(G.time*6)*.1;const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.3,VW/2,VH/2,Math.max(VW,VH)*.7);g.addColorStop(0,'rgba(180,0,0,0)');g.addColorStop(1,`rgba(180,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
 if(P.poison){const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.7);g.addColorStop(0,'rgba(80,200,40,0)');g.addColorStop(1,'rgba(80,200,40,.22)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}}
// ===================== Eingabe =====================
const joy={id:null,ox:0,oy:0,dx:0,dy:0},joyEl=$('joy'),knob=$('knob');let joyUsed=false;
let pcMode=false,mouse={x:0,y:0,on:false};
function setPC(on){if(pcMode===on)return;pcMode=on;document.body.classList.toggle('pc',on);if(on&&state==='game'&&!setPC.told){setPC.told=1;toast('🖱 PC-Steuerung: WASD laufen · Linksklick angreifen · Leertaste springen · Shift sprinten · Strg/C ausweichen · F reden · E Inventar','#ffd54a',true);}}
c2d.addEventListener('pointerdown',e=>{if(state!=='game'||G.paused())return;
 if(e.pointerType==='mouse'&&isFP()&&document.pointerLockElement!==c2d){try{const r=c2d.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(_){}}
 if(e.pointerType!=='mouse'&&e.clientX>=VW*.5&&look.id===null){look.id=e.pointerId;look.x=look.sx=e.clientX;look.y=look.sy=e.clientY;look.t=performance.now();look.mv=0;e.preventDefault();return;}
 if(e.pointerType==='mouse'){setPC(true);mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;if(e.button===0){updAim();updMouseTile();const hs=G.P.inv[G.P.sel],t=G.target();if(t&&(t.k==='soil'||t.k==='crop')&&G.mouseTile&&(t.k==='crop'||(hs&&G.STACK[hs.id]&&G.STACK[hs.id].plant))){G.act();}else G.attackHeld=true;}else if(e.button===2){if(G.hasHammer&&G.hasHammer()){ui.openFurnBox();e.preventDefault();return;}if(use3d&&!isFP()){rot.on=true;rot.x=e.clientX;rot.y=e.clientY;}else G.dodge();}e.preventDefault();return;}
 setPC(false);
 if(joy.id===null&&e.clientX<VW*.5){joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.dx=joy.dy=0;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.style.display='block';knob.style.transform='';if(!joyUsed){joyUsed=true;$('joyHint').style.display='none';}}});
try{if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!('ontouchstart' in window&&navigator.maxTouchPoints>0)){pcMode=true;document.body.classList.add('pc');}}catch(_){}
const look={id:null,x:0,y:0};
const IX=()=>(G.settings.invX==='1'?-1:1)*(+G.settings.sens||1),IY=()=>(G.settings.invY==='1'?-1:1)*(+G.settings.sens||1);
addEventListener('pointermove',e=>{if(rot.on&&e.pointerType==='mouse'){G.camRot=(G.camRot||0)+(e.clientX-rot.x)*.009*IX();G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+(e.clientY-rot.y)*.006*IY()));rot.x=e.clientX;rot.y=e.clientY;}if(e.pointerId===look.id){const dx=e.clientX-look.x,dy=e.clientY-look.y;look.mv+=Math.abs(dx)+Math.abs(dy);if(isFP()){G.camYaw=(G.camYaw||0)+dx*.0058*IX();G.camPitch=Math.max(-1.2,Math.min(1,(G.camPitch||0)-dy*.0045*IY()));}else if(use3d){G.camRot=(G.camRot||0)+dx*.009*IX();G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+dy*.006*IY()));}look.x=e.clientX;look.y=e.clientY;return;}
 if(e.pointerType==='mouse'&&isFP()&&document.pointerLockElement===c2d&&!G.paused()){G.camYaw=(G.camYaw||0)+e.movementX*.0024*IX();G.camPitch=Math.max(-1.2,Math.min(1,(G.camPitch||0)-e.movementY*.0022*IY()));return;}
 if(e.pointerType==='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=true;if(!pcMode&&state==='game'&&(Math.abs(e.movementX)+Math.abs(e.movementY))>0)setPC(true);}});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button===0)G.attackHeld=false;});
c2d.addEventListener('wheel',e=>{if(state!=='game'||G.paused())return;e.preventDefault();const d=e.deltaY>0?1:-1;G.P.sel=(G.P.sel+d+9)%9;G.invDirty=true;},{passive:false});
document.addEventListener('mouseleave',()=>{mouse.on=false;G.attackHeld=false;});
function updMouseTile(){if(isFP()||!pcMode||!mouse.on||state!=='game'||G.room){G.mouseTile=null;return;}const P=G.P,cx=Math.floor(P.x/TILE),cy=Math.floor(P.y/TILE);let best=null,bd=1e9;
 for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++){const s=scr((x+.5)*TILE,(y+.5)*TILE,0);if(!s)continue;const d=Math.hypot(s.x-mouse.x,s.y-mouse.y);if(d<bd){bd=d;best={x,y};}}
 G.mouseTile=bd<70?best:null;}
function updAim(){if(isFP()&&state==='game'){G.aim=fpDir();return;}if(!pcMode||!mouse.on||state!=='game'){G.aim=null;return;}const P=G.P,h=.6,s=scr(P.x,P.y,h);if(!s){G.aim=null;return;}if(Math.hypot(mouse.x-s.x,mouse.y-s.y)<8){G.aim=null;return;}
 // Mausposition auf den Boden zurückrechnen (berücksichtigt Kameradrehung und Perspektive)
 let wx=P.x,wy=P.y;for(let it=0;it<4;it++){const a=scr(wx,wy,h),b=scr(wx+16,wy,h),c=scr(wx,wy+16,h);if(!a||!b||!c)break;const ax=(b.x-a.x)/16,ay=(b.y-a.y)/16,bx=(c.x-a.x)/16,by=(c.y-a.y)/16,det=ax*by-bx*ay;if(Math.abs(det)<1e-6)break;const ex=mouse.x-a.x,ey=mouse.y-a.y;let ux=(ex*by-bx*ey)/det,uy=(ax*ey-ex*ay)/det;const ul=Math.hypot(ux,uy);if(ul>600){ux*=600/ul;uy*=600/ul;}wx+=ux;wy+=uy;if(Math.hypot(ux,uy)<1)break;}
 let dx=wx-P.x,dy=wy-P.y;const l=Math.hypot(dx,dy);G.aim=l>4?{x:dx/l,y:dy/l}:null;}
let rotHold=0,tiltHold=0;
addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),mx=50;if(d>mx){dx=dx/d*mx;dy=dy/d*mx;}joy.dx=dx/mx;joy.dy=dy/mx;knob.style.transform=`translate(${dx}px,${dy}px)`;const sp=!!sprintTog;if(G.sprintHeld!==sp){G.sprintHeld=sp;joyEl.classList.toggle('sprint',sp);}});
const jEnd=e=>{if(e.pointerType==='mouse'&&e.button===2)rot.on=false;if(e.pointerId===look.id){look.id=null;const now=performance.now();if(look.mv<14&&now-look.t<260){if(now-(look.lastTap||0)<330){G.dodge();look.lastTap=0;}else look.lastTap=now;}}if(e.pointerId===joy.id){joy.id=null;joy.dx=joy.dy=0;joyEl.style.display='none';G.sprintHeld=!!sprintTog;joyEl.classList.remove('sprint');}};
addEventListener('pointerup',jEnd);addEventListener('pointercancel',jEnd);c2d.addEventListener('contextmenu',e=>e.preventDefault());
const bAtk=$('bAtk');
bAtk.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(G.paused())return;G.attackHeld=true;bAtk.classList.add('on');});
['pointerup','pointercancel','pointerleave'].forEach(t=>bAtk.addEventListener(t,()=>{G.attackHeld=false;bAtk.classList.remove('on');}));
$('bAct').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G.paused())G.act();});
$('bDodge').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G.paused())G.dodge();});
for(const [id,dir,tl] of [['bRotL',-1,0],['bRotR',1,0],['bTiltU',1,1],['bTiltD',-1,1]]){const el=$(id);const st=v=>{if(tl)tiltHold=v;else rotHold=v;};el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();st(dir);});el.addEventListener('pointerup',()=>st(0));el.addEventListener('pointerleave',()=>st(0));el.addEventListener('pointercancel',()=>st(0));}
addEventListener('wheel',e=>{if(state!=='game'||!use3d||isFP()||G.paused())return;G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+(e.deltaY>0?.06:-.06)*IY()));},{passive:true});
$('bJump').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G.paused())G.jump();});
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
let fpsAcc=0;function loop(now){{const lim=+(G.settings.fps||60);if(lim>0&&last){const fi=1000/lim;if(now-last<fi-2.5){requestAnimationFrame(loop);return;}}}const dt=Math.min(.05,(now-last)/1000);const rdt=Math.min(.5,(now-last)/1000);last=now;
 try{if(document.pointerLockElement&&(state!=='game'||G.paused()))document.exitPointerLock();if(pcMode)updMouseTile();else G.mouseTile=null;perfWatch(rdt);
 if(state==='game'){let mx=joy.dx,my=joy.dy;if(keys.w||keys.arrowup)my-=1;if(keys.s||keys.arrowdown)my+=1;if(keys.a)mx-=1;if(keys.d)mx+=1;if(isFP()){if(keys.arrowright)G.camYaw=(G.camYaw||0)+dt*2.4;if(keys.arrowleft)G.camYaw=(G.camYaw||0)-dt*2.4;const f=fpDir();const wx=-f.y*mx+f.x*(-my),wy=f.x*mx+f.y*(-my);mx=wx;my=wy;G.fpDir=f;if(!G.P.dead&&!G.paused()){G.P.fx=f.x;G.P.fy=f.y;}}else{G.fpDir=null;if(keys.arrowright)mx+=1;if(keys.arrowleft)mx-=1;if(use3d&&G.camRot){const r=G.camRot,c=Math.cos(r),sn=Math.sin(r);const wx=c*mx+sn*my,wy=-sn*mx+c*my;mx=wx;my=wy;}}if(rotHold)G.camRot=(G.camRot||0)+rotHold*dt*1.8;if(tiltHold)G.camTilt=Math.max(.22,Math.min(1.5,(G.camTilt==null?.893:G.camTilt)+tiltHold*dt*.9));G.input.x=mx;G.input.y=my;updAim();
  if(!G.paused())G.update(dt);else{G.S=G.calc();for(const k in keys)keys[k]=false;G.input.x=G.input.y=0;G.attackHeld=false;if(G.P){G.P.moving=false;}if(joy.id!==null){joy.id=null;joy.dx=joy.dy=0;joyEl.style.display='none';}}
  if(use3d){G.R3D.render();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c2d.width,c2d.height);}else if(isFP())G.R2D.renderFP(ctx,VW,VH,DPR);else G.R2D.render(ctx,VW,VH,DPR);
  stepT-=dt;const P=G.P;if(P.moving&&!P.dead&&!G.paused()&&stepT<=0){stepT=P.dodgeT>0?.12:.31*140/((G.S&&G.S.speed)||140);const tt=G.tileAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE));const T_=G.T;const surf=G.room?(tt===T_.STONEF||G.room.floor===T_.STONEF?'hard':'wood'):[T_.COBBLE,T_.PATH,T_.ASH,T_.DIRT].includes(tt)?'hard':[T_.SWAMP,T_.SAND].includes(tt)?'wet':'soft';G.sfx&&G.sfx('step',{surf});}
  moodT-=dt;if(moodT<=0&&G.setMood){moodT=1;const nb=G.mons.some(m=>m.boss&&!m.dead&&Math.hypot(m.x-P.x,m.y-P.y)<520);const b=G.biome(Math.floor(P.x/TILE),Math.floor(P.y/TILE));const tw=G.townAt&&G.townAt(Math.floor(P.x/TILE),Math.floor(P.y/TILE));G.setMood(nb?'boss':G.room?(G.room.dungeon?'dungeon':'house'):(b==='village'||(tw&&tw.id!=='glut'))?(tw&&tw.id==='frost'?'frost':'village'):b==='winter'?'frost':(b==='meadow'||b==='forest')?'wild':b==='ash'||tw?'ash':'dark');}
  drawOverlay();hudT-=dt;if(hudT<=0){hud();hudT=.1;}saveT-=dt;if(saveT<=0){saveT=10;if(!G.P.dead)G.save();}}
 else if(state==='menu'){if(G.setMood)G.setMood('menu');mt+=dt;ctx.setTransform(DPR,0,0,DPR,0,0);SCN.menu(ctx,VW,VH,mt);}
 else if(state==='cutscene'&&cs)drawCS(dt);
 if(charLook&&$('charSel').classList.contains('show')){charT+=dt;charPreview(dt);}
 }catch(err){console.error(err);}
 requestAnimationFrame(loop);}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='game')G.save();});
resize();toMenu();requestAnimationFrame(loop);
let mapOpen=false;const mapEl=document.createElement('div');mapEl.className='overlay';mapEl.id='bigmap';mapEl.innerHTML='<div class="panel parch mapP"><div class="ph"><span>🗺 Karte von Eldmar</span><button class="x">✕</button></div><canvas id="mapC"></canvas><div class="hint" style="text-align:center">M oder ✕ schließt · ✨ Wegschrein · ⛺ Lager · ☠ Gruft · 🐉 Drachenhort</div></div>';document.body.appendChild(mapEl);
mapEl.querySelector('.x').onclick=()=>closeMap();mapEl.addEventListener('click',e=>{if(e.target===mapEl)closeMap();});$('mini').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(state==='game'&&!G.paused())openMap();});
function openMap(){if(state!=='game')return;mapOpen=true;G.attackHeld=false;mapEl.classList.add('show');drawBig();}
function closeMap(){mapOpen=false;mapEl.classList.remove('show');}
function drawBig(){const c=$('mapC'),P=G.P;const sz=Math.min(innerWidth-40,innerHeight-120,720);const d=Math.min(window.devicePixelRatio||1,2);c.style.width=c.style.height=sz+'px';c.width=c.height=sz*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.imageSmoothingEnabled=false;
 const sc=sz/G.WW;g.drawImage(mmBase,0,0,G.WW,G.H,0,0,sz,sz*G.H/G.WW);if(fogDirty)fogRedraw();if(!G.devReveal){g.imageSmoothingEnabled=true;g.drawImage(fogC,0,0,FW,FH,0,0,FW*FG*sc,FH*FG*sc);g.imageSmoothingEnabled=false;}const X=x=>x*sc;
 g.textAlign='center';g.font='bold 12px Georgia';g.lineWidth=3;
 const lab=(t,x,y,col)=>{if(!fogSeen(x,y))return;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(t,X(x),X(y));g.fillStyle=col||'#ffe9b0';g.fillText(t,X(x),X(y));};
 const bn={meadow:[215,380,'Sonnenwiesen'],forest:[530,220,'Finsterwald'],swamp:[50,245,'Nebelmoor'],waste:[300,525,'Steinöde'],winter:[80,25,'Frostlande'],ash:[450,30,'Aschenberge'],dark:[80,545,'Schattenwald'],desert:[510,450,'Sengende Dünen'],peaks:[268,45,'Graukamm'],ashvale:[372,192,'Aschental (zerstört)']};g.font='italic 11px Georgia';for(const k in bn)lab(bn[k][2],bn[k][0],bn[k][1],'rgba(255,240,200,.75)');
 g.font='bold 12px Georgia';lab('Eichenhain',G.VCX,G.VCY-12);for(const t of G.TOWNS)lab(t.name,t.x,t.y-t.r-1);
 g.font='15px serif';for(const w of G.WAYS){if(!fogSeen(w.tx,w.ty))continue;g.fillText(P.ways[w.id]?'✨':'·',X(w.tx+.5),X(w.ty+.5)+5);}
 
 const ob=G.objective();if(ob.to){g.strokeStyle='#ffd54a';g.lineWidth=2;g.beginPath();g.arc(X(ob.to.x/TILE),X(ob.to.y/TILE),7,0,7);g.stroke();}
 const pp=G.room?G.room.ent:P;g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.arc(X(pp.x/TILE),X(pp.y/TILE),5,0,7);g.fill();g.stroke();}
// ===== Einrichtungsmodus: Rasterplan von oben, frei platzieren mit Vorschau =====
let buildOpen=false;
ui.openBuild=function(){const P=G.P,HR=G.HR;if(!(G.room&&G.room.player)){ui.openFurnBox();return;}if(buildOpen)return;buildOpen=true;G.attackHeld=false;
 const ov=document.createElement('div');ov.className='overlay';ov.style.display='flex';ov.style.zIndex=60;ov.id='buildOv';
 ov.innerHTML=`<div class="panel parch bpanel"><div class="ph"><span>🔨 Haus einrichten</span><button class="x">✕</button></div><div class="bhint"></div><div class="bwrap"><canvas class="bcv"></canvas></div><div class="bbtns btns"></div><div class="bsub">📦 Möbellager</div><div class="blist"></div></div>`;document.body.appendChild(ov);
 const cv=ov.querySelector('.bcv'),cx=cv.getContext('2d'),hint=ov.querySelector('.bhint'),bb=ov.querySelector('.bbtns'),bl=ov.querySelector('.blist');
 let sel=null;// {mode:'new',id,k,t,ax,ay} | {mode:'move',k,t,ax,ay} | {mode:'pick',k}
 const close=()=>{ov.remove();buildOpen=false;ui.closeBuild=null;};ui.closeBuild=close;ov.querySelector('.x').onclick=close;
 const W=HR.w,H=HR.h;let cs=40;
 const FC={bed:'#8d5a3b',table:'#a0703a',hearth:'#7a7a7a',shelf:'#6b4a2a',rug:'#a03030',lamp:'#d8b040',deco:'#4a8a4a',basket:'#b08850'};
 function size(){const mw=Math.min(ov.querySelector('.bwrap').clientWidth||420,560),mh=Math.max(160,Math.min(innerHeight*.42,360));cs=Math.max(22,Math.floor(Math.min(mw/W,mh/(H+.6))));cv.width=cs*W*devicePixelRatio;cv.height=cs*(H+.6)*devicePixelRatio;cv.style.width=cs*W+'px';cv.style.height=cs*(H+.6)+'px';cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
 function drawItem(k,t,ax,ay,alpha,outline){const fp=G.furnFoot(k,t,ax,ay),solid=G.furnSolid(k,t);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of fp){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);}
  cx.globalAlpha=alpha;cx.fillStyle=FC[k]||'#888';if(solid)cx.fillRect(x0*cs+2,y0*cs+2,(x1-x0)*cs-4,(y1-y0)*cs-4);else{cx.beginPath();cx.arc((x0+.5)*cs,(y0+.5)*cs,cs*.36,0,7);cx.fill();}
  if(outline){cx.globalAlpha=1;cx.strokeStyle=outline;cx.lineWidth=3;if(solid)cx.strokeRect(x0*cs+2,y0*cs+2,(x1-x0)*cs-4,(y1-y0)*cs-4);else{cx.beginPath();cx.arc((x0+.5)*cs,(y0+.5)*cs,cs*.4,0,7);cx.stroke();}}
  cx.globalAlpha=Math.min(1,alpha+.2);cx.font=Math.round(cs*.55)+'px serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(G.FURN[k].ic,(x0+x1)/2*cs,(y0+y1)/2*cs+1);cx.globalAlpha=1;}
 function draw(){cx.clearRect(0,0,cs*W,cs*(H+.6));cx.fillStyle='#c9a46a';cx.fillRect(0,0,cs*W,cs*H);cx.strokeStyle='rgba(90,60,30,.35)';cx.lineWidth=1;for(let x=0;x<=W;x++){cx.beginPath();cx.moveTo(x*cs+.5,0);cx.lineTo(x*cs+.5,H*cs);cx.stroke();}for(let y=0;y<=H;y++){cx.beginPath();cx.moveTo(0,y*cs+.5);cx.lineTo(W*cs,y*cs+.5);cx.stroke();}
  cx.fillStyle='rgba(90,60,30,.25)';cx.fillRect(0,0,W*cs,cs*.18);cx.font='bold '+Math.round(cs*.28)+'px Georgia';cx.fillStyle='#5a3d1e';cx.textAlign='left';cx.textBaseline='top';cx.fillText('Rückwand',4,2);
  const dx=HR.door.tx-HR.x0;cx.fillStyle='rgba(60,140,60,.35)';cx.fillRect((dx)*cs,(H-2)*cs,cs,2*cs);cx.fillStyle='#3b2410';cx.fillRect(dx*cs+cs*.15,H*cs,cs*.7,cs*.5);cx.fillStyle='#ffe9b0';cx.font='bold '+Math.round(cs*.26)+'px Georgia';cx.textAlign='center';cx.fillText('Tür',(dx+.5)*cs,H*cs+cs*.08);
  for(const k in G.FURN){const t=P.home[k]||0;if(!t)continue;if(sel&&sel.mode==='move'&&sel.k===k)continue;const a=G.furnAnchor(k);if(!a)continue;drawItem(k,t,a[0],a[1],sel&&sel.mode==='new'&&sel.k===k?.35:1,sel&&sel.mode==='pick'&&sel.k===k?'#ffd54a':null);}
  {const px=(P.x/32)-HR.x0,py=(P.y/32)-HR.y0;cx.fillStyle='#2a5aa8';cx.beginPath();cx.arc(px*cs,py*cs,cs*.18,0,7);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();}
  if(sel&&(sel.mode==='new'||sel.mode==='move')&&sel.ax!=null){const ok=G.furnValid(sel.k,sel.t,sel.ax,sel.ay);drawItem(sel.k,sel.t,sel.ax,sel.ay,.75,ok?'#43a047':'#e53935');sel.ok=ok;}}
 function names(k,t){return G.FURN[k].t[t][0];}
 function ui2(){bb.innerHTML='';const B=(l,f,c)=>{const b=document.createElement('button');b.className='btn'+(c?' '+c:'');b.textContent=l;b.onclick=f;bb.appendChild(b);};
  if(!sel)hint.innerHTML='Wähle unten ein Möbelstück aus dem Lager, oder tippe ein aufgestelltes Möbelstück im Plan an, um es umzustellen.';
  else if(sel.mode==='pick'){hint.innerHTML=`<b>${names(sel.k,P.home[sel.k])}</b> ausgewählt.`;B('↔ Umstellen',()=>{const a=G.furnAnchor(sel.k);sel={mode:'move',k:sel.k,t:P.home[sel.k],ax:a[0],ay:a[1]};render();});B('📦 Abbauen',()=>{G.pickFurn(sel.k);sel=null;render();});B('Abbrechen',()=>{sel=null;render();});}
  else{const wall=G.furnWall(sel.k,sel.t);hint.innerHTML=`<b>${names(sel.k,sel.t)}</b>: Tippe oder ziehe im Plan an die gewünschte Stelle.${wall?' <i>Wandmöbel – nur an der Rückwand.</i>':''}${sel.ax!=null?(sel.ok?' <span style="color:#2e7d32">✔ passt</span>':' <span style="color:#c62828">✖ hier nicht möglich</span>'):''}`;
   B('✔ Platzieren',()=>{if(sel.ax==null||!sel.ok){toast('Wähle zuerst eine freie (grüne) Stelle.','#ff8a80');return;}const ok=sel.mode==='new'?G.furnPut(sel.id,sel.ax,sel.ay):G.furnMoveTo(sel.k,sel.ax,sel.ay);if(ok){toast(`${G.FURN[sel.k].ic} Aufgestellt!`,'#a5d6a7');sel=null;}render();},sel.ax!=null&&sel.ok?'':'dim');B('Abbrechen',()=>{sel=null;render();});}}
 function list(){bl.innerHTML='';const ids=Object.keys(P.furn||{}).filter(id=>P.furn[id]>0&&G.STACK[id]);if(!ids.length){bl.innerHTML='<div class="hint">Leer – Möbel kaufst du bei Schreiner Holger.</div>';return;}
  ids.sort().forEach(id=>{const S=G.STACK[id];const e=document.createElement('button');e.className='bitem'+(sel&&sel.mode==='new'&&sel.id===id?' on':'');e.innerHTML=`<span>${G.FURN[S.fk].ic}</span><b>${S.name}</b>${P.furn[id]>1?' ×'+P.furn[id]:''}${(P.home[S.fk]||0)?'<small>ersetzt '+names(S.fk,P.home[S.fk])+'</small>':''}`;e.onclick=()=>{const wall=G.furnWall(S.fk,S.ft);sel={mode:'new',id,k:S.fk,t:S.ft,ax:null,ay:null};if(wall)sel.ay=0;render();};bl.appendChild(e);});}
 function render(){draw();ui2();list();}
 function cellOf(e){const r=cv.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/cs),Math.floor((e.clientY-r.top)/cs)];}
 let down=false;
 cv.addEventListener('pointerdown',e=>{e.preventDefault();const [x,y]=cellOf(e);if(sel&&(sel.mode==='new'||sel.mode==='move')){down=true;cv.setPointerCapture(e.pointerId);sel.ax=x;sel.ay=G.furnWall(sel.k,sel.t)?0:y;render();return;}
  let hitK=null;for(const k in G.FURN){const t=P.home[k]||0;if(!t)continue;const a=G.furnAnchor(k);if(!a)continue;if(G.furnFoot(k,t,a[0],a[1]).some(([fx,fy])=>fx===x&&fy===y))hitK=hitK&&G.furnSolid(hitK,P.home[hitK])?hitK:k;}
  sel=hitK?{mode:'pick',k:hitK}:null;render();});
 cv.addEventListener('pointermove',e=>{if(!down||!sel)return;const [x,y]=cellOf(e);const ny=G.furnWall(sel.k,sel.t)?0:y;if(x!==sel.ax||ny!==sel.ay){sel.ax=x;sel.ay=ny;render();}});
 cv.addEventListener('pointerup',()=>{down=false;});cv.style.touchAction='none';
 size();render();addEventListener('resize',function rs(){if(!buildOpen){removeEventListener('resize',rs);return;}size();render();});};
let furnOpen=false;
ui.openFurnBox=function(force){if(!force&&G.room&&G.room.player&&!buildOpen){ui.openBuild();return;}if(furnOpen)return;const P=G.P;G.attackHeld=false;const ov=document.createElement('div');ov.className='overlay';ov.style.display='flex';ov.style.zIndex=60;ov.id='furnOv';ov.innerHTML=`<div class="panel parch" style="max-width:420px"><div class="ph"><span>📦 Möbellager</span><button class="x">✕</button></div><div id="fbl" style="max-height:60vh;overflow:auto"></div><p style="font-size:12px;color:#6b5233;margin-top:6px">Gekaufte und abgebaute Möbel liegen hier und nehmen keinen Inventarplatz weg. Stell dich in deinem Haus vor eine freie Stelle und drück „Aufstellen“. Wandmöbel kommen an die hintere Wand.</p></div>`;document.body.appendChild(ov);furnOpen=true;
 const close=()=>{ov.remove();furnOpen=false;ui.closeFurn=null;};ui.closeFurn=close;ov.querySelector('.x').onclick=close;ov.addEventListener('click',e=>{if(e.target===ov)close();});
 const render=()=>{const l=ov.querySelector('#fbl');l.innerHTML='';const ids=Object.keys(P.furn||{}).filter(id=>P.furn[id]>0&&G.STACK[id]);const inHome=G.room&&G.room.player;
  if(!ids.length){l.innerHTML='<div class="hint" style="padding:8px">Dein Möbellager ist leer. Schreiner Holger verkauft Möbel, und mit dem Hammer abgebaute Möbel landen auch hier.</div>';return;}
  ids.sort().forEach(id=>{const S=G.STACK[id],F=G.FURN[S.fk];const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:6px;margin:4px 0;background:rgba(255,245,215,.55);border:1px solid #a88a5a;border-radius:6px';
   row.innerHTML=`<span style="font-size:24px">${F.ic}</span><div style="flex:1"><b>${S.name}</b>${P.furn[id]>1?' ×'+P.furn[id]:''}<br><small>${F.n} · Stufe ${S.ft}${(P.home[S.fk]||0)?' · ersetzt: '+F.t[P.home[S.fk]][0]:''}</small></div>`;
   const b=document.createElement('button');b.className='btn';b.textContent=inHome?'🏠 Aufstellen':'nur im Haus';b.disabled=!inHome;b.onclick=()=>{if(G.placeFurn(id,true)){close();}else render();};row.appendChild(b);
   const d=document.createElement('button');d.className='btn';d.textContent='🗑';d.title='Wegwerfen';d.onclick=()=>{if(d.dataset.c!=='1'){d.dataset.c='1';d.textContent='Sicher?';return;}P.furn[id]--;if(P.furn[id]<=0)delete P.furn[id];G.save();render();};row.appendChild(d);l.appendChild(row);});};render();};
ui.openTravel=function(){if(travelOpen)return;const P=G.P;const ov=document.createElement('div');ov.className='overlay';ov.style.display='flex';ov.innerHTML=`<div class="panel parch" style="max-width:340px"><div class="ph"><span>✨ Wegschrein · Schnellreise</span><button class="x">✕</button></div><div id="twl"></div><p style="font-size:12px;color:#6b5233;margin-top:6px">Entdecke weitere Wegschreine, indem du in ihre Nähe läufst.</p></div>`;document.body.appendChild(ov);travelOpen=true;
 const close=()=>{ov.remove();travelOpen=false;ui.closeTravel=null;};ui.closeTravel=close;ov.id='travelOv';ov.style.zIndex=60;ov.querySelector('.x').onclick=close;const l=ov.querySelector('#twl');
 for(const w of G.WAYS){const b=document.createElement('button');b.className='btn';b.style.cssText='display:block;width:100%;margin:5px 0';const on=P.ways[w.id];const here=Math.hypot((w.tx+.5)*TILE-P.x,(w.ty+.5)*TILE-P.y)<TILE*4;b.textContent=(on?'✨ ':'🔒 ')+w.name+(here?' (hier)':'')+(on?'':' – unentdeckt');b.disabled=!on||here;if(!on||here)b.style.opacity=.5;b.onclick=()=>{close();G.travel(w.id);};l.appendChild(b);}};
let travelOpen=false;
window.__ui={enterGame,cutscene,get state(){return state;},applyMode,openChar,setLook:l=>{Object.assign(charLook,l);buildChar();}};
})();
