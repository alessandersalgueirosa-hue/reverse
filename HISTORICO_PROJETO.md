# 📌 Histórico e Contexto do Projeto (Reverse Marketing)

Este arquivo serve para manter o contexto do projeto, evitando perda de informações devido a limites de chat. Sempre que uma etapa for concluída, adicione um novo registro abaixo.

---

## 🛠️ Stack do Sistema
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (rodando via Docker)
- **Frontend:** HTML + TailwindCSS (Dark Mode)
- **Autenticação:** JWT (JSON Web Token) - *Atenção: Algumas rotas estão sem token provisoriamente para testes.*
- **Infraestrutura:** Ubuntu Linux, Nginx (preparado), PM2 para produção.

---

## 📅 Registro de Alterações e Decisões

### [Data Atual] - Módulo de Produtos e Portal do Cliente (Aprovado)
**O que foi feito:**
- **Produtos:** CRUD completo criado e funcionando. Tabela `produtos` no banco.
- **Mapeamento:** Formulário e listagem de clientes mapeados funcionando (tabela `mapeamentos_clientes`).
- **Portal do Cliente (Tarefas):** Tela criada (`portal_cliente.html`). Exibe tarefas em tempo real e um card com o nome/email do cliente logado.
- **Portal do Cliente (Criativos):** 
  - Criação da tabela `criativos`.
  - O cliente pode aprovar (com feedback opcional) ou recusar (com feedback obrigatório).
  - O sistema já salva o motivo da recusa e da aprovação.
- **Gestão de Criativos (Agência):** Tela `criativos.html` criada. A agência visualiza o status (Aprovado/Recusado) e o feedback exato digitado pelo cliente.
- **Upload de Criativos:** Botão na tela de Clientes (`clientes.html`) com modal. Salva a imagem na pasta `public/uploads/criativos`.

**Problemas Resolvidos:**
- O erro `EADDRINUSE` (porta 3000 ocupada) foi resolvido matando processos fantasma.
- O Docker estava sem espaço (tentou copiar 25GB). Solução: Criar o arquivo `.dockerignore` (ignorando `node_modules` e backups).
- O Cline estava falhando ao editar arquivos grandes. Solução: Fazer edições cirúrgicas no VS Code ou usar o terminal.

**O que está pendente / Próximos passos:**
1. **Login Exclusivo do Cliente:** Atualmente o Admin acessa o portal. O ideal é separar as tabelas `usuarios` (agência) e `clientes` (portal).
2. **Integração de Pagamentos:** Mercado Pago (Checkout Pro). Aguardando a compra do domínio para configurar os Webhooks.
3. **Adicionar o link "Criativos" no menu** de todas as páginas do sistema (podemos usar o script `atualizar_menu_portal.js` como base).
4. **Configurar HTTPS/Nginx:** Domínio comprado, mas certificado SSL (Certbot) ainda não gerado.

---

## 📝 Dicas de Ouro para o Cline (Prompts)
- **Não peça para o Cline editar arquivos com mais de 200 linhas.** Ele falha. Peça para ele criar um arquivo novo ou use um script Node.js separado.
- **Arquivos que não devem ser enviados para o Docker:** O `node_modules` deve ser instalado dentro do container via `npm install`. Use o `.dockerignore`.
- **Onde ficam as rotas complexas:** As rotas de portal e agência estão no final do `server.js` ou em arquivos separados.

## 📅 Atualizações Recentes e Correções Críticas (Fase de Estabilização)

### 1. Módulo de Branding (Brand Book)
*   **O que foi feito:** Criação da tabela `branding` no PostgreSQL e da tela `branding.html` (formulário completo com Essência, Público e Identidade Visual).
*   **Visualização:** Criação da tela `lista_brandings.html` que exibe os Brand Books em formato de "cards" bonitos, com modal de visualização detalhada.
*   **Correção:** A tabela `mapeamentos_clientes` não possuía a coluna `email`, o que causava erro no script de popular o banco. O script foi ajustado.

