import React, { useEffect, useState } from "react"
import { RecoilRoot } from "recoil"
import dynamic from 'next/dynamic'
import { useRouter } from "next/router"
import TankInfo from "../components/TankInfo"

import tankData from '../assets/json/tankData.json'
import config from '../assets/json/config.json'

const Table = dynamic(() => import('../components/Table'), { ssr: false })

export default function Main() {
    return (
        <RecoilRoot>
            <PageContent />
        </RecoilRoot>
    )
}

function PageContent() {
    const router = useRouter()
    let { day } = router.query
    day = day ? parseInt(day) : config.lastDay

    const [displayedTank, setDisplayedTank] = useState({})

    const [error, setError] = useState('')

    const [dayInfo, setDayInfo] = useState({})

    useEffect(() => {
        setError('')
        fetch(`/dayInfo/${day}.json`)
        .then(res => res.json())
        .catch(() => setError('Errore nel caricamento dei dati.'))
        .then(data => {
            setDayInfo(data)
        })
        
    }, [day])

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'

    function parseContent(content) {
        const parsedContent = {}
        for (const id of Object.keys(content)) {
            const rawPosition = content[id]?.position || content[id].pos
            const row = alphabet.indexOf(rawPosition[0].toLowerCase())
            const column = parseInt(rawPosition.slice(1)) - 1

            parsedContent[row] = parsedContent[row] || {}
            parsedContent[row][column] = tankData[id] || {}
            parsedContent[row][column].id = id
            parsedContent[row][column].health = content[id].health
            parsedContent[row][column].range = content[id].range
            parsedContent[row][column].urge = content[id].urge
        }

        return parsedContent
    }

    // The day display must be on the right

    const width = 17
    const height = 13

    const canGoLeft = day > 1
    const canGoRight = day < config?.lastDay

    return (
        <div style={{margin: 'auto', maxWidth: '78vh'}}>
        <div suppressHydrationWarning style={{display: 'flex', flexDirection: 'column', padding: '1em'}}>
            
            <p className="info centerText">Raytheon ACS-12 Sistema di Tracciamento Militare</p>
            <p className="info centerText">
                {canGoLeft ? <a onClick={() => router.push('?day=1')}>{'<<'}</a> : <span>{'\u00A0\u00A0'}</span>}
                <span>{' '}</span>
                {canGoLeft ? <a onClick={() => router.push('?day=' + (day - 1))}>{'<'}</a> : <span>{'\u00A0\u00A0'}</span>}
                <span>{' '}</span>
                Giorno {(day < 10 ? '\u00A0' : '') + day}
                <span>{' '}</span>
                {canGoRight ? <a onClick={() => router.push('?day=' + (day + 1))}>{'>'}</a> : <span>{'\u00A0\u00A0'}</span>}
                <span>{' '}</span>
                {canGoRight ? <a onClick={() => router.push('?day=' + config?.lastDay)}>{'>>'}</a> : <span>{'\u00A0\u00A0'}</span>}
            </p>
            {error ? <p>{error}</p> :
                <>
                    <p className="info centerText">Selezionare un carro armato per visualizzare più informazioni</p>
                    <Table suppressHydrationWarning
                        width={width}
                        height={height} 
                        content={dayInfo && parseContent(dayInfo)}
                        setDisplayedTank={setDisplayedTank}

                        fontSize={`max(${(15 / (height+1))}vh, ${(20 / (width+1))}vw)`}
                    />
                    <TankInfo tank={displayedTank} setTank={setDisplayedTank} />
                </>
            }
            
        </div>
        </div>   
    )
}