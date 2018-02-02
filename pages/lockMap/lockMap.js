var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var app = getApp();
Page({
  data: {
    // 车位与锁图
    carImg: '../../img/parking-p_icon_choice_default@2x.png',
    lockImg: '../../img/parking-s_icon_choice_default@2x.png',
    oLat: '',
    oLng: '',
    searchSongList: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
    itemPage: 0,      //返回数据的页面数  
    imgParking: false, //无数据图片，默认false，隐藏  
    markers: [{
      iconPath: "../../img/park-lock_s_icon@2x.png",
      id: 0,
      latitude: 25.0821785206,
      longitude: 102.6569366455,
      width: 28,
      height: 31,
    }, {
      iconPath: "../../img/park-lock_s_icon@2x.png",
      id: 1,
      latitude: 25.0823145601,
      longitude: 102.6563519239,
      width: 28,
      height: 31,
    }, {
      iconPath: "../../img/park-lock_s_icon@2x.png",
      id: 1,
      latitude: 25.0780000901,
      longitude: 102.6586639881,
      width: 28,
      height: 31,
    }, {
      iconPath: "../../img/park-lock_s_icon@2x.png",
      id: 1,
      latitude: 25.0782624609,
      longitude: 102.6556384563,
      width: 28,
      height: 31,
    }],
    polyline: [{
      points: [{
        longitude: 102.6569366455,
        latitude: 25.0821785206
      }, {
        longitude: 102.6569366455,
        latitude: 23.21229
      }],
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }]
  },
  onLoad: function (option) {
    if (option.q) {
      console.log(option.q);
      var link = decodeURIComponent(option.q);
      console.log(link);
      var paramArr = link.split('=');
      if (paramArr.length == 2) {
        var params = paramArr[1].split('_');
        console.log(params[0]);
        console.log(params[1]);//车位锁ID
      }
    }
  },
  onShow: function(){
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
            console.log(res);
            var oLat = res.result.location.lat;
            var oLng = res.result.location.lng;
            that.setData({
              oLat: res.result.location.lat,
              oLng: res.result.location.lng,
              searchPageNum: 1,   //第一次加载，设置1  
              searchSongList: [],  //放置返回数据的数组,设为空  
              isFromSearch: true,  //第一次加载，设置true  
            });
            that.fetchSearchList();
          }
        });
      }
    });
  },
  longConversion: function (long) {
    if (long > 1000) {
      long = (long / 1000).toFixed(2) + '公里'
    } else {
      long = long + '米'
    }
    return long;
  },
  //访问网络  
  fetchSearchList: function () {
    let that = this;
    let searchPageNum = that.data.searchPageNum;//把第几次加载次数作为参数  
    //访问网络  
    var oData = {
      pageIndex: searchPageNum,
      ps: 3,
      lat: that.data.oLat,
      lng: that.data.oLng
    }

    wx.request({
      url: http.reqUrl + '/nearby/parkinglat',
      data: JSON.stringify(oData),
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data.map);
        let searchList = [];
        if (res.data.map.length > 0) {
          res.data.map.map(function (item) {
            item.distance = that.longConversion(item.distance);
            return item;
          });

          searchList = res.data.map
          that.data.searchSongList.concat(searchList);
          that.setData({
            itemPage: res.data.tp,
            searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
          });
        } else {
          that.setData({
            imgParking: true,
          });
        }
      }
    });
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  bindParkingListItemTap: function (e) {
    console.log(e.currentTarget.dataset.index);
    wx.setStorage({
      key: 'lockDetailList',
      data: e.currentTarget.dataset.index,
      success: function(res) {
        wx.navigateTo({
          url: "../lockDetailList/lockDetailList"
        });
      },
      fail: function(res) {},
      complete: function(res) {},
    })

  },
  // openParkingMap: function () {
  //   wx.navigateTo({
  //     url: '../parkinglotMap/parkinglotMap',
  //     success: function (res) {
  //       // success
  //     },
  //     fail: function (res) {
  //       // fail
  //     },
  //     complete: function (res) {
  //       // complete
  //     }
  //   })
  // },
  sweepCar: function(){
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res.result)
      }
    })
  },
  moreBtn: function(){
    wx.navigateTo({
      url: "../lockParkingList/lockParkingList"
    });
  },
  parkingP: function(){
    wx.reLaunch({
      url: '../index/index'
    })
  }
})
