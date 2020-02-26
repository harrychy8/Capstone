args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

x.sp = addPmatToSnap(x.sp);
x.sp = makeBinary(x.sp, mat="pmat");
saveRDS(x.sp, "./data/snap.rds")