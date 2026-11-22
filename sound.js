'use strict';
(function(){
const G=window.G;
const SD={vMaster:80,vSfx:80,vMusic:55,vVoice:85};for(const k in SD)if(typeof G.settings[k]!=='number')G.settings[k]=SD[k];if(!G.settings.voices)G.settings.voices='speech';const vol=k=>Math.max(0,Math.min(100,G.settings[k]))/100;
let ac=null,master=null,sfxG=null,musG=null,voxG=null,noiseBuf=null;
function init(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;return;}
 master=ac.createGain();master.gain.value=.9;const comp=ac.createDynamicsCompressor();master.connect(comp);comp.connect(ac.destination);
 sfxG=ac.createGain();sfxG.connect(master);musG=ac.createGain();musG.connect(master);voxG=ac.createGain();voxG.connect(master);
 noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;applyVol();}
const unlock=()=>{init();if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});};
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{passive:true,capture:true}));
function applyVol(){if(!ac)return;const m=vol('vMaster');master.gain.value=.9*m*m;sfxG.gain.value=.85*Math.pow(vol('vSfx'),1.6);voxG.gain.value=.9*Math.pow(vol('vVoice'),1.6);musG.gain.value=.55*Math.pow(vol('vMusic'),1.6);}
G.applyVol=applyVol;
// ---------- Bausteine ----------
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
function tone(type,f0,f1,dur,vol,t,dest,o){o=o||{};const os=ac.createOscillator(),g=ac.createGain();os.type=type;os.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)os.frequency.exponentialRampToValueAtTime(f1,t+dur);env(g,t,o.a||.006,vol,dur);let n=os;
 if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;os.connect(f);n=f;}
 if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibA||f0*.03;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.1);}
 n.connect(g);g.connect(dest||sfxG);os.start(t);os.stop(t+(o.a||.006)+dur+.05);return os;}
