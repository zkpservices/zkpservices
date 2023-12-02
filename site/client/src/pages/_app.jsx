import Head from 'next/head'
import Script from 'next/script' // Import the Script component
import { Router, useRouter } from 'next/router'
import { MDXProvider } from '@mdx-js/react'
import { GlobalProvider } from '@/components/GlobalStorage'
import { Layout } from '@/components/Layout'
import * as mdxComponents from '@/components/mdx'
import { useMobileNavigationStore } from '@/components/MobileNavigation'
import { Analytics } from '@vercel/analytics/react';

import '@/styles/tailwind.css'
import 'focus-visible'

function onRouteChange() {
  useMobileNavigationStore.getState().close()
}

Router.events.on('hashChangeStart', onRouteChange)
Router.events.on('routeChangeComplete', onRouteChange)
Router.events.on('routeChangeError', onRouteChange)

export default function App({ Component, pageProps }) {
  let router = useRouter()

  return (
    <>
      <Head>
        <title>zkp.services</title>
        <meta name="description" content={pageProps.description} />
      </Head>
      <Script src="/snarkjs.min.js" strategy="beforeInteractive" />
      <Script src="/poseidon/wasm_exec.js" strategy="beforeInteractive" />
      <GlobalProvider>
        <MDXProvider components={mdxComponents}>
          <Layout {...pageProps}>
            <Component {...pageProps} />
            <Analytics />
          </Layout>
        </MDXProvider>
      </GlobalProvider>
    </>
  )
}
