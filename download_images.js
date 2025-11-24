import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const planesPath = path.join(__dirname, 'src/assets/planes.json');
const allDataPath = path.join(__dirname, 'src/assets/allDataPlanes.json');
const imagesDir = path.join(__dirname, 'src/assets/images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Read JSON files
const planes = JSON.parse(fs.readFileSync(planesPath, 'utf8'));
const allData = JSON.parse(fs.readFileSync(allDataPath, 'utf8'));

// Helper to download image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

async function processPlanes() {
    console.log(`Processing ${planes.length} planes...`);
    let updatedCount = 0;
    let downloadCount = 0;

    for (const plane of planes) {
        // Find matching plane in allData to get the ID
        const match = allData.data.find(p => p.name === plane.name);

        if (match) {
            plane.id = match.id;
            updatedCount++;

            const imagePath = path.join(imagesDir, `${plane.id}.jpg`);

            // Download if it doesn't exist
            if (!fs.existsSync(imagePath)) {
                try {
                    console.log(`Downloading image for ${plane.name} (${plane.id})...`);
                    if (plane.artwork) {
                        await downloadImage(plane.artwork, imagePath);
                        downloadCount++;
                    } else {
                        console.warn(`No artwork URL for ${plane.name}`);
                    }
                } catch (error) {
                    console.error(`Failed to download image for ${plane.name}:`, error.message);
                }
            }
        } else {
            console.warn(`Could not find ID for plane: ${plane.name}`);
        }
    }

    // Save updated planes.json
    fs.writeFileSync(planesPath, JSON.stringify(planes, null, 2));
    console.log(`Finished! Updated ${updatedCount} planes. Downloaded ${downloadCount} new images.`);
}

processPlanes();
