/* Cullman County Gridiron v4 - original retro pixel football. Plain JS, no build step. */
(function(){
'use strict';
// ====== TUNING CONSTANTS (safe to edit) ======
var TUNE={
  PX:6,                 // pixels per yard
  QLEN:90,              // game seconds per quarter
  PLAY_RUNOFF:6,        // extra clock seconds used per play
  REC_SPEED:6.4,        // base receiver speed (yards/sec)
  DEF_SPEED:5.9,        // base defender speed
  RUN_SPEED:6.6,        // ball carrier auto run speed
  QB_RUN_SPEED:5.8,
  AIM_GAIN:1.7,         // yards of throw per yard of drag
  MAX_THROW:48,         // yards
  CATCH_RADIUS:1.7,
  TACKLE_RADIUS:0.85,
  RUSH_HOLD:2.6,        // seconds the line holds before the rush gets free
  JUKE_CD:1.1,
  SEASON_GAMES:5,       // regular season county games
  COUNTY_FINAL_WINS:3   // wins needed to reach the county final
};
var FAST=/[?&]fast=1/.test(location.search); if(FAST){TUNE.QLEN=16;}
var LS=window.LS||{getItem:function(){return null},setItem:function(){}};
var SAVE_KEY='ccgCareerV4';
// ====== TEAMS (teams.json is the source of truth; this copy is only a fallback) ======
var FALLBACK={"teams": [{"id": "cul", "name": "Cullman", "mascot": "Bearcats", "ab": "CUL", "colors": "Black & Gold", "c1": "#141414", "c2": "#f2b705", "stadium": "Woodard Stadium", "classification": "5A Region 5 (AHSFHS); alabama6afootball.com lists 6A Region 7 for 2025", "rival": "hart", "rivalNote": "Longest series is Hartselle (105 games). Hanceville is the top county series (71 games, Cullman leads 54-13-4).", "countyRival": "han", "rating": 84, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Cullman", "https://www.alabama6afootball.com/cullman"]}, {"id": "han", "name": "Hanceville", "mascot": "Bulldogs", "ab": "HAN", "colors": "Purple & Gold", "c1": "#4b2a85", "c2": "#f2b705", "stadium": "Ray Talley Stadium", "classification": "3A Region 6 (AHSFHS)", "countyRival": "cul", "rivalNote": "Longest series Cullman (71 games); Good Hope series 48 games.", "rating": 72, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Hanceville"]}, {"id": "fv", "name": "Fairview", "mascot": "Aggies", "ab": "FV", "colors": "Purple & Gold", "c1": "#5a2d91", "c2": "#e6b325", "stadium": "Dafford Smith Stadium", "classification": "4A Region 8 (AHSFHS)", "countyRival": "hp", "rivalNote": "Longest series Holly Pond (61 games, Fairview leads 39-20-2). West Point series 56 games.", "rating": 79, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Fairview"]}, {"id": "gh", "name": "Good Hope", "mascot": "Raiders", "ab": "GH", "colors": "Red & White", "c1": "#c8102e", "c2": "#ffffff", "stadium": "James W. Shabel Stadium", "classification": "4A Region 8 (AHSFHS)", "countyRival": "han", "rivalNote": "Longest series Hanceville (48 games, Hanceville leads 26-22).", "rating": 81, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Good+Hope"]}, {"id": "wp", "name": "West Point", "mascot": "Warriors", "ab": "WP", "colors": "Maroon & White", "c1": "#7a1f2b", "c2": "#ffffff", "stadium": "Warrior Field", "classification": "4A Region 7 (AHSFHS)", "countyRival": "fv", "rivalNote": "Longest series Fairview (56 games, West Point leads 32-23-1).", "rating": 78, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=West+Point"]}, {"id": "vin", "name": "Vinemont", "mascot": "Eagles", "ab": "VIN", "colors": "Red & White", "c1": "#a6192e", "c2": "#ffffff", "stadium": "Eagle Stadium", "stadiumFlag": "A 2016 Cullman Tribune article calls the home field Mark Smothers Stadium; unverified which is current.", "classification": "3A Region 6 (AHSFHS)", "countyRival": "hp", "rivalNote": "Longest series Holly Pond (50 games, Vinemont leads 28-22).", "rating": 74, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Vinemont", "https://www.cullmantribune.com/2016/09/25/shootouts-upsets-and-routs-highlight-week-6-play/"]}, {"id": "hp", "name": "Holly Pond", "mascot": "Broncos", "ab": "HP", "colors": "Green & White", "c1": "#0b6b3a", "c2": "#ffffff", "stadium": "Thomas-Michelfelder Field", "classification": "3A Region 6 (AHSFHS)", "countyRival": "fv", "rivalNote": "Longest series Fairview (61 games); Vinemont series 50 games.", "rating": 73, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Holly+Pond"]}, {"id": "cs", "name": "Cold Springs", "mascot": "Eagles", "ab": "CS", "colors": "Blue & Gold", "c1": "#1f4fa3", "c2": "#f2b705", "stadium": "Eagle Stadium", "stadiumFlag": "A 2016 Cullman Tribune article calls it Cranford Stricklin Stadium; unverified which is current.", "classification": "2A Region 5 (AHSFHS)", "countyRival": "gh", "rivalNote": "Longest series Good Hope (37 games, Good Hope leads 28-8-1).", "rating": 70, "sources": ["https://www.ahsfhs.org/teams2/teampage.asp?Team=Cold+Springs", "https://www.cullmantribune.com/2016/09/25/shootouts-upsets-and-routs-highlight-week-6-play/"]}]};
var TEAMS=FALLBACK.teams;
var STATE_FOES=[{id:'st1',name:'Big River',mascot:'Bluejays',ab:'BR',c1:'#123c8c',c2:'#9ad0ff',rating:88,fictional:true},
 {id:'st2',name:'Pine Ridge',mascot:'Hornets',ab:'PR',c1:'#222222',c2:'#ff8a00',rating:89,fictional:true},
 {id:'st3',name:'Lake City',mascot:'Herons',ab:'LC',c1:'#0e6e6e',c2:'#f4f4f4',rating:87,fictional:true}];
function teamById(id){for(var i=0;i<TEAMS.length;i++)if(TEAMS[i].id===id)return TEAMS[i];for(i=0;i<STATE_FOES.length;i++)if(STATE_FOES[i].id===id)return STATE_FOES[i];return TEAMS[0];}
function isRival(a,b){var A=teamById(a),B=teamById(b);return A.countyRival===b||B.countyRival===a;}

// ====== CANVAS / RESIZE ======
var cv=document.getElementById('c'),ctx=cv.getContext('2d');
var W=480,H=270,S=1,DPR=1;
function resize(){var iw=window.innerWidth||document.documentElement.clientWidth||480,ih=window.innerHeight||document.documentElement.clientHeight||270;
 if(iw<2||ih<2){iw=480;ih=270;}
 DPR=Math.min(window.devicePixelRatio||1,2);
 W=iw<ih?300:480; S=iw/W; H=Math.round(ih/S); if(H<240){H=240;S=Math.min(iw/W,ih/H);}
 cv.width=Math.round(iw*DPR);cv.height=Math.round(ih*DPR);cv.style.width=iw+'px';cv.style.height=ih+'px';}
window.addEventListener('resize',resize);window.addEventListener('orientationchange',function(){setTimeout(resize,250)});
if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);window.addEventListener('load',resize);resize();

// ====== AUDIO / HAPTICS ======
var ac=null,muted=LS.getItem('ccgMute')==='1';
function au(){if(!ac){try{var A=window.AudioContext||window.webkitAudioContext;if(A)ac=new A();}catch(e){ac=null}}
 if(ac&&ac.state==='suspended'){try{var r=ac.resume();if(r&&r.catch)r.catch(function(){})}catch(e){}}}
function tone(f,d,type,v,f2){if(muted||!ac)return;try{var t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}
function crowd(len,v){if(muted||!ac)return;try{var n=Math.floor(ac.sampleRate*len),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);var s=ac.createBufferSource();s.buffer=b;var f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=.6;var g=ac.createGain();g.gain.value=v||.25;s.connect(f);f.connect(g);g.connect(ac.destination);s.start();}catch(e){}}
var SFX={snap:function(){tone(180,.08,'square',.06)},throw_:function(){tone(500,.25,'triangle',.05,1200)},catch_:function(){tone(880,.08,'square',.05);setTimeout(function(){tone(1320,.1,'square',.05)},60)},
 hit:function(){tone(120,.18,'sawtooth',.08,50)},whistle:function(){tone(2100,.25,'sine',.04,1900)},td:function(){[523,659,784,1047].forEach(function(f,i){setTimeout(function(){tone(f,.18,'square',.05)},i*110)});crowd(1.6,.35)},
 blip:function(){tone(660,.05,'square',.04)},boo:function(){tone(200,.4,'sawtooth',.04,120)}};
function buzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
var mb=document.getElementById('mute');
function setMute(){if(mb)mb.textContent=muted?'🔇':'🔊';}setMute();
if(mb)mb.addEventListener('click',function(e){e.stopPropagation();muted=!muted;LS.setItem('ccgMute',muted?'1':'0');setMute();au();});

// ====== PIXEL FONT 3x5 ======
var FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
'0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','.':'000000000000010','-':'000000111000000',' ':'000000000000000','!':'010010010000010',':':'000010000010000','&':'010101010101011','?':'110001010000010','/':'001001010100100','+':'000010111010000','(':'010100100100010',')':'010001001001010',',':'000000000010100','*':'000101010101000',"'":'010010000000000','#':'101111101111101','%':'101001010100101'};
function ptext(str,x,y,sc,col,align){str=String(str).toUpperCase();sc=sc||1;var w=str.length*4*sc-sc;if(align==='c')x-=w/2;else if(align==='r')x-=w;x=Math.round(x);y=Math.round(y);ctx.fillStyle=col||'#fff';
 for(var i=0;i<str.length;i++){var g=FONT[str[i]]||FONT['?'];for(var p=0;p<15;p++)if(g[p]==='1')ctx.fillRect(x+i*4*sc+(p%3)*sc,y+Math.floor(p/3)*sc,sc,sc);}return w;}
function ptextS(str,x,y,sc,col,align){ptext(str,x+sc,y+sc,sc,'#000',align);return ptext(str,x,y,sc,col,align);}
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}

// ====== ORIGINAL PIXEL BADGE (no real logos) ======
function drawBadge(T,x,y,sc){sc=sc||1;var p=function(a,b,w,h,c){R(x+a*sc,y+b*sc,w*sc,h*sc,c)};
 // shield 16x18
 p(1,0,14,1,'#000');p(0,1,16,11,'#000');p(1,12,14,2,'#000');p(3,14,10,2,'#000');p(6,16,4,2,'#000');
 p(1,1,14,11,T.c2);p(2,12,12,1,T.c2);p(4,14,8,1,T.c2);p(7,16,2,1,T.c2);
 p(2,2,12,9,T.c1);p(3,11,10,2,T.c1);p(5,13,6,1,T.c1);p(7,14,2,1,T.c1);
 p(2,7,12,1,T.c2); // stripe
 var ab=T.ab.slice(0,3);var save=ctx.fillStyle;var px=x+8*sc-(ab.length*4-1)*sc/2;ptext(ab,px,y+2*sc,sc,T.c2);
 p(6,9,4,1,'#8a5a2b');p(5,10,6,1,'#8a5a2b');p(6,11,4,1,'#8a5a2b');p(7,10,2,1,'#fff'); // little football
}
window.__drawBadge=function(c2d,T,sc){var o=ctx;ctx=c2d;drawBadge(T,0,0,sc);ctx=o;};

// ====== CAREER / GM ======
var FIRST=['Jake','Cole','Tyler','Mason','Eli','Brody','Luke','Caleb','Wyatt','Hunter','Jace','Gage','Tate','Colt','Drew','Ty','Reid','Beau','Cade','Noah','Owen','Levi','Micah','Seth'];
var LAST=['Brooks','Hale','Tidwell','Moss','Dees','Pruitt','Gable','Harbin','Speegle','Kilgo','Wood','Sharp','Barnett','Rowe','Lacy','Fulmer','Gentry','Hood','Dodd','Bates','Cagle','Self','Nix','Waldrop'];
var POS=['QB','RB','WR','WR','TE','OL','DL','LB','DB','K'];
function rnd(a,b){return a+Math.random()*(b-a)}function ri(a,b){return Math.floor(rnd(a,b+1))}function pick(a){return a[Math.floor(Math.random()*a.length)]}
function mkPlayer(pos,base){return {pos:pos,name:pick(FIRST)+' '+pick(LAST),ovr:Math.max(40,Math.min(99,Math.round(base+rnd(-6,6)))),yr:ri(9,12),num:ri(1,99)};}
function newCareer(teamId){var T=teamById(teamId);var base=T.rating-14;var roster=POS.map(function(p){return mkPlayer(p,base)});
 return {v:4,team:teamId,season:1,week:0,sched:mkSchedule(teamId),w:0,l:0,pts:60,morale:60,staff:{OC:0,DC:0,ST:0},fac:{Weights:0,Film:0,Stadium:0},roster:roster,trophies:[],history:[],phase:'season'};}
function mkSchedule(me){var others=TEAMS.filter(function(t){return t.id!==me}).map(function(t){return t.id});var T=teamById(me);var list=[];
 if(T.countyRival&&others.indexOf(T.countyRival)>=0)list.push(T.countyRival);
 others.sort(function(){return Math.random()-.5});for(var i=0;i<others.length&&list.length<TUNE.SEASON_GAMES;i++)if(list.indexOf(others[i])<0)list.push(others[i]);
 list.sort(function(){return Math.random()-.5});return list.map(function(id){return {opp:id,type:'reg',res:null}});}
var C=null;
function save(){try{LS.setItem(SAVE_KEY,JSON.stringify(C))}catch(e){}}
function load(){try{var s=LS.getItem(SAVE_KEY);if(s){var c=JSON.parse(s);if(c&&c.v===4)return c;}}catch(e){}return null;}
function rosterBy(pos){return C.roster.filter(function(p){return p.pos===pos});}
function ovr(pos){var a=rosterBy(pos);if(!a.length)return 60;var s=0;a.forEach(function(p){s+=p.ovr});return s/a.length;}
function moraleAdj(){return (C.morale-50)/10;}
function offRating(){return (ovr('QB')*2+ovr('RB')+ovr('WR')*2+ovr('TE')+ovr('OL')*2)/8+moraleAdj()+C.staff.OC*2;}
function defRating(){return (ovr('DL')+ovr('LB')+ovr('DB'))/3+moraleAdj()+C.staff.DC*2.5+C.fac.Film*1.5;}
function upgCost(l){return 40*(l+1);}

// ====== INPUT ======
var ptr={down:false,x:0,y:0,sx:0,sy:0,t0:0,lastY:0},btns=[];
function toL(cx,cy){var r=cv.getBoundingClientRect();return [(cx-r.left)/S,(cy-r.top)/S];}
function pDown(cx,cy){au();var p=toL(cx,cy);ptr.down=true;ptr.x=ptr.sx=p[0];ptr.y=ptr.sy=p[1];ptr.lastY=p[1];ptr.t0=now();
 for(var i=btns.length-1;i>=0;i--){var b=btns[i];if(p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h){ptr.down=false;SFX.blip();b.fn();return;}}
 onDown(p[0],p[1]);}
function pMove(cx,cy){if(!ptr.down)return;var p=toL(cx,cy);var dy=p[1]-ptr.lastY;ptr.x=p[0];ptr.y=p[1];ptr.lastY=p[1];onMove(dy);}
function pUp(){if(!ptr.down)return;ptr.down=false;onUp(now()-ptr.t0,Math.hypot(ptr.x-ptr.sx,ptr.y-ptr.sy));}
if(window.PointerEvent){cv.addEventListener('pointerdown',function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}pDown(e.clientX,e.clientY)});
 cv.addEventListener('pointermove',function(e){pMove(e.clientX,e.clientY)});cv.addEventListener('pointerup',function(e){pUp()});cv.addEventListener('pointercancel',function(){pUp()});}
