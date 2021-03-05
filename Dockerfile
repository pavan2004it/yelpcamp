FROM node:alpine
#Set db connection string
ENV DATABASEURL="mongodb+srv://pavan:fesvym-wutziW-gimgu4@cluster0.lpk8x.mongodb.net/yelp_camp_v13?retryWrites=true&w=majority%"
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]
