const fs = require('fs');
const { expect } = require('chai');

describe('Code Security', function() {
  it('should log error messages, not full error objects', function() {
    const content = fs.readFileSync('spogou.gs', 'utf8');
    // We look for 'logsheet.appendRow([... err])' pattern
    // This regex is a bit loose but catches the specific usages in this file
    expect(content).to.not.match(/logsheet\.appendRow\(\[.*, err\]\)/, 'Potential leak of full error object in logs');
  });
});
