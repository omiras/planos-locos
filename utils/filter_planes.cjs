const fs = require('fs');
const path = require('path');

const PLANES_FILE = path.join(__dirname, '../src/assets/planes.json');
const ALL_DATA_FILE = path.join(__dirname, '../src/assets/allDataPlanes.json');

try {
    const planesRaw = fs.readFileSync(PLANES_FILE, 'utf8');
    const allDataRaw = fs.readFileSync(ALL_DATA_FILE, 'utf8');

    const planes = JSON.parse(planesRaw);
    const allData = JSON.parse(allDataRaw);

    // Create map for fast lookup
    const allDataMap = new Map();
    allData.data.forEach(card => {
        allDataMap.set(card.id, card);
    });

    console.log(`Initial planes count: ${planes.length}`);

    const seenNames = new Set();
    const filteredPlanes = planes.filter(plane => {
        const data = allDataMap.get(plane.id);

        if (!data) {
            console.warn(`Warning: Plane with ID ${plane.id} (${plane.name}) not found in allDataPlanes.json. Removing.`);
            return false;
        }

        // 1. Check for duplicates by name
        if (seenNames.has(plane.name)) {
            // console.log(`Duplicate removed: ${plane.name}`);
            return false;
        }
        seenNames.add(plane.name);

        // 2. Exclude set_type="funny"
        if (data.set_type === 'funny') {
            return false;
        }

        // 3. Exclude oracle_text containing "planar deck"
        if (data.oracle_text && data.oracle_text.toLowerCase().includes('planar deck')) {
            return false;
        }

        return true;
    });

    console.log(`Filtered planes count: ${filteredPlanes.length}`);
    console.log(`Removed ${planes.length - filteredPlanes.length} planes (includes duplicates and filtered).`);

    // Write back to planes.json
    fs.writeFileSync(PLANES_FILE, JSON.stringify(filteredPlanes, null, 2));
    console.log(`Successfully updated ${PLANES_FILE}`);

} catch (e) {
    console.error('Error processing files:', e);
}
