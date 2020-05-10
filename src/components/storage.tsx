import React, { createContext, useContext, useState, useEffect } from "react"
import _ from "lodash"

//
// format.
//
const zero = [null, undefined, "", NaN]

const to_String = (u, nil) => zero.includes(u) ? nil : String(u)
const to_Number = (u) => zero.includes(u) ? NaN : Number(u)
const to_Array = (u) => u instanceof Array ? u : zero.includes(u) ? [] : Array(u)
const to_Object = (u) => u instanceof Object ? u : {}

function to_str(o, base = o) {
  switch (base.constructor) {
    case String : return to_String(o, '')
    case Number : return to_String(o, '')
    case Array  : return JSON.stringify(to_Array(o))
    case Object : return JSON.stringify(to_Object(o))
  }
}

function by_str(o, base) {
  switch (base.constructor) {
    case String : return to_String(o, undefined)
    case Number : return to_Number(o)
    case Array  : return JSON.parse(o) || []
    case Object : return JSON.parse(o) || {}
  }
}

function by_url(o, base) {
  switch (base.constructor) {
    case String : return to_String(o, '')
    case Number : return to_Number(o)
    case Array  : return to_Array(o)
  }
}


//
// data store.
//
interface Storage {
  setItem(key: String, val: any);
  getItem(key: String);
  removeItem(key: String);
}

const defaults = {}
const dataStore = {}
const copy = {}

export function localStore(o) { defineStore(window.localStorage, o) }
export function sessionStore(o) { defineStore(window.sessionStorage, o) }
function defineStore(storage: Storage, o: Object) {
  for (const rootPath in o) {
    const val = o[rootPath]
    const item = storage.getItem(rootPath)
    defaults[rootPath] = val
    copy[rootPath] = (val) => {
      if (val) {
        storage.setItem(rootPath, to_str(val, defaults[rootPath]))
      } else {
        storage.removeItem(rootPath)
      }
    }

    if (item) {
      dataStore[rootPath] = by_str(item, val)
    } else {
      dataStore[rootPath] = val
    }
  }
}

export function useStore<S>(key: any) {
  const path = _.toPath(key)
  const rootPath = path[0]
  const [item, setItem] = useState<S>(_.get(dataStore, path))
  const setter = (val) => {
    _.set(dataStore, path, val)
    setItem(val)
    copy[rootPath](dataStore[rootPath])
  }
  return [item, setter]
}

window.addEventListener("storage", ({ key, newValue }) => {
  const base = defaults[key]
  if (!base) { return }
  dataStore[key] = by_str(newValue, base)
})

