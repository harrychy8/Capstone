# Step 1: barcodeSelection
args <- commandArgs(trailingOnly = T)
time <- format(Sys.time(), "%a-%b-%d-%Y-%H-%M-%S")

library(SnapATAC);
x.sp <- createSnap(
  file = args[1],
  sample = "atac_v1_adult_brain_fresh_5k",
  num.cores = 1
);
barcodes <- read.csv(
  args[2],
  head = TRUE
);
barcodes <- barcodes[2:nrow(barcodes),];
promoter_ratio <- (barcodes$promoter_region_fragments + 1) / (barcodes$passed_filters + 1);
UMI <- log(barcodes$passed_filters + 1, 10);
data <- data.frame(UMI = UMI, promoter_ratio = promoter_ratio);
barcodes$promoter_ratio = promoter_ratio;
library(viridisLite);
library(ggplot2);
p1 <- ggplot(
  data,
  aes(x = UMI, y = promoter_ratio)) +
  geom_point(size = 0.1, col = "grey") +
  theme_classic() +
  ggtitle("Fragments in promoter ratio") +
  ylim(0, 1) +
  xlim(0, 6) +
  labs(x = "log10(UMI)", y = "promoter ratio")
prefix <- paste(time, args[3], "barcodeSelection", sep = "_")
name <- paste(prefix, "png", sep = ".")
path <- paste("./output", name, sep = "/")
ggsave(path)

# Step 2-4 Generates Histogram
barcodes.sel = barcodes[which(UMI >= 3 &
                                UMI <= 5 &
                                promoter_ratio >= 0.15 &
                                promoter_ratio <= 0.6),];
rownames(barcodes.sel) = barcodes.sel$barcode;
x.sp = x.sp[which(x.sp@barcode %in% barcodes.sel$barcode),];
x.sp@metaData = barcodes.sel[x.sp@barcode,];

x.sp = addBmatToSnap(x.sp, bin.size = 5000);

x.sp = makeBinary(x.sp, mat = "bmat");

library(GenomicRanges);
black_list = read.table(args[4]);
black_list.gr = GRanges(
  black_list[, 1],
  IRanges(black_list[, 2], black_list[, 3])
);
idy = queryHits(findOverlaps(x.sp@feature, black_list.gr));
if (length(idy) > 0) { x.sp = x.sp[, -idy, mat = "bmat"] };

chr.exclude = seqlevels(x.sp@feature)[grep("random|chrM", seqlevels(x.sp@feature))];
idy = grep(paste(chr.exclude, collapse = "|"), x.sp@feature);
if (length(idy) > 0) { x.sp = x.sp[, -idy, mat = "bmat"] };

bin.cov = log10(Matrix::colSums(x.sp@bmat) + 1);
ggplot(data.frame(x = bin.cov),
       aes(x = bin.cov)) +
  labs(x = "log10(bin cov)") +
  ggtitle("log10(Bin Cov)") +
  xlim(0, 5) +
  geom_histogram(color = "darkblue", fill = "lightblue")

prefix <- paste(time, args[3], "histogram", sep = "_")
name <- paste(prefix, "png", sep = ".")
path <- paste("./output", name, sep = "/")
ggsave(path)
bin.cutoff = quantile(bin.cov[bin.cov > 0], 0.95);
idy = which(bin.cov <= bin.cutoff & bin.cov > 0);
x.sp = x.sp[, idy, mat = "bmat"];
saveRDS(x.sp, "./data/snap.rds")
x.sp