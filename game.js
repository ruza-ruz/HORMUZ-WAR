/* =========================================================
   HORMUZ WAR
   Version 0.1 - Tactical Duel Prototype
========================================================= */

const SYSTEMS = {
  basicMissile: {
    name: "Basic Missile",
    icon: "➤",
    faction: "COMMON",
    uses: 5,
    damage: 30,
    accuracy: 82,
    range: 65,
    role: "Attack",
    counter: "Interceptor",
    desc: "Reliable general-purpose attack. Balanced damage and accuracy."
  },

  recon: {
    name: "Recon Drone",
    icon: "◉",
    faction: "COMMON",
    uses: 3,
    damage: 0,
    accuracy: 100,
    range: 90,
    role: "Tactical",
    counter: "—",
    desc: "Reveals tactical information and improves target identification."
  },

  interceptor: {
    name: "Basic Interceptor",
    icon: "◆",
    faction: "COMMON",
    uses: 4,
    damage: 0,
    accuracy: 78,
    range: 75,
    role: "Defense",
    counter: "Heavy saturation",
    desc: "Defensive system. Reserved for incoming missile interception."
  },

  heavyMissile: {
    name: "Heavy Missile",
    icon: "⬟",
    faction: "NORTHERN",
    uses: 2,
    damage: 75,
    accuracy: 55,
    range: 60,
    role: "Attack",
    counter: "Advanced Interceptor",
    desc: "High damage and limited ammunition, but lower accuracy."
  },

  fastBoat: {
    name: "Fast Attack Boat",
    icon: "▰",
    faction: "NORTHERN",
    uses: 1,
    damage: 40,
    accuracy: 90,
    range: 50,
    role: "Attack / Mobility",
    counter: "Precision Attack",
    desc: "Fast expendable combat unit."
  },

  precision: {
    name: "Precision Missile",
    icon: "✦",
    faction: "SOUTHERN",
    uses: 4,
    damage: 40,
    accuracy: 95,
    range: 70,
    role: "Attack",
    counter: "Shield",
    desc: "High-accuracy attack with strong component damage."
  },

  longRange: {
    name: "Long Range Missile",
    icon: "↗",
    faction: "SOUTHERN",
    uses: 3,
    damage: 55,
    accuracy: 70,
    range: 95,
    role: "Attack",
    counter: "Maneuver",
    desc: "Extended reach with moderate accuracy."
  },

  rapidDefense: {
    name: "Rapid Defense Missile",
    icon: "◇",
    faction: "SOUTHERN",
    uses: 4,
    damage: 0,
    accuracy: 75,
    range: 90,
    role: "Defense",
    counter: "—",
    desc: "Defensive interceptor system."
  },

  shockwave: {
    name: "Shockwave",
    icon: "✺",
    faction: "COMMON",
    uses: 2,
    damage: 45,
    accuracy: 65,
    range: 55,
    role: "Area Attack",
    counter: "Distance / Maneuver",
    desc: "Area-effect attack with secondary damage."
  },

  shield: {
    name: "Emergency Shield",
    icon: "⬢",
    faction: "COMMON",
    uses: 2,
    damage: 0,
    accuracy: 100,
    range: 0,
    role: "Defense",
    counter: "—",
    desc: "Reduces incoming damage for one turn."
  },

  jammer: {
    name: "Jammer",
    icon: "≈",
    faction: "NORTHERN",
    uses: 2,
    damage: 0,
    accuracy: 100,
    range: 55,
    role: "Tactical",
    counter: "Countermeasure",
    desc: "Temporarily reduces enemy accuracy."
  },

  repair: {
    name: "Repair System",
    icon: "+",
    faction: "SOUTHERN",
    uses: 2,
    damage: 0,
    accuracy: 100,
    range: 0,
    role: "Support",
    counter: "—",
    desc: "Restores some HP to a damaged friendly unit."
  }
};


/* =========================================================
   FACTION LOADOUTS
========================================================= */

const FACTION_LOADOUTS = {
  north: [
    "basicMissile",
    "recon",
    "interceptor",
    "heavyMissile",
    "fastBoat",
    "shockwave",
    "jammer"
  ],

  south: [
    "basicMissile",
    "recon",
    "interceptor",
    "precision",
    "longRange",
    "rapidDefense",
    "shield",
    "repair"
  ]
};


/* =========================================================
   GAME STATE
========================================================= */

let state = {
  faction: null,

  loadout: [],

  selectedSystem: null,

  selectedUnit: null,

  target: null,

  angle: 45,

  power: 70,

  turn: 1,

  maxTurns: 20,

  northScore: 0,

  southScore: 0,

  phase: "PLANNING",

  units: [],

  playerSide: null,

  turnSpent: false,

  uses: {},

  shielded: {},

  jammed: {}
};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = $(id);

  if (target) {
    target.classList.add("active");
  }
}


