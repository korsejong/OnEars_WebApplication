const request = require('request');
const AWS = require('aws-sdk');
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const api_url = process.env.API_URL;

exports.handler =  function (event, context, callback) {
    let query = event.text;
    let result = '';
    let options = {
        url: api_url,
        form: { 'source': 'en', 'target': 'ko', 'text': query },
        headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
    };

    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let jsonBody = JSON.parse(body);
            result = jsonBody.message.result.translatedText;
            callback(null, result);
        } else {
            console.log("error");
            console.log(error);
            callback(error);
        }
    });
};