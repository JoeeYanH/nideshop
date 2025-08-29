# NideShop API 接口文档

## 概述

本文档描述了 NideShop 电商平台的所有 API 接口。API 基于 RESTful 风格设计，使用 JSON 格式进行数据交互。

### 基础信息

- **基础 URL**: `http://your-domain.com/api/`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **请求方式**: GET, POST

### 通用响应格式

所有 API 接口都遵循统一的响应格式：

```json
{
  "errno": 0,           // 错误码，0表示成功，非0表示失败
  "errmsg": "success",  // 错误信息或成功信息
  "data": {}           // 响应数据
}
```

### 身份认证

需要登录的接口需要在请求头中包含用户 Token：

```
X-Nideshop-Token: your_token_here
```

### 公开接口列表

以下接口无需登录即可访问：
- 首页相关接口
- 商品展示接口
- 分类接口
- 专题接口
- 品牌接口
- 搜索接口
- 地区接口
- 评论查看接口

---

## 1. 用户认证 (Auth)

### 1.1 微信登录

**接口地址**: `/auth/loginByWeixin`
**请求方式**: POST
**是否需要登录**: 否

**请求参数**:
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "gender": 1,        // 性别 0未知 1男 2女
    "avatarUrl": "头像URL"
  }
}
```

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "token": "jwt_token_string",
    "userInfo": {
      "id": 1,
      "username": "微信用户123456",
      "nickname": "用户昵称",
      "gender": 1,
      "avatar": "头像URL",
      "birthday": null
    }
  }
}
```

### 1.2 用户退出

**接口地址**: `/auth/logout`
**请求方式**: POST
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {}
}
```

---

## 2. 首页 (Index)

### 2.1 首页数据

**接口地址**: `/index/index`
**请求方式**: GET
**是否需要登录**: 否

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "banner": [        // 轮播图
      {
        "id": 1,
        "ad_position_id": 1,
        "media_type": 0,
        "name": "活动名称",
        "link": "链接地址",
        "image_url": "图片URL"
      }
    ],
    "channel": [       // 频道导航
      {
        "id": 1,
        "name": "频道名称",
        "icon_url": "图标URL",
        "sort_order": 1
      }
    ],
    "newGoodsList": [  // 新品推荐
      {
        "id": 1,
        "name": "商品名称",
        "list_pic_url": "商品图片",
        "retail_price": 199.00
      }
    ],
    "hotGoodsList": [  // 热门商品
      {
        "id": 1,
        "name": "商品名称",
        "list_pic_url": "商品图片",
        "retail_price": 199.00,
        "goods_brief": "商品简介"
      }
    ],
    "brandList": [     // 品牌制造商
      {
        "id": 1,
        "name": "品牌名称",
        "floor_price": 99.00,
        "app_list_pic_url": "品牌图片"
      }
    ],
    "topicList": [     // 专题精选
      {
        "id": 1,
        "title": "专题标题",
        "subtitle": "专题副标题",
        "price_info": 99.00,
        "scene_pic_url": "专题图片"
      }
    ],
    "categoryList": [  // 商品分类
      {
        "id": 1,
        "name": "分类名称",
        "goodsList": [
          {
            "id": 1,
            "name": "商品名称",
            "list_pic_url": "商品图片",
            "retail_price": 199.00
          }
        ]
      }
    ]
  }
}
```

---

## 3. 商品 (Goods)

### 3.1 商品列表

