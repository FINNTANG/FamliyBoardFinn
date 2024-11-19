// 定义本地存储键
const LOCAL_STORAGE_KEY = 'familyBoardState';

// 定义用户信息
const USERS = {
  mom: {
    name: 'Mom',
    avatar: 'images/mom-avatar.png',
  },
  me: {
    name: 'Me',
    avatar: 'images/me-avatar.jpg',
  },
};

// 初始化全局状态
let state = {
  activeUser: 'me',
  messages: [],
  reminders: [],
  mediaItems: [],
  books: [],
  wishes: [],
};

// 从localStorage加载状态
function loadState() {
  try {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      state = JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// 保存状态到localStorage
function saveState() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// 添加消息
function addMessage(content, isSystem = false) {
  const message = {
    id: Date.now(),
    content,
    timestamp: new Date().toISOString(),
    by: isSystem ? 'system' : state.activeUser,
  };

  state.messages.push(message);
  saveState();
  updateMessages();
}

// 更新消息显示
function updateMessages() {
  const container = document.getElementById('messageContainer');
  if (!container) return;

  container.innerHTML = state.messages
    .map(
      (msg) => `
        <div class="message ${
          msg.by === 'system'
            ? 'system'
            : msg.by === state.activeUser
            ? 'self'
            : 'other'
        }">
            ${
              msg.by === 'system'
                ? ''
                : `
                <div class="flex items-center gap-2 mb-1">
                    <img src="${
                      USERS[msg.by].avatar
                    }" class="w-6 h-6 rounded-full">
                    <span class="text-sm font-medium">${
                      USERS[msg.by].name
                    }</span>
                </div>
            `
            }
            <p>${msg.content}</p>
            <div class="text-xs text-gray-500 mt-1">${formatDate(
              msg.timestamp,
            )}</div>
        </div>
    `,
    )
    .join('');

  container.scrollTop = container.scrollHeight;
}

// 切换用户
function switchUser(newUser) {
  if (state.activeUser !== newUser) {
    state.activeUser = newUser;

    // 更新主题
    document.body.setAttribute('data-theme', newUser);

    // 添加过渡动画类
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 500);

    // 更新UI
    document
      .querySelectorAll('[data-user]')
      .forEach((btn) =>
        btn.classList.toggle('active', btn.dataset.user === newUser),
      );

    // 添加特定的欢迎消息
    const welcomeMessages = {
      mom: '🐯 欢迎回来！今天也要开开心心的！',
      me: '😈 Welcome back! Ready to rock?',
    };
    addMessage(welcomeMessages[newUser], true);

    saveState();
    updateThemeElements();

    // 刷新页面内容
    if (typeof updateReminders === 'function') updateReminders();
    if (typeof updateMedia === 'function') updateMedia();
    if (typeof updateReadingList === 'function') updateReadingList();
    if (typeof updateWishesList === 'function') updateWishesList();
  }
}

// 更新主题相关元素
function updateThemeElements() {
  const theme = state.activeUser;

  // 更新导航栏样式
  const nav = document.querySelector('nav');
  if (nav) {
    nav.className = `flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg ${theme}-theme`;
  }

  // 更新按钮样式
  const buttons = document.querySelectorAll('.primary-btn, .send-btn');
  buttons.forEach((btn) => {
    btn.className = `${
      btn.classList.contains('primary-btn') ? 'primary-btn' : 'send-btn'
    } ${theme}-btn`;
  });
}

// 初始化common功能
function initializeCommon() {
  loadState();

  // 初始化主题
  document.body.setAttribute('data-theme', state.activeUser);
  updateThemeElements();

  // Initialize user selector
  const userSelector = document.getElementById('userSelector');
  if (userSelector) {
    userSelector.addEventListener('click', (e) => {
      const button = e.target.closest('[data-user]');
      if (button) {
        console.log('Switching to user:', button.dataset.user);
        switchUser(button.dataset.user);
      }
    });
  }

  // Initialize message input
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');

  if (messageInput && sendButton) {
    sendButton.addEventListener('click', () => {
      const content = messageInput.value.trim();
      if (content) {
        addMessage(content);
        messageInput.value = '';
        messageInput.focus();
      }
    });

    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
      }
    });
  }

  // Initialize messages
  updateMessages();

  // Set active navigation
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const isActive = link.getAttribute('href') === currentPage;
    link.classList.toggle('active', isActive);
  });

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Set current user
  document
    .querySelectorAll('[data-user]')
    .forEach((btn) =>
      btn.classList.toggle('active', btn.dataset.user === state.activeUser),
    );
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 导出函数供其他模块使用
window.addMessage = addMessage;
window.saveState = saveState;
window.formatDate = formatDate;
window.switchUser = switchUser;
window.updateThemeElements = updateThemeElements;
