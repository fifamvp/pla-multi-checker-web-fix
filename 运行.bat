@echo off

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%I in ("%SCRIPT_DIR%") do set "FOLDER_NAME=%%~nxI"
@REM echo Folder containing the script: %FOLDER_NAME%

set FULL_COMMAND=python -m %FOLDER_NAME%.main
echo %FULL_COMMAND%
echo(

call cd ..
call %FULL_COMMAND%

pause