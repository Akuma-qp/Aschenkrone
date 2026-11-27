'use strict';
// ===================== Aschenkrone – eigene Icons statt Emojis =====================
// Jedes Icon ist eine kleine Vektorzeichnung (32×32). Emojis in Texten und auf Canvas werden automatisch durch diese Icons ersetzt.
(function(){
const OL='#2b1a0e';
const sh=(c,k)=>{const n=parseInt(c.slice(1),16);const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`;};
let g=null;// aktueller Zeichenkontext (32×32)
const path=pts=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();};
const fs=(c,w)=>{g.fillStyle=c;g.fill();g.lineWidth=w==null?1.6:w;g.strokeStyle=OL;if(w!==0)g.stroke();};
const P=(pts,c,w)=>{path(pts);fs(c,w);};
const O=(x,y,r,c,w)=>{g.beginPath();g.arc(x,y,r,0,7);fs(c,w);};
const E=(x,y,rx,ry,c,w,rot)=>{g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,7);fs(c,w);};
const RR=(x,y,w,h,r,c,lw)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();fs(c,lw);};
const L=(pts,c,w)=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.lineWidth=w||2;g.strokeStyle=c;g.lineCap='round';g.lineJoin='round';g.stroke();};
const HL=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,7);g.fillStyle='rgba(255,255,255,.55)';g.fill();};
// ---- Zeichner (Parameter: Farbe c, Variante v)
const D={
 pot:(c)=>{RR(13,3,6,6,1.5,'#c8a070');P([12,9,20,9,24,16,26,24,22,29,10,29,6,24,8,16],'#e6eef2');P([8,18,24,18,25,24,22,28,10,28,7,24],c,0);g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.moveTo(12,9);g.lineTo(20,9);g.lineTo(24,16);g.lineTo(26,24);g.lineTo(22,29);g.lineTo(10,29);g.lineTo(6,24);g.lineTo(8,16);g.closePath();g.stroke();HL(11,21,2);},
 orb:(c)=>{RR(9,24,14,5,2,'#8a5a2a');O(16,15,10,c);HL(12,11,3);O(19,18,2.5,sh(c,1.3),0);},
 gem:(c)=>{P([8,11,12,5,20,5,24,11,16,28],c);L([8,11,24,11],OL,1.2);L([12,5,14,11,16,28,18,11,20,5],sh(c,.7),1);P([12,6,15,6,13,10],'rgba(255,255,255,.6)',0);},
 ring:(c)=>{g.beginPath();g.arc(16,19,9,0,7);g.lineWidth=5;g.strokeStyle=OL;g.stroke();g.lineWidth=3;g.strokeStyle='#e8c040';g.stroke();P([12,9,16,3,20,9,16,13],c);},
 coin:()=>{O(16,17,11,'#e8b830');O(16,17,7.5,'#f6d15a',1);L([16,12,16,22],'#b07a10',2);HL(11,12,2.2);},
 coins:()=>{for(const [x,y] of [[11,22],[21,22],[16,13]]){O(x,y,7,'#e8b830');O(x,y,4.5,'#f6d15a',1);}},
 bag:(c)=>{P([11,8,21,8,18,12,26,20,24,29,8,29,6,20,14,12],c);L([11,12,21,12],OL,1.8);g.fillStyle='#ffe066';g.font='bold 11px Georgia';g.textAlign='center';g.fillText(c==='#a06a30'?'G':'',16,25);},
 pack:(c)=>{RR(7,9,18,20,5,c);RR(10,18,12,8,2,sh(c,.8));L([11,9,11,5,21,5,21,9],OL,2);},
 heart:(c)=>{g.beginPath();g.moveTo(16,28);g.bezierCurveTo(3,19,4,7,11,7);g.bezierCurveTo(14,7,16,10,16,11);g.bezierCurveTo(16,10,18,7,21,7);g.bezierCurveTo(28,7,29,19,16,28);g.closePath();fs(c);HL(10,12,2.2);},
 star:(c)=>{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?5.5:13;p.push(16+Math.cos(a)*r,17+Math.sin(a)*r);}P(p,c);HL(13,12,1.8);},
 spark:(c)=>{for(const [x,y,s] of [[15,15,9],[25,7,4],[24,25,3.5]]){P([x,y-s,x+s*.28,y-s*.28,x+s,y,x+s*.28,y+s*.28,x,y+s,x-s*.28,y+s*.28,x-s,y,x-s*.28,y-s*.28],c,1.2);}},
 medal:(c)=>{P([10,3,15,3,17,13,13,13],'#c83030');P([22,3,17,3,15,13,19,13],'#3060c0');O(16,20,8,c);HL(13,17,2);},
 fire:()=>{g.beginPath();g.moveTo(16,29);g.bezierCurveTo(5,29,5,18,10,12);g.bezierCurveTo(11,17,13,17,14,15);g.bezierCurveTo(13,9,16,5,19,3);g.bezierCurveTo(19,9,27,13,26,21);g.bezierCurveTo(26,26,22,29,16,29);fs('#f07a20');g.beginPath();g.moveTo(16,28);g.bezierCurveTo(11,28,10,23,13,19);g.bezierCurveTo(14,22,16,21,17,18);g.bezierCurveTo(21,21,22,28,16,28);fs('#ffd24a',0);},
 boom:()=>{const p=[];for(let i=0;i<16;i++){const a=i/16*6.283,r=i%2?7:13;p.push(16+Math.cos(a)*r,16+Math.sin(a)*r);}P(p,'#ff8a20');O(16,16,5,'#ffe066',0);},
 drop:(c)=>{g.beginPath();g.moveTo(16,4);g.bezierCurveTo(16,4,26,16,26,21);g.arc(16,21,10,0,Math.PI);g.bezierCurveTo(6,16,16,4,16,4);fs(c);HL(12,21,2.5);},
 leaf:(c)=>{g.beginPath();g.moveTo(5,27);g.bezierCurveTo(5,12,14,5,27,5);g.bezierCurveTo(27,18,20,27,5,27);fs(c);L([6,26,22,10],sh(c,.65),1.5);},
 sprout:(c)=>{RR(9,22,14,8,2,'#a8683a');L([16,23,16,13],'#3a7a2a',2.4);E(11,12,5,3,c,1.4,-.5);E(21,10,5,3,c,1.4,.5);},
 clover:(c)=>{for(const [x,y] of [[11,11],[21,11],[11,20],[21,20]])O(x,y,5.5,c);L([16,16,20,29],'#2a6a2a',2.4);},
 flower:(c)=>{L([16,17,16,30],'#3a8a3a',2.4);E(21,25,4,2,'#4a9a3a',1.2,-.5);for(let i=0;i<5;i++){const a=i/5*6.283-1.57;O(16+Math.cos(a)*6,12+Math.sin(a)*6,4.5,c,1.3);}O(16,12,3.5,'#ffd24a',1.2);},
 tulip:(c)=>{L([16,17,16,30],'#3a8a3a',2.4);P([9,8,12,13,16,7,20,13,23,8,22,17,16,21,10,17],c);},
 rose:(c)=>{L([16,17,16,30],'#3a7a2a',2.4);O(16,12,8,c);g.beginPath();g.arc(16,12,4.5,0,5);g.strokeStyle=sh(c,.6);g.lineWidth=1.4;g.stroke();},
 tree:(c,v)=>{RR(14,19,4,11,1,'#7a4a20');if(v==='pine'){P([16,2,26,16,6,16],c);P([16,8,24,22,8,22],sh(c,1.1));}else if(v==='cactus'){RR(12,6,8,24,4,c);RR(5,12,6,10,3,c);RR(21,9,6,9,3,c);}else{O(16,13,10,c);O(11,15,5,sh(c,1.12),0);HL(12,9,2);}},
 plant:(c)=>{P([9,20,23,20,21,30,11,30],'#b0683a');for(const a of [-.9,-.3,.3,.9])E(16+Math.sin(a)*7,12-Math.cos(a)*2,3,7,c,1.2,a);},
 veg:(c,v)=>{if(v==='carrot'){P([8,9,24,25,14,13],'#f07a20');L([8,9,4,5],'#3a9a3a',2.5);L([8,9,9,3],'#3a9a3a',2.5);L([8,9,3,9],'#3a9a3a',2.5);}
  else if(v==='long'){E(16,17,6,13,c,1.6,.6);L([10,6,7,3],'#3a7a2a',2.5);}else if(v==='corn'){E(16,17,6,12,'#f0d040');for(let y=9;y<27;y+=4)L([12,y,20,y],'#c8a020',1);P([9,22,16,30,8,14],'#5aa03a');P([23,22,16,30,24,14],'#5aa03a');}
  else if(v==='mush'){RR(13,16,6,13,2,'#f4ecd8');g.beginPath();g.arc(16,17,12,Math.PI,0);g.closePath();fs(c);O(11,12,1.8,'#fff',0);O(19,10,1.6,'#fff',0);O(21,15,1.3,'#fff',0);}
  else if(v==='berry'){for(const [x,y] of [[11,21],[21,21],[16,14]])O(x,y,6,c);L([16,8,16,3],'#3a7a2a',2);}else if(v==='pumpkin'){E(16,19,12,9,c);L([16,11,16,27],sh(c,.7),1.2);L([10,12,10,26],sh(c,.7),1.2);L([22,12,22,26],sh(c,.7),1.2);RR(14,6,4,6,1,'#5a7a2a');}
  else if(v==='lemon'){E(16,17,11,8,c,1.6,-.4);HL(12,13,2.2);}else{O(16,18,10,c);L([16,8,16,4],'#3a7a2a',2);E(20,7,4,2,'#4a9a3a',1.2,-.3);HL(12,14,2.5);}},
 bread:(c)=>{E(16,19,13,8,c||'#d8a050');for(const x of [10,16,22])L([x-2,15,x+2,21],sh(c||'#d8a050',.65),1.6);HL(11,15,2);},
 cake:()=>{P([4,14,28,14,28,26,4,26],'#f2d8a8');P([4,14,28,14,26,10,6,10],'#f4f0f0');for(const x of [8,14,20,26])O(x,18,1.8,'#d03050',0);O(16,7,2.5,'#d03050');},
 pie:()=>{E(16,19,13,8,'#c8803a');E(16,17,11,5,'#e8b870',1);for(const x of [10,16,22])L([x,14,x,20],'#a0602a',1.2);},
 bowl:(c)=>{g.beginPath();g.arc(16,14,12,0,Math.PI);g.closePath();fs('#a06a3a');E(16,14,12,3.5,c||'#e0a040');L([20,4,26,12],'#7a5030',2);},
 plate:()=>{E(16,18,13,8,'#f2efe8');E(16,18,8,4.5,'#e2ddd2',1);L([5,8,7,16],'#8a8a90',1.6);L([27,8,25,16],'#8a8a90',1.6);},
 pan:()=>{O(14,18,9,'#3a3a40');L([22,22,30,28],'#3a3a40',3.5);O(14,18,4.5,'#f6e8a0',0);O(14,18,2,'#f0a020',0);},
 mug:(c)=>{RR(6,8,16,20,3,'#c8a060');RR(8,6,12,6,3,'#f8f4e8');g.beginPath();g.arc(23,18,5,-1.4,1.4);g.lineWidth=3;g.strokeStyle=OL;g.stroke();L([10,13,10,25],'#e8c070',1.4);},
 sword:(c,v)=>{const one=(r)=>{g.save();g.translate(16,16);g.rotate(r);P([-2,-14,2,-14,2,6,-2,6],'#d8dde4');P([0,-16,2,-14,-2,-14],'#d8dde4',1);RR(-7,6,14,3,1,'#c8a040');RR(-1.5,9,3,6,1,'#6a4020');O(0,16,2,'#c8a040');g.restore();};if(v==='x'){one(-.7);one(.7);}else one(.6);},
 shield:(c)=>{g.beginPath();g.moveTo(16,3);g.lineTo(27,7);g.bezierCurveTo(27,19,22,25,16,29);g.bezierCurveTo(10,25,5,19,5,7);g.closePath();fs(c||'#3a5aa0');L([16,6,16,26],'#e8c040',2);L([8,13,24,13],'#e8c040',2);},
 bow:()=>{g.beginPath();g.arc(6,16,15,-1.1,1.1);g.lineWidth=3;g.strokeStyle='#8a5a2a';g.stroke();L([12,3,12,29],'#e8e0c8',1);L([4,16,28,16],'#6a4020',1.8);P([28,16,23,13,23,19],'#c8ccd4',1);},
 target:()=>{O(16,16,13,'#f4ecd8');O(16,16,9,'#d03030');O(16,16,5,'#f4ecd8');O(16,16,2,'#d03030',0);},
 axe:()=>{L([9,28,22,5],'#8a5a2a',3.4);g.beginPath();g.moveTo(17,6);g.bezierCurveTo(26,2,30,10,27,16);g.lineTo(20,12);g.closePath();fs('#c8ccd4');},
 hammer:(c,v)=>{if(v==='pick'){L([9,28,20,9],'#8a5a2a',3.2);g.beginPath();g.moveTo(5,11);g.quadraticCurveTo(18,0,29,13);g.lineTo(26,14);g.quadraticCurveTo(18,6,8,13);g.closePath();fs('#9aa0aa');return;}
  if(v==='saw'){P([4,10,26,10,26,18,4,23],'#c8ccd4');for(let x=6;x<26;x+=3)P([x,10+(x-4)*.6+8-.5,x+1.5,10+(x-4)*.6+10,x+3,10+(x-4)*.6+8],'#c8ccd4',.8);RR(24,7,6,14,2,'#8a5a2a');return;}
  L([10,28,20,10],'#8a5a2a',3.2);g.save();g.translate(21,8);g.rotate(.5);RR(-8,-4,16,8,1.5,'#8a909a');g.restore();if(v==='two'){L([22,28,12,10],'#8a5a2a',3);g.save();g.translate(11,8);g.rotate(-.5);RR(-8,-4,16,8,1.5,'#6a707a');g.restore();}},
 wrench:()=>{L([8,26,21,12],'#9aa0aa',4);g.beginPath();g.arc(23,9,5,0,7);fs('#9aa0aa');O(25,7,2,'#e8e0d0',0);},
 skull:()=>{g.beginPath();g.arc(16,14,11,Math.PI*.85,Math.PI*.15);g.lineTo(21,28);g.lineTo(11,28);g.closePath();fs('#ece6d8');O(12,15,3.2,OL,0);O(20,15,3.2,OL,0);P([16,18,14,22,18,22],OL,0);for(const x of [13,16,19])L([x,25,x,28],OL,1);},
 crown:()=>{P([4,24,6,9,11,17,16,6,21,17,26,9,28,24],'#f0c030');RR(4,23,24,5,1,'#e0a820');for(const [x,y,c] of [[16,10,'#d02040'],[8,13,'#3060d0'],[24,13,'#30a050']])O(x,y,2,c,1);},
 scroll:(c)=>{RR(7,6,18,20,2,'#f2e2b8');O(7,9,3,'#e0c890');O(25,23,3,'#e0c890');for(let y=11;y<23;y+=3)L([11,y,21,y],'#a08050',1);},
 book:(c)=>{RR(6,5,19,23,2,c||'#7a2a2a');RR(9,7,15,19,1,'#f2e8d0',1);RR(6,5,4,23,1.5,sh(c||'#7a2a2a',.8));for(let y=11;y<23;y+=3)L([12,y,21,y],'#a08060',1);},
 books:()=>{RR(4,8,7,20,1,'#a03030');RR(12,5,7,23,1,'#3050a0');g.save();g.translate(24,17);g.rotate(.25);RR(-3.5,-11,7,22,1,'#3a7a3a');g.restore();},
 clip:()=>{RR(7,5,18,24,2,'#a07040');RR(9,8,14,19,1,'#f4f0e6',1);RR(12,3,8,5,1.5,'#9aa0aa');for(let y=13;y<25;y+=4)L([12,y,20,y],'#7a7a80',1.2);},
 map:()=>{P([4,8,12,5,20,8,28,5,28,25,20,28,12,25,4,28],'#ecd8a0');L([12,5,12,25],'#c0a060',1);L([20,8,20,28],'#c0a060',1);L([7,20,13,14,18,18,25,11],'#c03030',1.6);O(25,11,2,'#c03030',0);},
 compass:()=>{O(16,16,12,'#c8a040');O(16,16,9.5,'#f4f0e6',1);P([16,7,19,16,16,25,13,16],'#d03030',0);P([16,25,19,16,13,16],'#3a3a40',0);O(16,16,1.6,OL,0);},
 pin:(c)=>{g.beginPath();g.arc(16,12,8,Math.PI*.8,Math.PI*.2);g.lineTo(16,29);g.closePath();fs(c||'#d03030');O(16,12,3,'#fff',1);},
 scope:()=>{g.save();g.translate(16,16);g.rotate(-.6);RR(-13,-3,26,6,2,'#c8a040');RR(-13,-4,7,8,2,'#8a5a2a');RR(6,-3.5,7,7,1,'#8a5a2a');g.restore();L([12,20,8,29],OL,1.6);L([12,20,18,29],OL,1.6);},
 lock:(c,v)=>{g.beginPath();g.arc(16,13,6,Math.PI,v==='open'?Math.PI*1.75:0);g.lineWidth=3.5;g.strokeStyle='#8a909a';g.stroke();RR(7,13,18,15,3,'#e0b030');O(16,19,2.3,OL,0);RR(15,19,2,5,1,OL,0);},
 key:()=>{O(9,10,6,'#e0b030');O(9,10,2.5,'#fff3c0',1);L([13,14,27,27],'#e0b030',3.5);L([22,22,25,19],'#e0b030',3);L([25,25,28,22],'#e0b030',3);},
 scale:()=>{L([16,5,16,27],'#8a6a3a',2.4);L([6,9,26,9],'#c8a040',2.2);RR(10,26,12,3,1,'#8a6a3a');for(const x of [6,26]){L([x,9,x-4,18],OL,1);L([x,9,x+4,18],OL,1);g.beginPath();g.arc(x,18,5,0,Math.PI);g.closePath();fs('#e0b030');}},
 house:(c,v)=>{const r=c||'#b04a2a';if(v==='castle'){RR(5,10,22,18,0,'#a8a8b0');for(const x of [5,13,21])RR(x,6,6,6,0,'#a8a8b0');RR(13,19,6,9,3,'#5a3a1a');P([24,6,24,1,29,3],'#d03030',1);return;}
  if(v==='church'){RR(8,13,16,15,0,'#ece6da');P([6,14,16,6,26,14],r);L([16,6,16,1],OL,1.8);L([13,3,19,3],OL,1.8);RR(13,19,6,9,3,'#5a3a1a');return;}
  if(v==='tent'){P([3,27,16,5,29,27],r);P([12,27,16,16,20,27],'#3a2a1a');return;}if(v==='shop'){RR(6,13,20,15,0,'#ece6da');P([4,13,28,13,26,7,6,7],r);for(let x=6;x<26;x+=5)RR(x,7,2.5,6,0,'#fff',0);RR(10,18,6,10,1,'#5a3a1a');return;}
  if(v==='tower'){P([12,28,13,8,19,8,20,28],'#a8a8b0');P([10,9,16,1,22,9],r);return;}if(v==='build'){RR(6,14,14,14,0,'#e8d8b8');L([20,28,20,4],'#c8a040',2);L([20,4,30,4],'#c8a040',2);L([28,4,28,12],OL,1);RR(25,12,6,4,1,'#8a909a');return;}
  if(v==='village'){for(const [x,y,s] of [[3,15,.8],[15,11,1]]){RR(x+2*s,y+6*s,14*s,12*s,0,'#ece6da');P([x,y+7*s,x+9*s,y,x+18*s,y+7*s],r);}return;}
  RR(7,14,18,14,0,v==='garden'?'#e8dcc0':'#ece6da');P([4,15,16,4,28,15],r);RR(13,19,6,9,1.5,'#6a4020');RR(19,17,4,4,0,'#7ab0e0',1);if(v==='garden'){for(const x of [3,28])O(x,26,3,'#3a9a3a');}},
 lantern:(c)=>{L([16,2,16,7],OL,1.6);RR(10,7,12,17,3,'#3a3a40');RR(12,10,8,11,2,c||'#ffc040',0);RR(9,23,14,4,1,'#3a3a40');},
 bed:(c)=>{RR(3,16,26,8,2,c||'#8a5a2a');RR(3,10,5,16,1.5,sh(c||'#8a5a2a',.8));RR(8,13,9,5,2,'#f4f0e6');RR(15,14,13,5,1.5,'#4a6ad0');L([5,26,5,29],OL,2);L([27,24,27,29],OL,2);},
 sofa:(c)=>{RR(4,10,24,12,4,c||'#a03030');RR(2,15,6,11,2,sh(c||'#a03030',.85));RR(24,15,6,11,2,sh(c||'#a03030',.85));RR(7,18,18,7,2,sh(c||'#a03030',1.15));},
 box:(c)=>{P([4,11,16,6,28,11,16,16],sh(c||'#c89050',1.15));P([4,11,16,16,16,29,4,24],c||'#c89050');P([28,11,16,16,16,29,28,24],sh(c||'#c89050',.8));},
 chest:(c)=>{RR(4,14,24,14,2,c||'#8a5a2a');g.beginPath();g.moveTo(4,15);g.bezierCurveTo(4,5,28,5,28,15);g.closePath();fs(sh(c||'#8a5a2a',1.15));L([4,15,28,15],'#e0b030',2);RR(14,13,4,6,1,'#e0b030');},
 toolbox:()=>{RR(4,12,24,15,2,'#c03030');RR(11,6,10,7,2,'#2a2a30',1.6);g.fillStyle='rgba(0,0,0,0)';L([4,18,28,18],OL,1.4);RR(14,16,4,4,1,'#c8ccd4');},
 gear:(c)=>{const p=[];for(let i=0;i<16;i++){const a=i/16*6.283,r=i%2?9:13;p.push(16+Math.cos(a)*r,16+Math.sin(a)*r);}P(p,c||'#8a909a');O(16,16,4,'#e8e0d0');},
 eye:()=>{g.beginPath();g.moveTo(3,16);g.quadraticCurveTo(16,3,29,16);g.quadraticCurveTo(16,29,3,16);fs('#f8f6f0');O(16,16,5.5,'#4a7ac0');O(16,16,2.5,'#111',0);HL(14,14,1.2);},
 bulb:()=>{O(16,13,9,'#ffe066');RR(12,21,8,7,1.5,'#9aa0aa');L([13,24,19,24],OL,1);L([16,17,16,11],'#c8a020',1.2);HL(12,9,2.2);},
 speech:(c)=>{RR(3,5,26,17,6,c||'#f4f0e6');P([9,21,8,28,15,21],c||'#f4f0e6',0);L([9,21,8,28,15,21.5],OL,1.6);for(const x of [10,16,22])O(x,13.5,1.8,OL,0);},
 horn:()=>{g.beginPath();g.moveTo(4,22);g.quadraticCurveTo(10,8,26,6);g.lineTo(28,14);g.quadraticCurveTo(14,14,8,24);g.closePath();fs('#e8d8a8');E(27,10,2.5,4.5,'#c8a040',1.4,.2);L([12,15,14,20],'#c8a040',2);},
 mega:()=>{P([4,13,10,13,24,5,24,27,10,19,4,19],'#d03030');RR(24,11,4,10,1.5,'#d03030');},
 clock:(c)=>{O(16,16,12,'#c8a040');O(16,16,9.5,'#f8f4e8',1);L([16,16,16,9],OL,1.8);L([16,16,21,18],OL,1.8);for(let i=0;i<12;i+=3){const a=i/12*6.283;O(16+Math.cos(a)*7.5,16+Math.sin(a)*7.5,1,OL,0);}},
 hourglass:()=>{RR(7,3,18,3,1,'#8a5a2a');RR(7,26,18,3,1,'#8a5a2a');P([9,6,23,6,17,16,23,26,9,26,15,16],'#e6eef2');P([11,8,21,8,16,14],'#e8c070',0);P([16,19,21,25,11,25],'#e8c070',0);},
 cal:()=>{RR(4,6,24,22,2,'#f8f4e8');RR(4,6,24,7,2,'#d03030');for(let i=0;i<9;i++)RR(8+(i%3)*6,16+Math.floor(i/3)*4,3,2,0,'#7a7a80',0);L([10,3,10,8],OL,2);L([22,3,22,8],OL,2);},
 moon:(c)=>{if(c==='full'){O(16,16,12,'#f4ecc0');O(12,12,2.5,'#e0d8a0',0);O(20,19,3,'#e0d8a0',0);return;}g.beginPath();g.arc(16,16,12,.4,5.9);g.arc(22,12,10,5.1,1.3,true);g.closePath();fs('#f4e070');},
 sun:(c)=>{for(let i=0;i<8;i++){const a=i/8*6.283;L([16+Math.cos(a)*10,16+Math.sin(a)*10,16+Math.cos(a)*14,16+Math.sin(a)*14],'#f0a020',2.4);}O(16,16,8,'#ffd040');if(c==='rise'){RR(0,20,32,12,0,'#3a6ab0',0);}},
 snow:()=>{for(let i=0;i<3;i++){const a=i/3*Math.PI;L([16+Math.cos(a)*13,16+Math.sin(a)*13,16-Math.cos(a)*13,16-Math.sin(a)*13],'#8ac8f0',3);}O(16,16,3,'#e8f6ff',1);},
 bolt:()=>{P([18,2,6,18,14,18,11,30,26,12,17,12,22,2],'#ffd040');},
 wind:(c)=>{L([4,11,20,11],c||'#8ab0d0',2.6);g.beginPath();g.arc(20,7,4,Math.PI/2,Math.PI*1.9,true);g.stroke();L([4,18,25,18],c||'#8ab0d0',2.6);g.beginPath();g.arc(25,22,4,-Math.PI/2,Math.PI*.9);g.stroke();L([4,25,14,25],c||'#8ab0d0',2.6);},
 swirl:(c)=>{g.beginPath();for(let i=0;i<60;i++){const a=i*.2,r=1+i*.2;g.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r);}g.lineWidth=2.6;g.strokeStyle=c||'#7a5ad0';g.stroke();},
 bubbles:(c)=>{for(const [x,y,r] of [[12,19,7],[22,10,5],[23,24,4]]){O(x,y,r,'rgba(170,220,255,.6)');HL(x-r*.35,y-r*.35,r*.25);}},
 head:(c,v)=>{const ear={cat:1,fox:1,wolf:1,dog:2,horse:3,bear:4,rat:4,bat:5,dragon:6}[v]||0;const k=c||'#a07040';
  if(ear===1){P([6,14,8,3,14,10],k);P([26,14,24,3,18,10],k);}else if(ear===2){E(7,14,4,8,sh(k,.8),1.4,.3);E(25,14,4,8,sh(k,.8),1.4,-.3);}else if(ear===3){P([10,9,12,2,15,8],k);P([22,9,20,2,17,8],k);}else if(ear===4){O(8,9,5,k);O(24,9,5,k);}else if(ear===5){P([5,16,6,2,14,12],k);P([27,16,26,2,18,12],k);}else if(ear===6){P([8,10,4,2,13,8],'#e8d8a8');P([24,10,28,2,19,8],'#e8d8a8');}
  if(ear===3){E(16,17,8,12,k);E(16,26,6,4,sh(k,1.2),1.2);O(13,13,1.6,OL,0);O(19,13,1.6,OL,0);L([12,8,16,5,20,8],sh(k,.55),2.4);return;}
  O(16,17,11,k);if(v==='fox'||v==='wolf'||v==='dog'||v==='rat'){E(16,23,6,5,sh(k,1.3),1.2);}else E(16,22,5,3.5,sh(k,1.15),1);O(12,15,2,OL,0);O(20,15,2,OL,0);O(12.5,14.5,.7,'#fff',0);O(20.5,14.5,.7,'#fff',0);
  O(16,21,v==='rat'?1.4:1.8,v==='rat'||v==='cat'?'#e08090':OL,0);if(v==='cat'||v==='rat'){L([6,20,11,21],OL,.8);L([26,20,21,21],OL,.8);L([6,23,11,22],OL,.8);L([26,23,21,22],OL,.8);}if(v==='dragon'){O(12,15,2,'#ffd040',0);O(20,15,2,'#ffd040',0);P([14,25,16,29,18,25],'#fff',0);}},
 fish:(c)=>{E(14,16,10,7,c||'#4a9ad0');P([23,16,30,9,30,23],c||'#4a9ad0');O(9,14,1.6,OL,0);L([13,11,15,21],sh(c||'#4a9ad0',.7),1);},
 bird:(c)=>{E(15,18,9,7,c||'#6a8ad0');O(21,12,5,c||'#6a8ad0');P([25,12,30,13,25,14.5],'#f0a020');O(22,11,1.2,OL,0);P([6,16,2,12,3,20],c||'#6a8ad0');},
 bug:(c,v)=>{if(v==='spider'){for(const s of [-1,1])for(let i=0;i<4;i++)L([16,17,16+s*12,10+i*5,16+s*14,14+i*5],OL,1.4);O(16,18,6,c||'#3a2a2a');O(16,11,4,c||'#3a2a2a');O(14.5,10,1,'#d03030',0);O(17.5,10,1,'#d03030',0);return;}
  if(v==='scorp'){g.beginPath();g.moveTo(16,20);g.quadraticCurveTo(28,22,26,8);g.lineWidth=3;g.strokeStyle=c;g.stroke();P([26,8,23,4,29,5],c);E(13,20,7,4,c);for(const s of [-1,1])L([8,19,3,15+s*3],c,2);return;}
  if(v==='bee'){E(16,18,9,7,'#f0c020');for(const x of [13,18])L([x,12,x,24],OL,2.2);E(12,9,5,4,'rgba(220,240,255,.8)',1,-.4);E(20,9,5,4,'rgba(220,240,255,.8)',1,.4);return;}
  if(v==='snail'){O(18,16,8,'#c08040');g.beginPath();g.arc(18,16,4,0,6);g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();P([4,26,28,26,26,22,8,22],'#c8b090');L([6,22,4,16],OL,1.2);return;}
  for(const s of [-1,1])for(let i=0;i<3;i++)L([16,15+i*4,16+s*11,12+i*6],OL,1.3);E(16,18,7,9,c||'#3a7a3a');O(16,8,4,sh(c||'#3a7a3a',.8));L([16,10,16,27],OL,1);},
 lizard:(c)=>{E(15,16,8,4,c||'#5a9a3a',1.6,.3);O(23,12,4,c||'#5a9a3a');L([8,13,2,6],c||'#5a9a3a',2.4);for(const [a,b,x,y] of [[12,17,8,24],[18,19,20,26],[12,14,8,8],[18,13,22,8]])L([a,b,x,y],c||'#5a9a3a',2);},
 roo:()=>{E(14,19,8,9,'#b07a40');O(20,9,5,'#b07a40');P([18,5,19,0,21,5],'#b07a40');L([8,24,2,30],'#b07a40',3);L([16,27,22,29],'#b07a40',3);O(22,8,1,OL,0);},
 paw:(c)=>{E(16,21,7,6,c||'#7a5030');for(const [x,y] of [[8,13],[13,8],[19,8],[24,13]])O(x,y,3.2,c||'#7a5030');},
 tooth:()=>{g.beginPath();g.moveTo(8,8);g.quadraticCurveTo(16,2,24,8);g.quadraticCurveTo(24,18,20,28);g.lineTo(17,18);g.lineTo(15,18);g.lineTo(12,28);g.quadraticCurveTo(8,18,8,8);fs('#f4f0e6');},
 bone:()=>{g.save();g.translate(16,16);g.rotate(-.7);RR(-9,-2.5,18,5,2,'#ece6d8');for(const x of [-10,10])for(const y of [-3,3])O(x,y,3.6,'#ece6d8');RR(-9,-2.5,18,5,2,'#ece6d8',0);g.restore();},
 feather:(c)=>{g.beginPath();g.moveTo(26,4);g.quadraticCurveTo(4,8,6,26);g.quadraticCurveTo(24,24,26,4);fs(c||'#e8e0f0');L([26,4,4,28],'#8a7a6a',1.4);},
 horse:(c)=>{D.head(c||'#8a5a30','horse');},
 person:(c,v)=>{const k=c||'#3a6ab0',sk='#f0c8a0';if(v==='run'){O(19,6,3.5,sk);L([18,10,14,18],k,4);L([14,18,8,25],k,3);L([14,18,20,22,19,28],k,3);L([16,12,22,15],k,2.6);L([16,12,10,13],k,2.6);return;}
  if(v==='walk'){O(16,6,3.5,sk);L([16,10,16,19],k,4);L([16,19,12,28],k,3);L([16,19,20,28],k,3);L([16,12,12,18],k,2.6);L([16,12,20,17],k,2.6);return;}
  if(v==='climb'){O(14,8,3.5,sk);L([14,12,15,20],k,4);L([15,20,11,27],k,3);L([15,20,20,24],k,3);L([14,13,20,4],k,2.6);L([14,13,8,8],k,2.6);RR(22,2,4,28,1,'#8a8a90');return;}
  if(v==='pair'){for(const [x,cc] of [[11,'#6a8ad0'],[21,'#c07040']]){O(x,10,4.5,sk);g.beginPath();g.arc(x,26,7,Math.PI,0);g.closePath();fs(cc);}return;}
  if(v==='guard'){O(16,13,8,sk);g.beginPath();g.arc(16,11,8.5,Math.PI,0);g.closePath();fs('#2a3a6a');RR(8,10,16,3,1,'#2a3a6a');O(16,10,2,'#e0b030',1);O(13,15,1.2,OL,0);O(19,15,1.2,OL,0);g.beginPath();g.arc(16,32,11,Math.PI,0);g.closePath();fs('#2a3a6a');return;}
  if(v==='arm'){g.beginPath();g.moveTo(8,28);g.quadraticCurveTo(6,14,14,10);g.quadraticCurveTo(14,4,20,6);g.quadraticCurveTo(26,8,22,13);g.quadraticCurveTo(28,18,24,28);g.closePath();fs(sk);return;}
  if(v==='hand'){RR(9,12,14,16,5,sk);for(let i=0;i<4;i++)RR(9+i*3.6,3+(i===0||i===3?3:0),3.2,12,1.6,sk);RR(4,15,7,4,2,sk,1.4);return;}
  // Gesichter
  const fc=v==='devil'?'#d03030':v==='ghost'?'#f4f4f8':v==='oni'?'#c03030':v==='vamp'?'#e8e0e8':'#f4c860';if(v==='ghost'){g.beginPath();g.arc(16,14,11,Math.PI,0);g.lineTo(27,28);for(let x=27;x>5;x-=5.5)g.lineTo(x-2.75,25);g.lineTo(5,28);g.closePath();fs(fc);O(12,13,2,OL,0);O(20,13,2,OL,0);return;}
  O(16,16,12,fc);if(v==='devil'||v==='oni'){P([6,8,8,1,12,6],fc);P([26,8,24,1,20,6],fc);}
  if(v==='sleep'){L([10,15,14,15],OL,1.6);L([18,15,22,15],OL,1.6);E(16,22,2,2,OL,0);g.fillStyle='#4a6ad0';g.font='bold 9px Georgia';g.fillText('z',24,8);return;}
  if(v==='dizzy'){for(const x of [12,20]){L([x-2,13,x+2,17],OL,1.4);L([x+2,13,x-2,17],OL,1.4);}E(16,22,3,2,OL,0);return;}
  if(v==='hurt'){O(12,14,1.6,OL,0);O(20,14,1.6,OL,0);L([12,22,20,21],OL,1.4);RR(5,6,22,5,1,'#f4f0f0');return;}
  if(v==='hush'){O(12,14,1.6,OL,0);O(20,14,1.6,OL,0);L([16,17,16,27],'#f0c8a0',3.5);return;}
  O(12,14,1.7,OL,0);O(20,14,1.7,OL,0);g.beginPath();g.arc(16,18,5,.3,Math.PI-.3);g.strokeStyle=OL;g.lineWidth=1.5;g.stroke();if(v==='vamp'){P([13,22,14,26,15,22],'#fff',.6);P([17,22,18,26,19,22],'#fff',.6);}if(v==='cat'){P([6,10,7,3,12,7],fc);P([26,10,25,3,20,7],fc);}},
 slot:()=>{RR(5,4,22,25,3,'#7a1a3a');RR(8,9,16,9,1,'#f8f4e8');for(const [x,c] of [[11,'#d03030'],[16,'#e0b030'],[21,'#3a9a3a']])O(x,13.5,2.4,c,0);L([28,10,28,20],'#9aa0aa',2);O(28,9,2.4,'#d03030');RR(8,21,16,4,1,'#e0b030');},
 dice:()=>{RR(5,5,22,22,4,'#f8f4e8');for(const [x,y] of [[11,11],[21,11],[16,16],[11,21],[21,21]])O(x,y,2,OL,0);},
 card:(c)=>{g.save();g.translate(16,16);g.rotate(-.2);RR(-9,-12,18,24,2.5,'#f8f4e8');g.fillStyle=c==='back'?'#7a1a2a':c||'#d03030';if(c==='back')RR(-6.5,-9.5,13,19,1.5,'#7a1a2a',0);else{g.font='bold 14px Georgia';g.textAlign='center';g.fillText(c==='#1a1a1a'?'♠':'♥',0,5);}g.restore();},
 wheel:()=>{O(16,16,13,'#6a3a18');for(let i=0;i<12;i++){g.beginPath();g.moveTo(16,16);g.arc(16,16,11,i/12*6.283,(i+1)/12*6.283);g.closePath();g.fillStyle=i===0?'#1f7a3a':i%2?'#c62828':'#1a1a1a';g.fill();}O(16,16,5,'#c8a040');O(20,8,1.8,'#fff',0);},
 dot:(c)=>{O(16,16,11,c);HL(12,12,2.6);},
 sq:(c)=>{RR(5,5,22,22,3,c);},
 bell:()=>{g.beginPath();g.moveTo(16,4);g.bezierCurveTo(24,4,24,14,25,22);g.lineTo(28,25);g.lineTo(4,25);g.lineTo(7,22);g.bezierCurveTo(8,14,8,4,16,4);fs('#e8b830');O(16,27,3,'#c89020');HL(12,10,2);},
 palette:()=>{g.beginPath();g.ellipse(16,16,13,11,0,0,7);fs('#e8c890');O(20,21,3,'#fff',1);for(const [x,y,c] of [[9,13,'#d03030'],[14,8,'#e0b030'],[21,9,'#3a9a3a'],[25,15,'#3060d0']])O(x,y,2.6,c,1);},
 chart:()=>{RR(4,4,24,24,2,'#f8f4e8');for(const [x,h,c] of [[8,8,'#3060d0'],[14,14,'#3a9a3a'],[20,18,'#d03030']])RR(x,25-h,4.5,h,.5,c,1);},
 folder:(c)=>{P([3,8,12,8,14,11,29,11,29,27,3,27],c||'#e0b040');if(c==='out')L([16,24,16,14,12,18],OL,1.8);},
 disk:()=>{RR(4,4,24,24,2,'#3a5aa0');RR(9,4,14,9,1,'#d8dde4');RR(9,18,14,10,1,'#f8f4e8');},
 trash:()=>{RR(8,10,16,19,2,'#9aa0aa');RR(5,6,22,4,1,'#8a909a');RR(13,3,6,4,1,'#8a909a');for(const x of [12,16,20])L([x,14,x,25],OL,1.2);},
 monitor:()=>{RR(3,5,26,17,2,'#3a3a40');RR(5,7,22,13,1,'#6ab0e0',0);RR(13,22,6,4,0,'#3a3a40');RR(9,26,14,3,1,'#3a3a40');},
 speaker:()=>{P([4,12,10,12,17,5,17,27,10,20,4,20],'#3a3a40');for(const r of [5,9])L([21,16-r*.7,21+r*.5,16,21,16+r*.7],'#3a3a40',2);},
 keyboard:()=>{RR(2,9,28,15,2,'#3a3a40');for(let i=0;i<14;i++)RR(5+(i%7)*3.5,12+Math.floor(i/7)*4,2.6,2.6,.5,'#e8e8ec',0);RR(9,20,14,2.5,.5,'#e8e8ec',0);},
 mouse:()=>{RR(9,4,14,24,7,'#e8e8ec');L([16,4,16,13],OL,1.2);RR(15,7,2,4,1,'#3a3a40',0);},
 pad:()=>{RR(3,10,26,14,7,'#3a3a40');L([9,14,9,20],'#e8e8ec',2);L([6,17,12,17],'#e8e8ec',2);O(22,15,1.8,'#d03030',0);O(25,18,1.8,'#3a9a3a',0);},
 cam:()=>{RR(3,10,20,14,2,'#3a3a40');P([23,14,29,10,29,24,23,20],'#3a3a40');O(10,8,4,'#3a3a40');O(18,8,4,'#3a3a40');},
 piano:()=>{RR(3,8,26,18,2,'#2a1e18');RR(5,15,22,9,0,'#f8f4e8',0);for(let x=8;x<26;x+=4)RR(x,15,2,5,0,'#2a1e18',0);},
 note:(c)=>{O(10,24,4,c||'#3a3a40');O(22,21,4,c||'#3a3a40');L([13.5,24,13.5,6,25.5,3,25.5,21],c||'#3a3a40',2.4);},
 party:()=>{P([4,28,12,8,24,20],'#e0b030');for(const [x,y,c] of [[18,5,'#d03030'],[26,9,'#3060d0'],[24,14,'#3a9a3a'],[13,4,'#a050d0']])RR(x,y,3,3,.5,c,0);L([14,13,20,19],'#d03030',2);},
 trophy:()=>{g.beginPath();g.moveTo(8,4);g.lineTo(24,4);g.quadraticCurveTo(24,18,16,19);g.quadraticCurveTo(8,18,8,4);fs('#e8b830');for(const s of [-1,1]){g.beginPath();g.arc(16+s*9,9,4,s<0?Math.PI*.5:-Math.PI*.5,s<0?Math.PI*1.5:Math.PI*.5);g.lineWidth=2.4;g.strokeStyle='#c89020';g.stroke();}RR(14,19,4,5,0,'#c89020');RR(9,24,14,5,1,'#8a5a2a');},
 trident:()=>{L([16,30,16,6],'#c8a040',2.6);g.beginPath();g.moveTo(8,4);g.quadraticCurveTo(8,12,16,12);g.quadraticCurveTo(24,12,24,4);g.lineWidth=2.4;g.strokeStyle='#c8a040';g.stroke();for(const x of [8,16,24])P([x-2.5,6,x,1,x+2.5,6],'#c8a040',1);},
 boomer:()=>{g.beginPath();g.moveTo(5,26);g.quadraticCurveTo(10,6,28,6);g.lineTo(26,11);g.quadraticCurveTo(14,11,10,27);g.closePath();fs('#a06a30');},
 rope:()=>{g.beginPath();g.arc(16,16,10,0,7);g.lineWidth=4;g.strokeStyle='#c8a060';g.stroke();g.beginPath();g.arc(16,16,5,0,7);g.stroke();L([24,22,29,29],'#c8a060',4);},
 bandage:()=>{g.save();g.translate(16,16);g.rotate(-.7);RR(-14,-5,28,10,4,'#f0d0a8');RR(-5,-5,10,10,0,'#f8f0e6');for(const x of [-2,2])for(const y of [-2,2])O(x,y,.8,'#c8a080',0);g.restore();},
 basket:()=>{g.beginPath();g.arc(16,13,9,Math.PI,0);g.lineWidth=2.6;g.strokeStyle='#8a5a2a';g.stroke();P([4,14,28,14,25,28,7,28],'#c8904a');for(let y=17;y<28;y+=4)L([6,y,26,y],'#8a5a2a',1);},
 flag:(c)=>{L([8,3,8,30],'#6a4020',2.6);P([9,4,27,8,9,16],c||'#d03030');},
 door:()=>{RR(7,3,18,26,2,'#8a5a2a');for(const x of [11,16,21])L([x,5,x,27],'#6a4020',1);O(21,17,1.6,'#e0b030',0);},
 window:()=>{RR(5,5,22,22,1,'#8a5a2a');RR(7,7,18,18,0,'#8ac8f0',0);L([16,6,16,26],'#8a5a2a',2.2);L([6,16,26,16],'#8a5a2a',2.2);},
 cart:()=>{P([3,7,8,7,11,20,26,20,28,11,9,11],'#9aa0aa');O(13,25,2.6,'#3a3a40');O(24,25,2.6,'#3a3a40');},
 chain:()=>{for(let i=0;i<3;i++){g.save();g.translate(8+i*8,8+i*8);g.rotate(.8);g.beginPath();g.ellipse(0,0,6,3.5,0,0,7);g.lineWidth=2.6;g.strokeStyle='#8a909a';g.stroke();g.restore();}},
 rod:()=>{L([5,28,26,5],'#8a5a2a',2.4);L([26,5,26,22],'#d8d8d8',1);g.beginPath();g.arc(23,24,3,0,Math.PI);g.strokeStyle='#8a909a';g.lineWidth=1.6;g.stroke();O(9,24,3,'#3a3a40');},
 rock:(c)=>{P([4,24,8,12,16,7,25,11,28,24],c||'#8a8a90');P([8,12,16,7,25,11,18,14],sh(c||'#8a8a90',1.2),0);},
 wood:()=>{for(const [y,o] of [[10,0],[20,3]]){RR(3+o,y-4,24,9,4.5,'#8a5a2a');E(27+o,y+.5,3.5,4.5,'#d8a868');}},
 wheat:()=>{for(const s of [-1,0,1]){L([16,29,16+s*7,8],'#c8a040',1.6);for(let i=0;i<4;i++)E(16+s*7*(1-i*.18)-s*.5,8+i*4,2,3,'#e8c050',.8,s*.4);}},
 statue:(c)=>{RR(8,24,16,5,1,'#8a8a90');O(16,8,4,c||'#b8b8c0');RR(11,12,10,12,3,c||'#b8b8c0');},
 barrel:(c)=>{E(16,16,10,13,c||'#8a5a2a');for(const y of [8,16,24])L([7,y,25,y],'#3a3a40',1.6);E(16,4,7,2,sh(c||'#8a5a2a',1.2),1);},
 pen:()=>{g.save();g.translate(16,16);g.rotate(.7);P([-2,-14,2,-14,2,8,0,13,-2,8],'#3a3a40');P([-1,8,1,8,0,12],'#e0b030',0);g.restore();},
 globe:()=>{O(16,14,11,'#4a8ad0');P([10,7,16,6,17,12,12,15,9,12],'#4aa050',0);P([18,15,23,14,24,20,19,22],'#4aa050',0);g.beginPath();g.arc(16,14,11,0,7);g.strokeStyle=OL;g.lineWidth=1.4;g.stroke();RR(13,26,6,3,1,'#8a5a2a');},
 bath:()=>{g.beginPath();g.moveTo(3,14);g.lineTo(29,14);g.quadraticCurveTo(29,27,16,27);g.quadraticCurveTo(3,27,3,14);fs('#f4f4f8');E(16,15,12,2.5,'#8ac8f0',0);for(const x of [10,22])O(x,9,2.4,'rgba(200,230,255,.8)',1);},
 fountain:()=>{E(16,25,13,4,'#a8a8b0');RR(14,13,4,12,1,'#a8a8b0');E(16,13,7,2.5,'#a8a8b0');for(const s of [-1,1]){g.beginPath();g.moveTo(16,10);g.quadraticCurveTo(16+s*8,0,16+s*11,20);g.lineWidth=1.8;g.strokeStyle='#6ab0e0';g.stroke();}},
 sign:()=>{L([16,30,16,6],'#6a4020',2.6);P([6,7,24,7,28,11,24,15,6,15],'#c8904a');P([26,17,8,17,4,21,8,25,26,25],'#c8904a');},
 bucket:()=>{P([6,9,26,9,23,28,9,28],'#9aa0aa');E(16,9,10,3,'#6ab0e0');g.beginPath();g.arc(16,9,9,Math.PI,0);g.lineWidth=1.4;g.strokeStyle=OL;g.stroke();},
 fence:()=>{for(const x of [6,16,26])P([x-3,28,x-3,9,x,5,x+3,9,x+3,28],'#c8904a',1.2);RR(2,13,28,3,0,'#a8703a',1);RR(2,21,28,3,0,'#a8703a',1);},
 swing:()=>{L([6,29,10,4,22,4,26,29],'#8a5a2a',2.6);L([13,4,13,20],'#c8a060',1.2);L([19,4,19,20],'#c8a060',1.2);RR(11,20,10,3,1,'#a8703a');},
 frame:(c)=>{RR(4,5,24,22,1,'#c8a040');RR(7,8,18,16,0,'#8ac8f0',0);P([7,24,13,15,18,20,22,16,25,24],'#4aa050',0);O(21,12,2.4,'#ffd040',0);},
 yarn:(c)=>{O(16,16,11,c||'#d06090');for(const a of [-.6,.1,.8]){g.beginPath();g.ellipse(16,16,10,4,a,0,7);g.strokeStyle=sh(c||'#d06090',.7);g.lineWidth=1;g.stroke();}L([24,24,30,30],c||'#d06090',1.4);},
 mirror:()=>{E(16,14,9,11,'#c8a040');E(16,14,6.5,8.5,'#cfe0ec',1);L([12,9,14,7],'#fff',1.4);RR(13,25,6,4,1,'#c8a040');},
 vase:(c)=>{g.beginPath();g.moveTo(12,4);g.lineTo(20,4);g.lineTo(19,9);g.quadraticCurveTo(27,15,22,28);g.lineTo(10,28);g.quadraticCurveTo(5,15,13,9);g.closePath();fs(c||'#c87a40');L([9,17,23,17],sh(c||'#c87a40',.7),1.6);},
 chair:(c)=>{RR(9,4,14,13,2,c||'#8a5a2a');RR(7,16,18,4,1,c||'#8a5a2a');L([9,20,9,29],OL,2.4);L([23,20,23,29],OL,2.4);},
 candle:()=>{RR(12,12,8,16,1,'#f4ecd8');E(16,7,2.5,4.5,'#ffb040');RR(9,27,14,3,1,'#c8a040');},
 magnify:()=>{O(13,13,8,'#cfe8f4');g.beginPath();g.arc(13,13,8,0,7);g.lineWidth=3;g.strokeStyle='#5a3a1a';g.stroke();L([19,19,28,28],'#5a3a1a',4);},
 ruler:()=>{g.save();g.translate(16,16);g.rotate(-.7);RR(-14,-4,28,8,1,'#e8c050');for(let x=-12;x<13;x+=3)L([x,-4,x,x%2?-1:0],OL,1);g.restore();},
 warn:(c)=>{P([16,3,30,28,2,28],c||'#f0c020');RR(14.5,10,3,10,1,OL,0);O(16,24,1.8,OL,0);},
 qmark:(c)=>{O(16,16,12,c||'#3060d0');g.fillStyle='#fff';g.font='bold 18px Georgia';g.textAlign='center';g.fillText('?',16,23);},
 xmark:(c)=>{O(16,16,12,c||'#d03030');L([11,11,21,21],'#fff',3.2);L([21,11,11,21],'#fff',3.2);},
 check:(c)=>{RR(4,4,24,24,4,c||'#3a9a3a');L([9,16,14,21,23,10],'#fff',3.4);},
 excl:(c)=>{O(16,16,12,c||'#d03030');RR(14.5,8,3,11,1,'#fff',0);O(16,23,1.9,'#fff',0);},
 alarm:()=>{g.beginPath();g.arc(16,18,9,Math.PI,0);g.lineTo(25,26);g.lineTo(7,26);g.closePath();fs('#e03030');RR(5,25,22,4,1,'#6a6a70');for(const s of [-1,1])L([16+s*11,9,16+s*14,6],'#e03030',2);HL(13,15,2);},
 up:()=>{P([16,3,27,15,20,15,20,28,12,28,12,15,5,15],'#3a9a3a');},
 down:()=>{P([16,29,27,17,20,17,20,4,12,4,12,17,5,17],'#3060d0');},
 boot:(c)=>{P([9,3,19,3,19,19,28,22,28,28,6,28,9,18],c||'#7a4a20');L([9,8,19,8],sh(c||'#7a4a20',.7),1.4);},
 couch:(c)=>{D.sofa(c);},
 stairs:()=>{P([3,28,3,22,11,22,11,15,19,15,19,8,27,8,27,28],'#a8a8b0');},
 spiderweb:()=>{for(let i=0;i<8;i++){const a=i/8*6.283;L([16,16,16+Math.cos(a)*14,16+Math.sin(a)*14],'#c8c8d0',1);}for(const r of [4,8,12]){g.beginPath();for(let i=0;i<=8;i++){const a=i/8*6.283;g.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r);}g.strokeStyle='#c8c8d0';g.lineWidth=1;g.stroke();}},
 tomb:()=>{g.beginPath();g.moveTo(8,28);g.lineTo(8,12);g.arc(16,12,8,Math.PI,0);g.lineTo(24,28);g.closePath();fs('#9a9aa2');L([16,10,16,20],OL,1.6);L([12,14,20,14],OL,1.6);RR(4,27,24,3,1,'#5a8a3a');},
 cash:()=>{g.save();g.translate(16,16);g.rotate(-.25);RR(-13,-7,26,14,2,'#6ab04a');O(0,0,4,'#4a8a3a');g.restore();for(const [x,y] of [[26,7],[28,13]])L([x-3,y,x+3,y],'#6ab04a',2);},
 upload:()=>{RR(4,18,24,10,2,'#8a909a');P([16,3,24,12,19,12,19,20,13,20,13,12,8,12],'#3a9a3a');},
 skip:()=>{P([4,6,15,16,4,26],'#e8e0d0');P([15,6,26,16,15,26],'#e8e0d0');RR(25,6,3,20,1,'#e8e0d0');},
 spark2:()=>{D.spark('#ffe066');},
 mine:()=>{D.hammer(null,'pick');},
};
// ---- Emoji → Icon
const M={};const def=(list,d,c,v)=>{for(const e of list)M[e]=[d,c,v];};
def(['🧪','⚗'],'pot','#d04060');def(['🔮'],'orb','#9a5ad0');def(['💎'],'gem','#5ac8f0');def(['🔷'],'gem','#3a7ad8');def(['💠'],'gem','#5ab0e0');def(['💍'],'ring','#5ac8f0');
def(['🪙'],'coin');def(['💸'],'cash');def(['💰'],'bag','#a06a30');def(['🎒'],'pack','#b04a2a');def(['🧺'],'basket');
def(['❤','♥️'],'heart','#d82a3a');def(['💜'],'heart','#8a4ad0');def(['💚'],'heart','#3aa04a');def(['💗'],'heart','#f06aa0');
def(['⭐','🌟'],'star','#f6c832');def(['✨','💫'],'spark','#ffe066');def(['🏵','🎖'],'medal','#e8b830');
def(['🔥','🜂'],'fire');def(['💥'],'boom');def(['💧','🚿'],'drop','#4a9ae0');def(['🩸'],'drop','#c02030');
def(['🌿','🥬'],'leaf','#3aa04a');def(['🌱'],'sprout','#4ab04a');def(['🍀'],'clover','#3aa04a');
def(['🌸'],'flower','#f4a0c0');def(['🌻'],'flower','#f6c020');def(['🌼'],'flower','#f8e070');def(['🌺'],'flower','#e04a6a');def(['🪻'],'flower','#9a6ad8');def(['🌷'],'tulip','#e04a6a');def(['🌹'],'rose','#c82030');def(['🥀'],'rose','#7a3040');
def(['🌳'],'tree','#3a8a3a');def(['🌲'],'tree','#2a6a3a','pine');def(['🌵'],'tree','#4a9a3a','cactus');def(['🪴'],'plant','#3a9a3a');
def(['🥕'],'veg',null,'carrot');def(['🍅'],'veg','#e03a2a');def(['🧅'],'veg','#d8a060');def(['🧄'],'veg','#f0ece0');def(['🍓'],'veg','#e02a3a');def(['🫑'],'veg','#3aa03a');def(['🍒'],'veg','#c81a2a','berry');
def(['🥒'],'veg','#4a9a3a','long');def(['🌽'],'veg',null,'corn');def(['🍄'],'veg','#d03030','mush');def(['🎃'],'veg','#f07a20','pumpkin');def(['🍋'],'veg','#f6d840','lemon');
def(['🥖','🍞'],'bread','#d8a050');def(['🫓'],'bread','#e8c890');def(['🥧'],'pie');def(['🍰'],'cake');def(['🍲','🥣'],'bowl','#d87a30');def(['🥗'],'bowl','#5ab04a');def(['🍽','🥢'],'plate');def(['🍳'],'pan');def(['🍺'],'mug');
def(['⚔'],'sword',null,'x');def(['🗡'],'sword');def(['🛡','⛨'],'shield','#3a5aa0');def(['🏹'],'bow');def(['🎯'],'target');def(['🪓'],'axe');
def(['🔨'],'hammer');def(['⚒'],'hammer',null,'two');def(['🛠'],'wrench');def(['⛏'],'hammer',null,'pick');def(['🪚'],'hammer',null,'saw');
def(['☠','💀'],'skull');def(['👑'],'crown');def(['📜'],'scroll');def(['📋'],'clip');def(['📃'],'scroll');def(['📓'],'book','#3a5a3a');def(['📕'],'book','#a02828');def(['📖'],'book','#7a4a20');def(['📚'],'books');
def(['🗺'],'map');def(['🧭'],'compass');def(['📍'],'pin','#d03030');def(['🔭'],'scope');def(['🔒'],'lock');def(['🔓'],'lock',null,'open');def(['🗝'],'key');def(['⚖'],'scale');
def(['🏠'],'house');def(['🏡'],'house',null,'garden');def(['🏘'],'house',null,'village');def(['🏰'],'house',null,'castle');def(['⛪'],'house',null,'church');def(['🏗'],'house',null,'build');def(['🏪'],'house','#d03030','shop');def(['⛺'],'house','#3a7a4a','tent');def(['🗼'],'house','#5a5a70','tower');
def(['🏮'],'lantern','#ff7a30');def(['🛏'],'bed');def(['🛋'],'sofa');def(['📦'],'box');def(['🧰'],'toolbox');def(['⚙'],'gear');def(['👁'],'eye');def(['💡'],'bulb');def(['💬'],'speech');def(['📣'],'mega');def(['📯'],'horn');
def(['🕰','🕐'],'clock');def(['⏱'],'clock');def(['⏳','⌛'],'hourglass');def(['📅'],'cal');def(['🌙'],'moon');def(['🌕'],'moon','full');def(['☀'],'sun');def(['🌅'],'sun','rise');def(['❄'],'snow');def(['⚡'],'bolt');def(['💨'],'wind');def(['🌫'],'wind','#b0b0c0');def(['🌀'],'swirl');def(['🫧'],'bubbles');
def(['🐴','🐎'],'head','#8a5a30','horse');def(['🐺'],'head','#7a7a88','wolf');def(['🐱','😺','😻'],'head','#e0a050','cat');def(['🦊'],'head','#e07a20','fox');def(['🐕'],'head','#c8904a','dog');def(['🐻'],'head','#7a4a20','bear');def(['🐀'],'head','#8a7a6a','rat');def(['🦇'],'head','#4a3a4a','bat');def(['🐉'],'head','#3a8a3a','dragon');
def(['🐟'],'fish','#4a9ad0');def(['🐠'],'fish','#f08020');def(['🐦'],'bird','#5a8ad0');def(['🦌'],'head','#a87040','dog');def(['🐝'],'bug',null,'bee');def(['🕷'],'bug','#3a2a2a','spider');def(['🦂'],'bug','#b07030','scorp');def(['🪲'],'bug','#3a6a5a');def(['🦗'],'bug','#6ab04a');def(['🐌'],'bug',null,'snail');def(['🦎'],'lizard');def(['🦘'],'roo');def(['🐾'],'paw');def(['🦷'],'tooth');def(['🦴'],'bone');def(['🪶'],'feather');def(['🪽'],'feather','#f4f4f8');
def(['🚶'],'person',null,'walk');def(['🏃'],'person',null,'run');def(['🧗'],'person',null,'climb');def(['👥'],'person',null,'pair');def(['👮'],'person',null,'guard');def(['💪'],'person',null,'arm');def(['✋','🖐'],'person',null,'hand');
def(['🙂'],'person',null,'smile');def(['😴'],'person',null,'sleep');def(['😵'],'person',null,'dizzy');def(['🤕'],'person',null,'hurt');def(['🤫'],'person',null,'hush');def(['😈'],'person',null,'devil');def(['👹','👺'],'person',null,'oni');def(['👻'],'person',null,'ghost');def(['🧛'],'person',null,'vamp');
def(['🎰'],'slot');def(['🎲'],'dice');def(['🃏'],'card','#d03030');def(['🂡'],'card','#1a1a1a');def(['🂠'],'card','back');def(['🎡'],'wheel');
def(['🔴','🟥'],'dot','#d03030');def(['🟠','🟧'],'dot','#f08020');def(['🟢'],'dot','#3aa04a');def(['🟣'],'dot','#8a4ad0');def(['🟤','🟫'],'dot','#8a5a30');def(['⚫'],'dot','#2a2a30');
def(['🔔'],'bell');def(['🎨'],'palette');def(['📊'],'chart');def(['📂','📁'],'folder','#e0b040');def(['💾'],'disk');def(['🗑'],'trash');def(['🖥'],'monitor');def(['🔊'],'speaker');def(['⌨'],'keyboard');def(['🖱'],'mouse');def(['🎮'],'pad');def(['🎥'],'cam');
def(['🎹'],'piano');def(['🎼'],'note');def(['🎉'],'party');def(['🏆'],'trophy');def(['🔱'],'trident');def(['🪃'],'boomer');def(['🪢'],'rope');def(['🩹'],'bandage');def(['🚩'],'flag','#d03030');def(['🚪'],'door');def(['🪟'],'window');def(['🛒'],'cart');def(['⛓'],'chain');def(['🎣'],'rod');
def(['🪨'],'rock');def(['🪵'],'wood');def(['🌾'],'wheat');def(['🗿'],'statue','#9a9aa2');def(['🗽'],'statue','#6ab09a');def(['🛢'],'barrel');def(['✒'],'pen');def(['🌍'],'globe');def(['🛁'],'bath');def(['⛲'],'fountain');def(['🪧'],'sign');def(['🪣'],'bucket');def(['🚧'],'fence');def(['🎠'],'swing');def(['🖼'],'frame');def(['🧶'],'yarn');def(['🪞'],'mirror');def(['🏺'],'vase');def(['🪑'],'chair');def(['🕯'],'candle');def(['🔍'],'magnify');def(['📏'],'ruler');
def(['⚠'],'warn');def(['⏭'],'skip');def(['❓'],'qmark');def(['❗'],'excl');def(['❌'],'xmark');def(['☑'],'check');def(['🚨'],'alarm');def(['⬇'],'down');def(['📤'],'upload');def(['🥾'],'boot');def(['🪦'],'tomb');def(['🕸'],'spiderweb');def(['🐉'],'head','#3a8a3a','dragon');def(['🍺'],'mug');def(['🔱'],'trident');def(['⚜'],'star','#e8b830');
// alle übrigen Bildzeichen → passendes Ersatz-Icon nach Kategorie
const FALL='star';
const RE=/(?:[\u{1F000}-\u{1FAFF}]|[☀-➿]|[⬀-⯿]|[⌀-⏿])️?/gu;
const KEEP=new Set(['➤','✕','✔','✓','★','✦','✚','♠','♥','♦','♣','♪','♂','♀','↺','✖','⌫','✉','☐','☒']);// Schriftzeichen bleiben Text
const cache=new Map();
function canvasFor(e,px){const k=e+'|'+px;let c=cache.get(k);if(c)return c;c=document.createElement('canvas');c.width=c.height=px;const gg=c.getContext('2d');gg.scale(px/32,px/32);g=gg;const m=M[e]||[FALL,'#e8b830'];try{D[m[0]](m[1],m[2]);}catch(err){}g=null;cache.set(k,c);return c;}
const urlC=new Map();
function url(e){let u=urlC.get(e);if(!u){u=canvasFor(e,64).toDataURL();urlC.set(e,u);}return u;}
const isIc=e=>!KEEP.has(e.replace('️',''));
window.ICONS={has:e=>!!M[e.replace('️','')],url:e=>url(e.replace('️','')),draw(gg,e,x,y,s){gg.drawImage(canvasFor(e.replace('️',''),Math.max(16,Math.ceil(s*(window.devicePixelRatio||1)/8)*8)),x,y,s,s);},RE};
// ---- Canvas: fillText zeichnet Emojis automatisch als Icons
const P0=CanvasRenderingContext2D.prototype,FT=P0.fillText,ST=P0.strokeText,MT=P0.measureText;const RT=/[\u{1F000}-\u{1FAFF}☀-➿⬀-⯿⌀-⏿]/u;
const fsz=ctx=>{const m=/(\d+(?:\.\d+)?)px/.exec(ctx.font);return m?+m[1]:12;};
function split(t){const out=[];let last=0;RE.lastIndex=0;let m;while((m=RE.exec(t))){if(!isIc(m[0]))continue;if(m.index>last)out.push(t.slice(last,m.index));out.push({e:m[0]});last=m.index+m[0].length;}if(last<t.length)out.push(t.slice(last));return out;}
P0.fillText=function(t,x,y,mw){if(typeof t!=='string'||!RT.test(t))return FT.call(this,t,x,y,mw);const parts=split(t);if(parts.length===1&&typeof parts[0]==='string')return FT.call(this,t,x,y,mw);
 const s=fsz(this)*1.08,ws=parts.map(p=>typeof p==='string'?MT.call(this,p).width:s*1.06);let W=ws.reduce((a,b)=>a+b,0);const al=this.textAlign,bl=this.textBaseline;let cx=al==='center'?x-W/2:al==='right'||al==='end'?x-W:x;
 const oy=bl==='middle'?-s/2:bl==='top'||bl==='hanging'?0:bl==='bottom'||bl==='ideographic'?-s:-s*.82;this.textAlign='left';
 parts.forEach((p,i)=>{if(typeof p==='string')FT.call(this,p,cx,y);else{const a=this.globalAlpha;window.ICONS.draw(this,p.e,cx,y+oy,s);this.globalAlpha=a;}cx+=ws[i];});this.textAlign=al;};
P0.strokeText=function(t,x,y,mw){if(typeof t!=='string'||!RT.test(t))return ST.call(this,t,x,y,mw);const parts=split(t);if(parts.length===1&&typeof parts[0]==='string')return ST.call(this,t,x,y,mw);
 const s=fsz(this)*1.08,ws=parts.map(p=>typeof p==='string'?MT.call(this,p).width:s*1.06);const W=ws.reduce((a,b)=>a+b,0),al=this.textAlign;let cx=al==='center'?x-W/2:al==='right'||al==='end'?x-W:x;this.textAlign='left';parts.forEach((p,i)=>{if(typeof p==='string')ST.call(this,p,cx,y);cx+=ws[i];});this.textAlign=al;};
P0.measureText=function(t){if(typeof t==='string'&&RT.test(t)){const s=fsz(this)*1.08;let n=0;const r=t.replace(RE,m=>{if(isIc(m)){n++;return'';}return m;});const w=MT.call(this,r);return{width:w.width+n*s*1.06,actualBoundingBoxAscent:w.actualBoundingBoxAscent,actualBoundingBoxDescent:w.actualBoundingBoxDescent};}return MT.call(this,t);};
// ---- HTML: Emojis in Texten werden zu <i class="ico">-Bildern (MutationObserver, nur für geänderte Stellen)
const st=document.createElement('style');st.textContent='i.ico{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;background-size:contain;background-repeat:no-repeat;background-position:center;font-style:normal}';document.head.appendChild(st);
const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,TITLE:1};
function fixText(n){const t=n.nodeValue;if(!t||!RT.test(t))return;const parts=split(t);if(parts.length===1&&typeof parts[0]==='string')return;const f=document.createDocumentFragment();for(const p of parts){if(typeof p==='string')f.appendChild(document.createTextNode(p));else{const i=document.createElement('i');i.className='ico';i.setAttribute('aria-label',p.e);i.style.backgroundImage=`url(${url(p.e.replace('️',''))})`;f.appendChild(i);}}n.parentNode&&n.parentNode.replaceChild(f,n);}
function walk(root){if(root.nodeType===3){if(root.parentNode&&!SKIP[root.parentNode.nodeName])fixText(root);return;}if(root.nodeType!==1||SKIP[root.nodeName])return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&!SKIP[n.parentNode.nodeName]&&RT.test(n.nodeValue)?1:2});const L=[];let n;while((n=w.nextNode()))L.push(n);L.forEach(fixText);}
function attrs(root){if(root.nodeType!==1)return;const els=[root,...root.querySelectorAll('[title],[placeholder]')];for(const e of els)for(const a of ['title','placeholder']){const v=e.getAttribute&&e.getAttribute(a);if(v&&RT.test(v))e.setAttribute(a,v.replace(RE,m=>isIc(m)?'':m).trim());}}
const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')walk(m.target);else for(const n of m.addedNodes){walk(n);attrs(n);}}});
const start=()=>{walk(document.body);attrs(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true});};
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
// CSS-Inhalte (z. B. „SPRINT 🔒“) werden einmalig ersetzt
document.addEventListener('DOMContentLoaded',()=>{for(const sh2 of document.styleSheets){let rules;try{rules=sh2.cssRules;}catch(e){continue;}for(const r of rules||[]){if(r.style&&r.style.content&&RT.test(r.style.content))r.style.content=r.style.content.replace(RE,m=>isIc(m)?'':m);}}});
})();
