export default function Finale({tankData, finaleData, setDisplayedTank }) {
    if (!finaleData) {
        return null
    }

    let parsedLosers = []

    let counter = 1

    for (let tankList of finaleData.losers) {
        if (!Array.isArray(tankList)) {
            tankList = [tankList]
        }
        for (let tank of tankList) {
            const parsedTank = {
                ...tankData[tank],
                ...finaleData[tank]
            }
            parsedTank.adjustedDeathPosition = counter
            parsedTank.exAequo = tankList.length > 1
            parsedLosers.push(parsedTank)
        }
        counter += tankList.length
    }

    parsedLosers = parsedLosers.reverse()

    let parsedWinners = finaleData.winners.map(getTankInfo)

    function getTankInfo(id) {
        return {...tankData[id], ...finaleData[id]}
    }

    let parsedFinaleData = {
        winners: finaleData.winners.map(getTankInfo),
        losers: finaleData.losers.map(getTankInfo),
    }

    return <div>
        <p>Gioco terminato!</p>
        <p>Vincitori:</p>
        <div className="winners">
        {parsedWinners.map((winner, index) => (
            <a onClick={() => setDisplayedTank(winner)} key={index}>{winner.name} {winner.surname}</a>
        ))}
        </div>
        <p>Sconfitti:</p>
        <div className="multicol">
        {parsedLosers.map((loser, index) => (
            <a onClick={() => setDisplayedTank(loser)} style={{margin: 0}} key={index}>{loser.name} {loser.surname}</a>
        ))}
        </div>
    </div>
}