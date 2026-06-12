
  # Travel Website Prototype - Testes

  This is a code bundle for Travel Website Prototype - Testes. The original project is available at https://www.figma.com/design/LIrBHCpyyctahuBfwUEY28/Travel-Website-Prototype---Testes.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Running on this computer only

  Run `npm run dev:local` to start the development server on `127.0.0.1`.

  ## Running on the local network

  Run `npm run dev:network` to start the development server on `0.0.0.0:5180`.

  Other computers on the same network can access the site at:

  `http://YOUR_LOCAL_IP:5180/`

  If the site does not open from another computer, allow port `5180` in Windows Firewall.

  ## Deploying to GitHub Pages

  This project is configured to deploy the production build in `dist/` with GitHub Actions.

  1. Push the project to a GitHub repository.
  2. In GitHub, open `Settings` > `Pages`.
  3. Set `Build and deployment` > `Source` to `GitHub Actions`.
  4. Push to the `main` branch or run the workflow manually.

  The workflow sets the Vite `base` path automatically from the repository name.
  
