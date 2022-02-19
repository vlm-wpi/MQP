#!/bin/bash

# launch for range
export LO=$1
export HI=$2

shift
shift

echo "Arguments:"
echo $@

while [ $LO -lt $HI ]
do
   echo trial $LO
   node nodeApp.js --seed=$LO $@ >> output
   LO=$((LO+1))
done