else{cv.addEventListener('touchstart',function(e){e.preventDefault();var t=e.changedTouches[0];pDown(t.clientX,t.clientY)},{passive:false});
 cv.addEventListener('touchmove',function(e){e.preventDefault();var t=e.changedTouches[0];pMove(t.clientX,t.clientY)},{passive:false});
 cv.addEventListener('touchend',function(e){e.preventDefault();pUp()},{passive:false});cv.addEventListener('mousedown',function(e){pDown(e.clientX,e.clientY)});
 window.addEventListener('mousemove',function(e){pMove(e.clientX,e.clientY)});window.addEventListener('mouseup',pUp);}
var keys={};
window.addEventListener('keydown',function(e){keys[e.keyCode]=true;if(scene==='game'&&G){if(e.keyCode===32){e.preventDefault();keyAction();}}});
window.addEventListener('keyup',function(e){keys[e.keyCode]=false});
function now(){return (window.performance&&performance.now)?performance.now():Date.now();}

// ====== GAME STATE ======
var scene='title',G=null,msgs=[],parts=[],tick=0,shake=0;
function opp(){return teamById(G.oppId);} function me(){return teamById(C.team);}
function newGame(oppId,type){G={oppId:oppId,type:type,q:1,clock:TUNE.QLEN,my:0,op:0,los:25,down:1,toGo:10,phase:'presnap',ents:[],ball:null,carrier:null,qb:null,
 aim:null,t:0,playT:0,kick:null,sim:null,banner:null,over:false,stats:{pyd:0,ryd:0,td:0,int:0,comp:0,att:0},rival:isRival(C.team,oppId),drives:0,hyped:0};
 G.oppR=teamById(oppId).rating+(type==='state'?2:0)+(C.season-1)*1.5;
 setupPlay();banner(G.rival?'RIVALRY GAME!':'KICKOFF',G.rival?'HYPE X2 - '+opp().name:me().name+' ball first',G.rival?'#ffd400':'#fff',2);}
