export const errorHandler = (err, req, res, next) => {
  console.error(err)
  const status = err.statusCode || 500
  const payload = {
    message: err.message || 'Unexpected error',
  }

  if (err.errors) {
    payload.errors = err.errors
  }

  res.status(status).json(payload)
}
