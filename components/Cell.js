export default function Cell({ content, fontSize, setDisplayedTank, scorched }) {
    //const firstLetterOfName = content?.name?.[0] || '.'
    //const firstLetterOfSurname = content?.surname?.[0] || '.'
    return (
        <td style={{textAlign: 'center', verticalAlign: 'center', padding: '0'}} suppressHydrationWarning>
            <p style={{fontSize, margin: '0.4vh'}}>

            
            {content?.id ? 
            
            <a  onClick={() => setDisplayedTank(content)}>{content?.id}</a>
            : (scorched ? '.' : '\u00A0')
            }
            </p>
        </td>
    )
}