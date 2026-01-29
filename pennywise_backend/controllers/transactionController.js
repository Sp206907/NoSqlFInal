const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');

// 1. СОЗДАНИЕ ТРАНЗАКЦИИ (уже есть)
exports.createTransaction = async (req, res) => {
  try {
    const { accountId, amount, type, category, description, tags, date } = req.body;
    const userId = req.user.id;

    // Проверяем что аккаунт принадлежит юзеру
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ success: false, message: "Аккаунт не найден" });
    }

    // Проверка баланса для расходов
    if (type === 'expense' && account.balance < amount) {
      return res.status(400).json({ success: false, message: "Недостаточно средств на счете" });
    }

    const newTransaction = new Transaction({
      userId,
      accountId,
      amount,
      type,
      category,
      description,
      tags,
      date: date || new Date()
    });

    await newTransaction.save();

    // Обновляем баланс с использованием $inc (Advanced Update)
    const change = type === 'expense' ? -amount : amount;
    await Account.findByIdAndUpdate(accountId, {
      $inc: { balance: change }
    });

    const populatedTransaction = await Transaction.findById(newTransaction._id).populate('accountId', 'name type');

    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: "Ошибка при создании транзакции", error: error.message });
  }
};

// 2. ПОЛУЧИТЬ ВСЕ ТРАНЗАКЦИИ ПОЛЬЗОВАТЕЛЯ (с фильтрацией и сортировкой)
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, accountId, startDate, endDate, limit = 50, skip = 0 } = req.query;

    // Построение фильтра
    const filter = { userId };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (accountId) filter.accountId = accountId;
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
      success: true,
      data: transactions,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: "Ошибка при получении транзакций", error: error.message });
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
    const { amount, type, category, description, tags, date } = req.body;

    // Находим старую транзакцию
    const oldTransaction = await Transaction.findOne({ _id: id, userId });
    if (!oldTransaction) {
      return res.status(404).json({ success: false, message: "Транзакция не найдена" });
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
    if (date !== undefined) updateData.date = date;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('accountId', 'name type balance');

    res.json({ success: true, data: updatedTransaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, message: "Ошибка при обновлении транзакции", error: error.message });
  }
};

// 5. УДАЛИТЬ ТРАНЗАКЦИЮ (с возвратом баланса)
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Транзакция не найдена" });
    }

    // Возвращаем баланс
    const change = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
    await Account.findByIdAndUpdate(transaction.accountId, {
      $inc: { balance: change }
    });

    await Transaction.findByIdAndDelete(id);

    res.json({ success: true, message: "Транзакция удалена" });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, message: "Ошибка при удалении транзакции", error: error.message });
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

// 10. ПОЛУЧИТЬ ДЕТАЛЬНУЮ СТАТИСТИКУ ЗА ПЕРИОД
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate и endDate обязательны" });
    }

    const matchFilter = {
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Получаем все транзакции за период
    const transactions = await Transaction.find(matchFilter);

    // Общие суммы
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Статистика по категориям
    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        byCategory[t.category].income += t.amount;
      } else {
        byCategory[t.category].expense += t.amount;
      }
      byCategory[t.category].count++;
    });

    // Статистика по счетам
    const transactionsWithAccount = await Transaction.find(matchFilter).populate('accountId', 'name');
    const byAccount = {};
    transactionsWithAccount.forEach(t => {
      const accountName = t.accountId?.name || 'Unknown';
      if (!byAccount[accountName]) {
        byAccount[accountName] = { income: 0, expense: 0, total: 0 };
      }
      if (t.type === 'income') {
        byAccount[accountName].income += t.amount;
        byAccount[accountName].total += t.amount;
      } else {
        byAccount[accountName].expense += t.amount;
        byAccount[accountName].total -= t.amount;
      }
    });

    // Статистика по датам
    const byDate = {};
    transactions.forEach(t => {
      const dateKey = t.date.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byDate[dateKey].income += t.amount;
      } else {
        byDate[dateKey].expense += t.amount;
      }
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        transactionCount: transactions.length,
        byCategory,
        byAccount,
        byDate
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: "Ошибка при получении статистики", error: error.message });
  }
};