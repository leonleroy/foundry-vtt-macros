// Requires the following modules: Monk's TokenBar, Dynamic Active Effects, Item Macros, Times-Up, About-Time, MidiQOL
// Icon: https://game-icons.net/1x1/lorc/drowning.html 
// Macro version 1.02 For Foundry V10 // 20221203

if (!game.modules.get("monks-tokenbar")?.active) {  return ui.notifications.error("Please enable Monk's Tokenbar module")};

const AutoRollTimeOut = 30;
let Counter = 0;
const SaveType = "wis";
const SpellName = "Water’s Embrace";

const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if ((args[0] === "on") || (args[0] === "off")) return;
if (args[0] === "each") {
    var SpellDC = parseInt(args[args.length - 2]);
    let EndTime = args[args.length - 1].efData.duration.startTime + (args[args.length - 1].efData.duration.rounds) * 6;
    let tokenid = 'token' + token.document._id;
    let targets = [await canvas.tokens.get(token.document._id)];
    let RoundsToGo = (EndTime - game.time.worldTime) / 6;

    await RollSave(targets, SpellDC);
    let rollResult = await GetRollResult(tokenid, targets);
    if (rollResult < SpellDC) {
        if ((RoundsToGo == 1)) {
            await args[args.length - 1].actor.update({
                "system.attributes.hp.value": 0
            });
        }
    } else {
        let effect = args[args.length - 1].actor.effects.find(e => e.label === SpellName);
        await effect.delete();

    }

    return;
}

/// On Use
const targets = Array.from(game.user.targets);
var SpellDC = actor.system.attributes.spelldc;
let tokenid = 'token' + targets[0].id;

if (!game.combat) return ui.notifications.warn(`Start a combat to use ${item.name}.`);

let effect = args[0].targets[0].actor.effects.find(e => e.label === "Charmed");
if (!effect) {
    ui.notifications.info("Target is not yet Charmed!");
} else {
    await RollSave(targets, SpellDC);
    let rollResult = await GetRollResult(tokenid, targets);
    //    console.log('Result: ', rollResult);
    if (rollResult <= SpellDC) AddEffect(SpellDC);
}


/// Function declarations

function AddEffect(SpellDCParam) {
    let NumberOfRounds = (args[0].targets[0].actor.system.abilities.con.mod <= 0) ? 1 : args[0].targets[0].actor.system.abilities.con.mod;
    let Effect = {
        label: item.name,
        origin: item.uuid,
        icon: item.img,
        duration: {
            "rounds": NumberOfRounds,
            startTime: game.time.worldTime
        },
        changes: [{
            key: "macro.itemMacro",
            mode: 0,
            value: `ItemMacro.${item.name} ` + SpellDCParam,
            priority: 20
        }],
        "flags": {
            "dae": {
                "macroRepeat": "startEveryTurn",
            }
        },
    };
    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targets[0].actor.uuid, effects: [Effect] });
}

async function GetRollResult(TokenIDParam, TargetParam) {
    do {
        //Filter MonksTokenBar Messages
        let filtermsg = game.messages.contents.filter(i => i.flags["monks-tokenbar"] != undefined);
        let filtermsgrev = filtermsg.reverse();
        //Check the last x second
        let msgr = filtermsgrev.find(i => i.timestamp > Date.now() - ((Counter * 1000) + 1000));
        if (msgr != undefined) var saveRoll = msgr.flags["monks-tokenbar"][TokenIDParam].total;
        await wait(1000);
        Counter++;
    } while ((Counter < AutoRollTimeOut) && (saveRoll === undefined));

    if (saveRoll === undefined) {
        //Then ReRoll
        saveRoll = await game.MonksTokenBar.requestRoll(TargetParam, {
            request: `save:${SaveType}`,
            dc: `${SpellDC}`,
            flavor: `${SpellName} - Auto roll!`,
            silent: true,
            fastForward: true
        });
        return saveRoll.tokenresults[0].roll.total;
    } else
        return saveRoll;
}


function RollSave(TargetParam, SpellDCParam) {
    game.MonksTokenBar.requestRoll(TargetParam, {
        request: `save:${SaveType}`,
        dc: `${SpellDCParam}`,
        flavor: SpellName,
        silent: true
    });
}