// var rootDocment = 'http://192.168.0.108:8080/PayPay';
// var rootDocment = 'http://192.168.0.106:9090/PayPay';
var rootDocment = 'https://www.lcgxlm.com/PayPay';
// var rootDocment = 'http://192.168.0.100:80/PayPay';
function req(url, data, cb) {
  wx.request({
    url: rootDocment + url,
    data: data,
    // method: 'POST',
    header: { 'content-type': 'application/json'},
    success: function (res) {
      return typeof cb == "function" && cb(res.data)
    },
    fail: function () {
      return typeof cb == "function" && cb(false)
    }
  })
}


module.exports = {
  req: req,
  reqUrl: rootDocment
}
