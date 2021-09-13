@echo off
set /p id="Nome do commit: "
git add *
git commit -m "%id%"
git push origin master
pause