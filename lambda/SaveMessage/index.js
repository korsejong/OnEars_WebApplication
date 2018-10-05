const db = require('./config/database');
const Op = db.sequelize.Op;
exports.handler = async (event) => {
    await db.sequelize.sync();
    let message;
    let user;
    let audio;
    let flag = event.type == 'user' ? 1 : 0;
    let documentUrl = event.message.documentUrl ? event.message.documentUrl : null;
    console.log(typeof(event.message.data))
    try {
        user = await db.User.findById(event.userId);
        message = await db.Message.create({
            data: event.message.data,
            document_url: documentUrl,
            from_flag: flag,
        });
        if(event.message.audioUrl){
            audio = await db.Audio.findOne({where:{
                [Op.or]: [{kor_audio_url: event.message.audioUrl}, {en_audio_url: event.message.audioUrl}]
            }});
            await message.setAudio(audio);
        }
        await user.addMessage(message);
    } catch (err) {
        throw new Error(err);
    }
    return {user: user,message: message,audio: audio};
};
