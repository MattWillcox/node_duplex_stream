const { Transform, Writable } = require('stream');
const fs = require('fs');

/*
* @desc Read command line arguments
* @arg[1] string - input file (default example.txt)
* @arg[2] string - output file (default output.txt)
*/
const args = process.argv.slice(2);

if(!args[0].endsWith('.txt')) args[0] += '.txt';
if(!args[1].endsWith('.txt')) args[1] += '.txt';
if(args[2]) throw new Error("too many args (max 2)")

const inputFile = args[0] || 'example.txt';
const outputFile = args[1] || 'output.txt';

inputData = fs.createReadStream(inputFile);
outputData = fs.createWriteStream(outputFile);

let startTime = Date.now();
let endTime;

// The output object shape from our stream transform
const stats = {
  totalTime: 0,
  totalLength: 0,
  totalLines: 0,
};

inputData.on('error', (error) => {
  console.log(error);
})

/* @desc Custom stream transform function
* Reads input from file and outputs computed stats object
*/
const dataTransform = new Transform({
  readableObjectMode: true,
  transform(chunk, encoding, callback) {
    stats.totalLength += chunk.length;
    let linesArray = chunk.toString().split('\n');
    stats.totalLines += linesArray.length - 1;
    this.push(stats);
    callback();
  },
});

const writer = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    callback();
  },
});

writer.on('error', (error) => {
  console.log(error);
});

// Writes to our output file and prints final results (including throughput) to console
writer.on('finish', () => {
  endTime = Date.now();
  stats.totalTime = (endTime - startTime) / 1000;
  const throughput = Math.round(stats.totalLength / stats.totalTime);
  console.log(
    `total time: ${stats.totalTime} secs \
    total length: ${stats.totalLength} bytes \
    total lines: ${stats.totalLines} \
    throughput: ${throughput} bytes/sec`
  );
  outputData.write(JSON.stringify(stats));
});

inputData.pipe(dataTransform).pipe(writer);