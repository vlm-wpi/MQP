#!/bin/bash

# Date: Wed Mar 23 14:31:48 2022
# AUTHOR: HEINEMAN

# Gather Data on how behavior is affected by different number of adults with backpacks in a classroom
#
# ONE MORE than number of independent trials to run
NUM_SEEDS=1

START_SEED=76444
END_SEED=$((START_SEED+NUM_SEEDS))

# Target the thresholds from 1 to 50 (inclusive)
LOW_THRESH=1
HIGH_THRESH=20

# Where should output go?
OUTPUT=results

# Just timestamp inside file?
# echo "Start on `date`" >> $OUTPUT

# Set Up
# ------------------------------------
INPUT_ARGS="--width=100 --height=100 --c=25 --a=25 --abp=25 --ab=10 --heuristic=euclidean --layout=Randomized --conflict2=NullConflictStrategy-6 --conflict3=NullConflictStrategy-9 --conflict4=NullConflictStrategy-12 --output=output8_76444"
OUTPUT_ARGS="data.max data.width_i data.width_ii final.total_exit_time final.avg_exit_time final.avg_collisions_total final.total_avg_occ_all_time final.total_eval final.evaluation_metric final.deadlock"

IDX=$LOW_THRESH
while [ $IDX -le $HIGH_THRESH ]
do
   echo "Running $IDX out of $HIGH_THRESH"

   # Reads: Execute Trial.sh for seed #1 up to $NUM_SEEDS with $INPUT and
   # the thing that changes each time is --conflict1=ChooseDifferentExit-4
   # AND I want designated $OUTPUT
   TARGET="--conflict1=ChooseRandomMove-$IDX"

   #NOTE: this appends to 'output' so be sure to remove first
   rm -f output
   bash trial.sh $START_SEED $END_SEED $INPUT_ARGS $TARGET $OUTPUT_ARGS
   cat output >> $OUTPUT

   IDX=$((IDX+1))
done

echo "DONE"
