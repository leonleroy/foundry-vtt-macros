// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL
// Original script: https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Spells/Level%201/Sleep.js

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const sleepHp = await args[0].damageTotal;
const condition = "Unconscious";
console.log(`Sleep Spell => Avaiable HP Pool [${sleepHp}] points`);
let targets = await args[0].targets.filter(i => i.actor.data.data.attributes.hp.value != 0 && !i.actor.effects.find(x => x.data.label === condition)).sort((a, b) => canvas.tokens.get(a.id).actor.data.data.attributes.hp.value < canvas.tokens.get(b.id).actor.data.data.attributes.hp.value ? -1 : 1);
let remainingSleepHp = sleepHp;
let slept_target = [];

for (let target of targets) {
    let find_target = await canvas.tokens.get(target.id);
    let immune_type = find_target.actor.data.type === "character" ? ["undead", "construct"].some(race => (find_target.actor.data.data.details.race || "").toLowerCase().includes(race)) : ["undead", "construct"].some(value => (find_target.actor.data.data.details.type.value || "").toLowerCase().includes(value));
    let immune_ci = find_target.actor.data.data.traits.ci.custom.includes("Sleep");
    let sleeping = find_target.actor.effects.find(i => i.data.label === condition);
    let isFey = find_target.actor.items.find(item => item.data.name.toLowerCase() == "fey ancestry");

    let immunity = find_target.actor.data.data.traits.ci.value;
    let immune_to_charm = 0;	
    for (let j = 0; j < immunity.length; j++){
    if ( immunity[j] === "charmed" ) immune_to_charm = 1;
}
	

    let targetHpValue = find_target.actor.data.data.attributes.hp.value;
    if ((immune_type) || (immune_ci) || (sleeping) || (isFey) || (immune_to_charm)){
        console.log(`Sleep Results => Target: ${find_target.name} | HP: ${targetHpValue} | Status: Resists`);
        slept_target.push(`<div class="midi-qol-flex-container"><div>resists</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        continue;
    }
    if (remainingSleepHp >= targetHpValue) {
        remainingSleepHp -= targetHpValue;
        console.log(`Sleep Results => Target: ${find_target.name} |  HP: ${targetHpValue} | HP Pool: ${remainingSleepHp} | Status: Slept`);
        slept_target.push(`<div class="midi-qol-flex-container"><div>slept</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        let gameRound = game.combat ? game.combat.round : 0;
        let unconsciousData = {
            label: "Unconscious",
            icon: "icons/svg/sleep.svg",
            origin: args[0].uuid,
            disabled: false,
            duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
            flags: { dae: { specialDuration: ["isDamaged"] } },
            changes: [
                { key: `flags.midi-qol.grants.critical.mwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.all`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.fail.ability.save.str`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.fail.ability.save.dex`, mode: 2, value: 1, priority: 20 },
                { key: `data.attributes.movement.all`, mode: 0, value: -100, priority: 20 }
            ]
        };
        let proneData = {
            label: "Prone",
            icon: "modules/combat-utility-belt/icons/prone.svg",
            disabled: false,
            duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: 2, value: 1, priority: 20 }
            ]
        };
        let effectData = [unconsciousData];
        let prone = find_target.actor.effects.find(i => i.data.label === "Prone");
        if (!prone) effectData.push(proneData);
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: find_target.actor.uuid, effects: effectData });
        continue;
    } else {
        console.log(`Sleep Results => Target: ${target.name} | HP: ${targetHpValue} | HP Pool: ${remainingSleepHp - targetHpValue} | Status: Missed`);
        slept_target.push(`<div class="midi-qol-flex-container"><div>misses</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        //break;
    }
}
let slept_list = slept_target.join('');
await wait(500);
let slept_results = `<div><div class="midi-qol-nobox">${slept_list}</div></div>`;
const chatMessage = game.messages.get(args[0].itemCardId);
let content = duplicate(chatMessage.data.content);
const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${slept_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });