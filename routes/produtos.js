// routes/produtos.js
const express = require('express');
const router = express.Router();

// IMPORTANTE: Ajuste o caminho abaixo para onde está a sua conexão com o banco.
// Se o seu arquivo 'db.js' estiver na raiz, use '../db'. 
// Se for na pasta config, use '../config/db'.
const db = require('../db'); 

// ==========================================
// 1. GET /api/produtos (Listar todos)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM produtos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error.message);
        res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
    }
});

// ==========================================
// 2. GET /api/produtos/:id (Buscar um para edição)
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar produto:", error.message);
        res.status(500).json({ error: 'Erro interno ao buscar o produto.' });
    }
});

// ==========================================
// 3. POST /api/produtos (Criar novo)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { nome, descricao, preco, categoria, sku, estoque, status } = req.body;

        // Validação básica no backend
        if (!nome || preco === undefined) {
            return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
        }

        const query = `
            INSERT INTO produtos (nome, descricao, preco, categoria, sku, estoque, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `;
        const valores = [
            nome, 
            descricao || '', 
            preco, 
            categoria || '', 
            sku || '', 
            estoque || 0, 
            status || 'ativo'
        ];

        const result = await db.query(query, valores);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar produto:", error.message);
        res.status(500).json({ error: 'Erro interno ao criar produto.' });
    }
});

// ==========================================
// 4. PUT /api/produtos/:id (Atualizar/Editar)
// ==========================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, categoria, sku, estoque, status } = req.body;

        if (!nome || preco === undefined) {
            return res.status(400).json({ error: 'Nome e Preço são obrigatórios.' });
        }

        const query = `
            UPDATE produtos 
            SET nome=$1, descricao=$2, preco=$3, categoria=$4, sku=$5, estoque=$6, status=$7 
            WHERE id=$8 
            RETURNING *
        `;
        const valores = [
            nome, 
            descricao || '', 
            preco, 
            categoria || '', 
            sku || '', 
            estoque || 0, 
            status || 'ativo', 
            id
        ];

        const result = await db.query(query, valores);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error.message);
        res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
    }
});

// ==========================================
// 5. DELETE /api/produtos/:id (Excluir)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json({ message: 'Produto excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir produto:", error.message);
        res.status(500).json({ error: 'Erro interno ao excluir produto.' });
    }
});

module.exports = router;