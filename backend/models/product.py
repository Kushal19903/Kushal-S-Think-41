from database import db

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(100))
    retail_price = db.Column(db.Float)
    cost = db.Column(db.Float)
    sku = db.Column(db.String(50))
    distribution_center_id = db.Column(db.Integer)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    category = db.Column(db.String(100))
    
    # Add relationship
    department = db.relationship('Department', backref='products')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'retail_price': self.retail_price,
            'cost': self.cost,
            'sku': self.sku,
            'distribution_center_id': self.distribution_center_id,
            'department': self.department.name if self.department else None,
            'department_id': self.department_id,
            'category': self.category
        }