#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
from pathlib import Path

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app
from models.base import db
from models.user import User, Admin
from models.parking_spot import ParkingSpot
from models.system_config import SystemConfig
from werkzeug.security import generate_password_hash
from datetime import datetime

def init_database():
    """初始化数据库"""
    app = create_app()
    
    with app.app_context():
        # 创建所有表
        print("🔄 正在创建数据库表...")
        db.create_all()
        print("✅ 数据库表创建完成")
        
        # 初始化系统配置
        init_system_config()
        
        # 初始化停车位
        init_parking_spots()
        
        # 初始化管理员账户
        init_admin_accounts()
        
        # 初始化测试用户
        init_test_users()
        
        print("🎉 数据库初始化完成!")

def init_system_config():
    """初始化系统配置"""
    print("🔄 正在初始化系统配置...")
    
    # 检查是否已存在配置
    existing_config = SystemConfig.query.first()
    if existing_config:
        print("ℹ️ 系统配置已存在，跳过初始化")
        return
    
    # 创建默认配置
    config = SystemConfig(
        fee_first=5.0,      # 首小时费用
        fee_next=2.0,       # 后续每小时费用
        fee_max=30.0,       # 最高费用
        alarm_timeout=72.0   # 超时报警时间(小时)
    )
    
    db.session.add(config)
    db.session.commit()
    print("✅ 系统配置初始化完成")

def init_parking_spots():
    """初始化停车位"""
    print("🔄 正在初始化停车位...")
    
    # 检查是否已存在停车位
    existing_spots = ParkingSpot.query.count()
    if existing_spots > 0:
        print(f"ℹ️ 已存在 {existing_spots} 个停车位，跳过初始化")
        return
    
    spots = []
    
    # A1-A10 普通车位
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"A{i}",
            zone="A",
            type="普通",
            status="空闲",
            is_active=True,
            special_attribute=None,
            coordinates=f"1-{i}"
        ))
    
    # B1-B10 普通车位
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"B{i}",
            zone="B",
            type="普通",
            status="空闲",
            is_active=True,
            special_attribute=None,
            coordinates=f"2-{i}"
        ))
    
    # C1-C5 普通车位
    for i in range(1, 6):
        spots.append(ParkingSpot(
            spot_number=f"C{i}",
            zone="C",
            type="普通",
            status="空闲",
            is_active=True,
            special_attribute=None,
            coordinates=f"3-{i}"
        ))
    
    # C6-C10 大型车位
    for i in range(6, 11):
        spots.append(ParkingSpot(
            spot_number=f"C{i}",
            zone="C",
            type="大型",
            status="空闲",
            is_active=True,
            special_attribute="Large",
            coordinates=f"3-{i}"
        ))
    
    # D1-D10 充电车位
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"D{i}",
            zone="D",
            type="新能源",
            status="空闲",
            is_active=True,
            special_attribute="Electric",
            coordinates=f"4-{i}"
        ))
    
    # E1-E10 无障碍车位
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"E{i}",
            zone="E",
            type="无障碍",
            status="空闲",
            is_active=True,
            special_attribute="Wheelchair",
            coordinates=f"5-{i}"
        ))
    
    # F1-F10 新能源车位
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"F{i}",
            zone="F",
            type="新能源",
            status="空闲",
            is_active=True,
            special_attribute="Electric",
            coordinates=f"6-{i}"
        ))
    
    db.session.bulk_save_objects(spots)
    db.session.commit()
    print(f"✅ 已创建 {len(spots)} 个停车位")

def init_admin_accounts():
    """初始化管理员账户"""
    print("🔄 正在初始化管理员账户...")
    
    # 检查是否已存在管理员
    existing_admin = Admin.query.first()
    if existing_admin:
        print("ℹ️ 管理员账户已存在，跳过初始化")
        return
    
    # 创建超级管理员
    super_admin = Admin(
        employee_id="ADMIN001",
        password_hash=generate_password_hash("admin123"),
        name="系统管理员",
        email="admin@parking.com",
        role="super_admin",
        department="系统管理部",
        status="active"
    )
    
    # 创建普通管理员
    admin = Admin(
        employee_id="ADMIN002",
        password_hash=generate_password_hash("admin123"),
        name="停车场管理员",
        email="manager@parking.com",
        role="admin",
        department="停车场管理部",
        status="active"
    )
    
    # 创建操作员
    operator = Admin(
        employee_id="OPER001",
        password_hash=generate_password_hash("operator123"),
        name="停车场操作员",
        email="operator@parking.com",
        role="operator",
        department="停车场运营部",
        status="active"
    )
    
    db.session.add_all([super_admin, admin, operator])
    db.session.commit()
    print("✅ 管理员账户初始化完成")
    print("📋 默认账户信息:")
    print("   超级管理员: ADMIN001 / admin123")
    print("   管理员: ADMIN002 / admin123")
    print("   操作员: OPER001 / operator123")

def init_test_users():
    """初始化测试用户"""
    print("🔄 正在初始化测试用户...")
    
    # 检查是否已存在用户
    existing_users = User.query.count()
    if existing_users > 0:
        print(f"ℹ️ 已存在 {existing_users} 个用户，跳过初始化")
        return
    
    # 创建测试用户
    test_users = [
        {
            'phone': '13800138001',
            'name': '张三',
            'email': 'zhangsan@example.com',
            'password': 'user123'
        },
        {
            'phone': '13800138002',
            'name': '李四',
            'email': 'lisi@example.com',
            'password': 'user123'
        },
        {
            'phone': '13800138003',
            'name': '王五',
            'email': 'wangwu@example.com',
            'password': 'user123'
        }
    ]
    
    users = []
    for user_data in test_users:
        user = User(
            phone=user_data['phone'],
            name=user_data['name'],
            email=user_data['email'],
            password_hash=generate_password_hash(user_data['password']),
            status='active'
        )
        users.append(user)
    
    db.session.add_all(users)
    db.session.commit()
    print(f"✅ 已创建 {len(users)} 个测试用户")
    print("📋 测试用户信息:")
    for i, user_data in enumerate(test_users, 1):
        print(f"   用户{i}: {user_data['phone']} / {user_data['password']}")

def reset_database():
    """重置数据库（危险操作）"""
    print("⚠️ 警告: 这将删除所有数据!")
    confirm = input("确认要重置数据库吗? (输入 'YES' 确认): ")
    
    if confirm != "YES":
        print("❌ 操作已取消")
        return
    
    app = create_app()
    with app.app_context():
        print("🔄 正在删除所有表...")
        db.drop_all()
        print("🔄 正在重新创建表...")
        db.create_all()
        print("✅ 数据库重置完成")
        
        # 重新初始化
        init_system_config()
        init_parking_spots()
        init_admin_accounts()
        init_test_users()
        
        print("🎉 数据库重置并重新初始化完成!")

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python init_database.py init    # 初始化数据库")
        print("  python init_database.py reset   # 重置数据库")
        return
    
    command = sys.argv[1]
    
    if command == "init":
        init_database()
    elif command == "reset":
        reset_database()
    else:
        print(f"❌ 未知命令: {command}")

if __name__ == "__main__":
    main() 