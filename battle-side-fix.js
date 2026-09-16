/* HORMUZ WAR — PLAYER LEFT / ENEMY RIGHT v0.2 */
(function(){
  "use strict";
  const LEFT=[14,25,18,28], RIGHT=[84,73,82,72];
  function positionStateUnits(){
    if(!window.state||!state.playerSide||!Array.isArray(state.units))return;
    const player=state.playerSide;
    const enemy=player==="northern"?"southern":"northern";
    const mine=state.units.filter(u=>u.side===player),foe=state.units.filter(u=>u.side===enemy);
    mine.forEach((u,i)=>{if(LEFT[i]!==undefined)u.x=LEFT[i];});
    foe.forEach((u,i)=>{if(RIGHT[i]!==undefined)u.x=RIGHT[i];});
  }
  function install(){
    if(typeof window.renderUnits==="function"&&!window.__hormuzSideWrapped){
      const original=window.renderUnits;
      window.renderUnits=function(){positionStateUnits();original();};
      window.__hormuzSideWrapped=true;
    }
    positionStateUnits();
  }
  window.hormuzPositionUnits=positionStateUnits;
  document.addEventListener("DOMContentLoaded",()=>setTimeout(install,50));
  setTimeout(install,100);
})();
