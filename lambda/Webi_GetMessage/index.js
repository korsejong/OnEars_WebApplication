const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    let response = {
        message: {
            data: null,
            date: null,
            audioUrl: null,
            documentUrl: null,
            documentData:{
                text: null,
                korSummary: null,
                enSummary: null,
                korAudioUrl: null,
                enAudioUrl: null,
            }
        },
        state: {
            depth: 0,
            mainCategory: null,
            subCategory: null,
            title: null,
            url: null,
        }
    };
    let userMessage = event.message;
    let state = {
        depth: event.state.depth,
        // mainCategory: event.state.mainCategory,
        mainCategory: 'news',
        subCategory: event.state.subCategory,
        title: event.state.title,
        url: event.state.url
    };
    let result;
    let payload = {};
    let params = {
        FunctionName: '',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: ''
    };
    let eventParams = {
        FunctionName: '',
        InvocationType: 'Event',
        Payload: ''
    };
    let userId = event.userId;
    
    payload = {
        type: 'user',
        userId: userId,
        message: userMessage
    };
    eventParams.FunctionName = 'Webi_SaveMessage';
    eventParams.Payload = JSON.stringify(payload);
    lambda.invoke(eventParams, (err,data) => {
        if(err){
            console.log(err);
        }else{
            console.log(data);
        }
    });
    
    if(!state.mainCategory){
        if(userMessage.data == '뉴스') state.mainCategory = 'news';
        else if(userMessage.data == '메일') state.mainCategory = 'mail';
    }
    switch(state.mainCategory){
        case 'news':
            payload = {
                state: state,
                message: userMessage,
                userId: userId
            };
            params.FunctionName = 'Webi_CreateMessageOfNewsType';
            params.Payload = JSON.stringify(payload);
            result = await lambda.invoke(params).promise();
            response = JSON.parse(result.Payload);
            break;
        case 'mail':
            payload = {
                state: state,
                message: userMessage,
                userId: userId
            };
            params.FunctionName = 'Webi_CreateMessageOfMailType';
            params.Payload = JSON.stringify(payload);
            result = await lambda.invoke(params).promise();
            response = JSON.parse(result.Payload);
            break;
        default:
            params.FunctionName = 'Webi_CreateDefaultMessage';
            params.Payload = '';
            result = await lambda.invoke(params).promise();
            response = JSON.parse(result.Payload);
            break;
    }
    
    payload = {
        type: 'server',
        userId: userId,
        message: response.message,
    };
    eventParams.FunctionName = 'Webi_SaveMessage';
    eventParams.Payload = JSON.stringify(payload);
    lambda.invoke(eventParams, (err,data) => {
        if(err){
            console.log(err);
        }else{
            console.log(data);
        }
    });

    return {userId: userId, response: response};
        
};
