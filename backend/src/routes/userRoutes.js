const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { register, login, forgotPassword, resetPassword } = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;