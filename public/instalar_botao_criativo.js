const fs = require('fs');
const path = require('path');

const caminhoClientes = path.join(__dirname, 'public', 'clientes.html');

try {
    let conteudo = fs.readFileSync(caminhoClientes, 'utf8');

    // 1. Adicionar o botão na tabela
    if (!conteudo.includes('abrirModalCriativo')) {
        // Procura o botão de excluir e coloca o de enviar criativo do lado
        const regexExcluir = /(<button onclick="excluirCliente\([^)]+\)" class="[^"]+">Excluir<\/button>)/;
        if (conteudo.match(regexExcluir)) {
            conteudo = conteudo.replace(regexExcluir, `
                <button onclick="abrirModalCriativo(\${cliente.id})" class="text-orange-400 hover:text-orange-300 text-xs font-bold mr-3">Enviar Criativo</button>
                $1
            `);
            console.log("✅ Botão adicionado na tabela.");
        } else {
            console.log("⚠️ Botão de excluir não encontrado para referência.");
        }
    }

    // 2. Adicionar o Modal e o Script antes do </body> ou </html>
    if (!conteudo.includes('id="modalCriativo"')) {
        const modalHtml = `
    <!-- Modal de Envio de Criativo -->
    <div id="modalCriativo" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50">
        <div class="bg-slate-900 p-8 rounded-lg border border-slate-800 w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4">Enviar Criativo</h2>
            <form id="formCriativo" enctype="multipart/form-data">
                <input type="hidden" id="criativoClienteId">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Título do Criativo</label>
                    <input type="text" id="criativoTitulo" required class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Arquivo (Imagem/PDF)</label>
                    <input type="file" id="criativoArquivo" required class="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
                </div>
                <div class="flex justify-end gap-4">
                    <button type="button" onclick="fecharModalCriativo()" class="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                    <button type="submit" class="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg transition-colors">Enviar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function abrirModalCriativo(id) {
            document.getElementById('criativoClienteId').value = id;
            document.getElementById('modalCriativo').classList.remove('hidden');
            document.getElementById('modalCriativo').classList.add('flex');
        }

        function fecharModalCriativo() {
            document.getElementById('modalCriativo').classList.add('hidden');
            document.getElementById('modalCriativo').classList.remove('flex');
            document.getElementById('formCriativo').reset();
        }

        document.getElementById('formCriativo').addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('criativoClienteId').value;
            const titulo = document.getElementById('criativoTitulo').value;
            const arquivo = document.getElementById('criativoArquivo').files[0];

            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('arquivo', arquivo);

            try {
                const response = await fetch(\`/api/clientes/\${id}/criativos\`, {
                    method: 'POST',
                    headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` },
                    body: formData
                });

                if (response.ok) {
                    alert('Criativo enviado com sucesso!');
                    fecharModalCriativo();
                } else {
                    const erro = await response.json();
                    alert('Erro: ' + (erro.error || 'Erro ao enviar'));
                }
            } catch (error) {
                alert('Erro de conexão.');
            }
        });
    </script>
`;

        // Tenta colocar antes do </body>, se não existir, coloca antes do </html>
        if (conteudo.includes('</body>')) {
            conteudo = conteudo.replace('</body>', `${modalHtml}\n</body>`);
        } else {
            conteudo = conteudo.replace('</html>', `${modalHtml}\n</html>`);
        }
        console.log("✅ Modal e script adicionados com sucesso!");
    }

    fs.writeFileSync(caminhoClientes, conteudo, 'utf8');
    console.log("🚀 Arquivo clientes.html atualizado!");
} catch (error) {
    console.error("❌ Erro ao modificar o arquivo:", error.message);
}