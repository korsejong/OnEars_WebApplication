class Message {
	constructor(data){
		this._data = data;
		this._date = new Date();
	}
	getData(){
		return this._data;
	}
	getDate(){
		let customDateForm = {
			hours: this._date.getHours(),
			minutes: this._date.getMinutes(),
			str: "오전"
        }
        // TIME 형식 조정
        if(customDateForm.hours >= 12){
            customDateForm.hours -= 12;
            customDateForm.str = "오후"
        }
		else if(customDateForm.hours < 10){
			customDateForm.hours = "0" + customDateForm.hours;
		}
		if(customDateForm.minutes < 10){
			customDateForm.minutes = "0" + customDateForm.minutes;
		}
		return customDateForm;
	}
	onerror(){
        
    }
}
class ServerMessage extends Message {
    constructor(msg){
        super(msg.data);
        this._audioUrl = msg.audioUrl;
        this._audio = new Audio(this._audioUrl);
        this._documentUrl = msg.documentUrl;
        this._documentData = msg.documentData;
        this._audio.addEventListener('ended',createGuideMessage);
    }
	playAudio(){
        this._audio.play();
    }
    stopAudio(){
        this._audio.pause();
    }
    changeLanguageSet(){
        // 메세지 내용 변경
        // 화면에 내용 변경
        // 오디오 변경    
    }
}
class GuideMessage extends Message {
    constructor(msg){
        super(msg.data);
        this._audioUrl = msg.audioUrl;
        this._audio = new Audio(this._audioUrl);
    }
	playAudio(){
        this._audio.play();
    }
    stopAudio(){
        this._audio.pause();
    }
}
class UserMessage extends Message {
}

class MessageCreater {
	constructor(chatContainerElement){
		this._chatContainerElement = chatContainerElement;
	}
	create(){
        // create message
    }
	onerror(){
        // err
    }
}
class ServerMessageCreater extends MessageCreater {
	constructor(chatContainerElement){
		super(chatContainerElement);
	}
	create(msg){
		let serverMessage = new ServerMessage(msg);
        
        // view create
		$(this._chatContainerElement).append(`<div class="chat_bx">
        <div class="img_bx">
        <img src="assets/images/radio-122x128.png" width="42" height="42" alt="">
        </div>
		<div class="txt">${serverMessage.getData()}<span class="time">${serverMessage.getDate().str} ${serverMessage.getDate().hours}:${serverMessage.getDate().minutes}</span></div>
		</div>`);
		$(this._chatContainerElement).scrollTop(this._chatContainerElement.scrollHeight);

        return serverMessage;
    }
}
class GuideMessageCreater extends MessageCreater {
	constructor(chatContainerElement){
        super(chatContainerElement);
    }
	create(msg){
		let guideMessage = new GuideMessage(msg);
        
        // view create
		$(this._chatContainerElement).append(`<div class="chat_bx">
        <div class="img_bx">
        <img src="assets/images/radio-122x128.png" width="42" height="42" alt="">
        </div>
		<div class="txt">${guideMessage.getData()}<span class="time">${guideMessage.getDate().str} ${guideMessage.getDate().hours}:${guideMessage.getDate().minutes}</span></div>
		</div>`);
		$(this._chatContainerElement).scrollTop(this._chatContainerElement.scrollHeight);
        
        return guideMessage;
    }
}
class UserMessageCreater extends MessageCreater {
	constructor(chatContainerElement){
		super(chatContainerElement);
	}
	create(data){
		let userMessage = new UserMessage(data);
        
        // view create
		$(this._chatContainerElement).append(`<div class="chat_bx me">
		<div class="txt white">${userMessage.getData()}<span class="time">${userMessage.getDate().str} ${userMessage.getDate().hours}:${userMessage.getDate().minutes}</span></div>
		</div>`);
		$(this._chatContainerElement).scrollTop(this._chatContainerElement.scrollHeight);
        
        return userMessage;
	}
}

class SpeechRecognition extends webkitSpeechRecognition {
    construct(language){
        this.continuous = false;
        this.interimResults = false;
        this.lang = language;
    }
}

