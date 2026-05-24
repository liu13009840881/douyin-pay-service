const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const crypto = require('crypto');
const axios = require('axios');

const app = new Koa();
const router = new Router();
app.use(bodyParser());

// ==========================
// 【你的正式信息】上线前务必改对！
// ==========================
const CONFIG = {
  APPID: "tt3cb54a08a2d2c71901",
  MERCHANT_KEY: "vOwpBgJOEpsirRkMXrN3uWOHoexeuAY96rrT3Rxt",
  NOTIFY_URL: "https://1m2203e98ml1v-env-1oAVPPHK7S.service.douyincloud.run/api/pay/notify",
};

// ==========================
// 普通支付 MD5 签名（抖音官方规则）
// ==========================
function generateSign(params, key) {
  let keys = Object.keys(params).sort();
  let str = '';
  for (let k of keys) {
    if (params[k] !== '' && params[k] != null) {
      str += k + params[k];
    }
  }
  str += key;
  return crypto.createHash('md5').update(str).digest('hex').toLowerCase();
}

// ==========================
// 预下单接口 → 给小程序调用
// ==========================
router.post('/api/pay/create', async (ctx) => {
  try {
    const { openid, packageType, out_order_no } = ctx.request.body;

    // 套餐价格（单位：分）
    let total_amount, subject;
    switch (packageType) {
      case 'quarter':
        total_amount = 4900;
        subject = "球动乾坤-3个月授权";
        break;
      case 'year':
        total_amount = 9900;
        subject = "球动乾坤-包年授权";
        break;
      case 'permanent':
        total_amount = 29900;
        subject = "球动乾坤-永久授权";
        break;
      default:
        ctx.body = { code: -1, msg: "套餐错误" };
        return;
    }

    // 抖音普通支付（微信）参数
    let params = {
      app_id: CONFIG.APPID,
      out_order_no: out_order_no,
      total_amount: total_amount,
      subject: subject,
      body: "球动乾坤报名助手",
      notify_url: CONFIG.NOTIFY_URL,
      pay_type: "WXPAY",
      valid_min: 15
    };

    // 签名
    params.sign = generateSign(params, CONFIG.MERCHANT_KEY);

    // 请求抖音正式支付接口
    const { data } = await axios.post(
      "https://open.douyin.com/api/trade/v2/order/create",
      params
    );

    // 返回给小程序 → 只需要 order_id
    ctx.body = {
      code: 0,
      data: {
        order_id: data.order_id
      }
    };

  } catch (err) {
    ctx.body = { code: -1, msg: "预下单失败" };
  }
});

// ==========================
// 支付结果回调（正式上线必须）
// ==========================
router.post('/api/pay/notify', async (ctx) => {
  try {
    const body = ctx.request.body;
    const sign = body.sign;
    delete body.sign;

    const localSign = generateSign(body, CONFIG.MERCHANT_KEY);
    ctx.body = localSign === sign ? "SUCCESS" : "FAIL";

    if (body.trade_status === "SUCCESS") {
      console.log("✅ 支付成功", body.out_order_no);
      // 这里写：给用户开通权限
    }
  } catch (e) {
    ctx.body = "FAIL";
  }
});

// 健康检查
router.get('/', async (ctx) => {
  ctx.body = "Server is running";
});

app.use(router.routes());
app.listen(8000, '0.0.0.0');