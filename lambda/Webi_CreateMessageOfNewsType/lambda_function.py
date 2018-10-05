import json
import datetime
from boto3 import client as boto3_client
lambda_client = boto3_client('lambda', region_name='ap-northeast-2')

class AudioController(object):
    def __init__(self):
        self.payload = {
            'text': ''
        }
        self.string_result = ''
        self.result = None
        self.korAudioUrl = ''
        self.enAudioUrl = ''
        self.audio = None
    def convertToSingleAudio(self,text):
        self.payload  = {
            'text': text,
            'voiceId': 'Joanna'
        }
        self.result = lambda_client.invoke(
            FunctionName='Webi_ConvertToAudio',
            InvocationType='RequestResponse',
            Payload=json.dumps(self.payload)
        )
        self.string_result = self.result['Payload'].read().decode('utf-8')
        self.enAudioUrl = json.loads(self.string_result)
        self.saveAudio()
        return [self.enAudioUrl,self.audio['audio_id_pk']]
    def convertToAudio(self,korText,enText):
        self.payload  = {
            'text': korText
        }
        self.result = lambda_client.invoke(
            FunctionName='Webi_ConvertToAudio',
            InvocationType='RequestResponse',
            Payload=json.dumps(self.payload)
        )
        self.string_result = self.result['Payload'].read().decode('utf-8')
        self.korAudioUrl = json.loads(self.string_result)
        
        self.payload  = {
            'text': enText,
            'voiceId': 'Joanna'
        }
        self.result = lambda_client.invoke(
            FunctionName='Webi_ConvertToAudio',
            InvocationType='RequestResponse',
            Payload=json.dumps(self.payload)
        )
        self.string_result = self.result['Payload'].read().decode('utf-8')
        self.enAudioUrl = json.loads(self.string_result)
        
        self.saveAudio()
        return [self.korAudioUrl,self.enAudioUrl,self.audio['audio_id_pk']]
    def saveAudio(self):
        self.payload = {
            'korAudioUrl': self.korAudioUrl,
            'enAudioUrl': self.enAudioUrl
        }
        self.result = lambda_client.invoke(
            FunctionName='Webi_SaveAudio',
            InvocationType='RequestResponse',
            Payload=json.dumps(self.payload)
        )
        self.string_result = self.result['Payload'].read().decode('utf-8')
        self.audio = json.loads(self.string_result)
        return self.audio
        
