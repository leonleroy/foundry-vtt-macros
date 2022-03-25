function financial(x) {
    return Number.parseFloat(x * 100).toFixed(2);
}

async function WannaReRoll() {

    return await new Promise((resolve) => {
        let dialogEditor = new Dialog({
            content: `<style>p{text-align: center;}</style><p>Chance of same roll: <b>${same}%</b> worse: <b>${less}%</b> better: <b>${more}%</b></p>`,
            title: `${token.name}: The lowest d${dieFace} you rolled is ${Rolled}. Do you want to reroll it?`,
            buttons: {
                Yes: {
                    label: "Yes!",
                    icon: '<i class="far fa-thumbs-up"></i><br>',
                    callback: () => {
                        resolve(1);
                    },
                },
                No: {
                    label: "No!",
                    icon: '<i class="far fa-thumbs-down"></i><br>',

                    callback: () => {
                        resolve(2);
                    },
                }
            }
        });
        dialogEditor.render(true);
    });
}

if (args[0].hitTargets.length < 1) return {};
const roll = args[0].damageRoll;
const dieFace = roll.terms[0].faces;
const Rolled = Math.min(...roll.terms[0].values)
var rollformula = roll._formula;
const isCrit = args[0].isCritical;
let chosen;
let autoReRollWorld = 'reroll';
let usePiercer = getProperty(actor.data, "flags.dae.autoPiercer");
const same = financial(1 / dieFace);
const less = financial((Rolled - 1) / dieFace);
const more = financial((dieFace - Rolled) / dieFace);


if (args[0].tag === "DamageBonus" && args[0].item.data.damage.parts[0][1] === "piercing") {


    if (dieFace == Rolled && usePiercer) {
        chosen = 'No';
    } else if (Rolled == 1 && usePiercer) {
        chosen = 'Yes';
        autoReRollWorld = ' autoreroll';
    } else {
        let ReRoll = await WannaReRoll();
        switch (ReRoll) {
            case 1:
                chosen = 'Yes';
                break;
            default:
                chosen = 'No';
                break;
        }
    }


    if (game.combat) {
        let combatTime = game.combat.round;
        let lastTime = actor.getFlag('world', 'PiercerTimeSlayerTime');
        if (combatTime === lastTime) return {};
        if (combatTime !== lastTime && chosen == 'Yes') {
            await actor.setFlag('world', 'PiercerTimeSlayerTime', combatTime);
        }
    }

    if (isCrit && chosen === 'Yes') {
        return {
            damageRoll: `1d${dieFace}+(1d${dieFace}-${Rolled})`,
            flavor: `Critical Piercer Feat extra damage and ${autoReRollWorld} (Oldroll: ${Rolled})`
        }
    }

    if (isCrit && (chosen === 'No')) return {
        damageRoll: `1d${dieFace}`,
        flavor: `Critical Piercer Feat extra damage`
    }

    if (!isCrit && chosen === 'Yes') {
        return {
            damageRoll: `(1d${dieFace}-${Rolled})`,
            flavor: `Piercer feat ${autoReRollWorld} (Oldroll: ${Rolled})`
        }
    }
}