-- ==========================================
-- SCRIPT DEFINITIVO DO BANCO DE DADOS
-- ==========================================

-- 1. USUÁRIOS (Admin)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Inserir Admin Padrão (admin@reverse.com / admin123)
INSERT INTO usuarios (nome, email, senha)
SELECT 'Admin', 'admin@reverse.com', '$2a$10$PxOtROxTkChlqcTvN3FfeeGebJA9wULlrbyg6mfHft9N.rFVGycGy'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@reverse.com');

-- 2. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(20),
    tipo VARCHAR(2),
    cpf VARCHAR(20),
    cnpj VARCHAR(20),
    senha VARCHAR(255),
    observacoes TEXT,
    razao_social VARCHAR(255),
    celular VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    data_nascimento DATE,
    status VARCHAR(50) DEFAULT 'ativo',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. LEADS
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    empresa VARCHAR(100),
    origem VARCHAR(50),
    status VARCHAR(50) DEFAULT 'novo',
    cliente_id INTEGER REFERENCES clientes(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROSPECTS
CREATE TABLE IF NOT EXISTS prospects (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    empresa VARCHAR(100),
    cargo VARCHAR(100),
    origem VARCHAR(50),
    status VARCHAR(50) DEFAULT 'novo',
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TAREFAS
CREATE TABLE IF NOT EXISTS tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_vencimento DATE,
    concluida BOOLEAN DEFAULT false,
    cliente_id INTEGER REFERENCES clientes(id),
    lead_id INTEGER REFERENCES leads(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TAGS E LEADS_TAGS
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS leads_tags (
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);

-- 7. MAPEAMENTO DE CLIENTES (Onboarding)
CREATE TABLE IF NOT EXISTS mapeamentos_clientes (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(100),
    nome_contato VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    cnpj VARCHAR(20),
    segmento VARCHAR(100),
    site VARCHAR(255),
    objetivo_principal TEXT,
    acesso_meta BOOLEAN DEFAULT false,
    acesso_google_ads BOOLEAN DEFAULT false,
    acesso_google_analytics BOOLEAN DEFAULT false,
    acesso_site BOOLEAN DEFAULT false,
    manual_marca BOOLEAN DEFAULT false,
    observacoes_acessos TEXT,
    observacoes_gerais TEXT,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CAMPANHAS
CREATE TABLE IF NOT EXISTS campanhas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    nome VARCHAR(200),
    descricao TEXT,
    orcamento NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'ativa',
    data_inicio DATE,
    data_fim DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. PERMISSÕES
CREATE TABLE IF NOT EXISTS permissoes_clientes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
    pode_ver_metricas BOOLEAN DEFAULT false,
    pode_ver_financeiro BOOLEAN DEFAULT false,
    pode_ver_calendario BOOLEAN DEFAULT false,
    pode_ver_branding BOOLEAN DEFAULT false,
    pode_ver_propostas BOOLEAN DEFAULT false,
    pode_ver_campanhas BOOLEAN DEFAULT false,
    pode_ver_tarefas BOOLEAN DEFAULT false,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. POSTS (Calendário Editorial)
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    data_publicacao DATE,
    plataforma VARCHAR(50),
    titulo VARCHAR(200),
    conteudo TEXT,
    url_midia TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    feedback_cliente TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. BRANDING
CREATE TABLE IF NOT EXISTS branding (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
    missao TEXT,
    visao TEXT,
    valores TEXT,
    publico_alvo TEXT,
    personalidade TEXT,
    tom_de_voz TEXT,
    cores_primarias VARCHAR(50),
    cores_secundarias VARCHAR(50),
    tipografia_principal VARCHAR(100),
    tipografia_secundaria VARCHAR(100),
    referencias_visuais TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. CRIATIVOS
CREATE TABLE IF NOT EXISTS criativos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    titulo VARCHAR(200),
    url_arquivo TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    feedback TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. BRIEFINGS
CREATE TABLE IF NOT EXISTS briefings (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    titulo VARCHAR(200),
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. FINANCEIRO
CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    tipo VARCHAR(50),
    descricao TEXT,
    valor NUMERIC(10,2),
    data DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);