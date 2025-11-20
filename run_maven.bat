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


echo Esperando a que MySQL esté completamente listo (5 segundos)...
timeout /t 5 /nobreak > nul

echo Verificando estado de MySQL...
docker compose ps mysql || docker-compose ps mysql


echo Ejecutando spring-boot:run...
cd Project
./mvnw.cmd -Dspring-boot.run.profiles=dev spring-boot:run

@REM @REM sirve para revisar las variables de entorno cargadas
@REM echo ---- ENV cargadas ----
@REM echo DB_HOST=%DB_HOST%
@REM echo DB_PORT=%DB_PORT%
@REM echo DB_NAME=%DB_NAME%
@REM echo LOCAL_DB_HOST=%LOCAL_DB_HOST%
@REM echo LOCAL_DB_PORT=%LOCAL_DB_PORT%
@REM echo DB_USER=%DB_USER%
@REM echo DB_PASSWORD=%DB_PASSWORD%
@REM echo SERVER_PORT=%SERVER_PORT%
@REM echo TZ=%TZ%
@REM echo -----------------------

