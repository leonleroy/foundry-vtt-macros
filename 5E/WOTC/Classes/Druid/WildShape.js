// Original script: https://gitlab.com/Freeze020/foundry-vtt-scripts/-/blob/master/DnD5e%20specific%20macros/Wildshape/WildShape-player.js
// Special thanks to Freeze for the original macro
// Thanks to Crymic and IanM32 for the support/ideas
// Requires the following permissions: CREATE NEW ACTORS, CREATE NEW ITEMS
// Requires the following modules: Dynamic Active Effects, Item Macros, Times-Up, About-Time
// Macro version 1.04 // 20221128 for Foundry V10
const subClassName = "Circle of the Moon"; // change if that is not your SubClass name for Circle of the Moon
const CompendiumName = "Shapes Compendium";
const RevertKeyWord = "Revert";

if (args[0] === "on") {
    return
}
if ((args[0] === "off") || (item.name.includes(RevertKeyWord))) {
    await ActorRevertBack();
    return
}

if (!token.document.actorLink) return ui.notifications.warn("WildShape ItemMacro works with linked actors only!");

let CompNameCheckOK = game.packs.contents.find(l => l.metadata.label === CompendiumName);
if (CompNameCheckOK) {
    var packName = CompNameCheckOK.metadata.packageType + '.' + CompNameCheckOK.metadata.name;
} else {
    return ui.notifications.info("There is no " + CompendiumName + " , please create and add at least one beast!");
}


const macroToken = token;
const macroActor = token.actor;
const druid = macroToken.actor.items.find(i => i.name == "Druid" && i.type == "class");

if (!druid) {
    return ui.notifications.info("you are not a Druid, dont try to bamboozle the game ;)");
}


var levels = druid.system.levels;
let rlevel = levels >= 1 ? 2 : levels;


const DurationInSeconds = Math.floor(rlevel / 2) * 3600;

// Declare the WildShape Effect
let applyWildShapeEffect = {
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
        "seconds": DurationInSeconds,
        startTime: game.time.worldTime
    },
}

let maxCR = 0;
if (druid.system.subclass !== subClassName) {
    maxCR = (druid.system.levels > 7) ? 1 : (druid.system.levels > 3) ? 0.5 : (druid.system.levels > 1) ? 0.25 : 0;
} else {
    maxCR = (druid.system.levels > 17) ? 6 : (druid.system.levels > 14) ? 5 : (druid.system.levels > 11) ? 4 : (druid.system.levels > 8) ? 3 : (druid.system.levels > 5) ? 2 : 1;
}

const resourceKey = Object.keys(macroToken.actor.system.resources).filter(k => macroToken.actor.system.resources[k].label === item.name).shift();

