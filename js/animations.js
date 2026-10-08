//Code shamelessly copied from Chasarooni's Trigger Animation Trove

import { MODULE_ID } from "./consts.js";

export async function askToAddNewAnimationsDialog(test) {
  if (!game.modules.find(p=>p.id=="trigger-animations")?.active)
    return;
  const askedAnimationsSet = new Set(
    game.settings.get(MODULE_ID, "animations-asked-to-enable"),
  );
  const triggerData =
    window.triggerAnimations?.api?.db?.flags?.["trigger-animations"]?.data;
  const enabledSet = new Set(triggerData?.enabled);

  const list = await getNewAnimationData(askedAnimationsSet, enabledSet);

  if (list.length > 0) {
    const addNewAnimations = await enableAnimationsDialog(list);
    list.forEach((anim) => {
      if (!askedAnimationsSet.has(anim.id)) {
        askedAnimationsSet.add(anim.id);
      }
    });

    if (addNewAnimations) {
      await enableAllDisabledAnimations(list);
      ui.notifications.info("These new animations have been enabled");
    }
    triggerData?.enabled?.forEach((animID) => {
      if (!askedAnimationsSet.has(animID)) {
        askedAnimationsSet.add(animID);
      }
    });
    const array = Array.from(askedAnimationsSet);
    await game.settings.set(MODULE_ID, "animations-asked-to-enable", array);
  }
}

async function enableAllDisabledAnimations(list) {
  const idList = list.map((a) => a.id);
  const triggerData =
    window.triggerAnimations.api.db.getFlag("trigger-animations", "data") || {};
  triggerData.enabled = [
    ...new Set((triggerData?.enabled ?? []).concat(idList)),
  ];
  await window.triggerAnimations.api.db.setFlag(
    "trigger-animations",
    "data",
    triggerData,
  );
}

async function enableAnimationsDialog(list) {
  const newAnimationsByFolder = {};
  list.forEach(({ id, name, folder }) => {
    if (!newAnimationsByFolder[folder]) {
      newAnimationsByFolder[folder] = [{ id, name }];
    } else {
      newAnimationsByFolder[folder].push({ id, name });
    }
  });
  let animationsContent = "";
  for (const folder of Object.keys(newAnimationsByFolder)) {
    animationsContent += `<p><b>${folder}</b></p>${newAnimationsByFolder[folder].map((it) => it.name).join(" • ")}`;
  }

  const addNewAnimations = await foundry.applications.api.DialogV2.confirm({
    window: {
      title: "PF2E Specific Familiars - Enable New Animations",
      icon: "fas fa-webhook",
    },
    content: `<p>Do you want to enable the following new trigger animations?</p>${animationsContent}`,
    classes: ["pf2e-specific-familiars-enable-dialog"],
  });
  return addNewAnimations;
}

async function getNewAnimationData(askedAnimationsSet, enabledSet) {
  const path = "modules/pf2e-specific-familiars/animations.json";
  const animations = await foundry.utils.fetchJsonWithTimeout(path);
  const animationsMapped = animations.map((a) => ({
    id: a.id,
    name: a.name,
    folder: a.folder,
  }));

  return animationsMapped.filter(
    (a) => !enabledSet.has(a.id) && !askedAnimationsSet.has(a.id),
  );
}
export function registerSequencerPresets() {
  if (!game.modules.find(p=>p.id=="sequencer")?.active)
    return;
  // Sound
  Sequencer.Presets.add("specificFamiliarsSound", (sound, args) => {
    const radius =
      args?.radius ??
      Math.max(
        canvas?.scene?.width / canvas?.scene?.grid?.size,
        canvas?.scene?.height / canvas?.scene?.grid?.size,
      ) ??
      50;
    return sound
      .radius(radius)
      .alwaysForGMs(true)
      .panSound()
      .muffledEffect({ type: "lowpass", intensity: 4 });
  });
}