function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}


/* =========================================================
   MENU
========================================================= */

function setupMenu() {

  if ($("btnStart")) {
    $("btnStart").onclick = () => {
      showScreen("screen-modes");
    };
  }

  if ($("btnModes")) {
    $("btnModes").onclick = () => {
      showScreen("screen-modes");
    };
  }

  if ($("btnHowTo")) {
    $("btnHowTo").onclick = () => {
      openModal(`
        <h2>HOW TO PLAY</h2>

        <ul>
          <li>Select a faction.</li>
          <li>Choose your battlefield systems.</li>
          <li>Select one of your units.</li>
          <li>Select an attack system.</li>
          <li>Select an enemy target.</li>
          <li>Adjust angle and power.</li>
          <li>Press FIRE.</li>
          <li>Manage ammunition and turns.</li>
          <li>Destroy the enemy force to win.</li>
        </ul>

        <p>
          HORMUZ WAR is designed around tactical decisions,
          resource management and battlefield positioning.
        </p>
      `);
    };
  }

  if ($("btnSettings")) {
    $("btnSettings").onclick = () => {
      openModal(`
        <h2>SETTINGS</h2>
        <p>Prototype settings will be added in a future version.</p>
        <p>Current version: 0.1</p>
      `);
    };
  }

  if ($("btnBackModes")) {
    $("btnBackModes").onclick = () => {
      showScreen("screen-menu");
    };
  }

  if ($("btnBackFactions")) {
    $("btnBackFactions").onclick = () => {
      showScreen("screen-modes");
    };
  }

  if ($("btnBackLoadout")) {
    $("btnBackLoadout").onclick = () => {
      showScreen("screen-factions");
    };
  }

  if ($("btnBackMenu")) {
    $("btnBackMenu").onclick = () => {
      location.reload();
    };
  }
}


/* =========================================================
   MODE SELECTION
========================================================= */

function setupModes() {

  const duelButton = $("btnDuel");

  if (duelButton) {
    duelButton.onclick = () => {
      showScreen("screen-factions");
    };
  }
}


/* =========================================================
   FACTION SELECTION
========================================================= */

function setupFactions() {

  const northern = $("factionNorthern");
  const southern = $("factionSouthern");
  const continueButton = $("continueFaction");

  if (northern) {
    northern.onclick = () => {
      selectFaction("north");
    };
  }

  if (southern) {
    southern.onclick = () => {
      selectFaction("south");
    };
  }

  if (continueButton) {
    continueButton.disabled = true;

    continueButton.onclick = () => {
      if (!state.faction) return;

      setupLoadout();

      showScreen("screen-loadout");
    };
  }
}


function selectFaction(faction) {

  state.faction = faction;

  document.querySelectorAll(".faction-card").forEach(card => {
    card.classList.remove("selected");
  });

  const selected =
    faction === "north"
      ? $("factionNorthern")
      : $("factionSouthern");

  if (selected) {
    selected.classList.add("selected");
  }

  if ($("continueFaction")) {
    $("continueFaction").disabled = false;
  }

  showToast(
    faction === "north"
      ? "NORTHERN FORCES selected"
      : "SOUTHERN FORCES selected"
  );
}


/* =========================================================
   LOADOUT
========================================================= */

function setupLoadout() {

  state.loadout = [];

  renderArsenal();
  renderLoadoutSlots();

  if ($("readyBtn")) {
    $("readyBtn").onclick = startGame;
    $("readyBtn").disabled = true;
  }
}


function renderArsenal() {

  const container = $("arsenalList");

  if (!container) return;

  container.innerHTML = "";

  const systems =
    FACTION_LOADOUTS[state.faction] || [];

  systems.forEach(systemId => {

    const system = SYSTEMS[systemId];

    if (!system) return;

    const card = document.createElement("div");

    card.className = "system-card";

    card.dataset.system = systemId;

    card.innerHTML = `
      <div class="sys-icon">${system.icon}</div>

      <div>
        <div class="sys-name">
          ${system.name}
        </div>

        <div class="sys-meta">
          ${system.role}
          · DMG ${system.damage}
          · ACC ${system.accuracy}%
        </div>
      </div>

      <div class="sys-uses">
        ×${system.uses}
      </div>
    `;

    card.onclick = () => {

      if (state.loadout.includes(systemId)) {

        state.loadout =
          state.loadout.filter(id => id !== systemId);

      } else {

        if (state.loadout.length >= 5) {
          showToast("Maximum 5 systems");
          return;
        }

        state.loadout.push(systemId);
      }

      renderArsenal();
      renderLoadoutSlots();

      showSystemInfo(systemId);
    };

    if (state.loadout.includes(systemId)) {
      card.classList.add("selected");
    }

    container.appendChild(card);
  });
}


