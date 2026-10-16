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
var SET_KEY='ccgSettingsV1';
var ST={music:0.5,sfx:0.8,ann:true,annRate:1.05,vib:true,quality:'high',fx:true,fps:60,fit:'fit',lefty:false,sens:1.0,text:'normal',contrast:false,qlen:'normal',diff:'normal',showFps:false};
(function(){try{var j=JSON.parse((window.LS||{getItem:function(){return null}}).getItem(SET_KEY)||'null');if(j)for(var k in ST)if(j.hasOwnProperty(k))ST[k]=j[k];}catch(e){}})();
function saveSet(){try{LS.setItem(SET_KEY,JSON.stringify(ST))}catch(e){}}
function qlenSec(){if(FAST)return 16;return ST.qlen==='short'?60:ST.qlen==='long'?120:90;}
function diffAdj(){return ST.diff==='easy'?-6:ST.diff==='hard'?6:0;}
var TXT=function(){return ST.text==='large'?1.5:1;};
// ====== TEAMS (teams.json is the source of truth; this copy is only a fallback) ======
var FALLBACK={"teams": [{"id": "cul", "name": "Cullman", "mascot": "Bearcats", "ab": "CUL", "colors": "Black & Gold", "c1": "#141414", "c2": "#f2b705", "stadium": "Woodard Stadium", "classification": "Class 5A, Region 5 (AHSAA 2026-28 alignment, current 2026 season)", "rival": "hart", "rivalNote": "Longest series is Hartselle (105 games). Hanceville is the top county series (71 games, Cullman leads 54-13-4).", "countyRival": "han", "rating": 84, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2025/07/16/just-around-the-corner-football-season-looms-for-local-programs/", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Cullman", "https://www.alabama6afootball.com/cullman", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/"], "class": "5A", "region": "5", "classification2024_26": "6A Region 7 (2024-26 cycle, 2025 season)"}, {"id": "han", "name": "Hanceville", "mascot": "Bulldogs", "ab": "HAN", "colors": "Purple & Gold", "c1": "#4b2a85", "c2": "#f2b705", "stadium": "Ray Talley Stadium", "classification": "Class 3A, Region 6 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "cul", "rivalNote": "Longest series Cullman (71 games); Good Hope series 48 games.", "rating": 72, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2025/08/22/prep-football-cold-springs-crushes-hanceville-65-7-in-season-opener/", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Hanceville", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/"], "class": "3A", "region": "6", "classification2024_26": "3A Region 5 (2024-26 cycle, 2025 season)"}, {"id": "fv", "name": "Fairview", "mascot": "Aggies", "ab": "FV", "colors": "Purple & Gold", "c1": "#5a2d91", "c2": "#e6b325", "stadium": "Dafford Smith Stadium", "classification": "Class 4A, Region 8 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "hp", "rivalNote": "Longest series Holly Pond (61 games, Fairview leads 39-20-2). West Point series 56 games.", "rating": 79, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Fairview", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/", "https://www.wkul.com/gdw-looks-at-the-2nd-week-of-the-prep-football-schedule"], "class": "4A", "region": "8", "classification2024_26": "5A Region 7 (2024-26 cycle, 2025 season)"}, {"id": "gh", "name": "Good Hope", "mascot": "Raiders", "ab": "GH", "colors": "Red & White", "c1": "#c8102e", "c2": "#ffffff", "stadium": "James W. Shabel Stadium", "classification": "Class 4A, Region 8 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "han", "rivalNote": "Longest series Hanceville (48 games, Hanceville leads 26-22).", "rating": 81, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Good+Hope", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/", "https://www.cullmantribune.com/2026/09/24/prep-football-unbeaten-addison-cold-springs-headline-4-game-friday-slate/", "https://www.wkul.com/gdw-looks-at-the-2nd-week-of-the-prep-football-schedule"], "class": "4A", "region": "8", "classification2024_26": "4A Region 5 (AHSFHS 2025 page) (2024-26 cycle, 2025 season)"}, {"id": "wp", "name": "West Point", "mascot": "Warriors", "ab": "WP", "colors": "Maroon & White", "c1": "#7a1f2b", "c2": "#ffffff", "stadium": "Warrior Field", "classification": "Class 4A, Region 7 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "fv", "rivalNote": "Longest series Fairview (56 games, West Point leads 32-23-1).", "rating": 78, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=West+Point", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/"], "class": "4A", "region": "7", "classification2024_26": "5A Region 7 (2024-26 cycle, 2025 season)", "stadiumFlag": "AHSFHS lists Warrior Field; a 2016 Cullman Tribune article and stadiumconnection.com use West Point Stadium. Not confirmed in 2025-26 news."}, {"id": "vin", "name": "Vinemont", "mascot": "Eagles", "ab": "VIN", "colors": "Red & White", "c1": "#a6192e", "c2": "#ffffff", "stadium": "Mark Smothers Stadium", "classification": "Class 3A, Region 6 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "hp", "rivalNote": "Longest series Holly Pond (50 games, Vinemont leads 28-22).", "rating": 74, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Vinemont", "https://www.cullmantribune.com/2016/09/25/shootouts-upsets-and-routs-highlight-week-6-play/", "https://www.cullmantribune.com/2024/10/25/prep-football-vinemont-drops-region-game-with-winfield-42-14/", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/", "https://www.wkul.com/gdw-looks-at-the-2nd-week-of-the-prep-football-schedule"], "class": "3A", "region": "6", "classification2024_26": "3A Region 5 (2024-26 cycle, 2025 season)", "stadiumNote": "AHSFHS and stadiumconnection list the generic Eagle Stadium; Cullman Tribune (2024) and WKUL (2025) use Mark Smothers Stadium."}, {"id": "hp", "name": "Holly Pond", "mascot": "Broncos", "ab": "HP", "colors": "Green & White", "c1": "#0b6b3a", "c2": "#ffffff", "stadium": "Thomas-Michelfelder Field", "classification": "Class 3A, Region 6 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "fv", "rivalNote": "Longest series Fairview (61 games); Vinemont series 50 games.", "rating": 73, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Holly+Pond", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/", "https://www.cullmantribune.com/2026/09/24/prep-football-unbeaten-addison-cold-springs-headline-4-game-friday-slate/"], "class": "3A", "region": "6", "classification2024_26": "3A Region 8 (2024-26 cycle, 2025 season)"}, {"id": "cs", "name": "Cold Springs", "mascot": "Eagles", "ab": "CS", "colors": "Blue & Gold", "c1": "#1f4fa3", "c2": "#f2b705", "stadium": "Cranford Stricklin Stadium", "classification": "Class 2A, Region 5 (AHSAA 2026-28 alignment, current 2026 season)", "countyRival": "gh", "rivalNote": "Longest series Good Hope (37 games, Good Hope leads 28-8-1).", "rating": 70, "sources": ["https://ahsaa.com/Schools/2026-2028-Classification-Alignments", "https://cullmantimes.com/2025/08/22/prep-football-cold-springs-crushes-hanceville-65-7-in-season-opener/", "https://cullmantimes.com/2026/01/23/local-sports-ahsaa-announces-sweeping-changes-public-private-schools-to-split-for-championship-play/", "https://www.ahsfhs.org/teams2/teampage.asp?Team=Cold+Springs", "https://www.cullmantribune.com/2016/09/25/shootouts-upsets-and-routs-highlight-week-6-play/", "https://www.cullmantribune.com/2025/08/21/prep-football-cold-springs-hammers-hanceville-in-season-opener-65-7/", "https://www.cullmantribune.com/2026/01/27/cullman-county-football-programs-realign-under-new-ahsaa-structure/", "https://www.cullmantribune.com/2026/09/24/prep-football-unbeaten-addison-cold-springs-headline-4-game-friday-slate/"], "class": "2A", "region": "5", "classification2024_26": "2A Region 6 (2024-26 cycle, 2025 season)", "stadiumNote": "AHSFHS lists the generic Eagle Stadium; Cullman Times and Cullman Tribune 2025 game stories and WKUL use Cranford Stricklin Stadium."}]};
var TEAMS=FALLBACK.teams;
var STATE_FOES=[{id:'st1',name:'Big River',mascot:'Bluejays',ab:'BR',c1:'#123c8c',c2:'#9ad0ff',rating:88,fictional:true},
 {id:'st2',name:'Pine Ridge',mascot:'Hornets',ab:'PR',c1:'#222222',c2:'#ff8a00',rating:89,fictional:true},
 {id:'st3',name:'Lake City',mascot:'Herons',ab:'LC',c1:'#0e6e6e',c2:'#f4f4f4',rating:87,fictional:true}];
function teamById(id){for(var i=0;i<TEAMS.length;i++)if(TEAMS[i].id===id)return TEAMS[i];for(i=0;i<STATE_FOES.length;i++)if(STATE_FOES[i].id===id)return STATE_FOES[i];return TEAMS[0];}
function isRival(a,b){var A=teamById(a),B=teamById(b);return A.countyRival===b||B.countyRival===a;}

// ====== CANVAS / RESIZE ======
var cv=document.getElementById('c'),ctx=cv.getContext('2d');
var W=480,H=270,S=1,DPR=1;
var OX=0,OY=0,SA={t:0,r:0,b:0,l:0};
function resize(){try{if(window.__fitMeasure)window.__fitMeasure();}catch(e){}var f=window.__fit||{};
 var iw=f.w||window.innerWidth||document.documentElement.clientWidth||480,ih=f.h||window.innerHeight||document.documentElement.clientHeight||270;
 if(iw<2||ih<2){iw=480;ih=270;}
 var sf=(ST.fit==='stretch')?{t:0,r:0,b:0,l:0}:(f.safe||{t:0,r:0,b:0,l:0});
 DPR=ST.quality==='low'?1:Math.min(window.devicePixelRatio||1,3);
 var aw=Math.max(100,iw-sf.l-sf.r),ah=Math.max(100,ih-sf.t-sf.b);
 if(aw<ah){W=300;S=aw/W;H=Math.round(ah/S);if(H<240){H=240;S=Math.min(aw/W,ah/H);}}
 else{S=ah/270;W=Math.round(aw/S);if(W<420){W=420;S=aw/W;}if(W>640){W=640;S=Math.min(aw/W,ah/240);}H=Math.round(ah/S);}
 if(ST.fit==='fit'&&S*DPR>=2){var Si=Math.floor(S*DPR)/DPR;if(Si>0&&Si/S>0.88){S=Si;if(aw>=ah){W=Math.min(640,Math.max(420,Math.floor(aw/S)));}H=Math.max(240,Math.floor(ah/S));}}
 OX=sf.l+(aw-W*S)/2;OY=sf.t+(ah-H*S)/2;if(OY<sf.t)OY=sf.t;
 SA={t:0,r:0,b:0,l:0};cv.width=Math.round(iw*DPR);cv.height=Math.round(ih*DPR);cv.style.width=iw+'px';cv.style.height=ih+'px';}
window.addEventListener('resize',resize);window.addEventListener('orientationchange',function(){setTimeout(resize,250)});
if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);window.addEventListener('load',resize);resize();

// ====== AUDIO / HAPTICS ======
var ac=null,muted=LS.getItem('ccgMute')==='1';
function au(){if(!ac){try{var A=window.AudioContext||window.webkitAudioContext;if(A)ac=new A();}catch(e){ac=null}}
 unlocked=true;bus();if(ac&&ac.state==='suspended'&&!document.hidden){try{var r=ac.resume();if(r&&r.catch)r.catch(function(){})}catch(e){}}}
var sfxG=null,musG=null,unlocked=false;
function bus(){if(!ac)return null;if(!sfxG){try{sfxG=ac.createGain();musG=ac.createGain();sfxG.connect(ac.destination);musG.connect(ac.destination);}catch(e){return null}}
 try{sfxG.gain.value=muted?0:ST.sfx;musG.gain.value=muted?0:ST.music*0.6;}catch(e){}return sfxG;}
function tone(f,d,type,v,f2,dest,when){if(!ac)return;var out=dest||bus();if(!out)return;try{var t=(when||ac.currentTime),o=ac.createOscillator(),g=ac.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.02);}catch(e){}}
function noise(len,v,freq,q,dest,when){if(!ac)return;var out=dest||bus();if(!out)return;try{var n=Math.floor(ac.sampleRate*len),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);var sN=ac.createBufferSource();sN.buffer=b;var f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||900;f.Q.value=q||.6;var g=ac.createGain();g.gain.value=v||.25;sN.connect(f);f.connect(g);g.connect(out);sN.start(when||ac.currentTime);}catch(e){}}
function crowd(len,v){noise(len,v,900,.6);}
var SFX={snap:function(){tone(180,.08,'square',.06);noise(.05,.2,300,1)},throw_:function(){noise(.25,.12,2500,2);tone(500,.25,'triangle',.04,1200)},catch_:function(){tone(880,.08,'square',.05);setTimeout(function(){tone(1320,.1,'square',.05)},60)},
 hit:function(){tone(110,.2,'sine',.25,40);noise(.12,.3,180,1)},whistle:function(){tone(2300,.32,'sine',.05,2200);tone(2350,.32,'sine',.03,2250)},
 td:function(){horn();crowd(2.2,.45)},horn:function(){horn()},kick:function(){tone(90,.12,'sine',.3,50);noise(.06,.3,800,1)},
 blip:function(){tone(660,.05,'square',.04)},click:function(){tone(990,.03,'square',.03)},boo:function(){tone(200,.4,'sawtooth',.04,120);noise(1.0,.2,400,.8)},cheer:function(){crowd(1.2,.35)},groan:function(){noise(1.2,.25,350,.7);tone(220,.6,'triangle',.03,150)}};
