// scripts/daily.js
function updateTimes() {
    document.getElementById('usTime').textContent =
        `🇺🇸 US: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
    document.getElementById('cnTime').textContent =
        `🇨🇳 China: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })}`;
}

function updateWeather() {
    const weatherContainer = document.getElementById('weatherContainer');
    if (!weatherContainer) return;

    const locations = {
        Providence: { country: 'USA', timezone: 'America/New_York' },
        Ningbo: { country: 'China', timezone: 'Asia/Shanghai' }
    };

    weatherContainer.innerHTML = Object.entries(locations).map(([city, info]) => {
        const temp = Math.round(20 + Math.random() * 10);
        const humidity = Math.round(60 + Math.random() * 20);
        return `
            <div class="p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium">${city}, ${info.country}</h4>
                    <i data-lucide="sun"></i>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <i data-lucide="thermometer"></i>
                        <span>${temp}°C</span>
                    </div>
                    <div>Clear Sky</div>
                    <div class="text-sm text-gray-500">
                        Humidity: ${humidity}%
                    </div>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function updateReminders() {
    const remindersList = document.getElementById('remindersList');
    if (!remindersList) return;

    remindersList.innerHTML = state.reminders
        .filter(reminder => !reminder.completed)
        .map(reminder => `
            <div class="reminder-message ${reminder.completed ? 'reminder-complete' : ''}"
                 data-id="${reminder.id}">
                <span>${reminder.type}</span>
                <div class="flex gap-2">
                    <span class="text-sm text-gray-500">${reminder.time}</span>
                    <button class="complete-reminder" onclick="completeReminder(${reminder.id})">
                        <i data-lucide="check-circle-2"></i>
                    </button>
                </div>
            </div>
        `).join('');

    lucide.createIcons();
}

function handleReminderClick(type) {
    let message = '';
    switch (type) {
        case 'water':
            message = '请记得喝水 💧';
            break;
        case 'medicine':
            message = '该吃药了 💊';
            break;
        case 'exercise':
            message = '运动时间到了 🏃‍♀️';
            break;
        case 'custom':
            message = prompt('输入提醒内容：') || '自定义提醒';
            break;
    }

    if (message) {
        addReminder(message);
        showReminderDialog(message);
    }
}

function addReminder(message) {
    const reminder = {
        id: Date.now(),
        type: message,
        time: new Date().toLocaleString(),
        createdBy: state.activeUser,
        completed: false,
        targetUser: state.activeUser === 'mom' ? 'me' : 'mom'
    };

    state.reminders.push(reminder);
    updateReminders();
    addMessage(`📝 Added new reminder: ${message}`, true);
    saveState();
}

function completeReminder(id) {
    const reminder = state.reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = true;
        updateReminders();
        saveState();
        addMessage(`✅ Completed reminder: ${reminder.type}`, true);
        showCompletionAlert(reminder.type);
    }
}

function showReminderDialog(message) {
    const dialog = document.getElementById('reminderDialog');
    const details = document.getElementById('reminderDetails');
    const sendBtn = document.getElementById('sendReminder');

    if (!dialog || !details || !sendBtn) return;

    details.innerHTML = `
        <p class="mb-4">${message}</p>
        <p class="text-sm text-gray-500">发送给: ${state.activeUser === 'mom' ? 'Me' : 'Mom'}</p>
    `;

    dialog.classList.remove('hidden');

    // 绑定关闭按钮事件
    dialog.querySelector('.close-btn').onclick = () => {
        dialog.classList.add('hidden');
    };

    // 绑定发送按钮事件
    sendBtn.onclick = () => {
        dialog.classList.add('hidden');
    };
}

function showCompletionAlert(message) {
    const alert = document.getElementById('completionAlert');
    const details = document.getElementById('completionDetails');

    if (!alert || !details) return;

    details.innerHTML = `
        <p class="mb-4">已完成提醒：${message}</p>
        <p class="text-sm text-gray-500">完成时间：${new Date().toLocaleString()}</p>
    `;

    alert.classList.remove('hidden');

    // 绑定关闭按钮事件
    alert.querySelector('.close-btn').onclick = () => {
        alert.classList.add('hidden');
    };
}

function initializeDialogs() {
    // 初始化所有对话框的关闭按钮
    document.querySelectorAll('.dialog .close-btn').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.dialog').classList.add('hidden');
        };
    });

    // 点击对话框背景时关闭
    document.querySelectorAll('.dialog').forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.classList.add('hidden');
            }
        });
    });
}

// 初始化daily功能
function initializeDaily() {
    if (!document.getElementById('remindersList')) return;

    if (!state.reminders) {
        state.reminders = [];
    }

    // 初始化时间显示
    updateTimes();
    setInterval(updateTimes, 1000);

    // 初始化天气显示
    updateWeather();
    setInterval(updateWeather, 300000); // 每5分钟更新一次天气

    // 初始化提醒列表
    updateReminders();

    // 绑定提醒按钮事件
    document.querySelectorAll('.reminder-btn').forEach(btn => {
        btn.addEventListener('click', () => handleReminderClick(btn.dataset.type));
    });

    // 初始化对话框
    initializeDialogs();

    // 添加动态提醒更新
    setInterval(updateReminders, 60000); // 每分钟更新一次提醒列表
}

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', initializeDaily);

// 导出函数供其他模块使用
window.handleReminderClick = handleReminderClick;
window.completeReminder = completeReminder;
window.showCompletionAlert = showCompletionAlert;