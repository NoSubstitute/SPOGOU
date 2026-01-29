const fs = require('fs');
const { expect } = require('chai');

describe('Manifest Security', function() {
  it('should not contain excessive OAuth scopes', function() {
    const manifest = JSON.parse(fs.readFileSync('appsscript.json', 'utf8'));
    const scopes = manifest.oauthScopes || [];
    const forbiddenScope = 'https://www.googleapis.com/auth/userinfo.profile';
    expect(scopes).to.not.include(forbiddenScope, 'Excessive scope found: ' + forbiddenScope);
  });
});
