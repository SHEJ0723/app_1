#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
重置管理员密码
"""

import sys
import os

# 添加src目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
sys.path.insert(0, src_dir)

from app import create_app
from models.user import Admin
from models import db

def reset_admin_password():
    """重置管理员密码"""
    app = create_app()
    
    with app.app_context():
        admin = Admin.query.filter_by(employee_id='admin').first()
        if admin:
            # 设置新密码
            admin.set_password('admin123')
            db.session.commit()
            print("管理员密码已重置为: admin123")
        else:
            print("未找到管理员账户")

if __name__ == '__main__':
    reset_admin_password() 