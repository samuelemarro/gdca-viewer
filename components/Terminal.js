import { useRef, useState } from "react"
import { useRecoilState } from "recoil"
import { packagesState } from "../common/data"

const startLines = [
    'CSPOS v2.1',
    'Digitare list per una lista di comandi'
]

const packageDescriptions = {
    'thorus' : 'utility per leggere informazioni aggiuntive nei file',
    'autologin' : 'permette di accedere al database senza re-inserire la password'
}

export default function Terminal() {
    const [lines, setLines] = useState(startLines)
    const [input, setInput] = useState('')
    const [packages, setPackages] = useRecoilState(packagesState)
    const scrolling = useRef()

    const print = (str) => {
        setLines(ll => [...ll, str])
        /*if (lines.length > 10) {
            const newLines = []
            for (let i = lines.length - 1; i >= lines.length - 10; i--) {
                newLines.push(lines[i])
            }
            newLines.reverse()
            setLines(newLines)
        }*/
        // console.log(scrolling)
        // console.log(scrolling.current.scrollTop)
        setTimeout(() => {
            if (scrolling?.current?.scrollTop) {
                scrolling.current.scrollTop = scrolling.current.scrollHeight + 1000
            }
        }, 10)
        
    }

    const write = (e) => {
        e.preventDefault()
        setInput('')

        input = input.toLowerCase().replace('  ', ' ')
        print('> ' + input)


        const args = input.split(' ')

        if (args[0] == 'list') {
            // print('status : stampa lo stato dell\'account')
            // print('access-db : permette di verificare gli accessi eseguiti al database')
            print('cpm : CSP Package Manager, permette di aggiungere funzionalità al database')
            print('delitrack : Traccia la consegna di pacchi CSP')
            print('helpdesk : Fornisce istruzioni per contattare l\'help desk')
            print('list : Fornisce la lista di comandi disponibili')
            print('phrase : Stampa la frase identificativa dell\'utente')
            print('status : Stampa lo stato dell\'account utente')
        } else if (args[0] == 'cpm') {
            try {
                const packageName = args[1]

                if (packageDescriptions[packageName]) {
                    print(packageName + ': ' + packageDescriptions[packageName])
                    setTimeout(() => print('Installazione...'), 1000)
                    setTimeout(() => {
                        if (!packages.includes(packageName)) {
                            setPackages(pp => [...pp, packageName])
                            print('Installato!')
                        } else {
                            print(`Errore: ${packageName} è già installato`)
                        }
                    }, 2000)
                } else {
                    throw new Error()
                }
            } catch {
                print('Errore di sintassi. Utilizzo di CPM:')
                print('cpm [nome del pacchetto]')
                print('Per esempio, "cpm autologin" (senza virgolette) installa il pacchetto autologin.')
            }
        } else if (args[0] == 'phrase') {
            print('Errore: il recupero digitale della frase identificativa è stato disabilitato.')
            print('Si ricorda che la frase identificativa è anche sul retro del badge CSP.')
        } else if (args[0] == 'delitrack') {
            // console.log('ID Pacco:', process.env.NEXT_PUBLIC_DELIVERY_ID)
            try {
                const packageCode = args[1]
                // console.log('Current packageCode:', packageCode)

                if (packageCode === undefined) {
                    throw new Error()
                }

                if (packageCode == process.env.NEXT_PUBLIC_DELIVERY_ID) {
                    print('Stato pacco: CONSEGNATO')
                    print('Indirizzo: Piazza Puntoni 1/B, 40126 Bologna (BO)')
                    print('Alias utilizzato: ' + process.env.NEXT_PUBLIC_DELIVERY_ALIAS)
                    print('Note: Consegnato in portineria. Ritiro non ancora effettuato.')
                } else {
                    print('ID pacco non riconosciuto')
                }
            } catch {
                print('Errore di sintassi. Utilizzo di DELITRACK:')
                print('delitrack [ID del pacco]')
                print('dove l\'ID è un numero univoco a 8 cifre')
                print('Per esempio, "delitrack 12345678" (senza virgolette) traccia il pacco con ID 12345678.')
            }
        } else if (args[0] == 'status') {
            print('Nome utente: doctusk')
            print('Livello autorizzazione: 71')
            print('Sede di riferimento: ███████████')
            print('Divisione: Ricerca')
            print('Stato: M.I.A.')
        } else if (args[0] == 'helpdesk') {
            print('Helpdesk A.I. disattivato per direttiva della Divisione Amministrativa n. ███')
            print('È possibile contattare un operatore umano di livello autorizzazione non inferiore a 15 a un indirizzo email anonimo')
            print('Email per il mese corrente:')
            print('desk458102283@proton.me')
        } else {
            print('Comando non riconosciuto.')
        }
    }

    return (
        <div>
            <div className="hide-scrollbar" ref={scrolling} style={{overflow: 'scroll', height: '80vh'}}>
                {
                    lines.map((l, i) => <p className={l.includes('@') ? 'noUppercase' : ''} key={i}>{l}</p>)
                }
            </div>
            <form onSubmit={write}>
                <div className="d-flex" style={{width: "100%"}}>
                    <input type="text" className="textbox flex-fill" value={input} onChange={e => setInput(e.target.value)} style={{width: '1fr'}}/>
                    <button type="submit">Invio</button>

                </div>
            </form>
        </div>
    )
}