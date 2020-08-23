const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cors = require('cors')
const io = require('socket.io')(http)
const discord = require('discord.js')
const port = process.env.PORT || 8080

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

app.get('/authQR/',(req,res) => {
    io.to(req.query.id).emit('auth','your authenticated')
    res.send({
        status : "done"
    })
})

app.get('/twitchUpdates',(req,res) => {
    console.log(req)
    res.json({
        updated : true
    })
})

const bot = new discord.Client()

bot.on("ready",() => {
    console.log(bot.user.username,"is online")
    bot.user.setActivity("Hello",{type : "STREAMING"})
})

bot.on("presenceUpdate", (oldMember,newMember) => {
    newMember.activities.forEach(e => {
        if(e.name == "Spotify") console.log(e)
    })
    //io.sockets.emit('newStatus',{data : newMember.activities,discordID : newMember.userID})
} )

bot.login("NzQxMTk5OTEwMDgyMTgzMjU5.Xy0GNQ.uR6xQMiorGsLYaB7cZUJ6-YKwcQ")

http.listen(port, () => {
    console.log(`server started on port ${port}`)
})