@echo off
call tsc || exit
call electron . --ignore-gpu-blacklist
