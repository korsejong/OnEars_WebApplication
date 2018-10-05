const db = require('./config/database');

exports.handler = async (event) => {
    await db.sequelize.sync();
    try{
        let audio;
        if(event.korAudioUrl && event.enAudioUrl){
            audio = await db.Audio.create({
                kor_audio_url: event.korAudioUrl,
                en_audio_url: event.enAudioUrl,
                en_voice_name: 'Joanna'
            });
        }else if(event.korAudioUrl){
            audio = await db.Audio.create({
                kor_audio_url: event.korAudioUrl
            });
        }else if(event.enAudioUrl){
            audio = await db.Audio.create({
                en_audio_url: event.enAudioUrl,
                en_voice_name: 'Joanna'
            });
        }else{
            return "check audio url"
        }
        return audio;
    } catch (err) {
        throw new Error(err);
    }
}