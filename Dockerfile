# stage1 - build react app first 
FROM node:13-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY app/package.json /app/
RUN yarn --silent
COPY app/. /app
RUN yarn build

# stage 2 - build the final image and copy the react build files
FROM node:13-alpine
WORKDIR /opt/app
COPY server/. /opt/app
COPY --from=build /app/build /opt/app/public
#RUN rm /etc/nginx/conf.d/default.conf
#COPY nginx/nginx.conf /etc/nginx/conf.d
RUN npm install
EXPOSE 9001
CMD ["npm", "start"]