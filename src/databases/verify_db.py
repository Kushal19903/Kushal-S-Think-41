import sqlite3
import os

# Get absolute path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
DB_PATH = os.path.join(project_root, 'data', 'ecommerce.db')

print(f"Database path: {DB_PATH}")

def verify_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get record count
    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]
    print(f"Total products loaded: {count}")
    
    if count > 0:
        # Get sample record
        cursor.execute("SELECT * FROM products LIMIT 1")
        sample = cursor.fetchone()
        print("\nSample record:")
        print(f"ID: {sample[0]}")
        print(f"Name: {sample[3]}")
        print(f"Brand: {sample[4]}")
        print(f"Price: ${sample[5]:.2f}")
        print(f"Department: {sample[6]}")
    else:
        print("\nNo records found in database")
    
    conn.close()

if __name__ == "__main__":
    verify_data()