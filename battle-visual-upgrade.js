/* HORMUZ WAR — large weapon icons, detailed unit art, and FIRE state */
(function(){
  const weaponIcons = {
    basicMissile:"🚀", recon:"📡", interceptor:"🛡️", heavyMissile:"🚀",
    fastBoat:"🚤", precision:"🎯", longRange:"🚀", rapidDefense:"🛡️",
    shockwave:"💥", shield:"🛡️", jammer:"📶", repair:"🔧",
    decoyDrone:"🛸", clusterMissile:"🚀", seaMine:"⚓", smokeScreen:"☁️",
    sonarSweep:"〰️", empPulse:"⚡", saturationMissile:"🚀", stealthDrone:"🛸",
    barrageRocket:"🚀", counterJammer:"📶", ramBoat:"🚤", guidedStrike:"🎯",
    coastalMissile:"🚀", pointDefense:"🛡️", sensorDrone:"📡", counterBattery:"🎯"
  };

  function iconFor(id){ return weaponIcons[id] || (SYSTEMS[id] && SYSTEMS[id].icon) || "◆"; }

  function unitArt(unit){
    const c = unit.side === "northern" ? "#e85d66" : "#62a8ee";
    const d = unit.side === "northern" ? "#531d24" : "#163b61";
    const glow = unit.side === "northern" ? "#ff4f5a" : "#4aa6ff";
    const common = `fill="${d}" stroke="${c}" stroke-width="3" stroke-linejoin="round"`;
    if(unit.type === "ship") return `<svg viewBox="0 0 180 100" aria-hidden="true"><defs><linearGradient id="h${unit.id}" x1="0" x2="0" y1="0" y2="1"><stop stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs><ellipse cx="90" cy="89" rx="75" ry="5" fill="${glow}" opacity=".35"/><path d="M12 58 L35 58 L43 42 L128 42 L143 56 L166 58 L149 79 L32 79 Z" fill="url(#h${unit.id})" stroke="${c}" stroke-width="3"/><rect x="55" y="28" width="52" height="16" rx="3" ${common}/><rect x="70" y="18" width="24" height="10" rx="2" ${common}/><path d="M82 18 L82 8 L90 8 L96 18" fill="none" stroke="${c}" stroke-width="3"/><path d="M108 35 L153 27" stroke="#dbe9ed" stroke-width="4" stroke-linecap="round"/><circle cx="41" cy="65" r="4" fill="#f5d36b"/><circle cx="134" cy="65" r="4" fill="#f5d36b"/></svg>`;
    if(unit.type === "boat") return `<svg viewBox="0 0 180 100" aria-hidden="true"><ellipse cx="90" cy="88" rx="62" ry="5" fill="${glow}" opacity=".4"/><path d="M18 57 L44 57 L59 34 L120 34 L137 57 L164 58 L145 76 L39 76 Z" ${common}/><path d="M63 34 L76 20 L106 20 L120 34 Z" fill="${c}" opacity=".8" stroke="${c}" stroke-width="3"/><rect x="80" y="13" width="5" height="16" fill="#cbd9dd"/><path d="M84 14 L108 20" stroke="#cbd9dd" stroke-width="3"/><path d="M126 45 L157 39" stroke="#dbe9ed" stroke-width="4" stroke-linecap="round"/><circle cx="49" cy="61" r="4" fill="#f5d36b"/></svg>`;
    if(unit.type === "radar") return `<svg viewBox="0 0 180 100" aria-hidden="true"><ellipse cx="90" cy="88" rx="48" ry="5" fill="${glow}" opacity=".3"/><path d="M54 82 L126 82 L116 55 L64 55 Z" ${common}/><rect x="81" y="38" width="18" height="19" ${common}/><circle cx="90" cy="32" r="24" fill="${d}" stroke="#77e5ea" stroke-width="3"/><path d="M90 32 L108 17" stroke="#77e5ea" stroke-width="4" stroke-linecap="round"/><path d="M90 32 L74 45" stroke="#77e5ea" stroke-width="2" opacity=".55"/><path d="M57 32 Q90 0 123 32" fill="none" stroke="#77e5ea" stroke-width="2" opacity=".45"/></svg>`;
    return `<svg viewBox="0 0 180 100" aria-hidden="true"><ellipse cx="90" cy="88" rx="55" ry="5" fill="${glow}" opacity=".3"/><rect x="45" y="60" width="90" height="22" rx="4" ${common}/><path d="M65 60 L73 43 L107 43 L115 60 Z" fill="${c}" opacity=".8" stroke="${c}" stroke-width="3"/><circle cx="90" cy="44" r="15" fill="${d}" stroke="#f2cf69" stroke-width="3"/><path d="M90 44 L122 30" stroke="#f2cf69" stroke-width="5" stroke-linecap="round"/><path d="M42 70 L22 60 M138 70 L158 60" stroke="#a9bdc2" stroke-width="4"/><circle cx="52" cy="72" r="3" fill="#f5d36b"/><circle cx="128" cy="72" r="3" fill="#f5d36b"/></svg>`;
  }

  window.renderUnits = function(){
    const layer = $("unitsLayer");
    if(!layer) return;
    layer.innerHTML = "";
    state.units.forEach(unit=>{
      const el=document.createElement("div");
      el.className=`unit ${unit.type} ${unit.side}${unit.hp<=0?" destroyed":""}`;
      el.style.left=`${unit.x}%`;
      el.style.top=`${unit.y}%`;
      if(state.selectedUnit && state.selectedUnit.id===unit.id) el.classList.add("selected");
      const hp=Math.max(0,Math.min(100,(unit.hp/unit.maxHp)*100));
      el.innerHTML=`<div class="hpbar"><i style="width:${hp}%"></i></div><div class="body">${unitArt(unit)}</div><div class="unit-label">${unit.name}</div>`;
      el.onclick=e=>{e.stopPropagation();selectUnit(unit.id);};
      layer.appendChild(el);
    });
  };

  window.renderBattleLoadout = function(){
    const container=$("battleLoadout");
    if(!container) return;
    container.innerHTML="";
    state.loadout.forEach(systemId=>{
      const system=SYSTEMS[systemId];
      if(!system) return;
      const uses=usesLeft(systemId);
      const slot=document.createElement("button");
      slot.type="button";
      slot.className="battle-slot";
      if(state.selectedSystem===systemId) slot.classList.add("selected");
      if(uses<=0) { slot.classList.add("used"); slot.disabled=true; }
      slot.dataset.system=systemId;
      slot.innerHTML=`<span class="weapon-icon">${iconFor(systemId)}</span><span class="weapon-name">${system.name}</span><span class="weapon-role">${system.role}</span><span class="weapon-ammo">AMMO ${uses}</span>`;
      slot.onclick=()=>selectSystem(systemId);
      container.appendChild(slot);
    });
  };

  const targetless=new Set(["shield","repair","interceptor","rapidDefense","pointDefense","smokeScreen","recon","decoyDrone","sonarSweep","sensorDrone","stealthDrone"]);
  function refreshFire(){
    const btn=$("fireButton");
    if(!btn) return;
    const system=state.selectedSystem ? SYSTEMS[state.selectedSystem] : null;
    let ok=state.phase==="PLANNING" && !state.turnSpent && !!state.selectedUnit && state.selectedUnit.side===state.playerSide && !!system && usesLeft(state.selectedSystem)>0;
    if(ok && !targetless.has(state.selectedSystem)) ok=!!state.target && state.target.hp>0 && state.target.side!==state.playerSide;
    btn.disabled=!ok;
    btn.title=ok?"Launch selected system":"Select your unit, system, and target";
  }
  const oldRenderGame=window.renderGame;
  window.renderGame=function(){if(typeof oldRenderGame==="function") oldRenderGame();refreshFire();};
  const oldSelectUnit=window.selectUnit;
  window.selectUnit=function(id){const r=oldSelectUnit(id);refreshFire();return r;};
  const oldSelectSystem=window.selectSystem;
  window.selectSystem=function(id){const r=oldSelectSystem(id);refreshFire();return r;};
  const oldSelectTarget=window.selectTarget;
  window.selectTarget=function(id){const r=oldSelectTarget(id);refreshFire();return r;};
  document.addEventListener("DOMContentLoaded",()=>setTimeout(refreshFire,50));

  /* Mobile layout hotfix is injected here so it works without another HTML edit. */
  const mobile=document.createElement("style");
  mobile.textContent=`@media(max-width:800px){html,body{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important}#screen-game.game-screen{height:auto!important;min-height:100vh!important;max-height:none!important;overflow-x:hidden!important;overflow-y:visible!important;display:block!important;padding-bottom:28px!important}#screen-game .game-area{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;display:grid!important;grid-template-columns:1fr!important;grid-template-rows:420px auto auto!important;flex:none!important}#screen-game .battlefield{height:420px!important;min-height:420px!important}#screen-game .target-panel{min-height:135px!important;max-height:none!important;overflow:visible!important}#screen-game .control-panel{height:auto!important;min-height:250px!important;max-height:none!important;overflow:visible!important;display:block!important}#screen-game .battle-loadout{height:188px!important;min-height:188px!important;overflow:visible!important;display:grid!important;grid-template-columns:repeat(5,minmax(55px,1fr))!important;grid-template-rows:repeat(2,92px)!important}#screen-game .battle-slot{height:92px!important;min-height:92px!important}#screen-game .aim-controls{height:auto!important;min-height:110px!important;overflow:visible!important;display:grid!important;grid-template-columns:1fr 1fr!important;grid-auto-rows:52px!important}#screen-game .aim-controls .fire-button{grid-column:1/-1!important;height:52px!important}#screen-game .aim-controls .move-button,#screen-game .aim-controls .end-turn-button{height:52px!important}}`;
  document.head.appendChild(mobile);
})();
