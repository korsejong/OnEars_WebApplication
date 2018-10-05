const db = require('./config/database');

exports.handler = async (event) => {
    let userId = event.userId;
    let user;
    let audio;
    let messages = [];
    let message = {};
    let response = [];
    await db.sequelize.sync();
    try{
        user = await db.User.findById(userId);
        messages = await user.getMessages({where: {deleted_flag:false}, order:[['createdAt','DESC']], limit: 5});
        // messages = await db.Message.findAll({order:[['createdAt','DESC']], limit: 5})
        for(var m of messages){
            audio = await m.getAudio();
            let doc = await db.Document.findOne({where: {document_url: m.document_url}});
            message = {
                data: m.data,
                date: m.createdAt,
                audioUrl: null,
                documentUrl: m.document_url,
                documentData:{
                    text: null,
                    korSummary: null,
                    enSummary: null,
                    korAudioUrl: null,
                    enAudioUrl: null,
                }
            }
            if(audio){
                message.audioUrl = audio.kor_audio_url;
                message.documentData.korAudioUrl = audio.kor_audio_url;
                message.documentData.enAudioUrl = audio.en_audio_url;
            }
            if(doc){
                message.documentData.text = doc.text;
                message.documentData.korSummary = doc.kor_summary;
                message.documentData.enSummary = doc.en_summary;
            }
            response.push(message);
        }
        return response;
    } catch (err) {
        throw new Error(err);
    }
}