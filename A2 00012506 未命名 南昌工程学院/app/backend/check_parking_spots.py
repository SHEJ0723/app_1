#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
检查车位数据
"""

import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app
from models.parking_spot import ParkingSpot
from models import db

def check_parking_spots():
    """检查车位数据"""
    app = create_app()
    
    with app.app_context():
        # 检查所有车位
        spots = ParkingSpot.query.all()
        print(f"总车位数: {len(spots)}")
        
        # 按分区统计
        zones = ['A', 'B', 'C', 'D', 'E', 'F']
        for zone in zones:
            zone_spots = ParkingSpot.query.filter_by(zone=zone).all()
            print(f"\n{zone}区车位:")
            for spot in zone_spots:
                print(f"  {spot.spot_number}: {spot.type}车位, 状态:{spot.status}")
        
        # 按类型统计
        print(f"\n按类型统计:")
        types = ['普通', '大型', '新能源', '无障碍']
        for spot_type in types:
            type_spots = ParkingSpot.query.filter_by(type=spot_type).count()
            print(f"  {spot_type}车位: {type_spots}个")

if __name__ == '__main__':
    check_parking_spots() 