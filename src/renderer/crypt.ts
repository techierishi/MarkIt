const CryptoJS = require("crypto-js");

export function enc(text: string, secret: string): string {
  const ciphertext = CryptoJS.AES.encrypt(text, secret).toString();
  return ciphertext;
}

export function dec(ciphertext: string, secret: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}