**接口地址**: `/goods/list`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| categoryId | int | 否 | 分类ID |
| brandId | int | 否 | 品牌ID |
| keyword | string | 否 | 搜索关键词 |
| isNew | int | 否 | 是否新品 1是 0否 |
| isHot | int | 否 | 是否热门 1是 0否 |
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页数量，默认10 |
| sort | string | 否 | 排序字段 price价格 |
| order | string | 否 | 排序方向 asc升序 desc降序 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 100,
    "totalPages": 10,
    "pagesize": 10,
    "currentPage": 1,
    "data": [
      {
        "id": 1,
        "name": "商品名称",
        "list_pic_url": "商品图片",
        "retail_price": 199.00
      }
    ],
    "filterCategory": [  // 筛选分类
      {
        "id": 0,
        "name": "全部",
        "checked": true
      }
    ]
  }
}
```

### 3.2 商品详情

**接口地址**: `/goods/detail`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 商品ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "info": {            // 商品基本信息
      "id": 1,
      "name": "商品名称",
      "list_pic_url": "商品图片",
      "retail_price": 199.00,
      "goods_brief": "商品简介",
      "goods_desc": "商品详情HTML",
      "is_on_sale": 1,
      "goods_number": 100
    },
    "gallery": [         // 商品相册
      {
        "id": 1,
        "goods_id": 1,
        "img_url": "图片URL",
        "img_desc": "图片描述"
      }
    ],
    "attribute": [       // 商品属性
      {
        "name": "属性名",
        "value": "属性值"
      }
    ],
    "userHasCollect": 0, // 用户是否收藏 0否 1是
    "issue": [           // 常见问题
      {
        "id": 1,
        "question": "问题",
        "answer": "答案"
      }
    ],
    "comment": {         // 评论信息
      "count": 10,       // 评论总数
      "data": {          // 热门评论
        "content": "评论内容",
        "add_time": "2023-01-01 12:00:00",
        "nickname": "用户昵称",
        "avatar": "头像URL",
        "pic_list": []   // 评论图片
      }
    },
    "brand": {           // 品牌信息
      "id": 1,
      "name": "品牌名称",
      "floor_price": 99.00
    },
    "specificationList": [  // 规格列表
      {
        "specification_id": 1,
        "name": "规格名",
        "valueList": [
          {
            "id": 1,
            "value": "规格值",
            "pic_url": "规格图片"
          }
        ]
      }
    ],
    "productList": [     // 货品列表
      {
        "id": 1,
        "goods_id": 1,
        "goods_specification_ids": "1_2",
        "goods_sn": "商品编号",
        "retail_price": 199.00,
        "goods_number": 100
      }
    ]
  }
}
```

### 3.3 商品SKU信息

**接口地址**: `/goods/sku`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 商品ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "specificationList": [], // 规格列表
    "productList": []        // 货品列表
  }
}
```

### 3.4 相关商品推荐

**接口地址**: `/goods/related`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 商品ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "goodsList": [
      {
        "id": 1,
        "name": "商品名称",
        "list_pic_url": "商品图片",
        "retail_price": 199.00
      }
    ]
  }
}
```

### 3.5 商品总数

**接口地址**: `/goods/count`
**请求方式**: GET
**是否需要登录**: 否

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "goodsCount": 1000
  }
}
```

### 3.6 新品首发页面信息

**接口地址**: `/goods/new`
**请求方式**: GET
**是否需要登录**: 否

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "bannerInfo": {
      "url": "",
      "name": "坚持初心，为你寻觅世间好物",
      "img_url": "banner图片URL"
    }
  }
}
```

### 3.7 人气推荐页面信息

**接口地址**: `/goods/hot`
**请求方式**: GET
**是否需要登录**: 否

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "bannerInfo": {
      "url": "",
      "name": "大家都在买的严选好物",
      "img_url": "banner图片URL"
    }
  }
}
```

---

## 4. 商品分类 (Catalog)

### 4.1 分类首页数据

**接口地址**: `/catalog/index`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 否 | 分类ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "categoryList": [    // 分类列表
      {
        "id": 1,
        "name": "分类名称",
        "front_name": "分类前端显示名",
        "front_desc": "分类描述",
        "icon_url": "分类图标"
      }
    ],
    "currentCategory": { // 当前分类
      "id": 1,
      "name": "分类名称",
      "subCategoryList": [  // 子分类列表
        {
          "id": 11,
          "name": "子分类名称",
          "front_name": "子分类前端显示名"
        }
      ]
    }
  }
}
```

