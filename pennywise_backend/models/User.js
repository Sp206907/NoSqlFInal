const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Хешируем пароль перед сохранением
// ВАЖНО: В async функции НЕ используем next как параметр
UserSchema.pre('save', async function() {
  // Если пароль не изменился, пропускаем хеширование
  if (!this.isModified('password')) return;
  
  // Хешируем пароль
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);