# Monopoly Game Deployment Guide

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

## Production Build

1. Create production build:
```bash
npm run build:prod
```

2. Start production server:
```bash
npm run start:prod
```

## Docker Deployment

1. Build Docker image:
```bash
docker build -t monopoly-game .
```

2. Run container:
```bash
docker run -p 3000:3000 -d monopoly-game
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Port for the server to listen on |
| NODE_ENV | production | Node environment |

## CI/CD

The project includes GitHub Actions workflows for running tests in `.github/workflows/tests.yml`