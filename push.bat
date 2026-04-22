@echo off
cd /d C:\temp\crew-portal
git init
git add .
git commit -m "Follett Outdoors Crew Portal - initial deploy"
git branch -M main
git remote add origin https://github.com/nfollett7/crew-portal.git
git push -u origin main --force
echo DONE
