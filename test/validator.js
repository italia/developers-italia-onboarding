const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const { expect } = Code;
const lab = exports.lab = Lab.script();

const validator = require('../src/validator');

lab.test('valid URLs', () => {
    expect(validator.isValidCodeHostingUrl('https://example.com/')).to.equal(true);
    expect(validator.isValidCodeHostingUrl('https://example.com/path')).to.equal(true);
    expect(validator.isValidCodeHostingUrl('https://example.com:443/')).to.equal(true);
    expect(validator.isValidCodeHostingUrl('https://github.com/foobar')).to.equal(true);
    expect(validator.isValidCodeHostingUrl('https://github.com/foobar/')).to.equal(true);
});

lab.test('non-HTTPs URLs', () => {
    expect(validator.isValidCodeHostingUrl('http://example.com/')).to.equal(false);
    expect(validator.isValidCodeHostingUrl('http://subdomain.example.com/')).to.equal(false);
});

lab.test('other protocols in URL', () => {
    expect(validator.isValidCodeHostingUrl('ftp://example.com/')).to.equal(false);
    expect(validator.isValidCodeHostingUrl('foobar://example.com/')).to.equal(false);
});

lab.test('spaces in URL', () => {
    expect(validator.isValidCodeHostingUrl('https://example.com/spaces in url')).to.equal(true);
    expect(validator.isValidCodeHostingUrl('https://example.com/are%20ugly')).to.equal(true);
});

lab.test('invalid code hosting URLs', () => {
    // Code hosting home pages
    expect(validator.isValidCodeHostingUrl('https://github.com/')).to.equal(false);
    expect(validator.isValidCodeHostingUrl('https://gitlab.com/')).to.equal(false);
    expect(validator.isValidCodeHostingUrl('https://bitbucket.org/')).to.equal(false);

    // Single repos
    expect(validator.isValidCodeHostingUrl('https://github.com/foobar/baz')).to.equal(false);
    expect(validator.isValidCodeHostingUrl('https://gitlab.com/foobar/baz')).to.equal(false);
    expect(validator.isValidCodeHostingUrl('https://bitbucket.org/foobar/baz/')).to.equal(false);
});

lab.test('PEC and iPa code coherency', async () => {
    expect(await validator.ipaMatchesPec('pcm', 'teamdigitale@pec.governo.it')).to.equal(true);
    expect(await validator.ipaMatchesPec('pcm', 'protocollo_dfp@mailbox.governo.it')).to.equal(true);
    expect(await validator.ipaMatchesPec('art', 'pec@pec.autorita-trasporti.it')).to.equal(true);

    expect(await validator.ipaMatchesPec('pcm', 'leg@postacert.sanita.it')).to.equal(false);
    expect(await validator.ipaMatchesPec('pcm', 'no-such-address@example.com')).to.equal(false);
});

lab.test('invalid PEC addresses and iPa codes', async () => {
    expect(await validator.ipaMatchesPec('pcm', '{}invalid PEC address{}')).to.equal(false);
    expect(await validator.ipaMatchesPec('@@@invalid ipa@@@', 'teamdigitale@pec.governo.it')).to.equal(false);
});

lab.test('Phone numbers', () => {
    expect(validator.isValidPhoneNumber('+123456789012345')).to.equal(true);
    expect(validator.isValidPhoneNumber('123456789012345')).to.equal(true);
    expect(validator.isValidPhoneNumber('+12345678')).to.equal(true);
    expect(validator.isValidPhoneNumber('12345678')).to.equal(true);

    expect(validator.isValidPhoneNumber('')).to.equal(false);
    expect(validator.isValidPhoneNumber('string')).to.equal(false);
    expect(validator.isValidPhoneNumber('+12345678A')).to.equal(false);
    expect(validator.isValidPhoneNumber('1234567')).to.equal(false);
});
