from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.order import Order
from models.base import db

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    """获取订单列表"""
    user_id = get_jwt_identity()
    role = request.headers.get('X-Require-Role', 'user')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    query = Order.query
    if role != 'admin':
        query = query.filter_by(user_id=user_id)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    return jsonify({
        'success': True,
        'data': [o.to_dict() for o in orders],
        'total': total
    })

@orders_bp.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    """创建订单（支持用户端预约和管理端创建）"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        role = request.headers.get('X-Require-Role', 'user')
        
        # 用户端预约：使用当前登录用户ID
        # 管理端创建：使用传入的user_id
        if role == 'admin':
            order_user_id = data.get('user_id')
            if not order_user_id:
                return jsonify({'success': False, 'message': '管理端创建订单必须指定用户ID'}), 400
        else:
            order_user_id = user_id
        
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        spot_id = data.get('spot_id')
        
        if not start_time or not end_time:
            return jsonify({'success': False, 'message': '必须填写预约开始和结束时间'}), 400
        if not spot_id:
            return jsonify({'success': False, 'message': '必须选择停车位'}), 400
            
        # 将字符串时间转换为datetime对象
        from datetime import datetime
        try:
            if isinstance(start_time, str):
                start_time = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S')
            if isinstance(end_time, str):
                end_time = datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S')
        except ValueError as e:
            return jsonify({'success': False, 'message': f'时间格式错误: {str(e)}'}), 400
            
        if end_time <= start_time:
            return jsonify({'success': False, 'message': '结束时间必须晚于开始时间'}), 400
            
        # 检查停车位是否可用
        from models.parking_spot import ParkingSpot
        spot = ParkingSpot.query.get(spot_id)
        if not spot:
            return jsonify({'success': False, 'message': '停车位不存在'}), 404
        if spot.status != '空闲':
            return jsonify({'success': False, 'message': '该停车位已被占用'}), 400
            
        order = Order(
            user_id=order_user_id,
            spot_id=spot_id,
            start_time=start_time,
            end_time=end_time,
            status=data.get('status', '未支付'),
            amount=data.get('amount', 0.0),
            pay_method=data.get('pay_method')
        )
        db.session.add(order)
        
        # 更新停车位状态为已预约
        spot.status = '已预约'
        
        db.session.commit()
        return jsonify({'success': True, 'data': order.to_dict(), 'message': '预约成功'})
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"创建订单失败: {e}")
        print(f"错误详情: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': '创建订单失败，请稍后重试'}), 500

@orders_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    """管理端删除订单"""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': '订单不存在'}), 404
    db.session.delete(order)
    db.session.commit()
    return jsonify({'success': True, 'message': '订单已删除'})

@orders_bp.route('/api/orders/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    """取消订单（用户端和管理端都可用）"""
    try:
        user_id = get_jwt_identity()
        role = request.headers.get('X-Require-Role', 'user')
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': '订单不存在'}), 404
        
        # 权限检查：用户只能取消自己的订单，管理员可以取消任何订单
        if role != 'admin' and order.user_id != user_id:
            return jsonify({'success': False, 'message': '您没有权限取消此订单'}), 403
        
        # 检查订单状态
        if order.status == '已完成':
            return jsonify({'success': False, 'message': '已完成的订单不能取消'}), 400
        
        if order.status == '已取消':
            return jsonify({'success': False, 'message': '订单已经是取消状态'}), 400
        
        # 更新订单状态为已取消
        order.status = '已取消'
        
        # 释放停车位
        from models.parking_spot import ParkingSpot
        spot = ParkingSpot.query.get(order.spot_id)
        if spot:
            spot.status = '空闲'
        
        db.session.commit()
        return jsonify({'success': True, 'message': '订单已取消', 'data': order.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"取消订单失败: {e}")
        print(f"错误详情: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': '取消订单失败，请稍后重试'}), 500

@orders_bp.route('/api/orders/<int:order_id>/pay', methods=['POST'])
@jwt_required()
def pay_order(order_id):
    """用户支付订单，支持支付宝/微信"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': '订单不存在'}), 404
        
        data = request.get_json()
        pay_method = data.get('pay_method')
        if pay_method not in ['支付宝', '微信']:
            return jsonify({'success': False, 'message': '不支持的支付方式'}), 400
        
        # 检查订单状态
        if order.status == '已完成':
            return jsonify({'success': False, 'message': '订单已经支付完成'}), 400
        
        if order.status == '已取消':
            return jsonify({'success': False, 'message': '已取消的订单不能支付'}), 400
        
        # 更新订单状态为已完成
        order.status = '已完成'
        order.pay_method = pay_method
        
        # 更新停车位状态为已占用
        from models.parking_spot import ParkingSpot
        spot = ParkingSpot.query.get(order.spot_id)
        if spot:
            spot.status = '已占用'
        
        db.session.commit()
        return jsonify({'success': True, 'message': '支付成功', 'data': order.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"支付订单失败: {e}")
        print(f"错误详情: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': '支付失败，请稍后重试'}), 500 