FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose port 3000
EXPOSE ${PORT}

# Run app
CMD [ "npm", "run", "start" ]
