const express= require('express');
const path= require('path');
const bodyParser= require('body-parser');

const MONGO_URI= 'mongodb://localhost:27017/udemy_node_mongoose';

const errorController= require('./controllers/error');
const mongoose= require('mongoose');
const session= require('express-session');
const csrf= require('csurf');
const flash= require('connect-flash');
const multer= require('multer');
const MongoDBStore= require('connect-mongodb-session')(session);

//const mongoConnect= require('./util/database').mongoConnect;
//const db= require('./util/database');
// const sequelize= require('./util/database');
// const Product= require('./models/product');
const User= require('./models/user');
// const Cart= require('./models/cart');
// const CartItem= require('./models/cart-item');
// const Order= require('./models/order');
// const OrderItem= require('./models/order-item');

const app= express();

const store= new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
});
const csrfProtection= csrf();

const fileStorage= multer.diskStorage({
   destination: (req,file,cb)=>{
       cb(null,'images');
   },
   filename: (req,file,cb)=>{
       cb(null, new Date().toISOString().replace(/:/g, '-')+'-'+file.originalname);
   }
});

const fileFilter= (req,file,cb)=>{
    if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg'){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set('view engine','ejs');
app.set('views','views');

const adminRoutes= require('./routes/admin');
const shopRoutes= require('./routes/shop');
const authRoutes= require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));

app.use(
    session({
        secret: 'ThisIsASecret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    res.locals.isAuthenticated= req.session.isLoggedIn;
    res.locals.csrfToken= req.csrfToken();
    next();
});

app.use((req,res,next)=>{
   //throw new Error('Sync Dummy');
   if(!req.session.user){
       return next();
   }
   User.findById(req.session.user._id)
       .then(user=>{
           //req.user= new User(user.name, user.email, user.cart, user._id);
           if(!user){
               return next();
           }
           req.user= user;
           next();
       })
       .catch(err=>{
           next(new Error(err));
       });
});

app.use(authRoutes);

app.use('/admin',adminRoutes);

app.use(shopRoutes);

app.get('/500',errorController.get500);

app.use(errorController.get404);

app.use((error,req,res,next)=>{
    // res.status(error.httpStatusCode).render(....);
    //res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});

// mongoConnect(()=>{
//    app.listen(3000);
// });

mongoose
    .connect(MONGO_URI,{useNewUrlParser: true})
    .then((result)=>{
        /*User.findOne().then(user=>{
            if(!user){
                const user= new User({
                    name: 'Jorge',
                    email: 'jorge@jor.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });*/
        app.listen(3000);
    })
    .catch(e=>console.log(e));

/*
Product.belongsTo(User,{constraints:true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through: CartItem});
CartItem.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product,{through: OrderItem});

sequelize
    //.sync({force: true})
    .sync()
    .then(result=>{
        //console.log(result);
        return User.findByPk(1)
    })
    .then(user=>{
        if(!user){
            return User.create({name: "Jorge", email: "jorge@gmail.com"});
        }
        return user;
    })
    .then(user=>{
        //console.log(user);
        return user.createCart();
    })
    .then(cart=>{
        app.listen(3000);
    })
    .catch(e=>{
        console.log(e);
    });

*/
