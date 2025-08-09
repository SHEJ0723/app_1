from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, db
from models.message import Feedback
from datetime import datetime

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/api/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    """提交反馈"""
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
        if not data.get('content'):
            return jsonify({
                'success': False,
                'message': '反馈内容不能为空'
            }), 400
        
        # 创建反馈记录
        feedback = Feedback(
            user_id=current_user_id,
            content=data['content']
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '反馈提交成功',
            'data': feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@feedback_bp.route('/api/feedback', methods=['GET'])
@jwt_required()
def get_user_feedback():
    """获取用户的反馈记录"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        # 获取分页参数
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        
        # 构建查询
        query = Feedback.query.filter_by(user_id=current_user_id)
        
        if search:
            query = query.filter(Feedback.content.contains(search))
        
        # 按创建时间倒序排列
        query = query.order_by(Feedback.created_at.desc())
        
        # 执行分页查询
        pagination = query.paginate(page=page, per_page=per_page)
        
        return jsonify({
            'success': True,
            'data': [feedback.to_dict() for feedback in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['GET'])
@jwt_required()
def get_feedback_detail(feedback_id):
    """获取反馈详情"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        feedback = Feedback.query.filter_by(
            id=feedback_id, 
            user_id=current_user_id
        ).first()
        
        if not feedback:
            return jsonify({
                'success': False,
                'message': '反馈记录不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': feedback.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['PUT'])
@jwt_required()
def update_feedback(feedback_id):
    """更新反馈（仅限未回复的反馈）"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        feedback = Feedback.query.filter_by(
            id=feedback_id, 
            user_id=current_user_id
        ).first()
        
        if not feedback:
            return jsonify({
                'success': False,
                'message': '反馈记录不存在'
            }), 404
        
        # 只有未回复的反馈可以修改
        if feedback.reply:
            return jsonify({
                'success': False,
                'message': '已回复的反馈不能修改'
            }), 400
        
        data = request.get_json()
        
        if data.get('content'):
            feedback.content = data['content']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '反馈更新成功',
            'data': feedback.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['DELETE'])
@jwt_required()
def delete_feedback(feedback_id):
    """删除反馈（仅限未回复的反馈）"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        feedback = Feedback.query.filter_by(
            id=feedback_id, 
            user_id=current_user_id
        ).first()
        
        if not feedback:
            return jsonify({
                'success': False,
                'message': '反馈记录不存在'
            }), 404
        
        # 只有未回复的反馈可以删除
        if feedback.reply:
            return jsonify({
                'success': False,
                'message': '已回复的反馈不能删除'
            }), 400
        
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '反馈删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500 