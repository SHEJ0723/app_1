from datetime import datetime
from .base import db

class Bill(db.Model):
    __tablename__ = 'bills'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    order_id = db.Column(db.Integer, nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    pay_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='未支付')  # 已支付/未支付
    pay_method = db.Column(db.String(20), nullable=True)  # 支付方式：支付宝/微信
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'order_id': self.order_id,
            'amount': self.amount,
            'pay_time': self.pay_time.isoformat() if self.pay_time else None,
            'status': self.status,
            'pay_method': self.pay_method,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 