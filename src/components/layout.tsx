import React, { createContext, useContext, ReactNode, useState } from 'react'
import { Helmet } from 'react-helmet'

import { BrowserProvider } from 'react-petit-hooks/lib/browser'
import { useLocalStorage } from 'react-petit-hooks/lib/storage'
import { Bits } from 'react-petit-hooks/lib/bits'
import { __BROWSER__ } from 'react-petit-hooks/lib/device'

import { Link } from 'gatsby'

import FB from 'firebase/app'

import { CReport } from './chat'

const live = require('../config/live.yml')
const folder = require('../yaml/sow_folder.yml')

if (__BROWSER__) {
  require('firebase/auth')
  require('firebase/firestore')
  require('firebase/functions')
  require('firebase/messaging')
  FB.initializeApp(live.firebase)
}

type BtnProps<T> = {
  state: [T, (val: T) => void]
  as: T
  children: ReactNode
}

type SowProps = {
  folder_id: string
  children?: React.ReactNode[] | string
}

type HeaderProps = {
  bg: typeof cssInit['bg']
  font: typeof cssInit['font']
  theme: typeof cssInit['theme']
}

type RootLayoutProps = {
  ssr: boolean
  children: React.ReactNode
}

type LayoutProps = {
  children: React.ReactNode[]
}

type SetterContextProp = {
  setShows(shows: typeof uiInit['shows']): void
  setOptions(options: typeof uiInit['options']): void
  setBg(bg: typeof cssInit['bg']): void
  setFont(font: typeof cssInit['font']): void
  setTheme(theme: typeof cssInit['theme']): void
}

const ShowBits = new Bits([
  'pin',
  'toc',
  'potof',
  'current',
  'search',
  'magnify',
  'side',
  'link',
  'mention',
] as const)
const OptionBits = new Bits(['impose', 'swipe_page', 'is_used'] as const)
const headInit = {
  welcome: 'finish' as 'finish' | 'progress',
}
const uiInit = {
  shows: ShowBits.data(0),
  options: OptionBits.data(0),
}
const cssInit = {
  bg: 'BG' as 'BG' | 'BG75' | 'BG50',
  font: 'novel' as 'novel' | 'large' | 'press' | 'goth-L' | 'goth-M' | 'goth-S',
  theme: 'cinema' as 'cinema' | 'pop' | 'snow' | 'star' | 'night' | 'moon' | 'wa',
}

const UiContext = createContext(uiInit)
const CssContext = createContext(cssInit)
const SetterContext = createContext({} as SetterContextProp)

export function RootLayout({ ssr, children }: RootLayoutProps) {
  const [shows, setShows] = useLocalStorage('shows', uiInit.shows)
  const [options, setOptions] = useLocalStorage('shows', uiInit.options)
  const [bg, setBg] = useLocalStorage('bg', cssInit.bg)
  const [font, setFont] = useLocalStorage('font', cssInit.font)
  const [theme, setTheme] = useLocalStorage('theme', cssInit.theme)

  console.log(shows, options, bg, font, theme)

  return (
    <BrowserProvider ratio={0.5}>
      <SetterContext.Provider value={{ setShows, setOptions, setBg, setFont, setTheme }}>
        <UiContext.Provider value={{ shows, options }}>
          <CssContext.Provider value={{ bg, font, theme }}>{children}</CssContext.Provider>
        </UiContext.Provider>
      </SetterContext.Provider>
    </BrowserProvider>
  )
}

