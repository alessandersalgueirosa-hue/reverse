const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

// As tags que serão inseridas em cada HTML
const tags = [
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">',
    '<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>',
    '<script src="/js/ux.js"></script>'
].join('\n    ');

// Pega todos os arquivos HTML da pasta public
const arquivos = fs.readdirSync(pastaPublic).filter(function(f) {
    return f.endsWith('.html');
});

console.log('Encontrados ' + arquivos.length + ' arquivos HTML para atualizar.');

let atualizados = 0;

for (let i = 0; i < arquivos.length; i++) {
    const nome = arquivos[i];
    const caminho = path.join(pastaPublic, nome);
    
    let conteudo = fs.readFileSync(caminho, 'utf-8');
    
    // Se ja tem toastify, pula
    if (conteudo.indexOf('toastify-js') !== -1) {
        console.log('OK (ja tinha): ' + nome);
        continue;
    }
    
    // Se tem </head>, insere as tags antes
    if (conteudo.indexOf('</head>') !== -1) {
        conteudo = conteudo.replace('</head>', tags + '\n</head>');
        fs.writeFileSync(caminho, conteudo, 'utf-8');
        console.log('ATUALIZADO: ' + nome);
        atualizados++;
    } else {
        console.log('SEM HEAD (ignorado): ' + nome);
    }
}

console.log('\nPronto! ' + atualizados + ' arquivos foram atualizados.');
console.log('Agora reinicie o servidor: Ctrl+C e depois node server.js');