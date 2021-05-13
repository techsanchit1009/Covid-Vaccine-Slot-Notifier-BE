const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let secret = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    secret = authHeader.slice(7, authHeader.length);
  }
  if (secret !== process.env.ADMIN_SECRET) {
    return res.json({
      status: 404,
      message: "Unauthorized"
    });
  }
  next();
}

exports.verifyAdmin = verifyAdmin;