function banner(a,b,c,t){G&&(G.banner={a:a,b:b||'',c:c||'#fff',t:t||1.6});}
function Ent(x,y,team,role){return {x:x,y:y,vx:0,vy:0,team:team,role:role,route:null,ri:0,stun:0,num:ri(1,99),juke:0,face:1};}
var ROUTES={go:[[18,0],[40,0]],post:[[10,0],[22,-8],[40,-14]],slant:[[3,0],[12,-7],[30,-14]],out:[[10,0],[12,9],[12,20]],curl:[[12,0],[9,0]],drag:[[3,0],[6,14],[8,30]],corner:[[10,0],[20,10],[30,18]],flat:[[2,6],[6,14],[10,22]]};
function setupPlay(){var L=G.los;var e=[];var M='me',O='op';
 var qb=Ent(L-5,26.6,M,'qb');e.push(qb);G.qb=qb;
 for(var i=0;i<5;i++)e.push(Ent(L-1,22.6+i*2,M,'ol'));
 var wr=[[L-.8,6],[L-.8,47],[L-1.5,16]],te=[L-1,34];var names=['go','post','slant','out','curl','corner'];
 wr.forEach(function(p,k){var r=Ent(p[0],p[1],M,'wr');r.route=pick(names);e.push(r);});
 var t=Ent(te[0],te[1],M,'wr');t.route=pick(['flat','drag','curl']);e.push(t);
 var rb=Ent(L-5,30,M,'wr');rb.route=pick(['flat','drag']);rb.rb=1;e.push(rb);
 for(i=0;i<4;i++)e.push(Ent(L+1.2,23.2+i*2.3,O,'dl'));
 var recs=e.filter(function(x){return x.role==='wr'});
 recs.forEach(function(r,k){var d=Ent(r.x+(k<3?6:5),r.y+(k===0?1:k===1?-1:0),O,'cb');d.mark=r;e.push(d);});
 e.push(Ent(L+16,18,O,'s'));e.push(Ent(L+16,36,O,'s'));
 // build absolute route points
 recs.forEach(function(r){var sgn=r.y>26.6?1:-1;var pts=ROUTES[r.route]||ROUTES.go;r.pts=pts.map(function(p){return [r.x+p[0],Math.max(1.5,Math.min(51.8,r.y+(r.route==='flat'||r.route==='drag'||r.route==='out'||r.route==='corner'?p[1]*(r.y<26.6?-1:1)*-1:p[1]*sgn*-1)))]});
  if(r.route==='out'||r.route==='corner'||r.route==='flat')r.pts=pts.map(function(p){return [r.x+p[0],Math.max(1.5,Math.min(51.8,r.y+p[1]*(r.y<26.6?-1:1)))]});
  if(r.route==='drag'||r.route==='slant'||r.route==='post')r.pts=pts.map(function(p){return [r.x+p[0],Math.max(1.5,Math.min(51.8,r.y-p[1]*(r.y<26.6?-1:1)))]});});
 G.ents=e;G.ball=null;G.carrier=null;G.aim=null;G.playT=0;G.phase=G.down===4?'menu4':'presnap';G.result=null;G.thrown=false;G.drag=null;}
function recs(){return G.ents.filter(function(x){return x.role==='wr'});}
function defs(){return G.ents.filter(function(x){return x.team==='op'});}
function spd(base,r){return base*(1+(r-75)*0.006);}
// ----- input routing -----
function onDown(x,y){if(scene!=='game'||!G)return;
 if(G.phase==='presnap'){snap();G.drag={x0:x,y0:y};return;}
 if(G.phase==='drop'){G.drag={x0:x,y0:y};return;}
 if(G.phase==='run'){return;}
 if(G.phase==='kick'){stopKick();return;}
 if(G.phase==='sim'){G.sim.skip=true;return;}
 if(G.phase==='dead'&&G.deadT>0.5){G.deadT=99;return;}}
function onMove(dy){if(!G)return;if(G.phase==='run'&&G.carrier){G.carrier.ty=Math.max(.5,Math.min(52.8,(G.carrier.ty==null?G.carrier.y:G.carrier.ty)+dy/TUNE.PX*1.4));}}
function onUp(dt,dist){if(!G)return;
 if(G.phase==='drop'){var d=G.drag;if(!d)return;var dx=ptr.x-d.x0,dy=ptr.y-d.y0;G.drag=null;if(Math.hypot(dx,dy)>12)throwBall(-dx,-dy);else scramble();return;}
 if(G.phase==='run'&&dt<230&&dist<10)juke();}
function keyAction(){if(G.phase==='presnap'){snap();}else if(G.phase==='drop'){var r=recs()[0];throwBall((r.x-G.qb.x)/TUNE.AIM_GAIN*TUNE.PX,(r.y-G.qb.y)/TUNE.AIM_GAIN*TUNE.PX);}else if(G.phase==='run')juke();else if(G.phase==='kick')stopKick();else if(G.phase==='sim')G.sim.skip=true;}
function aimFromDrag(dx,dy){var ax=dx/TUNE.PX*TUNE.AIM_GAIN,ay=dy/TUNE.PX*TUNE.AIM_GAIN;var L=Math.hypot(ax,ay),mx=TUNE.MAX_THROW*(0.7+(ovr('QB')-50)*0.008);if(L>mx){ax*=mx/L;ay*=mx/L;}
 return [G.qb.x+ax,Math.max(.5,Math.min(52.8,G.qb.y+ay))];}
function snap(){G.phase='drop';G.playT=0;SFX.snap();}
function throwBall(dx,dy){var a=aimFromDrag(dx,dy);var q=G.qb;var dist=Math.hypot(a[0]-q.x,a[1]-q.y);G.ball={x0:q.x,y0:q.y,x1:a[0],y1:a[1],t:0,T:0.42+dist/(24+(ovr('QB')-60)*0.15),h:Math.min(9,1.2+dist*0.2)};
 G.phase='air';G.stats.att++;SFX.throw_();
 var best=null,bd=1e9;recs().forEach(function(r){var d=Math.hypot(r.x-a[0],r.y-a[1]);if(d<bd){bd=d;best=r}});G.target=bd<12?best:null;}
function scramble(){G.carrier=G.qb;G.phase='run';G.qb.ty=G.qb.y;banner('SCRAMBLE','',"#fff",.7);}
function juke(){var c=G.carrier;if(!c||c.jcd>0)return;c.juke=.45;c.jcd=TUNE.JUKE_CD;var n=nearestDef(c);var dir=n&&n.y>c.y?-1:1;c.ty=Math.max(.5,Math.min(52.8,c.y+dir*2.6));
 defs().forEach(function(d){if(Math.hypot(d.x-c.x,d.y-c.y)<2.8)d.stun=.7});SFX.blip();buzz(15);for(var i=0;i<6;i++)parts.push({x:c.x,y:c.y,vx:rnd(-3,3),vy:rnd(-3,3),l:.4,c:'#fff',f:1});}
