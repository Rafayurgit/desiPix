FROM node:18-bullseye

# Install dependencies for libvips (Sharp) with HEIC/AVIF/etc.
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    pkg-config \
    libvips-dev \
    libheif-dev \
    libde265-dev \
    libx265-dev \
    libjpeg-dev \
    libpng-dev \
    libwebp-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working dir
WORKDIR /app

# Copy and install
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

EXPOSE 8080
CMD ["node", "src/server.js"]
