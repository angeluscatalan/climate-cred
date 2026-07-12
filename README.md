# WELCOME TO CLIMATE CRED README

## Setup
To start using climate cred locally
clone the repository first

after cloning, open the cloned folder and in the main folder of Climate Cred
run the following scripts

`python -m venv .venv`
`.venv/Scripts/Activate`
`pip install -r requirements.txt`

Then wait for installation to finish

Next, ensure that you have a .env or a .env.local file in your main folder
if you do not have a .env or .env.local file, create a new file and name it `.env`

in your .env file
`HF_TOKEN=<RCSCode Read Hugging Face token>`
`C_API_TOKEN=<Your CurrentsAPI Token>`
`GNEWS_API_KEY=<Your GNewsAPI Token>`
`EXA_API_KEY=<Your Exa.ai API Token>`
`F_CRAWL_KEY=<Your Firecrawl API Token>`

if you need to request the HF token, contact us.
The other tokens can be obtained from the API sites.

## Execution
to run the climate cred program, open 2 terminals, needed for both the Next.js and the backend
go to the main directory of your cloned repository folder and run the command on the **first terminal**
`npm run dev`
next, on **the second terminal**, navigate to the backend folder of climate cred using
`cd backend`
then run
`uvicorn main:app --reload`

Your app should now be running at `http://localhost:3000/`
