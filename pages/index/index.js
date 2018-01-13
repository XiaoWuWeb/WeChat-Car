//index.js
//获取应用实例  
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var qqmapsdk;
var oAddress;
var parkingTime;
var app = getApp();
Page({
  data: {
    // 页面配置
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    swichNav: true,
    swichNav1: false,
    // 车位与锁图
    carImg:'../../img/parking-p_icon_choice_default@2x.png',
    lockImg:'../../img/parking-s_icon_choice_default@2x.png',
    // 地图99
    markerWidth:56,
    markerHeight:61,
    longitude: '',
    latitude: '',
    markers: [],
    userInfo: {},
    hasUserInfo: false,
    bindPhone:'',
    parkShow: false,//是否显示下面的
    orderNo: '',//订单编号
    consumedMoney:'0.00',//已消费
    payTime:0,//购买时长
    parkTime:0,//停车时长
    parkNo:'',//车位编号
    timestamp: 0//停车开始时间戳
  },
  
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('map')
  },
  
  onLoad: function(){
    
    var that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (!userInfo.ofoInfo) {
        // setTimeout(function () {
        //   wx.navigateTo({
        //     url: '../bindphone/bindphone'
        //   });
        // }, 300);
        // return;
      }
      console.log("index.js onShow 2");
      that.setData({
        userInfo: userInfo
      })
    });
    // 获取购买时长
    wx.getStorage({
      key: 'timeInput',
      success: function (res) {
        console.log(res.data)
        if (res.data) {
          that.setData({
            payTime: res.data,
            parkShow: true,
            // winHeight: that.data.winHeight - 185
          })
        }
      }
    });
    // 获取订单编号
    wx.getStorage({
      key: 'orderNo',
      success: function (res) {
        console.log(res.data)
        if (res.data) {
          that.setData({
            orderNo: res.data,
          })
        }
      }
    });
    // 获取车位编号,
    wx.getStorage({
      key: 'parkingNumber',
      success: function (res) {
        console.log(res.data)
        that.setData({
          parkNo: res.data
        });
        wx.showLoading({
          title: '加载中...'
        });
        wx.request({
          url: http.reqUrl + '/wx/realTime_billing',
          data: {
            parkNo: that.data.parkNo
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            console.log(res)
            that.setData({
              timestamp: res.data.data.startParkedTime
            });
            __compuTime(res.data.data.carFree, res.data.data.carPrice, res.data.data.startParkedTime)
          }
        });
      }
    });
    // 获取停车开始时间戳
    // wx.getStorage({
    //   key: 'timestamp',
    //   success: function (res) {
    //     console.log(res.data)
    //     that.setData({
    //       timestamp: res.data
    //     });
        
    //     // __compuTime();
    //   }
    // });
    // if (that.data.timestamp > 0) {
     
    // }

    function __compuTime(carFree, carPrice, startParkedTime) {
      
      var timestampNow = Date.parse(new Date());
      // console.log(that.data.timestamp);
      // console.log(timestampNow);
      var resultTime = timestampNow - startParkedTime
      var m = parseInt(resultTime / 60000);
      if (m <= carFree) {
        that.setData({
          parkTime: m,
          consumedMoney: '0.00'
        })
      }
      if (m > carFree && m <= 60) {
        that.setData({
          parkTime: m,
          consumedMoney: carPrice / 100 + '.00'
        })
      }
      if (m > 60) {
        var h = parseInt(m / 60);
        var m1 = m - (h * 60);
        that.setData({
          parkTime: h + '小时' + m1,
          consumedMoney: (carPrice / 100) + (Math.ceil(m / 60) - 1) * (carPrice / 100) + '.00'
        })
      }
      if (that.data.payTime != 0) {
        if (resultTime >= (parseFloat(that.data.payTime) * 3600000 - 300000)) {
          // if (resultTime >= (parseFloat(that.data.payTime))) {
          clearTimeout(parkingTime);
          wx.showModal({
            title: '购买时长',
            content: '您所购买的时长即将用尽，请再次购买。',
            success: function (res) {
              if (res.confirm) {
                // console.log('用户点击确定');
                // clearTimeout(parkingTime);
                wx.navigateTo({
                  url: '../paytime/paytime'
                })
                return
              } else if (res.cancel) {
                // clearTimeout(parkingTime);
                wx.showModal({
                  title: '停止计费',
                  content: '您确定要停止计费吗，请确保及时驾离车位',
                  success: function (res) {
                    if (res.confirm) {
                      var oData = {
                        parkingNo: that.data.parkNo,
                        statu: 0
                      }
                      // 跳转/pkmg/upparkingno      1
                      app.func.req('/pkmg/upparkingno', oData, function (res) {
                        console.log(res);
                        if(res.success){
                          app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {
                            console.log(res);
                            if (res.data.length > 0) {
                              var oArr = [];
                              for (var i = 0; i < res.data.length; i++) {
                                var oObj = {};
                                if (res.data[i].SumPark == res.data[i].SumUsePark && res.data[i].SumPark == 0 && res.data[i].SumUsePark == 0) {
                                  continue
                                } else {
                                  if (res.data[i].SumPark === res.data[i].SumUsePark) {
                                    oObj.iconPath = "../../img/parking-p_icon_choice_pressed@2x.png";
                                  } else {
                                    oObj.iconPath = "../../img/parking-p_icon_choice_default@2x.png";
                                  }
                                }
                                oObj.id = res.data[i].parkNo;
                                oObj.latitude = res.data[i].latitude;
                                oObj.longitude = res.data[i].longitude;
                                oObj.width = 28;
                                oObj.height = 31;
                                oArr.push(oObj);
                                oObj = {};
                              }
                              that.setData({
                                markers: oArr
                              })
                              wx.setStorage({
                                key: 'parkTime1',
                                data: that.data.parkTime
                              });
                              wx.setStorage({
                                key: 'parkNo1',
                                data: that.data.parkNo
                              });
                              wx.setStorage({
                                key: 'consumedMoney1',
                                data: that.data.consumedMoney
                              });
                              wx.setStorage({
                                key: 'payTime1',
                                data: that.data.payTime
                              });
                              // console.log('用户点击确定');
                              that.setData({
                                parkShow: false,//是否显示下面的
                                consumedMoney: '0.00',//已消费
                                payTime: 0,//购买时长
                                parkTime: 0,//停车时长
                                parkNo: ''//车位编号
                              });
                              // clearTimeout(parkingTime);
                              // wx.removeStorage({
                              //   key: 'payTime',
                              //   success: function (res) {
                              //     console.log(res.data)
                              //   }
                              // });
                              wx.removeStorage({
                                key: 'timeInput',
                                success: function (res) {
                                  console.log(res.data)
                                }
                              });
                              wx.removeStorage({
                                key: 'parkingNumber',
                                success: function (res) {
                                  console.log(res.data)
                                }
                              });

                              wx.removeStorage({
                                key: 'timestamp',
                                success: function (res) {
                                  console.log(res.data)
                                }
                              });
                              wx.removeStorage({
                                key: 'parkTime',
                                success: function (res) {
                                  console.log(res.data)
                                }
                              });
                              setTimeout(function () {
                                wx.navigateTo({
                                  url: '../endbilling/endbilling',
                                })
                              }, 500)
                            }
                          });


                          
                        }
                      });
                      
                    } else if (res.cancel) {
                      // console.log('用户点击取消');
                    }
                  }
                });

                // console.log('用户点击取消');
              }
            }
          });
          return
        }
        
      }
      parkingTime = setTimeout(function () { __compuTime() }, 1000)
    }

    wx.getLocation({
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        // 实例化API核心类
        var demo = new QQMapWX({
          key: 'XKBBZ-5RKWS-4TQOB-6CMPO-U2ORF-V5BKW' // 必填
        });
        console.log(longitude);
        console.log(latitude);
        that.setData({
          longitude: longitude,
          latitude: latitude,
        });
        // 绑定手机号码需要接口判断是否绑定
        // setTimeout(function () {
        //   wx.navigateTo({
        //     url: '../bindphone/bindphone'
        //   });
        // }, 300);
        // 调用接口
        demo.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            console.log(res);
            // 获取当前区域
            // console.log(res.result.address_component.district);
            oAddress = res.result.address_component.district;
            console.log(oAddress);
            app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {
              console.log(res);
              if (res.data.length > 0) {
                var oArr = [];
                for (var i = 0; i < res.data.length; i++) {
                  var oObj = {};
                  if (res.data[i].SumPark == res.data[i].SumUsePark && res.data[i].SumPark == 0 && res.data[i].SumUsePark == 0) {
                    continue
                  } else {
                    if (res.data[i].SumPark === res.data[i].SumUsePark) {
                      oObj.iconPath = "../../img/parking-p_icon_choice_pressed@2x.png";
                    } else {
                      oObj.iconPath = "../../img/parking-p_icon_choice_default@2x.png";
                    }
                  }
                  oObj.id = res.data[i].parkNo;
                  oObj.latitude = res.data[i].latitude;
                  oObj.longitude = res.data[i].longitude;
                  oObj.width = 28;
                  oObj.height = 31;
                  oArr.push(oObj);
                  oObj = {};
                }
                that.setData({
                  markers: oArr
                })
              }
            });
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
            console.log(res);
          }
        });
      }
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  onShow: function(){
    var that = this;
    // this.setData({
    //   payTime: res.data,
    //   // payTime: 1,
    //   parkShow: true,
    //   // winHeight: that.data.winHeight - 185
    // })
    
    // that.setData({
    //   timestamp: '1513083321000'
    // });
    // __compuTime();
    // 计时，计费
    
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 监听markers
  markertap(e) {
    console.log(e.markerId);
    console.log(e);
    var oData = {
          address: oAddress,
          parkNo: e.markerId
        }
    app.func.req('/parking/iswhether', oData, function (res) {
      console.log(res);
      if (res.success) {//满
        wx.showModal({
          title: '提示',
          content: '这个车位已经被使用',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        });
      } else {//不满
        wx.setStorage({
          key: 'markerId',
          data: e.markerId,
          complete: function () {
            console.log('markerId=' + e.markerId);
          }
        });

        app.func.req('/parking/parkInfo', oData, function (res) {
          console.log(res);
          wx.openLocation({
            latitude: parseInt(res.data[0].latitude),
            longitude: parseInt(res.data[0].longitude),
            scale: 18,
            name: res.data[0].parkName,
            address: res.data[0].parkAddress
          })
        });
      }
    })
  },

  payPark: function(e){
    var that = this;
    wx.navigateTo({
      url: '../paytime/paytime'
    })
  },

  // 停止消费
  stopPark: function(e){
    var that = this;
    wx.showModal({
      title: '停止计费',
      content: '您确定要停止计费吗，请确保及时驾离车位',
      success: function (res) {
        if (res.confirm) {
          var oData = {
            orderNo: that.data.orderNo
          }
          // 跳转/pkmg/upparkingno      1 
          app.func.req('/wxpay/refund', oData, function (res) {
            console.log(res.data);
            wx.setStorage({
              key: 'refundMoney',
              data: res.data
            });
            // if (res.success) {
              app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {
                console.log(res);
                if (res.data.length > 0) {
                  var oArr = [];
                  for (var i = 0; i < res.data.length; i++) {
                    var oObj = {};
                    if (res.data[i].SumPark == res.data[i].SumUsePark && res.data[i].SumPark == 0 && res.data[i].SumUsePark == 0) {
                      continue
                    } else {
                      if (res.data[i].SumPark === res.data[i].SumUsePark) {
                        oObj.iconPath = "../../img/parking-p_icon_choice_pressed@2x.png";
                      } else {
                        oObj.iconPath = "../../img/parking-p_icon_choice_default@2x.png";
                      }
                    }
                    oObj.id = res.data[i].parkNo;
                    oObj.latitude = res.data[i].latitude;
                    oObj.longitude = res.data[i].longitude;
                    oObj.width = 28;
                    oObj.height = 31;
                    oArr.push(oObj);
                    oObj = {};
                  }
                  that.setData({
                    markers: oArr
                  })
                  wx.setStorage({
                    key: 'parkTime1',
                    data: that.data.parkTime
                  });
                  wx.setStorage({
                    key: 'parkNo1',
                    data: that.data.parkNo
                  });
                  wx.setStorage({
                    key: 'consumedMoney1',
                    data: that.data.consumedMoney
                  });
                  wx.setStorage({
                    key: 'payTime1',
                    data: that.data.payTime
                  });
                  that.setData({
                    parkShow: false,//是否显示下面的
                    consumedMoney: '0.00',//已消费
                    payTime: 0,//购买时长
                    parkTime: 0,//停车时长
                    parkNo: ''//车位编号
                  });
                  clearTimeout(parkingTime);
                  // wx.removeStorage({
                  //   key: 'payTime',
                  //   success: function (res) {
                  //     console.log(res.data)
                  //   }
                  // });
                  wx.removeStorage({
                    key: 'timeInput',
                    success: function (res) {
                      console.log(res.data)
                    }
                  });
                  wx.removeStorage({
                    key: 'parkingNumber',
                    success: function (res) {
                      console.log(res.data)
                    }
                  });
                  wx.removeStorage({
                    key: 'timestamp',
                    success: function (res) {
                      console.log(res.data)
                    }
                  });
                  wx.removeStorage({
                    key: 'parkTime',
                    success: function (res) {
                      console.log(res.data)
                    }
                  });
                  setTimeout(function () {
                    wx.navigateTo({
                      url: '../endbilling/endbilling',
                    })
                  }, 500)
                }
              });
            // }
          });



          // console.log('用户点击确定');
          
        } else if (res.cancel) {
          // console.log('用户点击取消');
        }
      }
    });
  },

  // // 点击智慧车位
  // parkingP:function(e){
  //   console.log();
  //   this.setData({
  //     carImg:'../../img/parking-p_icon_choice_pressed@2x.png',
  //     lockImg: '../../img/parking-s_icon_choice_default@2x.png',
  //     markers: [{
  //       iconPath: "../../img/park-lot_p_icon@2x.png",
  //       id: 0,
  //       latitude: 22.574083,
  //       longitude: 113.887427,
  //       width: this.data.markerWidth,
  //       height: this.data.markerHeight,
  //     }, {
  //       iconPath: "../../img/park-lot_p_icon@2x.png",
  //       id: 1,
  //       latitude: 22.57566,
  //       longitude: 113.887603,
  //       width: this.data.markerWidth,
  //       height: this.data.markerHeight,
  //     }]
  //   });
  // },
  // // 点击车位锁
  // parkingS:function(e){
  //   this.setData({
  //     carImg: '../../img/parking-p_icon_choice_default@2x.png',
  //     lockImg: '../../img/parking-s_icon_choice_pressed@2x.png',
  //     markers: [{
  //       iconPath: "../../img/park-lock_s_icon@2x.png",
  //       id: 2,
  //       latitude: 22.575261,
  //       longitude: 113.887129,
  //       width: this.data.markerWidth,
  //       height: this.data.markerHeight,
  //     }, {
  //       iconPath: "../../img/park-lock_s_icon@2x.png",
  //       id: 3,
  //       latitude: 22.575073,
  //       longitude: 113.887798,
  //       width: this.data.markerWidth,
  //       height: this.data.markerHeight,
  //     }]
  //   });
  // },
  // 刷新页面，再次请求接口
  refreshtap:function(e){
    console.log(oAddress);
    var that = this;
    // map.clearOverlays();//清除覆盖物
    app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {
      console.log(res);
      if (res.data.length > 0) {
        var oArr = [];
        for (var i = 0; i < res.data.length; i++) {
          var oObj = {};
          if (res.data[i].SumPark == res.data[i].SumUsePark && res.data[i].SumPark == 0 && res.data[i].SumUsePark == 0) {
            continue
          } else {
            if (res.data[i].SumPark === res.data[i].SumUsePark) {
              oObj.iconPath = "../../img/parking-p_icon_choice_pressed@2x.png";
            } else {
              oObj.iconPath = "../../img/parking-p_icon_choice_default@2x.png";
            }
          }
          oObj.id = res.data[i].parkNo;
          oObj.latitude = res.data[i].latitude;
          oObj.longitude = res.data[i].longitude;
          oObj.width = 28;
          oObj.height = 31;
          oArr.push(oObj);
          oObj = {};
        }
        that.setData({
          markers: oArr
        })
      }
    });
  },
  // 移动到定位点中心
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  // 跳转帮助中心页面
  helpTocenter: function(){
    wx.navigateTo({
      url: '../help/help'
    })
  },
  // 跳转个人中心页面
  personalTocenter: function(){
    wx.navigateTo({
      url: '../person/person'
    })
  },
  // // 点击tab切换
  // swichNav: function (e) {
  //   this.setData({
  //     swichNav1: false,
  //     swichNav: true
  //   })
  // },
  // swichNav1: function (e) {
  //   this.setData({
  //     swichNav: false,
  //     swichNav1: true
  //   })
  // },
  
  // 我要停车
  stopCar: function(e){
    var that = this;
    console.log(1);
    // 请求看是否有车位编号与车牌号，无跳手动输入，有跳订单
    // 输入车位编号
    wx.navigateTo({
      url: '../carNumber/carNumber',
      success: function (res) {
        console.log('跳转到carNumber页面成功')// success
      },
      fail: function () {
        console.log('跳转到carNumber页面失败')  // fail
      },
      complete: function () {
        console.log('跳转到carNumber页面完成') // complete
      }
    });
    // 绑定手机号码
    // wx.navigateTo({
    //   url: '../bindphone/bindphone'
    // })
  }

});

