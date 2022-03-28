// Requires the following modules: Item Macros, MidiQOL
// Trigger Item macro by "Before Attack roll"
// Macro version 1.0 // 20220327

let targets = args[0].targets[0];
let target = await canvas.tokens.get(targets.id);

if (target.actor.data.data.attributes.ac.equippedArmor) {
    let armor = target.actor.data.data.attributes.ac.equippedArmor.data._id;
    const armorI = target.actor.data.items.find(i => i.data._id == armor);
    let armorIDesc = armorI.data.data.description.value.toLowerCase();
    let pos = armorIDesc.search("metal");
    if (pos >= 0) {
        const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid)
        workflow.advantage = true;
    }
}
