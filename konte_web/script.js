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
    // 使用translateX来移动轮播图
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
    
    // 添加调试信息
    console.log(`Moving to slide ${currentIndex}`);
};

// 添加按钮事件监听
nextButton.addEventListener('click', () => {
    moveToSlide('next');
    console.log('Next button clicked');
});

prevButton.addEventListener('click', () => {
    moveToSlide('prev');
    console.log('Prev button clicked');
});

// 自动播放
const autoPlayInterval = 5000; // 5秒切换一次
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

// 添加图片加载完成的检查
slides.forEach((slide, index) => {
    const img = slide.querySelector('img');
    img.addEventListener('load', () => {
        console.log(`Image ${index + 1} loaded successfully`);
    });
    img.addEventListener('error', () => {
        console.error(`Error loading image ${index + 1}`);
    });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 使用config中的值
const MOONSHOT_API_KEY = config.MOONSHOT_API_KEY;
const API_BASE_URL = config.API_BASE_URL;

// 聊天功能代码
const messageInput = document.querySelector('#messageInput');
const sendButton = document.querySelector('.send-message');
const chatMessages = document.querySelector('.chat-messages');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';
fileInput.accept = '.pdf,.txt,.doc,.docx,.csv';

// 添加文件上传按钮
const addFileUploadButton = () => {
    const uploadButton = document.createElement('button');
    uploadButton.className = 'upload-file';
    uploadButton.innerHTML = '<i class="fas fa-paperclip"></i>';
    document.querySelector('.chat-input').insertBefore(uploadButton, sendButton);
    
    uploadButton.addEventListener('click', () => fileInput.click());
};

// 文件上传处理
const handleFileUpload = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', 'file-extract');

        const response = await fetch(`${API_BASE_URL}/files`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MOONSHOT_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('File upload failed');
        
        const fileData = await response.json();
        return fileData.id;
    } catch (error) {
        console.error('Error uploading file:', error);
        addMessage('文件上传失败，请重试', 'bot');
        return null;
    }
};

// 获取文件内容
const getFileContent = async (fileId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/files/${fileId}/content`, {
            headers: {
                'Authorization': `Bearer ${MOONSHOT_API_KEY}`
            }
        });

        if (!response.ok) throw new Error('Failed to get file content');
        
        const content = await response.text();
        return content;
    } catch (error) {
        console.error('Error getting file content:', error);
        return null;
    }
};

// 发送消息到API
const sendMessageToAPI = async (messages) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "moonshot-v1-32k",
                messages: messages,
                temperature: 0.3
            })
        });

        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling API:', error);
        return '抱歉，发生了错误，请稍后重试。';
    }
};

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    addMessage(`正在上传文件: ${file.name}`, 'bot');
    const fileId = await handleFileUpload(file);
    
    if (fileId) {
        const content = await getFileContent(fileId);
        if (content) {
            addMessage('文件上传成功，您可以询问关于文件的问题了', 'bot');
        }
    }
});

// 初始化
addFileUploadButton();

// 发送消息
const sendMessage = async () => {
    const message = messageInput.value.trim();
    if (!message) return;

    // 添加用户消息到界面
    addMessage(message, 'user');
    messageInput.value = '';

    // 准备消息历史
    const messages = [
        {
            role: "system",
            content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。"
        },
        {
            role: "user",
            content: message
        }
    ];

    // 显示等待状态
    addMessage('正在思考...', 'bot', 'thinking');

    // 调用API获取回复
    const response = await sendMessageToAPI(messages);
    
    // 移除等待状态的消息
    const thinkingMessage = document.querySelector('.message.thinking');
    if (thinkingMessage) thinkingMessage.remove();

    // 添加AI回复
    addMessage(response, 'bot');
};

// 添加消息到聊天窗口
const addMessage = (text, sender, className = '') => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (className) messageDiv.classList.add(className);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// 添加发送消息的事件监听
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});