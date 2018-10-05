module.exports = (sequelize, DataTypes) => {
    const Document = sequelize.define('document', {
        document_id_pk : { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue: DataTypes.UUIDV1 
        },
        document_url: {
            type: DataTypes.STRING
        },
        main_category: {
            type: DataTypes.STRING
        },
        sub_category: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING
        },
        text:{
            type: DataTypes.STRING
        },
        en_summary: {
            type: DataTypes.TEXT
        },
        kor_summary: {
            type: DataTypes.TEXT
        },
        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        deleted_flag : { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        }
    },{
        timestamps: true,
        tableName: 'document_table'
    });
    Document.associate = models => {
        Document.belongsTo(models.Audio, {foreignKey: 'audio_id_fk'});
        Document.belongsToMany(models.User, {
            through: 'history_table',
            as: 'users'
        });
    }
    return Document;
};