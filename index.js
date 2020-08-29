const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cors = require('cors')
const io = require('socket.io')(http)
const discord = require('discord.js')
const port = process.env.PORT || 8080
const axios = require("axios")

const {Authrouter} = require('./routes/auth/authenticationRoute')
const userRoutes = require('./routes/userManagement/userAccess')
const userModRoutes = require('./routes/userManagement/userStats')
require('dotenv/config')

let id

app.use(cors())
app.use(express.json())
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Methods','GET,POST')
    res.header('Access-Control-Allow-Headers','Content-Type')
    next()
})
app.use('/auth',Authrouter)
app.use('/user',userRoutes)
app.use('/moduser',userModRoutes)

io.on('connect',socket => {
    console.log(socket.id)
    id = socket.id
    socket.emit("Qrcode",`http://localhost:8080/authQR/${id}`)
    socket.on('disconnect',() => {
        console.log(`disconnected ${socket.id}`)
    })
})

app.post('/twitchCode',async(req,res) => {
    axios.post(`https://id.twitch.tv/oauth2/token?client_id=f6dg5eonukchb00i100jmxjnnji2ul&client_secret=9zyed53zzaji10695b17d3c9aqw9px&code=${req.query.code}&grant_type=authorization_code&redirect_uri=http://127.0.0.1:3000/redirects/TwitchWebhook`)
    .then(data => {
        let access_token = data.data.access_token
        let refresh_token = data.data.refresh_token
        axios.get(`https://api.twitch.tv/helix/users?login=${req.query.username}`,{
            headers : {
                "Client-ID" : "f6dg5eonukchb00i100jmxjnnji2ul",
                "Authorization" : `Bearer ${access_token}`
            }
        })
        .then(data => {
            let user_id = data.data.data[0].id
            axios.post('https://api.twitch.tv/helix/webhooks/hub',{
            "hub.callback" : "https://pulse-online.herokuapp.com/twitchUpdates",
            "hub.mode" : "unsubscribe",
            "hub.topic" : `https://api.twitch.tv/helix/streams?user_id=${user_id}`,
            "hub.lease_seconds" : 864000
            },{
                headers : {
                    Authorization : `Bearer ${access_token}`,
                    "Client-ID" : "f6dg5eonukchb00i100jmxjnnji2ul"
                }
            })
            .then(() => {
                res.json({
                    user_id,
                    refresh_token,
                    status : "done"
                })
            })
            .catch(err => {res.json({
                status : "subscription was not successfull"
            });console.log(err)})
        })
        .catch(err => {res.json({
            status : "username doesn't exists"
        });console.log(err)})
    })
    .catch(err => {res.json({
        status : "internal server error ,please report this issue"
    });console.log(err)})
})

app.post('/refreshTwitchSubscription',(req,res) => {
    axios.post(`https://id.twitch.tv/oauth2/token--data-urlencode?grant_type=refresh_token&refresh_token=${req.query.refresh_token}&client_id=f6dg5eonukchb00i100jmxjnnji2ul&client_secret=9zyed53zzaji10695b17d3c9aqw9px`)
    .then(data => {
        let access_token = data.data.access_token
        let refresh_token = data.data.refresh_token
        axios.post('https://api.twitch.tv/helix/webhooks/hub',{
        "hub.callback" : "https://pulse-online.herokuapp.com/twitchUpdates",
        "hub.mode" : "unsubscribe",
        "hub.topic" : `https://api.twitch.tv/helix/streams?user_id=${req.query.user_id}`,
        "hub.lease_seconds" : 864000
        },{
            headers : {
                Authorization : `Bearer ${access_token}`,
                "Client-ID" : "f6dg5eonukchb00i100jmxjnnji2ul"
            }
        })
        .then(() => {
            res.json({
                refresh_token,
                status : "done"
            })
        })
        .catch(err => {res.json({
            status : "subscription was not successfull"
        });console.log(err)})
    })
    .catch(err => {res.json({
        status : "internal server error ,please report this issue"
    });console.log(err)})
})

app.get('/authQR/',(req,res) => {
    io.to(req.query.id).emit('auth','your authenticated')
    res.send({
        status : "done"
    })
})

app.post('/twitchUpdates',(req,res) => {
    io.sockets.emit("twitchUpdate",req.body)
    console.log(req.body)
    res.json({
        status : "success"
    })
})

const bot = new discord.Client()

bot.on("ready",() => {
    console.log(bot.user.username,"is online")
    bot.user.setActivity("Hello",{type : "STREAMING"})
})

bot.on("presenceUpdate", (oldMember,newMember) => {
    io.sockets.emit('newStatus',{data : newMember.activities,discordID : newMember.userID})
} )

bot.login("NzQxMTk5OTEwMDgyMTgzMjU5.Xy0GNQ.uR6xQMiorGsLYaB7cZUJ6-YKwcQ")

http.listen(port, () => {
    console.log(`server started on port ${port}`)
})