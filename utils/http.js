// var rootDocment = 'http://192.168.0.108:9090/PayPay';
// var rootDocment = 'http://192.168.0.116:8080/PayPay';
// var rootDocment = 'http://192.168.0.101:8080/PayPay';
var rootDocment = 'https://www.lcgxlm.com/PayPay';

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
