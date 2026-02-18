FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY app.js ./

# Expose port
EXPOSE 3000

# Run with --expose-gc flag to allow manual garbage collection
CMD ["node", "--expose-gc", "app.js"]
