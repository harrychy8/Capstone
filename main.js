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
    primary: "primary",
    dimReduction: "dimReduction",
    plotDimReductPW: "plotDimReductPW",
    GBclustering: "GBclustering",
    visualization: "visualization",
    runViz: "runViz",
    plotViz: "plotViz",
    plotFeatureSingle: "plotFeatureSingle",
    rnaBasedAnnotation: "rnaBasedAnnotation",
    geneBasedAnnotation: "geneBasedAnnotation",
    hereticalClustering: "hereticalClustering",
    identifyPeaks: "identifyPeaks",
    addCellByPeak: "addCellByPeak",
    motifAnalysisHomer: "motifAnalysisHomer",
    motifAnalysisChromVAR: "motifAnalysisChromVAR",
    greatAnalysis: "greatAnalysis",
    createCellByPeak: "createCellByPeak", 
    identifyAllDARs: "identifyAllDARs",
    identifySingleDAR: "identifySingleDAR"
};

let mainWindow;
let dataSetName = 'someName';

// Listen for app to be ready
app.on('ready', function () {
    //Create new window
    mainWindow = new BrowserWindow({
        minWidth: 820,
        minHeight: 700,
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

ipcMain.on('getDataSetName', function (e) {
    e.reply('getDataSetName:reply', dataSetName);
});

ipcMain.on('updateDataSetName', function (e, name) {
    dataSetName = name;
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
    let child = runR('./Rscripts/primary.R', [snap, csv, name, blacklist], e, STEPS.primary);
    onExit(child, STEPS.primary, e);
});

ipcMain.on('dimReduction', function (e, snap) {
    let child = runR('./Rscripts/dimReduction.R', [snap], e, STEPS.dimReduction);
    onExit(child, STEPS.dimReduction, e);
});

ipcMain.on('plotDimReductPW', function (e, name, snap) {
    let child = runR('./Rscripts/plotDimReductPW.R', [name, snap], e, STEPS.plotDimReductPW);
    onExit(child, STEPS.plotDimReductPW, e);
});

ipcMain.on('GBclustering', function (e, snap) {
    console.log(snap);
    let child = runR('./Rscripts/GBclustering.R', [snap], e, STEPS.GBclustering);
    onExit(child, STEPS.GBclustering, e);
});

ipcMain.on('visualization', function (e, name, snap) {
    let child = runR('./Rscripts/visualization.R', [name, snap], e, STEPS.visualization);
    onExit(child, STEPS.visualization, e);
});

ipcMain.on('runViz', function (e, snap, method) {
    let child = runR('./Rscripts/runViz.R', [snap, method], e, STEPS.runViz);
    onExit(child, STEPS.runViz, e);
});

ipcMain.on('plotViz', function (e, name, snap, method) {
    let child = runR('./Rscripts/plotViz.R', [snap, name, method], e, STEPS.plotViz);
    onExit(child, STEPS.plotViz, e);
});

ipcMain.on('plotFeatureSingle', function (e, name, snap, method) {
    let child = runR('./Rscripts/plotFeatureSingle.R', [snap, name, method], e, STEPS.plotFeatureSingle);
    onExit(child, STEPS.plotFeatureSingle, e);
});

ipcMain.on('geneBasedAnnotation', function (e, snap, table) {
    let child = runR('./Rscripts/geneBasedAnnotation.R', [snap, table], e, STEPS.geneBasedAnnotation);
    onExit(child, STEPS.geneBasedAnnotation, e);
});

ipcMain.on('rnaBasedAnnotation', function (e, snap, table) {
    let child = runR('./Rscripts/rnaBasedAnnotation.R', [snap, table], e, STEPS.rnaBasedAnnotation);
    onExit(child, STEPS.rnaBasedAnnotation, e);
});

ipcMain.on('hereticalClustering', function (e, name, snap) {
    let child = runR('./Rscripts/hereticalClustering.R', [snap, name], e, STEPS.hereticalClustering);
    onExit(child, STEPS.hereticalClustering, e);
});

ipcMain.on('identifyPeaks', function (e, snap) {
    let child = runR('./Rscripts/identifyPeaks.R', [snap], e, STEPS.identifyPeaks);
    onExit(child, STEPS.identifyPeaks, e);
});

ipcMain.on('addCellByPeak', function (e, snap) {
    let child = runR('./Rscripts/addCellByPeak.R', [snap], e, STEPS.addCellByPeak);
    onExit(child, STEPS.addCellByPeak, e);
});

ipcMain.on('identifySingleDAR', function (e, name, snap, clusterNum, inputMat, bcv) {
    console.log("entered single DAR");
    let child = runR('./Rscripts/identifySingleDAR.R', [snap, name, inputMat, clusterNum, bcv], e, STEPS.identifySingleDAR);
    onExit(child, STEPS.identifySingleDAR, e);
});

ipcMain.on('identifyAllDARs', function (e, name, snap, inputMat, bcv) {
    let child = runR('./Rscripts/identifyAllDARs.R', [snap, name, inputMat, bcv], e, STEPS.identifyAllDARs);
    onExit(child, STEPS.identifyAllDARs, e);
});

ipcMain.on('motifAnalysisHomer', function (e, snap, inputMat, bcv, pathToHomer) {
    let child = runR('./Rscripts/motifAnalysisHomer.R', [snap, inputMat, bcv, pathToHomer], e, STEPS.motifAnalysisHomer);
    onExit(child, STEPS.motifAnalysisHomer, e);
});

ipcMain.on('motifAnalysisChromVAR', function (e, snap, inputMat, motif1, motif2) {
    console.log("Gets to caller in main");
    let child = runR('./Rscripts/motifAnalysisChromVAR.R', [snap, inputMat, motif1, motif2], e, STEPS.motifAnalysisChromVAR);
    onExit(child, STEPS.motifAnalysisChromVAR, e);
});

ipcMain.on('greatAnalysis', function (e, snap) {
    let child = runR('./Rscripts/greatAnalysis.R', [snap], e, STEPS.greatAnalysis);
    onExit(child, STEPS.greatAnalysis, e);
});

ipcMain.on('createCellByPeak', function (e, snap, peak_combined) {
    console.log(snap);
    let del = snapDelete(snap);
    del.on('exit', function (code) {
        let message = code ? 'Delete Failure' : 'Delete Success';
        if (code === 0){
            let child = createCellByPeak(snap, peak_combined);
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
        '--input-fastq1=' + fastq1,
        '--input-fastq2=' + fastq2,
        '--output-bam=./tmp/' + fastq1 + fastq2 + '.bam',
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
        '--input-file=./tmp/' + fastq1 + fastq2 + '.bam',
        '--output-snap=' + snap + '.snap',
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

function createPDFWindow(){
    plotWindow = new PDFWindow({
        useContentSize: true
    });
    return plotWindow;
}

function createPNGWindow(){
    plotWindow = new BrowserWindow({
        useContentSize: true
    });
    return plotWindow;
}

function findFileName(directory, substring){
    var fs = require('fs');
    var files = fs.readdirSync(directory);
    let latest;
    files.forEach(filename=>{
        // console.log(filename);
        if (filename.indexOf(substring) != -1){
            const stat = fs.lstatSync(path.join(directory, filename));
            if (!latest) {
                latest = {filename, mtime: stat.mtime};
            }
            if (stat.mtime > latest.mtime) {
                latest.filename = filename;
                latest.mtime = stat.mtime;
              }
        }
    });
    return latest.filename;
}

function loadWindow(plot, filename){
    plot.loadURL(url.format({
        pathname: filename,
        protocol: 'file:',
        slashes: true
    }));
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

            const output_path = __dirname + "/output/";
            console.log(output_path);

            switch(step_name){
                case STEPS.primary:
                    plot1 = createPNGWindow();
                    plot2 = createPNGWindow();
                    filename1 = findFileName("output", "barcodeSelection");
                    filename2 = findFileName("output", "histogram");
                    loadWindow(plot1, output_path + filename1);
                    loadWindow(plot2, output_path+ filename2);
                    break;
                case STEPS.plotDimReductPW:
                    plot = createPDFWindow();
                    filename = findFileName("output", "plotDimReductPW");
                    loadWindow(plot, output_path+ filename);
                    break;
                case STEPS.plotViz:
                    plot = createPDFWindow();
                    filename = findFileName("output", "plotViz");
                    loadWindow(plot, output_path+ filename);
                    break;
                case STEPS.plotFeatureSingle:
                    plot = createPDFWindow();
                    filename = findFileName("output", "plotFeatureSingle");
                    loadWindow(plot, output_path+ filename);
                    break;
                case STEPS.identifySingleDAR:
                    plot = createPDFWindow();
                    filename = findFileName("output", "identifySingleDAR");
                    loadWindow(plot, output_path+ filename);
                    break;
                case STEPS.identifyAllDARs:
                    plot = createPDFWindow();
                    filename = findFileName("output", "identifyAllDARs");
                    loadWindow(plot, output_path+ filename);
                    break;
                case STEPS.hereticalClustering:
                    plot = createPDFWindow();
                    filename = findFileName("output", "hereticalClustering");
                    loadWindow(plot, output_path+ filename);
                    break;

                default: 
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
            },
            {
                role: 'reload'
            },
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Snap-ATAC Github',
                click: async () => {
                    const {shell} = require('electron');
                    await shell.openExternal('https://github.com/r3fang/SnapATAC')
                }
            },
            {
                label: 'How to use the app',
                click: async () => {
                    const {shell} = require('electron');
                    await shell.openExternal('https://github.com/harrychy8/Capstone')
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