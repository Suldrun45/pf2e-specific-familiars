import { MODULE_ID } from "./consts.js";

export function setupSettings() {
  game.settings.register(MODULE_ID, "last-migration", {
    name: "",
    hint: "",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });
}