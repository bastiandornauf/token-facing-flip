# Token Facing Flip

A lightweight Foundry VTT module that gives 2D tokens a sense of direction without rotating them.

## Why?

Many character portraits and token artworks are designed to face either left or right. 
On top-down maps, rotating these tokens often looks unnatural, especially when using illustrated character art instead of traditional top-down tokens.

Token Facing Flip provides a simple alternative:

- Moving left makes a token face left.
- Moving right makes a token face right.
- Moving up or down keeps the current facing direction.
- Tokens remain upright and are never rotated.

This creates a stronger sense of orientation and can make scenes feel more alive. 

Characters can appear to look at each other during conversations, face opponents during encounters, or simply feel more grounded in the world without requiring complex animation systems.


## Features

- Automatic left/right facing based on horizontal movement
- Keeps tokens upright by preventing rotation
- Manual token flip hotkey
- Per-token default facing direction for artwork that naturally faces left
- Lightweight and easy to understand

## Default Hotkeys

- Ctrl + F — Flip selected token(s)
- Ctrl + B — Toggle the default facing direction of selected token(s)

## How It Works

The module uses horizontal movement to determine a token's facing direction.

- Move right → face right
- Move left → face left
- Move up/down → keep current facing

For artwork that naturally faces left instead of right, use the default facing toggle once. The module will remember that preference for the token and automatically apply the correct orientation in the future.

## Compatibility

Developed and tested for Foundry VTT V13.

## Design Goals

This module is intentionally minimalistic.

Token Facing Flip is intentionally minimal. It does one thing: give 2D tokens a sense of direction without rotation. The module aims to be lightweight, predictable, and unobtrusive while adding a small but meaningful layer of immersion to the map.
