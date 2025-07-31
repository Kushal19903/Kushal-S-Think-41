from flask import Blueprint, jsonify, request
from .database import get_db_connection

products_bp = Blueprint('products', __name__)

@products_bp.route('/products')
def get_products():
    """List products with pagination"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get products
        cursor.execute("SELECT * FROM products LIMIT ? OFFSET ?", (limit, offset))
        products = cursor.fetchall()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM products")
        total = cursor.fetchone()[0]
        
        return jsonify({
            "data": [dict(zip([column[0] for column in cursor.description], product)) 
                    for product in products],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        })
    finally:
        conn.close()

@products_bp.route('/products/<int:product_id>')
def get_product(product_id):
    """Get a specific product by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"error": "Product not found"}), 404
            
        return jsonify(dict(zip([column[0] for column in cursor.description], product)))
    finally:
        conn.close()