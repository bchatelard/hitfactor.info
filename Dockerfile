FROM node:20.11
WORKDIR /
COPY . .
RUN npm ci --loglevel=verbose                                                                                                                                                                     13.0s
EXPOSE 3000
CMD ["npm", "run", "prod"]
