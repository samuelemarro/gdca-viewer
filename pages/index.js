import React, { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css'
import MainContent from "../components/MainContent"
import cspLogo from "../assets/img/csp-logo.svg"
import Login from "../components/Login"
import { RecoilRoot, useRecoilState } from "recoil"
import { packagesState, trackingState } from "../common/data"

export default function Main() {
    return (
        <RecoilRoot>
            <PageContent />
        </RecoilRoot>
    )
}

function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function PageContent() {
    const [loggedIn, setLoggedIn] = useState(false)
    const [packages, setPackages] = useRecoilState(packagesState)
    const [tracking, setTracking] = useRecoilState(trackingState)

    let text = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."'
    let lines = []
    for (let i = 0; i < 100; i++) {
        lines.push(text)
    }

    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(true)
    
        if (!tracking) {
            setTracking(makeId(4))
        }
    }, [])

    return (
            <div id="monitor">
                <div id="screen">
                    <div id="crt" style={{display: "flex"}}>
                        
                    <img style={{position: "absolute", height: "20ch", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: "40%"}} src={cspLogo.src} />
                        <div className="scanline"></div>
                        <div className="terminal" style={{height: "100%", flex: "1"}}>
                                {/*<div className="header">Benvenuto dott. Livesey. Ultima modifica: 20XX-XX-XX</div>
                                <div className="inner">
                                    <div className="sidebar">
                                        <p className="file selected">File-1.txt</p>
                                        <p className="file">File-2.txt</p>
                                        <p className="file">File-3.txt</p>
                                    </div>
                                    <div className="content">
                                    {
                                        lines.map(t => <p>{t}</p>)
                                    }
                                    </div>
                                </div>
                                <div className="footer">Operatori al momento attivi: 0</div>*/}

                                {
                                    loggedIn || (packages.includes('autologin') && ready) ? <MainContent /> : <Login setLoggedIn={setLoggedIn} />
                                }
                        </div>
                    </div>
                </div>
            </div>
    )
}