// Original script: https://github.com/Maselkov/masels-foundryvtt-macros/blob/master/spells/0/toll-the-dead.js
// Requires the following modules: Item Macros, MidiQOL
// Macro version 1.00 // 20220323
if (!args[0].failedSaves.length) {
    return;
}

let targets = args[0].targets[0];
let target = await canvas.tokens.get(targets.id);
let level = actor.data.data.details.level;
let numDice = 1 + Math.floor((level + 1) / 6);

let damageRoll = target.actor.data.data.attributes.hp.max != target.actor.data.data.attributes.hp.value ? new Roll(`${numDice}d12`).evaluate({
    async: false
}) : new Roll(`${numDice}d8`).evaluate({
    async: false
});
new MidiQOL.DamageOnlyWorkflow(actor, token.document, damageRoll.total, "necrotic", [target], damageRoll, {
    flavor: "Toll the Dead - Damage Roll (Necrotic)",
    itemCardId: args[0].itemCardId
})