const fs = require('fs-extra');
const generator = require('generate-password');

module.exports = function () {
  const dir = './private/data/';
  const file = dir + 'private.key';

  if (!fs.existsSync(file)) {
    const password = generator.generate({
      length: 50,
      numbers: true,
      symbols: true
    });

    fs.ensureDirSync(dir);
    fs.writeFileSync(file, password);
  }

  return fs.readFileSync(file).toString('utf8');
};
