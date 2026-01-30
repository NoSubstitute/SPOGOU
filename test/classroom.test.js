const fs = require('fs');
const { expect } = require('chai');
const vm = require('vm');

describe('Classroom Integration', function() {
  let context;

  beforeEach(function() {
    // Mock Services
    const Classroom = {
      Courses: {
        list: function() { return { courses: [] }; }
      }
    };

    // Create a sandbox
    context = vm.createContext({
      Classroom: Classroom,
      console: console,
      // Add other necessary globals
    });

    // Load the script
    const code = fs.readFileSync('spogou.gs', 'utf8');
    vm.runInContext(code, context);
  });

  it('should define getClassrooms function', function() {
    expect(typeof context.getClassrooms).to.equal('function');
  });

  it('should return active courses for a teacher', function() {
    // Setup mock return
    const mockCourses = [
      { id: '123', name: 'Math 101', courseState: 'ACTIVE' },
      { id: '456', name: 'History', courseState: 'ARCHIVED' }
    ];
    
    context.Classroom.Courses.list = (options) => {
      expect(options.teacherId).to.equal('teacher@school.edu');
      // Simulate API filtering
      const filtered = mockCourses.filter(c => options.courseStates.includes(c.courseState));
      return { courses: filtered }; 
    };

    const results = context.getClassrooms('teacher@school.edu');
    expect(results).to.be.an('array');
    // Should filter out archived? The prompt didn't specify, but usually "Select Classroom" implies active ones.
    // Let's assume we want all for now, or maybe just active. 
    // Given the use case (resetting passwords for a class), active seems most relevant.
    // I'll filter for ACTIVE in the implementation to be safe/clean.
    expect(results.length).to.equal(1); 
    expect(results[0].name).to.equal('Math 101');
    expect(results[0].id).to.equal('123');
  });

  it('should handle errors gracefully', function() {
      context.Classroom.Courses.list = () => { throw new Error('API Error'); };
      const results = context.getClassrooms('error@school.edu');
      expect(results).to.be.an('array');
      expect(results).to.be.empty;
  });
});
