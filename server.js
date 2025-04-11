const express = require('express');
const crypto = require('crypto');
const archiver = require('archiver');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

// Función para cifrar
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, ' ')), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encrypted };
}

// Función para descifrar
function decrypt(encrypted, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, ' ')), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Ruta para cifrar
app.post('/encrypt', (req, res) => {
    const { text, key } = req.body;

    if (!text || !key || key.length < 8) {
        return res.status(400).json({ error: 'Texto y clave válidos son requeridos' });
    }

    const { iv, encrypted } = encrypt(text, key);
    const data = JSON.stringify({ iv, encrypted });

    const archive = archiver('zip');
    res.setHeader('Content-Disposition', 'attachment; filename=mensaje_cifrado.zip');
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    archive.append(data, { name: 'mensaje_cifrado.txt' });
    archive.finalize();
});

// Ruta para descifrar
app.post('/decrypt', upload.single('file'), (req, res) => {
    const key = req.body.key;

    if (!req.file || !key) {
        return res.status(400).json({ error: 'Archivo y clave son requeridos' });
    }

    fs.readFile(req.file.path, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error al leer el archivo' });

        try {
            const { iv, encrypted } = JSON.parse(data);
            const decrypted = decrypt(encrypted, key, iv);
            res.json({ text: decrypted });
        } catch (e) {
            res.status(400).json({ error: 'Clave incorrecta o archivo inválido' });
        } finally {
            fs.unlinkSync(req.file.path); // Eliminar archivo temporal
        }
    });
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));