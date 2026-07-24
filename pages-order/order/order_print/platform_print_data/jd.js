//6475772446
export const printData = (data, subtcode = null) => {
    console.log(data)
    const orderInfo = data[0].platform_info //平台信息
    return [{
        isBase64:true,
        base64:orderInfo.base64
    }]
}