### 2. Calendário Editorial (Aprovação de Posts)
*   **O que foi feito:** Criação da tabela `posts` e da tela `calendario_editorial.html` para a agência agendar posts.
*   **Pendente:** Falta criar a aba de aprovação no Portal do Cliente para ele aprovar/recusar os posts.

### 3. Controle de Acesso e Permissões (Segurança)
*   **O que foi feito:** 
    *   Criação da tabela `permissoes_clientes` (Métricas, Financeiro, Calendário, Branding, Propostas, Campanhas, Tarefas).
    *   Criação da tela `permissoes.html` (Admin define o que o cliente pode ver).
    *   **Menu Dinâmico:** O script `adicionar_menu_branding.js` foi reescrito. Agora ele injeta **dois menus** (Admin e Cliente). O JavaScript lê o token JWT e as permissões salvas no `localStorage` para exibir o menu correto.
    *   **Bloqueio de Rota:** Clientes que tentam acessar URLs de Admin são redirecionados para o Portal.
    *   **Login do Cliente:** A rota `/api/login-cliente` agora retorna o token + as permissões do banco, e o `login-cliente.html` salva isso no navegador.

### 4. Filtros e Exportação CSV
*   **Leads:** Adicionados filtros de busca, status e data. Botão "Exportar CSV" funcional.
*   **Clientes:** Adicionados filtros de busca, tipo e data. Botão "Exportar CSV" funcional.
*   **Financeiro:** Adicionados filtros de cliente, mês/ano e tipo (Receita/Despesa/Investimento). Botão "Exportar CSV" funcional.

### 5. Correções de Bugs e Estabilidade
*   **Erro `EADDRINUSE` (Porta 3000):** Resolvido matando processos fantasmas com `npx kill-port 3000`.
*   **Erro `MODULE_NOT_FOUND` (bcrypt):** O `rotas_clientes.js` não importava o `bcrypt` no topo. Corrigido.
*   **Erro `parserOpenTable` (Tabela não existe):** O banco foi recriado e algumas tabelas ficaram faltando. Criamos o script `reconstruir_sistema_completo.js` para recriar toda a estrutura base.
*   **Banco de Dados Zerado:** Criamos o script `popular_banco_final.js` para inserir dados fictícios (Cliente Teste, Tarefas, Branding, Post, Financeiro, Permissões) e facilitar os testes.
*   **Conflito de Menu / Erro de Sintaxe (`SyntaxError`):** O botão `btnSair` foi removido do HTML, mas o JS antigo ainda tentava acessá-lo. Como consequência, a página de Leads e o Portal do Cliente travavam no "Carregando...". A função foi removida e o código corrigido.
*   **Exclusão de Cliente:** O banco bloqueava a exclusão de clientes com dados vinculados. O frontend agora exibe o erro exato ("Existem dados vinculados"). Foi criado um script de força bruta (`excluir_cliente_forcado.js`) que apaga tudo do cliente antes de excluí-lo.

### ⚠️ Pendências / Próximos Passos
1.  **Aprovação de Posts no Portal:** Criar a aba no Portal do Cliente para ler a tabela `posts` e permitir Aprovar/Recusar.
2.  **Relatório PDF (Branding):** Criar um botão para exportar o Brand Book em PDF.
3.  **Integração de Pagamentos:** Mercado Pago (aguardando domínio).
4.  **Publicação no Servidor:** Configurar Nginx e HTTPS no Ubuntu.
5.  **Polimento Visual:** Corrigir a exibição do menu em telas menores (mobile) e ajustar o erro de "modo de compatibilidade" (Quirks Mode) que aparece no console.
# 🛠️ Resumo de Correções e Ajustes do Sistema - Reverse Marketing

Este documento resume todas as correções de bugs, ajustes de rotas e melhorias estruturais realizadas no sistema para garantir o seu pleno funcionamento.

## 1. Configuração do Servidor e Banco de Dados
*   **Conexão PostgreSQL:** O banco de dados foi configurado e validado com sucesso. O servidor agora inicia exibindo a mensagem `✅ Conectado ao PostgreSQL com sucesso!`.
*   **Modularização de Rotas:** O arquivo `server.js` foi limpo. Todas as rotas do sistema foram organizadas e linkadas corretamente através dos arquivos da pasta (ex: `rotas_gerais.js`, `rotas_leads.js`, etc).
*   **Autenticação (JWT):** O middleware `verificarToken` foi ajustado no `server.js` para garantir que o Login do Administrador funcione corretamente.

