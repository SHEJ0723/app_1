import redis
from flask import current_app
import logging

# 全局Redis客户端
redis_client = None

def init_redis():
    """初始化Redis连接"""
    global redis_client
    if redis_client is not None:
        return True  # 已经初始化过了
    
    try:
        redis_url = current_app.config.get('REDIS_URL', 'redis://localhost:6379/0')
        real_redis = redis.from_url(redis_url, decode_responses=True)
        # 测试连接
        real_redis.ping()
        current_app.logger.info("Redis连接成功")
        # 使用真实的Redis客户端
        redis_client = real_redis
        return True
    except Exception as e:
        current_app.logger.warning(f"Redis连接失败: {e}")
        # 创建一个模拟的Redis客户端
        redis_client = MockRedisClient()
        return False

def get_redis_client():
    """获取Redis客户端，如果未初始化则先初始化"""
    global redis_client
    if redis_client is None:
        init_redis()
    return redis_client

class MockRedisClient:
    """模拟Redis客户端，用于开发环境"""
    
    def __init__(self):
        self._storage = {}
        current_app.logger.info("使用模拟Redis客户端")
    
    def get(self, key):
        """获取值"""
        return self._storage.get(key)
    
    def set(self, key, value, ex=None):
        """设置值"""
        self._storage[key] = value
        return True
    
    def setex(self, key, seconds, value):
        """设置值，带过期时间"""
        self._storage[key] = value
        return True
    
    def delete(self, key):
        """删除值"""
        if key in self._storage:
            del self._storage[key]
        return True
    
    def ping(self):
        """测试连接"""
        return True 