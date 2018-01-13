var http = require('../../utils/http.js');
var app = getApp();
Page({
  data: {
    carNum: '',
    address: '',
    plate:'编辑',
    timeInput: 0,
    money: '0.00',
    moneyAll:'0.00',
    token:''
  },
  onLoad: function(){
    var that = this;
    wx.getStorage({
      key: 'carNumber',
      success: function (res) {
        console.log(res.data)
        that.setData({
          carNum: res.data
        })
        console.log(res.data);
        app.func.req('/pkmg/qparkname', { parkingNo: res.data }, function (res) {
          wx.setStorage({
            key: 'parkAddress',
            data: res.data[0].parkName,
            complete: function () {
              that.setData({
                address: res.data[0].parkName
              })
            }
          })  
          
        })
      }
    });

    wx.getStorage({
      key: 'plateNo',
      success: function (res) {
        console.log(res.data)
        that.setData({
          plate: res.data
        })
      }
    });
  },
  onshow: function(){
    console(1);
  },
  plateInfo:function(){
    wx.navigateTo({
      url: '../plate/plate'
    });
    // if (this.data.plate == '编辑') {
    //   wx.navigateTo({
    //     url: '../plate/plate'
    //   })
    // }else{
    //   return
    // }
    
  },
  timeInput: function(e){
    var timeInput = e.detail.value;
    // app.func.req('/wx/park_fee', oData, function (res) {
    //   console.log(res);
    // });
    var that = this;
    console.log(timeInput);
    console.log(timeInput.length);
    if (timeInput.length > 0){
      wx.request({
        url: http.reqUrl + '/wx/park_fee',
        data: {
          buyTime: parseInt(timeInput),
          parkNo: that.data.carNum
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data.data);
          if (res.data.success) {
            that.setData({
              timeInput: parseInt(timeInput),
              moneyAll: res.data.data / 100 + '.00',
              money: res.data.data / 100 + '.00'
            });
          } else {
            that.setData({
              timeInput: parseInt(timeInput),
              moneyAll: '0.00',
              money: '0.00'
            });
            // wx.showModal({
            //   title: '提示',
            //   content: '请输入停车时长',
            //   showCancel: false,
            //   success: function (res) {
            //     if (res.confirm) {
            //       console.log('用户点击确定')
            //     }
            //   }
            // });
          }
        }
      });
    }else{
      that.setData({
        timeInput: parseInt(timeInput),
        moneyAll: '0.00',
        money: '0.00'
      });
    }
    
    // if (0.25 < timeInput && timeInput <= 1){
    //   this.setData({
    //     timeInput: timeInput,
    //     money: '10.00',
    //     moneyAll: '10.00'
    //   })
    // } else if (timeInput > 1){
    //   var moneyAll =  Math.ceil(timeInput - 1) + 10
    //   this.setData({
    //     timeInput: timeInput,
    //     money: moneyAll,
    //     moneyAll: moneyAll
    //   })
    // } else{
    //   this.setData({
    //     timeInput: timeInput,
    //     money: '0.00',
    //     moneyAll: '0.00'
    //   })
    // }
  },
  payMoney: function(e){
    var that = this;
    if (that.data.timeInput == 0){
      wx.showModal({
        title: '提示',
        content: '请输入停车时长',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      });
      return
    }
    if (that.data.plate == '编辑' ){
      wx.showModal({
        title: '提示',
        content: '请编辑车牌号',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      });
      return
    }
    if (that.data.carNum.length < 7 && that.data.address.length < 1){
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
    }else{
      wx.getStorage({
        key: 'token',
        success: function (res) {
          that.setData({
            token: res.data
          })
          wx.request({
            url: http.reqUrl + '/wx/pay',
            data: {
              parkNo: that.data.carNum,
              carNo: that.data.plate,
              buyTime: that.data.timeInput,
              parkFee: 1,//parseInt(that.data.moneyAll)->5(分)
              parkAddress: that.data.address
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'token': that.data.token
            },
            success: function (res) {
              console.log(res);
              wx.setStorage({
                key: 'orderNo',
                data: res.data.data.out_trade_no,
              })
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
                            statu:'1'
                          }
                          console.log(1)
                          // 跳转/pkmg/upparkingno      1
                          app.func.req('/pkmg/upparkingno', oData, function (res) {//请求当前车位支付成功后已有车
                            console.log(res);
                            if(res.success){
                              wx.setStorage({
                                key: 'parkingNumber',
                                data: that.data.carNum,
                                complete: function () {
                                  wx.reLaunch({
                                    url: '../index/index'
                                  })
                                }
                              })
                            }else{
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
      
      // var timestamp = Date.parse(new Date());
      // wx.setStorage({
      //   key: 'timeInput',
      //   data: that.data.timeInput,
      //   complete: function () {
      //     wx.setStorage({
      //       key: 'timestamp',
      //       data: timestamp,
      //       complete: function () {
      //         var oData = {
      //           parkingNo: that.data.carNum,
      //           statu:'1'
      //         }
      //         console.log(1)
      //         // 跳转/pkmg/upparkingno      1
      //         app.func.req('/pkmg/upparkingno', oData, function (res) {
      //           console.log(res);
      //           if(res.success){
      //             wx.reLaunch({
      //               url: '../index/index'
      //             })
      //           }else{
      //             wx.showModal({
      //               title: '警告',
      //               content: '操作失误，请重新进去小程序',
      //               showCancel: false,
      //               success: function (res) {
      //                 if (res.confirm) {
      //                   console.log('用户点击确定')
      //                 }
      //               }
      //             });
      //           }
      //         });
              
      //       }
      //     });
      //   }
      // });
    }
  }
  
})