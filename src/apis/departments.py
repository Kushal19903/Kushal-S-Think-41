from flask import Blueprint, jsonify, request
from .database import get_db_connection

departments_bp = Blueprint('departments', __name__)

@departments_bp.route('/departments')
def get_departments():
    """
    GET /api/departments - List all departments with product counts
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get departments with product counts
        cursor.execute("""
            SELECT 
                d.id,
                d.name,
                d.created_at,
                d.updated_at,
                COUNT(p.id) as product_count
            FROM departments d
            LEFT JOIN products p ON d.id = p.department_id
            GROUP BY d.id, d.name, d.created_at, d.updated_at
            ORDER BY d.name
        """)
        
        columns = [col[0] for col in cursor.description]
        departments_data = cursor.fetchall()
        
        departments = []
        for row in departments_data:
            dept_dict = dict(zip(columns, row))
            departments.append(dept_dict)
        
        return jsonify({
            "departments": departments,
            "count": len(departments)
        })
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@departments_bp.route('/departments/<int:department_id>')
def get_department(department_id):
    """
    GET /api/departments/{id} - Get specific department details
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get department with product count
        cursor.execute("""
            SELECT 
                d.id,
                d.name,
                d.created_at,
                d.updated_at,
                COUNT(p.id) as product_count
            FROM departments d
            LEFT JOIN products p ON d.id = p.department_id
            WHERE d.id = ?
            GROUP BY d.id, d.name, d.created_at, d.updated_at
        """, (department_id,))
        
        department_data = cursor.fetchone()
        
        if not department_data:
            return jsonify({"error": "Department not found"}), 404
        
        columns = [col[0] for col in cursor.description]
        department = dict(zip(columns, department_data))
        
        return jsonify(department)
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@departments_bp.route('/departments/<int:department_id>/products')
def get_department_products(department_id):
    """
    GET /api/departments/{id}/products - Get all products in a department
    """
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # First, verify department exists
        cursor.execute("SELECT id, name FROM departments WHERE id = ?", (department_id,))
        department = cursor.fetchone()
        
        if not department:
            return jsonify({"error": "Department not found"}), 404
            
        department_name = department[1]
        
        # Get products in this department with pagination
        cursor.execute("""
            SELECT 
                p.*,
                d.name as department_name
            FROM products p
            JOIN departments d ON p.department_id = d.id
            WHERE p.department_id = ?
            ORDER BY p.name
            LIMIT ? OFFSET ?
        """, (department_id, limit, offset))
        
        columns = [col[0] for col in cursor.description]
        products_data = cursor.fetchall()
        
        products = []
        for row in products_data:
            product_dict = dict(zip(columns, row))
            products.append(product_dict)
        
        # Get total count for pagination
        cursor.execute("SELECT COUNT(*) FROM products WHERE department_id = ?", (department_id,))
        total = cursor.fetchone()[0]
        
        if total == 0:
            return jsonify({
                "department": department_name,
                "department_id": department_id,
                "products": [],
                "message": "No products found in this department",
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": 0,
                    "total_pages": 0
                }
            })
        
        return jsonify({
            "department": department_name,
            "department_id": department_id,
            "products": products,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()
