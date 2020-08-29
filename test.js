// let date = new Date()
// let datePart = eval(date.getDate())
// let month = eval(date.getMonth()) + 1
// let year = eval(date.getFullYear())
// if(year > 2020){
//     console.log("gay boss")
// }else if(year === 2020){
//     if(month > 1){
//         console.log("gay boss")
//     }else if(month === 1){
//         if(datePart >= 12){
//             console.log("gay boss")
//         }else{
//             console.log("belated gay")
//         }
//     }else{
//         console.log("belated gay")
//     }
// }else console.log("belated gay")
let [date,month,year] = '3/8/2020'.split("/")
console.log(date,month,year)