FROM node:12-alpine

WORKDIR /app/line-corebot

ADD . /app/line-corebot

RUN npm install

EXPOSE 3030

CMD ["node", "./bin/www"]