/* =========================================================
   HORMUZ WAR — BATTLE MOVEMENT v0.6
   Select unit -> MOVE -> select system -> target -> FIRE.
========================================================= */
(function () {
  const MOVE_RANGE = { ship: 11, boat: 19, radar: 5, defense: 4 };

  function ensureMovementState() {
    state.movement = state.movement || { active: false, moved: {}, preview: null };
  }

  function rangeFor(unit) {
    const base = MOVE_RANGE[unit.type] || 6;
    const engineFactor = Math.max(0.35, (unit.engine || 100) / 100);
    const tacticalBoost = state.tactical && state.tactical.mobilityBonus[unit.id] ? 1.35 : 1;
    return base * engineFactor * tacticalBoost;
  }

  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function setHint(text) {
    const el = document.getElementById("actionHint");
    if (el) el.textContent = text;
  }

  function clearPreview() {
    const p = document.getElementById("movePreview");
    if (p) p.remove();
    if (state.movement) state.movement.preview = null;
  }

  function showRange(unit) {
    clearPreview();
    const battlefield = document.getElementById("battlefield");
    if (!battlefield || !unit) return;
    const ring = document.createElement("div");
    ring.id = "movePreview";
    ring.className = "move-range-ring";
    const range = rangeFor(unit);
    ring.style.left = `${unit.x}%`;
    ring.style.top = `${unit.y}%`;
    ring.style.width = `${range * 2}%`;
    ring.style.height = `${range * 2}%`;
    battlefield.appendChild(ring);
    state.movement.preview = ring;
  }

  function updateMoveButton() {
    let button = document.getElementById("moveButton");
    const controls = document.querySelector(".aim-controls");
    if (!controls) return;
    if (!button) {
      button = document.createElement("button");
      button.id = "moveButton";
      button.className = "move-button";
      controls.insertBefore(button, document.getElementById("fireButton"));
      button.onclick = toggleMoveMode;
    }
    ensureMovementState();
    const unit = state.selectedUnit;
    const usable = unit && unit.side === state.playerSide && unit.hp > 0 && state.phase === "PLANNING" && !state.turnSpent && !state.movement.moved[unit.id];
    button.disabled = !usable;
    button.classList.toggle("active", state.movement.active);
    button.textContent = state.movement.active ? "CANCEL MOVE" : "MOVE";
  }

  function toggleMoveMode() {
    ensureMovementState();
    const unit = state.selectedUnit;
    if (!unit || unit.side !== state.playerSide || unit.hp <= 0) { showToast("Select one of your units first"); return; }
    if (state.phase !== "PLANNING" || state.turnSpent) { showToast("Movement is not available now"); return; }
    if (state.movement.moved[unit.id]) { showToast("This unit has already moved this turn"); return; }
    state.movement.active = !state.movement.active;
    if (state.movement.active) {
      showRange(unit);
      setHint("SELECT MOVE POSITION");
      showToast(`Move range: ${rangeFor(unit).toFixed(1)}`);
    } else {
      clearPreview();
      setHint("SELECT SYSTEM");
    }
    updateMoveButton();
  }

  function battlefieldPoint(event) {
    const battlefield = document.getElementById("battlefield");
    if (!battlefield) return null;
    const rect = battlefield.getBoundingClientRect();
    return {
      x: Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(8, Math.min(92, ((event.clientY - rect.top) / rect.height) * 100))
    };
  }

  function occupied(point, unit) {
    return state.units.some(other => other.id !== unit.id && other.hp > 0 && distance(point, other) < 6);
  }

  function moveUnitTo(point) {
    ensureMovementState();
    const unit = state.selectedUnit;
    if (!unit || !state.movement.active) return;
    const range = rangeFor(unit);
    const d = distance(unit, point);
    if (d > range) { showToast(`OUT OF MOVE RANGE — ${range.toFixed(1)} max`); return; }
    if (occupied(point, unit)) { showToast("POSITION OCCUPIED"); return; }
    if (unit.type !== "radar" && point.y < 50) { showToast("This unit must remain in the sea lane"); return; }

    unit.x = Number(point.x.toFixed(2));
    unit.y = Number(point.y.toFixed(2));
    state.movement.moved[unit.id] = true;
    state.movement.active = false;
    clearPreview();
    unit.engine = Math.max(25, unit.engine - Math.max(2, Math.round(d * 0.12)));
    state.target = null;
    renderGame();
    updateMoveButton();
    setHint("SELECT SYSTEM");
    showToast(`${unit.name} moved ${d.toFixed(1)} tactical units`);
  }

  // Self/support systems do not require an enemy target.
  function wrapTargetlessSystems() {
    const previousFire = window.fire;
    const targetless = new Set(["repair", "shield", "interceptor", "rapidDefense", "pointDefense", "smokeScreen", "recon", "decoyDrone", "sonarSweep", "sensorDrone", "stealthDrone"]);
    window.fire = function () {
      if (!targetless.has(state.selectedSystem) || state.target) return previousFire();
      if (state.phase !== "PLANNING" || state.turnSpent || !state.selectedUnit) return;
      if (usesLeft(state.selectedSystem) <= 0) { showToast("No ammunition remaining"); return; }

      const attacker = state.selectedUnit;
      const system = SYSTEMS[state.selectedSystem];
      state.phase = "FIRING";
      state.turnSpent = true;
      state.uses[state.selectedSystem]--;
      renderGame();

      setTimeout(() => {
        const result = window.battleEngine.performTacticalAction(attacker, null, system);
        if (result.message) showToast(result.message);
        renderGame();
        checkVictory();
        if (state.phase !== "VICTORY") setTimeout(finishPlayerTurn, 500);
      }, 200);
    };
  }

  function install() {
    ensureMovementState();
    const oldStartGame = window.startGame;
    window.startGame = function () {
      if (oldStartGame) oldStartGame();
      ensureMovementState();
      state.movement.active = false;
      state.movement.moved = {};
      clearPreview();
      setHint("SELECT UNIT");
      setTimeout(updateMoveButton, 0);
    };

    wrapTargetlessSystems();

    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () {
        const battlefield = document.getElementById("battlefield");
        if (!battlefield) return;
        updateMoveButton();
        battlefield.addEventListener("click", function (event) {
          ensureMovementState();
          if (!state.movement.active) return;
          if (event.target.closest(".unit")) return;
          const point = battlefieldPoint(event);
          if (point) moveUnitTo(point);
        });
        document.addEventListener("click", function () { setTimeout(updateMoveButton, 20); });
        setInterval(updateMoveButton, 300);
      }, 0);
    });
  }

  window.battleMovement = { rangeFor, toggleMoveMode, moveUnitTo, ensureMovementState };
  install();
})();