// Requires the following modules: Item Macros, Times-Up, About-Time, MidiQOL
// Macro version 1.01 // 2022118 For Foundry V10

let targets = Array.from(game.user.targets)
let target_actor = targets[0].actor;

let Effect = {
    label: item.name,
    origin: item.uuid,
    icon: item.img,
    duration: {
        "seconds": 600,
        startTime: game.time.worldTime
    },
}

await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target_actor.uuid, effects: [Effect] });