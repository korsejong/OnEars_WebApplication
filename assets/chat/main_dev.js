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
                <button class="btn btn-secondary btn-play">Play</button>
                <button class="btn btn-secondary btn-stop">Stop</button>
            </div>`
        }else{
            overlayBtn = `<div class="overlay">
                <button class="btn btn-secondary btn-play">Play</button>
                <button class="btn btn-secondary btn-stop">Stop</button>
                <button class="btn btn-secondary btn-trans">Translate</button>
            </div>`
        }
        // view create
		$(this._chatContainerElement).append(`<div class="chat_bx server">
        <div class="img_bx">
        <img src="assets/images/onears.png" width="42" height="42" alt="">
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
        <img src="assets/images/onears.png" width="42" height="42" alt="">
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
                }else{
                }
            }
        }).catch( (result) => {
            console.log(result);
        });
    }
    onerror(){
        
    }
}
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// 브라우저 indexedDB 지원 체크
if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}
const dbName = "user";
const indexedDB = window.indexedDB.open(dbName, 1);
const API_KEY = "https://lu8da3cuo2.execute-api.ap-northeast-2.amazonaws.com/version1";
const apigClient = apigClientFactory.newClient({apikey: API_KEY});
const LANGUAGE = "ko-KR";
const chatContainerElement = $('.chat_group')[0];
const previousMessageCaller = new PreviousMessageCaller();
const userMessageCreater = new UserMessageCreater(chatContainerElement);
const serverMessageCreater = new ServerMessageCreater(chatContainerElement);
const guideMessageCreater = new GuideMessageCreater(chatContainerElement);
let db;
let userId = '';
let userName = '';
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
let width = $(window).width();

// Overlay functions
const sizeTheOverlays = () => {
    $(".overlay").resize().each(function() {
    var h = $(this).parent().outerHeight();
    var w = $(this).parent().outerWidth();
    $(this).css("height", h);
    $(this).css("width", w);
  });
};
sizeTheOverlays();
$(window).resize(function(){
   if($(this).width() != width){
      width = $(this).width();
      sizeTheOverlays();
   }
});
$(document).ready( () => {
    $('.chat_group').niceScroll();
});

// Events
// On click chat audio play button
$(document).on("click",".btn-play",
    function(){
        let chatbox = $(this).parent().parent().parent()[0];
        let index = $(".chat_bx").filter(".server").index(chatbox);
        serverMessage = serverMessages[index];
        serverMessage.playAudio();
    }
);
// On click chat audio stop button
$(document).on("click",".btn-stop",
    function(){
        let chatbox = $(this).parent().parent().parent()[0];
        let index = $(".chat_bx").filter(".server").index(chatbox);
        serverMessage = serverMessages[index];
        serverMessage.stopAudio();
    }
);
// On click chat translate button
$(document).on("click",".btn-trans",
    function(){
        let chatbox = $(this).parent().parent().parent()[0];
        let index = $(".chat_bx").filter(".server").index(chatbox);
        serverMessage = serverMessages[index];
        if(serverMessage.checkSummary()){
            serverMessage.stopAudio();
            serverMessage.changeLanguageSet();
            $(chatbox).html(`
            <div class="img_bx">
            <img src="assets/images/onears.png" width="42" height="42" alt="">
            </div>
            <div class="txt">
            <div class="overlay">
                <button class="btn btn-secondary btn-play">Play</button>
                <button class="btn btn-secondary btn-stop">Stop</button>
                <button class="btn btn-secondary btn-trans">Translate</button>
            </div>
            ${serverMessage.getData()}
            <span class="time">
            ${serverMessage.getDate().str} ${serverMessage.getDate().hours}:${serverMessage.getDate().minutes}
            </span></div>
            `);
        }
    }
);

