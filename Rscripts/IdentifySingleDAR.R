args <- commandArgs(trailingOnly = T);
time <- format(Sys.time(), "%a-%b-%d-%Y-%H_%M_%S")

library(SnapATAC);
x.sp = readRDS(args[1]);

if (is.null(x.sp@cluster)){
  # x.sp clusters is empty, need to re run clustering steps
  x.sp = runKNN(
    obj=x.sp,
    eigs.dims=1:20,
    k=15
  );
  x.sp=runCluster(
      obj=x.sp,
      tmp.folder=tempdir(),
      louvain.lib="R-igraph",
      seed.use=10
    );
  x.sp@metaData$cluster = x.sp@cluster;
}

cluster_name <- paste("Cluster", args[4], sep = " ");
name <- paste(time, args[2], "identifySingleDARtsne", cluster_name, "pdf", sep = ".");
path <- paste("./output", name, sep = "/");

# Need Cluster Number as input
# Need file name as input

DARs = findDAR(
  obj = x.sp,
  input.mat = args[3],
  cluster.pos = as.integer(args[4]),
  cluster.neg.method = "knn",
  test.method = "exactTest",
  bcv = as.numeric(args[5]), #0.4 for human, 0.1 for mouse
  seed.use = 10
);
DARs$FDR = p.adjust(DARs$PValue, method = "BH");
idy = which(DARs$FDR < 5e-2 & DARs$logFC > 0);
pdf_name <- paste(time, args[2], "identifySingleDAR", cluster_name, "pdf", sep = ".");
pdf_path <- paste("./output", pdf_name, sep = "/");
pdf(pdf_path);
par(mfrow = c(1, 2));
plot(DARs$logCPM, DARs$logFC,
     pch = 19, cex = 0.1, col = "grey",
     ylab = "logFC", xlab = "logCPM",
     main = cluster_name,
);
points(DARs$logCPM[idy],
       DARs$logFC[idy],
       pch=19,
    cex=0.5, 
    col="red"
  );
abline(h = 0, lwd=1, lty=2);
covs = Matrix::rowSums(x.sp@pmat);
vals = Matrix::rowSums(x.sp@pmat[,idy]) / covs;
vals.zscore = (vals - mean(vals)) / sd(vals);

dev.off()


plotFeatureSingle(
    obj=x.sp,
    feature.value=vals.zscore,
    method="tsne", 
    main=cluster_name,
    point.size = 0.2,
    point.shape = 19,
    down.sample = 10000,
    quantiles = c(0.01, 0.99),
	  pdf.file.name = path,
    pdf.height = 7,
    pdf.width = 7
  );