@REM launch nodeApp for a 100 trials

echo "Clearing output..."
del output

@REM launch for ten runs...
set M=10

for /L %%a in (1,1,%M%) Do (
  node nodeApp.js %%a >> output
)

echo "done"