function noise(dur,vol,t,ft,freq,q,dest,f1){const s=ac.createBufferSource();s.buffer=noiseBuf;const f=ac.createBiquadFilter();f.type=ft||'lowpass';f.frequency.setValueAtTime(freq||1000,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q||1;const g=ac.createGain();env(g,t,.004,vol,dur);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t,Math.random()*1.5);s.stop(t+dur+.06);}
// ---------- Tierlaute & Kampfschreie ----------
const AGG={
 wolf:(t,v)=>{tone('sine',380,620,.55,.16*v,t,null,{a:.12,vib:5,vibA:10});tone('sine',620,430,.9,.16*v,t+.6,null,{a:.05,vib:6,vibA:14});tone('sine',760,560,.9,.04*v,t+.6);},
 boar:(t,v)=>{tone('sawtooth',650,1350,.28,.09*v,t,null,{lp:3200,vib:28,vibA:90});tone('sawtooth',1250,700,.3,.08*v,t+.26,null,{lp:3000,vib:24,vibA:70});noise(.3,.08*v,t,'bandpass',1800,3);},
 slime:(t,v)=>{tone('sine',280,90,.4,.25*v,t,null,{vib:14,vibA:40});},
 rat:(t,v)=>{tone('square',2300,2900,.06,.035*v,t);tone('square',2500,3100,.06,.035*v,t+.1);tone('square',2400,3000,.05,.03*v,t+.2);},
 hum:(t,v)=>{tone('sawtooth',170,125,.28,.14*v,t,null,{lp:900});noise(.18,.08*v,t,'bandpass',750,3);},
 goblin:(t,v)=>{for(let i=0;i<5;i++)tone('square',i%2?520:640,i%2?480:600,.07,.05*v,t+i*.09,null,{lp:2200});},
 spider:(t,v)=>{noise(.55,.16*v,t,'highpass',2600,1);noise(.3,.08*v,t+.2,'bandpass',5000,2);},
 skeleton:(t,v)=>{for(let i=0;i<9;i++)noise(.025,.18*v,t+i*.055+Math.random()*.02,'bandpass',1800+Math.random()*1200,6);},
 ghost:(t,v)=>{tone('sine',720,480,1.3,.09*v,t,null,{a:.25,vib:5,vibA:35});tone('sine',727,486,1.3,.06*v,t,null,{a:.25,vib:4,vibA:30});},
 roar:(t,v)=>{tone('sawtooth',95,55,.9,.18*v,t,null,{lp:520,vib:9,vibA:6});noise(.85,.2*v,t,'lowpass',420,1,null,140);},
 fire:(t,v)=>{noise(.6,.18*v,t,'bandpass',1400,1.5,null,500);tone('sawtooth',320,140,.5,.06*v,t,null,{lp:1200});},
 dragon:(t,v)=>{tone('sawtooth',115,42,2.1,.3*v,t,null,{lp:720,vib:7,vibA:7,a:.1});tone('sawtooth',76,38,2.1,.25*v,t,null,{lp:500,a:.1});noise(2,.32*v,t,'lowpass',650,1,null,120);},
 boss:(t,v)=>{tone('sawtooth',130,70,1.2,.2*v,t,null,{lp:650,vib:6,vibA:8,a:.08});noise(1.1,.22*v,t,'lowpass',500,1,null,150);},
};
const AMAP={wolf:'wolf',boar:'boar',slime:'slime',rat:'rat',bandit:'hum',archer:'hum',knight:'hum',goblin:'goblin',shaman:'goblin',spider:'spider',skeleton:'skeleton',skarcher:'skeleton',ghoul:'roar',witch:'ghost',ghost:'ghost',orc:'roar',troll:'roar',golem:'roar',imp:'fire',salamander:'fire',dragon:'dragon',boss:'boss'};
// ---------- Geräusche ----------
const S={
 step(o,t,v){const s=o.surf;if(s==='hard'){noise(.05,.16*v,t,'bandpass',1500+Math.random()*700,1.4);tone('sine',170,110,.04,.05*v,t);}else if(s==='wet'){noise(.09,.13*v,t,'lowpass',700+Math.random()*300,2);}else if(s==='wood'){tone('sine',190+Math.random()*30,120,.06,.12*v,t);noise(.04,.07*v,t,'bandpass',900,2);}else noise(.07,.14*v,t,'lowpass',420+Math.random()*240,.7);},
 swing(o,t,v){noise(.17,.2*v,t,'bandpass',500,1.6,null,2600);},
 hit(o,t,v){tone('sine',170,55,.14,.42*v,t);noise(.06,.26*v,t,'lowpass',2600);},
 crit(o,t,v){S.hit(o,t,v);tone('triangle',1500,1250,.25,.12*v,t);tone('triangle',2250,1900,.2,.06*v,t);},
 immune(o,t,v){tone('triangle',900,900,.12,.06*v,t);},
 hurt(o,t,v){tone('sawtooth',230,110,.22,.15*v,t,null,{lp:900});noise(.1,.14*v,t,'lowpass',1200);},
 dodge(o,t,v){noise(.22,.18*v,t,'bandpass',380,2,null,1700);},
 kill(o,t,v){tone('square',420,90,.25,.06*v,t,null,{lp:1500});noise(.12,.12*v,t,'lowpass',800);},
 bosskill(o,t,v){[523,659,784,1047].forEach((f,i)=>tone('triangle',f,null,.5,.15*v,t+i*.12));noise(.6,.18*v,t,'lowpass',400);},
 pickup(o,t,v){tone('triangle',880,null,.08,.12*v,t);tone('triangle',1320,null,.12,.12*v,t+.07);},
 rare(o,t,v){[784,988,1319,1568].forEach((f,i)=>tone('sine',f,null,.6,.1*v,t+i*.07));},
 coin(o,t,v){tone('sine',1900,null,.1,.09*v,t);tone('sine',2650,null,.18,.08*v,t+.05);},
 levelup(o,t,v){[523,659,784,1047].forEach((f,i)=>tone('triangle',f,null,.35,.16*v,t+i*.1));tone('sine',1047,null,.9,.09*v,t+.4);},
 quest(o,t,v){[784,988,1175].forEach((f,i)=>tone('sine',f,null,.5,.12*v,t+i*.09));},
 arrow(o,t,v){tone('triangle',950,320,.12,.1*v,t);noise(.15,.06*v,t,'highpass',3000);},
 zap(o,t,v){tone('sawtooth',300,950,.18,.06*v,t,null,{lp:2200});},
 boom(o,t,v){tone('sine',90,38,.5,.45*v,t);noise(.5,.35*v,t,'lowpass',600,1,null,110);},
 drink(o,t,v){for(let i=0;i<4;i++)tone('sine',380+i*90,720+i*90,.08,.09*v,t+i*.09);},
 eat(o,t,v){for(let i=0;i<3;i++)noise(.06,.18*v,t+i*.12,'bandpass',1200,2);},
 horn(o,t,v){tone('sawtooth',196,196,1.1,.1*v,t,null,{lp:900,a:.15});tone('sawtooth',294,294,1,.07*v,t+.25,null,{lp:900,a:.15});},
 chest(o,t,v){tone('sawtooth',140,260,.35,.05*v,t,null,{lp:700});S.coin(o,t+.32,v);S.coin(o,t+.42,v*.7);},
 door(o,t,v){tone('sine',105,68,.25,.38*v,t);noise(.15,.18*v,t,'lowpass',500);noise(.35,.07*v,t+.05,'bandpass',260,5);},
 plant(o,t,v){noise(.12,.14*v,t,'lowpass',700);},
 click(o,t,v){tone('square',1200,null,.025,.03*v,t);},
 death(o,t,v){tone('sawtooth',300,55,1.3,.14*v,t,null,{lp:800});},
 aggro(o,t,v){(AGG[AMAP[o.type]]||AGG.hum)(t,v);},
};
const lastT={};
G.sfx=function(name,o){if(!ac||vol('vSfx')<=0||vol('vMaster')<=0||ac.state!=='running')return;const fn=S[name];if(!fn)return;o=o||{};const now=ac.currentTime;if(name!=='step'&&lastT[name]&&now-lastT[name]<.045)return;lastT[name]=now;
 let v=1;if(o.x!=null&&G.P){const d=Math.hypot(o.x-G.P.x,o.y-G.P.y);v=Math.max(0,1-d/(G.TILE*20));if(v<=.03)return;}try{fn(o,now+.01,v);}catch(e){}};
