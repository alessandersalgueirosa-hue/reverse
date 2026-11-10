const rateLimit = require('express-rate-limit');

const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,        // 15 minutos
    max: 10,                          // Máximo de 10 tentativas por IP
    standardHeaders: true,            
    legacyHeaders: false,             
    // O SEGREDO ESTÁ AQUI: Trocamos "error" por "error" (padrão do seu front) e "erro" (fallback)
    message: {
        error: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
        erro: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.'
    },
    skipSuccessfulRequests: true, 
    handler: (req, res, next, options) => {
        console.warn(`🚨 [RATE LIMIT] Login bloqueado | IP: ${req.ip} | Rota: ${req.path} | UA: ${(req.get('user-agent') || '').substring(0, 60)}`);
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = { limitadorLogin };