function horn(){[0,0.28].forEach(function(dl){setTimeout(function(){tone(233,.5,'sawtooth',.07);tone(294,.5,'sawtooth',.05);tone(349,.5,'square',.03)},dl*1000)})}
// ---- original chiptune music (composed for this game) ----
var NOTE=function(n){return 440*Math.pow(2,(n-69)/12)};
var SONGS={
 title:{bpm:132,loop:true,lead:[72,0,76,79, 81,79,76,0, 74,0,77,81, 79,0,0,0, 72,0,76,79, 84,83,81,79, 77,76,74,76, 72,0,0,0],bass:[48,48,55,55,53,53,55,55,48,48,55,55,53,53,43,43]},
 game:{bpm:120,loop:true,lead:[67,0,0,69, 71,0,74,0, 72,0,71,0, 69,0,0,0, 67,0,0,69, 71,0,76,0, 74,0,72,71, 69,0,0,0],bass:[43,0,43,50, 45,0,45,52, 48,0,48,55, 50,0,50,47]},
 victory:{bpm:150,loop:false,lead:[72,76,79,84,0,79,84,88,0,0,86,88,91,0,0,0],bass:[48,0,55,0,48,0,55,0,53,0,55,0,48,0,0,0]},
 champ:{bpm:112,loop:false,lead:[67,67,72,0,76,0,79,0, 77,76,74,72, 76,0,0,0, 79,79,84,0,83,81,79,77, 76,74,72,0, 84,0,0,0],bass:[48,48,48,48,53,53,55,55,48,48,53,53,55,55,48,48]}};
var mus={name:null,step:0,next:0,timer:null};
function playMusic(name){if(mus.name===name)return;mus.name=name;mus.step=0;mus.next=0;if(!mus.timer)mus.timer=setInterval(musTick,40);}
function stopMusic(){mus.name=null;}
function musTick(){if(!ac||!mus.name||!unlocked||document.hidden)return;var sg=SONGS[mus.name];if(!sg)return;bus();if(!musG)return;var spb=60/sg.bpm/2;
 if(mus.next<ac.currentTime)mus.next=ac.currentTime+0.05;
 while(mus.next<ac.currentTime+0.2){var i=mus.step;if(!sg.loop&&i>=sg.lead.length){mus.name=null;return;}var li=i%sg.lead.length,n=sg.lead[li];
  if(n)tone(NOTE(n),spb*0.9,'square',.05,null,musG,mus.next);var bi=Math.floor(i/2)%sg.bass.length;if(i%2===0&&sg.bass[bi])tone(NOTE(sg.bass[bi]),spb*1.8,'triangle',.08,null,musG,mus.next);
  if(i%4===0)noise(.04,.12,6000,1,musG,mus.next);mus.step++;mus.next+=spb;}}
// ---- announcer ----
function say(txt,col){if(G&&txt)G.call={t:txt,c:col||'#fff',l:2.2};if(!ST.ann)return;var ok=false;
 try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance&&unlocked){var u=new SpeechSynthesisUtterance(txt);u.rate=ST.annRate;u.pitch=1;u.volume=Math.min(1,ST.sfx+.2);speechSynthesis.cancel();speechSynthesis.speak(u);ok=true;}}catch(e){ok=false}
 if(!ok){for(var i=0;i<Math.min(6,txt.split(' ').length);i++)(function(k){setTimeout(function(){tone(300+Math.random()*300,.06,'square',.03)},k*90)})(i);}}
document.addEventListener('visibilitychange',function(){try{if(document.hidden){if(ac&&ac.suspend)ac.suspend();if(window.speechSynthesis)speechSynthesis.cancel();}else if(ac&&unlocked&&ac.resume){var r=ac.resume();if(r&&r.catch)r.catch(function(){})}}catch(e){}});
function buzz(ms){if(!ST.vib)return;try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
var mb=document.getElementById('mute');
function setMute(){if(mb)mb.textContent=muted?'🔇':'🔊';}setMute();
function toggleMute(){muted=!muted;LS.setItem('ccgMute',muted?'1':'0');setMute();au();bus();if(muted&&window.speechSynthesis)try{speechSynthesis.cancel()}catch(e){}}
if(mb)mb.addEventListener('click',function(e){e.stopPropagation();toggleMute();});

// ====== PIXEL FONT 3x5 ======
var FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
'0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','.':'000000000000010','-':'000000111000000',' ':'000000000000000','!':'010010010000010',':':'000010000010000','&':'010101010101011','?':'110001010000010','/':'001001010100100','+':'000010111010000','(':'010100100100010',')':'010001001001010',',':'000000000010100','*':'000101010101000',"'":'010010000000000','#':'101111101111101','%':'101001010100101','>':'100010001010100','<':'001010100010001','=':'000111000111000'};
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
var lastBtn=0,fpsV=60,fpsAcc=0,fpsN=0,lastRender=0;var ptr={down:false,x:0,y:0,sx:0,sy:0,t0:0,lastY:0},btns=[];
function toL(cx,cy){var r=cv.getBoundingClientRect();return [(cx-r.left-OX)/S,(cy-r.top-OY)/S];}
function pDown(cx,cy){au();var p=toL(cx,cy);ptr.down=true;ptr.x=ptr.sx=p[0];ptr.y=ptr.sy=p[1];ptr.lastY=p[1];ptr.t0=now();
 for(var i=btns.length-1;i>=0;i--){var b=btns[i];if(p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h){ptr.down=false;var tn=now();if(tn-lastBtn<200)return;lastBtn=tn;SFX.click();b.fn();return;}}
 onDown(p[0],p[1]);}
function pMove(cx,cy){if(!ptr.down)return;var p=toL(cx,cy);var dy=p[1]-ptr.lastY;ptr.x=p[0];ptr.y=p[1];ptr.lastY=p[1];onMove(dy);}
function pUp(){if(!ptr.down)return;ptr.down=false;onUp(now()-ptr.t0,Math.hypot(ptr.x-ptr.sx,ptr.y-ptr.sy));}
if(window.PointerEvent){cv.addEventListener('pointerdown',function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}pDown(e.clientX,e.clientY)});
 cv.addEventListener('pointermove',function(e){pMove(e.clientX,e.clientY)});cv.addEventListener('pointerup',function(e){pUp()});cv.addEventListener('pointercancel',function(){ptr.down=false;if(G&&G.phase==='drop')G.drag=null;});}
else{cv.addEventListener('touchstart',function(e){e.preventDefault();var t=e.changedTouches[0];pDown(t.clientX,t.clientY)},{passive:false});
 cv.addEventListener('touchmove',function(e){e.preventDefault();var t=e.changedTouches[0];pMove(t.clientX,t.clientY)},{passive:false});
 cv.addEventListener('touchend',function(e){e.preventDefault();pUp()},{passive:false});cv.addEventListener('mousedown',function(e){pDown(e.clientX,e.clientY)});
 window.addEventListener('mousemove',function(e){pMove(e.clientX,e.clientY)});window.addEventListener('mouseup',pUp);}
var keys={};
window.addEventListener('keydown',function(e){keys[e.keyCode]=true;if(scene==='game'&&G&&G.phase==='presnap'){if(e.keyCode>=49&&e.keyCode<=51)choosePlay(G_playPage*3+e.keyCode-49);if(e.keyCode===37)G_playPage=(G_playPage+2)%3;if(e.keyCode===39)G_playPage=(G_playPage+1)%3;}if(scene==='game'&&G){if(e.keyCode===32){e.preventDefault();keyAction();}}});
window.addEventListener('keyup',function(e){keys[e.keyCode]=false});
function now(){return (window.performance&&performance.now)?performance.now():Date.now();}

// ====== GAME STATE ======
var scene='title',G=null,msgs=[],parts=[],tick=0,shake=0;
function opp(){return teamById(G.oppId);} function me(){return teamById(C.team);}
function newGame(oppId,type){G={to:{my:3,op:3},oppId:oppId,type:type,q:1,clock:qlenSec(),my:0,op:0,los:25,down:1,toGo:10,phase:'presnap',ents:[],ball:null,carrier:null,qb:null,
 aim:null,t:0,playT:0,kick:null,sim:null,banner:null,over:false,stats:{pyd:0,ryd:0,td:0,int:0,comp:0,att:0},rival:isRival(C.team,oppId),drives:0,hyped:0};
 G.oppR=teamById(oppId).rating+(type==='state'?2:0)+(C.season-1)*1.5+diffAdj();G.clock=qlenSec();
 G.home=(C.week%2===0)||type!=='reg'&&type!=='state';var V=G.home?me():opp();if(type==='state'){V={stadium:'STATE FINAL - NEUTRAL SITE'};}G.venue=V.stadium;setupPlay();G.phase='intro';G.introT=0;G.rotOverlay=false;stopMusic();SFX.horn();setTimeout(function(){if(G&&G.phase==='intro')say(me().name+' versus '+opp().name+', live from '+G.venue.replace('STATE FINAL - NEUTRAL SITE','the state final')+'.')},400);}
