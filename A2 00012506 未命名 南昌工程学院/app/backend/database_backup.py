#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import subprocess
import datetime
import json
from pathlib import Path

class DatabaseBackup:
    """数据库备份和恢复工具"""
    
    def __init__(self):
        self.db_name = "parking_automation_system"
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        
        # 数据库连接配置
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'hhazj0723',
            'port': 3306,
            'charset': 'utf8mb4'
        }
    
    def create_backup(self, backup_name=None):
        """创建数据库备份"""
        if not backup_name:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"parking_system_backup_{timestamp}.sql"
        
        backup_path = self.backup_dir / backup_name
        
        # 构建mysqldump命令
        cmd = [
            'mysqldump',
            f'--host={self.db_config["host"]}',
            f'--user={self.db_config["user"]}',
            f'--password={self.db_config["password"]}',
            f'--port={self.db_config["port"]}',
            '--single-transaction',
            '--routines',
            '--triggers',
            '--set-charset',
            '--default-character-set=utf8mb4',
            self.db_name
        ]
        
        try:
            print(f"🔄 正在创建数据库备份: {backup_name}")
            
            # 执行备份命令
            with open(backup_path, 'w', encoding='utf-8') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
            
            if result.returncode == 0:
                file_size = backup_path.stat().st_size / (1024 * 1024)  # MB
                print(f"✅ 备份创建成功!")
                print(f"📁 备份文件: {backup_path}")
                print(f"📊 文件大小: {file_size:.2f} MB")
                return str(backup_path)
            else:
                print(f"❌ 备份失败: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ 备份过程中出错: {str(e)}")
            return None
    
    def restore_backup(self, backup_file):
        """恢复数据库备份"""
        backup_path = Path(backup_file)
        
        if not backup_path.exists():
            print(f"❌ 备份文件不存在: {backup_file}")
            return False
        
        # 构建mysql命令
        cmd = [
            'mysql',
            f'--host={self.db_config["host"]}',
            f'--user={self.db_config["user"]}',
            f'--password={self.db_config["password"]}',
            f'--port={self.db_config["port"]}',
            '--default-character-set=utf8mb4',
            self.db_name
        ]
        
        try:
            print(f"🔄 正在恢复数据库备份: {backup_file}")
            
            # 执行恢复命令
            with open(backup_path, 'r', encoding='utf-8') as f:
                result = subprocess.run(cmd, stdin=f, stderr=subprocess.PIPE, text=True)
            
            if result.returncode == 0:
                print("✅ 数据库恢复成功!")
                return True
            else:
                print(f"❌ 恢复失败: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ 恢复过程中出错: {str(e)}")
            return False
    
    def list_backups(self):
        """列出所有备份文件"""
        backups = []
        for backup_file in self.backup_dir.glob("*.sql"):
            stat = backup_file.stat()
            backups.append({
                'name': backup_file.name,
                'size': stat.st_size,
                'created': datetime.datetime.fromtimestamp(stat.st_mtime),
                'path': str(backup_file)
            })
        
        # 按创建时间排序
        backups.sort(key=lambda x: x['created'], reverse=True)
        
        print("📋 可用备份文件:")
        print("-" * 80)
        for backup in backups:
            size_mb = backup['size'] / (1024 * 1024)
            created_str = backup['created'].strftime("%Y-%m-%d %H:%M:%S")
            print(f"📁 {backup['name']}")
            print(f"   📊 大小: {size_mb:.2f} MB")
            print(f"   📅 创建时间: {created_str}")
            print()
        
        return backups
    
    def cleanup_old_backups(self, keep_days=30):
        """清理旧备份文件"""
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=keep_days)
        deleted_count = 0
        
        for backup_file in self.backup_dir.glob("*.sql"):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                try:
                    backup_file.unlink()
                    deleted_count += 1
                    print(f"🗑️ 已删除旧备份: {backup_file.name}")
                except Exception as e:
                    print(f"❌ 删除备份失败 {backup_file.name}: {str(e)}")
        
        print(f"✅ 清理完成，删除了 {deleted_count} 个旧备份文件")
    
    def export_data_only(self, tables=None):
        """仅导出数据（不包含结构）"""
        if not tables:
            tables = [
                'users', 'admins', 'license_plates', 'parking_spots',
                'orders', 'bills', 'messages', 'feedbacks',
                'system_config', 'system_logs'
            ]
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        export_name = f"data_export_{timestamp}.sql"
        export_path = self.backup_dir / export_name
        
        try:
            print(f"🔄 正在导出数据: {export_name}")
            
            # 为每个表创建INSERT语句
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write("-- 数据导出文件\n")
                f.write(f"-- 导出时间: {datetime.datetime.now()}\n")
                f.write("-- 仅包含数据，不包含表结构\n\n")
                
                for table in tables:
                    # 获取表数据
                    cmd = [
                        'mysqldump',
                        f'--host={self.db_config["host"]}',
                        f'--user={self.db_config["user"]}',
                        f'--password={self.db_config["password"]}',
                        f'--port={self.db_config["port"]}',
                        '--no-create-info',  # 不包含CREATE语句
                        '--skip-add-drop-table',
                        '--skip-add-locks',
                        '--skip-disable-keys',
                        '--skip-set-charset',
                        self.db_name,
                        table
                    ]
                    
                    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                    
                    if result.returncode == 0:
                        f.write(f"-- 表: {table}\n")
                        f.write(result.stdout)
                        f.write("\n\n")
                        print(f"  ✅ 已导出表: {table}")
                    else:
                        print(f"  ❌ 导出表失败 {table}: {result.stderr}")
            
            file_size = export_path.stat().st_size / (1024 * 1024)
            print(f"✅ 数据导出完成!")
            print(f"📁 导出文件: {export_path}")
            print(f"📊 文件大小: {file_size:.2f} MB")
            return str(export_path)
            
        except Exception as e:
            print(f"❌ 数据导出失败: {str(e)}")
            return None

def main():
    """主函数"""
    backup_tool = DatabaseBackup()
    
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python database_backup.py backup          # 创建备份")
        print("  python database_backup.py restore <file>  # 恢复备份")
        print("  python database_backup.py list            # 列出备份")
        print("  python database_backup.py cleanup         # 清理旧备份")
        print("  python database_backup.py export          # 导出数据")
        return
    
    command = sys.argv[1]
    
    if command == "backup":
        backup_file = backup_tool.create_backup()
        if backup_file:
            print(f"✅ 备份完成: {backup_file}")
    
    elif command == "restore":
        if len(sys.argv) < 3:
            print("❌ 请指定备份文件路径")
            return
        backup_file = sys.argv[2]
        if backup_tool.restore_backup(backup_file):
            print("✅ 恢复完成")
    
    elif command == "list":
        backup_tool.list_backups()
    
    elif command == "cleanup":
        backup_tool.cleanup_old_backups()
    
    elif command == "export":
        backup_tool.export_data_only()
    
    else:
        print(f"❌ 未知命令: {command}")

if __name__ == "__main__":
    main() 