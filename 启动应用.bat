@echo off

REM 获取脚本所在目录
set "script_dir=%~dp0"

REM 进入脚本所在目录
cd /d "%script_dir%"

REM 启动HTTP服务器
start python -m http.server 8000

REM 等待服务器启动
timeout /t 2 /nobreak >nul

REM 自动打开浏览器
start http://localhost:8000/