function banner(a,b,c,t){G&&(G.banner={a:a,b:b||'',c:c||'#fff',t:t||1.6});}
function Ent(x,y,team,role){return {x:x,y:y,vx:0,vy:0,team:team,role:role,route:null,ri:0,stun:0,num:ri(1,99),juke:0,face:1};}
var ROUTES={go:[[18,0],[40,0]],post:[[10,0],[22,-8],[40,-14]],slant:[[3,0],[12,-7],[30,-14]],out:[[10,0],[12,9],[12,20]],curl:[[12,0],[9,0]],drag:[[3,0],[6,14],[8,30]],corner:[[10,0],[20,10],[30,18]],flat:[[2,6],[6,14],[10,22]]};
// ====== PLAYBOOK (9 plays, 3 pages; card 1 = run, cards 2-3 = pass) ======
// Receiver slots: w1 (top wide), w2 (bottom wide), sl (slot), te (tight end), rb. Positions are [dx from LOS, y].
// Route points are [dx, dy] offsets from the player's start; dy is absolute (+ = toward bottom sideline). 'B' = blocks.
var PLAYS=[
 {name:'DIVE',type:'run',form:{w1:[-.8,8],w2:[-.8,45],sl:[-1.5,18],te:[-1,33],rb:[-6,26.6]},routes:{w1:'B',w2:'B',sl:'B',te:'B'},rb:[[2,0],[6,0],[30,0]],ol:'drive'},
 {name:'SLANT',type:'pass',form:{w1:[-.8,6],w2:[-.8,47],sl:[-1.5,16],te:[-1,33],rb:[-5,29]},routes:{w1:[[3,0],[9,6],[26,15]],w2:[[3,0],[9,-6],[26,-15]],sl:[[10,0],[8,0]],te:[[2,4],[6,10],[10,16]],rb:'B'},ol:'pass'},
 {name:'CURL',type:'pass',form:{w1:[-.8,7],w2:[-.8,46],sl:[-1.5,17],te:[-1,33],rb:[-5,29]},routes:{w1:[[13,0],[11,1.5]],w2:[[13,0],[11,-1.5]],sl:[[28,0]],te:[[4,-3],[8,-12],[10,-22]],rb:[[2,6],[6,12],[10,17]]},ol:'pass'},
 {name:'SWEEP',type:'run',form:{w1:[-.8,9],w2:[-.8,44],sl:[-1.5,36],te:[-1,33],rb:[-6,25]},routes:{w1:'B',w2:'B',sl:'B',te:'B'},rb:[[-1,8],[2,16],[6,19],[30,19]],ol:'pull'},
 {name:'OUT',type:'pass',form:{w1:[-.8,9],w2:[-.8,44],sl:[-1.5,17],te:[-1,34],rb:[-5,29]},routes:{w1:[[10,0],[11,-6],[12,-9]],w2:[[10,0],[11,6],[12,9]],sl:[[10,0],[18,-7],[26,-10]],te:[[9,0],[7,0]],rb:'B'},ol:'pass'},
 {name:'POST',type:'pass',form:{w1:[-.8,6],w2:[-.8,47],sl:[-1.5,40],te:[-1,33],rb:[-5,24]},routes:{w1:[[12,0],[24,9],[38,14]],w2:[[40,0]],sl:[[3,0],[6,-10],[8,-24]],te:[[30,0]],rb:[[2,-6],[6,-12],[10,-17]]},ol:'pass'},
 {name:'COUNTER',type:'run',form:{w1:[-.8,8],w2:[-.8,45],sl:[-1.5,18],te:[-1,20],rb:[-6,29]},routes:{w1:'B',w2:'B',sl:'B',te:'B'},rb:[[0,-3],[1,-3],[4,4],[8,5],[30,5]],ol:'trap'},
 {name:'GO',type:'pass',form:{w1:[-.8,5],w2:[-.8,48],sl:[-1.5,16],te:[-1,34],rb:[-5,29]},routes:{w1:[[42,0]],w2:[[42,0]],sl:[[14,0],[30,8]],te:[[11,0],[9,0]],rb:'B'},ol:'pass'},
 {name:'SCREEN',type:'pass',form:{w1:[-.8,7],w2:[-.8,46],sl:[-1.5,17],te:[-1,33],rb:[-5,29]},routes:{w1:'B',w2:[[16,0],[14,0]],sl:'B',te:[[5,0],[8,6]],rb:[[-1,-5],[-2,-12],[-1,-15],[6,-16]]},ol:'screen'}];
G_playPage=0;var G_playPage;
function setupPlay(){var L=G.los;var e=[];var M='me',O='op';var P=G.play||PLAYS[0];
 var qb=Ent(L-5,26.6,M,'qb');e.push(qb);G.qb=qb;
 for(var i=0;i<5;i++){var o=Ent(L-1,22.6+i*2,M,'ol');o.block=true;e.push(o);}
 ['w1','w2','sl','te','rb'].forEach(function(k){var f=P.form[k];var r=Ent(L+f[0],f[1],M,'wr');r.slot=k;if(k==='rb')r.rb=1;var rt=k==='rb'?(P.type==='run'?null:P.routes.rb):P.routes[k];
  if(rt==='B'){r.block=true;r.pts=null;}else if(rt){r.pts=rt.map(function(q){return [r.x+q[0],Math.max(1.2,Math.min(52.1,r.y+q[1]))]});}else r.pts=null;
  if(k==='rb'&&P.type==='run'){r.path=P.rb.map(function(q){return [r.x+q[0],Math.max(1.2,Math.min(52.1,r.y+q[1]))]});r.block=false;}
  r.ri=0;e.push(r);});
 for(i=0;i<4;i++)e.push(Ent(L+1.2,23.2+i*2.3,O,'dl'));
 var lb1=Ent(L+5,21,O,'lb'),lb2=Ent(L+5,32,O,'lb');e.push(lb1);e.push(lb2);
 var rs=e.filter(function(x){return x.role==='wr'});
 [rs[0],rs[1],rs[2]].forEach(function(r){var d=Ent(r.x+6,r.y+(r.y<26.6?1:-1),O,'cb');d.mark=r;e.push(d);});
 lb1.mark=rs[3];lb2.mark=rs[4];
 e.push(Ent(L+16,17,O,'s'));e.push(Ent(L+16,36,O,'s'));
 G.ents=e;G.ball=null;G.carrier=null;G.aim=null;G.playT=0;G.phase=G.down===4?'menu4':'presnap';G.result=null;G.thrown=false;G.drag=null;G.tapRec=null;}
function choosePlay(i){if(!G||G.phase!=='presnap')return;G.play=PLAYS[i];G.lastPlay=i;setupPlay();G.phase='presnap';snap();banner(G.play.name,G.play.type==='run'?'HANDOFF':'TAP A RECEIVER TO THROW','#fff',.8);}
function eligible(){return G.ents.filter(function(x){return x.role==='wr'&&!x.block&&!(G.play&&G.play.type==='run')});}
function recs(){return G.ents.filter(function(x){return x.role==='wr'});}
function defs(){return G.ents.filter(function(x){return x.team==='op'});}
function spd(base,r){return base*(1+(r-75)*0.006);}
// ----- input routing -----
function onDown(x,y){if(scene!=='game'||!G)return;
 if(G.phase==='intro'){if(G.introT>0.4)endIntro();return;}
 if(G.rotOverlay){G.rotOverlay=false;return;}
 if(G.phase==='presnap'){return;}
 if(G.phase==='drop'){if(G.play&&G.play.type==='run')return;G.drag={x0:x,y0:y};G.tapRec=recAt(x,y);G.tapQB=Math.hypot(fx(G.qb.x)-x,fy(G.qb.y)-6-y)<14;return;}
 if(G.phase==='run'){return;}
 if(G.phase==='kick'){stopKick();return;}
 if(G.phase==='sim'){G.sim.skip=true;return;}
 if(G.phase==='dead'&&G.deadT>0.5){G.deadT=99;return;}}
function onMove(dy){if(!G)return;if(G.phase==='run'&&G.carrier){if(Math.abs(dy)>0.5)G.carrier.userSteer=true;G.carrier.ty=Math.max(.5,Math.min(52.8,(G.carrier.ty==null?G.carrier.y:G.carrier.ty)+dy/TUNE.PX*1.4));}}
function onUp(dt,dist){if(!G)return;
 if(G.phase==='drop'){var d=G.drag;if(!d)return;var dx=ptr.x-d.x0,dy=ptr.y-d.y0;G.drag=null;var big=Math.hypot(dx,dy)>18;if(!big&&G.tapRec){throwTo(G.tapRec);}else if(big&&!G.tapRec){throwBall(-dx,-dy);}else if(!big&&G.tapQB){scramble();}G.tapRec=null;return;}
 if(G.phase==='run'&&dt<230&&dist<10)juke();}
function keyAction(){if(G.phase==='intro'){endIntro();return;}if(G.phase==='presnap'){choosePlay(G_playPage*3);}else if(G.phase==='drop'){var r=recs()[0];throwBall((r.x-G.qb.x)/TUNE.AIM_GAIN*TUNE.PX,(r.y-G.qb.y)/TUNE.AIM_GAIN*TUNE.PX);}else if(G.phase==='run')juke();else if(G.phase==='kick')stopKick();else if(G.phase==='sim')G.sim.skip=true;}
function aimFromDrag(dx,dy){var gn=TUNE.AIM_GAIN*ST.sens;var ax=dx/TUNE.PX*gn,ay=dy/TUNE.PX*gn;var L=Math.hypot(ax,ay),mx=TUNE.MAX_THROW*(0.7+(ovr('QB')-50)*0.008);if(L>mx){ax*=mx/L;ay*=mx/L;}
 return [G.qb.x+ax,Math.max(.5,Math.min(52.8,G.qb.y+ay))];}
function endIntro(){if(G.phase!=='intro')return;G.phase='presnap';if(W<H&&!G.rotShown){G.rotOverlay=true;G.rotShown=true;}playMusic('game');banner(G.rival?'RIVALRY GAME!':'KICKOFF',G.rival?'HYPE X2 - '+opp().name:me().name+' ball first',G.rival?'#ffd400':'#fff',1.6);}
function drawIntro(){var M=me(),O=opp();R(0,0,W,H,'rgba(5,10,25,.88)');var w=Math.min(300,W-12),x=W/2-w/2,y=H/2-62;panel(x,y,w,124);
 ptextS(G.type==='county'?'COUNTY FINAL':G.type==='state'?'STATE FINAL':'WEEK '+(C.week+1),W/2,y+8,1,'#ffd400','c');drawBadge(M,x+14,y+22,2);drawBadge(O,x+w-46,y+22,2);ptextS('VS',W/2,y+36,2,'#fff','c');
 ptext(M.name,x+30,y+62,1,'#fff','c');ptext(O.name,x+w-30,y+62,1,'#fff','c');ptext(tagC(M),x+30,y+72,1,'#9ad0ff','c');ptext(tagC(O),x+w-30,y+72,1,'#9ad0ff','c');
 ptextS(G.venue,W/2,y+88,1,'#fff','c');ptext(G.home?'HOME GAME':G.type==='state'?'':'ROAD GAME',W/2,y+98,1,'#ccc','c');if(G.rival)ptextS('RIVALRY GAME - HYPE X2',W/2,y+110,1,'#ffd400','c');else ptext('TAP TO KICK OFF',W/2,y+110,1,'#888','c');}
function tagC(T){return T.fictional?'STATEWIDE':(T['class']||'')+' R'+(T.region||'');}
function recAt(x,y){var best=null,bd=1e9;eligible().forEach(function(r){var k=Math.hypot(fx(r.x)-x,fy(r.y)-6*MS-y);if(k<bd){bd=k;best=r}});return bd<=Math.max(24,ZP*4.5)?best:null;}
function openness(r){var m=1e9;defs().forEach(function(d){var k=Math.hypot(d.x-r.x,d.y-r.y);if(k<m)m=k});return m;}
function throwTo(r){var q=G.qb;var sep=openness(r);var d0=Math.hypot(r.x-q.x,r.y-q.y);var T=0.42+d0/(24+(ovr('QB')-60)*0.15);var lx=r.x+(r.vx||0)*T*0.9,ly=r.y+(r.vy||0)*T*0.9;
 var err=Math.max(0.15,2.6-sep*0.6)*Math.max(.35,1.25-(ovr('QB')-50)/100);var an=Math.random()*6.283,mg=Math.random()*err;lx+=Math.cos(an)*mg;ly+=Math.sin(an)*mg;ly=Math.max(.5,Math.min(52.8,ly));
 var dist=Math.hypot(lx-q.x,ly-q.y);G.ball={x0:q.x,y0:q.y,x1:lx,y1:ly,t:0,T:0.42+dist/(24+(ovr('QB')-60)*0.15),h:Math.min(9,1.2+dist*0.2)};G.phase='air';G.stats.att++;G.target=r;G.thrownTo=r.slot;SFX.throw_();}
