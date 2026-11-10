// adicionar_link_configuracoes.js
// Roda UMA VEZ: injeta o link "Configurações" no menu admin de todas as telas.
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const LINK_HTML = `\n                        <a href="/configuracoes.html" class="px-4 py-2 hover:bg-slate-700 text-white font-bold text-orange-400">⚙️ Configurações</a>`;

// Ponto de ancoragem: logo após o link de Produtos (que está no menu "Gestão")
const ANCORA = '<a href="/produtos.html" class="px-4 py-2 hover:bg-slate-700 text-white">Produtos</a>';

function processarArquivo(filePath) {
    let conteudo = fs.readFileSync(filePath, 'utf8');
    
    // Se não tem o menu admin ou já tem o link, pula
    if (!conteudo.includes(ANCORA) || conteudo.includes('/configuracoes.html')) {
        return false;
    }

    // Insere o link logo depois de Produtos
    conteudo = conteudo.replace(ANCORA, ANCORA + LINK_HTML);
    fs.writeFileSync(filePath, conteudo, 'utf8');
    return true;
}

function main() {
    console.log('🔧 Injetando link de Configurações no menu admin...');
    const arquivos = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));
    let count = 0;

    arquivos.forEach(arquivo => {
        if (processarArquivo(path.join(PUBLIC_DIR, arquivo))) {
            console.log(`   ✅ ${arquivo}`);
            count++;
        }
    });

    console.log(`\n🎉 Concluído! Link adicionado em ${count} arquivos.`);
}

main();