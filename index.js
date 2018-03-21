const { Duplex } = require('stream');
const fs = require('fs');

const args = process.argv.slice(2);

if(!args[0].endsWith('.txt')) args[0] += '.txt';
if(!args[1].endsWith('.txt')) args[1] += '.txt';

const inputFile = args[0] || 'example.txt';
const outputFile = args[1] || 'output.txt';

Duplex.Readable = fs.createReadStream(inputFile);
Duplex.Writable = fs.createWriteStream(outputFile);

const data = {
  totalLength: 0,
  totalLines: 0,
};

let startTime;
let endTime;
let throughput;

Duplex.Readable.on('error', (error) => {
  console.log("Error:", error);
})

Duplex.Readable.on('data', (chunk) => {
  startTime = Date.now();
  data.totalLength += chunk.length;
  let dataString = chunk.toString();
  let splitLines = dataString.split("\n");
  data.totalLines += splitLines.length - 1;
});

Duplex.Readable.on('end', function () {
  Duplex.Readable.pipe(Duplex.Writable);
});

Duplex.Writable.on('error', function(error) {
  console.log("Error:", error);
})

Duplex.Writable.on('pipe', (src) => {
  endTime = Date.now();
  data.elapsedTime = (endTime - startTime) / 1000;
  Duplex.Writable.write(JSON.stringify(data));
  Duplex.Writable.end();
});

Duplex.Writable.on('finish', () => {
  throughput = data.totalLength / data.elapsedTime;
  console.log(
`Elapsed Time was ${data.elapsedTime} secs, \
total Length was ${data.totalLength} bytes, \
total Lines was ${data.totalLines}, \
throughput was ${throughput} bytes/sec.`
  );
});