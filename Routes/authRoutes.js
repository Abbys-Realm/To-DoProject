const express= require('express')
const router= express.Router();

const {register, login, getProfile, changeEmail, changePassword, checkUser, updateUsername}=require('../Controllers/authController');

const authMiddleware= require('../Middleware/authMiddleware')

router.get('/profile',authMiddleware, getProfile);
router.patch('/email',authMiddleware, changeEmail);
router.patch('/password',authMiddleware, changePassword);
router.get('/checkUsername', authMiddleware, checkUser);
router.patch('/username',authMiddleware, updateUsername);

router.post('/register', register);
router.post('/login', login);



module.exports = router