const fs = require('fs')
const fetch = require('cross-fetch')
const { rimraf } = require('rimraf')
const decompress = require('decompress');
class Node {
  async install(req, ondata) {
    await this.kernel.bin.exec({
      //message: "conda install -y nodejs=22.12.0 -c conda-forge"
      message: [
        "conda clean -y --all",
        "conda install -y nodejs=20.17.0 -c conda-forge"
      ]
//      conda: {
//        name: "base",
//        activate: "minimal"
//      }
    }, ondata)
  }
  async installed() {
    return this.kernel.bin.installed.conda.has("nodejs")
  }
  async uninstall(req, ondata) {
    await this.kernel.bin.exec({
      message: "conda remove nodejs",
    }, ondata)
  }
}
module.exports = Node
