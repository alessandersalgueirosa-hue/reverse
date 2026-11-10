// cripto.js
// Funções de criptografia AES-256-GCM para senhas sensíveis.
// Usa MASTER_KEY do .env (nunca versionar).
const crypto = require('crypto');

const ALGORITMO = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM padrão
const TAG_LENGTH = 16;

function getMasterKey() {
    const masterKey = process.env.MASTER_KEY;
    if (!masterKey) {
        throw new Error('MASTER_KEY não definida no arquivo .env');
    }
    const buf = Buffer.from(masterKey, 'hex');
    if (buf.length !== 32) {
        throw new Error('MASTER_KEY inválida: precisa ter 64 caracteres hexadecimais (32 bytes)');
    }
    return buf;
}

function criptografar(textoPuro) {
    if (textoPuro === null || textoPuro === undefined || textoPuro === '') return null;
    const key = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITMO, key, iv);
    const encrypted = Buffer.concat([cipher.update(String(textoPuro), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Formato armazenado: iv(hex):tag(hex):encrypted(hex)
    return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

function descriptografar(payload) {
    if (!payload) return null;
    const partes = String(payload).split(':');
    if (partes.length !== 3) {
        throw new Error('Formato de dado criptografado inválido');
    }
    const key = getMasterKey();
    const iv = Buffer.from(partes[0], 'hex');
    const tag = Buffer.from(partes[1], 'hex');
    const encrypted = Buffer.from(partes[2], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITMO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}

module.exports = { criptografar, descriptografar };