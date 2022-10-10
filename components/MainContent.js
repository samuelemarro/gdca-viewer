
import { useState } from "react"
import Decrypt from "./Decrypt"
import Document from "./Document"
import Home from "./Home"
import Terminal from "./Terminal"

export default function MainContent() {
    let text = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."'
    let lines = []
    for (let i = 0; i < 100; i++) {
        lines.push(text)
    }
    const [filenames, setFilenames] = useState(['home', 'file1.txt', 'decrypt.sh', 'terminal'])
    const [filenameIndex, setFilenameIndex] = useState(0)

    const [files, setFiles] = useState({
        'decrypt.sh' : <Decrypt />,
        'file1.txt' : <Document name="file1.txt" crypted/>,
        'home' : <Home />,
        'terminal' : <Terminal />
    })


    return (
        <div>
            {/*<img style={{position: "absolute", height: "20ch", margin: "auto", opacity: "40%"}} src={cspLogo.src} />*/}
            <header className="header text-center">
                <p>Utente: doctusk. Ultimo accesso: 20██-██-██</p>
            </header>
            <div className="container-fluid d-flex justify-content-center" style={{height: "100%"}}>
                <div className="row">
                    <div className="col-sm-auto sticky-top">
                        <div className="d-flex flex-sm-column flex-row flex-nowrap align-items-center sticky-top">
                            {
                                filenames.map((name, index) => (
                                    <a className={"unstyled file p-1 " + (index == filenameIndex ? ' selected' : '')} onClick={() => setFilenameIndex(index)}>{name}</a>
                                ))
                            }
                        </div>
                    </div>
                    <div className="col-sm p-3 min-vh-100 hide-scrollbar" style={{overflowY: "scroll", height: "200px", width: "60vw", margin: "auto"}}>
                    {
                        files[filenames[filenameIndex]]
                    }
                    </div>
                </div>
            </div>
            <footer className="footer" style={{height: "100px"}}>
                <div className="container">
                <p>File-1.txt</p>
                <p>File-2.txt</p>

                </div>
            </footer>
        </div>

    )
}