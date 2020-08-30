const router = require('express').Router()
const {verifyTokenFunc} = require('../auth/authenticationRoute')
const jwt = require('jsonwebtoken')
const {fakeUsers,Roles} = require('../../databaseProjections/dbUsers')

// router.get('/:domain',verifyTokenFunc,(req,res) => {
//     jwt.verify(req.token,'secret_key',(err,authData) => {
//         if(err){
//             return res.sendStatus(403)
//         }else{
//             for(var i=0;i<fakeUsers.length;i++){
//                 if(req.params.domain == fakeUsers[i].domain){
//                     return res.send({
//                         data :fakeUsers[i],
//                         authData
//                     })
//                 }
//             }
//             return res.send({
//                 status : 'nope'
//             })
//         }
//     })
// })

router.get('/:domain',(req,res) => {
    for(var i=0;i<fakeUsers.length;i++){
        if(req.params.domain == fakeUsers[i].domain){
            return res.send({
                data :fakeUsers[i],
                authData
            })
        }
    }
    return res.send({
        status : 'nope'
    })
})

router.post('/del/:name',verifyTokenFunc,(req,res) => {
    if(req.query.botid == Roles.admin){
        jwt.verify(req.token,'secret_key',(err,authData) => {
            if(err){
                return res.sendStatus(403)
            }else{
                fakeUsers.forEach(user => {
                    if(user.name == req.query.username){
                        fakeUsers.pop(user)
                        return res.send({
                            status : "done"
                        })
                    }
                })
                return res.send({
                    status : "nope"
                })
            }
        })
    }else{
        return res.send({
            status : 'not authorized'
        })
    }
})

module.exports = router