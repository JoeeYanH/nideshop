/**
 * 商品分类 API 测试
 * 测试分类相关的公开接口
 */

const axios = require('axios');

describe('Public API - Catalog Controller', () => {
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

  describe('GET /api/catalog/index', () => {
    test('应该返回分类首页数据', async () => {
      const response = await api.get('/catalog/index');
      
      expect(response.status).toBe(200);
      global.testHelpers.validateApiResponse(response);
      
      const { data } = response.data;
      
      // 验证返回的数据结构
      expect(data).toHaveProperty('categoryList');
      expect(data).toHaveProperty('currentCategory');
      
      expect(Array.isArray(data.categoryList)).toBe(true);
    });

    test('分类列表应该包含正确的字段', async () => {
      const response = await api.get('/catalog/index');
      const { categoryList } = response.data.data;
      
      if (categoryList.length > 0) {
        categoryList.forEach(category => {
          global.testHelpers.validateCategoryItem(category);
        });
      }
    });
  });

  describe('GET /api/catalog/current', () => {
    test('应该返回指定分类的详细信息', async () => {
      // 先获取分类列表
      const indexResponse = await api.get('/catalog/index');
      const { categoryList } = indexResponse.data.data;
      
      if (categoryList.length > 0) {
        const categoryId = categoryList[0].id;
        
        const response = await api.get('/catalog/current', {
          params: { id: categoryId }
        });
        
        expect(response.status).toBe(200);
        global.testHelpers.validateApiResponse(response);
        
        const { data } = response.data;
        expect(data).toHaveProperty('currentCategory');
        expect(data).toHaveProperty('parentCategory');
        expect(data).toHaveProperty('brotherCategory');
        
        if (data.currentCategory) {
          global.testHelpers.validateCategoryItem(data.currentCategory);
        }
      }
    });

    test('无效的分类ID应该返回合适的响应', async () => {
      const response = await api.get('/catalog/current', {
        params: { id: 99999 }
      });
      
      expect(response.status).toBe(200);
      // 这里可能返回空数据或错误信息，根据实际API行为调整
    });
  });
});
