import { useState, useEffect, useRef } from 'react'
import React from 'react'

type PromiseOK = () => void

type CardItem = React.ReactNode & {
  id: string
  width: number
  height: number

  isTasking: boolean
  isFinish: boolean
  done?: PromiseOK
  render(sw: number): Promise<void>
  sequence(done: () => Promise<void>): Promise<void>
}

type ScrollerTarget = Element & {
  id: string
  idx: number
  item: CardItem
}

type ScrollerEntry = IntersectionObserverEntry & {
  target: ScrollerTarget
}

type ScrollerManager = {
  deploy: IntersectionObserver
  show: IntersectionObserver
}

type CardProps = {
  manager: ScrollerManager
  id: string
  idx: number
  item: CardItem
}

type ScrollerProps = {
  className: string
  page: string
  rootMargin: string
  onPage(id: string, idx: number): void
  children: (React.ReactNode & CardItem)[]
}

const defaultStateSw: [number, PromiseOK] = [0, () => {}]

function Card({ manager, id, idx, item }: CardProps) {
  const [sw, setSw] = useState<[number, PromiseOK]>(defaultStateSw)
  const divRef = useRef<HTMLDivElement>(({ item } as unknown) as HTMLDivElement)

  useEffect(() => {
    const o: ScrollerTarget = divRef.current as any
    o.item = item
    o.id = id
    o.idx = idx
    item.render = render
    manager.show.observe(o)
    manager.deploy.observe(o)
    return () => {
      manager.show.unobserve(o)
      manager.deploy.unobserve(o)
    }
  }, [item, manager])

  useEffect(() => {
    const o: ScrollerTarget = divRef.current as any
    o.item = item

    sw[1]()
  }, [item, sw])

  return (
    <div className="card" ref={divRef}>
      {1 & sw[0] ? item : null}
    </div>
  )

  async function render(sw: number): Promise<void> {
    return new Promise((ok, ng) => {
      setSw([sw, ok])
    })
  }
}

export function Scroller({ className, page, rootMargin, onPage, children }: ScrollerProps) {
  const manager = useRef<ScrollerManager>({
    show: null as any,
    deploy: null as any,
  })
  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const divEl = divRef.current
    if (divEl) {
      manager.current.deploy = new IntersectionObserver(
        (entries) => {
          ;(entries as ScrollerEntry[]).forEach(({ target: { id, idx, item }, isIntersecting }) => {
            if (isIntersecting) {
              onPage(id, idx)
            } else {
            }
          })
        },
        {
          root: divEl,
          rootMargin: `-50%`,
          threshold: [0],
        }
      )

      manager.current.deploy = new IntersectionObserver(
        (entries) => {
          ;(entries as ScrollerEntry[]).forEach(({ target: { item }, isIntersecting }) => {
            if (isIntersecting) {
              if (!item.isTasking) {
                const done = () => {
                  if (item.isFinish) {
                    return Promise.resolve()
                  } else {
                    return new Promise<void>((ok, ng) => {
                      item.done = ok
                    })
                  }
                }
                item.isTasking = true
                item.isFinish = false
                item.sequence(done).then(() => {
                  item.isTasking = false
                })
              }
            } else {
              if (item.done) {
                item.done()
              } else {
                item.isFinish = true
              }
            }
          })
        },
        {
          root: divEl,
          rootMargin,
          threshold: [0],
        }
      )
    }
    return () => {
      if (manager.current.show) {
        manager.current.show.disconnect()
      }
      if (manager.current.deploy) {
        manager.current.deploy.disconnect()
      }
    }
  }, [rootMargin, onPage])

  return (
    <div className={className} ref={divRef}>
      {children.map((item, idx) => {
        ;<Card key={item.id} id={item.id} idx={idx} manager={manager.current} item={item} />
      })}
    </div>
  )
}
