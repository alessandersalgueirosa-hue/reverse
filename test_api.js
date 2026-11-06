const http = require('http');

const data = JSON.stringify({
    nome_empresa: 'Teste',
    cnpj: '00.000.000/0000-00',
    segmento: 'Teste',
    site: 'www.teste.com',
    telefone: '(00)00000-0000',
    nome_contato: 'Teste',
    objetivo_principal: 'Teste',
    meta_business: true,
    google_ads: true,
    google_analytics: true,
    site_hospedagem: true,
    manual_marca: true,
    observacoes_acessos: 'Teste',
    observacoes_gerais: 'Teste'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/mapeamento',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(data);
req.end();