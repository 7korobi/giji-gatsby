import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Helmet } from "react-helmet"
import { Link } from "gatsby"
import { replaceState, localStore, useStore, Bits } from "react-petit-hooks/lib/storage"

import FB from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import "firebase/functions"
import "firebase/messaging"

import { CReport } from "./chat"

import live from "../config/live.yml"
import folder from "../yaml/sow_folder.yml"

if (typeof window !== "undefined" && window !== null) {
  FB.initializeApp( live.firebase )
}

type IBits<T extends string> = {[P in T]: boolean }

const ShowLabels = ['pin','toc','potof','current','search','magnify','side','link','mention'] as const
const OptionLabels = ['impose','swipe_page','is_used'] as const
type IShowLabels = typeof ShowLabels[number]
type IOptionLabels = typeof OptionLabels[number]
const ShowBits = Bits.assign<IShowLabels>(ShowLabels)
const OptionBits = Bits.assign<IOptionLabels>(OptionLabels)

type IBgLabels = 'BG' | 'BG75' | 'BG50'
type IFontLabels = 'novel' | 'large' | 'press' | 'goth-L' | 'goth-M' | 'goth-S'
type IThemeLabels = 'cinema' | 'pop' | 'snow' | 'star' | 'night' | 'moon' | 'wa'
type IlocalStore = {
  bg: IBgLabels
  font: IFontLabels
  theme: IThemeLabels
  shows: typeof ShowBits
  options: typeof OptionBits
}

localStore({
  bg: 'BG',
  font: 'novel',
  theme: 'cinema',
  welcome: 'finish',
  show: ShowBits.by([]),
  option: OptionBits.by([]),
})

export default Layout

function Btn<T>({ state, as, children }: { state: [T, (val: T)=> void ], as: T, children: ReactNode }) { 
  const mode = state[0] === as ? "active" : ""
  return (
    <a className={`btn ${mode}`} onClick={() => state[1](as)} >
      {children}
    </a>
  )
}

function Sow({ folder_id }) {
  const count = 1
  const name = folder[folder_id].folder
  const max = folder[folder_id].config?.cfg?.MAX_VILLAGES
  if (max) {
    const href = folder[folder_id].config.cfg.URL_SW
    const color = "MOB"
    return (
      <p>
        {max}村:
        <a href={href} className={color}>
          {name}
          <sup>{count}</sup>
        </a>
      </p>
    )
  } else {
    return (
      <p>
        <a>
          {name}
          <sup>{count}</sup>
        </a>
      </p>
    )
  }
}

function Header({ bg, font, theme }) {
  let log = ""
  switch (theme) {
    case "snow":
      log = "snow"
      break
    case "cinema":
    case "wa":
    case "pop":
      log = "day"
      break
    default:
      log = "night"
  }

  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>人狼議事</title>
      <html className={`${bg} ${font} ${log} ${theme}`} />
      <link rel="stylesheet" type="text/css" href="/css/index.use.css" />
      <link rel="stylesheet" type="text/css" href={`/css/log-${log}.use.css`} />
      <link rel="stylesheet" type="text/css" href={`/css/theme-${theme}.use.css`} />
    </Helmet>
  )
}