function snap(){G.phase='drop';G.playT=0;SFX.snap();}
function throwBall(dx,dy){var a=aimFromDrag(dx,dy);var q=G.qb;var dist=Math.hypot(a[0]-q.x,a[1]-q.y);G.ball={x0:q.x,y0:q.y,x1:a[0],y1:a[1],t:0,T:0.42+dist/(24+(ovr('QB')-60)*0.15),h:Math.min(9,1.2+dist*0.2)};
 G.phase='air';G.stats.att++;SFX.throw_();
 var best=null,bd=1e9;recs().forEach(function(r){var d=Math.hypot(r.x-a[0],r.y-a[1]);if(d<bd){bd=d;best=r}});G.target=bd<12?best:null;}
function scramble(){G.carrier=G.qb;G.phase='run';G.qb.ty=G.qb.y;banner('SCRAMBLE','',"#fff",.7);}
function juke(){var c=G.carrier;if(!c||c.jcd>0)return;c.juke=.45;c.jcd=TUNE.JUKE_CD;var n=nearestDef(c);var dir=n&&n.y>c.y?-1:1;c.ty=Math.max(.5,Math.min(52.8,c.y+dir*2.6));
 defs().forEach(function(d){if(Math.hypot(d.x-c.x,d.y-c.y)<2.8)d.stun=.7});SFX.blip();buzz(15);for(var i=0;i<6;i++)parts.push({x:c.x,y:c.y,vx:rnd(-3,3),vy:rnd(-3,3),l:.4,c:'#fff',f:1});}
function nearestDef(c){var b=null,bd=1e9;defs().forEach(function(d){var k=Math.hypot(d.x-c.x,d.y-c.y);if(k<bd){bd=k;b=d}});return b;}
function moveTo(e,tx,ty,sp,dt){var dx=tx-e.x,dy=ty-e.y,L=Math.hypot(dx,dy);if(L<.05){e.vx=0;e.vy=0;return;}var s=Math.min(L,sp*dt);e.x+=dx/L*s;e.y+=dy/L*s;e.vx=dx/L*s/dt;e.vy=dy/L*s/dt;e.face=dx>=0?1:-1;e.mv=1;}
function engaged(d){if(d.role==='s'&&G.phase!=='run')return false;for(var i=0;i<G.ents.length;i++){var b=G.ents[i];if(b.team==='me'&&b.block&&b!==G.carrier&&Math.hypot(b.x-d.x,b.y-d.y)<1.15)return true;}return false;}
function blockers(dt){var ds=defs();G.ents.forEach(function(b){if(b.team!=='me'||!b.block||b===G.carrier)return;var best=null,bd=1e9;ds.forEach(function(d){var k=Math.hypot(d.x-b.x,d.y-b.y)+(d.x<b.x-1?6:0);if(k<bd){bd=k;best=d}});
 var P=G.play||PLAYS[0];if(b.role==='ol'&&P.ol==='pull'&&G.playT<1.2){moveTo(b,b.x+.5,b.y+5,4.5,dt);return;}if(b.role==='ol'&&P.ol==='screen'&&G.playT>1.0&&G.playT<2.2){moveTo(b,b.x+3,b.y-6,4.5,dt);return;}
 if(best&&bd<14)moveTo(b,best.x-.7,best.y,b.role==='ol'?3.6:5,dt);});}
function updatePlay(dt){G.playT+=dt;var q=G.qb,offR=offRating(),oR=G.oppR;var rs=spd(TUNE.REC_SPEED,offR+C.fac.Weights*2),ds=spd(TUNE.DEF_SPEED,oR);
 G.ents.forEach(function(e){e.mv=0;if(e.stun>0)e.stun-=dt;if(e.juke>0)e.juke-=dt;if(e.jcd>0)e.jcd-=dt;});
 if(G.phase==='drop'||G.phase==='air'){
  var PL=G.play||PLAYS[0];if(G.phase==='drop'&&PL.type==='run'){var rbE=G.ents.filter(function(x){return x.rb})[0];moveTo(q,G.los-4.5,q.y,3,dt);if(rbE&&rbE.path){var pp=rbE.path[0];moveTo(rbE,pp[0],pp[1],6,dt);if(Math.hypot(rbE.x-pp[0],rbE.y-pp[1])<.5&&rbE.path.length>1)rbE.path.shift();}
   if(G.playT>0.4&&rbE){G.carrier=rbE;G.phase='run';rbE.ty=null;SFX.snap();blockers(dt);return;}}
  else if(G.phase==='drop')moveTo(q,G.los-7.5,q.y,4,dt);
  blockers(dt);
  recs().forEach(function(r){if(r.block||!r.pts)return;if(G.phase==='air'&&r===G.target){moveTo(r,G.ball.x1,G.ball.y1,rs*1.05,dt);return;}
   var p=r.pts[Math.min(r.ri,r.pts.length-1)];moveTo(r,p[0],p[1],rs,dt);if(Math.hypot(r.x-p[0],r.y-p[1])<.4&&r.ri<r.pts.length-1)r.ri++;});
  var hold=TUNE.RUSH_HOLD+(ovr('OL')-70)*0.03;
  defs().forEach(function(d){if(d.stun>0)return;if(engaged(d)&&d.role!=='cb'){if(d.role==='dl'&&G.playT>TUNE.RUSH_HOLD+(ovr('OL')-70)*0.03+1.2&&Math.random()<dt*0.6){d.x-=1.6;}return;}
   if(d.role==='lb'){if(G.phase==='air')moveTo(d,G.ball.x1,G.ball.y1,ds*.9,dt);else if(d.mark&&!d.mark.block&&d.mark.pts)moveTo(d,d.mark.x+1.5,d.mark.y,ds*.92,dt);else moveTo(d,q.x+2,q.y,ds*.5,dt);return;}
   if(d.role==='dl'){var free=G.playT>hold;moveTo(d,q.x+.3,q.y+(d.y-q.y)*.3,free?ds*.75:0.9,dt);}
   else if(d.role==='cb'){if(d.mark&&d.mark.block){moveTo(d,d.mark.x+1,d.mark.y,ds*.5,dt);}else if(G.phase==='air'&&d.mark===G.target)moveTo(d,G.ball.x1+.4,G.ball.y1,ds,dt);else moveTo(d,d.mark.x+1.2,d.mark.y+.3,ds*.98,dt);}
   else{var tgt=G.phase==='air'?[G.ball.x1+1,G.ball.y1]:[Math.max(G.los+10,d.x),d.y];moveTo(d,tgt[0],tgt[1],ds*.9,dt);}});
  // OL mirror DL
  
  if(G.phase==='drop'){var sk=defs().some(function(d){return d.role==='dl'&&Math.hypot(d.x-q.x,d.y-q.y)<0.9});if(sk){tackled(q,'SACKED');return;}}
  if(G.phase==='air'){var b=G.ball;b.t+=dt/b.T;if(b.t>=1)resolveCatch();}
 } else if(G.phase==='run'){var c=G.carrier;var sp=(c===q?TUNE.QB_RUN_SPEED:TUNE.RUN_SPEED)*(1+(offR-75)*0.005);
  if(c.ty==null)c.ty=c.y;var kb=keys[38]||keys[87]?-1:keys[40]||keys[83]?1:0;if(kb)c.ty=Math.max(.5,Math.min(52.8,c.ty+kb*8*dt));
  if(c.path&&c.path.length&&!c.userSteer){var pp=c.path[0];moveTo(c,pp[0],pp[1],sp,dt);if(Math.hypot(c.x-pp[0],c.y-pp[1])<.6)c.path.shift();c.ty=c.y;}else{var vy=Math.max(-5,Math.min(5,(c.ty-c.y)*6));c.x+=sp*dt;c.y+=vy*dt;c.face=1;c.mv=1;}
  defs().forEach(function(d){if(d.stun>0)return;if(engaged(d)&&Math.random()>dt*0.8)return;var lead=Math.max(0,Math.min(1.2,(d.x-c.x)<0?0.2:0.5));moveTo(d,c.x+sp*lead,c.y,ds*(d.role==='dl'?0.85:1),dt);
   if(c.juke<=0&&Math.hypot(d.x-c.x,d.y-c.y)<TUNE.TACKLE_RADIUS){tackled(c,null);}});
  G.ents.forEach(function(o){if(o.team==='me'&&o!==c&&!o.block&&o.role==='wr'){o.block=true;}});blockers(dt);
  if(G.phase!=='run')return;
  if(c.y<=0.1||c.y>=53.2){endPlay(c.x,'OUT OF BOUNDS');return;}
  if(c.x>=100){touchdown();return;}}}
function resolveCatch(){var b=G.ball;var r=G.target,best=1e9,ds=defs();var rd=r?Math.hypot(r.x-b.x1,r.y-b.y1):99;var dd=1e9,dB=null;ds.forEach(function(d){var k=Math.hypot(d.x-b.x1,d.y-b.y1);if(k<dd){dd=k;dB=d}});
 var cr=(ST.diff==='easy'?.3:ST.diff==='hard'?-.2:0)+TUNE.CATCH_RADIUS+(ovr('WR')-70)*0.01;
 if(b.y1<=0.3||b.y1>=53){endPlay(G.los,'INCOMPLETE',true);return;}
 if(rd<=cr){if(dd<0.9&&Math.random()<0.3){interception();return;}if(dd<1.3&&Math.random()<0.28){endPlay(G.los,'BROKEN UP',true);return;}
  r.x=b.x1;r.y=b.y1;G.carrier=r;G.ball=null;G.phase='run';r.ty=r.y;G.stats.comp++;G.catchX=r.x;SFX.catch_();buzz(10);banner('CAUGHT!','','#9cff57',.6);
  if(r.x>=100)touchdown();return;}
 if(dd<1.1&&Math.random()<0.4){interception();return;}
 endPlay(G.los,'INCOMPLETE',true);}
function interception(){if(G.two){G.ball=null;twoFail('INTERCEPTED - NO GOOD');return;}G.stats.int++;SFX.groan();say('Intercepted!','#ff5252');buzz(60);var spot=Math.max(1,Math.min(99,G.ball?G.ball.x1:G.los));G.ball=null;deadBall('INTERCEPTED!','#ff5252',function(){useClock(TUNE.PLAY_RUNOFF+G.playT);simDrive(100-spot);});}
function tackled(c,label){SFX.hit();if(label==='SACKED')say('Sacked!','#ff5252');buzz(25);shake=.25;endPlay(c.x,label||'TACKLED');}
function endPlay(spot,label,incomplete){if(G.phase==='dead'||G.phase==='celebrate')return;if(G.two){twoFail(incomplete?'INCOMPLETE - NO GOOD':label+' - NO GOOD');return;}var gain=spot-G.los;if(!incomplete&&G.carrier){if(G.carrier===G.qb||(G.play&&G.play.type==='run'))G.stats.ryd+=Math.round(gain);else G.stats.pyd+=Math.round(gain);}
 if(spot<=0){G.op+=2;deadBall('SAFETY','#ff5252',function(){useClock(TUNE.PLAY_RUNOFF+G.playT);simDrive(30);});return;}
 var nl=incomplete?G.los:spot;var txt=label+(incomplete?'':' '+(gain>=0?'+':'')+Math.round(gain)+' YDS');
 deadBall(txt,'#fff',function(){useClock((incomplete?2:TUNE.PLAY_RUNOFF)+G.playT);if(G.over)return finishGame();
  if(nl>=G.los+G.toGo){G.los=nl;G.down=1;G.toGo=Math.min(10,100-nl);banner('FIRST DOWN','',"#ffd400",.9);crowd(.6,.15);say('First down!');}
  else{G.toGo-=(nl-G.los);G.los=nl;G.down++;if(G.down>4){simDrive(100-G.los,'TURNOVER ON DOWNS');return;}}
  setupPlay();});}
