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

async function enviarEmailBoasVindas(dadosCliente) {
    try {
        if (!transporter) throw new Error("Transportador de e-mail não configurado.");
        const { nome, email } = dadosCliente;
        const senhaProvisoria = '123456';
        const linkPortal = 'http://localhost:3000/portal_cliente.html';

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
        await transporter.sendMail({
            from: '"Sistema Reverse Marketing" <reverse.mkt.dgt@gmail.com>',
            to: 'reverse.mkt.dgt@gmail.com',
            subject: assunto,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
                    <h2 style="color: #f97316;">🔔 Notificação do Sistema</h2>
                    ${mensagemHtml}
                </div>
            `
        });
        console.log("✅ E-mail de notificação enviado para a agência.");
        return true;
    } catch (error) {
        console.error("❌ Erro ao enviar e-mail para a agência:", error.message);
        return false;
    }
}

module.exports = { enviarEmailBoasVindas, enviarEmailAgencia };