var app = getApp();
Page({
  data:{
    parkTime1:0,
    parkNo1: 0,
    payTime1:0,
    consumedMoney1: '',
    moneyremain:''
  },
  onLoad: function(){
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
        that.setData({
          moneyremain: res.data
        });
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
