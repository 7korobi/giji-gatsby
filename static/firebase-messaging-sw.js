!(function (e, t) {
  for (var i in t) e[i] = t[i]
})(
  this,
  (function (e) {
    var t = {}
    function i(r) {
      if (t[r]) return t[r].exports
      var n = (t[r] = { i: r, l: !1, exports: {} })
      return e[r].call(n.exports, n, n.exports, i), (n.l = !0), n.exports
    }
    return (
      (i.m = e),
      (i.c = t),
      (i.d = function (e, t, r) {
        i.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r })
      }),
      (i.r = function (e) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 })
      }),
      (i.t = function (e, t) {
        if ((1 & t && (e = i(e)), 8 & t)) return e
        if (4 & t && "object" == typeof e && e && e.__esModule) return e
        var r = Object.create(null)
        if (
          (i.r(r),
          Object.defineProperty(r, "default", { enumerable: !0, value: e }),
          2 & t && "string" != typeof e)
        )
          for (var n in e)
            i.d(
              r,
              n,
              function (t) {
                return e[t]
              }.bind(null, n)
            )
        return r
      }),
      (i.n = function (e) {
        var t =
          e && e.__esModule
            ? function () {
                return e.default
              }
            : function () {
                return e
              }
        return i.d(t, "a", t), t
      }),
      (i.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
      }),
      (i.p = ""),
      i((i.s = 54))
    )
  })({
    4: function (e, t) {
      e.exports = {
        game: { folder_id: "beta" },
        url: {
          web: "https://giji.f5.si",
          api: "https://giji-api.duckdns.org/api",
          firebase: "https://giji-db923.firebaseapp.com",
          assets: "https://giji-db923.firebaseapp.com",
          style: "",
          store: "https://s3-ap-northeast-1.amazonaws.com/giji-assets",
          sow: "https://s3-ap-northeast-1.amazonaws.com/giji-assets/sow",
        },
        firebase: {
          apiKey: "AIzaSyDIKOyZtB02BkMtEQt2dXVVqWYQOPNmiYo",
          authDomain: "giji-db923.firebaseapp.com",
          databaseURL: "https://giji-db923.firebaseio.com",
          projectId: "giji-db923",
          storageBucket: "giji-db923.appspot.com",
          messagingSenderId: "133620449014",
        },
      }
    },
    54: function (e, t, i) {
      "use strict"
      var r
      importScripts("https://www.gstatic.com/firebasejs/5.8.5/firebase-app.js"),
        importScripts(
          "https://www.gstatic.com/firebasejs/5.8.5/firebase-messaging.js"
        ),
        (r = i(4)),
        firebase.initializeApp(r.firebase),
        firebase.messaging().setBackgroundMessageHandler(function (e) {
          return (
            console.log(e),
            self.registration.showNotification(title, e.notification)
          )
        }),
        self.addEventListener("install", function (e) {
          return console.log("Service Worker installing.")
        }),
        self.addEventListener("activate", function (e) {
          return console.log("Service Worker activating.")
        })
    },
  })
)
//# sourceMappingURL=firebase-messaging-sw.js.map
