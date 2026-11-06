const fs = require('fs');
const path = require('path');

const arquivo = path.join(__dirname, 'public', 'redes_sociais.html');

console.log("========================================");
console.log("🔍 DIAGNÓSTICO DO ARQUIVO redes_sociais.html");
console.log("========================================\n");

if (!fs.existsSync(arquivo)) {
    console.error("❌ ERRO: O arquivo redes_sociais.html NÃO EXISTE na pasta public!");
    process.exit(1);
}

const conteudo = fs.readFileSync(arquivo, 'utf8');
const linhas = conteudo.split('\n');

// 1. Verificar se o btnSair está no arquivo
console.log("1️⃣ Procurando por 'btnSair'...");
let encontrouBtnSair = false;
linhas.forEach((linha, index) => {
    if (linha.includes('btnSair')) {
        encontrouBtnSair = true;
        console.log(`   ⚠️  Linha ${index + 1}: ${linha.trim()}`);
    }
});
if (!encontrouBtnSair) {
    console.log("   ✅ Nenhuma ocorrência de 'btnSair' encontrada.");
}
console.log("");

// 2. Verificar se há mais de um bloco de menu duplicado
console.log("2️⃣ Procurando por menus duplicados...");
const ocorrenciasMenuAdmin = (conteudo.match(/id="menu-admin"/g) || []).length;
const ocorrenciasMenuCliente = (conteudo.match(/id="menu-cliente"/g) || []).length;
console.log(`   - Ocorrências de 'menu-admin': ${ocorrenciasMenuAdmin}`);
console.log(`   - Ocorrências de 'menu-cliente': ${ocorrenciasMenuCliente}`);
if (ocorrenciasMenuAdmin > 1 || ocorrenciasMenuCliente > 1) {
    console.log("   ⚠️  ATENÇÃO: Há menus duplicados no arquivo!");
} else {
    console.log("   ✅ Menus não estão duplicados.");
}
console.log("");

// 3. Verificar se a função carregarDados existe e é chamada
console.log("3️⃣ Procurando por 'carregarDados'...");
const ocorrenciasCarregarDados = (conteudo.match(/carregarDados/g) || []).length;
console.log(`   - Ocorrências de 'carregarDados': ${ocorrenciasCarregarDados}`);
if (ocorrenciasCarregarDados >= 2) {
    console.log("   ✅ Função 'carregarDados' definida e chamada.");
} else {
    console.log("   ⚠️  ATENÇÃO: A função 'carregarDados' pode não estar definida ou não está sendo chamada.");
}
console.log("");

// 4. Verificar se há erros de sintaxe óbvios (chaves desbalanceadas)
console.log("4️⃣ Verificando balanceamento de chaves...");
let chavesAbertas = 0;
let chavesFechadas = 0;
linhas.forEach(linha => {
    chavesAbertas += (linha.match(/{/g) || []).length;
    chavesFechadas += (linha.match(/}/g) || []).length;
});
console.log(`   - Chaves abertas: ${chavesAbertas}`);
console.log(`   - Chaves fechadas: ${chavesFechadas}`);
if (chavesAbertas === chavesFechadas) {
    console.log("   ✅ Chaves balanceadas.");
} else {
    console.log("   ⚠️  ATENÇÃO: Chaves desbalanceadas! Pode haver erro de sintaxe.");
}
console.log("");

// 5. Verificar se o arquivo tem a estrutura básica de HTML
console.log("5️⃣ Verificando estrutura básica...");
if (conteudo.includes('<!DOCTYPE html>')) console.log("   ✅ <!DOCTYPE html> encontrado.");
else console.log("   ⚠️  <!DOCTYPE html> NÃO encontrado.");

if (conteudo.includes('</html>')) console.log("   ✅ </html> encontrado.");
else console.log("   ⚠️  </html> NÃO encontrado.");

console.log("\n========================================");
console.log("📋 DIAGNÓSTICO CONCLUÍDO");
console.log("========================================");