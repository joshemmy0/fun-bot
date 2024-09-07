# Use Node.js as the base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the app port (if needed)
EXPOSE 3000

# Command to run the bot
CMD [ "node", "index.js" ]
