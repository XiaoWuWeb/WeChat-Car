var app = getApp();
var http = require('../../utils/http.js');
Page({
  data: {
    searchSongList: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
    itemPage: 0,      //返回数据的页面数  
    imgParking: false, //无数据图片，默认false，隐藏  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false  //“没有数据”的变量，默认false，隐藏  
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
    let that = this;
    wx.getStorage({
      key: 'userID',
      success: function (res) {
        that.setData({
          userID: res.data,
          searchPageNum: 1,   //第一次加载，设置1  
          searchSongList: [],  //放置返回数据的数组,设为空  
          isFromSearch: true,  //第一次加载，设置true  
          searchLoading: true,  //把"上拉加载"的变量设为true，显示  
          searchLoadingComplete: false //把“没有数据”设为false，隐藏  
        })
        that.fetchSearchList();
      }
    })

  },
  timeConversion: function (time) {
    var today = new Date(parseInt(time));
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    // return new Date(parseInt(time)).toLocaleString().replace(/:\d{1,2}$/, ' ');
  },

  //访问网络  
  fetchSearchList: function () {
    let that = this;
    let searchPageNum = that.data.searchPageNum;//把第几次加载次数作为参数  

    //访问网络  

    var oData = {
      pageIndex: searchPageNum,
      id: that.data.userID
    }
    app.func.req('/refund/refunds', oData, function (res) {

      let searchList = [];
      if (res.map.length > 0) {
        res.map.map(function (item) {
          item.times = that.timeConversion(item.times);
          item.money = parseInt(item.money) / 100
          return item;
        });

        searchList = res.map
        that.data.searchSongList.concat(searchList);
        that.setData({
          itemPage: res.tp,
          searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
        });
        if(res.tp == 1){
          that.setData({
            searchLoadingComplete: true, //把“没有数据”设为true，显示  
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
          });
        }else {
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
    })
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
        that.fetchSearchList();
      }
    } else {
      that.setData({
        searchLoadingComplete: true, //把“没有数据”设为true，显示  
        searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
      });
    }
  }
}) 