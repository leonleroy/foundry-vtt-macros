// Requires the following modules: Item Macros, MidiQOL
// Trigger Item macro by "Before Attack roll"
// Macro version 1.01 // 20221128 For FoundryVTT V10

let targets = args[0].targets[0];
let target = await canvas.tokens.get(targets.id);

if (target.actor.system.attributes.ac.equippedArmor) {
    let armor = target.actor.system.attributes.ac.equippedArmor._id;
    const armorI = target.actor.items.find(i => i._id == armor);
    let armorIDesc = armorI.system.description.value.toLowerCase();
    let pos = armorIDesc.search("metal");
    if (pos >= 0) {
        const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid)
        workflow.advantage = true;
    }
}