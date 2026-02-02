const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'product_data_swagger.md');
const wwwrootPath = path.join(__dirname, 'wwwroot');
const outputPath = path.join(__dirname, 'verification.html');

try {
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const regex = /```json([\s\S]*?)```/g;
    let match;
    const products = [];

    while ((match = regex.exec(mdContent)) !== null) {
        try {
            const jsonStr = match[1];
            // Sanitize JSON string if necessary (sometimes markdown has comments or weird chars, but here it looks clean)
            const product = JSON.parse(jsonStr);
            products.push(product);
        } catch (e) {
            console.error('Failed to parse JSON block:', e);
        }
    }

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            img { max-width: 200px; max-height: 200px; }
        </style>
    </head>
    <body>
        <h1>Product Color Verification</h1>
        <p>Total Products: ${products.length}</p>
        <table>
            <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Current Color</th>
                <th>Image Path</th>
                <th>Image</th>
            </tr>
    `;

    products.forEach((p, index) => {
        const name = p.name || 'Unknown';
        const color = p.variants && p.variants.length > 0 ? p.variants[0].color : 'N/A';
        const relativeUrl = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : '';
        // Convert /images/... to absolute file path for local browser viewing
        // file:///d:/vastra-ecommerce/vastra-ecommerce/wwwroot/images/...
        // But for browser subagent, a file protocol URL is best.

        let localPath = '';
        if (relativeUrl) {
            // Remove leading slash if present to join correctly
            const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
            localPath = path.join(wwwrootPath, cleanUrl);
        }

        html += `
            <tr id="row-${index}">
                <td>${index + 1}</td>
                <td class="name">${name}</td>
                <td class="color">${color}</td>
                <td class="path">${localPath}</td>
                <td>
                    <img src="file:///${localPath.replace(/\\/g, '/')}" alt="${name}">
                </td>
            </tr>
        `;
    });

    html += `
        </table>
    </body>
    </html>
    `;

    fs.writeFileSync(outputPath, html);
    console.log(`Successfully generated ${outputPath} with ${products.length} products.`);

} catch (err) {
    console.error('Error:', err);
}
