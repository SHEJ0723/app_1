from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.parking_spot import ParkingSpot, db

parking_bp = Blueprint('parking', __name__)

@parking_bp.route('/api/parking-spots', methods=['GET'])
@jwt_required()
def get_parking_spots():
    """获取所有停车位"""
    try:
        # 获取分页参数
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # 获取查询参数
        zone = request.args.get('zone')
        spot_type = request.args.get('type')
        status = request.args.get('status')
        

        
        # 构建查询
        query = ParkingSpot.query.filter_by(is_active=True)
        
        if zone:
            query = query.filter_by(zone=zone)
        if spot_type:
            query = query.filter_by(type=spot_type)
        if status:
            query = query.filter_by(status=status)
            
        # 执行分页查询
        pagination = query.paginate(page=page, per_page=per_page)
        
        result = {
            'success': True,
            'data': [spot.to_dict() for spot in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }
        

        
        return jsonify(result)
    except Exception as e:

        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parking_bp.route('/api/parking-stats', methods=['GET'])
@jwt_required()
def get_parking_stats():
    """获取停车场统计数据"""
    try:
        from sqlalchemy import func
        
        # 获取总体统计
        total_spots = ParkingSpot.query.filter_by(is_active=True).count()
        available_spots = ParkingSpot.query.filter_by(is_active=True, status='空闲').count()
        occupied_spots = ParkingSpot.query.filter_by(is_active=True, status='占用').count()
        reserved_spots = ParkingSpot.query.filter_by(is_active=True, status='预约').count()
        
        # 计算使用率
        utilization_rate = round((occupied_spots + reserved_spots) / total_spots * 100, 1) if total_spots > 0 else 0
        
        # 按区域统计
        zone_stats = {}
        zones = ['A', 'B', 'C', 'D', 'E', 'F']
        
        for zone in zones:
            zone_total = ParkingSpot.query.filter_by(is_active=True, zone=zone).count()
            zone_available = ParkingSpot.query.filter_by(is_active=True, zone=zone, status='空闲').count()
            zone_occupied = ParkingSpot.query.filter_by(is_active=True, zone=zone, status='占用').count()
            zone_reserved = ParkingSpot.query.filter_by(is_active=True, zone=zone, status='预约').count()
            
            zone_stats[zone] = {
                'total': zone_total,
                'available': zone_available,
                'occupied': zone_occupied,
                'reserved': zone_reserved
            }
        
        result = {
            'success': True,
            'data': {
                'total_spots': total_spots,
                'available_spots': available_spots,
                'occupied_spots': occupied_spots,
                'reserved_spots': reserved_spots,
                'utilization_rate': utilization_rate,
                'zone_stats': zone_stats
            }
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parking_bp.route('/api/parking-spots', methods=['POST'])
@jwt_required()
def create_parking_spot():
    """创建新停车位"""
    try:
        data = request.get_json()
        
        # 验证必要字段
        required_fields = ['spot_number', 'zone', 'type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'缺少必要字段: {field}'
                }), 400
        
        # 检查车位号是否已存在
        if ParkingSpot.query.filter_by(spot_number=data['spot_number']).first():
            return jsonify({
                'success': False,
                'message': '车位号已存在'
            }), 400
        
        # 创建新停车位
        new_spot = ParkingSpot(
            spot_number=data['spot_number'],
            zone=data['zone'],
            type=data['type'],
            status=data.get('status', '空闲'),
            is_active=True
        )
        
        db.session.add(new_spot)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '停车位创建成功',
            'data': new_spot.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parking_bp.route('/api/parking-spots/<int:spot_id>', methods=['PUT'])
@jwt_required()
def update_parking_spot(spot_id):
    """更新停车位信息"""
    try:
        spot = ParkingSpot.query.get(spot_id)
        if not spot:
            return jsonify({
                'success': False,
                'message': '停车位不存在'
            }), 404
            
        data = request.get_json()
        
        # 更新字段
        if 'zone' in data:
            spot.zone = data['zone']
        if 'type' in data:
            spot.type = data['type']
        if 'status' in data:
            spot.status = data['status']
        if 'is_active' in data:
            spot.is_active = data['is_active']
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '停车位更新成功',
            'data': spot.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parking_bp.route('/api/parking-spots/<int:spot_id>', methods=['DELETE'])
@jwt_required()
def delete_parking_spot(spot_id):
    """删除停车位"""
    try:
        spot = ParkingSpot.query.get(spot_id)
        if not spot:
            return jsonify({
                'success': False,
                'message': '停车位不存在'
            }), 404
            
        db.session.delete(spot)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '停车位删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500 