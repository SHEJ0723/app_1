from functools import wraps
from flask import request, jsonify, current_app
import jwt
from datetime import datetime, timedelta
from models.user import User, Admin
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def generate_token(user_id):
    """生成JWT令牌"""
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            current_app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )
    except Exception as e:
        return None

def token_required(f):
    """验证JWT令牌的装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': '无效的认证头部'}), 401

        if not token:
            return jsonify({'message': '缺少令牌'}), 401

        try:
            payload = jwt.decode(
                token,
                current_app.config.get('SECRET_KEY'),
                algorithms=['HS256']
            )
            current_user = User.query.get(payload['sub'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': '令牌已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': '无效的令牌'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        admin_id = get_jwt_identity()
        admin = Admin.query.get(admin_id)
        if not admin:
            return jsonify({'message': '管理员不存在'}), 403
        request.admin_id = admin.id
        return fn(*args, **kwargs)
    return wrapper 