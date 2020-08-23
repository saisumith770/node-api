const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Joi = require('joi')

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_!@#$%^&*()]{3,30}$/).min(3).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9_!@#$%^&*()]{3,30}$/).min(10).required(),
    access_token: [Joi.string(), Joi.number()],
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
})

router.post('/getToken',(req,res) => {
    jwt.sign({user:req.body}, 'secret_key',(err,token) => {
        res.send({
            token : token
        })
    })
})

router.get('/qrtoken',(req,res) => {
    id = 0505466
    res.send({
        token : `http://localhost:8080/auth/submit-qr-token/${id}`
    })
})

router.post('/signup',(req,res) => {
    const result = Joi.validate({username:req.query.username,password:req.query.password,email:req.query.email}, schema)
    if(result.error){
        return res.send({
            status:'nope'
        })
    }else{
        return res.send({
            status : 'done'
        })
    }
})

async function verifyTokenFunc(req,res,next){
    const bearerHeader = req.headers['authorization']
    if(typeof bearerHeader !== 'undefined'){
        const bearerToken = bearerHeader.split(' ')[1]
        req.token = bearerToken
        next()
    }else{
        res.sendStatus(403)
    }
}

module.exports.Authrouter = router
module.exports.verifyTokenFunc = verifyTokenFunc