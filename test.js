function generateRandomString(strLength) {
    let outputArray = [];
    let str = ""
    strLength.forEach(function (str){
        outputArray.push(String.fromCharCode(Math.floor(Math.random() * (122 - 65) + 65)));
    })
    str = outputArray.join('');
    return str;
   
}

console.log(generateRandomString(6));