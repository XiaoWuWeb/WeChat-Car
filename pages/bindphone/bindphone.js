var http = require('../../utils/http.js');
var app = getApp();

Page({
  data: {
    flag: false,
    codeDis: false,
    phoneCode: "获取验证码",
    telephone: "",
    codePhone: "",
    swichNav: false,
    swichNav1: false,
    codes:0
  },
  onShareAppMessage: function () {
    return {
      title: '华腾智能停车',
      path: '/pages/index/index',
    }
  },
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
  },
  changeCode() {
    var _this = this
    let telephone = this.data.telephone
    if (telephone.length != 11 || isNaN(telephone)) {
      wx.showToast({
        title: '请输入有效的手机号码',
        icon: "loading"
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
      return
    }
    this.setData({
      codeDis: true
    })
    app.func.req('/send/sms', { mobile: this.data.telephone}, function (res) {

      let data = res.data;

      if (data.length != 6) {//错误的情况
        _this.setData({
          codeDis: false
        })
        wx.showToast({
          title: '手机号码有误',
          icon: "loading"
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      } else {
        _this.setData({
          phoneCode: 60,
          codes: data
        })
        let time = setInterval(() => {
          let phoneCode = _this.data.phoneCode
          phoneCode--
          _this.setData({
            phoneCode: phoneCode
          })
          if (phoneCode == 0) {
            clearInterval(time)
            _this.setData({
              phoneCode: "获取验证码",
              flag: true,
              codeDis: false
            })
          }
        }, 1000)
      }

    });
  },
  phoneinput(e) {
    let value = e.detail.value;
    this.setData({
      telephone: value
    });
    if (value.length > 10){
      this.setData({
        swichNav: true
      });
    }else{
      this.setData({
        swichNav: false
      });
    }
  },
  codeinput(e) {
    let value = e.detail.value;
    this.setData({
      codePhone: value
    });
    if (value.length > 5) {
      this.setData({
        swichNav1: true
      });
    } else {
      this.setData({
        swichNav1: false
      });
    }
  },
  getPhoneNumber: function (e) {

    if (this.data.codePhone.length > 5 && this.data.telephone.length > 10){

      app.func.req('/send/smsyz', { code: this.data.codePhone, codes: this.data.codes}, function (res) {

        if(res.success){
          wx.redirectTo({
            url: '../order/order'
          });
        }else{
          wx.showToast({
            title: '请输入正确的验证码',
            icon: "loading"
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        }

      });
    }
  }
})
