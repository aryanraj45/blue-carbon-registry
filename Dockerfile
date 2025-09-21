# Dockerfile for a TypeScript/Node.js Web Application

# ---- Builder Stage ----
# Use a specific Node.js version for reproducibility
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
# This layer is cached by Docker if package*.json files don't change
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
RUN npm run build

# ---- Production Stage ----
# Use a slim, secure base image for the final container
FROM node:18-alpine AS production

WORKDIR /app

# Copy only the compiled code and production dependencies
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose the port the app runs on
EXPOSE 3000

# The command to start the application
CMD ["node", "dist/main.js"]