args <- commandArgs(trailingOnly = T)
time <- format(Sys.time(), "%a-%b-%d-%Y-%H-%M-%S")

library(SnapATAC);
x.sp = readRDS(args[1])

ensemble.ls = lapply(split(seq(length(x.sp@cluster)), x.sp@cluster), function(x) {
  SnapATAC::colMeans(x.sp[x,], mat = "bmat");
})
# cluster using 1-cor as distance
hc = hclust(as.dist(1 - cor(t(do.call(rbind, ensemble.ls)))), method = "ward.D2");

prefix <- paste(time, args[2], "hereticalClustering", sep = "_")
name <- paste(prefix, "pdf", sep = ".")
path <- paste("./output", name, sep = "/")
pdf(path)
plot(hc, hang = -1, xlab = "");
dev.off()
