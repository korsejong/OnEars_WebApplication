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
        this._language = 'en';
    }
	playAudio(){
        this._audio.play();
    }
    stopAudio(){
        this._audio.pause();
    }
    changeLanguageSet(){
        // 메세지 내용 변경
        if(this._language == 'en'){
            this._language = 'kr';
            this._data = this._documentData.korSummary;
            this._audioUrl = this._documentData.korAudioUrl;
            this._audio = new Audio(this._audioUrl);  
        }else{
            this._language = 'en';
            this._data = this._documentData.enSummary;
            this._audioUrl = this._documentData.enAudioUrl;
            this._audio = new Audio(this._audioUrl);  
        }
    }
    checkSummary(){
        if(this._documentData.korSummary == null || this._documentData.enSummary == null) return false;
        return true;
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
    checkSummary(){
        return false;
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
        let overlayBtn;
        if(msg.documentData.korSummary == null){
            overlayBtn = `<div class="overlay">
                <button class="btn btn-danger btn-play">Play</button>
                <button class="btn btn-danger btn-stop">Stop</button>
            </div>`
        }else{
            overlayBtn = `<div class="overlay">
                <button class="btn btn-danger btn-play">Play</button>
                <button class="btn btn-danger btn-stop">Stop</button>
                <button class="btn btn-danger btn-trans">Translate</button>
            </div>`
        }
        // view create
		$(this._chatContainerElement).append(`<div class="chat_bx server">
        <div class="img_bx">
        <img src="assets/images/radio-122x128.png" width="42" height="42" alt="">
        </div>
        <div class="txt">
        ${overlayBtn}
        ${serverMessage.getData()}<span class="time">${serverMessage.getDate().str} ${serverMessage.getDate().hours}:${serverMessage.getDate().minutes}</span></div>
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
		$(this._chatContainerElement).append(`<div class="chat_bx server">
        <div class="img_bx">
        <img src="assets/images/radio-122x128.png" width="42" height="42" alt="">
        </div>
        <div class="txt">
        ${guideMessage.getData()}<span class="time">${guideMessage.getDate().str} ${guideMessage.getDate().hours}:${guideMessage.getDate().minutes}</span></div>
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
    setUserId(userId){
        this._userId = userId;
    }
    read(serverMessageCreater,userMessageCreater,serverMessages,userMessages){
        apigClient.historyPost(null, {"userId" : this._userId})
        .then((result) => {
            for(let msg of result.data){
                if(msg.from_flag){
                    // user message
                    // userMessages.push(userMessageCreater.create(msg.data, LANGUAGE));
                }else{
                    // server message
                    serverMessages.push(serverMessageCreater.create(msg));
                }
            }
        }).catch( (result) => {
            console.log(result);
        });
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

let userMessages = [];
let serverMessages = [];
let userMessage = null;
let serverMessage = null;

// Event

$(document).ready( () => {
    console.log('READY');
    $('.chat_group').niceScroll();
    $('#user_info_modal').modal({backdrop: 'static'});
    $('#user_info_modal').modal();  
});

$('.form-submit').click(
    () => {
        if($('.user-info')[0].checkValidity()) {
            let userInfoArray = $('.user-info').serializeArray();
            let userInfo = {
                "age": userInfoArray[1].value,
                "gender": userInfoArray[2].value,
                "concern": userInfoArray[3].value
            };
            connect(userInfo);
            serverMessages.push(guideMessageCreater.create({data:`환영합니다 ${userInfoArray[0].value}님! 잠시만 기다려주시면 메세지를 전달해 드릴께요 :)`}));
            $('#user_info_modal').modal('toggle');
        } else {
            alert("입력한 값을 확인해 주세요.");
        }
    }
)

$('.btn_mic').click(
    () => {
        // 사용자 음성 입력
        if (window.hasOwnProperty('webkitSpeechRecognition')) {
            let speechRecognition = new SpeechRecognition(LANGUAGE);
            speechRecognition.start();
            speechRecognition.onresult = (e) => {
                speechRecognition.stop();
                userMessage = userMessageCreater.create(e.results[0][0].transcript, LANGUAGE);
                userMessages.push(userMessage);
                let request = {
                    userId: userId,
                    state: state,
                    message: {
                        data: userMessage.getData()
                    }
                }
                // console.log(request);

                // /chatbot POST 전송
                apigClient.chatbotPost(null, request)
                .then((result) => {
                    console.log(result);
                    state = result.data.response.state;
                    serverMessage = serverMessageCreater.create(result.data.response.message);
                    serverMessages.push(serverMessage);
                    serverMessage.playAudio();
                    if(state.depth==0 && serverMessage._documentUrl){
                        $('.news').attr('src',serverMessage._documentUrl);
                        $('.news-container').show();
                    }
                    else if(state.depy!= 0){
                        $('.news').attr('src','');
                        $('.news-container').hide();
                    }
                }).catch( (result) => {
                    console.log(result);
                });
            }
            speechRecognition.onerror = (e) => {
                speechRecognition.stop();
                console.log("err");
            }
        }else{
            alert("지원하지않는 브라우저입니다.");
        }
    }
);
// Play
$(document).on("click",".btn-play",
    function(){
        let chatbox = $(this).parent().parent().parent()[0];
        let index = $(".chat_bx").filter(".server").index(chatbox);
        
        //server message
        serverMessage = serverMessages[index];
        serverMessage.playAudio();
    }
);

// Stop
$(document).on("click",".btn-stop",
    function(){
        let chatbox = $(this).parent().parent().parent()[0];
        let index = $(".chat_bx").filter(".server").index(chatbox);
        
        //server message
        serverMessage = serverMessages[index];
        serverMessage.stopAudio();
    }
);

// Translate
$(document).on("click",".btn-trans",
    function(){
        let chatbox = $(this).parent().parent().parent()[0];
        let index = $(".chat_bx").filter(".server").index(chatbox);
        
        //server message
        serverMessage = serverMessages[index];
        if(serverMessage.checkSummary()){
            serverMessage.changeLanguageSet();
            $(chatbox).html(`
            <div class="img_bx">
            <img src="assets/images/radio-122x128.png" width="42" height="42" alt="">
            </div>
            <div class="txt">
            <div class="overlay">
                <button class="btn btn-danger btn-play">Play</button>
                <button class="btn btn-danger btn-stop">Stop</button>
                <button class="btn btn-danger btn-trans">Translate</button>
            </div>
            ${serverMessage.getData()}<span class="time">${serverMessage.getDate().str} ${serverMessage.getDate().hours}:${serverMessage.getDate().minutes}</span></div>
            `);
        }
    }
);


// Function
const connect = (userInfo) => {
    // 사용자 정보 입력 받은 내용 서버로 전송
    // /connect POST 전송
    if(userId != ''){
        apigClient.connectPost(null, {
            userId: userId
        })
        .then((result)=>{
            // console.log(result);
            userId = result.data.userId;
            state = result.data.response.state;
            serverMessage = serverMessageCreater.create(result.data.response.message);
            serverMessages.push(serverMessage);
            serverMessage.playAudio();
        }).catch((result)=>{
            console.log(result);
        });
    }
    else{
        apigClient.connectPost(null, {
            userId: userId,
            age: userInfo.age,
            gender: userInfo.gender,
            concern: userInfo.concern
        })
        .then((result)=>{
            // console.log(result);
            userId = result.data.userId;
            state = result.data.response.state;
            serverMessage = serverMessageCreater.create(result.data.response.message);
            serverMessages.push(serverMessage);
            serverMessage.playAudio();
        }).catch((result)=>{
            console.log(result);
        });
    }
};
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
};

// overlay functions
const sizeTheOverlays = () => {
    $(".overlay").resize().each(function() {
    var h = $(this).parent().outerHeight();
    var w = $(this).parent().outerWidth();
    $(this).css("height", h);
    $(this).css("width", w);
  });
};

sizeTheOverlays();

let width = $(window).width();
$(window).resize(function(){
   if($(this).width() != width){
      width = $(this).width();
      sizeTheOverlays();
   }
});

// TEST FUNCTION
const selectMessageTestFunction = (type,idx) => {
    if(type == "server"){
        console.log(serverMessages[idx]);
    }else if(type == "user"){
        console.log(userMessages[idx]);
    }
};
const sttTestFuncton = () => {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
        let speechRecognition = new SpeechRecognition(LANGUAGE);
        speechRecognition.start();
        speechRecognition.onresult = async function(e){
            speechRecognition.stop();
            // console.log(e.results[0][0].transcript);
        }
        speechRecognition.onerror = function(e) {
            speechRecognition.stop();
            // console.log("err");
        }
    }else{
        alert("지원하지않는 브라우저입니다.");
    }
};
const requestTestFunction = (message) => {
    console.log('TEST FUNCTION CALL')
    userMessage = userMessageCreater.create(message, LANGUAGE);
    userMessages.push(userMessage);
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
        serverMessage = serverMessageCreater.create(result.data.response.message);
        serverMessages.push(serverMessage);
        serverMessage.playAudio();
        if(state.depth==0 && serverMessage._documentUrl){
            $('.news').attr('src',serverMessage._documentUrl);
            $('.news-container').show();
        }
        else if(state.depy!= 0){
            $('.news').attr('src','');
            $('.news-container').hide();
        }
    }).catch((result)=>{
        console.log(result);
    });
};