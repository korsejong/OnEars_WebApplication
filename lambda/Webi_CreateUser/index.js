const db = require('./config/database');

exports.handler = async (event) => {
    await db.sequelize.sync();
    try{
        let user = await db.User.create({
            age: event.age,
            gender: event.gender,
            concern: event.concern
        });
        return user.user_id_pk;
    } catch (err) {
        throw new Error(err);
    }
}