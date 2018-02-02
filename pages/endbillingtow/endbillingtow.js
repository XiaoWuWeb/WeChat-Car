var http = require('../../utils/http.js');
var app = getApp();
Page({
  data:{
    parkTime1:0,
    parkNo1: 0,
    payTime1:0,
    consumedMoney1: '',
    moneyremain:'',
    longTime: 0,
    carNumber:0
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
    wx.getStorage({
      key: 'carNumber',
      success: function (res) {
        that.setData({
          carNumber: res.data
        });
      },
    });
    wx.getStorage({
      key: 'longTime',
      success: function (res) {
        that.setData({
          longTime: res.data
        });
        wx.request({
          url: http.reqUrl + '/wx/park_fee',
          data: {
            buyTime: parseInt(res.data),
            parkNo: that.data.carNumber
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {

            if (res.data.success) {
              that.setData({
                moneyremain: res.data.data / 100 + '.00'
              });
            }
          }
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
