exports.handler = async (event) => {
    const defaultMessage = {
        data: '뉴스, 메일, 핫 이슈 중에서 원하시는 메뉴를 말씀해 주세요.',
        date: new Date(),
        audioUrl: 'https://test-audioposts.s3.ap-northeast-2.amazonaws.com/default_message.mp3',
        documentUrl: null,
        documentData:{
            text: null,
            korSummary: null,
            enSummary: null,
            korAudioUrl: null,
            enAudioUrl: null,
        }
    }
    const state = {
        depth: 0,
        mainCategory: null,
        subCategory: null,
        title: null,
        url: null,
    };
    const response = {
        message: defaultMessage,
        state: state
    };    
    return response;
};