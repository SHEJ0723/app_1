import random
import string
import base64
from io import BytesIO

class CaptchaGenerator:
    @staticmethod
    def generate_text(length=4):
        """生成随机验证码文本"""
        # 排除容易混淆的字符
        characters = string.ascii_uppercase + string.digits
        characters = characters.replace('0', '').replace('O', '').replace('1', '').replace('I', '')
        return ''.join(random.choices(characters, k=length))

    @staticmethod
    def generate_captcha():
        """生成验证码图片 - 简化版本，返回SVG格式"""
        # 生成文本
        text = CaptchaGenerator.generate_text()
        
        # 创建SVG验证码
        svg_content = f'''
        <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" fill="white" stroke="#ddd" stroke-width="1"/>
            <text x="60" y="25" font-family="Arial, sans-serif" font-size="18" 
                  text-anchor="middle" fill="#333" font-weight="bold">{text}</text>
            <line x1="10" y1="15" x2="110" y2="25" stroke="#ddd" stroke-width="1"/>
            <line x1="10" y1="25" x2="110" y2="15" stroke="#ddd" stroke-width="1"/>
        </svg>
        '''
        
        # 转换为base64
        svg_bytes = svg_content.encode('utf-8')
        svg_b64 = base64.b64encode(svg_bytes).decode('utf-8')
        
        return {
            'text': text,
            'image': f'data:image/svg+xml;base64,{svg_b64}'
        } 