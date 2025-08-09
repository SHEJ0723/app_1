from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

# 修改相对导入为绝对导入
from models import db
from routes.auth import auth_bp
from routes.parking import parking_bp
from routes.users import users_bp
from routes.chat import chat_bp
from routes.orders import orders_bp
from routes.bills import bills_bp
from routes.statistics import statistics_bp
from routes.messages import messages_bp
from routes.license_plates import license_plates_bp
from routes.feedback import feedback_bp
from routes.system import system_bp
from utils.redis_client import init_redis
from config.config import DevelopmentConfig

def create_app():
    """创建Flask应用"""
    app = Flask(__name__)
    
    # 配置
    app.config.from_object(DevelopmentConfig)
    
    # 配置CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "X-Require-Role"],
            "expose_headers": ["Content-Type", "X-Total-Count"],
            "supports_credentials": True,
            "max_age": 600
        }
    }, supports_credentials=True)

    # 允许所有OPTIONS预检请求直接返回200
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            return ('', 200)
    
    # 设置Cookie的安全选项
    app.config.update(
        SESSION_COOKIE_SECURE=False,  # 开发环境设为False
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=timedelta(minutes=10)
    )
    
    # 初始化扩展
    jwt = JWTManager(app)  # JWT支持
    db.init_app(app)  # 数据库
    
    # 初始化Redis客户端
    with app.app_context():
        init_redis()
    
    # 注册蓝图
    app.register_blueprint(auth_bp)
    app.register_blueprint(parking_bp)  # 注册停车场管理路由
    app.register_blueprint(users_bp)  # 注册用户管理路由
    app.register_blueprint(chat_bp)  # 注册在线对话路由
    app.register_blueprint(orders_bp)
    app.register_blueprint(bills_bp)
    app.register_blueprint(statistics_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(license_plates_bp)  # 注册车牌管理路由
    app.register_blueprint(feedback_bp)  # 注册反馈管理路由
    app.register_blueprint(system_bp)  # 注册系统配置路由
    
    # 错误处理
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify(success=False, message="请求参数错误"), 400
        
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify(success=False, message="未授权访问"), 401
        
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify(success=False, message="禁止访问"), 403
        
    @app.errorhandler(404)
    def not_found(error):
        return jsonify(success=False, message="资源不存在"), 404
        
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify(success=False, message="服务器内部错误"), 500
    
    # JWT错误处理
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify(success=False, message="Token已过期"), 401
        
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify(success=False, message="无效的Token"), 401
        
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify(success=False, message="缺少Token"), 401
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
        
        # 如果没有管理员账号，创建默认管理员
        from models.user import Admin, User
        default_admin = Admin.query.filter_by(employee_id='admin').first()
        if not default_admin:
            default_admin = Admin(
                employee_id='admin',
                password_hash='',  # 先占位，后续 set_password 会覆盖
                name='系统管理员',
                role='super_admin',
                email='admin@example.com',
                department='系统管理部',
                status='active'
            )
            default_admin.set_password('Admin@123456')
            db.session.add(default_admin)
            db.session.commit()
            print("已创建默认管理员账号：")
            print("工号：admin")
            print("密码：Admin@123456")

        
        # 初始化停车位数据（如无则插入CSV数据）
        from models.parking_spot import ParkingSpot
        if ParkingSpot.query.count() == 0:
            csv_data = [
                ["A01","A","Standard","Occupied","NA","1-1"],
                ["A02","A","Standard","Available","NA","1-2"],
                ["A03","A","Disabled","Available","Wheelchair","1-3"],
                ["A04","A","Charging","Occupied","Electric","1-4"],
                ["B01","B","Standard","Reserved","NA","2-1"],
                ["B02","B","Standard","Available","NA","2-2"],
                ["C01","C","Truck","Available","Height:4.2m","3-1"],
                ["C02","C","Standard","Occupied","NA","3-2"],
                ["D01","D","Charging","Available","Electric","4-1"],
                ["D02","D","Disabled","Available","Wheelchair","4-2"],
            ]
            spots = []
            for row in csv_data:
                # 规范化类型
                type_map = {
                    'Standard': '普通',
                    'Charging': '新能源',
                    'Disabled': '无障碍',
                    'Truck': '大型'
                }
                # 规范化状态
                status_map = {
                    'Available': '空闲',
                    'Occupied': '已占用',
                    'Reserved': '已预约'
                }
                spot = ParkingSpot(
                    spot_number=row[0],
                    zone=row[1],
                    type=type_map.get(row[2], row[2]),
                    status=status_map.get(row[3], row[3]),
                    special_attribute=None if row[4] == "NA" else row[4],
                    coordinates=row[5],
                    is_active=True
                )
                spots.append(spot)
            db.session.add_all(spots)
            db.session.commit()
            print('已批量导入停车位数据')
    
    @app.route('/')
    def index():
        return jsonify(success=True, message='智慧园区停车场管理系统API服务')
    

    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True) 