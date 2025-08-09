import os
from datetime import timedelta

class Config:
    """应用配置类"""
    
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # 数据库配置
    # 获取当前文件所在目录的绝对路径
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    instance_path = os.path.join(basedir, 'instance')
    db_path = os.path.join(instance_path, 'app.db')
    
    # 确保instance目录存在
    os.makedirs(instance_path, exist_ok=True)
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{db_path}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS配置
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Redis配置
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # AI服务配置
    HUNYUAN_API_URL = os.environ.get('HUNYUAN_API_URL') or "https://api.hunyuan.cloud.tencent.com/v1/chat/completions"
    HUNYUAN_API_KEY = os.environ.get('HUNYUAN_API_KEY') or "sk-JNJEQDVpv205ZyecxSrySIHQqEov51R7SeB9g9jweE55aikC"
    
    # 短信服务配置
    SMS_API_KEY = os.environ.get('SMS_API_KEY') or ''
    SMS_SECRET_KEY = os.environ.get('SMS_SECRET_KEY') or ''
    
    # 文件上传配置
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # 日志配置
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    LOG_FILE = os.environ.get('LOG_FILE') or 'logs/app.log'
    
    # 安全配置
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=10)
    
    # 分页配置
    DEFAULT_PAGE_SIZE = int(os.environ.get('DEFAULT_PAGE_SIZE') or 20)
    MAX_PAGE_SIZE = int(os.environ.get('MAX_PAGE_SIZE') or 100)
    
    # 缓存配置
    CACHE_TYPE = os.environ.get('CACHE_TYPE') or 'simple'
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT') or 300)
    
    @staticmethod
    def init_app(app):
        """初始化应用配置"""
        # 创建必要的目录
        os.makedirs('logs', exist_ok=True)
        os.makedirs('uploads', exist_ok=True)
        os.makedirs('instance', exist_ok=True)
    
class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    # 使用绝对路径
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    instance_path = os.path.join(basedir, 'instance')
    db_path = os.path.join(instance_path, 'app.db')
    os.makedirs(instance_path, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # 生产环境日志配置
        import logging
        from logging.handlers import RotatingFileHandler
        
        if not app.debug and not app.testing:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240000, backupCount=10)
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            app.logger.setLevel(logging.INFO)
            app.logger.info('应用启动')

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 