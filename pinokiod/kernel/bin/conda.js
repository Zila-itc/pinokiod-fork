const fs = require('fs')
const path = require('path')
const fetch = require('cross-fetch')
const { glob } = require('glob')
class Conda {
  urls = {
    darwin: {
      //x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_23.5.2-0-MacOSX-x86_64.sh",
      //arm64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_23.5.2-0-MacOSX-arm64.sh"
      //x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.5.0-0-MacOSX-x86_64.sh",
      //arm64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.5.0-0-MacOSX-arm64.sh"
      x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.11.1-0-MacOSX-x86_64.sh",
      arm64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.11.1-0-MacOSX-arm64.sh"
    },
    win32: {
      //x64: "https://github.com/cocktailpeanut/miniconda/releases/download/v23.5.2/Miniconda3-py310_23.5.2-0-Windows-x86_64.exe",
      //x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.5.0-0-Windows-x86_64.exe"
      x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.11.1-0-Windows-x86_64.exe"
    },
    linux: {
      //x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_23.5.2-0-Linux-x86_64.sh",
      //arm64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_23.5.2-0-Linux-aarch64.sh"
      //x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.5.0-0-Linux-x86_64.sh",
      //arm64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.5.0-0-Linux-aarch64.sh"
      x64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.11.1-0-Linux-x86_64.sh",
      arm64: "https://repo.anaconda.com/miniconda/Miniconda3-py310_24.11.1-0-Linux-aarch64.sh"
    }
  }
  installer = {
    darwin: "installer.sh",
    win32: "installer.exe",
    linux: "installer.sh"
  }
  paths = {
    darwin: [ "miniconda/etc/profile.d", "miniconda/bin", "miniconda/condabin", "miniconda/lib", "miniconda/Library/bin", "miniconda/pkgs", "miniconda" ],
    win32: ["miniconda/etc/profile.d", "miniconda/bin", "miniconda/Scripts", "miniconda/condabin", "miniconda/lib", "miniconda/Library/bin", "miniconda/pkgs", "miniconda"],
    linux: ["miniconda/etc/profile.d", "miniconda/bin", "miniconda/condabin", "miniconda/lib", "miniconda/Library/bin", "miniconda/pkgs", "miniconda"]
  }
  env() {
    let base = {
//      CONDA_ROOT: this.kernel.bin.path("miniconda"),
      CONDA_PREFIX: this.kernel.bin.path("miniconda"),
      PYTHON: this.kernel.bin.path("miniconda/python"),
      PATH: this.paths[this.kernel.platform].map((p) => {
        return this.kernel.bin.path(p)
      })
    }
    if (this.kernel.platform === "win32") {
      base.CONDA_BAT = this.kernel.bin.path("miniconda/condabin/conda.bat")
      base.CONDA_EXE = this.kernel.bin.path("miniconda/Scripts/conda.exe")
      base.CONDA_PYTHON_EXE = this.kernel.bin.path("miniconda/Scripts/python")
    }
    if (this.kernel.platform === 'darwin') {
      base.TCL_LIBRARY = this.kernel.bin.path("miniconda/lib/tcl8.6")
      base.TK_LIBRARY = this.kernel.bin.path("miniconda/lib/tk8.6")
    }
    return base
  }
  async init() {
    // 
    if (this.kernel.homedir) {
      let exists = await this.kernel.exists("condarc")
      if (!exists) {
        await fs.promises.writeFile(this.kernel.path('condarc'), `channels:
  - conda-forge
  - defaults
create_default_packages:
  - python=3.10`)
      }
      let pinned_exists = await this.kernel.exists("bin/miniconda/conda-meta")
      if (pinned_exists) {
        await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.11.1`)
//        await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.9.0`)
//        await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.11.2
//conda-libmamba-solver=24.11.1`)
//        await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.7.1
//conda-libmamba-solver=24.7.0`)
      }
    }
  }
//  async init() {
//    let exists = await this.kernel.bin.exists("miniconda/condarc")
//    console.log("condarc exists?", exists)
//    if (!exists) {
//      console.log("write to condarc")
//      await fs.promises.writeFile(this.kernel.bin.path('miniconda/condarc'), `channels:
//    - conda-forge
//    - defaults
//  create_default_packages:
//    - python=3.10`)
//    }
//  }
  async install(req, ondata) {
    const installer_url = this.urls[this.kernel.platform][this.kernel.arch]
    const installer = this.installer[this.kernel.platform]
    const install_path = this.kernel.bin.path("miniconda")

    ondata({ raw: `downloading installer: ${installer_url}...\r\n` })
    await this.kernel.bin.download(installer_url, installer, ondata)

    // 2. run the script
    ondata({ raw: `running installer: ${installer}...\r\n` })

    let cmd
    if (this.kernel.platform === "win32") {
      cmd = `start /wait ${installer} /InstallationType=JustMe /RegisterPython=0 /S /D=${install_path}`
    } else {
      cmd = `bash ${installer} -b -p ${install_path}`
    }
    ondata({ raw: `${cmd}\r\n` })
    ondata({ raw: `path: ${this.kernel.bin.path()}\r\n` })
    await this.kernel.bin.exec({ message: cmd, conda: { skip: true } }, (stream) => {
      ondata(stream)
    })

    // set pinned
    let pinned_exists = await this.kernel.exists("bin/miniconda/conda-meta")
    if (pinned_exists) {
      await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.11.1`)
//      await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.9.0`)
//      await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.11.2
//conda-libmamba-solver=24.11.1`)
//      await fs.promises.writeFile(this.kernel.path('bin/miniconda/conda-meta/pinned'), `conda=24.7.1
//conda-libmamba-solver=24.7.0`)
    }
