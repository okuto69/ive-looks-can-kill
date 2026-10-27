function card(f,n){
 const a=document.createElement('article');a.className='video-card';a.dataset.kind=f.kind;a.dataset.id=f.id;
 a.innerHTML=`<div class="player${f.vertical?' vertical':''}"><button type="button" aria-label="${f.title} のプレーヤーを読み込む"><img src="https://i.ytimg.com/vi/${f.id}/hqdefault.jpg" loading="lazy" alt="${f.title} のYouTubeサムネイル" width="480" height="360"><span class="play" aria-hidden="true">▶</span><span class="load-label">LOAD FILM / プレーヤーを開く</span></button></div><div class="video-meta"><span class="tag">${f.label}</span><span>${String(n).padStart(2,'0')}</span></div><h3 class="video-title">${f.title}</h3><p class="video-desc">${f.desc}</p><details class="original"><summary>元の動画タイトル</summary><p></p></details><div class="video-meta"><span class="author"></span><a class="watch-link" href="https://www.youtube.com/${f.vertical?'shorts/':'watch?v='}${f.id}" target="_blank" rel="noopener noreferrer">YouTubeで見る ↗</a></div>`;
 a.querySelector('.author').textContent=f.author;a.querySelector('.original p').textContent=f.originalTitle;
 a.querySelector('button').addEventListener('click',()=>{
  document.querySelectorAll('iframe').forEach(x=>{const parent=x.closest('.video-card');const old=films.find(v=>parent.dataset.id===v.id);if(old)parent.replaceWith(card(old,films.indexOf(old)+1))});
  const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${f.id}?autoplay=0&playsinline=1&rel=0`;iframe.title=f.originalTitle;iframe.allow='encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';a.querySelector('.player').replaceChildren(iframe);iframe.focus();
 });return a;
}
document.getElementById('featured-video').replaceWith(card(films[0],1));const grid=document.getElementById('videos');films.forEach((f,i)=>grid.append(card(f,i+1)));
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});let count=0;
 grid.querySelectorAll('.video-card').forEach(c=>{c.hidden=b.dataset.filter!=='all'&&c.dataset.kind!==b.dataset.filter;if(!c.hidden)count++;else if(c.querySelector('iframe')){const f=films.find(v=>v.id===c.dataset.id);const fresh=card(f,films.indexOf(f)+1);fresh.hidden=true;c.replaceWith(fresh)}});
 document.getElementById('count').textContent=count+' FILMS';
}));

// LOOP THEATER: play all films in order and loop back to the first.
const theaterList=films.filter(f=>f.embedAvailable);
let tPlayer=null,tIndex=0,tErrors=0,tStarted=false;
const tStage=document.getElementById('theater-stage'),tNow=document.getElementById('theater-now'),tStart=document.getElementById('theater-start');
function tLabel(){const f=theaterList[tIndex];tNow.textContent=String(tIndex+1).padStart(2,'0')+' / '+theaterList.length+' — '+f.title+'（'+f.author+'）';}
function tLoad(i){tIndex=(i+theaterList.length)%theaterList.length;tLabel();if(tPlayer)tPlayer.loadVideoById(theaterList[tIndex].id);}
function tCreate(){
 tPlayer=new YT.Player('theater-frame',{videoId:theaterList[tIndex].id,playerVars:{playsinline:1,rel:0},events:{
  onReady(e){tLabel();e.target.playVideo();},
  onStateChange(e){if(e.data===YT.PlayerState.ENDED){tErrors=0;tLoad(tIndex+1);}},
  onError(){tErrors++;if(tErrors>=theaterList.length){tNow.textContent='再生できる動画がありませんでした。';return;}tLoad(tIndex+1);}
 }});
}
tStart.addEventListener('click',()=>{
 if(tStarted){tStage.scrollIntoView({behavior:'smooth'});return;}
 tStarted=true;tStage.hidden=false;tStart.innerHTML='シアターで再生中 <span>↓</span>';
 if(window.YT&&YT.Player){tCreate();}
 else{const tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);window.onYouTubeIframeAPIReady=tCreate;}
 tStage.scrollIntoView({behavior:'smooth'});
});
document.getElementById('theater-next').addEventListener('click',()=>tLoad(tIndex+1));
document.getElementById('theater-prev').addEventListener('click',()=>tLoad(tIndex-1));
document.getElementById('theater-stop').addEventListener('click',()=>{
 if(tPlayer){tPlayer.destroy();tPlayer=null;}
 const holder=document.createElement('div');holder.id='theater-frame';
 document.querySelector('.theater-player').replaceChildren(holder);
 tStage.hidden=true;tStarted=false;tErrors=0;tIndex=0;
 tStart.innerHTML='連続リピート再生をはじめる <span>▶</span>';
});
