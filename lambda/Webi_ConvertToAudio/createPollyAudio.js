const AWS = require('aws-sdk');
const polly = new AWS.Polly();

const createPollyAudio = (text, voiceId) => {
    const params = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: voiceId,
    }
    return polly.synthesizeSpeech(params).promise().then( audio => {
        if(audio.AudioStream instanceof Buffer) return audio;
        else throw 'AudioStream is not a Buffer.';
    })
};

module.exports = createPollyAudio;