function showSection(section) {
    document.getElementById('encrypt').classList.add('hidden');
    document.getElementById('decrypt').classList.add('hidden');
    document.getElementById(section).classList.remove('hidden');
}

function encryptMessage() {
    const text = document.getElementById('encryptText').value;
    const key = document.getElementById('encryptKey').value;

    if (!text) {
        alert('Por favor, escribe un mensaje para cifrar');
        return;
    }

    if (key.length < 8) {
        alert('La clave debe tener al menos 8 caracteres');
        return;
    }

    // Cifrar con crypto-js
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();

    // Crear archivo ZIP descargable
    const zip = new JSZip();
    zip.file('mensaje_cifrado.txt', encrypted);
    zip.generateAsync({ type: 'blob' }).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mensaje_cifrado.zip';
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

function decryptMessage() {
    const fileInput = document.getElementById('decryptFile');
    const key = document.getElementById('decryptKey').value;

    if (!fileInput.files[0]) {
        alert('Por favor, sube un archivo');
        return;
    }
    if (!key) {
        alert('Por favor, proporciona una clave');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        // Leer archivo ZIP
        JSZip.loadAsync(file).then(zip => {
            return zip.file('mensaje_cifrado.txt').async('text');
        }).then(encrypted => {
            try {
                // Descifrar con crypto-js
                const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
                if (!decrypted) {
                    alert('Clave incorrecta o archivo inválido');
                } else {
                    document.getElementById('decryptedText').value = decrypted;
                }
            } catch (e) {
                alert('Error al descifrar: Clave incorrecta o archivo inválido');
            }
        }).catch(() => {
            alert('Error al leer el archivo ZIP');
        });
    };
    reader.readAsArrayBuffer(file);
}