from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from models.parking_spot import ParkingSpot
from models.order import Order
from models.user import User, Admin, LicensePlate
from models.bill import Bill
from models.base import db
from datetime import datetime, timedelta
from sqlalchemy import func

chat_bp = Blueprint('chat', __name__)

def get_parking_statistics():
    """获取停车场实时统计数据"""
    try:
        # 状态同义词映射（兼容历史/英文数据）
        AVAILABLE_STATUSES = ['空闲', 'Available']
        OCCUPIED_STATUSES = ['已占用', '占用', 'Occupied']
        RESERVED_STATUSES = ['已预约', '预约', 'Reserved']

        # 总车位数量
        total_spots = ParkingSpot.query.filter_by(is_active=True).count()
        
        # 各状态车位数量（统一口径）
        available_spots = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True,
            ParkingSpot.status.in_(AVAILABLE_STATUSES)
        ).scalar() or 0
        occupied_spots = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True,
            ParkingSpot.status.in_(OCCUPIED_STATUSES)
        ).scalar() or 0
        reserved_spots = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True,
            ParkingSpot.status.in_(RESERVED_STATUSES)
        ).scalar() or 0
        
        # 各分区统计（从数据库动态获取分区）
        zone_stats = {}
        zones = [z[0] for z in db.session.query(ParkingSpot.zone).filter_by(is_active=True).distinct().all()]
        for zone in zones:
            zone_spots = ParkingSpot.query.filter_by(zone=zone, is_active=True).all()
            zone_stats[zone] = {
                'total': len(zone_spots),
                'available': len([s for s in zone_spots if s.status in AVAILABLE_STATUSES]),
                'occupied': len([s for s in zone_spots if s.status in OCCUPIED_STATUSES]),
                'reserved': len([s for s in zone_spots if s.status in RESERVED_STATUSES])
            }
        
        # 各类型统计（从数据库动态获取类型）
        type_stats = {}
        types = [t[0] for t in db.session.query(ParkingSpot.type).filter_by(is_active=True).distinct().all()]
        for spot_type in types:
            type_spots = ParkingSpot.query.filter_by(type=spot_type, is_active=True).all()
            type_stats[spot_type] = {
                'total': len(type_spots),
                'available': len([s for s in type_spots if s.status in AVAILABLE_STATUSES]),
                'occupied': len([s for s in type_spots if s.status in OCCUPIED_STATUSES]),
                'reserved': len([s for s in type_spots if s.status in RESERVED_STATUSES])
            }
        
        # 今日订单统计
        today = datetime.now().date()
        today_orders = Order.query.filter(
            func.date(Order.created_at) == today
        ).count()
        
        # 今日收入统计
        today_bills = Bill.query.filter(
            func.date(Bill.created_at) == today,
            Bill.status == '已支付'
        ).all()
        today_revenue = sum(bill.amount for bill in today_bills)
        
        return {
            'total_spots': total_spots,
            'available_spots': available_spots,
            'occupied_spots': occupied_spots,
            'reserved_spots': reserved_spots,
            'utilization_rate': round(((occupied_spots + reserved_spots) / total_spots) * 100, 2) if total_spots > 0 else 0,
            'zone_stats': zone_stats,
            'type_stats': type_stats,
            'today_orders': today_orders,
            'today_revenue': round(today_revenue, 2)
        }
    except Exception as e:
        print(f"获取停车场统计数据失败: {e}")
        return None

def get_spot_details(spot_number=None, zone=None, spot_type=None):
    """获取车位详细信息"""
    try:
        query = ParkingSpot.query.filter_by(is_active=True)
        
        if spot_number:
            query = query.filter_by(spot_number=spot_number)
        if zone:
            query = query.filter_by(zone=zone)
        if spot_type:
            query = query.filter_by(type=spot_type)
        
        spots = query.all()
        return [spot.to_dict() for spot in spots]
    except Exception as e:
        print(f"获取车位详情失败: {e}")
        return []

def get_user_license_plates(user_id):
    """获取用户绑定的车牌信息"""
    try:
        license_plates = LicensePlate.query.filter_by(
            user_id=user_id,
            status='active'
        ).all()
        
        return [plate.to_dict() for plate in license_plates]
    except Exception as e:
        print(f"获取用户车牌信息失败: {e}")
        return []

