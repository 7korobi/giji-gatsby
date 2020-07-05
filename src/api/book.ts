/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { firestore, database, https } from "firebase-functions"
import admin from "firebase-admin"
import { startGM, deployGM, executionGM, checkGM } from "./game/progress"
// import "~/app/models/index";
import { Query } from "memory-orm"

function ref_for(mode, type, doc) {
  const { _id } = doc
  if (!_id) {
    return
  }
  const [folder, book_idx] = _id.split("-")
  const book_id = `${folder}-${book_idx}`

  return admin.firestore().doc(`${mode}/${book_id}/${type}/${_id}`)
}

async function next_idx(ref) {
  ref = await ref.orderBy("idx", "desc").limit(1).get()
  for (let o of Array.from(ref.docs)) {
    const { idx, label, _id } = o.data()
    if (-1 < idx) {
      return idx + 1
    }
    return 0
  }
  return 0
}

function init_chats(idx, { book_id, locale_id, tag_id, face_id }) {
  let day
  const { chr_set_id } = Query.tags.find(tag_id)
  const job = Query.chr_jobs.where({ chr_set_id, face_id }).list[0]
  const npc = Query.chr_npcs.where({ chr_set_id, face_id }).list[0]
  const locale = Query.locales.find(locale_id)
  const head = `${job.job} ${job.face.name}`

  const write_at = new Date().getTime()

  const a = []
  if (3 < idx) {
    day = 3
  } else {
    day = idx
  }
  if (locale.intro[day]) {
    a.push({
      _id: `${book_id}-${idx}-S-INTRO`,
      deco: "giji",
      show: "post",
      log: locale.intro[day],
      write_at: write_at - 1,
    })
  }
  if (npc[`say_${idx}`]) {
    a.push({
      _id: `${book_id}-${idx}-S-NPC`,
      deco: "giji",
      show: "talk",
      head,
      log: npc[`say_${idx}`],
      write_at,
    })
  }
  return a
}

export const book_created = firestore
  .document("{mode}/{book_id}/{type}/{id}")
  .onCreate(async function (snap, { params }) {
    let message
    console.log(params)
    console.log(snap.data())

    const { mode, book_id, type, id } = params
    switch (type) {
      case "chats":
        message = {
          topic: book_id,
          notification: {
            title: "新着",
            body: `\
${book_id}
あたらしい投稿があります。\
`,
          },
        }
        break

      case "potofs":
        message = {
          topic: book_id,
          notification: {
            title: "新着",
            body: `\
${book_id}
あたらしい参加者がいます。\
`,
          },
        }
        break
    }

    if (message) {
      switch (mode) {
        case "wiki":
          Object.assign(message, {
            webpush: {
              headers: {
                TTL: "60",
              },
              notification: {
                click_action: "https://giji.f5.si/wiki?idx=" + book_id,
              },
            },
          })
          break
      }

      return await admin.messaging().send(message)
    }
  })

export const book_deleted = firestore
  .document("{mode}/{book_id}/{type}/{id}")
  .onDelete(function (snap, { params }) {
    console.log(params)
    console.log(snap.data())

    const { mode, book_id, type, id } = params
    return null
  })

export const chat_updated = firestore
  .document("{mode}/{book_id}/chats/{id}")
  .onUpdate(function ({ before, after }, { params }) {
    let book_id, mode
    console.log(params)
    console.log(after.data())
    return ({ mode, book_id } = params)
  })

export const game_updated = firestore
  .document("game/{book_id}")
  .onUpdate(async function ({ before, after }, { params }) {
    const { locale_id } = after.data()
    const { book_id } = params
    const idx = await next_idx(
      admin.firestore().collection(`game/${book_id}/parts`)
    )
    const _id = `${book_id}-${idx}`
    const write_at = new Date().getTime()
    const label = (() => {
      switch (idx) {
        case 0:
          return "プロローグ"
        default:
          return `${idx}日目`
      }
    })()
    const b = admin.firestore().batch()
    const o = { _id, idx, label, write_at }
    b.set(admin.firestore().doc(`game/${book_id}/parts/${_id}`), o)

    const phases = [
      { _id: `${_id}-S`, is_update: false, handle: "SSAY", label: "会話" },
      { _id: `${_id}-T`, is_update: true, handle: "TITLE", label: "黒地" },
    ]
    for (const o of phases) {
      b.set(admin.firestore().doc(`game/${book_id}/phases/${o._id}`), o)
    }

    const npc_ref = await admin
      .firestore()
      .doc(`game/${book_id}/potofs/${book_id}-NPC`)
      .get()
    const { tag_id, face_id } = npc_ref.data()

    for (const o of init_chats(idx, { book_id, locale_id, tag_id, face_id })) {
      b.set(admin.firestore().doc(`game/${book_id}/chats/${o._id}`), o)
    }

    await b.commit()
  })
