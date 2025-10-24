@echo off
REM =====================================
REM BLOQUE 1: Configuración inicial
REM =====================================
set REPO_URL=https://github.com/DanielBlaDi/the_seventh_art.git
set APP_DIR=rocky
set BRANCH=feature/entities-creation

REM =====================================
REM BLOQUE 2: Clonado o actualización
REM =====================================
IF NOT EXIST "%APP_DIR%" (
    git clone %REPO_URL% %APP_DIR%
    cd %APP_DIR%
    git checkout -b %BRANCH%
    git pull origin %BRANCH%
    cd ..
)
IF EXIST "%APP_DIR%" (
    cd %APP_DIR%
    git checkout %BRANCH%
    git pull
    cd ..
)

REM =====================================
REM BLOQUE 3: Construcción del proyecto
REM =====================================
cd %APP_DIR%
cd Project
call mvnw.cmd clean package -DskipTests
cd ..

REM =====================================
REM BLOQUE 4: Despliegue con Docker
REM =====================================
docker compose down
docker compose up -d --build

REM =====================================
REM BLOQUE 5: Información final
REM =====================================
echo Aplicación levantada en http://localhost:8080
pause
