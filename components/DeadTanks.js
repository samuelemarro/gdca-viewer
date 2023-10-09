export default function DeadTanks({deadList, setDisplayedTank}) {
    const tanks = []
    let tankString = ''

    for (const deadInPosition of deadList) {
        for (let i = 0; i < deadInPosition.length - 1; i++) {
            tanks.push(
                <a onClick={() => setDisplayedTank(deadInPosition[i])}>{deadInPosition[i].id}</a>
            )
            tanks.push(
                <span>/</span>
            )

            tankString += `${deadInPosition[i].id}/`
        }

        tanks.push(
            <a onClick={() => setDisplayedTank(deadInPosition[deadInPosition.length - 1])}>{deadInPosition[deadInPosition.length - 1].id}</a>
        )

        tanks.push(
            <span> </span>
        )

        tankString += `${deadInPosition[deadInPosition.length - 1].id} `
    }

    return <div>
        <p className="info" style={{marginTop: '2vh', marginBottom: '0'}}>
        { tanks.length > 0 ? <>
                <span>Distrutti: </span> {tanks}
            </> : 
            <span>{'\u00A0'}</span>
        }
        </p>
    </div>
}