// criar_tabela_atividades.js
const pool = require('./db');

async function criarTabelaAtividades() {
  const client = await pool.connect();
  try {
    console.log('🔧 Criando tabela atividades...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS atividades (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        tipo VARCHAR(30) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT,
        data_hora TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente',
        prioridade VARCHAR(10) DEFAULT 'media',
        concluida_em TIMESTAMP,
        criado_por VARCHAR(20) DEFAULT 'admin',
        criado_em TIMESTAMP DEFAULT NOW(),
        CONSTRAINT chk_atividade_vinculo CHECK (cliente_id IS NOT NULL OR lead_id IS NOT NULL)
      );
    `);
    console.log('✅ Tabela atividades criada (ou já existia).');

    await client.query(`CREATE INDEX IF NOT EXISTS idx_atividades_cliente ON atividades(cliente_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_atividades_lead ON atividades(lead_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_atividades_status ON atividades(status, data_hora);`);
    console.log('✅ Índices criados.');

    // Confirma estrutura
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'atividades'
      ORDER BY ordinal_position;
    `);
    console.log('\n📋 Estrutura final da tabela atividades:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Erro ao criar tabela:', err.message);
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

criarTabelaAtividades();