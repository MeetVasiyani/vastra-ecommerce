// Using native fetch

async function getColors() {
    try {
        // Fetch all products (large page size)
        const response = await fetch('http://localhost:5121/api/Product?pageSize=1000');
        const data = await response.json();

        if (!data.items) {
            console.log('No items found or error structure:', data);
            return;
        }

        const productColors = [];
        data.items.forEach(p => {
            const colors = p.variants ? p.variants.map(v => v.color).join(', ') : 'No variants';
            productColors.push(`${p.name}: [${colors}]`);
        });

        console.log('--- PRODUCT COLORS ---');
        console.log(productColors.join('\n'));
    } catch (e) {
        console.error('Error fetching:', e);
    }
}

getColors();
