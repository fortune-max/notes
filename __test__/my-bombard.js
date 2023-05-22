import http from 'http';
import https from 'https';
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .option('url', {
    alias: 'u',
    describe: 'The URL of the server to test',
    demandOption: true,
    type: 'string'
  })
  .option('requests', {
    alias: 'n',
    describe: 'The number of requests in total to perform for the benchmarking session',
    demandOption: true,
    type: 'number'
  })
  .option('concurrency', {
    alias: 'c',
    describe: 'The number of parallel requests to perform at a time',
    default: 10,
    type: 'number'
  })
  .option('body', {
    alias: 'd',
    describe: 'The request body to send',
    default: '',
    type: 'string'
  })
  .option('verbose', {
    alias: 'v',
    describe: 'log errors to console',
    default: false,
    type: 'boolean'
  })
  .help('h')
  .alias('h', 'help')
  .argv;

let url = argv.url;
let totalRequests = argv.requests;
const batchSize = argv.concurrency;
const verbose = argv.verbose;

const requestData = argv.body;
const options = {
  hostname: url,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
    'Content-Length': requestData.length
  }
};

const makePostRequest = (startTime) => {
  const isHttps = argv.url.startsWith('https://');
  url = argv.url.replace('https://', '').replace('http://', '');
  const host = url.split('/')[0];
  options.hostname = host.split(':')[0];
  options.port = host.split(':')[1] || (isHttps ? 443 : 80);
  options.path = url.slice(url.indexOf('/'));
  const request = isHttps ? https.request : http.request;
  return new Promise((resolve) => {
    const req = request(options, (res) => {
      res.on('data', () => {
        resolve(Date.now() - startTime);
      });
    })
    
    req.on('error', (error) => {
      if (verbose)
        console.log(error);
      resolve(-1);
    });

    req.write(requestData);
    req.end();
  });
};

const makeGetRequest = (startTime) => {
  const isHttps = url.startsWith('https://');
  url = url.replace('https://', '').replace('http://', '');
  url = isHttps ? `https://${url}` : `http://${url}`;
  const get = isHttps ? https.get : http.get;
  return new Promise((resolve) => {
    get(url, (res) => {
      res.on('data', () => {
        resolve(Date.now() - startTime);
      });
    }).on('error', (error) => {
      if (verbose)
        console.log(error);
      resolve(-1);
    });
  });
};

const runStressTest = (requestCount) => {
  const promises = [];
  const makeRequest = requestData ? makePostRequest : makeGetRequest;

  for (let i = 0; i < requestCount; i++) {
    promises.push(makeRequest(Date.now()));
  }

  return promises;
};

const times = [];

while (totalRequests){
  const requestsToRun = Math.min(batchSize, totalRequests);
  totalRequests -= requestsToRun;
  const batchNumber = Math.ceil((argv.requests - totalRequests) / batchSize);
  const promises = runStressTest(requestsToRun);
  await Promise.all(promises).then((results) => {
    const errors = results.filter((r) => r === -1).length;
    results = results.filter((r) => r !== -1);
    const min = Math.min(...results);
    const max = Math.max(...results);
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    times.push({ min, max, avg, errors });
    console.log(`Batch ${batchNumber} completed (${errors} errors), min: ${min}ms, max: ${max}ms, avg: ${avg}ms`);
  });
}

const errors = times.reduce((a, b) => a + b.errors, 0);
const min = Math.min(...times.map((t) => t.min));
const max = Math.max(...times.map((t) => t.max));
const avg = times.reduce((a, b) => a + b.avg, 0) / times.length;

console.log(`\nMin: ${min}ms, Max: ${max}ms, Avg: ${avg}ms, Errors: ${errors}`);
