from flask import Blueprint, request, jsonify, current_app
from models.user import User
from utils.auth import admin_required
from datetime import datetime
from models.system_config import SystemConfig
import os

system_bp = Blueprint('system', __name__)

def load_config():
    """从数据库加载系统配置"""
    config = SystemConfig.query.first()
    if not config:
        config = SystemConfig()
        from models.base import db
        db.session.add(config)
        db.session.commit()
    return config

def save_config(config):
    """保存系统配置到数据库"""
    from models.base import db
    db.session.add(config)
    db.session.commit()
    return True

def add_system_log(action, details='', user_id=None, request_info=None):
    """添加系统操作日志"""
    try:
        from models.system_log import SystemLog
        from models.base import db
        
        # 获取请求信息
        ip_address = None
        user_agent = None
        if request_info:
            ip_address = request_info.remote_addr
            user_agent = request_info.headers.get('User-Agent', '')
        
        # 创建系统日志
        system_log = SystemLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.now()
        )
        
        # 保存到数据库
        db.session.add(system_log)
        db.session.commit()
        
        return True
    except Exception as e:
        current_app.logger.error(f"添加系统日志失败: {str(e)}")
        return False

@system_bp.route('/api/system/config', methods=['GET'])
@admin_required
def get_config():
    """获取系统配置"""
    try:
        config = load_config()
        return jsonify(success=True, data=config.to_dict())
    except Exception as e:
        current_app.logger.error(f"获取系统配置失败: {str(e)}")
        return jsonify(success=False, message="获取配置失败"), 500

@system_bp.route('/api/system/fee-config', methods=['PUT'])
@admin_required
def update_fee_config():
    """更新收费标准配置"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="请求数据无效"), 400
        
        # 验证数据
        required_fields = ['first', 'next', 'max']
        for field in required_fields:
            if field not in data or not isinstance(data[field], (int, float)) or data[field] < 0:
                return jsonify(success=False, message=f"字段 {field} 无效"), 400
        
        # 加载当前配置
        config = load_config()
        
        # 更新收费标准
        config.fee_first = float(data['first'])
        config.fee_next = float(data['next'])
        config.fee_max = float(data['max'])
        config.updated_at = datetime.utcnow()
        
        # 保存配置
        if save_config(config):
            # 添加操作日志
            details = f"首小时: {data['first']}元, 后续每小时: {data['next']}元, 24小时封顶: {data['max']}元"
            add_system_log('修改收费标准', details, request.admin_id, request)
            
            return jsonify(success=True, message="收费标准更新成功")
        else:
            return jsonify(success=False, message="保存配置失败"), 500
            
    except Exception as e:
        current_app.logger.error(f"更新收费标准失败: {str(e)}")
        return jsonify(success=False, message="更新失败"), 500

@system_bp.route('/api/system/alarm-config', methods=['PUT'])
@admin_required
def update_alarm_config():
    """更新告警规则配置"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="请求数据无效"), 400
        
        # 验证数据
        if 'timeout' not in data or not isinstance(data['timeout'], (int, float)) or data['timeout'] <= 0:
            return jsonify(success=False, message="超时时间无效"), 400
        
        # 加载当前配置
        config = load_config()
        
        # 更新告警规则
        config.alarm_timeout = float(data['timeout'])
        config.updated_at = datetime.utcnow()
        
        # 保存配置
        if save_config(config):
            # 添加操作日志
            details = f"超时停车提醒时间: {data['timeout']}小时"
            add_system_log('设置超时停车告警', details, request.admin_id, request)
            
            return jsonify(success=True, message="告警规则更新成功")
        else:
            return jsonify(success=False, message="保存配置失败"), 500
            
    except Exception as e:
        current_app.logger.error(f"更新告警规则失败: {str(e)}")
        return jsonify(success=False, message="更新失败"), 500

@system_bp.route('/api/system/logs', methods=['GET'])
@admin_required
def get_system_logs():
    """获取系统操作日志"""
    try:
        from models.system_log import SystemLog
        
        # 获取分页参数
        page = request.args.get('page', 1, type=int)
        size = request.args.get('size', 20, type=int)
        
        # 查询日志，按时间倒序排列
        query = SystemLog.query.order_by(SystemLog.created_at.desc())
        
        # 分页
        pagination = query.paginate(
            page=page, 
            per_page=size, 
            error_out=False
        )
        
        logs = pagination.items
        
        # 格式化日志数据
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                'time': log.created_at.isoformat() if log.created_at else '',
                'user': log.user.name if log.user else '系统管理员',
                'action': log.action,
                'details': log.details or ''
            })
        
        return jsonify(
            success=True, 
            data=formatted_logs,
            total=pagination.total,
            page=page,
            size=size
        )
        
    except Exception as e:
        current_app.logger.error(f"获取系统日志失败: {str(e)}")
        return jsonify(success=False, message="获取日志失败"), 500

@system_bp.route('/api/system/logs', methods=['POST'])
@admin_required
def add_system_log_api():
    """添加系统操作日志（API接口）"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="请求数据无效"), 400
        
        action = data.get('action', '')
        details = data.get('details', '')
        
        if not action:
            return jsonify(success=False, message="操作内容不能为空"), 400
        
        # 添加日志
        if add_system_log(action, details, request.admin_id, request):
            return jsonify(success=True, message="日志添加成功")
        else:
            return jsonify(success=False, message="日志添加失败"), 500
            
    except Exception as e:
        current_app.logger.error(f"添加系统日志失败: {str(e)}")
        return jsonify(success=False, message="添加日志失败"), 500 