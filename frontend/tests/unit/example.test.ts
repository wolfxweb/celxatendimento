/**
 * Example unit test - tests utility functions
 */
describe('Example Tests', () => {
  it('should pass basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should validate math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 3).toBe(9);
  });

  it('should work with strings', () => {
    const greeting = 'Hello, CELX';
    expect(greeting).toContain('CELX');
    expect(greeting.toLowerCase()).toBe('hello, celx');
  });
});
