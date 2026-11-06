const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');
const arquivos = fs.readdirSync(pastaPublic).filter(f => f.endsWith('.html'));

const cssMobile = `
    <style id="mobile-menu-style">
        @media (max-width: 768px) {
            header nav { 
                display: none !important; 
                flex-direction: column !important;
                width: 100% !important;
                padding-top: 15px;
            }
            header nav.active { 
                display: flex !important; 
            }
            header .mobile-btn {
                display: block !important;
            }
            /* Ajusta os dropdowns para abrirem no clique no mobile */
            header .relative.group > div {
                position: static !important;
                display: none !important;
                opacity: 1 !important;
                visibility: visible !important;
                box-shadow: none !important;
                background: #1e293b !important;
                margin-top: 5px !important;
                padding: 10px !important;
                border-radius: 8px !important;
            }
            header .relative.group.open > div {
                display: flex !important;
            }
            .relative.group > button {
                width: 100% !important;
                display: flex !important;
                justify-content: space-between !important;
            }
        }
        @media (min-width: 769px) {
            header .mobile-btn { display: none !important; }
        }
    </style>
`;

const jsMobile = `
    <script id="mobile-menu-script">
        document.addEventListener('DOMContentLoaded', () => {
            const headers = document.querySelectorAll('header');
            headers.forEach(header => {
                const nav = header.querySelector('nav');
                if(!nav) return;

                // Cria o botão hamburger
                const btn = document.createElement('button');
                btn.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
                btn.className = 'mobile-btn text-white ml-auto p-2';
                btn.onclick = (e) => {
                    e.preventDefault();
                    nav.classList.toggle('active');
                };

                // Insere o botão no cabeçalho
                nav.parentNode.appendChild(btn);

                // Configura os botões dos dropdowns para funcionar no toque
                const dropdownBtns = nav.querySelectorAll('.relative.group > button');
                dropdownBtns.forEach(dBtn => {
                    dBtn.onclick = (e) => {
                        e.preventDefault();
                        const parent = dBtn.parentElement;
                        parent.classList.toggle('open');
                    };
                });
            });
        });
    </script>
`;

console.log('📱 Injetando botão de menu mobile nos arquivos...\n');

arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);
    let conteudo = fs.readFileSync(caminho, 'utf-8');
    
    if (!conteudo.includes('id="mobile-menu-style"')) {
        conteudo = conteudo.replace('</head>', cssMobile + '\n</head>');
    }
    if (!conteudo.includes('id="mobile-menu-script"')) {
        conteudo = conteudo.replace('</body>', jsMobile + '\n</body>');
    }
    
    fs.writeFileSync(caminho, conteudo, 'utf-8');
    console.log(`✅ Menu mobile adicionado em: ${arquivo}`);
});

console.log('\n🎉 Todos os menus foram atualizados para celular!');