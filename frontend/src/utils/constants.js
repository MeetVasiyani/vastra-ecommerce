export const VASTRA_COLORS = [
    { name: 'Purple', hex: '#800080' },
    { name: 'Dark Purple', hex: '#301934' },
    { name: 'Dark Blue', hex: '#00008B' },
    { name: 'Dark Green', hex: '#006400' },
    { name: 'Red', hex: '#8B0000' },
    { name: 'Green', hex: '#008000' },
    { name: 'Cream', hex: '#FFFDD0' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Pinkish Orange', hex: '#FF9966' },
    { name: 'Light Turquoise', hex: '#AFEEEE' },
    { name: 'Dark Pink', hex: '#AA336A' },
    { name: 'Off-White', hex: '#FAF9F6' },
    { name: 'Light Blue', hex: '#ADD8E6' },
    { name: 'Light Pink', hex: '#FFB6C1' },
    { name: 'Dark Red', hex: '#8B0000' },
    { name: 'Gold', hex: '#D4AF37' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Teal', hex: '#008080' },

    { name: 'Purple Pink', hex: '#DA70D6' },
    { name: 'Purple + White', hex: 'linear-gradient(135deg, #800080 50%, #FFFFFF 50%)' },
    { name: 'Green + Red', hex: 'linear-gradient(135deg, #008000 50%, #8B0000 50%)' },
    { name: 'Dark Blue+ White', hex: 'linear-gradient(135deg, #00008B 50%, #FFFFFF 50%)' },
    { name: 'Dark Blue + Pink', hex: 'linear-gradient(135deg, #00008B 50%, #FFC0CB 50%)' },
    { name: 'Dark Blue + Orange', hex: 'linear-gradient(135deg, #00008B 50%, #FFA500 50%)' },
    { name: 'Dark Green + Golden', hex: 'linear-gradient(135deg, #006400 50%, #D4AF37 50%)' },
    { name: 'Maroon + Golden', hex: 'linear-gradient(135deg, #800000 50%, #D4AF37 50%)' },
    { name: 'Golden+Green+Beige', hex: 'linear-gradient(135deg, #D4AF37 33%, #008000 33%, #008000 66%, #F5F5DC 66%)' },
    { name: 'Teal + Golden', hex: 'linear-gradient(135deg, #008080 50%, #D4AF37 50%)' }
];

export const VASTRA_SIZES = [
    '24', '26', '28', '30', '32', '34', '36',
    'S', 'M', 'L', 'XL', 'Free'
];

export const getColorHex = (colorName) => {
    if (!colorName) return '#CCCCCC';
    const normalizedName = colorName.toLowerCase().replace(/\s+/g, '');
    const color = VASTRA_COLORS.find(c => c.name.toLowerCase().replace(/\s+/g, '') === normalizedName);
    return color ? color.hex : '#CCCCCC';
};
