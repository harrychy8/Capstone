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

plotDimReductPW(
  obj = x.sp,
  eigs.dims = 1:50,
  point.size = 0.3,
  point.color = "grey",
  point.shape = 19,
  point.alpha = 0.6,
  down.sample = 5000,
  pdf.file.name = path,
  pdf.height = 7,
  pdf.width = 7
);
