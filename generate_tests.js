// generate_tests.js
// Unit tests for password generation functions

/**
 * Basic test runner
 */
function runTests(name, tests) {
  console.log(`Running: ${name}`);
  let passedCount = 0;
  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      testFn();
      console.log(`  ✓ ${testName}`);
      passedCount++;
    } catch (err) {
      console.error(`  ✗ ${testName}`);
      console.error(`    Error: ${err.message}`);
    }
  }
  console.log(`${passedCount}/${Object.keys(tests).length} passed.\n`);
  return passedCount === Object.keys(tests).length;
}

const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) throw new Error(`${msg || 'Assert equal failed'}: expected ${expected}, got ${actual}`);
  },
  truthy: (val, msg) => {
    if (!val) throw new Error(`${msg || 'Assert truthy failed'}: got ${val}`);
  },
  includesOnly: (val, chars, msg) => {
    for (const char of val) {
      if (!chars.includes(char)) throw new Error(`${msg || 'Assert includesOnly failed'}: character "${char}" is not allowed`);
    }
  }
};

// --- Tests for generateRandomPassword(length) ---

/**
 * Generates a random password of given length.
 * Characters: a-zA-Z0-9#$%&/()=?+-_
 */
function generateRandomPassword(length) {
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&/()=?+-_";
  var password = "";
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
}

const randomPasswordTests = {
  "should return a string of the correct length": () => {
    const length = 12;
    const pass = generateRandomPassword(length);
    assert.equal(pass.length, length, "Correct length");
  },
  "should only include allowed characters": () => {
    const allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&/()=?+-_";
    const pass = generateRandomPassword(20);
    assert.includesOnly(pass, allowed, "Only allowed characters");
  },
  "should generate different passwords on subsequent calls": () => {
    const pass1 = generateRandomPassword(12);
    const pass2 = generateRandomPassword(12);
    assert.truthy(pass1 !== pass2, "Should be different");
  }
};

if (typeof require !== 'undefined' && require.main === module) {
  const allPassed = runTests("Random Password Generator", randomPasswordTests);
  if (!allPassed) process.exit(1);
}
