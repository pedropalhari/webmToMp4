const fetch = require("node-fetch");
const fs = require("fs");
const { exec } = require("child_process");

let webmLink = process.argv[2];

let webmLinks = process.argv.slice(2);

(async () => {
  let promiseWebmToMp4Array = [];

  promiseWebmToMp4Array.push(
    new Promise(resolveForEach =>
      webmLinks.forEach((webmLink, index) => {
        fetch(webmLink).then(async res => {
          console.log(`Downloading #${index}...`);
          await new Promise((resolve, reject) => {
            const dest = fs.createWriteStream(`./video${index}.webm`);
            res.body.pipe(dest);
            res.body.on("error", err => {
              reject(err);
            });
            dest.on("finish", () => {
              resolve();
            });
            dest.on("error", err => {
              reject(err);
            });
          });
          console.log(`Downloaded #${index}!`);

          console.log(`Converting #${index}...`);
          await new Promise(resolve => {
            exec(
              `.\\ffmpeg.exe -i .\\video${index}.webm .\\video${index}.mp4 -y`,
              (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(`stderr: ${stderr}`);
                  return;
                }

                resolve();
              }
            );
          });
          console.log(`Converted #${index}!`);

          console.log(`Deleting .webm #${index}...`);
          await new Promise(resolveUnlink =>
            fs.unlink(`.\\video${index}.webm`, () => resolveUnlink())
          );
          console.log(`Deleted .webm #${index}!`);

          resolveForEach();
        });
      })
    )
  );

  await Promise.all(promiseWebmToMp4Array);

  await new Promise(resolve => {
    exec(`explorer.exe .`, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      resolve();
    });
  });
})();
