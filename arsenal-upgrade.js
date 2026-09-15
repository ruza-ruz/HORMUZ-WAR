/* =========================================================
   HORMUZ WAR — ARSENAL EXPANSION
   Expands the tactical arsenal without replacing core game.js.
   Players must select exactly 10 systems before deployment.
========================================================= */

const EXTRA_COMMON_SYSTEMS = {
  decoyDrone: {
    name: "Decoy Drone",
    icon: "◇",
    faction: "COMMON",
    uses: 3,
    damage: 0,
    accuracy: 100,
    range: 90,
    role: "Tactical",
    counter: "Interceptor",
    desc: "Creates a false target signature and complicates enemy targeting."
  },
  clusterMissile: {
    name: "Cluster Missile",
    icon: "✣",
    faction: "COMMON",
    uses: 2,
    damage: 58,
    accuracy: 68,
    range: 70,
    role: "Area Attack",
    counter: "Maneuver",
    desc: "Splits into multiple submunitions for wider battlefield damage."
  },
  seaMine: {
    name: "Sea Mine",
    icon: "●",
    faction: "COMMON",
    uses: 3,
    damage: 42,
    accuracy: 80,
    range: 45,
    role: "Area Defense",
    counter: "Recon",
    desc: "Deploys a hidden maritime hazard that punishes predictable movement."
  },
  smokeScreen: {
    name: "Smoke Screen",
    icon: "☁",
    faction: "COMMON",
    uses: 2,
    damage: 0,
    accuracy: 100,
    range: 55,
    role: "Defense",
    counter: "Recon",
    desc: "Reduces the effectiveness of enemy targeting for a short period."
  },
  sonarSweep: {
    name: "Sonar Sweep",
    icon: "⌁",
    faction: "COMMON",
    uses: 3,
    damage: 0,
    accuracy: 100,
    range: 100,
    role: "Recon",
    counter: "—",
    desc: "Scans the maritime battlespace and improves target identification."
  },
  empPulse: {
    name: "EMP Pulse",
    icon: "⚡",
    faction: "COMMON",
    uses: 2,
    damage: 25,
    accuracy: 72,
    range: 60,
    role: "Disruption",
    counter: "Shield",
    desc: "Disrupts battlefield electronics while dealing limited direct damage."
  }
};

const EXTRA_NORTH_SYSTEMS = {
  saturationMissile: {
    name: "Saturation Missile",
    icon: "≫",
    faction: "NORTHERN",
    uses: 2,
    damage: 62,
    accuracy: 62,
    range: 72,
    role: "Heavy Attack",
    counter: "Interceptor",
    desc: "Designed to overwhelm defensive timing with a high-pressure strike."
  },
  stealthDrone: {
    name: "Stealth Drone",
    icon: "◈",
    faction: "NORTHERN",
    uses: 3,
    damage: 28,
    accuracy: 86,
    range: 92,
    role: "Recon / Attack",
    counter: "Rapid Defense",
    desc: "Low-signature drone for reconnaissance and precision harassment."
  },
  barrageRocket: {
    name: "Barrage Rocket",
    icon: "▸",
    faction: "NORTHERN",
    uses: 3,
    damage: 48,
    accuracy: 72,
    range: 58,
    role: "Area Attack",
    counter: "Distance",
    desc: "Rapid-fire battlefield strike with moderate damage and range."
  },
  counterJammer: {
    name: "Counter-Jammer",
    icon: "≋",
    faction: "NORTHERN",
    uses: 2,
    damage: 0,
    accuracy: 100,
    range: 65,
    role: "Electronic Warfare",
    counter: "Recon",
    desc: "Disrupts enemy tactical systems and weakens their targeting advantage."
  },
  ramBoat: {
    name: "Assault Boat",
    icon: "▰",
    faction: "NORTHERN",
    uses: 2,
    damage: 52,
    accuracy: 88,
    range: 42,
    role: "Close Attack",
    counter: "Long Range",
    desc: "Fast close-range attack platform with strong short-range pressure."
  }
};

