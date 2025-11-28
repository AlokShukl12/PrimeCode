export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    return res.status(400).json({ message: 'Validation failed', errors: fieldErrors })
  }

  req.body = result.data
  return next()
}
