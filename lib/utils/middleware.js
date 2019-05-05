export default container => (req, res, next) => {
  if (next) {
    req.scope = container.scope();
    next();
  } else {
    req.state.scope = container.scope();
    return res();
  }
};