def lambda_handler(event, context):
    expectedAnswerList = {
        'next': ['다음','다음뉴스','다음 뉴스'],
        'cancel': ['취소'],
        'confirm': ['확인','읽어','읽어줘'],
    }
    subCategories = ['정치','경제','사회','문화','세계','기술','인기']
    response = {
        'message': {
            'data': None,
            'date': None,
            'audioUrl': None,
            'documentUrl': None,
            'documentData':{
                'text': None,
                'korSummary': None,
                'enSummary': None,
                'korAudioUrl': None,
                'enAudioUrl': None,
            }
        },
        'state': {
            'depth': 0,
            'title': None,
            'mainCategory': None,
            'subCategory': None,
            'url': None,
        }
    }
    state = event['state']
    userMessage = event['message']
    userId = event['userId']
    audioController = AudioController()
    
    # check user message
    state['depth'] += 1
    if state['depth'] == 1:
        state['depth'] = 1
    elif state['depth'] == 2:
        if userMessage['data'] in subCategories:
            state['subCategory'] = userMessage['data']
        else:
            state['depth'] = 1
    elif state['depth'] == 3:
        if userMessage['data'] in expectedAnswerList['confirm']:
            state['depth'] = 3
        elif userMessage['data'] in expectedAnswerList['next']:
            state['depth'] = 2
        elif userMessage['data'] in expectedAnswerList['cancel']:
            state['depth'] = 1
        else:
            print('err')
            # 못알아들음
    
    # create server message
    if state['depth'] == 1:
        response['message']['data'] = ' '.join(subCategories) + ' 중 원하시는 메뉴를 말씀해 주세요.'
        response['message']['audioUrl'] = 'https://test-audioposts.s3.ap-northeast-2.amazonaws.com/default.mp3'
    elif state['depth'] == 2:
        # crawling news list
        payload = {
            'category': state['subCategory'],
            'url': state['url']
        }
        result = lambda_client.invoke(
            FunctionName='Webi_GetListOfNewsType',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        string_result = result['Payload'].read().decode('utf-8')
        newsList = json.loads(string_result)
        
        if newsList is not None:
            resMessage = newsList['title'] + " [ " + newsList['company'] + " " + newsList['date'].split('T')[0] + " ]"
            # response['message']['data'] = newsList['title']
            # response['message']['audioUrl'],audioId = audioController.convertToSingleAudio(newsList['title'])
            
            response['message']['data'] = resMessage
            response['message']['audioUrl'],audioId = audioController.convertToSingleAudio(resMessage)
            
            state['title'] = newsList['title']
            state['url'] = newsList['url']
        else:
            errMessage = '더이상 표시할 내용이 없습니다.'
            response['message']['data'] = errMessage
            response['message']['audioUrl'],audioId = audioController.convertToSingleAudio(errMessage)
            state['depth'] = 0
            state['url'] = None
            state['title'] = None
            state['subCategory'] = None
            
    elif state['depth'] == 3:
        # check document
        payload = {
            'url': state['url']
        }
        result = lambda_client.invoke(
            FunctionName='Webi_GetSavedDataOfUrl',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        string_result = result['Payload'].read().decode('utf-8')
        doc = json.loads(string_result)
        if doc is None:
            # crwaling
            payload = {
                'url': state['url']
            }
            result = lambda_client.invoke(
                FunctionName='Webi_GetTextDataOfUrl',
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            string_result = result['Payload'].read().decode('utf-8')
            news = json.loads(string_result)
            # translate
            payload = {
                'text': news['summary']
            }
            result = lambda_client.invoke(
                FunctionName='Webi_EngToKorWithPapago',
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            string_result = result['Payload'].read().decode('utf-8')
            korSummary = json.loads(string_result)
            
            response['message']['documentData']['text'] = news['text']
            response['message']['documentData']['enSummary'] = news['summary']
            response['message']['documentData']['korSummary'] = korSummary
            
            response['message']['documentData']['korAudioUrl'], response['message']['documentData']['enAudioUrl'], audioId = audioController.convertToAudio(korSummary,news['summary'])
            response['message']['data'] = news['summary']
            response['message']['audioUrl'] = response['message']['documentData']['enAudioUrl']
            response['message']['documentUrl'] = state['url']
            
            # save document
            payload = {
                'document': {
                    'url': state['url'],
                    'mainCategory': state['mainCategory'],
                    'subCategory': state['subCategory'],
                    'title': state['title'],
                    'text': response['message']['documentData']['text'],
                    'en_summary': response['message']['documentData']['enSummary'],
                    'kor_summary': response['message']['documentData']['korSummary'],
                    'en_audio_url': response['message']['documentData']['enAudioUrl'],
                    'kor_audio_url': response['message']['documentData']['korAudioUrl'],
                },
                'userId': userId,
                'audioId': audioId
            }
            result = lambda_client.invoke(
                FunctionName='Webi_SaveDocument',
                InvocationType='Event',
                Payload=json.dumps(payload)
            )
        else:
            print("saved_data")
            response['message']['documentData']['text'] = doc['document']['text']
            response['message']['documentData']['enSummary'] = doc['document']['en_summary']
            response['message']['documentData']['korSummary'] = doc['document']['kor_summary']
            response['message']['documentData']['enAudioUrl'] = doc['audio']['en_audio_url']
            response['message']['documentData']['korAudioUrl'] = doc['audio']['kor_audio_url']
            
            response['message']['data'] = doc['document']['en_summary']
            response['message']['audioUrl'] = doc['audio']['en_audio_url']
            response['message']['documentUrl'] = doc['document']['document_url']
        state = {
                'depth': 0,
                'title': None,
                'mainCategory': 'news',
                'subCategory': None,
                'url': None,
        }
            
    response['message']['date'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    response['state'] = state
    
    response['uMessage'] = userMessage
    return response