// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL, Token Magic FX
// Original script: https://github.com/trioderegion/fvtt-macros/blob/legacy/0.7.x/honeybadger-macros/ItemMacro/MirrorImage.js
// I also used ideas from theripper93/Discord macro attached on: 20210414
// Macro version 1.02 // 20220402

function deletecustomflags(tactor) {
    let hookId = tactor.getFlag("world", `mirrorImageHook`);
    Hooks.off("midi-qol.preDamageRoll", hookId);
    tactor.unsetFlag("world", `mirrorImageduperNr`);
    tactor.unsetFlag("world", `mirrorImagedupeAC`);
    tactor.unsetFlag("world", `mirrorImageHook`);
}

async function make_effect(castertoken, imagesNR) {
    let TMEffect = [{
        filterType: "images",
        filterId: "myMirrorImages",
        time: 0,
        nbImage: imagesNR + 1,
        alphaImg: 1.0,
        alphaChr: 0.0,
        blend: 4,
        ampX: 0.10,
        ampY: 0.10,
        zOrder: 20,
        animated: {
            time: {
                active: true,
                speed: 0.0010,
                animType: "move"
            }
        }
    }];
    if (game.modules.get("tokenmagic")?.active) {
        await TokenMagic.deleteFilters(castertoken)
        await TokenMagic.addFilters(castertoken, TMEffect);
    }
}

if (args[0] === "on") {
    return;
}

if (args[0] === "off") {
    let caster = canvas.tokens.get(args[args.length - 1].tokenId).actor;
    deletecustomflags(caster);
    if (game.modules.get("tokenmagic")?.active) TokenMagic.deleteFilters(canvas.tokens.get(args[args.length - 1].tokenId));
    return;
}

let caster = canvas.tokens.get(args[0].tokenId).actor;
let ttokenId = args[0].tokenId;
let existingEffect = caster.effects.find(e => e.data.label === item.name);
if (existingEffect) return ui.notifications.warn(`${caster.name} is already equiped with ${item.name}.`);

let effectData = {
    label: item.name,
    icon: item.data.img,
    "duration": {
        "rounds": 10,
        "seconds": 60,
        "startTime": game.time.worldTime
    },
    origin: item.uuid,
    changes: [{
        key: "macro.itemMacro",
        mode: 0,
        value: `ItemMacro.${item.name} `,
        priority: 20
    }]
};

const newId = await caster.createEmbeddedDocuments("ActiveEffect", [effectData]);
await make_effect(canvas.tokens.get(ttokenId), 3)
await caster.setFlag("world", `mirrorImageduperNr`, 3);
await caster.setFlag("world", `mirrorImagedupeAC`, actor.data.data.abilities.dex.mod + 10);
let hookid = Hooks.on("midi-qol.preDamageRoll", mirrorImageHook);
caster.setFlag("world", `mirrorImageHook`, hookid);

function mirrorImageHook(workflow) {
    let dupeHit;
    let echo;
    let interruptdamage = false;
    let actT = workflow.item.data.data.actionType;
    if (actT != "mwak" && actT != "rwak" && actT != "msak" && actT != "rsak") return;
    let indexNum;
    for (let i = 0; i < workflow.hitTargets.size; i++) {
        if (Array.from(workflow.hitTargets)[i].data._id == ttokenId) indexNum = i;
    }
    if (indexNum == undefined) return;

    let dupecount = caster.getFlag("world", `mirrorImageduperNr`);
    const r = new Roll("1d20");
    r.evaluate({
        async: false
    });
    const d20result = r._total;

    switch (dupecount) {
        case 1:
            // > 10 = shatter
            if (d20result > 10) dupeHit = true;
            break;
        case 2:
            // > 7 = shatter
            if (d20result > 7) dupeHit = true;
            break;
        case 3:
            // >5 shatter
            if (d20result > 5) dupeHit = true;
            break;
        default:
            break;
    }

    if (dupeHit) {
        if (workflow.attackTotal >= caster.getFlag("world", `mirrorImagedupeAC`)) {
            dupecount -= 1;
            caster.setFlag("world", `mirrorImageduperNr`, dupecount);
            interruptdamage = true;
            switch (dupecount) {
                case 0:
                    echo = `[[${d20result}]] All duplicates destroyed!`;
                    if (caster.effects.find(e => e.data.label === item.name)) caster.effects.find(e => e.data.label === item.name).delete();
                    if (game.modules.get("tokenmagic")?.active) TokenMagic.deleteFilters(canvas.tokens.get(ttokenId));
                    break;
                case 1:
                    echo = `[[${d20result}]] One duplicate remains...`;
                    make_effect(canvas.tokens.get(ttokenId), 1)
                    break;
                case 2:
                    echo = `[[${d20result}]] Shattered! Two duplicates remain`;
                    make_effect(canvas.tokens.get(ttokenId), 2)
                    break;
            }
        } else {
            echo = `[[${d20result}]] The attack is redirected to a duplicate and misses!`;
            interruptdamage = true;
        }
    } else {
        if (workflow.attackTotal < caster.data.data.attributes.ac.value) {
            echo = `[[${d20result}]] The attack misses you!`;
            interruptdamage = true;
        } else
            echo = `[[${d20result}]] The attack hits you!`;
    }

    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({
            actor: actor
        }),
        content: echo,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });

    return !interruptdamage;
}