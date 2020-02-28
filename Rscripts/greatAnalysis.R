args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

if (!requireNamespace("BiocManager", quietly=TRUE))
    install.packages("BiocManager")
BiocManager::install("rGREAT")
## or install the latest version
library(devtools)
install_github("jokergoo/rGREAT")

library(rGREAT);
DARs = findDAR(
    obj=x.sp,
    input.mat="pmat",
    cluster.pos=13,
    cluster.neg.method="knn",
    test.method="exactTest",
    bcv=0.1, #0.4 for human, 0.1 for mouse
    seed.use=10
  );
DARs$FDR = p.adjust(DARs$PValue, method="BH");
idy = which(DARs$FDR < 5e-2 & DARs$logFC > 0);
job = submitGreatJob(
    gr                    = x.sp@peak[idy],
    bg                    = NULL,
    species               = "mm10",
    includeCuratedRegDoms = TRUE,
    rule                  = "basalPlusExt",
    adv_upstream          = 5.0,
    adv_downstream        = 1.0,
    adv_span              = 1000.0,
    adv_twoDistance       = 1000.0,
    adv_oneDistance       = 1000.0,
    request_interval = 300,
    max_tries = 10,
    version = "default",
    base_url = "http://great.stanford.edu/public/cgi-bin"
  );
job