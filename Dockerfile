FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY GUI/package*.json ./GUI/
RUN cd GUI && npm ci
COPY GUI ./GUI
RUN cd GUI && npm run build

COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm","--prefix","server","start"]
