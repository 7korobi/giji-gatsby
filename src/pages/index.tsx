import React, { useContext, useEffect, useReducer } from "react"
import { Helmet } from "react-helmet"
import { Link } from "gatsby"

import { replaceUrlStore, useStore } from "../components/storage"
import Layout, { Context } from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

export default IndexPage
function IndexPage({ location: { search, hash }, navigate, path, uri }) {
  replaceUrlStore({
    a: 1,
    b: 2,
  })
  console.warn(useStore('a'), useStore('b'))
  const [list, setList] = useReducer((state, newVal) => newVal, [])
  async function init(){
    if ( new Date().getTime() < list?.timeout ?? 0 ) { return }
    try {
      const res = await fetch('https://giji-api.duckdns.org/api/plan/progress')
      const { plans } = await res.json()
      plans.timeout = new Date().getTime() + 10000
      setList( plans )
    } catch (e) {
      setList([])
    }
  }
  useEffect(()=>{
    const p = init()
    return () => {
      console.warn( p, list )
    }
  })

  return (<Layout>
    <Helmet>
      <title>人狼議事 - index</title>
    </Helmet>

    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
  )
}