// ---------- Musik: komponierte Spielmannsweisen ----------
// Melodie: "Ton:Dauer" (Halbtöne über Grundton, Dauer in Achteln, r=Pause). Akkorde je Takt: Stufe+M/m.
const TR={
 village:{n:'Dorfplatz',root:62,e:.2,bar:6,inst:['lute','flute','drum'],dr:'jig',
  A:['0:2 4:1 7:2 4:1','5:2 7:1 9:2 7:1','10:2 9:1 7:2 5:1','4:3 2:3','0:2 4:1 7:2 9:1','10:2 12:1 10:2 9:1','7:2 5:1 4:2 2:1','0:6'],Ac:['0M','5M','10M','7M','0M','10M','5M','0M'],
  B:['12:3 10:2 9:1','7:2 9:1 10:3','9:2 7:1 5:2 4:1','2:3 7:3','12:2 14:1 12:2 10:1','9:2 10:1 12:3','10:2 9:1 7:2 4:1','0:6'],Bc:['0M','10M','5M','7M','0M','10M','5M','0M']},
 wild:{n:'Wanderweg',root:62,e:.26,bar:6,inst:['lute','flute','drone'],dr:'walk',
  A:['0:2 2:2 3:2','5:4 3:2','2:2 0:2 -2:2','0:6','7:2 9:2 10:2','12:4 10:2','9:2 7:2 5:2','7:6'],Ac:['0m','10M','10M','0m','3M','10M','5M','7m'],
  B:['10:2 9:2 7:2','5:4 7:2','3:2 2:2 0:2','2:6','3:2 5:2 7:2','9:2 7:2 5:2','3:2 2:2 -2:2','0:6'],Bc:['10M','5M','3M','10M','3M','5M','10M','0m']},
 menu:{n:'Valhalls Ruf',root:57,e:.36,bar:6,inst:['lute','flute','drone'],
  A:['7:3 5:1 3:2','2:4 0:2','3:3 5:1 7:2','5:6','7:3 8:1 10:2','12:4 10:2','8:2 7:2 5:2','7:6'],Ac:['0m','10M','8M','10M','0m','3M','8M','7M'],
  B:['12:4 10:2','8:3 7:3','5:2 7:2 8:2','7:6','3:3 5:1 7:2','8:4 7:2','5:2 3:2 2:2','0:6'],Bc:['8M','3M','5m','0m','8M','5m','10M','0m']},
 house:{n:'Am Herdfeuer',root:65,e:.3,bar:6,inst:['lute'],
  A:['0:2 4:1 7:3','5:2 4:1 2:3','4:2 5:1 7:2 9:1','7:6','9:2 7:1 5:3','4:2 2:1 0:3','2:2 4:1 5:2 2:1','0:6'],Ac:['0M','7M','0M','0M','5M','0M','7M','0M']},
 frost:{n:'Nordlicht',root:64,e:.34,bar:8,inst:['flute','drone','bell'],
  A:['0:4 3:2 5:2','7:6 r:2','10:3 8:1 7:4','5:8','3:4 5:2 7:2','8:4 7:4','5:3 3:1 2:4','0:8'],Ac:['0m','0m','8M','5m','3M','8M','10M','0m']},
 dark:{n:'Moorlied',root:57,e:.34,bar:6,inst:['lute','drone'],
  A:['0:3 1:3','3:2 1:2 0:2','-2:3 0:3','r:6','7:3 8:3','7:2 5:2 3:2','1:3 0:3','r:6'],Ac:['0m','1M','10m','0m','5m','0m','1M','0m']},
 ash:{n:'Glutmarsch',root:50,e:.2,bar:8,inst:['drone','lute','drum','horn'],dr:'march',
  A:['0:2 1:2 4:2 5:2','7:4 5:2 4:2','5:2 4:2 1:2 0:2','1:8','0:2 1:2 4:2 7:2','8:4 7:2 5:2','4:2 5:2 4:2 1:2','0:8'],Ac:['0M','5m','1M','1M','0M','8M','1M','0M']},
 dungeon:{n:'Gewölbe',root:52,e:.4,bar:8,inst:['drone','bell'],
  A:['0:4 r:4','3:4 r:4','1:6 r:2','0:8','7:4 r:4','6:4 r:4','3:6 1:2','0:8'],Ac:['0m','0m','1M','0m','0m','6m','1M','0m']},
 boss:{n:'Schlachtruf',root:50,e:.15,bar:8,inst:['drone','lute','drum','horn'],dr:'battle',
  A:['0:2 0:1 3:1 5:2 3:2','7:2 5:2 3:2 2:2','0:2 0:1 3:1 5:2 7:2','8:4 7:4','10:2 8:2 7:2 5:2','3:2 5:2 7:4','8:2 7:2 5:2 3:2','2:4 0:4'],Ac:['0m','0m','0m','8M','3M','10M','8M','7M']}};
