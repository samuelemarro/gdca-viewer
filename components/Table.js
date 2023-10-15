import Cell from "./Cell";
import Marker from "./Marker";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default function Table({ width, height, content, fontSize, setDisplayedTank, scorchedThickness }) {
    function isScorched(x, y) {
        const distance = Math.min(
            x + 1,
            y + 1,
            width - x,
            height - y
        )

        return distance <= scorchedThickness
    }

    return (
        <div style={{flexGrow: 1, flexShrink: 1, flexBasis: 'auto', maxHeight: '50vh'}}>
        <table suppressHydrationWarning style={{flexGrow: 1, flexShrink: 1, flexBasis: 'auto', width:'100%'}}>
            <tr>
                <Marker key={-1} content={'\u00A0'} fontSize={fontSize} />
                {[...Array(width).keys()].map((_, i) => <Marker key={i} content={i + 1} fontSize={fontSize} />)}
            </tr>

            {Array.from({length: height}, (_, i) => (
                <tr suppressHydrationWarning key={i}>
                    <Marker content={alphabet[i]} fontSize={fontSize} />
                    {Array.from({length: width}, (_, j) => (
                        <Cell
                            key={j}
                            content={content && content[i] && content[i][j]}
                            fontSize={fontSize}
                            setDisplayedTank={setDisplayedTank}
                            scorched={isScorched(j, i)}
                        />
                    ))}
                </tr>
            ))}
        </table>
        </div>
    )
}