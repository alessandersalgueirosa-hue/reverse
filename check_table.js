const { query } = require('./db');

query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'mapeamentos_clientes' ORDER BY ordinal_position;").then(r => {
    console.log(JSON.stringify(r.rows));
}).catch(e => console.error('Error:', e));