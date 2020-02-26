args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

DARs = findDAR(
    obj=x.sp,
    input.mat="pmat",
    cluster.pos=2,
    cluster.neg.method="knn",
    test.method="exactTest",
    bcv=0.1, #0.4 for human, 0.1 for mouse
    seed.use=10
  );
DARs$FDR = p.adjust(DARs$PValue, method="BH");
idy = which(DARs$FDR < 5e-2 & DARs$logFC > 0);
par(mfrow = c(1, 2));
plot(DARs$logCPM, DARs$logFC, 
    pch=19, cex=0.1, col="grey", 
    ylab="logFC", xlab="logCPM",
    main="Cluster 26"
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
plotFeatureSingle(
    obj=x.sp,
    feature.value=vals.zscore,
    method="tsne", 
    main="Cluster 26",
    point.size=0.1, 
    point.shape=19, 
    down.sample=5000,
    quantiles=c(0.01, 0.99)
  );

idy.ls = lapply(levels(x.sp@cluster), function(cluster_i){
	DARs = findDAR(
		obj=x.sp,
		input.mat="pmat",
		cluster.pos=cluster_i,
		cluster.neg=NULL,
		cluster.neg.method="knn",
		bcv=0.1,
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
for(cluster_i in levels(x.sp@cluster)){
	print(cluster_i)
	idy = idy.ls[[cluster_i]];
	vals = Matrix::rowSums(x.sp@pmat[,idy]) / covs;
	vals.zscore = (vals - mean(vals)) / sd(vals);
	plotFeatureSingle(
		obj=x.sp,
		feature.value=vals.zscore,
		method="tsne", 
		main=cluster_i,
		point.size=0.1, 
		point.shape=19, 
		down.sample=5000,
		quantiles=c(0.01, 0.99)
		);
  }