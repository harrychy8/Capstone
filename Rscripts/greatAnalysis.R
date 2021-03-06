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

library(RIPSeeker)
exportGRanges(x.sp@peak, outfile="test.bed", exportFormat="bed")
system("sed \"s/\'//g\" test.bed > temp.bed");
system("sed 's/b//g' temp.bed > test.bed");
# source("https://bioconductor.org/biocLite.R")
# biocLite("genomation")
library(genomation)
x.sp@peak = readBed("test.bed",track.line=FALSE,remove.unusual=FALSE, zero.based= TRUE)

system("mv *.bed ./temp", intern=TRUE);

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

Sys.sleep(90);

tb = getEnrichmentTables(job);

# lapply(tb, function(df) 
#   saveRDS(tb[[df]], file = paste0("output/",df, ".rds")))

res = plotRegionGeneAssociationGraphs(job)
exportGRanges(res, outfile="output/rGreat.bed", exportFormat="bed")