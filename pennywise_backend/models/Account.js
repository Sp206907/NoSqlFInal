const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Например: "Kaspi Gold"
  type: { type: String, enum: ['card', 'cash', 'savings'], default: 'card' },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);