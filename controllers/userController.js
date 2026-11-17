
const getProfile = (req, res) => {
  res.status(200).json({
    message: "Protected API accessed successfully",
    user: req.user
  });
};

module.exports = { getProfile };
