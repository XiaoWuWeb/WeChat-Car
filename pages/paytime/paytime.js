var http = require('../../utils/http.js');
var app = getApp();
Page({
  data:{
    moneyTime: 0,
    money:'0.00',
    oneNum:0,
    swichNav: false,
    carNumber: '',
    plate: '',
    address: '',
    token:''
  },
  onLoad: function(){
    // plateNo parkAddress
    wx.getStorage({
      key: 'plateNo',
      success: function (res) {
        console.log(res.data)
        that.setData({
          plate: res.data
        });
      }
    })
    wx.getStorage({
      key: 'parkAddress',
      success: function (res) {
        console.log(res.data)
        that.setData({
          address: res.data
        });
      }
    })
    var that = this;
    wx.getStorage({
      key: 'carNumber',
      success: function (res) {
        console.log(res.data)
        that.setData({
          carNumber: res.data
        });
        wx.request({
          url: http.reqUrl + '/wx/park_fee',
          data: {
            buyTime: 1,
            parkNo: res.data
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data.data);
            if (res.data.success) {
              that.setData({
                moneyTime: res.data.data / 100
              });
            } else {
              that.setData({
                moneyTime: 5
              });
            }
          }
        });
      }
    });
  },
  bindHideKeyboard: function (e) {
    console.log(e.detail.value);
    var str = e.detail.value;
    var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
    this.setData({
      oneNum: str
    })
    if (str.length > 0) {
      this.setData({
        swichNav: true
      })
      var that = this;
      wx.request({
        url: http.reqUrl + '/wx/park_fee',
        data: {
          buyTime: parseInt(that.data.oneNum),
          parkNo: that.data.carNumber
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data.data);
          if (res.data.success) {
            that.setData({
              // oneNum: parseInt(timeInput),
              money: res.data.data / 100 + '.00'
            });
          } else {
            that.setData({
              // oneNum: parseInt(timeInput),
              money: '0.00'
            });
          }
        }
      });
    } else {
      this.setData({
        swichNav: false,
        money: '0.00'
      })
    }
  },
  confirmPay: function(e){
    var that = this;
    var oneNum = that.data.oneNum;
    if (parseInt(oneNum) != 0){
      // 获取之前购买时长
      wx.getStorage({
        key: 'timeInput',
        success: function (res) {
          console.log(res.data)
          
          if (res.data) {
            // 存储加上现在的总时长
            wx.setStorage({
              key: 'timeInput',
              data: parseInt(oneNum) + parseInt(res.data),
              complete: function () {
                wx.getStorage({
                  key: 'token',
                  success: function (res) {
                    that.setData({
                      token: res.data
                    })
                    wx.request({
                      url: http.reqUrl + '/wx/pay',
                      data: {
                        parkNo: that.data.carNumber,
                        carNo: that.data.plate,
                        buyTime: that.data.oneNum,
                        parkFee: 1,
                        parkAddress: that.data.address
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'token': that.data.token
                      },
                      success: function (res) {
                        console.log(res);
                        // console.log(typeof res.data.data.timeStamp);
                        wx.requestPayment({
                          'timeStamp': res.data.data.timeStamp + '',
                          'nonceStr': res.data.data.nonceStr + '',
                          'package': res.data.data.package + '',
                          'signType': res.data.data.signType + '',
                          'paySign': res.data.data.paySign + '',
                          'success': function (res) {
                            console.log(res);
                            var timestamp = Date.parse(new Date());
                            wx.setStorage({
                              key: 'timeInput',
                              data: that.data.timeInput,
                              complete: function () {
                                wx.setStorage({
                                  key: 'timestamp',
                                  data: timestamp,
                                  complete: function () {
                                    var oData = {
                                      parkingNo: that.data.carNum,
                                      statu: '1'
                                    }
                                    console.log(1)
                                    // 跳转/pkmg/upparkingno      1
                                    app.func.req('/pkmg/upparkingno', oData, function (res) {//请求当前车位支付成功后已有车
                                      console.log(res);
                                      if (res.success) {
                                        wx.setStorage({
                                          key: 'parkingNumber',
                                          data: that.data.carNumber,
                                          complete: function () {
                                            wx.reLaunch({
                                              url: '../index/index'
                                            })
                                          }
                                        })
                                      } else {
                                        wx.showModal({
                                          title: '警告',
                                          content: '操作失误，请重新进去小程序',
                                          showCancel: false,
                                          success: function (res) {
                                            if (res.confirm) {
                                              console.log('用户点击确定')
                                            }
                                          }
                                        });
                                      }
                                    });

                                  }
                                });
                              }
                            });
                          },
                          'fail': function (res) {
                            console.log(res);
                            var oMassage = res;
                            wx.showModal({
                              title: '警告',
                              content: oMassage,
                              showCancel: false,
                              success: function (res) {
                                if (res.confirm) {
                                  console.log('用户点击确定')
                                }
                              }
                            });
                          }
                        });

                      }
                    })
                  }
                })
                console.log(that.data.token)
              }
            });
          }
        }
      });
    }else{
      console("时长出错")
    }
    
    
    // app.func.req('/parking/parkInfo', { address: oneNum }, function (res) {

    // })
    // wx.navigateBack({
    //   delta: 1
    // })
  }
})