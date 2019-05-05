export default handler => (req, res, next) => {
  return Promise.resolve(handler(req.scope.proxy, req, res, next))
    .then(data => {
      if (res.finished) {
        return;
      }

      if (data) {
        res.json(data);
      } else {
        res.sendStatus(204);
      }
    })
    .catch(next);
};
