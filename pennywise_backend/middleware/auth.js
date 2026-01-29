const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет токена, доступ запрещен' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Здесь появляется тот самый req.user.id
    next();
  } catch (err) {
    res.status(401).json({ message: 'Токен не валиден' });
  }
};