/* HORMUZ WAR v0.6 UI compatibility layer */
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
    if(ready) ready.disabled=selected!==10;

    const fire=document.getElementById('fireButton');
    if(fire && typeof state!=='undefined'){
      const system=document.querySelector('#battleLoadout .battle-slot.selected');
      const hasTarget=!!state.target && state.target.hp>0 && state.target.side!==state.playerSide;
      const hasUnit=!!state.selectedUnit && state.selectedUnit.side===state.playerSide && state.selectedUnit.hp>0;
      const usable=state.phase==='PLANNING' && !state.turnSpent;
      fire.disabled=!(system && hasTarget && hasUnit && usable);
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    wireBackButtons();
    document.addEventListener('click',function(){setTimeout(refreshActions,40);});
    setInterval(refreshActions,250);
  });
})();