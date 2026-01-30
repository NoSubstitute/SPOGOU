const fs = require('fs');
const { expect } = require('chai');
const vm = require('vm');

describe('Group Search', function() {
  let context;

  beforeEach(function() {
    // Mock AdminDirectory service
    const AdminDirectory = {
      Groups: {
        list: function() { return { groups: [] }; }
      },
      Users: {
        list: function() { return { users: [] }; }
      }
    };

    // Create a sandbox
    context = vm.createContext({
      AdminDirectory: AdminDirectory,
      console: console,
      Session: {
        getActiveUser: function() {
          return {
            getEmail: function() { return 'admin@example.com'; }
          };
        }
      }
    });

    // Load the script
    const code = fs.readFileSync('spogou.gs', 'utf8');
    vm.runInContext(code, context);
  });

  it('should define searchGroups function', function() {
    expect(typeof context.searchGroups).to.equal('function');
  });

  it('should return groups matching the query', function() {
    // Setup mock return
    const mockGroups = [
      { email: 'teachers@school.edu', name: 'Teachers' },
      { email: 'test@school.edu', name: 'Test Group' }
    ];
    
    context.AdminDirectory.Groups.list = (options) => {
      // Basic check that query is passed (though logic might verify it in spogou.gs)
      return { groups: mockGroups }; 
    };

    const results = context.searchGroups('teacher');
    expect(results).to.be.an('array');
    expect(results.length).to.equal(2);
    expect(results[0].email).to.equal('teachers@school.edu');
  });

  it('should handle empty results', function() {
    context.AdminDirectory.Groups.list = () => ({ groups: [] });
    const results = context.searchGroups('nonexistent');
    expect(results).to.be.an('array');
    expect(results).to.be.empty;
  });
  
  it('should handle errors gracefully', function() {
      context.AdminDirectory.Groups.list = () => { throw new Error('API Error'); };
      const results = context.searchGroups('error');
      expect(results).to.be.an('array');
      expect(results).to.be.empty; // Or expect it to return error object depending on design
  });
});

describe('User Search', function() {
  let context;

  beforeEach(function() {
    const AdminDirectory = {
      Users: {
        list: function() { return { users: [] }; }
      }
    };

    context = vm.createContext({
      AdminDirectory: AdminDirectory,
      console: console,
      Session: {
        getActiveUser: function() {
          return {
            getEmail: function() { return 'admin@example.com'; }
          };
        }
      }
    });

    const code = fs.readFileSync('spogou.gs', 'utf8');
    vm.runInContext(code, context);
  });

  it('should define searchUsers function', function() {
    expect(typeof context.searchUsers).to.equal('function');
  });

  it('should return users matching the query', function() {
    const mockUsers = [
      { primaryEmail: 'teacher1@school.edu', name: { fullName: 'Teacher One' } },
      { primaryEmail: 'test.user@school.edu', name: { fullName: 'Test User' } }
    ];
    
    context.AdminDirectory.Users.list = (options) => {
      return { users: mockUsers }; 
    };

    const results = context.searchUsers('teacher');
    expect(results).to.be.an('array');
    expect(results.length).to.equal(2);
    expect(results[0].email).to.equal('teacher1@school.edu');
  });

  it('should handle empty results', function() {
    context.AdminDirectory.Users.list = () => ({ users: [] });
    const results = context.searchUsers('nonexistent');
    expect(results).to.be.an('array');
    expect(results).to.be.empty;
  });
});
