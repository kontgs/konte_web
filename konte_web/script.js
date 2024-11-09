// 汉堡菜单
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// 轮播图功能
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');

let currentIndex = 0;
const totalSlides = slides.length;

// 设置轮播图片位置
const setSlidePosition = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
};

// 移动到下一张图片
const moveToSlide = (direction) => {
    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % totalSlides;
    } else {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    }
    setSlidePosition();
};

// 添加按钮事件监听
nextButton.addEventListener('click', () => moveToSlide('next'));
prevButton.addEventListener('click', () => moveToSlide('prev'));

// 自动播放
const autoPlayInterval = 5000;
let autoPlayTimer = setInterval(() => moveToSlide('next'), autoPlayInterval);

// 当用户与轮播图交互时暂停自动播放，离开后恢复
const carousel = document.querySelector('.carousel');
carousel.addEventListener('mouseenter', () => {
    clearInterval(autoPlayTimer);
});

carousel.addEventListener('mouseleave', () => {
    autoPlayTimer = setInterval(() => moveToSlide('next'), autoPlayInterval);
});

// 初始化轮播图位置
setSlidePosition();

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// AI助手相关代码
const chatMessages = document.querySelector('.chat-messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.querySelector('.send-message');
const uploadButton = document.querySelector('.upload-file');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';
fileInput.accept = '.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.md,.jpg,.jpeg,.png';
document.body.appendChild(fileInput);

// API相关的常量
const API = {
    BASE_URL: 'https://api.moonshot.cn/v1',
    KEY: 'sk-otRWQU3RWi3ywPpRVrpNhQ6wHAAIaNlKiFyTAd1i5hHFnAUQ',
    HEADERS: {
        'Authorization': `Bearer sk-otRWQU3RWi3ywPpRVrpNhQ6wHAAIaNlKiFyTAd1i5hHFnAUQ`,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
};

// 文件上传处理
async function uploadFile(file) {
    try {
        logger.log('UPLOAD_START', '开始上传文件', { filename: file.name });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', 'file-extract');

        const response = await fetch(`${API.BASE_URL}/files`, {
            method: 'POST',
            headers: {
                'Authorization': API.HEADERS.Authorization
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`文件上传失败: ${response.status}`);
        }

        const data = await response.json();
        logger.log('UPLOAD_SUCCESS', '文件上传成功', data);
        return data;
    } catch (error) {
        logger.log('UPLOAD_ERROR', '文件上传失败', error);
        throw error;
    }
}

// 获取文件内容
async function getFileContent(fileId) {
    try {
        logger.log('CONTENT_FETCH_START', '开始获取文件内容', { fileId });
        
        const response = await fetch(`${API.BASE_URL}/files/${fileId}/content`, {
            headers: API.HEADERS
        });

        if (!response.ok) {
            throw new Error(`获取文件内容失败: ${response.status}`);
        }

        const content = await response.text();
        logger.log('CONTENT_FETCH_SUCCESS', '获取文件内容成功');
        return content;
    } catch (error) {
        logger.log('CONTENT_FETCH_ERROR', '获取文件内容失败', error);
        throw error;
    }
}

// 发送消息到API
async function sendMessageToAPI(messages) {
    try {
        console.log('Attempting to send message to API...', {
            url: `${API.BASE_URL}/chat/completions`,
            headers: API.HEADERS,
            messages: messages
        });

        const response = await fetch(`${API.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: API.HEADERS,
            body: JSON.stringify({
                model: "moonshot-v1-32k",
                messages: messages,
                temperature: 0.3
            }),
            mode: 'cors'
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error in sendMessageToAPI:', error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('网络连接失败，请检查您的网络连接或API服务是否可用');
        }
        throw error;
    }
}

// 添加消息到聊天窗口
function addMessage(text, sender, className = '') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (className) messageDiv.classList.add(className);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 处理文件上传事件
let currentFileContent = null;
let uploadedFiles = [];

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        addMessage(`正在上传文件: ${file.name}...`, 'bot');
        const fileObject = await uploadFile(file);
        
        if (fileObject && fileObject.id) {
            const content = await getFileContent(fileObject.id);
            if (content) {
                uploadedFiles.push({
                    id: fileObject.id,
                    name: file.name,
                    content: content
                });
                currentFileContent = content;
                addMessage('文件上传成功，您可以询问关于文件的问题了', 'bot');
            }
        }
    } catch (error) {
        addMessage(`文件处理失败: ${error.message}`, 'bot');
    }
});

// 发送消息
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    try {
        addMessage(message, 'user');
        messageInput.value = '';

        const messages = [
            {
                role: "system",
                content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手..."
            }
        ];

        uploadedFiles.forEach(file => {
            messages.push({
                role: "system",
                content: file.content
            });
        });

        messages.push({
            role: "user",
            content: message
        });

        addMessage('正在思考...', 'bot', 'thinking');

        const response = await sendMessageToAPI(messages);
        
        const thinkingMessage = document.querySelector('.message.thinking');
        if (thinkingMessage) thinkingMessage.remove();

        addMessage(response, 'bot');

        chatHistory.addChat(message, response, currentFileContent ? {
            name: uploadedFiles[uploadedFiles.length - 1].name,
            id: uploadedFiles[uploadedFiles.length - 1].id
        } : null);
    } catch (error) {
        const thinkingMessage = document.querySelector('.message.thinking');
        if (thinkingMessage) thinkingMessage.remove();
        addMessage(`发生错误: ${error.message}`, 'bot');
    }
}

// 添加发送消息的事件监听
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 添加历史记录面板控制函数
function toggleHistory() {
    const historyPanel = document.querySelector('.history-panel');
    historyPanel.classList.toggle('active');
    updateHistoryList();
}

// 更新历史记录列表
function updateHistoryList(searchKeyword = '') {
    const historyList = document.querySelector('.history-list');
    const history = searchKeyword ? 
        chatHistory.searchHistory(searchKeyword) : 
        chatHistory.getHistory();

    historyList.innerHTML = history.map(chat => `
        <div class="history-item" onclick="loadChat('${chat.id}')">
            <div class="timestamp">${new Date(chat.timestamp).toLocaleString()}</div>
            <div class="preview">${chat.message.substring(0, 50)}...</div>
            ${chat.fileInfo ? `<div class="file-info">文件: ${chat.fileInfo.name}</div>` : ''}
        </div>
    `).join('');
}

// 加载历史对话
function loadChat(chatId) {
    const chat = chatHistory.history.find(c => c.id === parseInt(chatId));
    if (chat) {
        chatMessages.innerHTML = '';
        addMessage(chat.message, 'user');
        addMessage(chat.response, 'bot');
    }
}

// 添加搜索功能
document.getElementById('historySearch').addEventListener('input', (e) => {
    updateHistoryList(e.target.value);
});