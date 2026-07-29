// ========== 页面渲染模块 ==========

const Pages = {
  // 首页
  home() {
    const profile = DataStore.get('profile') || {};
    const stats = DataStore.getStatistics();
    
    return `
      <!-- Hero 区 -->
      <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden grid-bg">
        <div class="orb bg-cyber-cyan" style="width:400px;height:400px;top:10%;left:5%;"></div>
        <div class="orb bg-cyber-purple" style="width:500px;height:500px;bottom:10%;right:5%;"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- 左侧文字 -->
            <div class="slide-up">
              <div class="inline-flex items-center px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full mb-6">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                <span class="text-cyber-cyan text-sm">在线 · 欢迎访问我的个人门户</span>
              </div>
              
              <h1 class="hero-title mb-6">
                <span class="text-white">你好，我是</span><br>
                <span class="gradient-text" data-editable="single" data-key="profile.name">${profile.name}</span>
              </h1>

              <p class="text-2xl text-gray-300 mb-4 font-light" data-editable="single" data-key="profile.title">${profile.title}</p>

              <p class="hero-subtitle mb-8 max-w-xl" data-editable data-key="profile.bio">${profile.bio}</p>
              
              <div class="flex flex-wrap gap-3 mb-10">
                ${(profile.skills || []).map(s => `<span class="tag"><i class="fas fa-check-circle mr-1"></i>${s}</span>`).join('')}
              </div>
              
              <div class="flex flex-wrap gap-4">
                <button class="btn-primary" onclick="navigateTo('contact')">
                  <span><i class="fas fa-handshake mr-2"></i>寻求合作</span>
                </button>
                <button class="btn-secondary" onclick="navigateTo('ai')">
                  <i class="fas fa-robot mr-2"></i>AI问答
                </button>
              </div>
            </div>
            
            <!-- 右侧头像/3D效果 -->
            <div class="slide-up flex justify-center" style="animation-delay: 0.2s;">
              <div class="relative">
                <div class="avatar-glow">
                  <div class="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-cyber-cyan via-cyber-blue to-cyber-purple rounded-3xl flex items-center justify-center text-8xl font-bold text-white shadow-2xl overflow-hidden" data-image-key="profile.avatarBase64">
                    ${profile.avatarBase64
                      ? `<img src="${profile.avatarBase64}" class="w-full h-full object-cover" alt="头像">`
                      : (profile.avatar || '军')}
                  </div>
                </div>
                <!-- 浮动标签 -->
                <div class="absolute -top-4 -right-4 glass-card px-4 py-2 animate-float">
                  <div class="text-xs text-gray-400">服务客户</div>
                  <div class="text-xl font-bold text-cyber-cyan">500+</div>
                </div>
                <div class="absolute -bottom-4 -left-4 glass-card px-4 py-2 animate-float" style="animation-delay: 1s;">
                  <div class="text-xs text-gray-400">保障总额</div>
                  <div class="text-xl font-bold text-cyber-purple">过亿</div>
                </div>
                <div class="absolute top-1/2 -right-8 glass-card px-3 py-2 animate-float" style="animation-delay: 2s;">
                  <i class="fas fa-bolt text-yellow-400"></i>
                  <span class="text-xs ml-1">AI驱动</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 数据统计区 -->
      <section class="py-16 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-center mb-4">
            <span class="gradient-text">数据概览</span>
          </h2>
          <p class="text-gray-400 text-center mb-12">让数据说话，见证专业实力</p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat-card fade-in">
              <i class="fas fa-user-graduate text-3xl text-cyber-cyan mb-2"></i>
              <div class="text-3xl font-bold text-white">${stats.resumes}</div>
              <div class="text-sm text-gray-400">履历阶段</div>
            </div>
            <div class="stat-card fade-in" style="animation-delay: 0.1s;">
              <i class="fas fa-trophy text-3xl text-yellow-400 mb-2"></i>
              <div class="text-3xl font-bold text-white">${stats.honors}</div>
              <div class="text-sm text-gray-400">荣誉奖项</div>
            </div>
            <div class="stat-card fade-in" style="animation-delay: 0.2s;">
              <i class="fas fa-briefcase text-3xl text-cyber-purple mb-2"></i>
              <div class="text-3xl font-bold text-white">${stats.business || 0}</div>
              <div class="text-sm text-gray-400">业务服务</div>
            </div>
            <div class="stat-card fade-in" style="animation-delay: 0.3s;">
              <i class="fas fa-eye text-3xl text-green-400 mb-2"></i>
              <div class="text-3xl font-bold text-white">${stats.visits}</div>
              <div class="text-sm text-gray-400">访问次数</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 特色功能区 -->
      <section class="py-16 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-center mb-4">
            <span class="gradient-text">核心服务</span>
          </h2>
          <p class="text-gray-400 text-center mb-12">专业 · 智能 · 高效</p>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div class="glass-card p-6 slide-up">
              <div class="w-14 h-14 bg-gradient-to-br from-cyber-cyan to-cyber-blue rounded-xl flex items-center justify-center mb-4">
                <i class="fas fa-shield-alt text-2xl text-white"></i>
              </div>
              <h3 class="text-xl font-bold mb-2 text-white">保险规划</h3>
              <p class="text-gray-400 text-sm">量身定制保险方案，全面覆盖风险保障需求，为您和家人的未来保驾护航。</p>
              <button onclick="navigateTo('business')" class="mt-4 text-cyber-cyan text-sm hover:underline">
                查看详情 <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
            
            <div class="glass-card p-6 slide-up" style="animation-delay: 0.1s;">
              <div class="w-14 h-14 bg-gradient-to-br from-cyber-purple to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <i class="fas fa-robot text-2xl text-white"></i>
              </div>
              <h3 class="text-xl font-bold mb-2 text-white">AI智能助手</h3>
              <p class="text-gray-400 text-sm">基于先进AI技术的智能问答系统，随时解答您的保险疑问，提供专业建议。</p>
              <button onclick="navigateTo('ai')" class="mt-4 text-cyber-purple text-sm hover:underline">
                开始对话 <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
            
            <div class="glass-card p-6 slide-up" style="animation-delay: 0.2s;">
              <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <i class="fas fa-magic text-2xl text-white"></i>
              </div>
              <h3 class="text-xl font-bold mb-2 text-white">子网页生成</h3>
              <p class="text-gray-400 text-sm">在本站基础上轻松创建属于您的专属展示页面，释放创意，打造个人品牌。</p>
              <button onclick="navigateTo('generator')" class="mt-4 text-green-400 text-sm hover:underline">
                立即体验 <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 图片展示区 -->
      <section class="py-16 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h2 class="text-3xl font-bold mb-4">
              <span class="gradient-text">精彩瞬间</span>
            </h2>
            <p class="text-gray-400">荣誉时刻 · 客户互动 · 沟通内容</p>
          </div>
          
          <div id="showcaseTabs" class="flex justify-center gap-2 mb-8">
            <button onclick="switchShowcaseTab('all')" class="showcase-tab active px-4 py-2 rounded-full text-sm bg-cyber-cyan text-cyber-darker font-semibold">全部</button>
            <button onclick="switchShowcaseTab('荣誉时刻')" class="showcase-tab px-4 py-2 rounded-full text-sm bg-cyber-card text-gray-300">🏆 荣誉时刻</button>
            <button onclick="switchShowcaseTab('客户互动')" class="showcase-tab px-4 py-2 rounded-full text-sm bg-cyber-card text-gray-300">🤝 客户互动</button>
            <button onclick="switchShowcaseTab('沟通内容')" class="showcase-tab px-4 py-2 rounded-full text-sm bg-cyber-card text-gray-300">💬 沟通内容</button>
          </div>
          
          <div id="showcaseGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${this.renderShowcaseImages('all')}
          </div>
          
          <!-- 管理员上传按钮 -->
          <div id="showcaseUploadArea" class="${window._isAdminMode ? 'mt-8 text-center' : 'hidden'}">
            <button onclick="uploadShowcaseImage()" class="btn-primary">
              <i class="fas fa-cloud-upload-alt mr-2"></i>上传新图片
            </button>
          </div>
        </div>
      </section>

      <!-- 产品介绍区 -->
      <section class="py-16 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h2 class="text-3xl font-bold mb-4">
              <span class="gradient-text">产品服务</span>
            </h2>
            <p class="text-gray-400">专业保险方案，为您保驾护航</p>
            ${window._isAdminMode ? `
              <button onclick="addProduct()" class="mt-4 btn-primary">
                <i class="fas fa-plus mr-2"></i>添加产品
              </button>
            ` : ''}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${this.renderProductCards()}
          </div>
        </div>
      </section>
    `;
  },

  // 渲染图片展示
  renderShowcaseImages(category) {
    const images = DataStore.get('showcaseImages') || [];
    const filtered = category === 'all' ? images : images.filter(img => img.category === category);
    const isAdmin = window._isAdminMode;
    
    return filtered.map(img => `
      <div class="glass-card p-4 slide-up group hover:border-cyber-cyan/50 transition-all relative">
        <div class="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-cyber-darker to-cyber-card flex items-center justify-center">
          ${img.image 
            ? `<img src="${img.image}" class="w-full h-full object-cover cursor-pointer" onclick="previewImage('${img.image.replace(/'/g, "\\'")}')" alt="${img.title}">` 
            : `<div class="text-6xl">${img.icon}</div>`
          }
          <div class="absolute top-2 right-2 bg-cyber-darker/80 px-2 py-1 rounded text-xs text-cyber-cyan">
            ${img.category}
          </div>
          ${isAdmin ? `
            <div class="absolute top-2 left-2 flex gap-2">
              <button onclick="editShowcaseImage(${img.id})" class="bg-cyber-cyan/80 w-8 h-8 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-edit text-xs"></i>
              </button>
              <button onclick="deleteShowcaseImage(${img.id})" class="bg-red-500/80 w-8 h-8 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          ` : ''}
        </div>
        <h4 class="font-bold text-white mb-1" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${img.title}</h4>
        <p class="text-gray-400 text-sm" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${img.description}</p>
      </div>
    `).join('');
  },

  // 渲染产品卡片
  renderProductCards() {
    const products = DataStore.get('products') || [];
    const isAdmin = window._isAdminMode;
    
    return products.map(p => `
      <div class="glass-card p-6 slide-up hover:border-cyber-cyan/50 transition-all group relative">
        ${isAdmin ? `
          <div class="absolute top-3 right-3 flex gap-2 z-10">
            <button onclick="editProduct(${p.id})" class="bg-cyber-cyan/80 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-cyber-cyan transition">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button onclick="deleteProduct(${p.id})" class="bg-red-500/80 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        ` : ''}
        <div class="text-4xl mb-4">${p.icon}</div>
        <h4 class="text-xl font-bold text-white mb-2" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${p.name}</h4>
        <p class="text-gray-400 text-sm mb-4" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${p.description}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${(p.features || []).map(f => `<span class="text-xs bg-cyber-cyan/20 text-cyber-cyan px-2 py-1 rounded" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${f}</span>`).join('')}
        </div>
        ${p.link ? `
          <a href="${p.link}" target="_blank" class="text-cyber-cyan text-sm group-hover:text-white transition-colors">
            查看详情 <i class="fas fa-arrow-right ml-1"></i>
          </a>
        ` : `
          <button onclick="navigateTo('contact')" class="text-cyber-cyan text-sm group-hover:text-white transition-colors">
            咨询详情 <i class="fas fa-arrow-right ml-1"></i>
          </button>
        `}
      </div>
    `).join('');
  },

  // 履历页面
  resume() {
    const resumes = DataStore.get('resumes') || [];
    const profile = DataStore.get('profile') || {};
    
    return `
      <section class="py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">履历介绍</span>
            </h1>
            <p class="text-gray-400">从基层代理人到高级顾问的成长之路</p>
          </div>
          
          <div class="glass-card p-8 mb-8 slide-up">
            <div class="flex flex-col md:flex-row gap-6">
              <div class="flex-shrink-0">
                <div class="w-24 h-24 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-2xl flex items-center justify-center text-4xl font-bold text-white mx-auto md:mx-0">
                  ${profile.avatar || '军'}
                </div>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-white mb-1" data-editable="single" data-key="profile.name">${profile.name}</h2>
                <p class="text-cyber-cyan mb-3" data-editable="single" data-key="profile.title">${profile.title}</p>
                <p class="text-gray-300 mb-4" data-editable data-key="profile.bio">${profile.bio}</p>
                <div class="flex flex-wrap gap-2">
                  ${(profile.skills || []).map(s => `<span class="tag">${s}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <h2 class="text-2xl font-bold mb-6 text-white flex items-center">
            <i class="fas fa-stream text-cyber-cyan mr-3"></i>职业经历
          </h2>

          <div class="relative pl-2" data-list="resumes">
            ${resumes.map((r, i) => `
              <div class="timeline-item slide-up" data-id="${r.id}" style="animation-delay: ${i * 0.1}s;">
                <div class="glass-card p-5">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                    <span class="text-xs px-3 py-1 bg-cyber-cyan/20 text-cyber-cyan rounded-full" data-editable="single" data-key="resumes.${r.id}.period">${r.period}</span>
                    <span class="text-xs px-3 py-1 bg-cyber-purple/20 text-cyber-purple rounded-full" data-editable="single" data-key="resumes.${r.id}.company">${r.company}</span>
                  </div>
                  <h3 class="text-lg font-bold text-white mb-2" data-editable="single" data-key="resumes.${r.id}.title">${r.title}</h3>
                  <p class="text-gray-300 text-sm mb-3" data-editable data-key="resumes.${r.id}.description">${r.description}</p>
                  <div class="flex flex-wrap gap-2">
                    ${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 编辑按钮 -->
          <div class="text-center mt-8">
            <button class="btn-secondary" onclick="openResumeEditor()">
              <i class="fas fa-edit mr-2"></i>编辑履历
            </button>
          </div>
        </div>
      </section>
    `;
  },

  // 荣誉页面
  honors() {
    const honors = DataStore.get('honors') || [];
    
    return `
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">荣誉展示</span>
            </h1>
            <p class="text-gray-400">一份份荣誉，见证每一份努力与坚持</p>
          </div>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-list="honors">
            ${honors.map((h, i) => `
              <div class="honor-card slide-up" data-id="${h.id}" style="animation-delay: ${i * 0.1}s;">
                <div class="flex items-start justify-between mb-4">
                  <div class="w-14 h-14 bg-gradient-to-br ${h.color} rounded-xl flex items-center justify-center">
                    <i class="fas fa-${h.icon} text-2xl text-white"></i>
                  </div>
                  <span class="text-xs text-gray-400" data-editable="single" data-key="honors.${h.id}.date">${h.date}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-1" data-editable="single" data-key="honors.${h.id}.title">${h.title}</h3>
                <p class="text-cyber-cyan text-sm mb-3" data-editable="single" data-key="honors.${h.id}.issuer">${h.issuer}</p>
                <p class="text-gray-400 text-sm" data-editable data-key="honors.${h.id}.description">${h.description}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="text-center mt-12">
            <button class="btn-secondary" onclick="openHonorEditor()">
              <i class="fas fa-plus mr-2"></i>添加荣誉
            </button>
          </div>
        </div>
      </section>
    `;
  },

  // 案例页面
  // 业务范围页面
  business() {
    const businesses = DataStore.get('business') || [];
    const categories = [...new Set(businesses.map(b => b.category))];
    
    return `
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">业务范围</span>
            </h1>
            <p class="text-gray-400">为客户解决的实际问题与带来的真实价值</p>
          </div>
          
          <!-- 分类筛选 -->
          <div class="flex flex-wrap justify-center gap-2 mb-8">
            <button class="biz-filter active px-4 py-2 rounded-full border border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan text-sm" onclick="filterBusiness('all', this)">全部</button>
            ${categories.map(cat => `
              <button class="biz-filter px-4 py-2 rounded-full border border-cyber-border text-gray-400 text-sm hover:border-cyber-cyan hover:text-cyber-cyan" onclick="filterBusiness('${cat}', this)">${cat}</button>
            `).join('')}
          </div>
          
          <div id="businessGrid" class="grid md:grid-cols-2 gap-6" data-list="business">
            ${businesses.map((b, i) => this.businessCard(b, i)).join('')}
          </div>
        </div>
      </section>
    `;
  },

  businessCard(b, i) {
    return `
      <div class="glass-card p-6 slide-up hover:border-cyber-cyan/50 transition-all" data-category="${b.category}" data-id="${b.id}" style="animation-delay: ${i * 0.1}s;">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-3xl flex-shrink-0">
            ${b.icon}
          </div>
          <div class="flex-1">
            <span class="inline-block bg-cyber-cyan/20 text-cyber-cyan text-xs px-2 py-1 rounded mb-1">${b.category}</span>
            <h3 class="text-lg font-bold text-white">${b.title}</h3>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div class="text-red-400 text-xs font-bold mb-1"><i class="fas fa-exclamation-circle mr-1"></i>客户问题</div>
            <p class="text-gray-300 text-sm">${b.problem}</p>
          </div>
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div class="text-blue-400 text-xs font-bold mb-1"><i class="fas fa-lightbulb mr-1"></i>解决方案</div>
            <p class="text-gray-300 text-sm">${b.solution}</p>
          </div>
          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div class="text-green-400 text-xs font-bold mb-1"><i class="fas fa-star mr-1"></i>带来价值</div>
            <p class="text-gray-300 text-sm">${b.value}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-cyber-border/30">
          <div class="text-xs text-gray-500">
            <i class="fas fa-user mr-1"></i>${b.client}
          </div>
          <div class="text-xs text-gray-500">${b.date}</div>
        </div>
        
        ${window._isAdminMode ? `
          <div class="flex gap-2 mt-3">
            <button onclick="editBusiness(${b.id})" class="flex-1 py-1 bg-cyber-cyan/20 text-cyber-cyan rounded text-xs">
              <i class="fas fa-edit mr-1"></i>编辑
            </button>
            <button onclick="deleteBusiness(${b.id})" class="flex-1 py-1 bg-red-500/20 text-red-400 rounded text-xs">
              <i class="fas fa-trash mr-1"></i>删除
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },

  cases() {
    // 重定向到 business
    return Pages.business();
  },

  caseCard(c, i) {
    return '';
  },

  // 小工具页面
  tools() {
    const tools = DataStore.get('tools') || [];
    const categories = [...new Set(tools.map(t => t.category))];
    const isAdmin = window._isAdminMode;
    
    return `
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">实用小工具</span>
            </h1>
            <p class="text-gray-400">点击使用，或扫码在手机端打开</p>
          </div>
          
          ${isAdmin ? `
            <div class="mb-6 p-4 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl">
              <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="text-cyber-cyan text-sm">
                  <i class="fas fa-shield-alt mr-2"></i>管理员模式：可对小工具进行增删查改
                </div>
                <div class="flex gap-2">
                  <input id="toolSearchInput" type="text" placeholder="搜索工具名称..." class="px-3 py-2 bg-cyber-darker border border-cyber-border rounded-lg text-sm text-white placeholder-gray-500" oninput="filterTools(this.value)">
                  <button class="btn-primary py-2 px-4 text-sm" onclick="openToolEditor()">
                    <i class="fas fa-plus mr-1"></i>添加工具
                  </button>
                </div>
              </div>
            </div>
          ` : ''}
          
          <!-- 分类筛选 -->
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            <button class="tool-filter active px-4 py-2 rounded-full border border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan text-sm" onclick="filterToolsByCategory('all', this)">全部</button>
            ${categories.map(cat => `
              <button class="tool-filter px-4 py-2 rounded-full border border-cyber-border text-gray-400 text-sm hover:border-cyber-cyan hover:text-cyber-cyan" onclick="filterToolsByCategory('${cat}', this)">${cat}</button>
            `).join('')}
          </div>
          
          <div id="toolsGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-list="tools">
            ${tools.map((t, i) => this.toolCard(t, i, isAdmin)).join('')}
          </div>
        </div>
      </section>
    `;
  },

  toolCard(t, i, isAdmin) {
    return `
      <div class="tool-card glass-card p-5 slide-up hover:border-cyber-cyan/50 transition-all" data-category="${t.category}" data-id="${t.id}" data-name="${t.name}" style="animation-delay: ${i * 0.1}s;">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-xl flex items-center justify-center">
            <i class="fas fa-${t.icon} text-xl text-white"></i>
          </div>
          <span class="tag text-xs">${t.category}</span>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">${t.name}</h3>
        <p class="text-gray-400 text-sm mb-4">${t.description}</p>
        <div class="flex gap-2">
          <button class="flex-1 btn-primary py-2 text-sm" onclick="useTool(${t.id})">
            <i class="fas fa-play mr-1"></i>立即使用
          </button>
          ${t.qrCode ? `
            <button class="px-3 py-2 border border-cyber-border rounded-lg text-cyber-cyan hover:bg-cyber-cyan/10" onclick="showQRCode('${t.name}', '${t.url}')">
              <i class="fas fa-qrcode"></i>
            </button>
          ` : ''}
        </div>
        ${isAdmin ? `
          <div class="flex gap-2 mt-3 pt-3 border-t border-cyber-border/30">
            <button onclick="editTool(${t.id})" class="flex-1 py-1.5 bg-cyber-cyan/20 text-cyber-cyan rounded text-xs hover:bg-cyber-cyan/30">
              <i class="fas fa-edit mr-1"></i>编辑
            </button>
            <button onclick="deleteTool(${t.id})" class="flex-1 py-1.5 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
              <i class="fas fa-trash mr-1"></i>删除
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },

  // 需求对接/联系页面
  contact() {
    const profile = DataStore.get('profile') || {};
    const demands = DataStore.get('demands') || [];
    
    return `
      <section class="py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">需求对接</span>
            </h1>
            <p class="text-gray-400">让我们一起创造价值</p>
          </div>
          
          <div class="grid lg:grid-cols-2 gap-8">
            <!-- 联系方式卡片 -->
            <div class="glass-card p-8 slide-up">
              <h2 class="text-2xl font-bold text-white mb-6">联系方式</h2>
              
              <div class="space-y-4">
                <div class="flex items-center p-4 bg-cyber-cyan/5 rounded-xl border border-cyber-cyan/20">
                  <i class="fab fa-weixin text-2xl text-green-500 w-12"></i>
                  <div>
                    <div class="text-sm text-gray-400">微信</div>
                    <div class="text-lg font-medium text-white">${profile.wechat}</div>
                  </div>
                  <button class="ml-auto text-cyber-cyan hover:underline text-sm" onclick="copyText('${profile.wechat}')">复制</button>
                </div>
                
                <div class="flex items-center p-4 bg-cyber-cyan/5 rounded-xl border border-cyber-cyan/20">
                  <i class="fas fa-phone text-2xl text-cyber-cyan w-12"></i>
                  <div>
                    <div class="text-sm text-gray-400">电话</div>
                    <div class="text-lg font-medium text-white">${profile.phone}</div>
                  </div>
                  <button class="ml-auto text-cyber-cyan hover:underline text-sm" onclick="copyText('${profile.phone}')">复制</button>
                </div>
                
                <div class="flex items-center p-4 bg-cyber-cyan/5 rounded-xl border border-cyber-cyan/20">
                  <i class="fas fa-envelope text-2xl text-cyber-purple w-12"></i>
                  <div>
                    <div class="text-sm text-gray-400">邮箱</div>
                    <div class="text-lg font-medium text-white">${profile.email}</div>
                  </div>
                  <button class="ml-auto text-cyber-cyan hover:underline text-sm" onclick="copyText('${profile.email}')">复制</button>
                </div>
              </div>
            </div>
            
            <!-- 需求提交表单 -->
            <div class="glass-card p-8 slide-up" style="animation-delay: 0.1s;">
              <h2 class="text-2xl font-bold text-white mb-6">提交需求</h2>
              
              <form onsubmit="submitDemand(event)" class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">您的称呼</label>
                  <input type="text" name="name" required placeholder="请输入您的姓名" class="input-cyber">
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">联系手机号</label>
                  <input type="tel" name="phone" required placeholder="请输入您的手机号" class="input-cyber">
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">需求类型</label>
                  <select name="type" class="input-cyber">
                    <option value="保险咨询">保险咨询</option>
                    <option value="理财规划">理财规划</option>
                    <option value="合作洽谈">合作洽谈</option>
                    <option value="其他需求">其他需求</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">详细描述</label>
                  <textarea name="content" rows="4" required placeholder="请详细描述您的需求..." class="input-cyber"></textarea>
                </div>
                <button type="submit" class="btn-primary w-full">
                  <span><i class="fas fa-paper-plane mr-2"></i>提交需求</span>
                </button>
              </form>
            </div>
          </div>
          
          <!-- 历史需求 -->
          ${demands.length > 0 ? `
            <div class="mt-12">
              <h2 class="text-xl font-bold text-white mb-6">最近需求记录</h2>
              <div class="space-y-4">
                ${demands.slice(0, 5).map(d => `
                  <div class="glass-card p-4">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="tag">${d.type}</span>
                        <span class="ml-2 text-white font-medium">${d.name}</span>
                      </div>
                      <span class="text-xs text-gray-500">${d.time}</span>
                    </div>
                    <p class="text-gray-400 text-sm mt-2">${d.content}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  },

  // AI问答页面
  ai() {
    const profile = DataStore.get('profile') || {};
    const galleryImages = DataStore.get('aiGalleryImages') || [];
    const isAdmin = window._isAdminMode;
    
    return `
      <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-8 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">AI智慧问答</span>
            </h1>
            <p class="text-gray-400">由AI驱动的智能助手，随时为您解答</p>
          </div>
          
          <!-- 快捷问题 -->
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            <button class="quick-question px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full text-cyber-cyan text-sm hover:bg-cyber-cyan/20" onclick="askQuick('介绍一下你自己')">介绍一下你自己</button>
            <button class="quick-question px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full text-cyber-cyan text-sm hover:bg-cyber-cyan/20" onclick="askQuick('如何选择保险')">如何选择保险</button>
            <button class="quick-question px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full text-cyber-cyan text-sm hover:bg-cyber-cyan/20" onclick="askQuick('保险有哪些类型')">保险有哪些类型</button>
            <button class="quick-question px-4 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full text-cyber-cyan text-sm hover:bg-cyber-cyan/20" onclick="askQuick('如何联系军哥懂保')">如何联系军哥懂保</button>
          </div>
          
          <!-- 聊天容器 -->
          <div class="glass-card overflow-hidden">
            <div id="chatContainer" class="h-[400px] overflow-y-auto p-4 space-y-3">
              ${this.renderChatHistory()}
            </div>
            
            <div class="border-t border-cyber-border/50 p-4 bg-cyber-card/50">
              <form onsubmit="sendAIMessage(event)" class="flex gap-2">
                <input type="text" id="aiInput" placeholder="请输入您的问题..." class="input-cyber flex-1" autocomplete="off">
                <button type="submit" class="btn-primary px-6">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </form>
              <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span><i class="fas fa-shield-alt mr-1"></i>对话数据本地保护</span>
                <button onclick="clearAIChat()" class="hover:text-red-400">
                  <i class="fas fa-trash mr-1"></i>清空对话
                </button>
              </div>
            </div>
          </div>

          <!-- AI图片展示轮播 -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white flex items-center">
                <i class="fas fa-images text-cyber-cyan mr-2"></i>
                专业服务展示
              </h3>
              ${isAdmin ? `
                <button onclick="uploadAIGalleryImage()" class="text-xs text-cyber-cyan hover:underline">
                  <i class="fas fa-plus mr-1"></i>上传图片
                </button>
              ` : ''}
            </div>
            
            ${galleryImages.length > 0 ? `
              <div id="aiCarousel" class="relative glass-card overflow-hidden rounded-xl">
                <div class="carousel-track" id="aiCarouselTrack">
                  ${galleryImages.map((img, i) => `
                    <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                      ${img.image 
                        ? `<img src="${img.image}" class="w-full h-64 object-cover cursor-pointer" onclick="previewImage('${img.image.replace(/'/g, "\\'")}')" alt="${img.title}">`
                        : `<div class="w-full h-64 bg-gradient-to-br from-cyber-darker to-cyber-card flex items-center justify-center cursor-pointer" onclick="previewImage('')">
                             <div class="text-center">
                               <div class="text-6xl mb-2">${img.icon || '📷'}</div>
                               <div class="text-cyber-cyan text-lg">${img.title}</div>
                             </div>
                           </div>`
                      }
                      <div class="carousel-caption p-3 bg-cyber-darker/80">
                        <h4 class="text-white font-medium">${img.title}</h4>
                        <p class="text-gray-400 text-sm">${img.description || ''}</p>
                        ${isAdmin ? `
                          <div class="flex gap-2 mt-2">
                            <button onclick="editAIGalleryImage(${img.id})" class="text-xs text-cyber-cyan hover:underline">编辑</button>
                            <button onclick="deleteAIGalleryImage(${img.id})" class="text-xs text-red-400 hover:underline">删除</button>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
                
                <!-- 轮播导航 -->
                ${galleryImages.length > 1 ? `
                  <button onclick="prevAISlide()" class="carousel-nav prev">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button onclick="nextAISlide()" class="carousel-nav next">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                  
                  <!-- 指示器 -->
                  <div class="carousel-dots">
                    ${galleryImages.map((_, i) => `
                      <button class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="goToAISlide(${i})"></button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : `
              <div class="glass-card p-8 text-center">
                <div class="text-6xl mb-4">🖼️</div>
                <p class="text-gray-400">暂无展示图片</p>
                ${isAdmin ? `<p class="text-cyber-cyan text-sm mt-2">点击上方"上传图片"添加展示内容</p>` : ''}
              </div>
            `}
          </div>
          
          <!-- AI能力说明 -->
          <div class="grid md:grid-cols-3 gap-4 mt-6">
            <div class="glass-card p-4 text-center">
              <i class="fas fa-user text-2xl text-cyber-cyan mb-2"></i>
              <div class="text-sm font-medium text-white">个人介绍</div>
              <div class="text-xs text-gray-400">了解军哥懂保</div>
            </div>
            <div class="glass-card p-4 text-center">
              <i class="fas fa-robot text-2xl text-cyber-purple mb-2"></i>
              <div class="text-sm font-medium text-white">AI相关</div>
              <div class="text-xs text-gray-400">智能技术解答</div>
            </div>
            <div class="glass-card p-4 text-center">
              <i class="fas fa-shield-alt text-2xl text-green-400 mb-2"></i>
              <div class="text-sm font-medium text-white">保险知识</div>
              <div class="text-xs text-gray-400">专业保险咨询</div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderChatHistory() {
    const history = DataStore.get('aiChatHistory') || [];
    return history.map(msg => `
      <div class="chat-bubble ${msg.role}">${msg.content.replace(/\n/g, '<br>')}</div>
    `).join('');
  },

  // 子网页生成器
  generator() {
    const subpages = DataStore.get('subpages') || [];
    const isAdmin = window._isAdminMode;
    const recentPages = subpages.slice().sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 6);
    
    return `
      <section class="py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">子网页生成器</span>
            </h1>
            <p class="text-gray-400">在本站基础上创建属于您的专属页面</p>
          </div>

          <!-- 近期项目范例 -->
          ${recentPages.length > 0 ? `
            <div class="mb-12">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white flex items-center">
                  <i class="fas fa-rocket text-cyber-cyan mr-2"></i>
                  近期项目范例
                </h2>
                ${isAdmin ? `
                  <span class="text-sm text-cyber-cyan">管理员模式：可编辑/删除范例</span>
                ` : ''}
              </div>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${recentPages.map((sp, i) => `
                  <div class="glass-card p-4 hover:border-cyber-cyan/50 transition-all relative group" style="animation-delay: ${i * 0.1}s;">
                    ${isAdmin ? `
                      <div class="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="editSubpage('${sp.id}')" class="w-7 h-7 bg-cyber-cyan/80 rounded-full flex items-center justify-center text-white hover:bg-cyber-cyan transition">
                          <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="deleteSubpage('${sp.id}')" class="w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition">
                          <i class="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    ` : ''}
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-lg flex items-center justify-center text-lg">
                        ${sp.theme === 'cyber' ? '🌐' : sp.theme === 'warm' ? '🌅' : '✨'}
                      </div>
                      <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-white truncate" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${sp.title}</h3>
                        <p class="text-xs text-gray-500">${new Date(sp.created).toLocaleDateString('zh-CN')}</p>
                      </div>
                    </div>
                    <p class="text-sm text-gray-400 mb-3 line-clamp-2" ${isAdmin ? 'contenteditable="true" data-text-editable="true"' : ''}>${sp.description || '暂无描述'}</p>
                    <button onclick="viewSubpage('${sp.id}')" class="w-full py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-lg text-cyber-cyan text-sm hover:bg-cyber-cyan/20 transition">
                      <i class="fas fa-external-link-alt mr-1"></i>查看页面
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="mb-12 glass-card p-8 text-center">
              <div class="text-6xl mb-4">🚀</div>
              <h3 class="text-xl font-bold text-white mb-2">创建您的第一个子网页</h3>
              <p class="text-gray-400 mb-4">通过子网页生成器，您可以快速创建属于自己的专属页面</p>
            </div>
          `}
          
          <div class="grid lg:grid-cols-2 gap-8">
            <!-- 创建表单 -->
            <div class="glass-card p-6 slide-up">
              <h2 class="text-xl font-bold text-white mb-6 flex items-center">
                <i class="fas fa-magic text-cyber-cyan mr-2"></i>创建新页面
              </h2>
              
              <form onsubmit="createSubpage(event)" class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">页面标题</label>
                  <input type="text" name="title" required placeholder="例如：我的作品集" class="input-cyber">
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">页面描述</label>
                  <input type="text" name="description" placeholder="简短介绍您的页面" class="input-cyber">
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">页面主题</label>
                  <div class="grid grid-cols-3 gap-2">
                    <label class="theme-option cursor-pointer">
                      <input type="radio" name="theme" value="cyber" checked class="hidden peer">
                      <div class="p-3 border-2 border-cyber-border rounded-lg text-center peer-checked:border-cyber-cyan peer-checked:bg-cyber-cyan/10">
                        <div class="text-lg">🌐</div>
                        <div class="text-xs text-gray-400">科技风</div>
                      </div>
                    </label>
                    <label class="theme-option cursor-pointer">
                      <input type="radio" name="theme" value="warm" class="hidden peer">
                      <div class="p-3 border-2 border-cyber-border rounded-lg text-center peer-checked:border-orange-400 peer-checked:bg-orange-400/10">
                        <div class="text-lg">🌅</div>
                        <div class="text-xs text-gray-400">温馨风</div>
                      </div>
                    </label>
                    <label class="theme-option cursor-pointer">
                      <input type="radio" name="theme" value="minimal" class="hidden peer">
                      <div class="p-3 border-2 border-cyber-border rounded-lg text-center peer-checked:border-white peer-checked:bg-white/10">
                        <div class="text-lg">✨</div>
                        <div class="text-xs text-gray-400">简约风</div>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">页面内容（支持HTML）</label>
                  <textarea name="content" rows="6" required placeholder="请输入页面内容，支持HTML标签..." class="input-cyber font-mono text-sm"></textarea>
                  <div class="flex gap-2 mt-2 text-xs text-gray-500">
                    <span>可用标签：</span>
                    <code>&lt;h1&gt;</code>
                    <code>&lt;p&gt;</code>
                    <code>&lt;strong&gt;</code>
                    <code>&lt;em&gt;</code>
                    <code>&lt;img&gt;</code>
                    <code>&lt;a&gt;</code>
                  </div>
                </div>
                <button type="submit" class="btn-primary w-full">
                  <span><i class="fas fa-rocket mr-2"></i>创建页面</span>
                </button>
              </form>
            </div>
            
            <!-- 已有页面列表 -->
            <div class="glass-card p-6 slide-up" style="animation-delay: 0.1s;">
              <h2 class="text-xl font-bold text-white mb-6 flex items-center">
                <i class="fas fa-layer-group text-cyber-purple mr-2"></i>我的页面
                <span class="ml-2 text-sm text-gray-400">共 ${subpages.length} 个</span>
              </h2>
              
              <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                ${subpages.map((sp, i) => `
                  <div class="glass-card p-4 hover:border-cyber-cyan/50 transition-all">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="font-bold text-white">${sp.title}</h3>
                        <p class="text-sm text-gray-400 mt-1">${sp.description || '无描述'}</p>
                        <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span class="tag text-xs">${sp.theme}</span>
                          <span>${new Date(sp.created).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button onclick="viewSubpage('${sp.id}')" class="px-3 py-1 bg-cyber-cyan/20 text-cyber-cyan rounded text-sm hover:bg-cyber-cyan/30">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editSubpage('${sp.id}')" class="px-3 py-1 bg-cyber-purple/20 text-cyber-purple rounded text-sm hover:bg-cyber-purple/30">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteSubpage('${sp.id}')" class="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
                ${subpages.length === 0 ? `
                  <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>暂无子页面，快来创建第一个吧！</p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  // 讨论交流页面
  discussions() {
    const discussions = DataStore.get('discussions') || [];
    
    return `
      <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 slide-up">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <span class="gradient-text">交流讨论</span>
            </h1>
            <p class="text-gray-400">分享经验，共同成长</p>
          </div>
          
          <!-- 发起讨论 -->
          <div class="glass-card p-6 mb-8 slide-up">
            <h2 class="text-lg font-bold text-white mb-4">发起新讨论</h2>
            <form onsubmit="createDiscussion(event)" class="space-y-4">
              <input type="text" name="topic" required placeholder="讨论主题" class="input-cyber">
              <textarea name="content" required rows="3" placeholder="分享您的想法..." class="input-cyber"></textarea>
              <button type="submit" class="btn-primary">
                <span><i class="fas fa-paper-plane mr-2"></i>发布讨论</span>
              </button>
            </form>
          </div>
          
          <!-- 讨论列表 -->
          <div class="space-y-4">
            ${discussions.map((d, i) => `
              <div class="glass-card p-6 slide-up" style="animation-delay: ${i * 0.1}s;">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="text-lg font-bold text-white">${d.topic}</h3>
                    <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span><i class="fas fa-user mr-1"></i>${d.author}</span>
                      <span><i class="far fa-clock mr-1"></i>${d.time}</span>
                    </div>
                  </div>
                  <button onclick="likeDiscussion(${d.id})" class="flex items-center gap-1 px-3 py-1 rounded-full border border-cyber-border hover:border-red-400 hover:text-red-400 transition-all">
                    <i class="far fa-heart"></i>
                    <span class="text-sm">${d.likes || 0}</span>
                  </button>
                </div>
                
                <p class="text-gray-300 mb-4">${d.content}</p>
                
                <!-- 评论 -->
                ${(d.comments || []).length > 0 ? `
                  <div class="border-t border-cyber-border/30 pt-4 mt-4">
                    <div class="text-sm text-gray-400 mb-2"><i class="fas fa-comments mr-1"></i>评论 ${d.comments.length}</div>
                    <div class="space-y-2">
                      ${d.comments.map(c => `
                        <div class="bg-cyber-dark/50 rounded-lg p-3 text-sm">
                          <div class="text-cyber-cyan font-medium">${c.author}</div>
                          <div class="text-gray-300">${c.content}</div>
                          <div class="text-xs text-gray-500 mt-1">${c.time}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <!-- 添加评论 -->
                <form onsubmit="addComment(event, ${d.id})" class="mt-3 flex gap-2">
                  <input type="text" name="comment" placeholder="写下您的评论..." class="input-cyber text-sm" required>
                  <button type="submit" class="px-4 py-2 bg-cyber-cyan/20 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
};

// 暴露到全局
window.Pages = Pages;
