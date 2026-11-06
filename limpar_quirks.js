const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');
const arquivos = fs.readdirSync(pastaPublic).filter(f => f.endsWith('.html'));

console.log('🔍 Procurando caracteres invisíveis (Quirks Mode)...\n');

let corrigidos = 0;
arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);
    let conteudo = fs.readFileSync(caminho, 'utf-8');
    
    // Verifica se o primeiro caractere é o BOM (Byte Order Mark)
    if (conteudo.charCodeAt(0) === 0xFEFF) {
        conteudo = conteudo.slice(1);
        fs.writeFileSync(caminho, conteudo, 'utf-8');
        console.log(`✅ Quirks Mode removido de: ${arquivo}`);
        corrigidos++;
    }
});

console.log(`\n🎉 Tudo pronto! ${corrigidos} arquivos foram limpos.`);