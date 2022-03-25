// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL
// Macro version 1.01 // 20220323

let NumberOfTargets = await args[0].targets.length;
let spellLevel = await args[0].spellLevel;
let targets = await args[0].failedSaves;
let Maxtargets = (spellLevel <= 2) ? 1 : spellLevel - 1;
var SpellDC = actor.data.data.attributes.spelldc;


if (NumberOfTargets > Maxtargets) return ui.notifications.warn(`You can target maximum ${Maxtargets} creatures.`);

if (args[0].failedSaves.length > 0) {


    for (let target of targets) {
        let find_target = await canvas.tokens.get(target.id);
		
		
		if ((find_target.actor.data.type === "npc") && (find_target.actor.data.data.details.type.value.toLowerCase() != "humanoid")) {
		console.log("Skipping NOT humanoid NPC: ",  find_target.actor.data.name);
		continue;
		}

        let Effect = {
            label: item.name,
            origin: item.uuid,
            icon: item.data.img,
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
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: find_target.actor.uuid, effects: [Effect] });
    }
}