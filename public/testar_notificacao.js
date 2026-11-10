const { Pool } = require('pg');

const p = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin123',
    database: 'marketing_db'
});

p.query("INSERT INTO notificacoes (cliente_id, titulo, mensagem, link) VALUES (1, 'Teste de Notificação', 'O sino está funcionando perfeitamente!', '#') RETURNING *")
 .then(r => {
    console.log('✅ Notificação criada com sucesso!');
    console.table(r.rows);
    p.end();
 })
 .catch(e => {
    console.error('❌ Erro ao criar notificação:', e.message);
    p.end();
 });