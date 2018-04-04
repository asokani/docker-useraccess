#!/usr/bin/node

const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

const secretsDir = "/etc/secrets/useraccess";
const configDir = "/etc/secrets/_config/useraccess";

const users = JSON.parse(fs.readFileSync(path.join(configDir, "config.json"), "utf8"));

const sshKeyPath = path.join(secretsDir, "ssh_keys");

childProcess.execSync(`
if [ ! -f /etc/passwd.old ]; then
  cp /etc/passwd /etc/passwd.old
  cp /etc/group /etc/group.old
  cp /etc/shadow /etc/shadow.old
  cp /etc/ssh/sshd_config /etc/ssh/sshd_config.old
else
  cp /etc/passwd.old /etc/passwd
  cp /etc/group.old /etc/group
  cp /etc/shadow.old /etc/shadow
  cp /etc/ssh/sshd_config.old /etc/ssh/sshd_config
fi

if [ ! -d ${sshKeyPath} ]; then
  mkdir -p ${sshKeyPath}
  cp /etc/ssh/ssh_host_rsa_key ${path.join(sshKeyPath, "ssh_host_rsa_key")}
  cp /etc/ssh/ssh_host_rsa_key.pub ${path.join(sshKeyPath, "ssh_host_rsa_key.pub")}
else
  cp ${path.join(sshKeyPath, "ssh_host_rsa_key")} /etc/ssh/ssh_host_rsa_key
  cp ${path.join(sshKeyPath, "ssh_host_rsa_key.pub")} /etc/ssh/ssh_host_rsa_key.pub
fi
`, {stdio:[0, 1, 2]});

for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var localSSHDir = path.join("/home", user.username, ".ssh");
    // node homes with authorized_keys
    var nodeSSHDir = path.join(secretsDir, "home", user.name, user.internal);
        
        
    childProcess.execSync(`
      echo "${user.username}:x:${5000 + i}:${5000 + i}:,,,:/home/${user.username}:/bin/bash" >> /etc/passwd
      echo "${user.username}:x:${5000 + i}:" >> /etc/group
      echo "${user.username}:${user.password}:16000:0:99999:7:::" >> /etc/shadow
      echo "Match User ${user.username}" >> /etc/ssh/sshd_config
      echo "ForceCommand /usr/bin/ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -q -t ${user.internal}@${user.name} $SSH_ORIGINAL_COMMAND" >> /etc/ssh/sshd_config

      mkdir -p ${localSSHDir}

      if [ -f ${path.join(localSSHDir, "id_rsa")} ]; then
        rm ${path.join(localSSHDir, "id_rsa")}
        rm ${path.join(localSSHDir, "id_rsa.pub")}
      fi
        
      ssh-keygen -t rsa -b 2048 -N '' -f ${path.join(localSSHDir, "id_rsa")}

      chown ${5000 + i}:${5000 + i} ${localSSHDir} ${path.join(localSSHDir, "id_rsa")} ${path.join(localSSHDir, "id_rsa.pub")}
      chmod 700 ${localSSHDir}
      chmod 600 ${path.join(localSSHDir, "id_rsa")}
      chmod 600 ${path.join(localSSHDir, "id_rsa.pub")}

      mkdir -p ${nodeSSHDir}

      cp ${path.join(localSSHDir, "id_rsa.pub")} ${path.join(nodeSSHDir, "authorized_keys")}
          
      chown ${user.internal}:${user.internal} ${nodeSSHDir} ${path.join(nodeSSHDir, "authorized_keys")}
      chmod 700 ${nodeSSHDir}
      chmod 600 ${path.join(nodeSSHDir, "authorized_keys")}
    `, {stdio:[0, 1, 2]});   

}
