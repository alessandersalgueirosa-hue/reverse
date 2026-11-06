const fs = require('fs');

try {
    let content = fs.readFileSync('server.js', 'utf8');

    if (content.includes('/api/planejamento')) {
        console.log('✅ As rotas de planejamento JÁ EXISTEM no server.js!');
        process.exit(0);
    }

    const rotas = `
// --- ROTAS DE PLANEJAMENTO BSC ---
app.post('/api/planejamento', verificarToken, async (req, res) => {
  try {
    const { cliente, nomeCampanha, dataInicio, dataFim, orcamentoTotal, metaFaturamento, metaROAS, metaCAC, persona, propostaValor, canais, metaNPS, entregaveis, ferramentas, responsavel, cronograma, treinamento, inovacao, posicionamentoMarca } = req.body;
    const result = await db.query(
      \`INSERT INTO planejamentos_bsc (cliente_id, nome_campanha, data_inicio, data_fim, orcamento_total, meta_faturamento, meta_roas, meta_cac, persona_principal, proposta_valor, canais_aquisicao, meta_nps, entregaveis, ferramentas, responsavel, cronograma, treinamento, inovacao, posicionamento_marca) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *\`,
      [cliente || null, nomeCampanha, dataInicio, dataFim, orcamentoTotal || 0, metaFaturamento || 0, metaROAS || 0, metaCAC || 0, persona, propostaValor, canais, metaNPS, entregaveis, ferramentas, responsavel, cronograma, treinamento, inovacao, posicionamentoMarca]
    );
    res.status(201).json({ message: 'Planejamento salvo com sucesso!', planejamento: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao salvar planejamento.' });
  }
});

app.get('/api/planejamento', verificarToken, async (req, res) => {
  try {
    const result = await db.query(\`
      SELECT p.*, c.nome AS cliente_nome 
      FROM planejamentos_bsc p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      ORDER BY p.id DESC
    \`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar planejamentos.' });
  }
});

app.delete('/api/planejamento/:id', verificarToken, async (req, res) => {
  try {
    await db.query('DELETE FROM planejamentos_bsc WHERE id = $1', [req.params.id]);
    res.json({ message: 'Planejamento excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao excluir planejamento.' });
  }
});
// --- FIM ROTAS PLANEJAMENTO ---

app.listen(PORT,`;

    content = content.replace(/app\.listen\(PORT,/g, rotas);
    fs.writeFileSync('server.js', content, 'utf8');
    console.log('✅ Rotas injetadas com sucesso no server.js!');
} catch (error) {
    console.error('❌ Erro ao ler o arquivo server.js:', error.message);
}