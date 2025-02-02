const asyncHandler = (requestHandler) => {
    return (req, res, next) => {     
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            console.error('Error caught in asyncHandler:', err);
            next(err);
        });
    };
};

module.exports = { asyncHandler };