function deadBall(txt,col,next){G.phase='dead';G.deadT=0;G.deadTxt=txt;G.deadCol=col;G.next=next;SFX.whistle();}
function touchdown(){if(G.phase==='dead'||G.phase==='celebrate')return;if(G.two){G.two=false;G.my+=2;SFX.td();say('Two point conversion is good!','#ffd400');buzz([40,40]);deadBall('2-POINT GOOD!','#9cff57',function(){startKick('ko')});return;}G.my+=6;G.stats.td++;SFX.td();say('Touchdown, '+me().name+'!','#ffd400');buzz([40,40,80]);shake=.3;G.phase='celebrate';G.celT=0;
 for(var i=0;i<60;i++)parts.push({x:100+rnd(0,8),y:rnd(5,48),vx:rnd(-6,6),vy:rnd(-8,2),l:rnd(.8,1.6),c:pick([me().c1,me().c2,'#fff','#ffd400']),f:1});}
function afterTD(){G.phase='patmenu';G.carrier=null;}
function goFor2(){G.two=true;G.los=90;G.down=1;G.toGo=10;setupPlay();G.phase='presnap';banner('2-POINT TRY','PICK A RUN OR PASS','#ffd400',1.1);say('They are going for two.');}
function twoFail(txt){G.two=false;SFX.groan();say('Two point try fails.','#ff5252');deadBall(txt||'2-POINT NO GOOD','#ff5252',function(){startKick('ko')});}
function drawPAT(){panel(W/2-130,H/2-40,260,80);ptextS('TOUCHDOWN! YOUR CALL',W/2,H/2-32,1,'#ffd400','c');button(W/2-122,H/2-14,116,30,'GO FOR 2',goFor2,'#1e7a3c',TXT());button(W/2+6,H/2-14,116,30,'KICK PAT',function(){startKick('xp')},'#1f4fa3',TXT());ptext('2 PTS FROM THE 10  /  1 PT KICK',W/2,H/2+24,1,'#ccc','c');}
function useClock(s){G.clock-=s;while(G.clock<=0){if(G.q<4||(G.q>=4&&G.q<6&&G.my===G.op)){G.q++;G.clock+=G.q>4?qlenSec()/2:qlenSec();if(G.clock<0)G.clock=G.q>4?qlenSec()/2:qlenSec();if(G.q===3||G.q===5)G.to={my:3,op:3};banner(G.q>4?'OVERTIME':G.q===3?'SECOND HALF':'QUARTER '+G.q,'','#ffd400',1.2);}else{G.clock=0;G.over=true;break;}}}
// ----- kicking meter -----
function startKick(kind){var dist=100-G.los+17;var w=kind==='xp'?0.42:kind==='fg'?Math.max(.12,.42-(dist-20)*0.008):0.3;w+=C.staff.ST*0.03+(ovr('K')-70)*0.004;
 if(kind==='xp')dist=20;var maxD=50+(ovr('K')-70)*0.4+C.staff.ST*2;G.kick={kind:kind,pos:0,t:0,w:w,done:false,res:null,anim:0,dist:dist,spd:kind==='xp'?2.2:2.8,two:kind==='xp'||kind==='fg',stage:0,pw:0,need:Math.min(.95,dist/maxD)};G.phase='kick';}
function tri(t){var u=t%2;return u<1?u:2-u;}
function stopKick(){var k=G.kick;if(!k||k.done)return;if(k.two&&k.stage===0){k.stage=1;k.t=Math.random()*3;SFX.click&&SFX.click();return;}k.done=true;var off=Math.abs(k.pos);k.good=off<=k.w/2&&(!k.two||k.pw>=k.need);k.short=k.two&&k.pw<k.need;k.anim=0;SFX.kick();
 if(k.kind==='xp'||k.kind==='fg'){if(k.good){G.my+=k.kind==='xp'?1:3;SFX.cheer();buzz(30);say(k.kind==='xp'?'Extra point is good.':'The kick is good!');}else{SFX.groan();say('No good!','#ff5252');}}
 k.label=(k.kind==='punt'?'PUNT '+Math.round(32+22*(1-off))+' YDS':k.kind==='ko'?'KICKOFF':(k.good?"IT'S GOOD!":k.short?'NO GOOD - SHORT':k.pos<0?'NO GOOD - WIDE LEFT':'NO GOOD - WIDE RIGHT'));}
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
function simApply(){var s=G.sim;if(s.applied)return;s.applied=true;if(s.res==='td'){G.op+=7;SFX.groan();say('Touchdown, '+opp().name+'.','#ff5252');}else if(s.res==='fg'){G.op+=3;SFX.groan();say(opp().name+' kicks a field goal.','#ff5252');}else{SFX.cheer();say(s.res==='to'?'Turnover! Your ball!':'Defense holds!','#9cff57');}useClock(rnd(35,65));}
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
 save();scene='final';SFX.whistle();if(win){crowd(1.5,.35);buzz([30,30,30]);}
 stopMusic();setTimeout(function(){playMusic(win&&T.type!=='reg'?'champ':win?'victory':'title')},600);
 say(win?(T.type==='state'?me().name+' are state champions!':T.type==='county'?me().name+' are county champions!':'Final. '+me().name+' wins!'):'Final. '+opp().name+' wins.');}
function startWeek(){if(scene==='game')return;var wk=C.sched[C.week];newGame(wk.opp,wk.type);scene='game';}
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
function update(dt){tick+=dt;if(shake>0)shake-=dt;if(!ST.fx)shake=0;
 if(!ST.fx)parts.length=0;parts=parts.filter(function(p){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=6*dt;return p.l>0});
 if(scene!=='game'||!G)return;if(G.call)G.call.l-=dt;if(G.banner){G.banner.t-=dt;if(G.banner.t<=0)G.banner=null;}
 if(G.phase==='drop'||G.phase==='air'||G.phase==='run')updatePlay(dt);
 else if(G.phase==='intro'){G.introT+=dt;if(G.introT>3.2)endIntro();}
 else if(G.phase==='dead'){G.deadT+=dt;if(G.deadT>1.3){var n=G.next;G.next=null;if(n)n();}}
 else if(G.phase==='celebrate'){G.celT+=dt;if(G.carrier){G.carrier.y+=Math.sin(tick*12)*0.05;}if(G.celT>2.2){useClock(TUNE.PLAY_RUNOFF+G.playT);afterTD();}}
 else if(G.phase==='kick'&&G.kick){var k=G.kick;if(!k.done){k.t+=dt;if(k.two&&k.stage===0)k.pw=tri(k.t*0.9);else k.pos=Math.sin(k.t*k.spd);}else{k.anim+=dt;if(k.anim>(k.two?2.0:1.3))kickDone();}}
 else if(G.phase==='sim'&&G.sim){var s=G.sim;s.t+=dt;if(s.skip&&s.t<s.dur-0.4)s.t=s.dur-0.4;if(s.t>s.dur-0.6)simApply();if(s.t>=s.dur)simDone();}}

// ====== DRAW ======
var camX=0,camY=0;
var ZP=6;function fx(x){return (x-camX)*ZP}function fy(y){return (y-camY)*ZP}
function drawField(){var P=ZP;R(0,0,W,H,'#2a3140');
 var top=fy(-2),bot=fy(55.3);
 // sideline apron + benches
 R(fx(-14),fy(-6),128*P,6*P,'#3d6b34');R(fx(-14),fy(53.3),128*P,6*P,'#3d6b34');
 R(fx(35),fy(-4.8),30*P,2.2*P,me().c1);R(fx(35),fy(56.4),30*P,2.2*P,opp().c1);
 for(var sx=-((camX*P)%6+6);sx<W;sx+=6){for(var r=0;r<3;r++){var y1=fy(-6)-8-r*7;var y2=fy(59.3)+4+r*7;var cheer=(G&&(G.phase==='celebrate'||G.phase==='kick'&&G.kick&&G.kick.good))?Math.sin(tick*20+sx+r)>0?-2:0:0;
  var cc=((sx*7+r*13)&1)?me().c1:me().c2;if(y1>-6)R(sx+1,y1+cheer,3,4,cc);if(y2<H)R(sx+1,y2+cheer,3,4,((sx*5+r)&1)?opp().c1:opp().c2);}}
 for(var x=-10;x<110;x+=5){var c=ST.contrast?((Math.floor((x+10)/5)%2)?'#1f4f1c':'#1b461a'):(Math.floor((x+10)/5)%2)?'#3f8f3a':'#378432';R(fx(x),fy(0),5*P+1,53.3*P,c);}
 // end zones painted
 R(fx(-10),fy(0),10*P,53.3*P,me().c1);R(fx(100),fy(0),10*P,53.3*P,opp().c1);
 [[me(),-5,-1],[opp(),105,1]].forEach(function(a){var T=a[0];var nm=(T.mascot||T.name).toUpperCase();var sc=Math.max(1,Math.floor(P*7/ (4*1)/ 6));var len=nm.length*4*sc;var fit=53.3*P*0.85;while(sc>1&&len>fit){sc--;len=nm.length*4*sc;}
  ctx.save();ctx.translate(fx(a[1]),fy(26.65));ctx.rotate(a[2]*Math.PI/2);ptext(nm,1,-sc*2.5+1,sc,'#000','c');ptext(nm,0,-sc*2.5,sc,T.c2,'c');ctx.restore();});
 R(fx(0)-1,fy(0),3,53.3*P,'#fff');R(fx(100)-1,fy(0),3,53.3*P,'#fff');
 for(x=5;x<100;x+=5){R(fx(x),fy(0),1,53.3*P,'rgba(255,255,255,.75)');}
 var hl=Math.max(1,P*0.7);for(x=1;x<100;x++){if(x%5===0)continue;R(fx(x),fy(0.3),1,hl,'#e6f2e6');R(fx(x),fy(53)-hl,1,hl,'#e6f2e6');R(fx(x),fy(23.6)-hl/2,1,hl,'#e6f2e6');R(fx(x),fy(29.7)-hl/2,1,hl,'#e6f2e6');}
 var ns=P>=7?3:2;for(x=10;x<100;x+=10){var n=x<=50?x:100-x;ptext(String(n),fx(x),fy(44.3)-ns*5,ns,'rgba(255,255,255,.85)','c');ctx.save();ctx.translate(fx(x),fy(9)+ns*5);ctx.rotate(Math.PI);ptext(String(n),0,0,ns,'rgba(255,255,255,.85)','c');ctx.restore();
  if(n<50){var ar=x<50?-1:1;var axp=fx(x)+ar*(n>=10?ns*5+2:ns*3+2);R(axp-1,fy(44.3)-ns*3,2,2,'rgba(255,255,255,.85)');}}
 R(fx(2)-1,fy(26.2),2,P*0.8,'#fff');R(fx(98),fy(26.2),2,P*0.8,'#fff');
 R(fx(-10),fy(0)-3,120*P,3,'#fff');R(fx(-10),fy(53.3),120*P,3,'#fff');
 // goal posts (top-down)
 [-10,110].forEach(function(gx){R(fx(gx)-1,fy(23.6),3,6.1*P,'#ffd400');});}
var MS=1;
function hx(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return [parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)];}
function clash(){try{var a=hx(me().c1),b=hx(opp().c1);return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<160;}catch(e){return false}}
function drawMan(e,c1,c2){var X0=Math.round(fx(e.x)),Y0=Math.round(fy(e.y));var f=e.mv?Math.floor(tick*12+e.num)%2:0;ctx.save();ctx.translate(X0,Y0);ctx.scale(MS,MS);var x=0,y=0;
 R(x-4,y,8,2,'rgba(0,0,0,.3)');
 R(x-3,y-11,7,11,ST.contrast?(e.team==='me'?'#ffffff':'#ff3030'):'#0c0c0c');
 R(x-2,y-10,5,4,c1);R(x-2,y-10,5,1,c2);R(e.face>0?x+2:x-2,y-8,1,2,'#ccc');
 R(x-3,y-6,7,3,c1);R(x-1,y-5,3,1,c2);R(x-2,y-3,5,1,c2);
 if(f){R(x-2,y-2,2,2,'#222');R(x+1,y-1,2,1,'#222');}else{R(x-2,y-1,2,1,'#222');R(x+1,y-2,2,2,'#222');}
 if(e.stun>0)R(x-1,y-14,3,1,'#ffd400');ctx.restore();}
