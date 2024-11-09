// 日志管理模块
const logger = {
    logs: [],
    maxLogs: 1000, // 最大存储日志数量

    // 添加日志
    log(type, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: type,
            message: message,
            data: data
        };
        
        this.logs.push(logEntry);
        
        // 如果日志超过最大数量，删除最旧的日志
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 在控制台也输出日志
        console.log(`[${type}] ${message}`, data || '');
    },

    // 获取所有日志
    getLogs() {
        return this.logs;
    },

    // 获取特定类型的日志
    getLogsByType(type) {
        return this.logs.filter(log => log.type === type);
    },

    // 清除日志
    clearLogs() {
        this.logs = [];
    },

    // 导出日志
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}; 