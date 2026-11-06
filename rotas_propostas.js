const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

module.exports = function(app, db, verificarToken) {
    
    // 1. GERAR PROPOSTA E SALVAR NO BANCO
    app.post('/api/propostas/gerar', verificarToken, async (req, res) => {
        try {
            const { clienteNome, clienteEmail, clienteTelefone, servicos, valorTotal, validade, condicoesPagamento, observacoes } = req.body;

            if (!clienteNome || !servicos || !valorTotal) {
                return res.status(400).json({ error: 'Nome do cliente, serviços e valor são obrigatórios.' });
            }

            // --- SALVA NO BANCO DE DADOS ---
            const queryInsert = `
                INSERT INTO propostas (cliente_nome, cliente_email, cliente_telefone, valor_total, validade, condicoes_pagamento, observacoes, servicos) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
            `;
            await db.query(queryInsert, [
                clienteNome, 
                clienteEmail || null, 
                clienteTelefone || null, 
                valorTotal, 
                validade || 15, 
                condicoesPagamento || null, 
                observacoes || null, 
                JSON.stringify(servicos)
            ]);

            // --- GERAÇÃO DO PDF ---
            const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="proposta-${clienteNome.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
            doc.pipe(res);

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
            const valorFormatado = `R$ ${parseFloat(valorTotal).toFixed(2).replace('.', ',')}`;
            doc.fontSize(28).fillColor('#16a34a').text(valorFormatado, 80, boxY + 40);

            doc.moveDown(4);
            if (doc.y > 650) doc.addPage();
            doc.fontSize(16).fillColor('#1e293b').text('Condições Comerciais', 60);
            doc.moveDown(0.5);
            doc.rect(60, doc.y, 475, 2).fillColor('#e2e8f0').fill();
            doc.moveDown(1);
            doc.fontSize(12).fillColor('#475569').text(`Validade da Proposta: ${validade || '15'} dias`, { continued: false });
            doc.moveDown(0.5);
            doc.text(`Condições de Pagamento: ${condicoesPagamento || 'A combinar'}`, { continued: false });
            
            if (observacoes) {
                doc.moveDown(2);
                doc.fontSize(14).fillColor('#1e293b').text('Observações Adicionais');
                doc.moveDown(0.5);
                doc.fontSize(11).fillColor('#475569').text(observacoes, { align: 'justify' });
            }

            doc.fontSize(9).fillColor('#94a3b8').text("Reverse Marketing | (11) 99999-9999 | contato@reversemarketing.com.br | www.reversemarketing.com.br", 60, doc.page.height - 40, { align: 'center' });

            doc.end();

        } catch (error) {
            console.error("Erro ao gerar/salvar proposta:", error);
            if (!res.headersSent) res.status(500).json({ error: 'Erro interno ao processar proposta' });
        }
    });

    // 2. LISTAR PROPOSTAS SALVAS (CONVERSÃO DE SERVIÇOS DE TEXTO PARA JSON)
    app.get('/api/propostas', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM propostas ORDER BY data_criacao DESC');
            
            // Garante que a coluna 'servicos' seja um array, mesmo se estiver salva como texto
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

};