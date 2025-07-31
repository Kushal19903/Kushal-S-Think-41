
from flask import Blueprint, jsonify, request
from models.product import Product
from models.department import Department
from database import db

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 12, type=int)
    
    # Get products with department info
    products = Product.query\
        .join(Department)\
        .paginate(page=page, per_page=limit)
    
    return jsonify({
        'data': [p.to_dict() for p in products.items],
        'pagination': {
            'page': products.page,
            'total_pages': products.pages,
            'total_items': products.total
        }
    })

@products_bp.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.to_dict())

# Add department routes
@products_bp.route('/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments])