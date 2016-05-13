#!/bin/bash
cat /etc/secrets/useraccess/passwd >> /etc/passwd
cat /etc/secrets/useraccess/group >> /etc/group
cat /etc/secrets/useraccess/shadow >> /etc/shadow

for dir in `ls -d /etc/secrets/useraccess/*/`; do cp -a $dir /home; done
