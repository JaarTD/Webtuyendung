const isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Bạn cần phải đăng nhập!" });
  }
  if (req.session.user.vai_tro !== "quantri") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
  }
  next();
};

const isEmployer = (req, res, next) => {
  if (!req.session.user || req.session.user.vai_tro !== "nhatuyendung") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
  }
  next();
};

const isJobSeeker = (req, res, next) => {
  if (!req.session.user || req.session.user.vai_tro !== "nguoitimviec") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
  }
  next();
};

module.exports = { isAdmin, isEmployer, isJobSeeker };
