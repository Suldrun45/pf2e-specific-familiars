Hooks.on("createItem", async (item) => {
	if (item.type=="action" && item.system.category=="familiar" && item.flags.core.sourceId.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.') && item.parent.type=="familiar"){
		const familiar = item.parent;
		const abilities = familiar.flags.pf2e.specificFamiliars?.requiredNumberOfAbilities;
		const grantedabilities = familiar.flags.pf2e.specificFamiliars?.grantedNumberOfAbilities;
		if ((abilities && abilities > 0) || (grantedabilities && grantedabilities>0)){
			const master = familiar.master;
			if (master){
				const ITEM_UUID= "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.YIf6rhtu23DY3zZ5";
				const itemsource = (await  fromUuid(ITEM_UUID)).toObject();
				itemsource.flags = mergeObject(itemsource.flags ?? {}, { core: { sourceId: ITEM_UUID } });
				const existing = master.itemTypes.feat.find((e) => e.flags.core?.sourceId === ITEM_UUID);
				if (existing){
					await existing.delete();
				}
				await master.createEmbeddedDocuments("Item", [itemsource]);							
			}
		}			
	}	
});

Hooks.on("preDeleteItem", async (item) => {
	if (item.type=="action" && item.system.category=="familiar" && item.flags.core.sourceId.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.') && item.parent.type=="familiar"){
		const familiar = item.parent;
		const abilities = familiar.flags.pf2e.specificFamiliars?.requiredNumberOfAbilities;
		const grantedabilities = familiar.flags.pf2e.specificFamiliars?.grantedNumberOfAbilities;
		if ((abilities && abilities > 0) || (grantedabilities && grantedabilities>0)){
			const master = familiar.master;
			if (master){
				const ITEM_UUID= "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.YIf6rhtu23DY3zZ5";
				const existing = master.itemTypes.feat.find((e) => e.flags.core?.sourceId === ITEM_UUID);
				if (existing){
					await existing.delete();
				}	
				const otherAbilities = familiar.items.map(p => p).find(f => f !== item && f.type=="action" && f.system.category=="familiar" && f.flags.core.sourceId.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.'));
				if (otherAbilities){
					const itemsource = (await  fromUuid(ITEM_UUID)).toObject();
					itemsource.flags = mergeObject(itemsource.flags ?? {}, { core: { sourceId: ITEM_UUID } });
					await master.createEmbeddedDocuments("Item", [itemsource]);		
				}
			}
		}			
	}	
});

Hooks.once("ready", async () => {
	await game.actors.map(p=>p).filter(p=>p.type=="character").forEach(async (act) => {
		const ITEM_UUID= "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.YIf6rhtu23DY3zZ5";
		const existing = act.itemTypes.feat.find((e) => e.flags.core?.sourceId === ITEM_UUID);
		if (existing){
			await existing.delete();
			const itemsource = (await  fromUuid(ITEM_UUID)).toObject();
			itemsource.flags = mergeObject(itemsource.flags ?? {}, { core: { sourceId: ITEM_UUID } });
			await act.createEmbeddedDocuments("Item", [itemsource]);
		}	
	});
});