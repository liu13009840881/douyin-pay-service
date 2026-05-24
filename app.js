const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const crypto = require('crypto');
const axios = require('axios');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// ==========================
// 填写你的信息
// ==========================
const CONFIG = {
  APPID: "tt3cb54a08a2d2c71901",
  SALT: "vOwpBgJOEpsirRkMXrN3uWOHoexeuAY96rrT3Rxt",
  NOTIFY_URL: "https://1m2203e98ml1v-env-1oAVPPHK7S.service.douyincloud.run/api/pay/notify",
  SERVER_PORT: 8000
};

// MD5 签名
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex').toLowerCase();
}

// 生成签名
function generateSign(params, salt) {
  let keys = Object.keys(params).sort();
  let str = '';
  for (let k of keys) {
    if (params[k] !== '' && params[k] !== undefined && params[k] !== null) {
      str += k + params[k];
    }
  }
  str += salt;
  return md5(str);
}

// --------------------------
// 预下单接口（返回 order_id + order_token）
// --------------------------
router.post('/api/pay/create', async (ctx) => {
  try {
    const { openid, packageType, out_order_no } = ctx.request.body;

    let total_amount, subject;
    switch(packageType){
      case 'quarter':
        total_amount = 4900;
        subject = '球动乾坤-3个月授权';
        break;
      case 'year':
        total_amount = 9900;
        subject = '球动乾坤-年度授权';
        break;
      case 'permanent':
        total_amount = 29900;
        subject = '球动乾坤-永久授权';
        break;
      default:
        ctx.body = { code: -1, msg: '套餐错误' };
        return;
    }

    let params = {
      appid: CONFIG.APPID,
      out_order_no: out_order_no,
      total_amount: total_amount,
      subject: subject,
      body: "球动乾坤报名助手",
      notify_url: CONFIG.NOTIFY_URL,
      valid_time: "900",
      channel: "TT"
    };

    params.sign = generateSign(params, CONFIG.SALT);

    // 请求抖音担保支付
    const res = await axios.post(
      "https://open.douyin.com/api/ecpay/v1/create_order",
      params
    );

    // --------------------------
    // 关键修复：同时返回 order_id 和 order_token
    // --------------------------
    const data = res.data;
    ctx.body = {
      code: 0,
      order_id: data.order_id,      // 抖音返回的订单ID
      order_token: data.order_token,// 支付令牌
      out_order_no: out_order_no
    };

  } catch (err) {
    ctx.body = { code: -1, msg: "下单失败" };
  }
});

// --------------------------
// 支付回调
// --------------------------
router.post('/api/pay/notify', async (ctx) => {
  try {
    const data = ctx.request.body;
    const sign = data.sign;
    delete data.sign;
    const localSign = generateSign(data, CONFIG.SALT);
    if (localSign !== sign) { ctx.body = "FAIL"; return; }
    if (data.trade_status === "SUCCESS") {
      console.log("支付成功 =>", data.out_order_no);
    }
    ctx.body = "SUCCESS";
  } catch (e) {
    ctx.body = "FAIL";
  }
});

// 健康检查
router.get('/', async (ctx) => {
  ctx.body = "Server is running";
});

app.use(router.routes());

app.listen(CONFIG.SERVER_PORT, '0.0.0.0', () => {
  console.log("服务启动 0.0.0.0:8000");
});