import sqlite3
import csv
import os

# Get absolute paths
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
DB_PATH = os.path.join(project_root, 'data', 'ecommerce.db')
CSV_PATH = os.path.join(project_root, 'data', 'raw', 'archive', 'products.csv')

print(f"Database path: {DB_PATH}")
print(f"CSV path: {CSV_PATH}")

# Create database connection
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Drop existing table if it exists
# cursor.execute('DROP TABLE IF EXISTS products')

# Create products table
cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    cost REAL NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    retail_price REAL NOT NULL,
    department TEXT NOT NULL,
    sku TEXT NOT NULL,
    distribution_center_id INTEGER NOT NULL
);
''')
conn.commit()

def load_products_data():
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        records = 0
        for row in reader:
            # Handle empty/missing values
            cost = float(row['cost']) if row['cost'] else 0.0
            retail_price = float(row['retail_price']) if row['retail_price'] else 0.0
            
            cursor.execute('''
            INSERT INTO products (
                id, cost, category, name, brand, 
                retail_price, department, sku, distribution_center_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                int(row['id']),
                cost,
                row['category'],
                row['name'],
                row['brand'],
                retail_price,
                row['department'],
                row['sku'],
                int(row['distribution_center_id'])
            ))
            records += 1
        conn.commit()
        print(f"Successfully loaded {records} records")

if __name__ == "__main__":
    load_products_data()
    conn.close()