function Layout({ children }) {
  const useWelcome = useStore("welcome")
  const useBg = useStore<IBgLabels>("bg")
  const useFont = useStore<IFontLabels>("font")
  const useTheme = useStore<IThemeLabels>("theme")
  const [show_bits] = useStore<number>("show.bits")
  const usePin = useStore<boolean>("show.pin")
  const useMention = useStore<Boolean>("show.mention")
  console.warn('show.bits', show_bits)

  const [bg] = useBg
  const [font] = useFont
  const [theme] = useTheme
  const top = 10

  return (
      <div className="page-active-bg">
        <Header {...{ bg, font, theme }}/>
        <div id="welcome" style={{
          backgroundImage: `url(${live.url.assets}/images/bg/fhd-giji.png)`,
          backgroundPosition: `left 50% top ${-top / 3}px`,
        }}>
          <div className="form" id="export">
            <div className="welcome-btns cap">ロビー</div>
            <div className="welcome-btns cap">夢の形</div>
            <div className="welcome-btns cap">陰謀</div>
            <div className="welcome-btns cap">ＲＰ</div>
            <div className="welcome-links form tap">
              <Sow folder_id="LOBBY"></Sow>
              <Sow folder_id="OFFPARTY"></Sow>
            </div>
            <div className="welcome-links form">
              <Sow folder_id="MORPHE"></Sow>
              <Sow folder_id="CABALA">cafe</Sow>
            </div>
            <div className="welcome-links form">
              <Sow folder_id="WOLF"></Sow>
              <Sow folder_id="ULTIMATE"></Sow>
              <Sow folder_id="ALLSTAR"></Sow>
            </div>
            <div className="welcome-links form">
              <Sow folder_id="RP">role-play</Sow>
              <Sow folder_id="PRETENSE">RP-advance</Sow>
              <Sow folder_id="PERJURY"></Sow>
              <Sow folder_id="XEBEC"></Sow>
              <Sow folder_id="CRAZY"></Sow>
              <Sow folder_id="CIEL"></Sow>
            </div>
            <div className="welcome-btns col4">
              <Btn state={useWelcome} as="finish"> 終了した村</Btn>
              <Btn state={useWelcome} as="progress">進行中の村</Btn>
            </div>
            <div className="welcome-btns col4 shoe"><a href="https://giji.f5.si/">総合トップ</a></div>
          </div>
          <h1 className="title-bar">
            <Link to="/">人狼議事</Link>
          </h1>
          <div className="btns form">
            <span>
              <Btn state={useBg} as="BG">１</Btn>
              <Btn state={useBg} as="BG75">¾</Btn>
              <Btn state={useBg} as="BG50">½</Btn>
            </span>
            <span>
              <Btn state={useFont} as="large">大判</Btn>
              <Btn state={useFont} as="novel">明朝</Btn>
              <Btn state={useFont} as="press">新聞</Btn>
            </span>
            <span>
              <Btn state={useFont} as="goth-L">L</Btn>
              <Btn state={useFont} as="goth-M">M</Btn>
              <Btn state={useFont} as="goth-S">S</Btn>
            </span>
            <span>
              <Btn state={useTheme} as="cinema">煉瓦</Btn>
              <Btn state={useTheme} as="pop">   噴出</Btn>
              <Btn state={useTheme} as="snow">  雪景</Btn>
              <Btn state={useTheme} as="star">  蒼穹</Btn>
              <Btn state={useTheme} as="night"> 闇夜</Btn>
              <Btn state={useTheme} as="moon">  月夜</Btn>
              <Btn state={useTheme} as="wa">   和の国</Btn>
            </span>
            <span>
              <Btn state={usePin} as={false}>0</Btn>
              show.pin
              <Btn state={usePin} as={true}>1</Btn>
            </span>
            <span>
              <Btn state={useMention} as={false}>0</Btn>
              show.mention
              <Btn state={useMention} as={true}>1</Btn>
            </span>
          </div>

          <div className="outframe filmline">
            <div className="contentframe"><span className="filmend"></span></div>
          </div>
        </div>
        <div className="page-active">
          <div className="outframe">
            <div className="toastframe">
              <div className="inframe">
                <div className="report">
                  <div className="chat ADMIN">
                    <div className="text fine mono">
                      <p className="r limit1-ng tooltip-left"
                        data-tooltip="不十分な画面幅にあわせ、折返し表示をしています">折返し</p>
                      <p className="r limit1-ok limit2-ng tooltip-left"
                        data-tooltip="補佐情報の幅は最小限です。また、議事録に重なります">上乗せ</p>
                      <p className="r limit2-ok limit3-ng tooltip-left"
                        data-tooltip="補佐情報の幅は最小限です">最小幅</p>
                      <p className="r limit3-ok tooltip-left"
                        data-tooltip="余白に応じて補佐情報を拡げます">卓上幅</p>
                    </div>
                  </div>
                </div>
                <div className="icons form">
                  <p name="toasts"></p>
                </div>
              </div>
            </div>
            <div className="sideframe">
              <div className="inframe">
                <div className="icons form">
                  <p name="icons"></p>
                </div>
              </div>
            </div>
            <div className="summaryframe options" name="list" tag="div" key="summary">
              <p name="summary"></p>
            </div>
            <div className="center-left"></div>
            <div className="center-right"></div>
            <div className="contentframe">
              <div className="inframe">
                <main>{children}</main>
                <CReport handle="footer" write_at={1169852700003}>
                  <article className="r">
                    人狼議事キャラセット by りりんら
                  管理<q className="Btn">sol・la</q>
                    <a className="Btn" href="mailto:7korobi@gmail.com" title="mailto:7korobi@gmail.com">ななころび</a>
                    <div className="copyright">
                      <p>
                        下記の場所以外では、人狼議事内キャラチップ<br />
                        の利用を許諾しておりません。ご了承ください。
                      </p>
                    </div>
                    <div className="copyright">
                      <p>
                        議事総合トップ<br />
                        人狼議事lobby<br />
                        人狼議事morphe<br />
                        人狼議事cafe<br />
                        人狼議事perjury<br />
                        人狼議事xebec<br />
                        人狼議事crazy<br />
                        人狼議事ciel<br />
                        SoyBean<br />
                        Sangria<br />
                        @7korobi<br />
                      </p>
                    </div>
                  </article>
                </CReport>
              </div>
            </div>
            <p name="popup"></p>
          </div>
        </div>
      </div>
  )
}
