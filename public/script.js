function showSection(section) {
    document.getElementById('encrypt').classList.add('hidden');
    document.getElementById('decrypt').classList.add('hidden');
    document.getElementById(section).classList.remove('hidden');
}

async function encryptMessage() {
    const text = document.getElementById('encryptText').value;
    const key = document.getElementById('encryptKey').value;

    if (key.length < 8) {
        alert('La clave debe tener al menos 8 caracteres');
        return;
    }

    const response = await fetch('/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, key })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mensaje_cifrado.zip';
        a.click();
    } else {
        alert('Error al cifrar el mensaje');
    }
}

async function decryptMessage() {
    const fileInput = document.getElementById('decryptFile');
    const key = document.getElementById('decryptKey').value;

    if (!fileInput.files[0] || !key) {
        alert('Por favor, sube un archivo y proporciona una clave');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('key', key);

    const response = await fetch('/decrypt', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (response.ok) {
        document.getElementById('decryptedText').value = result.text;
    } else {
        alert('Error al descifrar: ' + result.error);
    }
}