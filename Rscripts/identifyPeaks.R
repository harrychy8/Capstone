#Step 11: Identify peaks
    # call peaks for all cluster with more than 100 cells
args <- commandArgs(trailingOnly = T)
library(SnapATAC);
library(parallel);
x.sp = readRDS(args[1])

#What do i do about the path to snaptools and path to macs?
#Can I add the table that is generated with peak.gr to save?

    clusters.sel = names(table(x.sp@cluster))[which(table(x.sp@cluster) > 200)];
    peaks.ls = mclapply(seq(clusters.sel), function(i){
    print(clusters.sel[i]);
    runMACS(
        obj=x.sp[which(x.sp@cluster==clusters.sel[i]),], 
        output.prefix=paste0("atac_v1_adult_brain_fresh_5k.", gsub(" ", "_", clusters.sel)[i]),
	      path.to.snaptools="/usr/local/bin/snaptools",
	      path.to.macs="/usr/local/bin/macs2",
        gsize="hs", # mm, hs, etc
        buffer.size=500, 
        num.cores=7,
        macs.options="--nomodel --shift 100 --ext 200 --qval 5e-2 -B --SPMR",
        tmp.folder=tempdir()
   );
 }, mc.cores=4);
# assuming all .narrowPeak files in the current folder are generated from the clusters
peaks.names = system("ls | grep narrowPeak", intern=TRUE);
peak.gr.ls = lapply(peaks.names, function(x){
    peak.df = read.table(x)
    GRanges(peak.df[,1], IRanges(peak.df[,2], peak.df[,3]))
  })
peak.gr = reduce(Reduce(c, peak.gr.ls));

peaks.df = as.data.frame(peak.gr)[,1:3];
write.table(peaks.df,file = "peaks.combined.bed",append=FALSE,
		quote= FALSE,sep="\t", eol = "\n", na = "NA", dec = ".", 
		row.names = FALSE, col.names = FALSE, qmethod = c("escape", "double"),
		fileEncoding = "")
saveRDS(x.sp, "./data/snap.rds")