const sharp = require('sharp');
const path = require('path');

async function mergeImages() {
    try {
        const layer1 = path.join(__dirname, 'harvest3.png');
        const layer2 = path.join(__dirname, 'havest2.png');
        const layer3 = path.join(__dirname, 'harvest1.png');
        const output = path.join(__dirname, 'harvest-bot-merged.png');

        // Get dimensions from first image
        const metadata = await sharp(layer1).metadata();

        // Create composite with all layers
        await sharp(layer1)
            .composite([
                { input: layer2, blend: 'over' },
                { input: layer3, blend: 'over' }
            ])
            .png()
            .toFile(output);

        console.log('✅ Images merged successfully!');
        console.log('📁 Output: harvest-bot-merged.png');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

mergeImages();
