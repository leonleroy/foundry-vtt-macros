// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL, DFreds Convenient Effects
// Original script: https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Spells/Level%201/Sleep.js
// Macro version 1.01 // 20220401

if (!game.modules.get("dfreds-convenient-effects")?.active) {
    ui.notifications.error("Please enable the DFreds Convenient Effects module");
    return;
}

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
const sleepHp = await args[0].damageTotal;
const condition = "Unconscious";
console.log(`Sleep Spell => Avaiable HP Pool [${sleepHp}] points`);
let targets = await args[0].targets.filter(i => i.actor.data.data.attributes.hp.value != 0 && !i.actor.effects.find(x => x.data.label === condition)).sort((a, b) => canvas.tokens.get(a.id).actor.data.data.attributes.hp.value < canvas.tokens.get(b.id).actor.data.data.attributes.hp.value ? -1 : 1);
let remainingSleepHp = sleepHp;
let slept_target = [];

for (let target of targets) {
    let find_target = await canvas.tokens.get(target.id);
    let find_targetUUID = await canvas.tokens.get(target.id).actor.uuid;
    let immune_type = find_target.actor.data.type === "character" ? ["undead", "construct"].some(race => (find_target.actor.data.data.details.race || "").toLowerCase().includes(race)) : ["undead", "construct"].some(value => (find_target.actor.data.data.details.type.value || "").toLowerCase().includes(value));
    let immune_ci = find_target.actor.data.data.traits.ci.custom.includes("Sleep");
    let sleeping = find_target.actor.effects.find(i => i.data.label === condition);
    let isFey = find_target.actor.items.find(item => item.data.name.toLowerCase() == "fey ancestry");

    let immunity = find_target.actor.data.data.traits.ci.value;
    let immune_to_charm = 0;
    for (let j = 0; j < immunity.length; j++) {
        if (immunity[j] === "charmed") immune_to_charm = 1;
    }

    let targetHpValue = find_target.actor.data.data.attributes.hp.value;
    if ((immune_type) || (immune_ci) || (sleeping) || (isFey) || (immune_to_charm)) {
        console.log(`Sleep Results => Target: ${find_target.name} | HP: ${targetHpValue} | Status: Resists`);
        slept_target.push(`<div class="midi-qol-flex-container"><div>resists</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        continue;
    }
    if (remainingSleepHp >= targetHpValue) {
        remainingSleepHp -= targetHpValue;
        console.log(`Sleep Results => Target: ${find_target.name} |  HP: ${targetHpValue} | HP Pool: ${remainingSleepHp} | Status: Slept`);
        slept_target.push(`<div class="midi-qol-flex-container"><div>slept</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        let gameRound = game.combat ? game.combat.round : 0;

        let effectLabel = "Unconscious";
        await game.dfreds.effectInterface.toggleEffect(effectLabel, {
            uuids: [find_targetUUID]
        });

        let effect = target.actor.effects.find(e => e.data.label === effectLabel);

        await MidiQOL.socket().executeAsGM("updateEffects", {
            actorUuid: target.actor.uuid,
            updates: [{
                _id: effect.id,
                disabled: effect.data.disabled,
                duration: {
                    rounds: 10,
                    seconds: 60
                }
            }]
        });

        effectLabel = "Prone";

        await game.dfreds.effectInterface.toggleEffect(effectLabel, {
            uuids: [find_targetUUID]
        });
        let effect2 = target.actor.effects.find(e => e.data.label === effectLabel);


        await MidiQOL.socket().executeAsGM("updateEffects", {
            actorUuid: target.actor.uuid,
            updates: [{
                _id: effect2.id,
                disabled: effect.data.disabled,
                duration: {
                    rounds: 10,
                    seconds: 60
                }
            }]
        });



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
await chatMessage.update({
    content: content
});