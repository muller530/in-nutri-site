#!/bin/bash

# 腾讯云部署兼容性检查脚本
# 使用方法: bash scripts/check-tencent.sh
# 或: npm run check:tencent

set -e

echo "🔍 开始检查腾讯云部署兼容性..."

ERRORS=0
WARNINGS=0

# 颜色输出
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 检查函数
check_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

check_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. 检查是否有 Edge Runtime 配置
echo ""
echo "1️⃣  检查 Edge Runtime 配置..."
if grep -r "export const runtime = 'edge'" app/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".next" | grep -v "node_modules"; then
    check_error "发现 Edge Runtime 配置，这会导致腾讯云部署失败"
else
    check_success "未发现 Edge Runtime 配置"
fi

# 2. 检查是否有 Cloudflare 特定 API
echo ""
echo "2️⃣  检查 Cloudflare 特定 API..."
if grep -r "Request.cf\|globalThis.DB\|globalThis.R2" app/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".next" | grep -v "node_modules" | grep -v "cloudflare.ts"; then
    check_warning "发现 Cloudflare 特定 API，请确保有降级方案"
else
    check_success "未发现 Cloudflare 特定 API（在非适配文件中）"
fi

# 3. 检查 next.config.js
echo ""
echo "3️⃣  检查 next.config.js..."
if grep -q "@cloudflare/next-on-pages" next.config.js 2>/dev/null; then
    check_warning "next.config.js 包含 Cloudflare 适配器配置，确保不影响标准构建"
else
    check_success "next.config.js 配置正常"
fi

# 4. 检查 package.json 依赖
echo ""
echo "4️⃣  检查依赖包..."
if grep -q "@cloudflare/workers-types\|@cloudflare/next-on-pages" package.json 2>/dev/null; then
    check_warning "发现 Cloudflare 相关依赖，确保它们是可选的"
else
    check_success "依赖包检查通过"
fi

# 5. 检查数据库配置
echo ""
echo "5️⃣  检查数据库配置..."
if grep -q "better-sqlite3" package.json; then
    check_success "包含 better-sqlite3，支持 SQLite"
else
    check_warning "未找到 better-sqlite3，确保有其他数据库支持"
fi

# 6. 检查环境变量文件
echo ""
echo "6️⃣  检查环境变量配置..."
if [ -f ".env.example" ]; then
    check_success "找到 .env.example 文件"
    if grep -q "DATABASE_URL\|NEXT_PUBLIC_BASE_URL\|SESSION_SECRET" .env.example; then
        check_success "环境变量示例文件包含必需变量"
    else
        check_warning ".env.example 缺少必需的环境变量"
    fi
else
    check_warning "未找到 .env.example 文件，建议创建"
fi

# 7. 检查构建脚本
echo ""
echo "7️⃣  检查构建脚本..."
if grep -q '"build":' package.json && grep -q '"start":' package.json; then
    check_success "包含 build 和 start 脚本"
else
    check_error "缺少必需的构建或启动脚本"
fi

# 8. 检查 PM2 配置
echo ""
echo "8️⃣  检查 PM2 配置..."
if [ -f "ecosystem.config.js" ]; then
    check_success "找到 PM2 配置文件"
else
    check_warning "未找到 ecosystem.config.js，建议创建用于生产部署"
fi

# 9. 尝试构建（可选，如果时间允许）
echo ""
echo "9️⃣  尝试构建项目..."
if npm run build > /dev/null 2>&1; then
    check_success "构建成功"
else
    check_error "构建失败，请检查错误信息"
    echo "运行 'npm run build' 查看详细错误"
fi

# 总结
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 检查总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！项目可以部署到腾讯云。${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WARNINGS 个警告，但可以部署。${NC}"
    echo "建议修复警告以确保最佳兼容性。"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个错误和 $WARNINGS 个警告。${NC}"
    echo "请修复错误后再部署。"
    exit 1
fi






