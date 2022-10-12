
import { useState } from "react"
import CdS from "./CdS"
import Decrypt from "./Decrypt"
import Document from "./Document"
import Home from "./Home"
import Terminal from "./Terminal"
import aiuto from "../assets/json/aiuto.json"
import { useRecoilState } from "recoil"
import { secretsState } from "../common/data"

export default function MainContent() {
    const [filenames, setFilenames] = useState(['home', 'cds.txt', 'report001.txt', 'report002.txt', 'report003.txt', 'report004.txt', 'report005.txt', 'report006.txt', 'report007.txt', 'aiuto.txt', 'decrypt.sh', 'terminal'])
    const [filenameIndex, setFilenameIndex] = useState(0)
    const [secrets, setSecrets] = useRecoilState(secretsState)

    const [files, setFiles] = useState({
        'decrypt.sh' : <Decrypt />,
        'home' : <Home />,
        'cds.txt' : <CdS />,
        'aiuto.txt' : <Document name="aiuto.txt" {...aiuto}/>,
        'report001.txt' : <Document name="report001.txt" crypted/>,
        'report002.txt' : <Document name="report002.txt" crypted/>,
        'report003.txt' : <Document name="report003.txt" crypted/>,
        'report004.txt' : <Document name="report004.txt" crypted/>,
        'report005.txt' : <Document name="report005.txt" crypted/>,
        'report006.txt' : <Document name="report006.txt" crypted/>,
        'report007.txt' : <Document name="report007.txt" crypted/>,
        'terminal' : <Terminal />,
    })

    if (secrets['annuncio.txt']) {
        filenames.push('annuncio.txt')
        files['annuncio.txt'] = <Document name="annuncio.txt" crypted />
    }


    return (
        <div>
            {/*<img style={{position: "absolute", height: "20ch", margin: "auto", opacity: "40%"}} src={cspLogo.src} />*/}
            <header className="header text-center">
                <p>Utente: doctusk. Ultimo accesso: 20██-██-██</p>
            </header>
            <div className="container-fluid d-flex justify-content-center" style={{height: "100%"}}>
                <div className="row">
                    <div className="col-sm-auto sticky-top">
                        <div id="filesContainer" className="d-flex flex-sm-column flex-row align-items-center sticky-top flex-wrap">
                            {
                                filenames.map((name, index) => (
                                    <a className={"w-auto file p-1 " + (index == filenameIndex ? ' selected' : '')} key={index} onClick={() => setFilenameIndex(index)}>{name}</a>
                                ))
                            }
                        </div>
                    </div>
                    <div className="col-sm p-3 min-vh-100 hide-scrollbar" style={{overflowY: "scroll", height: "200px", width: "60vw", margin: "auto"}}>
                    {
                        files[filenames[filenameIndex]]
                    }
                    </div>
                    <div style={{height: '200px'}} />
                </div>
            </div>
        </div>

    )
}