args <- commandArgs(trailingOnly = T)

library(SnapATAC);
x.sp = readRDS(args[1])

genes = read.table(args[2]);
genes.gr = GRanges(genes[, 1],
                   IRanges(genes[, 2], genes[, 3]), name = genes[, 4]
);

marker.genes = c(
  "Snap25", "Gad2", "Apoe",
  "C1qb", "Pvalb", "Vip",
  "Sst", "Lamp5", "Slc17a7"
);

genes.sel.gr <- genes.gr[which(genes.gr$name %in% marker.genes)];
# re-add the cell-by-bin matrix to the snap object;
x.sp = addBmatToSnap(x.sp);
x.sp = createGmatFromMat(
  obj = x.sp,
  input.mat = "bmat",
  genes = genes.sel.gr,
  do.par = TRUE,
  num.cores = 10
);
# normalize the cell-by-gene matrix
x.sp = scaleCountMatrix(
  obj = x.sp,
  cov = x.sp@metaData$passed_filters + 1,
  mat = "gmat",
  method = "RPM"
);
# smooth the cell-by-gene matrix
x.sp = runMagic(
  obj = x.sp,
  input.mat = "gmat",
  step.size = 3
);

par(mfrow = c(3, 3));
for (i in 1:9) {
  name <- paste(args[1], "geneBasedAnnotation", marker.genes[i], "pdf", sep = ".")
  path <- paste("./output", name, sep = "/")
  plotFeatureSingle(
    obj = x.sp,
    feature.value = x.sp@gmat[, marker.genes[i]],
    method = "tsne",
    main = marker.genes[i],
    point.size = 0.1,
    point.shape = 19,
    down.sample = 10000,
    quantiles = c(0, 1)
  ) };

saveRDS(x.sp, "./data/snap.rds")

