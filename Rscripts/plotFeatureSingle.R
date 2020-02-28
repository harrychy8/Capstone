args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])
name <- paste(args[2], "plotFeatureSingle", "pdf", sep = ".")
path <- paste("./output", name, sep = "/")

plotFeatureSingle(
  obj = x.sp,
  feature.value = log(x.sp@metaData[, "passed_filters"] + 1, 10),
  method = args[3],
  main = args[2],
  point.size = 0.2,
  point.shape = 19,
  down.sample = 10000,
  quantiles = c(0.01, 0.99),
  pdf.file.name = path,
  pdf.height = 7,
  pdf.width = 7
);
