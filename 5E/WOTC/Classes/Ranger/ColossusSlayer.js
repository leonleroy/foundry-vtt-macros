// Special thanks to thatlonelybugbear for the original macro
// Requires the following modules: Dynamic Active Effects, Item Macros, Times-Up, About-Time
// Macro version 1.01 // 20221118 For Foundry V10

if (!["mwak","rwak"].includes(args[0].item.system.actionType)) return {};
if (args[0].hitTargets.length < 1) return {};
token = canvas.tokens.get(args[0].tokenId);
actor = token.actor;
if (!actor || !token || args[0].hitTargets.length < 1) return {};

let target = canvas.tokens.get(args[0].hitTargets[0].id);
//checking hp max versus hp current value on the target and if they are not different just stop, otherwise go on to return the extra damage
let hpmax = target.actor.system.attributes.hp.max;
let hpval = target.actor.system.attributes.hp.value;

if (hpmax === hpval) return {};

const diceMult = args[0].isCritical ? 2: 1;

if (game.combat) {
    let combatTime = game.combat.round;   
    let lastTime = actor.getFlag('world', 'ColossusSlayerTime');
    if (combatTime === lastTime)  return {};
    if (combatTime !== lastTime) {
        actor.setFlag('world','ColossusSlayerTime', combatTime);
    }
}

return {damageRoll: `${diceMult}d8`, flavor: "Colossus Slayer damage"};