function renderLoadoutSlots() {

  const container = $("loadoutSlots");

  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 5; i++) {

    const slot =
      document.createElement("div");

    slot.className = "loadout-slot";

    if (state.loadout[i]) {

      const system =
        SYSTEMS[state.loadout[i]];

      slot.classList.add("filled");

      slot.innerHTML = `
        <span>${system.icon}</span>
        <strong>${system.name}</strong>
        <small>×${system.uses}</small>
      `;

      slot.onclick = () => {

        state.loadout.splice(i, 1);

        renderArsenal();
        renderLoadoutSlots();
      };

    } else {

      slot.textContent =
        `SYSTEM SLOT ${i + 1}`;
    }

    container.appendChild(slot);
  }

  if ($("slotCount")) {
    $("slotCount").textContent =
      `${state.loadout.length}/5`;
  }

  if ($("readyBtn")) {
    $("readyBtn").disabled =
      state.loadout.length < 2;
  }
}


function showSystemInfo(systemId) {

  const system =
    SYSTEMS[systemId];

  const info =
    $("systemInfo");

  if (!system || !info) return;

  info.innerHTML = `
    <strong>${system.name}</strong><br>
    ${system.desc}<br><br>

    <b>Damage:</b> ${system.damage}
    &nbsp; | &nbsp;

    <b>Accuracy:</b> ${system.accuracy}%<br>

    <b>Range:</b> ${system.range}
    &nbsp; | &nbsp;

    <b>Role:</b> ${system.role}
  `;
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  state.selectedSystem = null;
  state.selectedUnit = null;
  state.target = null;

  state.angle = 45;
  state.power = 70;

  state.turn = 1;

  state.northScore = 0;
  state.southScore = 0;

  state.phase = "PLANNING";

  state.playerSide =
    state.faction === "north"
      ? "northern"
      : "southern";

  state.turnSpent = false;

  state.uses = {};
  state.shielded = {};
  state.jammed = {};

  state.loadout.forEach(systemId => {
    state.uses[systemId] =
      SYSTEMS[systemId].uses;
  });

  createUnits();

  showScreen("screen-game");

  renderGame();

  showToast(
    state.faction === "north"
      ? "NORTHERN FORCES — YOUR TURN"
      : "SOUTHERN FORCES — YOUR TURN"
  );
}


/* =========================================================
   CREATE UNITS
========================================================= */

function createUnits() {

  state.units = [

    {
      id: "N-SHIP",
      side: "northern",
      type: "ship",
      name: "NORTH SHIP",
      x: 14,
      y: 65,
      hp: 100,
      maxHp: 100,
      engine: 100,
      radar: 100,
      defense: 100
    },

    {
      id: "N-BOAT",
      side: "northern",
      type: "boat",
      name: "NORTH FAST BOAT",
      x: 25,
      y: 75,
      hp: 55,
      maxHp: 55,
      engine: 100,
      radar: 100,
      defense: 60
    },

    {
      id: "N-RADAR",
      side: "northern",
      type: "radar",
      name: "NORTH RADAR",
      x: 18,
      y: 43,
      hp: 70,
      maxHp: 70,
      engine: 100,
      radar: 100,
      defense: 80
    },

    {
      id: "N-DEF",
      side: "northern",
      type: "defense",
      name: "NORTH DEFENSE",
      x: 28,
      y: 49,
      hp: 65,
      maxHp: 65,
      engine: 100,
      radar: 70,
      defense: 100
    },

    {
      id: "S-SHIP",
      side: "southern",
      type: "ship",
      name: "SOUTH SHIP",
      x: 84,
      y: 65,
      hp: 100,
      maxHp: 100,
      engine: 100,
      radar: 100,
      defense: 100
    },

    {
      id: "S-BOAT",
      side: "southern",
      type: "boat",
      name: "SOUTH FAST BOAT",
      x: 73,
      y: 75,
      hp: 55,
      maxHp: 55,
      engine: 100,
      radar: 100,
      defense: 60
    },

    {
      id: "S-RADAR",
      side: "southern",
      type: "radar",
      name: "SOUTH RADAR",
      x: 82,
      y: 43,
      hp: 70,
      maxHp: 70,
      engine: 100,
      radar: 100,
      defense: 80
    },

    {
      id: "S-DEF",
      side: "southern",
      type: "defense",
      name: "SOUTH DEFENSE",
      x: 72,
      y: 49,
      hp: 65,
      maxHp: 65,
      engine: 100,
      radar: 70,
      defense: 100
    }

  ];
}


