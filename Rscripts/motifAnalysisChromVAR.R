args <- commandArgs(trailingOnly = T)
time <- format(Sys.time(), "%a-%b-%d-%Y-%H-%M-%S")

library(SnapATAC);
x.sp = readRDS(args[1])

#args[1] snap object
#args[2] input material
#args[3] motif 1

  
  #ChromVar
library(chromVAR);
library(motifmatchr);
library(SummarizedExperiment);
library(BSgenome.Mmusculus.UCSC.mm10);
library(ggplot2);

x.sp = makeBinary(x.sp, args[2]);
x.sp@mmat = runChromVAR(
    obj=x.sp,
    input.mat=args[2],
    genome=BSgenome.Mmusculus.UCSC.mm10,
    min.count=10,
    species="Homo sapiens"
  );
motif_i = args[3];
dat = data.frame(x=x.sp@metaData[,"cluster"], y=x.sp@mmat[,motif_i]);
p1 <- ggplot(dat, aes(x=x, y=y, fill=x)) + 
	theme_classic() +
	geom_violin() +
	xlab("cluster") +
	ylab("motif enrichment") +
	ggtitle(motif_i) +
	theme(
		plot.margin = margin(5, 1, 5, 1, "cm"),
		axis.text.x = element_text(angle = 90, hjust = 1),
		axis.ticks.x = element_blank(),
		legend.position = "none"
	);
prefix <- paste(time, "motif", motif_i, sep = "-");
name <- paste(prefix, "png", sep = ".")
path1 <- paste("./output", name, sep = "/")

ggsave(path1)