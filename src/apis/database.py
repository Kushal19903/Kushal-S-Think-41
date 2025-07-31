import sqlite3
import os

def get_db_connection():
    """Create a database connection"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    db_path = os.path.join(project_root, 'data', 'ecommerce.db')
    
    return sqlite3.connect(db_path)