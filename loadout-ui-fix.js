/* HORMUZ WAR — explicit loadout removal buttons */
(function(){
  function addRemoveButtons(){
    const container=document.getElementById('loadoutSlots');
    if(!container) return;
    container.querySelectorAll('.loadout-slot.filled').forEach((slot,index)=>{
      if(slot.querySelector('.loadout-remove')) return;
      const button=document.createElement('button');
      button.type='button';
      button.className='loadout-remove';
      button.title='Remove system';
      button.setAttribute('aria-label','Remove system');
      button.textContent='×';
      button.onclick=function(e){
        e.preventDefault();
        e.stopPropagation();
        if(typeof state==='undefined') return;
        const systemId=state.loadout[index];
        if(!systemId) return;
        state.loadout.splice(index,1);
        if(typeof renderArsenal==='function') renderArsenal();
        if(typeof renderLoadoutSlots==='function') renderLoadoutSlots();
        if(typeof showToast==='function') showToast('System removed — choose another system');
      };
      slot.appendChild(button);
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    addRemoveButtons();
    const container=document.getElementById('loadoutSlots');
    if(container){
      new MutationObserver(addRemoveButtons).observe(container,{childList:true});
    }
  });
})();
