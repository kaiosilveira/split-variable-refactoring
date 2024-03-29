import { distanceTravelled } from './index';

describe('distanceTravelled', () => {
  it('should be accelerated by an initial force', () => {
    const time = 1;
    const scenario = { primaryForce: 10, secondaryForce: 20, mass: 5, delay: 2 };
    expect(distanceTravelled(scenario, time)).toBe(1);
  });

  it('should be accelerated by an initial force and a secondary force if delay time is reached', () => {
    const time = 3;
    const scenario = { primaryForce: 10, secondaryForce: 20, mass: 5, delay: 2 };
    expect(distanceTravelled(scenario, time)).toBe(11);
  });

  it('should use the delay time if provided time is greater than delay time', () => {
    const time = 5;
    const scenario = { primaryForce: 10, secondaryForce: 20, mass: 5, delay: 2 };
    expect(distanceTravelled(scenario, time)).toBe(43);
  });
});
