export class Logger {
    constructor() {
        this.logs = [];
    }

    log(message, type = 'info') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            type: type
        };
        this.logs.push(logEntry);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }
}

export const logger = new Logger();

export function showLogs() {
    const logs = logger.getLogs();
    const logWindow = window.open('', 'Logs', 'width=600,height=400');
    logWindow.document.write('<h2>聊天日志</h2>');
    logWindow.document.write('<ul>');
    logs.forEach(log => {
        logWindow.document.write(`<li>[${log.timestamp}] ${log.type}: ${log.message}</li>`);
    });
    logWindow.document.write('</ul>');
}

// 为了支持 onclick="showLogs()"
window.showLogs = showLogs; 