/* =========================================================
   HORMUZ WAR — COUNTER / INTERCEPTION v0.7
   Active defensive interception for incoming projectiles.
========================================================= */
(function () {
  const INTERCEPTORS = {
    interceptor: { name: "Basic Interceptor", baseChance: 72, range: 75, priority: 1 },
    rapidDefense: { name: "Rapid Defense Missile", baseChance: 80, range: 90, priority: 2 },
    pointDefense: { name: "Point Defense", baseChance: 88, range: 72, priority: 3 }
  };

  const PROJECTILES = new Set([
    "basicMissile", "heavyMissile", "precision", "longRange",
    "guidedStrike", "coastalMissile", "counterBattery", "clusterMissile",
    "shockwave", "saturationMissile", "barrageRocket", "empPulse"
  ]);

  const DIFFICULTY = {
    basicMissile: 1.00, precision: 0.92, guidedStrike: 0.94,
    heavyMissile: 0.76, longRange: 0.86, coastalMissile: 0.88,
    counterBattery: 0.84, clusterMissile: 0.72, shockwave: 0.68,
    barrageRocket: 0.70, saturationMissile: 0.58, empPulse: 0.82
  };

  function ensureCounterState() {
    state.counter = state.counter || { armed: {}, lastResult: null, incoming: null };
  }

  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function isProjectile(id) { return PROJECTILES.has(id); }
  function toast(text) { if (typeof showToast === "function") showToast(text); }

  function counterEffect(x, y, success) {
    const effects = document.getElementById("effects");
    if (!effects) return;
    const el = document.createElement("div");
    el.className = success ? "intercept-effect intercept-success" : "intercept-effect intercept-fail";
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.textContent = success ? "INTERCEPTED" : "INTERCEPT FAILED";
    effects.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function getArmedDefenses(target) {
    ensureCounterState();
    const defenders = [];
    Object.keys(state.counter.armed).forEach(id => {
      const armed = state.counter.armed[id];
      if (!armed || armed.charges <= 0) return;
      const unit = state.units.find(u => u.id === id);
      const info = INTERCEPTORS[armed.systemId];
      if (!unit || unit.hp <= 0 || unit.side !== target.side || !info) return;
      if (distance(unit, target) * 1.35 > info.range + 10) return;
      defenders.push({ unit, systemId: armed.systemId, info, distance: distance(unit, target) });
    });
    defenders.sort((a, b) => b.info.priority - a.info.priority || a.distance - b.distance);
    return defenders;
  }

  function interceptionChance(defender, missileId, missileAttacker) {
    let chance = defender.info.baseChance * (DIFFICULTY[missileId] || 0.82);
    chance += (defender.unit.radar - 70) * 0.10;
    if (defender.unit.radar < 40) chance -= 12;
    if (defender.unit.engine < 45) chance -= 5;
    if (missileId === "saturationMissile") chance -= 5;
    if (missileAttacker && distance(missileAttacker, defender.unit) < 35) chance -= 8;
    return Math.max(18, Math.min(96, chance));
  }

  function consumeDefense(defender) {
    const armed = state.counter.armed[defender.unit.id];
    if (!armed) return;
    armed.charges = Math.max(0, armed.charges - 1);
    if (armed.charges <= 0) delete state.counter.armed[defender.unit.id];
  }

  function tryIntercept(attacker, target, systemId) {
    ensureCounterState();
    if (!target || !isProjectile(systemId)) return { attempted: false };
    const defenses = getArmedDefenses(target);
    if (!defenses.length) return { attempted: false };

    const defender = defenses[0];
    const chance = interceptionChance(defender, systemId, attacker);
    const success = Math.random() * 100 <= chance;
    consumeDefense(defender);

    state.counter.incoming = {
      attackerId: attacker.id, targetId: target.id, systemId,
      defenderId: defender.unit.id, chance,
      result: success ? "INTERCEPTED" : "FAILED"
    };
    state.counter.lastResult = state.counter.incoming;
    counterEffect(target.x, target.y, success);

    if (success) {
      toast(`${defender.info.name}: ${SYSTEMS[systemId].name} INTERCEPTED — ${Math.round(chance)}%`);
    } else {
      toast(`${defender.info.name}: INTERCEPTION FAILED — ${Math.round(chance)}%`);
    }
    return { attempted: true, success, chance, defender };
  }

  function armDefense(unit, systemId) {
    ensureCounterState();
    const info = INTERCEPTORS[systemId];
    if (!info) return;
    state.counter.armed[unit.id] = { systemId, charges: 1, armedTurn: state.turn };
    toast(`${info.name} ARMED — awaiting incoming missile`);
    renderCounterStatus();
  }

  function renderCounterStatus() {
    ensureCounterState();
    const panel = document.getElementById("targetPanel");
    if (!panel) return;
    let badge = panel.querySelector(".counter-status");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "counter-status";
      panel.appendChild(badge);
    }
    const armed = Object.keys(state.counter.armed).map(id => {
      const a = state.counter.armed[id];
      const u = state.units.find(x => x.id === id);
      return u && a ? `${u.name}: ${INTERCEPTORS[a.systemId].name}` : null;
    }).filter(Boolean);
    if (!armed.length) {
      badge.textContent = "COUNTER // STANDBY";
      badge.classList.remove("armed");
    } else {
      badge.textContent = `COUNTER // ARMED: ${armed.join(" | ")}`;
      badge.classList.add("armed");
    }
  }

  function animateIncoming(attacker, target, systemId, done) {
    const battlefield = document.getElementById("battlefield");
    const layer = document.getElementById("projectiles");
    if (!battlefield || !layer) { done(false); return; }

    const projectile = document.createElement("div");
    projectile.className = "projectile incoming-projectile";
    projectile.style.left = `${attacker.x}%`;
    projectile.style.top = `${attacker.y}%`;
    layer.appendChild(projectile);

    const startX = battlefield.clientWidth * attacker.x / 100;
    const startY = battlefield.clientHeight * attacker.y / 100;
    const endX = battlefield.clientWidth * target.x / 100;
    const endY = battlefield.clientHeight * target.y / 100;
    const duration = 650;
    const start = performance.now();

    function frame(time) {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 2);
      projectile.style.left = `${startX + (endX - startX) * eased}px`;
      projectile.style.top = `${startY + (endY - startY) * eased}px`;

      if (progress >= 0.65 && !projectile.dataset.counterChecked) {
        projectile.dataset.counterChecked = "1";
        const result = tryIntercept(attacker, target, systemId);
        if (result.success) {
          projectile.classList.add("intercepted-projectile");
          setTimeout(() => { projectile.remove(); done(true); }, 180);
          return;
        }
      }

      if (progress < 1) requestAnimationFrame(frame);
      else { projectile.remove(); done(false); }
    }
    requestAnimationFrame(frame);
  }

  function resolveEnemyAttack(attacker, target, systemId) {
    const system = SYSTEMS[systemId];
    if (!system || !target || target.hp <= 0) return;
    state.selectedSystem = systemId;
    state.selectedUnit = attacker;
    state.target = target;
    state.power = 70;
    if (window.battleEngine && window.battleEngine.performTacticalAction) {
      window.battleEngine.performTacticalAction(attacker, target, system);
    } else if (typeof resolveAttack === "function") {
      resolveAttack(attacker, target, system);
      return;
    }
    renderGame();
    checkVictory();
  }

  function chooseEnemyProjectile(enemySide) {
    const faction = enemySide === "northern" ? "north" : "south";
    const available = FACTION_LOADOUTS[faction] || [];
    const usable = available.filter(id =>
      SYSTEMS[id] && isProjectile(id) && (SYSTEMS[id].damage || 0) > 0 && usesLeft(id) > 0
    );
    if (!usable.length) return null;
    const scored = usable.map(id => ({ id, score: (SYSTEMS[id].damage || 0) + Math.random() * 45 }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].id;
  }

  function enemyTurnWithInterception() {
    ensureCounterState();
    const enemySide = state.playerSide === "northern" ? "southern" : "northern";
    const enemyUnits = state.units.filter(u => u.side === enemySide && u.hp > 0);
    const playerUnits = state.units.filter(u => u.side === state.playerSide && u.hp > 0);
    if (!enemyUnits.length || !playerUnits.length) { checkVictory(); return; }

    const attacker = enemyUnits[Math.floor(Math.random() * enemyUnits.length)];
    const target = [...playerUnits].sort((a, b) => a.hp - b.hp)[0];
    const systemId = chooseEnemyProjectile(enemySide);
    if (!systemId) { state.counter.armed = {}; if (typeof endTurn === "function") endTurn(); return; }

    if (typeof state.uses[systemId] !== "number") state.uses[systemId] = SYSTEMS[systemId].uses;
    state.uses[systemId] = Math.max(0, state.uses[systemId] - 1);
    state.selectedUnit = attacker;
    state.target = target;
    state.selectedSystem = systemId;
    state.phase = "FIRING";

    if (Object.keys(state.counter.armed).length) toast("INCOMING THREAT DETECTED");
    renderCounterStatus();
    renderGame();

    setTimeout(() => {
      animateIncoming(attacker, target, systemId, intercepted => {
        if (!intercepted) resolveEnemyAttack(attacker, target, systemId);
        else { renderGame(); checkVictory(); }

        state.counter.armed = {};
        state.counter.incoming = null;
        renderCounterStatus();
        if (state.phase !== "VICTORY" && typeof endTurn === "function") endTurn();
      });
    }, 350);
  }

  const previousFire = window.fire;
  window.fire = function () {
    ensureCounterState();
    const id = state.selectedSystem;
    const unit = state.selectedUnit;
    if (INTERCEPTORS[id] && unit && unit.side === state.playerSide && !state.target) {
      if (state.phase !== "PLANNING" || state.turnSpent) return previousFire();
      if (usesLeft(id) <= 0) return previousFire();
      armDefense(unit, id);
      return previousFire();
    }
    return previousFire();
  };

  window.enemyTurn = enemyTurnWithInterception;

  const previousStartGame = window.startGame;
  window.startGame = function () {
    if (previousStartGame) previousStartGame();
    ensureCounterState();
    state.counter.armed = {};
    state.counter.lastResult = null;
    state.counter.incoming = null;
    setTimeout(renderCounterStatus, 50);
  };

  const previousEndTurn = window.endTurn;
  window.endTurn = function () {
    ensureCounterState();
    state.counter.armed = {};
    state.counter.incoming = null;
    if (previousEndTurn) previousEndTurn();
    setTimeout(renderCounterStatus, 30);
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureCounterState();
    setTimeout(renderCounterStatus, 100);
  });

  window.counterInterception = { armDefense, tryIntercept, renderCounterStatus, INTERCEPTORS, PROJECTILES };
})();
