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
            mainCategory: 'news',
            subCategory: null,
            title: null,
            url: null,
        }
    };
    
    let userId = event.userId;
    let payload = {
        userId: userId
    };
    let params = {
        FunctionName: '',
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: ''
    }
    let eventParams = {
        FunctionName: '',
        InvocationType: 'Event',
        Payload: ''
    };
    let result;
    
    // check user
    params.FunctionName = 'Webi_CheckUserId';
    params.Payload = JSON.stringify(payload);
    result = await lambda.invoke(params).promise();
    let isUser = JSON.parse(result.Payload);
    if(isUser){
        params.FunctionName = 'Webi_GetUserType';
        params.Payload = JSON.stringify(payload);
        result = await lambda.invoke(params).promise();
        let userType = JSON.parse(result.Payload);
        if(userType){
            response.state.depth++;
            response.message.data = userType;
        }
    }else{
        payload = {
            age: event.age,
            gender: event.gender,
            concern: event.concern
        };
        params.FunctionName = 'Webi_CreateUser';
        params.Payload = JSON.stringify(payload);
        result = await lambda.invoke(params).promise();
        userId = JSON.parse(result.Payload);
        payload.userId = userId;
        
        console.log(response.state.depth)
        response.state.depth++;
        response.message.data = event.concern;
        console.log(response.state.depth)
    }
    
    // create message
    payload = {
        userId: userId,
        state: response.state,
        message: response.message
    };
    params.FunctionName = 'Webi_CreateMessageOfNewsType';
    params.Payload = JSON.stringify(payload);
    result = await lambda.invoke(params).promise();
    response = JSON.parse(result.Payload);
    
    // save message
    payload = {
        type: 'server',
        userId: userId,
        message: response.message
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