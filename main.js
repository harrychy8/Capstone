const electron = require('electron');
const {dialog} = require('electron');
const url = require('url');
const path = require('path');
const R = require("r-script");
const spawn = require('child_process').spawn;
const PDFWindow = require('electron-pdf-window');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
//process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function () {
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './views/mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Quit app when closed
    mainWindow.on('close', function () {
        app.quit();
    });
    //Build menu from the template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Catch r:step1
ipcMain.on('r:step1', function (e, input) {
    e.reply('r:step1:reply');
});

//Catch Barcode selection
ipcMain.on('barcodeSelection', function (e, name, snap, csv) {
    let child = runR('./Rscripts/barcodeSelection.R', ["./data/" + snap, "./data/" + csv, name]);
    child.on('exit', function () {
        e.reply('barcodeSelection:reply');
    });
});

ipcMain.on('primary', function (e, name, snap, csv, blacklist) {
    let child = runR('./Rscripts/primary.R', ["./data/" + snap, "./data/" + csv, name, "./data/" + blacklist], e);
    child.on('exit', function (code) {
        e.reply('primary:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('dimReduction', function (e, snap) {
    let child = runR('./Rscripts/dimReduction.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('dimReduction:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('plotDimReductPW', function (e, name, snap) {
    let child = runR('./Rscripts/plotDimReductPW.R', [name, "./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('plotDimReductPW:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('GBclustering', function (e, snap) {
    let child = runR('./Rscripts/GBclustering.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('GBclustering:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('visualization', function (e, name, snap) {
    let child = runR('./Rscripts/visualization.R', [name, "./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('visualization:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('geneBasedAnnotation', function (e, name, snap, gene) {
    let child = runR('./Rscripts/geneBasedAnnotation.R', [name, "./data/" + snap, gene]);
    child.on('exit', function (code) {
        e.reply('geneBasedAnnotation:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('runViz', function (e, snap, method) {
    let child = runR('./Rscripts/runViz.R', ["./data/" + snap, method]);
    child.on('exit', function (code) {
        e.reply('runViz:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('plotViz', function (e, name, snap, method) {
    let child = runR('./Rscripts/plotViz.R', ["./data/" + snap, name, method]);
    child.on('exit', function (code) {
        e.reply('plotViz:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('plotFeatureSingle', function (e, name, snap, method) {
    let child = runR('./Rscripts/plotFeatureSingle.R', ["./data/" + snap, name, method]);
    child.on('exit', function (code) {
        e.reply('plotFeatureSingle:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('geneBasedAnnotation', function (e, snap, table) {
    let child = runR('./Rscripts/geneBasedAnnotation.R', ["./data/" + snap, "./data/" + table]);
    child.on('exit', function (code) {
        e.reply('geneBasedAnnotation:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('rnaBasedAnnotation', function (e, snap, table) {
    let child = runR('./Rscripts/rnaBasedAnnotation.R', ["./data/" + snap, "./data/" + table]);
    child.on('exit', function (code) {
        e.reply('rnaBasedAnnotation:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('hereticalClustering', function (e, name, snap) {
    let child = runR('./Rscripts/hereticalClustering.R', ["./data/" + snap, name]);
    child.on('exit', function (code) {
        e.reply('hereticalClustering:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('identifyPeaks', function (e, snap) {
    let child = runR('./Rscripts/identifyPeaks.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('identifyPeaks:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('addCellByPeak', function (e, snap) {
    let child = runR('./Rscripts/addCellByPeak.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('addCellByPeak:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('identifyDARs', function (e, snap) {
    let child = runR('./Rscripts/identifyDARs.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('identifyDARs:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('motifAnalysis', function (e, snap) {
    let child = runR('./Rscripts/motifAnalysis.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('motifAnalysis:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

ipcMain.on('greatAnalysis', function (e, snap) {
    let child = runR('./Rscripts/greatAnalysis.R', ["./data/" + snap]);
    child.on('exit', function (code) {
        e.reply('greatAnalysis:reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
});

function createCellByPeak(snap, peak_combined, event) {
    let snap_call = ["snap-add-pmat"];
    snap_call.push("--snap-file " + snap);
    snap_call.push("--peak-file " + peak_combined);

    console.log(snap_call);
    const snap_peak = spawn("snaptools", snap_call);

    snap_peak.on("exit", function (code) {
        console.log('got exit code: ' + code);
    });

    return snap_peak;
}

function runR(script, params, event) {
    let RCall = [script];
    for (let i = 0; i < params.length; i++) {
        RCall.push(params[i]);
    }
    console.log(RCall);
    const R = spawn('Rscript', RCall);

    const step_name = RCall[0].substring(0, RCall[0].indexOf('.'));
    console.log("Step:" + step_name);

    let scriptOutput = "";

    R.stdout.setEncoding('utf8');
    R.stdout.on('data', function (data) {
        console.log('stdout: ' + data);

        data = data.toString();
        scriptOutput += data;
        event.reply("console:log", data);
    });

    R.stderr.setEncoding('utf8');
    R.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        data = data.toString();
        scriptOutput += data;
        event.reply("console:log", data);
    });

    console.log(scriptOutput);

    R.on('exit', function (code) {
        let filename;
        console.log('got exit code: ' + code);
        let plotWindow;
        let plotWindow2;
        let plotWindow1;
        if (code === 1) {
            // do something special
            console.log("failure")
        } else {
            console.log("success");

            const output_path = __dirname + "/output";
            if (step_name === 'primary') {

                const barcode = "/" + RCall[3] + ".barcodeSelection.png";
                const histogram = "/" + RCall[3] + ".histogram.png";

                console.log("Loading plots...");
                plotWindow1 = new BrowserWindow({
                    useContentSize: true
                });

                plotWindow1.loadURL(url.format({
                    pathname: path.join(output_path, barcode),
                    protocol: 'file:',
                    slashes: true
                }));

                plotWindow2 = new BrowserWindow({
                    useContentSize: true
                });

                plotWindow2.loadURL(url.format({
                    pathname: path.join(output_path, histogram),
                    protocol: 'file:',
                    slashes: true
                }));

            } else {

                if (step_name === 'plotDimReductPW' || step_name === 'plotViz' || step_name === 'plotFeatureSingle') {

                    console.log("Loading plot...");

                    filename = "." + step_name + ".pdf";

                    if (step_name === 'plotDimReductPW') {
                        filename = "/" + RCall[1] + filename;
                    } else {
                        filename = "/" + RCall[2] + filename;
                    }

                    plotWindow = new PDFWindow({
                        useContentSize: true
                    });

                    plotWindow.loadURL(url.format({
                        pathname: path.join(output_path, filename),
                        protocol: 'file:',
                        slashes: true
                    }));

                } else {
                    if (RCall[3] === undefined) {
                        // do nothing;
                    } else {
                        filename = "/" + RCall[3] + "." + step_name;
                        filename = filename + ".png";

                        plotWindow = new BrowserWindow({
                            useContentSize: true
                        });

                        plotWindow.loadURL(url.format({
                            pathname: path.join(output_path, filename),
                            protocol: 'file:',
                            slashes: true
                        }));
                    }
                }

            }
        }
        return null;
    });
    return R;
}

//Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : "Ctrl+Q",
                click() {
                    app.quit();
                }
            }
        ]
    }
];

//If mac, add empty object to menu
if (process.platform === 'darwin') {
    mainMenuTemplate.unshift({label: ''});
}

//Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                accelerator: process.platform === 'darwin' ? 'Command+I' : "Ctrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    })
}