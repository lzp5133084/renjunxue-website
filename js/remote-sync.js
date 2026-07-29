// ========== 远程数据同步模块 ==========
// 通过 Gitee/GitHub API 实现数据云端共享
// 管理员修改后同步到仓库，所有访客都能看到最新内容
// 优先使用 Gitee（国内访问快），GitHub 作为备用

const RemoteSync = {
  // 仓库配置（优先 Gitee，国内访问更快）
  config: {
    // Gitee 配置（主）
    gitee: {
      owner: 'ren-junxue',
      repo: 'renjunxue-website',
      branch: 'main',
      dataFile: 'data.json',
      token: '',  // 从本地存储读取
      rawUrl: 'https://gitee.com/ren-junxue/renjunxue-website/raw/main/data.json',
      apiUrl: 'https://gitee.com/api/v5/repos/ren-junxue/renjunxue-website/contents/data.json'
    },
    // GitHub 配置（备用）
    github: {
      owner: 'lzp5133084',
      repo: 'renjunxue-website',
      branch: 'main',
      dataFile: 'data.json',
      token: '',
      rawUrl: 'https://raw.githubusercontent.com/lzp5133084/renjunxue-website/main/data.json',
      apiUrl: 'https://api.github.com/repos/lzp5133084/renjunxue-website/contents/data.json'
    },
    // 当前使用的平台
    activePlatform: 'gitee'
  },

  // 需要同步的数据键（网站内容数据）
  syncKeys: [
    'profile', 'resumes', 'honors', 'cases', 'business',
    'tools', 'showcaseImages', 'products', 'aiGalleryImages', 'subpages'
  ],

  // 同步状态
  isSyncing: false,
  lastSyncTime: null,
  fileSha: null,

  // 获取当前活动平台配置
  getActiveConfig() {
    return this.config.activePlatform === 'gitee' ? this.config.gitee : this.config.github;
  },

  // 初始化
  async init() {
    // 从本地存储加载 token
    const giteeToken = localStorage.getItem('gitee_token');
    const githubToken = localStorage.getItem('github_token');
    if (giteeToken) this.config.gitee.token = giteeToken;
    if (githubToken) this.config.github.token = githubToken;

    // 加载远程数据
    await this.loadRemoteData();
  },

  // ========== 加载远程数据 ==========
  async loadRemoteData() {
    // 尝试从 Gitee 加载，失败则尝试 GitHub
    const platforms = ['gitee', 'github'];
    for (const platform of platforms) {
      const cfg = this.config[platform];
      try {
        const url = `${cfg.rawUrl}?t=${Date.now()}`;
        const response = await fetch(url, { cache: 'no-cache' });

        if (!response.ok) {
          console.log(`[RemoteSync] ${platform} 远程数据文件不存在 (HTTP ${response.status})`);
          continue;
        }

        const remoteData = await response.json();
        console.log(`[RemoteSync] ${platform} 远程数据加载成功`);

        // 设置当前活动平台
        this.config.activePlatform = platform;
        this.getActiveConfig();

        // 获取文件 SHA
        await this.getFileSha();

        // 用远程数据覆盖本地
        let updated = false;
        this.syncKeys.forEach(key => {
          if (remoteData[key] !== undefined && remoteData[key] !== null) {
            const localData = localStorage.getItem(key);
            const remoteStr = JSON.stringify(remoteData[key]);
            if (localData !== remoteStr) {
              localStorage.setItem(key, remoteStr);
              updated = true;
            }
          }
        });

        if (updated) {
          console.log(`[RemoteSync] 本地数据已更新为远程最新版本`);
          if (typeof App !== 'undefined' && App.currentPage) {
            App.navigateTo(App.currentPage);
          }
        }

        this.lastSyncTime = new Date().toISOString();
        return true;
      } catch (e) {
        console.warn(`[RemoteSync] 从 ${platform} 加载失败:`, e.message);
        continue;
      }
    }
    console.log('[RemoteSync] 所有平台均无远程数据，使用本地默认数据');
    return false;
  },

  // 获取文件 SHA
  async getFileSha() {
    const cfg = this.getActiveConfig();
    try {
      let url, headers;
      if (this.config.activePlatform === 'gitee') {
        url = `${cfg.apiUrl}?access_token=${cfg.token || localStorage.getItem('gitee_token') || ''}&ref=${cfg.branch}`;
        headers = {};
      } else {
        url = cfg.apiUrl;
        headers = cfg.token ? { 'Authorization': `token ${cfg.token}` } : {};
      }
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        this.fileSha = data.sha;
        return data.sha;
      }
    } catch (e) {
      console.warn('[RemoteSync] 获取文件SHA失败:', e.message);
    }
    return null;
  },

  // ========== 保存数据到远程 ==========
  async saveRemoteData(showToast = true) {
    if (this.isSyncing) {
      console.log('[RemoteSync] 正在同步中，请稍候...');
      return false;
    }

    const cfg = this.getActiveConfig();
    if (!cfg.token) {
      console.warn(`[RemoteSync] 未配置 ${this.config.activePlatform} Token，无法同步`);
      if (showToast && typeof App !== 'undefined') {
        App.showToast('需要在管理员设置中配置 Token 才能同步到云端', 'error');
      }
      return false;
    }

    this.isSyncing = true;

    try {
      // 收集需要同步的数据
      const dataToSync = {};
      this.syncKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            dataToSync[key] = JSON.parse(value);
          } catch (e) {
            console.warn(`[RemoteSync] 解析 ${key} 失败:`, e);
          }
        }
      });

      dataToSync._meta = {
        lastUpdated: new Date().toISOString(),
        updatedBy: '军哥懂保',
        version: '2.0',
        platform: this.config.activePlatform
      };

      const content = JSON.stringify(dataToSync, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      if (!this.fileSha) {
        await this.getFileSha();
      }

      let response, result;

      if (this.config.activePlatform === 'gitee') {
        // Gitee API
        const requestBody = {
          access_token: cfg.token,
          content: base64Content,
          message: `更新网站数据 - ${new Date().toLocaleString('zh-CN')}`,
          branch: cfg.branch
        };
        if (this.fileSha) requestBody.sha = this.fileSha;

        response = await fetch(cfg.apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          body: JSON.stringify(requestBody)
        });
        result = await response.json();
      } else {
        // GitHub API
        const requestBody = {
          message: `更新网站数据 - ${new Date().toLocaleString('zh-CN')}`,
          content: base64Content,
          branch: cfg.branch
        };
        if (this.fileSha) requestBody.sha = this.fileSha;

        response = await fetch(cfg.apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${cfg.token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        result = await response.json();
      }

      if (response.ok) {
        this.fileSha = result.content ? result.content.sha : (result.sha || this.fileSha);
        this.lastSyncTime = new Date().toISOString();
        console.log(`[RemoteSync] 数据已成功同步到 ${this.config.activePlatform}`);

        if (showToast && typeof App !== 'undefined') {
          App.showToast('内容已同步到云端，所有访客将看到更新', 'success');
        }
        return true;
      } else {
        throw new Error(result.message || '同步失败');
      }
    } catch (e) {
      console.error('[RemoteSync] 同步失败:', e);
      if (showToast && typeof App !== 'undefined') {
        App.showToast('同步失败: ' + e.message, 'error');
      }
      return false;
    } finally {
      this.isSyncing = false;
    }
  },

  // ========== Token 管理 ==========
  setToken(token, platform = null) {
    const p = platform || this.config.activePlatform;
    this.config[p].token = token;
    localStorage.setItem(`${p}_token`, token);
  },

  getToken(platform = null) {
    const p = platform || this.config.activePlatform;
    return this.config[p].token;
  },

  clearToken(platform = null) {
    const p = platform || this.config.activePlatform;
    this.config[p].token = '';
    localStorage.removeItem(`${p}_token`);
  },

  hasToken(platform = null) {
    const p = platform || this.config.activePlatform;
    return !!this.config[p].token;
  },

  // 切换平台
  setPlatform(platform) {
    if (this.config[platform]) {
      this.config.activePlatform = platform;
      localStorage.setItem('sync_platform', platform);
      return true;
    }
    return false;
  },

  // 获取同步状态
  getStatus() {
    const cfg = this.getActiveConfig();
    return {
      platform: this.config.activePlatform,
      isConfigured: !!cfg.token,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      fileSha: this.fileSha
    };
  }
};
