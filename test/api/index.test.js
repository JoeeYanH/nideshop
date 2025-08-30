/**
 * 首页 API 测试
 * 测试首页相关的公开接口
 */

const axios = require('axios');

describe('Public API - Index Controller', () => {
  let api;

  beforeAll(() => {
    api = axios.create({
      baseURL: global.testConfig.baseURL + '/api',
      timeout: global.testConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NideShop-Test/1.0.0'
      }
    });
  });

  describe('GET /api/index/index', () => {
    test('应该返回首页数据', async () => {
      const response = await api.get('/index/index');
      
      expect(response.status).toBe(200);
      global.testHelpers.validateApiResponse(response);
      
      const { data } = response.data;
      
      // 验证返回的数据结构
      expect(data).toHaveProperty('banner');
      expect(data).toHaveProperty('channel'); 
      expect(data).toHaveProperty('newGoodsList');
      expect(data).toHaveProperty('hotGoodsList');
      expect(data).toHaveProperty('brandList');
      expect(data).toHaveProperty('topicList');
      expect(data).toHaveProperty('categoryList');
      
      // 验证数据类型
      expect(Array.isArray(data.banner)).toBe(true);
      expect(Array.isArray(data.channel)).toBe(true);
      expect(Array.isArray(data.newGoodsList)).toBe(true);
      expect(Array.isArray(data.hotGoodsList)).toBe(true);
      expect(Array.isArray(data.brandList)).toBe(true);
      expect(Array.isArray(data.topicList)).toBe(true);
      expect(Array.isArray(data.categoryList)).toBe(true);
    });

    test('新品商品列表应该包含正确的字段', async () => {
      const response = await api.get('/index/index');
      const { newGoodsList } = response.data.data;
      
      if (newGoodsList.length > 0) {
        newGoodsList.forEach(goods => {
          global.testHelpers.validateGoodsItem(goods);
        });
      }
    });

    test('热门商品列表应该包含正确的字段', async () => {
      const response = await api.get('/index/index');
      const { hotGoodsList } = response.data.data;
      
      if (hotGoodsList.length > 0) {
        hotGoodsList.forEach(goods => {
          global.testHelpers.validateGoodsItem(goods);
          expect(goods).toHaveProperty('goods_brief');
        });
      }
    });

    test('品牌列表应该包含正确的字段', async () => {
      const response = await api.get('/index/index');
      const { brandList } = response.data.data;
      
      if (brandList.length > 0) {
        brandList.forEach(brand => {
          global.testHelpers.validateBrandItem(brand);
        });
      }
    });

    test('分类列表应该包含商品信息', async () => {
      const response = await api.get('/index/index');
      const { categoryList } = response.data.data;
      
      if (categoryList.length > 0) {
        categoryList.forEach(category => {
          global.testHelpers.validateCategoryItem(category);
          expect(category).toHaveProperty('goodsList');
          expect(Array.isArray(category.goodsList)).toBe(true);
          
          // 验证商品列表
          category.goodsList.forEach(goods => {
            global.testHelpers.validateGoodsItem(goods);
          });
        });
      }
    });

    test('响应时间应该合理', async () => {
      const startTime = Date.now();
      await api.get('/index/index');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });
  });
});
