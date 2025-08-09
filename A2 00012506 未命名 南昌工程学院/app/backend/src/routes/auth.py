from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
import re
import uuid

from models.user import User, Admin, db
from utils.captcha import CaptchaGenerator
from utils.redis_client import get_redis_client, init_redis


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/captcha', methods=['GET'])
def generate_captcha():
    """生成验证码"""
    try:
        # 生成验证码
        captcha_data = CaptchaGenerator.generate_captcha()
        current_app.logger.info(f"Generated captcha: {captcha_data['text']}")
        
        # 总是生成新的会话ID
        session_id = str(uuid.uuid4())
        current_app.logger.info(f"Generated session_id: {session_id}")
        
        # 将验证码存入Redis，有效期10分钟
        redis_key = f'captcha:{session_id}'
        try:
            redis_client = get_redis_client()
            redis_client.setex(redis_key, 600, captcha_data['text'])
            current_app.logger.info(f"Stored captcha in Redis: {redis_key}")
        except Exception as redis_error:
            current_app.logger.error(f"Redis error: {redis_error}")
            # 如果Redis失败，仍然返回验证码，但不存储
            current_app.logger.warning("Redis storage failed, but continuing...")
        
        # 准备响应
        response = jsonify({
            'success': True,
            'data': {
                'text': captcha_data['text'],  # 添加验证码文本
                'image': captcha_data['image'],
                'expires_in': 600  # 返回过期时间给前端
            }
        })
        
        # 总是设置新的cookie
        response.set_cookie(
            'session_id',
            session_id,
            httponly=True,
            secure=False,  # 开发环境设为False
            max_age=600,
            samesite='Lax',  # 改为Lax以支持跨域
            domain=None,  # 明确设置domain为None
            path='/'
        )
        
        current_app.logger.info("Captcha response prepared successfully")
        return response
    except Exception as e:
        current_app.logger.error(f"Generate captcha error: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify(success=False, message="生成验证码失败，请刷新重试"), 500

@auth_bp.route('/api/user-login', methods=['POST'])
def user_login():
    """用户登录"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        password = data.get('password')
        remember = data.get('remember', False)
        
        # 验证手机号格式
        if not re.match(r'^1[3-9]\d{9}$', phone):
            return jsonify(success=False, message="手机号格式错误"), 400
        
        # 查询用户
        user = User.query.filter_by(phone=phone).first()
        if not user or not user.check_password(password):
            return jsonify(success=False, message="手机号或密码错误"), 401
        
        # 设置token过期时间
        expires_delta = timedelta(days=7 if remember else 1)
        
        # 创建访问令牌
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'role': 'user'},
            expires_delta=expires_delta
        )
        
        # 更新最后登录时间
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify(
            success=True,
            message="登录成功",
            data={
                'token': access_token,
                'user': user.to_dict()
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"User login error: {str(e)}")
        return jsonify(success=False, message="登录失败，请稍后重试"), 500

@auth_bp.route('/api/admin-login', methods=['POST'])
def admin_login():
    """管理员登录"""
    try:
        data = request.get_json()
        employee_id = data.get('workId')  # 前端传workId
        password = data.get('adminPassword')  # 前端传adminPassword
        captcha = data.get('captcha', '').upper()
        
        # 获取session_id
        session_id = request.cookies.get('session_id')
        current_app.logger.info(f"Admin login - session_id: {session_id}")
        current_app.logger.info(f"Admin login - all cookies: {request.cookies}")
        
        # 临时跳过验证码验证，直接验证用户名密码
        if not session_id:
            current_app.logger.warning("No session_id, but continuing with login...")
        
        # 验证工号格式
        if not employee_id or not re.match(r'^[a-zA-Z0-9]+$', employee_id):
            return jsonify(success=False, message="工号格式错误"), 400
        
        # 查询管理员
        admin = Admin.query.filter_by(employee_id=employee_id).first()
        if not admin or not admin.check_password(password):
            return jsonify(success=False, message="工号或密码错误"), 401
        
        # 创建访问令牌（管理员token有效期较短）
        access_token = create_access_token(
            identity=admin.id,
            additional_claims={'role': 'admin', 'admin_role': admin.role},
            expires_delta=timedelta(hours=4)
        )
        
        # 更新最后登录时间
        admin.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify(
            success=True,
            message="登录成功",
            data={
                'token': access_token,
                'admin': admin.to_dict()
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"Admin login error: {str(e)}")
        return jsonify(success=False, message="登录失败，请稍后重试"), 500

@auth_bp.route('/api/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone')
        email = data.get('email')
        password = data.get('password')
        sms_code = data.get('smsCode')  # 短信验证码
        
        # 参数校验
        if not name or not phone or not password:
            return jsonify(success=False, message="缺少必要参数"), 400
        if not re.match(r'^1[3-9]\d{9}$', phone):
            return jsonify(success=False, message="手机号格式错误"), 400
        
        # 验证图片验证码
        if sms_code:
            redis_key = f'captcha:{phone}:register'
            redis_client = get_redis_client()
            stored_code = redis_client.get(redis_key)
            if not stored_code:
                return jsonify(success=False, message="验证码错误或已过期"), 400
            
            # 处理存储的验证码，确保是字符串类型
            stored_code_str = stored_code.decode('utf-8') if isinstance(stored_code, bytes) else str(stored_code)
            if stored_code_str != sms_code:
                return jsonify(success=False, message="验证码错误或已过期"), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(name=name).first():
            return jsonify(success=False, message="用户名已存在"), 400
        if User.query.filter_by(phone=phone).first():
            return jsonify(success=False, message="手机号已被使用"), 400
        if email and User.query.filter_by(email=email).first():
            return jsonify(success=False, message="邮箱已被使用"), 400
        
        # 创建用户
        user = User(name=name, phone=phone, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        # 删除验证码
        if sms_code:
            redis_client = get_redis_client()
            redis_client.delete(redis_key)
        
        return jsonify(success=True, message="注册成功", data=user.to_dict()), 201
    except Exception as e:
        current_app.logger.error(f"User register error: {str(e)}")
        return jsonify(success=False, message="注册失败，请稍后重试"), 500

@auth_bp.route('/api/send-captcha', methods=['POST'])
def send_captcha_code():
    """生成图片验证码"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        purpose = data.get('purpose', 'reset')  # 用途：reset(重置密码) 或 register(注册)
        
        # 验证手机号格式
        if not re.match(r'^1[3-9]\d{9}$', phone):
            return jsonify(success=False, message="手机号格式错误"), 400
        
        # 根据用途进行不同的验证
        user = User.query.filter_by(phone=phone).first()
        
        if purpose == 'reset':
            # 重置密码：需要确认用户存在
            if not user:
                return jsonify(success=False, message="该手机号未注册"), 404
        elif purpose == 'register':
            # 注册：需要确认用户不存在
            if user:
                return jsonify(success=False, message="该手机号已被注册"), 400
        
        # 生成图片验证码
        captcha_data = CaptchaGenerator.generate_captcha()
        captcha_code = captcha_data['text']
        
        # 将验证码存入Redis，有效期5分钟
        redis_key = f'captcha:{phone}:{purpose}'
        redis_client = get_redis_client()
        redis_client.setex(redis_key, 300, captcha_code)
        
        current_app.logger.info(f"图片验证码生成成功: {phone} ({purpose}), 验证码: {captcha_code}")
        
        return jsonify(
            success=True,
            message="验证码已生成",
            data={
                'phone': phone,
                'purpose': purpose,
                'image': captcha_data['image'],
                'expires_in': 300
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"Generate captcha error: {str(e)}")
        return jsonify(success=False, message="生成验证码失败，请稍后重试"), 500

@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    """重置密码"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        sms_code = data.get('smsCode')
        new_password = data.get('newPassword')
        
        # 验证手机号格式
        if not re.match(r'^1[3-9]\d{9}$', phone):
            return jsonify(success=False, message="手机号格式错误"), 400
        
        # 验证新密码长度
        if len(new_password) < 6:
            return jsonify(success=False, message="密码长度不能少于6位"), 400
        
        # 查询用户
        user = User.query.filter_by(phone=phone).first()
        if not user:
            return jsonify(success=False, message="用户不存在"), 404
        
        # 验证图片验证码
        redis_key = f'captcha:{phone}:reset'
        redis_client = get_redis_client()
        stored_code = redis_client.get(redis_key)
        if not stored_code:
            return jsonify(success=False, message="验证码错误或已过期"), 400
        
        # 处理存储的验证码，确保是字符串类型
        stored_code_str = stored_code.decode('utf-8') if isinstance(stored_code, bytes) else str(stored_code)
        if stored_code_str != sms_code:
            return jsonify(success=False, message="验证码错误或已过期"), 400
        
        # 更新密码
        user.set_password(new_password)
        db.session.commit()
        
        # 删除验证码
        redis_client.delete(redis_key)
        
        return jsonify(
            success=True,
            message="密码重置成功"
        )
        
    except Exception as e:
        current_app.logger.error(f"Reset password error: {str(e)}")
        return jsonify(success=False, message="重置密码失败，请稍后重试"), 500 