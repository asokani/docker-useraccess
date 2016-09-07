#!/bin/sh

for file in passwd group shadow ssh/sshd_config
do
  perl -i -0 -pe  "s/\n### GENERATED.*//s" /etc/$file
  echo "\n### GENERATED" >> /etc/$file
  cat /etc/secrets/useraccess/etc/$file >> /etc/$file
done

for dir in `ls -d /etc/secrets/useraccess/home/*/`
do
  cp -a $dir /home; 
done
