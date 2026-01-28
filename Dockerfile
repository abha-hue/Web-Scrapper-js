FROM ghcr.io/puppeteer/puppeteer:21.6.0
WORKDIR /app
USER root
COPY package*.json ./
RUN chown -R pptruser:pptruser /app
USER pptruser
RUN npm install
COPY . .
CMD ["node","index.js"]