function drawBall(bx,by,h){var x=fx(bx),y=fy(by),b=Math.max(1,MS);R(x-2*b,y,4*b,1,'rgba(0,0,0,.35)');var yy=y-h*ZP*.6-3*b;R(x-2*b,yy,4*b,2*b,'#8a5a2b');R(x-b,yy,2*b,1,'#fff');}
function cardH(){return Math.min(84,Math.max(60,Math.round(H*0.28)));}
function camUpdate(){var c=G.carrier||G.qb;var land=W>H;var pre=G.phase==='presnap'||G.phase==='menu4'||G.phase==='intro'||G.phase==='patmenu';
 if(land){MS=1.75;var top=HUDH()+2,bot=(G.phase==='presnap'?cardH()+8+SA.b:14);var availH=H-top-bot;
  var pts=[];var bx=null,by=null;if(G.phase==='air'&&G.ball){var b=G.ball;bx=b.x0+(b.x1-b.x0)*b.t;by=b.y0+(b.y1-b.y0)*b.t;}
  if(G.phase==='run'&&G.carrier&&G.carrier!==G.qb){pts=[[c.x-6,c.y],[c.x+14,c.y]];defs().forEach(function(d){if(Math.abs(d.x-c.x)<9&&Math.abs(d.y-c.y)<9)pts.push([d.x,d.y])});}
  else if(G.phase==='run'){pts=[[c.x-6,c.y],[c.x+14,c.y]];}
  else{G.ents.forEach(function(e){if(e.team==='me')pts.push([e.x,e.y])});pts.push([G.los-4,c.y]);if(G.los+G.toGo<100&&pre)pts.push([G.los+G.toGo+2,26.6]);if(bx!=null){pts.push([bx,by]);pts.push([G.ball.x1,G.ball.y1]);}}
  var mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;pts.forEach(function(p){mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mny=Math.min(mny,p[1]);mxy=Math.max(mxy,p[1])});
  mnx-=4;mxx+=4;mny-=5;mxy+=3;var zt=Math.min(12,W/Math.max(16,mxx-mnx),availH/Math.max(14,mxy-mny));zt=Math.max(2.6,zt);if(G.phase==='run')zt=Math.min(zt,8);
  if(!G.zp0)ZP=zt;G.zp0=1;ZP+=(zt-ZP)*(zt<ZP?0.2:0.06);
  var viewW=W/ZP,viewH=availH/ZP;var tx=(mnx+mxx)/2-viewW/2,ty=(mny+mxy)/2-viewH/2-top/ZP;if(G.phase==='run')tx=c.x-viewW*0.35;
  var minY=-6-top/ZP,maxY=59.3-(H-bot)/ZP;ty=maxY<minY?(minY+maxY)/2:Math.max(minY,Math.min(maxY,ty));
  camX+=(tx-camX)*0.14;camY+=(ty-camY)*0.14;camX=Math.max(-14,Math.min(114-viewW,camX));}
 else{MS=1.3;ZP=6;var fxp=G.phase==='air'&&G.ball?G.ball.x0+(G.ball.x1-G.ball.x0)*G.ball.t:pre?G.los+8:c.x+6;var viewW=W/ZP,viewH=H/ZP;var tx2=fxp-viewW*0.45;camX+=(tx2-camX)*0.12;camX=Math.max(-12,Math.min(112-viewW,camX));
  var fyp=pre?26.6:(G.phase==='air'&&G.ball?(G.ball.y0+(G.ball.y1-G.ball.y0)*G.ball.t):c.y);var ty2=fyp-viewH*0.5;var minY2=-6,maxY2=59.3-viewH;if(maxY2<minY2){ty2=(minY2+maxY2)/2;}else ty2=Math.max(minY2,Math.min(maxY2,ty2));camY+=(ty2-camY)*0.12;}}
function drawCards(){var ch=cardH(),y=H-ch-4-SA.b,aw=22,gap=6,cw=Math.min(150,(W-2*aw-4*gap)/3),tot=cw*3+gap*2,x0=W/2-tot/2;
 R(0,y-4,W,ch+8+SA.b,'rgba(5,10,25,.82)');
 button(Math.max(2,x0-aw-gap),y+ch/2-16,aw,32,'<',function(){G_playPage=(G_playPage+2)%3},'#444');button(Math.min(W-aw-2,x0+tot+gap),y+ch/2-16,aw,32,'>',function(){G_playPage=(G_playPage+1)%3},'#444');
 for(var k=0;k<3;k++){(function(k){var idx=G_playPage*3+k,P=PLAYS[idx],x=x0+k*(cw+gap);btns.push({x:x,y:y,w:cw,h:ch,fn:function(){choosePlay(idx)}});
  R(x-1,y-1,cw+2,ch+2,'#000');R(x,y,cw,ch,P.type==='run'?'#1e5e33':'#1d3a72');R(x,y,cw,2,P.type==='run'?'#9cff57':'#9ad0ff');
  ptextS(P.name,x+4,y+5,1,'#fff');ptext(P.type.toUpperCase(),x+cw-4,y+5,1,P.type==='run'?'#9cff57':'#9ad0ff','r');drawDiagram(P,x+3,y+14,cw-6,ch-24);ptext((idx+1)+'',x+cw/2,y+ch-8,1,'#ccc','c');})(k);}
 ptext('PAGE '+(G_playPage+1)+'/3',W/2,y-10,1,'#ccc','c');}
function drawDiagram(P,x,y,w,h){R(x,y,w,h,'rgba(0,0,0,.25)');var sx=w/46,sy=h/54;var X=function(dx){return x+(dx+10)*sx},Y=function(yy){return y+yy*sy};R(X(0),y,1,h,'rgba(255,255,255,.5)');
 for(var i=0;i<5;i++)R(X(-1)-1,Y(22.6+i*2)-1,2,2,'#ddd');R(X(-5)-1,Y(26.6)-1,2,2,'#ffd400');
 ['w1','w2','sl','te','rb'].forEach(function(k){var f=P.form[k];var rt=(k==='rb'&&P.type==='run')?P.rb:P.routes[k];var px=X(f[0]),py=Y(f[1]);R(px-1,py-1,3,3,k==='rb'?'#ff9f43':'#fff');
  if(!rt)return;if(rt==='B'){R(px+2,py-1,2,3,'#888');return;}var lx=px,ly=py;var col=P.type==='run'?'#9cff57':'#ffd400';rt.forEach(function(q){var nx=X(f[0]+q[0]),ny=Y(f[1]+q[1]);var n=Math.max(1,Math.round(Math.hypot(nx-lx,ny-ly)/1.5));for(var t=0;t<=n;t++)R(lx+(nx-lx)*t/n,ly+(ny-ly)*t/n,1,1,col);lx=nx;ly=ny;});R(lx-1,ly-1,3,3,col);});}
function drawGame(){camUpdate();
 ctx.save();if(shake>0)ctx.translate(rnd(-2,2),rnd(-2,2));
 drawField();
 // markers
 var lw2=Math.max(2,Math.round(ZP*0.35));R(fx(G.los)-lw2/2,fy(0),lw2,53.3*ZP,'#2f7cff');if(!G.two&&G.los+G.toGo<100)R(fx(G.los+G.toGo)-lw2/2,fy(0),lw2,53.3*ZP,'#ffd400');
 var arr=G.ents.slice().sort(function(a,b){return a.y-b.y});arr.forEach(function(e){var T=e.team==='me'?me():opp();if(e.team==='op'&&clash())drawMan(e,'#eeeeee',T.c1);else drawMan(e,T.c1,T.c2);
  if(e===G.carrier){R(fx(e.x)-1,fy(e.y)-12*MS-5,3,3,'#ffd400');}});
 if(G.phase!=='air'&&G.phase!=='dead'&&G.phase!=='kick'&&G.phase!=='sim'){var h=G.carrier||G.qb;drawBall(h.x+.4,h.y,.8);}
 if(G.phase==='air'&&G.ball){var b=G.ball;var bx=b.x0+(b.x1-b.x0)*b.t,by=b.y0+(b.y1-b.y0)*b.t;drawBall(bx,by,4*b.h*b.t*(1-b.t)+.8);R(fx(b.x1)-3,fy(b.y1),7,1,'rgba(255,255,255,.4)');}
 // aim line
 if(G.phase==='drop'&&G.drag&&ptr.down){var dx=-(ptr.x-G.drag.x0),dy=-(ptr.y-G.drag.y0);if(Math.hypot(dx,dy)>8){var a=aimFromDrag(dx,dy),q=G.qb,dist=Math.hypot(a[0]-q.x,a[1]-q.y),hh=Math.min(9,1.2+dist*.2);
   for(var i=0;i<=20;i++){var t=i/20;var px=fx(q.x+(a[0]-q.x)*t),py=fy(q.y+(a[1]-q.y)*t)-(4*hh*t*(1-t)+.8)*ZP*.6-3;if(i%2===0)R(px-1,py-1,2,2,'#fff');}
   var ax=fx(a[0]),ay=fy(a[1]);R(ax-5,ay,10,1,'#ffd400');R(ax,ay-5,1,10,'#ffd400');R(ax-3,ay-3,6,6,'rgba(255,212,0,.25)');}
  // slingshot band
  R(G.drag.x0-2,G.drag.y0-2,4,4,'rgba(255,255,255,.5)');}
 parts.forEach(function(p){R(fx(p.x),fy(p.y),2,2,p.c)});
 ctx.restore();
 drawHUD();
 if(G.phase==='presnap'&&!G.rotOverlay){drawCards();ptextS(G.two?'2-POINT TRY - PICK A PLAY':'PICK A PLAY',W/2,cardH()>0?H-cardH()-SA.b-22:30,TXT(),'#ffd400','c');}
 if(G.phase==='drop'&&G.play&&G.play.type==='pass'){eligible().forEach(function(r){var x=fx(r.x),y=fy(r.y)-6*MS,rad=Math.max(12,Math.min(20,ZP*3.2));var op=openness(r);var col=op>4?'#9cff57':op>2?'#ffd400':'#ff5252';var a=(Math.sin(tick*8)+1)/2;
   for(var k=0;k<16;k++){var an=k/16*6.283;R(x+Math.cos(an)*rad-1,y+Math.sin(an)*rad-1,2,2,col);}ctx.globalAlpha=.15+.1*a;R(x-rad,y-rad,rad*2,rad*2,col);ctx.globalAlpha=1;});
  if(!G.drag)ptextS('TAP A RECEIVER TO THROW - GREEN IS OPEN',W/2,H-14-SA.b,TXT(),'#fff','c');}
 if(G.rotOverlay){R(0,0,W,H,'rgba(5,10,25,.86)');panel(10,H/2-60,W-20,110);ptextS('ROTATE YOUR PHONE',W/2,H/2-48,2,'#ffd400','c');ptextS('SIDEWAYS FOR THE FULL FIELD',W/2,H/2-30,1,'#fff','c');for(var q=0;q<3;q++)R(W/2-12+q*0,H/2-14,24,40,'rgba(0,0,0,0)');R(W/2-10,H/2-12,20,34,'#fff');R(W/2-8,H/2-10,16,28,'#14213d');ptext('TAP TO PLAY IN PORTRAIT',W/2,H/2+34,1,'#9ad0ff','c');}
 if(G.phase==='run'&&G.playT<3)ptextS('SWIPE UP OR DOWN TO STEER, TAP TO JUKE',W/2,H-16-6*(TXT()-1),TXT(),'#fff','c');
 if(G.phase==='dead'){panel(W/2-110,H/2-16,220,30);ptextS(G.deadTxt,W/2,H/2-8,2,G.deadCol,'c');}
 if(G.phase==='celebrate'){panel(W/2-110,H/2-26,220,40);ptextS('TOUCHDOWN!',W/2,H/2-20,3,'#ffd400','c');ptextS(me().name,W/2,H/2+2,1,'#fff','c');}
 if(G.phase==='menu4')drawMenu4();
 if(G.phase==='patmenu')drawPAT();
 if(G.phase==='intro')drawIntro();
 if(G.phase==='kick')drawKick();
 if(G.phase==='sim')drawSim();
 if(G.call&&G.call.l>0&&G.phase!=='intro'){var cl=G.call;var tw=Math.min(W-40,cl.t.length*4*TXT()+16);var cy=G.phase==='kick'?H-112-SA.b:H-46-SA.b;R(W/2-tw/2,cy,tw,12*TXT(),'rgba(0,0,0,.65)');ptextS(cl.t,W/2,cy+3,TXT(),cl.c,'c');}
 if(G.banner){var b2=G.banner;panel(W/2-120,40,240,b2.b?32:22);ptextS(b2.a,W/2,45,2,b2.c,'c');if(b2.b)ptextS(b2.b,W/2,61,1,'#fff','c');}}
