@echo off
set BACKUP_DIR=E:\Projeto_Novo\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set DATA=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

docker exec -t projeto_novo-db-1 pg_dump -U admin -d marketing_db > "%BACKUP_DIR%\backup_%DATA%.sql"

echo Backup criado: %BACKUP_DIR%\backup_%DATA%.sql
pause