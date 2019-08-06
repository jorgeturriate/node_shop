const User= require('../models/user');
const crypto= require('crypto');
const bcrypt= require('bcryptjs');
const nodemailer= require('nodemailer');
const sendgridTransport= require('nodemailer-sendgrid-transport');
const { validationResult }= require('express-validator');

const transporter= nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: 'yourKey'
    }
}));

exports.postLogin= (req,res,next)=>{
    let email= req.body.email;
    let password= req.body.password;
    let errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/login',{
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.mapped()
        });
    }
    User.findOne({email: email})
        .then(user=>{
            if(!user){
                //req.flash('error', 'Invalid email or password!');
                //return res.redirect('/login');
                return res.status(422).render('auth/login',{
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: {}
                });
            }
            bcrypt.compare(password,user.password)
                .then(doMatch=>{
                    if(!doMatch){
                        //req.flash('error','Invalid email or password!');
                        //return res.redirect('/login');
                        return res.status(422).render('auth/login',{
                            path: '/login',
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password',
                            oldInput: {
                                email: email,
                                password: password
                            },
                            validationErrors: {}
                        });
                    }
                    req.session.isLoggedIn= true;
                    req.session.user= user;
                    return req.session.save(err=>{
                        console.log(err);
                        res.redirect('/');
                    })
                })
        })
        .catch(e=>{
            const error= new Error(err);
            error.httpStatusCode= 500;
            return next(error);
        });
};

exports.getSignup = (req, res, next) => {
    let message= req.flash('error');
    if(message.length>0){
        message= message[0];
    }else{
        message= null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: {}
    });
};

exports.getLogin= (req,res,next)=>{
    let message= req.flash('error');
    if(message.length>0){
        message= message[0];
    }else{
        message= null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: {}
    });
};

exports.postSignup = (req, res, next) => {
    let email= req.body.email;
    let password= req.body.password;
    let confirmPassword= req.body.confirmPassword;
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.mapped());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: errors.mapped()
        });
    }
    /*User.findOne({email: email})
        .then(userDoc=>{
            if(userDoc){
                req.flash('error', 'E-mail exists already, please pick a different one.');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password,12)
                .then(hashedPassword=>{
                    const user= new User({
                        email: email,
                        password: hashedPassword,
                        cart: {
                            items: []
                        }
                    });
                    return user.save();
                })
                .then(result=>{
                    res.redirect('/login');
                    return transporter.sendMail({
                        'to': email,
                        'from': 'shop@node-complete.com',
                        'subject': 'Signup succeeded',
                        'html': '<h1>You successfully signed up!</h1>'
                    });
                })
                .catch(e=>{
                    console.log(e);
                })
        })
        .catch(e=>{
            console.log(e);
        })*/
    bcrypt.hash(password,12)
        .then(hashedPassword=>{
            const user= new User({
                email: email,
                password: hashedPassword,
                cart: {
                    items: []
                }
            });
            return user.save();
        })
        .then(result=>{
            res.redirect('/login');
            return transporter.sendMail({
                'to': email,
                'from': 'shop@node-complete.com',
                'subject': 'Signup succeeded',
                'html': '<h1>You successfully signed up!</h1>'
            });
        })
        .catch(e=>{
            const error= new Error(err);
            error.httpStatusCode= 500;
            return next(error);
        });

};

exports.postLogout= (req,res,next)=>{
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset= (req,res,next)=>{
    let message= req.flash('error');
    if(message.length>0){
        message= message[0];
    }else{
        message= null;
    }
    res.render('auth/reset',{
        path: '/reset',
        pageTitle: 'Reset password',
        errorMessage: message
    });
};

exports.postReset= (req,res,next)=>{
    crypto.randomBytes(32, (err,buffer)=>{
        if(err){
            console.log(err);
            res.redirect('/reset')
        }
        const token= buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user=>{
                if(!user){
                    req.flash('error', 'No account with that email found! ');
                    return res.redirect('/reset');
                }
                user.resetToken= token;
                user.resetTokenExpiration= Date.now()+ 1000*3600;
                return user.save()
                    .then(()=>{
                        res.redirect('/');
                        return transporter.sendMail({
                            'to': req.body.email,
                            'from': 'shop@node-complete.com',
                            'subject': 'Reset your password',
                            'html': `
                                <p>You requested password reset</p>
                                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                            `
                        });
                    })
            })
            .catch(err=>{
                const error= new Error(err);
                error.httpStatusCode= 500;
                return next(error);
            });
    })
};

exports.getNewPassword= (req,res,next)=>{
    const token= req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gte: Date.now() } })
        .then(user=>{
            if(!user){
                return res.redirect('/');
            }
            let message= req.flash('error');
            if(message.length>0){
                message= message[0];
            }else{
                message= null;
            }
            res.render('auth/new-password',{
                path: '/new-password',
                pageTitle: 'New password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });

        })
        .catch(e=>{
            console.log(e);
        });
};

exports.postNewPassword= (req,res,next)=>{
    const newPassword= req.body.password;
    const userId= req.body.userId;
    const passwordToken= req.body.passwordToken;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gte: Date.now()},
        _id: userId
    })
        .then(user=>{
            return bcrypt.hash(newPassword,12)
                .then(newHashedPassword=>{
                    user.password= newHashedPassword;
                    user.resetToken= null;
                    user.resetTokenExpiration= null;
                    return user.save();
                })
                .then(()=>{
                    return res.redirect('/login');
                })
                .catch(e=>{
                    console.log(e);
                })
        })
        .catch(e=>{
            console.log(e);
        })
};