![](https://img.shields.io/badge/Foundry-v12-informational)
![](https://img.shields.io/badge/Foundry-v13-informational)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
![All Downloads](https://img.shields.io/github/downloads/Suldrun45/pf2e-specific-familiars/pf2e-specific-familiars.zip?color=5e0000&label=All%20Downloads)
![Latest Release Download Count](https://img.shields.io/github/downloads/Suldrun45/pf2e-specific-familiars/latest/pf2e-specific-familiars.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpf2e-specific-familiars&colorB=4aa94a)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->

# PF2e Specific Familiars - module handling specific familiars for Pathfinder 2e

- Adds a compendium with a series of Familiar Abilities defining each Specific Familiar
- Dragging one of these Abilities to a familiar actor will also add every other Familiar Ability granted to the familiar
- Candies for the Sweet Beasts familiars

### How to
When you add a Specific Familiar ability, the number of abilities required to get that specific familiar will be deducted from the Total # of familiar abilities on the familiar's sheet via a feat added to the master's sheet.  
If the familiar has automatic abilities (like Scent for the Corgi Mount for example), these will also be deducted from the Total # of familiar abilities.  
The module contains a macro that you can use while selecting the token of the master of the familiar to add or remove that feat to the master's sheet.  

If you use PF2e Dailies, this should allow it to show the right number dropdowns to select the remaining familiar abilities.

Install it with the manifest URL: 

https://github.com/Suldrun45/pf2e-specific-familiars/releases/latest/download/module.json
