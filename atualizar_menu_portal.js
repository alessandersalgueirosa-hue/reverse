const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

// Lista de todos os arquivos HTML que devem ter o menu
const arquivos = [
    'admin.html', 'clientes.html', 'leads.html', 'prospects.html', 'campanhas.html',
    'mapeamento_cliente.html', 'planejamento.html', 'financeiro.html', 'trafego_pago.html',
    'tarefas.html', 'metricas_sistema.html', 'metricas.html', 'calculadora-trafego.html',
    'redes_sociais.html', 'storytelling.html', 'base_conhecimento.html', 'produtos.html',
    'inbound.html', 'outbound.html'
];

const linkPortal = `<a href="/portal_cliente.html" class="text-slate-400 hover:text-white transition-colors">Portal do Cliente</a>`;

arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);
    
    if (fs.existsSync(caminho)) {
        let conteudo = fs.readFileSync(caminho, 'utf8');
        
        // Se o link ainda não existe no arquivo
        if (!conteudo.includes('/portal_cliente.html')) {
            // Procura o botão "Sair" para inserir o link antes dele
            const regexSair = /(<button id="btnSair"[^>]*>Sair<\/button>)/;
            
            if (conteudo.match(regexSair)) {
                conteudo = conteudo.replace(regexSair, `${linkPortal}\n            $1`);
                fs.writeFileSync(caminho, conteudo, 'utf8');
                console.log(`✅ Link adicionado em: ${arquivo}`);
            } else {
                console.log(`⚠️ Botão "Sair" não encontrado em: ${arquivo}`);
            }
        } else {
            console.log(`ℹ️ Link já existe em: ${arquivo}`);
        }
    }
});

console.log("🚀 Finalizado!");