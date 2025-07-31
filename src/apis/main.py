from flask import Flask, jsonify
from flask_cors import CORS
from .products import products_bp
from .departments import departments_bp

app = Flask(__name__)
CORS(app)

# Add root route
@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to Products & Departments API",
        "endpoints": {
            "products": "/api/products",
            "single_product": "/api/products/<id>",
            "departments": "/api/departments",
            "single_department": "/api/departments/<id>",
            "department_products": "/api/departments/<id>/products"
        }
    })

# Register blueprints
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(departments_bp, url_prefix='/api')

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)