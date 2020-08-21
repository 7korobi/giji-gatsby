import React, { useState } from 'react'
import { usePoll } from 'react-petit-hooks/lib/poll'
import { Helmet } from 'react-helmet'
import { Link } from 'gatsby'
import { Query, State } from 'memory-orm'

import { Layout } from '../components/layout'
import { CPost } from '../components/chat'
import { PlanApi, StoryApi } from '../lib/fetch'


const CSIDS = ["ririnra", "ririnra_c05", "ririnra_c08", "ririnra_c19", "ririnra_c67", "ririnra_c68", "ririnra_c72", "ririnra_c51", "ririnra_c20", "ririnra_c32", "all", "mad", "mad_mad05", "time", "ger", "animal", "school", "changed", "changed_m05", "SF", "SF_sf10", "wa", "wa_w23"] as const
const GAMES = ["TABULA", "LIVE_TABULA", "MILLERHOLLOW", "LIVE_MILLERHOLLOW", "TROUBLE", "MISTERY", "SECRET"] as const
const SAYCNTS = ["lobby"] as const
const TRSIDS = ["sow", "all", "star", "regend", "heavy", "complexx", "tabula", "millerhollow", "ultimate"] as const
const VOTETYPES = ["anonymity","sign"] as const

type BOOLS = 0 | 1

declare module 'memory-orm' {

  interface META {
    depth: number
    write_at: number
    pack: {
      [key: string]: {
        $format: any
        $memory: {
          [key: string]: {
            $group: any
            item: any
            meta: META
          }
        }
        $sort: any
      }
    }
  }
  class Model {
    _id: string
    id: string
  }

  class FolderModel extends Model {
    disabled: boolean
    epi_url: string
    folder: string
    hostname: string
    href: string
    info_url: string
    livelog: string
    max_vils: number
    nation: string
    oldlog: string
    rule: string
    server: string
    title: string
    vid_code: string
    _id: string
    id: string
    route: {
      path: string
      name: string
    }
    story: {
      evil: string
      role_play: boolean
    }
    config: {
      saycnt: (typeof SAYCNTS[number])[]
      trsid: (typeof TRSIDS[number])[]
      csid: (typeof CSIDS[number])[]
      game: (typeof GAMES[number])[]
      pl: string
      erb: string
      cd_default: string
      is_angular: string
      cfg: {
        BASEDIR_CGI: "."
        BASEDIR_CGIERR: "http://crazy-crazy.sakura.ne.jp//giji_lobby/lobby"
        BASEDIR_DAT: "./data"
        BASEDIR_DOC: "http://giji-assets.s3-website-ap-northeast-1.amazonaws.com"
        ENABLED_VMAKE: 0
        MAX_LOG: 750
        MAX_VILLAGES: 10
        NAME_HOME: "人狼議事 ロビー"
        RULE: "LOBBY"
        TIMEOUT_ENTRY: 3
        TIMEOUT_SCRAP: 365
        TOPPAGE_INFO: "./_info.pl"
        TYPE: "BRAID"
        URL_SW: "http://crazy-crazy.sakura.ne.jp/giji_lobby/lobby"
        USERID_ADMIN: "master"
        USERID_NPC: "master"        
      }
      enable: {
        DEFAULT_VOTETYPE: [typeof VOTETYPES[number], "標準の投票方法(sign: 記名、anonymity:無記名)"]
        ENABLED_AIMING: [BOOLS, "1:対象を指定した発言（内緒話）を含める"]
        ENABLED_AMBIDEXTER: [BOOLS, "1:狂人の裏切りを認める（狂人は、人狼陣営ではなく裏切りの陣営＝村が負ければよい）"]
        ENABLED_BITTY: [BOOLS, "少女や交霊者ののぞきみがひらがなのみ。"]
        ENABLED_DELETED: [BOOLS, "削除発言を表示するかどうか"]
        ENABLED_MAX_ESAY: [BOOLS, "エピローグを発言制限対象に 0:しない、1:する"]
        ENABLED_MOB_AIMING: [BOOLS, "1:見物人が内緒話を使える。"]
        ENABLED_PERMIT_DEAD: [BOOLS, "墓下の人狼/共鳴者/コウモリ人間が囁きを見られるかどうか"]
        ENABLED_RANDOMTARGET: [BOOLS, "1:投票・能力先に「ランダム」を含める"]
        ENABLED_SEQ_EVENT: [BOOLS, "0:ランダムイベント 1:順序通りのイベント"]
        ENABLED_SUDDENDEATH: [BOOLS, "1:突然死あり"]
        ENABLED_SUICIDE_VOTE: [BOOLS, "1:自殺投票"]
        ENABLED_UNDEAD: [BOOLS, "1:幽界トーク村を設定可能"]
        ENABLED_WINNER_LABEL: [BOOLS, "1:勝利者表示をする。"]        
      }
      maxsize: {
        MAXSIZE_ACTION: number
        MAXSIZE_MEMOCNT: number
        MAXSIZE_MEMOLINE: number
      }
      path: {
        DIR_LIB: "./lib"
        DIR_HTML: "./html"
        DIR_RS: "./rs"
        DIR_VIL: "./data/vil"
        DIR_USER: "../data/user"
      }
    }
  }

