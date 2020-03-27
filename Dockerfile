FROM node:buster

RUN apt-get update -qqy \
    && apt-get -qqy install \
    dumb-init gnupg wget ca-certificates apt-transport-https \
    ttf-wqy-zenhei \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update -qqy \
    && apt-get -qqy install google-chrome-unstable \
    && rm /etc/apt/sources.list.d/google-chrome.list \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN npm install -g --force typescript

COPY . /app
WORKDIR /app
RUN npm install

CMD [ "npm", "start" ]