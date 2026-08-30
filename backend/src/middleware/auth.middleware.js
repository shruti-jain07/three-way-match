const authenticate = (req, res, next) => {
const expectedToken = process.env.AUTH_TOKEN;
 
const authHeader = req.headers.authorization;
 
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
    });
  }
 
  const [type, token] = authHeader.split(" ");
 
  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format",
    });
  }
 
  if (!expectedToken) {
    console.error("AUTH_TOKEN is not set in the environment");
    return res.status(500).json({
      success: false,
      message: "Server auth configuration error",
    });
  }
 
  if (token !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization token",
    });
  }
 
  next();
};
 
export default authenticate;