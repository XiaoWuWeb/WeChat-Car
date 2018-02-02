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
    // 地图
    markerWidth:28,
    markerHeight:31,
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
    timestamp: 0,//停车开始时间戳
    carFree: 0,
    carPrice: 0,
    startParkedTime: 0,
    userID:0,
    longTime:0,
    openPrompt: true
  },
  
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('map')
  },
  
  onShow: function(){
    // 转发
    wx.showShareMenu({
      withShareTicket: true
    });
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

      that.setData({
        userInfo: userInfo
      })
    });
    // 获取用户ID
    wx.getStorage({
      key: 'userID',
      success: function (res) {
        that.setData({
          userID: res.data,
        });
      }
    })
    // 获取购买时长
    wx.getStorage({
      key: 'timeInput',
      success: function (res) {

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

            that.setData({
              timestamp: res.data.data.startParkedTime
            });
            wx.setStorage({
              key: 'carFree',
              data: res.data.data.carFree
            });
            wx.setStorage({
              key: 'carPrice',
              data: res.data.data.carPrice
            });
            wx.setStorage({
              key: 'startParkedTime',
              data: res.data.data.startParkedTime
            });


            __compuTime(res.data.data.carFree, res.data.data.carPrice, res.data.data.startParkedTime)
          }
        });
      }

    });


    function __compuTime(carFree, carPrice, startParkedTime) {

      var timestampNow = Date.parse(new Date());

      var resultTime = timestampNow - startParkedTime

      var m = parseInt(resultTime / 60000);

      if (m <= 60){
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
          var LongTime = Math.ceil((((resultTime - (Math.ceil(that.data.payTime) * 3600000)) / 1000) / 60) / 60)
          that.setData({
            longTime: LongTime
          });

          // clearTimeout(parkingTime);
          if (that.data.openPrompt){
            that.setData({
              openPrompt: false
            })
            wx.showModal({
              title: '购买时长',
              content: '如需继续停车，请继续前往购买时长！',
              success: function (res) {
                if (res.confirm) {
                  that.setData({
                    openPrompt: true
                  })
                  wx.navigateTo({
                    url: '../paytime/paytime'
                  })
                  return
                } else if (res.cancel) {

                  wx.showModal({
                    title: '您确定要停止计费吗？',
                    content: '我们会把您超时未支付的金额推送给车位管理！',
                    success: function (res) {
                      if (res.confirm) {
                        
                        clearTimeout(parkingTime);
                        that.setData({
                          openPrompt: true
                        });
                        var oData = {
                          parkingNo: that.data.parkNo,
                          statu: 0
                        }
                        wx.setStorage({
                          key: 'longTime',
                          data: that.data.longTime
                        });
                        // 跳转/pkmg/upparkingno      1
                        app.func.req('/pkmg/upparkingno', oData, function (res) {//改变车位状态接口
                          if(res.success){
                            app.func.req('/push/error', { carNo: that.data.parkNo, id: that.data.userID, parkingNo: that.data.parkNo, longTime: that.data.longTime}, function (res) {//报警接口

                              app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {

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

                                  wx.removeStorage({
                                    key: 'timeInput',
                                    success: function (res) {
                                      console.log(res.data)
                                    }
                                  });
                                  wx.removeStorage({
                                    key: 'carFree',
                                    success: function (res) {
                                      console.log(res.data)
                                    }
                                  });
                                  wx.removeStorage({
                                    key: 'carPrice',
                                    success: function (res) {
                                      console.log(res.data)
                                    }
                                  });
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
                                    key: 'startParkedTime',
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
                                      url: '../endbillingtow/endbillingtow',
                                    })
                                  }, 500)
                                }
                              });
                            });
                          }
                        });
                        
                      } else if (res.cancel) {
                        that.setData({
                          openPrompt: true
                        });
                        wx.navigateTo({
                          url: '../paytime/paytime'
                        })
                        return
                      }
                    }
                  });

                }
              }
            });
            return
          }
        }else{
          that.setData({
            longTime: 0
          });

        }
        
      }
      parkingTime = setTimeout(function () {
        wx.getStorage({
          key: 'carFree',
          success: function (res) {

            that.setData({
              carFree: res.data
            });
          }
        });
        wx.getStorage({
          key: 'carPrice',
          success: function (res) {

            that.setData({
              carPrice: res.data
            });
          }
        });
        wx.getStorage({
          key: 'startParkedTime',
          success: function (res) {

            that.setData({
              startParkedTime: res.data
            });

            __compuTime(that.data.carFree, that.data.carPrice, that.data.startParkedTime)
          }
        });
        
       }, 1000)
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

        that.setData({
          longitude: longitude,
          latitude: latitude,
        });

        // 调用接口
        demo.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {

            // 获取当前区域

            oAddress = res.result.address_component.district;

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
  // onShow: function(){
  //   wx.showShareMenu({
  //      withShareTicket: true
  //   });
  //   page.onLoad();
  // },
  getUserInfo: function (e) {

    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 监听markers
  markertap(e) {

    var oData = {
          address: oAddress,
          parkNo: e.markerId
        }
    app.func.req('/parking/iswhether', oData, function (res) {

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
    if (that.data.longTime > 0) {
      // if (resultTime >= (parseFloat(that.data.payTime))) {
      clearTimeout(parkingTime);
      wx.showModal({
        title: '购买时长',
        content: '如需继续停车，请继续前往购买时长！',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              openPrompt: true
            });
            wx.navigateTo({
              url: '../paytime/paytime'
            })
            return
          } else if (res.cancel) {
            // clearTimeout(parkingTime);
            wx.showModal({
              title: '您确定要停止计费吗？',
              content: '我们会把您超时未支付的金额推送给车位管理！',
              success: function (res) {
                if (res.confirm) {
                  that.setData({
                    openPrompt: true
                  });
                  clearTimeout(parkingTime);
                  var oData = {
                    parkingNo: that.data.parkNo,
                    statu: 0
                  }
                  wx.setStorage({
                    key: 'longTime',
                    data: that.data.longTime
                  });
                  // 跳转/pkmg/upparkingno      1
                  app.func.req('/pkmg/upparkingno', oData, function (res) {//改变车位状态接口
                    if (res.success) {
                      app.func.req('/push/error', { carNo: that.data.parkNo, id: that.data.userID, parkingNo: taht.data.parkNo, longTime: that.data.longTime }, function (res) {//报警接口

                        app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {

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

                            wx.removeStorage({
                              key: 'timeInput',
                              success: function (res) {
                                console.log(res.data)
                              }
                            });
                            wx.removeStorage({
                              key: 'carFree',
                              success: function (res) {
                                console.log(res.data)
                              }
                            });
                            wx.removeStorage({
                              key: 'carPrice',
                              success: function (res) {
                                console.log(res.data)
                              }
                            });
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
                              key: 'startParkedTime',
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
                                url: '../endbillingtow/endbillingtow',
                              })
                            }, 500)
                          }
                        });
                      });
                    }
                  });

                } else if (res.cancel) {
                  that.setData({
                    openPrompt: true
                  });
                  wx.navigateTo({
                    url: '../paytime/paytime'
                  })
                  return

                }
              }
            });


          }
        }
      });
      return
    } else {
      wx.showModal({
        title: '停止计费',
        content: '您确定要停止计费吗，请确保及时驾离车位',
        success: function (res) {
          if (res.confirm) {
            var oData = {
              orderNo: that.data.orderNo,
              id: that.data.userID
            }
            // 跳转/pkmg/upparkingno      1 
            app.func.req('/wxpay/refund', oData, function (res) {

              wx.setStorage({
                key: 'refundMoney',
                data: res.data
              });

              app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {

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
            });


          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    }

    
  },
  // 刷新页面，再次请求接口
  refreshtap:function(e){

    this.setData({
      carImg: '../../img/parking-p_icon_choice_default@2x.png',
      lockImg: '../../img/parking-s_icon_choice_default@2x.png',
    });
    var that = this;
    // map.clearOverlays();//清除覆盖物
    app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {

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


  // 我要停车
  stopCar: function(e){
    var that = this;

    // 请求看是否有车位编号与车牌号，无跳手动输入，有跳订单
    // 输入车位编号
    var oData = {
      id: that.data.userID
    }
    app.func.req('/appuser/unpaidrecord', oData, function (res) {
      if(res.success){//有未支付

        var OMoney = parseInt(res.data[0].money)
        var Otime = res.data[0].times
        let oContent = '您之前还有未支付的订单！需支付完成后才可继续停车，总金额是：' + (parseInt(res.data[0].money) / 100) + '元。是否支付。';
        wx.showModal({
          title: '警告',
          content: oContent,
          success: function (res) {
            if (res.confirm) {
              wx.getStorage({
                key: 'token',
                success: function (res) {
                  wx.request({
                    url: http.reqUrl + '/wx/appusr/unpaid/wxpay',
                    data: {
                      money: OMoney,
                      userid: that.data.userID,
                      times: Otime
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded',
                      'token': res.data
                    },
                    success: function (res) {

                      wx.requestPayment({
                        'timeStamp': res.data.data.timeStamp + '',
                        'nonceStr': res.data.data.nonceStr + '',
                        'package': res.data.data.package + '',
                        'signType': res.data.data.signType + '',
                        'paySign': res.data.data.paySign + '',
                        'success': function (res) {
                          wx.reLaunch({
                            url: '../index/index'
                          })
                        },
                        'fail': function (res) {

                          var oMassage = res;
                          wx.showModal({
                            title: '警告',
                            content: oMassage,
                            showCancel: false,
                            success: function (res) {
                              if (res.confirm) {
                                console.log('用户点击确定')
                              }
                            }
                          });
                        }
                      });

                    }
                  })
                }
              });

            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          }
        });
      }else{//没有违停
        wx.navigateTo({
          url: '../carNumber/carNumber',
          success: function (res) {
            console.log('success')
          },
          fail: function () {
            console.log('fail')
          },
          complete: function () {
            console.log('complete')
          }
        });
      }
    });
    
  },
  parkingS: function(){
    wx.reLaunch({
      url: '../lockMap/lockMap'
    })
  }

});

