# Setup

## Installation

Please make sure you have [Nodejs](https://nodejs.org) installed on your machine, along with [git](https://git-scm.com)
And some sort of document modifying software.

1. To start please open your terminal
2. Install the project by running `git clone https://github.com/kwak-labs/liqudation-bot.git`
3. Now change into its directory `cd liquidation-bot`
4. Install the required dependicies `npm i`
5. Now you will likely want to change `src/config/config.json` <br>
   Please read below for guides on how to modify config.json
6. You can now start the bot by running node src/index.js

## config.json Setup

- seed_phrase:<br>
  Enter your 12-24 seed phrase here

- rpc_endpoint:<br>
  Probably dont need to mess with this yourself, however if you run your own node it may make sense to use your own

- minium_usd_value:<br>
  The minium amount of reward your willing to transact for.
  Example, If you set it to 10 cents. The bot will only liquidate transactions that provide value 10 cents and higher

- interval:<br>
  How often you want the bot to check for valid liquidations, be careful of rate limits

- memo:<br>
  tx memo for your liquidations

- gas:
  Wouldnt really touch this unless you know what your doing
