from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, LicensePlate, db
import re

license_plates_bp = Blueprint('license_plates', __name__)

@license_plates_bp.route('/api/license-plates', methods=['GET'])
@jwt_required()
def get_user_license_plates():
    """获取用户的车牌列表"""
    try:
        # 获取当前用户ID
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        # 获取用户的车牌列表
        license_plates = LicensePlate.query.filter_by(
            user_id=current_user_id, 
            status='active'
        ).all()
        
        return jsonify({
            'success': True,
            'data': [plate.to_dict() for plate in license_plates],
            'total': len(license_plates),
            'max_count': 5
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@license_plates_bp.route('/api/license-plates', methods=['POST'])
@jwt_required()
def add_license_plate():
    """添加新车牌"""
    try:
        # 获取当前用户ID
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        # 验证必要字段
        if not data.get('plate_number'):
            return jsonify({
                'success': False,
                'message': '车牌号不能为空'
            }), 400
        
        plate_number = data['plate_number'].strip().upper()
        vehicle_type = data.get('vehicle_type', 'car')
        
        # 检查用户已绑定的车牌数量
        existing_count = LicensePlate.query.filter_by(
            user_id=current_user_id, 
            status='active'
        ).count()
        
        if existing_count >= 5:
            return jsonify({
                'success': False,
                'message': '已达到最大绑定数量限制(5个)'
            }), 400
        
        # 验证车牌号格式
        if not is_valid_license_plate(plate_number):
            return jsonify({
                'success': False,
                'message': '车牌号格式不正确'
            }), 400
        
        # 检查车牌号是否已存在
        existing_plate = LicensePlate.query.filter_by(
            plate_number=plate_number,
            status='active'
        ).first()
        
        if existing_plate:
            return jsonify({
                'success': False,
                'message': '该车牌号已被绑定'
            }), 400
        
        # 创建新车牌记录
        new_plate = LicensePlate(
            plate_number=plate_number,
            vehicle_type=vehicle_type,
            user_id=current_user_id,
            is_default=(existing_count == 0),  # 第一个车牌设为默认
            status='active'
        )
        
        db.session.add(new_plate)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '车牌添加成功',
            'data': new_plate.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@license_plates_bp.route('/api/license-plates/<int:plate_id>', methods=['PUT'])
@jwt_required()
def update_license_plate(plate_id):
    """更新车牌信息"""
    try:
        # 获取当前用户ID
        current_user_id = get_jwt_identity()
        
        # 查找车牌记录
        plate = LicensePlate.query.filter_by(
            id=plate_id,
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not plate:
            return jsonify({
                'success': False,
                'message': '车牌不存在或无权限操作'
            }), 404
        
        data = request.get_json()
        
        # 更新字段
        if 'vehicle_type' in data:
            plate.vehicle_type = data['vehicle_type']
        
        if 'is_default' in data and data['is_default']:
            # 如果设为默认，先取消其他车牌的默认状态
            LicensePlate.query.filter_by(
                user_id=current_user_id,
                status='active'
            ).update({'is_default': False})
            plate.is_default = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '车牌信息更新成功',
            'data': plate.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@license_plates_bp.route('/api/license-plates/<int:plate_id>', methods=['DELETE'])
@jwt_required()
def delete_license_plate(plate_id):
    """删除车牌"""
    try:
        # 获取当前用户ID
        current_user_id = get_jwt_identity()
        
        # 查找车牌记录
        plate = LicensePlate.query.filter_by(
            id=plate_id,
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not plate:
            return jsonify({
                'success': False,
                'message': '车牌不存在或无权限操作'
            }), 404
        
        # 软删除（设置状态为disabled）
        plate.status = 'disabled'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '车牌删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@license_plates_bp.route('/api/license-plates/set-default/<int:plate_id>', methods=['PUT'])
@jwt_required()
def set_default_license_plate(plate_id):
    """设置默认车牌"""
    try:
        # 获取当前用户ID
        current_user_id = get_jwt_identity()
        
        # 查找车牌记录
        plate = LicensePlate.query.filter_by(
            id=plate_id,
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not plate:
            return jsonify({
                'success': False,
                'message': '车牌不存在或无权限操作'
            }), 404
        
        # 取消其他车牌的默认状态
        LicensePlate.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).update({'is_default': False})
        
        # 设置当前车牌为默认
        plate.is_default = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '默认车牌设置成功',
            'data': plate.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def is_valid_license_plate(plate_number):
    """验证车牌号格式"""
    # 中国车牌号正则表达式
    pattern = r'^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,7}$'
    return re.match(pattern, plate_number) is not None 