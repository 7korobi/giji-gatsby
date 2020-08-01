import React from "react"
import { Helmet } from "react-helmet"
import { Link } from "gatsby"
import { pushState } from "react-petit-hooks/lib/storage"
import { usePoll } from "react-petit-hooks/lib/poll"

import Layout from "../components/layout"
import { CPost } from "../components/chat"
import { PlanApi, StoryApi } from "../lib/fetch"

export default IndexPage
function IndexPage({}) {
  pushState({
    a: 1,
    b: 2,
  })

  const [plans] = usePoll(PlanApi, [], "10m", "1.0.0")
  const [storys] = usePoll(StoryApi, [], "6h", "1.0.0")

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
