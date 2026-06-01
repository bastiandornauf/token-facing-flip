const MODULE_ID = "token-facing-flip";

// -----------------------------
// Keybindings registrieren
//
// - Strg + F: Ausgewählte Token horizontal spiegeln
// - Strg + B: Token-Basis-Ausrichtung wechseln (rechts/links)  
//
// bei Problemen mit Browser Search (Strg-F) können die Keybindings angepasst oder deaktiviert werden.
//
// -----------------------------

Hooks.once("init", () => {
  game.keybindings.register(MODULE_ID, "flipSelectedTokens", {
    name: "Flip selected tokens horizontally",
    hint: "Mirrors the selected token artwork left/right.",
    editable: [{ key: "KeyF", modifiers: ["Control"] }],
    restricted: false,
    onDown: () => {
      flipSelectedTokens();
      return true;
    }
  });
  

  game.keybindings.register(MODULE_ID, "toggleBaseFacing", {
    name: "Toggle token base facing",
    hint: "Sets whether the selected token artwork naturally faces right or left.",
    editable: [{ key: "KeyB", modifiers: ["Control"] }],
    restricted: false,
    onDown: () => {
      toggleBaseFacingForSelectedTokens();
      return true;
    }
  });
});


// -----------------------------  
// Token-Update überwachen und bei Bewegung oder Rotation automatisch spiegeln
// -----------------------------

Hooks.on("updateToken", async (tokenDoc, changes, options, userId) => {
  if (options?.[MODULE_ID]?.skip) return;

  const activeGM = game.users.activeGM;
  if (!activeGM || game.user.id !== activeGM.id) return;

  const movedHorizontally = Object.hasOwn(changes, "x");
  const changedRotation = Object.hasOwn(changes, "rotation");

  if (!movedHorizontally && !changedRotation) return;

  const updates = {};

  if ((tokenDoc.rotation ?? 0) !== 0 || changes.rotation !== undefined) {
    updates.rotation = 0;
  }

  if (movedHorizontally) {
    const oldX = tokenDoc.x;
    const newX = changes.x;

    if (newX !== oldX) {
      const baseFacing = tokenDoc.getFlag(MODULE_ID, "baseFacing") ?? 1;
      const desiredScaleX = newX < oldX ? -baseFacing : baseFacing;
      const currentScaleX = tokenDoc.texture?.scaleX ?? 1;

      if (currentScaleX !== desiredScaleX) {
        updates["texture.scaleX"] = desiredScaleX;
      }
    }
  }

  if (!Object.keys(updates).length) return;

  await tokenDoc.update(updates, {
    [MODULE_ID]: { skip: true },
    animate: false
  });
});

// ------------------------------
// Funktionen zum Spiegeln und Umschalten der Basis-Ausrichtung
// -----------------------------


async function flipSelectedTokens() {
  const tokens = canvas.tokens?.controlled ?? [];

  if (!tokens.length) {
    ui.notifications.warn("No token selected.");
    return;
  }

  const updates = tokens.map(token => ({
    _id: token.document.id,
    "texture.scaleX": (token.document.texture?.scaleX ?? 1) * -1,
    rotation: 0
  }));

  await canvas.scene.updateEmbeddedDocuments("Token", updates, {
    [MODULE_ID]: { skip: true },
    animate: false
  });
}

// -----------------
// Umschalten der Basis-Ausrichtung (rechts/links) für die ausgewählten Token
// Dies beeinflusst, ob das Token standardmäßig nach rechts (1) oder links (-1) ausgerichtet ist, was wiederum die Richtung bestimmt, in die es sich bewegt, wenn es horizontal gespiegelt wird.
// -----------------

async function toggleBaseFacingForSelectedTokens() {
  const tokens = canvas.tokens?.controlled ?? [];

  if (!tokens.length) {
    ui.notifications.warn("No token selected.");
    return;
  }

  const updates = tokens.map(token => {
    const currentBaseFacing = token.document.getFlag(MODULE_ID, "baseFacing") ?? 1;
    const nextBaseFacing = currentBaseFacing === 1 ? -1 : 1;

    return {
      _id: token.document.id,
      [`flags.${MODULE_ID}.baseFacing`]: nextBaseFacing,
      rotation: 0
    };
  });

  await canvas.scene.updateEmbeddedDocuments("Token", updates, {
    [MODULE_ID]: { skip: true },
    animate: false
  });

  ui.notifications.info("Token base facing toggled.");
}