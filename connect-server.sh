#!/bin/bash

# SSH连接腾讯云服务器辅助脚本

SERVER_IP="115.159.92.235"
USER="root"

echo "🔗 连接到腾讯云服务器: $SERVER_IP"
echo ""
echo "如果遇到 'Permission denied' 错误，请尝试以下方法："
echo ""
echo "方法1: 使用密码登录（推荐）"
echo "  1. 在腾讯云控制台重置密码"
echo "  2. 运行: ssh $USER@$SERVER_IP"
echo ""
echo "方法2: 强制使用密码认证"
echo "  运行: ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no $USER@$SERVER_IP"
echo ""
echo "方法3: 使用腾讯云Web终端（最简单）"
echo "  1. 登录腾讯云控制台"
echo "  2. 进入轻量应用服务器 -> 服务器"
echo "  3. 点击您的服务器 -> 点击'登录'按钮"
echo ""
echo "正在尝试连接..."
echo ""

# 尝试连接
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no $USER@$SERVER_IP

