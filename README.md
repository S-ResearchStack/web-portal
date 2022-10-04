# open-source-portal-frontend

## Development environment setup

1. Install NodeJS version 16.15.0 or higher.
2. Run `corepack enable` to activate yarn.
3. Run `yarn` to install dependencies.
4. Run `yarn dev` to start development server.

## Production build

### Build variables

| Variable    | Description                                                                                                                                              | Default value |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| API_URL     | Base API url to access endpoints.                                                                                                                        |               |
| PUBLIC_PATH | Path that will be used to host the app. For example to host fronted on https://example.com/open-source/portal it should be set to '/open-source/portal'. | /             |

### [Option 1] Building static files

1. Install NodeJS version 16.15.0 or higher.
2. Run `corepack enable` to activate yarn.
3. Run `yarn` to install dependencies.
4. Run `yarn build` with desired variables set using environment.
   For example `API_URL=https://example.com yarn build`.

Resulting static files will be located in `/build` folder and can be hosted using any web server.

### [Option 2] Docker

1. Build `Dockerfile` with desired variables provided as build args.
   For example `docker build . -t open-source-portal --build-arg API_URL='https://example.com' --build-arg PUBLIC_PATH='/portal'`.
2. Resulting Docker image will run nginx on port `80`.
