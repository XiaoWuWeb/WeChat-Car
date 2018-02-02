var http = require('utils/http.js');
var QQMapWX = require('libs/qqmap-wx-jssdk.js');
App({
  data:{
    userInfo:'',
    token:'',
    oAddress :''
  },
  onShareAppMessage: function () {
    return {
      title: '华腾智能停车',
      path: '/pages/index/index',
    }
  },
  onLaunch: function (){
    var that = this;
    wx.getLocation({
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        // 实例化API核心类
        var demo = new QQMapWX({
          key: 'XKBBZ-5RKWS-4TQOB-6CMPO-U2ORF-V5BKW' // 必填
        });

        demo.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            // 获取当前区域

            var oAddress = res.result.address_component.district;

            wx.setStorage({
              key: 'oAddress',
              data: oAddress
            });
            
            wx.login({
              success: function (res) {
                wx.showLoading({
                  title: '登录中...'
                });

                wx.request({
                  url: http.reqUrl + '/wx/xiaoLogin',
                  data: {
                    code: res.code,
                    areaName: oAddress
                  },
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function (res) {
                    wx.hideLoading();

                    wx.setStorage({
                      key: 'token',
                      data: res.data.data.token,
                      complete: function () {
                        console.log('complete');
                      }
                    });
                    wx.setStorage({
                      key: 'userID',
                      data: res.data.data.userId,
                      complete: function () {
                        console.log('complete');
                      }
                    });
                  },
                  fail: function (res) {
                    wx.hideLoading();
                    console.log('login出错');

                    wx.showModal({
                      title: '提示',
                      content: '微信登录出错，请重新进入小程序或清除下缓存！',
                      showCancel: false,
                      success: function (res) {
                        if (res.confirm) {
                          console.log('用户点击确定');
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
      },
      fail: function () {
        //登录态过期
        wx.login() //重新登录
      }
    })
  },
  onLoad:function(){
    
  },
  getUserInfo: function (cb) {
    var that = this;

    if (this.globalData.userInfo) {
      // 用户信息
      if (!this.globalData.userInfo.ofoInfo) {
        var userInfo2 = wx.getStorageSync("userInfo");
        if (userInfo2 && userInfo2 == 'object')
          this.globalData.userInfo = userInfo2;
      }
      typeof cb == "function" && cb(this.globalData.userInfo)
      return;
    }


    var userInfo2 = wx.getStorageSync("userInfo");
    if (userInfo2 && typeof userInfo2 == 'object') {
      this.globalData.userInfo = userInfo2

      typeof cb == "function" && cb(this.globalData.userInfo)
      return
    }



    //调用登录接口
    wx.login({
      success: function () {
        wx.getUserInfo({
          success: function (res) {

            that.globalData.userInfo = res.userInfo
            typeof cb == "function" && cb(that.globalData.userInfo)

            wx.setStorage({
              key: 'userInfo',
              data: res.userInfo
            });
          }
        })
      }
    })
  },
  getUserInfoSync() {
    return this.globalData.userInfo;
  },
  globalData: {
    userInfo: null
  },
  func: {
    req: http.req
  }
})