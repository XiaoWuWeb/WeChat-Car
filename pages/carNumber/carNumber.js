//input.js
var app = getApp();
var markerId;
Page({
  data: {
    oneNum: '',
    twoNum: '',
    threeNum: '',
    fourNum: '',
    fiveNum: '',
    sixNum: '',
    len: 0,
    val: '',
    pay: false,
    focus: false
  },
  onLoad: function(){
    wx.getStorage({
      key: 'markerId',
      success: function (res) {
        console.log(res.data)
        if (res.data) {
          markerId = res.data;
        }
      }
    });
  },
  bindHideKeyboard: function (e) {
    console.log(e.detail.value);
    var vals = e.detail.value;
    var lens = e.detail.value.length;
    this.setData({
      len: lens,
      val: vals
    })
    if (e.detail.cursor == 1){
      var str = e.detail.value;
      var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
      this.setData({
        oneNum: oNum
      })
    }
    if (e.detail.cursor == 2) {
      var str = e.detail.value;
      var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
      this.setData({
        twoNum: oNum
      })
    }
    if (e.detail.cursor == 3) {
      var str = e.detail.value;
      var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
      this.setData({
        threeNum: oNum
      })
    }
    if (e.detail.cursor == 4) {
      var str = e.detail.value;
      var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
      this.setData({
        fourNum: oNum
      })
    }
    if (e.detail.cursor == 5) {
      var str = e.detail.value;
      var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
      this.setData({
        fiveNum: oNum
      })
    }
    if (e.detail.cursor == 6) {
      var str = e.detail.value;
      var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
      wx.hideKeyboard();
      this.setData({
        sixNum: oNum,
        focus: false,
        pay: false
      })
      var oData = {};
      // 这里看要不要先验证下车位编号
      var carNumber = this.data.val
      oData.parkingNo = carNumber;
      console.log(carNumber);
      // oData.parkNo = 'sztzc10002'
      // console.log(res.data)
      // app.func.req('/pkmg/qparkingno', oData, function (res) {
      //   console.log(res)
      //   if(res.success){
          wx.setStorage({
            key: 'carNumber',
            data: carNumber,
            complete: function () {
              // 跳转
              console.log(1)
              wx.navigateTo({
                url: '../order/order'
              })
            }
          });
        // }else{
        //   if(res.code == 400){
        //     wx.showModal({
        //       title: '提示',
        //       content: '您输入的停车场车位编号已经被占用，请重新选择',
        //       showCancel: false,
        //       success: function (res) {
        //         if (res.confirm) {
        //           console.log('用户点击确定')
        //         }
        //       }
        //     });
        //   } else if (res.code == 500){
        //     wx.showModal({
        //       title: '提示',
        //       content: '您输入的停车场车位编号有误，请重新输入',
        //       showCancel: false,
        //       success: function (res) {
        //         if (res.confirm) {
        //           console.log('用户点击确定')
        //         }
        //       }
        //     });
        //   } else if (res.code == 600) {
        //     wx.showModal({
        //       title: '提示',
        //       content: '您输入编号的车位在维修中，请重新选择车位',
        //       showCancel: false,
        //       success: function (res) {
        //         if (res.confirm) {
        //           console.log('用户点击确定')
        //         }
        //       }
        //     });
        //   }
        // }
      //});  
    }
  },
  confirmTobtn: function(e){
    if (this.data.len == 6){
      var oData = {};
      var carNumber = this.data.val
      oData.parkingNo = carNumber;
      console.log(carNumber);
      // oData.parkNo = markerId
      app.func.req('/pkmg/qparkingno', oData, function (res) {
        if (res.success) {
          wx.setStorage({
            key: 'carNumber',
            data: carNumber,
            complete: function () {
              // 跳转
              console.log(1)
              wx.navigateTo({
                url: '../order/order'
              })
            }
          });
        } else {
          if (res.code == 400) {
            wx.showModal({
              title: '提示',
              content: '您输入的停车场车位编号已经被占用，请重新选择',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            });
          } else if (res.code == 500) {
            wx.showModal({
              title: '提示',
              content: '您输入的停车场车位编号有误，请重新输入',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            });
          } else if (res.code == 600) {
            wx.showModal({
              title: '提示',
              content: '您输入编号的车位在维修中，请重新选择车位',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            });
          }
        }
      });  
    }
  }
});