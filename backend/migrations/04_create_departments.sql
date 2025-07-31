-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extract and insert unique departments
INSERT INTO departments (name)
SELECT DISTINCT department 
FROM products
WHERE department IS NOT NULL AND department != ''
ON CONFLICT(name) DO NOTHING;

-- Create a new products table with the department_id and foreign key
CREATE TABLE products_new (
    id INTEGER PRIMARY KEY,
    cost REAL NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    retail_price REAL NOT NULL,
    sku TEXT NOT NULL,
    distribution_center_id INTEGER NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Copy data from old products table to new products table
INSERT INTO products_new (
    id, cost, category, name, brand, 
    retail_price, sku, distribution_center_id, department_id
)
SELECT 
    p.id, p.cost, p.category, p.name, p.brand, 
    p.retail_price, p.sku, p.distribution_center_id, d.id
FROM 
    products p
LEFT JOIN 
    departments d ON p.department = d.name;

-- Drop the old products table
DROP TABLE products;

-- Rename the new table to products
ALTER TABLE products_new RENAME TO products;
