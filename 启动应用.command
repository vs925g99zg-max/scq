#!/bin/bash

# 获取脚本所在目录
script_dir=$(dirname "$(realpath "$0")")

# 进入脚本所在目录
cd "$script_dir"

# 启动HTTP服务器
python3 -m http.server 8000 &

# 等待服务器启动
sleep 2

# 自动打开浏览器
open http://localhost:8000/
