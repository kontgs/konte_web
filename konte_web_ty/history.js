export function toggleHistory() {
    const historyPanel = document.querySelector('.history-panel');
    historyPanel.classList.toggle('active');
}

// 为了支持 onclick="toggleHistory()"
window.toggleHistory = toggleHistory; 