args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[2])
x.sp = runDiffusionMaps(
  obj = x.sp,
  input.mat = "bmat",
  num.eigs = 50
);

name <- paste(args[1], "dimReduction", "pdf", sep = ".")
path <- paste("./output", name, sep = "/")
saveRDS(x.sp, "./data/snap.rds")
