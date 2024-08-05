const fs = require('fs')
const path = require('path')

const sourceDir = path.join(__dirname, '..', 'mini-game-models')
const destDir = path.join(process.cwd(), 'mini-game-models')
const packageJson = require('../package.json')

console.log('running postinstall')

function isLibraryDirectory() {
  try {
    const currentPackageJson = JSON.parse(fs.readFileSync(path.join(destDir, '..', 'package.json'), 'utf8'))
    return currentPackageJson.name === packageJson.name
  } catch (error) {
    console.log(error)
    return false
  }
}

function copyFiles(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }

  const files = fs.readdirSync(source)
  for (const file of files) {
    const sourcePath = path.join(source, file)
    const destPath = path.join(destination, file)

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFiles(sourcePath, destPath)
    } else {
      fs.copyFileSync(sourcePath, destPath)
      console.log(`Copied ${sourcePath} to ${destPath}`)
    }
  }
}

try {
  if (isLibraryDirectory()) return
  copyFiles(sourceDir, destDir)
  console.log('Files copied successfully')
} catch (error) {
  console.error('Error copying files:', error)
}