////    await this.activate()
//    await fs.promises.writeFile(this.kernel.bin.path('miniconda/condarc'), `channels:
//  - conda-forge
//  - defaults
//create_default_packages:
//  - python=3.10`)


    // 1. right after installing conda==24.11.1, run conda update --all
    // 2. The pinned file says conda-libmamba-solver=24.11.1
    // 3. so after conda update --all, it should be conda-libmamba-solver=24.11.1


    let cmds = [
      //"conda clean -y --index-cache",
      "conda clean -y --all",
      `conda config --file ${this.kernel.path('condarc')} --set remote_connect_timeout_secs 20`,
      `conda config --file ${this.kernel.path('condarc')} --set remote_read_timeout_secs 300`,
      `conda config --file ${this.kernel.path('condarc')} --set remote_max_retries 6`,
      `conda config --file ${this.kernel.path('condarc')} --set repodata_threads 4`,
      `conda config --file ${this.kernel.path('condarc')} --set fetch_threads 5`,
      "conda install -y -c conda-forge conda-libmamba-solver=24.11.1",
//      "conda install libsqlite --force-reinstall -y",
//      `conda config --file ${this.kernel.path('condarc')} --set auto_update_conda False`,
      //"conda install -y conda=24.9.0 -vvv --strict-channel-priority",
      //"conda install -y conda=24.11.3 conda-libmamba-solver=24.11.1 -vvv",
      //"conda install -y conda-libmamba-solver=24.7.0 conda=24.7.1 -vvv --strict-channel-priority",
      //"conda install -y conda-libmamba-solver=24.11.1 conda=24.7.1",
      //"conda install -y conda-libmamba-solver=24.11.1 conda=24.11.2",
      "conda update -y --all",
//      "conda update -y conda",
//      "conda update -y --all",
    ]
    //if (this.kernel.platform === "win32" || this.kernel.platform === "darwin") {
    //  cmds.push("conda install -y conda-libmamba-solver=24.7.0 conda=24.7.1 --freeze-installed")
    //}

    await this.kernel.bin.exec({
      message: cmds,
//      conda: {
//        name: "base",
//        activate: "minimal"
//      }
//      [
//        (this.kernel.platform === 'win32' ? 'conda_hook' : `eval "$(conda shell.bash hook)"`),
//        (this.platform === 'win32' ? `activate base` : `conda activate base`),
/*
        `conda config --file ${this.kernel.bin.path('miniconda', 'condarc')} --remove channels conda-forge`,
        `conda config --file ${this.kernel.bin.path('miniconda', 'condarc')} --remove channels defaults`,
        `conda config --file ${this.kernel.bin.path('miniconda', 'condarc')} --prepend channels defaults`,
        `conda config --file ${this.kernel.bin.path('miniconda', 'condarc')} --prepend channels conda-forge`,
        `conda config --file ${this.kernel.bin.path('miniconda', 'condarc')} --add create_default_packages python=3.10`,
        */
        //"conda update -y conda",
        //"conda update -n base -c conda-forge -c defaults conda",


        //"conda install conda=24.5.0",
//        "conda clean -y --index-cache",
//        "conda update -y --all",
//        "conda install conda=24.9.0"


        // handling the conda-libmamba-solver bug here: https://github.com/conda/conda-libmamba-solver/issues/283


//        "conda remove -y libarchive",   
//        "conda install -y -c conda-forge libarchive",
//        "conda install -y -c conda-forge pip brotli brotlipy",
//        "conda install -y -c conda-forge libsqlite --force-reinstall",
//        "conda install conda"


        //"conda install -y -c conda-forge pip brotli brotlipy",
//        "conda update --all",
//        "conda update -y --all",
//      ]
    }, (stream) => {
      ondata(stream)
    })
    if (this.kernel.platform === "win32") {
      // copy python.exe to python3.exe so you can run with both python3 and python
      await fs.promises.copyFile(
        this.kernel.bin.path("miniconda", "python.exe"),
        this.kernel.bin.path("miniconda", "python3.exe"),
      )
    }
    ondata({ raw: `Install finished\r\n` })
    await this.kernel.bin.rm(installer, ondata)
  }
  async exists(pattern) {
    let paths = this.paths[this.kernel.platform]
    for(let p of paths) {
      //let e = await this.kernel.bin.exists(p + "/" + name)
      const found = await glob(pattern, {
        cwd: this.kernel.bin.path(p)
      })
      if (found && found.length > 0) {
        return true
      }
    }
    return false
  }

  async installed() {
    let e
    for(let p of this.paths[this.kernel.platform]) {
      let e = await this.kernel.bin.exists(p)
      if (e && this.kernel.bin.correct_conda) return true
    }
    return false
  }

  uninstall(req, ondata) {
    const install_path = this.kernel.bin.path("miniconda")
    return this.kernel.bin.rm(install_path, ondata)
  }

  onstart() {
    if (this.kernel.platform === "win32") {
      return ["conda_hook"]
    } else {
      //return ['eval \"$(conda shell.bash hook)\"']
      return ['eval "$(conda shell.bash hook)"']
    }
  }

}
module.exports = Conda
