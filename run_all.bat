@echo off

:: Start Spring Boot backend
start "Backend" cmd /c "cd /d %~dp0 && mvn spring-boot:run"

:: Wait a few seconds to ensure backend starts (safer wait using ping)
ping 127.0.0.1 -n 6 > nul

:: Start Angular frontend
start "Frontend" cmd /c "cd /d %~dp0\frontend && npm install --legacy-peer-deps && npm start"

:: Keep this script window open
pause


