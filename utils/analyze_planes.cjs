const fs = require('fs');
const path = require('path');

try {
    const rawData = fs.readFileSync(path.join(__dirname, '../src/assets/allDataPlanes.json'));
    const jsonData = JSON.parse(rawData);

    const setTypes = new Set();
    const setNames = new Set();
    const sets = new Set();
    const typeLines = new Set();

    jsonData.data.forEach(card => {
        if (card.set_type) setTypes.add(card.set_type);
        if (card.set_name) setNames.add(card.set_name);
        if (card.set) sets.add(card.set);
        if (card.type_line) typeLines.add(card.type_line);
    });

    const output = [];
    const log = (...args) => output.push(args.join(' '));

    log("Unique Set Types:", Array.from(setTypes));
    log("Unique Set Names:", Array.from(setNames).slice(0, 20)); // Limit output
    log("Unique Sets:", Array.from(sets));
    // log("Unique Type Lines:", Array.from(typeLines));

    // Filter for "planechase" related
    const planechaseSetTypes = ['planechase'];
    const planechaseSets = ['hop', 'pc2', 'pca', 'opca'];

    const planechaseCards = jsonData.data.filter(c =>
        planechaseSetTypes.includes(c.set_type) ||
        planechaseSets.includes(c.set)
    );

    log("\n--- Analysis ---");
    log("Cards with set_type 'planechase':", jsonData.data.filter(c => c.set_type === 'planechase').length);
    log("Cards with specific Planechase set codes (hop, pc2, pca, opca):", planechaseCards.length);

    // Check if there are planes with 'plane' type but not in planechase sets
    const nonPlanechasePlanes = jsonData.data.filter(c =>
        c.type_line && c.type_line.includes('Plane') &&
        !planechaseSetTypes.includes(c.set_type) &&
        !planechaseSets.includes(c.set)
    );

    log("Planes NOT in Planechase sets:", nonPlanechasePlanes.length);
    if (nonPlanechasePlanes.length > 0) {
        log("Examples of non-Planechase planes:", JSON.stringify(nonPlanechasePlanes.slice(0, 5).map(c => `${c.name} (${c.set_name}, ${c.set_type})`), null, 2));
    }

    fs.writeFileSync(path.join(__dirname, 'analysis_output.txt'), output.join('\n'));

} catch (e) {
    console.error(e);
}
