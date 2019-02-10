# Object Detection React App

You can find an in depth walkthrough for training a TensorFlow.js model to use in this demo [here](https://cloud-annotations.github.io/training/).

## Setup
`git clone` the repo and `cd` into it by running the following command:

```bash
git clone github.com/cloud-annotations/object-detection-react-app.git &&
cd object-detection-react-app
```

### `npm install`

> **Note: You’ll need to have Node 8.10.0 or later on your local development machine.** You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to easily switch Node versions between different projects.

## Add TensorFlow.js Model to the App
Copy the `model_web` directory and the `labels.json` file generated from the previous steps and paste it into the `public` folder of this new repo.

## Run the App
### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

