var app = getApp();
Page({
  data: {
    imgParking: true, //无数据图片，默认false，隐藏  
  },
  onShareAppMessage: function () {
    return {
      title: '华腾智能停车',
      path: '/pages/index/index',
    }
  },
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
  }
})