import base64
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

IV_BASE64 = "R4XTLoyH59XiYS6Fc+CBnA=="
CIPHERTEXT_BASE64 = "drWU5krnWuocat9/GNbnuCe/F4n9O83co/vfBe0XbLc="

def derive_key(key_a: str, key_b: str) -> bytes:
    """
    Concatenates Key A and Key B and hashes with SHA-256 to form a 32-byte key.
    """
    combined = (key_a + key_b).encode("utf-8")
    return hashlib.sha256(combined).digest()

def decrypt_payload(key_a: str, key_b: str) -> str:
    """
    Decrypts the pre-encrypted payload using derived key from key_a and key_b.
    Returns the decrypted string if successful, or raises an exception.
    """
    key_hash = derive_key(key_a, key_b)
    iv = base64.b64decode(IV_BASE64)
    ciphertext = base64.b64decode(CIPHERTEXT_BASE64)
    
    cipher = Cipher(algorithms.AES(key_hash), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    
    decrypted_padded = decryptor.update(ciphertext) + decryptor.finalize()
    
    # Strip PKCS7 padding
    pad_len = decrypted_padded[-1]
    if pad_len < 1 or pad_len > 16:
        raise ValueError("Invalid padding length.")
    
    # Verify all padding bytes are equal to pad_len
    for i in range(len(decrypted_padded) - pad_len, len(decrypted_padded)):
        if decrypted_padded[i] != pad_len:
            raise ValueError("Invalid padding bytes.")
            
    decrypted = decrypted_padded[:-pad_len].decode("utf-8")
    return decrypted