function nearestDef(c){var b=null,bd=1e9;defs().forEach(function(d){var k=Math.hypot(d.x-c.x,d.y-c.y);if(k<bd){bd=k;b=d}});return b;}
function moveTo(e,tx,ty,sp,dt){var dx=tx-e.x,dy=ty-e.y,L=Math.hypot(dx,dy);if(L<.05)return;var s=Math.min(L,sp*dt);e.x+=dx/L*s;e.y+=dy/L*s;e.face=dx>=0?1:-1;e.mv=1;}
function updatePlay(dt){G.playT+=dt;var q=G.qb,offR=offRating(),oR=G.oppR;var rs=spd(TUNE.REC_SPEED,offR+C.fac.Weights*2),ds=spd(TUNE.DEF_SPEED,oR);
 G.ents.forEach(function(e){e.mv=0;if(e.stun>0)e.stun-=dt;if(e.juke>0)e.juke-=dt;if(e.jcd>0)e.jcd-=dt;});
 if(G.phase==='drop'||G.phase==='air'){
  if(G.phase==='drop')moveTo(q,G.los-7.5,q.y,4,dt);
  recs().forEach(function(r){if(G.phase==='air'&&r===G.target){moveTo(r,G.ball.x1,G.ball.y1,rs*1.05,dt);return;}
   var p=r.pts[Math.min(r.ri,r.pts.length-1)];moveTo(r,p[0],p[1],rs,dt);if(Math.hypot(r.x-p[0],r.y-p[1])<.4&&r.ri<r.pts.length-1)r.ri++;});
  var hold=TUNE.RUSH_HOLD+(ovr('OL')-70)*0.03;
  defs().forEach(function(d){if(d.stun>0)return;
   if(d.role==='dl'){var free=G.playT>hold;moveTo(d,q.x+.3,q.y+(d.y-q.y)*.3,free?ds*.75:0.9,dt);}
   else if(d.role==='cb'){if(G.phase==='air'&&d.mark===G.target)moveTo(d,G.ball.x1+.4,G.ball.y1,ds,dt);else moveTo(d,d.mark.x+1.2,d.mark.y+.3,ds*.98,dt);}
   else{var tgt=G.phase==='air'?[G.ball.x1+1,G.ball.y1]:[Math.max(G.los+10,d.x),d.y];moveTo(d,tgt[0],tgt[1],ds*.9,dt);}});
  // OL mirror DL
  G.ents.filter(function(e){return e.role==='ol'}).forEach(function(o,i){var d=defs().filter(function(x){return x.role==='dl'})[Math.min(i,3)];if(d)moveTo(o,d.x-1,d.y,3,dt);});
  if(G.phase==='drop'){var sk=defs().some(function(d){return d.role==='dl'&&Math.hypot(d.x-q.x,d.y-q.y)<0.9});if(sk){tackled(q,'SACKED');return;}}
  if(G.phase==='air'){var b=G.ball;b.t+=dt/b.T;if(b.t>=1)resolveCatch();}
 } else if(G.phase==='run'){var c=G.carrier;var sp=(c===q?TUNE.QB_RUN_SPEED:TUNE.RUN_SPEED)*(1+(offR-75)*0.005);
  if(c.ty==null)c.ty=c.y;var kb=keys[38]||keys[87]?-1:keys[40]||keys[83]?1:0;if(kb)c.ty=Math.max(.5,Math.min(52.8,c.ty+kb*8*dt));
  var vy=Math.max(-5,Math.min(5,(c.ty-c.y)*6));c.x+=sp*dt;c.y+=vy*dt;c.face=1;c.mv=1;
  defs().forEach(function(d){if(d.stun>0)return;var lead=Math.max(0,Math.min(1.2,(d.x-c.x)<0?0.2:0.5));moveTo(d,c.x+sp*lead,c.y,ds*(d.role==='dl'?0.85:1),dt);
   if(c.juke<=0&&Math.hypot(d.x-c.x,d.y-c.y)<TUNE.TACKLE_RADIUS){tackled(c,null);}});
  G.ents.filter(function(e){return e.team==='me'&&e!==c}).forEach(function(o){var n=nearestDef(o);if(n&&o.role==='ol')moveTo(o,n.x,n.y,4,dt);else moveTo(o,c.x+2,o.y,4.5,dt);});
  if(G.phase!=='run')return;
  if(c.y<=0.1||c.y>=53.2){endPlay(c.x,'OUT OF BOUNDS');return;}
  if(c.x>=100){touchdown();return;}}}
function resolveCatch(){var b=G.ball;var r=G.target,best=1e9,ds=defs();var rd=r?Math.hypot(r.x-b.x1,r.y-b.y1):99;var dd=1e9,dB=null;ds.forEach(function(d){var k=Math.hypot(d.x-b.x1,d.y-b.y1);if(k<dd){dd=k;dB=d}});
 var cr=TUNE.CATCH_RADIUS+(ovr('WR')-70)*0.01;
 if(b.y1<=0.3||b.y1>=53){endPlay(G.los,'INCOMPLETE',true);return;}
 if(rd<=cr){if(dd<0.9&&Math.random()<0.3){interception();return;}if(dd<1.3&&Math.random()<0.28){endPlay(G.los,'BROKEN UP',true);return;}
  r.x=b.x1;r.y=b.y1;G.carrier=r;G.ball=null;G.phase='run';r.ty=r.y;G.stats.comp++;G.catchX=r.x;SFX.catch_();buzz(10);banner('CAUGHT!','','#9cff57',.6);
  if(r.x>=100)touchdown();return;}
 if(dd<1.1&&Math.random()<0.4){interception();return;}
 endPlay(G.los,'INCOMPLETE',true);}
function interception(){G.stats.int++;SFX.boo();buzz(60);var spot=Math.max(1,Math.min(99,G.ball?G.ball.x1:G.los));G.ball=null;deadBall('INTERCEPTED!','#ff5252',function(){useClock(TUNE.PLAY_RUNOFF+G.playT);simDrive(100-spot);});}
function tackled(c,label){SFX.hit();buzz(25);shake=.25;endPlay(c.x,label||'TACKLED');}
function endPlay(spot,label,incomplete){if(G.phase==='dead'||G.phase==='celebrate')return;var gain=spot-G.los;if(!incomplete&&G.carrier){if(G.carrier===G.qb&&!G.stats.passing)G.stats.ryd+=Math.round(gain);else G.stats.pyd+=Math.round(gain);}
 if(spot<=0){G.op+=2;deadBall('SAFETY','#ff5252',function(){useClock(TUNE.PLAY_RUNOFF+G.playT);simDrive(30);});return;}
 var nl=incomplete?G.los:spot;var txt=label+(incomplete?'':' '+(gain>=0?'+':'')+Math.round(gain)+' YDS');
 deadBall(txt,'#fff',function(){useClock((incomplete?2:TUNE.PLAY_RUNOFF)+G.playT);if(G.over)return finishGame();
  if(nl>=G.los+G.toGo){G.los=nl;G.down=1;G.toGo=Math.min(10,100-nl);banner('FIRST DOWN','',"#ffd400",.9);crowd(.6,.15);}
  else{G.toGo-=(nl-G.los);G.los=nl;G.down++;if(G.down>4){simDrive(100-G.los,'TURNOVER ON DOWNS');return;}}
  setupPlay();});}
function deadBall(txt,col,next){G.phase='dead';G.deadT=0;G.deadTxt=txt;G.deadCol=col;G.next=next;SFX.whistle();}
function touchdown(){if(G.phase==='dead'||G.phase==='celebrate')return;G.my+=6;G.stats.td++;SFX.td();buzz([40,40,80]);shake=.3;G.phase='celebrate';G.celT=0;
 for(var i=0;i<60;i++)parts.push({x:100+rnd(0,8),y:rnd(5,48),vx:rnd(-6,6),vy:rnd(-8,2),l:rnd(.8,1.6),c:pick([me().c1,me().c2,'#fff','#ffd400']),f:1});}
