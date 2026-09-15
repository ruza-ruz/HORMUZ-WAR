/* =========================================================
   HORMUZ WAR — TACTICAL SYSTEMS LAYER
   Adds meaningful tactical roles to the expanded arsenal.
   This layer augments the existing game without replacing it.
========================================================= */

const TACTICAL_RULES = {
  attack: {
    label: "DIRECT ATTACK",
    description: "Deals direct damage to the selected enemy unit."
  },
  area: {
    label: "AREA ATTACK",
    description: "Deals reduced secondary damage to nearby units."
  },
  recon: {
    label: "RECON",
    description: "Improves target information and temporarily increases attack accuracy."
  },
  defense: {
    label: "DEFENSE",
    description: "Reduces incoming damage for the protected unit."
  },
  support: {
    label: "SUPPORT",
    description: "Restores or protects a friendly unit."
  },
  disruption: {
    label: "DISRUPTION",
    description: "Weakens enemy accuracy or tactical systems temporarily."
  },
  mobility: {
    label: "MOBILITY",
    description: "Improves the user's tactical positioning for the next exchange."
  }
};

const TACTICAL_SYSTEM_TYPES = {
  basicMissile: "attack",
  heavyMissile: "attack",
  precision: "attack",
  longRange: "attack",
  guidedStrike: "attack",
  coastalMissile: "attack",
  counterBattery: "attack",
  fastBoat: "mobility",
  ramBoat: "mobility",

  clusterMissile: "area",
  shockwave: "area",
  barrageRocket: "area",
  saturationMissile: "area",
  seaMine: "area",

  recon: "recon",
  sonarSweep: "recon",
  sensorDrone: "recon",
  stealthDrone: "recon",
  decoyDrone: "recon",

  interceptor: "defense",
  rapidDefense: "defense",
  pointDefense: "defense",
  shield: "defense",
  smokeScreen: "defense",

  repair: "support",

  jammer: "disruption",
  counterJammer: "disruption",
  empPulse: "disruption"
};

function tacticalType(systemId) {
  return TACTICAL_SYSTEM_TYPES[systemId] || "attack";
}

function tacticalBonus(systemId, attacker, target) {
  const type = tacticalType(systemId);
  const system = SYSTEMS[systemId];
  if (!system) return { accuracy: 0, damage: 0 };

  let accuracy = 0;
  let damage = 0;

  if (type === "recon") accuracy = 8;
  if (type === "mobility") accuracy = 4;
  if (type === "disruption") accuracy = -8;
  if (type === "area") damage = -5;

  // Range advantage: long-range systems gain a small benefit when their
  // configured range is substantially higher than the opponent's.
  if (target && system.range >= 90) accuracy += 3;

  return { accuracy, damage };
}

function tacticalPrepareState() {
  state.tactical = state.tactical || {
    reconBonus: {},
    defenseBonus: {},
    mobilityBonus: {},
    disrupted: {},
    mines: {},
    decoys: {}
  };
}

function tacticalApply(systemId, attacker, target) {
  tacticalPrepareState();

  const type = tacticalType(systemId);
  const system = SYSTEMS[systemId];
  if (!system) return { handled: false };

  if (type === "recon") {
    const id = attacker && attacker.id;
    if (id) state.tactical.reconBonus[id] = 8;
    return { handled: true, message: `${system.name}: target data improved.` };
  }

  if (type === "defense") {
    const id = attacker && attacker.id;
    if (id) state.tactical.defenseBonus[id] = 25;
    return { handled: true, message: `${system.name}: defensive protection activated.` };
  }

  if (type === "support") {
    if (attacker) {
      attacker.hp = Math.min(attacker.maxHp || 100, attacker.hp + 25);
    }
    return { handled: true, message: `${system.name}: +25 HP restored.` };
  }

  if (type === "disruption") {
    if (target && target.id) {
      state.tactical.disrupted[target.id] = 10;
    }
    return { handled: false, message: `${system.name}: enemy systems disrupted.` };
  }

  if (type === "mobility") {
    if (attacker && attacker.id) state.tactical.mobilityBonus[attacker.id] = 6;
    return { handled: false, message: `${system.name}: mobility advantage gained.` };
  }

  return { handled: false };
}

function tacticalAccuracy(systemId, attacker, target) {
  tacticalPrepareState();
  const bonus = tacticalBonus(systemId, attacker, target);

  if (attacker && state.tactical.reconBonus[attacker.id]) {
    bonus.accuracy += state.tactical.reconBonus[attacker.id];
  }

  if (target && state.tactical.disrupted[target.id]) {
    bonus.accuracy -= state.tactical.disrupted[target.id];
  }

  return bonus.accuracy;
}

function tacticalIncomingDamage(target, damage) {
  tacticalPrepareState();
  if (!target) return damage;

  const reduction = state.tactical.defenseBonus[target.id] || 0;
  return Math.max(0, Math.round(damage * (1 - reduction / 100)));
}

function tacticalEndTurnCleanup() {
  tacticalPrepareState();

  ["reconBonus", "defenseBonus", "mobilityBonus", "disrupted"].forEach(key => {
    Object.keys(state.tactical[key]).forEach(id => {
      state.tactical[key][id]--;
      if (state.tactical[key][id] <= 0) delete state.tactical[key][id];
    });
  });
}

function tacticalDescribe(systemId) {
  const type = tacticalType(systemId);
  const system = SYSTEMS[systemId];
  if (!system) return "";

  const rule = TACTICAL_RULES[type];
  return `<div class="tactical-role"><b>${rule ? rule.label : type.toUpperCase()}</b><span>${system.desc}</span></div>`;
}

/* Patch the existing start state without replacing game.js. */
const _originalStartGame = window.startGame;
if (typeof _originalStartGame === "function") {
  window.startGame = function() {
    _originalStartGame();
    tacticalPrepareState();
  };
}

const _originalShowSystemInfo = window.showSystemInfo;
if (typeof _originalShowSystemInfo === "function") {
  window.showSystemInfo = function(systemId) {
    _originalShowSystemInfo(systemId);
    const info = $("systemInfo");
    if (info) info.insertAdjacentHTML("beforeend", tacticalDescribe(systemId));
  };
}
