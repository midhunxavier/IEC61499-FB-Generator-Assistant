# IEC 61499 FB Generator Assistant

## Overview

This application aims to generate IEC 61499 FB integrated with generative UI.

## Getting Started

### Installation

First, clone the repository and install dependencies:

```bash
git clone git@github.com:midhunxavier/IEC61499-FB-Generator-Assistant.git

cd FB-GEN-OPENAI

yarn install
```

Next, if you plan on using the existing pre-built UI components, you'll need to set a few environment variables:

Copy the [`.env.example`](./.env.example) file to `.env`:

The `NEXT_PUBLIC_OPENAI_API_KEY` is required. LangSmith keys are optional, but highly recommended if you plan on developing this application further.

Get your OpenAI API key from the [OpenAI dashboard](https://platform.openai.com/login?launch).

[Sign up/in to LangSmith](https://smith.langchain.com/) and get your API key.

Create a new [GitHub PAT (Personal Access Token)](https://github.com/settings/tokens/new) with the `repo` scope.

```bash
# ------------------LangSmith tracing------------------
LANGCHAIN_API_KEY=...
LANGCHAIN_CALLBACKS_BACKGROUND=true
LANGCHAIN_TRACING_V2=true
# -----------------------------------------------------

NEXT_PUBLIC_OPENAI_API_KEY=...
```

### Running the Application

To run the application in development mode run:

```bash
yarn dev
```

This will start the application on [`http://localhost:3000`](http://localhost:3000).

To run in production mode:

```bash
yarn start

yarn build
```