  class SowTurnModel extends Model {

  }
  class SowVillageModel extends Model {
    folder: FolderModel
    folder_id: string
    name: string
    vid: number
    timer: {
      scraplimitdt: string
    }
  }
  class SowVillagePlanModel extends Model {
    link: string
    name: string
    state: string
    flavor: string[]
    lock: string[]
    card: string[]
    write_at: string
  }

  class State {
    static transaction(cb :()=> void, meta?: META ): META
    static store(meta: META): void
  }
  class Query<T> {
    static sow_village_plans: Query<SowVillagePlanModel>
    static sow_villages: Query<SowVillageModel> & {
      prologue: Query<SowVillageModel>
      progress: Query<SowVillageModel>
    }

    list: T[]
  }

  class Set<T> {
    static sow_village_plan: Set<SowVillagePlanModel>
    static sow_village: Set<SowVillageModel>
    static sow_turn: Set<SowTurnModel>
    reset(list: any[]): void
    merge(list: any[]): void
    reject(list: any[]): void
  }
}
function store(meta: any) {
  State.store(meta)
}

export default IndexPage
function IndexPage({}) {
  const [idx, setIdx] = useState('')

  usePoll(PlanApi, store, [], '10m', '1.0.0')
  usePoll(StoryApi, store, [], '6h', '1.0.0')

  return (
    <Layout>
      <Helmet>
        <title>人狼議事 - index</title>
      </Helmet>

      {Query.sow_villages.list.map((story) => (
        <CPost key={story._id} id={story._id} handle="MOB">
          <p className="name">{story.name}</p>
          <hr />
          <p>
            <Link className="btn item" title="通知を受け取りません。" to="#">
              <i className="mdi mdi-bell-off"></i>
            </Link>
            &nbsp;
            <a href="http://crazy-crazy.sakura.ne.jp/giji_lobby/lobby/sow.cgi">
              {story.folder._id}-{story.vid}
            </a>
            は、開始が楽しみだ。
          </p>
          <p className="date">
            廃村期限　
            <time>{new Date(story.timer.scraplimitdt).toString()}</time>
          </p>
        </CPost>
      ))}
      { Query.sow_village_plans.list.map((plan) => (
        <CPost key={plan._id} id={plan._id} handle="TSAY">
          <p>
            <a href={plan.link}>{plan.name}</a>
          </p>
          <hr />
          <p>{plan.state}</p>
          <ul className="fine">
            {plan.flavor.map((text) => (
              <li key={text}>{text}</li>
            ))}
            {plan.lock.map((text) => (
              <li key={text} className="VSSAY">{text}</li>
            ))}
            {plan.card.map((text) => (
              <li key={text} className="VSSAY">{text}</li>
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
