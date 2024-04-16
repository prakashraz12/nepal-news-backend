export const responseHandler = (code, message, body = null, res) => {
    console
    res?.status(code).json({ message: message, code: code, data: body })
}


