import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

interface ChatValue {
  id: string
  anker?: string
  to?: string
  head?: string
  label?: string
  deco?: string
  handle?: string
  write_at?: number | Date
  children?: ReactNode
}

function ChatName({ to, head, label }) {
  if (!head) {
    return <></>
  }

  if (to) {
    return (
      <>
        <div className="name center">
          <span className="pull-right">{{ to }}</span>▷
          <span className="pull-left">{{ head }}</span>
        </div>
        <hr />
      </>
    )
  } else {
    return (
      <>
        <div className="name">
          <sup className="pull-right" v-if="label">
            {{ label }}
          </sup>
          {{ head }}
        </div>
      </>
    )
  }
}

export function CReport({
  id,
  anker,
  to,
  head,
  label,
  deco,
  handle,
  write_at,
  children,
}: ChatValue) {
  return (
    <div className="report" key={id}>
      <div className={`chat ${handle}`} id={id}>
        <ChatName {...{ to, head, label }} />
        <div className={`text ${deco || ""}`}>{children}</div>
        <div className="date">
          <a className={`btn active`}>{anker}</a>
        </div>
      </div>
    </div>
  )
}

export function CPost({
  id,
  anker,
  to,
  head,
  label,
  deco,
  handle,
  write_at,
  children,
}: ChatValue) {
  return (
    <div className="post" key={id}>
      <div className={`chat ${handle}`} id={id}>
        <ChatName {...{ to, head, label }} />
        <div className={`text ${deco || ""}`}>{children}</div>
        <div className="date">
          <a className={`btn active`}>{anker}</a>
        </div>
      </div>
    </div>
  )
}
