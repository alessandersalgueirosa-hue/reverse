const fs = require('fs');
const path = require('path');

const caminho = path.join(__dirname, 'public', 'clientes.html');
let conteudo = fs.readFileSync(caminho, 'utf8');

// 1. Verifica se a função carregarClientes existe
if (!conteudo.includes('function carregarClientes()')) {
    console.log("⚠️ A função carregarClientes não foi encontrada. O Cline pode ter apagado.");
    
    // Procura o final do script para injetar a função correta
    const scriptFim = '</script>';
    const scriptIndex = conteudo.lastIndexOf(scriptFim);
    
    if (scriptIndex !== -1) {
        const scriptConserto = `
        async function carregarClientes() {
            try {
                const response = await fetch('/api/clientes', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                if (!response.ok) throw new Error('Erro ao buscar clientes');
                const clientes = await response.json();
                const tbody = document.getElementById('tabelaClientes');
                if (!tbody) return;
                tbody.innerHTML = '';
                
                clientes.forEach(cliente => {
                    const tr = document.createElement('tr');
                    tr.className = 'border-b border-slate-800 hover:bg-slate-800/50';
                    tr.innerHTML = \`
                        <td class="p-4 text-white">\${cliente.id}</td>
                        <td class="p-4">\${cliente.tipo || '-'}</td>
                        <td class="p-4">\${cliente.nome}</td>
                        <td class="p-4">\${cliente.email}</td>
                        <td class="p-4">\${cliente.cidade || '-'}/\${cliente.estado || '-'}</td>
                        <td class="p-4">\${cliente.status || 'Ativo'}</td>
                        <td class="p-4 text-right">
                            <button onclick="abrirModalCriativo(\${cliente.id})" class="text-orange-400 hover:text-orange-300 text-xs font-bold mr-3">Enviar Criativo</button>
                            <button onclick="excluirCliente(\${cliente.id})" class="text-red-500 hover:text-red-400 text-sm font-bold">Excluir</button>
                        </td>
                    \`;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                const tbody = document.getElementById('tabelaClientes');
                if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-red-500">Erro ao carregar clientes.</td></tr>';
            }
        }
        
        document.addEventListener('DOMContentLoaded', carregarClientes);
        `;
        
        conteudo = conteudo.substring(0, scriptIndex) + scriptConserto + conteudo.substring(scriptIndex);
        fs.writeFileSync(caminho, conteudo, 'utf8');
        console.log("✅ Função carregarClientes adicionada com sucesso!");
    }
} else {
    console.log("ℹ️ A função carregarClientes já existe no arquivo.");
}