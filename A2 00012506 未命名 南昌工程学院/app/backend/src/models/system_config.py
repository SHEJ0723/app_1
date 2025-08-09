from models.base import db
from datetime import datetime

class SystemConfig(db.Model):
    __tablename__ = 'system_config'
    id = db.Column(db.Integer, primary_key=True)
    fee_first = db.Column(db.Float, nullable=False, default=5)
    fee_next = db.Column(db.Float, nullable=False, default=2)
    fee_max = db.Column(db.Float, nullable=False, default=30)
    alarm_timeout = db.Column(db.Float, nullable=False, default=72)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'fee': {
                'first': self.fee_first,
                'next': self.fee_next,
                'max': self.fee_max
            },
            'alarm': {
                'timeout': self.alarm_timeout
            },
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 