# 1. Base Image
FROM node:22-alpine

# 2. Correctly set environment variable
ENV NODE_ENV=production

# 3. Set Working Directory
WORKDIR /usr/src/app

# --- Build Cache Optimization starts here ---

# 4. Copy ONLY the package files first
COPY package.json package-lock.json ./

# 5. Install Dependencies (this is now cached unless package.json changes)
# Use --only=production to skip installing devDependencies
RUN npm install --only=production

# --- Cache optimization ends here ---

# 6. Copy ALL remaining source code (this layer frequently rebuilds)
COPY . .

# 7. Expose Port (Optional, but good practice)
EXPOSE 8080

# 8. Start Command: Use the correct command for a production environment
CMD ["npm", "start"]