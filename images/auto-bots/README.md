# Bot Animation Workspace

This folder is for experimenting with bot animations safely without affecting the main game.

## Files

- `plant-seeds-original.png` - The original bot image
- `animation-test.html` - Interactive test page to preview animations
- Layer files (you'll create these):
  - `plant-seeds-body.png` - Body without propellers/eye
  - `plant-seeds-propellers.png` - Just the propellers
  - `plant-seeds-eye.png` - Just the eye (optional)

## Quick Start

1. **Open the test page**: Double-click `animation-test.html` to open it in your browser
2. **See the preview**: Right now it shows the original bot with a simulated animation
3. **Create layers** (optional): Use an image editor to split the bot into layers
4. **Test with layers**: Save your layer files here and refresh the test page

## How to Create Layers

### Option 1: Use Photopea (Free Online Tool)
1. Go to https://www.photopea.com
2. Open `plant-seeds-original.png`
3. Use the selection tools to select just the propellers
4. Copy and paste to a new layer
5. Delete the propellers from the original layer
6. Export each layer as separate PNG files

### Option 2: Use GIMP (Free Desktop Software)
1. Open the image in GIMP
2. Use selection tools to isolate parts
3. Cut and paste to new layers
4. Export each layer separately

### Option 3: Use Paint.NET (Free, Windows)
1. Similar process to GIMP
2. Use magic wand or lasso to select regions
3. Copy to new layers and export

## Animation Features in Test Page

The test page lets you preview:
- ✅ Spinning propellers (adjustable speed)
- ✅ Blinking/changing eye colors
- ✅ Different eye color modes (green, blue, red, rainbow)
- ✅ Adjustable bot size

## Integration into Main Game

Once you're happy with the animations, we can integrate them into your main game by:
1. Copying the layer files to the appropriate location
2. Updating `Game.tsx` to load the layered images
3. Replacing the simple `drawImage` calls with animated versions

## Tips

- Keep all layers the SAME SIZE as the original
- Use transparent backgrounds (PNG format)
- The eye can be drawn with code instead of using an image layer
- Start simple - just split off the propellers first!
