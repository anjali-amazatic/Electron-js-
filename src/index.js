const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

//SET NEV production
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//added for content sequrity shown on console
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true

//Listen for the app to be ready

app.on("ready", function () {
  //create new window
  mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  //load html window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file",
      slashes: true,
    })
  );
  //Quit app when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  //build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});
//handel create add window
function createAddWindow() {
  //creating new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    title: "Add shopping list",
  });
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file",
      slashes: true,
    })
  );
  //garbage collection handle for addnew window
  addWindow.on("close", function () {
    addWindow = null;
  });
}

//catch item:add using ipcmain
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});


//create menu template
const mainMenuTemplate = [
  {
    label: "file",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Item",
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: "Quit",
        //on ctrl+q pressed closed the window
        accelerator: process.platform == "linux" ? "Ctrl+q" : "Ctrl+A",
        click() {
          app.quit();
        },
      },
    ],
  },
];

//if mac add empty object to menu
if (process.platform === "darwin") {
  mainMenuTemplate.unshift({});
}

//add dev tool if not on production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Dev Tool",
    submenu: [
      {
        label: 'Toggle devTool',
        accelerator: process.platform == "linux" ? "Ctrl+I" : "Command+I",
        click(item, focuseWindow){
            focuseWindow.toggleDevTools();
        }
      },
      {
        role:'reload'
      }
      
    ]
  });
}
