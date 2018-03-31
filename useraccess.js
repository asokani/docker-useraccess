#!/usr/bin/node

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const secretsDir = "/etc/secrets/useraccess";

const users = JSON.parse(fs.readFileSync(path.join(secretsDir, "config.json"), 'utf8'));

function mkFullDirSync(dir) {
    var dirs = dir.split("/");
    
    for (var i = 0; i < dirs.length; i++) {
        var current = dirs[i];
        
        if (current !== "") {
            var subdir = dirs.slice(0, i+1).join("/");
            if (!fs.existsSync(subdir)) {
                fs.mkdirSync(subdir);   
            }
        }
    }
}

if (!fs.existsSync("/etc/passwd.old")) {
    childProcess.execSync(`cp /etc/passwd /etc/passwd.old`);
    childProcess.execSync(`cp /etc/group /etc/group.old`);
    childProcess.execSync(`cp /etc/shadow /etc/shadow.old`);
    childProcess.execSync(`cp /etc/ssh/sshd_config /etc/ssh/sshd_config.old`);
} else {
    childProcess.execSync(`cp /etc/passwd.old /etc/passwd`);
    childProcess.execSync(`cp /etc/group.old /etc/group`);
    childProcess.execSync(`cp /etc/shadow.old /etc/shadow`);
    childProcess.execSync(`cp /etc/ssh/sshd_config.old /etc/ssh/sshd_config`);
}

  
for (var i = 0; i < users.length; i++) {
    var user = users[i];

    fs.appendFileSync("/etc/passwd", `${user.username}:x:${5000+i}:${5000+i}:,,,:/home/${user.username}:/bin/bash\n`);
    fs.appendFileSync("/etc/group", `${user.username}:x:${5000+i}:\n`);
    fs.appendFileSync("/etc/shadow", `${user.username}:${user.password}:16000:0:99999:7:::\n`);
    fs.appendFileSync("/etc/ssh/sshd_config", `Match User ${user.username}\n  ForceCommand /usr/bin/ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -q -t ${user.internal}@${user.name} $SSH_ORIGINAL_COMMAND\n`);

    // local homes with .ssh
    var localSSHDir = path.join("/home", user.username, ".ssh");

    mkFullDirSync(localSSHDir);

    if (fs.existsSync(path.join(localSSHDir, "id_rsa"))) {
        fs.unlinkSync(path.join(localSSHDir, "id_rsa"));
        fs.unlinkSync(path.join(localSSHDir, "id_rsa.pub"));
    }
    childProcess.execSync(`ssh-keygen -t rsa -b 2048 -N '' -f ${path.join(localSSHDir, "id_rsa")}`);

    // node homes with authorized_keys
    var nodeSSHDir = path.join(secretsDir, "home", user.name, user.internal);

    mkFullDirSync(nodeSSHDir);

    childProcess.execSync(`cp ${path.join(localSSHDir, "id_rsa.pub")} ${path.join(nodeSSHDir, "authorized_keys")}`);
}