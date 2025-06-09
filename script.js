// script.js

let API_KEY = null;

// DOM 요소
const chatWindow    = document.getElementById('chat-window');
const userInput     = document.getElementById('user-input');
const sendButton    = document.getElementById('send-button');
const apiKeyInput   = document.getElementById('api-key-input');
const saveKeyButton = document.getElementById('save-key-button');

// 1) API 키 저장
saveKeyButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
        alert('API 키를 입력해주세요.');
        return;
    }
    API_KEY = key;
    localStorage.setItem('gemmaApiKey', key);
    apiKeyInput.value = '';
    apiKeyInput.placeholder = '저장된 키 사용 중';
});

// 2) 페이지 로드 시 저장된 키 로드
window.addEventListener('load', () => {
    const saved = localStorage.getItem('gemmaApiKey');
    if (saved) {
        API_KEY = saved;
        apiKeyInput.placeholder = '저장된 키 사용 중';
    }
});

// 메시지 표시
function appendMessage(text, className) {
    const msgEl = document.createElement('div');
    msgEl.classList.add('message', className);
    msgEl.textContent = text;
    chatWindow.append(msgEl);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Gemini API 호출
async function generateContent(prompt) {
    if (!API_KEY) {
        throw new Error('먼저 API 키를 입력·저장해주세요!');
    }
    // 모델 ID를 gemma-3-27b로 변경
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b:generateContent?key=${API_KEY}`;
    const body = { contents: [ { parts: [{ text: prompt }] } ] };

    const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API 오류 ${res.status}: ${errText}`);
    }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}


// 전송 처리
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-message');
    userInput.value = '';

    try {
        const reply = await generateContent(text);
        appendMessage(reply, 'bot-message');
    } catch (err) {
        appendMessage(`에러 발생: ${err.message}`, 'bot-message');
    }
}

// 이벤트 바인딩
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') handleSend();
});
