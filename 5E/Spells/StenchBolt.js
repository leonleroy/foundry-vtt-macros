// Requires the following modules: Item Macros
// Icon: https://game-icons.net/1x1/lorc/skull-bolt.html


if (args[0].hitTargets.length > 0) {
    let targets = Array.from(game.user.targets)
    let tokenid = targets[0]
    let [range] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
        t: "circle",
        user: game.userId,
        x: tokenid._validPosition.x + canvas.grid.size / 2,
        y: tokenid._validPosition.y + canvas.grid.size / 2,
        direction: 0,
        distance: 10,
        borderColor: "#436643",
        fillColor: "#436643"
    }]);
	await addeffect();
}
else
{
      let templateData = {
      t: "circle",
      user: game.userId,
      distance: 10,
      direction: 0,
      x: 0,
      y: 0,
      borderColor: "#436643",
      fillColor: "#436643"
     };
	 
	Hooks.once("createMeasuredTemplate", addeffect);

    let doc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene });
    let template = new game.dnd5e.canvas.AbilityTemplate(doc);
    await template.drawPreview();
}
	
function addeffect()
{
    let newtargets = Array.from(game.user.targets)
    for (let target of newtargets) {
        let find_target =  canvas.tokens.get(target.id);
        let Effect = {
            label: item.name,
            origin: item.uuid,
            icon: item.data.img,
            duration: {
                "seconds": 600,
                startTime: game.time.worldTime
            },
            changes: [{
                    key: `flags.midi-qol.disadvantage.attack.all`,
                    mode: 2,
                    value: 1,
                    priority: 20
                },
                {
                    key: `flags.midi-qol.disadvantage.ability.save.all`,
                    mode: 2,
                    value: 1,
                    priority: 20
                },
                {
                    key: `flags.midi-qol.disadvantage.ability.check.all`,
                    mode: 2,
                    value: 1,
                    priority: 20
                }
            ]
        }

         find_target.actor.createEmbeddedDocuments("ActiveEffect", [Effect]);

    }
}