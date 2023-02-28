export function formatTime(time) {
  const date = new Date(time)
  // const now = Date.now()

  // const diff = (now - date)
  // console.log(diff);
  // const diff = (now - date) / 1000

  // if (diff < 30) {
  //   return '刚刚'
  // } else if (diff < 3600) { // less 1 hour
  //   return Math.ceil(diff / 60) + '分钟前'
  // } else if (diff < 3600 * 24) {
  //   return Math.ceil(diff / 3600) + '小时前'
  // } else if (diff < 3600 * 24 * 2) {
  //   return '1天前'
  // }

  const year=date.getFullYear();
  /* 在日期格式中，月份是从0开始的，因此要加0
   * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
   * */
  const month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
  const day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();
  const hours=date.getHours()<10 ? "0"+date.getHours() : date.getHours();
  const minutes=date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();
  const seconds=date.getSeconds()<10 ? "0"+date.getSeconds() : date.getSeconds();
  //拼接
  return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
  // return year+"-"+month;

  // return time
}
