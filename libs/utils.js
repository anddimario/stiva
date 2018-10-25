'use strict';
const crypto = require('crypto');
const { promisify } = require('util');

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

// Return a password hash and salt
async function createPassword(password) {
  // create a password
  const len = 128;
  const iterations = 4096;
  let salt = await randomBytes(len);
  salt = salt.toString('base64');

  const derivedKey = await pbkdf2(password, salt, iterations, len, 'sha512');
  const hash = derivedKey.toString('base64');

  return { hash, salt };
}

// Compare password's hashes
async function comparePassword(info) {
  // Bytesize
  const len = 128;
  const iterations = 4096;
  const hash = await pbkdf2(info.requested, info.salt, iterations, len, 'sha512');
  // Check the hash with the password
  if (hash.toString('base64') === info.stored) {
    return true;
  }
  return false;
}

// Generate a random hash token
async function generateToken() {
  const salt = await randomBytes(20);
  const token = salt.toString('hex');
  return token;
}

module.exports = {
  comparePassword,
  createPassword,
  generateToken
};