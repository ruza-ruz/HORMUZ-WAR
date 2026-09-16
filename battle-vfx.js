/* HORMUZ WAR — cinematic 2D battlefield VFX */
(function(){
  const css = document.createElement('link');
  css.rel='stylesheet'; css.href='battle-vfx.css'; document.head.appendChild(css);

  function battlefield(){ return document.getElementById('battlefield'); }
  function layer(id='effects'){ return document.getElementById(id); }
  function point(unit){
    const b=battlefield();
    return {x:b.clientWidth*(unit.x/100), y:b.clientHeight*(unit.y/100)};
  }
  function fx(className,x,y,text){
    const l=layer(); if(!l)return null;
    const e=document.createElement('div'); e.className=className; e.style.left=x+'px'; e.style.top=y+'px';
    if(text)e.textContent=text; l.appendChild(e); return e;
  }
  function pctFx(className,x,y,text){
    const l=layer(); if(!l)return null;
    const e=document.createElement('div'); e.className=className; e.style.left=x+'%'; e.style.top=y+'%';
    if(text)e.textContent=text; l.appendChild(e); return e;
  }
  function cleanup(e,ms){ if(e)setTimeout(()=>e.remove(),ms); }

  function addAtmosphere(){
    const b=battlefield(); if(!b||b.querySelector('.water-shimmer'))return;
    const w=document.createElement('div'); w.className='water-shimmer'; b.appendChild(w);
  }

  function addWakes(){
    document.querySelectorAll('#unitsLayer>div.ship,#unitsLayer>div.boat').forEach(u=>{
      if(!u.querySelector('.wake')){ const w=document.createElement('i'); w.className='wake'; u.appendChild(w); }
    });
  }

  function screenPoint(u){
    const b=battlefield();
    return {x:b.clientWidth*u.x/100 + 42, y:b.clientHeight*u.y/100 + 38};
  }

  function trailBetween(a,b,progress){
    const l=layer('projectiles'); if(!l)return;
    const dx=b.x-a.x,dy=b.y-a.y;
    const x=a.x+dx*progress,y=a.y+dy*progress;
    const len=Math.max(20,Math.hypot(dx,dy)*.28);
    const angle=Math.atan2(dy,dx)*180/Math.PI;
    const t=document.createElement('div'); t.className='fx-trail';
    t.style.left=(x-len*.75)+'px'; t.style.top=(y-2)+'px'; t.style.width=len+'px'; t.style.transform=`rotate(${angle}deg)`;
    l.appendChild(t); cleanup(t,150);
  }

  function smoke(a){
    for(let i=0;i<4;i++){ const e=fx('fx-smoke',a.x+(Math.random()*18-9),a.y+(Math.random()*16-8)); cleanup(e,1100); }
  }

  function muzzle(a){ const e=fx('fx-muzzle',a.x,a.y); cleanup(e,260); }

  function impact(target,damage,miss){
    const p=screenPoint(target);
    if(miss){ const m=fx('fx-splash',p.x,p.y+12); cleanup(m,750); const l=pctFx('fx-label miss',target.x,target.y,'MISS'); cleanup(l,1100); return; }
    const e=fx('fx-impact',p.x,p.y); cleanup(e,650);
    const h=fx('fx-hitflash',p.x-50,p.y-40); cleanup(h,450);
    const d=fx('fx-debris',p.x,p.y); cleanup(d,800);
    const s=fx('fx-splash',p.x,p.y+10); cleanup(s,800);
    const label=pctFx('fx-label damage',target.x,target.y,`-${damage} HP`); cleanup(label,1100);
  }

  function cinematicProjectile(attacker,target,system,done){
    const b=battlefield(), l=layer('projectiles');
    if(!b||!l){done();return;}
    const a=screenPoint(attacker), end=screenPoint(target);
    const p=document.createElement('div'); p.className='projectile cinematic-projectile';
    p.style.left=a.x+'px'; p.style.top=a.y+'px'; l.appendChild(p);
    muzzle(a); smoke(a);
    const start=performance.now();
    const duration=system.id==='shockwave'?720:(system.id==='clusterMissile'?850:780);
    function frame(now){
      const t=Math.min(1,(now-start)/duration), ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      const arc=Math.sin(Math.PI*t)*(system.range>=90?34:18);
      const x=a.x+(end.x-a.x)*ease, y=a.y+(end.y-a.y)*ease-arc;
      p.style.left=x+'px'; p.style.top=y+'px';
      if(t>.06&&t<.94&&Math.random()<.55) trailBetween({x,y},{x:x-(end.x-a.x)*.2,y:y-(end.y-a.y)*.2},1);
      if(Math.random()<.12) smoke({x,y});
      if(t<1) requestAnimationFrame(frame);
      else { p.remove(); done(); }
    }
    requestAnimationFrame(frame);
  }

  const oldAnimate=window.animateProjectile;
  window.animateProjectile=function(attacker,target,system){
    if(!attacker||!target||!system){ if(oldAnimate)oldAnimate(attacker,target,system); return; }
    cinematicProjectile(attacker,target,system,()=>{
      // Resolve through the existing battle engine so damage, range, accuracy,
      // interception state and victory rules remain authoritative.
      if(typeof window.resolveAttack==='function') window.resolveAttack(attacker,target,system);
      else if(oldAnimate) oldAnimate(attacker,target,system);
    });
  };

  // Add a small cinematic hit layer without changing gameplay state.
  const oldRender=window.renderGame;
  window.renderGame=function(){
    if(oldRender)oldRender();
    requestAnimationFrame(()=>{addAtmosphere();addWakes();});
  };

  window.hormuzVFX={impact,smoke,muzzle,cinematicProjectile,addAtmosphere};
  document.addEventListener('DOMContentLoaded',()=>{addAtmosphere();addWakes();});
})();
