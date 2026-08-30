const login = async (req, res) => {
  return res.status(200).json({
    success: true,
    token: process.env.AUTH_TOKEN,
  });
};

export {
  login,
};