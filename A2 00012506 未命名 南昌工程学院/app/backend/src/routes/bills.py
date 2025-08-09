from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Bill, User, Order
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import json

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/api/bills', methods=['GET'])
@jwt_required()
def get_bills():
    """获取账单列表，支持搜索和过滤"""
    user_id = get_jwt_identity()
    role = request.headers.get('X-Require-Role', 'user')
    
    # 分页参数
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # 搜索参数
    status = request.args.get('status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    user_name = request.args.get('user_name', '')
    order_id = request.args.get('order_id', '')
    
    # 构建查询
    query = db.session.query(
        Bill,
        User.name.label('user_name'),
        User.phone.label('user_phone'),
        Order.id.label('order_number')
    ).join(User, Bill.user_id == User.id).join(Order, Bill.order_id == Order.id)
    
    # 权限过滤
    if role != 'admin':
        query = query.filter(Bill.user_id == user_id)
    
    # 状态过滤
    if status:
        query = query.filter(Bill.status == status)
    
    # 时间范围过滤
    if start_date:
        start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(Bill.created_at >= start_datetime)
    if end_date:
        end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(Bill.created_at <= end_datetime)
    
    # 用户名搜索
    if user_name:
        query = query.filter(User.name.like(f'%{user_name}%'))
    
    # 订单号搜索
    if order_id:
        query = query.filter(Order.id == order_id)
    
    # 获取总数
    total = query.count()
    
    # 分页和排序
    bills = query.order_by(Bill.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    
    # 格式化数据
    bills_data = []
    for bill, user_name, user_phone, order_number in bills:
        bill_dict = bill.to_dict()
        bill_dict['user_name'] = user_name
        bill_dict['user_phone'] = user_phone
        bill_dict['order_number'] = f'ORD-{order_number:06d}'
        bills_data.append(bill_dict)
    
    return jsonify({
        'success': True,
        'data': bills_data,
        'total': total,
        'page': page,
        'per_page': per_page
    })

@bills_bp.route('/api/bills/statistics', methods=['GET'])
@jwt_required()
def get_bill_statistics():
    """获取账单统计信息"""
    role = request.headers.get('X-Require-Role', 'user')
    
    # 基础查询
    query = Bill.query
    if role != 'admin':
        user_id = get_jwt_identity()
        query = query.filter_by(user_id=user_id)
    
    # 总账单数
    total_bills = query.count()
    
    # 已支付账单
    paid_bills = query.filter_by(status='已支付').count()
    
    # 未支付账单
    unpaid_bills = query.filter_by(status='未支付').count()
    
    # 总金额
    total_amount = query.with_entities(func.sum(Bill.amount)).scalar() or 0
    
    # 已支付金额
    paid_amount = query.filter_by(status='已支付').with_entities(func.sum(Bill.amount)).scalar() or 0
    
    # 今日统计
    today = datetime.now().date()
    today_bills = query.filter(func.date(Bill.created_at) == today).count()
    today_amount = query.filter(func.date(Bill.created_at) == today).with_entities(func.sum(Bill.amount)).scalar() or 0
    
    # 本月统计
    month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_bills = query.filter(Bill.created_at >= month_start).count()
    month_amount = query.filter(Bill.created_at >= month_start).with_entities(func.sum(Bill.amount)).scalar() or 0
    
    return jsonify({
        'success': True,
        'data': {
            'total_bills': total_bills,
            'paid_bills': paid_bills,
            'unpaid_bills': unpaid_bills,
            'total_amount': float(total_amount),
            'paid_amount': float(paid_amount),
            'today_bills': today_bills,
            'today_amount': float(today_amount),
            'month_bills': month_bills,
            'month_amount': float(month_amount)
        }
    })

@bills_bp.route('/api/bills/export', methods=['GET'])
@jwt_required()
def export_bills():
    """导出账单数据"""
    role = request.headers.get('X-Require-Role', 'user')
    
    # 构建查询
    query = db.session.query(
        Bill,
        User.name.label('user_name'),
        User.phone.label('user_phone'),
        Order.id.label('order_number')
    ).join(User, Bill.user_id == User.id).join(Order, Bill.order_id == Order.id)
    
    # 权限过滤
    if role != 'admin':
        user_id = get_jwt_identity()
        query = query.filter(Bill.user_id == user_id)
    
    # 获取所有数据
    bills = query.order_by(Bill.created_at.desc()).all()
    
    # 格式化导出数据
    export_data = []
    for bill, user_name, user_phone, order_number in bills:
        export_data.append({
            '账单编号': f'BILL-{bill.id:06d}',
            '用户名': user_name,
            '用户电话': user_phone,
            '订单编号': f'ORD-{order_number:06d}',
            '金额': f'¥{bill.amount:.2f}',
            '状态': bill.status,
            '支付方式': bill.pay_method or '未支付',
            '创建时间': bill.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            '支付时间': bill.pay_time.strftime('%Y-%m-%d %H:%M:%S') if bill.pay_time else '未支付'
        })
    
    return jsonify({
        'success': True,
        'data': export_data,
        'filename': f'bills_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    })

@bills_bp.route('/api/bills/<int:bill_id>', methods=['GET'])
@jwt_required()
def get_bill_detail(bill_id):
    """获取账单详情"""
    role = request.headers.get('X-Require-Role', 'user')
    
    # 查询账单详情
    bill_detail = db.session.query(
        Bill,
        User.name.label('user_name'),
        User.phone.label('user_phone'),
        User.email.label('user_email'),
        Order.id.label('order_number'),
        Order.start_time.label('order_start_time'),
        Order.end_time.label('order_end_time')
    ).join(User, Bill.user_id == User.id).join(Order, Bill.order_id == Order.id).filter(Bill.id == bill_id).first()
    
    if not bill_detail:
        return jsonify({'success': False, 'message': '账单不存在'}), 404
    
    bill, user_name, user_phone, user_email, order_number, order_start_time, order_end_time = bill_detail
    
    # 权限检查
    if role != 'admin' and bill.user_id != get_jwt_identity():
        return jsonify({'success': False, 'message': '无权限访问'}), 403
    
    # 格式化详情数据
    detail_data = bill.to_dict()
    detail_data.update({
        'user_name': user_name,
        'user_phone': user_phone,
        'user_email': user_email,
        'order_number': f'ORD-{order_number:06d}',
        'order_start_time': order_start_time.isoformat() if order_start_time else None,
        'order_end_time': order_end_time.isoformat() if order_end_time else None
    })
    
    return jsonify({
        'success': True,
        'data': detail_data
    })

@bills_bp.route('/api/bills/<int:bill_id>/send-reminder', methods=['POST'])
@jwt_required()
def send_bill_reminder(bill_id):
    """发送账单提醒"""
    role = request.headers.get('X-Require-Role', 'user')
    
    if role != 'admin':
        return jsonify({'success': False, 'message': '无权限操作'}), 403
    
    bill = Bill.query.get(bill_id)
    if not bill:
        return jsonify({'success': False, 'message': '账单不存在'}), 404
    
    if bill.status == '已支付':
        return jsonify({'success': False, 'message': '账单已支付，无需提醒'}), 400
    
    # 这里可以集成短信或邮件服务发送提醒
    # 目前返回成功消息
    return jsonify({
        'success': True,
        'message': '提醒发送成功'
    })

@bills_bp.route('/api/bills', methods=['POST'])
@jwt_required()
def create_bill():
    """管理端新增账单"""
    role = request.headers.get('X-Require-Role', 'user')
    
    if role != 'admin':
        return jsonify({'success': False, 'message': '无权限操作'}), 403
    
    data = request.get_json()
    
    # 验证必要字段
    required_fields = ['user_id', 'order_id', 'amount']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要字段: {field}'}), 400
    
    # 检查用户和订单是否存在
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 400
    
    order = Order.query.get(data['order_id'])
    if not order:
        return jsonify({'success': False, 'message': '订单不存在'}), 400
    
    # 创建账单
    bill = Bill(
        user_id=data['user_id'],
        order_id=data['order_id'],
        amount=data['amount'],
        pay_time=data.get('pay_time'),
        status=data.get('status', '未支付'),
        pay_method=data.get('pay_method')
    )
    
    try:
        db.session.add(bill)
        db.session.commit()
        return jsonify({'success': True, 'data': bill.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'创建账单失败: {str(e)}'}), 500

@bills_bp.route('/api/bills/<int:bill_id>', methods=['PUT'])
@jwt_required()
def update_bill(bill_id):
    """更新账单信息"""
    role = request.headers.get('X-Require-Role', 'user')
    
    if role != 'admin':
        return jsonify({'success': False, 'message': '无权限操作'}), 403
    
    bill = Bill.query.get(bill_id)
    if not bill:
        return jsonify({'success': False, 'message': '账单不存在'}), 404
    
    data = request.get_json()
    
    # 更新字段
    if 'amount' in data:
        bill.amount = data['amount']
    if 'status' in data:
        bill.status = data['status']
    if 'pay_method' in data:
        bill.pay_method = data['pay_method']
    if 'pay_time' in data:
        bill.pay_time = datetime.fromisoformat(data['pay_time'].replace('Z', '+00:00')) if data['pay_time'] else None
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'data': bill.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'更新账单失败: {str(e)}'}), 500

@bills_bp.route('/api/bills/<int:bill_id>', methods=['DELETE'])
@jwt_required()
def delete_bill(bill_id):
    """管理端删除账单"""
    role = request.headers.get('X-Require-Role', 'user')
    
    if role != 'admin':
        return jsonify({'success': False, 'message': '无权限操作'}), 403
    
    bill = Bill.query.get(bill_id)
    if not bill:
        return jsonify({'success': False, 'message': '账单不存在'}), 404
    
    try:
        db.session.delete(bill)
        db.session.commit()
        return jsonify({'success': True, 'message': '账单已删除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'删除账单失败: {str(e)}'}), 500 