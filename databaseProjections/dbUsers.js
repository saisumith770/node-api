const Roles = {
    admin : 'allPriviledges',
    basic : 'basicPriviledges'
}

const fakeUsers = [
    {
        name : 'sai',
        domain : 'saisumith770',
        desc : "I'm a regular sophomore, part time programmer and anime legend. Most of my content is probably about how I deal with high school situations and how my programming life breaks my head. So there's not much you would find here, but if you are a developer then this would be like heaven, I promise you that.",
        id:00001,
        role : Roles.basic,
        subscriberCount : 12000,
        followingCount : 3,
        uploads : 3,
        tags : ['Programmer','Streamer','Developer'],
        category : "Member of dev@pulse",
        subscription : {
            blocked : ["MoVlogs","Logan Paul"],
            notifiers : ["pwediepie","KSI"],
            following : ["jamiepine","BB ki vines"],
            something : ["duplex","triplex"]
        },
        content : [
            "https://www.twitch.tv/videos/643475114", 
            "https://www.youtube.com/watch?v=hTrXpN4fbpM ",
            "https://www.twitch.tv/videos/453734926", 
            "https://www.youtube.com/watch?v=qtXk4dEFaHw"
        ],
        email : "saisumith812@gmail.com"
    },
    {
        name : 'sai2',
        domain : 'sai2@dev',
        desc : 'nothin',
        id:00002,
        role : Roles.basic,
        subscriberCount : 10000,
        followingCount : 5,
        uploads : 2,
        tags : ['Programmer','Streamer','Developer'],
        category : "Member of dev@pulse",
        subscription : {
            blocked : ["MoVlogs","Logan Paul"],
            notifiers : ["pwediepie","KSI"],
            following : ["jamiepine","BB ki vines"],
            something : ["duplex","triplex"]
        },
        content : [
            'http://www.youtube.com/v=856941',
            'http://www.youtube.com/v=456234'
        ],
        email : "sai_boss_1.199@yahoo.com"
    }
]

module.exports.Roles = Roles
module.exports.fakeUsers = fakeUsers