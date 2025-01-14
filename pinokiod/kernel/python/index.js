const path = require('path')
const fetch = require('cross-fetch')
class Python {
  constructor(kernel) {
    this.kernel = kernel
  }
  async call(modname, modpath, method, args, ondata) {
    console.log("CALL", { modname, modpath, method, args })
    // if this.proc doesn't exist, create
    if (!this.proc) {
      await new Promise((resolve, reject) => {
        this.kernel.exec({
          message: "uvicorn --port 42001 server:app",
          path: modpath,
        }, (s) => {
  //        process.stdout.write(s)
          ondata(s)
          if (/Uvicorn running on/i.test(s.cleaned)) {
            resolve()
          }
        })
      })
      console.log("Server Started")
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve() 
        }, 3000)
      })
    }

    let res = await fetch("http://127.0.0.1:42001/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: modname,
        path: modpath,
        method,
        params: args
      })
    }).then((res) => {
      return res.json()
    })
    this.proc = true
    return res
  }
}
module.exports = Python
