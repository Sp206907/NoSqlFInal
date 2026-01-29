const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');

// 1. СОЗДАНИЕ ТРАНЗАКЦИИ (уже есть)
exports.createTransaction = async (req, res) => {
  try {
    const { accountId, amount, type, category, description, tags } = req.body;
    const userId = req.user.id;

    // Проверяем что аккаунт принадлежит юзеру
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ message: "Аккаунт не найден" });
    }

    // Проверка баланса для расходов
    if (type === 'expense' && account.balance < amount) {
      return res.status(400).json({ message: "Недостаточно средств на счете" });
    }

    const newTransaction = new Transaction({
      userId,
      accountId,
      amount,
      type,
      category,
      description,
      tags
    });

    await newTransaction.save();

    // Обновляем баланс с использованием $inc (Advanced Update)
    const change = type === 'expense' ? -amount : amount;
    await Account.findByIdAndUpdate(accountId, {
      $inc: { balance: change }
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании транзакции", error: error.message });
  }
};

// 2. ПОЛУЧИТЬ ВСЕ ТРАНЗАКЦИИ ПОЛЬЗОВАТЕЛЯ (с фильтрацией и сортировкой)
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, startDate, endDate, limit = 50, skip = 0 } = req.query;

    // Построение фильтра
    const filter = { userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('accountId', 'name type') // Populate для получения данных аккаунта
      .sort({ date: -1 }) // Сортировка по дате (новые первые)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении транзакций", error: error.message });
  }
};

// 3. ПОЛУЧИТЬ ОДНУ ТРАНЗАКЦИЮ ПО ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate('accountId', 'name type balance');

    if (!transaction) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении транзакции", error: error.message });
  }
};

// 4. ОБНОВИТЬ ТРАНЗАКЦИЮ (Advanced Update с $set, $push)
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, type, category, description, tags } = req.body;

    // Находим старую транзакцию
    const oldTransaction = await Transaction.findOne({ _id: id, userId });
    if (!oldTransaction) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    // Если изменилась сумма или тип, пересчитываем баланс
    if (amount !== oldTransaction.amount || type !== oldTransaction.type) {
      // Возвращаем старый баланс
      const oldChange = oldTransaction.type === 'expense' ? oldTransaction.amount : -oldTransaction.amount;
      await Account.findByIdAndUpdate(oldTransaction.accountId, {
        $inc: { balance: oldChange }
      });

      // Применяем новый баланс
      const newChange = type === 'expense' ? -amount : amount;
      await Account.findByIdAndUpdate(oldTransaction.accountId, {
        $inc: { balance: newChange }
      });
    }

    // Обновляем транзакцию с использованием $set
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('accountId', 'name type balance');

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении транзакции", error: error.message });
  }
};

// 5. УДАЛИТЬ ТРАНЗАКЦИЮ (с возвратом баланса)
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    // Возвращаем баланс
    const change = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
    await Account.findByIdAndUpdate(transaction.accountId, {
      $inc: { balance: change }
    });

    await Transaction.findByIdAndDelete(id);

    res.json({ message: "Транзакция удалена", deletedTransaction: transaction });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении транзакции", error: error.message });
  }
};

// 6. СТАТИСТИКА ПО КАТЕГОРИЯМ (уже есть - Aggregation #1)
exports.getStatsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'expense' } = req.query;

    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: type
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Ошибка агрегации", error: error.message });
  }
};

// 7. СТАТИСТИКА ПО МЕСЯЦАМ (Aggregation #2)
exports.getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId)
    };

    // Если указан год, фильтруем по нему
    if (year) {
      matchStage.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      };
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type"
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          type: "$_id.type",
          totalAmount: 1,
          count: 1
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Ошибка агрегации по месяцам", error: error.message });
  }
};

// 8. ДОБАВИТЬ ТЕГ К ТРАНЗАКЦИИ (Advanced Update с $push)
exports.addTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    const userId = req.user.id;

    if (!tag) {
      return res.status(400).json({ message: "Тег обязателен" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $push: { tags: tag } }, // $push для добавления в массив
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при добавлении тега", error: error.message });
  }
};

// 9. УДАЛИТЬ ТЕГ ИЗ ТРАНЗАКЦИИ (Advanced Update с $pull)
exports.removeTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    const userId = req.user.id;

    if (!tag) {
      return res.status(400).json({ message: "Тег обязателен" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { tags: tag } }, // $pull для удаления из массива
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении тега", error: error.message });
  }
};