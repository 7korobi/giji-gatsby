/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { firestore, database, https } from 'firebase-functions'
import admin from 'firebase-admin'

type SUBSCRIBER = {
  fcm_token: string,
  fcm_topics: string[]
}

type BOOK_INFO = {
  mode : string
  book_id : string
  part_id : string
  face_id : string
  is_notice : string
}


function ref_for(mode, type, doc) {
  const { _id } = doc
  if (!_id) { return }
  const [folder, book_idx] = _id.split("-")
  const book_id = `${folder}-${book_idx}`

  return admin
    .firestore()
    .doc(`${mode}/${book_id}/${type}/${_id}`)
}

export const subscribe = https.onCall(function ({ fcm_token, fcm_topics } : SUBSCRIBER, { auth }) {
  const fcm_tokens = [fcm_token]
  const all = fcm_topics.map((topic) => admin.messaging().subscribeToTopic(fcm_tokens, topic))
  return Promise.all(all)
})

export const unsubscribe = https.onCall(function ({ fcm_token, fcm_topics } : SUBSCRIBER, { auth }) {
  const fcm_tokens = [fcm_token]
  const all =
    fcm_topics.map((topic) => admin.messaging().unsubscribeFromTopic(fcm_tokens, topic))
  return Promise.all(all)
})

export const book_external = https.onRequest(async function (req, res) {
  const { mode, book_id, part_id, face_id, is_notice } = req.query as BOOK_INFO
  const m_book = {
    topic: "init",
    notification: {
      title: '村の情報',
      body: ""
    },
    webpush: {
      headers: {
        TTL: '60'
      },
      notification: {
        click_action: 'https://giji.f5.si/'
      }
    }
  }

  if (book_id) {
    switch (mode) {
      case "init":
        switch (false) {
          case !!!face_id:
            m_book.topic = book_id
            m_book.notification.body = `\n${part_id}\n新しい参加者がいます。\n`
            await admin.messaging().send(m_book)
            break

          case !!!part_id:
            m_book.topic = book_id
            switch (is_notice) {
              case undefined: case null:
                m_book.notification.body = `\n${part_id}\n日付が進みました。\n`
                break
              case 'scraplimitdt':
                m_book.notification.body = `\n${part_id}\nもうすぐ廃村になります。\n`
                break
              case 'nextcommitdt':
                m_book.notification.body = `\n${part_id}\n全員がコミット済みです。もうすぐ日付が進みます。\n`
                break
              case 'nextupdatedt':
                m_book.notification.body = `\n${part_id}\nもうすぐ日付が進みます。\n`
                break
              default:
                m_book.notification.body = `\n${part_id}\nもうすぐ日付が進むんじゃないかな。\n`
            }

            await admin.messaging().send(m_book)
            break

          default:
            m_book.topic = mode
            m_book.notification.body = `\n${book_id}\n新しい村が現れました。\n`
            await admin.messaging().send(m_book)
        }
        break
    }
  }

  res.status(201).send("OK.")
})


