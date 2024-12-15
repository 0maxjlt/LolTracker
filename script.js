var socket = io();

// Fonction pour envoyer le pseudo et le tag
function envoyerNameTag() {
    const pseudo = document.getElementById("pseudo").value.trim();
    const tag = document.getElementById("tag").value.trim();

    if (!pseudo || !tag) {
        alert("Veuillez entrer un pseudo et un tag !");
        return;
    }

    socket.emit("envoyerNameTag", { pseudo, tag });

    // Réception des données de statistiques
    socket.on("recevoirStatsGlobales", (data) => {
        const statsContainer = document.getElementById("statsGlobales");
        statsContainer.innerHTML = ""; // Réinitialiser l'affichage des statistiques

        // Parcourir les données pour afficher les statistiques
        for (const queue of data) {
            const { queueType, tier, rank, leaguePoints, wins, losses, hotStreak } = queue;
            const totalGames = wins + losses;
            const winRate = ((wins / totalGames) * 100).toFixed(2);

            // Déterminer la couleur de la barre de progression
            const winRateWidth = winRate + "%";
            const winRateColor = winRate >= 50 ? "#4CAF50" : "#f44336"; // Vert si >= 50%, Rouge sinon

            const lienImg = `/public/Ranked_Emblems_Latest/Rank=${tier}.png`;

            // Ajout des statistiques pour chaque file
            statsContainer.innerHTML += `
                <div class="queueStats">
                    <h2>
                        <img src="${lienImg}" alt="${tier}" /> ${pseudo}#${tag} - ${tier} ${rank} - ${queueType}
                    </h2>
                    <ul>
                        <li class="victory">
                            <span class="icon">🏆</span> Victoires : <strong>${wins}</strong>
                        </li>
                        <li class="loss">
                            <span class="icon">💔</span> Défaites : <strong>${losses}</strong>
                        </li>
                        <li>
                            <span class="icon">🎮</span> Total de parties : <strong>${totalGames}</strong>
                        </li>
                        <li class="${winRate >= 50 ? 'victory' : 'loss'}">
                            <span class="icon">📈</span> Taux de victoire : <strong>${winRate}%</strong>
                        </li>
                        <li class="${hotStreak ? 'hotStreak' : ''}">
                            <span class="icon">🔥</span> Série de victoires : ${hotStreak ? "Oui" : "Non"}
                        </li>
                    </ul>
                    <div class="stats-bar">
                        <span style="width: ${winRateWidth}; background-color: ${winRateColor};"></span>
                    </div>
                </div>
            `;
        }

        let champions = null

        socket.on("recevoirChampions", (championsG) => {
            champions = championsG

        })

        socket.on("recevoirMastery", (masteryData) => {
            if (!champions) return;

            const statsContainer = document.getElementById("statsMaitrises");
            statsContainer.innerHTML = "<h2>Top 3 Champions Maîtrisés</h2>";

            masteryData.forEach(mastery => {
                Object.values(champions.data).forEach(champion => {
                    if (champion.key == mastery.championId){
                        const championImageUrl = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champion.id}.png`;

                        statsContainer.innerHTML += `
                        <div class="championMastery">
                            <div class="champion-info">
                                <img src="${championImageUrl}" alt="${champion.name}" class="champion-icon" />
                                <div class="champion-details">
                                    <h3>${champion.name}</h3>
                                    <p>Points de maîtrise: ${mastery.championPoints}</p>
                                    <p>Niveau de maîtrise: ${mastery.championLevel}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    }
                })
            })
        });
    });

}
// Ajouter un événement au bouton d'envoi
document.getElementById("sendButton").addEventListener("click", envoyerNameTag);
