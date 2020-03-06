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

const STEPS = {
    primary : "primary",
    dimReduction : "dimReduction",
    plotDimReductPW : "plotDimReductPW",
    GBclustering  :"GBclustering",
    visualization : "visualization",
    runViz : "runViz",
    plotViz : "plotViz",
    plotFeatureSingle: "plotFeatureSingle",
    rnaBasedAnnotation: "rnaBasedAnnotation",
    geneBasedAnnotation : "geneBasedAnnotation",
    hereticalClustering: "hereticalClustering",
    identifyPeaks: "identifyPeaks",
    addCellByPeak: "addCellByPeak",
    motifAnalysis: "motifAnalysis",
    greatAnalysis: "greatAnalysis",
    createCellByPeak: "createCellByPeak", 
    identifyDARs: "identifyDARs"
}

let mainWindow;

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

//catch fastq > snap
ipcMain.on('snaptools', function (e, fastq1, fastq2, snap, indexgenome) {
    console.log(e + fastq1 + fastq2 + snap + indexgenome);
    if (indexgenome) {
        let child = indexGenome();
            child.on('exit', function (code) {
            console.log("executing next process");
            let child = createBam(fastq1, fastq2);
            child.on('exit', function (code) {
                console.log("executing next process");
                let child = createSnap(snap, fastq1, fastq2);
                child.on('exit', function (code) {
                    e.reply('snaptools:reply');
                });
            });
        });
    }
    else {
        let child = createBam(fastq1, fastq2);
        child.on('exit', function (code) {
            console.log("executing next process");
            let child = createSnap(snap, fastq1, fastq2);
            child.on('exit', function (code) {
                e.reply('snaptools:reply');
            });
        });
    }
});

ipcMain.on('primary', function (e, name, snap, csv, blacklist) {
    let child = runR('./Rscripts/primary.R', ["./data/" + snap, "./data/" + csv, name, "./data/" + blacklist], e, STEPS.primary);
    onExit(child, STEPS.primary, e);
});

ipcMain.on('dimReduction', function (e, snap) {
    let child = runR('./Rscripts/dimReduction.R', ["./data/" + snap], e, STEPS.dimReduction);
    onExit(child, STEPS.dimReduction, e);
});

ipcMain.on('plotDimReductPW', function (e, name, snap) {
    let child = runR('./Rscripts/plotDimReductPW.R', [name, "./data/" + snap],e, STEPS.plotDimReductPW);
    onExit(child, STEPS.plotDimReductPW, e);
});

ipcMain.on('GBclustering', function (e, snap) {
    console.log(snap);
    let child = runR('./Rscripts/GBclustering.R', ["./data/" + snap], e, STEPS.GBclustering);
    onExit(child, STEPS.GBclustering, e);
});

ipcMain.on('visualization', function (e, name, snap) {
    let child = runR('./Rscripts/visualization.R', [name, "./data/" + snap], e, STEPS.visualization);
    onExit(child, STEPS.visualization, e);
});

ipcMain.on('geneBasedAnnotation', function (e, name, snap, gene) {
    let child = runR('./Rscripts/geneBasedAnnotation.R', [name, "./data/" + snap, gene], e, STEPS.geneBasedAnnotation);
    onExit(child, STEPS.geneBasedAnnotation, e);
});

ipcMain.on('runViz', function (e, snap, method) {
    let child = runR('./Rscripts/runViz.R', ["./data/" + snap, method], e, STEPS.runViz);
    onExit(child, STEPS.runViz, e);
});

ipcMain.on('plotViz', function (e, name, snap, method) {
    let child = runR('./Rscripts/plotViz.R', ["./data/" + snap, name, method], e, STEPS.plotViz);
    onExit(child, STEPS.plotViz, e);
});

ipcMain.on('plotFeatureSingle', function (e, name, snap, method) {
    let child = runR('./Rscripts/plotFeatureSingle.R', ["./data/" + snap, name, method], e, STEPS.plotFeatureSingle);
    onExit(child, STEPS.plotFeatureSingle, e);
});

ipcMain.on('geneBasedAnnotation', function (e, snap, table) {
    let child = runR('./Rscripts/geneBasedAnnotation.R', ["./data/" + snap, "./data/" + table], e, STEPS.geneBasedAnnotation);
    onExit(child, STEPS.geneBasedAnnotation, e);
});

ipcMain.on('rnaBasedAnnotation', function (e, snap, table) {
    let child = runR('./Rscripts/rnaBasedAnnotation.R', ["./data/" + snap, "./data/" + table], e, STEPS.rnaBasedAnnotation);
    onExit(child, STEPS.rnaBasedAnnotation, e);
});

ipcMain.on('hereticalClustering', function (e, name, snap) {
    let child = runR('./Rscripts/hereticalClustering.R', ["./data/" + snap, name], e, STEPS.hereticalClustering);
    onExit(child, STEPS.hereticalClustering, e);
});

ipcMain.on('identifyPeaks', function (e, snap) {
    let child = runR('./Rscripts/identifyPeaks.R', ["./data/" + snap], e, STEPS.identifyPeaks);
    onExit(child, STEPS.identifyPeaks, e);
});

ipcMain.on('addCellByPeak', function (e, snap) {
    let child = runR('./Rscripts/addCellByPeak.R', ["./data/" + snap], e, STEPS.addCellByPeak);
    onExit(child, STEPS.addCellByPeak, e);
});

