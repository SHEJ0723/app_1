#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试Redis客户端
"""

import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_redis():
    """测试Redis客户端"""
    try:
        print("测试Redis客户端...")
        from utils.redis_client import init_redis, get_redis_client
        from app import create_app
        
        app = create_app()
        with app.app_context():
            print("初始化Redis...")
            success = init_redis()
            print(f"Redis初始化结果: {success}")
            
            print("测试Redis操作...")
            # 获取Redis客户端
            redis_client = get_redis_client()
            print(f"Redis客户端类型: {type(redis_client)}")
            
            # 测试设置值
            result = redis_client.setex('test_key', 60, 'test_value')
            print(f"设置值结果: {result}")
            
            # 测试获取值
            value = redis_client.get('test_key')
            print(f"获取值结果: {value}")
            
            # 测试删除值
            result = redis_client.delete('test_key')
            print(f"删除值结果: {result}")
            
            print("Redis测试成功！")
        
    except Exception as e:
        print(f"Redis测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_redis() 
 