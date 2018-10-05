module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        user_id_pk : { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue: DataTypes.UUIDV1 
        },
        age: {
            type: DataTypes.STRING
        },
        gender :{
            type: DataTypes.STRING
        },
        concern: {
            type: DataTypes.STRING
        },
        deleted_flag : { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        }
    },{
        timestamps: true,
        tableName: 'user_table'
    });
    User.associate = models => {
        User.belongsToMany(models.Message, {
            through: 'user_message_table',
            as: 'messages'
        });
        User.belongsToMany(models.Document, {
            through: 'history_table',
            as: 'documents'
        });
        User.hasMany(models.Mail)
    }
    return User;
};