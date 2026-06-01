/**
 * Token Facing Flip
 * Automatically flips token artwork based on horizontal movement.
 * Foundry VTT v13+
 */

const MODULE_ID = "token-facing-flip";

// -----------------------------------------------------------------------------
// Keybindings
// -----------------------------------------------------------------------------

Hooks.once("init", () => {
  game.keybindings.register(MODULE_ID, "flipSelectedTokens", {
    name: "Flip selected tokens horizontally",
    hint: "Temporarily mirrors the selected token artwork left/right.",
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

// -----------------------------------------------------------------------------
// Automatic token facing
// -----------------------------------------------------------------------------

Hooks.on("updateToken", async (tokenDoc, changes, options, userId) => {
  if (options?.[MODULE_ID]?.skip) return;

  const activeGM = game.users.activeGM;
  if (!activeGM) return;
  if (game.user.id !== activeGM.id) return;

  const movedHorizontally = changes.x !== undefined;
  const changedRotation = changes.rotation !== undefined;

  if (!movedHorizontally && !changedRotation) return;

  const updates = {};

  if ((tokenDoc.rotation ?? 0) !== 0 || changedRotation) {
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

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

async function flipSelectedTokens() {
  const tokens = canvas.tokens?.controlled ?? [];

  if (!tokens.length) {
    // TODO: Move user-facing strings to localization files.
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

async function toggleBaseFacingForSelectedTokens() {
  const tokens = canvas.tokens?.controlled ?? [];

  if (!tokens.length) {
    // TODO: Move user-facing strings to localization files.
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

  // TODO: Move user-facing strings to localization files.
  ui.notifications.info("Default facing direction updated for selected token(s).");
}