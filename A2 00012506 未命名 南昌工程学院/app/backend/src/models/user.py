from datetime import datetime
from .base import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(11), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True)
    avatar_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')  # active, disabled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # 车牌信息（一对多关系）
    license_plates = db.relationship('LicensePlate', backref='owner', lazy=True)
    
    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """更新最后登录时间"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'phone': self.phone,
            'name': self.name,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def __repr__(self):
        return f'<User {self.phone}>'

class Admin(db.Model):
    """管理员模型"""
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(10), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.String(20), nullable=False)  # super_admin, admin, operator
    department = db.Column(db.String(50))
    status = db.Column(db.String(20), default='active')  # active, disabled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """更新最后登录时间"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def __repr__(self):
        return f'<Admin {self.employee_id}>'

class LicensePlate(db.Model):
    """车牌信息模型"""
    __tablename__ = 'license_plates'

    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(10), unique=True, nullable=False, index=True)
    vehicle_type = db.Column(db.String(20), nullable=False)  # car, motorcycle, truck
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='active')  # active, disabled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'plate_number': self.plate_number,
            'vehicle_type': self.vehicle_type,
            'user_id': self.user_id,
            'is_default': self.is_default,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<LicensePlate {self.plate_number}>' 
        return f'<Admin {self.employee_id}>' 