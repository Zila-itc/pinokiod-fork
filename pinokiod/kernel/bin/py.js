class Py {
  async install(req, ondata) {
    await fs.promises.rm(this.kernel.path("bin/py")).catch((e) => { console.log(e) })
    await this.kernel.exec({
      message: "git clone https://github.com/pinokiocomputer/python py",
      path: this.kernel.path("bin")
    }, ondata)
    await this.kernel.exec({
      message: "pip install -r requirements.txt",
      path: this.kernel.bin.path("py")
    }, ondata)
  }
  async installed() {
    let exists = await this.kernel.exists(this.kernel.bin.path("py"))
    try {
      if (exists) {
        return this.kernel.bin.installed.pip.has("fastapi") && this.kernel.bin.installed.pip.has("uvicorn") && this.kernel.bin.installed.pip.has("importlib_metadata")
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
  async uninstall(req, ondata) {
    await this.kernel.bin.rm(this.kernel.bin.path("py"), ondata)
  }
}
module.exports = Py