for(const k in TR){const t=TR[k];const P=a=>a.map(b=>b.split(' ').map(x=>{const [n,d]=x.split(':');return[n==='r'?null:+n,+d];}));t.A=P(t.A);t.Bp=t.B?P(t.B):null;if(!t.Bc)t.Bc=t.Ac;}
const mtof=m=>440*Math.pow(2,(m-69)/12);
let mood='menu',cur=null,nextT=0,bar=0,part=0,rep=0,mvol=null;
// Instrumente
function lute(f,t,d,v){const o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type='sawtooth';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*2.003;lp.type='lowpass';lp.frequency.setValueAtTime(f*7,t);lp.frequency.exponentialRampToValueAtTime(Math.max(200,f*1.5),t+.35);lp.Q.value=2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+Math.min(1.6,d+.6));o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(mvol);o.start(t);o2.start(t);o.stop(t+d+.7);o2.stop(t+d+.7);}
function flute(f,t,d,v){const o=ac.createOscillator(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();o.type='sine';o.frequency.value=f;l.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.012,t+Math.min(.4,d*.6));l.connect(lg);lg.connect(o.frequency);const o3=ac.createOscillator(),g3=ac.createGain();o3.type='triangle';o3.frequency.value=f*2;g3.gain.value=.18;o3.connect(g3);g3.connect(g);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.05);g.gain.setValueAtTime(v*.85,t+Math.max(.06,d-.06));g.gain.exponentialRampToValueAtTime(.0001,t+d+.12);o.connect(g);g.connect(mvol);o.start(t);l.start(t);o3.start(t);o.stop(t+d+.2);l.stop(t+d+.2);o3.stop(t+d+.2);noise(.06,v*.35,t,'bandpass',f*2,2,mvol);}
function bell(f,t,v){tone('sine',f,null,2.2,v,t,mvol,{a:.004});tone('sine',f*2.76,null,.9,v*.3,t,mvol,{a:.004});}
function horn(f,t,d,v){tone('sawtooth',f,null,d,v,t,mvol,{a:.08,lp:900});tone('sawtooth',f*1.5,null,d,v*.5,t,mvol,{a:.1,lp:800});}
let droneN=[];function drone(root,t,d,v){for(const [m,k] of [[0,1],[7,.7],[12,.35]]){const o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=mtof(root+m)*(1+(Math.random()-.5)*.003);lp.type='lowpass';lp.frequency.value=500;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v*k,t+.4);g.gain.setValueAtTime(v*k,t+d-.3);g.gain.exponentialRampToValueAtTime(.0001,t+d+.2);o.connect(lp);lp.connect(g);g.connect(mvol);o.start(t);o.stop(t+d+.3);}}
function drum(t,v,low){tone('sine',low?95:160,low?48:90,low?.32:.14,v,t,mvol,{a:.003});noise(low?.08:.05,v*.4,t,'lowpass',low?600:1800,1,mvol);}
const DR={jig:[[0,1,1],[3,.5,0],[5,.4,0]],walk:[[0,.6,1]],march:[[0,1,1],[2,.5,0],[4,.8,1],[6,.5,0],[7,.3,0]],battle:[[0,1,1],[1,.4,0],[2,.7,0],[3,.4,0],[4,1,1],[5,.4,0],[6,.7,0],[7,.5,0]]};
function chordN(c){const deg=parseInt(c),min=c.slice(-1)==='m';return[deg,deg+(min?3:4),deg+7];}
function playBar(T,t){const ph=part===1&&T.Bp?T.Bp:T.A,cs=part===1&&T.Bp?T.Bc:T.Ac;const mel=ph[bar],ch=chordN(cs[bar]),E=T.e,I=T.inst,R0=T.root,L=T.bar;
 if(I.includes('drone')&&bar%2===0)drone(R0-24+(ch[0]%12===0?0:0),t,E*L*2,.035);
 if(I.includes('lute')){const pat=L===6?[0,2,1,2,0,2]:[0,2,1,2,0,2,1,2];pat.forEach((k,i)=>{if(T.dr==='battle'&&i%2)return;lute(mtof(R0-12+ch[k]+(k===0&&i===0?-12:0)),t+i*E,E,(i===0?.06:.035));});}
 let tt=t;const lead=I.includes('flute')?'flute':I.includes('horn')?'horn':'lute';const v8=rep%2?12:0;
 for(const [n,d] of mel){if(n!==null){const f=mtof(R0+n+(lead==='lute'?0:12)+(lead==='horn'?-12:0)+(lead==='flute'&&T.n!=='Nordlicht'?0:0));
   if(lead==='flute'){flute(f,tt,d*E*.95,.05);if(d>=3&&Math.random()<.5)flute(f*1.122,tt+E*.5,E*.4,.03);}else if(lead==='horn')horn(f,tt,d*E*.9,.035);else lute(f,tt,d*E,.075);
   if(I.includes('bell')&&Math.random()<.35)bell(f*2,tt,.02);if(rep%2&&I.includes('lute')&&lead==='flute'&&Math.random()<.3)lute(f/2,tt,d*E,.035);}tt+=d*E;}
 if(I.includes('drum')&&T.dr){for(const [p,v,lo] of DR[T.dr])drum(t+p*E,.08*v,lo);}
 bar++;if(bar>=T.A.length){bar=0;rep++;if(T.Bp){if(rep%2===0)part=1-part;}}}
