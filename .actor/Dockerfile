FROM apify/actor-node:22

COPY package*.json ./
RUN npm install --omit=dev

COPY . ./

CMD ["node", "scraper/run-all.js"]