def get_user_info(user_id):
    """获取用户基本信息"""
    try:
        user = User.query.get(user_id)
        if user:
            return user.to_dict()
        return None
    except Exception as e:
        print(f"获取用户信息失败: {e}")
        return None

@chat_bp.route('/api/chat', methods=['POST'])
@jwt_required()
def chat_with_hunyuan():
    data = request.get_json()
    messages = data.get("messages", [])
    user_type = data.get("userType", "user")  # 获取用户类型
    if not messages:
        return jsonify({"success": False, "message": "消息不能为空"}), 400

    # 获取当前用户ID
    current_user_id = get_jwt_identity()
    
    # 获取实时停车场数据
    parking_stats = get_parking_statistics() or {
        'total_spots': 0,
        'available_spots': 0,
        'occupied_spots': 0,
        'reserved_spots': 0,
        'utilization_rate': 0,
        'zone_stats': {},
        'type_stats': {},
        'today_orders': 0,
        'today_revenue': 0.0
    }
    
    # 获取用户信息和车牌信息
    user_info = get_user_info(current_user_id)
    user_license_plates = get_user_license_plates(current_user_id)
    
    # 根据用户类型设置不同的系统提示词
    if user_type == "admin":
        system_prompt = f"""你是智慧园区停车场管理助手，专门为管理员提供服务。

当前停车场实时数据：
- 总车位：{parking_stats['total_spots']}个
- 可用车位：{parking_stats['available_spots']}个
- 已占用：{parking_stats['occupied_spots']}个
- 已预约：{parking_stats['reserved_spots']}个
- 使用率：{parking_stats['utilization_rate']}%
- 今日订单：{parking_stats['today_orders']}个
- 今日收入：¥{parking_stats['today_revenue']}

各分区情况：
{chr(10).join([f"- {zone}区：总计{stats['total']}个，可用{stats['available']}个，占用{stats['occupied']}个，预约{stats['reserved']}个" for zone, stats in parking_stats['zone_stats'].items() if stats['total'] > 0])}

各类型车位情况：
{chr(10).join([f"- {spot_type}：总计{stats['total']}个，可用{stats['available']}个，占用{stats['occupied']}个，预约{stats['reserved']}个" for spot_type, stats in parking_stats['type_stats'].items() if stats['total'] > 0])}

你可以：
1. 查询停车场每日收入、月收入、年收入等财务数据
2. 分析停车场使用率、车位占用情况等运营数据
3. 查看用户信息、用户活跃度、用户行为分析
4. 生成管理报表、统计图表、趋势分析
5. 提供管理建议、优化方案、运营策略
6. 回答停车场管理相关的专业问题
7. 实时查询车位状态和分布情况

请用专业、准确的语言回答管理员的问题，并提供有价值的管理洞察。"""
    else:
        # 构建用户车牌信息
        user_plates_info = ""
        if user_license_plates:
            user_plates_info = f"\n用户绑定车牌信息：\n"
            for plate in user_license_plates:
                default_mark = " (默认)" if plate.get('is_default') else ""
                user_plates_info += f"- {plate.get('plate_number')}{default_mark}\n"
        else:
            user_plates_info = "\n⚠️ 用户暂未绑定车牌，建议先绑定车牌再进行预约。"
        
        system_prompt = f"""你是智慧园区停车场助手，可以解答停车场相关问题、查询车位、预约车位。

当前停车场实时数据：
- 总车位：{parking_stats['total_spots']}个
- 可用车位：{parking_stats['available_spots']}个
- 已占用：{parking_stats['occupied_spots']}个
- 已预约：{parking_stats['reserved_spots']}个
- 使用率：{parking_stats['utilization_rate']}%

各分区情况：
{chr(10).join([f"- {zone}区：总计{stats['total']}个，可用{stats['available']}个" for zone, stats in parking_stats['zone_stats'].items() if stats['total'] > 0])}

各类型车位情况：
{chr(10).join([f"- {spot_type}：总计{stats['total']}个，可用{stats['available']}个" for spot_type, stats in parking_stats['type_stats'].items() if stats['total'] > 0])}

{user_plates_info}

你可以：
1. 查询车位实时状态和可用情况
2. 推荐合适的车位类型和分区
3. 解答预约和支付相关问题
4. 提供停车场使用指南
5. 帮助用户找到合适的车位
6. 协助用户预约车位（需要用户先绑定车牌）
7. 查询用户绑定的车牌信息

预约车位时，请提醒用户：
- 需要先绑定车牌才能预约
- 可以选择默认车牌或指定车牌
- 建议选择合适的分区和车位类型"""

    payload = {
        "model": "hunyuan-turbos-latest",
        "messages": [
            {"role": "system", "content": system_prompt},
            *messages
        ],
        "enable_enhancement": True
    }
    headers = {
        "Authorization": f"Bearer {current_app.config['HUNYUAN_API_KEY']}",
        "Content-Type": "application/json"
    }

    # 简单的本地回退生成逻辑
    def local_fallback_reply():
        latest = messages[-1]["content"] if isinstance(messages[-1], dict) else ""
        title = "管理助手实时统计"
        if user_type != 'admin':
            title = "停车场实时数据摘要"
        zone_lines = []
        for zone, stats in parking_stats.get('zone_stats', {}).items():
            if stats.get('total', 0) > 0:
                zone_lines.append(f"- {zone}区：总{stats['total']}，可用{stats['available']}，占用{stats['occupied']}，预约{stats['reserved']}")
        zone_block = "\n".join(zone_lines) if zone_lines else "- 暂无分区数据"
        reply = (
            f"{title}\n"
            f"总车位: {parking_stats['total_spots']}\n"
            f"可用: {parking_stats['available_spots']} | 已占用: {parking_stats['occupied_spots']} | 已预约: {parking_stats['reserved_spots']}\n"
            f"使用率: {parking_stats['utilization_rate']}%\n"
            f"今日订单: {parking_stats['today_orders']} | 今日收入: ¥{parking_stats['today_revenue']}\n\n"
            f"分区情况:\n{zone_block}\n\n"
            f"您的问题: {latest} — 已基于数据库最新数据给出统计。"
        )
        return reply

    try:
        resp = requests.post(current_app.config['HUNYUAN_API_URL'], json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        print('腾讯混元API返回:', resp.text)
        result = resp.json()
        # 腾讯混元返回格式可能不同，需根据实际API文档调整
        reply = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not reply:
            reply = local_fallback_reply()
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        import traceback
        print('API异常:', e)
        traceback.print_exc()
        # 使用本地回退，避免前端离线
        return jsonify({"success": True, "reply": local_fallback_reply(), "fallback": True})

@chat_bp.route('/api/chat/parking-data', methods=['GET'])
@jwt_required()
def get_parking_data_for_chat():
    """获取停车场实时数据供聊天助手使用"""
    try:
        parking_stats = get_parking_statistics()
        if parking_stats:
            return jsonify({
                "success": True,
                "data": parking_stats
            })
        else:
            return jsonify({
                "success": False,
                "message": "获取停车场数据失败"
            }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "获取停车场数据异常",
            "error": str(e)
        }), 500

@chat_bp.route('/api/chat/spot-details', methods=['GET'])
@jwt_required()
def get_spot_details_for_chat():
    """获取车位详细信息供聊天助手使用"""
    try:
        spot_number = request.args.get('spot_number')
        zone = request.args.get('zone')
        spot_type = request.args.get('type')
        
        spots = get_spot_details(spot_number, zone, spot_type)
        
        return jsonify({
            "success": True,
            "data": spots
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "获取车位详情异常",
            "error": str(e)
        }), 500

@chat_bp.route('/api/chat/user-plates', methods=['GET'])
@jwt_required()
def get_user_plates_for_chat():
    """获取用户车牌信息供聊天助手使用"""
    try:
        current_user_id = get_jwt_identity()
        user_plates = get_user_license_plates(current_user_id)
        user_info = get_user_info(current_user_id)
        
        return jsonify({
            "success": True,
            "data": {
                "user_info": user_info,
                "license_plates": user_plates
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "获取用户车牌信息异常",
            "error": str(e)
        }), 500 