function panel(x,y,w,h,c){R(x-2,y-2,w+4,h+4,'#000');R(x,y,w,h,c||'#14213d');R(x,y,w,2,'#c0392b');R(x,y+h-2,w,2,'#1f4fa3');}
function HUDH(){return 26;}
function drawHUD(){var M=me(),O=opp();var w=Math.min(W-64,460),x=W/2-w/2,y=2;R(x,y,w,24,'#000');R(x+1,y+1,w-2,22,'#0e1424');
 var half=Math.min(118,w*0.36);
 R(x+1,y+1,half,22,M.c1);R(x+w-1-half,y+1,half,22,O.c1);
 drawBadge(M,x+3,y+3,1);ptextS(M.ab,x+22,y+5,1,'#fff');ptextS(String(G.my),x+half-4,y+5,2,'#fff','r');
 drawBadge(O,x+w-19,y+3,1);ptextS(O.ab,x+w-22,y+5,1,'#fff','r');ptextS(String(G.op),x+w-half+4,y+5,2,'#fff');
 var to=G.to||{my:3,op:3};for(var i=0;i<3;i++){R(x+22+i*5,y+17,4,2,i<to.my?'#ffd400':'rgba(255,255,255,.2)');R(x+w-36+i*5,y+17,4,2,i<to.op?'#ffd400':'rgba(255,255,255,.2)');}
 var mm=Math.max(0,Math.ceil(G.clock)),cl=Math.floor(mm/60)+':'+('0'+mm%60).slice(-2);var cx=W/2;
 ptext((G.q>4?'OT':['','1ST','2ND','3RD','4TH'][G.q])+' '+cl,cx,y+4,1,'#ffd400','c');
 var dn=G.two?'2-PT TRY':(['','1st','2nd','3rd','4th'][G.down]||'')+' & '+(G.los+G.toGo>=100?'Goal':Math.max(1,Math.round(G.toGo)));
 var L=Math.round(G.los),spot=L===50?'50':(L<50?M.ab+' '+L:O.ab+' '+(100-L));ptext(dn+'  '+spot,cx,y+14,1,'#fff','c');}
function button(x,y,w,h,label,fn,col,sc){btns.push({x:x,y:y,w:w,h:h,fn:fn});R(x-1,y-1,w+2,h+2,'#000');R(x,y,w,h,col||'#c0392b');R(x,y,w,2,'rgba(255,255,255,.35)');R(x,y+h-2,w,2,'rgba(0,0,0,.35)');ptext(label,x+w/2,y+h/2-(sc||1)*2.5,sc||1,'#fff','c');}
function drawMenu4(){var fgOk=100-G.los<=42;panel(W/2-130,H/2-40,260,80);ptextS('4TH DOWN - YOUR CALL',W/2,H/2-32,1,'#ffd400','c');
 var bw=78;button(W/2-125,H/2-14,bw,30,'GO FOR IT',function(){G.phase='presnap'},'#1e7a3c');button(W/2-39,H/2-14,bw,30,'PUNT',function(){startKick('punt')},'#1f4fa3');
 if(fgOk)button(W/2+47,H/2-14,bw,30,'FIELD GOAL',function(){startKick('fg')},'#8a5a00');else{R(W/2+47,H/2-14,bw,30,'#444');ptext('TOO FAR',W/2+86,H/2-3,1,'#999','c');}
 ptext('FG FROM '+(100-G.los+17)+' YDS',W/2,H/2+24,1,'#ccc','c');}
function drawKick(){var k=G.kick;if(!k)return;var w=Math.min(260,W-20),x=W/2-w/2,y=H-50-SA.b;
 if(k.two){var cx=W/2,top=34,cb=top+Math.min(70,H*0.28),gap=Math.min(70,W*0.16);R(0,top-6,W,y-top-20,'rgba(5,10,25,.55)');
  R(cx-1,cb,3,Math.min(40,y-cb-30),'#ffd400');R(cx-gap/2,cb,gap,3,'#ffd400');R(cx-gap/2,top,3,cb-top+3,'#ffd400');R(cx+gap/2-3,top,3,cb-top+3,'#ffd400');
  ptext(k.kind==='xp'?'PAT 20 YDS':'FG '+k.dist+' YDS',cx,top-4,1,'#fff','c');
  if(k.done){var t=Math.min(1,k.anim/1.4),ex=cx+k.pos/(k.w/2)*gap/2,ey=cb-(k.pw-k.need)*90-6,sy=y-24;var bx=cx+(ex-cx)*t,by=sy+(ey-sy)*t-Math.sin(t*Math.PI)*30*(k.pw+.3);if(k.short&&t>.75)by+=(t-.75)*80;var bs=Math.max(2,7-5*t);
   R(bx-bs/2,by-bs/3,bs,bs*.66,'#8a5a2b');R(bx-bs/4,by-1,bs/2,1,'#fff');}}
 panel(x-6,y-26,w+12,58);
 ptextS(k.kind==='xp'?'EXTRA POINT':k.kind==='fg'?'FIELD GOAL '+k.dist+' YDS':k.kind==='punt'?'PUNT':'KICKOFF',W/2,y-20,1,'#ffd400','c');
 if(k.two&&k.stage===0&&!k.done){R(x,y,w,12,'#222');R(x,y,w*k.pw,12,k.pw>=k.need?'#1e9c3c':'#c07a1b');R(x+w*k.need-1,y-3,2,18,'#fff');ptextS('STEP 1: TAP TO SET POWER',W/2,y+18,1,'#fff','c');return;}
 if(k.two){R(x,y-8,w*k.pw,3,k.pw>=k.need?'#1e9c3c':'#c07a1b');}
 R(x,y,w,12,'#300');var gz=k.w*w/2;R(x+w/2-gz,y,gz*2,12,'#1e9c3c');R(x+w/2-1,y,2,12,'#9cff57');var nx=x+w/2+k.pos*w/2;R(nx-2,y-3,4,18,'#fff');
 if(!k.done)ptextS(k.two?'STEP 2: TAP TO AIM':'TAP TO KICK',W/2,y+18,1,'#fff','c');else ptextS(k.label,W/2,y+18,k.label.length>14?1:2,k.good||k.kind==='punt'||k.kind==='ko'?'#9cff57':'#ff5252','c');}
function drawSim(){var s=G.sim;if(!s)return;var w=Math.min(280,W-16),x=W/2-w/2,y=34;R(0,0,W,H,'rgba(0,0,0,.55)');panel(x,y,w,30+s.lines.length*12);
 drawBadge(opp(),x+6,y+6,1);ptextS('DEFENSE ON THE FIELD',x+28,y+8,1,'#ffd400');
 var shown=Math.min(s.lines.length,Math.floor(s.t/0.55)+1);for(var i=0;i<shown;i++){var lastL=i===s.lines.length-1;ptextS(s.lines[i],x+10,y+26+i*12,TXT()>1&&s.lines[i].length*6<w-20?1.5:1,lastL?s.col:'#fff');}
 ptext('TAP TO SKIP',W/2,y+34+s.lines.length*12,1,'#888','c');}
// ---- menus ----
function bg(){R(0,0,W,H,'#0b1226');for(var i=0;i<W;i+=16)R(i,H-30+((i/16)%2)*2,16,30,(i/16)%2?'#2f7a2c':'#2a6d28');R(0,H-31,W,1,'#fff');}
function drawTitle(){bg();ptextS('CULLMAN COUNTY',W/2,30,W<400?2:3,'#ffd400','c');ptextS('GRIDIRON',W/2,52,W<400?4:5,'#fff','c');ptextS('FRIDAY NIGHT RETRO FOOTBALL',W/2,86,1,'#9ad0ff','c');
 var y=110;if(C){button(W/2-80,y,160,30,'CONTINUE CAREER',function(){scene=C.phase==='offseason'?'offs':'hub'},'#1e7a3c');y+=40;}
 button(W/2-80,y,160,30,'NEW CAREER',function(){scene='pick'},'#c0392b');y+=40;button(W/2-80,y,160,26,'SETTINGS',function(){scene='settings';setPage=0},'#1f4fa3');playMusic('title');
 for(var i=0;i<TEAMS.length;i++)drawBadge(TEAMS[i],W/2-(TEAMS.length*20)/2+i*20,H-22,1);}
function drawPick(){bg();ptextS('PICK YOUR SCHOOL',W/2,10,2,'#fff','c');var cols=W<400?2:4,cw=W<400?138:110,ch=W<400?Math.max(44,Math.min(52,(H-60)/4-6)):50,gx=W/2-(cols*cw+(cols-1)*6)/2;
 TEAMS.forEach(function(T,i){var x=gx+(i%cols)*(cw+6),y=30+Math.floor(i/cols)*(ch+6);btns.push({x:x,y:y,w:cw,h:ch,fn:function(){C=newCareer(T.id);save();scene='hub';}});
  R(x-1,y-1,cw+2,ch+2,'#000');R(x,y,cw,ch,T.c1);R(x,y,cw,3,T.c2);drawBadge(T,x+4,y+6,1);ptextS(T.name,x+24,y+7,1,'#fff');ptextS(T.mascot,x+24,y+16,1,T.c2==='#ffffff'?'#ddd':T.c2);
  ptext((T['class']||'')+' REGION '+(T.region||'')+'  OVR '+T.rating,x+24,y+26,1,'#fff');ptext(T.stadium.slice(0,Math.floor((cw-28)/4)),x+24,y+35,1,'#ccc');});
 button(6,H-26,60,20,'BACK',function(){scene='title'},'#444');}
