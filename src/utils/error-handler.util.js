export const errorHandler = (code, message, res) => {
    res.status(code).json({ message: message, code: code, body: null })
}
