import { https } from "firebase-functions"
import * as admin from "firebase-admin"
import serviceAccount from "../config/service_account.yml"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://giji-db923.firebaseapp.com",
})

export * from "./timer"
export * from "./subscribe"
export * from "./book"

export const packMessage = https.onCall(({ text }, { auth }) => {
  const { uid } = auth!
  const { name, picture, email } = auth!.token
  return { uid, email, picture, name, text }
})
