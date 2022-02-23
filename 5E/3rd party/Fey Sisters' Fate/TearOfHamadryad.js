async function promptbonus() {

    return await new Promise((resolve) => {
        let dialogEditor = new Dialog({
            title: `Choose bonus to`,
            content: '',
            buttons: {
                hit: {
                    label: `Saving Throw!`,
                    callback: () => {
                        resolve(true);
                    }
                },
                miss: {
                    label: `Avability Check!`,
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

let z = await promptbonus();

if (z) {
    var text = "Saving Throw";
    var effectKey = "flags.midi-qol.optional.Name.save";
} else {
    var text = "Avability Check";
    var effectKey = "flags.midi-qol.optional.Name.check";
}

const roll = await new Roll(`1d4`).evaluate({
    async: false
});
roll.toMessage({
    flavor: text + "bonus",
});

let rollBonus = roll._total;

let Effect = {
    label: item.name,
    origin: item.uuid,
    icon: item.data.img,
    changes: [{
            key: effectKey,
            mode: 2,
            value: rollBonus,
            priority: 20
        },

    ],
    "duration": {
        "rounds": 1,
        "seconds": 6,
        "startTime": game.time.worldTime
    },

};
await actor.createEmbeddedDocuments("ActiveEffect", [Effect]);