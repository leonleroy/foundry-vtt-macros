// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL, DFreds Convenient Effects
if (!game.modules.get("dfreds-convenient-effects")?.active) {ui.notifications.error("Please enable the DFreds Convenient Effects module") ;return;}

let effectLabel = "Charmed";
if (args[0].targets[0].actor.effects.find(e => e.data.label === effectLabel)) return ui.notifications.warn(`Target is already Charmed.`);
if (args[0].targets[0].actor.effects.find(e => e.data.label === item.name + " Immunity")) return ui.notifications.warn(`Target is immune to ${item.name}.`);

if (args[0].failedSaves.length == 0) {

    let Effect = {
        label: item.name + " Immunity",
        origin: item.uuid,
        icon: item.data.img,
        duration: {
            "seconds": 3600 * 24,
            startTime: game.time.worldTime
        }
    };
	
    await args[0].targets[0].actor.createEmbeddedDocuments("ActiveEffect", [Effect]);
	
} else {

    await game.dfreds.effectInterface.toggleEffect(effectLabel, {
        uuids: [args[0].hitTargetUuids[0]]
    });
	
    let effect = args[0].targets[0].actor.effects.find(e => e.data.label === effectLabel);
	
    await args[0].targets[0].actor.updateEmbeddedDocuments("ActiveEffect", [{
        _id: effect.id,
        disabled: effect.data.disabled,
        duration: {
            seconds: 3600 * 24
        }
    }]);
}