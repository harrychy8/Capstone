#Step 0. Data download
#In this example, we will skip the snap generation (See here for how to generate a snap file).
#Instead, we will download the snap file. The downloaded snap file already contains the 
#cell-by-bin/cell-by-peak matrix.

#system("wget http://renlab.sdsc.edu/r3fang/share/github/Mouse_Brain_10X/atac_v1_adult_brain_fresh_5k.snap")
#system("wget http://renlab.sdsc.edu/r3fang/share/github/Mouse_Brain_10X/atac_v1_adult_brain_fresh_5k_singlecell.csv")ls

args <- commandArgs(trailingOnly=T)
fileConn<-file("output.txt")
writeLines(c("Hello", args), fileConn)
close(fileConn)