## 2. Módulo de Produtos (`produtos.html` e `rotas_gerais.js`)
*   **CRUD Completo:** As rotas de Listar, Criar, Editar e Excluir produtos foram unificadas no `rotas_gerais.js`.
*   **Campo Status:** Adicionada a coluna `status` (ativo/inativo) para controle visual na tabela.
*   **Segurança no Frontend:** O arquivo HTML foi reescrito para incluir envio de Token JWT, tratamento de erros e escape de HTML (para evitar injeção de scripts).

## 3. Dashboard Administrativo (`admin.html`)
*   **Correção Financeira (Bug dos Milhões):** O erro que calculava valores astronômicos (ex: R$ 12.371.023,00) no resumo financeiro foi corrigido. A lógica agora soma corretamente as receitas e despesas sem duplicar os valores dos clientes.
*   **Scripts Duplicados:** Menus e scripts que estavam duplicados na página foram unificados para evitar travamentos.

## 4. Portal do Cliente (`portal_cliente.html`)
*   **Navegação por Abas:** A função `mudarAba()` (que estava faltando) foi criada. Agora é possível alternar entre "Minhas Tarefas", "Aprovação de Criativos", "Resultados" (Gráficos) e "Briefing".
*   **Download de Relatório (PDF):** Corrigido o erro que impedia a geração do PDF. O layout agora quebra páginas automaticamente se o relatório for muito longo.
*   **Gráficos:** A rota `/api/portal/metricas` foi corrigida para não quebrar caso a tabela de tráfego pago esteja vazia.

## 5. Aprovação de Criativos (`criativos.html` e `rotas_criativos.js`)
*   **Botões de Ação:** Foram adicionados os botões "Aprovar" e "Recusar" na tabela do Admin.
*   **Funcionalidade:** O envio do feedback do cliente e a alteração do status agora atualizam o banco de dados corretamente.

## 6. Branding e Briefings (`branding.html` e `briefings.html`)
*   **Brand Book:** As rotas `/api/branding` foram criadas. Agora o Admin consegue salvar e carregar a identidade da marca (missão, visão, cores, etc.) de cada cliente.
*   **Briefings Admin:** A rota `/api/admin/briefings` foi criada. O Admin agora consegue visualizar todos os briefings preenchidos pelos clientes no portal.

## 7. Base de Conhecimento (`base_conhecimento.html` e `rotas_gerais.js`)
*   **Artigos:** O painel de artigos foi consertado. Agora é possível listar, criar e excluir artigos de texto.
*   **Upload de Arquivos:** O recurso de anexar PDF foi desativado temporariamente para garantir a estabilidade do servidor. O sistema funciona 100% focado em conteúdo de texto.

---
## 💡 Dicas de Manutenção Futura
1.  **Reiniciar o Servidor:** Sempre que alterar qualquer arquivo `.js` (como `server.js` ou `rotas_gerais.js`), vá no terminal e aperte `Ctrl + C` e depois `node server.js` novamente.
2.  **Cache do Navegador:** Se uma alteração visual não aparecer, aperte `Ctrl + Shift + R` (ou `Ctrl + F5`) no navegador para forçar o recarregamento da página.
# 📋 Documentação do Projeto - Reverse Marketing

Este documento resume a arquitetura, as funcionalidades e as correções realizadas no sistema de gestão da agência.

## 🏗️ 1. Estrutura do Projeto
*   **Backend:** Node.js com Express.
*   **Banco de Dados:** PostgreSQL (rodando em container Docker).
*   **Frontend:** HTML5, Tailwind CSS (via CDN), JavaScript (Vanilla).
*   **Autenticação:** JWT (JSON Web Tokens).
*   **Geração de PDFs:** Biblioteca `pdfkit`.

## 🚀 2. Funcionalidades Implementadas

