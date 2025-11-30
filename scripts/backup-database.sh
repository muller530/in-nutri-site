#!/bin/bash

# 数据库备份脚本
# 使用方法: bash scripts/backup-database.sh

set -e

echo "📦 开始备份数据库..."

# 获取当前日期时间
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DB_FILE="./db/sqlite.db"
BACKUP_FILE="$BACKUP_DIR/sqlite_${TIMESTAMP}.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
    echo "⚠️  数据库文件不存在: $DB_FILE"
    exit 1
fi

# 备份数据库
echo "📋 备份数据库到: $BACKUP_FILE"
cp "$DB_FILE" "$BACKUP_FILE"

# 压缩备份（可选）
if command -v gzip &> /dev/null; then
    echo "🗜️  压缩备份文件..."
    gzip -f "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
fi

# 获取文件大小
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ 数据库备份完成！"
echo "📁 备份文件: $BACKUP_FILE"
echo "📊 文件大小: $FILE_SIZE"

# 保留最近10个备份
echo "🧹 清理旧备份（保留最近10个）..."
ls -t $BACKUP_DIR/sqlite_*.db* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

echo "✅ 备份流程完成！"

