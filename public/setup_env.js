// setup_env.js
// Roda UMA VEZ para criar o arquivo .env com chaves seguras.
// Uso: node setup_env.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_PATH = path.join(__dirname, '.env');

if (fs.existsSync(ENV_PATH)) {
    console.log('⚠️  O arquivo .env já existe. Nada foi alterado.');
    console.log('   Para regenerar, apague o .env e rode este script de novo.');
    process.exit(0);
}

const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const MASTER_KEY = crypto.randomBytes(32).toString('hex');
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

const conteudo = `# ============================================================
# Reverse Marketing - Variaveis de Ambiente
# ============================================================
# ATENCAO: NAO comitar este arquivo no Git!
# ATENCAO: FACa BACKUP deste arquivo em local seguro.
#          Se perder a MASTER_KEY, as senhas criptografadas
#          no banco ficam IRRECUPERAVEIS.
# ============================================================

# --- Seguranca ---
JWT_SECRET=${JWT_SECRET}
MASTER_KEY=${MASTER_KEY}

# --- Servidor ---
PORT=${PORT}
BASE_URL=${BASE_URL}

# --- E-mail (fallback caso a tabela configuracoes falhe) ---
# Deixe vazio para forcar uso exclusivo da tabela de configuracoes
EMAIL_USER=
EMAIL_SENHA=
EMAIL_AGENCIA=

# --- Banco de Dados (fallback caso db.js leia do env) ---
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketing_db
DB_USER=admin
DB_PASSWORD=admin123
`;

fs.writeFileSync(ENV_PATH, conteudo, 'utf8');
console.log('✅ Arquivo .env criado com sucesso!');
console.log('');
console.log('   JWT_SECRET: gerado (64 caracteres hex)');
console.log('   MASTER_KEY: gerada  (64 caracteres hex)');
console.log('   PORT:       ' + PORT);
console.log('   BASE_URL:   ' + BASE_URL);
console.log('');
console.log('⚠️  BACKUP: copie o .env para um pendrive / gerenciador de senhas.');
console.log('   Se perder a MASTER_KEY, perde acesso às senhas criptografadas.');
console.log('');
console.log('⚠️  IMPORTANTE: como o JWT_SECRET mudou, todos os usuarios');
console.log('   logados precisarao fazer login de novo.');