### **Módulo Comercial**
*   **Kanban de Leads:** Quadro visual estilo Trello com arrastar e soltar (Drag and Drop).
*   **Conversão Automática:** Ao arrastar um Lead para a coluna "Fechado", o sistema cria o Cliente automaticamente no banco de dados.
*   **Exclusão de Leads:** Botão de lixeira visível em cada cartão para apagar o lead do banco.
*   **Propostas Comerciais:** Gerador de PDF profissional com logo, dados de contato, validade e condições de pagamento.
*   **Histórico de Propostas:** Salva as propostas no banco de dados e permite baixar o PDF novamente.
*   **Envio por WhatsApp:** Botão que abre o WhatsApp Web com uma mensagem pronta para o cliente.

### **Módulo de Operação e Clientes**
*   **Gestão de Clientes:** Cadastro, edição e exclusão.
*   **Brand Book:** Tela para salvar a identidade visual e essência da marca de cada cliente.
*   **Briefings:** O cliente preenche o briefing no Portal e o Admin visualiza em uma tela dedicada.
*   **Base de Conhecimento:** Área para criar e listar artigos de texto (sem upload de arquivos).

### **Portal do Cliente**
*   **Tela de Boas-Vindas:** Card de onboarding que explica as funcionalidades (Tarefas, Criativos, Resultados, Briefing).
*   **Aprovação de Criativos:** O cliente aprova ou solicita alterações nas peças, com envio de feedback.
*   **Gráficos de Resultados:** Gráficos (Chart.js) mostrando investimento, cliques e conversões.
*   **Download de Relatório:** Geração de PDF com os resultados do cliente.
*   **Alteração de Senha:** O cliente pode alterar a senha provisória.

### **Módulo Financeiro e Produtos**
*   **Produtos:** CRUD completo de produtos com controle de estoque.
*   **Financeiro:** Lançamento de receitas e despesas.
*   **Dashboard Admin:** Cards com faturamento do mês, criativos pendentes, tarefas e resumo financeiro por cliente.

## 🔧 3. Correções e Melhorias Realizadas
*   **Segurança:** Todas as rotas protegidas por Token JWT. Arquivos HTML com verificação de permissão.
*   **Erros de Conexão:** Correção de rotas duplicadas e tratamento de erros (try/catch) em todas as queries.
*   **Bug dos Milhões:** Correção no cálculo do resumo financeiro do Dashboard que duplicava valores.
*   **Kanban:** Correção do mapeamento de IDs e da lógica de arrastar e soltar.
*   **E-mail (Nodemailer):** Configuração para enviar e-mail de boas-vindas ao converter um Lead. (Requer configuração de "Senha de App" no Gmail).
*   **Cache:** Utilização de `Ctrl + Shift + R` para evitar carregamento de versões antigas dos arquivos.

## 💡 4. Dicas de Manutenção
1.  **Reiniciar o Servidor:** Sempre que alterar arquivos `.js`, pare o servidor (`Ctrl + C`) e rode `node server.js` novamente.
2.  **Backup:** Use o script `backup.ps1` (via PowerShell) para gerar um arquivo `.zip` com todo o código e o banco de dados.
3.  **Docker:** Certifique-se de que o container do banco (`projeto_novo-db-1`) está rodando antes de iniciar o servidor.
4.  **Senha de App:** Para o envio de e-mails funcionar, a senha no `mailer.js` deve ser uma "Senha de App" de 16 dígitos do Gmail (sem espaços).

## 📂 5. Arquivos Principais
*   `server.js`: Arquivo central que importa as rotas e inicia o servidor.
*   `db.js`: Conexão com o PostgreSQL.
*   `mailer.js`: Configuração do envio de e-mails.
*   `rotas_*.js`: Arquivos com as regras de negócio de cada módulo.
*   `public/`: Pasta onde ficam todos os arquivos HTML (Telas).
# 📘 Histórico Técnico do Projeto: Reverse Marketing

Este documento resume as decisões de arquitetura, correções críticas e funcionalidades implementadas no sistema até o momento.