const EXTRA_SOUTH_SYSTEMS = {
  guidedStrike: {
    name: "Guided Strike",
    icon: "✧",
    faction: "SOUTHERN",
    uses: 3,
    damage: 52,
    accuracy: 91,
    range: 82,
    role: "Precision Attack",
    counter: "Jammer",
    desc: "Guided attack optimized for accurate component damage."
  },
  coastalMissile: {
    name: "Coastal Missile",
    icon: "➳",
    faction: "SOUTHERN",
    uses: 3,
    damage: 60,
    accuracy: 82,
    range: 88,
    role: "Long Range Attack",
    counter: "Maneuver",
    desc: "Long-range strike system designed for controlled battlefield pressure."
  },
  pointDefense: {
    name: "Point Defense",
    icon: "◎",
    faction: "SOUTHERN",
    uses: 5,
    damage: 0,
    accuracy: 88,
    range: 85,
    role: "Defense",
    counter: "Saturation",
    desc: "Rapid defensive response against incoming attack systems."
  },
  sensorDrone: {
    name: "Sensor Drone",
    icon: "◌",
    faction: "SOUTHERN",
    uses: 3,
    damage: 0,
    accuracy: 100,
    range: 100,
    role: "Recon",
    counter: "Jammer",
    desc: "Extends battlefield awareness and improves target selection."
  },
  counterBattery: {
    name: "Counter Battery",
    icon: "⌂",
    faction: "SOUTHERN",
    uses: 2,
    damage: 68,
    accuracy: 78,
    range: 100,
    role: "Counter Attack",
    counter: "Maneuver",
    desc: "Long-range retaliatory strike against exposed enemy platforms."
  }
};

Object.assign(SYSTEMS, EXTRA_COMMON_SYSTEMS, EXTRA_NORTH_SYSTEMS, EXTRA_SOUTH_SYSTEMS);

FACTION_LOADOUTS.north.push(
  "decoyDrone",
  "clusterMissile",
  "seaMine",
  "smokeScreen",
  "sonarSweep",
  "empPulse",
  "saturationMissile",
  "stealthDrone",
  "barrageRocket",
  "counterJammer",
  "ramBoat"
);

FACTION_LOADOUTS.south.push(
  "decoyDrone",
  "clusterMissile",
  "seaMine",
  "smokeScreen",
  "sonarSweep",
  "empPulse",
  "guidedStrike",
  "coastalMissile",
  "pointDefense",
  "sensorDrone",
  "counterBattery"
);

const REQUIRED_LOADOUT_SIZE = 10;

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
  const systems = FACTION_LOADOUTS[state.faction] || [];

  systems.forEach(systemId => {
    const system = SYSTEMS[systemId];
    if (!system) return;

    const card = document.createElement("div");
    card.className = "system-card";
    card.dataset.system = systemId;
    card.innerHTML = `
      <div class="sys-icon">${system.icon}</div>
      <div>
        <div class="sys-name">${system.name}</div>
        <div class="sys-meta">${system.role} · DMG ${system.damage} · ACC ${system.accuracy}% · RNG ${system.range}</div>
      </div>
      <div class="sys-uses">×${system.uses}</div>
    `;

    card.onclick = () => {
      if (state.loadout.includes(systemId)) {
        state.loadout = state.loadout.filter(id => id !== systemId);
      } else {
        if (state.loadout.length >= REQUIRED_LOADOUT_SIZE) {
          showToast("Maximum 10 systems");
          return;
        }
        state.loadout.push(systemId);
      }

      renderArsenal();
      renderLoadoutSlots();
      showSystemInfo(systemId);
    };

    if (state.loadout.includes(systemId)) card.classList.add("selected");
    container.appendChild(card);
  });
}

function renderLoadoutSlots() {
  const container = $("loadoutSlots");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < REQUIRED_LOADOUT_SIZE; i++) {
    const slot = document.createElement("div");
    slot.className = "loadout-slot";

    if (state.loadout[i]) {
      const system = SYSTEMS[state.loadout[i]];
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
      slot.textContent = `SYSTEM ${i + 1}`;
    }

    container.appendChild(slot);
  }

  if ($("slotCount")) {
    $("slotCount").textContent = `${state.loadout.length}/${REQUIRED_LOADOUT_SIZE}`;
  }

  if ($("readyBtn")) {
    $("readyBtn").disabled = state.loadout.length !== REQUIRED_LOADOUT_SIZE;
  }
}

/* Keep the original battlefield start logic intact. */
