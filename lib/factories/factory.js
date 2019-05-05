import scoped from '../qualifiers/scoped.js';
import singleton from '../qualifiers/singleton.js';

export default fn =>
  Object.assign(arg => fn(arg), { scoped, singleton, factory: true });
