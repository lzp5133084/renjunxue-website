// ========== 数据管理系统 ==========
// 基于 localStorage 的数据持久化管理

const DataStore = {
  // 初始化默认数据
  init() {
    if (!localStorage.getItem('site_initialized')) {
      this.setDefaultData();
      localStorage.setItem('site_initialized', 'true');
    } else {
      // 检查并补充新增的数据集
      this.ensureData('aiGalleryImages', [
        { id: 1, title: '专业服务团队', description: '我们的专业团队随时为您服务', image: '', icon: '👨‍💼' },
        { id: 2, title: '客户案例分享', description: '成功帮助客户解决保障问题', image: '', icon: '🎯' },
        { id: 3, title: '行业交流活动', description: '参与行业论坛分享专业知识', image: '', icon: '🎤' }
      ]);
    }
    this.updateVisitCount();

    // 异步加载远程数据（所有访客都能看到管理员更新）
    if (typeof RemoteSync !== 'undefined') {
      RemoteSync.init();
    }
  },

  // 确保数据存在
  ensureData(key, defaultData) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  },

  // 设置默认数据
  setDefaultData() {
    // 个人信息
    localStorage.setItem('profile', JSON.stringify({
      name: '军哥懂保',
      title: '专业保险顾问 & AI智能助手',
      avatar: '军',
      bio: '从事保险行业多年，专注于为客户提供专业的风险规划与保障方案。同时热衷于AI技术研究，致力于将人工智能与保险服务深度融合，为客户带来更智能、更高效的服务体验。',
      skills: ['保险规划', '风险分析', 'AI应用', '团队管理', '客户服务', '数据分析'],
      email: '100469004@qq.com',
      phone: '18180309010',
      wechat: 'xunijiayuan',
      location: '中国'
    }));

    // 履历数据
    localStorage.setItem('resumes', JSON.stringify([
      {
        id: 1,
        period: '2023 - 至今',
        title: '高级保险顾问',
        company: '某知名保险公司',
        description: '负责高端客户的保险规划与资产管理，年均保费达千万级别。团队管理经验丰富，带领团队连续三年获得公司销售冠军。',
        tags: ['团队管理', '高端客户', '资产管理']
      },
      {
        id: 2,
        period: '2020 - 2023',
        title: '保险经纪人',
        company: '独立经纪公司',
        description: '为客户提供中立客观的保险规划建议，服务客户超过500人，保障总额超亿元。专注于家庭财富传承与健康保障方案设计。',
        tags: ['独立经纪', '家庭规划', '财富传承']
      },
      {
        id: 3,
        period: '2018 - 2020',
        title: '保险代理人',
        company: '某大型寿险公司',
        description: '从基层代理人做起，快速成长为团队主管。系统学习保险产品知识与销售技巧，建立了完善的客户服务体系。',
        tags: ['销售技巧', '团队建设', '客户服务']
      }
    ]));

    // 荣誉数据
    localStorage.setItem('honors', JSON.stringify([
      {
        id: 1,
        title: '年度销售冠军',
        issuer: '某保险公司',
        date: '2024年',
        icon: 'trophy',
        description: '全公司年度业绩排名第一，荣获公司最高销售荣誉奖项。',
        color: 'from-yellow-400 to-orange-500'
      },
      {
        id: 2,
        title: 'MDRT会员',
        issuer: '全球百万圆桌会议',
        date: '2023年',
        icon: 'medal',
        description: '获得全球寿险行业最权威的MDRT会员资格认证。',
        color: 'from-cyan-400 to-blue-500'
      },
      {
        id: 3,
        title: '杰出贡献奖',
        issuer: '保险行业协会',
        date: '2022年',
        icon: 'award',
        description: '为保险行业发展做出杰出贡献，获行业协会表彰。',
        color: 'from-purple-400 to-pink-500'
      },
      {
        id: 4,
        title: 'AI创新应用奖',
        issuer: '科技创新联盟',
        date: '2024年',
        icon: 'rocket',
        description: '在保险行业率先应用AI技术，推动行业数字化转型。',
        color: 'from-green-400 to-cyan-500'
      },
      {
        id: 5,
        title: '客户满意度金奖',
        issuer: '客户评价中心',
        date: '2023年',
        icon: 'star',
        description: '连续三年客户满意度评分最高，获金奖表彰。',
        color: 'from-red-400 to-pink-500'
      },
      {
        id: 6,
        title: '团队管理卓越奖',
        issuer: '公司总部',
        date: '2024年',
        icon: 'users',
        description: '带领团队业绩连续翻倍增长，团队管理能力获高度认可。',
        color: 'from-indigo-400 to-purple-500'
      }
    ]));

    // 案例数据（保留兼容）
    localStorage.setItem('cases', JSON.stringify([
      { id: 1, title: '方案案例', category: '示例', description: '示例案例', cover: '📝', tags: ['示例'], date: '2024-01' }
    ]));

    // 业务范围数据（展示解决问题+带来价值）
    localStorage.setItem('business', JSON.stringify([
      {
        id: 1,
        category: '健康医疗',
        icon: '🏥',
        color: 'from-red-400 to-pink-500',
        title: '重疾保障配置',
        problem: '客户咨询：30岁家庭支柱，担心突发重大疾病影响家庭经济，希望获得全面的重疾保障。',
        solution: '根据客户家庭情况，量身配置了保额50万元的终身重疾险，附加医疗报销和住院津贴，缴费期20年。',
        value: '为客户家庭提供了50万元重疾保障 + 每年百万医疗报销，有效转移重大疾病风险，守护家庭幸福。',
        client: '某企业高管 · 35岁',
        date: '2024年'
      },
      {
        id: 2,
        category: '财富传承',
        icon: '💎',
        color: 'from-yellow-400 to-orange-500',
        title: '家族资产传承规划',
        problem: '高净值客户希望将名下资产以最优化方式传承给下一代，同时考虑税务筹划和资产隔离。',
        solution: '设计了包含人寿保险信托、年金保险、境外保险在内的综合传承方案，实现资产隔离与税务优化。',
        value: '成功帮助客户实现亿元级资产的代际传承，节省遗产税支出数千万，同时保障了家族企业的稳定运营。',
        client: '某集团董事长 · 55岁',
        date: '2024年'
      },
      {
        id: 3,
        category: '企业保障',
        icon: '🏢',
        color: 'from-blue-400 to-cyan-500',
        title: '企业主风险防火墙',
        problem: '中小企业主面临"无限连带责任"风险，企业经营风险可能波及家庭资产，急需建立资产隔离机制。',
        solution: '通过法人股东架构 + 大额人寿保险 + 家族信托组合方案，为客户建立了完整的企业风险防火墙。',
        value: '有效隔离了企业与家庭资产，即使企业遭遇经营风险，家庭核心资产不受影响，为企业持续经营提供了坚实后盾。',
        client: '某科技公司创始人 · 42岁',
        date: '2024年'
      },
      {
        id: 4,
        category: '教育规划',
        icon: '🎓',
        color: 'from-purple-400 to-indigo-500',
        title: '子女教育金储备',
        problem: '年轻父母希望为孩子提前储备教育金，覆盖从幼儿园到海外留学的全部费用，同时希望资金灵活可调整。',
        solution: '设计了年金保险 + 教育金信托双轨方案，锁定长期稳健收益，同时保持资金使用的灵活性。',
        value: '预计可为孩子积累超过200万元教育金，覆盖海外名校留学费用，实现"教育无忧"的目标。',
        client: '某大学教师 · 32岁',
        date: '2023年'
      },
      {
        id: 5,
        category: '退休养老',
        icon: '🌴',
        color: 'from-green-400 to-teal-500',
        title: '品质退休生活保障',
        problem: '即将退休的客户希望在社保养老金基础上获得额外收入，确保退休后生活品质不下降，能够周游世界。',
        solution: '配置了养老年金保险，60岁起每月领取相当于原工资80%的养老金，领取至终身。',
        value: '客户退休后每月可额外获得2万元养老金，加上社保退休金，实现了高品质退休生活，现已开始规划退休后环球旅行计划。',
        client: '某银行高管 · 58岁',
        date: '2023年'
      },
      {
        id: 6,
        category: '保障升级',
        icon: '🛡️',
        color: 'from-cyan-400 to-blue-500',
        title: '家庭保单全面复盘',
        problem: '客户购买了多份保险但不知道具体保障内容，担心存在保障缺口或重复投保的情况。',
        solution: '对客户家庭所有保单进行了全面梳理分析，找出3处保障缺口和2份重复投保，重新规划了保障结构。',
        value: '为客户节省了约20%的保费支出，同时保障额度整体提升了40%，实现了"花更少的钱，获得更好的保障"。',
        client: '某外企经理 · 38岁',
        date: '2024年'
      }
    ]));

    // 工具数据
    localStorage.setItem('tools', JSON.stringify([
      {
        id: 1,
        name: '保险计算器',
        description: '计算不同保险方案的保费、保额和收益',
        icon: 'calculator',
        url: '#',
        category: '计算工具',
        qrCode: true
      },
      {
        id: 2,
        name: '风险评估问卷',
        description: '快速评估您的风险承受能力和保障需求',
        icon: 'clipboard-check',
        url: '#',
        category: '评估工具',
        qrCode: true
      },
      {
        id: 3,
        name: '保单整理助手',
        description: '帮助您整理和分析现有保单的保障情况',
        icon: 'file-alt',
        url: '#',
        category: '管理工具',
        qrCode: true
      }
    ]));

    // 需求对接数据
    localStorage.setItem('demands', JSON.stringify([]));

    // 讨论数据
    localStorage.setItem('discussions', JSON.stringify([
      {
        id: 1,
        topic: '如何选择适合自己的保险？',
        author: '军哥懂保',
        content: '选择保险需要综合考虑个人风险状况、家庭责任、经济能力等多方面因素。建议先做全面的风险评估，再针对性配置保障。',
        comments: [
          { author: '小明', content: '很实用的建议！', time: '2024-01-15' },
          { author: '小李', content: '请问如何做风险评估呢？', time: '2024-01-16' }
        ],
        time: '2024-01-10',
        likes: 12
      }
    ]));

    // 子网页数据
    localStorage.setItem('subpages', JSON.stringify([
      {
        id: 'demo',
        title: '我的专属页面',
        description: '这是一个示例子页面',
        content: '<h1>欢迎来到我的专属页面！</h1><p>这是通过子网页生成器创建的示例页面。您可以使用右上角的"生成子网页"按钮创建自己的专属页面。</p><p>这个功能可以让您在本站基础上创建属于自己的个人展示页面。</p>',
        theme: 'cyber',
        created: new Date().toISOString()
      }
    ]));

    // 访问统计
    localStorage.setItem('visitCount', '0');
    localStorage.setItem('lastVisit', new Date().toISOString());

    // AI对话历史（包含客户好评展示）
    localStorage.setItem('aiChatHistory', JSON.stringify([
      {
        role: 'ai',
        content: '您好！我是军哥懂保的AI智能助手 🤖。我可以回答关于保险、个人介绍、本站功能等相关问题。请问有什么可以帮助您的吗？'
      },
      {
        role: 'user',
        content: '我是张总，军哥帮我做了家族财富传承方案，真的非常感谢！'
      },
      {
        role: 'ai',
        content: '张总您好！很高兴能为您提供服务。能够帮助您实现资产的顺利传承和税务优化是我的荣幸。您的认可就是我继续前进的最大动力！🙏'
      },
      {
        role: 'user',
        content: '军哥的专业度让我非常放心，从需求分析到方案设计都非常细致。'
      },
      {
        role: 'ai',
        content: '感谢您的信任！保险规划需要结合每个客户的实际情况量身定制，我会继续保持专业严谨的态度，为每一位客户提供最优质的服务。'
      },
      {
        role: 'user',
        content: '身边朋友都推荐军哥，服务确实好，保险知识讲解也通俗易懂。'
      },
      {
        role: 'ai',
        content: '非常感谢您的认可和推荐！我会继续努力，让更多的家庭和企业主获得专业的风险保障规划。有任何保险相关问题欢迎随时咨询！💪'
      }
    ]));

    // 首页图片展示数据（荣誉/客户互动/沟通内容）
    localStorage.setItem('showcaseImages', JSON.stringify([
      { id: 1, category: '荣誉时刻', title: '年度销售冠军颁奖典礼', description: '公司年度表彰大会现场', image: '', icon: '🏆' },
      { id: 2, category: '荣誉时刻', title: 'MDRT会员证书颁发', description: '获得全球百万圆桌会议会员资格', image: '', icon: '🎖️' },
      { id: 3, category: '客户互动', title: '与客户签约合影', description: '为企业主完成保障方案签约', image: '', icon: '🤝' },
      { id: 4, category: '客户互动', title: '团队交流分享会', description: '与团队成员分享成功经验', image: '', icon: '👥' },
      { id: 5, category: '沟通内容', title: '客户咨询线上答疑', description: '为客户解答保险相关疑问', image: '', icon: '💬' },
      { id: 6, category: '沟通内容', title: '专业知识培训', description: '参加行业培训提升专业能力', image: '', icon: '📚' }
    ]));

    // 产品介绍数据
    localStorage.setItem('products', JSON.stringify([
      {
        id: 1,
        name: '健康保障方案',
        icon: '🛡️',
        description: '重疾险、医疗险、意外险一站式配置，为您和家人提供全面健康保障。',
        features: ['重疾保障', '百万医疗', '意外保障', '住院津贴'],
        link: '#contact'
      },
      {
        id: 2,
        name: '财富增值规划',
        icon: '💹',
        description: '年金保险、分红保险等长期稳健增值方案，助您实现财富保值增值目标。',
        features: ['长期年金', '分红收益', '灵活领取', '资产隔离'],
        link: '#contact'
      },
      {
        id: 3,
        name: '家族传承计划',
        icon: '🏰',
        description: '保险信托、境外保险等高端方案，帮助高净值客户实现家族财富代际传承。',
        features: ['保险信托', '税务优化', '资产隔离', '代际传承'],
        link: '#contact'
      },
      {
        id: 4,
        name: '企业主保障',
        icon: '🏢',
        description: '企业主专属保障方案，解决企业与家庭资产隔离问题，提供全方位风险防火墙。',
        features: ['股东保障', '资产隔离', '风险管理', '重疾医疗'],
        link: '#contact'
      }
    ]));

    // AI图片展示数据
    localStorage.setItem('aiGalleryImages', JSON.stringify([
      { id: 1, title: '专业服务团队', description: '我们的专业团队随时为您服务', image: '', icon: '👨‍💼' },
      { id: 2, title: '客户案例分享', description: '成功帮助客户解决保障问题', image: '', icon: '🎯' },
      { id: 3, title: '行业交流活动', description: '参与行业论坛分享专业知识', image: '', icon: '🎤' }
    ]));

    // 操作记录
    localStorage.setItem('actionLog', JSON.stringify([]));
  },

  // 访问计数
  updateVisitCount() {
    let count = parseInt(localStorage.getItem('visitCount') || '0');
    count++;
    localStorage.setItem('visitCount', count.toString());
    document.getElementById('visitCount').textContent = count.toLocaleString();
  },

  // 通用CRUD操作
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.error('数据读取失败:', key, e);
      return null;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this.addActionLog('set', key);
  },

  addItem(key, item) {
    const list = this.get(key) || [];
    item.id = Date.now();
    item.created = new Date().toISOString();
    list.push(item);
    this.set(key, list);
    return item;
  },

  updateItem(key, id, updates) {
    const list = this.get(key) || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, updated: new Date().toISOString() };
      this.set(key, list);
      return list[index];
    }
    return null;
  },

  deleteItem(key, id) {
    let list = this.get(key) || [];
    list = list.filter(item => item.id !== id);
    this.set(key, list);
  },

  // 操作日志
  addActionLog(type, detail) {
    const logs = JSON.parse(localStorage.getItem('actionLog') || '[]');
    logs.push({
      type,
      detail,
      time: new Date().toISOString()
    });
    // 只保留最近100条
    if (logs.length > 100) logs.shift();
    localStorage.setItem('actionLog', JSON.stringify(logs));
  },

  // 获取数据统计
  getStatistics() {
    return {
      resumes: (this.get('resumes') || []).length,
      honors: (this.get('honors') || []).length,
      business: (this.get('business') || []).length,
      tools: (this.get('tools') || []).length,
      demands: (this.get('demands') || []).length,
      discussions: (this.get('discussions') || []).length,
      subpages: (this.get('subpages') || []).length,
      products: (this.get('products') || []).length,
      showcases: (this.get('showcaseImages') || []).length,
      aiGallery: (this.get('aiGalleryImages') || []).length,
      visits: parseInt(localStorage.getItem('visitCount') || '0')
    };
  },

  // 导出所有数据
  exportData() {
    const data = {};
    const keys = ['profile', 'resumes', 'honors', 'cases', 'business', 'tools', 'demands', 'discussions', 'subpages', 'aiChatHistory', 'actionLog', 'showcaseImages', 'products', 'aiGalleryImages'];
    keys.forEach(key => {
      data[key] = this.get(key);
    });
    return JSON.stringify(data, null, 2);
  },

  // 导入数据
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      Object.keys(data).forEach(key => {
        if (data[key] !== null) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      });
      return true;
    } catch (e) {
      console.error('数据导入失败:', e);
      return false;
    }
  }
};
