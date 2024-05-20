export const responseHandler = (code, message, body = null, res) => {
    res?.status(code).json({ message: message, code: code, data: body });
};
