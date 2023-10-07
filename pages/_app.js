import '../styles/globals.css'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import '@fortawesome/fontawesome-svg-core/styles.css';

function MyApp({ Component, pageProps }) {
  const [messageWritten, setMessageWritten] = useState(false)

  useEffect(() => {
    if (!messageWritten) {
      setMessageWritten(true)
      console.log('SI RICORDA CHE LA MANIPOLAZIONE DI STRUMENTI MILITARI È UN CRIMINE FEDERALE.')
    }
  }, [])

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <title>RAYTHEON ACS-12</title>
      </Head>
      <div id="monitor">
        <div id="screen">
          <div id="crt" style={{display: "flex"}}>
                        
            <div className="scanline"></div>
              <div className="terminal" style={{height: "100%", flex: "1"}}>
                <Component {...pageProps} />
              </div>
            </div>
          </div>
        </div>
        
    </>
  )
}

export default MyApp
