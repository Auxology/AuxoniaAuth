// Those are functions related to encrypting and decrypting data
// Only use it when you are working with main database.
// For temporary database it is not necessary to encrypt data, as it is not sensitive and also gets deleted after 1 hour.

import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPT_KEY!;
const iv = process.env.ENCRYPT_IV!;

const keyBuffer = Buffer.from(key, 'hex');
const ivBuffer = Buffer.from(iv, 'hex');

export const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
};

export const decrypt = (text: string) => {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// I do not recommend encrypting data that does not need to be encrypted. Examples are username, createdAt, updatedAt, etc.
// You encrypt only and i mean only email, first name, last name, phone number and stuff that can actually be used maliciously.
// if you encrypt everything, you will have to decrypt everything to do a simple query. This will slow down your application.
// Be mindful of when and why you decrypt data. You should decrypt data only when you need to display it to the user.
// You should never decrypt data and send it to the client side. Always decrypt data on the server side and then send it to the client side.
// You do not encrypt password!!! Password should be hashed and salted, not encrypted(Use Argon2Id or Scrypt)