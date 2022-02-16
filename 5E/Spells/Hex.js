// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL

let movehexname = "Transfer Hex";

if (args[0] === "on") {
    return
}

if (args[0] === "off") {
    let actorToken = await fromUuid(args[args.length - 1].actorUuid);
    const yactor = actorToken?.actor ? actorToken?.actor : actorToken;
    if (yactor.items.find(e => e.data.name === movehexname)) {
        yactor.items.find(e => e.data.name === movehexname).delete()
    };
    return
}


function setupHex(hexAb) {

    let HexedEffect = {
        label: item.name + " cursed",
        origin: item.uuid,
        icon: item.data.img,
        duration: {
            "seconds": durationSeconds,
            startTime: game.time.worldTime
        },
        changes: [{
            key: `flags.midi-qol.disadvantage.ability.check.${hexAb}`,
            mode: 2,
            value: 1,
            priority: 20
        }]
    }

    args[0].targets[0].actor.createEmbeddedDocuments("ActiveEffect", [HexedEffect]);
}


if (args[0].tag === "OnUse") {

    let target = args[0].targets[0].data._id;

    var durationSeconds = (args[0].spellLevel >= 5) ? 86400 : (args[0].spellLevel >= 3) ? 28800 : 3600;

    new Dialog({
        title: "Choose an ability",
        buttons: [{
                label: "STR",
                icon: '<i class="fas fa-hammer"></i><br>',
                callback: () => setupHex("str"),
            },
            {
                label: "DEX",
                icon: '<i class="fas fa-quidditch"></i><br>',
                callback: () => setupHex("dex"),
            },
            {
                label: "CON",
                icon: '<i class="fas fa-heartbeat"></i><br>',
                callback: () => setupHex("con"),
            },
            {
                label: "INT",
                icon: '<i class="fas fa-brain"></i><br>',
                callback: () => setupHex("int"),
            },
            {
                label: "WIS",
                icon: '<i class="fas fa-user-graduate"></i><br>',
                callback: () => setupHex("wis"),
            },
            {
                label: "CHA",
                icon: '<i class="fas fa-theater-masks"></i><br>',
                callback: () => setupHex("cha"),
            },
        ],
    }).render(true);


    const effectData = {
        changes: [{
                key: "flags.midi-qol.hex",
                mode: 5,
                value: target,
                priority: 20
            },
            {
                key: "flags.dnd5e.DamageBonusMacro",
                mode: 5,
                value: `ItemMacro.${item.name}`,
                priority: 20
            },
            {
                key: "macro.itemMacro",
                mode: 0,
                value: `ItemMacro.${item.name}`,
                priority: 20
            },
        ],
        origin: item.uuid,
        disabled: false,


        "duration": {
            "seconds": durationSeconds,
            "startTime": game.time.worldTime
        },
        icon: item.data.img,
        label: item.name
    }

    let itemdata = [{
        "name": movehexname,
        "type": "feat",
        "img": "modules/plutonium/media/icon/spell/phb-hex.webp",
        "data": {
            "description": {
                "value": "<p>If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to curse a new creature.</p>",
                "chat": "",
                "unidentified": ""
            },
            "source": "PHB pg. 251",
            "activation": {
                "type": "bonus",
                "cost": 1,
                "condition": ""
            },
            "duration": {
                "value": null,
                "units": ""
            },
            "target": {
                "value": 1,
                "width": null,
                "units": "any",
                "type": "creature"
            },
            "range": {
                "value": null,
                "long": null,
                "units": ""
            },
            "uses": {
                "value": null,
                "max": "",
                "per": ""
            },
            "consume": {
                "type": "",
                "target": "",
                "amount": null
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
            "requirements": "Enchantment",
            "recharge": {
                "value": null,
                "charged": false
            },
            "attunement": null
        },
        "effects": [],
        "flags": {
            "midi-qol": {
                "effectActivation": false,
                "onUseMacroName": "[postActiveEffects]ItemMacro"
            },
            "itemacro": {
                "macro": {
                    "data": {
                        "_id": null,
                        "name": "Move Hex",
                        "type": "script",
                        "author": "sGDyf0LH8KxxtfaW",
                        "img": "icons/svg/dice-target.svg",
                        "scope": "global",
                        "command": "let target = args[0].targets[0].data._id;\nlet effectLabel = \"Hex\";\nlet hexed = actor.effects.find(e => e.data.label === effectLabel);\nif (!hexed) return ui.notifications.warn(`You don't have an active Hex to curse a new target.`);\nlet remainingsecs = hexed.data.duration.seconds + hexed.data.duration.startTime - game.time.worldTime;\nlet oldhexedtoken = canvas.tokens.get(getProperty(args[0].actor.flags, \"midi-qol.hex\"));\nif (oldhexedtoken.data.actorData.data.attributes.hp.value > 0) return ui.notifications.warn(`You can only curse a new creature after the current one drops to 0 HP.`);\neffectLabel = \"Hex cursed\";\nif (args[0].targets[0].actor.effects.find(e => e.data.label === effectLabel)) return ui.notifications.warn(`Target is already Hex cursed!`);\nlet transfereffect = oldhexedtoken.data.actorData.effects.find(e => e.label === effectLabel);\nawait args[0].targets[0].actor.createEmbeddedDocuments(\"ActiveEffect\", [transfereffect]);\nawait oldhexedtoken.actor.deleteEmbeddedDocuments(\"ActiveEffect\", [transfereffect._id]);\nlet changes = hexed.data.changes;\nchanges[0] = {\n    key: \"flags.midi-qol.hex\",\n    mode: 5,\n    value: target,\n    priority: 20\n}\nawait hexed.update({\n    changes\n});\n\nlet curs = args[0].targets[0].actor.effects.find(e => e.data.label === effectLabel);\n\nlet oldhextokenuuid = oldhexedtoken.actor.uuid;\nlet newhextokenuuid = args[0].targets[0].actor.uuid;\n\nconst concentrationData = actor.getFlag(\"midi-qol\", \"concentration-data\");\n\nfor (let i = 0; i < concentrationData.targets.length; i++) {\n    if (concentrationData.targets[i].tokenUuid === oldhextokenuuid) {\n        concentrationData.targets[i].tokenUuid = newhextokenuuid;\n        actor.setFlag(\"midi-qol\", \"concentration-data\", concentrationData);\n    }\n}\n\n\nawait args[0].targets[0].actor.updateEmbeddedDocuments(\"ActiveEffect\", [{\n    _id: curs.id,\n    duration: {\n        startTime: game.time.worldTime,\n        seconds: remainingsecs\n    }\n}]);",
                        "folder": null,
                        "sort": 0,
                        "permission": {
                            "default": 0
                        },
                        "flags": {}
                    }
                }
            },
        }
    }]

    await actor.createEmbeddedDocuments("Item", itemdata);

    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

    let effectLabel = "Concentrating";

    let effect = actor.effects.find(e => e.data.label === effectLabel);

    await actor.updateEmbeddedDocuments("ActiveEffect", [{
        _id: effect.id,
        duration: {
            seconds: durationSeconds
        }
    }]);
}
if (args[0].tag === "DamageBonus") {
    if (!["mwak", "rwak", "msak", "rsak"].includes(args[0].item.data.actionType)) return {};
    if (args[0].hitTargets.length === 0) return;
    let targetId = args[0].targets[0].data._id;
    if (targetId !== getProperty(args[0].actor.flags, "midi-qol.hex")) return {};
    const diceMult = args[0].isCritical ? 2 : 1;
    let target = await fromUuid(args[0].hitTargetUuids[0] ?? "");
    let numDice = 1;
    if (args[0].isCritical) numDice = numDice * 2;
    let damageRoll = await new Roll(`${numDice}d6`);
    await damageRoll.evaluate({
        async: true
    });
    new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "necrotic", target ? [target] : [], damageRoll, {
        flavor: "Hex - Damage Roll (Necrotic)",
        itemCardId: args[0].itemCardId
    })
}