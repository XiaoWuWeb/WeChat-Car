var app = getApp();
Page({
  data: {
    plateNo: '请编辑',
    plateLength: false,
    plateAreaCharset: ['京', '津', '沪', '渝', '冀', '豫', '云', '辽', '黑', '湘', '皖', '鲁', '新', '苏', '浙', '赣', '鄂', '桂', '甘', '晋', '蒙', '陕', '吉', '闽', '贵', '粤', '青', '藏', '川', '宁', '琼'],
    plateDigitCharset: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    inputBoxData: [{ char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }],
    currentPos: null,
    animationData: {},
  },
  onShow: function () {
    // 页面显示
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    animation.top('20rpx').step()
    this.setData({
      animationData: animation.export()
    })
    // this.putPlateInputBox()
    // this.query()
  },
  // plateInput:function(e){
  //   var plateInput = e.detail.value;
  //   console.log(plateInput.length);
  //   if (plateInput.length > 6){
  //     this.setData({
  //       plateLength: true,
  //     })
  //   }else{
  //     this.setData({
  //       plateLength: false,
  //     })
  //   }
  //   this.setData({
  //     plateNo: plateInput,
  //   })
  // },
  bindDigitTap: function (res) {
    let inputBoxData = this.data.inputBoxData
    let id = res.currentTarget.id
    let currentPos = id
    // console.log(currentPos)
    if (currentPos  > 6 ){
      
      // console.log(this.data.inputBoxData);
      // console.log(this.data.inputBoxData.char);
      var oArr = [];
      for (var i = 0; i < this.data.inputBoxData.length; i++){
        
        
        oArr.push(this.data.inputBoxData[i].char);
      }
      // console.log(oArr);
      var oString = oArr.join("")
      this.setData({
        plateLength: true,
        plateNo: oString
      })
    }else{
      this.setData({
        plateLength: false,
      })
    }
    if (id > 6) {
      id = 6
      currentPos = null;
    } else {
      inputBoxData[id].hover = 'plate-input-digit-hover'
    }
    if (this.data.currentPos != null) inputBoxData[this.data.currentPos].hover = ''

    this.setData({
      inputBoxData: inputBoxData,
      currentPos: currentPos
    })

  },
  bindKeyTap: function (res) {
    console.log(res)
    let char = res.currentTarget.dataset.char
    let inputBoxData = this.data.inputBoxData
    inputBoxData[this.data.currentPos].char = char
    let passOnData = {
      currentTarget: {
        id: parseInt(this.data.currentPos) + 1
      }
    }
    this.bindDigitTap(passOnData)
  },
  plateOn: function(){
    var that = this;
    // console.log(this.data.plateLength);
    //console.log(this.data.plateNo);
    if (this.data.plateLength){
      wx.setStorage({
        key: 'plateNo',
        data: that.data.plateNo,
        complete: function () {
          //跳转
          wx.navigateTo({
            url: '../person/person'
          });
          // wx.navigateBack({
          //   delta: 1
          // })
        }
      });
    }
  }
})