const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'product_data_swagger.md');

const newColors = [
    // Men Kurtas
    "purple",
    "dark purple",
    "dark blue",
    "dark green",
    "red",
    // Sherwanis
    "purple + white",
    "green + red",
    "dark blue+ white",
    "green",
    "maroon",
    // Nehru Jackets
    "cream",
    "red",
    "green",
    "dark blue",
    "green",
    // Anarkalis
    "turquoise",
    "white",
    "dark blue",
    "maroon",
    "dark green",
    // Lehengas
    "dark blue + pink",
    "dark blue + orange",
    "dark green + golden",
    "maroon + golden",
    "golden+green+beige",
    // Kurtis
    "Pinkish Orange",
    "dark blue",
    "light turquoise",
    "dark pink",
    "dark blue",
    // Kurta Sets
    "off-white",
    "light blue",
    "light pink", // Fixed typo "llight"
    "teal + golden",
    "purple pink",
    // Sarees
    "off white",
    "dark green",
    "dark blue",
    "dark purple",
    "dark blue + orange",
    // Boys Ethnic
    "dark red",
    "dark blue",
    "gold", // Fixed typo "golde"
    "yellow",
    "dark red",
    // Girls Ethnic
    "dark red",
    "blue",
    "dark green",
    "yellow",
    "purple" // Fixed typo "puple"
];

try {
    let mdContent = fs.readFileSync(mdPath, 'utf8');
    const regex = /```json([\s\S]*?)```/g;

    let productIndex = 0;

    const updatedContent = mdContent.replace(regex, (match, jsonStr) => {
        if (productIndex >= newColors.length) {
            return match; // Should not happen if counts match
        }

        const newColor = newColors[productIndex];

        try {
            // We want to replace "color": "OldColor" with "color": "NewColor"
            // We can do this with a simple regex on the json string
            // Be careful not to replace other keys, but "color" keys are specific in this file

            // Using a strictly targeted regex for the "color" property
            const updatedJsonStr = jsonStr.replace(/"color":\s*"[^"]*"/g, `"color": "${newColor}"`);

            productIndex++;
            return '```json' + updatedJsonStr + '```';
        } catch (e) {
            console.error(`Error processing product index ${productIndex}:`, e);
            return match;
        }
    });

    if (productIndex !== newColors.length) {
        console.warn(`Warning: Expected to update ${newColors.length} products but found ${productIndex} JSON blocks.`);
    }

    fs.writeFileSync(mdPath, updatedContent, 'utf8');
    console.log('Successfully updated product colors in product_data_swagger.md');

} catch (err) {
    console.error('Error:', err);
}
