const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const { expect } = Code;
const lab = exports.lab = Lab.script();

const { url } = require('../src/validator');
const { VALIDATION_OK, VALIDATION_INVALID_URL } = require('../src/validator-result');

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
