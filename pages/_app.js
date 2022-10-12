import '../styles/globals.css'
import Head from 'next/head'
import { useEffect, useState } from 'react'

function MyApp({ Component, pageProps }) {
  const [messageWritten, setMessageWritten] = useState(false)

  useEffect(() => {
    if (!messageWritten) {
      console.log('SI RICORDA CHE LA MANIPOLAZIONE NON AUTORIZZATA DEL DATABASE CSP È SOGGETTA ALL\'ART. ███ DEL CODICE DEL CSP.')
      setMessageWritten(true)
    }
  }, [])

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
