const fs = require('fs');
let c = fs.readFileSync('e:\\Projeto_Novo\\server.js', 'utf8');

// Replace the four portal route blocks
c = c.replace(
  `app.get('/api/portal/tarefas', verificarToken, async (req, res) => {
  const clienteId = req.user.id;
  try {
    const result = await db.query('SELECT * FROM tarefas WHERE cliente_id = $1 ORDER BY data_criacao DESC', [clienteId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar tarefas do portal:", error);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});`,
  `app.get('/api/portal/tarefas', verificarToken, async (req, res) => {
    try {
      // Buscando todas as tarefas para teste (sem filtro de ID)
      const result = await db.query('SELECT * FROM tarefas ORDER BY data_criacao DESC');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
  });`
);

c = c.replace(
  `app.get('/api/portal/criativos', verificarToken, async (req, res) => {
  const clienteId = req.user.id;
  try {
    const result = await db.query('SELECT * FROM criativos WHERE cliente_id = $1 ORDER BY data_criacao DESC', [clienteId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar criativos do portal:", error);
    res.status(500).json({ error: 'Erro ao buscar criativos' });
  }
});`,
  `app.get('/api/portal/criativos', verificarToken, async (req, res) => {
    try {
      // Buscando todos os criativos para teste (sem filtro de ID)
      const result = await db.query('SELECT * FROM criativos ORDER BY data_criacao DESC');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar criativos' });
    }
  });`
);

c = c.replace(
  `app.post('/api/portal/criativos/:id/aprovar', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('UPDATE criativos SET status = \\'aprovado\\', feedback_cliente = NULL WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Criativo não encontrado.' });
    res.json({ message: 'Criativo aprovado com sucesso!', criativo: result.rows[0] });
  } catch (error) {
    console.error("Erro ao aprovar criativo:", error);
    res.status(500).json({ error: 'Erro interno ao aprovar criativo' });
  }
});`,
  `app.post('/api/portal/criativos/:id/aprovar', verificarToken, async (req, res) => {
    try {
        await db.query("UPDATE criativos SET status = 'aprovado', feedback_cliente = NULL WHERE id = $1", [req.params.id]);
        res.json({ message: 'Criativo aprovado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar criativo' });
    }
  });`
);

c = c.replace(
  `app.post('/api/portal/criativos/:id/recusar', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  try {
    const result = await db.query('UPDATE criativos SET status = \\'recusado\\', feedback_cliente = $1 WHERE id = $2 RETURNING *', [feedback, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Criativo não encontrado.' });
    res.json({ message: 'Criativo recusado com sucesso!', criativo: result.rows[0] });
  } catch (error) {
    console.error("Erro ao recusar criativo:", error);
    res.status(500).json({ error: 'Erro interno ao recusar criativo' });
  }
});`,
  `app.post('/api/portal/criativos/:id/recusar', verificarToken, async (req, res) => {
    const { feedback } = req.body;
    try {
        await db.query("UPDATE criativos SET status = 'recusado', feedback_cliente = $1 WHERE id = $2", [feedback, req.params.id]);
        res.json({ message: 'Alteração solicitada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao recusar criativo' });
    }
  });`
);

fs.writeFileSync('e:\\Projeto_Novo\\server.js', c);
console.log('Portal routes fixed');