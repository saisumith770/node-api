// const axios = require('axios')

// const code = 'AQBH0SCTCk_dJqHfFeOpEWJQI1U_V_ooJE569w1uqNU1YyO9nUlXA7GpxijxtmEG_yMXFYn_ypsQDa54_Rnb11Km-DcgivTfgVA6YWrFq_bqIQmGCaAPD1sq50ebfOD2g-8820vCehBXlpd2vbyXBQ_KR_hRIVkvELnfSzTQUMS6v3qbvccu7AgCtcveJrwtgnZlgfp0IrUDqMgZwmUHuA8Lyn_OQuECz9z1_XSY_E-17B8X8hqh7rioJQpSB2jJYGrBeYIcMkIp8uC-X5J7KMHa-YlFsGioaqnLyepRGOVNrwZXMjGHBiz2CZ5zSDbQfcJRWssvNjveGqIxROfXTe-vJODNn-LfCheU5zEt5WETsw#_=_'
// axios.get(`https://graph.facebook.com/v8.0/oauth/access_token?client_id=788547768605481&redirect_uri=http://localhost:3000/redirects/FacebookWebhook&client_secret=3546808a33f14dee5f3bb3d6cc9b8a50&code=${code}`)
//     .then(data => {
//         let access_token = data.data.access_token
//         axios.get(`https://graph.facebook.com/me?&access_token=${access_token}`, {
//             headers: {
//                 'Content-type': 'application/json'
//             }
//         })
//             .then(data => {
//                 console.log(data.data)
//             })
//             .catch(err => console.log({ status: 'error' }))
//     })
//     .catch(err => console.log({ status: 'error' }))
// const Joi = require('joi')

// const schema = Joi.object().keys({
//     username: Joi.string().regex(/[a-zA-Z0-9_!@#$*]+/).min(2).max(20).required(),
//     password: Joi.string().regex(/[^]*/).min(10).max(30).required()
// })

// const result = Joi.validate({
//     username: "Sai ) Sumith",
//     password: "ajbsksdfd**S*DF"
// }, schema)
const rgx = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/
console.log(rgx.test('Sai Sumith'))
//05DvL3MhVlx68Oe3CDVY