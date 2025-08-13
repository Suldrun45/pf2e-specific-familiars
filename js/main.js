const MODULE_ID = 'pf2e-specific-familiars';
const SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID = "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.PN7kY8Ukw2O1WKKE";

Hooks.once("init", ()=>{
	game.pf2especificfamiliars = foundry.utils.mergeObject(game.pf2especificfamiliars ?? {}, {
        setFamiliarAbilities: setFamiliarAbilities
    });
});


Hooks.once("ready", async () => {
	//migration
	await game.actors.map(p=>p).filter(p => p.type == "character").forEach(async (act) => { 
		const OLD_ITEM_UUID = "Compendium.pf2e-specific-familiars.specific-familiars-feats.Item.YIf6rhtu23DY3zZ5";
		const oldfeat = act.itemTypes.feat.find((e) => e._stats.compendiumSource === OLD_ITEM_UUID || e.flags.core?.sourceId === OLD_ITEM_UUID);
		if (oldfeat){
			await oldfeat.delete();	
			await setFamiliarAbilities(act);
		}		
		const existing = act.itemTypes.feat.filter((e) => e._stats?.compendiumSource === SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID || e.flags.core?.sourceId === SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID);
		const hasFlag = !!act.getFlag(MODULE_ID, 'familiarAbilities');		
		if ((existing?.length ?? 0) > 0 && !hasFlag){	//remove the feat if it is not required anymore (mostly due to the new version)
			for (const feat of existing){
				if (feat.isOwner && feat.parent.isOwner){
					await feat.delete();
				}
			}			
			await setFamiliarAbilities(act); //Add the new version if required
		}
		if ((existing?.length ?? 0) == 0 && hasFlag) {
			await setFamiliarAbilities(act); //In case the feat was deleted;
		}
	});
});

Hooks.on("createItem", async (item) => {
	if (item.type=="action" && item.system.category=="familiar" && (item._stats.compendiumSource?.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.') || (item.flags.core?.sourceId ?? "").startsWith('Compendium.pf2e-specific-familiars.specific-familiars.')) && item.parent.type=="familiar"){
		const familiar = item.parent;
		const master = familiar.master;
		await setFamiliarAbilities(master);		
	}	
});

Hooks.on("deleteItem", async (item) => {
	if (item.type=="action" && item.system.category=="familiar" && (item._stats.compendiumSource?.startsWith('Compendium.pf2e-specific-familiars.specific-familiars.') || (item.flags.core?.sourceId ?? "").startsWith('Compendium.pf2e-specific-familiars.specific-familiars.')) && item.parent.type=="familiar"){
		const familiar = item.parent;
		const master = familiar.master;
		await setFamiliarAbilities(master);
	}	
});

async function setFamiliarAbilities(master){
	if (!master)
		return;
	const existing = master.itemTypes.feat.find((e) => e._stats?.compendiumSource === SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID || e.flags.core?.sourceId === SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID);
	const familiar = master.familiar;
	const requiredNumberOfAbilities = familiar?.flags.pf2e.specificFamiliars?.requiredNumberOfAbilities ?? 0;
	const grantedNumberOfAbilities = familiar?.flags.pf2e.specificFamiliars?.grantedNumberOfAbilities ?? 0;	
	
	if (requiredNumberOfAbilities > 0 || grantedNumberOfAbilities > 0){
		await master.setFlag(MODULE_ID, 'familiarAbilities', { requiredNumberOfAbilities: requiredNumberOfAbilities, grantedNumberOfAbilities: grantedNumberOfAbilities }); //set abilities on the master
		if (familiar && !existing){ //Create the feat if it does not exist and is required
			const itemsource = (await fromUuid(SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID)).toObject();
			itemsource._stats = foundry.utils.mergeObject(itemsource._stats ?? {}, { compendiumSource: SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID });
			itemsource.flags = foundry.utils.mergeObject(itemsource.flags ?? {}, { core: { sourceId: SPECIFIC_FAMILIAR_REQUIRED_ABILITIES_UUID }});			
			await master.createEmbeddedDocuments("Item", [itemsource]);					
		}	
	}
	else{
		await master.unsetFlag(MODULE_ID, 'familiarAbilities'); //set abilities on the master		
		if (existing && existing.isOwner && existing.parent.isOwner){ //Remove the feat if it isn't required anymore
			await existing.delete();
		}	
	}	
}