// ==========================================
// MENU PADRONIZADO (ADMIN E CLIENTE)
// ==========================================
(function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    let payload = {};
    try { payload = JSON.parse(atob(token.split('.')[1])); } catch(e) {}

    const isCliente = payload.tipo === 'cliente';
    const permissoes = JSON.parse(localStorage.getItem('permissoes') || '{}');

    // Pega o elemento do menu Admin e do Cliente
    const menuAdmin = document.getElementById('menu-admin');
    const menuCliente = document.getElementById('menu-cliente');

    if (isCliente) {
        if (menuAdmin) menuAdmin.style.display = 'none';
        if (menuCliente) {
            menuCliente.classList.remove('hidden');
            
            // Monta os links do menu Cliente
            const nav = document.getElementById('nav-cliente');
            const btnSair = nav.querySelector('.btn-sair');
            
            const links = [];
            if (permissoes.pode_ver_calendario) links.push({ href: '/calendario_editorial.html', texto: 'Calendário' });
            if (permissoes.pode_ver_financeiro) links.push({ href: '/financeiro.html', texto: 'Financeiro' });
            if (permissoes.pode_ver_metricas) links.push({ href: '/metricas.html', texto: 'Resultados' });
            if (permissoes.pode_ver_branding) links.push({ href: '/lista_brandings.html', texto: 'Minha Marca' });
            if (permissoes.pode_ver_campanhas) links.push({ href: '/campanhas.html', texto: 'Campanhas' });
            if (permissoes.pode_ver_propostas) links.push({ href: '/propostas.html', texto: 'Propostas' });
            if (permissoes.pode_ver_tarefas) links.push({ href: '/tarefas.html', texto: 'Minhas Tarefas' });

            links.forEach(l => {
                const a = document.createElement('a');
                a.href = l.href;
                a.className = 'px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors';
                a.innerText = l.texto;
                nav.insertBefore(a, btnSair);
            });
        }
    } else {
        if (menuCliente) menuCliente.style.display = 'none';
        if (menuAdmin) menuAdmin.classList.remove('hidden');
    }

    // Configura todos os botões de sair
    document.querySelectorAll('.btn-sair').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('permissoes');
            window.location.href = '/login.html';
        });
    });
})();