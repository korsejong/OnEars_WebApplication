const config = require('./config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};

// sequelize.authenticate().then(function(err){
//     console.log('Connection has been established successfully');
// }).catch(function(err){
//     console.log('Unable to connect to the database:',err);
// })

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = sequelize.import('../models/user');
db.Message = sequelize.import('../models/message');
db.Audio = sequelize.import('../models/audio');
db.Document = sequelize.import('../models/document');
db.Mail = sequelize.import('../models/mail');

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;