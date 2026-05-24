const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

const app = new Koa();
app.use(bodyParser());

// 测试下单接口
router.post('/api/create-order', async (ctx) => {
  ctx.body = {
    success: true,
    orderId: "test_order_123",
    byteAuthorization: "test_auth_123"
  };
});

// 支付回调接口
router.post('/api/pay-callback', async (ctx) => {
  ctx.body = "success";
});

app.use(router.routes());
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("服务启动成功");
});
