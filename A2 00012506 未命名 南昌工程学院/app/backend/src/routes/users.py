from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, db
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/users/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """获取用户个人信息"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@users_bp.route('/api/users/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """更新用户个人信息"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        # 更新允许的字段
        if data.get('name'):
            user.name = data['name']
        if data.get('email'):
            # 检查邮箱是否已被其他用户使用
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user_id:
                return jsonify({
                    'success': False,
                    'message': '该邮箱已被其他用户使用'
                }), 400
            user.email = data['email']
        if data.get('avatar_url'):
            user.avatar_url = data['avatar_url']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '个人信息更新成功',
            'data': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@users_bp.route('/api/users/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """修改密码"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        # 验证必要字段
        if not data.get('old_password') or not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': '旧密码和新密码不能为空'
            }), 400
        
        # 验证旧密码
        if not user.check_password(data['old_password']):
            return jsonify({
                'success': False,
                'message': '旧密码错误'
            }), 400
        
        # 验证新密码长度
        if len(data['new_password']) < 6:
            return jsonify({
                'success': False,
                'message': '新密码长度不能少于6位'
            }), 400
        
        # 更新密码
        user.set_password(data['new_password'])
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '密码修改成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@users_bp.route('/api/users/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """上传头像"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        if not data.get('avatar_url'):
            return jsonify({
                'success': False,
                'message': '头像URL不能为空'
            }), 400
        
        user.avatar_url = data['avatar_url']
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '头像上传成功',
            'data': {
                'avatar_url': user.avatar_url
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# 管理员用户管理路由
@users_bp.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_users_admin():
    """管理员获取用户列表"""
    try:
        # 检查当前用户是否为管理员
        current_user_id = get_jwt_identity()
        from models.user import Admin
        admin = Admin.query.get(current_user_id)
        if not admin:
            return jsonify({
                'success': False,
                'message': '权限不足'
            }), 403
        
        # 获取分页参数
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 10))
        keyword = request.args.get('keyword', '')
        
        # 构建查询
        query = User.query
        if keyword:
            query = query.filter(
                db.or_(
                    User.name.contains(keyword),
                    User.phone.contains(keyword),
                    User.email.contains(keyword)
                )
            )
        
        # 执行分页查询
        pagination = query.paginate(page=page, per_page=page_size)
        
        return jsonify({
            'success': True,
            'list': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'page': page,
            'pageSize': page_size
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@users_bp.route('/api/admin/users', methods=['POST'])
@jwt_required()
def add_user_admin():
    """管理员添加用户"""
    try:
        # 检查当前用户是否为管理员
        current_user_id = get_jwt_identity()
        from models.user import Admin
        admin = Admin.query.get(current_user_id)
        if not admin:
            return jsonify({
                'success': False,
                'message': '权限不足'
            }), 403
        
        data = request.get_json()
        
        # 验证必要字段
        if not data.get('name') or not data.get('phone') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': '缺少必要参数'
            }), 400
        
        # 检查手机号是否已存在
        if User.query.filter_by(phone=data['phone']).first():
            return jsonify({
                'success': False,
                'message': '手机号已被使用'
            }), 400
        
        # 创建新用户
        user = User(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            status=data.get('status', 'active')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '用户创建成功',
            'data': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@users_bp.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_admin(user_id):
    """管理员更新用户"""
    try:
        # 检查当前用户是否为管理员
        current_user_id = get_jwt_identity()
        from models.user import Admin
        admin = Admin.query.get(current_user_id)
        if not admin:
            return jsonify({
                'success': False,
                'message': '权限不足'
            }), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        # 更新字段
        if data.get('name'):
            user.name = data['name']
        if data.get('phone'):
            # 检查手机号是否已被其他用户使用
            existing_user = User.query.filter_by(phone=data['phone']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({
                    'success': False,
                    'message': '手机号已被其他用户使用'
                }), 400
            user.phone = data['phone']
        if data.get('email'):
            user.email = data['email']
        if data.get('status'):
            user.status = data['status']
        if data.get('password'):
            user.set_password(data['password'])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '用户更新成功',
            'data': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@users_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_admin(user_id):
    """管理员删除用户"""
    try:
        # 检查当前用户是否为管理员
        current_user_id = get_jwt_identity()
        from models.user import Admin
        admin = Admin.query.get(current_user_id)
        if not admin:
            return jsonify({
                'success': False,
                'message': '权限不足'
            }), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '用户删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500