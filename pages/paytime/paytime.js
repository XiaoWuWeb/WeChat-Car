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
  onShareAppMessage: function () {
    return {
      title: '华腾智能停车',
      path: '/pages/index/index',
    }
  },
  onLoad: function(){
    wx.showShareMenu({
      withShareTicket: true
    });

    wx.getStorage({
      key: 'plateNo',
      success: function (res) {

        that.setData({
          plate: res.data
        });
      }
    })
    wx.getStorage({
      key: 'parkAddress',
      success: function (res) {

        that.setData({
          address: res.data
        });
      }
    })
    var that = this;
    wx.getStorage({
      key: 'carNumber',
      success: function (res) {

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

          if (res.data.success) {
            that.setData({
              
              money: res.data.data / 100 + '.00'
            });
          } else {
            that.setData({

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

      wx.getStorage({
        key: 'token',
        success: function (res) {
          that.setData({
            token: res.data
          });
          wx.request({
            url: http.reqUrl + '/wx/pay',
            data: {
              parkNo: that.data.carNumber,
              carNo: that.data.plate,
              buyTime: that.data.oneNum,
              parkFee: (parseInt(that.data.money) * 100),
              parkAddress: that.data.address
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'token': that.data.token
            },
            success: function (res) {

              wx.requestPayment({
                'timeStamp': res.data.data.timeStamp + '',
                'nonceStr': res.data.data.nonceStr + '',
                'package': res.data.data.package + '',
                'signType': res.data.data.signType + '',
                'paySign': res.data.data.paySign + '',
                'success': function (res) {

                  var timestamp = Date.parse(new Date());
                  // 获取之前购买时长
                  wx.getStorage({
                    key: 'timeInput',
                    success: function (res) {

                      if (res.data) {
                        // 存储加上现在的总时长
                        wx.setStorage({
                          key: 'timeInput',
                          data: parseInt(oneNum) + parseInt(res.data),
                          complete: function () {
                            wx.reLaunch({
                              url: '../index/index'
                            })
                          }
                        });

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
                    }
                  });
                }
              });

            },
            'fail': function (res) {

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
  },
});