// configCache.js
// Cache em memória das configurações (tabela `configuracoes`).
// Evita consultar o banco a cada e-mail enviado.
const db = require('./db');
const { criptografar, descriptografar } = require('./cripto');

const cache = {}; // { chave: { valor, tipo, criptografado } }
let carregado = false;

async function reload() {
    try {
        const result = await db.query(
            'SELECT chave, valor, tipo, criptografado FROM configuracoes ORDER BY chave'
        );
        Object.keys(cache).forEach(k => delete cache[k]);
        let criptografados = 0;
        for (const row of result.rows) {
            let valorFinal;
            if (row.criptografado) {
                try {
                    valorFinal = descriptografar(row.valor);
                } catch (e) {
                    console.warn(`⚠️  Falha ao descriptografar '${row.chave}': ${e.message}`);
                    valorFinal = null;
                }
            } else {
                valorFinal = row.valor;
            }
            cache[row.chave] = { valor: valorFinal, tipo: row.tipo, criptografado: row.criptografado };
            if (row.criptografado) criptografados++;
        }
        carregado = true;
        console.log(`✅ Cache de configurações carregado (${result.rows.length} itens, ${criptografados} criptografados).`);
    } catch (err) {
        console.warn(`⚠️  Falha ao carregar cache de configurações: ${err.message}`);
        console.warn('    → O sistema continuará com valores do .env como fallback.');
        console.warn('    → Se a tabela ainda não existe, rode: node criar_tabela_configuracoes.js');
    }
}

function get(chave, fallback = undefined) {
    if (cache[chave] && cache[chave].valor !== null && cache[chave].valor !== undefined) {
        return cache[chave].valor;
    }
    return fallback;
}

function getTodos() {
    const resultado = {};
    for (const [chave, item] of Object.entries(cache)) {
        resultado[chave] = item.criptografado ? '••••••••' : (item.valor || '');
    }
    return resultado;
}

function isSensivel(chave) {
    return !!(cache[chave] && cache[chave].criptografado);
}

async function set(chave, valor, tipo = 'texto', criptografado = false) {
    const valorFinal = criptografado ? criptografar(String(valor)) : String(valor);
    await db.query(`
        INSERT INTO configuracoes (chave, valor, tipo, criptografado, atualizado_em)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (chave) DO UPDATE SET
            valor = EXCLUDED.valor,
            tipo = EXCLUDED.tipo,
            criptografado = EXCLUDED.criptografado,
            atualizado_em = NOW()
    `, [chave, valorFinal, tipo, criptografado]);
    cache[chave] = { valor: String(valor), tipo, criptografado };
}

function isCarregado() { return carregado; }

module.exports = { reload, get, getTodos, isSensivel, set, isCarregado };