function afterTD(){startKick('xp');}
function useClock(s){G.clock-=s;while(G.clock<=0){if(G.q<4||(G.q>=4&&G.q<6&&G.my===G.op)){G.q++;G.clock+=G.q>4?TUNE.QLEN/2:TUNE.QLEN;if(G.clock<0)G.clock=G.q>4?TUNE.QLEN/2:TUNE.QLEN;banner(G.q>4?'OVERTIME':G.q===3?'SECOND HALF':'QUARTER '+G.q,'','#ffd400',1.2);}else{G.clock=0;G.over=true;break;}}}
// ----- kicking meter -----
function startKick(kind){var dist=100-G.los+17;var w=kind==='xp'?0.42:kind==='fg'?Math.max(.12,.42-(dist-20)*0.008):0.3;w+=C.staff.ST*0.03+(ovr('K')-70)*0.004;
 G.kick={kind:kind,pos:0,t:0,w:w,done:false,res:null,anim:0,dist:dist,spd:kind==='xp'?2.2:2.8};G.phase='kick';}
function stopKick(){var k=G.kick;if(k.done)return;k.done=true;var off=Math.abs(k.pos);k.good=off<=k.w/2;k.anim=0;SFX.throw_();
 if(k.kind==='xp'||k.kind==='fg'){if(k.good){G.my+=k.kind==='xp'?1:3;SFX.td();buzz(30);}else SFX.boo();}
 k.label=(k.kind==='punt'?'PUNT '+Math.round(32+22*(1-off))+' YDS':k.kind==='ko'?'KICKOFF':(k.good?"IT'S GOOD!":'NO GOOD'));}
function kickDone(){var k=G.kick,off=Math.abs(k.pos);G.kick=null;
 if(k.kind==='xp'||(k.kind==='fg'&&k.good)){useClock(4);if(G.over)return finishGame();startKick('ko');return;}
 if(k.kind==='fg'){useClock(5);simDrive(Math.max(20,100-G.los));return;}
 if(k.kind==='punt'){useClock(8);var d=32+22*(1-off);var land=G.los+d;simDrive(land>=100?20:Math.max(5,100-land));return;}
 if(k.kind==='ko'){simDrive(Math.round(35-15*(1-off)));}}
// ----- simulated defense -----
function simDrive(start,pre){if(G.over)return finishGame();G.phase='sim';var oR=G.oppR,dR=defRating();
 var pTD=0.30+(start-25)*0.006+(oR-dR)*0.012,pFG=0.18;pTD=Math.max(.08,Math.min(.75,pTD));var r=Math.random();
 var res=r<pTD?'td':r<pTD+pFG?'fg':Math.random()<0.25?'to':'punt';var lines=[];if(pre)lines.push(pre);lines.push(opp().name.toUpperCase()+' BALL AT '+(start<50?'OWN '+Math.round(start):'YOUR '+Math.round(100-start)));
 var yd=start,n=ri(2,4);for(var i=0;i<n;i++){var g=ri(-2,14);if(res==='punt'||res==='to')g=ri(-3,6);yd=Math.min(res==='td'?95:85,yd+g);lines.push(pick(['RUN','PASS','QB KEEPER','SCREEN'])+' '+(g>=0?'+':'')+g);}
 var my=25,col='#ff5252';
 if(res==='td'){lines.push('TOUCHDOWN '+opp().ab);}else if(res==='fg'){lines.push('FIELD GOAL GOOD');}else if(res==='to'){lines.push(pick(['INTERCEPTION!','FUMBLE RECOVERED!'])+' YOUR BALL');col='#9cff57';my=Math.max(20,Math.min(60,100-yd));}else{lines.push('DEFENSE HOLDS! PUNT');col='#9cff57';my=ri(15,32);}
 G.sim={lines:lines,t:0,res:res,col:col,my:my,skip:false,applied:false,dur:lines.length*0.55+1.0};G.drives++;}
function simApply(){var s=G.sim;if(s.applied)return;s.applied=true;if(s.res==='td'){G.op+=7;SFX.boo();}else if(s.res==='fg'){G.op+=3;SFX.boo();}else{crowd(.8,.25);SFX.catch_();}useClock(rnd(35,65));}
function simDone(){simApply();var s=G.sim;G.sim=null;if(G.over)return finishGame();G.los=s.my;G.down=1;G.toGo=10;setupPlay();banner('YOUR BALL','1ST & 10','#fff',.9);}
// ----- end of game & season -----
function finishGame(){if(scene!=='game')return;G.phase='done';G.kick=null;var win=G.my>G.op;var T=G;var wk=C.sched[C.week];wk.res={my:T.my,op:T.op,win:win};
 var pts=(win?30:10)+T.stats.td*2+C.fac.Stadium*5;if(T.rival)pts=Math.round(pts*1.5);if(T.type!=='reg')pts+=win?40:10;
 C.pts+=pts;C.morale=Math.max(10,Math.min(100,C.morale+(win?(T.rival?14:8):(T.rival?-12:-7))+C.fac.Stadium));if(win)C.w++;else C.l++;C.week++;
 G.final={win:win,pts:pts};
 if(T.type==='county'&&win){C.trophies.push('County Champs '+C.season);}
 if(T.type==='state'&&win){C.trophies.push('STATE CHAMPS '+C.season);}
 // season progression
 if(C.week>=C.sched.length){var last=C.sched[C.sched.length-1];
  if(last.type==='reg'){if(C.w>=TUNE.COUNTY_FINAL_WINS){var best=TEAMS.filter(function(t){return t.id!==C.team}).sort(function(a,b){return b.rating-a.rating+rnd(-6,6)})[0];C.sched.push({opp:best.id,type:'county',res:null});}else C.phase='offseason';}
  else if(last.type==='county'){if(last.res.win)C.sched.push({opp:pick(STATE_FOES).id,type:'state',res:null});else C.phase='offseason';}
  else C.phase='offseason';}
 save();scene='final';SFX.whistle();if(win){crowd(1.5,.35);buzz([30,30,30]);}}
function startWeek(){var wk=C.sched[C.week];newGame(wk.opp,wk.type);scene='game';}
function beginOffseason(){C.draft={round:0,pool:null};scene='draft';mkPool();}
function mkPool(){var need=['QB','WR','OL','DL','LB','DB','RB','TE','K'];C.draft.pool=[0,1,2].map(function(){return mkPlayer(pick(need),58+C.fac.Weights*3+rnd(-2,8))});C.draft.pool.forEach(function(p){p.yr=9});}
function draftPick(i){var p=C.draft.pool[i];var same=C.roster.map(function(x,j){return [x,j]}).filter(function(a){return a[0].pos===p.pos}).sort(function(a,b){return a[0].ovr-b[0].ovr});
 if(same.length&&same[0][0].ovr<p.ovr)C.roster[same[0][1]]=p;else if(same.length<2&&p.pos!=='K'&&p.pos!=='QB')C.roster.push(p);else if(same.length)C.roster[same[0][1]]=p;
 C.draft.round++;if(C.draft.round>=3){nextSeason();}else mkPool();save();}
function nextSeason(){C.history.push({season:C.season,w:C.w,l:C.l});C.season++;C.week=0;C.w=0;C.l=0;C.phase='season';C.sched=mkSchedule(C.team);
 C.roster=C.roster.map(function(p){if(p.yr>=12){var n=mkPlayer(p.pos,teamById(C.team).rating-18+C.fac.Weights*2);n.yr=9;return n;}p.yr++;p.ovr=Math.min(99,p.ovr+ri(1,4)+C.fac.Weights);return p;});
 C.draft=null;save();scene='hub';}