### 4.2 当前分类信息

**接口地址**: `/catalog/current`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 分类ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "currentCategory": {
      "id": 1,
      "name": "分类名称",
      "subCategoryList": []
    }
  }
}
```

---

## 5. 购物车 (Cart)

### 5.1 购物车首页

**接口地址**: `/cart/index`
**请求方式**: GET
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "cartList": [        // 购物车商品列表
      {
        "id": 1,
        "goods_id": 1,
        "goods_name": "商品名称",
        "list_pic_url": "商品图片",
        "number": 2,
        "retail_price": 199.00,
        "checked": 1,    // 是否选中 0否 1是
        "goods_specifition_name_value": "规格信息"
      }
    ],
    "cartTotal": {       // 购物车统计
      "goodsCount": 3,           // 商品总件数
      "goodsAmount": 597.00,     // 商品总金额
      "checkedGoodsCount": 2,    // 选中商品件数
      "checkedGoodsAmount": 398.00  // 选中商品金额
    }
  }
}
```

### 5.2 添加商品到购物车

**接口地址**: `/cart/add`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "goodsId": 1,      // 商品ID
  "productId": 1,    // 货品ID
  "number": 2        // 数量
}
```

**响应数据**: 同购物车首页

### 5.3 更新购物车商品

**接口地址**: `/cart/update`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "id": 1,           // 购物车记录ID
  "goodsId": 1,      // 商品ID
  "productId": 1,    // 货品ID
  "number": 3        // 数量
}
```

**响应数据**: 同购物车首页

### 5.4 选中/取消商品

**接口地址**: `/cart/checked`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "productIds": "1,2,3",  // 货品ID列表，逗号分隔
  "isChecked": 1          // 是否选中 0否 1是
}
```

**响应数据**: 同购物车首页

### 5.5 删除购物车商品

**接口地址**: `/cart/delete`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "productIds": "1,2,3"   // 货品ID列表，逗号分隔
}
```

**响应数据**: 同购物车首页

### 5.6 购物车商品总数

**接口地址**: `/cart/goodscount`
**请求方式**: GET
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "cartTotal": {
      "goodsCount": 5
    }
  }
}
```

### 5.7 购物车下单页

**接口地址**: `/cart/checkout`
**请求方式**: GET
**是否需要登录**: 是

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| addressId | int | 否 | 收货地址ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "checkedAddress": {      // 收货地址
      "id": 1,
      "name": "收货人",
      "mobile": "手机号",
      "full_region": "完整地址",
      "address": "详细地址"
    },
    "freightPrice": 0.00,    // 运费
    "checkedCoupon": {},     // 选中的优惠券
    "couponList": [],        // 可用优惠券
    "couponPrice": 0.00,     // 优惠券金额
    "checkedGoodsList": [    // 选中的商品
      {
        "id": 1,
        "goods_name": "商品名称",
        "number": 2,
        "retail_price": 199.00
      }
    ],
    "goodsTotalPrice": 398.00,   // 商品总价
    "orderTotalPrice": 398.00,   // 订单总价
    "actualPrice": 398.00        // 实际支付金额
  }
}
```

---

## 6. 订单 (Order)

### 6.1 订单列表

