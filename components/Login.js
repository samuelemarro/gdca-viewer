import { useState } from "react"
import { useRecoilState } from "recoil"
import { trackingState } from "../common/data"

export default function Login({setLoggedIn}) {
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [tracking, setTracking] = useRecoilState(trackingState)

    const checkPassword = async (e) => {
        e.preventDefault()
        // console.log(password)

        try {
            const response = await fetch('/api/basicLogin?password=' + password + '&tracking=' + tracking)
            const res = await response.json()

            if (res === true) {
                setMessage('Connessione al Mainframe...')
                setTimeout(() => setLoggedIn(true), 2000)
                // setLoggedIn(true)
            } else {
                setMessage('Password errata.')
            }
        } catch {

        }
    }
    return (
        <form onSubmit={checkPassword} style={{position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}>
            <p>Buongiorno collegiale! Ha già configurato il suo carro armato?</p>
            <button>Sì</button>
            <button>No</button>
            <p>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="textbox" /></p>
            <button type="submit">Login</button>
            <p>{message}</p>
        </form>
    )
}