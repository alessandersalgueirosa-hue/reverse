const nodemailer = require('nodemailer');

let transporter;
try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'reverse.mkt.dgt@gmail.com',
            pass: 'mzqk pttc kprn vozg'
        }
    });
    console.log("✅ Transportador do Nodemailer configurado.");
} catch (e) {
    console.error("❌ Erro na configuração do Nodemailer:", e.message);
}

// ⬅️ NOVO: usa env BASE_URL se existir, senão fallback para 3001
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// ⬅️ NOVO: converte quebras de linha em <br> para HTML (resolve o problema #1)
function textoParaHtml(texto) {
    if (!texto) return '';
    return String(texto)
        .replace(/&/g, '&amp;')       // escapa & primeiro
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

async function enviarEmailBoasVindas(dadosCliente) {
    try {
        if (!transporter) throw new Error("Transportador de e-mail não configurado.");
        const { nome, email } = dadosCliente;
        const senhaProvisoria = '123456';
        const linkPortal = `${BASE_URL}/portal_cliente.html`;  // ⬅️ NOVO: usa BASE_URL

        await transporter.sendMail({
            from: '"Reverse Marketing" <reverse.mkt.dgt@gmail.com>',
            to: email,
            subject: '🎉 Bem-vindo(a) à Reverse Marketing! Seu acesso está pronto.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #fff; padding: 40px; border-radius: 10px;">
                    <h2 style="color: #fff;">Olá, ${nome}! 🚀</h2>
                    <p style="color: #cbd5e1;">Bem-vindo(a) à Reverse Marketing!</p>
                    <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 30px 0;">
                        <h3 style="color: #f97316;">🔐 Seus Dados de Acesso</h3>
                        <p><strong>Link:</strong> <a href="${linkPortal}" style="color: #38bdf8;">${linkPortal}</a></p>
                        <p><strong>E-mail:</strong> ${email}</p>
                        <p><strong>Senha Provisória:</strong> ${senhaProvisoria}</p>
                    </div>
                </div>
            `
        });
        console.log("✅ E-mail de boas-vindas enviado para:", email);
        return true;
    } catch (error) {
        console.error("❌ Erro ao enviar e-mail de boas-vindas:", error.message);
        return false;
    }
}

async function enviarEmailAgencia(assunto, mensagemHtml) {
    try {
        if (!transporter) throw new Error("Transportador de e-mail não configurado.");

        // ⬅️ NOVO: detecta se já é HTML (contém tags) ou texto puro.
        // Se for texto puro, escapa e converte \n em <br>.
        const ehHtml = /<[a-z][\s\S]*>/i.test(mensagemHtml);
        const corpoFinal = ehHtml ? mensagemHtml : textoParaHtml(mensagemHtml);

        await transporter.sendMail({
            from: '"Sistema Reverse Marketing" <reverse.mkt.dgt@gmail.com>',
            to: 'reverse.mkt.dgt@gmail.com',
            subject: assunto,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: #f8fafc; border-radius: 10px;">
                    <h2 style="color: #f97316; margin-top: 0;">🔔 Notificação do Sistema</h2>
                    <div style="background: #ffffff; padding: 20px; border-radius: 8px; color: #1e293b; line-height: 1.6; font-size: 14px;">
                        ${corpoFinal}
                    </div>
                    <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 20px;">
                        Reverse Marketing · E-mail automático · Não responda
                    </p>
                </div>
            `
        });
        console.log("✅ E-mail de notificação enviado para a agência. Assunto:", assunto);
        return true;
    } catch (error) {
        console.error("❌ Erro ao enviar e-mail para a agência:", error.message);
        return false;
    }
}

module.exports = { enviarEmailBoasVindas, enviarEmailAgencia };