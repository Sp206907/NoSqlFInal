const express = require('express');
const router = express.Router();
const {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  getTotalBalance,
  getAccountTypeStats
} = require('../controllers/accountController');
const auth = require('../middleware/auth');

// CRUD операции
router.post('/', auth, createAccount);                        // Создать аккаунт
router.get('/', auth, getAccounts);                           // Получить все аккаунты
router.get('/stats/total', auth, getTotalBalance);            // Общий баланс (aggregation)
router.get('/stats/types', auth, getAccountTypeStats);        // Статистика по типам (aggregation)
router.get('/:id', auth, getAccountById);                     // Получить один аккаунт
router.put('/:id', auth, updateAccount);                      // Обновить аккаунт
router.delete('/:id', auth, deleteAccount);                   // Удалить аккаунт

module.exports = router;