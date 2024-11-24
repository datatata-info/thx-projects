import { Injectable } from '@angular/core';
// forge
import * as forge from 'node-forge';
// rxjs
import { Subject } from 'rxjs';

interface LocalStorageCert {
  created: number,
  expiresAfter: number,
  publicPem: string,
  privatePem: string
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private keyPair!: forge.pki.rsa.KeyPair;
  sharedSecret!: string;

  constructor() {
    this.sharedSecret = this.generateSharedSecret();
  }

  setKeyPair(): Subject<boolean> {
    const subject: Subject<boolean> = new Subject();
    const savedCert = localStorage.getItem('thx-cert');
    if (savedCert) {
      const cert: LocalStorageCert = JSON.parse(savedCert);
      const now = Date.now();
      if (now >= cert.created + cert.expiresAfter) { // cert expired, generate new
        return this.generateKeyPair();
      } else {
        this.keyPair = {
          publicKey: forge.pki.publicKeyFromPem(cert.publicPem),
          privateKey: forge.pki.privateKeyFromPem(cert.privatePem)
        }
        setTimeout(() => {
          subject.next(true);
          // subject.complete();
          // this.onCertGenerated.complete();
        }, 200);

      }

    } else { // generate new and save to localStorage
      return this.generateKeyPair();
    }
    return subject;
  }

  private generateKeyPair(): Subject<boolean> {
    const subject: Subject<boolean> = new Subject();
    forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 }, (error: any, keyPair: forge.pki.rsa.KeyPair) => {
      if (error) console.error(error);
      // console.log('keyPair generated');
      this.keyPair = keyPair;
      const localStorageCert: LocalStorageCert = {
        created: Date.now(),
        expiresAfter: 24 * 60 * 60 * 1000, // one day
        publicPem: forge.pki.publicKeyToPem(this.keyPair.publicKey),
        privatePem: forge.pki.privateKeyToPem(this.keyPair.privateKey)
      }
      subject.next(true);
      // subject.complete();
      // this.onCertGenerated.complete();
      localStorage.setItem('thx-cert', JSON.stringify(localStorageCert));
    });
    return subject;
  }

  // Get the public key in PEM format
  getPublicKeyPem(): string {
    return forge.pki.publicKeyToPem(this.keyPair.privateKey as unknown as forge.pki.rsa.PublicKey);
  }

  // Get public key from PEM format
  getPublicKeyFromPem(pem: string): forge.pki.rsa.PublicKey {
    return forge.pki.publicKeyFromPem(pem);
  }

  // Encrypt the AES key with a given public RSA key
  encryptSharedSecretWithCustomKey(aesKey: string, publicKeyPem: string): string {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    return forge.util.encode64(publicKey.encrypt(aesKey));
  }

  // Decrypt the AES key using the private RSA key
  decryptSharedSecret(encryptedSharedSecret: string): string {
    const encryptedBytes = forge.util.decode64(encryptedSharedSecret);
    return this.keyPair.privateKey.decrypt(encryptedBytes);
  }

  // Encrypt a message using the AES key
  encryptMessageWithAESKey(message: string, aesKey: string): string {
    const cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(aesKey));
    const iv = forge.random.getBytesSync(16); // Generate random IV
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();
    return forge.util.bytesToHex(iv + cipher.output.getBytes());
  }

  // Decrypt a message using the AES key
  decryptMessageWithAESKey(encryptedMessage: string, aesKey: string): string {
    const encryptedBytes = forge.util.hexToBytes(encryptedMessage);
    const iv = encryptedBytes.substring(0, 16);
    const encryptedData = encryptedBytes.substring(16);

    const decipher = forge.cipher.createDecipher('AES-CBC', forge.util.createBuffer(aesKey));
    decipher.start({ iv: forge.util.createBuffer(iv) });
    decipher.update(forge.util.createBuffer(encryptedData));
    const result = decipher.finish();
    if (result) {
      return decipher.output.toString();
    } else {
      throw new Error('Decryption failed');
    }
  }

  // Generate a random AES key
  generateSharedSecret(): string {
    return forge.random.getBytesSync(32); // 256-bit AES key
  }


}
