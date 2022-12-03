// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL
// Original script: https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Spells/Level%201/Goodberry.js
// Icon if you have Plutonim addon: modules/plutonium/media/icon/spell/phb-goodberry.webp 
// otherwise use this: icons/consumables/fruit/berry-leaf-pink.webp
// Macro version 1.2 // 20221114 For FoundryVTT V10


let itemdata = [{
    "name": "Goodberry",
    "type": "consumable",
    "img": "modules/plutonium/media/icon/spell/phb-goodberry.webp",
    "data": {
        "description": {
            "value": "<p>Eating a berry restores 1 hit point, and the berry provides enough nourishment to sustain a creature for one day.</p>",
            "chat": "",
            "unidentified": ""
        },
        "source": "",
        "quantity": 10,
        "weight": 0.002,
        "price": "0",
        "attunement": 0,
        "equipped": false,
        "rarity": "common",
        "identified": true,
        "activation": {
            "type": "action",
            "cost": 1,
            "condition": ""
        },
        "duration": {
            "value": null,
            "units": ""
        },
        "target": {
            "value": null,
            "width": null,
            "units": "self",
            "type": ""
        },
        "range": {
            "value": null,
            "long": null,
            "units": "touch"
        },
        "uses": {
            "value": 1,
            "max": "1",
            "per": "charges",
            "autoDestroy": true
        },
        "consume": {
            "type": "",
            "target": "",
            "amount": 1
        },
        "ability": "",
        "actionType": "util",
        "attackBonus": 0,
        "chatFlavor": "",
        "critical": {
            "threshold": null,
            "damage": ""
        },
        "damage": {
            "parts": [],
            "versatile": ""
        },
        "formula": "",
        "save": {
            "ability": "",
            "dc": null,
            "scaling": "spell"
        },
        "consumableType": "food"
    },
    "effects": [],
    "flags": {
        "midi-qol": {
            "onUseMacroName": "[preActiveEffects]ItemMacro",
            "effectActivation": false
        },
        "itemacro": {
            "macro": {
                "data": {
                    "_id": null,
                    "name": "Goodberry",
                    "type": "script",
                    "author": game.userId,
                    "img": "icons/svg/dice-target.svg",
                    "scope": "global",
                    "command": "if (actor.system.attributes.hp.value < actor.system.attributes.hp.max) {\n    let newHP = actor.system.attributes.hp.value + 1;\n    await actor.update({\n        \"data.attributes.hp.value\": newHP\n    });\n    ChatMessage.create({\n        content: `<br>Eat a ${item.name} and gained 1 HP.`,\n        speaker: {\n            alias: token.actor.name\n        },\n        type: CONST.CHAT_MESSAGE_TYPES.OOC\n    });\n\n} else {\n    ChatMessage.create({\n        content: `<br>Eat a ${item.name}.`,\n        speaker: {\n            alias: token.actor.name\n        },\n        type: CONST.CHAT_MESSAGE_TYPES.OOC\n    });\n}",
                    "folder": null,
                    "sort": 0,
                    "permission": {
                        "default": 0
                    },
                }
            }
        },
    }
}];

await actor.createEmbeddedDocuments("Item", itemdata);


await ChatMessage.create({
    content: `<br>A batch of ${item.name} has been placed in your inventory.`,
    speaker: {
        alias: actor.name
    },
    type: CONST.CHAT_MESSAGE_TYPES.OOC
});


game.Gametime.doIn({
    hours: 24,
}, async (zactoruuid, iname) => {

    const actorToken = await fromUuid(zactoruuid);
    const yactor = actorToken?.actor ? actorToken?.actor : actorToken;

    if (yactor.items.find(i => i.name === iname && i.type === "consumable")) {
        yactor.items.find(i => i.name === iname && i.type === "consumable").delete()

        await ChatMessage.create({
            content: `<br>The batch of ${iname} expired.`,
            speaker: {
                alias: yactor.name
            },
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });
    }
}, actor.uuid, item.name);