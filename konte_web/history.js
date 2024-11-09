// 聊天历史记录管理模块
const chatHistory = {
    history: [],
    maxHistory: 100, // 最大存储记录数

    // 添加聊天记录
    addChat(message, response, fileInfo = null) {
        const chatEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: message,
            response: response,
            fileInfo: fileInfo,
        };
        
        this.history.push(chatEntry);
        
        // 如果超过最大记录数，删除最旧的记录
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // 保存到localStorage
        this.saveToLocalStorage();
    },

    // 获取所有历史记录
    getHistory() {
        return this.history;
    },

    // 获取特定文件相关的对话
    getFileChats(fileName) {
        return this.history.filter(chat => 
            chat.fileInfo && chat.fileInfo.name === fileName
        );
    },

    // 搜索历史记录
    searchHistory(keyword) {
        return this.history.filter(chat => 
            chat.message.toLowerCase().includes(keyword.toLowerCase()) ||
            chat.response.toLowerCase().includes(keyword.toLowerCase())
        );
    },

    // 清除历史记录
    clearHistory() {
        this.history = [];
        localStorage.removeItem('chatHistory');
    },

    // 保存到localStorage
    saveToLocalStorage() {
        localStorage.setItem('chatHistory', JSON.stringify(this.history));
    },

    // 从localStorage加载
    loadFromLocalStorage() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            this.history = JSON.parse(saved);
        }
    }
};

// 初始化时加载历史记录
chatHistory.loadFromLocalStorage(); 