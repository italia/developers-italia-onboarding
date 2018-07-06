const fs = require('fs-extra');
const generator = require('generate-password');

module.exports = function () {
  const path = './private/data/private.key';

  if (!fs.existsSync(path)) {
    const password = generator.generate({
      length: 50,
      numbers: true,
      symbols: true
    });

    fs.writeFileSync(path, password);
  }

  return fs.readFileSync(path).toString('utf8');
};
