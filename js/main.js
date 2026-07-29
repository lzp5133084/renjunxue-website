// ========== 主逻辑模块 ==========

const App = {
  currentPage: 'home',
  pageHistory: ['home'],

  // 初始化应用
  init() {
    DataStore.init();
    this.bindEvents();
    this.navigateTo('home');
    this.checkHash();
  },

  // 绑定事件
  bindEvents() {
    // 导航栏滚动效果
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('shadow-lg', 'shadow-cyber-cyan/5');
      } else {
        navbar.classList.remove('shadow-lg', 'shadow-cyber-cyan/5');
      }
    });

    // 浏览器前进后退
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.navigateTo(e.state.page, false);
      }
    });

    // 欢迎提示
    setTimeout(() => {
      this.showToast('欢迎来到我的个人展示门户！', 'success');
    }, 500);
  },

  // 检查URL hash
  checkHash() {
    const hash = window.location.hash.slice(1);
    if (hash && Pages[hash]) {
      this.navigateTo(hash);
    }
  },

  // 页面导航
  navigateTo(page, pushState = true) {
    if (!Pages[page]) return;
    
    this.currentPage = page;
    const mainContent = document.getElementById('mainContent');
    
    // 显示加载动画
    mainContent.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="loader"></div>
      </div>
    `;

    // 延迟渲染以显示加载动画
    setTimeout(() => {
      mainContent.innerHTML = Pages[page]();
      
      // 更新导航状态
      document.querySelectorAll('.nav-link, .mobile-nav').forEach(link => {
        if (link.dataset.page === page) {
          link.classList.add('active', 'text-cyber-cyan', 'bg-cyber-cyan/10');
        } else {
          link.classList.remove('active', 'text-cyber-cyan', 'bg-cyber-cyan/10');
        }
      });

      // 关闭移动端菜单
      document.getElementById('mobileMenu').classList.add('hidden');
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // 更新URL
      if (pushState) {
        history.pushState({ page }, '', `#${page}`);
      }
      
      // 触发页面特定初始化
      this.onPageLoad(page);
    }, 100);
  },

  // 页面加载后执行
  onPageLoad(page) {
    switch (page) {
      case 'ai':
        this.initAIChat();
        break;
      case 'business':
        this.initBusinessFilters();
        break;
      case 'generator':
        this.initSubpageForms();
        break;
      case 'tools':
        this.initToolFilters();
        break;
      case 'home':
        this.initShowcaseTabs();
        break;
    }
    // 管理员模式下自动绑定可编辑元素
    if (document.body.classList.contains('admin-mode') && typeof AdminMode !== 'undefined') {
      setTimeout(() => AdminMode.bindEditable(), 100);
    }
  },

  // 移动端菜单
  toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
  },

  // 返回顶部
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // 显示提示
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
      success: 'bg-green-500/20 border-green-500/50 text-green-400',
      error: 'bg-red-500/20 border-red-500/50 text-red-400',
      info: 'bg-cyber-cyan/20 border-cyber-cyan/50 text-cyber-cyan',
      warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
    };
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };

    toast.className = `glass-card px-4 py-3 ${colors[type]} flex items-center space-x-2 min-w-[250px] slide-up`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transition = 'all 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // 复制文本
  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`已复制：${text}`, 'success');
    }).catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast(`已复制：${text}`, 'success');
    });
  },

  // ========== AI问答相关 ==========
  initAIChat() {
    const input = document.getElementById('aiInput');
    if (input) {
      input.focus();
    }
    this.scrollChatToBottom();
  },

  scrollChatToBottom() {
    const container = document.getElementById('chatContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  async sendAIMessage(event) {
    event.preventDefault();
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    if (!message) return;

    // 添加用户消息
    this.appendChatMessage('user', message);
    input.value = '';

    // 显示AI正在输入
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble ai';
    typingIndicator.innerHTML = '<span class="inline-flex space-x-1"><span class="animate-bounce">●</span><span class="animate-bounce" style="animation-delay: 0.1s">●</span><span class="animate-bounce" style="animation-delay: 0.2s">●</span></span>';
    document.getElementById('chatContainer').appendChild(typingIndicator);
    this.scrollChatToBottom();

    // 保存用户消息
    const history = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
    history.push({ role: 'user', content: message });
    localStorage.setItem('aiChatHistory', JSON.stringify(history));

    // AI回复
    setTimeout(async () => {
      typingIndicator.remove();
      const aiResponse = await this.generateAIResponse(message);
      this.appendChatMessage('ai', aiResponse);
      
      // 保存AI回复
      const currentHistory = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
      currentHistory.push({ role: 'ai', content: aiResponse });
      localStorage.setItem('aiChatHistory', JSON.stringify(currentHistory));
    }, 800 + Math.random() * 800);
  },

  appendChatMessage(role, content) {
    const container = document.getElementById('chatContainer');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = content.replace(/\n/g, '<br>');
    container.appendChild(bubble);
    this.scrollChatToBottom();
  },

  // AI回复生成（本地智能回复模拟 + 可接入真实API）
  async generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const profile = DataStore.get('profile') || {};
    
    // 预设回复库
    const responses = {
      '介绍': `您好！我是${profile.name}，${profile.title}。\n\n我的专业领域包括：${(profile.skills || []).join('、')}。\n\n如果您有任何保险相关的问题，欢迎随时咨询！`,
      '你是谁': `我是${profile.name}，一名专业的保险顾问。我拥有多年保险行业经验，专注于为客户提供量身定制的风险保障方案。\n\n同时，我也在积极探索AI技术在保险领域的应用，希望能为更多人提供便捷、智能的保险服务。`,
      '联系': `您可以通过以下方式联系我：\n\n📱 微信：${profile.wechat}\n📞 电话：${profile.phone}\n📧 邮箱：${profile.email}\n\n期待与您的交流！`,
      '保险': '保险是风险管理的重要工具，主要类型包括：\n\n1. **人寿保险** - 保障身故风险，提供经济补偿\n2. **健康保险** - 覆盖医疗费用，包括重疾险、医疗险等\n3. **意外险** - 保障意外事件导致的损失\n4. **财产保险** - 保障财产安全\n5. **年金保险** - 提供长期稳定的现金流\n\n选择保险时，建议根据个人风险状况、家庭责任和经济能力综合考虑。需要更详细的建议吗？',
      '选择': '选择保险的建议：\n\n1. **先保障后理财** - 优先配置保障型产品\n2. **先大人后小孩** - 家庭经济支柱优先\n3. **按需配置** - 根据实际需求选择保额\n4. **比较多款** - 横向对比不同产品的优势\n5. **定期复查** - 每年审视保单配置\n\n我可以为您提供一对一的专业咨询，欢迎添加微信 ${profile.wechat} 详细沟通。',
      'ai': '本站的AI智能助手采用先进的人工智能技术，能够：\n\n- 理解自然语言问题\n- 提供专业的保险建议\n- 介绍我的个人履历和服务\n- 解答关于本站功能的疑问\n\n未来还将接入更强大的AI模型，提供更智能化的服务体验！',
      '网站': '本站主要功能包括：\n\n1. 🏠 首页 - 个人品牌展示、荣誉时刻、客户互动\n2. 📋 履历 - 职业经历介绍\n3. 🏆 荣誉 - 成就展示\n4. 💼 业务 - 解决的客户问题与带来的价值\n5. 🛠️ 工具 - 实用小工具集合\n6. 🎨 子网页生成器 - 创建专属页面\n7. 🤖 AI问答 - 智能对话助手\n8. ✉️ 联系 - 需求对接\n\n所有数据本地保存，保护您的隐私！',
      '案例': '您可以在"业务范围"页面查看我为客户解决的实际问题和带来的真实价值，涵盖健康医疗、财富传承、企业保障、教育规划、退休养老等多个领域。',
      '业务': '我的业务范围包括：\n\n1. 🏥 健康医疗 - 重疾保障、健康规划\n2. 💎 财富传承 - 资产隔离、税务优化\n3. 🏢 企业保障 - 企业主风险防火墙\n4. 🎓 教育规划 - 子女教育金储备\n5. 🌴 退休养老 - 品质退休生活\n6. 🛡️ 保障升级 - 保单复盘优化\n\n欢迎在"业务范围"页面查看详细案例。'
    };

    // 匹配回复
    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    // 默认回复
    const defaultResponses = [
      `感谢您的提问！关于"${userMessage}"，这是一个很好的问题。\n\n作为一名专业的保险顾问，我建议您可以从以下几个方面考虑：\n\n1. 明确您的核心需求\n2. 评估个人风险状况\n3. 制定合理的预算\n4. 选择信誉良好的保险公司\n\n如果需要更详细的个性化建议，欢迎通过微信 ${profile.wechat} 与我取得联系，我会为您提供一对一的专业咨询服务。`,
      `我理解您想了解"${userMessage}"。\n\n这是一个需要综合考虑多方面因素的问题。每个人的情况不同，最合适的方案也会有所差异。\n\n我建议我们可以详细沟通您的具体情况，包括家庭状况、财务目标、风险偏好等，这样我才能为您提供最适合的建议。\n\n您可以通过电话 ${profile.phone} 预约咨询时间。`,
      `关于"${userMessage}"的问题，我可以为您提供一些基本的参考信息。\n\n保险规划是一个系统工程，需要结合个人的生命周期和家庭状况来制定。我在职业生涯中已经为500+客户提供过专业的规划服务，涵盖财富传承、健康保障、教育规划、退休安排等多个领域。\n\n如果您感兴趣，可以在"案例呈现"页面查看我过往的服务案例，或者直接联系我进行详细沟通。`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  },

  askQuick(question) {
    const input = document.getElementById('aiInput');
    input.value = question;
    this.sendAIMessage(new Event('submit'));
  },

  clearAIChat() {
    if (confirm('确定要清空对话记录吗？')) {
      const initialMessage = [
        {
          role: 'ai',
          content: '对话已清空！有什么可以帮您的吗？'
        }
      ];
      localStorage.setItem('aiChatHistory', JSON.stringify(initialMessage));
      document.getElementById('chatContainer').innerHTML = Pages.renderChatHistory();
      this.showToast('对话已清空', 'success');
    }
  },

  // ========== 业务范围筛选 ==========
  initBusinessFilters() {
    this.filterBusiness('all', document.querySelector('.biz-filter.active'));
  },

  filterBusiness(category, btn) {
    document.querySelectorAll('.biz-filter').forEach(b => {
      b.classList.remove('active', 'border-cyber-cyan', 'bg-cyber-cyan/20', 'text-cyber-cyan');
      b.classList.add('border-cyber-border', 'text-gray-400');
    });
    btn.classList.add('active', 'border-cyber-cyan', 'bg-cyber-cyan/20', 'text-cyber-cyan');
    btn.classList.remove('border-cyber-border', 'text-gray-400');

    const cards = document.querySelectorAll('#businessGrid [data-category]');
    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
        card.style.animation = 'slideUp 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  },

  // ========== 业务CRUD ==========
  editBusiness(id) {
    const businesses = DataStore.get('business') || [];
    const item = businesses.find(b => b.id === id);
    if (!item) return;

    const modal = this.createEditorModal('编辑业务', item, [
      { key: 'category', label: '分类', type: 'text' },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'icon', label: '图标(emoji)', type: 'text' },
      { key: 'problem', label: '客户问题', type: 'textarea' },
      { key: 'solution', label: '解决方案', type: 'textarea' },
      { key: 'value', label: '带来价值', type: 'textarea' },
      { key: 'client', label: '客户描述', type: 'text' },
      { key: 'date', label: '日期', type: 'text' }
    ], id);
    
    document.body.appendChild(modal);
  },

  deleteBusiness(id) {
    if (confirm('确定要删除这条业务记录吗？')) {
      DataStore.deleteItem('business', id);
      this.showToast('已删除', 'success');
      this.navigateTo('business');
    }
  },

  addBusiness() {
    const modal = this.createEditorModal('添加业务', {
      category: '健康医疗',
      icon: '🏥',
      color: 'from-red-400 to-pink-500'
    }, [
      { key: 'category', label: '分类', type: 'text' },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'icon', label: '图标(emoji)', type: 'text' },
      { key: 'color', label: '颜色(如from-red-400 to-pink-500)', type: 'text' },
      { key: 'problem', label: '客户问题', type: 'textarea' },
      { key: 'solution', label: '解决方案', type: 'textarea' },
      { key: 'value', label: '带来价值', type: 'textarea' },
      { key: 'client', label: '客户描述', type: 'text' },
      { key: 'date', label: '日期', type: 'text' }
    ]);
    
    document.body.appendChild(modal);
  },

  // ========== 小工具筛选 ==========
  initToolFilters() {
    // 初始化时显示全部
  },

  filterTools(searchText) {
    const text = searchText.toLowerCase();
    const cards = document.querySelectorAll('#toolsGrid .tool-card');
    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      if (!text || name.includes(text)) {
        card.style.display = '';
        card.style.animation = 'slideUp 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  },

  filterToolsByCategory(category, btn) {
    document.querySelectorAll('.tool-filter').forEach(b => {
      b.classList.remove('active', 'border-cyber-cyan', 'bg-cyber-cyan/20', 'text-cyber-cyan');
      b.classList.add('border-cyber-border', 'text-gray-400');
    });
    btn.classList.add('active', 'border-cyber-cyan', 'bg-cyber-cyan/20', 'text-cyber-cyan');
    btn.classList.remove('border-cyber-border', 'text-gray-400');

    const cards = document.querySelectorAll('#toolsGrid [data-category]');
    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
        card.style.animation = 'slideUp 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  },

  // ========== 工具CRUD ==========
  editTool(id) {
    const tools = DataStore.get('tools') || [];
    const tool = tools.find(t => t.id === id);
    if (!tool) return;

    const modal = this.createEditorModal('编辑工具', tool, [
      { key: 'name', label: '工具名称', type: 'text' },
      { key: 'description', label: '工具描述', type: 'textarea' },
      { key: 'icon', label: '图标(FontAwesome class)', type: 'text' },
      { key: 'category', label: '分类', type: 'text' },
      { key: 'url', label: '工具链接', type: 'text' },
      { key: 'qrCode', label: '生成二维码(true/false)', type: 'text' }
    ], id);
    
    document.body.appendChild(modal);
  },

  deleteTool(id) {
    if (confirm('确定要删除这个工具吗？')) {
      DataStore.deleteItem('tools', id);
      this.showToast('工具已删除', 'success');
      this.navigateTo('tools');
    }
  },

  // ========== 案例详情 ==========
  showCaseDetail(id) {
    const cases = DataStore.get('cases') || [];
    const caseItem = cases.find(c => c.id === id);
    if (!caseItem) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up" onclick="event.stopPropagation()">
        <div class="h-48 bg-gradient-to-br from-cyber-card to-cyber-border flex items-center justify-center text-8xl">
          ${caseItem.cover}
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="tag">${caseItem.category}</span>
            <span class="text-gray-400">${caseItem.date}</span>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4">${caseItem.title}</h2>
          <p class="text-gray-300 mb-6 leading-relaxed">${caseItem.description}</p>
          <div class="flex flex-wrap gap-2 mb-6">
            ${(caseItem.tags || []).map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
          <div class="flex gap-3">
            <button onclick="App.contactMe(${JSON.stringify(caseItem.title).replace(/"/g, '&quot;')})" class="btn-primary flex-1">
              <span><i class="fas fa-handshake mr-2"></i>咨询此案例</span>
            </button>
            <button onclick="this.closest('.fixed').remove()" class="btn-secondary">关闭</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },

  contactMe(caseTitle) {
    this.navigateTo('contact');
    setTimeout(() => {
      const contentField = document.querySelector('textarea[name="content"]');
      if (contentField) {
        contentField.value = `您好，我对「${caseTitle}」这个案例很感兴趣，希望能了解更多详情。`;
      }
    }, 300);
  },

  // ========== 需求提交 ==========
  submitDemand(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const demand = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      type: formData.get('type'),
      content: formData.get('content'),
      time: new Date().toLocaleString('zh-CN')
    };

    DataStore.addItem('demands', demand);
    this.showToast('需求提交成功！我会尽快与您联系。', 'success');
    form.reset();
    this.navigateTo('contact');
  },

  // ========== 小工具 ==========
  useTool(id) {
    const tools = DataStore.get('tools') || [];
    const tool = tools.find(t => t.id === id);
    if (!tool) return;

    this.showToast(`正在打开「${tool.name}」...`, 'info');
    // 实际使用中可跳转到工具页面
  },

  showQRCode(name, url) {
    const modal = document.getElementById('qrModal');
    const container = document.getElementById('qrContainer');
    container.innerHTML = '';
    
    // 生成二维码
    new QRCode(container, {
      text: url || window.location.href,
      width: 200,
      height: 200,
      colorDark: '#0a0e1a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // 更新标题
    modal.querySelector('h3').textContent = `${name} - 扫码访问`;
  },

  // ========== 履历编辑 ==========
  openResumeEditor() {
    const resumes = DataStore.get('resumes') || [];
    const resume = resumes[0] || {};
    
    const modal = this.createEditorModal('编辑履历', resume, [
      { key: 'period', label: '时间段', type: 'text' },
      { key: 'title', label: '职位', type: 'text' },
      { key: 'company', label: '公司', type: 'text' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'tags', label: '标签（逗号分隔）', type: 'text' }
    ]);
    
    document.body.appendChild(modal);
  },

  // ========== 荣誉编辑 ==========
  openHonorEditor() {
    const modal = this.createEditorModal('添加荣誉', {}, [
      { key: 'title', label: '荣誉名称', type: 'text' },
      { key: 'issuer', label: '颁发机构', type: 'text' },
      { key: 'date', label: '获得时间', type: 'text' },
      { key: 'description', label: '描述', type: 'textarea' }
    ]);
    
    document.body.appendChild(modal);
  },

  // ========== 工具编辑 ==========
  openToolEditor() {
    const modal = this.createEditorModal('上传新工具', {}, [
      { key: 'name', label: '工具名称', type: 'text' },
      { key: 'description', label: '工具描述', type: 'textarea' },
      { key: 'category', label: '分类', type: 'text' },
      { key: 'url', label: '工具链接', type: 'text' }
    ]);
    
    document.body.appendChild(modal);
  },

  // 通用编辑器
  createEditorModal(title, data, fields, editId = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    let formHTML = fields.map(f => {
      const value = f.type === 'textarea' 
        ? (data[f.key] || '') 
        : (Array.isArray(data[f.key]) ? data[f.key].join(',') : (data[f.key] || ''));
      
      return `
        <div>
          <label class="block text-sm text-gray-400 mb-2">${f.label}</label>
          ${f.type === 'textarea' 
            ? `<textarea name="${f.key}" rows="3" class="input-cyber">${value}</textarea>`
            : `<input type="text" name="${f.key}" value="${value}" class="input-cyber">`
          }
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-6">${title}</h2>
          <form class="space-y-4" onsubmit="App.saveEditor(event, '${title}', ${editId})">
            ${formHTML}
            <div class="flex gap-3 mt-6">
              <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
              <button type="submit" class="flex-1 btn-primary">
                <span>保存</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    return modal;
  },

  saveEditor(event, title, editId = null) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      if (key === 'qrCode') {
        data[key] = value === 'true';
      } else if (key === 'tags') {
        data[key] = value.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        data[key] = value;
      }
    }

    // 根据标题保存到不同数据表
    if (title.includes('履历')) {
      const resumes = DataStore.get('resumes') || [];
      if (resumes.length > 0) {
        DataStore.updateItem('resumes', resumes[0].id, data);
      } else {
        DataStore.addItem('resumes', data);
      }
      this.showToast('履历已更新', 'success');
    } else if (title.includes('荣誉')) {
      DataStore.addItem('honors', data);
      this.showToast('荣誉已添加', 'success');
    } else if (title.includes('业务')) {
      if (editId) {
        DataStore.updateItem('business', editId, data);
        this.showToast('业务已更新', 'success');
      } else {
        data.color = data.color || 'from-cyber-cyan to-cyber-purple';
        DataStore.addItem('business', data);
        this.showToast('业务已添加', 'success');
      }
    } else if (title.includes('工具')) {
      if (editId) {
        DataStore.updateItem('tools', editId, data);
        this.showToast('工具已更新', 'success');
      } else {
        data.icon = data.icon || 'cube';
        data.qrCode = data.qrCode !== false;
        DataStore.addItem('tools', data);
        this.showToast('工具已上传', 'success');
      }
    } else if (title.includes('图片') || title.includes('展示')) {
      if (editId) {
        DataStore.updateItem('showcaseImages', editId, data);
        this.showToast('图片信息已更新', 'success');
      } else {
        DataStore.addItem('showcaseImages', data);
        this.showToast('图片已添加', 'success');
      }
    }

    // 关闭弹窗并刷新页面
    form.closest('.fixed').remove();
    this.navigateTo(this.currentPage);
  },

  // ========== 图片展示管理 ==========
  initShowcaseTabs() {
    // 初始化标签切换
  },

  switchShowcaseTab(category) {
    const tabs = document.querySelectorAll('.showcase-tab');
    tabs.forEach(tab => {
      tab.classList.remove('active', 'bg-cyber-cyan', 'text-cyber-darker', 'font-semibold');
      tab.classList.add('bg-cyber-card', 'text-gray-300');
    });
    
    event.target.classList.add('active', 'bg-cyber-cyan', 'text-cyber-darker', 'font-semibold');
    event.target.classList.remove('bg-cyber-card', 'text-gray-300');

    const grid = document.getElementById('showcaseGrid');
    if (grid) {
      const pages = window.Pages;
      if (pages && pages.renderShowcaseImages) {
        grid.innerHTML = pages.renderShowcaseImages(category);
      }
    }
  },

  // ========== 图片上传 ==========
  uploadShowcaseImage() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">上传图片</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">选择图片</label>
              <input type="file" id="imageFileInput" accept="image/*" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">分类</label>
              <select id="imageCategory" class="input-cyber">
                <option value="荣誉时刻">荣誉时刻</option>
                <option value="客户互动">客户互动</option>
                <option value="沟通内容">沟通内容</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">标题</label>
              <input type="text" id="imageTitle" placeholder="输入标题" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述</label>
              <textarea id="imageDesc" rows="2" placeholder="输入描述" class="input-cyber"></textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">图标(没有图片时显示)</label>
              <input type="text" id="imageIcon" value="📷" class="input-cyber">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button onclick="App.saveShowcaseImage()" class="flex-1 btn-primary">
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  },

  async saveShowcaseImage() {
    const fileInput = document.getElementById('imageFileInput');
    const category = document.getElementById('imageCategory').value;
    const title = document.getElementById('imageTitle').value;
    const description = document.getElementById('imageDesc').value;
    const icon = document.getElementById('imageIcon').value || '📷';

    if (!title) {
      this.showToast('请输入标题', 'error');
      return;
    }

    let imageBase64 = '';
    if (fileInput.files && fileInput.files[0]) {
      imageBase64 = await this.compressImage(fileInput.files[0]);
    }

    DataStore.addItem('showcaseImages', {
      category,
      title,
      description,
      icon,
      image: imageBase64
    });

    this.showToast('图片已添加', 'success');
    document.querySelector('#showcaseGrid').closest('section').closest('.fixed')?.remove();
    
    // 刷新首页
    this.navigateTo('home');
  },

  async compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let w = img.width, h = img.height;
          if (w > maxSize || h > maxSize) {
            if (w > h) { h = h * maxSize / w; w = maxSize; }
            else { w = w * maxSize / h; h = maxSize; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  deleteShowcaseImage(id) {
    if (confirm('确定要删除这张图片吗？')) {
      DataStore.deleteItem('showcaseImages', id);
      this.showToast('已删除', 'success');
      this.navigateTo('home');
    }
  },

  editShowcaseImage(id) {
    const images = DataStore.get('showcaseImages') || [];
    const img = images.find(i => i.id === id);
    if (!img) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">编辑图片</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">分类</label>
              <select id="editCategory" class="input-cyber">
                <option value="荣誉时刻" ${img.category === '荣誉时刻' ? 'selected' : ''}>荣誉时刻</option>
                <option value="客户互动" ${img.category === '客户互动' ? 'selected' : ''}>客户互动</option>
                <option value="沟通内容" ${img.category === '沟通内容' ? 'selected' : ''}>沟通内容</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">标题</label>
              <input type="text" id="editTitle" value="${img.title}" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述</label>
              <textarea id="editDesc" rows="2" class="input-cyber">${img.description || ''}</textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">图标(无图片时显示)</label>
              <input type="text" id="editIcon" value="${img.icon || '📷'}" class="input-cyber">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button onclick="App.confirmEditShowcase(${id})" class="flex-1 btn-primary">
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  },

  confirmEditShowcase(id) {
    const updates = {
      category: document.getElementById('editCategory').value,
      title: document.getElementById('editTitle').value,
      description: document.getElementById('editDesc').value,
      icon: document.getElementById('editIcon').value
    };
    DataStore.updateItem('showcaseImages', id, updates);
    this.showToast('已更新', 'success');
    document.querySelector('.fixed.bg-black\\/70')?.remove();
    this.navigateTo('home');
  },

  editProduct(id) {
    const products = DataStore.get('products') || [];
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">编辑产品</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">产品名称</label>
              <input type="text" id="productName" value="${product.name}" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">图标(emoji)</label>
              <input type="text" id="productIcon" value="${product.icon}" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述</label>
              <textarea id="productDesc" rows="3" class="input-cyber">${product.description || ''}</textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">特性(逗号分隔)</label>
              <input type="text" id="productFeatures" value="${(product.features || []).join(',')}" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">链接(可选)</label>
              <input type="text" id="productLink" value="${product.link || ''}" class="input-cyber">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button onclick="App.confirmEditProduct(${id})" class="flex-1 btn-primary">
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  },

  confirmEditProduct(id) {
    const featuresStr = document.getElementById('productFeatures').value;
    const updates = {
      name: document.getElementById('productName').value,
      icon: document.getElementById('productIcon').value,
      description: document.getElementById('productDesc').value,
      features: featuresStr.split(',').map(s => s.trim()).filter(Boolean),
      link: document.getElementById('productLink').value
    };
    DataStore.updateItem('products', id, updates);
    this.showToast('已更新', 'success');
    document.querySelector('.fixed.bg-black\\/70')?.remove();
    this.navigateTo('home');
  },

  deleteProduct(id) {
    if (confirm('确定要删除这个产品吗？')) {
      DataStore.deleteItem('products', id);
      this.showToast('已删除', 'success');
      this.navigateTo('home');
    }
  },

  addProduct() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">添加产品</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">产品名称</label>
              <input type="text" id="newProductName" placeholder="输入产品名称" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">图标(emoji)</label>
              <input type="text" id="newProductIcon" placeholder="例如: 🛡️" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述</label>
              <textarea id="newProductDesc" rows="3" placeholder="产品描述" class="input-cyber"></textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">特性(逗号分隔)</label>
              <input type="text" id="newProductFeatures" placeholder="例如: 保障全面,保费低" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">链接(可选)</label>
              <input type="text" id="newProductLink" placeholder="产品链接" class="input-cyber">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button onclick="App.confirmAddProduct()" class="flex-1 btn-primary">
              <span>添加</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  },

  confirmAddProduct() {
    const name = document.getElementById('newProductName').value;
    if (!name) {
      this.showToast('请输入产品名称', 'error');
      return;
    }
    const featuresStr = document.getElementById('newProductFeatures').value;
    DataStore.addItem('products', {
      name,
      icon: document.getElementById('newProductIcon').value || '📦',
      description: document.getElementById('newProductDesc').value,
      features: featuresStr.split(',').map(s => s.trim()).filter(Boolean),
      link: document.getElementById('newProductLink').value
    });
    this.showToast('已添加', 'success');
    document.querySelector('.fixed.bg-black\\/70')?.remove();
    this.navigateTo('home');
  },

  // ========== AI图片轮播 ==========
  async uploadAIGalleryImage() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">上传展示图片</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">选择图片</label>
              <input type="file" id="aiImageFile" accept="image/*" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">标题</label>
              <input type="text" id="aiImageTitle" placeholder="输入标题" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述</label>
              <textarea id="aiImageDesc" rows="2" placeholder="输入描述" class="input-cyber"></textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">图标(无图片时显示)</label>
              <input type="text" id="aiImageIcon" value="📷" class="input-cyber">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button onclick="App.saveAIGalleryImage()" class="flex-1 btn-primary">
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  },

  async saveAIGalleryImage() {
    const fileInput = document.getElementById('aiImageFile');
    const title = document.getElementById('aiImageTitle').value;
    const description = document.getElementById('aiImageDesc').value;
    const icon = document.getElementById('aiImageIcon').value || '📷';

    if (!title) {
      this.showToast('请输入标题', 'error');
      return;
    }

    let imageBase64 = '';
    if (fileInput && fileInput.files && fileInput.files[0]) {
      imageBase64 = await this.compressImage(fileInput.files[0]);
    }

    DataStore.addItem('aiGalleryImages', {
      title,
      description,
      icon,
      image: imageBase64
    });

    this.showToast('图片已添加', 'success');
    document.querySelector('.fixed.bg-black\\/70')?.remove();
    this.navigateTo('ai');
  },

  editAIGalleryImage(id) {
    const images = DataStore.get('aiGalleryImages') || [];
    const img = images.find(i => i.id === id);
    if (!img) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    
    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full slide-up" onclick="event.stopPropagation()">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">编辑图片</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">标题</label>
              <input type="text" id="editTitle" value="${img.title}" class="input-cyber">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述</label>
              <textarea id="editDesc" rows="2" class="input-cyber">${img.description || ''}</textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">图标</label>
              <input type="text" id="editIcon" value="${img.icon || '📷'}" class="input-cyber">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button onclick="App.confirmEditAIGallery(${id})" class="flex-1 btn-primary">
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  },

  confirmEditAIGallery(id) {
    const updates = {
      title: document.getElementById('editTitle').value,
      description: document.getElementById('editDesc').value,
      icon: document.getElementById('editIcon').value
    };
    DataStore.updateItem('aiGalleryImages', id, updates);
    this.showToast('已更新', 'success');
    document.querySelector('.fixed.bg-black\\/70')?.remove();
    this.navigateTo('ai');
  },

  deleteAIGalleryImage(id) {
    if (confirm('确定要删除这张图片吗？')) {
      DataStore.deleteItem('aiGalleryImages', id);
      this.showToast('已删除', 'success');
      this.navigateTo('ai');
    }
  },

  previewImage(src) {
    if (!src) {
      this.showToast('暂无预览图片', 'error');
      return;
    }
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
      <img src="${src}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl">
      <button class="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
        <i class="fas fa-times"></i>
      </button>
    `;
    document.body.appendChild(modal);
  },

  nextAISlide() {
    const slides = document.querySelectorAll('#aiCarousel .carousel-slide');
    const dots = document.querySelectorAll('#aiCarousel .carousel-dot');
    let currentIdx = 0;
    slides.forEach((s, i) => { if (s.classList.contains('active')) currentIdx = i; });
    
    slides[currentIdx].classList.remove('active');
    dots[currentIdx]?.classList.remove('active');
    
    const nextIdx = (currentIdx + 1) % slides.length;
    slides[nextIdx].classList.add('active');
    dots[nextIdx]?.classList.add('active');
  },

  prevAISlide() {
    const slides = document.querySelectorAll('#aiCarousel .carousel-slide');
    const dots = document.querySelectorAll('#aiCarousel .carousel-dot');
    let currentIdx = 0;
    slides.forEach((s, i) => { if (s.classList.contains('active')) currentIdx = i; });
    
    slides[currentIdx].classList.remove('active');
    dots[currentIdx]?.classList.remove('active');
    
    const prevIdx = (currentIdx - 1 + slides.length) % slides.length;
    slides[prevIdx].classList.add('active');
    dots[prevIdx]?.classList.add('active');
  },

  goToAISlide(index) {
    const slides = document.querySelectorAll('#aiCarousel .carousel-slide');
    const dots = document.querySelectorAll('#aiCarousel .carousel-dot');
    
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index]?.classList.add('active');
  },

  // ========== 子网页相关 ==========
  initSubpageForms() {
    // 子网页页面已在渲染时绑定事件
  },

  createSubpage(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const subpage = {
      id: 'page_' + Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      content: formData.get('content'),
      theme: formData.get('theme') || 'cyber',
      created: new Date().toISOString()
    };

    DataStore.addItem('subpages', subpage);
    this.showToast('子网页创建成功！', 'success');
    this.navigateTo('generator');
  },

  viewSubpage(id) {
    const subpages = DataStore.get('subpages') || [];
    const page = subpages.find(p => p.id === id);
    if (!page) return;

    // 在新窗口打开子页面
    const themeStyles = {
      cyber: 'background: #0a0e1a; color: #f3f4f6;',
      warm: 'background: linear-gradient(135deg, #fff5f5, #ffe4e1); color: #2d3748;',
      minimal: 'background: #ffffff; color: #1a202c;'
    };

    const theme = page.theme || 'cyber';
    const bgStyle = themeStyles[theme] || themeStyles.cyber;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${page.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { ${bgStyle} font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 2.5em; margin-bottom: 20px; }
          h2 { font-size: 1.8em; margin: 30px 0 15px; }
          p { line-height: 1.8; margin-bottom: 15px; }
          strong { font-weight: 700; }
          em { font-style: italic; }
          img { max-width: 100%; border-radius: 12px; margin: 20px 0; }
          a { color: ${theme === 'cyber' ? '#00f5ff' : '#3182ce'}; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .back-btn { display: inline-block; padding: 8px 20px; border: 1px solid ${theme === 'cyber' ? '#00f5ff' : '#3182ce'}; border-radius: 8px; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <a href="${window.location.pathname}" class="back-btn" onclick="window.close()">← 返回主站</a>
        ${page.content}
      </body>
      </html>
    `);
  },

  editSubpage(id) {
    const subpages = DataStore.get('subpages') || [];
    const page = subpages.find(p => p.id === id);
    if (!page) return;

    const newContent = prompt('编辑页面内容（支持HTML）：', page.content);
    if (newContent !== null) {
      DataStore.updateItem('subpages', id, { content: newContent });
      this.showToast('页面已更新', 'success');
      this.navigateTo('generator');
    }
  },

  deleteSubpage(id) {
    if (confirm('确定要删除这个子页面吗？')) {
      DataStore.deleteItem('subpages', id);
      this.showToast('页面已删除', 'success');
      this.navigateTo('generator');
    }
  },

  // ========== 讨论相关 ==========
  createDiscussion(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const discussion = {
      topic: formData.get('topic'),
      author: '访客' + Math.floor(Math.random() * 1000),
      content: formData.get('content'),
      comments: [],
      likes: 0,
      time: new Date().toLocaleString('zh-CN')
    };

    DataStore.addItem('discussions', discussion);
    this.showToast('讨论已发布', 'success');
    this.navigateTo('discussions');
  },

  addComment(event, discussionId) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[name="comment"]');
    const content = input.value.trim();
    if (!content) return;

    const discussions = DataStore.get('discussions') || [];
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) {
      if (!discussion.comments) discussion.comments = [];
      discussion.comments.push({
        author: '访客' + Math.floor(Math.random() * 1000),
        content,
        time: new Date().toLocaleString('zh-CN')
      });
      DataStore.set('discussions', discussions);
      this.showToast('评论已添加', 'success');
      this.navigateTo('discussions');
    }
  },

  likeDiscussion(id) {
    const discussions = DataStore.get('discussions') || [];
    const discussion = discussions.find(d => d.id === id);
    if (discussion) {
      discussion.likes = (discussion.likes || 0) + 1;
      DataStore.set('discussions', discussions);
      this.showToast('感谢点赞 ❤️', 'success');
      this.navigateTo('discussions');
    }
  }
};

// ========== 全局函数 ==========
function navigateTo(page) { App.navigateTo(page); }
function toggleMobileMenu() { App.toggleMobileMenu(); }
function scrollToTop() { App.scrollToTop(); }
function showQRCode(name, url) { App.showQRCode(name, url); }
function closeQRModal() {
  const modal = document.getElementById('qrModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
function copyText(text) { App.copyText(text); }
function filterBusiness(category, btn) { App.filterBusiness(category, btn); }
function filterTools(searchText) { App.filterTools(searchText); }
function filterToolsByCategory(category, btn) { App.filterToolsByCategory(category, btn); }
function editBusiness(id) { App.editBusiness(id); }
function deleteBusiness(id) { App.deleteBusiness(id); }
function editTool(id) { App.editTool(id); }
function deleteTool(id) { App.deleteTool(id); }
function submitDemand(event) { App.submitDemand(event); }
function useTool(id) { App.useTool(id); }
function openResumeEditor() { App.openResumeEditor(); }
function openHonorEditor() { App.openHonorEditor(); }
function openToolEditor() { App.openToolEditor(); }
function openBusinessEditor() { App.addBusiness(); }
function askQuick(question) { App.askQuick(question); }
function sendAIMessage(event) { App.sendAIMessage(event); }
function clearAIChat() { App.clearAIChat(); }
function createSubpage(event) { App.createSubpage(event); }
function viewSubpage(id) { App.viewSubpage(id); }
function editSubpage(id) { App.editSubpage(id); }
function deleteSubpage(id) { App.deleteSubpage(id); }
function createDiscussion(event) { App.createDiscussion(event); }
function addComment(event, id) { App.addComment(event, id); }
function likeDiscussion(id) { App.likeDiscussion(id); }
function switchShowcaseTab(category) { App.switchShowcaseTab(category); }
function uploadShowcaseImage() { App.uploadShowcaseImage(); }
function deleteShowcaseImage(id) { App.deleteShowcaseImage(id); }

// ========== AI图片轮播相关 ==========
function uploadAIGalleryImage() { App.uploadAIGalleryImage(); }
function editAIGalleryImage(id) { App.editAIGalleryImage(id); }
function deleteAIGalleryImage(id) { App.deleteAIGalleryImage(id); }
function previewImage(src) { App.previewImage(src); }
function nextAISlide() { App.nextAISlide(); }
function prevAISlide() { App.prevAISlide(); }
function goToAISlide(index) { App.goToAISlide(index); }

// ========== 图片和产品编辑 ==========
function editShowcaseImage(id) { App.editShowcaseImage(id); }
function editProduct(id) { App.editProduct(id); }
function deleteProduct(id) { App.deleteProduct(id); }
function addProduct() { App.addProduct(); }

// ========== 启动应用 ==========
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
