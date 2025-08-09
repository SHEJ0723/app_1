from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import sys
import os

# 添加项目根目录到系统路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import Config
from models.user import db, User, Admin
from models.system_log import SystemLog
from models.system_config import SystemConfig
from app import create_app

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 初始化数据库
    db.init_app(app)
    
    # 初始化迁移
    migrate = Migrate(app, db)
    
    return app

def init_database():
    """初始化数据库表和默认数据"""
    app = create_app()
    
    with app.app_context():
        # 创建所有表
        db.create_all()
        
        # 初始化默认系统配置
        if not SystemConfig.query.first():
            default_config = SystemConfig()
            db.session.add(default_config)
            db.session.commit()
        
        # 升级orders表结构，添加start_time和end_time字段（如果不存在）
        from sqlalchemy import inspect
        import sqlite3
        conn = sqlite3.connect(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))
        cursor = conn.cursor()
        columns = [row[1] for row in cursor.execute("PRAGMA table_info(orders)").fetchall()]
        if 'start_time' not in columns:
            cursor.execute("ALTER TABLE orders ADD COLUMN start_time DATETIME")
        if 'end_time' not in columns:
            cursor.execute("ALTER TABLE orders ADD COLUMN end_time DATETIME")
        conn.commit()
        conn.close()
        
        # 升级feedbacks表结构（如不存在则创建）
        from sqlalchemy import inspect
        import sqlite3
        conn = sqlite3.connect(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS feedbacks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, content TEXT NOT NULL, created_at DATETIME, reply TEXT, reply_at DATETIME)")
        conn.commit()
        conn.close()
        
        # 检查是否已存在默认管理员
        admin = Admin.query.filter_by(employee_id='admin').first()
        if not admin:
            # 创建默认管理员账号
            default_admin = Admin(
                employee_id='admin',
                name='系统管理员',
                email='admin@example.com',
                role='super_admin',
                department='IT部门',
                status='active'
            )
            default_admin.set_password('Admin@123456')
            
            # 添加到数据库
            db.session.add(default_admin)
            db.session.commit()
            print("默认管理员账号创建成功！")
        else:
            print("默认管理员账号已存在")

if __name__ == '__main__':
    init_database() 