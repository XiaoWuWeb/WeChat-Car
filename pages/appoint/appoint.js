var http = require('../../utils/http.js');
var app = getApp();
Page({
  data: {
    carNum: '',
    address: '吴敏明家里的厕所',
    plate:'编辑',
    timeInput: 0,
    money: '5.00',
    moneyAll:'5.00',
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
    var that = this;
    wx.getStorage({
      key: 'carNumber',
      success: function (res) {

        that.setData({
          carNum: res.data
        })

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

        that.setData({
          plate: res.data
        })
      }
    });
  },

  plateInfo:function(){

    wx.navigateTo({
      url: '../plate/plate'
    });

  },
  timeInput: function(e){

    var timeInput = e.detail.value;

    var that = this;

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
              parkFee: (parseInt(that.data.moneyAll) * 100),//1
              parkAddress: that.data.address
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'token': that.data.token
            },
            success: function (res) {

              wx.setStorage({ 
                key: 'orderNo',
                data: res.data.data.out_trade_no,
              })

              wx.requestPayment({
                'timeStamp': res.data.data.timeStamp + '',
                'nonceStr': res.data.data.nonceStr + '',
                'package': res.data.data.package + '',
                'signType': res.data.data.signType + '',
                'paySign': res.data.data.paySign + '',
                'success': function (res) {

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

                          // 跳转/pkmg/upparkingno      
                          app.func.req('/pkmg/upparkingno', oData, function (res) {//请求当前车位支付成功后已有车

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


    }
  }
  
})