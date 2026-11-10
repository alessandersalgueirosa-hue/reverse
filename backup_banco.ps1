$ErrorActionPreference = "Stop"
$data = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$pastaBackup = "E:\Backups\banco"
$arquivo = "$pastaBackup\marketing_db_$data.sql"

if (-not (Test-Path $pastaBackup)) {
    New-Item -ItemType Directory -Path $pastaBackup -Force | Out-Null
}

Write-Host "🔄 Iniciando backup do banco..." -ForegroundColor Cyan
docker exec projeto_novo-db-1 pg_dump -U admin -d marketing_db --no-owner --no-acl -F p > $arquivo

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no pg_dump. O container está rodando?" -ForegroundColor Red
    exit 1
}

$tamanho = (Get-Item $arquivo).Length / 1MB
Write-Host "✅ Backup criado: $arquivo ($([math]::Round($tamanho, 2)) MB)" -ForegroundColor Green

$zip = "$arquivo.zip"
Compress-Archive -Path $arquivo -DestinationPath $zip -Force
Remove-Item $arquivo
Write-Host "✅ Compactado: $zip" -ForegroundColor Green

$antigos = Get-ChildItem "$pastaBackup\*.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
if ($antigos) {
    $antigos | Remove-Item -Force
    Write-Host "🧹 Removidos $($antigos.Count) backups com mais de 30 dias" -ForegroundColor Yellow
}
Write-Host "✅ Backup concluído!" -ForegroundColor Green