@echo off
REM Запуск локального веб-сервера для Japan-Weather
echo Запускаю сервер на http://localhost:8000
echo Нажми Ctrl+C чтобы остановить сервер
python -m http.server 8000
pause
