/* =========================================================
   HORMUZ WAR — BATTLE ENGINE v0.5
   Tactical combat layer for the 10-system loadout.
   Loaded after game.js and arsenal/tactical layers.
========================================================= */

(function () {
  const originalStartGame = window.startGame;
  const originalFire = window.fire;
  const originalEndTurn = window.endTurn;
  const originalEnemyTurn = window.enemyTurn;

  function ensureState() {
    state.tactical = state.tactical || {
      reconBonus: {},
      defenseBonus: {},
      mobilityBonus: {},
      disrupted: {},
      smoke: {},
      decoys: {},
      mines: []
    };
    state.combatLog = state.combatLog || [];
    state.turnSpent = !!state.turnSpent;
  }

  function logCombat(message) {
    ensureState();
    state.combatLog.unshift(`T${state.turn}: ${message}`);
    state.combatLog = state.combatLog.slice(0, 8);
  }

  function aliveUnits(side) {
    return state.units.filter(u => u.side === side && u.hp > 0);
  }

  function unitDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function currentSystem() {
    return state.selectedSystem ? SYSTEMS[state.selectedSystem] : null;
  }

  function isDefensive(id) {
    return ["interceptor", "rapidDefense", "pointDefense", "shield", "smokeScreen"].includes(id);
  }

  function isRecon(id) {
    return ["recon", "sonarSweep", "sensorDrone", "stealthDrone", "decoyDrone"].includes(id);
  }

  function isSupport(id) {
    return id === "repair";
  }

  function isDisruption(id) {
    return ["jammer", "counterJammer", "empPulse"].includes(id);
  }

  function isArea(id) {
    return ["shockwave", "clusterMissile", "barrageRocket", "saturationMissile", "seaMine"].includes(id);
  }

  function getTargetableEnemies(attacker) {
    return aliveUnits(attacker.side === "northern" ? "southern" : "northern");
  }

  function tacticalRangeCheck(attacker, target, system) {
    if (!system || !target || system.range <= 0) return true;
    const distance = unitDistance(attacker, target);
    const normalized = distance * 1.35;
    return normalized <= system.range + 10;
  }

  function tacticalAccuracy(attacker, target, system) {
    let chance = system.accuracy;
    const id = state.selectedSystem;
    const distance = unitDistance(attacker, target);

    chance -= Math.abs(state.power - 70) * 0.12;
    chance -= Math.max(0, distance - system.range * 0.65) * 0.35;

    if (state.tactical.reconBonus[attacker.id]) chance += 10;
    if (state.tactical.disrupted[attacker.id]) chance -= 15;
    if (state.tactical.smoke[target.id]) chance -= 22;
    if (state.tactical.decoys[target.id]) chance -= 12;

    if (id === "precision" || id === "guidedStrike") chance += 5;
    if (id === "heavyMissile" || id === "saturationMissile") chance -= 3;

    return Math.max(15, Math.min(97, chance));
  }

  function tacticalDamage(attacker, target, system) {
    let damage = system.damage || 0;
    if (!damage) return 0;

    const powerMultiplier = 0.70 + state.power / 250;
    damage *= powerMultiplier;

    if (target.type === "defense") damage *= 0.82;
    if (state.tactical.defenseBonus[target.id]) damage *= 0.70;
    if (state.shielded[target.side]) damage *= 0.55;
    if (state.tactical.mobilityBonus[target.id]) damage *= 0.90;

    if (system.range >= 90 && unitDistance(attacker, target) > 55) damage *= 1.08;
    if (system.damage >= 65) damage *= 1.04;

    damage *= 0.90 + Math.random() * 0.20;
    return Math.max(1, Math.round(damage));
  }

  function applyTacticalDamage(target, damage, sourceId) {
    if (!target || target.hp <= 0) return;
    const oldHp = target.hp;
    target.hp = Math.max(0, target.hp - damage);

    if (damage >= 25) target.defense = Math.max(0, target.defense - 4);
    if (damage >= 45) target.engine = Math.max(0, target.engine - 7);
    if (sourceId === "empPulse") target.radar = Math.max(0, target.radar - 18);
    if (sourceId === "coastalMissile" || sourceId === "counterBattery") target.radar = Math.max(0, target.radar - 6);

    if (oldHp > 0 && target.hp === 0) logCombat(`${target.name} destroyed.`);
  }

  function consume(systemId) {
    if (typeof state.uses[systemId] !== "number") state.uses[systemId] = SYSTEMS[systemId].uses;
    state.uses[systemId] = Math.max(0, state.uses[systemId] - 1);
  }

  function activateSupport(id, attacker, target) {
    if (id === "repair") {
      const before = attacker.hp;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + 28);
      logCombat(`${attacker.name} repaired +${attacker.hp - before} HP.`);
      return true;
    }

    if (id === "shield") {
      state.shielded[attacker.side] = true;
      state.tactical.defenseBonus[attacker.id] = 35;
      logCombat(`${attacker.name} activated Emergency Shield.`);
      return true;
    }

    if (id === "smokeScreen") {
      state.tactical.smoke[attacker.id] = 2;
      state.tactical.defenseBonus[attacker.id] = 20;
      logCombat(`${attacker.name} deployed Smoke Screen.`);
      return true;
    }

    if (["interceptor", "rapidDefense", "pointDefense"].includes(id)) {
      state.tactical.defenseBonus[attacker.id] = 20;
      logCombat(`${attacker.name} established active defense.`);
      return true;
    }

    return false;
  }

  function activateRecon(id, attacker, target) {
    state.tactical.reconBonus[attacker.id] = 2;
    if (target) target.radar = Math.min(100, target.radar + 5);

    if (id === "decoyDrone") {
      state.tactical.decoys[attacker.id] = 2;
      logCombat(`${attacker.name} launched a decoy signature.`);
    } else {
      logCombat(`${id === "sonarSweep" ? "Sonar sweep" : id === "sensorDrone" ? "Sensor drone" : "Recon"} improved targeting data.`);
    }
    return true;
  }

  function activateDisruption(id, attacker, target) {
    if (!target) return false;
    state.tactical.disrupted[target.id] = 2;

    if (id === "empPulse") {
      target.radar = Math.max(0, target.radar - 20);
      target.engine = Math.max(0, target.engine - 8);
    }

    logCombat(`${target.name} systems disrupted.`);
    return true;
  }

  function activateArea(id, attacker, target, system) {
    if (id === "seaMine") {
      state.tactical.mines.push({ x: target.x, y: target.y, side: attacker.side, damage: 30, turns: 3 });
      logCombat(`Sea Mine deployed near ${target.name}.`);
      return false;
    }

    if (!target) return false;
    const radius = id === "shockwave" ? 12 : 10;
    const splash = Math.round((system.damage || 30) * 0.25);

    state.units.forEach(unit => {
      if (unit.side === attacker.side || unit.hp <= 0 || unit.id === target.id) return;
      if (unitDistance(unit, target) <= radius) {
        applyTacticalDamage(unit, splash, id);
        createImpact(unit, splash);
      }
    });
    return false;
  }

  function activateMobility(id, attacker) {
    state.tactical.mobilityBonus[attacker.id] = 2;
    attacker.engine = Math.min(100, attacker.engine + 8);
    logCombat(`${attacker.name} gained mobility advantage.`);
    return true;
  }

  function performTacticalAction(attacker, target, system) {
    const id = state.selectedSystem;
    ensureState();

    if (isSupport(id) || isDefensive(id)) {
      activateSupport(id, attacker, target);
      return { resolved: true, hit: true, damage: 0 };
    }

    if (isRecon(id)) {
      activateRecon(id, attacker, target);
      return { resolved: true, hit: true, damage: 0 };
    }

    if (isDisruption(id)) {
      activateDisruption(id, attacker, target);
      return { resolved: true, hit: true, damage: 0 };
    }

    if (isArea(id)) {
      const rangeOk = id === "seaMine" || tacticalRangeCheck(attacker, target, system);
      if (!rangeOk) return { resolved: true, hit: false, damage: 0, message: "OUT OF RANGE" };
      const chance = tacticalAccuracy(attacker, target, system);
      const hit = Math.random() * 100 <= chance;
      if (hit) {
        const damage = tacticalDamage(attacker, target, system);
        applyTacticalDamage(target, damage, id);
        createImpact(target, damage);
        activateArea(id, attacker, target, system);
        logCombat(`${system.name} hit ${target.name} for ${damage}.`);
      } else {
        createMissImpact(target);
        logCombat(`${system.name} missed ${target.name}.`);
      }
      return { resolved: true, hit, damage };
    }

    if (id === "fastBoat" || id === "ramBoat") {
      activateMobility(id, attacker);
    }

    if (!tacticalRangeCheck(attacker, target, system)) {
      return { resolved: true, hit: false, damage: 0, message: "OUT OF RANGE" };
    }

    const chance = tacticalAccuracy(attacker, target, system);
    const hit = Math.random() * 100 <= chance;
    if (!hit) {
      createMissImpact(target);
      logCombat(`${system.name} missed ${target.name}.`);
      return { resolved: true, hit: false, damage: 0 };
    }

    const damage = tacticalDamage(attacker, target, system);
    applyTacticalDamage(target, damage, id);
    createImpact(target, damage);
    logCombat(`${system.name} hit ${target.name} for ${damage}.`);
    return { resolved: true, hit: true, damage };
  }

  window.battleEngine = {
    ensureState,
    performTacticalAction,
    logCombat,
    tacticalAccuracy,
    tacticalDamage
  };

  window.startGame = function () {
    if (originalStartGame) originalStartGame();
    ensureState();
    state.combatLog = [];
  };

  window.fire = function () {
    ensureState();
    if (state.phase !== "PLANNING" || state.turnSpent) return originalFire ? originalFire() : null;
    if (!state.selectedUnit || !state.selectedSystem || !state.target) return originalFire ? originalFire() : null;

    const system = currentSystem();
    if (!system) return;

    state.phase = "FIRING";
    state.turnSpent = true;
    consume(state.selectedSystem);
    renderGame();

    const attacker = state.selectedUnit;
    const target = state.target;

    const projectileSystems = ["basicMissile", "heavyMissile", "precision", "longRange", "guidedStrike", "coastalMissile", "counterBattery", "clusterMissile", "shockwave", "saturationMissile", "barrageRocket", "ramBoat", "fastBoat", "empPulse"];
    if (!projectileSystems.includes(state.selectedSystem)) {
      setTimeout(() => {
        const result = performTacticalAction(attacker, target, system);
        if (result.message) showToast(result.message);
        renderGame();
        checkVictory();
        if (state.phase !== "VICTORY") setTimeout(finishPlayerTurn, 500);
      }, 200);
      return;
    }

    animateProjectile(attacker, target, system);
  };

  window.resolveAttack = function (attacker, target, system) {
    if (state.phase === "VICTORY") return;
    const result = performTacticalAction(attacker, target, system);
    if (result.message) showToast(result.message);
    renderGame();
    checkVictory();
    if (state.phase !== "VICTORY") setTimeout(finishPlayerTurn, 650);
  };

  window.chooseEnemySystem = function (enemySide) {
    ensureState();
    const faction = enemySide === "northern" ? "north" : "south";
    const available = FACTION_LOADOUTS[faction] || [];
    const usable = available.filter(id => SYSTEMS[id] && usesLeft(id) > 0);
    if (!usable.length) return null;

    const attack = usable.filter(id => (SYSTEMS[id].damage || 0) > 0);
    const defense = usable.filter(id => isDefensive(id) || isRecon(id) || isDisruption(id));

    // AI occasionally uses support/disruption instead of always firing missiles.
    const pool = Math.random() < 0.25 && defense.length ? defense : attack;
    if (!pool.length) return usable[Math.floor(Math.random() * usable.length)];
    pool.sort((a, b) => (SYSTEMS[b].damage || 0) - (SYSTEMS[a].damage || 0));
    return pool[Math.floor(Math.random() * Math.min(pool.length, 4))];
  };

  const oldEnemyTurn = originalEnemyTurn;
  window.enemyTurn = function () {
    ensureState();
    if (oldEnemyTurn) oldEnemyTurn();
  };

  window.endTurn = function () {
    ensureState();
    if (oldEnemyTurn) return originalEndTurn ? originalEndTurn() : null;
  };

  // Mine damage and temporary tactical effects expire at turn boundaries.
  const oldFinishPlayerTurn = window.finishPlayerTurn;
  window.finishPlayerTurn = function () {
    ensureState();
    if (oldFinishPlayerTurn) oldFinishPlayerTurn();
  };
})();
