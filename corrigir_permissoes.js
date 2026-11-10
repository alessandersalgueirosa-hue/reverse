// corrigir_permissoes.js
// Roda UMA VEZ: remove as telas compartilhadas da lista de bloqueio de clientes.
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

// Telas que o cliente DEVE conseguir abrir se tiver permissão no menu
const TELAS_LIBERADAS = [
    "'propostas.html'", 
    "'campanhas.html'", 
    "'metricas.html'", 
    "'calendario_editorial.html'", 
    "'lista_brandings.html'",
    "'tarefas.html'"
];

function main() {
    console.log('🔧 Corrigindo bloqueios de tela para clientes...');
    const arquivos = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));
    let count = 0;

    arquivos.forEach(arquivo => {
        const caminho = path.join(PUBLIC_DIR, arquivo);
        let conteudo = fs.readFileSync(caminho, 'utf8');
        let modificado = false;

        // Procura a lista paginasAdmin e remove as telas liberadas
        TELAS_LIBERADAS.forEach(tela => {
            // Remove a tela da lista junto com a vírgula (ex: "'propostas.html', ")
            const regex = new RegExp(tela + ',\\s*', 'g');
            if (regex.test(conteudo)) {
                conteudo = conteudo.replace(regex, '');
                modificado = true;
            }
        });

        if (modificado) {
            fs.writeFileSync(caminho, conteudo, 'utf8');
            console.log(`   ✅ ${arquivo} atualizado.`);
            count++;
        }
    });

    console.log(`\n🎉 Concluído! Bloqueios removidos em ${count} arquivos.`);
}

main();