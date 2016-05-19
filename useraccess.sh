#!/bin/sh
cat /etc/useraccess/passwd >> /etc/passwd
cat /etc/useraccess/group >> /etc/group
cat /etc/useraccess/shadow >> /etc/shadow

# remove old rules
perl -i -0 -pe  "s/### MATCH USERS.*//s" /etc/ssh/sshd_config
# sshd rules
echo "### MATCH USERS" >> /etc/ssh/sshd_config
cat /etc/useraccess/sshd_config >> /etc/ssh/sshd_config

for dir in `ls -d /etc/useraccess/*/`
do
  cp -a $dir /home; 
done