## 🏗️ 1. Arquitetura e Stack
*   **Frontend:** HTML5, Tailwind CSS (via CDN), JavaScript puro (Vanilla JS), Chart.js (para gráficos).
*   **Backend:** Node.js, Express.js.
*   **Banco de Dados:** PostgreSQL rodando via **Docker** (Container: `projeto_novo-db-1`, Banco: `marketing_db`, Usuário: `admin`).
*   **Autenticação:** JWT (JSON Web Tokens).
*   **Geração de PDF:** Biblioteca `pdfkit`.

## 🗄️ 2. Banco de Dados e Correções Críticas (Docker)

O sistema sofreu com problemas de integridade referencial e colunas faltantes devido a atualizações no código. As seguintes correções foram aplicadas diretamente no container Docker:

### 2.1. Tabela `clientes`
*   **Problema:** Erro `value too long for type character varying(2)` e colunas faltantes.
*   **Solução:** Alteração da estrutura para aceitar textos maiores em `estado` (`VARCHAR(50)`), `tipo` (`VARCHAR(20)`) e `status`. Recriação completa da tabela para incluir `razao_social`, `cpf`, `cnpj`, `celular`, `endereco`, etc.

### 2.2. Tabela `mapeamentos_clientes`
*   **Problema:** Erros sequenciais `42703 (column does not exist)` ao salvar o formulário.
*   **Solução:** Adição de colunas de acessos (`acesso_meta`, `acesso_google_ads`, `acesso_google_analytics`, etc.) e colunas de contato/objetivos via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

### 2.3. Tabelas Operacionais (`campanhas`, `leads`, `outbound_marketing`, `inbound_marketing`)
*   **Problema:** Erro `relation "campanhas" does not exist` e `500 Internal Server Error`.
*   **Solução:** Recriação das tabelas com as chaves estrangeiras corretas. A rota `GET /api/campanhas` foi "blindada" no backend para retornar um array vazio (`[]`) caso a tabela falhe, evitando que o frontend trave.

### 2.4. Tabela `propostas`
*   **Problema:** Erro `22P02` (tentativa de inserir texto onde se esperava número inteiro).
*   **Solução:** Recriação da tabela com a coluna `servicos` do tipo `JSONB` e `validade` como `INTEGER`. O código passou a limpar o input do usuário e converter para número inteiro antes de salvar.

### 2.5. Tabela `comentarios` (Nova)
*   **Objetivo:** Armazenar o chat entre agência e cliente.
*   **Estrutura:** `id`, `tarefa_id` (FK), `criativo_id` (FK), `usuario_id`, `usuario_tipo` ('admin' ou 'cliente'), `mensagem`, `data_criacao`.

## 🛠️ 3. Funcionalidades Implementadas e Refatoradas

### 3.1. Dashboard Admin (`admin.html`)
*   **Gráficos Integrados:** Chart.js configurado para exibir Faturamento (linha), Distribuição de Leads (rosca) e Novos Clientes (barras) via rota `/api/dashboard/graficos`.
*   **Alerta de Tarefas Atrasadas:** Card vermelho dinâmico no topo do dashboard que consome a rota `/api/dashboard/tarefas-atrasadas` e lista as tarefas vencidas.
*   **Backup Manual:** Botão que aciona a rota `/api/backup`. O Node.js executa um comando `docker exec` internamente para gerar o dump do banco e envia o arquivo `.sql` via download para o navegador.

### 3.2. Módulo Financeiro (`financeiro.html`)
*   **Correção de Cálculos:** O erro de "concatenação de strings" (que gerava valores como R$ 12.000.000,00) foi resolvido forçando o `CAST(... AS DECIMAL)` no backend e usando `parseFloat` no frontend.
*   **Filtros:** O sistema agora inicia filtrado no mês atual para evitar somar históricos antigos por acidente.
*   **Validação:** Inserção de regra de negócio que bloqueia valores acima de R$ 10.000.000,00 ou negativos (tanto no backend quanto no frontend).

