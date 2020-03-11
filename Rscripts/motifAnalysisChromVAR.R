args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

#args[1] snap object
#args[2] input material
#args[3] motif 1
#args[4] motif 2

  
  #ChromVar
library(chromVAR);
library(motifmatchr);
library(SummarizedExperiment);
library(BSgenome.Mmusculus.UCSC.mm10);
library(ggplot2);

x.sp = makeBinary(x.sp, "pmat");
x.sp@mmat = runChromVAR(
    obj=x.sp,
    input.mat="bmat",
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
name <- paste("motif1-",motif_i, "png", sep = ".")
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
name <- paste("motif2-",motif_i, "png", sep = ".")
path2 <- paste("./output", name, sep = "/")
ggsave(path1)
ggsave(path2)