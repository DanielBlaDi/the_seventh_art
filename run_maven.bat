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
@REM ./mvnw.cmd -Dspring-boot.run.profiles=dev spring-boot:run

@REM sirve para revisar las variables de entorno cargadas
echo ---- ENV cargadas ----
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_NAME=%DB_NAME%
echo LOCAL_DB_HOST=%LOCAL_DB_HOST%
echo LOCAL_DB_PORT=%LOCAL_DB_PORT%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo SERVER_PORT=%SERVER_PORT%
echo TZ=%TZ%
echo -----------------------

