// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL, DFreds Convenient Effects
// Macro version 1.02 // 20221118 For FoundryVTT V10
// OnUse: After Active Effects

let NumberOfTargets = await args[0].targets.length;
let spellLevel = await args[0].spellLevel;
let targets = await args[0].failedSaves;
let Maxtargets = (spellLevel <= 2) ? 1 : spellLevel - 1;
var SpellDC = actor.system.attributes.spelldc;

if (NumberOfTargets > Maxtargets) {
    await actor.effects.find(e => e.label === 'Concentrating').delete();
    const spells = actor.system.spells;
    let str = `spell${spellLevel}`;
    const {
        value
    } = spells[str];
    spells[str].value = value + 1;
    const actorToken = await fromUuid(actor.uuid);
    const yactor = actorToken?.actor ? actorToken?.actor : actorToken;
    await yactor.update({
        "spells": spells
    });
    return ui.notifications.warn(`You can target maximum ${Maxtargets} creatures.`);
}

if (args[0].failedSaves.length > 0) {


    for (let target of targets) {
        let find_target = await canvas.tokens.get(target.id);


        if ((find_target.actor.type === "npc") && (find_target.actor.system.details.type.value.toLowerCase() != "humanoid")) {
            console.log("Skipping NOT humanoid NPC: ", find_target.actor.name);
            continue;
        }

        let Effect = {
            label: item.name,
            origin: item.uuid,
            icon: item.img,
            changes: [{
                    key: `flags.midi-qol.OverTime`,
                    mode: 5,
                    value: `turn=end,\nsaveAbility=wis,\nsaveDC=${SpellDC},\nlabel=${item.name}`,
                    priority: 20
                },
                {
                    key: `macro.CE`,
                    mode: 0,
                    value: "Paralyzed",
                    priority: 20
                }
            ],
            "duration": {
                "rounds": 10,
                "seconds": 60,
                "startTime": game.time.worldTime
            },

        };
        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: find_target.actor.uuid,
            effects: [Effect]
        });
    }
}