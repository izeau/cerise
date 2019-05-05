const { createContainer, constant, factory, service } = require('cerise');

// Dependencies can be registered on container creation by passing an object or
// later using `container.register(name, dependency)`.
const container = createContainer({
  'constants.pi': constant(Math.PI),
  'services.double': constant(x => x * 2),
});

// Factories can depend on other values
container.register(
  'services.deg2rad',
  factory(({ 'constants.pi': pi }) => deg => {
    return (deg * 180) / pi;
  }),
);

// Unlike factories, services are class instanciated with `new`
class MathService {
  constructor({ 'constants.pi': pi, 'services.double': double }) {
    this.pi = pi;
    this.double = double;
  }

  perimeter(radius) {
    return this.double(this.pi * radius);
  }
}

container.register('services.math', service(MathService));
