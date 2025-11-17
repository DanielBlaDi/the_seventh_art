@echo off
if not exist ".env" (
  echo .env no encontrado.
  pause
  exit /b
)

@REM Cargar variables de entorno desde .env
for /f "usebackq tokens=1* delims==" %%A in (".env") do (
  set "%%A=%%B"
)


echo Levantando contenedores con Docker Compose...
docker compose up -d mysql || docker-compose up -d mysql

echo Ejecutando spring-boot:run...
cd Project

.\mvnw.cmd clean verify site -Dspring-boot.run.profiles=dev

