// HORMUZ WAR V1 - data-driven rules
export const FACTIONS={
 north:{id:"north",name:"NORTHERN FORCES",color:"#d94b52",side:"TOP",style:"Fast coastal power, drones, reconnaissance and ambush."},
 south:{id:"south",name:"SOUTHERN FORCES",color:"#4f8fe8",side:"BOTTOM",style:"Naval power, range, aircraft and stronger individual units."}
};
export const UNITS={
 north:[
  {id:"fast_attack_boat",name:"FAST ATTACK BOAT",hp:450,attack:65,range:220,speed:9,cost:180,time:8,supply:4,role:"Fast attack / harassment",strong:"Commercial, support, recon",weak:"Frigate, Destroyer, Aircraft",special:"SPEED BURST"},
  {id:"patrol_ship",name:"PATROL SHIP",hp:900,attack:95,range:320,speed:5,cost:350,time:15,supply:8,role:"General patrol / escort",strong:"Balanced",weak:"Heavy focused fire",special:"—"},
  {id:"coastal_missile",name:"COASTAL MISSILE BATTERY",hp:500,attack:280,range:850,speed:0,cost:450,time:20,supply:12,role:"Long-range coastal attack",strong:"Large ships",weak:"Air / drones",special:"—"},
  {id:"recon_drone",name:"RECON DRONE",hp:180,attack:0,range:260,speed:11,cost:150,time:7,supply:3,role:"Reconnaissance",strong:"Information",weak:"Any attack",special:"RECON"},
  {id:"combat_drone",name:"COMBAT DRONE",hp:260,attack:120,range:480,speed:10,cost:300,time:12,supply:6,role:"Strike drone",strong:"Ships, infrastructure",weak:"Air Defense",special:"—"},
  {id:"legacy_fighter",name:"LEGACY FIGHTER",hp:600,attack:150,range:500,speed:12,cost:550,time:20,supply:10,role:"Lower-cost fighter",strong:"Positioning / numbers",weak:"Modern combat aircraft",special:"—"}
 ],
 south:[
  {id:"frigate",name:"FRIGATE",hp:950,attack:100,range:350,speed:5,cost:400,time:16,supply:9,role:"Naval escort / patrol",strong:"General purpose",weak:"Coastal missile focus",special:"—"},
  {id:"destroyer",name:"DESTROYER",hp:1700,attack:190,range:650,speed:4,cost:850,time:32,supply:18,role:"Heavy long-range naval",strong:"Long-range control",weak:"Combined attacks",special:"—"},
  {id:"missile_ship",name:"MISSILE SHIP",hp:850,attack:300,range:800,speed:5,cost:700,time:25,supply:15,role:"High-damage long-range",strong:"Damage / range",weak:"Lower durability",special:"—"},
  {id:"recon_aircraft",name:"RECON AIRCRAFT",hp:220,attack:0,range:320,speed:14,cost:250,time:10,supply:4,role:"Fast reconnaissance",strong:"Information",weak:"Any attack",special:"RECON"},
  {id:"combat_aircraft",name:"COMBAT AIRCRAFT",hp:650,attack:190,range:650,speed:13,cost:750,time:25,supply:12,role:"High-speed strike",strong:"Fast powerful attacks",weak:"Air Defense / fighters",special:"—"},
  {id:"support_aircraft",name:"SUPPORT AIRCRAFT",hp:400,attack:30,range:300,speed:12,cost:500,time:20,supply:8,role:"Support aircraft",strong:"Repair",weak:"Combat focus",special:"REPAIR"}
 ]};
export const BUILDINGS=[
 {id:"command",name:"COMMAND CENTER",cost:0,hp:3000},
 {id:"power",name:"POWER PLANT",cost:350,hp:900},
 {id:"supply",name:"SUPPLY DEPOT",cost:400,hp:1000},
 {id:"production",name:"UNIT PRODUCTION",cost:500,hp:1100},
 {id:"radar",name:"RADAR STATION",cost:450,hp:800},
 {id:"airdef",name:"AIR DEFENSE",cost:500,hp:850}
];
export const STRATEGIC=[
 {id:"sp1",name:"CENTRAL RADAR POINT",effect:"Slightly increases detection."},
 {id:"sp2",name:"SHIPPING CONTROL POINT",effect:"Nearby commercial traffic is safer/faster."},
 {id:"sp3",name:"FORWARD SUPPORT POINT",effect:"Nearby friendly units receive limited repair/support."}
];
export const ROUTES=[
 {id:"north",name:"NORTHERN EXPORT ROUTE",type:"TANKER"},
 {id:"central",name:"CENTRAL TRADE ROUTE",type:"MIXED"},
 {id:"south",name:"SOUTHERN SUPPLY ROUTE",type:"LOGISTICS"}
];
export const DIFFICULTY={
 easy:{label:"EASY",interval:5,production:.78,recon:.7,focus:.7,retreat:.55,support:.5},
 normal:{label:"NORMAL",interval:3,production:1,recon:1,focus:1,retreat:1,support:1},
 hard:{label:"HARD",interval:2,production:1,recon:1.25,focus:1.2,retreat:1.2,support:1.2}
};
