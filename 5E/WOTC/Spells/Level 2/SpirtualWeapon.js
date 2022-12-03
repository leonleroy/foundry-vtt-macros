// Requires the following modules: Item Macros, Times-Up, About-Time
// Macro version 1.03 // 20221202 for Foundry V10

let rnd = randomID();

if (args[0] === "off") {
    let ztoken = await fromUuid(args[args.length - 1].tokenUuid);
    let charID = await ztoken.actor.getFlag("world", "SpiritualWeapon.ActorId");
    ztoken.actor.unsetFlag("world", "SpiritualWeapon");
    let ztokenSPW = canvas.tokens.placeables.find(akarmi => akarmi.document.actorId == charID)
    if (game.combat) {
        let SWP = game.combat.combatants.find(e => e.actorId == charID);
        if (SWP) game.combat.deleteEmbeddedDocuments("Combatant", [SWP._id]);
    }
    ztokenSPW.document.delete();
    game.actors.get(charID).delete();
}

if (args[0].tag === "OnUse") {
    let numDice = args[0].spellLevel % 2 ? 1 + Math.floor((args[0].spellLevel) / 2) : Math.floor((args[0].spellLevel) / 2);

    let spellAbil = actor.system.attributes.spellcasting;
    let abilBonus = getProperty(actor, `system.abilities.${spellAbil}.mod`);

    let tid;

    let swordimg = "icons/weapons/swords/sword-guard-flanged-purple.webp";
    let maceimg = "icons/weapons/maces/mace-round-spiked-black.webp";
    let spearimg = "icons/weapons/ammunition/arrow-head-war-flight.webp";
    let hammerimg = "icons/weapons/hammers/hammer-drilling-spiked.webp";
    let axeimg = "icons/weapons/polearms/halberd-crescent-engraved-steel.webp";
    let wpimg;
    let addToTracker;

    function getCenterGrid(point = {}) {
        const arr = canvas.grid.getCenter(point.x, point.y);
        return {
            x: arr[0],
            y: arr[1]
        };
    }

    function getMousePosition() {
        const mouse = canvas.app.renderer.plugins.interaction.mouse;
        return mouse.getLocalPosition(canvas.app.stage);
    }


    async function weaponselect() {

        return await new Promise((resolve) => {
            let dialogEditor = new Dialog({
                title: `Choose Weapon`,
                content: `<form> <input type="checkbox"  name="add-to-tracker" style="vertical-align: sub;"> Add spirtual weapon to combat tracker`,
                buttons: {
                    Sword: {
                        label: `<img src="${swordimg}" width="60" height="60" style="border:0px"><br>Sword`,
                        callback: (html) => {
                            addToTracker = html.find("[name=add-to-tracker]")[0];
                            resolve(1);
                        }
                    },
                    Mace: {
                        label: `<img src="${maceimg}" width="60" height="60" style="border:0px"><br>Mace`,
                        callback: (html) => {
                            addToTracker = html.find("[name=add-to-tracker]")[0];
                            resolve(2);
                        },
                    },
                    Spear: {
                        label: `<img src="${spearimg}" width="60" height="60" style="border:0px"><br>Spear`,
                        callback: (html) => {
                            addToTracker = html.find("[name=add-to-tracker]")[0];
                            resolve(3);
                        },
                    },
                    Hammer: {
                        label: `<img src="${hammerimg}" width="60" height="60" style="border:0px"><br>Hammer`,
                        callback: (html) => {
                            addToTracker = html.find("[name=add-to-tracker]")[0];
                            resolve(4);
                        },
                    },
                    default: {
                        label: `<img src="${axeimg}" width="60" height="60" style="border:0px"><br>Axe`,
                        callback: (html) => {
                            addToTracker = html.find("[name=add-to-tracker]")[0];
                            resolve(5);
                        },
                    }
                }
            });
            dialogEditor.render(true);
        });
    }


    let weapon = await weaponselect();

    switch (weapon) {
        case 1:
            wpimg = swordimg;
            break;
        case 2:
            wpimg = maceimg;
            break;
        case 3:
            wpimg = spearimg;
            break;
        case 4:
            wpimg = hammerimg;
            break;
        case 5:
            wpimg = axeimg;
            break;
        default:
            wpimg = swordimg;
            break;
    }

    let user = game.users.get(game.userId);

    let itemdata = [{
        "name": "Attack",
        "type": "weapon",
        "img": wpimg,
        "data": {
            "description": {
                "value": "<p>A floating, spectral weapon within range that lasts for the duration or until you cast this spell again.</p>\n<p>On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier.</p>\n<p>As a bonus action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it.</p>\n<p>The weapon can take whatever form you choose. Clerics of deities who are associated with a particular weapon (as St. Cuthbert is known for his mace and Thor for his hammer) make this spell&rsquo;s effect resemble that weapon.</p>",
                "chat": "",
                "unidentified": ""
            },
            "source": "PHB pg. 278",
            "quantity": 1,
            "weight": 0,
            "price": "0",
            "attunement": 0,
            "equipped": true,
            "rarity": "common",
            "identified": true,
            "activation": {
                "type": "bonus",
                "cost": 0,
                "condition": ""
            },
            "duration": {
                "value": null,
                "units": ""
            },
            "target": {
                "value": 1,
                "width": null,
                "units": "",
                "type": "creature"
            },
            "range": {
                "value": 60,
                "long": null,
                "units": "ft"
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
            "ability": "wis",
            "actionType": "msak",
            "attackBonus": abilBonus,
            "chatFlavor": "",
            "critical": {
                "threshold": null,
                "damage": ""
            },
            "damage": {
                "parts": [
                    [
                        `${numDice}d8+${abilBonus}`,
                        "force"
                    ]
                ],
                "versatile": ""
            },
            "formula": "",
            "save": {
                "ability": "",
                "dc": null,
                "scaling": "spell"
            },
            "armor": {
                "value": 10
            },
            "hp": {
                "value": 0,
                "max": 0,
                "dt": null,
                "conditions": ""
            },
            "weaponType": "simpleM",
            "baseItem": "",
            "properties": {
                "ada": false,
                "amm": false,
                "fin": false,
                "fir": false,
                "foc": false,
                "hvy": false,
                "lgt": false,
                "lod": false,
                "mgc": false,
                "rch": false,
                "rel": false,
                "ret": false,
                "sil": false,
                "spc": false,
                "thr": false,
                "two": false,
                "ver": false,
                "nodam": false,
                "fulldam": false,
                "halfdam": false,
                "critOther": false
            },
            "proficient": false
        },
    }];

    const data = {
        name: "Spiritual Weapon of " + actor.name,
        type: "character",
        "img": wpimg,
        permission: {
            [user.id]: 3
        },
        data: {
            "attributes": {

                "ac": {
                    "flat": 90,
                    "calc": "flat",
                    "formula": "",
                    "base": 50
                },


                "hp": {
                    "value": 900,
                    "min": 0,
                    "max": 900
                },
                "movement": {
                    "fly": 20,
                    "units": "ft",
                    "hover": false
                }
            },
            "traits": {
                "di": {
                    "value": [
                        "acid",
                        "bludgeoning",
                        "cold",
                        "fire",
                        "force",
                        "lightning",
                        "necrotic",
                        "physical",
                        "piercing",
                        "poison",
                        "psychic",
                        "radiant",
                        "slashing",
                        "thunder",
                        "silver",
                        "adamant",
                        "spell",
                        "healing",
                        "temphp"
                    ],
                }
            },
            "details": {
                "alignment": "",
                "race": "Spiritual",
                "background": "",
            },
        }
    };

    let charID = (await Actor.create(data))?.id
    await user.update({
        character: charID
    });

    let atoken = await fromUuid(args[args.length - 1].tokenUuid);

    let [range] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
        t: "circle",
        user: game.userId,
        x: atoken.x + canvas.grid.size / 2,
        y: atoken.y + canvas.grid.size / 2,
        direction: 0,
        distance: 60,
        borderColor: "#FF0000"
    }]);

    tid = range._id;

    let templateData = {
        t: "rect",
        user: game.userId,
        x: 0,
        y: 0,
        distance: 7,
        direction: 45,
        fillColor: game.user.color,
        flags: {
            randomID: rnd
        }
    }

    let doc = new CONFIG.MeasuredTemplate.documentClass(templateData, {
        parent: canvas.scene
    });

    let template = new game.dnd5e.canvas.AbilityTemplate(doc);
    await template.drawPreview();


    await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [tid]);
    let location = getCenterGrid(getMousePosition());
    let tokenDocument = await game.actors.get(charID).getTokenDocument();
    let swpactor = await game.actors.get(charID)
    let tokendocu = await canvas.scene.createEmbeddedDocuments("Token", [tokenDocument], {
        temporary: true
    });

    tokendocu = duplicate(tokendocu[0]);
    let {
        x,
        y
    } = canvas.grid.getSnappedPosition(location.x, location.y, -1);
    tokendocu.x = x;
    tokendocu.y = y;
    tokendocu.actorId = charID;

    await canvas.scene.createEmbeddedDocuments("Token", [tokendocu]);
    await actor.setFlag("world", "SpiritualWeapon.ActorId", charID);
    await swpactor.createEmbeddedDocuments("Item", itemdata);

    let temporarytemplate = canvas.scene.templates.find(e => e.flags.randomID == rnd);
    if (temporarytemplate) temporarytemplate.delete();

    let applySPWEffect = {
        changes: [{
            key: "macro.itemMacro",
            mode: 0,
            value: `ItemMacro.${item.name}`,
            priority: 20
        }],
        label: item.name,
        origin: item.uuid,
        icon: item.img,
        duration: {
            "seconds": 60,
            "rounds": 10,
            startTime: game.time.worldTime
        },
    }
    await actor.createEmbeddedDocuments("ActiveEffect", [applySPWEffect]);

    if (game.combat) {
        let caster = game.combat.combatants.find(e => e.actorId == actor._id)
        if (caster) {
            let ztokenSPW = canvas.tokens.placeables.find(akarmi => akarmi.document.actorId == charID)
            const newCombatant = {
                tokenId: ztokenSPW.id,
                hidden: ztokenSPW.hidden,
                actorId: ztokenSPW.actor.id,
                name: ztokenSPW.actor.name,
                initiative: caster.initiative - 0.01
            }
            if (addToTracker.checked) await game.combat.createEmbeddedDocuments("Combatant", [newCombatant]);
        }
    }
}