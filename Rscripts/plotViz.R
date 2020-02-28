args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

name <- paste(args[2], "plotViz", "pdf", sep = ".")
path <- paste("./output", name, sep = "/")

plotViz(
  obj = x.sp,
  method = args[3],
  main = args[2],
  point.color = x.sp@cluster,
  point.size = 1,
  point.shape = 19,
  point.alpha = 0.8,
  text.add = TRUE,
  text.size = 1.5,
  text.color = "black",
  text.halo.add = TRUE,
  text.halo.color = "white",
  text.halo.width = 0.2,
  down.sample = 10000,
  legend.add = TRUE,
  pdf.file.name = path,
  pdf.height = 7,
  pdf.width = 7
);