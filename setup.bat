@echo off

if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
        if "%%A" equ "HOST_PORT" set HOST_PORT=%%B
    )
)

timeout /t 1 >nul

where docker >nul 2>nul || (
    echo  Docker no está disponible. Instálalo antes de continuar.
    pause
    exit /b
)

echo Levantando contenedores con Docker Compose...
docker compose up -d --build --wait || docker-compose up -d --build --wait
echo Contenedores en ejecución.
timeout /t 1 >nul

echo Todo listo. La aplicación está corriendo en:
echo http://localhost:%HOST_PORT%
echo =======================================================
pause
