/* =========================================================
   HORMUZ WAR — PLAYER LEFT / ENEMY RIGHT
   Keeps the player's force on the left side of the battlefield
   regardless of which faction the player selects.
========================================================= */

(function () {
  "use strict";

  const LEFT_POSITIONS = [14, 25, 18, 28];
  const RIGHT_POSITIONS = [84, 73, 82, 72];

  function getPlayerFaction() {
    const selected = document.querySelector("#screen-factions .faction-card.selected");
    return selected ? selected.dataset.faction : null;
  }

  function positionUnits() {
    const layer = document.getElementById("unitsLayer");
    if (!layer) return;

    const playerFaction = getPlayerFaction();
    if (!playerFaction) return;

    const playerSide = playerFaction === "north" ? "northern" : "southern";
    const playerUnits = Array.from(layer.querySelectorAll(`:scope > .unit.${playerSide}`));
    const enemySide = playerSide === "northern" ? "southern" : "northern";
    const enemyUnits = Array.from(layer.querySelectorAll(`:scope > .unit.${enemySide}`));

    playerUnits.forEach((unit, index) => {
      if (LEFT_POSITIONS[index] !== undefined) unit.style.left = `${LEFT_POSITIONS[index]}%`;
    });

    enemyUnits.forEach((unit, index) => {
      if (RIGHT_POSITIONS[index] !== undefined) unit.style.left = `${RIGHT_POSITIONS[index]}%`;
    });
  }

  function start() {
    const layer = document.getElementById("unitsLayer");
    if (!layer) return;

    positionUnits();
    const observer = new MutationObserver(positionUnits);
    observer.observe(layer, { childList: true });
    window.addEventListener("resize", positionUnits);
    window.hormuzPositionUnits = positionUnits;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
