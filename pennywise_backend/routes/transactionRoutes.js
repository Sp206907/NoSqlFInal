const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getStatsByCategory,
  getMonthlyStats,
  addTag,
  removeTag
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// CRUD операции
router.post('/', auth, createTransaction);                    // Создать транзакцию
router.get('/', auth, getTransactions);                       // Получить все транзакции (с фильтрами)
router.get('/stats/category', auth, getStatsByCategory);      // Статистика по категориям
router.get('/stats/monthly', auth, getMonthlyStats);          // Статистика по месяцам
router.get('/:id', auth, getTransactionById);                 // Получить одну транзакцию
router.put('/:id', auth, updateTransaction);                  // Обновить транзакцию
router.delete('/:id', auth, deleteTransaction);               // Удалить транзакцию

// Advanced операции с тегами
router.post('/:id/tags', auth, addTag);                       // Добавить тег ($push)
router.delete('/:id/tags', auth, removeTag);                  // Удалить тег ($pull)

module.exports = router;