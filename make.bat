@echo off
rem Windows Batch script mirroring Makefile targets for APAAR-Verify

if "%1"=="" goto dev
if "%1"=="dev" goto dev
if "%1"=="build" goto build
if "%1"=="test" goto test
if "%1"=="check-i18n" goto check_i18n
if "%1"=="docker-up" goto docker_up
if "%1"=="docker-down" goto docker_down
if "%1"=="ml-eval" goto ml_eval

echo Unknown command: %1
echo Available: dev, build, test, check-i18n, docker-up, docker-down, ml-eval
exit /b 1

:dev
npm run dev
goto end

:build
npm run build
goto end

:test
node scripts\check-i18n.js
npm test
goto end

:check_i18n
node scripts\check-i18n.js
goto end

:docker_up
docker compose up --build
goto end

:docker_down
docker compose down
goto end

:ml_eval
python ml\evaluation\evaluate.py
goto end

:end