**接口地址**: `/order/list`
**请求方式**: GET
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 10,
    "totalPages": 1,
    "pagesize": 10,
    "currentPage": 1,
    "data": [
      {
        "id": 1,
        "order_sn": "订单编号",
        "order_status": 0,           // 订单状态
        "order_status_text": "待付款",
        "goods_price": 398.00,       // 商品金额
        "freight_price": 0.00,       // 运费
        "actual_price": 398.00,      // 实际支付金额
        "add_time": 1640995200,      // 下单时间
        "goodsList": [               // 订单商品
          {
            "id": 1,
            "goods_name": "商品名称",
            "goods_sn": "商品编号",
            "list_pic_url": "商品图片",
            "number": 2,
            "retail_price": 199.00
          }
        ],
        "goodsCount": 2,             // 商品总件数
        "handleOption": {            // 可操作选项
          "cancel": true,            // 可取消
          "delete": false,           // 可删除
          "pay": true,               // 可支付
          "comment": false,          // 可评价
          "delivery": false,         // 可发货
          "confirm": false,          // 可确认收货
          "return": false            // 可退货
        }
      }
    ]
  }
}
```

### 6.2 订单详情

**接口地址**: `/order/detail`
**请求方式**: GET
**是否需要登录**: 是

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderId | int | 是 | 订单ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "orderInfo": {               // 订单信息
      "id": 1,
      "order_sn": "订单编号",
      "order_status": 0,
      "order_status_text": "待付款",
      "consignee": "收货人",
      "mobile": "收货手机",
      "full_region": "收货地区",
      "address": "详细地址",
      "goods_price": 398.00,
      "freight_price": 0.00,
      "actual_price": 398.00,
      "add_time": "2023-01-01 12:00:00",
      "final_pay_time": "29:59",   // 剩余支付时间
      "express": {                 // 物流信息
        "shipperCode": "快递公司编码",
        "shipperName": "快递公司名称",
        "logisticCode": "物流单号",
        "traces": []               // 物流轨迹
      }
    },
    "orderGoods": [              // 订单商品
      {
        "id": 1,
        "order_id": 1,
        "goods_id": 1,
        "goods_name": "商品名称",
        "goods_sn": "商品编号",
        "list_pic_url": "商品图片",
        "number": 2,
        "retail_price": 199.00,
        "goods_specifition_name_value": "规格信息"
      }
    ],
    "handleOption": {            // 可操作选项
      "cancel": true,
      "delete": false,
      "pay": true,
      "comment": false,
      "delivery": false,
      "confirm": false,
      "return": false
    }
  }
}
```

### 6.3 提交订单

**接口地址**: `/order/submit`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "addressId": 1,     // 收货地址ID
  "couponId": 0,      // 优惠券ID，0表示不使用
  "message": "",      // 留言
  "grouponRulesId": 0,     // 团购规则ID
  "grouponLinkId": 0       // 团购关联ID
}
```

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "orderId": 1
  }
}
```

### 6.4 查询物流

**接口地址**: `/order/express`
**请求方式**: GET
**是否需要登录**: 是

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderId | int | 是 | 订单ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "shipperCode": "SF",
    "shipperName": "顺丰速运",
    "logisticCode": "123456789",
    "traces": [
      {
        "acceptTime": "2023-01-01 12:00:00",
        "acceptStation": "已发货"
      }
    ]
  }
}
```

---

## 7. 支付 (Pay)

### 7.1 获取支付参数

**接口地址**: `/pay/prepay`
**请求方式**: GET
**是否需要登录**: 是

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderId | int | 是 | 订单ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "appId": "微信小程序appId",
    "timeStamp": "时间戳",
    "nonceStr": "随机字符串",
    "package": "prepay_id=xxx",
    "signType": "MD5",
    "paySign": "签名"
  }
}
```

### 7.2 支付回调

**接口地址**: `/pay/notify`
**请求方式**: POST
**是否需要登录**: 否

此接口用于接收微信支付的异步通知，由微信服务器调用。

---

## 8. 收货地址 (Address)

### 8.1 收货地址列表

**接口地址**: `/address/list`
**请求方式**: GET
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": [
    {
      "id": 1,
      "name": "收货人",
      "mobile": "手机号",
      "province_id": 1,
      "province_name": "省份",
      "city_id": 1,
      "city_name": "城市",
      "district_id": 1,
      "district_name": "区县",
      "full_region": "完整地区",
      "address": "详细地址",
      "is_default": 1    // 是否默认 0否 1是
    }
  ]
}
```

### 8.2 收货地址详情

**接口地址**: `/address/detail`
**请求方式**: GET
**是否需要登录**: 是

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 地址ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "id": 1,
    "name": "收货人",
    "mobile": "手机号",
    "province_id": 1,
    "province_name": "省份",
    "city_id": 1,
    "city_name": "城市",
    "district_id": 1,
    "district_name": "区县",
    "full_region": "完整地区",
    "address": "详细地址",
    "is_default": 1
  }
}
```

