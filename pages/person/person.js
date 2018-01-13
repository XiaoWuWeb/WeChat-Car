var app = getApp();
Page({
  data:{
    userInfo: '',
    userNo: '粤CLH888',//'点击输入'
    user_no: 1,
    coupons: '无',
    parkNum: '11'
  },
  onLoad:function(){
    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        console.log(res.data)
        that.setData({
          userInfo: res.data
        })
      }
    })
    wx.getStorage({
      key: 'plateNo',
      success: function (res) {
        console.log(res.data)
        that.setData({
          userNo: res.data
        })
      }
    })
  },
  userNo: function(){
    wx.navigateTo({
      url: '../plate1/plate1'
    });
  }

});