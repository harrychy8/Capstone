args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

# Need input for 2 names for 2 motif analysis

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

motifs = runHomer(
	x.sp[,idy.ls[["5"]],"pmat"], 
	mat = "pmat",
	path.to.homer = "/Users/haizhouxi/homer/bin/findMotifsGenome.pl",
	result.dir = "./homer/sample",
	num.cores=5,
	genome = 'mm10',
	motif.length = 10,
	scan.size = 300,
	optimize.count = 2,
	background = 'automatic',
	local.background = FALSE,
	only.known = TRUE,
	only.denovo = FALSE,
	fdr.num = 5,
	cache = 100,
	overwrite = TRUE,
	keep.minimal = FALSE
  );

  #ChromVar
library(chromVAR);
library(motifmatchr);
library(SummarizedExperiment);
library(BSgenome.Mmusculus.UCSC.mm10);
x.sp = makeBinary(x.sp, "pmat");
x.sp@mmat = runChromVAR(
    obj=x.sp,
    input.mat="pmat",
    genome=BSgenome.Mmusculus.UCSC.mm10,
    min.count=10,
    species="Homo sapiens"
  );
motif_i = "MA0497.1_MEF2C";
dat = data.frame(x=x.sp@metaData[,"cluster"], y=x.sp@mmat[,motif_i]);
p1 <- ggplot(dat, aes(x=x, y=y, fill=x)) + 
	theme_classic() +
	geom_violin() + 
	xlab("cluster") +
	ylab("motif enrichment") + 
	ggtitle(motif_i) +
	theme(
		  plot.margin = margin(5,1,5,1, "cm"),
		  axis.text.x = element_text(angle = 90, hjust = 1),
		  axis.ticks.x=element_blank(),
		  legend.position = "none"
   );
name <- paste("example", "motif-",motif_i, "png", sep = ".")
path1 <- paste("./output", name, sep = "/")
motif_i = "MA0660.1_MEF2B";
dat = data.frame(x=x.sp@metaData[,"cluster"], y=x.sp@mmat[,motif_i]);
p2 <- ggplot(dat, aes(x=x, y=y, fill=x)) + 
	theme_classic() +
	geom_violin() + 
	xlab("cluster") +
	ylab("motif enrichment") + 
	ggtitle(motif_i) +
	theme(
		  plot.margin = margin(5,1,5,1, "cm"),
		  axis.text.x = element_text(angle = 90, hjust = 1),
		  axis.ticks.x=element_blank(),
		  legend.position = "none"
   );
name <- paste(args[3], "motif-",motif_i, "png", sep = ".")
path2 <- paste("./output", name, sep = "/")
ggsave(path1)
ggsave(path2)