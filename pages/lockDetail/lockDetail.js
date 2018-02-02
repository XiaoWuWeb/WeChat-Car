var app = getApp();
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
Page({
  data: {
    money: '5',
    lockNo: '065566',
    lockDownImg: '../../img/lock-down@2x.png',
    lockDownInfo: '车位锁下降',
    downNav: true,
    lockUpImg: '../../img/lock-Up@2x.png',
    lockUpInfo: '车位锁上升',
    upNav: false,
    address: '吴敏明家中',
    lat: 0,
    lng: 0,
    parkingName: '',
    lockId: '',
    token: ''
  },
  onLoad: function (option) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(option.q)
    var that = this;
    // wx.request({
    //   url: http.reqUrl + '/pkmg/selectParkinglock',
    //   data: { dici_no: '100066' },
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   success: function (res) {
    //     console.log(res)
    //     if (res.data.data.length > 0) {
    //       that.setData({
    //         money: res.data.data[0].UnitPrice,
    //         lockNo: res.data.data[0].cheweiId,
    //         address: res.data.data[0].address,
    //         lat: res.data.data[0].latitude,
    //         lng: res.data.data[0].longitude,
    //         parkingName: res.data.data[0].parking_name
    //       });
    //     } else {
    //       wx.showModal({
    //         title: '警告',
    //         content: '该车位故障',
    //         success: function (res) {
    //           wx.reLaunch({
    //             url: '../lockMap/lockMap'
    //           })
    //         }
    //       })
    //     }

    //   }
    // });
    if (option.q) {
      var link = decodeURIComponent(option.q);
      var paramArr = link.split('=');
      if (paramArr.length == 2) {
        var params = paramArr[1].split('_');
        console.log(params[1]);//车位锁ID
        that.setData({
          lockId: params[1]
        })
        wx.request({
          url: http.reqUrl + '/pkmg/selectParkinglock',
          data: { dici_no: params[1] },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            if (res.data.data.length > 0) {
              that.setData({
                money: res.data.data[0].UnitPrice,
                lockNo: res.data.data[0].cheweiId,
                address: res.data.data[0].address,
                lat: res.data.data[0].latitude,
                lng: res.data.data[0].longitude,
                parkingName: res.data.data[0].parking_name
              });
            }else{
              wx.showModal({
                title: '提示',
                content: '该车位故障',
                success: function (res) {
                  wx.reLaunch({
                    url: '../lockMap/lockMap'
                  })
                }
              })
            }

          }
        });
      }
    }
    
  },
  openLocation: function () {
    wx.openLocation({
      latitude: parseFloat(this.data.lat), // 纬度，范围为-90~90，负数表示南纬
      longitude: parseFloat(this.data.lng), // 经度，范围为-180~180，负数表示西经
      scale: 28, // 缩放比例
      name: this.data.parkingName, // 位置名
      address: this.data.address// 地址的详细说明
    })
  },
  lockDown: function(){
    var that = this;
    wx.request({
      url: http.reqUrl + '/pkmg/qparkingno',
      data: {
        parkingNo: that.data.lockNo,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': that.data.token
      },
      success: function (res) {
        console.log(res.data.success);
        if (res.data.success){
          wx.getStorage({
            key: 'token',
            success: function (res) {
              that.setData({
                token: res.data
              })
              wx.request({
                url: http.reqUrl + '/payment/payments',
                data: {
                  parkingNo: that.data.lockNo,
                  parkFee: 1,//(parseInt(that.data.moneyAll) * 100)
                  parkAddress: that.data.address
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                  'token': that.data.token
                },
                success: function (res) {
                  console.log(res);
                  // wx.setStorage({
                  //   key: 'orderNo',
                  //   data: res.data.data.out_trade_no,
                  // })

                  wx.requestPayment({
                    'timeStamp': res.data.data.timeStamp + '',
                    'nonceStr': res.data.data.nonceStr + '',
                    'package': res.data.data.package + '',
                    'signType': res.data.data.signType + '',
                    'paySign': res.data.data.paySign + '',
                    'success': function (res) {
                      console.log(res);
                      wx.showLoading({
                        title: '感应下降中...'
                      });
                      wx.request({
                        url: http.reqUrl + '/control/decline',
                        data: { lockId: that.data.lockId },
                        method: 'POST',
                        header: {
                          'content-type': 'application/x-www-form-urlencoded'
                        },
                        success: function (res) {
                          console.log(res.data.data.Success);
                          console.log('下降');
                          if (res.data.data.Success) {
                            setTimeout(function () {
                              wx.hideLoading();
                              that.setData({
                                downNav: false,
                                upNav: true
                              });
                            }, 6000)

                          } else {

                            wx.hideLoading();
                            wx.showModal({
                              title: '提示',
                              content: '该车位故障',
                              success: function (res) {
                                wx.reLaunch({
                                  url: '../lockMap/lockMap'
                                })
                              }
                            })
                          }
                        }
                      });
                    },
                    'fail': function (res) {

                      var oMassage = res;
                      wx.showModal({
                        title: '提示',
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
          });
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              }
            }
          });
        }
      }
    })
    
    
  },
  lockUp: function(){
    var that = this;
    wx.showLoading({
      title: '感应上升中...'
    });
    wx.request({
      url: http.reqUrl + '/control/rise',
      data: { lockId: this.data.lockId },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data.data.Success)
        if (res.data.data.Success) {
          setTimeout(function () {
            wx.hideLoading();
            that.setData({
              downNav: true,
              upNav: false
            });
          }, 6000)
        }else{
          wx.hideLoading();
          wx.showModal({
            title: '警告',
            content: '该车位故障',
            success: function (res) {
              wx.reLaunch({
                url: '../lockMap/lockMap'
              })
            }
          })
        }
      }
    });
  }
});