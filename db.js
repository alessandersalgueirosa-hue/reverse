const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin123',
    database: 'marketing_db',
});

// Teste de conexão
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Conectado ao PostgreSQL com sucesso!'))
    .catch(err => console.error('❌ Erro na conexão com PostgreSQL:', err.message));

module.exports = pool;