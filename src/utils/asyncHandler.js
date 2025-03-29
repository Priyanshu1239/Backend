const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)) // ✅ Correct order
            .catch((err) => next(err));
    };
};
export default asyncHandler;
