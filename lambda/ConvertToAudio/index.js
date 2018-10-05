const createPollyAudio = require('./createPollyAudio');
const saveFileToS3 = require('./saveFileToS3');
const uuidv1 = require('uuid/v1');

exports.handler = async (event) => {
    let text = event.text;
    let voiceId = event.voiceId ? event.voiceId : 'Seoyeon';
    // let voiceId = 'Seoyeon';
    // let filename = event.filename ? event.filename : uuidv1() + '.mp3';
    let filename = uuidv1() + '.mp3';
    // let type = event.type ? event.type : 'file';
    let type = 'file';
    try{
        const audio = await createPollyAudio(text,voiceId);
        if(type == 'file'){
            const data = await saveFileToS3(audio.AudioStream, filename);
            return data.Location;
        }
        else if(type == 'stream'){
            return audio.AudioStream;
        }
        else throw { errorCode: 400, error: 'Wrong type for output provided.' };
    }
    catch(e){
        if(e.errorCode && e.error) return e.error;
        else return e;
    }
};
