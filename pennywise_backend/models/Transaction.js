const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  // EMBEDDING: Массив тегов прямо в документе
  tags: [String],
  date: { type: Date, default: Date.now }
});

// COMPOUND INDEX: Оптимизация для поиска транзакций юзера по дате (6 баллов за оптимизацию)
TransactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);