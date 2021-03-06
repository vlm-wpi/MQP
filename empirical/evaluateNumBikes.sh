#!/bin/bash

# Date: Sun Apr 3 2022
# AUTHOR: MIRECKI

# Gather Data on how behavior is affected by different number of adults with backpacks in Fuller Lower
#
# ONE MORE than number of independent trials to run
NUM_SEEDS=3501

START_SEED=97000
END_SEED=$((START_SEED+NUM_SEEDS))

# Target the number of adults with backpack from 20 to 200 (inclusive)
LOW_THRESH=0
HIGH_THRESH=10

# Where should output go?
OUTPUT=output14

# Just timestamp inside file?
# echo "Start on `date`" >> $OUTPUT

# Set Up
# ------------------------------------
INPUT_ARGS="--width=100 --height=100 --c=25 --a=25 --abp=25 --heuristic=diagonal --layout=FullerLower --conflict1=ChooseRandomMove-3 --conflict2=ChooseDifferentExit-6 --conflict3=takeOthersIntoAccount-9 --conflict4=NullConflictStrategy-12 --output=output14"
OUTPUT_ARGS="data.max data.width_i data.width_ii final.total_exit_time final.avg_exit_time final.avg_collisions_total final.total_avg_occ_all_time final.total_eval final.evaluation_metric final.deadlock"

IDX=$LOW_THRESH
while [ $IDX -le $HIGH_THRESH ]
do
   echo "Running $IDX out of $HIGH_THRESH"

   # Reads: Execute Trial.sh for seed #1 up to $NUM_SEEDS with $INPUT and
   # the thing that changes each time is --apb
   # AND I want designated $OUTPUT
   TARGET="--ab=$IDX"

   #NOTE: this appends to 'output' so be sure to remove first
   rm -f output
   bash trial.sh $START_SEED $END_SEED $INPUT_ARGS $TARGET $OUTPUT_ARGS
   cat output >> $OUTPUT

   IDX=$((IDX+1))
done

echo "DONE"
