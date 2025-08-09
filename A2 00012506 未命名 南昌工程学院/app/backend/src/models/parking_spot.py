from datetime import datetime
from .base import db

class ParkingSpot(db.Model):
    """停车位模型"""
    __tablename__ = 'parking_spots'

    id = db.Column(db.Integer, primary_key=True)
    spot_number = db.Column(db.String(10), unique=True, nullable=False, index=True)  # 车位号
    zone = db.Column(db.String(20), nullable=False)  # 分区
    type = db.Column(db.String(20), nullable=False)  # 类型（普通、新能源、无障碍等）
    status = db.Column(db.String(20), nullable=False, default='空闲')  # 状态（空闲、占用、维修等）
    is_active = db.Column(db.Boolean, default=True)  # 是否启用
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    special_attribute = db.Column(db.String(50), nullable=True)  # 特殊属性（如Electric, Wheelchair等）
    coordinates = db.Column(db.String(10), nullable=True)  # 网格坐标（如1-1, 2-2等）

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'spot_number': self.spot_number,
            'zone': self.zone,
            'type': self.type,
            'status': self.status,
            'is_active': self.is_active,
            'special_attribute': self.special_attribute,
            'coordinates': self.coordinates,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<ParkingSpot {self.spot_number}>' 