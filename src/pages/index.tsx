import React, { useContext, useEffect, useReducer } from "react"
import { Helmet } from "react-helmet"
import { Link } from "gatsby"
import { pushState, useStore } from "react-petit-hooks/lib/storage"
import { usePoll } from "react-petit-hooks/lib/poll"

import Layout, { Context } from "../components/layout"
import { CReport, CPost } from "../components/chat"
import Image from "../components/image"

interface Plan {
  _id: string
  link: string
  title: string
  write_at: string
  name: string
  state: string
  chip: string
  sign: string
  card: string[]
  upd: {
    description: string
    time: string
    interval: string
    prologue: string
    start: string
  }
  lock: string[]
  flavor: string[]
  options: string[]
  tags: [string, string][]
}

interface Story {
  _id: string
  _type: string
  card: {
    discard: any[]
    event: any[]
    config: string[]
  }
  folder: string
  is_epilogue: boolean
  is_finish: boolean
  name: string
  options: string[]
  rating: string
  sow_auth_id: string
  timer: {
    updateddt: string
    nextupdatedt: string
    nextchargedt: string
    nextcommitdt: string
    scraplimitdt: string
  }
  type: {
    say: string
    vote: string
    roletable: string
    mob: string
    game: string
  }
  upd: {
    interval: number
    hour: number
    minute: number
  }
  vid: number
  vpl: number[]

  is_full_commit: boolean
}

async function PlanApi() {
  const res = await fetch("https://giji-api.duckdns.org/api/plan/progress")
  const { plans } = await res.json()
  return plans
}

async function StoryApi() {
  const res = await fetch("https://giji-api.duckdns.org/api/story/progress")
  const { stories } = await res.json()
  return stories
}

export default IndexPage
function IndexPage({ location: { search, hash }, navigate, path, uri }) {
  pushState({
    a: 1,
    b: 2,
  })

  const [plans] = usePoll<Plan[]>(PlanApi, [], "10m", "1.0.0")
  const [storys] = usePoll<Story[]>(StoryApi, [], "6h", "1.0.0")

  return (
    <Layout>
      <Helmet>
        <title>人狼議事 - index</title>
      </Helmet>

      {storys!?.map((story) => (
        <CPost id={story._id} handle="MOB">
          <p className="name">{story.name}</p>
          <hr />
          <p>
            <Link className="btn item" title="通知を受け取りません。" to="#">
              <i className="mdi mdi-bell-off"></i>
            </Link>
            &nbsp;
            <a href="http://crazy-crazy.sakura.ne.jp/giji_lobby/lobby/sow.cgi">
              {story.folder}-{story.vid}
            </a>
            は、開始が楽しみだ。
          </p>
          <p className="date">
            廃村期限　
            <time>{new Date(story.timer.scraplimitdt).toString()}</time>
          </p>
        </CPost>
      ))}
      {plans!?.map((plan) => (
        <CPost id={plan._id} handle="TSAY">
          <p>
            <a href={plan.link}>{plan.name}</a>
          </p>
          <hr />
          <p>{plan.state}</p>
          <ul className="fine">
            {plan.flavor.map((text) => (
              <li>{text}</li>
            ))}
            {plan.lock.map((text) => (
              <li className="VSSAY">{text}</li>
            ))}
            {plan.card.map((text) => (
              <li className="VSSAY">{text}</li>
            ))}
          </ul>
          <p className="date">
            企画更新　<time>{new Date(plan.write_at).toString()}</time>
          </p>
        </CPost>
      ))}
    </Layout>
  )
}
