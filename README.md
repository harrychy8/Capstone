# Welcome to Snap-ATAC App
A desktop application using Electron. SnapATAC (Single Nucleus Analysis Pipeline for ATAC-seq) is a fast, accurate and comprehensive method for analyzing single cell ATAC-seq datasets. This application runs on contributions made by R. Fang et al (https://github.com/r3fang/SnapATAC).

# Installation Instructions
### System Requirements
- Linux/Unix
- Python (>= 2.7 & < 3.0) (SnapTools) (highly recommanded for 2.7);
- R (>= 3.4.0 & < 3.6.0) (SnapATAC) (3.6 does not work for rhdf5 package);

### Library Requirements
SnapATAC requires many dependencies from package managers and repositories such as pip (or pip3, you may need to try both), Bioconductor, CRAN, and Conda. Please ensure you have at least (but not limited to) the following, as well as their dependencies (links will help you get started with the installation process which may be different for your environment):
- **snaptools**:
From command line, run ```$ pip install snaptools``` If you do not have pip, please consult https://pip.pypa.io/en/stable/installing/

- **SnapATAC**:
From command line, run
  ```
  $ R
  > library(devtools)
  > install_github("r3fang/SnapATAC")
  ```
  
- **viridisLite**: Please consult https://cran.r-project.org/web/packages/viridisLite/index.html

- **ggplot2**: Please consult https://cran.r-project.org/web/packages/ggplot2/index.html

- **GenomicRanges**: Open an R console from command line by entering ```R```, and copy the following into the R console:
    ```
    if (!requireNamespace("BiocManager", quietly = TRUE))
        install.packages("BiocManager")

    BiocManager::install("GenomicRanges")
    ```
    For more info and if this does not work, please consult https://bioconductor.org/packages/release/bioc/html/GenomicRanges.html
    
- **chromVAR**: Open an R console from command line by entering ```R```, and copy the following into the R console:
    ```
    if (!requireNamespace("BiocManager", quietly = TRUE))
    install.packages("BiocManager")

    BiocManager::install("chromVAR")
    ```
    For more info and if this does not work, please consult http://bioconductor.org/packages/release/bioc/html/chromVAR.html
    
- **motifmatchr**: Open an R console from command line by entering ```R```, and copy the following into the R console:
    ```
    if (!requireNamespace("BiocManager", quietly = TRUE))
    install.packages("BiocManager")

    BiocManager::install("motifmatchr")
    ```
    For more info and if this does not work, please consult https://www.bioconductor.org/packages/release/bioc/html/motifmatchr.html
    
- **SummarizedExperiment**: Open an R console from command line by entering ```R```, and copy the following into the R console:
    ```
    if (!requireNamespace("BiocManager", quietly = TRUE))
    install.packages("BiocManager")

    BiocManager::install("SummarizedExperiment")
    ```
    For more info and if this does not work, please consult https://bioconductor.org/packages/release/bioc/html/SummarizedExperiment.html
    
- **rGREAT**: Open an R console from command line by entering ```R```, and copy the following into the R console:
    ```
    if (!requireNamespace("BiocManager", quietly = TRUE))
    install.packages("BiocManager")

    BiocManager::install("rGREAT")
    ```
    For more info and if this does not work, please consult https://bioconductor.org/packages/release/bioc/html/rGREAT.html
    
- **macs2**: rom command line, run ```$ pip install macs2``` If you do not have pip, please consult https://pip.pypa.io/en/stable/installing/

If there are other libraries missing or outstanding issues, please check the original SnapATAC github which has solutions to common issues: https://github.com/r3fang/SnapATAC

### FastQ > Snap Requirements
There is a required folder that is too large which is necessary for snaptools to run for the fastq > snap step. It contains the bwa aligner as well as the necessary mm.fa file. Please follow the following:
1. download compressed file from ```https://drive.google.com/open?id=1rskS6Ol6qAyrqOKs9R-lP_v2N-2iPk3q```

2. untar it into the repo folder using ```tar -zxvf required.tar.gz```

3. cd into the created required directory, and unzip the mm.fa.gz file using ```gunzip mm10.fa.gz```

### Start the application
While there were plans to package this in an executable, for now please clone this repo and in terminal, navigate to the directory of the repo and run ```npm start```
