import { firestore, database, https } from "firebase-functions"
import * as admin from "firebase-admin"
import format from "date-fns/format"
import locale from "date-fns/locale/ja"

import { to_msec, to_tempo } from "fancy-date"

function tempo(doc) {
  if (!doc?.tempo[0]) {
    return null
  }

  const { last_at, write_at, next_at, now_idx, timezone } = to_tempo(
    ...doc.tempo
  )

  if (now_idx === doc.last_idx) {
    return null
  }

  Object.assign(doc, { last_at, write_at, next_at })
  doc.write_time = format(write_at - timezone, "yyyy/MM/dd HH:mm:ss", {
    locale,
  })
  doc.next_time = format(next_at - timezone, "yyyy/MM/dd HH:mm:ss", { locale })
  doc.last_time = format(last_at - timezone, "yyyy/MM/dd HH:mm:ss", { locale })
  doc.last_idx = now_idx
  return now_idx
}

export const chk_update = firestore
  .document("parts/{part_id}")
  .onUpdate(({ before, after }, { params }) => {
    console.log(params)
    console.log(after.data())
    return null
  })

export const tick_https = https.onRequest(async (req, res) => {
  // _id:
  //    _id: _id
  //    is_active: true
  //    last_idx: Number
  //    tempo: ["15min"]

  const parts = await admin
    .firestore()
    .collection("parts")
    .where("is_active", "==", true)
    .get()
  const games = await admin
    .firestore()
    .collection("game")
    .where("is_active", "==", true)
    .get()

  parts.docs.forEach((doc) => {
    const part = doc.data()
    if (tempo(part)) {
      admin.firestore().doc(`parts/${part._id}`).set(part, {
        merge: true,
      })
    }
  })

  games.docs.forEach((doc) => {
    const book = doc.data()
    if (tempo(book)) {
      admin.firestore().doc(`game/${book._id}`).set(book, {
        merge: true,
      })
    }
  })

  res.status(201).send("OK.")
})

/*
  cheat seet.
    database.ref('/tick/at').onWrite (e)->

    ref = admin.database().ref("/tick")
    oo = await ref.once('value')
    o = oo?.val()
    ref.set(o);


    firestore.document('test/{test_id}').onUpdate ({ data, params })->
      data.previous?.data()
      data.data()
      data.ref.set { now }, { merge: true }
      params.test_id

    ref = admin.firestore().doc('test/tick')
    oo = await ref.get()

    now_s = format new Date - timezone, "yyyy/MM/dd HH:mm:ss", { locale }
 */
