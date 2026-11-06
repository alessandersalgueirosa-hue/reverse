from pathlib import Path
import re

arquivo = Path("server.js")
texto = arquivo.read_text(encoding="utf-8-sig")

# 1. Adicionar importação do nodemailer
if "require('nodemailer')" not in texto:
    texto = texto.replace("const db = require('./db');", "const db = require('./db');\nconst nodemailer = require('nodemailer');")

# 2. Adicionar as rotas antes do app.listen
rotas_email = """
// --- ROTAS DE E-MAIL (NODEMAILER) ---
app.post('/api/enviar-email', verificarToken, async (req, res) => {
  const { destinatario, assunto, conteudoHtml } = req.body;
  try {
    // Puxa as configurações do banco
    const configRes = await db.query('SELECT * FROM email_configuracoes ORDER BY id DESC LIMIT 1');
    if (configRes.rows.length === 0) return res.status(400).json({ error: 'Configure o envio de e-mail no sistema primeiro.' });
    
    const config = configRes.rows[0];

    let transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user_email,
        pass: config.pass
      }
    });

    let mailOptions = {
      from: `"${config.remetente_nome}" <${config.user_email}>`,
      to: destinatario,
      subject: assunto,
      html: conteudoHtml
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar e-mail. Verifique as credenciais.' });
  }
});

app.post('/api/configuracoes-email', verificarToken, async (req, res) => {
  const { host, port, user_email, pass, remetente_nome, brevo_api_key } = req.body;
  try {
    await db.query('DELETE FROM email_configuracoes'); // Limpa as antigas
    await db.query(
      'INSERT INTO email_configuracoes (host, port, user_email, pass, remetente_nome, brevo_api_key) VALUES ($1, $2, $3, $4, $5, $6)',
      [host, port, user_email, pass, remetente_nome, brevo_api_key]
    );
    res.status(201).json({ message: 'Configurações salvas com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

app.get('/api/configuracoes-email', verificarToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_configuracoes ORDER BY id DESC LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações.' });
  }
});
// --- FIM ROTAS E-MAIL ---

app.listen(PORT,"""

texto = texto.replace("app.listen(PORT,", rotas_email)
arquivo.write_text(texto, encoding="utf-8-sig")
print("✅ Rotas de E-mail injetadas no server.js!")