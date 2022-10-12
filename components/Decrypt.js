import { useState } from "react"
import { useRecoilState } from "recoil"

import { secretsState, trackingState } from "../common/data"

export default function Decrypt() {
    const [message, setMessage] = useState('')
    const [key, setKey] = useState('')
    const [secrets, setSecrets] = useRecoilState(secretsState)
    const [tracking, setTracking] = useRecoilState(trackingState)

    const decrypt = async (e) => {
        e.preventDefault()

        try {
            setMessage('Connessione al mainframe...')
            const interval = setInterval(() => {
                setMessage(m => {
                    if (m.endsWith('..')) {
                        return m + '.'
                    } else {
                        clearInterval(interval)
                        return m
                    }
                })
            }, 1000)
            // console.log('Key:', key)
            const res = await fetch('/api/decrypt?key=' + key + '&tracking=' + tracking).then(r => r.json());
            if (res.success) {
                if (secrets[res.filename]) {
                    setMessage('File ' + res.filename + ' già decriptato.')
                } else {
                    setSecrets(currentSecrets => ({...currentSecrets, [res.filename]: res}))
                    setMessage('Decriptato il file ' + res.filename)
                }
            } else {
                setMessage('Chiave non riconosciuta.')
            }
        } catch {
            setMessage('Errore di decriptazione.')
        }
    }

    return (
        <div>
            <p>Utility di decriptazione v0.1.2</p>
            <p>Proprietà esclusiva del Centro Studi Paranormali</p>
            <p>L&apos;uso non autorizzato è punibile ai sensi dell&apos;art. ██ dello Statuto del CSP.</p>
            <p>Inserire la chiave di decriptazione:</p>
            <form onSubmit={decrypt}>
                <input type="text" className="textbox" value={key} onChange={e => setKey(e.target.value)} />
                <button type="submit">Avvia</button>
            </form>
            <p>{message}</p>
        </div>
    )
}