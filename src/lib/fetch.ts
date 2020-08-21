import { Query, Set, State } from 'memory-orm'
import '../models/index.coffee'

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

interface Event {
  
}

export async function PlanApi() {
  const res = await fetch('https://giji-api.duckdns.org/api/plan/progress')
  const { plans }: { plans: Plan[] } = await res.json()
  return State.transaction(()=>{
    Set.sow_village_plan.reset(plans)
  })
}

export async function StoryApi() {
  const res = await fetch('https://giji-api.duckdns.org/api/story/progress')
  const { stories, events }: { stories: Story[]; events: Event[] } = await res.json()
  stories.forEach((o) => {
    const sign = o.sow_auth_id.replace(/\./g, '&#2e')
    Object.assign(o, {
      label: o.name,
      sign: sign,
      mark_ids: (() => {
        switch (o.rating) {
          case 'default':
            return []
          case 'child':
            return ['age_A']
          case 'fireplace':
            return ['cat']
          case 'sexylove':
            return ['sexy', 'love']
          case 'sexyviolence':
            return ['sexy', 'violence']
          default:
            return [o.rating]
        }
      })(),
    })
  })
  return State.transaction(()=>{
    Set.sow_village.reject(Query.sow_villages.prologue.list)
    Set.sow_village.reject(Query.sow_villages.progress.list)
    Set.sow_turn.merge(events)
    Set.sow_village.merge(stories)
  })
}
