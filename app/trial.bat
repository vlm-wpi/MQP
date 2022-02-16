@echo off
@REM launch nodeApp for a 100 trials
@REM  
@REM appends lines of output to 'output'

@REM launch for range
set LO=%1
set HI=%2

for /L %%a in (%LO%,1,%HI%) Do (
  echo trial %%a
  node nodeApp.js %%a >> output
)

echo "done"
