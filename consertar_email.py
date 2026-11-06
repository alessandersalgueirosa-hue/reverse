import subprocess
import os

print("1️⃣ Instalando a biblioteca nodemailer...")
os.system("npm install nodemailer")

print("\n2️⃣ Garantindo que a tabela existe no banco de dados...")
comando_sql = 'docker exec -i projeto_novo-db-1 psql -U admin -d marketing_db -c "CREATE TABLE IF NOT EXISTS email_configuracoes (id SERIAL PRIMARY KEY, host VARCHAR(255), port INT, user_email VARCHAR(255), pass VARCHAR(255), remetente_nome VARCHAR(255), brevo_api_key VARCHAR(255));"'
os.system(comando_sql)

print("\n3️⃣ Reiniciando o servidor para aplicar as mudanças...")
os.system("docker compose restart")

print("\n✅ Tudo pronto! Tente salvar as configurações novamente no navegador.")