### 8.3 保存收货地址

**接口地址**: `/address/save`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "id": 0,              // 地址ID，0为新增，大于0为更新
  "name": "收货人",
  "mobile": "手机号",
  "province_id": 1,     // 省份ID
  "city_id": 1,         // 城市ID
  "district_id": 1,     // 区县ID
  "address": "详细地址",
  "is_default": true    // 是否设为默认
}
```

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "id": 1,
    "name": "收货人",
    "mobile": "手机号",
    "address": "详细地址"
  }
}
```

### 8.4 删除收货地址

**接口地址**: `/address/delete`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "id": 1    // 地址ID
}
```

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "删除成功",
  "data": {}
}
```

---

## 9. 用户中心 (User)

### 9.1 用户信息

**接口地址**: `/user/info`
**请求方式**: GET
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "gender": 1,
    "birthday": "1990-01-01",
    "mobile": "手机号",
    "avatar": "头像URL"
  }
}
```

### 9.2 保存头像

**接口地址**: `/user/saveAvatar`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**: 
- 表单提交，字段名为 `avatar`

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {}
}
```

---

## 10. 商品收藏 (Collect)

### 10.1 收藏列表

**接口地址**: `/collect/list`
**请求方式**: GET
**是否需要登录**: 是

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | int | 是 | 收藏类型 0商品 1专题 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 10,
    "data": [
      {
        "id": 1,
        "type_id": 0,
        "value_id": 1,
        "name": "商品名称",
        "list_pic_url": "商品图片",
        "goods_brief": "商品简介",
        "retail_price": 199.00,
        "add_time": 1640995200
      }
    ]
  }
}
```

### 10.2 添加/取消收藏

**接口地址**: `/collect/addordelete`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "typeId": 0,    // 收藏类型 0商品 1专题
  "valueId": 1    // 商品ID或专题ID
}
```

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "type": "add"   // add添加 delete删除
  }
}
```

---

## 11. 浏览足迹 (Footprint)

### 11.1 足迹列表

**接口地址**: `/footprint/list`
**请求方式**: GET
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 10,
    "data": [
      {
        "id": 1,
        "goods_id": 1,
        "name": "商品名称",
        "list_pic_url": "商品图片",
        "goods_brief": "商品简介",
        "retail_price": 199.00,
        "add_time": "今天"
      }
    ]
  }
}
```

---

## 12. 商品评论 (Comment)

### 12.1 评论列表

**接口地址**: `/comment/list`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | int | 是 | 评论类型 0商品 1专题 |
| valueId | int | 是 | 商品ID或专题ID |
| showType | int | 否 | 显示类型 0全部 1只显示有图片 |
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页数量，默认10 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 10,
    "data": [
      {
        "id": 1,
        "type_id": 0,
        "value_id": 1,
        "content": "评论内容",
        "add_time": "2023-01-01 12:00:00",
        "user_info": {
          "username": "用户名",
          "nickname": "昵称",
          "avatar": "头像URL"
        },
        "pic_list": [    // 评论图片
          {
            "id": 1,
            "comment_id": 1,
            "pic_url": "图片URL"
          }
        ]
      }
    ]
  }
}
```

### 12.2 评论统计

**接口地址**: `/comment/count`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| typeId | int | 是 | 评论类型 0商品 1专题 |
| valueId | int | 是 | 商品ID或专题ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "allCount": 10,      // 全部评论数
    "hasPicCount": 3     // 有图评论数
  }
}
```

### 12.3 发表评论

**接口地址**: `/comment/post`
**请求方式**: POST
**是否需要登录**: 是

