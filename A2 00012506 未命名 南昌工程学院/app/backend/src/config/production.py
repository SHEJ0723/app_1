import os
from datetime import timedelta
from .config import Config

class ProductionConfig(Config):
    """生产环境配置"""
    
    # 基础配置
    DEBUG = False
    TESTING = False
    
    # 安全配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'production-secret-key-change-this'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=2)
    
    # 数据库配置
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'production-jwt-secret-key-change-this'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_CSRF_PROTECT = True
    
    # CORS配置
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'https://yourdomain.com').split(',')
    CORS_SUPPORTS_CREDENTIALS = True
    
    # Redis配置
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # 日志配置
    LOG_LEVEL = 'INFO'
    LOG_FILE = '/var/log/parking_system/app.log'
    
    # 文件上传配置
    UPLOAD_FOLDER = '/var/www/uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # 分页配置
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # 缓存配置
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = REDIS_URL
    CACHE_DEFAULT_TIMEOUT = 300
    
    # 性能配置
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False
    
    @classmethod
    def init_app(cls, app):
        """初始化生产环境配置"""
        Config.init_app(app)
        
        # 生产环境日志配置
        import logging
        from logging.handlers import RotatingFileHandler
        
        # 确保日志目录存在
        log_dir = os.path.dirname(cls.LOG_FILE)
        os.makedirs(log_dir, exist_ok=True)
        
        # 文件日志处理器
        file_handler = RotatingFileHandler(
            cls.LOG_FILE, 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        # 设置日志级别
        app.logger.setLevel(logging.INFO)
        app.logger.info('生产环境应用启动')
        
        # 安全头配置
        @app.after_request
        def add_security_headers(response):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
            return response 