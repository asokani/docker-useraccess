FROM mainlxc/ubuntu
MAINTAINER Asokani "https://github.com/asokani"

# TODO RUN apt-get update 

ADD useraccess.js /etc/my_init.d/useraccess.js

CMD ["/sbin/my_init"]

# TODO RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
