const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const discord = require('discord.js')
const port = process.env.PORT || 8080
const axios = require("axios")
const mql = require('@microlink/mql')
const { analyse } = require('@notify.me/link-parser')
const cors = require('cors')
const queryString = require('querystring')

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const { Authrouter } = require('./routes/auth/authenticationRoute')
const userRoutes = require('./routes/userManagement/userAccess')
const userModRoutes = require('./routes/userManagement/userStats')
require('dotenv/config')

let id
const twitch_client_id = 'twitch client id'
const twitch_client_secret = 'twitch client secret'
const youtube_client_id = 'youtube client id'
const youtube_client_secret = 'youtube client secret'
const spotify_code = "spotify code"
const facebook_client_id = 'facebook client id'
const facebook_client_secret = 'facebook client id'
const discord_client_id = 'discord client id'
const discord_client_secret = 'discord client secret'
const bot_id = "discord bot id"

function getTwitchSubscription(user_id, access_token, refresh_token) {
    axios.post('https://api.twitch.tv/helix/webhooks/hub', {
        "hub.callback": `https://pulse-online.herokuapp.com/twitchUpdates/${user_id}`,
        "hub.mode": "subscribe",
        "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${user_id}`,
        "hub.lease_seconds": 864000
    }, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Client-ID": `${twitch_client_id}`
        }
    })
        .then(() => {
            res.json({
                user_id,
                refresh_token,
                status: "done"
            })
        })
        .catch(err => {
            res.json({
                status: "subscription was not successfull"
            }); console.log(err)
        })
}

app.use(express.json())
app.use(cors(corsOptions))
app.use('/auth', Authrouter)
app.use('/user', userRoutes)
app.use('/moduser', userModRoutes)

io.on('connect', socket => {
    console.log(socket.id)
    id = socket.id
    socket.emit("Qrcode", `http://localhost:8080/authQR/${id}`)
    socket.on('disconnect', () => {
        console.log(`disconnected ${socket.id}`)
    })
})

app.post('/twitchCode', async (req, res) => {
    axios.post(`https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_client_secret}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=http://127.0.0.1:3000/redirects/TwitchWebhook`)
        .then(data => {
            let access_token = data.data.access_token
            let refresh_token = data.data.refresh_token
            axios.get(`https://api.twitch.tv/helix/users?login=${req.query.username}`, {
                headers: {
                    "Client-ID": `${twitch_client_id}`,
                    "Authorization": `Bearer ${access_token}`
                }
            })
                .then(data => {
                    let user_id = data.data.data[0].id
                    getTwitchSubscription(user_id, access_token, refresh_token)
                })
                .catch(err => {
                    res.json({
                        status: "username doesn't exists"
                    }); console.log(err)
                })
        })
        .catch(err => {
            res.json({
                status: "internal server error ,please report this issue"
            }); console.log(err)
        })
})

app.post('/refreshTwitchSubscription', (req, res) => {
    axios.post(`https://id.twitch.tv/oauth2/token--data-urlencode?grant_type=refresh_token&refresh_token=${req.query.refresh_token}&client_id=${twitch_client_id}&client_secret=${twitch_client_secret}`)
        .then(data => {
            let access_token = data.data.access_token
            let refresh_token = data.data.refresh_token
            getTwitchSubscription(req.query.user_id, access_token, refresh_token)
        })
        .catch(err => {
            res.json({
                status: "internal server error ,please report this issue"
            }); console.log(err)
        })
})

app.get('/authQR/', (req, res) => {
    io.to(req.query.id).emit('auth', 'your authenticated')
    res.send({
        status: "done"
    })
})

app.all('/twitchUpdates/:user_id', (req, res) => {
    if (req.method === "GET") {
        if (req.query["hub.challenge"]) {
            res.send(req.query["hub.challenge"])
        }
    }
    else if (req.method === "POST") {
        io.sockets.emit("twitchUpdate", { data: req.body, user_id: req.query.user_id })
        res.json({
            status: "done"
        })
    }
})