ipcMain.on('identifyDARs', function (e, snap) {
    let child = runR('./Rscripts/identifyDARs.R', ["./data/" + snap], e, STEPS.identifyDARs);
    onExit(child, STEPS.identifyDARs, e);
});

ipcMain.on('motifAnalysis', function (e, snap) {
    let child = runR('./Rscripts/motifAnalysis.R', ["./data/" + snap], e, STEPS.motifAnalysis);
    onExit(child, STEPS.motifAnalysis, e);
});

ipcMain.on('greatAnalysis', function (e, snap) {
    let child = runR('./Rscripts/greatAnalysis.R', ["./data/" + snap], e, STEPS.greatAnalysis);
    onExit(child, STEPS.greatAnalysis, e);
});

ipcMain.on('createCellByPeak', function (e, snap, peak_combined) {
    console.log(snap);
    let del = snapDelete("./data/" + snap);
    del.on('exit', function (code) {
        let message = code ? 'Delete Failure' : 'Delete Success';
        if (code === 0){
            let child = createCellByPeak("./data/" + snap, "./data/" + peak_combined);
            onExit(child, STEPS.createCellByPeak, e);
        } else {
            e.reply('createCellByPeak:reply');
            dialog.showMessageBoxSync(mainWindow, {
                type: 'info',
                buttons: [],
                title: 'Result',
                message: 'Process has been completed',
                detail: message,
            })
        }
    });
});

function snapDelete(snap){
    console.log(snap);
    const snap_del = spawn("snaptools", ['snap-del',
        '--snap-file=' + snap, 
        '--session-name=PM']);

    snap_del.on("exit", function (code) {
        console.log('Snap Delete got exit code: ' + code);
    });

    return snap_del;
}

function createCellByPeak(snap, peak_combined) {
    const snap_peak = spawn("snaptools", ['snap-add-pmat',
        '--snap-file=' + snap, 
        '--peak-file='+ peak_combined]);

    snap_peak.on("exit", function (code) {
        console.log('got exit code: ' + code);
    });

    return snap_peak;
}

function indexGenome() {
    const child = spawn("snaptools", ['index-genome',
    '--input-fasta=./required/mm10.fa',
	'--output-prefix=./required/mm10',
    '--aligner=bwa',
	'--path-to-aligner=./required/bwa_aligner/bin/',
	'--num-threads=5']);

    let scriptOutput = "";
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);

        data = data.toString();
        scriptOutput += data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        data = data.toString();
        scriptOutput += data;
    });

    console.log(scriptOutput);

    return child;
}

function createBam(fastq1, fastq2) {
    const child = spawn("snaptools", ['align-paired-end',
	'--input-reference=./required/mm10.fa',
	'--input-fastq1=./data/'+fastq1,
	'--input-fastq2=./data/'+fastq2,
	'--output-bam=./output/'+fastq1+fastq2+'.bam',
	'--aligner=bwa',
	'--path-to-aligner=./required/bwa_aligner/bin/',
	'--read-fastq-command=gzcat',
	'--min-cov=0',
	'--num-threads=5',
	'--if-sort=True',
	'--tmp-folder=./',
    '--overwrite=TRUE']);

    let scriptOutput = "";
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);

        data = data.toString();
        scriptOutput += data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        data = data.toString();
        scriptOutput += data;
    });

    console.log(scriptOutput);

    return child;
}

function createSnap(snap, fastq1, fastq2) {
    const child = spawn("snaptools", ['snap-pre',
	'--input-file=./output/'+fastq1+fastq2+'.bam',
	'--output-snap='+snap+'.snap',
	'--genome-name=mm10',
	'--genome-size=./required/mm10.chrom.size',
	'--min-mapq=30',
	'--min-flen=0',
	'--max-flen=1000',
	'--keep-chrm=TRUE',
	'--keep-single=TRUE',
	'--keep-secondary=False',
	'--overwrite=True',
	'--max-num=1000000',
	'--min-cov=100',
    '--verbose=True']);

    let scriptOutput = "";
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);

        data = data.toString();
        scriptOutput += data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        data = data.toString();
        scriptOutput += data;
    });

    console.log(scriptOutput);

    return child;
}

function onExit(child, step_name, e){
    child.on('exit', function (code) {
        e.reply(step_name + ':reply');
        let message = code ? 'Failure' : 'Success';
        dialog.showMessageBoxSync(mainWindow, {
            type: 'info',
            buttons: [],
            title: 'Result',
            message: 'Process has been completed',
            detail: message,
        })
    });
}

function runR(script, params, event, step_name) {
    let RCall = [script];
    for (let i = 0; i < params.length; i++) {
        RCall.push(params[i]);
    }
    console.log(RCall);
    const R = spawn('Rscript', RCall);

    console.log("Step:" + step_name);

    R.stdout.setEncoding('utf8');
    R.stdout.on('data', function (data) {
        console.log('stdout: ' + data);

        data = data.toString();
        event.reply("console:log", data);
    });

    R.stderr.setEncoding('utf8');
    R.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        data = data.toString();
        event.reply("console:log", data);
    });

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
            console.log(output_path);
            if (step_name === STEPS.primary) {

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

                if (step_name === STEPS.plotDimReductPW || step_name === STEPS.plotViz || step_name === STEPS.plotFeatureSingle) {

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