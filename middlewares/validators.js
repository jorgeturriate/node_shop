const {check,body}= require('express-validator');
const User= require('../models/user');

exports.signUpValidator= [
  check('email')
      .isEmail()
      .withMessage('Please type the correct email')
      .custom((value, {req})=>{
          // if(value==='test@test.com'){
          //     throw new Error('This email is forbidden');
          // }
          // return true;
          return User.findOne({email: value})
              .then(userDoc=> {
                  if (userDoc) {
                      return Promise.reject('E-mail exists already, please pick a different one.');
                  }
              })

      })
      .normalizeEmail(),
    body('password','Please enter a password with only numbers and text and at least 5 characters')
        .isLength({min:5})
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error('Passwords have to match');
            }
            return true;
        })
        .trim()
];

exports.loginValidator= [
    body('email','Please write a correct password')
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({min:5})
        .isAlphanumeric()
        .trim()
        .withMessage('Please type the correct password')
];

exports.addProductValidator= [
    body('title','Please write the correct title')
        .isString()
        .isLength({min:3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min: 5, max: 400})
        .trim()
];