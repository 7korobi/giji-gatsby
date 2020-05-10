import React, { createContext, useContext, useState, useEffect } from "react"
import _ from "lodash"


interface Storage {
  getItem(key: string): string | string[];
  setItem(key: string, val: string | string[]): void;
  removeItem(key: string): void;
}

//
// format.
//
const zero = [null, undefined, "", NaN]

const to_String = (u, nil: '' | undefined ) => zero.includes(u) ? nil : String(u)
const to_Number = (u) => zero.includes(u) ? NaN : Number(u)
const to_Array = (u) => u instanceof Array ? u : zero.includes(u) ? [] : Array(u)
const to_Object = (u) => u instanceof Object ? u : {}

function to_str(o: number, base: number ): string
function to_str(o: string, base: string ): string
function to_str(o: Object, base: Object ): string
function to_str(o: any[], base: any[] ): string
function to_str(o, base) {
  switch (base.constructor) {
    case String : return to_String(o, '')
    case Number : return to_String(o, '')
    case Array  : return JSON.stringify(to_Array(o))
    case Object : return JSON.stringify(to_Object(o))
  }
}

function by_str(o: string, base: number): number
function by_str(o: string, base: string): string
function by_str(o: string, base: Object): Object
function by_str(o: string, base: any[]): any[]
function by_str(o, base) {
  switch (base.constructor) {
    case String : return to_String(o, undefined)
    case Number : return to_Number(o)
    case Array  : return JSON.parse(o) || []
    case Object : return JSON.parse(o) || {}
  }
}

function to_url(o: number, base: number): [string]
function to_url(o: string, base: string): [string]
function to_url(o: any[], base: any[]): string[]
function to_url(o, base) {
  switch (base.constructor) {
    case String : return [encodeURIComponent( to_String(o, '') )]
    case Number : return [encodeURIComponent( to_String(o, '') )]
    case Array  : return to_Array(o).map(encodeURIComponent)
  }
}

function by_url(o: [string], base: number): number
function by_url(o: [string], base: string): string
function by_url(o: string[], base: any[]): any[]
function by_url(o, base) {
  switch (base.constructor) {
    case String : return to_String(decodeURIComponent(o[0]), '')
    case Number : return to_Number(decodeURIComponent(o[0]))
    case Array  : return to_Array(o).map(decodeURIComponent)
  }
}


//
// data store.
//
const defaults = {}
const dataStore = {}
const copy = {}

export function localStore(o) { defineStore(window.localStorage, o, to_str, by_str) }
export function sessionStore(o) { defineStore(window.sessionStorage, o, to_str, by_str) }
export function pushUrlStore(o) { defineStore(new UrlStorage('pushState'), o, to_url, by_url) }
export function replaceUrlStore(o) { defineStore(new UrlStorage('replaceState'), o, to_url, by_url) }
function defineStore(storage: Storage, o: Object, to, by) {
  for (const rootPath in o) {
    const val = o[rootPath]
    const item = storage.getItem(rootPath)
    defaults[rootPath] = val
    copy[rootPath] = (val) => {
      if (val) {
        storage.setItem(rootPath, to(val, defaults[rootPath]))
      } else {
        storage.removeItem(rootPath)
      }
    }

    if (item) {
      dataStore[rootPath] = by(item, val)
    } else {
      dataStore[rootPath] = val
      copy[rootPath](val)
    }
  }
}

class UrlStorage {
  data: any
  store: () => void

  getItem (key): string[] {
    return this.data[key]
  }

  setItem (key, val: string[]) {
    if ( val !== this.data[key] ) {
      this.store()
    }
    this.data[key] = val
  }

  removeItem (key) {
    if ( this.data[key] ) {
      this.store()
    }
    delete this.data[key]
  }

  constructor (public mode) {
    this.sync()
    this.store = _.debounce( this._store.bind(this), 100)
    this.store()
  }

  _store () {
    const [file] = this.data.PATH.slice(-1)
    const hash = this.data.HASH[0] ? `#${this.data.HASH[0]}` : ''
    let search = ""
    for (const key in this.data) {
      switch (key) {
        case 'PATH':
        case 'HASH':
          break;
        default :
          if ( this.data[key].length ) {
            search += `&${ key }=${ this.data[key].join("=") }`
          } else {
            search += `&${ key }`
          }
      }
    }
    if ( search ) {
      search = `?${ search.slice(1) }`
    }
    history[this.mode](null,null,`${file}${search}${hash}`)
    this.sync()
  }

  sync () {
    const data = {
      PATH: window.location.pathname.split(/\/+/).slice(1),
      HASH: [window.location.hash.slice(1)],
    }
    window.location.search.slice(1).split('&').forEach((query)=>{
      const [key, ...vals] = query.split("=")
      if ( ! key ) { return }
      data[key] = vals
    })
    this.data = data
    console.warn(this)
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

