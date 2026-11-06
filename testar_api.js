async function testarAPI() {
    console.log("⏳ Enviando requisição para o servidor...");
    try {
        const res = await fetch('http://localhost:3000/api/login-cliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alessander.salgueirosa@gmail.com', senha: '123456' })
        });
        
        console.log("Status HTTP retornado:", res.status);
        
        const data = await res.json().catch(() => ({}));
        console.log("Resposta do Servidor:", data);
        
    } catch (e) {
        console.error("❌ ERRO DE CONEXÃO: O servidor está rodando na porta 3000?");
    }
}
testarAPI();