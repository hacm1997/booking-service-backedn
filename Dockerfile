FROM node:18-alpine3.15

COPY package.json .

COPY tsconfig.json .

RUN npm install -g npm@latest --quiet

RUN npm i --quiet

COPY . .

COPY production.env .

RUN npm run build::prod

COPY dist .

RUN npm install pm2 -g

CMD ["pm2-runtime", "npm run prod"]

EXPOSE 8080
