# Node Version 22
FROM node:22 AS build

# Set WORKDIR To App
WORKDIR /app

# Copy Package.json & Files and Run Npm Install and Build
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Use Node as Server
FROM node:22 AS server

# Serve
WORKDIR /app
RUN npm install -g serve

# Copy Build to App
COPY --from=build /app/dist /app

# Expose Port to 3000
EXPOSE 3000

# Start
CMD ["serve", "-s", "/app", "-l", "3000"]
