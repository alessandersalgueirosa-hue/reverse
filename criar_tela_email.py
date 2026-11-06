from pathlib import Path

# 1. Criar a página de configurações
html_config = """﻿<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações de E-mail - Reverse Marketing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" type="image/png" href="/logo.png">
</head>
<body class="bg-slate-950 text-white font-sans antialiased">
    <header class="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-3">
            <img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain">
            <h1 class="text-xl font-bold">Configurações de E-mail</h1>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-sm">
            <a href="/admin.html" class="text-slate-400 hover:text-white transition-colors">Dashboard</a>
            <a href="/campanhas.html" class="text-slate-400 hover:text-white transition-colors">Campanhas</a>
            <a href="/configuracoes_email.html" class="text-white font-bold border-b-2 border-orange-500 pb-1">Configurações de E-mail</a>
            <button id="btnSair" class="text-slate-400 hover:text-white transition-colors font-bold">Sair</button>
        </div>
    </header>

    <main class="max-w-3xl mx-auto p-8">
        <div class="bg-slate-900 p-8 rounded-lg border border-slate-800 shadow-lg">
            <h2 class="text-2xl font-bold mb-6 text-orange-400">Servidor de Envio (SMTP)</h2>
            
            <form id="formConfig" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-slate-400 mb-1">Nome do Remetente</label>
                    <input type="text" id="remetente_nome" required placeholder="Ex: Agência Reverse" class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-1">E-mail (Gmail)</label>
                    <input type="email" id="user_email" required placeholder="seuemail@gmail.com" class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-1">Senha de App (16 dígitos)</label>
                    <input type="password" id="pass" required placeholder="xxxx xxxx xxxx xxxx" class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-1">Host SMTP</label>
                    <input type="text" id="host" required value="smtp.gmail.com" class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-1">Porta</label>
                    <input type="number" id="port" required value="587" class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>

                <div class="md:col-span-2 mt-4">
                    <h3 class="text-lg font-bold text-white mb-2">Integração Brevo (Opcional)</h3>
                    <label class="block text-sm font-medium text-slate-400 mb-1">API Key do Brevo</label>
                    <input type="text" id="brevo_api_key" placeholder="Deixe em branco se não usar" class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>

                <div class="md:col-span-2 mt-6 flex justify-end">
                    <button type="submit" id="btnSalvar" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">Salvar Configurações</button>
                </div>
            </form>
        </div>
    </main>

    <script>
        const token = localStorage.getItem('token');
        if (!token) window.location.href = '/login.html';

        async function carregarConfig() {
            try {
                const res = await fetch('/api/configuracoes-email', { headers: { 'Authorization': `Bearer ${token}` } });
                const config = await res.json();
                if (config && config.user_email) {
                    document.getElementById('remetente_nome').value = config.remetente_nome || '';
                    document.getElementById('user_email').value = config.user_email || '';
                    document.getElementById('pass').value = config.pass || '';
                    document.getElementById('host').value = config.host || 'smtp.gmail.com';
                    document.getElementById('port').value = config.port || 587;
                    document.getElementById('brevo_api_key').value = config.brevo_api_key || '';
                }
            } catch (e) { console.error('Erro ao carregar config', e); }
        }

        document.getElementById('formConfig').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSalvar');
            btn.innerText = 'Salvando...'; btn.disabled = true;

            const dados = {
                remetente_nome: document.getElementById('remetente_nome').value,
                user_email: document.getElementById('user_email').value,
                pass: document.getElementById('pass').value,
                host: document.getElementById('host').value,
                port: parseInt(document.getElementById('port').value),
                brevo_api_key: document.getElementById('brevo_api_key').value
            };

            try {
                const res = await fetch('/api/configuracoes-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(dados)
                });
                if (res.ok) alert('Configurações salvas com sucesso!');
                else alert('Erro ao salvar configurações.');
            } catch (e) {
                alert('Erro de conexão.');
            } finally {
                btn.innerText = 'Salvar Configurações'; btn.disabled = false;
            }
        });

        document.getElementById('btnSair').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        });

        carregarConfig();
    </script>
</body>
</html>"""

Path("public/configuracoes_email.html").write_text(html_config, encoding="utf-8-sig")
print("✅ Página configuracoes_email.html criada!")

# 2. Adicionar o link no arquivo campanhas_mail.html
arquivo_mail = Path("public/campanhas_mail.html")
if arquivo_mail.exists():
    texto = arquivo_mail.read_text(encoding="utf-8-sig")
    if "configuracoes_email.html" not in texto:
        link_config = '<a href="/configuracoes_email.html" class="text-slate-400 hover:text-white transition-colors">Configurações de E-mail</a>'
        # Insere antes do botão Sair no menu
        texto = texto.replace('<button id="btnSair"', link_config + '\n            <button id="btnSair"')
        arquivo_mail.write_text(texto, encoding="utf-8-sig")
        print("✅ Link adicionado no menu do campanhas_mail.html")