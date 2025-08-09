from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.message import Message, Feedback, db
from models.user import User

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/api/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    """管理员发送消息给一个或多个用户"""
    data = request.get_json()
    sender_id = get_jwt_identity()
    receiver_ids = data.get('receiver_ids', [])
    content = data.get('content', '')
    if not receiver_ids or not content:
        return jsonify({'success': False, 'message': '缺少接收人或内容'}), 400
    messages = []
    for rid in receiver_ids:
        msg = Message(sender_id=sender_id, receiver_id=rid, content=content)
        messages.append(msg)
        db.session.add(msg)
    db.session.commit()
    return jsonify({'success': True, 'message': '消息已发送', 'count': len(messages)})

@messages_bp.route('/api/messages', methods=['GET'])
@jwt_required()
def get_messages():
    """用户获取自己的消息列表"""
    user_id = get_jwt_identity()
    msgs = Message.query.filter_by(receiver_id=user_id).order_by(Message.created_at.desc()).all()
    return jsonify({'success': True, 'data': [m.to_dict() for m in msgs]})

@messages_bp.route('/api/messages/<int:msg_id>', methods=['DELETE'])
@jwt_required()
def delete_message(msg_id):
    """用户删除自己的消息"""
    user_id = get_jwt_identity()
    msg = Message.query.get(msg_id)
    if not msg or msg.receiver_id != user_id:
        return jsonify({'success': False, 'message': '消息不存在或无权限'}), 404
    db.session.delete(msg)
    db.session.commit()
    return jsonify({'success': True, 'message': '消息已删除'})

@messages_bp.route('/api/messages/<int:msg_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_read(msg_id):
    user_id = get_jwt_identity()
    msg = Message.query.get(msg_id)
    if not msg or msg.receiver_id != user_id:
        return jsonify({'success': False, 'message': '消息不存在或无权限'}), 404
    msg.is_read = True
    db.session.commit()
    return jsonify({'success': True, 'message': '消息已标记为已读'})

@messages_bp.route('/api/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    """用户提交反馈"""
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'success': False, 'message': '反馈内容不能为空'}), 400
    fb = Feedback(user_id=user_id, content=content)
    db.session.add(fb)
    db.session.commit()
    return jsonify({'success': True, 'data': fb.to_dict()})

@messages_bp.route('/api/feedbacks', methods=['GET'])
@jwt_required()
def get_feedbacks():
    """管理员获取所有反馈"""
    # 仅管理员可查看全部反馈
    from models.user import Admin
    admin = Admin.query.get(get_jwt_identity())
    if not admin:
        return jsonify({'success': False, 'message': '无权限'}), 403
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify({'success': True, 'data': [f.to_dict() for f in feedbacks]})

@messages_bp.route('/api/feedbacks/<int:fid>/reply', methods=['PUT'])
@jwt_required()
def reply_feedback(fid):
    """管理员回复反馈"""
    from models.user import Admin
    admin = Admin.query.get(get_jwt_identity())
    if not admin:
        return jsonify({'success': False, 'message': '无权限'}), 403
    fb = Feedback.query.get(fid)
    if not fb:
        return jsonify({'success': False, 'message': '反馈不存在'}), 404
    data = request.get_json()
    reply = data.get('reply', '').strip()
    if not reply:
        return jsonify({'success': False, 'message': '回复内容不能为空'}), 400
    from datetime import datetime
    fb.reply = reply
    fb.reply_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True, 'data': fb.to_dict()}) 