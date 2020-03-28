args <- commandArgs(trailingOnly = T);
time <- format(Sys.time(), "%a-%b-%d-%Y-%H-%M-%S")

library(SnapATAC);
x.sp = readRDS(args[1]);

#inputs : cluster.neg.method
#bcv
#test.method

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

idy.ls = lapply(levels(x.sp@cluster), function(cluster_i){
	DARs = findDAR(
		obj=x.sp,
		input.mat=args[3],
		cluster.pos=cluster_i,
		cluster.neg=NULL,
		cluster.neg.method="knn",
		bcv=as.numeric(args[4]),
		test.method="exactTest",
		seed.use=10
		);
	DARs$FDR = p.adjust(DARs$PValue, method="BH");
	idy = which(DARs$FDR < 5e-2 & DARs$logFC > 0);
	if((x=length(idy)) < 2000L){
			PValues = DARs$PValue;
			PValues[DARs$logFC < 0] = 1;
			idy = order(PValues, decreasing=FALSE)[1:2000];
			rm(PValues); # free memory
	}
	idy
  })
names(idy.ls) = levels(x.sp@cluster);
par(mfrow = c(3, 3));
covs = Matrix::rowSums(x.sp@pmat);
for(cluster_i in levels(x.sp@cluster)) {
  print(cluster_i)
  idy = idy.ls[[cluster_i]];
  vals = Matrix::rowSums(x.sp@pmat[, idy]) / covs;
  vals.zscore = (vals - mean(vals)) / sd(vals);
  clusterName <- paste("identifyAllDARs", cluster_i, sep = "-");
  prefix <- paste(time, args[2], clusterName, sep = "_")
  name <- paste(prefix, "pdf", sep = ".");
  name_path <- paste("./output", name, sep = "/");
  cluster <- paste("Cluster", cluster_i, sep = " ");
  plotFeatureSingle(
    obj = x.sp,
    feature.value = vals.zscore,
    method = "tsne",
    main = cluster,
    point.size = 0.1,
    point.shape = 19,
    down.sample = 5000,
    quantiles = c(0.01, 0.99),
        pdf.file.name = name_path,
        pdf.height = 7,
        pdf.width = 7
		);
  }