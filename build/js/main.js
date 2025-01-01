Hooks.once("init", ()=>{
	game.pf2especificfamiliars = foundry.utils.mergeObject(game.pf2especificfamiliars ?? {}, {
        setFamiliarAbilities: setFamiliarAbilities
    });
});


Hooks.once("ready", async () => {
	//migration
	await game.actors.map(p=>p).filter(p=>p.type=="character").forEach(async (act) => { 
		const OLD_ITEM_UUID = "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.YIf6rhtu23DY3zZ5";
		const oldfeat = act.itemTypes.feat.find((e) => e._stats.compendiumSource === OLD_ITEM_UUID || e.flags.core?.sourceId === OLD_ITEM_UUID);
		if (oldfeat){
			await oldfeat.delete();	
			await setFamiliarAbilities(act);
		}
	});
});

Hooks.on("createItem", async (item) => {
	if (item.type=="action" && item.system.category=="familiar" && (item._stats.compendiumSource?.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.') || item.flags.core?.sourceId.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.')) && item.parent.type=="familiar"){
		const familiar = item.parent;
		const master = familiar.master;
		await setFamiliarAbilities(master);		
	}	
});

Hooks.on("deleteItem", async (item) => {
	if (item.type=="action" && item.system.category=="familiar" && (item._stats.compendiumSource?.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.') || item.flags.core?.sourceId.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.')) && item.parent.type=="familiar"){
		const familiar = item.parent;
		const master = familiar.master;
		await setFamiliarAbilities(master);
	}	
});

async function setFamiliarAbilities(act){
	const ITEM_UUID = "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.PN7kY8Ukw2O1WKKE";
	const existing = act.itemTypes.feat.find((e) => e._stats?.compendiumSource === ITEM_UUID || e.flags.core?.sourceId === ITEM_UUID);
	if (existing && existing.isOwner && existing.parent.isOwner){
		await existing.delete();
	}
	const familiar = act.familiar;
	if (familiar){
		const abilities = familiar.flags.pf2e.specificFamiliars?.requiredNumberOfAbilities;
		const grantedabilities = familiar.flags.pf2e.specificFamiliars?.grantedNumberOfAbilities;			
		if ((abilities && abilities > 0) || (grantedabilities && grantedabilities>0)){
			const itemsource = (await  fromUuid(ITEM_UUID)).toObject();
			itemsource._stats = foundry.utils.mergeObject(itemsource._stats ?? {}, { compendiumSource: ITEM_UUID });
			itemsource.flags = foundry.utils.mergeObject(itemsource.flags ?? {}, { core: { sourceId: ITEM_UUID }});
			const rules=itemsource.system.rules;
			rules.push({"key":"ActiveEffectLike","mode": "add", "path": "flags.pf2e.specificFamiliars.requiredNumberOfAbilities", "value": abilities, "priority":10});
			rules.push({"key":"ActiveEffectLike","mode": "add", "path": "flags.pf2e.specificFamiliars.grantedNumberOfAbilities", "value": grantedabilities, "priority":10});
			await act.createEmbeddedDocuments("Item", [itemsource]);		
		}
	}	
}