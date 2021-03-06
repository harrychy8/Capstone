args <- commandArgs(trailingOnly=T)

library(SnapATAC);
x.sp <- createSnap(
  file= args[1],
  sample="atac_v1_adult_brain_fresh_5k",
  num.cores=1
);
barcodes <- read.csv(
  args[2],
  head=TRUE
);
barcodes <- barcodes[2:nrow(barcodes),];
promoter_ratio <- (barcodes$promoter_region_fragments+1) / (barcodes$passed_filters + 1);
UMI <- log(barcodes$passed_filters+1, 10);
data <- data.frame(UMI=UMI, promoter_ratio=promoter_ratio);
barcodes$promoter_ratio = promoter_ratio;
library(viridisLite);
library(ggplot2);
p1 <- ggplot(
  data,
  aes(x = UMI, y = promoter_ratio)) +
  geom_point(size = 0.1, col = "grey") +
  theme_classic() +
  ggtitle(args[3]) +
  ylim(0, 1) +
  xlim(0, 6) +
  labs(x = "log10(UMI)", y = "promoter ratio")
name <- paste(args[3], "barcodeSelection", "png", sep = ".")
path <- paste("./output", name, sep = "/")
ggsave(path)