const express = require("express");
const app = express();
const http = require("http");
const { disconnect, availableMemory } = require("process");
const server = http.createServer(app);
const io = new require("socket.io")(server);
server.listen(8888, () => {console.log("Le serveur écoute sur le port 8888");});
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/public'));

app.get("/", (request, response) => {
    response.sendFile("page.html", {root: __dirname});
});

const API_KEY = "RGAPI-fd80044d-ab6c-44d4-85d7-c1150138b1ec"; // Clé API dans .env
const REGION = 'europe'; 
const nbrMastery = 5

async function getpuuid(pseudo, tag) {
    var lien = 'https://' + REGION + '.api.riotgames.com/riot/account/v1/accounts/by-riot-id/'+pseudo+'/'+tag+'?api_key=' + API_KEY  
    const reponse = await fetch(lien);
    const dico = await reponse.json();
    return (dico.puuid)
}

async function getSummonerID(puuid) {
    var lien = 'https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/' + puuid + '?api_key=' + API_KEY
    const reponse = await fetch(lien);
    const SummonerID = await reponse.json();
    return (SummonerID.id)
}

async function getGlobalStats(summonerID){
    var lien = 'https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ summonerID + '?api_key=' + API_KEY
    const reponse = await fetch(lien);
    const stats = await reponse.json();
    return (stats)
}

async function getMastery(puuid){
    var lien = 'https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/' + puuid + '/top?count='+ nbrMastery +'&api_key=' + API_KEY
    const reponse = await fetch(lien);
    const liste = await reponse.json();
    return liste
}

async function getChampions() {
    var lien = 'https://ddragon.leagueoflegends.com/cdn/14.23.1/data/en_US/champion.json'
    const reponse = await fetch(lien);
    const champions = await reponse.json();
    return (champions)
}

async function getAverageStats(tier, rank, page) {
    var lien = 'https://euw1.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/'+ tier +'/'+ rank +'?page='+ page +'&api_key=' + API_KEY
    const reponse = await fetch(lien);
    const champions = await reponse.json();
    return (champions)
}



io.on("connection", (socket) => {


    socket.on("envoyerNameTag", async (data) => {
        try {

            // Puuid
            const pseudo = data.pseudo;
            const tag = data.tag;

            console.log("Pseudo :", pseudo);
            console.log("Tag :", tag);

            const puuid = await getpuuid(pseudo, tag);
            console.log("PUUID :", puuid);
            socket.emit("recevoirPuuid", puuid)

            const summonerID = await getSummonerID(puuid);
            console.log("SommunerID :", summonerID);
            socket.emit("recevoirSommunerID", summonerID)

            const globalStats = await getGlobalStats(summonerID);
            console.log("Stats Globales :", globalStats);
            socket.emit("recevoirStatsGlobales", globalStats)
            
            const champions = await getChampions();
            socket.emit("recevoirChampions", champions)

            const mastery = await getMastery(puuid);
            console.log("liste Mastery : ", mastery)
            socket.emit("recevoirMastery", mastery)

            
            var rank = globalStats[0].rank
            var tier = globalStats[0].tier
            var listeWinRate = []
            var moyenne = 0.00
            

            var pages = 8
            for (let i = 1 ; i < pages ; i ++){
                const statsJoueurs = await getAverageStats(tier, rank, i);

                Object.values(statsJoueurs).forEach(joueur => {
                    winrate = (joueur.wins/(joueur.wins + joueur.losses))
                    listeWinRate.push(winrate)
                    moyenne = (moyenne + winrate);
                    
                });

                console.log((moyenne/(listeWinRate.length)))

            }
            
            moyenne = (moyenne/(listeWinRate.length))
                
            console.log(moyenne)
            socket.emit("moyennneStats", moyenne)
            
            //socket.emit("recevoirStatsGénérales", mastery)
            

            //const dernierMatch = await getMatchByPuuid(puuid);
            //console.log("dernier Match :", dernierMatch);
            //socket.emit("recevoirDernierMatch", puuid)


            // SummonerID


        } catch (error) {
            console.error("Erreur :", error);
            socket.emit("erreur", "Une erreur est survenue");
        }

    


    });

    
});


