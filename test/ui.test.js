const fs = require('fs');
const { expect } = require('chai');
const { JSDOM } = require('jsdom');

describe('SidebarPrepSheets.html UI', function() {
  let dom;
  let document;

  before(function() {
    const html = fs.readFileSync('SidebarPrepSheets.html', 'utf8');
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it('should have a groupemail input with a datalist', function() {
    const input = document.getElementById('groupemail');
    expect(input).to.exist;
    expect(input.getAttribute('list')).to.equal('groups-list');
    
    const datalist = document.getElementById('groups-list');
    expect(datalist).to.exist;
    expect(datalist.tagName).to.equal('DATALIST');
  });

  it('should have a validation indicator next to groupemail', function() {
    const indicator = document.getElementById('group-validation-icon');
    expect(indicator).to.exist;
  });
});
