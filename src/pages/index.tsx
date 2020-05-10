import React, { useContext, useEffect, useReducer } from "react"
import { Link } from "gatsby"

import Layout, { Context } from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

export default IndexPage
function IndexPage() {
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
