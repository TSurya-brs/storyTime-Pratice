const notFound = (req, res, next) => {
  const error = new Error(`Not Found-${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode;
  if (statusCode) {
    statusCode = err.statusCode;
  } else {
    statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  }

  let message = err.message || "Internal Server Error";

  //this is the response that wil be sent to the client
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
