@echo off
call tsc || exit
call tsc -p src/workers || exit
call electron . --ignore-gpu-blacklist
