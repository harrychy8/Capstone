args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])
x.sp = runDiffusionMaps(
  obj = x.sp,
  input.mat = "bmat",
  num.eigs = 50
);

saveRDS(x.sp, "./data/snap.rds")
