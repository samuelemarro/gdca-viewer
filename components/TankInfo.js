export default function TankInfo({ tank, setTank }) {
    return (
        <div style={{ flex: '0 0 auto'}}>
            <p className="prevent-select" style={{textAlign: "right"}}><a onClick={() => setTank(null)}>{tank ? 'x' : '\u00A0'}</a></p>
            <p className="info">{
                tank?.tank || '\u00A0'
            }</p>
            <p className="info">{
                tank?.name ?
                'Comandante: ' + tank?.name + ' ' + tank?.surname :
                '\u00A0'
            }</p>
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
        </div>
    )
}