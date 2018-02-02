var app = getApp();
var http = require('../../utils/http.js');
Page({
  data:{
    userInfo: '',
    userNo: '点击输入',//'点击输入'
    user_no: 1,
    coupons: '无',
    parkNum: 0
  },
  onShareAppMessage: function () {
    return {
      title: '华腾智能停车',
      path: '/pages/index/index',
    }
  },
  onLoad:function(){
    wx.showShareMenu({
      withShareTicket: true
    });
    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {

        that.setData({
          userInfo: res.data
        })
      }
    });
    wx.getStorage({
      key: 'plateNo',
      success: function (res) {

        that.setData({
          userNo: res.data
        })
      }
    });
    wx.getStorage({
      key: 'userID',
      success: function (res) {
        var oData = {
          id: res.data,
          sign: 2
        }
        app.func.req('/appuser/parkrecord', oData, function (res) {

          that.setData({
            parkNum: res.tr
          });
        });
      }
    });
  },

  userNo: function(){
    wx.navigateTo({
      url: '../plate1/plate1'
    });
  },

  parkingList: function(){
    wx.navigateTo({
      url: '../parking/parking'
    });
  },

  refundList: function(){
    wx.navigateTo({
      url: '../refund/refund'
    });
  }
});