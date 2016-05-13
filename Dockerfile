FROM mainlxc/ubuntu
MAINTAINER Asokani "https://github.com/asokani"

# TODO maybe install PPA nodejs
RUN apt-get update 

# startup scripts
RUN mkdir -p /etc/my_init.d

# ssh
RUN rm -f /etc/service/sshd/down

ADD useraccess.sh /etc/my_init.d/useraccess.sh

CMD ["/sbin/my_init"]

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