class PreviousMessageCaller {
    construct(id){
        this._id = id;
    }
    read(){
        
    }
    onerror(){
        
    }
}

const API_KEY = "https://lu8da3cuo2.execute-api.ap-northeast-2.amazonaws.com/version1";
const apigClient = apigClientFactory.newClient({apikey: API_KEY});
const LANGUAGE = "ko-KR";
const chatContainerElement = $('.chat_group')[0];

const previousMessageCaller = new PreviousMessageCaller();
const userMessageCreater = new UserMessageCreater(chatContainerElement);
const serverMessageCreater = new ServerMessageCreater(chatContainerElement);
const guideMessageCreater = new GuideMessageCreater(chatContainerElement);

let userId = ''
let state = {
    depth: 0,
    mainCategory: 'news',
    subCategory: '',
    title: '',
    url: ''
};

let userMessages = []
let serverMessages = []
let userMessage;
let serverMessage;

// Event

$(document).ready( () => {
    console.log('READY');
    $('.chat_group').niceScroll();
    // 사용자 정보 입력 받은 내용 서버로 전송
    // /connect POST 전송
    apigClient.connectPost(null, {
        userId: '',
        age: '18',
        gender: 'M',
        concern: '정치'
    })
    .then((result)=>{
        console.log(result);
        userId = result.data.userId;
        state = result.data.response.state;
        serverMessage = serverMessageCreater.create(result.data.response.message);
        serverMessages.push(serverMessage);
        serverMessage.playAudio();
    }).catch( function(result){
        console.log(result);
    });
});

$('.btn_mic').click(
    async () => {
        console.log('MIC');
        // 사용자 음성 입력
        if (window.hasOwnProperty('webkitSpeechRecognition')) {
            let speechRecognition = new SpeechRecognition(LANGUAGE);
            speechRecognition.start();
            speechRecognition.onresult = async function(e){
                speechRecognition.stop();
                userMessage = userMessageCreater.create(e.results[0][0].transcript, LANGUAGE);
                let request = {
                    userId: userId,
                    state: state,
                    message: {
                        data: userMessage.getData()
                    }
                }
                console.log(request);

                // /chatbot POST 전송
                apigClient.chatbotPost(null, request)
                .then((result)=>{
                    console.log(result);
                    state = result.data.response.state;
                    serverMessage = serverMessageCreater.create(result.data.response.message);
                    serverMessages.push(serverMessage);
                    serverMessage.playAudio();
                }).catch( function(result){
                    console.log(result);
                });
            }
            speechRecognition.onerror = function(e) {
                speechRecognition.stop();
                console.log("err");
            }
        }else{
            alert("지원하지않는 브라우저입니다.");
        }
    }
);

// Function

const createGuideMessage = () => {
    let guide = [
            {
                data:"자세한 내용을 들으시려면 '확인', 다음 뉴스를 보시려면 '다음'이라고 말씀해주세요.",
                audioUrl:"https://test-audioposts.s3.ap-northeast-2.amazonaws.com/guide1.mp3"
            },{
                data:"뉴스를 계속해서 들려드릴까요?",
                audioUrl:"https://test-audioposts.s3.ap-northeast-2.amazonaws.com/guide2.mp3"
            }];
    if(state.depth == 2){
        let guideMessage = guideMessageCreater.create(guide[0]);
        serverMessages.push(guideMessage);
        guideMessage.playAudio();
    }else if(state.depth == 0){
        let guideMessage = guideMessageCreater.create(guide[1]);
        serverMessages.push(guideMessage);
        guideMessage.playAudio();
    }
}
// TEST FUNCTION
const requestTestFunction = (message) => {
    console.log('TEST FUNCTION CALL')
    let request = {
        userId: userId,
        state: state,
        message: {
            data: message
        }
    }
    console.log(request);
    apigClient.chatbotPost(null, request)
    .then((result)=>{
        console.log(result);
        state = result.data.response.state;
        msg = serverMessageCreater.create(result.data.response.message);
        msg.playAudio();
    }).catch( function(result){
        console.log(result);
    });
}