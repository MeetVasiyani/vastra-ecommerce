import re
import json
import os

def extract_products(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find JSON blocks
    # Looking for ```json ... ``` blocks
    # We also need to capture the Category context.
    
    # Strategy: Split by lines, track current headers to identify Category.
    
    lines = content.split('\n')
    
    products = []
    
    current_category_name = None
    # We expect headers like "### Men Kurtas (Category ID: 13)"
    
    json_buffer = []
    in_json = False
    
    # Regex to Match Header
    # ### Men Kurtas (Category ID: 13)
    header_regex = re.compile(r'###\s+(.+?)\s+\(Category ID:\s+(\d+)\)')
    
    for line in lines:
        header_match = header_regex.match(line.strip())
        if header_match:
            current_category_name = header_match.group(1).strip()
            print(f"Found Category: {current_category_name}")
            continue

        if line.strip().startswith('```json'):
            in_json = True
            json_buffer = []
            continue
        
        if line.strip().startswith('```') and in_json:
            in_json = False
            json_str = '\n'.join(json_buffer)
            try:
                product_data = json.loads(json_str)
                # Inject mapped category name so Seeder knows where to put it
                # The JSON already has 'categoryId', but we want to be safe and use names for better readability in Seeder if needed,
                # or just trust the IDs. 
                # The user want "Add this data".
                # The markdown has "categoryId" inside the JSON.
                
                # However, the Seeder might need to create categories first?
                # The Implementation Plan says: "Seed Categories: Implement a static list... ensuring they match".
                
                # Let's add an extra field to the JSON for convenience: 'categoryNameFromMarkdown'
                if current_category_name:
                    product_data['categoryNameFromMarkdown'] = current_category_name
                    
                products.append(product_data)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                print(json_str)
            continue
            
        if in_json:
            json_buffer.append(line)

    return products

if __name__ == "__main__":
    md_file = "product_data_swagger.md"
    output_file = "products_seed.json"
    
    if not os.path.exists(md_file):
        print(f"File {md_file} not found.")
        exit(1)
        
    data = extract_products(md_file)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"Extracted {len(data)} products to {output_file}")
