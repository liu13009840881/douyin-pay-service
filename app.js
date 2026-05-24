const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const crypto = require('crypto');
const axios = require('axios');

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// ==========================
// 在这里填写你的信息
// ==========================
const CONFIG = {
  APPID: "tt3cb54a08a2d2c71901",
  SALT: "vOwpBgJOEpsirRkMXrN3uWOHoexeuAY96rrT3Rxt",
  NOTIFY_URL: "https://1m2203e98ml1v-env-1oAVPPHK7S.service.douyincloud.run",
  SERVER_PORT: 8000
};

// 工具：MD5 签名（抖音担保支付必须）
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
// 1. 预下单接口（小程序调用）
// --------------------------
router.post('/api/pay/create', async (ctx) => {
  try {
    const { openid, total_amount, subject, out_order_no } = ctx.request.body;

    let params = {
      appid: CONFIG.APPID,
      out_order_no: out_order_no,
      total_amount: total_amount,
      subject: subject,
      body: "台球赛事报名",
      notify_url: CONFIG.NOTIFY_URL,
      valid_time: "900",
      channel: "TT"
    };

    params.sign = generateSign(params, CONFIG.SALT);

    const res = await axios.post(
      "https://open-sandbox.douyin.com/api/ecpay/v1/create_order",
      params
    );

    ctx.body = res.data;
  } catch (err) {
    ctx.body = { code: -1, msg: "下单失败" };
  }
});

// --------------------------
// 2. 支付回调（抖音官方调用）
// --------------------------
router.post('/api/pay/notify', async (ctx) => {
  try {
    const data = ctx.request.body;
    const sign = data.sign;
    delete data.sign;

    const localSign = generateSign(data, CONFIG.SALT);
    if (localSign !== sign) {
      ctx.body = "FAIL";
      return;
    }

    if (data.trade_status === "SUCCESS") {
      console.log("支付成功 => 订单号：" + data.out_order_no);
      // 这里可以写：报名成功、更新数据库、开通参赛资格
    }

    ctx.body = "SUCCESS";
  } catch (e) {
    ctx.body = "FAIL";
  }
});

// --------------------------
// 3. 健康检查（平台必须）
// --------------------------
router.get('/', async (ctx) => {
  ctx.body = "服务运行正常";
});

app.use(router.routes());

// 启动服务
app.listen(CONFIG.SERVER_PORT, '0.0.0.0', () => {
  console.log("服务启动：0.0.0.0:8000");
});