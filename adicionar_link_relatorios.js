const fs = require('fs');
const path = require('path');

// A pasta onde estão os seus arquivos HTML (ajuste se necessário)
const pastaHtml = path.join(__dirname, 'public'); 

// O trecho exato que identifica o menu Gestão em todos os arquivos
const gatilho = '<a href="/financeiro.html" class="px-4 py-2 hover:bg-slate-700 text-white">Financeiro</a>';

// O novo link que será inserido logo após o Financeiro
const novoLink = '\n                        <a href="/relatorios.html" class="px-4 py-2 hover:bg-slate-700 text-white">Relatórios</a>';

function processarArquivos() {
    if (!fs.existsSync(pastaHtml)) {
        console.error(`❌ Pasta não encontrada: ${pastaHtml}. Verifique se os HTMLs estão na raiz ou na pasta public.`);
        return;
    }

    const arquivos = fs.readdirSync(pastaHtml).filter(f => f.endsWith('.html'));
    let alterados = 0;
    let ignorados = 0;

    arquivos.forEach(arquivo => {
        const caminhoCompleto = path.join(pastaHtml, arquivo);
        let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');

        // Verifica se o link já existe
        if (conteudo.includes('href="/relatorios.html"')) {
            console.log(`⏭️  Ignorado (já tem o link): ${arquivo}`);
            ignorados++;
            return;
        }

        // Verifica se o gatilho existe no arquivo
        if (!conteudo.includes(gatilho)) {
            console.log(`⚠️  Ignorado (não achou o menu Gestão): ${arquivo}`);
            ignorados++;
            return;
        }

        // Faz o backup
        fs.writeFileSync(caminhoCompleto + '.bak', conteudo, 'utf8');

        // Substitui o gatilho pelo gatilho + novo link
        const novoConteudo = conteudo.replace(gatilho, gatilho + novoLink);

        // Salva o arquivo
        fs.writeFileSync(caminhoCompleto, novoConteudo, 'utf8');
        console.log(`✅ Alterado: ${arquivo}`);
        alterados++;
    });

    console.log('\n========================================');
    console.log(`📊 Resumo: ${alterados} arquivos alterados, ${ignorados} ignorados.`);
    console.log('========================================');
}

processarArquivos();