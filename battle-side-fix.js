/* =========================================================
   HORMUZ WAR — PLAYER LEFT / ENEMY RIGHT
   Keeps the player's force on the left side of the battlefield
   regardless of which faction the player selects.
========================================================= */

(function () {
  "use strict";

  const PLAYER_POSITIONS = {
    "N-SHIP": 14,
    "N-BOAT": 25,
    "N-RADAR": 18,
    "N-DEF": 28,
    "S-SHIP": 14,
    "S-BOAT": 25,
    "S-RADAR": 18,
    "S-DEF": 28
  };

  const ENEMY_POSITIONS = {
    "N-SHIP": 84,
    "N-BOAT": 73,
    "N-RADAR": 82,
    "N-DEF": 72,
    "S-SHIP": 84,
    "S-BOAT": 73,
    "S-RADAR": 82,
    "S-DEF": 72
  };

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

    layer.querySelectorAll(":scope > .unit").forEach(unitElement => {
      const id = unitElement.dataset.unitId;
      if (!id) return;

      const isPlayer = unitElement.classList.contains(playerSide);
      const positions = isPlayer ? PLAYER_POSITIONS : ENEMY_POSITIONS;
      const x = positions[id];

      if (typeof x === "number") {
        unitElement.style.left = `${x}%`;
      }
    });
  }

  function start() {
    const layer = document.getElementById("unitsLayer");
    if (!layer) return;

    positionUnits();

    const observer = new MutationObserver(() => positionUnits());
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
