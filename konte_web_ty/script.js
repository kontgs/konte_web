import CONFIG from './config.js';
import { logger } from './logger.js';

class ChatManager {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.chatMessages = document.querySelector('.chat-messages');
        this.sendButton = document.querySelector('.send-message');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async sendMessage() {
        const userMessage = this.messageInput.value.trim();
        if (!userMessage) return;

        // 添加用户消息到界面
        this.addMessageToChat('user', userMessage);
        this.messageInput.value = '';

        try {
            logger.log('Sending message to API...', 'info');
            
            const requestBody = {
                model: CONFIG.MODEL,
                messages: [
                    { role: 'system', content: CONFIG.DEFAULT_SYSTEM_MESSAGE },
                    { role: 'user', content: userMessage }
                ],
                stream: CONFIG.STREAM,
                temperature: 0.7,
                top_p: 0.8
            };

            logger.log(`Request body: ${JSON.stringify(requestBody)}`, 'info');

            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                logger.log(`API Error: ${JSON.stringify(errorData)}`, 'error');
                throw new Error(`API Error: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            logger.log(`API Response: ${JSON.stringify(data)}`, 'info');

            if (data.choices?.[0]?.message?.content) {
                const content = data.choices[0].message.content;
                this.addMessageToChat('bot', content);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            logger.log(`Error: ${error.message}`, 'error');
            this.addMessageToChat('bot', '抱歉，出现了一些问题。请稍后再试。');
        }
    }

    addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.innerHTML = `<p>${content}</p>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return messageDiv;
    }
}

// 初始化聊天管理器
document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
});