function drawHub(){bg();var T=me();drawBadge(T,8,6,2);ptextS(T.name+' '+T.mascot,46,8,W<400?1:2,'#fff');ptextS('SEASON '+C.season+'  RECORD '+C.w+'-'+C.l+'  POINTS '+C.pts,46,26,1,'#ffd400');
 ptext('MORALE '+Math.round(C.morale)+'  OFF '+Math.round(offRating())+'  DEF '+Math.round(defRating()),46,36,1,'#9ad0ff');
 var y=50;C.sched.forEach(function(g,i){var O=teamById(g.opp);var lab=(g.type==='county'?'COUNTY FINAL ':g.type==='state'?'STATE FINAL ':'WK '+(i+1)+' ')+'VS '+O.name+(isRival(C.team,g.opp)?' (RIVAL)':'')+(O.fictional?' *':'');
  var r=g.res?(g.res.win?'W ':'L ')+g.res.my+'-'+g.res.op:i===C.week?'NEXT':'';R(8,y-2,W-16,10,i===C.week?'rgba(255,212,0,.15)':'rgba(255,255,255,.04)');drawBadge(O,8,y-4,0.5);ptext(lab,20,y,1,i===C.week?'#ffd400':'#fff');ptext(r,W-12,y,1,g.res?(g.res.win?'#9cff57':'#ff7070'):'#ffd400','r');y+=11;});
 if(C.trophies.length)ptext('TROPHIES: '+C.trophies.join(', ').slice(0,Math.floor((W-16)/4)),8,y+2,1,'#ffd400');
 var by=H-38;if(C.phase==='offseason')button(W/2-70,by,140,28,'START OFFSEASON',function(){scene='offs'},'#1e7a3c');
 else button(W/2-70,by,140,28,'PLAY GAME',startWeek,'#c0392b');
 var lx=ST.lefty?W-70:6,rx=ST.lefty?6:W-70;button(lx,by,64,28,'TEAM',function(){scene='team'},'#1f4fa3');button(rx,by,64,28,'MENU',function(){scene='title';playMusic('title')},'#444');}
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
 if(f.win&&Math.random()<.3)parts.push({x:rnd(0,W/ZP)+camX,y:camY,vx:rnd(-2,2),vy:rnd(0,4),l:2,c:pick([me().c1,me().c2,'#fff']),f:1});
 button(W/2-60,H-40,120,28,'CONTINUE',function(){G=null;scene='hub'},'#1e7a3c');}
function drawOffs(){bg();ptextS('OFFSEASON',W/2,10,3,'#ffd400','c');ptext('SEASON '+C.season+' FINISHED '+C.w+'-'+C.l,W/2,34,1,'#fff','c');ptext('SENIORS GRADUATE, EVERYONE ELSE IMPROVES.',W/2,46,1,'#ccc','c');ptext('DRAFT 3 INCOMING PLAYERS, THEN SPEND POINTS IN TEAM.',W/2,56,1,'#ccc','c');
 button(W/2-60,80,120,30,'TO THE DRAFT',beginOffseason,'#c0392b');}
function drawDraft(){bg();ptextS('DRAFT ROUND '+(C.draft.round+1)+' OF 3',W/2,10,2,'#ffd400','c');var cw=Math.min(140,(W-24)/ (W<400?1:3)),n=3;
 C.draft.pool.forEach(function(p,i){var x,y;if(W<400){x=W/2-cw/2;y=34+i*50;}else{x=8+i*(cw+4)+(W-16-3*cw-8)/2;y=40;}var cur=rosterBy(p.pos).map(function(q){return q.ovr}).sort(function(a,b){return a-b})[0];
  btns.push({x:x,y:y,w:cw,h:44,fn:function(){draftPick(i)}});R(x,y,cw,44,'#14213d');R(x,y,cw,2,'#c0392b');ptextS(p.pos+'  OVR '+p.ovr,x+6,y+6,1,'#fff');ptext(p.name,x+6,y+16,1,'#9ad0ff');ptext('YOUR WORST '+p.pos+': '+(cur==null?'NONE':cur),x+6,y+26,1,p.ovr>(cur||0)?'#9cff57':'#ccc');ptext('TAP TO DRAFT',x+6,y+35,1,'#ffd400');});}
var setPage=0,resetArm=0;
function fsSupported(){var d=document.documentElement;return !!((d.requestFullscreen||d.webkitRequestFullscreen)&&(document.fullscreenEnabled||document.webkitFullscreenEnabled)&&!/iP(hone|od)/.test(navigator.userAgent));}
function toggleFS(){try{var d=document.documentElement,fe=document.fullscreenElement||document.webkitFullscreenElement;if(fe){var x=document.exitFullscreen||document.webkitExitFullscreen;var p=x&&x.call(document);if(p&&p.catch)p.catch(function(){});}else{var r=d.requestFullscreen||d.webkitRequestFullscreen;var p2=r&&r.call(d);if(p2&&p2.catch)p2.catch(function(){});}}catch(e){}}
function cyc(k,list){var i=list.indexOf(ST[k]);ST[k]=list[(i+1)%list.length];saveSet();}
function stepN(k,d,lo,hi){ST[k]=Math.round(Math.max(lo,Math.min(hi,ST[k]+d))*100)/100;saveSet();bus();}
function settingRows(){var r=[
 ['MUSIC VOLUME',Math.round(ST.music*100)+'%',function(){stepN('music',-.1,0,1)},function(){stepN('music',.1,0,1)}],
 ['SFX VOLUME',Math.round(ST.sfx*100)+'%',function(){stepN('sfx',-.1,0,1)},function(){stepN('sfx',.1,0,1);SFX.blip()}],
 ['ANNOUNCER',ST.ann?'ON':'OFF',null,function(){ST.ann=!ST.ann;saveSet();if(ST.ann)say('Announcer on.')}],
 ['VOICE SPEED',ST.annRate.toFixed(2),function(){stepN('annRate',-.15,.6,1.8)},function(){stepN('annRate',.15,.6,1.8);say('Touchdown!')}],
 ['VIBRATION',ST.vib?'ON':'OFF',null,function(){ST.vib=!ST.vib;saveSet();buzz(30)}],
 ['GRAPHICS',ST.quality==='high'?'HIGH':'LOW',null,function(){cyc('quality',['high','low']);resize()}],
 ['EFFECTS',ST.fx?'FULL':'REDUCED',null,function(){ST.fx=!ST.fx;saveSet()}],
 ['FRAME RATE',ST.fps+' FPS',null,function(){ST.fps=ST.fps===60?30:60;saveSet()}],
 ['SCREEN FIT',ST.fit.toUpperCase(),null,function(){cyc('fit',['fit','fill','stretch']);resize()}],
 ['LEFT HANDED',ST.lefty?'ON':'OFF',null,function(){ST.lefty=!ST.lefty;saveSet()}],
 ['DRAG POWER',ST.sens.toFixed(1)+'X',function(){stepN('sens',-.1,.5,1.8)},function(){stepN('sens',.1,.5,1.8)}],
 ['TEXT SIZE',ST.text.toUpperCase(),null,function(){cyc('text',['normal','large'])}],
 ['HIGH CONTRAST',ST.contrast?'ON':'OFF',null,function(){ST.contrast=!ST.contrast;saveSet()}],
 ['QUARTER LENGTH',ST.qlen.toUpperCase(),null,function(){cyc('qlen',['short','normal','long'])}],
 ['DIFFICULTY',ST.diff.toUpperCase(),null,function(){cyc('diff',['easy','normal','hard'])}],
 ['SHOW FPS',ST.showFps?'ON':'OFF',null,function(){ST.showFps=!ST.showFps;saveSet()}]];
 if(fsSupported())r.push(['FULLSCREEN',(document.fullscreenElement||document.webkitFullscreenElement)?'ON':'OFF',null,toggleFS]);
 r.push(['RESET SAVE',resetArm>now()?'TAP AGAIN!':'RESET',null,function(){if(resetArm>now()){C=null;try{LS.setItem(SAVE_KEY,'')}catch(e){}resetArm=0;scene='title';}else resetArm=now()+3000;}]);return r;}
function drawSettings(){bg();ptextS('SETTINGS',W/2,6,2,'#ffd400','c');var rows=settingRows();var cols=W>=440?2:1,rh=22,top=24,avail=H-top-36,per=Math.max(3,Math.floor(avail/rh))*cols;var pages=Math.ceil(rows.length/per);if(setPage>=pages)setPage=pages-1;
 var cw=cols===2?(W-24)/2:W-16;rows.slice(setPage*per,setPage*per+per).forEach(function(r,i){var c=cols===2?Math.floor(i/(per/cols)):0,rr=cols===2?i%(per/cols):i;var x=8+c*(cw+8),y=top+rr*rh;
  R(x,y,cw,rh-3,'rgba(255,255,255,.06)');ptext(r[0],x+4,y+7,1,'#fff');var bx=x+cw-74;if(r[2])button(bx,y+1,18,rh-5,'-',r[2],'#444');ptext(r[1],bx+38,y+7,1,'#ffd400','c');button(bx+56,y+1,18,rh-5,r[2]?'+':'>',r[3],'#1f4fa3');});
 if(pages>1){button(8,H-28,70,22,'PREV',function(){setPage=(setPage+pages-1)%pages},'#444');ptext('PAGE '+(setPage+1)+'/'+pages,W/2,H-21,1,'#ccc','c');button(W-78,H-28,70,22,'NEXT',function(){setPage=(setPage+1)%pages},'#444');}
 button(W/2-30,H-28-(pages>1?26:0),60,22,'DONE',function(){scene='title'},'#1e7a3c');}
function render(){btns=[];ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#05070f';ctx.fillRect(0,0,cv.width,cv.height);ctx.setTransform(S*DPR,0,0,S*DPR,OX*DPR,OY*DPR);ctx.imageSmoothingEnabled=false;ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
 if(scene==='title')drawTitle();else if(scene==='pick')drawPick();else if(scene==='hub')drawHub();else if(scene==='team')drawTeam();else if(scene==='game')drawGame();else if(scene==='final'){drawGame();R(0,0,W,H,'rgba(5,10,25,.85)');btns=[];drawFinal();}else if(scene==='offs')drawOffs();else if(scene==='draft')drawDraft();else if(scene==='settings')drawSettings();
 if(scene==='game')button(2,2,22,18,muted?'X':'S',toggleMute,'rgba(0,0,0,.55)');
 if(ST.showFps)ptextS(Math.round(fpsV)+' FPS',W-4,H-8,1,'#9cff57','r');ctx.restore();
 try{document.body.className=((scene==='game'||scene==='settings')?'ingame':'')+(ST.lefty?' lefty':'');}catch(e){}}
function loop(){var t=now(),dt=Math.min(0.05,(t-last)/1000);last=t;try{if(!document.hidden)update(dt);var minGap=ST.fps===30?31:0;if(t-lastRender>=minGap){fpsN++;fpsAcc+=t-lastRender;if(fpsAcc>500){fpsV=fpsN*1000/fpsAcc;fpsN=0;fpsAcc=0;}lastRender=t;render();}}catch(e){setTimeout(function(){throw e});}requestAnimationFrame(loop);}
// ====== BOOT ======
C=load();
function boot(){requestAnimationFrame(loop);}
try{if(window.fetch){fetch('teams.json?v=6',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.teams&&j.teams.length){TEAMS=j.teams;}}).catch(function(){});}}catch(e){}
boot();
window.__ccStart=function(){au();};
window.__G=function(){return {scene:scene,G:G,C:C}};
window.__T={plays:function(){return PLAYS.map(function(p){return p.name+':'+p.type})},page:function(n){G_playPage=n},choose:function(i){choosePlay(i)},recScreen:function(k){var r=eligible()[k];if(!r)return null;return [OX+fx(r.x)*S,OY+(fy(r.y)-6*MS)*S]},zp:function(){return ZP},scr:function(x,y){return [OX+x*S,OY+y*S]},sc:function(){return S},lw:function(){return W},lh:function(){return H},newCareerAndPlay:function(){C=newCareer(TEAMS[1].id);save();scene='hub';startWeek();},snap:snap,throwTo:function(x,y){var q=G.qb;throwBall((x-q.x)/TUNE.AIM_GAIN*TUNE.PX,(y-q.y)/TUNE.AIM_GAIN*TUNE.PX)},TUNE:TUNE,startWeek:startWeek,kickForce:function(pw,pos){var k=G.kick;if(!k)return;if(k.two){k.stage=1;k.pw=pw;}k.pos=pos;stopKick();},kick:function(){return G.kick&&{kind:G.kick.kind,stage:G.kick.stage,need:G.kick.need,good:G.kick.good,done:G.kick.done}},G:function(){return G},set:function(o){for(var k in o)G[k]=o[k];setupPlay();},patMenu:function(){afterTD()},finish:function(){G.clock=0;G.q=4;if(G.my===G.op)G.my++;G.over=true;finishGame();}};
})();
