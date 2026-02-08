const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await Promise.resolve(requestHandler(req, res, next));
    } catch (error) {
      console.error("AsyncHandler catch error:", error); // Log the full error for debugging
      const statusCode = error.statusCode || 500;
      const errorMessage = error.message || "Internal Server Error";
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        // stack: error.stack // Temporarily expose stack trace
      });
    }
  };
};

export default asyncHandler;