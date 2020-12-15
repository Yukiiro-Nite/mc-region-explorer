const regionPath = `C:/Users/ekazu/Documents/Curse/Minecraft/Instances/Enigmatica 2 - E2/saves/FS Copy/region`

const fs = require('fs')
const path = require('path')
const mca = require('mca-js')
const nbt = require('nbt-js')
const regionPattern = /r\.((-)?(\d+))\.((-)?(\d+))\.mca/
const regionSize = 32 // regions are 32 by 32 chunks
const chunkSize = 16 // chunks are 16 by 16 blocks

// const file = fs.readFileSync(path.join(regionPath, 'r.0.0.mca'))
// const data = mca.getData(file, 0, 0) // getData(fileData, x, z); x and z are mod 32.
// const tag  = nbt.read(data)

// console.log(JSON.stringify(tag.payload, null, 2));
// const biomes = tag.payload[""].Level.Biomes
// const heightMap = tag.payload[""].Level.HeightMap

// console.log(JSON.stringify(tag.schema, null, 2));
// console.log(Object.keys(tag));
// console.log(Object.keys(tag.schema[""]));
// console.log(Object.keys(tag.payload[""].Level));
// console.log(tag.payload.length);
// console.log(tag.payload[""].Level.Biomes.length);
// console.log(biomes[0], heightMap[0])

/**
 * Gets all file names in the given region folder
 * @param {string} regionPath - A path to the region files
 * @returns {string[]} List of region file names
 */
function getRegionFiles(regionPath) {
  return fs
    .readdirSync(regionPath)
    .filter(fileName => fileName.endsWith('.mca'))
    .map(fileName => path.join(regionPath, fileName))
}

function getRegionPos(fileName) {
  const match = regionPattern.exec(fileName)
  if(match) {
    const [line, x, xNeg, xAbs, z, zNeg, zAbs] = match
    return { x: parseInt(x), z: parseInt(z) }
  } else {
    throw new Error("Invalid region file: " + fileName);
  }
}

function mapChunksInRegion(fileName, chunkMapper) {
  const file = fs.readFileSync(fileName)
  const regionCoords = getRegionPos(fileName)
  const results = []

  for(let z = 0; z < regionSize; z++) {
    for(let x = 0; x < regionSize; x++) {
      const chunk = nbt.read(mca.getData(file, x, z))
      results.push(chunkMapper(chunk, {x, z}, regionCoords))
    }
  }

  return results
}

const files = getRegionFiles(regionPath)
console.log(files)
console.log(files.map(getRegionPos))

const file = fs.readFileSync(files[0])
const column = nbt.read(mca.getData(file, 31, 0))
const level = column.payload[""].Level
console.log(level.xPos, level.zPos)

/**
 * Steps
 * 1. Get list of all region files.
 * 2. Turn each chunk in region to image.
 * 3. Stitch chunks together into region image.
 * 4. Stitch region images into overall image.
 * 5. Save image as a png or other lossless format.
 * 6. Process image to find largest biome.
 */