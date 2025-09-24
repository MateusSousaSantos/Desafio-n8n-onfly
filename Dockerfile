# Use the official n8n image as base
FROM docker.n8n.io/n8nio/n8n:latest

# Switch to root to create directories
USER root

# Create custom nodes directory with proper permissions
RUN mkdir -p /home/node/.n8n/custom && \
    chown -R node:node /home/node/.n8n

# Switch back to node user
USER node