### 3.3. Módulo de Propostas (`propostas.html` / `rotas_propostas.js`)
*   **Geração de PDF:** O PDF é gerado usando `pdfkit` e enviado como um `blob` para download direto no navegador.
*   **Histórico:** O sistema salva a proposta no banco antes de gerar o PDF. A tela lista o histórico e permite baixar o PDF novamente.
*   **Integração WhatsApp:** Botão que formata o número do cliente e abre o WhatsApp Web com uma mensagem pré-definida, instruindo o usuário a anexar o PDF baixado.

### 3.4. Sistema de Chat (Comentários)
Implementado nas telas de **Tarefas**, **Criativos** e **Portal do Cliente**.
*   **Backend:** Rotas `GET /api/comentarios/:tipo/:id` e `POST /api/comentarios`.
*   **Frontend:** Modais de chat flutuantes com balões de mensagens distintos (Agência = alinhado à direita/cinza, Cliente = alinhado à esquerda/laranja). Suporte a envio pressionando "Enter".

## 🧹 4. Boas Práticas e Manutenção
*   **Conexão com o Banco:** O sistema depende intrinsecamente do container Docker `projeto_novo-db-1`. Comandos de backup e manutenção devem ser feitos preferencialmente via `docker exec` no terminal.
*   **Tratamento de Erros:** Muitas rotas do backend agora utilizam `try/catch` com logs detalhados (ex: `=== ERRO DETALHADO AO SALVAR ===`) para facilitar a identificação de colunas faltantes no PostgreSQL.
*   **Tratamento de Colunas Faltantes:** A técnica de usar `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` foi adotada para atualizar o banco sem perder dados.

## 📌 5. Próximos Passos / Pendências
1.  **Finalizar o Módulo de Propostas:** Garantir que o histórico (`GET /api/propostas`) esteja renderizando corretamente na tela após a correção do erro `22P02` (conversão para INTEGER).
2.  **Exportação CSV:** Adicionar o botão de exportar CSV nas telas de Clientes, Leads e Prospects.
3.  **Relatórios:** Criar uma tela ou funcionalidade dedicada para gerar relatórios mais complexos (além do CSV).

--- 
*Documento gerado em Novembro de 2026.*
# 📌 Histórico de Alterações e Correções - Reverse Marketing

## 📅 Sessão de Desenvolvimento: Novembro de 2026
Esta sessão foi focada na estabilização do banco de dados (após reset do Docker), correção de conflitos de portas/rotas, implementação de automações de e-mail e melhorias visuais (UX/UI).

---

### 1. 🛠️ Infraestrutura, Banco de Dados e Docker
*   **Conflito de Porta (EADDRINUSE):** O Docker Desktop estava ocupando a porta 3000. Solução: O servidor Node.js foi movido para a porta **3001** (alteração no `server.js`).
*   **Reset do Banco de Dados:** Após um `docker-compose down/up`, várias tabelas foram apagadas. Foram criados scripts de emergência (`restaurar_banco_completo.js`, `consertar_tabelas_faltantes.js`, `corrigir_mapeamento.js`) para recriar as tabelas (`prospects`, `campanhas`, `mapeamentos_clientes`, `propostas`, `conhecimento`, etc.) e adicionar colunas faltantes (ex: `cnpj`).
*   **Servidor Fantasma:** O erro "Erro interno ao aprovar criativo" era causado por um arquivo antigo (`rotas_criativos.js`) que estava sequestrando a rota. O arquivo foi limpo e a rota correta passou a ser gerenciada pelo `rotas_portal.js`.

### 2. 🔐 Autenticação e Portal do Cliente
*   **Criação do Login do Cliente:** Criado o arquivo `login-cliente.html` exclusivo para clientes. O login Admin (`login.html`) continuava bloqueando clientes.
*   **Correção no `rotas_perfil_cliente.js`:** A rota de login estava falhando ao comparar o hash da senha e buscar permissões. O código foi reescrito para ser à prova de falhas e retornar o Token JWT e as permissões corretamente.
*   **Proteção de Rota:** O `portal_cliente.html` agora verifica se existe um token no `localStorage`. Se não houver, redireciona o usuário para a tela de login imediatamente.

