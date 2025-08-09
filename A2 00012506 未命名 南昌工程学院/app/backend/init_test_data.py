#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
初始化测试数据脚本
"""

import sys
import os

# 添加src目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
sys.path.insert(0, src_dir)

from app import create_app
from models.user import User
from models.order import Order
from models.bill import Bill
from models.parking_spot import ParkingSpot
from models import db
from datetime import datetime, timedelta
import random


def init_test_data():
    """初始化测试数据"""
    app = create_app()
    
    with app.app_context():
        # 清空现有数据
        print("清空现有数据...")
        Bill.query.delete()
        Order.query.delete()
        ParkingSpot.query.delete()
        
        # 获取现有用户
        users = User.query.all()
        if not users:
            print("没有找到用户，请先创建用户")
            return
        
        print(f"找到 {len(users)} 个用户")
        
        # 创建停车位数据（按分区）
        parking_spots = []
        
        def random_status():
            return random.choice(['空闲', '已占用', '已预约'])
        
        # A区：A1-A10，普通车位
        for i in range(1, 11):
            spot = ParkingSpot(
                spot_number=f"A{i}",
                zone='A',
                type='普通',
                status=random_status(),
                is_active=True,
                coordinates=f"A,{i}"
            )
            parking_spots.append(spot)
        
        # B区：B1-B10，普通车位
        for i in range(1, 11):
            spot = ParkingSpot(
                spot_number=f"B{i}",
                zone='B',
                type='普通',
                status=random_status(),
                is_active=True,
                coordinates=f"B,{i}"
            )
            parking_spots.append(spot)
        
        # C区：C1-C5，普通车位；C6-C10，大型车位
        for i in range(1, 6):
            spot = ParkingSpot(
                spot_number=f"C{i}",
                zone='C',
                type='普通',
                status=random_status(),
                is_active=True,
                coordinates=f"C,{i}"
            )
            parking_spots.append(spot)
        
        for i in range(6, 11):
            spot = ParkingSpot(
                spot_number=f"C{i}",
                zone='C',
                type='大型',
                status=random_status(),
                is_active=True,
                coordinates=f"C,{i}"
            )
            parking_spots.append(spot)
        
        # D区：D1-D10，新能源车位
        for i in range(1, 11):
            spot = ParkingSpot(
                spot_number=f"D{i}",
                zone='D',
                type='新能源',
                status=random_status(),
                is_active=True,
                coordinates=f"D,{i}"
            )
            parking_spots.append(spot)
        
        # E区：E1-E10，无障碍车位
        for i in range(1, 11):
            spot = ParkingSpot(
                spot_number=f"E{i}",
                zone='E',
                type='无障碍',
                status=random_status(),
                is_active=True,
                coordinates=f"E,{i}"
            )
            parking_spots.append(spot)
        
        # F区：F1-F10，新能源车位
        for i in range(1, 11):
            spot = ParkingSpot(
                spot_number=f"F{i}",
                zone='F',
                type='新能源',
                status=random_status(),
                is_active=True,
                coordinates=f"F,{i}"
            )
            parking_spots.append(spot)
        
        # 保存停车位
        db.session.add_all(parking_spots)
        db.session.commit()
        print(f"创建了 {len(parking_spots)} 个停车位")
        
        # 创建测试订单
        orders = []
        for i in range(50):  # 增加订单数量
            user = random.choice(users)
            spot = random.choice(parking_spots)
            
            # 随机生成时间
            start_time = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 24))
            end_time = start_time + timedelta(hours=random.randint(1, 8))
            
            # 计算金额（每小时10元）
            duration = (end_time - start_time).total_seconds() / 3600
            amount = round(duration * 10, 2)
            
            order = Order(
                user_id=user.id,
                spot_id=spot.id,
                start_time=start_time,
                end_time=end_time,
                status=random.choice(['已完成', '未支付', '已取消']),
                amount=amount,
                pay_method=random.choice(['支付宝', '微信', '银行卡', None])
            )
            orders.append(order)
        
        # 保存订单
        db.session.add_all(orders)
        db.session.commit()
        print(f"创建了 {len(orders)} 个订单")
        
        # 创建测试账单
        bills = []
        for order in orders:
            # 根据订单状态决定账单状态
            if order.status == '已完成':
                bill_status = '已支付'
                pay_time = order.end_time + timedelta(minutes=random.randint(1, 30))
            elif order.status == '未支付':
                bill_status = '未支付'
                pay_time = None
            else:  # 已取消
                bill_status = '已取消'
                pay_time = None
            
            bill = Bill(
                user_id=order.user_id,
                order_id=order.id,
                amount=order.amount,
                pay_time=pay_time,
                status=bill_status,
                pay_method=order.pay_method
            )
            bills.append(bill)
        
        # 保存账单
        db.session.add_all(bills)
        db.session.commit()
        print(f"创建了 {len(bills)} 个账单")
        
        # 统计信息
        paid_bills = len([b for b in bills if b.status == '已支付'])
        unpaid_bills = len([b for b in bills if b.status == '未支付'])
        cancelled_bills = len([b for b in bills if b.status == '已取消'])
        total_amount = sum(b.amount for b in bills)
        paid_amount = sum(b.amount for b in bills if b.status == '已支付')
        
        print(f"账单统计：已支付 {paid_bills}，未支付 {unpaid_bills}，已取消 {cancelled_bills}，总金额 {total_amount:.2f}，已收 {paid_amount:.2f}")

if __name__ == '__main__':
    init_test_data() 