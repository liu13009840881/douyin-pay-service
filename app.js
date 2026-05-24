// 下单接口接收套餐类型
router.post('/api/pay/create', async (ctx) => {
  try {
    const { openid, packageType, out_order_no } = ctx.request.body;
    let total_amount, subject;

    // 匹配收费档位
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
        ctx.body = {code:-1,msg:'套餐类型错误'};
        return;
    }

    let params = {
      appid: CONFIG.APPID,
      out_order_no: out_order_no,
      total_amount: total_amount,
      subject: subject,
      body: "球动乾坤报名助手授权费用",
      notify_url: CONFIG.NOTIFY_URL,
      valid_time: "900",
      channel: "TT"
    };

    params.sign = generateSign(params, CONFIG.SALT);
    const res = await axios.post("https://open-sandbox.douyin.com/api/ecpay/v1/create_order",params);
    ctx.body = res.data;
  } catch (err) {
    ctx.body = { code: -1, msg: "下单失败" };
  }
});