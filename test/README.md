# NideShop API 测试

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行测试

### 运行所有测试
```bash
python test_api.py
```

### 使用 pytest 运行
```bash
pytest test_api.py -v
```

### 运行特定测试
```bash
pytest test_api.py::TestNideShopAPI::test_index_data -v
```

## 测试覆盖的接口

本测试套件覆盖了以下非登录接口：

### 首页接口
- ✅ `/index/index` - 首页数据

### 商品接口  
- ✅ `/goods/list` - 商品列表
- ✅ `/goods/detail` - 商品详情
- ✅ `/goods/sku` - 商品SKU信息
- ✅ `/goods/related` - 相关商品推荐
- ✅ `/goods/count` - 商品总数
- ✅ `/goods/new` - 新品首发页面信息
- ✅ `/goods/hot` - 人气推荐页面信息

### 商品分类接口
- ✅ `/catalog/index` - 分类首页数据
- ✅ `/catalog/current` - 当前分类信息

### 品牌接口
- ✅ `/brand/list` - 品牌列表
- ✅ `/brand/detail` - 品牌详情

### 专题接口
- ✅ `/topic/list` - 专题列表
- ✅ `/topic/detail` - 专题详情
- ✅ `/topic/related` - 相关专题

### 搜索接口
- ✅ `/search/index` - 搜索页面数据
- ✅ `/search/helper` - 搜索提示

### 地区接口
- ✅ `/region/list` - 地区列表
- ✅ `/region/info` - 地区信息

### 评论接口
- ✅ `/comment/list` - 评论列表
- ✅ `/comment/count` - 评论统计

### 认证接口
- ✅ `/auth/loginByWeixin` - 微信登录（接口可达性测试）

## 注意事项

1. 确保 NideShop 服务已启动并运行在 `http://localhost:8360`
2. 部分测试依赖于数据库中的数据，如果数据库为空，某些测试会跳过
3. 微信登录接口只测试可达性，不测试实际功能
4. 所有测试都验证了统一的响应格式（errno、errmsg、data字段）