### 3. 📝 Módulo de Posts e Aprovações
*   **Upload de Arquivos:** Implementado no Calendário Editorial (`calendario_editorial.html`) usando `multer`. A agência agora pode anexar imagens ou PDFs ao criar um post.
*   **Visualização do Cliente:** O cliente consegue ver a imagem anexada ou clicar em um botão para abrir o PDF no Portal.
*   **Correção de Data (Invalid Date):** Corrigido o erro de formatação de data na tabela do Admin e no Portal do Cliente.
*   **Status e Feedback:** O Calendário Editorial agora exibe corretamente o status (Aprovado/Recusado) e o feedback exato digitado pelo cliente.

### 4. 💬 Sistema de Chat (Tarefas, Criativos e Posts)
*   **Banco de Dados:** A coluna `post_id` foi adicionada à tabela `comentarios`.
*   **Backend:** O arquivo `rotas_comentarios.js` foi refatorado para aceitar e filtrar mensagens por `tarefa_id`, `criativo_id` ou `post_id`.
*   **Frontend:** O botão de "Chat" foi adicionado nos cards de Posts do Portal do Cliente e na tabela do Calendário Editorial (Admin). O layout das mensagens diferencia a Agência (direita/cinza) do Cliente (esquerda/laranja).

### 5. 📧 Automação de E-mails (Nodemailer)
*   **Mailer Central:** Criado o arquivo `mailer.js` com duas funções:
    *   `enviarEmailBoasVindas`: Envia credenciais e link do portal para novos clientes.
    *   `enviarEmailAgencia`: Notifica a agência quando um cliente aprova/recusa tarefas, criativos ou posts.
*   **Gatilhos Automáticos:**
    *   Ao mover um Lead para "Convertido/Fechado" no Kanban, o cliente é criado e o e-mail de boas-vindas é disparado (`rotas_leads.js`).
    *   Ao aprovar/recusar no Portal, a agência recebe um e-mail com o feedback (`rotas_portal.js` e `rotas_posts.js`).
*   **Disparo Manual:** A tela `campanhas_mail.html` foi corrigida (o campo `conteudoHtml` foi alterado para `corpo`) e a rota `/api/enviar-email` foi criada no `rotas_gerais.js`.

### 6. 📄 Relatórios e Exportações
*   **PDF do Brand Book:** Criada a rota `/api/branding/pdf/:cliente_id` no backend usando `pdfkit` e o botão "Baixar PDF" na tela `lista_brandings.html`.
*   **Correção de Rotas Express:** A rota do PDF foi movida para cima da rota `/:id` no `rotas_gerais.js` para evitar conflito de interpretação de URL.

### 7. 📱 UX/UI e Melhorias Visuais
*   **Menu Mobile:** Criado script automático para injetar menu "hambúrguer" em todas as telas, adaptando a navegação para celulares e tablets.
*   **Quirks Mode:** Removidos os caracteres invisíveis (BOM) do início dos arquivos HTML que causavam problemas de renderização e avisos no console.
*   **Controle de Acesso (Campanhas):** O cliente Alessander agora consegue visualizar a tela de campanhas (bloqueio removido do frontend), mas o backend foi ajustado para mostrar apenas as campanhas vinculadas ao ID dele (segurança).

---

### ⚠️ Configurações Atuais de Ambiente
*   **Porta do Servidor:** 3001 (para evitar conflito com o Docker).
*   **Credenciais do Admin:** `admin@reverse.com` / `admin123`.
*   **Credenciais do Cliente Teste (Alessander):** `alessander.salgueirosa@gmail.com` / `123456`.

### 📌 Próximos Passos Sugeridos
1.  **Central de Configurações:** Criar a tela `configuracoes_email.html` para tirar a senha do Gmail do código fonte.
2.  **Exportação CSV:** Adicionar os botões de exportar planilha nas telas de Financeiro e Prospects.
3.  **Integração de Pagamentos:** Mercado Pago (Checkout Pro) e configuração de Webhooks (necessário domínio em produção).
4.  **Deploy em Produção:** Configuração do Nginx e certificado SSL (Certbot) no servidor Ubuntu.