app.get('/twitchCreds', (req, res) => {
    axios.post(`https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_client_secret}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=http://127.0.0.1:3000/redirects/TwitchWebhook`)
        .then(data => {
            let access_token = data.data.access_token
            axios.get(`https://id.twitch.tv/oauth2/userinfo`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
                .then(data => {
                    res.json({
                        creds: `${data.data.preferred_username}`,
                        account: `https://twitch.tv/${data.data.preferred_username}`
                    })
                })
                .catch(err => res.json({ status: "error" }))
        })
        .catch(err => res.json({ status: "error" }))
})
//account
app.get('/youtubeCreds', (req, res) => {
    axios.post(`https://oauth2.googleapis.com/token?client_id=${youtube_client_id}&client_secret=${youtube_client_secret}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=http://localhost:3000/redirects/YoutubeWebhook`)
        .then(data => {
            let access_token = data.data.access_token
            axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
                .then(data => {
                    res.json({
                        creds: `${data.data.items[0].snippet.title}`,
                        account: `https://www.youtube.com/channel/${data.data.items[0].id}`
                    })
                })
        })
})

app.get('/spotifyCreds', (req, res) => {
    axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            'Authorization': `Basic ${spotify_code}`
        },
        params: {
            grant_type: 'authorization_code',
            code: `${req.query.code}`,
            redirect_uri: 'http://localhost:3000/redirects/SpotifyWebhook'
        }
    }).then(async function getUserInfo(data) {
        const access_token = await data.data.access_token
        const user = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                "Authorization": "Bearer " + access_token
            }
        })
            .then(response => {
                res.json({
                    creds: response.data.display_name,
                    account: response.data.external_urls.spotify
                });

            })
            .catch(err => {
                res.json({
                    status: 'error'
                })
                console.log('err');
            });
    }).catch(function (error) {
        res.json({
            status: 'error2'
        })
    });
})
//account
app.get('/facebookCreds', (req, res) => {
    axios.get(`https://graph.facebook.com/v8.0/oauth/access_token?client_id=${facebook_client_id}&redirect_uri=http://localhost:3000/redirects/FacebookWebhook&client_secret=${facebook_client_secret}&code=${req.query.code}`)
        .then(data => {
            let access_token = data.data.access_token
            axios.get(`https://graph.facebook.com/me?&access_token=${access_token}`, {
                headers: {
                    'Content-type': 'application/json'
                }
            })
                .then(data => {
                    res.json({
                        creds: `${data.data.name}`
                    })
                })
                .catch(err => res.json({ status: 'error' }))
        })
        .catch(err => res.json({ status: 'error' }))
})

app.get('/discordCreds', (req, res) => {
    axios.post('https://discordapp.com/api/oauth2/token', queryString.stringify({
        'client_id': discord_client_id,
        'client_secret': discord_client_secret,
        'grant_type': 'authorization_code',
        'code': req.query.code,
        'redirect_uri': "http://localhost:3000/redirects/DiscordWebhook",
        'scope': 'identify email connections'
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(result => {
            axios.get('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${result.data.access_token}`
                }
            })
                .then(data => {
                    res.json({
                        creds: data.data.username,
                        id: data.data.id
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.json({
                        status: "error"
                    })
                })
        })
        .catch(error => {
            console.log(error)
            res.json({
                status: "error"
            })
        })
})

app.post('/linkPreview', async (req, res) => {
    try {
        var cod = await analyse(req.query.link)
        const { status, data } = await mql(req.query.link, {
            video: true,
            audio: true,
            palette: true,
            iframe: true
        })
            .catch(err => res.json({ err: "send valid url" }))
        try { var thumbnail_url = data.image.url } catch { var thumbnail_url = "https://tricksmaze.org/wp-content/uploads/2019/10/Content-unavailable-in-your-location.png" }
        try { var icon = data.logo.url } catch { var icon = "https://tricksmaze.org/wp-content/uploads/2019/10/Content-unavailable-in-your-location.png" }
        res.json({
            responseObj: {
                title: data.title,
                app: data.publisher,
                thumbnail_url,
                icon,
                color: data.logo.color,
                type: cod.contentType || "cod",
                iframe: cod.name.toLowerCase().includes("twitter") ? data.iframe : null,
                description: data.publisher.toLowerCase().includes('twitter') ? data.iframe.html : null
            }
        })
    }
    catch {
        var cod = { contentType: "cod" }
        const { status, data } = await mql(req.query.link, {
            video: true,
            audio: true,
            palette: true,
            iframe: true
        })
            .catch(err => res.json({ err: "send valid url" }))
        try { var thumbnail_url = data.image.url } catch { var thumbnail_url = "https://tricksmaze.org/wp-content/uploads/2019/10/Content-unavailable-in-your-location.png" }
        try { var icon = data.logo.url } catch { var icon = "https://tricksmaze.org/wp-content/uploads/2019/10/Content-unavailable-in-your-location.png" }
        res.json({
            responseObj: {
                title: data.title,
                app: data.publisher,
                thumbnail_url,
                icon,
                color: data.logo.color,
                type: cod.contentType || "cod",
                description: data.publisher.toLowerCase().includes('twitter') ? data.iframe.html : null
            }
        })
    }
})

const bot = new discord.Client()

bot.on("ready", () => {
    console.log(bot.user.username, "is online")
    bot.user.setActivity("Hello", { type: "STREAMING" })
})

bot.on("presenceUpdate", (oldMember, newMember) => {
    io.sockets.emit('newStatus', { data: newMember.activities, discordID: newMember.userID })
})
bot.login(bot_id)

http.listen(port, () => {
    console.log(`server started on port ${port}`)
})