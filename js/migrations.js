import { MODULE_ID } from "./consts.js";

const MIGRATIONS = [{
    version: "14.3.0",
    shouldRun: needsMigrate140300,
    migrate: migrate140300
}]

const CURRENT_MIGRATION_VERSION = MIGRATIONS.reduce(
    (latest, migration) =>
        foundry.utils.isNewerVersion(migration.version, latest)
            ? migration.version
            : latest,
    "0.0.0"
);

export async function doMigrations(){
    if (!game.user.isGM || game.user !== game.users.activeGM) return;

    let lastMigration = game.settings.get(MODULE_ID, "last-migration") ||  "0.0.0";

    for (const migration of MIGRATIONS) {
    const migrationIsNewer = foundry.utils.isNewerVersion(migration.version, lastMigration);

    if (!migrationIsNewer) continue;

    const mustRun = await migration.shouldRun();

    if (mustRun) {
      await migration.migrate();
    }
    await game.settings.set(MODULE_ID, "last-migration", migration.version);

    lastMigration = migration.version;
  }

  if (foundry.utils.isNewerVersion(CURRENT_MIGRATION_VERSION, lastMigration)) {
    await game.settings.set(MODULE_ID, "last-migration", CURRENT_MIGRATION_VERSION);
  }
}

function needsMigrate140300(){
    const familiars = game.actors.filter(actor => actor.type == 'familiar');
    return familiars.some(familiar => familiar.itemTypes.action.some(action => action.sourceId?.startsWith("Compendium.pf2e-specific-familiars.") && !action.slug));
}

async function migrate140300(){ 
    const familiars = game.actors.filter(actor => actor.type == 'familiar');
    for (const familiar of familiars){
        const familiarAbilities = familiar.itemTypes.action.filter(action => action.sourceId?.startsWith("Compendium.pf2e-specific-familiars.") && !action.slug);
        for (const ability of familiarAbilities){
            await ability.update({'system.slug': ability.name.slugify()})
        }
    }
}