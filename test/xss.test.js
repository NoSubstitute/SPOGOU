const fs = require('fs');
const { expect } = require('chai');
const glob = require('glob');

describe('HTML Security', function() {
  it('should not use innerHTML with untrusted variables', function() {
    const htmlFiles = glob.sync('*.html');
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).to.not.match(/\.innerHTML\s*=/i, `Potential XSS in ${file}: innerHTML usage detected`);
    });
  });

  it('should use https for external resources', function() {
    const htmlFiles = glob.sync('*.html');
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).to.not.match(/src=["']http:\/\//, `Insecure script source in ${file}`);
      expect(content).to.not.match(/href=["']http:\/\//, `Insecure link source in ${file}`);
    });
  });

  it('should not use vulnerable jQuery versions', function() {
    const htmlFiles = glob.sync('*.html');
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      // Fail on 1.x or 2.x versions of jQuery
      expect(content).to.not.match(/jquery\/[12]\./, `Vulnerable jQuery version detected in ${file}`);
    });
  });
});
