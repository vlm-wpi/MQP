#!/bin/bash

# HOME where code resides is in the app/ directory
APP=../app/nodeApp.js

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
   node $APP --seed=$LO $@ >> output
   LO=$((LO+1))
done
