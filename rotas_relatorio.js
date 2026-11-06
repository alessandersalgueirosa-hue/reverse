const PDFDocument = require('pdfkit');

module.exports = function(app, db, verificarToken) {
    
    // ==========================================
    // ROTA ANTIGA: RELATÓRIO INDIVIDUAL DO CLIENTE
    // ==========================================
    app.get('/api/portal/relatorio', verificarToken, async (req, res) => {
        try {
            const isCliente = req.user.tipo === 'cliente';
            let clienteId = isCliente ? req.user.id : req.query.cliente_id;
            
            if (!clienteId && req.user.tipo !== 'cliente') {
                const cli = await db.query('SELECT id FROM clientes LIMIT 1');
                if (cli.rows.length > 0) clienteId = cli.rows[0].id;
            }

            if (!clienteId) return res.status(400).json({ error: 'Cliente não identificado.' });

            const clienteRes = await db.query('SELECT * FROM clientes WHERE id = $1', [clienteId]);
            if (clienteRes.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            const cliente = clienteRes.rows[0];

            let metricas = [];
            try {
                const metricasRes = await db.query('SELECT * FROM trafego_pago WHERE cliente_id = $1', [clienteId]);
                metricas = metricasRes.rows;
            } catch (err) { console.log("Aviso: Tabela 'trafego_pago' não encontrada. Pulando no relatório."); }

            let criativos = [];
            try {
                const criativosRes = await db.query("SELECT * FROM criativos WHERE cliente_id = $1 AND status = 'aprovado'", [clienteId]);
                criativos = criativosRes.rows;
            } catch (err) { console.log("Aviso: Tabela 'criativos' não encontrada. Pulando no relatório."); }

            let tarefas = [];
            try {
                const tarefasRes = await db.query('SELECT * FROM tarefas WHERE cliente_id = $1', [clienteId]);
                tarefas = tarefasRes.rows;
            } catch (err) { console.log("Aviso: Tabela 'tarefas' não encontrada. Pulando no relatório."); }

            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="relatorio-${cliente.nome.replace(/\s+/g, '-')}.pdf"`);
            doc.pipe(res);

            doc.fontSize(24).fillColor('#f97316').text('Reverse Marketing', { align: 'center' });
            doc.fontSize(14).fillColor('#333').text('Relatório de Resultados', { align: 'center' });
            doc.moveDown(2);

            doc.fontSize(16).fillColor('#000').text(`Cliente: ${cliente.nome || 'Não informado'}`);
            doc.fontSize(10).fillColor('#555').text(`E-mail: ${cliente.email || 'Não informado'}`);
            doc.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}`);
            doc.moveDown(2);

            doc.fontSize(16).fillColor('#000').text('Resumo das Campanhas', { underline: true });
            doc.moveDown(1);

            if (metricas.length === 0) {
                doc.fontSize(12).text('Nenhuma métrica de campanha registrada neste período.');
            } else {
                let totalInvestimento = 0;
                metricas.forEach(m => {
                    const investimento = parseFloat(m.investimento_total || m.investimento) || 0;
                    totalInvestimento += investimento;
                    if (doc.y > 700) doc.addPage();
                    doc.fontSize(12).fillColor('#000').text(`${m.nome_campanha || 'Campanha'} (${m.plataforma || 'Geral'})`);
                    doc.fontSize(10).fillColor('#555').text(`Investimento: R$ ${investimento.toFixed(2)}`);
                    doc.moveDown(0.5);
                });
                doc.moveDown(1);
                doc.fontSize(14).fillColor('#f97316').text(`Investimento Total: R$ ${totalInvestimento.toFixed(2)}`);
            }
            
            doc.moveDown(2);
            doc.fontSize(16).fillColor('#000').text('Acompanhamento de Tarefas', { underline: true });
            doc.moveDown(1);

            if (tarefas.length === 0) {
                doc.fontSize(12).text('Nenhuma tarefa registrada.');
            } else {
                tarefas.forEach(t => {
                    if (doc.y > 700) doc.addPage();
                    doc.fontSize(12).fillColor('#000').text(`- ${t.titulo || 'Tarefa'} (${t.concluida ? 'Concluída' : 'Em Andamento'})`);
                    doc.moveDown(0.5);
                });
            }

            doc.moveDown(2);
            doc.fontSize(16).fillColor('#000').text('Criativos Aprovados', { underline: true });
            doc.moveDown(1);

            if (criativos.length === 0) {
                doc.fontSize(12).text('Nenhum criativo aprovado ainda.');
            } else {
                criativos.forEach(c => {
                    if (doc.y > 700) doc.addPage();
                    doc.fontSize(12).fillColor('#000').text(`- ${c.titulo || 'Criativo sem título'}`);
                    doc.moveDown(0.5);
                });
            }

            const range = doc.bufferedPageRange(); 
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#999').text(
                    'Relatório gerado automaticamente pelo sistema Reverse Marketing.',
                    50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 }
                );
            }

            doc.end();
        } catch (error) {
            console.error("❌ ERRO AO GERAR PDF:", error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Erro interno ao gerar relatório' });
            } else {
                res.end();
            }
        }
    });

    // ==========================================
    // NOVA ROTA: RELATÓRIO GERAL DA AGÊNCIA (ADMIN)
    // ==========================================
    app.get('/api/relatorio/geral', verificarToken, async (req, res) => {
        try {
            const { mes, ano } = req.query; 
            
            // Define o período (Se não vier nada, usa o mês atual)
            const dataInicio = `${ano}-${mes}-01`;
            const dataFim = `${ano}-${mes}-31`;

            // 1. Clientes Ativos (Total geral)
            const totalClientes = await db.query('SELECT COUNT(*) AS total FROM clientes WHERE status = $1', ['ativo']);
            
            // 2. Campanhas Ativas (Total geral)
            const totalCampanhas = await db.query('SELECT COUNT(*) AS total FROM campanhas WHERE status = $1', ['ativa']);
            
            // 3. Tarefas Concluídas no mês
            const tarefasConcluidas = await db.query(
                'SELECT COUNT(*) AS total FROM tarefas WHERE concluida = true AND data_vencimento BETWEEN $1 AND $2', 
                [dataInicio, dataFim]
            );

            // 4. Balanço Financeiro do mês
            const receitas = await db.query(
                'SELECT SUM(valor) AS total FROM receitas WHERE data BETWEEN $1 AND $2', 
                [dataInicio, dataFim]
            );
            const despesas = await db.query(
                'SELECT SUM(valor) AS total FROM despesas WHERE data BETWEEN $1 AND $2', 
                [dataInicio, dataFim]
            );

            const totalReceita = parseFloat(receitas.rows[0].total || 0);
            const totalDespesa = parseFloat(despesas.rows[0].total || 0);
            const saldo = totalReceita - totalDespesa;

            // 5. Novos Leads no mês
            const novosLeads = await db.query(
                'SELECT COUNT(*) AS total FROM leads WHERE data_criacao BETWEEN $1 AND $2', 
                [dataInicio, dataFim]
            );

            // GERAÇÃO DO PDF
            const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="relatorio-geral-${mes}-${ano}.pdf"`);
            doc.pipe(res);

            // CAPA
            doc.rect(0, 0, doc.page.width, 120).fillColor('#f97316').fill();
            doc.fontSize(24).fillColor('#ffffff').text('Reverse Marketing', 60, 50);
            doc.fontSize(12).fillColor('#ffffff').text('Relatório Global da Agência', 60, 85);
            doc.moveDown(6);
            
            doc.fontSize(28).fillColor('#1e293b').text(`Relatório de ${mes}/${ano}`, 60);
            doc.moveDown(2);

            // SEÇÃO 1: VISÃO GERAL
            doc.rect(60, doc.y, 10, 20).fillColor('#3b82f6').fill();
            doc.fontSize(18).fillColor('#1e293b').text('1. Visão Geral', 80, doc.y - 5);
            doc.moveDown(1);
            doc.fontSize(12).fillColor('#475569').text(`Total de Clientes Ativos: ${totalClientes.rows[0].total}`, 60);
            doc.fontSize(12).text(`Campanhas Ativas: ${totalCampanhas.rows[0].total}`, 60);
            doc.fontSize(12).text(`Novos Leads no Mês: ${novosLeads.rows[0].total}`, 60);

            // SEÇÃO 2: OPERAÇÃO
            doc.moveDown(2);
            doc.rect(60, doc.y, 10, 20).fillColor('#22c55e').fill();
            doc.fontSize(18).fillColor('#1e293b').text('2. Operação (Tarefas)', 80, doc.y - 5);
            doc.moveDown(1);
            doc.fontSize(12).fillColor('#475569').text(`Tarefas Concluídas no Mês: ${tarefasConcluidas.rows[0].total}`, 60);

            // SEÇÃO 3: FINANCEIRO
            doc.moveDown(2);
            doc.rect(60, doc.y, 10, 20).fillColor('#eab308').fill();
            doc.fontSize(18).fillColor('#1e293b').text('3. Balanço Financeiro', 80, doc.y - 5);
            doc.moveDown(1);
            doc.fontSize(12).fillColor('#22c55e').text(`Receita Total: R$ ${totalReceita.toFixed(2).replace('.', ',')}`, 60);
            doc.fontSize(12).fillColor('#ef4444').text(`Despesa Total: R$ ${totalDespesa.toFixed(2).replace('.', ',')}`, 60);
            
            const corSaldo = saldo >= 0 ? '#22c55e' : '#ef4444';
            doc.fontSize(14).fillColor(corSaldo).text(`Saldo Líquido: R$ ${saldo.toFixed(2).replace('.', ',')}`, 60);

            // RODAPÉ
            const paginas = doc.bufferedPageRange();
            for (let i = 0; i < paginas.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(9).fillColor('#94a3b8').text(
                    `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} | Página ${i + 1} de ${paginas.count}`, 
                    60, doc.page.height - 40, { align: 'center', width: 475 }
                );
            }

            doc.end();

        } catch (error) {
            console.error("Erro ao gerar relatório geral:", error);
            if (!res.headersSent) res.status(500).json({ error: 'Erro interno ao gerar relatório.' });
        }
    });
};