function sched(){if(!ac||ac.state!=='running')return;if(!mvol){mvol=ac.createGain();mvol.gain.value=1;mvol.connect(musG);}if((G.settings.vMusic??55)<=0)return;const now=ac.currentTime;const T=TR[mood];
 if(cur!==mood){if(nextT>now+.2)nextT=now+.2;mvol.gain.cancelScheduledValues(now);mvol.gain.setValueAtTime(mvol.gain.value,now);mvol.gain.linearRampToValueAtTime(.0001,now+.15);mvol.gain.linearRampToValueAtTime(1,now+.6);cur=mood;bar=0;part=0;rep=0;if(nextT<now+.2)nextT=now+.25;}
 if(nextT<now)nextT=now+.05;while(nextT<now+.5){playBar(T,nextT);nextT+=T.e*T.bar;}}
setInterval(sched,120);
G.setMood=m=>{if(TR[m])mood=m;};G.musicName=()=>TR[mood]&&TR[mood].n;
// ---------- NPC-Stimmen ----------
const VO={mara:{p:1.05,r:.9,g:'f',b:215},aldric:{p:.7,r:.86,g:'m',b:105},elara:{p:1.25,r:1.02,g:'f',b:265},gunnar:{p:.5,r:.84,g:'m',b:90},hilda:{p:.9,r:1.06,g:'f',b:185},bernd:{p:.9,r:1.12,g:'m',b:140},otto:{p:1.08,r:1.18,g:'m',b:150},greta:{p:1.15,r:1.12,g:'f',b:230},konrad:{p:1.12,r:1.12,g:'m',b:160},lukas:{p:1.25,r:1.06,g:'m',b:175},anselm:{p:.78,r:.8,g:'m',b:118},mia:{p:1.75,r:1.15,g:'f',b:345},jorg:{p:.68,r:.94,g:'m',b:112},hedwig:{p:1.35,r:.76,g:'f',b:245}};
let voicesDE=[];const hasSpeech='speechSynthesis' in window;
function loadVoices(){try{voicesDE=speechSynthesis.getVoices().filter(v=>/^de/i.test(v.lang));}catch(e){voicesDE=[];}}
if(hasSpeech){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices);}catch(e){}}
const FEM=/(anna|petra|helena|katja|marlene|vicki|hedda|female|frau|sabine|gisela|ingrid|eva|lea|julia|amala|seraphina|elke|klara|louisa|tanja|katharina|hanna|leni)/i,MAL=/(markus|hans|stefan|yannick|conrad|male|martin|klaus|jonas|florian|ralf|bernd|killian|daniel|thomas|reed|grandpa|eddy|rocko|viktor|felix)/i;
function pickVoice(n,vo){if(!voicesDE.length)return null;let pool=voicesDE.filter(v=>vo.g==='f'?FEM.test(v.name):MAL.test(v.name));if(!pool.length)pool=voicesDE;let h=0;for(const c of n.id)h+=c.charCodeAt(0);return pool[h%pool.length];}
let bab=[];
function babble(vo,text){if(!ac||ac.state!=='running')return;const n=Math.min(34,Math.max(4,Math.ceil(text.length/5)));let t=ac.currentTime+.03;
 for(let i=0;i<n;i++){const f=vo.b*(1+(Math.random()-.5)*.28)*(i%6===5?1.12:1);const os=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter();os.type='sawtooth';os.frequency.value=f;bp.type='bandpass';bp.frequency.value=[560,850,1150,430,720][G.rint(0,4)]*(vo.b>200?1.25:1);bp.Q.value=5;const d=.055+Math.random()*.05;env(g,t,.012,.22,d);os.connect(bp);bp.connect(g);g.connect(voxG);os.start(t);os.stop(t+d+.06);bab.push(os);t+=d+.03+(Math.random()<.14?.13:0);}}
G.voice={available:()=>hasSpeech&&voicesDE.length>0,
 speak(n,text){this.stop();const mode=G.settings.voices;if(mode==='off'||!text||vol('vVoice')<=0||vol('vMaster')<=0)return;const vo=VO[n.id]||{p:1,r:1,g:'m',b:150};
  if(mode==='speech'&&hasSpeech&&voicesDE.length){try{const u=new SpeechSynthesisUtterance(text.replace(/[„“"♪…*]/g,' '));u.lang='de-DE';const v=pickVoice(n,vo);if(v)u.voice=v;u.pitch=Math.max(0,Math.min(2,vo.p));u.rate=vo.r;u.volume=Math.min(1,vol('vVoice')*vol('vMaster'));speechSynthesis.speak(u);return;}catch(e){}}
  babble(vo,text);},
 stop(){try{if(hasSpeech)speechSynthesis.cancel();}catch(e){}for(const o of bab){try{o.stop();}catch(e){}}bab=[];}};
})();
