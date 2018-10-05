const db = require('./config/database');

exports.handler = async (event) => {
    await db.sequelize.sync();
    let userId = event.userId;
    let user;
    let messages;
    try{
        user = await db.User.findById(userId);
        messages = await user.getMessages();
        for(let message of messages){
            message.update({deleted_flag:true});
        }
        return true
    } catch (err) {
        throw new Error(err);
    }
}