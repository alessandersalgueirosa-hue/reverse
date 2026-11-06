const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

// Lista de arquivos que devem ter o menu atualizado
const arquivos = [
    'admin.html', 'clientes.html', 'leads.html', 'prospects.html', 'campanhas.html',
    'mapeamento_cliente.html', 'planejamento.html', 'financeiro.html', 'trafego_pago.html',
    'tarefas.html', 'metricas_sistema.html', 'metricas.html', 'calculadora-trafego.html',
    'redes_sociais.html', 'storytelling.html', 'base_conhecimento.html', 'produtos.html',
    'inbound.html', 'outbound.html', 'criativos.html', 'propostas.html', 'portal_cliente.html', 'briefings.html'
];

const linkCriativos = `<a href="/criativos.html" class="text-slate-400 hover:text-white transition-colors">Criativos</a>`;

arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);
    
    if (fs.existsSync(caminho)) {
        let conteudo = fs.readFileSync(caminho, 'utf8');
        
        // Se o link ainda não existe e o arquivo tem menu (header)
        if (!conteudo.includes('/criativos.html') && conteudo.includes('<header')) {
            
            // Procura o link de Clientes ou Propostas para inserir do lado
            const regexBase = /(<a href="\/clientes\.html"[^>]*>Clientes<\/a>|<a href="\/propostas\.html"[^>]*>Propostas<\/a>)/;
            
            if (conteudo.match(regexBase)) {
                conteudo = conteudo.replace(regexBase, `$1\n            ${linkCriativos}`);
                fs.writeFileSync(caminho, conteudo, 'utf8');
                console.log(`✅ Link de Criativos adicionado em: ${arquivo}`);
            } else {
                console.log(`⚠️ Menu não reconhecido em: ${arquivo}`);
            }
        } else {
            console.log(`ℹ️ Link já existe ou não tem menu em: ${arquivo}`);
        }
    }
});

console.log("🚀 Finalizado!");