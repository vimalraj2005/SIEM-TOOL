# Use a standard Linux environment with Node.js pre-installed
FROM node:20-bookworm-slim

# Install Python 3, Pip, and the standard C++ libraries
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy requirements and install Python dependencies (safely)
COPY requirements.txt ./
RUN pip3 install -r requirements.txt --break-system-packages

# Copy all your code and AI models into the server
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]