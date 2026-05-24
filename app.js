const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const crypto = require('crypto');
const axios = require('axios');

const app = new Koa();
const router = new Router();
app.use(bodyParser());

// ======================
// 你的配置（保持不变）
// ======================
const CONFIG = {
  APPID: "tt3cb54a08a2d2c71901",
  SALT: "vOwpBgJOEpsirRkMXrN3uWOHoexeuAY96rrT3Rxt",
  NOTIFY_URL: "https://1m2203e98ml1v-env-1oAVPPHK7S.service.douyincloud.run/api/pay/notify",
  SERVER_PORT: 8000
};

// MD5签名
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex').toLowerCase();
}

// 生成签名
function generateSign(params, salt) {
  let keys = Object.keys(params).sort();
  let str = '';
  for (let k of keys) {
    if (params[k] !== '' && params[k] != null) str += k + params[k];
  }
  str += salt;
  return md5(str);
}

// ======================
// 【修复】预下单接口
// ======================
router.post('/api/pay/create', async (ctx) => {
  try {
    const { openid, packageType, out_order_no } = ctx.request.body;

    let total_amount, subject;
    switch(packageType){
      case 'quarter': total_amount = 4900; subject = "3个月授权"; break;
      case 'year': total_amount = 9900; subject = "包年授权"; break;
      case 'permanent': total_amount = 29900; subject = "永久授权"; break;
      default:
        ctx.body = { code: -1, msg: "套餐错误" };
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

    // ✅【修复】使用沙箱地址
    const { data } = await axios.post(
      "https://open-sandbox.douyin.com/api/ecpay/v1/create_order",
      params
    );

    // ✅【关键修复】返回格式 100% 匹配你的小程序需要！
    ctx.body = {
      code: 0,
      data: {
        order_id: data.order_id,
        order_token: data.order_token
      }
    };

  } catch (err) {
    ctx.body = { code: -1, msg: "预下单失败" };
  }
});

// 回调接口
router.post('/api/pay/notify', async (ctx) => {
  try {
    const body = ctx.request.body;
    const sign = body.sign;
    delete body.sign;
    const localSign = generateSign(body, CONFIG.SALT);
    ctx.body = localSign === sign ? "SUCCESS" : "FAIL";
  } catch (e) {
    ctx.body = "FAIL";
  }
});

// 健康检查
router.get('/', async (ctx) => {
  ctx.body = "Server is running";
});

app.use(router.routes());
app.listen(CONFIG.SERVER_PORT, '0.0.0.0');