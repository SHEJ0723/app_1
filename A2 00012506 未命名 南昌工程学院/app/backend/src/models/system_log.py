from models.base import db
from datetime import datetime

class SystemLog(db.Model):
    """系统操作日志模型"""
    __tablename__ = 'system_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(200), nullable=False, comment='操作内容')
    details = db.Column(db.Text, nullable=True, comment='详细信息')
    ip_address = db.Column(db.String(45), nullable=True, comment='IP地址')
    user_agent = db.Column(db.String(500), nullable=True, comment='用户代理')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    
    # 关联用户
    user = db.relationship('User', backref='system_logs')
    
    def __repr__(self):
        return f'<SystemLog {self.action}>'
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else '系统管理员',
            'action': self.action,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 