// ====== UPDATE ======
var last=now();
function update(dt){tick+=dt;if(shake>0)shake-=dt;
 parts=parts.filter(function(p){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=6*dt;return p.l>0});
 if(scene!=='game'||!G)return;if(G.banner){G.banner.t-=dt;if(G.banner.t<=0)G.banner=null;}
 if(G.phase==='drop'||G.phase==='air'||G.phase==='run')updatePlay(dt);
 else if(G.phase==='dead'){G.deadT+=dt;if(G.deadT>1.3){var n=G.next;G.next=null;if(n)n();}}
 else if(G.phase==='celebrate'){G.celT+=dt;if(G.carrier){G.carrier.y+=Math.sin(tick*12)*0.05;}if(G.celT>2.2){useClock(TUNE.PLAY_RUNOFF+G.playT);afterTD();}}
 else if(G.phase==='kick'&&G.kick){var k=G.kick;if(!k.done){k.t+=dt;k.pos=Math.sin(k.t*k.spd);}else{k.anim+=dt;if(k.anim>1.3)kickDone();}}
 else if(G.phase==='sim'&&G.sim){var s=G.sim;s.t+=dt;if(s.skip&&s.t<s.dur-0.4)s.t=s.dur-0.4;if(s.t>s.dur-0.6)simApply();if(s.t>=s.dur)simDone();}}

// ====== DRAW ======
var camX=0,camY=0;
function fx(x){return (x-camX)*TUNE.PX}function fy(y){return (y-camY)*TUNE.PX}
function drawField(){var P=TUNE.PX;R(0,0,W,H,'#1d2a1a');
 // stands
 var top=fy(-2),bot=fy(55.3);R(0,0,W,top,'#262b3a');R(0,bot,W,H-bot,'#262b3a');
 for(var sx=-((camX*P)%6+6);sx<W;sx+=6){for(var r=0;r<3;r++){var y1=top-8-r*7;var y2=bot+4+r*7;var cheer=(G&&(G.phase==='celebrate'||G.phase==='kick'&&G.kick&&G.kick.good))?Math.sin(tick*20+sx+r)>0?-2:0:0;
  var cc=((sx*7+r*13)&1)?me().c1:me().c2;if(y1>-6)R(sx+1,y1+cheer,3,4,cc);if(y2<H)R(sx+1,y2+cheer,3,4,((sx*5+r)&1)?opp().c1:opp().c2);}}
 for(var x=-10;x<110;x+=5){var c=(Math.floor((x+10)/5)%2)?'#3f8f3a':'#378432';R(fx(x),fy(0),5*P+1,53.3*P,c);}
 R(fx(-10),fy(0),10*P,53.3*P,me().c1);R(fx(100),fy(0),10*P,53.3*P,opp().c1);
 ptext(me().ab,fx(-5)-1,fy(26.6)-8,3,me().c2,'c');ptext(opp().ab,fx(105)-1,fy(26.6)-8,3,opp().c2,'c');
 for(x=0;x<=100;x+=5){R(fx(x),fy(0),1,53.3*P,'rgba(255,255,255,.75)');}
 for(x=1;x<100;x++){R(fx(x),fy(0.6),1,2,'#dfe');R(fx(x),fy(52.4),1,2,'#dfe');R(fx(x),fy(23),1,2,'#dfe');R(fx(x),fy(30.3),1,2,'#dfe');}
 for(x=10;x<100;x+=10){var n=x<=50?x:100-x;ptext(String(n),fx(x),fy(8),2,'rgba(255,255,255,.8)','c');ptext(String(n),fx(x),fy(44),2,'rgba(255,255,255,.8)','c');}
 R(fx(-10),fy(0)-2,120*P,2,'#fff');R(fx(-10),fy(53.3),120*P,2,'#fff');}
function drawMan(e,c1,c2){var x=Math.round(fx(e.x)),y=Math.round(fy(e.y));var f=e.mv?Math.floor(tick*12+e.num)%2:0;
 R(x-4,y,8,2,'rgba(0,0,0,.3)');
 R(x-3,y-11,7,11,'#0c0c0c'); // outline
 R(x-2,y-10,5,4,c1);R(x-2,y-10,5,1,c2);R(e.face>0?x+2:x-2,y-8,1,2,'#ccc');
 R(x-3,y-6,7,3,c1);R(x-1,y-5,3,1,c2);R(x-2,y-3,5,1,c2);
 if(f){R(x-2,y-2,2,2,'#222');R(x+1,y-1,2,1,'#222');}else{R(x-2,y-1,2,1,'#222');R(x+1,y-2,2,2,'#222');}
 if(e.stun>0)R(x-1,y-14,3,1,'#ffd400');}
function drawBall(bx,by,h){var x=fx(bx),y=fy(by);R(x-2,y,4,1,'rgba(0,0,0,.35)');var yy=y-h*TUNE.PX*.6-3;R(x-2,yy,4,2,'#8a5a2b');R(x-1,yy,2,1,'#fff');}
function drawGame(){var c=G.carrier||G.qb;var fxp=G.phase==='air'&&G.ball?G.ball.x0+(G.ball.x1-G.ball.x0)*G.ball.t:G.phase==='presnap'||G.phase==='menu4'?G.los+8:c.x+6;
 var viewW=W/TUNE.PX,viewH=H/TUNE.PX;var tx=fxp-viewW*0.45;camX+=(tx-camX)*0.12;camX=Math.max(-12,Math.min(112-viewW,camX));
 var fyp=(G.phase==='presnap'||G.phase==='menu4')?26.6:(G.phase==='air'&&G.ball?(G.ball.y0+(G.ball.y1-G.ball.y0)*G.ball.t):c.y);var ty=fyp-viewH*0.5;var minY=-6,maxY=59.3-viewH;if(maxY<minY){ty=(minY+maxY)/2;}else ty=Math.max(minY,Math.min(maxY,ty));camY+=(ty-camY)*0.12;
 ctx.save();if(shake>0)ctx.translate(rnd(-2,2),rnd(-2,2));
 drawField();
 // markers
 R(fx(G.los),fy(0),2,53.3*TUNE.PX,'#2f7cff');if(G.los+G.toGo<100)R(fx(G.los+G.toGo),fy(0),2,53.3*TUNE.PX,'#ffd400');
 var arr=G.ents.slice().sort(function(a,b){return a.y-b.y});arr.forEach(function(e){var T=e.team==='me'?me():opp();drawMan(e,T.c1,T.c2);
  if(e===G.carrier){R(fx(e.x)-1,fy(e.y)-16,3,3,'#ffd400');}});
 if(G.phase!=='air'&&G.phase!=='dead'&&G.phase!=='kick'&&G.phase!=='sim'){var h=G.carrier||G.qb;drawBall(h.x+.4,h.y,.8);}
 if(G.phase==='air'&&G.ball){var b=G.ball;var bx=b.x0+(b.x1-b.x0)*b.t,by=b.y0+(b.y1-b.y0)*b.t;drawBall(bx,by,4*b.h*b.t*(1-b.t)+.8);R(fx(b.x1)-3,fy(b.y1),7,1,'rgba(255,255,255,.4)');}
 // aim line
 if(G.phase==='drop'&&G.drag&&ptr.down){var dx=-(ptr.x-G.drag.x0),dy=-(ptr.y-G.drag.y0);if(Math.hypot(dx,dy)>8){var a=aimFromDrag(dx,dy),q=G.qb,dist=Math.hypot(a[0]-q.x,a[1]-q.y),hh=Math.min(9,1.2+dist*.2);
   for(var i=0;i<=20;i++){var t=i/20;var px=fx(q.x+(a[0]-q.x)*t),py=fy(q.y+(a[1]-q.y)*t)-(4*hh*t*(1-t)+.8)*TUNE.PX*.6-3;if(i%2===0)R(px-1,py-1,2,2,'#fff');}
   var ax=fx(a[0]),ay=fy(a[1]);R(ax-5,ay,10,1,'#ffd400');R(ax,ay-5,1,10,'#ffd400');R(ax-3,ay-3,6,6,'rgba(255,212,0,.25)');}
  // slingshot band
  R(G.drag.x0-2,G.drag.y0-2,4,4,'rgba(255,255,255,.5)');}
 parts.forEach(function(p){R(fx(p.x),fy(p.y),2,2,p.c)});
 ctx.restore();
 drawHUD();
 if(G.phase==='presnap'){var tt=(Math.sin(tick*4)>0);ptextS(tt?'TOUCH AND DRAG BACK TO PASS':'TAP AND RELEASE TO RUN',W/2,H-24,1,'#fff','c');ptextS('SNAP HAPPENS WHEN YOU TOUCH',W/2,H-14,1,'#ffd400','c');}
 if(G.phase==='drop'&&!G.drag)ptextS('DRAG BACK TO AIM, LET GO TO THROW',W/2,H-16,1,'#fff','c');
 if(G.phase==='run'&&G.playT<3)ptextS('SWIPE UP OR DOWN TO STEER, TAP TO JUKE',W/2,H-16,1,'#fff','c');
 if(G.phase==='dead'){panel(W/2-110,H/2-16,220,30);ptextS(G.deadTxt,W/2,H/2-8,2,G.deadCol,'c');}
 if(G.phase==='celebrate'){panel(W/2-110,H/2-26,220,40);ptextS('TOUCHDOWN!',W/2,H/2-20,3,'#ffd400','c');ptextS(me().name,W/2,H/2+2,1,'#fff','c');}
 if(G.phase==='menu4')drawMenu4();
 if(G.phase==='kick')drawKick();
 if(G.phase==='sim')drawSim();
 if(G.banner){var b2=G.banner;panel(W/2-120,40,240,b2.b?32:22);ptextS(b2.a,W/2,45,2,b2.c,'c');if(b2.b)ptextS(b2.b,W/2,61,1,'#fff','c');}}
