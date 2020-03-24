args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

# Need input for 2 names for 2 motif analysis
#args1 is snap object
#args2 is input mat
#args3 is bcv
#args4 is path to homer

DARs = findDAR(
  obj = x.sp,
  input.mat = "pmat",
  cluster.pos = 5,
  cluster.neg.method = "knn",
  test.method = "exactTest",
  bcv = 0.1, #0.4 for human, 0.1 for mouse
  seed.use = 10
);
DARs$FDR = p.adjust(DARs$PValue, method = "BH");
idy = which(DARs$FDR < 5e-2 & DARs$logFC > 0);

library(RIPSeeker)
exportGRanges(x.sp@peak, outfile="test.bed", exportFormat="bed")
system("sed \"s/\'//g\" test.bed > temp.bed");
system("sed 's/b//g' temp.bed > test.bed");
# source("https://bioconductor.org/biocLite.R")
# biocLite("genomation")
library(genomation)
x.sp@peak = readBed("test.bed",track.line=FALSE,remove.unusual=FALSE, zero.based= TRUE)

motifs = runHomer(
	x.sp[,idy,"pmat"], 
	mat = "pmat",
	path.to.homer = args[4],
	result.dir = "../output/homer/sample",
	num.cores=5,
	genome = 'mm10',
	motif.length = 10,
	scan.size = 300,
	optimize.count = 2,
	background = 'automatic',
	local.background = FALSE,
	only.known = TRUE,
	only.denovo = FALSE,
	fdr.num = 5,
	cache = 100,
	overwrite = TRUE,
	keep.minimal = FALSE
  );