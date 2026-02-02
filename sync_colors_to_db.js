const fs = require('fs');
const path = require('path');

// Use native fetch (Node 18+)
// const fetch = ... (global)

const API_BASE_URL = 'http://localhost:5121/api';
const MD_PATH = path.join(__dirname, 'vastra-ecommerce', 'product_data_swagger.md');

// 1. Parse Markdown to get Map<Name, ProductJson>
function parseMarkdown() {
    const content = fs.readFileSync(MD_PATH, 'utf8');
    const regex = /```json([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        try {
            const json = JSON.parse(match[1]);
            matches.push(json);
        } catch (e) {
            console.error('Failed to parse JSON block', e);
        }
    }
    return matches;
}

// 2. Fetch all products from DB
async function fetchDbProducts() {
    const res = await fetch(`${API_BASE_URL}/Product?pageSize=1000`);
    const data = await res.json();
    return data.items || [];
}

// 3. Update Product
async function updateProduct(dbProduct, mdProduct) {
    // Construct the payload for PUT
    // We want to keep DB ID, but use MD variants (for colors)
    // We should probably keep DB images if they look valid, or MD images?
    // User specifically asked to "update colors".
    // AND "for what products we added in the frontend".

    // Strategy: Take DB product, replace Variants with MD Variants (which have new colors).
    // Ensure MD Variants don't have IDs so they are treated as new/updates?
    // The Controller REMOVES all variants and adds new ones. So we just send the list.

    // MD variants: { sku, size, color, stockQuantity, priceAdjustment }
    // DB variants: { id, sku, size, color... }

    // We map MD variants to the structure expected by CreateProductDto (which Update uses)
    const newVariants = mdProduct.variants.map(v => ({
        sku: v.sku,
        size: v.size,
        color: v.color, // The new color!
        stockQuantity: v.stockQuantity,
        priceAdjustment: v.priceAdjustment,
        material: v.material || 'Cotton' // Default if missing?
    }));

    // Payload matches CreateProductDto
    const payload = {
        name: dbProduct.name,
        description: dbProduct.description,
        basePrice: dbProduct.basePrice,
        isActive: dbProduct.isActive,
        categoryId: dbProduct.categoryId,
        imageUrls: dbProduct.images.map(i => i.imageUrl), // Keep DB images!
        variants: newVariants
    };

    const res = await fetch(`${API_BASE_URL}/Product/${dbProduct.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ...' // If needed? Controller says [Authorize(Roles = "Admin")]
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        // If 401, we need to login first.
        if (res.status === 401) {
            throw new Error('Unauthorized');
        }
        const text = await res.text();
        throw new Error(`Failed to update ${dbProduct.name}: ${res.status} ${text}`);
    } else {
        console.log(`Updated ${dbProduct.name}`);
    }
}

// Login to get token
let token = '';
async function login() {
    // Instructions say: admin@vastra.com / Admin@123
    const res = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@vastra.com', password: 'Admin@123' })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    token = data.token;
}

// Wrapper for fetch with auth
async function authenticatedFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
}

async function main() {
    try {
        console.log('Parsing MD...');
        const mdProducts = parseMarkdown();
        console.log(`Found ${mdProducts.length} products in MD.`);

        console.log('Logging in...');
        await login();

        console.log('Fetching DB Products...');
        // Need to use the authenticated fetch? GetAll is Public usually.
        // Controller: [HttpGet] public async Task<IActionResult> GetAll ... (No Authorize)
        const dbProducts = await fetchDbProducts();
        console.log(`Found ${dbProducts.length} products in DB.`);

        let updatedCount = 0;

        for (const mdP of mdProducts) {
            // Fuzzy match name? Or exact?
            // MD: "Vastra Men Kurta - Design 1"
            // DB: "Vastra Men Kurta - Design 1"
            const dbP = dbProducts.find(p => p.name === mdP.name);

            if (dbP) {
                // Check if color update is needed?
                // For simplicity, just update all matched products.

                // We need to use authenticatedFetch for PUT
                // Override the fetch in updateProduct to use token
                const newVariants = mdP.variants.map(v => ({
                    sku: v.sku,
                    size: v.size,
                    color: v.color,
                    stockQuantity: v.stockQuantity,
                    priceAdjustment: v.priceAdjustment,
                    material: v.material
                }));

                const payload = {
                    name: dbP.name,
                    description: dbP.description,
                    basePrice: dbP.basePrice,
                    isActive: dbP.isActive,
                    categoryId: dbP.categoryId,
                    imageUrls: dbP.images.map(i => i.imageUrl),
                    variants: newVariants
                };

                const res = await fetch(`${API_BASE_URL}/Product/${dbP.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    console.log(`Updated: ${dbP.name}`);
                    updatedCount++;
                } else {
                    const txt = await res.text();
                    console.error(`Failed: ${dbP.name} - ${txt}`);
                }
            } else {
                console.log(`Skipped (Not in DB): ${mdP.name}`);
            }
        }
        console.log(`\nFinished. Updated ${updatedCount} products.`);

    } catch (e) {
        console.error(e);
    }
}

main();