if (druid.system.levels < 10 || druid.system.subclass !== subClassName || macroToken.actor.system.resources[resourceKey].value < 2) {
    await selectShape("beast");
} else {

    new Dialog({
        title: `select your Wildshape method`,
        contents: ``,
        buttons: {
            option_1: {
                icon: `<i class="fas fa-paw"></i>`,
                label: `Beast Wildshape`,
                callback: async () => {
                    await selectShape("beast");
                },
            },
            option_2: {
                icon: `<i class="fab fa-react"></i>`,
                label: `Elemental Wildshape`,
                callback: async () => {
                    await selectShape("elemental");
                },
            }
        },
        default: "option_1",
    }).render(true);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function selectShape(type) {
    let beastDialogOptions = "";
    let elemDialogOptions = "";
    let compendium = (await game.packs.get(packName).getDocuments()).sort((a, b) => b.system.details.cr - a.system.details.cr);
    for (let shapeOption of compendium) {
        if (shapeOption.name.toLowerCase().includes("elemental")) {
            elemDialogOptions += `<option value=${shapeOption.id}> ${shapeOption.name} |  ${shapeOption.system.attributes.hp.value} hit-points</option>`;
        } else {

            const fly = shapeOption.system.attributes.movement.fly;
            const swim = shapeOption.system.attributes.movement.swim;

            const specialMovement = (fly !== 0 && fly !== null) ? "fly" : (swim !== 0 && swim !== null) ? "swim" : "none"
            if ((druid.system.levels < 8 && specialMovement == "fly" && druid.system.subclass?.identifier !== subClassName)) {
                continue;
            } else if ((druid.system.levels < 4 && specialMovement == "swim" && druid.system.subclass?.identifier !== subClassName)) {
                continue;
            } else if ((druid.system.levels < 8 && specialMovement == "fly" && druid.system.subclass?.identifier === subClassName)) {
                continue;
            } else if ((druid.system.levels < 4 && specialMovement == "swim" && druid.system.subclass?.identifier === subClassName)) {
                continue;
            } else {
                if (shapeOption.system.details.cr > maxCR) {
                    continue;
                }
                beastDialogOptions += `<option value=${shapeOption.id}> ${shapeOption.name} | ${shapeOption.system.attributes.hp.value} hit-points | ${shapeOption.system.details.cr} CR</option>`;
            }
        }
    }
    let dialogOptions = type == "beast" ? beastDialogOptions : elemDialogOptions;
    let dialogContent = `<form>
                        <h2> Select your shape here </h2>
                        <div class="form-group"><label>Shape name:</label><select name="shape">${dialogOptions}</select></div>
                        </form>`;
    new Dialog({
        title: "Beast Wild Shape",
        content: dialogContent,
        buttons: {
            accept_button: {
                label: `<i class="fas fa-paw"></i>Wild Shape!`,
                callback: async (html) => {
                    const shapeId = html.find("[name=shape]")[0].value;
                    const newShape = compendium.find(shape => shape.id === shapeId)

                    let CompNameFull = CompNameCheckOK.metadata.packageType + '.' + CompNameCheckOK.metadata.name

                    await ChatMessage.create({
                        content: `<br>Turns into a @Compendium[${CompNameFull}.${newShape.id}].`,
                        speaker: {
                            alias: macroToken.actor.name
                        },
                        type: CONST.CHAT_MESSAGE_TYPES.OOC
                    });

                    let addRevert = macroToken.actor.items.getName(item.name).toObject();
                    addRevert.name = RevertKeyWord + " " + item.name;
                    addRevert.system.uses.max = 0;
                    addRevert.system.uses.value = 0;
                    addRevert.system.uses.per = "";
                    addRevert.system.uses.type = "";
                    addRevert.system.activation.type = "bonus";
                    addRevert.system.description.value = "<p>You can stay in a beast shape for a number of hours equal to half your druid level (rounded down). You then revert to your normal form unless you expend another use of this feature. You can revert to your normal form earlier by using a bonus action on your turn. You automatically revert if you fall unconscious, drop to 0 hit points, or die.</p>"


                    const [newToken] = await macroToken.actor.transformInto(newShape, {
                        keepMental: true,
                        keepClass: true,
                        mergeSaves: true,
                        mergeSkills: true,
                    });


                    await newToken.setFlag("world", "WSoriginalActorId", macroActor.id);

                    if (druid.system.levels > 5) {
                        const updates = newToken.actor.itemTypes.weapon.filter(i => i.system.weaponType === "natural").map(i => ({
                            _id: i.id,
                            "data.properties.mgc": true
                        }));
                        await newToken.actor.updateEmbeddedDocuments("Item", updates);
                    }
                    while (newToken.actor.sheet.rendered === false) {
                        await new Promise(r => setTimeout(r, 50));
                    }
                    newToken.actor.sheet.close();

                    await newToken.actor.createEmbeddedDocuments("ActiveEffect", [applyWildShapeEffect]);
                    await newToken.actor.createEmbeddedDocuments("Item", [addRevert]);

                    let CWS = await actor.items.find(i => i.name === "Combat Wild Shape");

                    if (CWS) {
                        let itemdata = [{
                            "name": "Selfheal",
                            "type": "spell",
                            "img": item.img,
                            "data": {
                                "description": {
                                    "value": "<p>While you are transformed by Wild Shape, you can use a bonus action to expend one spell slot to regain [[/r 1d8]] hit points per level of the spell slot expended.</p>",
                                    "chat": "",
                                    "unidentified": ""
                                },
                                "source": "PHB pg. 69",
                                "activation": {
                                    "type": "bonus",
                                    "cost": 1,
                                    "condition": ""
                                },
                                "duration": {
                                    "value": null,
                                    "units": "inst"
                                },
                                "target": {
                                    "value": null,
                                    "width": null,
                                    "units": "",
                                    "type": "self"
                                },
                                "range": {
                                    "value": null,
                                    "long": null,
                                    "units": "touch"
                                },
                                "actionType": "heal",
                                "damage": {
                                    "parts": [
                                        [
                                            "1d8",
                                            "healing"
                                        ]
                                    ],
                                    "versatile": ""
                                },
                                "formula": "",
                                "save": {
                                    "ability": "",
                                    "dc": null,
                                    "scaling": "spell",
                                    "value": ""
                                },
                                "level": 1,
                                "school": "evo",
                                "components": {
                                    "value": "",
                                    "vocal": true,
                                    "somatic": true,
                                    "material": false,
                                    "ritual": false,
                                    "concentration": false
                                },
                                "preparation": {
                                    "mode": "prepared",
                                    "prepared": true
                                },
                                "scaling": {
                                    "mode": "level",
                                    "formula": "1d8"
                                }
                            },
                        }];

                        newToken.actor.createEmbeddedDocuments("Item", itemdata);
                    }

                    if (getProperty(macroToken.actor, "flags.dae.autoWildShape") == "1") {
                        let newHP = 0;
                        let cnt = 0;
                        let rerollword = "";

                        while (newHP == 0) {
                            if (cnt != 0) rerollword = "Re";
                            let HProll = await new Roll(newToken.actor.system.attributes.hp.formula);
                            await HProll.toMessage({
                                flavor: `HP ${rerollword}Roll`,
                                speaker: {
                                    alias: macroToken.actor.name
                                }
                            });
                            newHP = HProll._total;
                            cnt++;
                            if (newHP >= 1) {
                                newToken.actor.system.attributes.hp.value = newHP;
                                newToken.actor.system.attributes.hp.max = newHP;
                            }
                        }
                    }


                }
            }
        },
        default: "accept_button"
    }).render(true);
}


async function ActorRevertBack() {
    if (token.actor.isPolymorphed) {
        ChatMessage.create({
            content: `<br>Reverts to <b>original form</b>.`,
            speaker: {
                alias: token.actor.name
            },
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });

        const elevation = token.document.elevation;
        const spellSlots = await duplicate(token.actor.system.spells);
        const revertedActorId = token.document.getFlag("world", "WSoriginalActorId");
        await token.document.unsetFlag("world", "WSoriginalActorId");
        const revertedActor = game.actors.get(revertedActorId);
        await revertedActor.update({
            "data.spells": spellSlots
        });
        await token.actor.revertOriginalForm();
        await new Promise(resolve => setTimeout(resolve, 150));
        const newToken = revertedActor.getActiveTokens()[0];
        await newToken.document.update({
            elevation: elevation
        })

        return;
    }
}