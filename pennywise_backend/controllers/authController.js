const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Валидация
    if (!username || !password) {
      return res.status(400).json({ error: "Username и password обязательны" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль должен быть минимум 6 символов" });
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ message: "Юзер создан" });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username и password обязательны" });
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: "Неверные данные" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Неверные данные" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};