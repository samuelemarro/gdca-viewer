export default function TankInfo({ tank, setTank, tankData }) {

    function formatkilledBy(killedBy) {
        if (!killedBy) {
            return null
        }
        let output = []

        for (let i = 0; i < killedBy.length - 2; i++) {
            const destroyer = tankData[killedBy[i]]
            output.push(<span>{destroyer?.name} {destroyer?.surname}</span>)
            output.push(<span>, </span>)
        }
        if (killedBy.length > 1) {
            const destroyer = tankData[killedBy[killedBy.length - 2]]
            output.push(<span>{destroyer?.name} {destroyer?.surname}</span>)
            output.push(<span> e </span>)
        }
        const destroyer = tankData[killedBy[killedBy.length - 1]]
        output.push(<span>{destroyer?.name} {destroyer?.surname}</span>)

        return output
    }


    return (
        <div style={{ flex: '0 0 auto'}}>
            <p className="prevent-select info" style={{margin: 0, textAlign: "right"}}><a onClick={() => setTank(null)}>{tank ? 'x' : '\u00A0'}</a></p>
            <p className="info">{
                tank?.tank || '\u00A0'
            }</p>
            <p className="info">{
                tank?.name ?
                'Comandante: ' + tank?.name + ' ' + tank?.surname :
                '\u00A0'
            }</p>

            {
                tank?.deathDay ?
                <>
                    {
                        tank?.killedBy == 'urge' ?
                        <p className="info">
                            Distrutto il giorno {tank?.deathDay} a causa dell'Urgio Mascolino
                        </p> :
                        <p className="info">
                            Distrutto il giorno {tank?.deathDay} da{'\u00A0'}
                            {formatkilledBy(tank?.killedBy)}
                        </p>
                    }
                    
                    <p className="info">Distrutto per {tank?.deathPosition}°{tank?.exAequo ? ' (ex aequo)' : ''}</p>
                </> :
                <>
                    <p className="info">
                    {
                        tank?.health ?
                        'HP: ' + tank?.health :
                        '\u00A0'
                    }
                </p>
                <p className="info">
                    {
                        tank?.range ?
                        'Raggio di azione: ' + tank?.range :
                        '\u00A0'
                    }
                </p>
                <p className="info">
                    {
                        tank?.range ?
                        'Raggio di fuoco: ' + (tank?.range - 1) :
                        '\u00A0'
                    }
                </p>
                <p className="info">
                    {
                        tank?.range ?
                        'Urgio: ' + (tank?.urge) :
                        '\u00A0'
                    }
                </p>
                </>
            }
            
        </div>
    )
}