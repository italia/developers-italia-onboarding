const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const { expect } = Code;
const lab = exports.lab = Lab.script();

const { url, ipaMatchesPec } = require('../src/validator');
const {
  VALIDATION_OK,
  VALIDATION_INVALID_URL,
  VALIDATION_INCONSISTENT_DATA,
  VALIDATION_TEMPORARY_ERROR,
} = require('../src/validator-result');

lab.test('valid URLs', () => {
    expect(url('https://example.com/')).to.equal(VALIDATION_OK);
    expect(url('https://example.com/path')).to.equal(VALIDATION_OK);
    expect(url('https://example.com:443/')).to.equal(VALIDATION_OK);
    expect(url('http://subdomain.example.com/')).to.equal(VALIDATION_OK);
    expect(url('http://subdomain.example.com/')).to.equal(VALIDATION_OK);
});

lab.test('non-HTTP URLs', () => {
    expect(url('ftp://example.com/')).to.equal(VALIDATION_INVALID_URL);
    expect(url('foobar://example.com/')).to.equal(VALIDATION_INVALID_URL);
});

lab.test('spaces in URL', () => {
    expect(url('https://example.com/spaces in url')).to.equal(VALIDATION_OK);
    expect(url('https://example.com/are%20ugly')).to.equal(VALIDATION_OK);
});

lab.test('PEC and iPa code coherency', async () => {
    expect(await ipaMatchesPec('pcm', 'teamdigitale@pec.governo.it')).to.equal(VALIDATION_OK);
    expect(await ipaMatchesPec('pcm', 'protocollo_dfp@mailbox.governo.it')).to.equal(VALIDATION_OK);
    expect(await ipaMatchesPec('art', 'pec@pec.autorita-trasporti.it')).to.equal(VALIDATION_OK);

    expect(await ipaMatchesPec('pcm', 'leg@postacert.sanita.it')).to.equal(VALIDATION_INCONSISTENT_DATA);
    expect(await ipaMatchesPec('pcm', 'no-such-address@example.com')).to.equal(VALIDATION_INCONSISTENT_DATA);
});

lab.test('invalid PEC addresses and iPa codes', async () => {
    expect(await ipaMatchesPec('pcm', '{}invalid PEC address{}')).to.equal(VALIDATION_INCONSISTENT_DATA);
    expect(await ipaMatchesPec('@@@invalid ipa@@@', 'teamdigitale@pec.governo.it')).to.equal(VALIDATION_INCONSISTENT_DATA);
});