export function Layout({ children }: LayoutProps) {
  const [welcome, setWelcome] = useState(headInit.welcome)
  const ui = useContext(UiContext)
  const css = useContext(CssContext)
  const { setShows, setBg, setFont, setTheme } = useContext(SetterContext)

  function setPin(is: boolean) {
    ui.shows.is.pin = is as any
    setShows(ShowBits.data(ui.shows.value))
  }
  function setMention(is: boolean) {
    ui.shows.is.mention = is as any
    setShows(ShowBits.data(ui.shows.value))
  }

  const top = 10

  return (
    <div className="page-active-bg">
      <Header {...css} />
      <div
        id="welcome"
        style={{
          backgroundImage: `url(${live.url.assets}/images/bg/fhd-giji.png)`,
          backgroundPosition: `left 50% top ${-top / 3}px`,
        }}
      >
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
            <Btn state={[welcome, setWelcome]} as="finish">
              {' '}
              終了した村
            </Btn>
            <Btn state={[welcome, setWelcome]} as="progress">
              進行中の村
            </Btn>
          </div>
          <div className="welcome-btns col4 shoe">
            <a href="https://giji.f5.si/">総合トップ</a>
          </div>
        </div>
        <h1 className="title-bar">
          <Link to="/">人狼議事</Link>
        </h1>
        <div className="btns form">
          <span>
            <Btn state={[css.bg, setBg]} as="BG">
              １
            </Btn>
            <Btn state={[css.bg, setBg]} as="BG75">
              ¾
            </Btn>
            <Btn state={[css.bg, setBg]} as="BG50">
              ½
            </Btn>
          </span>
          <span>
            <Btn state={[css.font, setFont]} as="large">
              大判
            </Btn>
            <Btn state={[css.font, setFont]} as="novel">
              明朝
            </Btn>
            <Btn state={[css.font, setFont]} as="press">
              新聞
            </Btn>
          </span>
          <span>
            <Btn state={[css.font, setFont]} as="goth-L">
              L
            </Btn>
            <Btn state={[css.font, setFont]} as="goth-M">
              M
            </Btn>
            <Btn state={[css.font, setFont]} as="goth-S">
              S
            </Btn>
          </span>
          <span>
            <Btn state={[css.theme, setTheme]} as="cinema">
              煉瓦
            </Btn>
            <Btn state={[css.theme, setTheme]} as="pop">
              噴出
            </Btn>
            <Btn state={[css.theme, setTheme]} as="snow">
              雪景
            </Btn>
            <Btn state={[css.theme, setTheme]} as="star">
              蒼穹
            </Btn>
            <Btn state={[css.theme, setTheme]} as="night">
              闇夜
            </Btn>
            <Btn state={[css.theme, setTheme]} as="moon">
              月夜
            </Btn>
            <Btn state={[css.theme, setTheme]} as="wa">
              和の国
            </Btn>
          </span>
          <span>
            <Btn state={[!!ui.shows.is.pin, setPin]} as={false}>
              0
            </Btn>
            show.pin
            <Btn state={[!!ui.shows.is.pin, setPin]} as={true}>
              1
            </Btn>
          </span>
          <span>
            <Btn state={[!!ui.shows.is.mention, setMention]} as={false}>
              0
            </Btn>
            show.mention
            <Btn state={[!!ui.shows.is.mention, setMention]} as={true}>
              1
            </Btn>
          </span>
        </div>

        <div className="outframe filmline">
          <div className="contentframe">
            <span className="filmend"></span>
          </div>
        </div>
      </div>
      <div className="page-active">
        <div className="outframe">
          <div className="toastframe">
            <div className="inframe">
              <div className="report">
                <div className="chat ADMIN">
                  <div className="text fine mono">
                    <p
                      className="r limit1-ng tooltip-left"
                      data-tooltip="不十分な画面幅にあわせ、折返し表示をしています"
                    >
                      折返し
                    </p>
                    <p
                      className="r limit1-ok limit2-ng tooltip-left"
                      data-tooltip="補佐情報の幅は最小限です。また、議事録に重なります"
                    >
                      上乗せ
                    </p>
                    <p
                      className="r limit2-ok limit3-ng tooltip-left"
                      data-tooltip="補佐情報の幅は最小限です"
                    >
                      最小幅
                    </p>
                    <p
                      className="r limit3-ok tooltip-left"
                      data-tooltip="余白に応じて補佐情報を拡げます"
                    >
                      卓上幅
                    </p>
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
              {children}
              <CReport handle="footer" write_at={1169852700003}>
                <article className="r">
                  人狼議事キャラセット by りりんら 管理
                  <q className="Btn">sol・la</q>
                  <a
                    className="Btn"
                    href="mailto:7korobi@gmail.com"
                    title="mailto:7korobi@gmail.com"
                  >
                    ななころび
                  </a>
                  <div className="copyright">
                    <p>
                      下記の場所以外では、人狼議事内キャラチップ
                      <br />
                      の利用を許諾しておりません。ご了承ください。
                    </p>
                  </div>
                  <div className="copyright">
                    <p>
                      議事総合トップ
                      <br />
                      人狼議事lobby
                      <br />
                      人狼議事morphe
                      <br />
                      人狼議事cafe
                      <br />
                      人狼議事perjury
                      <br />
                      人狼議事xebec
                      <br />
                      人狼議事crazy
                      <br />
                      人狼議事ciel
                      <br />
                      SoyBean
                      <br />
                      Sangria
                      <br />
                      @7korobi
                      <br />
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

function Btn<T>({ state, as, children }: BtnProps<T>) {
  const mode = state[0] === as ? 'active' : ''
  return (
    <a className={`btn ${mode}`} onClick={onClick}>
      {children}
    </a>
  )

  function onClick() {
    state[1](as)
  }
}

function Sow({ folder_id, children }: SowProps) {
  const count = 1
  const name = folder[folder_id].folder
  const max = folder[folder_id].config?.cfg?.MAX_VILLAGES
  if (max) {
    const href = folder[folder_id].config.cfg.URL_SW
    const color = 'MOB'
    return (
      <p>
        {max}村:
        <a href={href} className={color}>
          {children || name}
          <sup>{count}</sup>
        </a>
      </p>
    )
  } else {
    return (
      <p>
        <a>
          {children || name}
          <sup>{count}</sup>
        </a>
      </p>
    )
  }
}

function Header({ bg, font, theme }: HeaderProps) {
  let log = ''
  switch (theme) {
    case 'snow':
      log = 'snow'
      break
    case 'cinema':
    case 'wa':
    case 'pop':
      log = 'day'
      break
    default:
      log = 'night'
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
