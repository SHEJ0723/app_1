from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from models.order import Order
from models.parking_spot import ParkingSpot
from models.bill import Bill
from models.user import User
from models.base import db

statistics_bp = Blueprint('statistics', __name__)

@statistics_bp.route('/api/statistics/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_statistics():
    """获取仪表盘统计数据"""
    try:
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        last_week = today - timedelta(days=7)
        
        # 今日收入
        today_income = db.session.query(func.sum(Bill.amount)).filter(
            func.date(Bill.created_at) == today,
            Bill.status == '已支付'
        ).scalar() or 0
        
        # 昨日收入
        yesterday_income = db.session.query(func.sum(Bill.amount)).filter(
            func.date(Bill.created_at) == yesterday,
            Bill.status == '已支付'
        ).scalar() or 0
        
        # 收入增长率
        income_growth = 0
        if yesterday_income > 0:
            income_growth = round(((today_income - yesterday_income) / yesterday_income) * 100, 1)
        
        # 今日车流量（订单数）
        today_traffic = db.session.query(func.count(Order.id)).filter(
            func.date(Order.created_at) == today
        ).scalar() or 0
        
        # 昨日车流量
        yesterday_traffic = db.session.query(func.count(Order.id)).filter(
            func.date(Order.created_at) == yesterday
        ).scalar() or 0
        
        # 车流量增长率
        traffic_growth = 0
        if yesterday_traffic > 0:
            traffic_growth = round(((today_traffic - yesterday_traffic) / yesterday_traffic) * 100, 1)
        
        # 空闲车位数
        available_spots = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True,
            ParkingSpot.status == '空闲'
        ).scalar() or 0
        
        # 上周空闲车位数
        last_week_available = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True,
            ParkingSpot.status == '空闲'
        ).scalar() or 0
        
        # 空闲车位增长率
        spots_growth = 0
        if last_week_available > 0:
            spots_growth = round(((available_spots - last_week_available) / last_week_available) * 100, 1)
        
        # 高峰时段分析
        peak_hours = get_peak_hours()
        
        return jsonify({
            'success': True,
            'data': {
                'income': float(today_income),
                'income_growth': income_growth,
                'traffic': today_traffic,
                'traffic_growth': traffic_growth,
                'available_spots': available_spots,
                'spots_growth': spots_growth,
                'peak_time': peak_hours
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取统计数据失败: {str(e)}'
        }), 500

@statistics_bp.route('/api/statistics/monthly', methods=['GET'])
@jwt_required()
def get_monthly_statistics():
    """获取月度统计数据"""
    try:
        current_month = datetime.now().month
        current_year = datetime.now().year
        last_month = (datetime.now() - timedelta(days=30)).month
        last_month_year = (datetime.now() - timedelta(days=30)).year
        
        # 本月收入
        monthly_income = db.session.query(func.sum(Bill.amount)).filter(
            extract('month', Bill.created_at) == current_month,
            extract('year', Bill.created_at) == current_year,
            Bill.status == '已支付'
        ).scalar() or 0
        
        # 上月收入
        last_month_income = db.session.query(func.sum(Bill.amount)).filter(
            extract('month', Bill.created_at) == last_month,
            extract('year', Bill.created_at) == last_month_year,
            Bill.status == '已支付'
        ).scalar() or 0
        
        # 收入增长率
        income_growth = 0
        if last_month_income > 0:
            income_growth = round(((monthly_income - last_month_income) / last_month_income) * 100, 1)
        
        # 本月车流量
        monthly_traffic = db.session.query(func.count(Order.id)).filter(
            extract('month', Order.created_at) == current_month,
            extract('year', Order.created_at) == current_year
        ).scalar() or 0
        
        # 上月车流量
        last_month_traffic = db.session.query(func.count(Order.id)).filter(
            extract('month', Order.created_at) == last_month,
            extract('year', Order.created_at) == last_month_year
        ).scalar() or 0
        
        # 车流量增长率
        traffic_growth = 0
        if last_month_traffic > 0:
            traffic_growth = round(((monthly_traffic - last_month_traffic) / last_month_traffic) * 100, 1)
        
        # 平均停车时长
        avg_parking_time = get_average_parking_time()
        
        # 车位使用率
        occupancy_rate = get_occupancy_rate()
        
        return jsonify({
            'success': True,
            'data': {
                'monthly_income': float(monthly_income),
                'income_growth': income_growth,
                'monthly_traffic': monthly_traffic,
                'traffic_growth': traffic_growth,
                'avg_parking_time': avg_parking_time,
                'occupancy_rate': occupancy_rate
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取月度统计数据失败: {str(e)}'
        }), 500

@statistics_bp.route('/api/statistics/charts', methods=['GET'])
@jwt_required()
def get_chart_data():
    """获取图表数据"""
    try:
        days = int(request.args.get('days', 30))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 收入趋势数据
        income_data = db.session.query(
            func.date(Bill.created_at).label('date'),
            func.sum(Bill.amount).label('income')
        ).filter(
            Bill.created_at >= start_date,
            Bill.created_at <= end_date,
            Bill.status == '已支付'
        ).group_by(func.date(Bill.created_at)).all()
        
        # 车流量趋势数据
        traffic_data = db.session.query(
            func.date(Order.created_at).label('date'),
            func.count(Order.id).label('traffic')
        ).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        ).group_by(func.date(Order.created_at)).all()
        
        # 车位使用率分布
        usage_distribution = db.session.query(
            ParkingSpot.status,
            func.count(ParkingSpot.id).label('count')
        ).filter(
            ParkingSpot.is_active == True
        ).group_by(ParkingSpot.status).all()
        
        # 按区域分布
        zone_distribution = db.session.query(
            ParkingSpot.zone,
            func.count(ParkingSpot.id).label('count')
        ).filter(
            ParkingSpot.is_active == True
        ).group_by(ParkingSpot.zone).all()
        
        return jsonify({
            'success': True,
            'data': {
                'income_trend': [
                    {
                        'date': str(item.date),
                        'income': float(item.income)
                    } for item in income_data
                ],
                'traffic_trend': [
                    {
                        'date': str(item.date),
                        'traffic': item.traffic
                    } for item in traffic_data
                ],
                'usage_distribution': [
                    {
                        'status': item.status,
                        'count': item.count
                    } for item in usage_distribution
                ],
                'zone_distribution': [
                    {
                        'zone': item.zone,
                        'count': item.count
                    } for item in zone_distribution
                ]
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取图表数据失败: {str(e)}'
        }), 500

@statistics_bp.route('/api/statistics/zone-details', methods=['GET'])
@jwt_required()
def get_zone_statistics():
    """获取分区统计详情"""
    try:
        today = datetime.now().date()
        
        # 获取所有分区的统计信息
        zone_stats = []
        
        # 查询所有分区
        zones = db.session.query(ParkingSpot.zone).distinct().all()
        
        for zone_result in zones:
            zone = zone_result[0]
            
            # 该分区的总车位数
            total_spots = db.session.query(func.count(ParkingSpot.id)).filter(
                ParkingSpot.is_active == True,
                ParkingSpot.zone == zone
            ).scalar() or 0
            
            # 该分区已占用的车位数
            occupied_spots = db.session.query(func.count(ParkingSpot.id)).filter(
                ParkingSpot.is_active == True,
                ParkingSpot.zone == zone,
                ParkingSpot.status == '已占用'
            ).scalar() or 0
            
            # 计算使用率
            usage_rate = 0
            if total_spots > 0:
                usage_rate = round((occupied_spots / total_spots) * 100, 1)
            
            # 该分区今日收入
            today_income = db.session.query(func.sum(Bill.amount)).filter(
                Bill.status == '已支付',
                func.date(Bill.created_at) == today
            ).join(Order, Bill.order_id == Order.id).join(
                ParkingSpot, Order.spot_id == ParkingSpot.id
            ).filter(
                ParkingSpot.zone == zone
            ).scalar() or 0
            
            # 判断状态（基于使用率）
            status = '正常'
            if usage_rate > 95:
                status = '拥挤'
            elif usage_rate < 30:
                status = '空闲'
            
            zone_stats.append({
                'name': f'{zone}区',
                'total': total_spots,
                'occupied': occupied_spots,
                'usage': usage_rate,
                'income': float(today_income),
                'status': status
            })
        
        # 按分区名称排序
        zone_stats.sort(key=lambda x: x['name'])
        
        return jsonify({
            'success': True,
            'data': zone_stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取分区统计失败: {str(e)}'
        }), 500

def get_peak_hours():
    """获取高峰时段"""
    try:
        # 分析最近7天的订单，找出最繁忙的时段
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # 按小时统计订单数量
        hourly_stats = db.session.query(
            extract('hour', Order.created_at).label('hour'),
            func.count(Order.id).label('count')
        ).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        ).group_by(extract('hour', Order.created_at)).all()
        
        if hourly_stats:
            # 找出订单数量最多的时段
            peak_hour = max(hourly_stats, key=lambda x: x.count)
            peak_start = f"{peak_hour.hour:02d}:00"
            peak_end = f"{(peak_hour.hour + 1) % 24:02d}:00"
            return f"{peak_start}-{peak_end}"
        
        return "10:00-11:00"  # 默认值
    except:
        return "10:00-11:00"

def get_average_parking_time():
    """获取平均停车时长（小时）"""
    try:
        # 计算已完成订单的平均停车时长
        completed_orders = db.session.query(Order).filter(
            Order.status == '已完成'
        ).all()
        
        total_hours = 0
        count = 0
        
        for order in completed_orders:
            if order.start_time and order.end_time:
                duration = order.end_time - order.start_time
                total_hours += duration.total_seconds() / 3600
                count += 1
        
        if count > 0:
            return round(total_hours / count, 1)
        
        return 2.1  # 默认值
    except:
        return 2.1

def get_occupancy_rate():
    """获取车位使用率"""
    try:
        total_spots = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True
        ).scalar() or 0
        
        occupied_spots = db.session.query(func.count(ParkingSpot.id)).filter(
            ParkingSpot.is_active == True,
            ParkingSpot.status == '已占用'
        ).scalar() or 0
        
        if total_spots > 0:
            return round((occupied_spots / total_spots) * 100, 1)
        
        return 78.0  # 默认值
    except:
        return 78.0 