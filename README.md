# Samsung Health Stack Web Portal

## The Web Portal

The web portal is a customizable dashboard for interactive data visualization. Managers of studies use the portal to:

- Manage research team members.
- Create and deploy app content (for example, participant surveys)
- Track study participant activity
- Analyze participant data

The Health Stack also includes the following:

-  A backend system consisting of services and a data engine available through application programming interface (API) endpoints
-  A software development kit (SDK) for app development

Refer to <a href="https://developer.samsung.com/health/stack" target="_blank">Samsung Developer Portal</a> for documentation, or jump directly to:
- The <a href="https://developer.samsung.com/health/stack/developer-guide/installation/install-backend.html" target="_blank">backend system installation instructions</a>
- The <a href="https://developer.samsung.com/health/stack/developer-guide/installation/install-sdk.html" target="_blank">app SDK installation instructions</a>
- The <a href="https://developer.samsung.com/health/stack/developer-guide/installation/install-portal.html" target="_blank">web portal installation instructions</a>

Follow these instructions to install, build, and verify the web portal.

> This installation requires successful prior completion of the backend system installation.

# I. (Optional) Create Development Environment

>  Completing the steps in this section are only necessary if you intend to make changes to the source code.

1. Set up and install NodeJS version 16.15.0 or higher using the instructions at [https://nodejs.org/en/download/](https://nodejs.org/en/download/){:target="_blank"}

2. Set up the Yarn package manager:
   1. Run `corepack enable` to activate Yarn.

   2. Run `yarn` to install dependencies.

   3. Run `yarn dev` to start the yarn development server.


# II. Build Production Environment

1. Determine your URLs.

   | Variable    | Description                                                  | Default value |
   | ----------- | ------------------------------------------------------------ | ------------- |
   | API_URL     | Base API URL to access endpoints.                            |               |
   | PUBLIC_PATH | Path will be used to host the app. For example, to host the frontend on [https://example.com/open-source/portal](https://example.com/open-source/portal){:target="_blank"} it should be set to '/open-source/portal'. | /             |

2. Build `Dockerfile` with desired variables provided as build arguments. For example,

   ```
   docker build . \
       -t open-source-portal \
       --build-arg API_URL='https://example.com' \
       --build-arg PUBLIC_PATH='/portal'
   ```

   The resulting Docker image runs nginx on port `80`.

> If you'd prefer to build static files instead of using Docker:
>
> 1. Install NodeJS version 16.15.0 or higher.
> 2. Run `corepack enable` to activate yarn.
> 3. Run `yarn` to install dependencies.
> 4. Run `yarn build` with desired variables set using environment. For example, `API_URL=https://example.com yarn build`.
>
> The resulting static files will be located in the `/build` folder and can be hosted using any web server.

# III. Launch Web Portal and Create Account

> As of this writing, Chrome is the only browser supported for accessing the web portal.

1. Navigate to your `PUBLIC_PATH` URL.
2. In the **Sign in** dialog box that appears, click **Create account**.
3. Follow the prompts to generate an account activation email.
4. Open the email and complete the account creation and sign in process.

>  If you are the very first person to create an account, the system adds the `Team Admin` [team role](https://developer.samsung.com/health/stack/portal-guide/study-management/role-based-access-control.html) to your account settings. Because this role has advanced access privileges to the Samsung Health Stack, we recommend that your system administrator creates the first account.
