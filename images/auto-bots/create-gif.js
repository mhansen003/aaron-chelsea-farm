const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createAnimatedGif() {
    try {
        // Image paths in animation order
        const frames = [
            path.join(__dirname, 'harvest1.png'),
            path.join(__dirname, 'havest2.png'),
            path.join(__dirname, 'harvest3.png'),
            path.join(__dirname, 'havest2.png'), // Back to middle
        ];

        // Load first image to get dimensions
        const firstImage = await loadImage(frames[0]);
        const width = firstImage.width;
        const height = firstImage.height;

        // Create encoder
        const encoder = new GIFEncoder(width, height);
        const outputPath = path.join(__dirname, 'harvest-bot-animated.gif');
        const stream = fs.createWriteStream(outputPath);

        encoder.createReadStream().pipe(stream);
        encoder.start();
        encoder.setRepeat(0);   // 0 = loop forever
        encoder.setDelay(200);  // 200ms between frames
        encoder.setQuality(10); // Best quality

        // Create canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Add each frame
        for (const framePath of frames) {
            const image = await loadImage(framePath);
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height);
            encoder.addFrame(ctx);
            console.log(`✓ Added frame: ${path.basename(framePath)}`);
        }

        encoder.finish();

        console.log('\n✅ Animated GIF created successfully!');
        console.log('📁 Output: harvest-bot-animated.gif');
        console.log('🎬 Frame count:', frames.length);
        console.log('⏱️  Frame delay: 200ms');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nTrying alternative method...');
    }
}

createAnimatedGif();
