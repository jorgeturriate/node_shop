const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth= require('../middlewares/is-auth');

const validators= require('../middlewares/validators');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', validators.addProductValidator ,isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', validators.addProductValidator, isAuth, adminController.postEditProduct);

//router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
