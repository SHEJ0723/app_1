from datetime import datetime
from .base import db

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    spot_id = db.Column(db.Integer, nullable=False, index=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='未支付')  # 已完成/未支付/已取消
    amount = db.Column(db.Float, nullable=False, default=0.0)
    pay_method = db.Column(db.String(20), nullable=True)  # 支付方式：支付宝/微信
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'spot_id': self.spot_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'amount': self.amount,
            'pay_method': self.pay_method,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 