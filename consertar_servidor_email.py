import os
import re
from pathlib import Path

print("⏳ 1. Ajustando o arquivo server.js...")
arquivo = Path("server.js")
texto = arquivo.read_text(encoding="utf-8-sig")

# 1. Garantir que o nodemailer está importado
if "require('nodemailer')" not in texto:
    texto = texto.replace("const db = require('./db');", "const db = require('./db');\nconst nodemailer = require('nodemailer');")

# 2. Remover qualquer rota de e-mail antiga para não duplicar
texto = re.sub(r"// --- ROTAS DE E-MAIL \(NODEMAILER\) ---[\s\S]*?// --- FIM ROTAS E-MAIL ---", "", texto)

# 3. Injetar as rotas corretamente antes do app.listen
rotas_email = """
// --- ROTAS DE E-MAIL (NODEMAILER) ---
app.post('/api/enviar-email', verificarToken, async (req, res) => {
  const { destinatario, assunto, conteudoHtml } = req.body;
  try {
    const configRes = await db.query('SELECT * FROM email_configuracoes ORDER BY id DESC LIMIT 1');
    if (configRes.rows.length === 0) return res.status(400).json({ error: 'Configure o envio de e-mail no sistema primeiro.' });
    
    const config = configRes.rows[0];
    let transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user_email, pass: config.pass }
    });

    await transporter.sendMail({
      from: `"${config.remetente_nome}" <${config.user_email}>`,
      to: destinatario,
      subject: assunto,
      html: conteudoHtml
    });
    res.json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar e-mail. Verifique as credenciais.' });
  }
});

app.post('/api/configuracoes-email', verificarToken, async (req, res) => {
  const { host, port, user_email, pass, remetente_nome, brevo_api_key } = req.body;
  try {
    await db.query('DELETE FROM email_configuracoes');
    await db.query(
      'INSERT INTO email_configuracoes (host, port, user_email, pass, remetente_nome, brevo_api_key) VALUES ($1, $2, $3, $4, $5, $6)',
      [host, port, user_email, pass, remetente_nome, brevo_api_key]
    );
    res.status(201).json({ message: 'Configurações salvas com sucesso!' });
  } catch (error) {
    console.error(error);
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
print("✅ server.js corrigido!")

print("\n⏳ 2. Reconstruindo o Docker (isso pode demorar alguns minutos)...")
# O comando 'up -d --build' é o único que garante que o nodemailer será instalado dentro do Docker
os.system("docker compose up -d --build")

print("\n✅ Tudo pronto! O servidor deve estar no ar novamente.")