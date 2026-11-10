const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = function(app, db, verificarToken) {

    // ============================================================================
    // HELPERS: sanitização de entrada
    // A tabela propostas tem validade INTEGER e valor_total NUMERIC.
    // O frontend pode enviar "30 Dias" ou "R$ 1.500,00" — precisamos converter.
    // ============================================================================
    function parseValidade(validade) {
        if (validade === null || validade === undefined || validade === '') return 15;
        if (typeof validade === 'number') return Math.max(1, Math.round(validade));
        const match = String(validade).match(/\d+/);
        return match ? parseInt(match[0], 10) : 15;
    }

    function parseValorMonetario(valor) {
        if (valor === null || valor === undefined || valor === '') return 0;
        if (typeof valor === 'number') return valor;
        const limpo = String(valor)
            .replace(/[^\d,.-]/g, '')   // remove tudo que não é dígito, vírgula, ponto ou hífen
            .replace(/\./g, '')          // remove pontos de milhar
            .replace(',', '.');          // vírgula decimal → ponto
        const num = parseFloat(limpo);
        return isNaN(num) ? 0 : num;
    }

    // ============================================================================
    // HELPER: RENDERIZA O CONTEÚDO DA PROPOSTA NO PDF
    // Reaproveitado pela rota /gerar (PDF normal) e /pdf-assinado (PDF com comprovante)
    // ============================================================================
    function renderizarPropostaPDF(doc, dados) {
        const { clienteNome, clienteEmail, clienteTelefone, servicos, valorTotal, validade, condicoesPagamento, observacoes } = dados;

        // CAPA
        doc.rect(0, 0, doc.page.width, 150).fillColor('#f97316').fill();
        const caminhoLogo = path.join(__dirname, 'public', 'logo.png');

        if (fs.existsSync(caminhoLogo)) {
            doc.image(caminhoLogo, 60, 40, { width: 120 });
        } else {
            doc.fontSize(24).fillColor('#ffffff').text('Reverse Marketing', 60, 60);
        }

        doc.fillColor('#ffffff').fontSize(14).text('PROPOSTA COMERCIAL', 60, 110, { characterSpacing: 2 });
        doc.moveDown(8);
        doc.fontSize(32).fillColor('#1e293b').text('Proposta de\nServiços', 60, 250, { lineGap: 5 });
        doc.moveDown(2);
        doc.fontSize(14).fillColor('#64748b').text('Preparada exclusivamente para:', 60);
        doc.fontSize(20).fillColor('#f97316').text(clienteNome, 60);
        doc.moveDown(8);
        doc.fontSize(10).fillColor('#94a3b8').text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 60);
        if (clienteEmail) doc.text(`E-mail: ${clienteEmail}`, 60);

        doc.rect(0, doc.page.height - 40, doc.page.width, 40).fillColor('#1e293b').fill();
        doc.fontSize(9).fillColor('#ffffff').text('Reverse Marketing | Estratégia e Resultados', 0, doc.page.height - 25, { align: 'center' });

        // PÁGINA 2
        doc.addPage();
        doc.rect(60, 60, 10, 30).fillColor('#f97316').fill();
        doc.fontSize(20).fillColor('#1e293b').text('Escopo dos Serviços', 80, 65);
        doc.moveDown(1);
        doc.fontSize(12).fillColor('#475569').text('Abaixo estão detalhados os serviços que serão executados para alcançar os objetivos do seu negócio.', { align: 'justify' });
        doc.moveDown(2);

        if (Array.isArray(servicos)) {
            servicos.forEach((servico) => {
                if (doc.y > 650) doc.addPage();
                doc.circle(65, doc.y + 5, 4).fillColor('#f97316').fill();
                doc.fontSize(13).fillColor('#1e293b').text(`${servico.nome}`, 80, doc.y - 5);
                if (servico.descricao) doc.fontSize(11).fillColor('#64748b').text(`${servico.descricao}`, 80, doc.y + 2, { align: 'justify' });
                doc.moveDown(1.5);
            });
        }

        if (doc.y > 600) doc.addPage();
        doc.moveDown(2);
        const boxY = doc.y;
        doc.rect(60, boxY, 475, 80).fillColor('#f8fafc').fill();
        doc.rect(60, boxY, 5, 80).fillColor('#16a34a').fill();
        doc.fontSize(14).fillColor('#64748b').text('Investimento Total:', 80, boxY + 20);
        const valorFormatado = `R$ ${parseValorMonetario(valorTotal).toFixed(2).replace('.', ',')}`;
        doc.fontSize(28).fillColor('#16a34a').text(valorFormatado, 80, boxY + 40);

        doc.moveDown(4);
        if (doc.y > 650) doc.addPage();
        doc.fontSize(16).fillColor('#1e293b').text('Condições Comerciais', 60);
        doc.moveDown(0.5);
        doc.rect(60, doc.y, 475, 2).fillColor('#e2e8f0').fill();
        doc.moveDown(1);
        doc.fontSize(12).fillColor('#475569').text(`Validade da Proposta: ${parseValidade(validade)} dias`, { continued: false });
        doc.moveDown(0.5);
        doc.text(`Condições de Pagamento: ${condicoesPagamento || 'A combinar'}`, { continued: false });

        if (observacoes) {
            doc.moveDown(2);
            doc.fontSize(14).fillColor('#1e293b').text('Observações Adicionais');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#475569').text(observacoes, { align: 'justify' });
        }

        doc.fontSize(9).fillColor('#94a3b8').text("Reverse Marketing | (11) 99999-9999 | contato@reversemarketing.com.br | www.reversemarketing.com.br", 60, doc.page.height - 40, { align: 'center' });
    }

    // ============================================================================
    // 1. GERAR PROPOSTA E SALVAR NO BANCO (com token de aceite)
    // ============================================================================
    app.post('/api/propostas/gerar', verificarToken, async (req, res) => {
        try {
            const { clienteNome, clienteEmail, clienteTelefone, servicos, valorTotal, validade, condicoesPagamento, observacoes } = req.body;

            if (!clienteNome || !servicos) {
                return res.status(400).json({ error: 'Nome do cliente e serviços são obrigatórios.' });
            }

            // ⬇️ Sanitiza antes de mandar pro banco
            const validadeNum = parseValidade(validade);
            const valorNum = parseValorMonetario(valorTotal);

            if (valorNum <= 0) {
                return res.status(400).json({ error: 'Valor total inválido. Informe um número maior que zero.' });
            }

            // Gera o token de aceite
            const tokenAceite = crypto.randomBytes(32).toString('hex');

            const queryInsert = `
                INSERT INTO propostas (
                    cliente_nome, cliente_email, cliente_telefone, valor_total, 
                    validade, condicoes_pagamento, observacoes, servicos, 
                    token_aceite, status_aceite
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pendente') 
                RETURNING id, token_aceite
            `;
            const result = await db.query(queryInsert, [
                clienteNome,
                clienteEmail || null,
                clienteTelefone || null,
                valorNum,
                validadeNum,
                condicoesPagamento || null,
                observacoes || null,
                JSON.stringify(servicos),
                tokenAceite
            ]);

            const propostaId = result.rows[0].id;
            const tokenGerado = result.rows[0].token_aceite;

            // Log útil no terminal para o admin copiar o link rapidamente
            console.log(`\n📝 Proposta #${propostaId} criada | Token: ${tokenGerado}`);
            console.log(`🔗 Link de assinatura: /assinar/${tokenGerado}\n`);

            // --- GERAÇÃO DO PDF ---
            const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="proposta-${clienteNome.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
            res.setHeader('X-Proposta-Token', tokenGerado);
            res.setHeader('X-Proposta-Id', String(propostaId));

            doc.pipe(res);
            renderizarPropostaPDF(doc, {
                clienteNome, clienteEmail, clienteTelefone, servicos,
                valorTotal: valorNum, validade: validadeNum,
                condicoesPagamento, observacoes
            });
            doc.end();

        } catch (error) {
            console.error("Erro ao gerar/salvar proposta:", error);
            if (!res.headersSent) res.status(500).json({ error: 'Erro interno ao processar proposta' });
        }
    });

    // ============================================================================
    // 2. LISTAR PROPOSTAS SALVAS
    // ============================================================================
    app.get('/api/propostas', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM propostas ORDER BY data_criacao DESC');

            const rows = result.rows.map(r => {
                if (typeof r.servicos === 'string') {
                    try { r.servicos = JSON.parse(r.servicos); } catch (e) { r.servicos = []; }
                }
                return r;
            });

            res.json(rows);
        } catch (error) {
            console.error("Erro ao buscar propostas:", error.message);
            if (error.message.includes("does not exist")) return res.json([]);
            res.status(500).json({ error: 'Erro ao buscar propostas' });
        }
    });

    // ============================================================================
    // ================ ROTAS DE ASSINATURA DIGITAL ================================
    // ============================================================================

    // 3. ROTA PÚBLICA: BUSCAR PROPOSTA PELO TOKEN
    app.get('/api/proposta-publica/:token', async (req, res) => {
        try {
            const { token } = req.params;

            if (!token || token.length !== 64) {
                return res.status(400).json({ error: 'Token inválido.' });
            }

            const result = await db.query(
                `SELECT id, cliente_nome, cliente_email, cliente_telefone,
                        valor_total, validade, condicoes_pagamento, observacoes, servicos,
                        status_aceite, aceite_em, recusa_em, recusa_motivo, data_criacao
                 FROM propostas
                 WHERE token_aceite = $1`,
                [token]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Proposta não encontrada.' });
            }

            const proposta = result.rows[0];

            if (typeof proposta.servicos === 'string') {
                try { proposta.servicos = JSON.parse(proposta.servicos); } catch (e) { proposta.servicos = []; }
            }

            res.json(proposta);

        } catch (error) {
            console.error("Erro ao buscar proposta pública:", error);
            res.status(500).json({ error: 'Erro interno.' });
        }
    });

    // 4. ROTA PÚBLICA: ACEITAR PROPOSTA
    app.post('/api/proposta-publica/:token/aceitar', async (req, res) => {
        try {
            const { token } = req.params;

            const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() 
                        || req.socket.remoteAddress 
                        || 'desconhecido';
            const userAgent = req.headers['user-agent'] || '';

            const busca = await db.query(
                'SELECT * FROM propostas WHERE token_aceite = $1',
                [token]
            );

            if (busca.rows.length === 0) {
                return res.status(404).json({ error: 'Proposta não encontrada.' });
            }

            const proposta = busca.rows[0];

            if (proposta.status_aceite !== 'pendente') {
                return res.status(400).json({ 
                    error: `Esta proposta já foi ${proposta.status_aceite === 'aceita' ? 'aceita' : 'recusada'} anteriormente.` 
                });
            }

            const dadosParaHash = {
                id: proposta.id,
                cliente_nome: proposta.cliente_nome,
                cliente_email: proposta.cliente_email,
                valor_total: proposta.valor_total,
                validade: proposta.validade,
                condicoes_pagamento: proposta.condicoes_pagamento,
                servicos: typeof proposta.servicos === 'string' ? proposta.servicos : JSON.stringify(proposta.servicos),
                observacoes: proposta.observacoes
            };
            const hash = crypto.createHash('sha256').update(JSON.stringify(dadosParaHash)).digest('hex');

            await db.query(
                `UPDATE propostas
                 SET status_aceite = 'aceita',
                     aceite_em = NOW(),
                     aceite_ip = $1,
                     aceite_user_agent = $2,
                     aceite_hash_pdf = $3
                 WHERE id = $4`,
                [ip, userAgent, hash, proposta.id]
            );

            console.log(`✅ Proposta #${proposta.id} ACEITA por ${proposta.cliente_nome} | IP: ${ip}`);

            try {
                const mailer = require('./mailer');
                if (mailer.enviarEmailAgencia) {
                    await mailer.enviarEmailAgencia(
                        `✅ Proposta aceita: ${proposta.cliente_nome}`,
                        `A proposta #${proposta.id} foi aceita digitalmente.\n\n` +
                        `Cliente: ${proposta.cliente_nome}\n` +
                        `Valor: R$ ${parseFloat(proposta.valor_total).toFixed(2).replace('.', ',')}\n` +
                        `Data/hora: ${new Date().toLocaleString('pt-BR')}\n` +
                        `IP: ${ip}\n` +
                        `Hash SHA-256: ${hash}`
                    );
                }
            } catch (mailErr) {
                console.warn('⚠️ E-mail de notificação não enviado:', mailErr.message);
            }

            res.json({ ok: true, mensagem: 'Proposta aceita com sucesso!', hash });

        } catch (error) {
            console.error("Erro ao aceitar proposta:", error);
            res.status(500).json({ error: 'Erro interno ao aceitar.' });
        }
    });

    // 5. ROTA PÚBLICA: RECUSAR PROPOSTA
    app.post('/api/proposta-publica/:token/recusar', async (req, res) => {
        try {
            const { token } = req.params;
            const { motivo } = req.body;

            if (!motivo || motivo.trim().length < 10) {
                return res.status(400).json({ error: 'Descreva o motivo da recusa (mínimo 10 caracteres).' });
            }

            const busca = await db.query(
                'SELECT id, cliente_nome, status_aceite FROM propostas WHERE token_aceite = $1',
                [token]
            );

            if (busca.rows.length === 0) {
                return res.status(404).json({ error: 'Proposta não encontrada.' });
            }

            const proposta = busca.rows[0];

            if (proposta.status_aceite !== 'pendente') {
                return res.status(400).json({ error: 'Esta proposta já foi finalizada.' });
            }

            await db.query(
                `UPDATE propostas
                 SET status_aceite = 'recusada',
                     recusa_em = NOW(),
                     recusa_motivo = $1
                 WHERE id = $2`,
                [motivo.trim(), proposta.id]
            );

            console.log(`❌ Proposta #${proposta.id} RECUSADA por ${proposta.cliente_nome}`);

            try {
                const mailer = require('./mailer');
                if (mailer.enviarEmailAgencia) {
                    await mailer.enviarEmailAgencia(
                        `❌ Proposta recusada: ${proposta.cliente_nome}`,
                        `A proposta #${proposta.id} foi recusada.\n\nMotivo: ${motivo}`
                    );
                }
            } catch (mailErr) {
                console.warn('⚠️ E-mail de notificação não enviado:', mailErr.message);
            }

            res.json({ ok: true, mensagem: 'Recusa registrada.' });

        } catch (error) {
            console.error("Erro ao recusar proposta:", error);
            res.status(500).json({ error: 'Erro interno ao recusar.' });
        }
    });

    // 6. ROTA PROTEGIDA: GERAR PDF ASSINADO (com página de comprovação)
    app.get('/api/propostas/:id/pdf-assinado', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;

            const result = await db.query('SELECT * FROM propostas WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Proposta não encontrada.' });
            }

            const p = result.rows[0];

            if (p.status_aceite !== 'aceita') {
                return res.status(400).json({ error: 'Esta proposta ainda não foi aceita pelo cliente.' });
            }

            let servicos = p.servicos;
            if (typeof servicos === 'string') {
                try { servicos = JSON.parse(servicos); } catch (e) { servicos = []; }
            }

            const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="proposta-${id}-assinada.pdf"`);
            doc.pipe(res);

            renderizarPropostaPDF(doc, {
                clienteNome: p.cliente_nome,
                clienteEmail: p.cliente_email,
                clienteTelefone: p.cliente_telefone,
                servicos: servicos,
                valorTotal: p.valor_total,
                validade: p.validade,
                condicoesPagamento: p.condicoes_pagamento,
                observacoes: p.observacoes
            });

            // Página final: comprovante de aceite digital
            doc.addPage();
            doc.rect(60, 60, 10, 30).fillColor('#16a34a').fill();
            doc.fontSize(20).fillColor('#1e293b').text('Comprovante de Aceite Digital', 80, 65);
            doc.moveDown(3);

            doc.fontSize(11).fillColor('#475569');
            doc.text(`Proposta nº: `, { continued: true }).fillColor('#1e293b').text(`#${p.id}`);
            doc.moveDown(0.5);
            doc.fillColor('#475569').text(`Cliente: `, { continued: true }).fillColor('#1e293b').text(p.cliente_nome || '—');
            doc.moveDown(0.5);
            doc.fillColor('#475569').text(`Valor total: `, { continued: true }).fillColor('#1e293b')
               .text(`R$ ${parseFloat(p.valor_total).toFixed(2).replace('.', ',')}`);
            doc.moveDown(0.5);
            doc.fillColor('#475569').text(`Data/hora do aceite: `, { continued: true }).fillColor('#1e293b')
               .text(new Date(p.aceite_em).toLocaleString('pt-BR'));
            doc.moveDown(0.5);
            doc.fillColor('#475569').text(`Endereço IP: `, { continued: true }).fillColor('#1e293b').text(p.aceite_ip || '—');
            doc.moveDown(0.5);
            doc.fillColor('#475569').text(`Navegador: `, { continued: true }).fillColor('#1e293b')
               .text((p.aceite_user_agent || '—').substring(0, 100), { width: 475 });

            doc.moveDown(2);
            doc.fontSize(12).fillColor('#1e293b').text('Hash de integridade (SHA-256):');
            doc.moveDown(0.5);
            doc.fontSize(9).fillColor('#475569').text(p.aceite_hash_pdf || '—', { width: 475 });

            doc.moveDown(2);
            doc.fontSize(8).fillColor('#94a3b8').text(
                'Este documento foi aceito eletronicamente conforme a Medida Provisória nº 2.200-2/2001. ' +
                'O hash SHA-256 acima permite verificar que o conteúdo da proposta não foi alterado após o aceite do cliente. ' +
                'O registro do IP e do navegador identifica o dispositivo utilizado no momento da aceitação.',
                { width: 475, align: 'justify' }
            );

            doc.end();

        } catch (error) {
            console.error("Erro ao gerar PDF assinado:", error);
            if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar PDF assinado.' });
        }
    });

};