export default x =>
  Object.assign(() => x, { qualifier: 'scoped', factory: true });
