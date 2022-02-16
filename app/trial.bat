@ECHO OFF

@REM launch for range
set LO=%1
set HI=%2

@REM skip over first two and collect all others
@REM -------------------------------------------
SET /a count=0
SET REST=
:Loop
IF "%1"=="" GOTO Continue
   
    @REM skip first two...
    SET /a count=%count%+1
    if %count% LEQ 2 GOTO Skip
    set REST=%REST% %1
:Skip
SHIFT
GOTO Loop
:Continue

echo "Arguments:"
echo %REST%

@REM https://stackoverflow.com/questions/357315/how-to-get-list-of-arguments
for /L %%a in (%LO%,1,%HI%) Do (
  echo trial %%a
  node nodeApp.js --seed=%%a %REST% >> output
)
