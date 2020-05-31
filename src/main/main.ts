/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import * as path from "path";
import * as url from "url";
// import NeDB from "nedb";
const glob = require("glob");
const fs = require("fs-extra");
// const db = new NeDB({ filename: "." });
var pathVar = path;

const Datastore = require("nedb");
const db = new Datastore({ filename: pathVar.join(__dirname, "./markit.db") });
db.loadDatabase((err: any) => {
  console.log("loadDatabase.err", err);
});

let mainWindow: Electron.BrowserWindow | null;

function setMainMenu() {
  const template = [
    {
      label: "MarkIt",
      submenu: [
        {
          label: "Preference",
          accelerator: "Shift+CmdOrCtrl+P",
          click() {
            console.log("Preferrence clicked!");
          },
        },
        {
          label: "Quit",
          accelerator: "Shift+CmdOrCtrl+Q",
          click() {
            console.log("Quit clicked!");
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click() {
            console.log("Help clicked");
          },
        },
        {
          label: "About",
          click() {
            console.log("About clicked");
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      webSecurity: false,
      devTools: process.env.NODE_ENV === "production" ? false : true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: pathVar.join(__dirname, "./index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.openDevTools();
  // setMainMenu();

  ipcMain.on("openFiles", (event: any) => {
    var path = dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    // (utl.Util.is(()=> path[0],null)) &&
    glob(path[0] + "/*.md", {}, (er: any, files: any) => {
      //
      const fileList = files.map((item: any) => {
        return {
          path: item,
          name: pathVar.basename(item),
          descr: item,
          meta: [],
        };
      });

      saveFileListToDB(fileList);

      event.sender.send("openFiles", { fileList });
    });
  });

  ipcMain.on("readFile", (event: any, arg: any) => {
    fs.readFile(arg.path, "utf8", (err: any, data: any) => {
      if (err) {
        return console.log("readFile.err", err);
      }
      event.sender.send("readFile", { data });
    });
  });

  ipcMain.on("saveFile", (event: any, arg: any) => {
    console.log("writeFile", arg);
    fs.writeFile(arg.selectedFile.path, arg.fileData, (err: any) => {
      if (err) {
        return console.log("writeFile.err", err);
      }
      event.sender.send("readFile", { message: "File saved!" });
    });
  });

  getFileListFromDB()
    .then((_fileList: any) => {
      // console.log("dbFileList._fileList", _fileList);
      setTimeout(() => {
        const mainWin: any = mainWindow;
        mainWin && mainWin.webContents.send("dbFileList", _fileList[0]);
      }, 1000);
    })
    .catch((err: any) => {
      console.log("dbFileList.err", err);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function saveFileListToDB(fileList: any) {
  const i = {
    id: 1,
    data: fileList,
  };
  db.update({ id: i.id }, i, { upsert: true });
}

function getFileListFromDB() {
  return new Promise((resolve: any, reject: any) => {
    db.find({ id: 1 }, (err: any, docs: any) => {
      if (err) {
        reject(err);
      }
      resolve(docs);
    });
  });
}
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
