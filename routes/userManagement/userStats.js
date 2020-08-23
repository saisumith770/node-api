const router = require('express').Router()
const jwt = require('jsonwebtoken')
const {verifyTokenFunc} = require('../auth/authenticationRoute')
const {fakeUsers} = require('../../databaseProjections/dbUsers')

router.post('/statmodification',verifyTokenFunc,(req,res) => {
    jwt.verify(req.token,'secret_key',(err,authData) => {
        fakeUsers.forEach(user => {
            if(user.domain == req.query.domain){
                user.desc = req.query.desc
                user.subscriberCount = req.query.subs
                user.followingCount = req.query.follow
                user.uploads = req.query.uploads
                return res.send({
                    status : 'done'
                })
            }
        })
        return res.send({
            status : 'nope'
        })
    })
})

router.post('/addvid',(req,res) => {
    jwt.verify(req.token,'secret_key',(err,authData) => {
        fakeUsers.forEach(user => {
            if(user.domain == req.query.domain){
                user.vids.push(req.query.vid)
                return res.send({
                    status : 'done'
                })
            }
        })
        return res.send({
            status : 'nope'
        })
    })
})

router.post('/addlive',(req,res) => {
    jwt.verify(req.token,'secret_key',(err,authData) => {
        fakeUsers.forEach(user => {
            if(user.domain == req.query.domain){
                user.live.push(req.query.live)
                return res.send({
                    status : 'done'
                })
            }
        })
        return res.send({
            status : 'nope'
        })
    })
})

module.exports = router