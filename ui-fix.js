/* HORMUZ WAR v0.2 UI compatibility layer */
(function(){
  function show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const el=document.getElementById(id);
    if(el) el.classList.add('active');
  }

  function wireBackButtons(){
    document.querySelectorAll('[data-back]').forEach(btn=>{
      btn.onclick=function(){
        const map={menu:'screen-menu',modes:'screen-modes',factions:'screen-factions'};
        show(map[this.dataset.back]||'screen-menu');
      };
    });
  }

  function refreshActions(){
    const ready=document.getElementById('readyBtn');
    const selected=document.querySelectorAll('#arsenalList .system-card.selected').length;
    if(ready) ready.disabled=selected!==5;

    const fire=document.getElementById('fireButton');
    if(fire){
      const system=document.querySelector('#battleLoadout .battle-system.selected');
      const target=document.getElementById('targetInfo');
      const hasTarget=target && !/select a unit/i.test(target.textContent||'');
      fire.disabled=!(system && hasTarget);
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    wireBackButtons();
    document.addEventListener('click',function(){setTimeout(refreshActions,40);});
    setInterval(refreshActions,250);
  });
})();
