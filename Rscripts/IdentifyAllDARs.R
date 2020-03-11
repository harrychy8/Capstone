args <- commandArgs(trailingOnly = T);

library(SnapATAC);
x.sp = readRDS(args[1]);

#inputs : cluster.neg.method
#bcv
#test.method

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
for(cluster_i in levels(x.sp@cluster)){
	print(cluster_i)
	idy = idy.ls[[cluster_i]];
	vals = Matrix::rowSums(x.sp@pmat[,idy]) / covs;
	vals.zscore = (vals - mean(vals)) / sd(vals);
  name <- paste(args[2], "identifyAllDARs-", cluster_i, "pdf", sep = ".");
  name_path <- paste("./output", name, sep = "/");
	plotFeatureSingle(
		obj=x.sp,
		feature.value=vals.zscore,
		method="tsne", 
		main=cluster_i,
		point.size=0.1, 
		point.shape=19, 
		down.sample=5000,
		quantiles=c(0.01, 0.99),
        pdf.file.name = name_path,
        pdf.height = 7,
        pdf.width = 7
		);
  }