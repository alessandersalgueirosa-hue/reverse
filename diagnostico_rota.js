async function testar() {
    console.log("⏳ Testando a rota de aprovação no servidor...");
    try {
        // 1. Faz login para pegar o token
        const login = await fetch('http://localhost:3001/api/login-cliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alessander.salgueirosa@gmail.com', senha: '123456' })
        });
        const dadosLogin = await login.json();
        
        if (!dadosLogin.token) {
            console.log("❌ Falha no login:", dadosLogin);
            return;
        }
        console.log("✅ Login OK. Token recebido.");

        // 2. Tenta aprovar o criativo ID 1
        console.log("\n⏳ Tentando aprovar o criativo ID 1...");
        const res = await fetch('http://localhost:3001/api/portal/criativos/1/aprovar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${dadosLogin.token}` 
            },
            body: JSON.stringify({ feedback_cliente: 'Teste via script' })
        });

        const data = await res.json();
        
        console.log("\n📥 RESPOSTA DO SERVIDOR:");
        console.log("Status:", res.status);
        console.log("Mensagem:", data);

        if (data.error && data.error.includes('ERRO NO BANCO')) {
            console.log("\n🎯 O SERVIDOR ESTÁ COM O CÓDIGO NOVO! O erro está no banco de dados.");
        } else if (data.error && data.error.includes('Erro interno')) {
            console.log("\n⚠️ O SERVIDOR AINDA ESTÁ COM O CÓDIGO ANTIGO. O arquivo rotas_portal.js não foi salvo corretamente.");
        }

    } catch (e) {
        console.log("❌ ERRO DE CONEXÃO:", e.message);
    }
}
testar();