/* =========================================================
   RENDER GAME
========================================================= */

function renderGame() {

  renderUnits();

  renderHUD();

  renderBattleLoadout();

  renderTargetPanel();

  renderAim();

  renderSelectedInfo();
}


/* =========================================================
   RENDER UNITS
========================================================= */

function renderUnits() {

  const layer = $("unitsLayer");

  if (!layer) return;

  layer.innerHTML = "";

  state.units.forEach(unit => {

    const element =
      document.createElement("div");

    element.className =
      `unit ${unit.type} ${unit.side}`;

    element.style.left =
      `${unit.x}%`;

    element.style.top =
      `${unit.y}%`;

    if (unit.hp <= 0) {
      element.classList.add("destroyed");
    }

    if (
      state.selectedUnit &&
      state.selectedUnit.id === unit.id
    ) {
      element.classList.add("selected");
    }

    const hpPercent =
      Math.max(
        0,
        Math.min(
          100,
          (unit.hp / unit.maxHp) * 100
        )
      );

    element.innerHTML = `
      <div class="hpbar">
        <i style="width:${hpPercent}%"></i>
      </div>

      <div class="body"></div>

      <div class="unit-label">
        ${unit.name}
      </div>
    `;

    element.onclick = event => {

      event.stopPropagation();

      selectUnit(unit.id);
    };

    layer.appendChild(element);
  });
}


/* =========================================================
   SELECT UNIT
========================================================= */

function selectUnit(unitId) {

  const unit =
    state.units.find(
      item => item.id === unitId
    );

  if (!unit || unit.hp <= 0) return;

  if (
    unit.side !== state.playerSide
  ) {
    selectTarget(unitId);
    return;
  }

  state.selectedUnit = unit;

  renderGame();

  showToast(
    `${unit.name} selected`
  );
}


/* =========================================================
   SELECT TARGET
========================================================= */

function selectTarget(unitId) {

  const unit =
    state.units.find(
      item => item.id === unitId
    );

  if (!unit || unit.hp <= 0) return;

  if (
    unit.side === state.playerSide
  ) {
    return;
  }

  state.target = unit;

  renderTargetPanel();

  updateReticle();

  showToast(
    `${unit.name} targeted`
  );
}


/* =========================================================
   TARGET RETICLE
========================================================= */

function updateReticle() {

  const reticle =
    $("reticle");

  const battlefield =
    $("battlefield");

  if (
    !reticle ||
    !battlefield ||
    !state.target
  ) {
    if (reticle) {
      reticle.style.display = "none";
    }

    return;
  }

  reticle.style.display = "block";

  reticle.style.left =
    `${state.target.x}%`;

  reticle.style.top =
    `${state.target.y}%`;
}


/* =========================================================
   TARGET PANEL
========================================================= */

function renderTargetPanel() {

  const panel =
    $("targetPanel");

  if (!panel) return;

  if (!state.target) {

    panel.innerHTML = `
      <div class="panel-title">
        TARGET
      </div>

      <p style="color:#7f9399;font-size:11px;">
        Select an enemy unit on the battlefield.
      </p>
    `;

    return;
  }

  const target =
    state.target;

  const hp =
    Math.max(
      0,
      Math.round(target.hp)
    );

  panel.innerHTML = `
    <div class="panel-title">
      TARGET STATUS
    </div>

    <div class="status-row">
      <strong>${target.name}</strong>
      <span>${hp}/${target.maxHp} HP</span>
    </div>

    <div class="bar">
      <i style="width:${(hp / target.maxHp) * 100}%"></i>
    </div>

    <div class="status-row">
      <span>ENGINE</span>
      <span>${target.engine}%</span>
    </div>

    <div class="status-row">
      <span>RADAR</span>
      <span>${target.radar}%</span>
    </div>

    <div class="status-row">
      <span>DEFENSE</span>
      <span>${target.defense}%</span>
    </div>
  `;
}


/* =========================================================
   SELECT SYSTEM
========================================================= */

function selectSystem(systemId) {

  if (!state.loadout.includes(systemId)) {
    return;
  }

  const system =
    SYSTEMS[systemId];

  if (!system) return;

  if (usesLeft(systemId) <= 0) {
    showToast("No ammunition remaining");
    return;
  }

  state.selectedSystem =
    systemId;

  renderBattleLoadout();

  renderSelectedInfo();

  showToast(
    `${system.name} selected`
  );
}


