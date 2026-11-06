const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

pool.on('connect', () => {
  console.log('Conexão com PostgreSQL estabelecida');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com PostgreSQL:', err);
  process.exit(-1);
});

const sql = fs.readFileSync('./database/20240101_create_produtos_table.sql', 'utf8');

pool.query(sql).then(() => {
  console.log('Tabela produtos criada com sucesso');
  pool.end();
  process.exit(0);
}).catch(err => {
  console.error('Erro ao criar tabela:', err);
  pool.end();
  process.exit(1);
});