# Use Node.js LTS as base image
FROM node:20-slim

# Install yt-dlp dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --no-cache-dir yt-dlp

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]