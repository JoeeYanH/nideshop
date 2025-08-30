/**
 * NideShop API Testing Configuration
 * 测试环境配置文件
 */

// 测试配置
global.testConfig = {
  // API 服务器地址
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:8360',
  
  // 超时设置
  timeout: 30000,
  
  // 测试用户数据
  testUser: {
    username: 'test_user',
    password: 'test123456',
    mobile: '13800138000'
  },
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: 'nideshop',
    user: 'nideshop',
    password: 'nideshop123'
  }
};

// 全局变量
global.apiUrl = (path) => `${global.testConfig.baseURL}/api${path}`;

// Jest 配置
beforeAll(() => {
  console.log('🚀 启动 NideShop API 测试套件');
  console.log(`📡 测试服务器: ${global.testConfig.baseURL}`);
});

afterAll(() => {
  console.log('✅ NideShop API 测试完成');
});

// 通用测试辅助函数
global.testHelpers = {
  /**
   * 验证 API 响应结构
   */
  validateApiResponse: (response, expectSuccess = true) => {
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('errno');
    expect(response.data).toHaveProperty('errmsg');
    
    if (expectSuccess) {
      expect(response.data.errno).toBe(0);
      expect(response.data.errmsg).toBe('成功');
      expect(response.data).toHaveProperty('data');
    }
  },
  
  /**
   * 等待指定时间
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * 生成随机字符串
   */
  randomString: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * 验证商品数据结构
   */
  validateGoodsItem: (goods) => {
    expect(goods).toHaveProperty('id');
    expect(goods).toHaveProperty('name');
    expect(goods).toHaveProperty('list_pic_url');
    expect(goods).toHaveProperty('retail_price');
    expect(typeof goods.id).toBe('number');
    expect(typeof goods.name).toBe('string');
    expect(typeof goods.retail_price).toBe('string');
  },
  
  /**
   * 验证分类数据结构
   */
  validateCategoryItem: (category) => {
    expect(category).toHaveProperty('id');
    expect(category).toHaveProperty('name');
    expect(typeof category.id).toBe('number');
    expect(typeof category.name).toBe('string');
  },
  
  /**
   * 验证品牌数据结构
   */
  validateBrandItem: (brand) => {
    expect(brand).toHaveProperty('id');
    expect(brand).toHaveProperty('name');
    expect(typeof brand.id).toBe('number');
    expect(typeof brand.name).toBe('string');
  }
};
