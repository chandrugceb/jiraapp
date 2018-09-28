##STAGE 1: Building Angular Application##
FROM node:8 as builder
COPY . /jiraappclient
WORKDIR /jiraappclient
RUN npm install
RUN $(npm bin)/ng build --prod --build-optimizer
 
## STAGE 2: Run nginx to serve Application##
FROM nginx:1.11-alpine
COPY --from=builder /jiraappclient/dist/* /usr/share/nginx/html/
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]