const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

// Lista de arquivos que NÃO devem ser corrigidos (ex: login, portal)
const arquivosIgnorados = ['login.html', 'login-cliente.html', 'index.html'];

console.log("========================================");
console.log("🤖 CORRETOR AUTOMÁTICO DE HTML");
console.log("========================================\n");

if (!fs.existsSync(pastaPublic)) {
    console.error("❌ Pasta public não encontrada!");
    process.exit(1);
}

const arquivos = fs.readdirSync(pastaPublic).filter(f => f.endsWith('.html'));
let corrigidos = 0;
let ignorados = 0;

arquivos.forEach(arquivo => {
    if (arquivosIgnorados.includes(arquivo)) {
        console.log(`⏭️  Ignorando: ${arquivo}`);
        ignorados++;
        return;
    }

    const caminho = path.join(pastaPublic, arquivo);
    let conteudo = fs.readFileSync(caminho, 'utf8');
    let alterado = false;
    let relatorio = [];

    // --- CORREÇÃO 1: Remover btnSair ---
    const regexBtnSair = /document\.getElementById\(['"]btnSair['"]\)\.addEventListener\([^;]+\);/g;
    if (regexBtnSair.test(conteudo)) {
        conteudo = conteudo.replace(regexBtnSair, '// btnSair removido automaticamente (usar .btn-sair)');
        alterado = true;
        relatorio.push("✅ btnSair removido");
    }

    // --- CORREÇÃO 2: Remover menu duplicado (dois blocos idênticos de menu) ---
    // Conta quantas vezes o bloco de menu-admin aparece
    const ocorrenciasMenuAdmin = (conteudo.match(/id="menu-admin"/g) || []).length;
    if (ocorrenciasMenuAdmin > 1) {
        // Pega o conteúdo do primeiro bloco <script> que monta o menu
        const regexBlocoMenu = /<script>\s*\(function\(\)\s*\{\s*const token = localStorage\.getItem\('token'\);[\s\S]*?<\/script>/g;
        const blocos = conteudo.match(regexBlocoMenu);
        
        if (blocos && blocos.length > 1) {
            // Remove o segundo bloco (duplicado), mantendo o primeiro
            let contador = 0;
            conteudo = conteudo.replace(regexBlocoMenu, (match) => {
                contador++;
                return contador === 1 ? match : '<!-- Menu duplicado removido automaticamente -->';
            });
            alterado = true;
            relatorio.push("✅ Menu duplicado removido");
        }
    }

    // --- CORREÇÃO 3: Garantir que funções de carga rodem no DOMContentLoaded ---
    // Se o arquivo tem funções de carregamento mas não tem DOMContentLoaded, adiciona
    if (conteudo.includes('async function carregar') && !conteudo.includes('DOMContentLoaded')) {
        // Tenta encontrar o final do último <script> antes de </body>
        const regexFinalScript = /<\/script>\s*<\/body>/;
        if (regexFinalScript.test(conteudo)) {
            conteudo = conteudo.replace(regexFinalScript, `
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Inicialização automática (adicionada pelo corretor)
            const funcoes = ['carregarClientes', 'carregarDados', 'carregarCampanhas', 'carregarTarefas', 'carregarAcoes', 'carregarOpcoes', 'carregarFinanceiro'];
            funcoes.forEach(fn => {
                if (typeof window[fn] === 'function') {
                    window[fn]();
                }
            });
        });
    </script>
</body>`);
            alterado = true;
            relatorio.push("✅ Inicialização DOMContentLoaded adicionada");
        }
    }

    // --- CORREÇÃO 4: Verificar balanceamento de chaves no JS ---
    const chavesAbertas = (conteudo.match(/{/g) || []).length;
    const chavesFechadas = (conteudo.match(/}/g) || []).length;
    if (chavesAbertas !== chavesFechadas) {
        relatorio.push(`⚠️  Chaves desbalanceadas (${chavesAbertas} abertas, ${chavesFechadas} fechadas) - verificar manualmente`);
    }

    // --- SALVAR ---
    if (alterado) {
        // Backup do arquivo original
        const backup = caminho + '.bak';
        if (!fs.existsSync(backup)) {
            fs.writeFileSync(backup, fs.readFileSync(caminho, 'utf8'));
        }
        fs.writeFileSync(caminho, conteudo);
        console.log(`🔧 ${arquivo}`);
        relatorio.forEach(r => console.log(`   ${r}`));
        corrigidos++;
    } else {
        console.log(`✅ ${arquivo} - Nenhum problema encontrado`);
    }
});

console.log("\n========================================");
console.log("📋 RESUMO");
console.log("========================================");
console.log(`✅ Arquivos corrigidos: ${corrigidos}`);
console.log(`⏭️  Arquivos ignorados: ${ignorados}`);
console.log(`📁 Total de arquivos HTML: ${arquivos.length}`);
console.log("\n💡 Dica: Os arquivos originais foram salvos com extensão .bak");
console.log("   Se algo der errado, renomeie o .bak de volta para .html");
console.log("========================================");