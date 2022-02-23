// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL
// Macro version 1.0  // 20220218

async function prompttrigger() {

    return await new Promise((resolve) => {
        let dialogEditor = new Dialog({
            title: `Apply weapon special ability?`,
            content: '',
            buttons: {
                hit: {
                    label: `Yes!`,
                    callback: () => {
                        resolve(true);
                    }
                },
                miss: {
                    label: `No!`,
                    callback: () => {
                        resolve(false);
                    },
                },
                //default: () => {resolve(false)}
            }
        });

        dialogEditor.render(true);
    });
}



if (args[0].tag === "OnUse") {
    if (actor.items.find(item => item.data.name.toLowerCase() == "fey ancestry")) {
        let LastUsedTime = await item.getFlag("world", "ParmalaeLastUsed");
        let CurrTime = Math.floor(game.time.worldTime / 86400);

        if ((LastUsedTime === undefined) || (CurrTime > LastUsedTime)) {
            let use = await prompttrigger();


            if (use) {
                let Effect = {
                    label: item.name,
                    origin: item.uuid,
                    icon: item.data.img,
                    changes: [{
                            key: "flags.midi-qol.grants.advantage.attack.all",
                            mode: 0,
                            value: 1,
                            priority: 20
                        },
                    ],
                    "duration": {
                        "rounds": 10,
                        "seconds": 60,
                        "startTime": game.time.worldTime
                    },

                };
                await args[0].targets[0].actor.createEmbeddedDocuments("ActiveEffect", [Effect]);
                await item.setFlag("world", "ParmalaeLastUsed", game.time.worldTime / 86400);
            }
        }
    }
}
