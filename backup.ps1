# ==========================================
# SCRIPT DE BACKUP AUTOMÁTICO - REVERSE MARKETING
# ==========================================

# --- CONFIGURAÇÕES ---
$NomeContainer = "projeto_novo-db-1" # ⚠️ Nome do seu container Docker
$UsuarioBanco  = "admin"          # Usuário padrão do Postgres
$NomeBanco     = "admin123"          # Nome do banco (geralmente postgres)

# --- VARIÁVEIS DE CAMINHO ---
$DataAtual = Get-Date -Format "yyyy-MM-dd_HH-mm"
$PastaBackup = ".\backups"
$PastaProjeto = "$PastaBackup\projeto_$DataAtual"
$ArquivoBanco = "$PastaBackup\banco_$DataAtual.sql"
$ArquivoZip = "$PastaBackup\Backup_Full_ReverseMarketing_$DataAtual.zip"

# Cria a pasta de backups se não existir
if (-not (Test-Path -Path $PastaBackup)) {
    New-Item -ItemType Directory -Path $PastaBackup | Out-Null
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " 🚀 INICIANDO BACKUP DO SISTEMA" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Exportando o Banco de Dados
Write-Host "📦 1. Exportando banco de dados do Docker..." -ForegroundColor Yellow
docker exec -t $NomeContainer pg_dump -U $UsuarioBanco -d $NomeBanco > $ArquivoBanco

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Banco exportado com sucesso: $ArquivoBanco" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao exportar o banco. Verifique se o Docker está rodando." -ForegroundColor Red
}

# 2. Copiando os arquivos do projeto (Excluindo node_modules e backups)
Write-Host "📁 2. Copiando arquivos do projeto..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $PastaProjeto | Out-Null

# Copia tudo, exceto node_modules e a própria pasta backups
Get-ChildItem -Path .\* -Exclude node_modules, backups | Copy-Item -Destination $PastaProjeto -Recurse -Force
Write-Host "   ✅ Arquivos copiados para: $PastaProjeto" -ForegroundColor Green

# 3. Compactando tudo em um arquivo ZIP
Write-Host "🗜️ 3. Compactando arquivos em .ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$PastaProjeto\*", $ArquivoBanco -DestinationPath $ArquivoZip -Force

if (Test-Path $ArquivoZip) {
    Write-Host "   ✅ Backup compactado com sucesso!" -ForegroundColor Green
    # Limpa as pastas temporárias
    Remove-Item -Path $PastaProjeto -Recurse -Force
    Remove-Item -Path $ArquivoBanco -Force
} else {
    Write-Host "   ❌ Erro ao criar o arquivo ZIP." -ForegroundColor Red
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " 🎉 BACKUP CONCLUÍDO!" -ForegroundColor Green
Write-Host " Arquivo gerado: $ArquivoZip" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan