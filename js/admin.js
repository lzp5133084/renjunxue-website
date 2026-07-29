// ========== 管理员模式模块 ==========
// 通过连续点击logo 5次触发，支持快捷编辑文字和图片管理

const AdminMode = {
  clickTimes: [],
  isEnabled: false,
  password: 'Lzp520520520.', // 默认密码，可修改
  editHistory: [], // 编辑历史用于撤销
  fileInput: null,

  // 初始化
  init() {
    this.bindLogoClick();
    this.createFileInput();
    console.log('管理员模式模块已加载');
  },

  // 创建隐藏的文件输入框
  createFileInput() {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.style.display = 'none';
    this.fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
    document.body.appendChild(this.fileInput);
  },

  // 绑定logo点击事件
  bindLogoClick() {
    const logo = document.querySelector('#navbar .cursor-pointer');
    if (!logo) return;

    logo.addEventListener('click', (e) => {
      // 不阻止原有的 navigateTo('home') 行为
      const now = Date.now();
      this.clickTimes.push(now);
      // 只保留最近5次点击
      if (this.clickTimes.length > 5) this.clickTimes.shift();

      // 判定：5次点击且第1次和第5次间隔<=1500ms
      if (this.clickTimes.length === 5) {
        const duration = this.clickTimes[4] - this.clickTimes[0];
        if (duration <= 1500) {
          this.clickTimes = [];
          this.promptPassword();
        } else {
          this.clickTimes = [];
        }
      } else if (this.clickTimes.length >= 3) {
        // 第3次开始震动提示
        this.shakeLogo();
      }
    });
  },

  // logo震动效果
  shakeLogo() {
    const logo = document.querySelector('#navbar .cursor-pointer');
    if (!logo) return;
    logo.style.animation = 'none';
    setTimeout(() => {
      logo.style.animation = 'adminShake 0.3s';
    }, 10);
  },

  // 密码验证
  promptPassword() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4';
    modal.innerHTML = `
      <div class="bg-cyber-card border-2 border-cyber-cyan rounded-2xl p-8 max-w-md w-full slide-up shadow-2xl shadow-cyber-cyan/30">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
            <i class="fas fa-shield-alt text-2xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold gradient-text">管理员验证</h2>
          <p class="text-gray-400 text-sm mt-2">请输入管理员密码以进入编辑模式</p>
        </div>
        <form onsubmit="AdminMode.verifyPassword(event)" class="space-y-4">
          <input type="password" id="adminPasswordInput" placeholder="请输入密码" class="input-cyber text-center text-lg" autofocus>
          <div class="flex gap-3">
            <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
            <button type="submit" class="flex-1 btn-primary"><span>进入管理</span></button>
          </div>
          <p class="text-xs text-gray-500 text-center">默认密码：Lzp520520520.</p>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // 验证密码
  verifyPassword(event) {
    event.preventDefault();
    const input = document.getElementById('adminPasswordInput').value;
    if (input === this.password) {
      event.target.closest('.fixed').remove();
      this.enableAdminMode();
    } else {
      App.showToast('密码错误！', 'error');
      const inputEl = document.getElementById('adminPasswordInput');
      inputEl.value = '';
      inputEl.style.borderColor = '#ef4444';
      inputEl.style.animation = 'none';
      setTimeout(() => { inputEl.style.animation = 'adminShake 0.3s'; }, 10);
    }
  },

  // 启用管理员模式
  enableAdminMode() {
    this.isEnabled = true;
    window._isAdminMode = true;
    document.body.classList.add('admin-mode');
    this.createToolbar();
    this.bindEditable();
    this.makeAllTextEditable();
    App.showToast('已进入管理员模式！点击文字可直接编辑', 'success');
    // 重新渲染当前页以应用可编辑标记
    App.navigateTo(App.currentPage);
    setTimeout(() => {
      this.bindEditable();
      this.makeAllTextEditable();
    }, 300);
  },

  // 禁用管理员模式
  disableAdminMode() {
    this.isEnabled = false;
    window._isAdminMode = false;
    document.body.classList.remove('admin-mode');
    const toolbar = document.getElementById('adminToolbar');
    if (toolbar) toolbar.remove();
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.classList.remove('admin-editable');
      el.removeAttribute('data-text-editable');
    });
    App.showToast('已退出管理员模式', 'info');
    App.navigateTo(App.currentPage);
  },

  // 系统性地让所有文字可编辑
  makeAllTextEditable() {
    if (!this.isEnabled) return;

    // 选择所有可能包含文字的元素
    const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, a';
    const skipSelectors = 'script, style, .tag, .badge, .btn, button, input, textarea, select, .nav-link, .mobile-nav';

    document.querySelectorAll(textSelectors).forEach(el => {
      // 跳过特定元素
      if (el.closest(skipSelectors) || el.dataset.skipEdit === 'true') return;
      
      // 跳过没有文字内容的元素
      const text = el.textContent.trim();
      if (!text || text.length < 2) return;
      
      // 跳过纯图标元素
      if (el.querySelector('i.fa-')) {
        const pureText = el.textContent.replace(/\s+/g, '').length;
        if (pureText < 2) return;
      }

      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-text-editable', 'true');
      el.classList.add('admin-editable');
      
      // 避免重复绑定
      if (!el._adminBlurHandler) {
        el._adminBlurHandler = true;
        el.addEventListener('blur', function() {
          AdminMode.saveGenericTextEdit(this);
        });
        el.addEventListener('focus', function() {
          // 进入编辑状态时高亮
          this.style.outline = '2px dashed rgba(0, 245, 255, 0.5)';
          this.style.outlineOffset = '2px';
        });
        el.addEventListener('blur', function() {
          this.style.outline = '';
        });
      }
    });
  },

  // 保存通用文字编辑
  saveGenericTextEdit(el) {
    const newValue = el.textContent.trim();
    if (!newValue) return;

    // 只保存有 data-key 的元素
    const key = el.dataset.key;
    if (key) {
      this.saveEdit(el);
    } else {
      // 普通元素保存到 sessionStorage（不持久化，但保留刷新前的状态）
      const elementKey = 'text_edit_' + this.getElementPath(el);
      sessionStorage.setItem(elementKey, newValue);
    }
  },

  // 获取元素路径用于保存
  getElementPath(el) {
    const parts = [];
    let current = el;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += '#' + current.id;
        parts.unshift(selector);
        break;
      } else {
        const parent = current.parentNode;
        if (parent) {
          const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-of-type(${index})`;
          }
        }
        parts.unshift(selector);
      }
      current = current.parentNode;
    }
    return parts.join(' > ');
  },

  // 绑定可编辑元素
  bindEditable() {
    if (!this.isEnabled) return;

    // 所有带 data-editable 属性的元素
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.classList.add('admin-editable');

      // 失焦保存
      el.addEventListener('blur', function() {
        AdminMode.saveEdit(this);
      });

      // Enter键保存（单行元素）
      if (el.dataset.editable === 'single') {
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
          }
        });
      }
    });

    // 图片点击替换
    document.querySelectorAll('[data-image-key]').forEach(el => {
      el.classList.add('admin-image-editable');
      el.addEventListener('click', function(e) {
        if (AdminMode.isEnabled) {
          e.stopPropagation();
          AdminMode.triggerImageUpload(this.dataset.imageKey);
        }
      });
    });

    // 卡片管理按钮
    this.addCardControls();
  },

  // 保存编辑
  saveEdit(el) {
    const key = el.dataset.key;
    const value = el.textContent.trim();
    if (!key) return;

    // 解析 key，例如 "profile.name" 或 "resumes.123.title"
    const parts = key.split('.');
    const rootKey = parts[0];

    // 列表类型数据（数组）
    const listKeys = ['resumes', 'honors', 'cases', 'tools', 'discussions'];
    if (listKeys.includes(rootKey) && parts.length === 3) {
      const list = DataStore.get(rootKey) || [];
      const itemId = parseInt(parts[1]);
      const fieldName = parts[2];
      const item = list.find(i => i.id === itemId);
      if (item) {
        this.editHistory.push({
          key,
          oldValue: item[fieldName],
          newValue: value,
          time: new Date().toISOString()
        });
        item[fieldName] = value;
        DataStore.set(rootKey, list);
        App.showToast('已保存：' + key, 'success');
        this.autoSync();
      }
      return;
    }

    // 普通对象数据
    const data = DataStore.get(rootKey) || {};
    if (parts.length === 2) {
      this.editHistory.push({
        key,
        oldValue: data[parts[1]],
        newValue: value,
        time: new Date().toISOString()
      });
      data[parts[1]] = value;
    } else if (parts.length === 3) {
      if (!data[parts[1]]) data[parts[1]] = {};
      this.editHistory.push({
        key,
        oldValue: data[parts[1]][parts[2]],
        newValue: value,
        time: new Date().toISOString()
      });
      data[parts[1]][parts[2]] = value;
    }

    DataStore.set(rootKey, data);
    App.showToast('已保存：' + key, 'success');
    this.autoSync();
  },

  // 自动同步（防抖，避免频繁操作时多次请求）
  autoSync() {
    if (typeof RemoteSync === 'undefined' || !RemoteSync.hasToken()) return;
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      RemoteSync.saveRemoteData(false);
    }, 3000); // 3秒内无新操作才同步
  },

  // 触发图片上传
  triggerImageUpload(imageKey) {
    this.fileInput.dataset.imageKey = imageKey;
    this.fileInput.click();
  },

  // 处理图片上传
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const imageKey = this.fileInput.dataset.imageKey;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      // 压缩图片
      this.compressImage(base64, 400, (compressed) => {
        this.saveImage(imageKey, compressed);
      });
    };
    reader.readAsDataURL(file);
    this.fileInput.value = '';
  },

  // 压缩图片
  compressImage(src, maxSize, callback) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = src;
  },

  // 保存图片
  saveImage(imageKey, base64) {
    const parts = imageKey.split('.');
    const rootKey = parts[0];
    const data = DataStore.get(rootKey) || {};

    if (parts.length === 2) {
      data[parts[1]] = base64;
    } else if (parts.length === 3) {
      if (!data[parts[1]]) data[parts[1]] = {};
      data[parts[1]][parts[2]] = base64;
    }

    DataStore.set(rootKey, data);
    App.showToast('图片已更新！', 'success');
    App.navigateTo(App.currentPage);
    setTimeout(() => this.bindEditable(), 200);
    this.autoSync();
  },

  // 为卡片添加管理控件
  addCardControls() {
    // 履历卡片
    document.querySelectorAll('[data-list="resumes"] .timeline-item').forEach(item => {
      if (item.querySelector('.admin-card-control')) return;
      const id = item.dataset.id;
      const control = document.createElement('div');
      control.className = 'admin-card-control';
      control.innerHTML = `
        <button onclick="AdminMode.editListItem('resumes', ${id})" title="编辑"><i class="fas fa-edit"></i></button>
        <button onclick="AdminMode.deleteListItem('resumes', ${id})" title="删除"><i class="fas fa-trash"></i></button>
      `;
      item.style.position = 'relative';
      item.appendChild(control);
    });

    // 荣誉卡片
    document.querySelectorAll('[data-list="honors"] .honor-card').forEach(item => {
      if (item.querySelector('.admin-card-control')) return;
      const id = item.dataset.id;
      const control = document.createElement('div');
      control.className = 'admin-card-control';
      control.innerHTML = `
        <button onclick="AdminMode.editListItem('honors', ${id})" title="编辑"><i class="fas fa-edit"></i></button>
        <button onclick="AdminMode.deleteListItem('honors', ${id})" title="删除"><i class="fas fa-trash"></i></button>
      `;
      item.appendChild(control);
    });

    // 业务卡片
    document.querySelectorAll('[data-list="business"] .glass-card').forEach(item => {
      if (item.querySelector('.admin-card-control') || !item.dataset.id) return;
      const id = item.dataset.id;
      const control = document.createElement('div');
      control.className = 'admin-card-control';
      control.innerHTML = `
        <button onclick="App.editBusiness(${id})" title="编辑"><i class="fas fa-edit"></i></button>
        <button onclick="App.deleteBusiness(${id})" title="删除"><i class="fas fa-trash"></i></button>
      `;
      item.style.position = 'relative';
      item.appendChild(control);
    });

    // 小工具卡片
    document.querySelectorAll('[data-list="tools"] .tool-card').forEach(item => {
      if (item.querySelector('.admin-card-control')) return;
      const id = item.dataset.id;
      const control = document.createElement('div');
      control.className = 'admin-card-control';
      control.innerHTML = `
        <button onclick="App.editTool(${id})" title="编辑"><i class="fas fa-edit"></i></button>
        <button onclick="App.deleteTool(${id})" title="删除"><i class="fas fa-trash"></i></button>
      `;
      item.style.position = 'relative';
      item.appendChild(control);
    });
  },

  // 编辑列表项
  editListItem(key, id) {
    const list = DataStore.get(key) || [];
    const item = list.find(i => i.id == id);
    if (!item) return;

    const fieldConfig = {
      resumes: [
        { key: 'period', label: '时间段', type: 'text' },
        { key: 'title', label: '职位', type: 'text' },
        { key: 'company', label: '公司', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'tags', label: '标签(逗号分隔)', type: 'text' }
      ],
      honors: [
        { key: 'title', label: '荣誉名称', type: 'text' },
        { key: 'issuer', label: '颁发机构', type: 'text' },
        { key: 'date', label: '时间', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' }
      ],
      cases: [
        { key: 'title', label: '标题', type: 'text' },
        { key: 'category', label: '分类', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' }
      ],
      business: [
        { key: 'category', label: '分类', type: 'text' },
        { key: 'title', label: '标题', type: 'text' },
        { key: 'icon', label: '图标(emoji)', type: 'text' },
        { key: 'color', label: '颜色渐变', type: 'text' },
        { key: 'problem', label: '客户问题', type: 'textarea' },
        { key: 'solution', label: '解决方案', type: 'textarea' },
        { key: 'value', label: '带来价值', type: 'textarea' },
        { key: 'client', label: '客户描述', type: 'text' },
        { key: 'date', label: '日期', type: 'text' }
      ],
      tools: [
        { key: 'name', label: '工具名称', type: 'text' },
        { key: 'description', label: '工具描述', type: 'textarea' },
        { key: 'icon', label: '图标', type: 'text' },
        { key: 'category', label: '分类', type: 'text' },
        { key: 'url', label: '工具链接', type: 'text' }
      ],
      showcaseImages: [
        { key: 'category', label: '分类', type: 'text' },
        { key: 'title', label: '标题', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'icon', label: '图标(emoji)', type: 'text' }
      ],
      products: [
        { key: 'name', label: '产品名称', type: 'text' },
        { key: 'icon', label: '图标(emoji)', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'features', label: '特性(逗号分隔)', type: 'text' },
        { key: 'link', label: '链接', type: 'text' }
      ]
    };

    const fields = fieldConfig[key] || [];
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4';

    const formHTML = fields.map(f => {
      let value = item[f.key] || '';
      if (Array.isArray(value)) value = value.join(',');
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
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto slide-up">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-6">编辑内容</h2>
          <form class="space-y-4" onsubmit="AdminMode.saveListItem(event, '${key}', ${id})">
            ${formHTML}
            <div class="flex gap-3 mt-6">
              <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
              <button type="submit" class="flex-1 btn-primary"><span>保存</span></button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // 保存列表项
  saveListItem(event, key, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const updates = {};
    const arrayFields = ['tags', 'features']; // 需要转为数组的字段
    for (let [k, v] of formData.entries()) {
      if (arrayFields.includes(k)) {
        updates[k] = v.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        updates[k] = v;
      }
    }
    DataStore.updateItem(key, parseInt(id), updates);
    form.closest('.fixed').remove();
    App.showToast('内容已更新', 'success');
    App.navigateTo(App.currentPage);
    setTimeout(() => {
      this.bindEditable();
      this.makeAllTextEditable();
    }, 300);
    this.autoSync();
  },

  // 删除列表项
  deleteListItem(key, id) {
    if (confirm('确定要删除这一项吗？')) {
      DataStore.deleteItem(key, parseInt(id));
      App.showToast('已删除', 'success');
      App.navigateTo(App.currentPage);
      setTimeout(() => {
        this.bindEditable();
        this.makeAllTextEditable();
      }, 300);
      this.autoSync();
    }
  },

  // 添加新项
  addNewItem(key) {
    const fieldConfig = {
      resumes: [
        { key: 'period', label: '时间段', type: 'text' },
        { key: 'title', label: '职位', type: 'text' },
        { key: 'company', label: '公司', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'tags', label: '标签(逗号分隔)', type: 'text' }
      ],
      honors: [
        { key: 'title', label: '荣誉名称', type: 'text' },
        { key: 'issuer', label: '颁发机构', type: 'text' },
        { key: 'date', label: '时间', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' }
      ],
      cases: [
        { key: 'title', label: '标题', type: 'text' },
        { key: 'category', label: '分类', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' }
      ],
      business: [
        { key: 'category', label: '分类', type: 'text' },
        { key: 'title', label: '标题', type: 'text' },
        { key: 'icon', label: '图标(emoji)', type: 'text' },
        { key: 'color', label: '颜色渐变', type: 'text' },
        { key: 'problem', label: '客户问题', type: 'textarea' },
        { key: 'solution', label: '解决方案', type: 'textarea' },
        { key: 'value', label: '带来价值', type: 'textarea' },
        { key: 'client', label: '客户描述', type: 'text' },
        { key: 'date', label: '日期', type: 'text' }
      ],
      tools: [
        { key: 'name', label: '工具名称', type: 'text' },
        { key: 'description', label: '工具描述', type: 'textarea' },
        { key: 'icon', label: '图标', type: 'text' },
        { key: 'category', label: '分类', type: 'text' },
        { key: 'url', label: '工具链接', type: 'text' }
      ],
      showcaseImages: [
        { key: 'category', label: '分类', type: 'text' },
        { key: 'title', label: '标题', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'icon', label: '图标(emoji)', type: 'text' }
      ],
      products: [
        { key: 'name', label: '产品名称', type: 'text' },
        { key: 'icon', label: '图标(emoji)', type: 'text' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'features', label: '特性(逗号分隔)', type: 'text' },
        { key: 'link', label: '链接', type: 'text' }
      ]
    };

    const fields = fieldConfig[key] || [];
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4';

    const formHTML = fields.map(f => `
      <div>
        <label class="block text-sm text-gray-400 mb-2">${f.label}</label>
        ${f.type === 'textarea'
          ? `<textarea name="${f.key}" rows="3" class="input-cyber"></textarea>`
          : `<input type="text" name="${f.key}" class="input-cyber">`
        }
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="bg-cyber-card border border-cyber-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto slide-up">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-6">新增内容</h2>
          <form class="space-y-4" onsubmit="AdminMode.saveNewItem(event, '${key}')">
            ${formHTML}
            <div class="flex gap-3 mt-6">
              <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 btn-secondary">取消</button>
              <button type="submit" class="flex-1 btn-primary"><span>添加</span></button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  saveNewItem(event, key) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const item = {};
    const arrayFields = ['tags', 'features'];
    for (let [k, v] of formData.entries()) {
      if (arrayFields.includes(k)) {
        item[k] = v.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        item[k] = v;
      }
    }

    // 添加默认字段
    if (key === 'resumes') item.tags = item.tags || [];
    if (key === 'honors') { item.icon = 'star'; item.color = 'from-cyan-400 to-blue-500'; }
    if (key === 'cases') { item.cover = '📝'; item.tags = item.tags || []; item.date = new Date().toISOString().slice(0,7); }
    if (key === 'business') { item.color = item.color || 'from-cyber-cyan to-cyber-purple'; item.date = item.date || new Date().toISOString().slice(0,4) + '年'; }
    if (key === 'tools') { item.qrCode = true; }
    if (key === 'showcaseImages') { item.image = ''; }
    if (key === 'products') { item.features = item.features || []; }

    DataStore.addItem(key, item);
    form.closest('.fixed').remove();
    App.showToast('已添加新内容', 'success');
    App.navigateTo(App.currentPage);
    setTimeout(() => this.bindEditable(), 200);
    this.autoSync();
  },

  // 撤销
  undo() {
    if (this.editHistory.length === 0) {
      App.showToast('没有可撤销的操作', 'info');
      return;
    }
    const last = this.editHistory.pop();
    const parts = last.key.split('.');
    const rootKey = parts[0];
    const data = DataStore.get(rootKey) || {};
    if (parts.length === 2) {
      data[parts[1]] = last.oldValue;
    }
    DataStore.set(rootKey, data);
    App.showToast('已撤销：' + last.key, 'info');
    App.navigateTo(App.currentPage);
    setTimeout(() => this.bindEditable(), 200);
  },

  // 导出数据
  exportData() {
    const data = DataStore.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `军哥懂保_数据备份_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    App.showToast('数据已导出', 'success');
  },

  // 导入数据
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (DataStore.importData(ev.target.result)) {
          App.showToast('数据导入成功！', 'success');
          App.navigateTo(App.currentPage);
          setTimeout(() => this.bindEditable(), 200);
        } else {
          App.showToast('数据导入失败', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  // 重置数据
  resetData() {
    if (confirm('⚠️ 确定要重置所有数据吗？此操作不可撤销！')) {
      const pwd = prompt('请输入管理员密码以确认重置：');
      if (pwd === this.password) {
        localStorage.clear();
        DataStore.init();
        App.showToast('数据已重置', 'success');
        App.navigateTo(App.currentPage);
        setTimeout(() => this.bindEditable(), 200);
      } else {
        App.showToast('密码错误，重置取消', 'error');
      }
    }
  },

  // 创建管理员工具栏
  createToolbar() {
    if (document.getElementById('adminToolbar')) return;

    // 获取程序信息
    const fileSize = this.getFileSize();
    const lastModified = this.getLastModified();

    const toolbar = document.createElement('div');
    toolbar.id = 'adminToolbar';
    toolbar.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] glass-card px-4 py-3 flex items-center gap-2 flex-wrap justify-center max-w-[95vw]';
    toolbar.innerHTML = `
      <div class="flex items-center gap-2 px-3 py-1 bg-cyber-cyan/20 border border-cyber-cyan/50 rounded-lg">
        <i class="fas fa-shield-alt text-cyber-cyan"></i>
        <span class="text-cyber-cyan text-sm font-medium">管理员模式</span>
      </div>

      <div class="flex items-center gap-3 px-3 py-1 bg-cyber-card/50 border border-cyber-border/50 rounded-lg text-xs text-gray-400">
        <span><i class="fas fa-database mr-1"></i>${fileSize}</span>
        <span><i class="fas fa-clock mr-1"></i>${lastModified}</span>
        <span><i class="fas fa-user mr-1"></i>军哥懂保</span>
      </div>

      <button onclick="AdminMode.addNewToList()" class="px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg text-sm hover:bg-green-500/30" title="新增内容">
        <i class="fas fa-plus"></i>
      </button>

      <button onclick="AdminMode.undo()" class="px-3 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg text-sm hover:bg-yellow-500/30" title="撤销">
        <i class="fas fa-undo"></i>
      </button>

      <button onclick="AdminMode.exportData()" class="px-3 py-2 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 rounded-lg text-sm hover:bg-cyber-cyan/30" title="导出数据">
        <i class="fas fa-download"></i>
      </button>

      <button onclick="AdminMode.importData()" class="px-3 py-2 bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50 rounded-lg text-sm hover:bg-cyber-purple/30" title="导入数据">
        <i class="fas fa-upload"></i>
      </button>

      <button onclick="AdminMode.syncToCloud()" class="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg text-sm hover:bg-blue-500/30" title="同步到云端（让所有访客看到更新）">
        <i class="fas fa-cloud-upload-alt"></i>
      </button>

      <button onclick="AdminMode.showCloudSettings()" class="px-3 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 rounded-lg text-sm hover:bg-indigo-500/30" title="云端同步设置">
        <i class="fas fa-cog"></i>
      </button>

      <button onclick="AdminMode.resetData()" class="px-3 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-lg text-sm hover:bg-orange-500/30" title="重置数据">
        <i class="fas fa-redo"></i>
      </button>

      <button onclick="AdminMode.disableAdminMode()" class="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm hover:bg-red-500/30" title="退出管理员">
        <i class="fas fa-times"></i> 退出
      </button>
    `;
    document.body.appendChild(toolbar);

    // 显示云端同步状态提示
    if (typeof RemoteSync !== 'undefined' && !RemoteSync.hasToken()) {
      App.showToast('提示：点击云端设置按钮配置 Token 后，修改内容才能同步给所有访客', 'info');
    }

    // 隐藏原有的FAB菜单避免遮挡
    const fab = document.getElementById('fabMenu');
    if (fab) fab.style.bottom = '80px';
  },

  // 同步到云端
  async syncToCloud() {
    if (typeof RemoteSync === 'undefined') {
      App.showToast('远程同步模块未加载', 'error');
      return;
    }

    if (!RemoteSync.hasToken()) {
      App.showToast('请先配置 GitHub Token', 'error');
      this.showCloudSettings();
      return;
    }

    App.showToast('正在同步到云端...', 'info');
    await RemoteSync.saveRemoteData(true);
  },

  // 云端设置弹窗
  showCloudSettings() {
    const status = typeof RemoteSync !== 'undefined' ? RemoteSync.getStatus() : {};
    const currentToken = typeof RemoteSync !== 'undefined' ? RemoteSync.getToken() : '';
    const maskedToken = currentToken ? currentToken.slice(0, 8) + '****' + currentToken.slice(-4) : '';
    const platform = status.platform || 'gitee';
    const platformName = platform === 'gitee' ? 'Gitee（推荐，国内访问快）' : 'GitHub';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4';
    modal.innerHTML = `
      <div class="bg-cyber-card border-2 border-cyber-cyan rounded-2xl p-6 max-w-md w-full slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="text-center mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-cloud text-2xl text-white"></i>
          </div>
          <h2 class="text-xl font-bold text-white">云端同步设置</h2>
          <p class="text-gray-400 text-sm mt-1">配置后，管理员修改的内容将同步给所有访客</p>
        </div>

        <div class="space-y-4">
          <div class="bg-cyber-darker/50 rounded-lg p-3 text-sm">
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">当前平台：</span>
              <span class="text-cyber-cyan">${platformName}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">同步状态：</span>
              <span class="${status.isConfigured ? 'text-green-400' : 'text-red-400'}">${status.isConfigured ? '✓ 已配置' : '✗ 未配置'}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">当前 Token：</span>
              <span class="text-gray-300 text-xs">${maskedToken || '未设置'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">上次同步：</span>
              <span class="text-gray-300 text-xs">${status.lastSyncTime ? new Date(status.lastSyncTime).toLocaleString('zh-CN') : '从未'}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">选择同步平台</label>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="AdminMode.switchPlatform('gitee')" class="p-2 border-2 ${platform === 'gitee' ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan' : 'border-cyber-border text-gray-400'} rounded-lg text-sm">
                🟢 Gitee（推荐）
              </button>
              <button onclick="AdminMode.switchPlatform('github')" class="p-2 border-2 ${platform === 'github' ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan' : 'border-cyber-border text-gray-400'} rounded-lg text-sm">
                🐙 GitHub
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">${platformName} Token</label>
            <input type="password" id="githubTokenInput" placeholder="${platform === 'gitee' ? 'Gitee 私人令牌' : 'ghp_xxxxxxxxxxxx'}" value="${currentToken}" class="input-cyber">
            <p class="text-xs text-gray-500 mt-1">
              ${platform === 'gitee' 
                ? '在 Gitee → 设置 → 私人令牌 中创建，需要 projects 权限' 
                : '需要 repo 权限的 GitHub Token'}
            </p>
          </div>

          <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
            <i class="fas fa-info-circle mr-1"></i>
            <strong>使用流程：</strong><br>
            1. 配置 Token 并保存<br>
            2. 修改网站内容（自动同步）<br>
            3. 或点击"立即同步"按钮手动同步<br>
            4. 其他访客刷新页面即可看到更新（约1-2分钟生效）
          </div>

          <div class="flex gap-2">
            <button onclick="AdminMode.saveToken()" class="flex-1 btn-primary">
              <span>保存配置</span>
            </button>
            <button onclick="AdminMode.testSync()" class="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg py-2 hover:bg-green-500/30">
              <i class="fas fa-sync mr-1"></i>立即同步
            </button>
          </div>

          <button onclick="this.closest('.fixed').remove()" class="w-full btn-secondary">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // 切换平台
  switchPlatform(platform) {
    if (typeof RemoteSync !== 'undefined') {
      RemoteSync.setPlatform(platform);
      this.showCloudSettings();
    }
  },

  // 保存 Token
  saveToken() {
    const token = document.getElementById('githubTokenInput').value.trim();
    if (!token) {
      App.showToast('请输入 Token', 'error');
      return;
    }
    if (typeof RemoteSync !== 'undefined') {
      RemoteSync.setToken(token);
      App.showToast('Token 已保存，现在可以同步到云端了', 'success');
      document.querySelector('.fixed.bg-black\\/80')?.remove();
    }
  },

  // 测试同步
  async testSync() {
    const token = document.getElementById('githubTokenInput').value.trim();
    if (!token) {
      App.showToast('请先输入 Token', 'error');
      return;
    }
    if (typeof RemoteSync !== 'undefined') {
      RemoteSync.setToken(token);
    }
    App.showToast('正在测试同步...', 'info');
    await this.syncToCloud();
  },

  // 添加新内容到当前列表
  addNewToList() {
    const page = App.currentPage;
    const keyMap = {
      resume: 'resumes',
      honors: 'honors',
      business: 'business',
      tools: 'tools',
      showcase: 'showcaseImages',
      products: 'products'
    };
    const key = keyMap[page];
    if (key) {
      this.addNewItem(key);
    } else {
      // 尝试从 data-list 属性获取
      const mainContent = document.getElementById('mainContent');
      const listContainer = mainContent?.querySelector('[data-list]');
      if (listContainer) {
        const listKey = listContainer.dataset.list;
        this.addNewItem(listKey);
      } else {
        App.showToast('当前页面不支持新增列表项', 'info');
      }
    }
  },

  // 获取文件大小
  getFileSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key).length;
      }
    }
    const kb = (total / 1024).toFixed(1);
    return kb < 1024 ? `${kb} KB` : `${(kb/1024).toFixed(1)} MB`;
  },

  // 获取最后修改时间
  getLastModified() {
    const logs = JSON.parse(localStorage.getItem('actionLog') || '[]');
    if (logs.length === 0) return '刚刚';
    const last = logs[logs.length - 1];
    const date = new Date(last.time);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff/60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff/3600)}小时前`;
    return date.toLocaleDateString('zh-CN');
  }
};

// 全局函数
function adminEnter() { AdminMode.promptPassword(); }

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  AdminMode.init();
});
