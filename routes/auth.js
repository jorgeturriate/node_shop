const express = require('express');
//const { check, body }= require('express-validator');
const validators= require('../middlewares/validators');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', validators.loginValidator, authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

/*router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Please type the correct email')
        .custom((value,{req})=>{
            if(value==='test@test.com'){
                throw new Error('This email is forbidden';)
            }
            return true;
        }),
    authController.postSignup
);*/
router.post('/signup', validators.signUpValidator, authController.postSignup);


router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;