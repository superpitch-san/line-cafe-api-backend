module.exports = {
  textMessage: param => {
    return {
      type: "text",
      text: `เมนูของคุณคือ ${param} กรุณารอสักครู่`
    };
  },
  textErrorMessage: () => {
    return {
      type: "text",
      text: `ขออภัย ไม่มีเมนูนี้ในระบบ`
    };
  },
  textServedMessage: param => {
    return {
      type: "text",
      text: `ออเดอร์ของคุณ คือ ${param.productName} ได้เสิร์ฟถึงคุณแล้ว`
    }
  }
}