import scoped from '../qualifiers/scoped.js';
import singleton from '../qualifiers/singleton.js';

export default T =>
  Object.assign(arg => new T(arg), { scoped, singleton, factory: true });