// Functions
// Submit user information
const submitForm = () => {
    if($('.user-info')[0].checkValidity()) {
        let userInfoArray = $('.user-info').serializeArray();
        userName = userInfoArray[0].value;
        let userInfo = {
            "age": userInfoArray[1].value,
            "gender": userInfoArray[2].value,
            "concern": userInfoArray[3].value
        };
        serverMessages.push(guideMessageCreater.create({data:`환영합니다 ${userName}님! 잠시만 기다려주시면 메세지를 전달해 드릴께요 :)`}));
        connect(userInfo);
        $('#user_info_modal').modal('toggle');
    } else {
        alert("입력한 값을 확인해 주세요.");
    }
};
// Recognize user speech
const recognizeSpeech = () => {
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
            };
            toggleWaitingMessageBox();
            apigClient.chatbotPost(null, request)
            .then((result) => {
                toggleWaitingMessageBox();
                state = result.data.response.state;
                serverMessage = serverMessageCreater.create(result.data.response.message);
                serverMessages.push(serverMessage);
                serverMessage.playAudio();
                if(state.depth == 0 && serverMessage._documentUrl){
                    $('.news').attr('src',serverMessage._documentUrl);
                    $('.news-container').show();
                }
                else if(state.depth != 0){
                    $('.news').attr('src','');
                    $('.news-container').hide();
                }
            }).catch( (result) => {
                console.log(result);
            });
        }
        speechRecognition.onerror = (e) => {
            speechRecognition.stop();
            console.log(e);
        };
    }else{
        alert("지원하지않는 브라우저입니다.");
    }
};
// Connect server
const connect = (userInfo) => {
    toggleWaitingMessageBox();
    if(userId != ''){
        apigClient.connectPost(null, {
            userId: userId
        })
        .then((result)=>{
            toggleWaitingMessageBox();
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
            toggleWaitingMessageBox();
            userId = result.data.userId;
            state = result.data.response.state;
            add({userId:userId,userName:userName});
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
const openModal = () => {
    $('#user_info_modal').modal({backdrop: 'static'});
    $('#user_info_modal').modal();
};
const toggleWaitingMessageBox = () => {
    if($('.waiting-msg')[0] == undefined){
        $(chatContainerElement).append(`
        <div class='chat_bx server waiting-msg'>
        <div class='img_bx'>
            <img src='assets/images/onears.png' width="42px" height="42px" alt>
        </div>
        <div class='txt'>
            <div class="lds-ellipsis" id="loading"><div></div><div></div><div></div><div></div></div>
        </div>
        </div>`)
    }else{
        $('.waiting-msg').remove();
    }
};
// indexedDB functions
indexedDB.onerror = (event) => {
    console.log("log: indexedDB onerror");
    console.log(event);
    alert("재접속 해주시길 바랍니다.");
};
indexedDB.onsuccess = (event) => {
    try{
        db = indexedDB.result;
        readAll();
    }catch(e){
        console.log(e);
    }
};
indexedDB.onupgradeneeded = (event) => {
    try{
        db = event.target.result;
        db.createObjectStore(dbName, { keyPath: "userId"} );
    }catch(e){
        console.log(e);
    }
};
const read = (id) => {
    try{
        let objectStore = db.transaction(dbName).objectStore(dbName);
        let request = objectStore.get(id);
        request.onerror = (event) => {
            console.log("log: read() onerror");
            console.log(event);
            alert("재접속 해주시길 바랍니다.");
        };
        request.onsuccess = (event) => {
            console.log(request.result);
        };
    }
    catch(e){
        console.log(e);
    }
};
const readAll = () => {
    try{
        let objectStore = db.transaction(dbName).objectStore(dbName);
        let request = objectStore.getAll();
        request.onerror = (event) => {
            console.log("log: readAll() onerror");
            console.log(event);
            alert("재접속 해주시길 바랍니다.");
        };
        request.onsuccess = (event) => {
            console.log("log: readAll() onsuccess");
            if(request.result.length == 0){
                openModal();
            }else{
                userId = request.result[0].userId;
                userName = request.result[0].userName;
                serverMessages.push(guideMessageCreater.create({data:`환영합니다 ${userName}님! 잠시만 기다려주시면 메세지를 전달해 드릴께요 :)`}));
                connect();
            }
        }
    }catch(e){
        console.log(e);
    }
};
const add = (user) => {
    try{
        let request = db.transaction([dbName], "readwrite").objectStore(dbName).add(user);
        request.onsuccess = (event) => {
            console.log("log: add() onsuccess");
            console.log(event);
        };
        request.onerror = (event) => {
            console.log("log: add() onerror");
            console.log(event);
        }
    }catch(e){
        console.log(e);
    }
};
const remove = (userId) => {
    try{
        let request = db.transaction([dbName], "readwrite").objectStore(dbName).delete(userId);
        request.onsuccess = (event) => {
            console.log("log: remove() onsuccess");
            console.log(event);
        };
        request.onerror = (event) => {
            console.log("err: remove() onerror");
            console.log(event);
        }
    }
    catch(e){
        console.log(e);
    }
};