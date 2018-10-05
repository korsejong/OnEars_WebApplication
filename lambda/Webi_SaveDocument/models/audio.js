module.exports = (sequelize, DataTypes) => {
    const Audio = sequelize.define('audio', {
        audio_id_pk : { 
            type: DataTypes.UUID, 
            primaryKey: true, 
            defaultValue: DataTypes.UUIDV1 
        },
        kor_audio_url: {
            type: DataTypes.STRING
        },
        en_audio_url: {
            type: DataTypes.STRING
        },
        kor_voice_name: {
            type: DataTypes.STRING,
            defaultValue: 'Seoyeon'
        },
        en_voice_name: {
            type: DataTypes.STRING,
            defaultValue: 'Seoyeon'
        },
        deleted_flag : { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        }
    },{
        timestamps: true,
        tableName: 'audio_table'
    });
    return Audio;
};