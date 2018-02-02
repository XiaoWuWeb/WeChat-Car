var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var app = getApp();
Page({
  data: {
    // tab切换  
    swichNav: true,
    swichNav1: false,
    parkingNoName:'预约车位',
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    money:5,
    lockDetailList: '',
    oName: '',
    oAddress: '',
    oLat: 0,
    oLng: 0,
    stopNum: 0,
    rentNum: 0,
    // 列表
    searchSongList: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
    itemPage: 0,      //返回数据的页面数  
    imgParking: false, //无数据图片，默认false，隐藏  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏  

    // content: [],
    // nv: [],
    // shownavindex: '',
    // nzopen: false,
    // nzshow: false,
    // isfull: false,
    // oItem: '立停车位'
  },
  onLoad: function (options) {
    // this.setData({
    //   nv: ['预约车位', '可租车位']
    // });
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    wx.getStorage({
      key: 'lockDetailList',
      success: function(res) {
        that.setData({
          lockDetailList: res.data,
          appointmentType: 1,
          searchPageNum: 1,   //第一次加载，设置1  
          searchSongList: [],  //放置返回数据的数组,设为空  
          isFromSearch: true,  //第一次加载，设置true  
          searchLoading: true,  //把"上拉加载"的变量设为true，显示  
          searchLoadingComplete: false //把“没有数据”设为false，隐藏  
        });
        that.lockList();
      },
      fail: function(res) {},
      complete: function(res) {},
    });
  },
  onShow: function () {
    // 页面显示
    var that = this;
    
    // wx.getStorage({
    //   key: 'lockDetailList',
    //   success: function (res) {
    //     that.setData({
    //       searchPageNum: 1,   //第一次加载，设置1  
    //       searchSongList: [],  //放置返回数据的数组,设为空  
    //       isFromSearch: true,  //第一次加载，设置true  
    //       searchLoading: true,  //把"上拉加载"的变量设为true，显示  
    //       searchLoadingComplete: false //把“没有数据”设为false，隐藏  
    //     });
    //     that.lockList();
    //   },
    //   fail: function (res) { },
    //   complete: function (res) { },
    // });
    
  },
  lockList: function (){
    let that = this;
    let searchPageNum = that.data.searchPageNum;//把第几次加载次数作为参数 
    let lockDetailList = that.data.lockDetailList;//停车场编号
    let appointmentType = that.data.appointmentType;//停车场编号

    wx.request({
      url: http.reqUrl + '/lock/list',
      data: { parkNo: lockDetailList, appointmentType: appointmentType, pageIndex: searchPageNum },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        that.setData({
          oAddress: res.data.data.map[0].cheweiAddress,
          oName: res.data.data.map[0].parkingName,
          oLat: res.data.data.map[0].latitude,
          oLng: res.data.data.map[0].longitude,
          stopNum: res.data.data.stopNum,
          rentNum: res.data.data.rentNum
        });

        let searchList = [];
        if (res.data.data.map.length > 0) {
          // res.data.data.map.map(function (item) {
          //   item.times = that.timeConversion(item.times);
          //   item.money = parseInt(item.money) / 100
          //   return item;
          // });

          searchList = res.data.data.map
          that.data.searchSongList.concat(searchList);
          that.setData({
            itemPage: res.data.data.tp,
            searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
          });
          if (res.data.data.tp == 1) {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示  
              searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
            });
          } else {
            that.setData({
              searchLoading: true  //把"上拉加载"的变量设为false，隐藏  
            });
          }
        } else {
          that.setData({
            imgParking: true,
            searchLoadingComplete: false, //把“没有数据”设为true，显示  
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
          });
        }

      }
    });
  },
  openLocation: function () {
    wx.openLocation({
      latitude: parseFloat(this.data.oLat), // 纬度，范围为-90~90，负数表示南纬
      longitude: parseFloat(this.data.oLng), // 经度，范围为-180~180，负数表示西经
      scale: 28, // 缩放比例
      name: this.data.oName, // 位置名
      address: this.data.oAddress// 地址的详细说明
    })
  },

  onPullDownRefresh: function(){
    wx.showNavigationBarLoading() //在标题栏中显示加载

    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  // list: function (e) {
  //   if (this.data.nzopen) {
  //     this.setData({
  //       nzopen: false,
  //       nzshow: false,
  //       isfull: false,
  //       shownavindex: 0
  //     })
  //   } else {
  //     this.setData({
  //       content: this.data.nv,
  //       nzopen: true,
  //       nzshow: false,
  //       isfull: true,
  //       shownavindex: e.currentTarget.dataset.nav
  //     })
  //   }
  // },
  // hidebg: function (e) {
  //   this.setData({
  //     nzopen: false,
  //     nzshow: true,
  //     isfull: false,
  //     shownavindex: 0
  //   })
  // },
  // itemTap: function(e){
  //   console.log(e.currentTarget.dataset.data)
  //   if (e.currentTarget.dataset.data == '预约车位'){
  //     this.setData({
  //       nv: ['立停车位', '可租车位'],
  //       nzopen: false,
  //       nzshow: true,
  //       isfull: false,
  //       shownavindex: 0,
  //       oItem: '预约车位'
  //     });

  //   } else if (e.currentTarget.dataset.data == '可租车位'){
  //     this.setData({
  //       nv: ['立停车位', '预约车位'],
  //       nzopen: false,
  //       nzshow: true,
  //       isfull: false,
  //       shownavindex: 0,
  //       oItem: '可租车位'
  //     });
  //   } else if (e.currentTarget.dataset.data == '立停车位'){
  //     this.setData({
  //       nv: ['预约车位', '可租车位'],
  //       nzopen: false,
  //       nzshow: true,
  //       isfull: false,
  //       shownavindex: 0,
  //       oItem: '立停车位'
  //     });
  //   }
  // },
  lockDetailTap: function(){
    
    wx.navigateTo({
      url: "../lockDetail/lockDetail"
    });

  },
  // 点击tab切换
  swichNav: function (e) {
    this.setData({
      searchSongList: [],  //放置返回数据的数组,设为空  
      isFromSearch: true,  //第一次加载，设置true  
      appointmentType: 1,
      searchPageNum: 1,   //第一次加载，设置1  
      parkingNoName: '预约车位',
      swichNav1: false,
      swichNav: true
    });
    this.lockList();
  },
  swichNav1: function (e) {
    this.setData({
      searchSongList: [],  //放置返回数据的数组,设为空  
      isFromSearch: true,  //第一次加载，设置true  
      appointmentType: 1,
      searchPageNum: 1,   //第一次加载，设置1  
      parkingNoName: '可租车位',
      swichNav: false,
      swichNav1: true
    });
    this.lockList();
  },
  //滚动到底部触发事件  
  searchScrollLower: function () {
    let that = this;
    if (that.data.searchPageNum < parseInt(that.data.itemPage)) {
      if (that.data.searchLoading && !that.data.searchLoadingComplete) {
        that.setData({
          searchPageNum: that.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
        });
        that.lockList();
      }
    } else {
      that.setData({
        searchLoadingComplete: true, //把“没有数据”设为true，显示  
        searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
      });
    }
  }
})