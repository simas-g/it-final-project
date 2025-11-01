export const handleError = (error, defaultMessage = 'An error occurred', res) => {
  console.error(defaultMessage, error)
  res.status(500).json({ error: defaultMessage })
}
