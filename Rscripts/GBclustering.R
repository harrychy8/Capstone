args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

x.sp = runKNN(
  obj = x.sp,
  eigs.dims = 1:20,
  k = 15
);
x.sp = runCluster(
  obj = x.sp,
  tmp.folder = tempdir(),
  louvain.lib = "R-igraph",
  seed.use = 10
);

x.sp@metaData$cluster = x.sp@cluster;

saveRDS(x.sp, "./data/snap.rds")
