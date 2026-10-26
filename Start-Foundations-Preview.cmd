@echo off
setlocal
cd /d "%~dp0"
set "PORT=4190"
echo TechPath Foundations preview: http://127.0.0.1:4190/#lessons/python
echo Keep this window open while using the preview. Press Ctrl+C to stop.
node server.mjs
if errorlevel 1 pause
endlocal
