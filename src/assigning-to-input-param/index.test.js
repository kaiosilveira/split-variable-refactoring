import { discount } from '.';

describe('discount', () => {
  it('should subtract 2 from the input value if it is greater than 50', () => {
    expect(discount(51, 10)).toBe(49);
  });

  it('should subtract 1 from the input value if the quantity is greater than 100', () => {
    expect(discount(50, 101)).toBe(49);
  });

  it('should subtract 2 from the input value if it is greater than 50 and subtract 1 if the quantity is greater than 100', () => {
    expect(discount(51, 101)).toBe(48);
  });
});
