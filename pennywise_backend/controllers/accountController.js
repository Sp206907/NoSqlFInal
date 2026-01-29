const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// 1. СОЗДАТЬ АККАУНТ (уже есть)
exports.createAccount = async (req, res) => {
  try {
    const { name, type, balance } = req.body;
    
    // Валидация
    if (!name || !type) {
      return res.status(400).json({ error: "Name и type обязательны" });
    }

    const account = new Account({
      userId: req.user.id,
      name,
      type,
      balance: balance || 0
    });
    
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. ПОЛУЧИТЬ ВСЕ АККАУНТЫ (уже есть)
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. ПОЛУЧИТЬ ОДИН АККАУНТ ПО ID
exports.getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({ _id: id, userId });
    
    if (!account) {
      return res.status(404).json({ message: "Аккаунт не найден" });
    }

    // Получаем последние 5 транзакций для этого аккаунта
    const recentTransactions = await Transaction.find({ accountId: id })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      account,
      recentTransactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. ОБНОВИТЬ АККАУНТ (Advanced Update с $set)
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, type } = req.body;

    // Проверяем существование аккаунта
    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Аккаунт не найден" });
    }

    // Формируем объект обновления
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;

    // Обновляем с использованием $set
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. УДАЛИТЬ АККАУНТ (с удалением всех связанных транзакций)
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверяем существование аккаунта
    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Аккаунт не найден" });
    }

    // Удаляем все транзакции, связанные с этим аккаунтом
    const deletedTransactions = await Transaction.deleteMany({ accountId: id });

    // Удаляем сам аккаунт
    await Account.findByIdAndDelete(id);

    res.json({
      message: "Аккаунт удален",
      deletedAccount: account,
      deletedTransactionsCount: deletedTransactions.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. ПОЛУЧИТЬ ОБЩИЙ БАЛАНС ВСЕХ СЧЕТОВ (Aggregation #3)
exports.getTotalBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Account.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          accountCount: { $sum: 1 },
          avgBalance: { $avg: "$balance" }
        }
      },
      {
        $project: {
          _id: 0,
          totalBalance: 1,
          accountCount: 1,
          avgBalance: { $round: ["$avgBalance", 2] }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        totalBalance: 0,
        accountCount: 0,
        avgBalance: 0
      });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. СТАТИСТИКА ПО ТИПАМ АККАУНТОВ (Aggregation #4)
exports.getAccountTypeStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Account.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
          avgBalance: { $avg: "$balance" }
        }
      },
      {
        $sort: { totalBalance: -1 }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
          totalBalance: 1,
          avgBalance: { $round: ["$avgBalance", 2] }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const mongoose = require('mongoose');