function panel(x,y,w,h,c){R(x-2,y-2,w+4,h+4,'#000');R(x,y,w,h,c||'#14213d');R(x,y,w,2,'#c0392b');R(x,y+h-2,w,2,'#1f4fa3');}
function drawHUD(){var M=me(),O=opp();var w=Math.min(300,W-10),x=W/2-w/2;R(x,4,w,18,'#000');R(x+1,5,w-2,16,'#0e1424');
 drawBadge(M,x+2,4,1);ptext(M.ab+' '+G.my,x+22,10,1,'#fff');ptext(G.op+' '+O.ab,x+w-22,10,1,'#fff','r');drawBadge(O,x+w-18,4,1);
 var mm=Math.max(0,Math.ceil(G.clock)),cl=Math.floor(mm/60)+':'+('0'+mm%60).slice(-2);ptext((G.q>4?'OT':'Q'+G.q)+' '+cl,W/2,7,1,'#ffd400','c');
 var dn=['','1ST','2ND','3RD','4TH'][G.down]||'';var spot=G.los<50?'OWN '+Math.round(G.los):G.los===50?'50':'OPP '+Math.round(100-G.los);ptext(dn+' & '+(G.los+G.toGo>=100?'GOAL':Math.max(1,Math.round(G.toGo)))+'  '+spot,W/2,15,1,'#fff','c');}
function button(x,y,w,h,label,fn,col,sc){btns.push({x:x,y:y,w:w,h:h,fn:fn});R(x-1,y-1,w+2,h+2,'#000');R(x,y,w,h,col||'#c0392b');R(x,y,w,2,'rgba(255,255,255,.35)');R(x,y+h-2,w,2,'rgba(0,0,0,.35)');ptext(label,x+w/2,y+h/2-(sc||1)*2.5,sc||1,'#fff','c');}
function drawMenu4(){var fgOk=100-G.los<=42;panel(W/2-130,H/2-40,260,80);ptextS('4TH DOWN - YOUR CALL',W/2,H/2-32,1,'#ffd400','c');
 var bw=78;button(W/2-125,H/2-14,bw,30,'GO FOR IT',function(){G.phase='presnap'},'#1e7a3c');button(W/2-39,H/2-14,bw,30,'PUNT',function(){startKick('punt')},'#1f4fa3');
 if(fgOk)button(W/2+47,H/2-14,bw,30,'FIELD GOAL',function(){startKick('fg')},'#8a5a00');else{R(W/2+47,H/2-14,bw,30,'#444');ptext('TOO FAR',W/2+86,H/2-3,1,'#999','c');}
 ptext('FG FROM '+(100-G.los+17)+' YDS',W/2,H/2+24,1,'#ccc','c');}
function drawKick(){var k=G.kick;if(!k)return;var w=Math.min(260,W-20),x=W/2-w/2,y=H-60;panel(x-6,y-26,w+12,58);
 ptextS(k.kind==='xp'?'EXTRA POINT':k.kind==='fg'?'FIELD GOAL '+k.dist+' YDS':k.kind==='punt'?'PUNT':'KICKOFF',W/2,y-20,1,'#ffd400','c');
 R(x,y,w,12,'#300');var gz=k.w*w/2;R(x+w/2-gz,y,gz*2,12,'#1e9c3c');R(x+w/2-1,y,2,12,'#9cff57');var nx=x+w/2+k.pos*w/2;R(nx-2,y-3,4,18,'#fff');
 if(!k.done)ptextS('TAP TO KICK',W/2,y+18,1,'#fff','c');else{ptextS(k.label,W/2,y+18,2,k.good||k.kind==='punt'||k.kind==='ko'?'#9cff57':'#ff5252','c');
  var t=Math.min(1,k.anim);if(k.kind==='xp'||k.kind==='fg'){var gx=W/2+k.pos*60*t,gy=y-30-t*60;R(W/2-20,y-90,2,40,'#ffd400');R(W/2+18,y-90,2,40,'#ffd400');R(W/2-20,y-52,40,2,'#ffd400');R(gx-2,gy+30,4,3,'#8a5a2b');}}}
function drawSim(){var s=G.sim;if(!s)return;var w=Math.min(280,W-16),x=W/2-w/2,y=34;R(0,0,W,H,'rgba(0,0,0,.55)');panel(x,y,w,30+s.lines.length*12);
 drawBadge(opp(),x+6,y+6,1);ptextS('DEFENSE ON THE FIELD',x+28,y+8,1,'#ffd400');
 var shown=Math.min(s.lines.length,Math.floor(s.t/0.55)+1);for(var i=0;i<shown;i++){var lastL=i===s.lines.length-1;ptextS(s.lines[i],x+10,y+26+i*12,1,lastL?s.col:'#fff');}
 ptext('TAP TO SKIP',W/2,y+34+s.lines.length*12,1,'#888','c');}
// ---- menus ----
function bg(){R(0,0,W,H,'#0b1226');for(var i=0;i<W;i+=16)R(i,H-30+((i/16)%2)*2,16,30,(i/16)%2?'#2f7a2c':'#2a6d28');R(0,H-31,W,1,'#fff');}
function drawTitle(){bg();ptextS('CULLMAN COUNTY',W/2,30,W<400?2:3,'#ffd400','c');ptextS('GRIDIRON',W/2,52,W<400?4:5,'#fff','c');ptextS('FRIDAY NIGHT RETRO FOOTBALL',W/2,86,1,'#9ad0ff','c');
 var y=110;if(C){button(W/2-80,y,160,30,'CONTINUE CAREER',function(){scene=C.phase==='offseason'?'offs':'hub'},'#1e7a3c');y+=40;}
 button(W/2-80,y,160,30,'NEW CAREER',function(){scene='pick'},'#c0392b');
 for(var i=0;i<TEAMS.length;i++)drawBadge(TEAMS[i],W/2-(TEAMS.length*20)/2+i*20,H-58,1);}
function drawPick(){bg();ptextS('PICK YOUR SCHOOL',W/2,10,2,'#fff','c');var cols=W<400?2:4,cw=W<400?138:110,ch=W<400?Math.min(44,(H-60)/4-6):50,gx=W/2-(cols*cw+(cols-1)*6)/2;
 TEAMS.forEach(function(T,i){var x=gx+(i%cols)*(cw+6),y=30+Math.floor(i/cols)*(ch+6);btns.push({x:x,y:y,w:cw,h:ch,fn:function(){C=newCareer(T.id);save();scene='hub';}});
  R(x-1,y-1,cw+2,ch+2,'#000');R(x,y,cw,ch,T.c1);R(x,y,cw,3,T.c2);drawBadge(T,x+4,y+6,1);ptextS(T.name,x+24,y+7,1,'#fff');ptextS(T.mascot,x+24,y+16,1,T.c2==='#ffffff'?'#ddd':T.c2);
  ptext('OVR '+T.rating,x+24,y+26,1,'#fff');if(ch>40)ptext(T.stadium.slice(0,Math.floor((cw-28)/4)),x+24,y+35,1,'#ccc');});
 button(6,H-26,60,20,'BACK',function(){scene='title'},'#444');}
