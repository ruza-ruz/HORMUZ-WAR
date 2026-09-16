/* HORMUZ WAR — player-side orientation + clearer movement interaction */
(function(){
  const originalStartGame = window.startGame;

  function orientBattlefield(){
    if (!state || !state.playerSide || !Array.isArray(state.units)) return;
    // The player's force always deploys on the LEFT. The opposing force always deploys on the RIGHT.
    const playerIsSouth = state.playerSide === "southern";
    state.units.forEach(u => {
      if (u._baseX === undefined) u._baseX = u.x;
      u.x = playerIsSouth ? 100 - u._baseX : u._baseX;
    });
  }

  function showMoveMarker(point){
    const battlefield = document.getElementById("battlefield");
    if (!battlefield) return;
    const old = document.getElementById("moveMarker");
    if (old) old.remove();
    const marker = document.createElement("div");
    marker.id = "moveMarker";
    marker.className = "move-destination-marker";
    marker.style.left = point.x + "%";
    marker.style.top = point.y + "%";
    battlefield.appendChild(marker);
    setTimeout(()=>marker.remove(),900);
  }

  function installMovementUX(){
    const battlefield = document.getElementById("battlefield");
    const button = document.getElementById("moveButton");
    if (!battlefield || !button || battlefield.dataset.moveUxInstalled) return;
    battlefield.dataset.moveUxInstalled = "1";

    battlefield.addEventListener("click", function(event){
      if (!state.movement || !state.movement.active) return;
      if (event.target.closest(".unit")) return;
      const rect = battlefield.getBoundingClientRect();
      const point = {
        x: Math.max(3, Math.min(97, ((event.clientX-rect.left)/rect.width)*100)),
        y: Math.max(8, Math.min(92, ((event.clientY-rect.top)/rect.height)*100))
      };
      const unit = state.selectedUnit;
      if (!unit) return;
      const range = window.battleMovement.rangeFor(unit);
      const d = Math.hypot(unit.x-point.x, unit.y-point.y);
      if (d > range) {
        showToast(`TOO FAR — click inside the highlighted MOVE RANGE (${range.toFixed(1)})`);
        return;
      }
      showMoveMarker(point);
    });
  }

  window.startGame = function(){
    if (originalStartGame) originalStartGame();
    orientBattlefield();
    if (typeof renderGame === "function") renderGame();
    setTimeout(installMovementUX,80);
  };

  document.addEventListener("DOMContentLoaded", ()=>setTimeout(installMovementUX,200));
})();
