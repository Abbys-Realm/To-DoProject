const express= require('express')
const router= express.Router();

const {register, login}=require('../Controllers/authController');

router.get('/profile', getProfile);
router.patch('/email', changeEmail);
router.patch('/password', changePassword);
router.post('/register', register);
router.post('/login', login);



module.exports = router