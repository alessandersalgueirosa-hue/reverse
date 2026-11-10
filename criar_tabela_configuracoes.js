// criar_tabela_configuracoes.js
// Roda UMA VEZ: cria a tabela `configuracoes` e insere valores iniciais.
// Uso: node criar_tabela_configuracoes.js
require('dotenv').config();
const db = require('./db');
const { criptografar } = require('./cripto');

async function main() {
    console.log('🔧 Criando tabela `configuracoes`...');

    await db.query(`
        CREATE TABLE IF NOT EXISTS configuracoes (
            id SERIAL PRIMARY KEY,
            chave VARCHAR(100) UNIQUE NOT NULL,
            valor TEXT,
            tipo VARCHAR(30) DEFAULT 'texto',
            descricao TEXT,
            criptografado BOOLEAN DEFAULT false,
            atualizado_em TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ Tabela `configuracoes` pronta.');

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

    const sementes = [
        { chave: 'email_user',           valor: 'reverse.mkt.dgt@gmail.com',                tipo: 'email',   descricao: 'E-mail de envio (remetente) do sistema',    criptografado: false },
        { chave: 'email_senha',          valor: criptografar('mzqk pttc kprn vozg'),        tipo: 'email',   descricao: 'Senha de app do Gmail (16 caracteres)',      criptografado: true  },
        { chave: 'email_agencia',        valor: 'reverse.mkt.dgt@gmail.com',                tipo: 'email',   descricao: 'E-mail da agência que recebe notificações', criptografado: false },
        { chave: 'email_remetente_nome', valor: 'Reverse Marketing',                        tipo: 'email',   descricao: 'Nome exibido no "De:" dos e-mails',         criptografado: false },
        { chave: 'base_url',             valor: baseUrl,                                    tipo: 'sistema', descricao: 'URL base do sistema (links de e-mail)',     criptografado: false }
    ];

    console.log('');
    console.log('🌱 Inserindo valores iniciais (não sobrescreve existentes)...');
    for (const s of sementes) {
        await db.query(`
            INSERT INTO configuracoes (chave, valor, tipo, descricao, criptografado, atualizado_em)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (chave) DO NOTHING
        `, [s.chave, s.valor, s.tipo, s.descricao, s.criptografado]);
        console.log(`   → ${s.chave}${s.criptografado ? '  [🔒]' : ''}`);
    }

    console.log('');
    const confirm = await db.query('SELECT chave, criptografado FROM configuracoes ORDER BY chave');
    console.log('✅ Configurações no banco:');
    confirm.rows.forEach(r => {
        console.log(`   • ${r.chave}${r.criptografado ? '  [🔒 criptografado]' : ''}`);
    });

    console.log('');
    console.log('🎉 Setup concluído! Siga para o próximo lote.');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Erro ao configurar:', err.message);
    process.exit(1);
});