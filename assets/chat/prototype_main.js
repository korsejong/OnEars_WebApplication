const API_ENDPOINT = "API";
const VOICE_KOREA = "Seoyeon";

// Element event
$(document).ready(function(){
  $('.chat_group').niceScroll();
});

// Main function
async function startPolly(text) {
  let pollyAudio = new PollyAudio(text,VOICE_KOREA);
  let containerElement = $('.chat_group')[0];
  let customMessage = new CustomMessage(text,"polly");

  await pollyAudio.createPost();
  alert("wait...");
  // server code 수정 필요
  await pollyAudio.createAudio();

  $(containerElement).append(`<div class="chat_bx"><div class="img_bx">
  <img src="assets/images/radio-122x128.png" width="42" height="42" alt="">
  </div>
  <div class="txt">${customMessage.getMessage().data}<span class="time">${customMessage.getDate().str} ${customMessage.getDate().hours}:${customMessage.getDate().minutes}</span></div>
  </div>`);
  $(containerElement).scrollTop(containerElement.scrollHeight);

  pollyAudio.play();
}
function startDictation() {
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
    let recognition = new webkitSpeechRecognition();
    let containerElement = $('.chat_group')[0];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "ko-KR";
    recognition.start();
    recognition.onresult = function(e) {
      recognition.stop();
      let customMessage = new CustomMessage(e.results[0][0].transcript,"user");
      $(containerElement).append(`<div class="chat_bx me">
      <div class="txt white">${customMessage.getMessage().data}<span class="time">${customMessage.getDate().str} ${customMessage.getDate().hours}:${customMessage.getDate().minutes}</span></div>
      </div>`);
      $(containerElement).scrollTop(containerElement.scrollHeight);
    };
    recognition.onerror = function(e) {
      recognition.stop();
    }
  }
}

// Class
class CustomMessage {
  constructor(data, from){
    let date = new Date()
    this._date = {
      hours: date.getHours(),
      minutes: date.getMinutes(),
      str: "오전"
    };
    this._msg = {
      from: from,
      data: data
    };
    if(this._date.hours == 12) this._date.str = "오후"
    else if(this._date.hours > 12){
      this._date.hours -= 12;
      this._date.str = "오후"
    }
  }
  getMessage(){
    return this._msg;
  }
  getDate(){
    return this._date;
  }
}

class PollyAudio {
  constructor(text,voice){
    if(voice==null) voice = VOICE_KOREA;
    this._data = {
      "voice" : voice,
      "text" : text
    };
    this._postId = null;
    this._audio = null;
  }
  async createPost(){
    this._postId = await $.ajax({
      url: API_ENDPOINT,
      type: 'POST',
      data:  JSON.stringify(this._data)  ,
      contentType: 'application/json; charset=utf-8',
      success: function (response) {
        console.log("PollyAudio ajax POST response : " + response);
      },
      error: function () {
        console.log("PollyAudio ajax POST ERROR");
      }
    });
  }
  async createAudio(){
    let audioInformation = await $.ajax({
      url: API_ENDPOINT + '?postId='+this._postId,
      type: 'GET',
      success: function (response) {
        if (typeof response[0]['url'] === "undefined") {
          console.log("PollyAudio ajax GET response : data[url] undefined");
        }
        console.log("PollyAudio ajax GET response : " + response)
      },
      error: function () {
          console.log("PollyAudio ajax GET ERROR");
      }
    });
    this._audio = new Audio(audioInformation[0]['url']);
  }
  getPostId(){
    return this._postId;
  }
  getAudio(){
    return this._audio;
  }
  getText(){
    return this._data.text;
  }
  play(){
    this._audio.play();
  }
}


//Test function
async function testFunction_startPolly(text,voice){
  let pollyAudio = new PollyAudio(text,voice);
  await pollyAudio.createPost();
  alert("wait...");
  // server code 수정 필요
  await pollyAudio.createAudio();
  console.log(pollyAudio.getAudio());
  pollyAudio.play();
}
function testFunction_startDictation(language){
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
    let recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.start();
    recognition.onresult = function(e) {
      console.log(e.results[0][0].transcript);
    };
    recognition.onerror = function(e) {
      console.log(e);  
      recognition.stop();
    }
  }
}
function testFunction_addChatBoxMe(text) {
  let containerElement = $('.chat_group')[0];
  let customMessage = new CustomMessage(text,"user");
  console.log(customMessage);
  $(containerElement).append(`<div class="chat_bx me">
            <div class="txt white">${customMessage.getMessage().data}<span class="time">${customMessage.getDate().str} ${customMessage.getDate().hours}:${customMessage.getDate().minutes}</span></div>
            </div>`);
  console.log(containerElement.scrollHeight);
  $(containerElement).scrollTop(containerElement.scrollHeight); 
}
function testFunction_addChatBoxPolly(text) {
  let containerElement = $('.chat_group')[0];
  let customMessage = new CustomMessage(text,"polly");
  console.log(customMessage);
  $(containerElement).append(`<div class="chat_bx">
            <div class="txt">${customMessage.getMessage().data}<span class="time">${customMessage.getDate().str} ${customMessage.getDate().hours}:${customMessage.getDate().minutes}</span></div>
            </div>`);
  console.log(containerElement.scrollHeight);
  $(containerElement).scrollTop(containerElement.scrollHeight); 
}
