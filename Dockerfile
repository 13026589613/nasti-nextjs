FROM node:20.16.0-alpine

WORKDIR /app

COPY package*.json ./
COPY public ./public 
COPY src ./src
COPY Dockerfile ./Dockerfile
COPY next.config.mjs ./next.config.mjs
COPY postcss.config.mjs ./postcss.config.mjs
COPY tailwind.config.ts ./tailwind.config.ts
COPY tsconfig.json ./tsconfig.json
COPY commitlint.config.js ./commitlint.config.js
COPY components.json ./components.json
COPY .eslintrc.json ./.eslintrc.json
COPY .lintstagedrc.js ./.lintstagedrc.js
COPY .prettierrc ./.prettierrc


RUN rm -rf .git

EXPOSE 3000

RUN npm install
RUN npm run build 

CMD npm run start