/* =========================================================
   BATTLE LOADOUT
========================================================= */

function renderBattleLoadout() {

  const container =
    $("battleLoadout");

  if (!container) return;

  container.innerHTML = "";

  state.loadout.forEach(systemId => {

    const system =
      SYSTEMS[systemId];

    const uses =
      usesLeft(systemId);

    const slot =
      document.createElement("button");

    slot.className = "battle-slot";

    if (
      state.selectedSystem === systemId
    ) {
      slot.classList.add("selected");
    }

    if (uses <= 0) {
      slot.classList.add("used");
      slot.disabled = true;
    }

    slot.innerHTML = `
      <strong>${system.icon} ${system.name}</strong>
      <br>
      <span>
        ${system.damage > 0
          ? `DMG ${system.damage}`
          : system.role}
      </span>
      <br>
      <small>
        AMMO ${uses}
      </small>
    `;

    slot.onclick = () => {
      selectSystem(systemId);
    };

    container.appendChild(slot);
  });
}


/* =========================================================
   AMMUNITION
========================================================= */

function usesLeft(systemId) {

  if (
    typeof state.uses[systemId] !== "number"
  ) {
    return 0;
  }

  return state.uses[systemId];
}


/* =========================================================
   SELECTED SYSTEM INFO
========================================================= */

function renderSelectedInfo() {

  const info =
    $("selectedSystemInfo");

  if (!info) return;

  if (!state.selectedSystem) {

    info.textContent =
      "Select a battlefield system.";

    return;
  }

  const system =
    SYSTEMS[state.selectedSystem];

  info.innerHTML = `
    <b>${system.icon} ${system.name}</b>
    <br>

    Damage:
    ${system.damage}
    · Accuracy:
    ${system.accuracy}%
    · Ammo:
    ${usesLeft(state.selectedSystem)}
  `;
}


/* =========================================================
   AIM CONTROLS
========================================================= */

function renderAim() {

  const angle =
    $("angle");

  const power =
    $("power");

  const angleValue =
    $("angleValue");

  const powerValue =
    $("powerValue");

  if (angle) {
    angle.value = state.angle;
  }

  if (power) {
    power.value = state.power;
  }

  if (angleValue) {
    angleValue.textContent =
      `${state.angle}°`;
  }

  if (powerValue) {
    powerValue.textContent =
      `${state.power}%`;
  }
}


function setupAimControls() {

  const angle =
    $("angle");

  const power =
    $("power");

  if (angle) {

    angle.oninput = () => {

      state.angle =
        Number(angle.value);

      if ($("angleValue")) {
        $("angleValue").textContent =
          `${state.angle}°`;
      }
    };
  }

  if (power) {

    power.oninput = () => {

      state.power =
        Number(power.value);

      if ($("powerValue")) {
        $("powerValue").textContent =
          `${state.power}%`;
      }
    };
  }
}


/* =========================================================
   FIRE VALIDATION
========================================================= */

function canFire() {

  if (state.phase !== "PLANNING") {
    showToast("Wait for the current phase");
    return false;
  }

  if (state.turnSpent) {
    showToast("Turn already used");
    return false;
  }

  if (!state.selectedUnit) {
    showToast("Select your unit first");
    return false;
  }

  if (
    state.selectedUnit.side !==
    state.playerSide
  ) {
    showToast("Select one of your units");
    return false;
  }

  if (!state.selectedSystem) {
    showToast("Select a system");
    return false;
  }

  if (
    usesLeft(state.selectedSystem) <= 0
  ) {
    showToast("No ammunition remaining");
    return false;
  }

  if (!state.target) {
    showToast("Select an enemy target");
    return false;
  }

  if (state.target.hp <= 0) {
    showToast("Target destroyed");
    return false;
  }

  if (
    state.target.side ===
    state.playerSide
  ) {
    showToast("Invalid target");
    return false;
  }

  return true;
}


/* =========================================================
   FIRE
========================================================= */

function fire() {

  if (!canFire()) return;

  const system =
    SYSTEMS[state.selectedSystem];

  const attacker =
    state.selectedUnit;

  const target =
    state.target;

  state.phase = "FIRING";

  state.turnSpent = true;

  state.uses[state.selectedSystem]--;

  renderGame();

  animateProjectile(
    attacker,
    target,
    system
  );
}


/* =========================================================
   PROJECTILE ANIMATION
========================================================= */

