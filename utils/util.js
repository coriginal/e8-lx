export const formatJSONString = function (JSONString) {
  return JSONString.replace(/\'/g, '"')
}

// 对象转成字符串
export const stringifyObj = function (obj) {
  var keyValues = []
  for (let prop in obj) {
    keyValues.push(`${prop}=${obj[prop]}`)
  }
  return keyValues.join('&')
}

export const json2Form = function (json) {
  var str = []
  for (var key in json) {
    let value = json[key];
    if (value && value != 'undefined') {
      str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value))
    }
  }
  return str.join("&")
}

//时间差
export const subDate = function (date, x) {
  if (typeof date == 'string') {
    date = date.replace(/-/g, '/');
  }
  date = new Date(date)
  return new Date(date.getTime() - x * 1000 * 60 * 60 * 24);
}

// 倒计时
export const countdown = function (callback, duration = 60) {
  var timer = duration;
  const interval = setInterval(() => {
    if (timer < 0) {
      clearInterval(interval);
      return;
    }
    callback && callback(timer--);
  }, 1000)
}

function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    wx.showToast({
      title: '输入有误',
      icon: 'none'
    })
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

export const numberRound10 = (value, exp) => decimalAdjust('floor', value, exp);

export const formatDate = function (date, format) {
  if (typeof date == 'string') {
    date = date.replace(/-/g, '/');
  }
  date = new Date(date)
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
    "S": date.getMilliseconds()
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};
export const formatUrl = (url) => {
  if (!url) return {};
  const obj = {};
  const params = url.split("?")[1].split("&");
  params.forEach(item => {
    const [key, value] = item.split('=')
    obj[key] = value
  })
  return obj
}

export const isValidJSON = (str) => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 防抖函数（debounce）
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    // 保存 this 指向
    const context = this
    // 清除上一次定时器
    if (timer) {
      clearTimeout(timer)
    }
    // 重新计时
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}