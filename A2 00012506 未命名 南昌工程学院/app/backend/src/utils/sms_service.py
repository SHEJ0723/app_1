#!/usr/bin/env python3
"""
短信服务工具类
支持阿里云短信服务
"""

import json
import time
import hashlib
import hmac
import base64
import requests
from urllib.parse import quote
import logging

logger = logging.getLogger(__name__)

class SMSService:
    """短信服务类"""
    
    def __init__(self, access_key_id=None, access_key_secret=None, sign_name=None, template_code=None):
        """
        初始化短信服务
        
        Args:
            access_key_id: 阿里云AccessKey ID
            access_key_secret: 阿里云AccessKey Secret
            sign_name: 短信签名
            template_code: 短信模板代码
        """
        # 从环境变量或配置文件读取配置
        self.access_key_id = access_key_id or 'your_access_key_id'
        self.access_key_secret = access_key_secret or 'your_access_key_secret'
        self.sign_name = sign_name or '智慧停车'
        self.template_code = template_code or 'SMS_123456789'
        
        # 阿里云短信服务配置
        self.endpoint = 'https://dysmsapi.aliyuncs.com'
        self.api_version = '2017-05-25'
        self.action = 'SendSms'
        
        # 是否启用真实发送（开发环境可以关闭）
        self.enable_real_send = True
        
    def _generate_signature(self, params, timestamp):
        """生成签名"""
        # 按参数名排序
        sorted_params = sorted(params.items())
        
        # 构建规范化请求字符串
        canonicalized_query_string = '&'.join([f"{k}={quote(str(v), safe='')}" for k, v in sorted_params])
        
        # 构建待签名字符串
        string_to_sign = f"GET&{quote('/', safe='')}&{quote(canonicalized_query_string, safe='')}"
        
        # 计算签名
        key = f"{self.access_key_secret}&"
        signature = base64.b64encode(
            hmac.new(key.encode('utf-8'), string_to_sign.encode('utf-8'), hashlib.sha1).digest()
        ).decode('utf-8')
        
        return signature
    
    def send_sms(self, phone_number, code, purpose='reset'):
        """
        发送短信验证码
        
        Args:
            phone_number: 手机号
            code: 验证码
            purpose: 用途（reset/register）
            
        Returns:
            dict: 发送结果
        """
        try:
            # 开发环境：模拟发送
            if not self.enable_real_send:
                logger.info(f"模拟发送短信到 {phone_number}: 验证码 {code} (用途: {purpose})")
                return {
                    'success': True,
                    'message': '验证码发送成功（模拟）',
                    'request_id': f'mock_{int(time.time())}'
                }
            
            # 生产环境：真实发送
            timestamp = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            
            # 构建请求参数
            params = {
                'Action': self.action,
                'Version': self.api_version,
                'Format': 'JSON',
                'Timestamp': timestamp,
                'SignatureMethod': 'HMAC-SHA1',
                'SignatureVersion': '1.0',
                'SignatureNonce': str(int(time.time() * 1000)),
                'AccessKeyId': self.access_key_id,
                'SignName': self.sign_name,
                'TemplateCode': self.template_code,
                'TemplateParam': json.dumps({'code': code}),
                'PhoneNumbers': phone_number
            }
            
            # 生成签名
            signature = self._generate_signature(params, timestamp)
            params['Signature'] = signature
            
            # 发送请求
            response = requests.get(self.endpoint, params=params, timeout=10)
            result = response.json()
            
            if result.get('Code') == 'OK':
                logger.info(f"短信发送成功: {phone_number}, 验证码: {code}")
                return {
                    'success': True,
                    'message': '验证码发送成功',
                    'request_id': result.get('RequestId')
                }
            else:
                logger.error(f"短信发送失败: {result}")
                return {
                    'success': False,
                    'message': f"短信发送失败: {result.get('Message', '未知错误')}",
                    'error_code': result.get('Code')
                }
                
        except Exception as e:
            logger.error(f"短信发送异常: {str(e)}")
            return {
                'success': False,
                'message': f"短信发送异常: {str(e)}"
            }
    
    def validate_phone(self, phone_number):
        """
        验证手机号格式
        
        Args:
            phone_number: 手机号
            
        Returns:
            bool: 是否有效
        """
        import re
        pattern = r'^1[3-9]\d{9}$'
        return bool(re.match(pattern, phone_number))

# 创建全局实例
sms_service = SMSService()

def send_verification_code(phone_number, code, purpose='reset'):
    """
    发送验证码的便捷函数
    
    Args:
        phone_number: 手机号
        code: 验证码
        purpose: 用途
        
    Returns:
        dict: 发送结果
    """
    return sms_service.send_sms(phone_number, code, purpose)

def is_valid_phone(phone_number):
    """
    验证手机号格式的便捷函数
    
    Args:
        phone_number: 手机号
        
    Returns:
        bool: 是否有效
    """
    return sms_service.validate_phone(phone_number) 