function animateProjectile(
  attacker,
  target,
  system
) {

  const battlefield =
    $("battlefield");

  const projectileLayer =
    $("projectiles");

  if (
    !battlefield ||
    !projectileLayer
  ) {
    resolveAttack(
      attacker,
      target,
      system
    );

    return;
  }

  const projectile =
    document.createElement("div");

  projectile.className =
    "projectile";

  projectile.style.left =
    `${attacker.x}%`;

  projectile.style.top =
    `${attacker.y}%`;

  projectileLayer.appendChild(projectile);

  const startX =
    battlefield.clientWidth *
    attacker.x / 100;

  const startY =
    battlefield.clientHeight *
    attacker.y / 100;

  const endX =
    battlefield.clientWidth *
    target.x / 100;

  const endY =
    battlefield.clientHeight *
    target.y / 100;

  const duration =
    550 + Math.max(
      0,
      100 - state.power
    ) * 4;

  const start =
    performance.now();

  function animate(time) {

    const progress =
      Math.min(
        1,
        (time - start) / duration
      );

    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(
            -2 * progress + 2,
            2
          ) / 2;

    const x =
      startX +
      (endX - startX) * eased;

    const y =
      startY +
      (endY - startY) * eased;

    projectile.style.left =
      `${x}px`;

    projectile.style.top =
      `${y}px`;

    if (progress < 1) {

      requestAnimationFrame(
        animate
      );

    } else {

      projectile.remove();

      resolveAttack(
        attacker,
        target,
        system
      );
    }
  }

  requestAnimationFrame(animate);
}


/* =========================================================
   RESOLVE ATTACK
========================================================= */

function resolveAttack(
  attacker,
  target,
  system
) {

  let hitChance =
    system.accuracy;

  /* Power affects accuracy slightly */
  const powerPenalty =
    Math.abs(state.power - 70) * 0.12;

  hitChance -= powerPenalty;

  /* Jammer effect */
  if (
    state.jammed[target.side] &&
    target.side !== state.playerSide
  ) {
    hitChance += 10;
  }

  const roll =
    Math.random() * 100;

  const hit =
    roll <= hitChance;

  let damage = 0;

  if (hit) {

    damage =
      calculateDamage(
        attacker,
        target,
        system
      );

    applyDamage(
      target,
      damage
    );

    createImpact(
      target,
      damage
    );

  } else {

    createMissImpact(target);

    showToast(
      `${system.name} missed`
    );
  }

  handleSpecialSystem(
    system,
    attacker,
    target,
    hit
  );

  renderGame();

  checkVictory();

  if (
    state.phase !== "VICTORY"
  ) {

    setTimeout(
      finishPlayerTurn,
      750
    );
  }
}


/* =========================================================
   DAMAGE
========================================================= */

function calculateDamage(
  attacker,
  target,
  system
) {

  let damage =
    system.damage;

  const powerMultiplier =
    0.65 +
    (state.power / 100) * 0.55;

  damage *=
    powerMultiplier;

  /* Defensive units absorb some damage */
  if (target.type === "defense") {
    damage *= 0.82;
  }

  /* Shield */
  if (state.shielded[target.side]) {
    damage *= 0.55;
  }

  /* Slight randomness */
  const variation =
    0.88 +
    Math.random() * 0.24;

  damage *= variation;

  return Math.max(
    1,
    Math.round(damage)
  );
}


function applyDamage(
  target,
  damage
) {

  target.hp =
    Math.max(
      0,
      target.hp - damage
    );

  /* Component damage */
  if (damage >= 35) {

    target.defense =
      Math.max(
        0,
        target.defense - 5
      );

  }

  if (
    damage >= 50 &&
    target.type !== "defense"
  ) {

    target.engine =
      Math.max(
        0,
        target.engine - 8
      );
  }

  if (
    target.hp <= 0
  ) {

    target.hp = 0;

    showToast(
      `${target.name} DESTROYED`
    );
  }
}


/* =========================================================
   SPECIAL SYSTEMS
========================================================= */

function handleSpecialSystem(
  system,
  attacker,
  target,
  hit
) {

  const id =
    state.selectedSystem;

  if (!hit && id !== "recon") {
    return;
  }

  /* RECON */
  if (id === "recon") {

    state.target.radar =
      Math.min(
        100,
        state.target.radar + 5
      );

    showToast(
      "Recon complete — target identified"
    );

    return;
  }

  /* SHIELD */
  if (id === "shield") {

    state.shielded[
      attacker.side
    ] = true;

    showToast(
      "Emergency Shield activated"
    );

    return;
  }

  /* REPAIR */
  if (id === "repair") {

    attacker.hp =
      Math.min(
        attacker.maxHp,
        attacker.hp + 20
      );

    showToast(
      `${attacker.name} repaired +20 HP`
    );

    return;
  }

  /* JAMMER */
  if (id === "jammer") {

    state.jammed[
      target.side
    ] = true;

    showToast(
      "Enemy accuracy temporarily reduced"
    );

    return;
  }

  /* SHOCKWAVE */
  if (id === "shockwave") {

    state.units.forEach(unit => {

      if (
        unit.side === attacker.side ||
        unit.hp <= 0
      ) {
        return;
      }

      const distance =
        Math.hypot(
          unit.x - target.x,
          unit.y - target.y
        );

      if (distance < 12) {

        const splash =
          Math.round(
            system.damage * 0.28
          );

        applyDamage(
          unit,
          splash
        );

        createImpact(
          unit,
          splash
        );
      }
    });
  }
}


