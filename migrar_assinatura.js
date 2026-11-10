const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'marketing_db', user: 'admin', password: 'SUA_SENHA' });

async function migrar() {
  await pool.query(`
    ALTER TABLE propostas
      ADD COLUMN IF NOT EXISTS token_aceite VARCHAR(64) UNIQUE,
      ADD COLUMN IF NOT EXISTS status_aceite VARCHAR(20) DEFAULT 'pendente',
      ADD COLUMN IF NOT EXISTS aceite_em TIMESTAMP,
      ADD COLUMN IF NOT EXISTS aceite_ip VARCHAR(45),
      ADD COLUMN IF NOT EXISTS aceite_user_agent TEXT,
      ADD COLUMN IF NOT EXISTS aceite_hash_pdf VARCHAR(64),
      ADD COLUMN IF NOT EXISTS recusa_motivo TEXT,
      ADD COLUMN IF NOT EXISTS recusa_em TIMESTAMP;
  `);
  console.log('✅ Colunas adicionadas em propostas.');
  await pool.end();
}
migrar().catch(console.error);