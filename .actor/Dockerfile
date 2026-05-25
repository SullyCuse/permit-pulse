FROM apify/actor-node:22

COPY package*.json ./
RUN npm ci --omit=dev
RUN node -e "require('pdf-parse'); console.log('pdf-parse OK')"

COPY . ./

CMD ["node", "scraper/run-all.js"]
