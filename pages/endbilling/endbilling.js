var app = getApp();
Page({
  data:{
    parkTime1:0,
    parkNo1: 0,
    payTime1:0,
    consumedMoney1: '',
    moneyremain: 0
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
      key: 'parkTime1',
      success: function(res) {
        that.setData({
          parkTime1: res.data
        });
      },
    });
    wx.getStorage({
      key: 'refundMoney',
      success: function (res) {
        if(res.data){
          that.setData({
            moneyremain: (parseInt(res.data) / 100)
          });
        }else{
          that.setData({
            moneyremain: 0
          });
        }
      },
    });
    wx.getStorage({
      key: 'parkNo1',
      success: function (res) {
        that.setData({
          parkNo1: res.data
        });
      },
    });
    wx.getStorage({
      key: 'consumedMoney1',
      success: function (res) {
        that.setData({
          consumedMoney1: res.data
        });
      },
    });
    wx.getStorage({
      key: 'payTime1',
      success: function (res) {
        that.setData({
          payTime1: res.data
        });
      },
    });
  },
  returnOut: function(){
    wx.reLaunch({
      url: '../index/index'
    })
  }
})
