args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

x.sp = runViz(
  obj = x.sp,
  tmp.folder = tempdir(),
  dims = 2,
  eigs.dims = 1:20,
  method = args[2],
  seed.use = 10
);

saveRDS(x.sp, "./data/snap.rds")
