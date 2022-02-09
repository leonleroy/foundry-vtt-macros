// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL
// Original script: https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Spells/Level%201/Goodberry.js
// Icons: modules/plutonium/media/icon/spell/phb-goodberry.webp or icons/consumables/fruit/berry-leaf-pink.webp

if ((args[0] === "on") || (args[0] === "each")) return;

if (args[0] === "off") {
    let itemname = args[args.length - 1].efData.label;
    let cactor = game.actors.get(args[args.length - 1].actorId);
    let itemz = cactor.data.items.find(i => i.name === itemname && i.type === "consumable");
    if (itemz) await cactor.deleteEmbeddedDocuments('Item', [itemz.id]);
    return;
}

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
		  "command": "if (actor.data.data.attributes.hp.value < actor.data.data.attributes.hp.max) {\n    let newHP = actor.data.data.attributes.hp.value + 1;\n    await actor.update({\n        \"data.attributes.hp.value\": newHP\n    });\n    ChatMessage.create({\n        content: `<br>Eat a ${item.name} and gained 1 HP.`,\n        speaker: {\n            alias: token.actor.name\n        },\n        type: CONST.CHAT_MESSAGE_TYPES.OOC\n    });\n\n} else {\n    ChatMessage.create({\n        content: `<br>Eat a ${item.name}.`,\n        speaker: {\n            alias: token.actor.name\n        },\n        type: CONST.CHAT_MESSAGE_TYPES.OOC\n    });\n}",
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

let effectData = {
    label: item.name,
    origin: item.uuid,
//    icon: item.data.img,
    duration: {
        "seconds": 3600 * 24,
        startTime: game.time.worldTime
    },
    changes: [{
        key: "macro.itemMacro",
        mode: 0,
        value: `ItemMacro.${item.name} `,
        priority: 20
    }]
};

await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);