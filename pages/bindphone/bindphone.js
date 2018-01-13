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
    // app.func.req('/Agent/selectAgent', {}, function (res) {
      console.log(res);
      // console.log(res.data);
      // console.log(res.data.length);
      // let data = res.data
      let data = res.data;
      // if (data.respCode != "000") {
      if (data.length != 6) {//错误的情况
        _this.setData({
          codeDis: false,
          
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
    })
  },
  phoneinput(e) {
    console.log(e)
    let value = e.detail.value
    console.log(value)
    this.setData({
      telephone: value
    })
    if (value.length > 10){
      this.setData({
        swichNav: true
      })
    }else{
      this.setData({
        swichNav: false
      })
    }
  },
  codeinput(e) {
    let value = e.detail.value
    console.log(value)
    this.setData({
      codePhone: value
    })
    if (value.length > 5) {
      this.setData({
        swichNav1: true
      })
    } else {
      this.setData({
        swichNav1: false
      })
    }
  },
  getPhoneNumber: function (e) {
    // console.log(this.data);
    // console.log(this.data.codePhone);
    console.log(this.data.codePhone.length);
    // console.log(this.data);
    // console.log(this.data.telephone);
    console.log(this.data.telephone.length);
    if (this.data.codePhone.length > 5 && this.data.telephone.length > 10){
      app.func.req('/send/smsyz', { code: this.data.codePhone, codes: this.data.codes}, function (res) {
        console.log(res);
        if(res.success){
          wx.redirectTo({
            url: '../order/order'
          })
        }else{
          wx.showToast({
            title: '请输入正确的验证码',
            icon: "loading"
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        }
      })
    }
  }
})
