import React, { useEffect, useState } from "react"
import { RecoilRoot } from "recoil"
import dynamic from 'next/dynamic'
import { useRouter } from "next/router"
import TankInfo from "../components/TankInfo"

import tankData from '../assets/json/tankData.json'
import config from '../assets/json/config.json'
import DeadTanks from "../components/DeadTanks"
import Finale from "../components/Finale"

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

    const [displayedTank, setDisplayedTank] = useState(null)

    const [error, setError] = useState('')

    const [dayInfo, setDayInfo] = useState(null)

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
            if (content[id]?.deathPosition) {
                continue;
            }

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

    function parseDead(content) {
        const deadDict = {}

        for (let id of Object.keys(content)) {
            if (!content[id]?.deathPosition) {
                continue;
            }

            const deathPosition = parseInt(content[id]?.deathPosition)
            console.log('Death:', deathPosition)

            if (!deadDict[deathPosition]) {
                deadDict[deathPosition] = []
            }

            const tank = {
                id,
                deathPosition,
                deathDay : content[id]?.deathDay,
                killedBy : content[id]?.killedBy,
                ...tankData[id]
            }

            deadDict[deathPosition].push(tank)
        }


        const deadList = []

        for (const position of Object.keys(deadDict).sort((a, b) => parseInt(a) - parseInt(b))) {
            const deadInThatPosition = deadDict[position]

            deadInThatPosition.sort((a, b) => a.id - b.id)

            for (const tank of deadInThatPosition) {
                tank.exAequo = deadInThatPosition.length > 1
            }

            deadList.push(deadInThatPosition)
        }

        let positionCounter = 1

        for (const deadInThatPosition of deadList) {
            for (const tank of deadInThatPosition) {
                tank.adjustedDeathPosition = positionCounter
            }
            positionCounter += deadInThatPosition.length
        }
    
        return deadList;
    }

    function currentScorchedThickness() {
        let thickness = 0;
        for (const thicknessData of config.scorched) {
            if (day >= thicknessData.day && thickness < thicknessData.thickness) {
                thickness = thicknessData.thickness;
            }
        }

        return thickness;
    }

    function goToDay(day) {
        router.push('?day=' + day)
        setDisplayedTank(null)
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
                {canGoLeft ? <a onClick={() => goToDay(1)}>{'<<'}</a> : <span>{'\u00A0\u00A0'}</span>}
                <span>{' '}</span>
                {canGoLeft ? <a onClick={() => goToDay(day - 1)}>{'<'}</a> : <span>{'\u00A0\u00A0'}</span>}
                <span>{' '}</span>
                Giorno {(day < 10 ? '\u00A0' : '') + day}
                <span>{' '}</span>
                {canGoRight ? <a onClick={() => goToDay(day + 1)}>{'>'}</a> : <span>{'\u00A0\u00A0'}</span>}
                <span>{' '}</span>
                {canGoRight ? <a onClick={() => goToDay(config?.lastDay)}>{'>>'}</a> : <span>{'\u00A0\u00A0'}</span>}
            </p>
            {error ? <p>{error}</p> :
                dayInfo && <>
                    {
                        dayInfo?.winners ?
                        <Finale tankData={tankData} finaleData={dayInfo} setDisplayedTank={setDisplayedTank} /> 
                        : <>
                            <p className="info centerText">Selezionare un carro armato per più informazioni</p>
                            <Table suppressHydrationWarning
                                width={width}
                                height={height} 
                                content={dayInfo && parseContent(dayInfo)}
                                setDisplayedTank={setDisplayedTank}
                                scorchedThickness={currentScorchedThickness()}

                                fontSize={`max(${(15 / (height+1))}vh, ${(20 / (width+1))}vw)`}
                            />
                            <DeadTanks deadList={parseDead(dayInfo)} setDisplayedTank={setDisplayedTank} />
                        </>
                        
                    }
                    
                    <TankInfo tank={displayedTank} setTank={setDisplayedTank} tankData={tankData} />
                </>
            }
            
        </div>
        </div>   
    )
}