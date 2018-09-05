function validateURL(para){
    let str = para.includes("http://")
    if(str === true){
    return para
    } else {
    return `http//:${para}`
    }
}

console.log(validateURL("http://google.com"));