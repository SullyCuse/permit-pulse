FROM apify/actor-node-puppeteer-chrome:22

COPY package*.json ./
RUN npm ci --omit=dev && npm install --no-save pdf-parse@1.1.1

COPY . ./

CMD ["node", "scraper/run-all.js"]
