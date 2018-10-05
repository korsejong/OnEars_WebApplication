const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET = 'test-audioposts';

const saveFileToS3 = (data,filename) => {
    let params = {
        ACL: 'public-read',
        Body: data,
        Bucket: BUCKET,
        Key: filename,
    };
    let options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    return s3.upload(params, options).promise().then( (data,err) => {
        if(err) throw err;
        else return data;
    })
}

module.exports = saveFileToS3;