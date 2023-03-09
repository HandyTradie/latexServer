"use strict";

const express = require("express");
var https = require("https");
const { exec, execFile } = require("child_process");
var fs = require("fs");
const path = require("path");
const { db, bucket } = require("./firebase");

var download = (url, folder, dest, cb) => {
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    var file = fs.createWriteStream(folder + "/" + dest);
    var request = https
      .get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
          console.log("finished");
          file.close(() => cb(folder + "/" + dest)); // close() is async, call cb after close completes.
        });
      })
      .on("error", function (err) {
        // Handle errors
        // fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
      });
  } catch (error) {
    cb(error);
  }
};
// Constants
const PORT = 8080;
const HOST = "0.0.0.0";

// App
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World,whats up most recent 14 with changes");
});

app.get("/firebasetest", async (req, res) => {
  const docRef = db.collection("testcollection").doc("alovelace");

  await docRef.set({
    first: "Ada",
    last: "Lovelace",
    born: 1815,
  });
  res.send("success");
});

const writeFile = (path, data, opts = "utf8") =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, data, opts, (err) => {
      if (err) reject(err);
      else resolve("done");
    });
  });

app.post("/download", (req, res) => {
  const { url, filename, paid } = req.body
    ? req.body
    : {
        url: undefined,
        filename: undefined,
        paid: false,
      };
  if (!url || !filename)
    return res.send("url and filename must be added to body");

  console.log("working on question");

  const configId = String(filename).split(".")[0];

  try {
    download(url, configId, filename, async (message) => {
      let fileLocation = configId + "/" + filename;

      console.log("before writing to file");
      await writeFile(
        "pdflatex.sh",
        `echo Starting and it works \ncd ${configId} \n pdflatex -interaction=nonstopmode --shell-escape ${filename} \n echo Done || { echo "command failed"; exit 1; }`
      );
      const file_name_pdf = `${
        paid
          ? `generatorDownloads/${configId}.pdf`
          : `generatorPreviews/${configId}.pdf`
      }`;

      console.log(
        "about to ran sh:",
        "This should show in update, message:",
        message
      );

      var yourscript = execFile(
        "sh",
        ["pdflatex.sh"],
        async (error, stdout, stderr) => {
          console.log("out:", stdout);
          console.log("error:", stderr);
          console.log(error);

          let pdffile =
            configId + "/" + String(filename).split(".")[0] + ".pdf";
          console.log('This is the pdf file', pdffile)
          const uploadResp = await bucket.upload(pdffile, {
            destination: file_name_pdf,
            metadata: {
              contentType: "application/pdf",
            },
            public: true,
          });
          console.log("uploaded response");
          const configUrl = {
            action: "read",
            expires: "03-17-2025",
          };
          let data = await bucket.file(file_name_pdf).getSignedUrl({
            ...configUrl,
          });

          const url = data[0];

          let date = new Date().toISOString();
          await db
            .collection("examConfiguration")
            .doc(configId)
            .update(
              paid
                ? {
                    updatedAt: date,
                    finalpdfUrl: url,
                  }
                : {
                    generatorPDFURL: url,
                    pdfUrl: url,
                    updatedAt: date,
                    finalpdfUrl: "",
                  }
            );
          console.log("url of file", url, paid);

          res.send("success");

          if (error !== null) {
            console.log(`exec error: ${error}`);
            res.status(error.code).send(error);
          }
        }
      );
      yourscript.on("error", function (m) {
        console.log("Parent process received:", m);
      });
      yourscript.on("message", function (m) {
        console.log("Parent process received:", m);
      });

      yourscript.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });
    });
  } catch (error) {
    res.sendStatus(400).send(error);
  }
});

app.post("/download-answer", (req, res) => {
  const { url, filename, paid } = req.body
    ? req.body
    : {
        url: undefined,
        filename: undefined,
        paid: false,
      };
  if (!url || !filename)
    return res.send("url and filename must be added to body");

  console.log("working on answer");

  const configId = String(filename).split(".")[0];

  try {
    download(url, `${configId}-answer`, filename, async (cbFilename) => {
      console.log("before writing answer to file");
      await writeFile(
        "ans-pdflatex.sh",
        `echo Starting and it works  \n pdflatex -interaction=nonstopmode -output-directory=${configId}-answer --shell-escape ${cbFilename} \n echo Done || { echo "command failed"; exit 1; }`
      );
      const file_name_pdf = `${
        paid
          ? `generatorAnswerDownloads/${configId}.pdf`
          : `generatorAnswerPreviews/${configId}.pdf`
      }`;

      console.log(
        "about to ran sh:",
        "This should show in update, cbFilename:",
        cbFilename
      );

      var yourscript = execFile(
        "sh",
        ["ans-pdflatex.sh"],
        async (error, stdout, stderr) => {
          console.log("out:", stdout);
          console.log("error:", stderr);
          console.log(error);

          let pdffile = `${configId}-answer/${configId}.pdf`;
          const uploadResp = await bucket.upload(pdffile, {
            destination: file_name_pdf,
            metadata: {
              contentType: "application/pdf",
            },
            public: true,
          });
          console.log("uploaded response");
          const configUrl = {
            action: "read",
            expires: "03-17-2025",
          };
          let data = await bucket.file(file_name_pdf).getSignedUrl({
            ...configUrl,
          });

          const url = data[0];

          let date = new Date().toISOString();
          await db
            .collection("examConfiguration")
            .doc(configId)
            .update(
              paid
                ? {
                    updatedAt: date,
                    answerPDFURL: url,
                  }
                : {
                    answerPreviewPDFURL: url,
                    answerPDFURL: "",
                    updatedAt: date,
                  }
            );
          console.log("url of file", url, paid);

          res.send("success");

          if (error !== null) {
            console.log(`exec error: ${error}`);
            res.status(error.code).send(error);
          }
        }
      );
      yourscript.on("error", function (m) {
        console.log("Parent process received:", m);
      });
      yourscript.on("message", function (m) {
        console.log("Parent process received:", m);
      });

      yourscript.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });
    });
  } catch (error) {
    res.sendStatus(400).send(error);
  }
});

app.listen(PORT, HOST);
console.log(`Running now on http://${HOST}:${PORT}`);
