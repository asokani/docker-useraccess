#!/bin/sh
cat /etc/secrets/useraccess/etc/passwd >> /etc/passwd
cat /etc/secrets/useraccess/etc/group >> /etc/group
cat /etc/secrets/useraccess/etc/shadow >> /etc/shadow

# remove old rules
perl -i -0 -pe  "s/### MATCH USERS.*//s" /etc/ssh/sshd_config
# sshd rules
echo "### MATCH USERS" >> /etc/ssh/sshd_config
cat /etc/secrets/useraccess/sshd_config >> /etc/ssh/sshd_config

for dir in `ls -d /etc/secrets/useraccess/home/*/`
do
  cp -a $dir /home; 
done
