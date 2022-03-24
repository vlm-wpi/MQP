#!/bin/bash

# Date: Wed Mar 23 14:31:48 2022
# AUTHOR: HEINEMAN

# Gather Data on how behavior is affected by conflict Random Exit Threshold
#
# ONE MORE than number of independent trials to run
NUM_SEEDS=4

START_SEED=1
END_SEED=$((START_SEED+NUM_SEEDS))

# Target the thresholds from 1 to 20 (inclusive)
LOW_THRESH=1
HIGH_THRESH=20

# Where should output go?
OUTPUT=results/ConflictThreshold

# Just timestamp inside file?
echo "Start on `date`" >> $OUTPUT

# Set Up
# ------------------------------------
INPUT_ARGS="--bike=0"
OUTPUT_ARGS="final.total_exit_time"

IDX=$LOW_THRESH
while [ $IDX -le $HIGH_THRESH ]
do
   echo "Running $IDX out of $HIGH_THRESH"

   # Reads: Execute Trial.sh for seed #1 up to $NUM_SEEDS with $INPUT and
   # the thing that changes each time is --conflict1=ChooseDifferentExit-4
   # AND I want designated $OUTPUT
   TARGET="--conflict1=ChooseDifferentExit-$IDX"

   #NOTE: this appends to 'output' so be sure to remove first
   rm -f output
   bash trial.sh $START_SEED $END_SEED $INPUT_ARGS $TARGET $OUTPUT_ARGS
   cat output >> $OUTPUT

   IDX=$((IDX+1))
done

echo "DONE"
