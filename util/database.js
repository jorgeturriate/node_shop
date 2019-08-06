/*
const mysql= require('mysql2');

const pool= mysql.createPool({
   host: 'localhost',
   user: 'root',
   database: 'udemy_node',
   password: ''
});

module.exports= pool.promise();*/

/*
const Sequelize= require('sequelize');
const sequelize= new Sequelize('udemy_node','root','',{
   dialect: 'mysql',
   host: 'localhost'
});

module.exports= sequelize;*/

const mongodb= require('mongodb');
const MongoClient= mongodb.MongoClient;

let _db;

const mongoConnect= (callback)=>{
    MongoClient.connect('mongodb://localhost:27017/udemy_node',{useNewUrlParser: true})
        .then(client=>{
            console.log('Connected!');
            _db= client.db();
            callback();
        })
        .catch(e=>{
            console.log(e);
            throw e;
        });
};

const getDb=()=>{
    if(_db){
        return _db;
    }else{
        throw 'No database find';
    }
};

exports.mongoConnect= mongoConnect;
exports.getDb= getDb;