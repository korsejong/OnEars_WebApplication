const db = require('./config/database');

exports.handler = async (event) => {
    let userId = event.userId;
    await db.sequelize.sync();
    try{
        let user = await db.User.findById(userId);
        // ~~
        return null;
    } catch (err) {
        throw new Error(err);
    }
}