**请求参数**:
```json
{
  "typeId": 0,        // 评论类型 0商品 1专题
  "valueId": 1,       // 商品ID或专题ID
  "content": "评论内容"
}
```

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "评论添加成功",
  "data": {}
}
```

---

## 13. 品牌 (Brand)

### 13.1 品牌列表

**接口地址**: `/brand/list`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页数量，默认10 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 50,
    "data": [
      {
        "id": 1,
        "name": "品牌名称",
        "floor_price": 99.00,
        "app_list_pic_url": "品牌图片"
      }
    ]
  }
}
```

### 13.2 品牌详情

**接口地址**: `/brand/detail`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 品牌ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "brand": {
      "id": 1,
      "name": "品牌名称",
      "floor_price": 99.00,
      "app_list_pic_url": "品牌图片",
      "brand_desc": "品牌描述"
    }
  }
}
```

---

## 14. 专题 (Topic)

### 14.1 专题列表

**接口地址**: `/topic/list`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| size | int | 否 | 每页数量，默认10 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "count": 20,
    "data": [
      {
        "id": 1,
        "title": "专题标题",
        "subtitle": "专题副标题",
        "price_info": 99.00,
        "scene_pic_url": "专题图片"
      }
    ]
  }
}
```

### 14.2 专题详情

**接口地址**: `/topic/detail`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 专题ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "id": 1,
    "title": "专题标题",
    "subtitle": "专题副标题",
    "price_info": 99.00,
    "scene_pic_url": "专题图片",
    "content": "专题内容HTML"
  }
}
```

### 14.3 相关专题

**接口地址**: `/topic/related`
**请求方式**: GET
**是否需要登录**: 否

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": [
    {
      "id": 1,
      "title": "专题标题",
      "subtitle": "专题副标题",
      "price_info": 99.00,
      "scene_pic_url": "专题图片"
    }
  ]
}
```

---

## 15. 搜索 (Search)

### 15.1 搜索页面数据

**接口地址**: `/search/index`
**请求方式**: GET
**是否需要登录**: 否

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "defaultKeyword": {      // 默认关键词
      "id": 1,
      "keyword": "默认关键词",
      "is_default": 1
    },
    "historyKeywordList": [  // 搜索历史
      "历史关键词1",
      "历史关键词2"
    ],
    "hotKeywordList": [      // 热门关键词
      {
        "keyword": "热门关键词",
        "is_hot": 1
      }
    ]
  }
}
```

### 15.2 搜索提示

**接口地址**: `/search/helper`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": [
    "搜索建议1",
    "搜索建议2",
    "搜索建议3"
  ]
}
```

### 15.3 清除搜索历史

**接口地址**: `/search/clearhistory`
**请求方式**: POST
**是否需要登录**: 是

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {}
}
```

---

## 16. 地区 (Region)

### 16.1 地区列表

**接口地址**: `/region/list`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| parentId | int | 否 | 父级地区ID，0为省份 |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": [
    {
      "id": 1,
      "name": "地区名称",
      "type": 1,        // 地区类型 1省份 2城市 3区县
      "agency_id": 0
    }
  ]
}
```

### 16.2 地区信息

**接口地址**: `/region/info`
**请求方式**: GET
**是否需要登录**: 否

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| regionId | int | 是 | 地区ID |

**响应数据**:
```json
{
  "errno": 0,
  "errmsg": "success",
  "data": {
    "id": 1,
    "name": "地区名称",
    "type": 1,
    "agency_id": 0
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或登录已过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. 所有需要登录的接口都需要在请求头中携带 `X-Nideshop-Token`
2. 所有价格相关字段都是 decimal 类型，单位为元
3. 所有时间字段如无特殊说明均为 Unix 时间戳
4. 分页参数 `page` 从 1 开始
5. 文件上传接口需要使用 `multipart/form-data` 格式
6. 微信支付相关接口需要先配置微信支付参数

---

*本文档基于 NideShop v1.0.0 版本编写，如有疑问请联系开发团队。*
