FROM node:17-slim
COPY ../day18 .
RUN yarn install
RUN yarn tsc

CMD node ./build/index.js
