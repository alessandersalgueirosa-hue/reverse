const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

const sql = `CREATE TABLE IF NOT EXISTS criativos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    titulo VARCHAR(255) NOT NULL,
    url_arquivo TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente',
    feedback_cliente TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

pool.query(sql).then(() => {
  console.log('Tabela criativos criada com sucesso');
  pool.end();
  process.exit(0);
}).catch((err) => {
  console.error('Erro ao criar tabela:', err.message);
  pool.end();
  process.exit(1);
});