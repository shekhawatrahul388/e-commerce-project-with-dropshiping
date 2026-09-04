const adminMiddleware = (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log(
      "ADMIN CHECK:",
      req.user
    );

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required",

        currentRole:
          req.user.role || null,
      });
    }

    next();
  } catch (error) {
    console.error(
      "ADMIN ERROR:",
      error.message
    );

    return res.status(403).json({
      success: false,
      message:
        "Admin access denied",
    });
  }
};

module.exports = adminMiddleware;