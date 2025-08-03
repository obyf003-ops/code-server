<script>
async function sendEncryptedCode(plainText) {
  // 1. Fetch the public key from the server
  const res = await fetch('https://code-server-zt6v.onrender.com/public-key');
  const pemKey = await res.text();

  // 2. Convert PEM key to CryptoKey object
  const binaryDer = str2ab(pemToBase64(pemKey));
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  );

  // 3. Encrypt the message
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    new TextEncoder().encode(plainText)
  );

  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

  // 4. Send encrypted data to your server
  await fetch('https://code-server-zt6v.onrender.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { code: encryptedBase64 } })
  });

  alert("Encrypted data sent!");
}

// Helper: Convert PEM to base64 DER string
function pemToBase64(pem) {
  return pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');
}

// Helper: Base64 to ArrayBuffer
function str2ab(base64) {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// 👉 Example usage
sendEncryptedCode("hello from browser");
</script>