/* =========================================================
   IMPACT EFFECT
========================================================= */

function createImpact(
  unit,
  damage
) {

  const effects =
    $("effects");

  if (!effects) return;

  const explosion =
    document.createElement("div");

  explosion.className =
    "explosion";

  explosion.style.left =
    `${unit.x}%`;

  explosion.style.top =
    `${unit.y}%`;

  effects.appendChild(
    explosion
  );

  setTimeout(() => {
    explosion.remove();
  }, 600);

  const text =
    document.createElement("div");

  text.className =
    "damage-text";

  text.textContent =
    `-${damage}`;

  text.style.left =
    `${unit.x}%`;

  text.style.top =
    `${unit.y}%`;

  effects.appendChild(
    text
  );

  setTimeout(() => {
    text.remove();
  }, 1000);
}


function createMissImpact(unit) {

  const effects =
    $("effects");

  if (!effects) return;

  const text =
    document.createElement("div");

  text.className =
    "damage-text";

  text.textContent =
    "MISS";

  text.style.left =
    `${unit.x}%`;

  text.style.top =
    `${unit.y}%`;

  effects.appendChild(
    text
  );

  setTimeout(() => {
    text.remove();
  }, 900);
}


/* =========================================================
   FINISH PLAYER TURN
========================================================= */

function finishPlayerTurn() {

  if (
    state.phase === "VICTORY"
  ) {
    return;
  }

  checkVictory();

  if (
    state.phase === "VICTORY"
  ) {
    return;
  }

  state.phase =
    "ENEMY";

  renderGame();

  setTimeout(
    enemyTurn,
    900
  );
}


/* =========================================================
   ENEMY AI
========================================================= */

function enemyTurn() {

  const enemySide =
    state.playerSide === "northern"
      ? "southern"
      : "northern";

  const enemyUnits =
    state.units.filter(unit =>
      unit.side === enemySide &&
      unit.hp > 0
    );

  const playerUnits =
    state.units.filter(unit =>
      unit.side === state.playerSide &&
      unit.hp > 0
    );

  if (
    enemyUnits.length === 0 ||
    playerUnits.length === 0
  ) {
    checkVictory();

    return;
  }

  const attacker =
    enemyUnits[
      Math.floor(
        Math.random() *
        enemyUnits.length
      )
    ];

  const target =
    [...playerUnits].sort(
      (a, b) => a.hp - b.hp
    )[0];

  const enemySystem =
    chooseEnemySystem(
      enemySide
    );

  if (!enemySystem) {

    endTurn();

    return;
  }

  state.selectedUnit =
    attacker;

  state.target =
    target;

  state.selectedSystem =
    enemySystem;

  state.uses[enemySystem]--;

  renderGame();

  setTimeout(() => {

    animateProjectile(
      attacker,
      target,
      SYSTEMS[enemySystem]
    );

  }, 300);
}


/* =========================================================
   ENEMY SYSTEM SELECTION
========================================================= */

function chooseEnemySystem(
  enemySide
) {

  const available =
    enemySide === "northern"
      ? FACTION_LOADOUTS.north
      : FACTION_LOADOUTS.south;

  const usable =
    available.filter(
      systemId =>
        SYSTEMS[systemId].damage > 0 &&
        usesLeft(systemId) > 0
    );

  if (!usable.length) {
    return null;
  }

  /* Prefer powerful weapons sometimes */
  usable.sort(
    (a, b) =>
      SYSTEMS[b].damage -
      SYSTEMS[a].damage
  );

  return usable[
    Math.floor(
      Math.random() *
      Math.min(
        usable.length,
        3
      )
    )
  ];
}


/* =========================================================
   END TURN
========================================================= */

