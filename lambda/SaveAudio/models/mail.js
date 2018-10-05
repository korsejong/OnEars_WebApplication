module.exports = (sequelize, DataTypes) => {
    const Mail = sequelize.define('mail', {
        mail_id_pk : { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue: DataTypes.UUIDV1 
        },
        platform: {
            type: DataTypes.STRING
        },
        mail_id: {
            type: DataTypes.STRING
        },
        mail_pw: {
            type: DataTypes.STRING
        },
        deleted_flag : { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        }
    },{
        timestamps: true,
        tableName: 'mail_table'
    });
    Mail.associate = models => {
        Mail.belongsTo(models.User);
    }
    return Mail;
};