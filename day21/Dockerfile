FROM node:17-slim
COPY . .
RUN yarn install
RUN yarn tsc

CMD node ./build/index.js
