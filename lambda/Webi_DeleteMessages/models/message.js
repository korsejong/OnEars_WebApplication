module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('message', {
        message_id_pk : { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue: DataTypes.UUIDV1 
        },
        data: {
            type: DataTypes.TEXT
        },
        document_url: {
            type: DataTypes.STRING
        },
        from_flag: {
            type: DataTypes.BOOLEAN,
        },
        deleted_flag : { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        }
    },{
        timestamps: true,
        tableName: 'message_table'
    });
    Message.associate = models => {
        Message.belongsToMany(models.User, {
            through: 'user_message_table',
            as: 'users',
        });
        Message.belongsTo(models.Audio, {foreignKey: 'audio_id_fk'});
    }
    return Message;
};