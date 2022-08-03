const Paseto = require('paseto.js');
const {pasetoKey, pasetoIssuerPayload} = require('../config');

module.exports = async function () {
  const raw = Buffer.from(pasetoKey, 'base64');
  const sk = new Paseto.SymmetricKey(new Paseto.V2());
  await sk.inject(raw);

  const encoder = sk.protocol();
  return await encoder.encrypt(pasetoIssuerPayload, sk);
};