function drawHub(){bg();var T=me();drawBadge(T,8,6,2);ptextS(T.name+' '+T.mascot,46,8,W<400?1:2,'#fff');ptextS('SEASON '+C.season+'  RECORD '+C.w+'-'+C.l+'  POINTS '+C.pts,46,26,1,'#ffd400');
 ptext('MORALE '+Math.round(C.morale)+'  OFF '+Math.round(offRating())+'  DEF '+Math.round(defRating()),46,36,1,'#9ad0ff');
 var y=50;C.sched.forEach(function(g,i){var O=teamById(g.opp);var lab=(g.type==='county'?'COUNTY FINAL ':g.type==='state'?'STATE FINAL ':'WK '+(i+1)+' ')+'VS '+O.name+(isRival(C.team,g.opp)?' (RIVAL)':'')+(O.fictional?' *':'');
  var r=g.res?(g.res.win?'W ':'L ')+g.res.my+'-'+g.res.op:i===C.week?'NEXT':'';R(8,y-2,W-16,10,i===C.week?'rgba(255,212,0,.15)':'rgba(255,255,255,.04)');drawBadge(O,8,y-4,0.5);ptext(lab,20,y,1,i===C.week?'#ffd400':'#fff');ptext(r,W-12,y,1,g.res?(g.res.win?'#9cff57':'#ff7070'):'#ffd400','r');y+=11;});
 if(C.trophies.length)ptext('TROPHIES: '+C.trophies.join(', ').slice(0,Math.floor((W-16)/4)),8,y+2,1,'#ffd400');
 var by=H-38;if(C.phase==='offseason')button(W/2-70,by,140,28,'START OFFSEASON',function(){scene='offs'},'#1e7a3c');
 else button(W/2-70,by,140,28,'PLAY GAME',startWeek,'#c0392b');
 button(6,by,64,28,'TEAM',function(){scene='team'},'#1f4fa3');button(W-70,by,64,28,'MENU',function(){scene='title'},'#444');}
function drawTeam(){bg();ptextS('TEAM, STAFF AND FACILITIES',W/2,6,1,'#ffd400','c');ptext('POINTS '+C.pts,W/2,16,1,'#fff','c');
 var half=W<400;var y=28;C.roster.forEach(function(p,i){var x=half?8:8,yy=y+i*9;if(!half||i<12){ptext(p.pos+' '+p.name+' '+p.ovr+' Y'+p.yr,x,yy,1,p.ovr>=80?'#9cff57':'#fff');}});
 var ux=half?8:W/2+8,uy=half?y+C.roster.length*9+6:28;var items=[['OC','staff','OFFENSE COORD'],['DC','staff','DEFENSE COORD'],['ST','staff','KICKING COACH'],['Weights','fac','WEIGHT ROOM'],['Film','fac','FILM ROOM'],['Stadium','fac','STADIUM']];
 items.forEach(function(it,i){var lv=C[it[1]][it[0]],cost=upgCost(lv),yy=uy+i*(half?18:24);ptext(it[2]+' LV '+lv,ux,yy+4,1,'#fff');
  if(lv<3)button(ux+(half?120:110),yy,78,half?15:18,'UP '+cost,function(){if(C.pts>=cost){C.pts-=cost;C[it[1]][it[0]]++;save();}else SFX.boo();},C.pts>=cost?'#1e7a3c':'#555');else ptext('MAX',ux+(half?140:130),yy+4,1,'#ffd400');});
 button(6,H-26,60,20,'BACK',function(){scene='hub'},'#444');}
function drawFinal(){bg();var f=G.final;ptextS(f.win?'VICTORY!':G.my===G.op?'TIE GAME':'FINAL',W/2,16,4,f.win?'#ffd400':'#ff7070','c');
 drawBadge(me(),W/2-80,50,2);drawBadge(opp(),W/2+48,50,2);ptextS(G.my+' - '+G.op,W/2,62,3,'#fff','c');
 ptext('PASSING '+G.stats.comp+'/'+G.stats.att+'  '+G.stats.pyd+' YDS  RUSH '+G.stats.ryd+'  TD '+G.stats.td+'  INT '+G.stats.int,W/2,96,1,'#fff','c');
 ptext('+'+f.pts+' POINTS'+(G.rival?' (RIVALRY HYPE)':''),W/2,108,1,'#9cff57','c');ptext('RECORD '+C.w+'-'+C.l,W/2,118,1,'#ffd400','c');
 if(G.type==='state'&&f.win)ptextS('STATE CHAMPIONS!',W/2,132,2,'#ffd400','c');else if(G.type==='county'&&f.win)ptextS('COUNTY CHAMPIONS!',W/2,132,2,'#ffd400','c');
 if(f.win&&Math.random()<.3)parts.push({x:rnd(0,W/TUNE.PX)+camX,y:camY,vx:rnd(-2,2),vy:rnd(0,4),l:2,c:pick([me().c1,me().c2,'#fff']),f:1});
 button(W/2-60,H-40,120,28,'CONTINUE',function(){G=null;scene='hub'},'#1e7a3c');}
function drawOffs(){bg();ptextS('OFFSEASON',W/2,10,3,'#ffd400','c');ptext('SEASON '+C.season+' FINISHED '+C.w+'-'+C.l,W/2,34,1,'#fff','c');ptext('SENIORS GRADUATE, EVERYONE ELSE IMPROVES.',W/2,46,1,'#ccc','c');ptext('DRAFT 3 INCOMING PLAYERS, THEN SPEND POINTS IN TEAM.',W/2,56,1,'#ccc','c');
 button(W/2-60,80,120,30,'TO THE DRAFT',beginOffseason,'#c0392b');}
function drawDraft(){bg();ptextS('DRAFT ROUND '+(C.draft.round+1)+' OF 3',W/2,10,2,'#ffd400','c');var cw=Math.min(140,(W-24)/ (W<400?1:3)),n=3;
 C.draft.pool.forEach(function(p,i){var x,y;if(W<400){x=W/2-cw/2;y=34+i*50;}else{x=8+i*(cw+4)+(W-16-3*cw-8)/2;y=40;}var cur=rosterBy(p.pos).map(function(q){return q.ovr}).sort(function(a,b){return a-b})[0];
  btns.push({x:x,y:y,w:cw,h:44,fn:function(){draftPick(i)}});R(x,y,cw,44,'#14213d');R(x,y,cw,2,'#c0392b');ptextS(p.pos+'  OVR '+p.ovr,x+6,y+6,1,'#fff');ptext(p.name,x+6,y+16,1,'#9ad0ff');ptext('YOUR WORST '+p.pos+': '+(cur==null?'NONE':cur),x+6,y+26,1,p.ovr>(cur||0)?'#9cff57':'#ccc');ptext('TAP TO DRAFT',x+6,y+35,1,'#ffd400');});}
function render(){btns=[];ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#05070f';ctx.fillRect(0,0,cv.width,cv.height);ctx.setTransform(S*DPR,0,0,S*DPR,0,0);ctx.imageSmoothingEnabled=false;
 if(scene==='title')drawTitle();else if(scene==='pick')drawPick();else if(scene==='hub')drawHub();else if(scene==='team')drawTeam();else if(scene==='game')drawGame();else if(scene==='final'){drawGame();R(0,0,W,H,'rgba(5,10,25,.85)');btns=[];drawFinal();}else if(scene==='offs')drawOffs();else if(scene==='draft')drawDraft();}
function loop(){var t=now(),dt=Math.min(0.05,(t-last)/1000);last=t;try{update(dt);render();}catch(e){setTimeout(function(){throw e});}requestAnimationFrame(loop);}
// ====== BOOT ======
C=load();
function boot(){requestAnimationFrame(loop);}
try{if(window.fetch){fetch('teams.json?v=4',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.teams&&j.teams.length){TEAMS=j.teams;}}).catch(function(){});}}catch(e){}
boot();
window.__ccStart=function(){au();};
window.__G=function(){return {scene:scene,G:G,C:C}};
window.__T={snap:snap,throwTo:function(x,y){var q=G.qb;throwBall((x-q.x)/TUNE.AIM_GAIN*TUNE.PX,(y-q.y)/TUNE.AIM_GAIN*TUNE.PX)},TUNE:TUNE,startWeek:startWeek,finish:function(){G.clock=0;G.q=4;if(G.my===G.op)G.my++;G.over=true;finishGame();}};
})();
