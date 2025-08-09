import pymysql
import os
from dotenv import load_dotenv
from models.parking_spot import ParkingSpot
from app import create_app
from models.base import db
from models.user import User
from models.license_plate import LicensePlate
from werkzeug.security import generate_password_hash
from datetime import datetime

# 加载环境变量
load_dotenv()

def init_database():
    """初始化数据库"""
    # 数据库连接参数
    db_params = {
        'host': 'localhost',
        'user': 'root',
        'password': 'hhazj0723',
        'port': 3306,
        'charset': 'utf8mb4',
        'use_unicode': True,
        'connect_timeout': 5
    }
    
    try:
        # 连接MySQL服务器
        conn = pymysql.connect(**db_params)
        cursor = conn.cursor()
        
        # 创建数据库
        cursor.execute("CREATE DATABASE IF NOT EXISTS parking_automation_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("数据库创建成功！")
        
        # 关闭连接
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"初始化数据库时出错: {str(e)}")
        raise e

def reset_parking_spots():
    """
    清空所有车位并批量插入60个新车位：
    A1-A10、B1-B10、C1-C10、D1-D10、E1-E10、F1-F10
    D1-D10为充电车位，C6-C10为大型车位，E1-E10为无障碍车位，F1-F10为新能源车位，其余为普通车位
    初始状态全部为“空闲”
    """
    from models.parking_spot import ParkingSpot
    from models.user import db
    db.session.query(ParkingSpot).delete()
    db.session.commit()

    spots = []
    # A1-A10 普通
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"A{i}",
            zone="A",
            type="普通",
            status="空闲",
            is_active=True,
            special_attribute=None
        ))
    # B1-B10 普通
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"B{i}",
            zone="B",
            type="普通",
            status="空闲",
            is_active=True,
            special_attribute=None
        ))
    # C1-C5 普通
    for i in range(1, 6):
        spots.append(ParkingSpot(
            spot_number=f"C{i}",
            zone="C",
            type="普通",
            status="空闲",
            is_active=True,
            special_attribute=None
        ))
    # C6-C10 大型
    for i in range(6, 11):
        spots.append(ParkingSpot(
            spot_number=f"C{i}",
            zone="C",
            type="大型",
            status="空闲",
            is_active=True,
            special_attribute="Large"
        ))
    # D1-D10 充电
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"D{i}",
            zone="D",
            type="新能源",
            status="空闲",
            is_active=True,
            special_attribute="Electric"
        ))
    # E1-E10 无障碍
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"E{i}",
            zone="E",
            type="无障碍",
            status="空闲",
            is_active=True,
            special_attribute="Wheelchair"
        ))
    # F1-F10 新能源
    for i in range(1, 11):
        spots.append(ParkingSpot(
            spot_number=f"F{i}",
            zone="F",
            type="新能源",
            status="空闲",
            is_active=True,
            special_attribute="Electric"
        ))
    db.session.bulk_save_objects(spots)
    db.session.commit()
    print("已重置并添加60个车位。")

if __name__ == '__main__':
    from src.app import create_app
    app = create_app()
    with app.app_context():
        reset_parking_spots() 