function endTurn() {

  if (
    state.phase === "VICTORY"
  ) {
    return;
  }

  state.turn++;

  state.turnSpent = false;

  state.phase =
    "PLANNING";

  state.selectedUnit = null;
  state.selectedSystem = null;
  state.target = null;

  /* Temporary effects expire */
  state.shielded = {};
  state.jammed = {};

  if (
    state.turn > state.maxTurns
  ) {

    determineWinner();

    return;
  }

  renderGame();

  showToast(
    `TURN ${state.turn} — YOUR PHASE`
  );
}


/* =========================================================
   VICTORY
========================================================= */

function checkVictory() {

  const northernAlive =
    state.units.some(
      unit =>
        unit.side === "northern" &&
        unit.hp > 0
    );

  const southernAlive =
    state.units.some(
      unit =>
        unit.side === "southern" &&
        unit.hp > 0
    );

  if (
    !northernAlive ||
    !southernAlive
  ) {

    if (
      northernAlive &&
      !southernAlive
    ) {

      state.northScore += 1;

      showVictory(
        "NORTHERN FORCES WIN",
        "All Southern battlefield units have been neutralized."
      );

    } else if (
      southernAlive &&
      !northernAlive
    ) {

      state.southScore += 1;

      showVictory(
        "SOUTHERN FORCES WIN",
        "All Northern battlefield units have been neutralized."
      );

    } else {

      showVictory(
        "DRAW",
        "Both forces were neutralized."
      );
    }

    return true;
  }

  return false;
}


function determineWinner() {

  const northHP =
    state.units
      .filter(
        unit =>
          unit.side === "northern"
      )
      .reduce(
        (sum, unit) =>
          sum + unit.hp,
        0
      );

  const southHP =
    state.units
      .filter(
        unit =>
          unit.side === "southern"
      )
      .reduce(
        (sum, unit) =>
          sum + unit.hp,
        0
      );

  if (northHP > southHP) {

    showVictory(
      "NORTHERN FORCES WIN",
      "Time limit reached. Northern Forces have the higher remaining combat strength."
    );

  } else if (
    southHP > northHP
  ) {

    showVictory(
      "SOUTHERN FORCES WIN",
      "Time limit reached. Southern Forces have the higher remaining combat strength."
    );

  } else {

    showVictory(
      "DRAW",
      "Time limit reached with equal remaining combat strength."
    );
  }
}


function showVictory(
  title,
  message
) {

  state.phase =
    "VICTORY";

  renderGame();

  openModal(`
    <h2>${title}</h2>

    <p>${message}</p>

    <hr style="border-color:#263a42">

    <p>
      <strong>NORTHERN SCORE:</strong>
      ${state.northScore}
    </p>

    <p>
      <strong>SOUTHERN SCORE:</strong>
      ${state.southScore}
    </p>

    <button
      onclick="location.reload()"
      class="primary-button"
      style="width:100%;margin-top:15px;"
    >
      RETURN TO MAIN MENU
    </button>
  `);
}


/* =========================================================
   HUD
========================================================= */

function renderHUD() {

  if ($("northScore")) {
    $("northScore").textContent =
      state.northScore;
  }

  if ($("southScore")) {
    $("southScore").textContent =
      state.southScore;
  }

  if ($("turnNumber")) {
    $("turnNumber").textContent =
      state.turn;
  }

  if ($("phaseText")) {
    $("phaseText").textContent =
      state.phase;
  }
}


/* =========================================================
   MODAL
========================================================= */

function openModal(content) {

  const modal =
    $("modal");

  const body =
    $("modalBody");

  if (!modal || !body) return;

  body.innerHTML =
    content;

  modal.classList.remove("hidden");
}


function closeModal() {

  const modal =
    $("modal");

  if (!modal) return;

  modal.classList.add("hidden");
}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

  setupMenu();

  setupModes();

  setupFactions();

  setupAimControls();

  if ($("fireButton")) {
    $("fireButton").onclick =
      fire;
  }

  if ($("endTurnButton")) {
    $("endTurnButton").onclick =
      () => {

        if (
          state.phase !== "PLANNING"
        ) {
          showToast(
            "You cannot end the turn now"
          );

          return;
        }

        state.turnSpent = true;

        setTimeout(
          finishPlayerTurn,
          200
        );
      };
  }

  if ($("modalClose")) {
    $("modalClose").onclick =
      closeModal;
  }

  if ($("modal")) {

    $("modal").addEventListener(
      "click",
      event => {

        if (
          event.target ===
          $("modal")
        ) {
          closeModal();
        }
      }
    );
  }

  /* Clicking empty battlefield clears target */
  if ($("battlefield")) {

    $("battlefield").addEventListener(
      "click",
      event => {

        if (
          event.target.closest(".unit")
        ) {
          return;
        }

        state.target = null;

        updateReticle();

        renderTargetPanel();
      }
    );
  }
}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);
