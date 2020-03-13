args <- commandArgs(trailingOnly = T)
time <- format(Sys.time(), "%a-%b-%d-%Y-%H-%M-%S")

library(SnapATAC);
x.sp = readRDS(args[2])

prefix <- paste(time, args[1], "plotDimReductPW", sep = "_")
name <- paste(prefix, "pdf", sep = ".")
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

