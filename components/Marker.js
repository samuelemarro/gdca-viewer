export default function Marker({content, fontSize}) {
    return (
        <td style={{border: 0, textAlign: 'center', fontSize, padding: '0'}}>
            <p style={{margin: '0.4vh'}}>{content}</p>
        </td>
    )
}